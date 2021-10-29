import { respond } from './_respond';
import { BASE_LOGIN_URI } from '$lib/config';
import * as api from '$lib/api.js';

const loginRoute = BASE_LOGIN_URI;

export async function post(request) {
  const body = await api.post(loginRoute, {
    identifier: request.body.email,
    password: request.body.password,
  });

  console.log('BODY: ', body);

  return respond(body);
}
