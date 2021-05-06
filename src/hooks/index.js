import cookie from "cookie";
import { v4 as uuid } from "@lukeed/uuid";

export async function handle({ request, render }) {
  const cookies = await cookie.parse(request.headers.cookie || "");
  let user;
  console.log("Cookies :", cookies);

  if (cookies.user) {
    user = JSON.parse(cookies.user);
  }

  const jwt = cookies.jwt;
  request.locals.user = user || "";
  request.locals.jwt = jwt || "";

  console.log("Req local user :", request.locals.user);
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }

  const response = await render(request);

  // const user = JSON.parse( request.locals.jwt)
  // console.log("Response: ", response);
  return {
    ...response,
    headers: {
      ...response.headers,
    },
  };
}

export function getSession(request) {
  console.log("Request Session: ", request);

  return {
    user: request.locals.user && {
      username: request.locals.user?.username,
      email: request.locals.user?.email,
    },
    jwt: request.locals.jwt,
  };
}
