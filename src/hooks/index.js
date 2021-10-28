import cookie from 'cookie';

export async function handle({ request, resolve }) {
  const cookies = await cookie.parse(request.headers.cookie || '');
  const jwt = await cookies.jwt;

  let user;
  console.log('Cookies :', cookies);

  if (cookies.user) {
    user = JSON.parse(cookies.user);
  }

  request.locals.user = user || '';
  request.locals.jwt = jwt || '';

  // console.log("Req local user :", request.locals.user);
  if (request.query.has('_method')) {
    request.method = request.query.get('_method').toUpperCase();
  }

  const response = await resolve(request);

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
  // console.log("Request Session: ", request);

  return {
    user: request.locals.user && {
      username: request.locals.user?.username,
      email: request.locals.user?.email,
    },
    jwt: request.locals.jwt,
  };
}
