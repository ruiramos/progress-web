/* globals require  */
/* eslint-env node */

import { Pool } from 'pg';

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
});

export async function query(sql, args) {
  let { rows } = await pool.query(sql, args);
  return rows;
}
