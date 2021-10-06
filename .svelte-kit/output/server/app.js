var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
import cookie from "cookie";
import snarkdown from "snarkdown";
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
const escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session2 = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session: session2
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session2.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2 && page2.path)},
						query: new URLSearchParams(${page2 ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond$2({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond$2(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function is_promise(value) {
  return value && typeof value === "object" && typeof value.then === "function";
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "";
const css$6 = {
  code: "#svelte-announcer.svelte-1pdgbjn{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}</style>"],"names":[],"mappings":"AAqDO,gCAAiB,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,OAAO,GAAG,CAAC,KAAK,CAAC,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,IAAI,CAAC,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$6);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base$1 = "";
let assets = "";
function set_paths(paths) {
  base$1 = paths.base;
  assets = paths.assets || base$1;
}
function set_prerendering(value) {
}
async function handle({ request, resolve: resolve2 }) {
  const cookies = await cookie.parse(request.headers.cookie || "");
  let user;
  if (cookies.user) {
    user = JSON.parse(cookies.user);
  }
  const jwt = cookies.jwt;
  request.locals.user = user || "";
  request.locals.jwt = jwt || "";
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  return {
    ...response,
    headers: {
      ...response.headers
    }
  };
}
function getSession(request) {
  var _a, _b;
  return {
    user: request.locals.user && {
      username: (_a = request.locals.user) == null ? void 0 : _a.username,
      email: (_b = request.locals.user) == null ? void 0 : _b.email
    },
    jwt: request.locals.jwt
  };
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle,
  getSession
});
const template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.ico" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-84e0a3cc.js",
      css: [assets + "/_app/assets/start-464e9d0a.css"],
      js: [assets + "/_app/start-84e0a3cc.js", assets + "/_app/chunks/vendor-d12625f6.js", assets + "/_app/chunks/singletons-12a22614.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
const d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
const empty = () => ({});
const manifest = {
  assets: [{ "file": "favicon.ico", "size": 1150, "type": "image/vnd.microsoft.icon" }, { "file": "images/app-image.webp", "size": 74688, "type": "image/webp" }, { "file": "images/feature-image2.webp", "size": 65954, "type": "image/webp" }, { "file": "logo-192.png", "size": 4760, "type": "image/png" }, { "file": "logo-512.png", "size": 13928, "type": "image/png" }, { "file": "logo.webp", "size": 7916, "type": "image/webp" }, { "file": "logo_light.webp", "size": 5204, "type": "image/webp" }, { "file": "robots.txt", "size": 100, "type": "text/plain" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/terms-of-service\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/terms-of-service/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/privacy-policy\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/privacy-policy/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/changelog\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/changelog/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/features\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/features/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/contact/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/pricing\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/pricing/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/logout\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/logout/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/signup\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/signup/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/login\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/login/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/auth\/logout\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return logout;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/auth\/login\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return login;
      })
    },
    {
      type: "page",
      pattern: /^\/blog\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/docs\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/docs/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/docs\/([^/]+?)\/?$/,
      params: (m) => ({ slug: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/docs/[slug].svelte"],
      b: ["src/routes/__error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$d;
  }),
  "src/routes/terms-of-service/index.svelte": () => Promise.resolve().then(function() {
    return index$c;
  }),
  "src/routes/privacy-policy/index.svelte": () => Promise.resolve().then(function() {
    return index$b;
  }),
  "src/routes/changelog/index.svelte": () => Promise.resolve().then(function() {
    return index$a;
  }),
  "src/routes/dashboard/index.svelte": () => Promise.resolve().then(function() {
    return index$9;
  }),
  "src/routes/features/index.svelte": () => Promise.resolve().then(function() {
    return index$8;
  }),
  "src/routes/contact/index.svelte": () => Promise.resolve().then(function() {
    return index$7;
  }),
  "src/routes/pricing/index.svelte": () => Promise.resolve().then(function() {
    return index$6;
  }),
  "src/routes/logout/index.svelte": () => Promise.resolve().then(function() {
    return index$5;
  }),
  "src/routes/signup/index.svelte": () => Promise.resolve().then(function() {
    return index$4;
  }),
  "src/routes/about/index.svelte": () => Promise.resolve().then(function() {
    return index$3;
  }),
  "src/routes/login/index.svelte": () => Promise.resolve().then(function() {
    return index$2;
  }),
  "src/routes/blog/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/docs/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/docs/[slug].svelte": () => Promise.resolve().then(function() {
    return _slug_;
  })
};
const metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-19e7fcf2.js", "css": ["assets/pages/__layout.svelte-3b96862c.css"], "js": ["pages/__layout.svelte-19e7fcf2.js", "chunks/vendor-d12625f6.js", "chunks/stores-f4f24851.js", "chunks/button-e7c1731c.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-6e6bc99d.js", "css": ["assets/pages/__error.svelte-ae89a356.css"], "js": ["pages/__error.svelte-6e6bc99d.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-fd04169b.js", "css": ["assets/pages/index.svelte-4c72270e.css"], "js": ["pages/index.svelte-fd04169b.js", "chunks/vendor-d12625f6.js", "chunks/signup-97a2691e.js", "chunks/button-e7c1731c.js", "chunks/open-graph-2db86038.js", "chunks/stores-f4f24851.js"], "styles": [] }, "src/routes/terms-of-service/index.svelte": { "entry": "pages/terms-of-service/index.svelte-c2dc59c3.js", "css": [], "js": ["pages/terms-of-service/index.svelte-c2dc59c3.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/privacy-policy/index.svelte": { "entry": "pages/privacy-policy/index.svelte-16f530f9.js", "css": ["assets/pages/privacy-policy/index.svelte-09f04462.css"], "js": ["pages/privacy-policy/index.svelte-16f530f9.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/changelog/index.svelte": { "entry": "pages/changelog/index.svelte-2d4cf0e5.js", "css": [], "js": ["pages/changelog/index.svelte-2d4cf0e5.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/dashboard/index.svelte": { "entry": "pages/dashboard/index.svelte-9fc213e2.js", "css": [], "js": ["pages/dashboard/index.svelte-9fc213e2.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/features/index.svelte": { "entry": "pages/features/index.svelte-bdf4fbb2.js", "css": [], "js": ["pages/features/index.svelte-bdf4fbb2.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/contact/index.svelte": { "entry": "pages/contact/index.svelte-a960b766.js", "css": [], "js": ["pages/contact/index.svelte-a960b766.js", "chunks/vendor-d12625f6.js", "chunks/button-e7c1731c.js"], "styles": [] }, "src/routes/pricing/index.svelte": { "entry": "pages/pricing/index.svelte-bbd2039b.js", "css": [], "js": ["pages/pricing/index.svelte-bbd2039b.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/logout/index.svelte": { "entry": "pages/logout/index.svelte-54e9c639.js", "css": [], "js": ["pages/logout/index.svelte-54e9c639.js", "chunks/vendor-d12625f6.js", "chunks/stores-f4f24851.js", "chunks/utils-8ab506d1.js"], "styles": [] }, "src/routes/signup/index.svelte": { "entry": "pages/signup/index.svelte-718ce5d1.js", "css": [], "js": ["pages/signup/index.svelte-718ce5d1.js", "chunks/vendor-d12625f6.js", "chunks/signup-97a2691e.js"], "styles": [] }, "src/routes/about/index.svelte": { "entry": "pages/about/index.svelte-570cbcac.js", "css": ["assets/pages/about/index.svelte-2cb57b6d.css"], "js": ["pages/about/index.svelte-570cbcac.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/login/index.svelte": { "entry": "pages/login/index.svelte-f98867d3.js", "css": [], "js": ["pages/login/index.svelte-f98867d3.js", "chunks/vendor-d12625f6.js", "chunks/stores-f4f24851.js", "chunks/singletons-12a22614.js", "chunks/utils-8ab506d1.js"], "styles": [] }, "src/routes/blog/index.svelte": { "entry": "pages/blog/index.svelte-1ffc951f.js", "css": [], "js": ["pages/blog/index.svelte-1ffc951f.js", "chunks/vendor-d12625f6.js"], "styles": [] }, "src/routes/docs/index.svelte": { "entry": "pages/docs/index.svelte-3121857d.js", "css": ["assets/pages/docs/index.svelte-2a728569.css"], "js": ["pages/docs/index.svelte-3121857d.js", "chunks/vendor-d12625f6.js", "chunks/index-71af2701.js", "chunks/open-graph-2db86038.js", "chunks/stores-f4f24851.js"], "styles": [] }, "src/routes/docs/[slug].svelte": { "entry": "pages/docs/[slug].svelte-fba5ee35.js", "css": [], "js": ["pages/docs/[slug].svelte-fba5ee35.js", "chunks/vendor-d12625f6.js", "chunks/index-71af2701.js", "chunks/open-graph-2db86038.js", "chunks/stores-f4f24851.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond$2({ ...request, host }, options, { prerender: prerender2 });
}
function post$2() {
  return {
    headers: {
      "set-cookie": [
        "jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "user=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      ]
    },
    body: {
      ok: true
    }
  };
}
var logout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  post: post$2
});
function respond(body) {
  if (body.errors) {
    return { status: 401, body };
  }
  const user = JSON.stringify(body.user);
  const jwt = body.jwt;
  return {
    headers: {
      "set-cookie": [
        `jwt=${jwt}; Path=/; HttpOnly; Secure`,
        `user=${user}; Path=/; HttpOnly; Secure`
      ]
    },
    body
  };
}
let uri = "https://api.digitalbk.app";
const BASE_LOGIN_URI = `${uri}/auth/local`;
const GRAPHQL_URI = `${uri}/graphql`;
const base = BASE_LOGIN_URI;
async function send({ method, data, token }) {
  const opts = { method, headers: {} };
  if (data) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }
  if (token) {
    opts.headers["Authorization"] = `Token ${token}`;
  }
  return fetch(`${base}`, opts).then((r) => r.text()).then((json) => {
    try {
      return JSON.parse(json);
    } catch (err) {
      return json;
    }
  });
}
function post$1(data, token) {
  return send({ method: "POST", data, token });
}
async function post(request) {
  const body = await post$1({
    identifier: request.body.email,
    password: request.body.password
  });
  return respond(body);
}
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  post
});
var global = "";
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let date = new Date().getFullYear();
  return `<footer class="${"text-gray-300 body-font hover:text-indigo-500"}"><div class="${"container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col"}"><div class="${"flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center"}"><div class="${"lg:w-1/4 md:w-1/2 w-full px-4"}"><h2 class="${"title-font font-medium tracking-widest text-sm mb-3"}">Resources
        </h2>
        <nav class="${"list-none mb-10"}"><li><a href="${"/docs"}">Documentation</a></li>
          <li><a href="${"/blog"}">Blog</a></li>
          <li><a href="${"/changelog"}">Changelog</a></li>
          <li><a href="${"/support"}">Support</a></li></nav></div>
      <div class="${"lg:w-1/4 md:w-1/2 w-full px-4"}"><h2 class="${"title-font font-medium tracking-widest text-sm mb-3"}">Features
        </h2>
        <nav class="${"list-none mb-10"}"><li><a href="${"/features#data-storage"}">Data Storage</a></li>
          <li><a href="${"/features#asset-monitoring"}">Asset Monitoring</a></li>
          <li><a href="${"/features#mobile-app"}">Mobile App</a></li>
          <li><a href="${"/features#auto-notifications"}">Automatic Notifications</a></li>
          <li><a href="${"/features"}">More Features</a></li></nav></div>
      <div class="${"lg:w-1/4 md:w-1/2 w-full px-4"}"><h2 class="${"title-font font-medium tracking-widest text-sm mb-3"}">Company
        </h2>
        <nav class="${"list-none mb-10"}"><li><a href="${"/"}">Home</a></li>
          <li><a href="${"/contact"}">Contact Us</a></li>

          <li><a href="${"/about"}">About</a></li>
          <li><a href="${"/pricing"}">Pricing</a></li></nav></div>
      <div class="${"lg:w-1/4 md:w-1/2 w-full px-4"}"><h2 class="${"title-font font-medium tracking-widest text-sm mb-3"}">Legal
        </h2>
        <nav class="${"list-none mb-10"}"><li><a href="${"/privacy-policy"}">Privacy Policy</a></li>
          <li><a href="${"/terms-of-service"}">Terms of Service</a></li></nav></div></div></div>
  <div class="${"bg-gray-100 text-gray-700"}"><div class="${"container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row"}"><p class="${"text-sm text-center sm:text-left"}">\xA9
        ${escape(date)}
        Digital Business Keys
      </p>
      <span class="${"inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start"}"><a href="${"https://facebook.com"}"><svg fill="${"black"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"}"></path></svg></a>
        <a href="${"https://twitter.com"}" class="${"ml-3"}"><svg fill="${"black"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"}"></path></svg></a>
        <a href="${"https://linkedin.com"}" class="${"ml-3"}"><svg fill="${"black"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"0"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path stroke="${"none"}" d="${"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"}"></path><circle cx="${"4"}" cy="${"4"}" r="${"2"}" stroke="${"none"}"></circle></svg></a></span></div></div></footer>`;
});
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const error = (verb) => {
  throw new Error(`Can only ${verb} session store in browser`);
};
const session = {
  subscribe(fn) {
    const store = getStores().session;
    return store.subscribe(fn);
  },
  set: () => error("set"),
  update: () => error("update")
};
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { text } = $$props;
  let { clickEvent } = $$props;
  let { href } = $$props;
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.clickEvent === void 0 && $$bindings.clickEvent && clickEvent !== void 0)
    $$bindings.clickEvent(clickEvent);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  return `<a${add_attribute("href", href, 0)} class="${"mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full py-4 px-8 shadow-lg"}">${text ? ` ${escape(text)} ` : ` ${slots.default ? slots.default({}) : ``} `}</a>`;
});
var header_svelte_svelte_type_style_lang = "";
const css$5 = {
  code: "a.svelte-1ypk6ma{color:rgba(255,255,255,var(--tw-text-opacity));display:inline;font-size:1rem;line-height:1.5rem;margin-right:1rem;margin-top:1rem}a.svelte-1ypk6ma,a.svelte-1ypk6ma:hover{--tw-text-opacity:1}a.svelte-1ypk6ma:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media(min-width:1024px){a.svelte-1ypk6ma{display:inline-block;margin-top:0}}",
  map: '{"version":3,"file":"header.svelte","sources":["header.svelte"],"sourcesContent":["<script>\\n  import { session } from \\"$app/stores\\";\\n  import Button from \\"$lib/components/generics/button.svelte\\";\\n  // import Href from \\"./generics/Href.svelte\\";\\n\\n  function toggleMenu() {\\n    var item = document.getElementById(\\"hidden-menu\\");\\n    var btn = document.getElementById(\\"hidden-menubtn\\");\\n\\n    item.classList.toggle(\\"hidden\\");\\n    btn.classList.toggle(\\"hidden\\");\\n  }\\n<\/script>\\n\\n<!-- component -->\\n<nav\\n  class=\\"flex justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left\\"\\n>\\n  <div class=\\"flex items-center flex-no-shrink text-white mr-6\\">\\n    <span class=\\"font-semibold text-xl tracking-tight text-gray-50\\"\\n      ><a href=\\"/\\"\\n        ><img\\n          class=\\"w-60 md:w-72 lg:w-72\\"\\n          src=\\"logo_light.webp\\"\\n          alt=\\"Digital Business Keys\\"\\n        /></a\\n      ></span\\n    >\\n  </div>\\n  <div class=\\"block lg:hidden z-50 lg:py-2\\">\\n    <button\\n      on:click={toggleMenu}\\n      class=\\"flex px-3 my-3 md:my-5 lg:py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white\\"\\n    >\\n      <svg\\n        class=\\"h-3 w-3\\"\\n        viewBox=\\"0 0 20 20\\"\\n        fill=\\"white\\"\\n        xmlns=\\"http://www.w3.org/2000/svg\\"\\n        ><title>Menu</title>\\n        <path d=\\"M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z\\" /></svg\\n      >\\n    </button>\\n  </div>\\n  <div\\n    class=\\"w-full block flex-grow lg:flex lg:items-center md:items-center lg:w-auto z-50 md:text-center lg:text-center\\"\\n  >\\n    <div\\n      id=\\"hidden-menu\\"\\n      class=\\"text-sm lg:flex-grow hidden lg:block md:items-center lg:items-center md:text-center lg:text-center\\"\\n    >\\n      <a href=\\"/docs\\" rel=\\"prefetch\\" class=\\"nav-link\\" on:click={toggleMenu}\\n        >Docs</a\\n      >\\n      <a href=\\"/features\\" rel=\\"prefetch\\" on:click={toggleMenu}>Features</a>\\n      <a href=\\"/blog\\" rel=\\"prefetch\\" on:click={toggleMenu}>Blog</a>\\n      <a href=\\"contact\\" rel=\\"prefetch\\" on:click={toggleMenu}>Contact Us</a>\\n    </div>\\n    {#if $session.user}\\n      <div id=\\"hidden-menubtn\\" class=\\"hidden lg:block\\">\\n        <Button text=\\"Dashboard\\" href=\\"/dashboard\\" clickEvent={toggleMenu} />\\n        <Button text=\\"Logout\\" href=\\"/logout\\" clickEvent={toggleMenu} />\\n      </div>\\n    {:else}\\n      <div id=\\"hidden-menubtn\\" class=\\"hidden lg:block\\">\\n        <Button text=\\"Sign Up\\" href=\\"/signup\\" clickEvent={toggleMenu} />\\n        <Button text=\\"Sign In\\" href=\\"/login\\" clickEvent={toggleMenu} />\\n      </div>\\n    {/if}\\n  </div>\\n</nav>\\n\\n<style>a{color:rgba(255,255,255,var(--tw-text-opacity));display:inline;font-size:1rem;line-height:1.5rem;margin-right:1rem;margin-top:1rem}a,a:hover{--tw-text-opacity:1}a:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media (min-width:1024px){a{display:inline-block;margin-top:0}}</style>\\n"],"names":[],"mappings":"AAwEO,gBAAC,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,QAAQ,MAAM,CAAC,UAAU,IAAI,CAAC,YAAY,MAAM,CAAC,aAAa,IAAI,CAAC,WAAW,IAAI,CAAC,gBAAC,CAAC,gBAAC,MAAM,CAAC,kBAAkB,CAAC,CAAC,gBAAC,MAAM,CAAC,MAAM,KAAK,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,MAAM,AAAC,WAAW,MAAM,CAAC,CAAC,gBAAC,CAAC,QAAQ,YAAY,CAAC,WAAW,CAAC,CAAC,CAAC"}'
};
function toggleMenu() {
  var item = document.getElementById("hidden-menu");
  var btn = document.getElementById("hidden-menubtn");
  item.classList.toggle("hidden");
  btn.classList.toggle("hidden");
}
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  $$result.css.add(css$5);
  $$unsubscribe_session();
  return `
<nav class="${"flex justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left"}"><div class="${"flex items-center flex-no-shrink text-white mr-6"}"><span class="${"font-semibold text-xl tracking-tight text-gray-50"}"><a href="${"/"}" class="${"svelte-1ypk6ma"}"><img class="${"w-60 md:w-72 lg:w-72"}" src="${"logo_light.webp"}" alt="${"Digital Business Keys"}"></a></span></div>
  <div class="${"block lg:hidden z-50 lg:py-2"}"><button class="${"flex px-3 my-3 md:my-5 lg:py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white"}"><svg class="${"h-3 w-3"}" viewBox="${"0 0 20 20"}" fill="${"white"}" xmlns="${"http://www.w3.org/2000/svg"}"><title>Menu</title><path d="${"M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"}"></path></svg></button></div>
  <div class="${"w-full block flex-grow lg:flex lg:items-center md:items-center lg:w-auto z-50 md:text-center lg:text-center"}"><div id="${"hidden-menu"}" class="${"text-sm lg:flex-grow hidden lg:block md:items-center lg:items-center md:text-center lg:text-center"}"><a href="${"/docs"}" rel="${"prefetch"}" class="${"nav-link svelte-1ypk6ma"}">Docs</a>
      <a href="${"/features"}" rel="${"prefetch"}" class="${"svelte-1ypk6ma"}">Features</a>
      <a href="${"/blog"}" rel="${"prefetch"}" class="${"svelte-1ypk6ma"}">Blog</a>
      <a href="${"contact"}" rel="${"prefetch"}" class="${"svelte-1ypk6ma"}">Contact Us</a></div>
    ${$session.user ? `<div id="${"hidden-menubtn"}" class="${"hidden lg:block"}">${validate_component(Button, "Button").$$render($$result, {
    text: "Dashboard",
    href: "/dashboard",
    clickEvent: toggleMenu
  }, {}, {})}
        ${validate_component(Button, "Button").$$render($$result, {
    text: "Logout",
    href: "/logout",
    clickEvent: toggleMenu
  }, {}, {})}</div>` : `<div id="${"hidden-menubtn"}" class="${"hidden lg:block"}">${validate_component(Button, "Button").$$render($$result, {
    text: "Sign Up",
    href: "/signup",
    clickEvent: toggleMenu
  }, {}, {})}
        ${validate_component(Button, "Button").$$render($$result, {
    text: "Sign In",
    href: "/login",
    clickEvent: toggleMenu
  }, {}, {})}</div>`}</div>
</nav>`;
});
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${slots.default ? slots.default({}) : ``}

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var section_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: "section.svelte-15d98kd{margin-top:var(--xx-large)}section.svelte-15d98kd:last-of-type{margin-bottom:var(--xx-large)}@media(max-width:972px){section.svelte-15d98kd{margin-top:var(--x-large)}section.svelte-15d98kd:last-of-type{margin-bottom:var(--x-large)}}",
  map: '{"version":3,"file":"section.svelte","sources":["section.svelte"],"sourcesContent":["<script>\\n    export let id;\\n  <\/script>\\n  \\n  <style lang=\\"scss\\">section{margin-top:var(--xx-large)}section:last-of-type{margin-bottom:var(--xx-large)}@media (max-width:972px){section{margin-top:var(--x-large)}section:last-of-type{margin-bottom:var(--x-large)}}</style>\\n  \\n  <section {id}>\\n    <slot />\\n  </section>"],"names":[],"mappings":"AAIqB,sBAAO,CAAC,WAAW,IAAI,UAAU,CAAC,CAAC,sBAAO,aAAa,CAAC,cAAc,IAAI,UAAU,CAAC,CAAC,MAAM,AAAC,WAAW,KAAK,CAAC,CAAC,sBAAO,CAAC,WAAW,IAAI,SAAS,CAAC,CAAC,sBAAO,aAAa,CAAC,cAAc,IAAI,SAAS,CAAC,CAAC,CAAC"}'
};
const Section = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { id } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  $$result.css.add(css$4);
  return `<section${add_attribute("id", id, 0)} class="${"svelte-15d98kd"}">${slots.default ? slots.default({}) : ``}</section>`;
});
const prerender$1 = true;
function load$5({ error: error2, status }) {
  return { props: { error: error2, status } };
}
const _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<div class="${"error-page row"}">${validate_component(Section, "Section").$$render($$result, {}, {}, {
    default: () => `<img src="${"/images/illustration-large.jpg"}" alt="${"Digital Business Keys"}">
    <h1>${escape(status)}</h1>
    <p>Oh, no! Something went wrong on our side.</p>

    ${``}

    <p><a href="${"/contact"}">Contact Us</a></p>
    <p><a class="${"btn"}" href="${"/"}">Go Home</a></p>`
  })}</div>

${``}`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error,
  prerender: prerender$1,
  load: load$5
});
const Call_to_action = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"text-white-500 body-font"}"><div class="${"container px-5 py-24 mx-auto flex items-center md:flex-row flex-col"}"><div class="${"flex flex-col md:pr-10 md:mb-0 mb-8 pr-0 w-full md:w-auto md:text-left text-center"}"><h2 class="${"text-xs text-indigo-300 tracking-widest font-medium title-font mb-1"}">DOWNLOAD THE APP
            </h2>
            <h1 class="${"md:text-3xl text-2xl font-medium title-font"}">Get the Digital Business App on your device.
            </h1></div>
        <div class="${"flex md:ml-auto md:mr-0 mx-auto items-center flex-shrink-0 space-x-4"}"><button class="${"bg-gray-100 inline-flex py-3 px-5 rounded-lg items-center hover:bg-gray-200 focus:outline-none"}"><svg xmlns="${"http://www.w3.org/2000/svg"}" fill="${"text-grey-900"}" class="${"w-6 h-6"}" viewBox="${"0 0 512 512"}"><path d="${"M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"}"></path></svg>
                <span class="${"ml-4 flex items-start flex-col leading-none"}"><span class="${"text-xs text-gray-600 mb-1"}">GET IT ON</span>
                    <span class="${"title-font font-medium"}">Google Play</span></span></button>
            <button class="${"bg-gray-100 inline-flex py-3 px-5 rounded-lg items-center hover:bg-gray-200 focus:outline-none"}"><svg xmlns="${"http://www.w3.org/2000/svg"}" fill="${"text-grey-900"}" class="${"w-6 h-6"}" viewBox="${"0 0 305 305"}"><path d="${"M40.74 112.12c-25.79 44.74-9.4 112.65 19.12 153.82C74.09 286.52 88.5 305 108.24 305c.37 0 .74 0 1.13-.02 9.27-.37 15.97-3.23 22.45-5.99 7.27-3.1 14.8-6.3 26.6-6.3 11.22 0 18.39 3.1 25.31 6.1 6.83 2.95 13.87 6 24.26 5.81 22.23-.41 35.88-20.35 47.92-37.94a168.18 168.18 0 0021-43l.09-.28a2.5 2.5 0 00-1.33-3.06l-.18-.08c-3.92-1.6-38.26-16.84-38.62-58.36-.34-33.74 25.76-51.6 31-54.84l.24-.15a2.5 2.5 0 00.7-3.51c-18-26.37-45.62-30.34-56.73-30.82a50.04 50.04 0 00-4.95-.24c-13.06 0-25.56 4.93-35.61 8.9-6.94 2.73-12.93 5.09-17.06 5.09-4.64 0-10.67-2.4-17.65-5.16-9.33-3.7-19.9-7.9-31.1-7.9l-.79.01c-26.03.38-50.62 15.27-64.18 38.86z"}"></path><path d="${"M212.1 0c-15.76.64-34.67 10.35-45.97 23.58-9.6 11.13-19 29.68-16.52 48.38a2.5 2.5 0 002.29 2.17c1.06.08 2.15.12 3.23.12 15.41 0 32.04-8.52 43.4-22.25 11.94-14.5 17.99-33.1 16.16-49.77A2.52 2.52 0 00212.1 0z"}"></path></svg>
                <span class="${"ml-4 flex items-start flex-col leading-none"}"><span class="${"text-xs text-gray-600 mb-1"}">Download on the</span>
                    <span class="${"title-font font-medium"}">App Store</span></span></button></div></div></section>`;
});
const Featured_section = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"text-gray-600 body-font"}"><div class="${"container px-5 py-24 mx-auto"}"><div class="${"flex flex-col text-center w-full mb-20"}"><h2 class="${"text-xs text-indigo-300 tracking-widest font-medium title-font mb-1"}">FEATURES
      </h2>
      <h1 class="${"sm:text-3xl text-2xl font-medium title-font text-gray-50"}">The app provides the following easy to set up features
      </h1></div>
    <div class="${"flex flex-wrap -m-4"}"><div class="${"p-4 md:w-1/3"}"><div class="${"flex rounded-lg h-full bg-gray-100 p-8 flex-col"}"><div class="${"flex items-center mb-3"}"><div class="${"w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M22 12h-4l-3 9L9 3l-3 9H2"}"></path></svg></div>
            <h2 class="${"text-gray-900 text-lg title-font font-medium"}">Asset Storage
            </h2></div>
          <div class="${"flex-grow"}"><p class="${"leading-relaxed text-base"}">React to changes, plan website upgrades and manage the Digital
              Keys to your business by securing account information for your
              Domain, DNS and emails.
            </p>
            <a class="${"mt-3 text-indigo-300 inline-flex items-center"}">Learn More
              <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></a></div></div></div>
      <div class="${"p-4 md:w-1/3"}"><div class="${"flex rounded-lg h-full bg-gray-100 p-8 flex-col"}"><div class="${"flex items-center mb-3"}"><div class="${"w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"}"></path><circle cx="${"12"}" cy="${"7"}" r="${"4"}"></circle></svg></div>
            <h2 class="${"text-gray-900 text-lg title-font font-medium"}">In App Monitoring
            </h2></div>
          <div class="${"flex-grow"}"><p class="${"leading-relaxed text-base"}">Monitor and check the availability of your website and emails with
              in the app at one glance for free
            </p>
            <a class="${"mt-3 text-indigo-300 inline-flex items-center"}">Learn More
              <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></a></div></div></div>
      <div class="${"p-4 md:w-1/3"}"><div class="${"flex rounded-lg h-full bg-gray-100 p-8 flex-col"}"><div class="${"flex items-center mb-3"}"><div class="${"w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><circle cx="${"6"}" cy="${"6"}" r="${"3"}"></circle><circle cx="${"6"}" cy="${"18"}" r="${"3"}"></circle><path d="${"M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"}"></path></svg></div>
            <h2 class="${"text-gray-900 text-lg title-font font-medium"}">Real Time Notifications
            </h2></div>
          <div class="${"flex-grow"}"><p class="${"leading-relaxed text-base"}">Upgrade to receive Real Time Notifications of website and email
              issues.
            </p>
            <a class="${"mt-3 text-indigo-300 inline-flex items-center"}">Learn More
              <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></a></div></div></div></div></div></section>`;
});
const Features$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"text-gray-600 body-font"}"><div class="${"container px-5 py-24 mx-auto flex flex-wrap"}"><div class="${"lg:w-1/2 w-full mb-10 lg:mb-0 rounded-lg overflow-hidden"}"><img alt="${"feature"}" class="${"object-cover object-center h-95 w-80"}" src="${"/images/app-image.webp"}"></div>
    <div class="${"flex flex-col flex-wrap lg:py-6 -mb-10 lg:w-1/2 lg:pl-12 lg:text-left text-center"}"><div class="${"flex flex-col mb-10 lg:items-start items-center"}"><div class="${"w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-300 mb-5"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-6 h-6"}" viewBox="${"0 0 24 24"}"><path d="${"M22 12h-4l-3 9L9 3l-3 9H2"}"></path></svg></div>
        <div class="${"flex-grow"}"><h2 class="${"text-lg title-font font-medium mb-3"}">Shooting Stars</h2>
          <p class="${"leading-relaxed text-base text-gray-50"}">Blue bottle crucifix vinyl post-ironic four dollar toast vegan
            taxidermy. Gastropub indxgo juice poutine.
          </p>
          <a class="${"mt-3 text-indigo-300 inline-flex items-center"}" href="${"/features"}">Learn More
            <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></a></div></div>
      <div class="${"flex flex-col mb-10 lg:items-start items-center"}"><div class="${"w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-300 mb-5"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-6 h-6"}" viewBox="${"0 0 24 24"}"><circle cx="${"6"}" cy="${"6"}" r="${"3"}"></circle><circle cx="${"6"}" cy="${"18"}" r="${"3"}"></circle><path d="${"M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"}"></path></svg></div>
        <div class="${"flex-grow"}"><h2 class="${"text-lg title-font font-medium mb-3"}">The Catalyzer</h2>
          <p class="${"leading-relaxed text-base text-gray-50"}">Blue bottle crucifix vinyl post-ironic four dollar toast vegan
            taxidermy. Gastropub indxgo juice poutine.
          </p>
          <a class="${"mt-3 text-indigo-300 inline-flex items-center"}" href="${"/features"}">Learn More
            <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></a></div></div>
      <div class="${"flex flex-col mb-10 lg:items-start items-center"}"><div class="${"w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-300 mb-5"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-6 h-6"}" viewBox="${"0 0 24 24"}"><path d="${"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"}"></path><circle cx="${"12"}" cy="${"7"}" r="${"4"}"></circle></svg></div>
        <div class="${"flex-grow"}"><h2 class="${"text-lg title-font font-medium mb-3"}">Neptune</h2>
          <p class="${"leading-relaxed text-base text-gray-50"}">Blue bottle crucifix vinyl post-ironic four dollar toast vegan
            taxidermy. Gastropub indxgo juice poutine.
          </p>
          <a class="${"mt-3 text-indigo-300 inline-flex items-center"}" href="${"/features"}">Learn More
            <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></a></div></div></div></div></section>`;
});
var pricing_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: ".active.svelte-1hd2jug{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}",
  map: `{"version":3,"file":"pricing.svelte","sources":["pricing.svelte"],"sourcesContent":["<script>\\n    let priceType = \\"monthly\\";\\n\\n    function toggleMonthly() {\\n        priceType = \\"monthly\\";\\n    }\\n\\n    function toggleAnnual() {\\n        priceType = \\"yearly\\";\\n    }\\n<\/script>\\n\\n<style lang=\\"postcss\\">.active{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}</style>\\n\\n<section class=\\"text-gray-50 body-font overflow-hidden\\">\\n    <div class=\\"container px-5 py-24 mx-auto\\">\\n        <div class=\\"flex flex-col text-center w-full mb-20\\">\\n            <h1 class=\\"sm:text-4xl text-3xl font-medium title-font mb-2\\">\\n                Pricing\\n            </h1>\\n            <p class=\\"lg:w-2/3 mx-auto leading-relaxed text-base\\">\\n                A free trial and different tiers to cater to all types of users\\n                and budgets.\\n            </p>\\n            <div\\n                class=\\"flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6\\">\\n                <button\\n                    class:active={priceType === 'monthly'}\\n                    class=\\"py-1 px-4 text-white focus:outline-none\\"\\n                    on:click={toggleMonthly}>Monthly</button>\\n                <button\\n                    class:active={priceType === 'yearly'}\\n                    class=\\"py-1 px-4 focus:outline-none\\"\\n                    on:click={toggleAnnual}>Annually</button>\\n            </div>\\n        </div>\\n        <div class=\\"flex flex-wrap -m-4\\">\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\n                <div\\n                    class=\\"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden\\">\\n                    <h2\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\n                        TRIAL\\n                    </h2>\\n                    <h1\\n                        class=\\"text-5xl pb-4 mb-4 border-b border-gray-200 leading-none\\">\\n                        Free\\n                    </h1>\\n                    <p class=\\"flex items-center  mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Save your Digital Assets\\n                    </p>\\n                    <p class=\\"flex items-center mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Save your Important Business Details\\n                    </p>\\n                    <p class=\\"flex items-center mb-6\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>View status of your assets\\n                    </p>\\n                    <button\\n                        class=\\"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded\\">Buy\\n                        <svg\\n                            fill=\\"none\\"\\n                            stroke=\\"currentColor\\"\\n                            stroke-linecap=\\"round\\"\\n                            stroke-linejoin=\\"round\\"\\n                            stroke-width=\\"2\\"\\n                            class=\\"w-4 h-4 ml-auto\\"\\n                            viewBox=\\"0 0 24 24\\">\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\n                        </svg>\\n                    </button>\\n                    <p class=\\"text-xs text-gray-400 mt-3\\">\\n                        Try the app for free for 14 days.\\n                    </p>\\n                </div>\\n            </div>\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\n                <div\\n                    class=\\"h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden\\">\\n                    <span\\n                        class=\\"bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl\\">POPULAR</span>\\n                    <h2\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\n                        ESSENTIAL\\n                    </h2>\\n                    <h1\\n                        class=\\"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200\\">\\n                        {#if priceType == 'monthly'}\\n                            <span>$5</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/mo</span>\\n                        {:else}\\n                            <span>$50</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/yr</span>\\n                        {/if}\\n                    </h1>\\n                    <p class=\\"flex items-center  mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>All Trial Features\\n                    </p>\\n                    <p class=\\"flex items-center mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Save multiple assets\\n                    </p>\\n                    <p class=\\"flex items-center mb-6\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Email and export\\n                    </p>\\n                    <button\\n                        class=\\"flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded\\">Buy\\n                        <svg\\n                            fill=\\"none\\"\\n                            stroke=\\"currentColor\\"\\n                            stroke-linecap=\\"round\\"\\n                            stroke-linejoin=\\"round\\"\\n                            stroke-width=\\"2\\"\\n                            class=\\"w-4 h-4 ml-auto\\"\\n                            viewBox=\\"0 0 24 24\\">\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\n                        </svg>\\n                    </button>\\n                    <p class=\\"text-xs text-gray-500 mt-3\\">\\n                        All the features for your small business.\\n                    </p>\\n                </div>\\n            </div>\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\n                <div\\n                    class=\\"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden\\">\\n                    <h2\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\n                        PREMIUM\\n                    </h2>\\n                    <h1\\n                        class=\\"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200\\">\\n                        {#if priceType == 'monthly'}\\n                            <span>$8</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/mo</span>\\n                        {:else}\\n                            <span>$90</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/yr</span>\\n                        {/if}\\n                    </h1>\\n                    <p class=\\"flex items-center  mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>All Trial & Essential Features\\n                    </p>\\n                    <p class=\\"flex items-center mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Setup notifications for your assets\\n                    </p>\\n                    <p class=\\"flex items-center mb-6\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Automatic service checks to ensure your assets\\n                        are always working\\n                    </p>\\n                    <button\\n                        class=\\"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded\\">Buy\\n                        <svg\\n                            fill=\\"none\\"\\n                            stroke=\\"currentColor\\"\\n                            stroke-linecap=\\"round\\"\\n                            stroke-linejoin=\\"round\\"\\n                            stroke-width=\\"2\\"\\n                            class=\\"w-4 h-4 ml-auto\\"\\n                            viewBox=\\"0 0 24 24\\">\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\n                        </svg>\\n                    </button>\\n                    <p class=\\"text-xs text-gray-500 mt-3\\">\\n                        Perfect for business critical services.\\n                    </p>\\n                </div>\\n            </div>\\n        </div>\\n    </div>\\n</section>\\n"],"names":[],"mappings":"AAYsB,sBAAO,CAAC,gBAAgB,CAAC,CAAC,iBAAiB,KAAK,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,eAAe,CAAC,CAAC,CAAC"}`
};
const Pricing$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `<section class="${"text-gray-50 body-font overflow-hidden"}"><div class="${"container px-5 py-24 mx-auto"}"><div class="${"flex flex-col text-center w-full mb-20"}"><h1 class="${"sm:text-4xl text-3xl font-medium title-font mb-2"}">Pricing
            </h1>
            <p class="${"lg:w-2/3 mx-auto leading-relaxed text-base"}">A free trial and different tiers to cater to all types of users
                and budgets.
            </p>
            <div class="${"flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6"}"><button class="${[
    "py-1 px-4 text-white focus:outline-none svelte-1hd2jug",
    "active"
  ].join(" ").trim()}">Monthly</button>
                <button class="${[
    "py-1 px-4 focus:outline-none svelte-1hd2jug",
    ""
  ].join(" ").trim()}">Annually</button></div></div>
        <div class="${"flex flex-wrap -m-4"}"><div class="${"p-4 xl:w-1/3 md:w-1/3 w-full"}"><div class="${"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden"}"><h2 class="${"text-sm tracking-widest title-font mb-1 font-medium"}">TRIAL
                    </h2>
                    <h1 class="${"text-5xl pb-4 mb-4 border-b border-gray-200 leading-none"}">Free
                    </h1>
                    <p class="${"flex items-center mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>Save your Digital Assets
                    </p>
                    <p class="${"flex items-center mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>Save your Important Business Details
                    </p>
                    <p class="${"flex items-center mb-6"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>View status of your assets
                    </p>
                    <button class="${"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded"}">Buy
                        <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-auto"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></button>
                    <p class="${"text-xs text-gray-400 mt-3"}">Try the app for free for 14 days.
                    </p></div></div>
            <div class="${"p-4 xl:w-1/3 md:w-1/3 w-full"}"><div class="${"h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden"}"><span class="${"bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl"}">POPULAR</span>
                    <h2 class="${"text-sm tracking-widest title-font mb-1 font-medium"}">ESSENTIAL
                    </h2>
                    <h1 class="${"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200"}">${`<span>$5</span>
                            <span class="${"text-lg ml-1 font-normal text-gray-500"}">/mo</span>`}</h1>
                    <p class="${"flex items-center mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>All Trial Features
                    </p>
                    <p class="${"flex items-center mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>Save multiple assets
                    </p>
                    <p class="${"flex items-center mb-6"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>Email and export
                    </p>
                    <button class="${"flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded"}">Buy
                        <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-auto"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></button>
                    <p class="${"text-xs text-gray-500 mt-3"}">All the features for your small business.
                    </p></div></div>
            <div class="${"p-4 xl:w-1/3 md:w-1/3 w-full"}"><div class="${"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden"}"><h2 class="${"text-sm tracking-widest title-font mb-1 font-medium"}">PREMIUM
                    </h2>
                    <h1 class="${"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200"}">${`<span>$8</span>
                            <span class="${"text-lg ml-1 font-normal text-gray-500"}">/mo</span>`}</h1>
                    <p class="${"flex items-center mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>All Trial &amp; Essential Features
                    </p>
                    <p class="${"flex items-center mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>Setup notifications for your assets
                    </p>
                    <p class="${"flex items-center mb-6"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
                        </span>Automatic service checks to ensure your assets
                        are always working
                    </p>
                    <button class="${"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded"}">Buy
                        <svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-auto"}" viewBox="${"0 0 24 24"}"><path d="${"M5 12h14M12 5l7 7-7 7"}"></path></svg></button>
                    <p class="${"text-xs text-gray-500 mt-3"}">Perfect for business critical services.
                    </p></div></div></div></div></section>`;
});
const Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"text-white-500 body-font"}"><div class="${"container px-5 py-24 mx-auto flex flex-wrap items-center"}"><div class="${"lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0"}"><h1 class="${"title-font font-medium text-3xl"}">Sign up online or in the app to get started with securing your
                Digital Assets
            </h1>
            <p class="${"leading-relaxed mt-4 text-indigo-300"}">This is the first step to securing your Digital Assets in a
                secure easy to use location.
            </p></div>
        <div class="${"lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0"}"><h2 class="${"text-gray-900 text-lg font-medium title-font mb-5"}">Sign Up
            </h2>
            <div class="${"relative mb-4"}"><label for="${"full-name"}" class="${"leading-7 text-sm text-gray-600"}">Full Name</label>
                <input type="${"text"}" id="${"full-name"}" name="${"full-name"}" class="${"w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"}"></div>
            <div class="${"relative mb-4"}"><label for="${"email"}" class="${"leading-7 text-sm text-gray-600"}">Email</label>
                <input type="${"email"}" id="${"email"}" name="${"email"}" class="${"w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"}"></div>
            <button class="${"text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"}">Button</button>
            <p class="${"text-xs text-gray-500 mt-3"}">By clicking you agree to the Digital Business Keys Terms of
                Service and
                <a href="${"/privacy-policy"}">Privacy Policy.</a></p></div></div></section>`;
});
const Open_graph = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { description } = $$props;
  let { image } = $$props;
  let { title } = $$props;
  let { type } = $$props;
  const url = `https://${$page.host}${$page.path}`;
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.image === void 0 && $$bindings.image && image !== void 0)
    $$bindings.image(image);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$unsubscribe_page();
  return `${$$result.head += `${$$result.title = `<title>${escape(title)}</title>`, ""}<meta name="${"keywords"}" content="${"secure, business security, security, Store passwords app, Store passwords in chrome, Store passwords on iphone, mobile app, app, android app, ios app"}" data-svelte="svelte-1vf07oe"><meta name="${"description"}"${add_attribute("content", description, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:image"}" content="${""}" data-svelte="svelte-1vf07oe"><meta property="${"og:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:title"}"${add_attribute("content", title, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:type"}"${add_attribute("content", type, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:url"}"${add_attribute("content", url, 0)} data-svelte="svelte-1vf07oe">`, ""}`;
});
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  $$unsubscribe_session();
  return `${validate_component(Open_graph, "OpenGraph").$$render($$result, {
    description: "Digital Business Keys secures your businesses critical digital business assets to ensure your business is always online.",
    title: "Digital Business Keys - Store. Manage. Monitor",
    type: "website"
  }, {}, {})}

<div class="${"pt-0 md:pt-5 lg:pt-24"}"><div class="${"container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center"}">
    <div class="${"flex flex-col md:w-1/2 justify-center px-4 items-start text-center md:text-left"}"><h1 class="${"my-4 text-5xl font-bold leading-tight"}">Store. Manage. Monitor.<br>
        Your critical Digital Business Assets
      </h1>
      <p class="${"leading-normal text-xl mb-8 text-indigo-300"}">Manage and secure your business&#39;s digital business assets and monitor
        your essential business services such as email and website in the
        simple-to-use Digital Business Keys app.
      </p>

      ${$session.user ? `${validate_component(Button, "Button").$$render($$result, { text: "Dashboard", href: "dashboard" }, {}, {})}` : `<div class="${"lg:flex-initial justify-center lg:items-start md:items-start text-center md:text-left"}">${validate_component(Button, "Button").$$render($$result, { text: "Try Free!", href: "signup" }, {}, {})}

          ${validate_component(Button, "Button").$$render($$result, { text: "Sign In", href: "login" }, {}, {})}</div>`}</div>
    
    <div class="${"w-full md:w-1/2 py-6 text-center"}"><img class="${"w-full z-50 rounded-md"}" src="${"/images/feature-image2.webp"}" alt="${"people building app"}"></div></div>
  <section class="${"container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center"}">${validate_component(Featured_section, "FeaturedSection").$$render($$result, {}, {}, {})}
    ${validate_component(Features$1, "Features").$$render($$result, {}, {}, {})}
    ${validate_component(Pricing$1, "Pricing").$$render($$result, {}, {}, {})}
    ${validate_component(Call_to_action, "CallToAction").$$render($$result, {}, {}, {})}
    ${validate_component(Signup, "Signup").$$render($$result, {}, {}, {})}</section></div>`;
});
var index$d = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
const Terms_of_service = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$c = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Terms_of_service
});
var index_svelte_svelte_type_style_lang$2 = "";
const css$2 = {
  code: "h1.svelte-czkh7d,h2.svelte-czkh7d{padding-bottom:1.25rem}p.svelte-czkh7d{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n  // export const prerender = true;\\n  // export const hydrate = true;\\n  // export const router = true;\\n<\/script>\\n\\n<section>\\n  <h1>Privacy Policy</h1>\\n\\n  <h2>\\n    In this Privacy Policy \u201CServices\u201D indicates the Service and products offered\\n    and provided by Digital Business Keys across desktop, mobile, tablet and\\n    apps (including any subdomains)\\n  </h2>\\n\\n  <h2>Information we collect about you</h2>\\n  <p>\\n    We collect information about you when you input it into the Services or\\n    otherwise provide it to us and when other sources provide it to us including\\n    but not limited to when you register for an account, create or modify your\\n    profile, sign-up for or make purchases through the Services. Information you\\n    provide to us may be including, but is not limited to your name, address,\\n    phone number, email, gender, occupation, business interests and any other\\n    information provided. We keep track of your preferences when you select\\n    settings within the Services. We collect information about you when you use\\n    our Services, including browsing our websites and taking certain actions\\n    within the Services.\\n  </p>\\n\\n  <h2>How we use information we collect</h2>\\n\\n  <p>\\n    We use the personal information we have collected largely for the purpose of\\n    providing you with products and services that you have requested by\\n    registering an account and agreeing to the Services Terms and Conditions to\\n    create and maintain your account and ensure you comply and adhere to our\\n    terms of use. We are always improving our Services. We use information\\n    identified from usage of the service and feedback to troubleshoot, identify\\n    trends and usage and improve our Services as well as to develop new\\n    products, features and technologies that benefit our users. We send you\\n    email notifications when you interact with the Services. We use your contact\\n    information to send transactional communications via email and within the\\n    Services, including confirming your purchases, reminding you of subscription\\n    expirations,updates, security alerts, and administrative messages. We use\\n    your contact information and information about how you use the Services to\\n    send promotional communications that may be of specific interest to you,\\n    including by email with the ability to opt out of the promotional\\n    communications easily accessible.\\n  </p>\\n\\n  <h2>Security</h2>\\n  <p>\\n    We strive to ensure the security, integrity and privacy of personal\\n    information we collect. We use reasonable security measures to protect your\\n    personal information from unauthorised access, modification and disclosure.\\n    Our employees, contractors, agents and service providers who provide\\n    services related to our information systems, are obliged by law to respect\\n    the confidentiality of any personal information held by us. We review and\\n    update our security measures in light of current technologies.\\n    Unfortunately, no data transmission over the internet can be guaranteed to\\n    be totally secure.\\n  </p>\\n\\n  <h2>Access to your Information</h2>\\n\\n  <p>\\n    If, at any time, you discover that information held about you is incorrect\\n    or you would like to review and confirm the accuracy of your personal\\n    information, you can contact us. Our Services give you the ability to access\\n    and update certain information about you from within the Service. You can\\n    also gain access to the personal information we hold about you, subject to\\n    certain exceptions provided for by law. To request access to your personal\\n    information, please contact us.\\n  </p>\\n\\n  <h2>Changes to our Privacy Policy</h2>\\n\\n  <p>\\n    Amendments to this policy will be posted on this page and will be effective\\n    when posted, if the changes are significant, we will provide a more\\n    prominent notice.\\n  </p>\\n</section>\\n\\n<style lang=\\"postcss\\">h1,h2{padding-bottom:1.25rem}p{padding-bottom:2.5rem}</style>\\n"],"names":[],"mappings":"AAoFsB,gBAAE,CAAC,gBAAE,CAAC,eAAe,OAAO,CAAC,eAAC,CAAC,eAAe,MAAM,CAAC"}'
};
const Privacy_policy = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<section><h1 class="${"svelte-czkh7d"}">Privacy Policy</h1>

  <h2 class="${"svelte-czkh7d"}">In this Privacy Policy \u201CServices\u201D indicates the Service and products offered
    and provided by Digital Business Keys across desktop, mobile, tablet and
    apps (including any subdomains)
  </h2>

  <h2 class="${"svelte-czkh7d"}">Information we collect about you</h2>
  <p class="${"svelte-czkh7d"}">We collect information about you when you input it into the Services or
    otherwise provide it to us and when other sources provide it to us including
    but not limited to when you register for an account, create or modify your
    profile, sign-up for or make purchases through the Services. Information you
    provide to us may be including, but is not limited to your name, address,
    phone number, email, gender, occupation, business interests and any other
    information provided. We keep track of your preferences when you select
    settings within the Services. We collect information about you when you use
    our Services, including browsing our websites and taking certain actions
    within the Services.
  </p>

  <h2 class="${"svelte-czkh7d"}">How we use information we collect</h2>

  <p class="${"svelte-czkh7d"}">We use the personal information we have collected largely for the purpose of
    providing you with products and services that you have requested by
    registering an account and agreeing to the Services Terms and Conditions to
    create and maintain your account and ensure you comply and adhere to our
    terms of use. We are always improving our Services. We use information
    identified from usage of the service and feedback to troubleshoot, identify
    trends and usage and improve our Services as well as to develop new
    products, features and technologies that benefit our users. We send you
    email notifications when you interact with the Services. We use your contact
    information to send transactional communications via email and within the
    Services, including confirming your purchases, reminding you of subscription
    expirations,updates, security alerts, and administrative messages. We use
    your contact information and information about how you use the Services to
    send promotional communications that may be of specific interest to you,
    including by email with the ability to opt out of the promotional
    communications easily accessible.
  </p>

  <h2 class="${"svelte-czkh7d"}">Security</h2>
  <p class="${"svelte-czkh7d"}">We strive to ensure the security, integrity and privacy of personal
    information we collect. We use reasonable security measures to protect your
    personal information from unauthorised access, modification and disclosure.
    Our employees, contractors, agents and service providers who provide
    services related to our information systems, are obliged by law to respect
    the confidentiality of any personal information held by us. We review and
    update our security measures in light of current technologies.
    Unfortunately, no data transmission over the internet can be guaranteed to
    be totally secure.
  </p>

  <h2 class="${"svelte-czkh7d"}">Access to your Information</h2>

  <p class="${"svelte-czkh7d"}">If, at any time, you discover that information held about you is incorrect
    or you would like to review and confirm the accuracy of your personal
    information, you can contact us. Our Services give you the ability to access
    and update certain information about you from within the Service. You can
    also gain access to the personal information we hold about you, subject to
    certain exceptions provided for by law. To request access to your personal
    information, please contact us.
  </p>

  <h2 class="${"svelte-czkh7d"}">Changes to our Privacy Policy</h2>

  <p class="${"svelte-czkh7d"}">Amendments to this policy will be posted on this page and will be effective
    when posted, if the changes are significant, we will provide a more
    prominent notice.
  </p>
</section>`;
});
var index$b = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Privacy_policy
});
const Changelog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$a = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Changelog
});
const User_asset_card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<div><h1 class="${"text-2xl font-medium text-white"}">Your Digital Assets</h1>

  <div class="${"bg-white .border rounded-md text-black"}">${escape(user.username)}</div></div>`;
});
function load$4({ session: session2 }) {
  const { user } = session2;
  console.log("Session Dashboard:", session2);
  if (!user) {
    return { status: 302, redirect: "/login" };
  }
  return { props: { user } };
}
const Dashboard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `
<div><div x-data="${""}"><div class="${"flex h-screen bg-gray-800 font-roboto"}"><div class="${"fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden"}"></div>

      <div class="${"fixed z-30 inset-y-0 left-0 w-60 transition duration-300 transform bg-gray-900 overflow-y-auto lg:translate-x-0 lg:static lg:inset-0"}"><div class="${"flex items-center justify-center mt-8"}"><div class="${"flex items-center"}"><span class="${"text-white text-2xl font-semibold"}">Dashboard</span></div></div>

        <nav class="${"flex flex-col mt-10 px-4 text-center"}"><a href="${"#"}" class="${"py-2 text-sm text-gray-100 bg-gray-800 rounded"}">Overview</a>
          <a href="${"#"}" class="${"mt-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded"}">Settings</a></nav></div>

      <div class="${"flex-1 flex flex-col overflow-hidden"}"><header class="${"flex justify-between items-center p-6"}"><div class="${"flex items-center space-x-4 lg:space-x-0"}"><button class="${"text-gray-300 focus:outline-none lg:hidden"}"><svg class="${"h-6 w-6"}" viewBox="${"0 0 24 24"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M4 6H20M4 12H20M4 18H11"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path></svg></button>

            <div><h1 class="${"text-2xl font-medium text-white"}">Welcome ${escape(user.username)}</h1></div></div></header>

        <main class="${"flex-1 overflow-x-hidden overflow-y-auto"}"><div class="${"container mx-auto px-6 py-8"}"><div class="${"grid place-items-center h-96 text-gray-300 text-xl border-4 border-gray-300 border-dashed"}">${validate_component(User_asset_card, "UserAssetCard").$$render($$result, { user }, {}, {})}</div></div></main></div></div></div></div>

`;
});
var index$9 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Dashboard,
  load: load$4
});
const Features = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$8 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Features
});
function submit() {
}
const Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"text-white-500 body-font relative"}"><div class="${"container px-5 py-5 mx-auto"}"><div class="${"flex flex-col text-center w-full mb-12"}"><h1 class="${"sm:text-3xl text-2xl font-medium title-font mb-4"}">Contact Us
      </h1>
      <p class="${"lg:w-2/3 mx-auto leading-relaxed text-base text-indigo-300"}">Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical
        gentrify.
      </p></div>
    <div class="${"lg:w-1/2 md:w-2/3 mx-auto"}"><div class="${"flex flex-wrap -m-2"}"><div class="${"p-2 w-1/2"}"><div class="${"relative"}" data-children-count="${"1"}"><label for="${"name"}" class="${"leading-7 text-sm text-gray-50"}">Name *</label>
            <input type="${"text"}" id="${"name"}" name="${"name"}" class="${"w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-6"}"></div></div>
        <div class="${"p-2 w-1/2"}"><div class="${"relative"}" data-children-count="${"1"}"><label for="${"email"}" class="${"leading-7 text-sm text-gray-50"}">Email *</label>
            <input type="${"email"}" id="${"email"}" name="${"email"}" class="${"w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-7"}"></div></div>
        <div class="${"p-2 w-full"}"><div class="${"relative"}" data-children-count="${"1"}"><label for="${"email"}" class="${"leading-7 text-sm text-gray-50"}">Business Website Url *</label>
            <input type="${"email"}" id="${"email"}" name="${"email"}" class="${"w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-7"}"></div></div>
        <div class="${"p-2 w-full"}"><div class="${"relative"}" data-children-count="${"1"}"><label for="${"message"}" class="${"leading-7 text-sm text-gray-50"}">Message</label>
            <textarea id="${"message"}" name="${"message"}" class="${"w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"}"></textarea></div></div>
        <div class="${"p-2 w-full"}">${validate_component(Button, "Button").$$render($$result, { clickEvent: submit, href: "/" }, {}, { default: () => `Submit` })}</div>
        <div class="${"p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center"}"><a class="${"text-indigo-300 pb-4"}" href="${"mailto:digitalbusinesskeys@gmail.com&subject=Contact%20Form"}">Email Us</a><br>

          <span class="${"inline-flex pt-4"}"><a class="${"text-gray-500"}" href="${"https://www.facebook.com"}"><svg fill="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"}"></path></svg></a>
            <a class="${"ml-4 text-gray-500"}" href="${"https://www.twitter.com"}"><svg fill="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"}"></path></svg></a></span></div></div></div></div></section>`;
});
var index$7 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact
});
const Pricing = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$6 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Pricing
});
function load$3({ session: session2 }) {
  const { user } = session2;
  console.log(user);
  if (!user) {
    return { status: 302, redirect: "/login" };
  }
  return { props: { user } };
}
const Logout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => value);
  $$unsubscribe_session();
  return ``;
});
var index$5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Logout,
  load: load$3
});
const Signup_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Signup, "Signup").$$render($$result, {}, {}, {})}`;
});
var index$4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signup_1
});
var index_svelte_svelte_type_style_lang$1 = "";
const css$1 = {
  code: "h1.svelte-jot2no{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1.svelte-jot2no,h2.svelte-jot2no{font-size:1.25rem;line-height:1.75rem;padding-bottom:1.25rem}p.svelte-jot2no{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\t// export const prerender = true;\\n<\/script>\\n\\n<style lang=\\"postcss\\">h1{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1,h2{font-size:1.25rem;line-height:1.75rem;padding-bottom:1.25rem}p{padding-bottom:2.5rem}</style>\\n\\n\\n<div class=\\"px-8 py-16 mx-auto max-w-5xl\\">\\n\\t<h1>About Us</h1>\\n\\n\\t<p>\\n\\t\\tDigital business keys is a critical app developed to empower businesses\\n\\t\\tto take control of their digital business assets and respond to issues\\n\\t\\tthat can commonly impact website availability, email receiving and\\n\\t\\tsending and digital project assets. Digital Business Keys app provides a\\n\\t\\tservice that has long been neglect by business owners and the industries\\n\\t\\tthat assist them in taking their businesses online Designed to be as\\n\\t\\tsimple as possible to allow any level of user to get the critical\\n\\t\\tcontrol they need for the digital presence of their business.\\n\\t</p>\\n\\n\\t<h2>Our Story</h2>\\n\\n\\t<p>\\n\\t\\tOur team has extensive industry experience in developing and\\n\\t\\timplementing custom and out of the box solutions. We thrive in\\n\\t\\tenvironments that enable us to deliver the best results for our clients.\\n\\t\\tFrom this fundamental work ethic grew the idea for the Digital Business\\n\\t\\tKeys app as a tool to plug the gap we saw develop in the industry in\\n\\t\\tcustomer education, knowledge and tools to provide confidence in\\n\\t\\tmanagement of these business critical digital assets.\\n\\t</p>\\n</div>\\n"],"names":[],"mappings":"AAIsB,gBAAE,CAAC,kBAAkB,CAAC,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,gBAAE,CAAC,gBAAE,CAAC,UAAU,OAAO,CAAC,YAAY,OAAO,CAAC,eAAe,OAAO,CAAC,eAAC,CAAC,eAAe,MAAM,CAAC"}'
};
const About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<div class="${"px-8 py-16 mx-auto max-w-5xl"}"><h1 class="${"svelte-jot2no"}">About Us</h1>

	<p class="${"svelte-jot2no"}">Digital business keys is a critical app developed to empower businesses
		to take control of their digital business assets and respond to issues
		that can commonly impact website availability, email receiving and
		sending and digital project assets. Digital Business Keys app provides a
		service that has long been neglect by business owners and the industries
		that assist them in taking their businesses online Designed to be as
		simple as possible to allow any level of user to get the critical
		control they need for the digital presence of their business.
	</p>

	<h2 class="${"svelte-jot2no"}">Our Story</h2>

	<p class="${"svelte-jot2no"}">Our team has extensive industry experience in developing and
		implementing custom and out of the box solutions. We thrive in
		environments that enable us to deliver the best results for our clients.
		From this fundamental work ethic grew the idea for the Digital Business
		Keys app as a tool to plug the gap we saw develop in the industry in
		customer education, knowledge and tools to provide confidence in
		management of these business critical digital assets.
	</p></div>`;
});
var index$3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About
});
async function load$2({ session: session2 }) {
  if (session2.jwt) {
    return { status: 302, redirect: "/" };
  }
  return {};
}
const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => value);
  let email = "";
  let password = "";
  $$unsubscribe_session();
  return `${`<section><div class="${"container px-5 py-5 mx-auto"}"><div class="${"flex flex-col text-center w-full mb-12"}"><form method="${"post"}"><div class="${"p-2"}"><div class="${"container mx-auto max-w-xs"}" data-children-count="${"1"}"><label for="${"email"}" class="${"leading-7 text-sm text-gray-50"}">Email *</label>
              <input type="${"text"}" id="${"email"}" name="${"email"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-6"}"${add_attribute("value", email, 0)}></div></div>
          <div class="${"p-2"}"><div class="${"container mx-auto max-w-xs"}" data-children-count="${"1"}"><label for="${"password"}" class="${"leading-7 text-sm text-gray-50"}">Password *</label>
              <input type="${"password"}" id="${"password"}" name="${"password"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-7"}"${add_attribute("value", password, 0)}></div>

            <div class="${"p-2 w-full"}"><button type="${"submit"}" class="${"flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"}">Login</button></div></div></form></div></div></section>`}`;
});
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Login,
  load: load$2
});
const Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Blog
});
const GET_DOCS = `
  {
    documentations {
      id
      title
      Slug
      content
    }
  }
`;
var index_svelte_svelte_type_style_lang = "";
const css = {
  code: 'ul.svelte-vq01y7{line-height:1.5;margin:0 0 1em}h2.svelte-vq01y7:before{content:" ";display:block;height:185px;margin-top:-185px;pointer-events:none;visibility:hidden}',
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\t// export const prerender = true;\\n\\n  import { GRAPHQL_URI } from \\"../../lib/config\\";\\n  import { GET_DOCS } from \\"../../lib/graphql/requests\\";\\n  console.log(GRAPHQL_URI);\\n\\n  /**\\n   * @type {import(\'@sveltejs/kit\').Load}\\n   */\\n  export async function load() {\\n    let items;\\n    try {\\n      const res = await fetch(`${GRAPHQL_URI}`, {\\n        method: \\"POST\\",\\n        headers: {\\n          \\"Content-Type\\": \\"application/json\\",\\n        },\\n        body: JSON.stringify({ query: GET_DOCS }),\\n      });\\n\\n      items = await res.json();\\n      items = items.data.documentations;\\n      console.log(items.data.documentations)\\n    } catch (e) {\\n      console.log(e.message);\\n    }\\n\\n    return {\\n      props: {\\n        items,\\n      },\\n    };\\n  }\\n\\n  let promise = load();\\n<\/script>\\n\\n<script>\\n  import snarkdown from \\"snarkdown\\";\\n  import OpenGraph from \\"$lib/components/open-graph.svelte\\";\\n\\n  export let items;\\n\\n  function phoneNav() {\\n    var item = document.getElementById(\\"p-nav\\");\\n\\n    item.classList.toggle(\\"hidden\\");\\n  }\\n<\/script>\\n\\n<OpenGraph\\n  description=\\"Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more\\"\\n  title=\\"Digital Business Keys - Documentation\\"\\n  type=\\"website\\"\\n/>\\n\\n{#await promise}\\n\\n  <p>...loading</p>\\n{:then data}\\n  <div class=\\"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl\\">\\n    <div\\n      id=\\"p-nav\\"\\n      class=\\"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600\\"\\n    >\\n      <div class=\\"md:relative mx-auto lg:float-right lg:px-6\\">\\n        <ul\\n          class=\\"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20\\"\\n        >\\n          {#each items as doc}\\n            <div\\n              class=\\"lg:flex-none flex w-full md:max-w-xs bg-purple text-black\\"\\n            >\\n              <li class=\\"text-black pb-2\\">\\n                <p class=\\"hover:bg-indigo-500 text-black\\">\\n                  <a\\n                    on:click={phoneNav}\\n                    class=\\"text-black\\"\\n                    rel=\\"prefetch\\"\\n                    href=\\"docs#{doc.Slug}\\">{doc.title}</a\\n                  >\\n                </p>\\n              </li>\\n            </div>\\n          {/each}\\n        </ul>\\n      </div>\\n    </div>\\n\\n    <div class=\\"w-full md:w-4/5\\">\\n      <h1\\n        class=\\"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 \\"\\n      >\\n        Documentation\\n      </h1>\\n      <div class=\\"container pt-12 px-6\\">\\n        {#each items as doc}\\n          <div id={doc.Slug} class=\\"mb-12 overflow-auto\\n                    \\">\\n            <h2 class=\\"pb-10\\">{doc.title}</h2>\\n\\n            <article class=\\"prose prose-indigo lg:prose-xl\\">\\n              {@html snarkdown(doc.content)}\\n            </article>\\n          </div>\\n        {/each}\\n      </div>\\n    </div>\\n    <button\\n      on:click={phoneNav}\\n      class=\\"fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden\\"\\n    >\\n      <svg\\n        width=\\"24\\"\\n        height=\\"24\\"\\n        fill=\\"none\\"\\n        class=\\"absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform\\"\\n        ><path\\n          d=\\"M4 8h16M4 16h16\\"\\n          stroke=\\"currentColor\\"\\n          stroke-width=\\"2\\"\\n          stroke-linecap=\\"round\\"\\n          stroke-linejoin=\\"round\\"\\n        /></svg\\n      >\\n    </button>\\n\\n  </div>\\n{/await}\\n\\n<style>ul{line-height:1.5;margin:0 0 1em}h2:before{content:\\" \\";display:block;height:185px;margin-top:-185px;pointer-events:none;visibility:hidden}</style>\\n"],"names":[],"mappings":"AAmIO,gBAAE,CAAC,YAAY,GAAG,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,gBAAE,OAAO,CAAC,QAAQ,GAAG,CAAC,QAAQ,KAAK,CAAC,OAAO,KAAK,CAAC,WAAW,MAAM,CAAC,eAAe,IAAI,CAAC,WAAW,MAAM,CAAC"}'
};
console.log(GRAPHQL_URI);
async function load$1() {
  let items;
  try {
    const res = await fetch(`${GRAPHQL_URI}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_DOCS })
    });
    items = await res.json();
    items = items.data.documentations;
    console.log(items.data.documentations);
  } catch (e) {
    console.log(e.message);
  }
  return { props: { items } };
}
let promise = load$1();
const Docs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { items } = $$props;
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  $$result.css.add(css);
  return `${validate_component(Open_graph, "OpenGraph").$$render($$result, {
    description: "Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more",
    title: "Digital Business Keys - Documentation",
    type: "website"
  }, {}, {})}

${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return `

  <p>...loading</p>
`;
    }
    return function(data) {
      return `
  <div class="${"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl"}"><div id="${"p-nav"}" class="${"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600"}"><div class="${"md:relative mx-auto lg:float-right lg:px-6"}"><ul class="${"m-2 p-6 bg-gray-200 rounded max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20 svelte-vq01y7"}">${each(items, (doc) => `<div class="${"lg:flex-none flex w-full md:max-w-xs bg-purple text-black"}"><li class="${"text-black pb-2"}"><p class="${"hover:bg-indigo-500 text-black"}"><a class="${"text-black"}" rel="${"prefetch"}" href="${"docs#" + escape(doc.Slug)}">${escape(doc.title)}</a>
                </p></li>
            </div>`)}</ul></div></div>

    <div class="${"w-full md:w-4/5"}"><h1 class="${"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 "}">Documentation
      </h1>
      <div class="${"container pt-12 px-6"}">${each(items, (doc) => `<div${add_attribute("id", doc.Slug, 0)} class="${"mb-12 overflow-auto "}"><h2 class="${"pb-10 svelte-vq01y7"}">${escape(doc.title)}</h2>

            <article class="${"prose prose-indigo lg:prose-xl"}"><!-- HTML_TAG_START -->${snarkdown(doc.content)}<!-- HTML_TAG_END --></article>
          </div>`)}</div></div>
    <button class="${"fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden"}"><svg width="${"24"}" height="${"24"}" fill="${"none"}" class="${"absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform"}"><path d="${"M4 8h16M4 16h16"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path></svg></button></div>
`;
    }();
  }(promise)}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Docs,
  load: load$1
});
const prerender = true;
async function load({ page: page2, fetch: fetch2 }) {
  const res = await fetch2(`${GRAPHQL_URI}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GET_DOCS })
  });
  const items = await res.json();
  if (items) {
    const pagename = page2.path;
    console.log(items.data);
    items.data.documentations = items.data.documentations.filter((doc) => pagename.includes(doc.Slug));
    return { pagedata: items.data.documentations[0] };
  }
}
const U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pagedata } = $$props;
  if ($$props.pagedata === void 0 && $$bindings.pagedata && pagedata !== void 0)
    $$bindings.pagedata(pagedata);
  return `${validate_component(Open_graph, "OpenGraph").$$render($$result, {
    description: "Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more",
    title: "Digital Business Keys - " + pagedata.title,
    type: "website"
  }, {}, {})}

<a class="${"mt-3 pb-12 text-indigo-300 inline-flex items-center"}" href="${"/docs"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-4 h-4 ml-2"}" viewBox="${"0 0 24 24"}"><path d="${"M5 13h14M12 6l-7 7l7 6"}"></path></svg>
  Go Back</a>

<h1 class="${"sm:text-3xl text-2xl font-medium title-font text-gray-50"}">${escape(pagedata.title)}</h1>

<div><!-- HTML_TAG_START -->${snarkdown(pagedata.content)}<!-- HTML_TAG_END --></div>`;
});
var _slug_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bslugu5D,
  prerender,
  load
});
export { init, render };
