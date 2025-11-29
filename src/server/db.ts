import { Pool } from "pg";
import { env } from "~/env";

const createPool = () =>
  new Pool({
    connectionString: env.DATABASE_URL,
  });

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const db = globalForDb.pool ?? createPool();

if (env.NODE_ENV !== "production") globalForDb.pool = db;
