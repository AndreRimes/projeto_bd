import type { Pool, QueryResult } from "pg";

// Medicamento
interface MedicamentoRow {
  id_medicamento: number;
  nome: string;
}

export async function getAllMedicamentos(
  db: Pool,
): Promise<QueryResult<MedicamentoRow>> {
  return await db.query<MedicamentoRow>(
    "SELECT id_medicamento, nome FROM medicamento ORDER BY nome ASC",
  );
}

export async function getMedicamentoById(
  id: number,
  db: Pool,
): Promise<QueryResult<MedicamentoRow>> {
  return await db.query<MedicamentoRow>(
    "SELECT id_medicamento, nome FROM medicamento WHERE id_medicamento = $1",
    [id],
  );
}

export async function createMedicamento(
  input: {
    nome: string;
  },
  db: Pool,
): Promise<QueryResult<MedicamentoRow>> {
  return await db.query<MedicamentoRow>(
    `INSERT INTO medicamento (nome) 
     VALUES ($1) 
     RETURNING id_medicamento, nome`,
    [input.nome],
  );
}

export async function updateMedicamento(
  id: number,
  input: {
    nome?: string;
  },
  db: Pool,
): Promise<QueryResult<MedicamentoRow>> {
  const fields: string[] = [];
  const values: string[] = [];
  let paramCount = 1;

  if (input.nome !== undefined) {
    fields.push(`nome = $${paramCount}`);
    values.push(input.nome);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id.toString());

  return await db.query<MedicamentoRow>(
    `UPDATE medicamento 
     SET ${fields.join(", ")} 
     WHERE id_medicamento = $${paramCount}
     RETURNING id_medicamento, nome`,
    values,
  );
}

export async function deleteMedicamento(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query("DELETE FROM medicamento WHERE id_medicamento = $1", [
    id,
  ]);
}

// Estoque Medicamentos
interface EstoqueMedicamentosRow {
  id_estoque: number;
  id_posto: number;
  id_medicamento: number;
  quantidade_atual: number;
  quantidade_minima: number;
  data_validade: Date | null;
}

export async function getAllEstoquesMedicamentos(
  db: Pool,
): Promise<QueryResult<EstoqueMedicamentosRow>> {
  return await db.query<EstoqueMedicamentosRow>(
    "SELECT id_estoque, id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade FROM estoque_medicamentos ORDER BY data_validade ASC",
  );
}

export async function getEstoqueMedicamentosById(
  id: number,
  db: Pool,
): Promise<QueryResult<EstoqueMedicamentosRow>> {
  return await db.query<EstoqueMedicamentosRow>(
    "SELECT id_estoque, id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade FROM estoque_medicamentos WHERE id_estoque = $1",
    [id],
  );
}

export async function getEstoquesMedicamentosByPosto(
  idPosto: number,
  db: Pool,
): Promise<QueryResult<EstoqueMedicamentosRow>> {
  return await db.query<EstoqueMedicamentosRow>(
    "SELECT id_estoque, id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade FROM estoque_medicamentos WHERE id_posto = $1 ORDER BY data_validade ASC",
    [idPosto],
  );
}

export async function createEstoqueMedicamentos(
  input: {
    id_posto: number;
    id_medicamento: number;
    quantidade_atual?: number;
    quantidade_minima?: number;
    data_validade?: Date;
  },
  db: Pool,
): Promise<QueryResult<EstoqueMedicamentosRow>> {
  return await db.query<EstoqueMedicamentosRow>(
    `INSERT INTO estoque_medicamentos (id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id_estoque, id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade`,
    [
      input.id_posto,
      input.id_medicamento,
      input.quantidade_atual ?? 0,
      input.quantidade_minima ?? 0,
      input.data_validade || null,
    ],
  );
}

export async function updateEstoqueMedicamentos(
  id: number,
  input: {
    id_posto?: number;
    id_medicamento?: number;
    quantidade_atual?: number;
    quantidade_minima?: number;
    data_validade?: Date;
  },
  db: Pool,
): Promise<QueryResult<EstoqueMedicamentosRow>> {
  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let paramCount = 1;

  if (input.id_posto !== undefined) {
    fields.push(`id_posto = $${paramCount}`);
    values.push(input.id_posto);
    paramCount++;
  }

  if (input.id_medicamento !== undefined) {
    fields.push(`id_medicamento = $${paramCount}`);
    values.push(input.id_medicamento);
    paramCount++;
  }

  if (input.quantidade_atual !== undefined) {
    fields.push(`quantidade_atual = $${paramCount}`);
    values.push(input.quantidade_atual);
    paramCount++;
  }

  if (input.quantidade_minima !== undefined) {
    fields.push(`quantidade_minima = $${paramCount}`);
    values.push(input.quantidade_minima);
    paramCount++;
  }

  if (input.data_validade !== undefined) {
    fields.push(`data_validade = $${paramCount}`);
    values.push(input.data_validade);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  return await db.query<EstoqueMedicamentosRow>(
    `UPDATE estoque_medicamentos 
     SET ${fields.join(", ")} 
     WHERE id_estoque = $${paramCount}
     RETURNING id_estoque, id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade`,
    values,
  );
}

export async function deleteEstoqueMedicamentos(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query(
    "DELETE FROM estoque_medicamentos WHERE id_estoque = $1",
    [id],
  );
}
