// import fetch from "node-fetch";
import { BASE_LOGIN_URI } from '$lib/config';

const base = BASE_LOGIN_URI;

async function send({ method, data = null, token }) {
  const opts = { method, headers: {} };

  console.log('Method', method, 'Data', data, 'Token', token);

  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  if (token) {
    opts.headers['Authorization'] = `Token ${token}`;
  }

  return fetch(`${base}`, opts)
    .then((r) => {
      return r.text();
    })
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return false;
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
}

export function get(token) {
  return send({ method: 'GET', token });
}

export function del(data, token) {
  return send({ method: 'DELETE', data, token });
}

export function post(data, token) {
  return send({ method: 'POST', data, token }).catch((err) => {
    throw new Error('Something went wrong');
  });
}

export function put(data, token) {
  return send({ method: 'PUT', data, token });
}
