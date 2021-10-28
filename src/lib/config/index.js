import { dev } from '$app/env';

let uri = 'https://api.digitalbk.app';
if (dev) {
  uri = 'http://192.168.20.26:1337';
}

export const BASE_LOGIN_URI = `${uri}/auth/local`;
export const GRAPHQL_URI = `${uri}/graphql`;
export const NOTION_URI = '';
export const NOTION_TOKEN = '';
