/* eslint-env browser */
import fetch from 'isomorphic-fetch';

const apiUrl = typeof window != 'undefined' && window.location.origin + '/api'; //'https://pacific-beyond-39873.herokuapp.com/api';

export async function getStandups(dateFrom, dateTo) {
  return makeGetRequest(
    `/standups?dateFrom=${dateFrom.format('YYYY-MM-DD')}&dateTo=${dateTo.format(
      'YYYY-MM-DD'
    )}`
  );
}

export async function getUsers() {
  return makeGetRequest(`/users`);
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
