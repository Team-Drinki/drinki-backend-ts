import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import * as schema from './schema'
import * as relations from './relations'

const sqlite = new Database('sqlite.db')

export const db = drizzle(sqlite, { 
  schema: { 
    ...schema, 
    ...relations 
  } 
})