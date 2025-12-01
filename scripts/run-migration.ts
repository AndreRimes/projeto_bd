import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

async function runMigration() {
  const db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🚀 Executando migrações do banco de dados...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsDir = join(process.cwd(), "migrations");
    const files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("⚠️  Nenhuma migração encontrada.");
      await db.end();
      process.exit(0);
    }

    const { rows: executedMigrations } = await db.query(
      "SELECT filename FROM _migrations",
    );
    const executedFiles = new Set(
      executedMigrations.map((row) => row.filename),
    );

    let executedCount = 0;
    for (const file of files) {
      if (executedFiles.has(file)) {
        console.log(`⏭️  Pulando: ${file} (já executado)`);
        continue;
      }

      console.log(`📄 Executando: ${file}`);
      const sqlPath = join(migrationsDir, file);
      const sql = readFileSync(sqlPath, "utf-8");

      await db.query("BEGIN");
      try {
        await db.query(sql);
        await db.query("INSERT INTO _migrations (filename) VALUES ($1)", [
          file,
        ]);
        await db.query("COMMIT");
        console.log(`✅ ${file} executado com sucesso!`);
        executedCount++;
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }

    if (executedCount === 0) {
      console.log("✅ Todas as migrações já foram executadas!");
    } else {
      console.log(
        `✅ ${executedCount} migração(ões) executada(s) com sucesso!`,
      );
    }

    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar migração:", error);
    await db.end();
    process.exit(1);
  }
}

runMigration();
