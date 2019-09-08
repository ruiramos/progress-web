/* eslint-env browser */
import fetch from 'isomorphic-fetch';

const apiUrl = 'http://localhost:3000/api';

export async function getStandups(dateFrom, dateTo) {
  return makeGetRequest(
    `/standups?dateFrom=${dateFrom.format('YYYY-MM-DD')}&dateTo=${dateTo.format(
      'YYYY-MM-DD'
    )}`
  );
}

async function makeGetRequest(endpoint) {
  const token = getToken();
  let req = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await req.json();
}
function getToken() {
  return window.localStorage.getItem('token');
}
