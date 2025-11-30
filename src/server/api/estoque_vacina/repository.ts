import type { Pool, QueryResult } from "pg";

interface EstoqueVacinaRow {
  id_estoque_vacina: number;
  id_posto: number;
  id_vacina: number;
  quantidade_minima: number;
  quantidade_disponivel: number;
  data_validade: Date | null;
}

export async function getAllEstoquesVacina(
  db: Pool,
): Promise<QueryResult<EstoqueVacinaRow>> {
  return await db.query<EstoqueVacinaRow>(
    "SELECT id_estoque_vacina, id_posto, id_vacina, quantidade_minima, quantidade_disponivel, data_validade FROM estoque_vacina ORDER BY data_validade ASC",
  );
}

export async function getEstoqueVacinaById(
  id: number,
  db: Pool,
): Promise<QueryResult<EstoqueVacinaRow>> {
  return await db.query<EstoqueVacinaRow>(
    "SELECT id_estoque_vacina, id_posto, id_vacina, quantidade_minima, quantidade_disponivel, data_validade FROM estoque_vacina WHERE id_estoque_vacina = $1",
    [id],
  );
}

export async function getEstoquesVacinaByPosto(
  idPosto: number,
  db: Pool,
): Promise<QueryResult<EstoqueVacinaRow>> {
  return await db.query<EstoqueVacinaRow>(
    "SELECT id_estoque_vacina, id_posto, id_vacina, quantidade_minima, quantidade_disponivel, data_validade FROM estoque_vacina WHERE id_posto = $1 ORDER BY data_validade ASC",
    [idPosto],
  );
}

export async function createEstoqueVacina(
  input: {
    id_posto: number;
    id_vacina: number;
    quantidade_minima?: number;
    quantidade_disponivel?: number;
    data_validade?: Date;
  },
  db: Pool,
): Promise<QueryResult<EstoqueVacinaRow>> {
  return await db.query<EstoqueVacinaRow>(
    `INSERT INTO estoque_vacina (id_posto, id_vacina, quantidade_minima, quantidade_disponivel, data_validade) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id_estoque_vacina, id_posto, id_vacina, quantidade_minima, quantidade_disponivel, data_validade`,
    [
      input.id_posto,
      input.id_vacina,
      input.quantidade_minima ?? 0,
      input.quantidade_disponivel ?? 0,
      input.data_validade || null,
    ],
  );
}

export async function updateEstoqueVacina(
  id: number,
  input: {
    id_posto?: number;
    id_vacina?: number;
    quantidade_minima?: number;
    quantidade_disponivel?: number;
    data_validade?: Date;
  },
  db: Pool,
): Promise<QueryResult<EstoqueVacinaRow>> {
  const fields: string[] = [];
  const values: (string | number | Date)[] = [];
  let paramCount = 1;

  if (input.id_posto !== undefined) {
    fields.push(`id_posto = $${paramCount}`);
    values.push(input.id_posto);
    paramCount++;
  }

  if (input.id_vacina !== undefined) {
    fields.push(`id_vacina = $${paramCount}`);
    values.push(input.id_vacina);
    paramCount++;
  }

  if (input.quantidade_minima !== undefined) {
    fields.push(`quantidade_minima = $${paramCount}`);
    values.push(input.quantidade_minima);
    paramCount++;
  }

  if (input.quantidade_disponivel !== undefined) {
    fields.push(`quantidade_disponivel = $${paramCount}`);
    values.push(input.quantidade_disponivel);
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

  return await db.query<EstoqueVacinaRow>(
    `UPDATE estoque_vacina 
     SET ${fields.join(", ")} 
     WHERE id_estoque_vacina = $${paramCount}
     RETURNING id_estoque_vacina, id_posto, id_vacina, quantidade_minima, quantidade_disponivel, data_validade`,
    values,
  );
}

export async function deleteEstoqueVacina(
  id: number,
  db: Pool,
): Promise<QueryResult> {
  return await db.query(
    "DELETE FROM estoque_vacina WHERE id_estoque_vacina = $1",
    [id],
  );
}
