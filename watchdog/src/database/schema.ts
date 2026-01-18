import { drizzle } from 'drizzle-orm/d1';
import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const HUMAN_BOOLEAN = {
  true: 1,
  false: 0,
  zero: 0,
} as const;

export const tHealthiness = sqliteTable('healthiness', {
  id: integer().primaryKey({ autoIncrement: true }),
  status: integer().notNull().default(HUMAN_BOOLEAN.false)
});

export async function getConnection(db: Cloudflare.Env['DB']) {
  const connection = drizzle(db);

  return { connection };
}