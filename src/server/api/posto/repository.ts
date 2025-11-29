import type { Pool, QueryResult } from "pg";

interface PostoRow {
  id_posto: number;
  nome: string;
  matricula: string;
  senha: string;
  ativo: boolean;
  telefone: string | null;
  endereco: string | null;
}

export async function getPostByMatricula(
  matricula: string,
  db: Pool,
): Promise<QueryResult<PostoRow>> {
  return await db.query<PostoRow>(
    "SELECT id_posto, nome, matricula, senha, ativo, telefone, endereco FROM posto WHERE matricula = $1",
    [matricula],
  );
}

export async function createPosto(
  input: {
    nome: string;
    matricula: string;
    telefone?: string;
    endereco?: string;
    senha: string;
  },
  senhaHash: string,
  ctx: { db: Pool },
): Promise<QueryResult<PostoRow>> {
  return await ctx.db.query(
    `INSERT INTO posto (nome, matricula, telefone, endereco, senha, ativo) 
         VALUES ($1, $2, $3, $4, $5, true) 
         RETURNING id_posto, nome, matricula, telefone, endereco, ativo`,
    [
      input.nome,
      input.matricula,
      input.telefone || null,
      input.endereco || null,
      senhaHash,
    ],
  );
}
