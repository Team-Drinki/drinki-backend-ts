import { Elysia } from "elysia";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "../db/schema";
import * as relations from "../db/relations";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations,
  },
});

export const database = new Elysia({ name: "database" }).decorate("db", db);
