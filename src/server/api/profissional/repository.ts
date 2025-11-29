import type { Pool, QueryResult } from "pg";

interface ProfissionalRow {
  id_profissional: number;
  id_posto: number;
  cpf: string;
  nome: string;
  especialidade: string | null;
  tipo: string | null;
}

export async function getAllProfissionais(
  db: Pool,
): Promise<QueryResult<ProfissionalRow>> {
  return await db.query<ProfissionalRow>(
    "SELECT id_profissional, id_posto, cpf, nome, especialidade, tipo FROM profissional ORDER BY nome",
  );
}

export async function getProfissionalById(
  id: number,
  db: Pool,
): Promise<QueryResult<ProfissionalRow>> {
  return await db.query<ProfissionalRow>(
    "SELECT id_profissional, id_posto, cpf, nome, especialidade, tipo FROM profissional WHERE id_profissional = $1",
    [id],
  );
}

export async function getProfissionaisByPosto(
  idPosto: number,
  db: Pool,
): Promise<QueryResult<ProfissionalRow>> {
  return await db.query<ProfissionalRow>(
    "SELECT id_profissional, id_posto, cpf, nome, especialidade, tipo FROM profissional WHERE id_posto = $1 ORDER BY nome",
    [idPosto],
  );
}

export async function getProfissionalByCpf(
  cpf: string,
  db: Pool,
): Promise<QueryResult<ProfissionalRow>> {
  return await db.query<ProfissionalRow>(
    "SELECT id_profissional, id_posto, cpf, nome, especialidade, tipo FROM profissional WHERE cpf = $1",
    [cpf],
  );
}

export async function createProfissional(
  input: {
    id_posto: number;
    cpf: string;
    nome: string;
    especialidade?: string;
    tipo?: string;
  },
  db: Pool,
): Promise<QueryResult<ProfissionalRow>> {
  return await db.query<ProfissionalRow>(
    `INSERT INTO profissional (id_posto, cpf, nome, especialidade, tipo) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id_profissional, id_posto, cpf, nome, especialidade, tipo`,
    [
      input.id_posto,
      input.cpf,
      input.nome,
      input.especialidade || null,
      input.tipo || null,
    ],
  );
}

export async function updateProfissional(
  id: number,
  input: {
    id_posto?: number;
    cpf?: string;
    nome?: string;
    especialidade?: string;
    tipo?: string;
  },
  db: Pool,
): Promise<QueryResult<ProfissionalRow>> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  let paramCount = 1;

  if (input.id_posto !== undefined) {
    fields.push(`id_posto = $${paramCount}`);
    values.push(input.id_posto);
    paramCount++;
  }

  if (input.cpf !== undefined) {
    fields.push(`cpf = $${paramCount}`);
    values.push(input.cpf);
    paramCount++;
  }

  if (input.nome !== undefined) {
    fields.push(`nome = $${paramCount}`);
    values.push(input.nome);
    paramCount++;
  }

  if (input.especialidade !== undefined) {
    fields.push(`especialidade = $${paramCount}`);
    values.push(input.especialidade);
    paramCount++;
  }

  if (input.tipo !== undefined) {
    fields.push(`tipo = $${paramCount}`);
    values.push(input.tipo);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  return await db.query<ProfissionalRow>(
    `UPDATE profissional 
     SET ${fields.join(", ")} 
     WHERE id_profissional = $${paramCount}
     RETURNING id_profissional, id_posto, cpf, nome, especialidade, tipo`,
    values,
  );
}

export async function deleteProfissional(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM profissional WHERE id_profissional = $1", [
    id,
  ]);
}
