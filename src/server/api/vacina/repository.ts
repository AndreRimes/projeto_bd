import type { Pool, QueryResult } from "pg";

interface VacinaRow {
  id_vacina: number;
  nome: string;
  fabricante: string | null;
  doses_necessarias: number;
}

export async function getAllVacinas(db: Pool): Promise<QueryResult<VacinaRow>> {
  return await db.query<VacinaRow>(
    "SELECT id_vacina, nome, fabricante, doses_necessarias FROM vacina ORDER BY nome ASC",
  );
}

export async function getVacinaById(
  id: number,
  db: Pool,
): Promise<QueryResult<VacinaRow>> {
  return await db.query<VacinaRow>(
    "SELECT id_vacina, nome, fabricante, doses_necessarias FROM vacina WHERE id_vacina = $1",
    [id],
  );
}

export async function createVacina(
  input: {
    nome: string;
    fabricante?: string;
    doses_necessarias?: number;
  },
  db: Pool,
): Promise<QueryResult<VacinaRow>> {
  return await db.query<VacinaRow>(
    `INSERT INTO vacina (nome, fabricante, doses_necessarias) 
     VALUES ($1, $2, $3) 
     RETURNING id_vacina, nome, fabricante, doses_necessarias`,
    [input.nome, input.fabricante || null, input.doses_necessarias ?? 1],
  );
}

export async function updateVacina(
  id: number,
  input: {
    nome?: string;
    fabricante?: string;
    doses_necessarias?: number;
  },
  db: Pool,
): Promise<QueryResult<VacinaRow>> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  let paramCount = 1;

  if (input.nome !== undefined) {
    fields.push(`nome = $${paramCount}`);
    values.push(input.nome);
    paramCount++;
  }

  if (input.fabricante !== undefined) {
    fields.push(`fabricante = $${paramCount}`);
    values.push(input.fabricante);
    paramCount++;
  }

  if (input.doses_necessarias !== undefined) {
    fields.push(`doses_necessarias = $${paramCount}`);
    values.push(input.doses_necessarias);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  return await db.query<VacinaRow>(
    `UPDATE vacina 
     SET ${fields.join(", ")} 
     WHERE id_vacina = $${paramCount}
     RETURNING id_vacina, nome, fabricante, doses_necessarias`,
    values,
  );
}

export async function deleteVacina(id: number, db: Pool): Promise<QueryResult> {
  return await db.query("DELETE FROM vacina WHERE id_vacina = $1", [id]);
}
