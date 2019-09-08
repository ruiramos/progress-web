/* globals require  */
/* eslint-env node */

require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const SECRET = process.env.SECRET;
const SLACK_OAUTH_API = 'https://slack.com/api/oauth.access';

import jwt from 'jsonwebtoken';
import fetch from 'isomorphic-fetch';

export default async (req, res) => {
  const code = req.query.code;
  if (!code) {
    res.status(400).json({
      error: 'Code query parameter is required provided for oauth endpoint',
    });
  }

  try {
    let creds = await get_slack_credentials(code);

    if (!creds.ok) {
      throw new Error(creds.error);
    }

    let user_creds = {
      user: creds.user,
      team_id: creds.team.id,
    };

    let token = jwt.sign(user_creds, SECRET);

    res.writeHead(302, {
      Location: `/?token=${token}`,
    });
    res.end();
  } catch (e) {
    res.status(403).json({ ok: false, error: String(e) });
  }
};

async function get_slack_credentials(code) {
  return await fetch(
    `${SLACK_OAUTH_API}?code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}`
  ).then(r => r.json());
}
