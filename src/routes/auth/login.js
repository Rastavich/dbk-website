import { respond } from "./_respond";
import * as api from "$lib/api.js";

export async function post(request) {
  const body = await api.post({
    identifier: request.body.email,
    password: request.body.password,
  });

  console.log(body);

  return respond(body);
}
