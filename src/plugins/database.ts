import { Elysia } from 'elysia'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'

import * as schema from '../db/schema'
import * as relations from '../db/relations'

const sqlite = new Database('sqlite.db')

export const db = drizzle(sqlite, { 
  schema: { 
    ...schema, 
    ...relations 
  } 
})

export const database = new Elysia({ name: 'database' })
  .decorate('db', db)