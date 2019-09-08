import { Pool } from 'pg';

const pool = new Pool();

export async function query(sql, args) {
  let { rows } = await pool.query(sql, args);
  return rows;
}
