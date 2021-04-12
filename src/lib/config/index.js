import { dev } from "$app/env";

let uri = "https://api.digitalbk.app";
if (dev) {
  uri = "http://192.168.20.7:1337";
}

export const BASE_LOGIN_URI = `${uri}/auth/local`;
export const GRAPHQL_URI = `${uri}/graphql`;
