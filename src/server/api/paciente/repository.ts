import type { Pool, QueryResult } from "pg";

interface PacienteRow {
  id_paciente: number;
  cpf: string;
  nome: string;
  telefone: string | null;
  endereco: string | null;
  data_nasc: Date | null;
  foto: string | null;
}

export async function getAllPacientes(
  db: Pool,
): Promise<QueryResult<PacienteRow>> {
  return await db.query<PacienteRow>(
    "SELECT id_paciente, cpf, nome, telefone, endereco, data_nasc, foto FROM paciente ORDER BY nome ASC",
  );
}

export async function getPacienteById(
  id: number,
  db: Pool,
): Promise<QueryResult<PacienteRow>> {
  return await db.query<PacienteRow>(
    "SELECT id_paciente, cpf, nome, telefone, endereco, data_nasc, foto FROM paciente WHERE id_paciente = $1",
    [id],
  );
}

export async function getPacienteByCpf(
  cpf: string,
  db: Pool,
): Promise<QueryResult<PacienteRow>> {
  return await db.query<PacienteRow>(
    "SELECT id_paciente, cpf, nome, telefone, endereco, data_nasc, foto FROM paciente WHERE cpf = $1",
    [cpf],
  );
}

export async function createPaciente(
  input: {
    cpf: string;
    nome: string;
    telefone?: string;
    endereco?: string;
    data_nasc?: Date;
    foto?: string;
  },
  db: Pool,
): Promise<QueryResult<PacienteRow>> {
  return await db.query<PacienteRow>(
    `INSERT INTO paciente (cpf, nome, telefone, endereco, data_nasc, foto) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id_paciente, cpf, nome, telefone, endereco, data_nasc, foto`,
    [
      input.cpf,
      input.nome,
      input.telefone || null,
      input.endereco || null,
      input.data_nasc || null,
      input.foto || null,
    ],
  );
}

export async function updatePaciente(
  id: number,
  input: {
    cpf?: string;
    nome?: string;
    telefone?: string;
    endereco?: string;
    data_nasc?: Date;
    foto?: string;
  },
  db: Pool,
): Promise<QueryResult<PacienteRow>> {
  const fields: string[] = [];
  const values: (string | Date)[] = [];
  let paramCount = 1;

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

  if (input.telefone !== undefined) {
    fields.push(`telefone = $${paramCount}`);
    values.push(input.telefone);
    paramCount++;
  }

  if (input.endereco !== undefined) {
    fields.push(`endereco = $${paramCount}`);
    values.push(input.endereco);
    paramCount++;
  }

  if (input.data_nasc !== undefined) {
    fields.push(`data_nasc = $${paramCount}`);
    values.push(input.data_nasc);
    paramCount++;
  }

  if (input.foto !== undefined) {
    fields.push(`foto = $${paramCount}`);
    values.push(input.foto);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id.toString());

  return await db.query<PacienteRow>(
    `UPDATE paciente 
     SET ${fields.join(", ")} 
     WHERE id_paciente = $${paramCount}
     RETURNING id_paciente, cpf, nome, telefone, endereco, data_nasc, foto`,
    values,
  );
}

export async function deletePaciente(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM paciente WHERE id_paciente = $1", [id]);
}
