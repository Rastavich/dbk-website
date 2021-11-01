// import fetch from "node-fetch";

async function send({ route, method, data = null, token }) {
  const opts = { method, headers: {} };

  // console.log('Method', method, 'Data', data, 'Token', token);

  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  // console.log(opts);

  return fetch(`${route}`, opts)
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

export function get(route, token) {
  return send({ route, method: 'GET', token }).catch((err) => {
    throw new Error('Something went wrong');
  });
}

export function del(route, data, token) {
  return send({ route, method: 'DELETE', data, token }).catch((err) => {
    throw new Error('Something went wrong');
  });
}

export function post(route, data, token) {
  return send({ route, method: 'POST', data, token }).catch((err) => {
    throw new Error('Something went wrong');
  });
}

export function put(route, data, token) {
  return send({ route, method: 'PUT', data, token }).catch((err) => {
    throw new Error('Something went wrong');
  });
}
