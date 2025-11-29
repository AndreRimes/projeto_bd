import type { Pool, QueryResult } from "pg";

interface AgendamentoRow {
  id_agendamento: number;
  id_paciente: number;
  id_consulta: number;
  motivo: string | null;
  status: string;
  data: Date;
}

export async function getAllAgendamentos(
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  return await db.query<AgendamentoRow>(
    "SELECT id_agendamento, id_paciente, id_consulta, motivo, status, data FROM agendamento ORDER BY data DESC",
  );
}

export async function getAgendamentoById(
  id: number,
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  return await db.query<AgendamentoRow>(
    "SELECT id_agendamento, id_paciente, id_consulta, motivo, status, data FROM agendamento WHERE id_agendamento = $1",
    [id],
  );
}

export async function getAgendamentosByPaciente(
  idPaciente: number,
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  return await db.query<AgendamentoRow>(
    "SELECT id_agendamento, id_paciente, id_consulta, motivo, status, data FROM agendamento WHERE id_paciente = $1 ORDER BY data DESC",
    [idPaciente],
  );
}

export async function getAgendamentosByConsulta(
  idConsulta: number,
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  return await db.query<AgendamentoRow>(
    "SELECT id_agendamento, id_paciente, id_consulta, motivo, status, data FROM agendamento WHERE id_consulta = $1 ORDER BY data DESC",
    [idConsulta],
  );
}

export async function getAgendamentosByStatus(
  status: string,
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  return await db.query<AgendamentoRow>(
    "SELECT id_agendamento, id_paciente, id_consulta, motivo, status, data FROM agendamento WHERE status = $1 ORDER BY data DESC",
    [status],
  );
}

export async function createAgendamento(
  input: {
    id_paciente: number;
    id_consulta: number;
    motivo?: string;
    status?: string;
    data: Date;
  },
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  return await db.query<AgendamentoRow>(
    `INSERT INTO agendamento (id_paciente, id_consulta, motivo, status, data) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id_agendamento, id_paciente, id_consulta, motivo, status, data`,
    [
      input.id_paciente,
      input.id_consulta,
      input.motivo || null,
      input.status || "pendente",
      input.data,
    ],
  );
}

export async function updateAgendamento(
  id: number,
  input: {
    id_paciente?: number;
    id_consulta?: number;
    motivo?: string;
    status?: string;
    data?: Date;
  },
  db: Pool,
): Promise<QueryResult<AgendamentoRow>> {
  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let paramCount = 1;

  if (input.id_paciente !== undefined) {
    fields.push(`id_paciente = $${paramCount}`);
    values.push(input.id_paciente);
    paramCount++;
  }

  if (input.id_consulta !== undefined) {
    fields.push(`id_consulta = $${paramCount}`);
    values.push(input.id_consulta);
    paramCount++;
  }

  if (input.motivo !== undefined) {
    fields.push(`motivo = $${paramCount}`);
    values.push(input.motivo);
    paramCount++;
  }

  if (input.status !== undefined) {
    fields.push(`status = $${paramCount}`);
    values.push(input.status);
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

  return await db.query<AgendamentoRow>(
    `UPDATE agendamento 
     SET ${fields.join(", ")} 
     WHERE id_agendamento = $${paramCount}
     RETURNING id_agendamento, id_paciente, id_consulta, motivo, status, data`,
    values,
  );
}

export async function deleteAgendamento(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM agendamento WHERE id_agendamento = $1", [
    id,
  ]);
}
