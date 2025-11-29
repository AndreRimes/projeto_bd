import type { Pool, QueryResult } from "pg";

interface ConsultaRow {
  id_consulta: number;
  id_profissional: number;
  observacoes: string | null;
  diagnostico: string | null;
  sintomas: string | null;
  data: Date;
}

export async function getAllConsultas(
  db: Pool,
): Promise<QueryResult<ConsultaRow>> {
  return await db.query<ConsultaRow>(
    "SELECT id_consulta, id_profissional, observacoes, diagnostico, sintomas, data FROM consulta ORDER BY data DESC",
  );
}

export async function getConsultaById(
  id: number,
  db: Pool,
): Promise<QueryResult<ConsultaRow>> {
  return await db.query<ConsultaRow>(
    "SELECT id_consulta, id_profissional, observacoes, diagnostico, sintomas, data FROM consulta WHERE id_consulta = $1",
    [id],
  );
}

export async function getConsultasByProfissional(
  idProfissional: number,
  db: Pool,
): Promise<QueryResult<ConsultaRow>> {
  return await db.query<ConsultaRow>(
    "SELECT id_consulta, id_profissional, observacoes, diagnostico, sintomas, data FROM consulta WHERE id_profissional = $1 ORDER BY data DESC",
    [idProfissional],
  );
}

export async function createConsulta(
  input: {
    id_profissional: number;
    observacoes?: string;
    diagnostico?: string;
    sintomas?: string;
    data: Date;
  },
  db: Pool,
): Promise<QueryResult<ConsultaRow>> {
  return await db.query<ConsultaRow>(
    `INSERT INTO consulta (id_profissional, observacoes, diagnostico, sintomas, data) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id_consulta, id_profissional, observacoes, diagnostico, sintomas, data`,
    [
      input.id_profissional,
      input.observacoes || null,
      input.diagnostico || null,
      input.sintomas || null,
      input.data,
    ],
  );
}

export async function updateConsulta(
  id: number,
  input: {
    id_profissional?: number;
    observacoes?: string;
    diagnostico?: string;
    sintomas?: string;
    data?: Date;
  },
  db: Pool,
): Promise<QueryResult<ConsultaRow>> {
  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let paramCount = 1;

  if (input.id_profissional !== undefined) {
    fields.push(`id_profissional = $${paramCount}`);
    values.push(input.id_profissional);
    paramCount++;
  }

  if (input.observacoes !== undefined) {
    fields.push(`observacoes = $${paramCount}`);
    values.push(input.observacoes);
    paramCount++;
  }

  if (input.diagnostico !== undefined) {
    fields.push(`diagnostico = $${paramCount}`);
    values.push(input.diagnostico);
    paramCount++;
  }

  if (input.sintomas !== undefined) {
    fields.push(`sintomas = $${paramCount}`);
    values.push(input.sintomas);
    paramCount++;
  }

  if (input.data !== undefined) {
    fields.push(`data = $${paramCount}`);
    values.push(input.data);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  return await db.query<ConsultaRow>(
    `UPDATE consulta 
     SET ${fields.join(", ")} 
     WHERE id_consulta = $${paramCount}
     RETURNING id_consulta, id_profissional, observacoes, diagnostico, sintomas, data`,
    values,
  );
}

export async function deleteConsulta(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM consulta WHERE id_consulta = $1", [id]);
}
