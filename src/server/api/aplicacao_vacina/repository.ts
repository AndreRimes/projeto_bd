import type { Pool, QueryResult } from "pg";

interface AplicacaoVacinaRow {
  id_aplicacao: number;
  id_paciente: number;
  id_vacina: number;
  id_posto: number;
  id_profissional: number;
  data: Date;
  numero_dose: number;
}

export async function getAllAplicacoesVacina(
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  return await db.query<AplicacaoVacinaRow>(
    "SELECT id_aplicacao, id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose FROM aplicacaovacina ORDER BY data DESC",
  );
}

export async function getAplicacaoVacinaById(
  id: number,
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  return await db.query<AplicacaoVacinaRow>(
    "SELECT id_aplicacao, id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose FROM aplicacaovacina WHERE id_aplicacao = $1",
    [id],
  );
}

export async function getAplicacoesVacinaByPaciente(
  idPaciente: number,
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  return await db.query<AplicacaoVacinaRow>(
    "SELECT id_aplicacao, id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose FROM aplicacaovacina WHERE id_paciente = $1 ORDER BY data DESC",
    [idPaciente],
  );
}

export async function getAplicacoesVacinaByPosto(
  idPosto: number,
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  return await db.query<AplicacaoVacinaRow>(
    "SELECT id_aplicacao, id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose FROM aplicacaovacina WHERE id_posto = $1 ORDER BY data DESC",
    [idPosto],
  );
}

export async function getAplicacoesVacinaByProfissional(
  idProfissional: number,
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  return await db.query<AplicacaoVacinaRow>(
    "SELECT id_aplicacao, id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose FROM aplicacaovacina WHERE id_profissional = $1 ORDER BY data DESC",
    [idProfissional],
  );
}

export async function createAplicacaoVacina(
  input: {
    id_paciente: number;
    id_vacina: number;
    id_posto: number;
    id_profissional: number;
    data: Date;
    numero_dose: number;
  },
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  // Usando stored procedure que registra a aplicação e atualiza o estoque automaticamente
  const result = await db.query(
    `SELECT * FROM sp_registrar_aplicacao_vacina($1, $2, $3, $4, $5, $6)`,
    [
      input.id_paciente,
      input.id_vacina,
      input.id_posto,
      input.id_profissional,
      input.data,
      input.numero_dose,
    ],
  );

  if (result.rows.length > 0 && !result.rows[0]?.sucesso) {
    throw new Error(result.rows[0]?.mensagem || "Erro ao registrar aplicação");
  }

  if (result.rows.length > 0 && result.rows[0]?.id_aplicacao) {
    return await getAplicacaoVacinaById(result.rows[0].id_aplicacao, db);
  }

  throw new Error("Erro ao registrar aplicação de vacina");
}

export async function updateAplicacaoVacina(
  id: number,
  input: {
    id_paciente?: number;
    id_vacina?: number;
    id_posto?: number;
    id_profissional?: number;
    data?: Date;
    numero_dose?: number;
  },
  db: Pool,
): Promise<QueryResult<AplicacaoVacinaRow>> {
  const fields: string[] = [];
  const values: (number | Date)[] = [];
  let paramCount = 1;

  if (input.id_paciente !== undefined) {
    fields.push(`id_paciente = $${paramCount}`);
    values.push(input.id_paciente);
    paramCount++;
  }

  if (input.id_vacina !== undefined) {
    fields.push(`id_vacina = $${paramCount}`);
    values.push(input.id_vacina);
    paramCount++;
  }

  if (input.id_posto !== undefined) {
    fields.push(`id_posto = $${paramCount}`);
    values.push(input.id_posto);
    paramCount++;
  }

  if (input.id_profissional !== undefined) {
    fields.push(`id_profissional = $${paramCount}`);
    values.push(input.id_profissional);
    paramCount++;
  }

  if (input.data !== undefined) {
    fields.push(`data = $${paramCount}`);
    values.push(input.data);
    paramCount++;
  }

  if (input.numero_dose !== undefined) {
    fields.push(`numero_dose = $${paramCount}`);
    values.push(input.numero_dose);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  return await db.query<AplicacaoVacinaRow>(
    `UPDATE aplicacaovacina 
     SET ${fields.join(", ")} 
     WHERE id_aplicacao = $${paramCount}
     RETURNING id_aplicacao, id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose`,
    values,
  );
}

export async function deleteAplicacaoVacina(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM aplicacaovacina WHERE id_aplicacao = $1", [
    id,
  ]);
}
