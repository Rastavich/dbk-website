export function respond(body) {
  if (body.errors) {
    return { status: 401, body };
  }

  // console.log('THIS IS THE Body', body.jwt);

  const user = JSON.stringify(body.user);
  const jwt = JSON.stringify(body.jwt);

  return {
    headers: {
      'set-cookie': [
        `jwt=${jwt}; Path=/; HttpOnly; Secure`,
        `user=${user}; Path=/; HttpOnly; Secure`,
      ],
    },

    body,
  };
}
