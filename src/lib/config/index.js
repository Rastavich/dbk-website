import { dev } from "$app/env";

let uri = "https://api.digitalbk.app";
if (dev) {
  uri = "http://172.23.75.163:1337";
}

export const BASE_LOGIN_URI = `${uri}/auth/local`;
export const GRAPHQL_URI = `${uri}/graphql`;
