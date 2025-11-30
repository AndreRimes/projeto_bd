import type { Pool, QueryResult } from "pg";

// Prescrição
interface PrescricaoRow {
  id_prescricao: number;
  id_consulta: number;
  data: Date;
  conteudo: string | null;
}

export async function getAllPrescricoes(
  db: Pool,
): Promise<QueryResult<PrescricaoRow>> {
  return await db.query<PrescricaoRow>(
    "SELECT id_prescricao, id_consulta, data, conteudo FROM prescricao ORDER BY data DESC",
  );
}

export async function getPrescricaoById(
  id: number,
  db: Pool,
): Promise<QueryResult<PrescricaoRow>> {
  return await db.query<PrescricaoRow>(
    "SELECT id_prescricao, id_consulta, data, conteudo FROM prescricao WHERE id_prescricao = $1",
    [id],
  );
}

export async function getPrescricoesByConsulta(
  idConsulta: number,
  db: Pool,
): Promise<QueryResult<PrescricaoRow>> {
  return await db.query<PrescricaoRow>(
    "SELECT id_prescricao, id_consulta, data, conteudo FROM prescricao WHERE id_consulta = $1 ORDER BY data DESC",
    [idConsulta],
  );
}

export async function createPrescricao(
  input: {
    id_consulta: number;
    data: Date;
    conteudo?: string;
  },
  db: Pool,
): Promise<QueryResult<PrescricaoRow>> {
  return await db.query<PrescricaoRow>(
    `INSERT INTO prescricao (id_consulta, data, conteudo) 
     VALUES ($1, $2, $3) 
     RETURNING id_prescricao, id_consulta, data, conteudo`,
    [input.id_consulta, input.data, input.conteudo || null],
  );
}

export async function updatePrescricao(
  id: number,
  input: {
    id_consulta?: number;
    data?: Date;
    conteudo?: string;
  },
  db: Pool,
): Promise<QueryResult<PrescricaoRow>> {
  const fields: string[] = [];
  const values: (number | Date | string)[] = [];
  let paramCount = 1;

  if (input.id_consulta !== undefined) {
    fields.push(`id_consulta = $${paramCount}`);
    values.push(input.id_consulta);
    paramCount++;
  }

  if (input.data !== undefined) {
    fields.push(`data = $${paramCount}`);
    values.push(input.data);
    paramCount++;
  }

  if (input.conteudo !== undefined) {
    fields.push(`conteudo = $${paramCount}`);
    values.push(input.conteudo);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  return await db.query<PrescricaoRow>(
    `UPDATE prescricao 
     SET ${fields.join(", ")} 
     WHERE id_prescricao = $${paramCount}
     RETURNING id_prescricao, id_consulta, data, conteudo`,
    values,
  );
}

export async function deletePrescricao(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM prescricao WHERE id_prescricao = $1", [
    id,
  ]);
}

// Prescreve (Relação Prescrição-Medicamento)
interface PrescreveMedicamentoRow {
  id_medicamento: number;
  nome_medicamento: string;
}

export async function getMedicamentosByPrescricao(
  idPrescricao: number,
  db: Pool,
): Promise<QueryResult<PrescreveMedicamentoRow>> {
  return await db.query<PrescreveMedicamentoRow>(
    `SELECT m.id_medicamento, m.nome as nome_medicamento
     FROM prescreve p
     JOIN medicamento m ON p.id_medicamento = m.id_medicamento
     WHERE p.id_prescricao = $1
     ORDER BY m.nome`,
    [idPrescricao],
  );
}

export async function addMedicamentoToPrescricao(
  idPrescricao: number,
  idMedicamento: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query(
    "INSERT INTO prescreve (id_prescricao, id_medicamento) VALUES ($1, $2)",
    [idPrescricao, idMedicamento],
  );
}

export async function removeMedicamentoFromPrescricao(
  idPrescricao: number,
  idMedicamento: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query(
    "DELETE FROM prescreve WHERE id_prescricao = $1 AND id_medicamento = $2",
    [idPrescricao, idMedicamento],
  );
}

export async function setMedicamentosPrescricao(
  idPrescricao: number,
  medicamentosIds: number[],
  db: Pool,
): Promise<void> {
  // Remove todos os medicamentos atuais
  await db.query("DELETE FROM prescreve WHERE id_prescricao = $1", [
    idPrescricao,
  ]);

  // Adiciona os novos medicamentos
  if (medicamentosIds.length > 0) {
    const values = medicamentosIds.map((_, i) => `($1, $${i + 2})`).join(", ");
    await db.query(
      `INSERT INTO prescreve (id_prescricao, id_medicamento) VALUES ${values}`,
      [idPrescricao, ...medicamentosIds],
    );
  }
}
