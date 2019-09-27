/* eslint-env node */

import jwtAuth from 'micro-jwt-auth';
import { query } from '../../db.js';

require('dotenv').config();

const SECRET = process.env.SECRET;

export default jwtAuth(SECRET)(async (req, res) => {
  const teamId = req.jwt.team_id;
  const users = await getUsers(teamId);
  res.status(200).json({ users, user: req.jwt.user });
});

async function getUsers(teamId) {
  return await query(
    `SELECT * FROM users 
      WHERE team_id = $1
    `,
    [teamId]
  );
}
