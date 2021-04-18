export function respond(body) {
  if (body.errors) {
    return { status: 401, body };
  }

  const json = JSON.stringify(body.user);
  const value = Buffer.from(json).toString("base64");

  console.log("JSON", json);

  return {
    headers: {
      "set-cookie": `jwt=${value}; Path=/; HttpOnly; Secure`,
    },
    body,
  };
}
