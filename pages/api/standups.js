/* eslint-env node */

import jwtAuth from 'micro-jwt-auth';
import { query } from '../../db.js';
import moment from 'moment';

require('dotenv').config();

const SECRET = process.env.SECRET;

export default jwtAuth(SECRET)(async (req, res) => {
  const teamId = req.jwt.team_id;
  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;
  const standups = await getStandupsForTeam(teamId, dateFrom, dateTo);
  res.status(200).json({ standups, user: req.jwt.user });
});

async function getStandupsForTeam(id, dateFrom, dateTo) {
  return await query(
    `SELECT s.*, u.real_name, u.avatar_url FROM standups s
      LEFT JOIN users u on u.username = s.username
      WHERE u.team_id = $1
      AND s.date >= $2
      AND s.date < $3
    `,
    [id, dateFrom, dateTo]
  );
}
