import bcrypt from "bcryptjs";
import { Pool } from "pg";

const db = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:w5LT3fc8Bqgv6aTs@localhost:5432/projeto_bd",
});

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Deletar postos existentes
    await db.query("DELETE FROM Posto");
    console.log("🗑️  Postos existentes deletados");

    // Criar senha hash
    const senhaHash = await bcrypt.hash("admin123", 10);

    // Inserir posto de exemplo
    const result = await db.query(
      `INSERT INTO Posto (nome, matricula, senha, telefone, endereco, email, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_posto, nome, matricula`,
      [
        "Posto Central",
        "POSTO001",
        senhaHash,
        "(11) 98765-4321",
        "Rua das Flores, 123 - Centro",
        "central@posto.com",
        true,
      ],
    );

    if (result.rows.length > 0) {
      console.log("✅ Posto criado com sucesso:");
      console.log("   Nome:", result.rows[0].nome);
      console.log("   Matrícula:", result.rows[0].matricula);
      console.log("   Senha: admin123");
    }

    // Inserir mais postos de exemplo
    await db.query(
      `INSERT INTO Posto (nome, matricula, senha, telefone, endereco, email, ativo)
       VALUES 
         ($1, $2, $3, $4, $5, $6, $7),
         ($8, $9, $10, $11, $12, $13, $14)`,
      [
        "Posto Norte",
        "POSTO002",
        await bcrypt.hash("norte123", 10),
        "(11) 91234-5678",
        "Av. Norte, 456",
        "norte@posto.com",
        true,
        "Posto Sul",
        "POSTO003",
        await bcrypt.hash("sul123", 10),
        "(11) 95678-1234",
        "Av. Sul, 789",
        "sul@posto.com",
        true,
      ],
    );

    console.log("✅ Seed concluído!");
    console.log("\n📝 Postos disponíveis para login:");
    console.log("   1. Matrícula: POSTO001 | Senha: admin123");
    console.log("   2. Matrícula: POSTO002 | Senha: norte123");
    console.log("   3. Matrícula: POSTO003 | Senha: sul123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seed();
