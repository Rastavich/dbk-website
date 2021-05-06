export function respond(body) {
  if (body.errors) {
    return { status: 401, body };
  }

  // console.log("Body.User", body.user);

  const user = JSON.stringify(body.user);
  const jwt = body.jwt;

  return {
    headers: {
      "set-cookie": [
        `jwt=${jwt}; Path=/; HttpOnly; Secure`,
        `user=${user}; Path=/; HttpOnly; Secure`,
      ],
    },

    body,
  };
}
