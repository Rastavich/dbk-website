var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
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
const subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
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
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return {set, update, subscribe: subscribe2};
}
const s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  branch,
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
  if (branch) {
    branch.forEach(({node, loaded, fetched, uses_credentials}) => {
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
      components: branch.map(({node}) => node.module.default)
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
    rendered = {head: "", html: "", css: ""};
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 ? `<style amp-custom>${Array.from(styles).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"></script>`;
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
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${branch.map(({node}) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2.path)},
						query: new URLSearchParams(${s$1(page2.query.toString())}),
						params: ${s$1(page2.params)}
					}
				}` : "null"}
			});
		</script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({url, json}) => `<script type="svelte-data" url="${url}">${json}</script>`).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
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
    body: options2.template({head, body})
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const {name, message, stack} = error2;
    serialized = try_serialize({name, message, stack});
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  if (loaded.error) {
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    const status = loaded.status;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return {status: 500, error: error2};
    }
    return {status, error: error2};
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
  return loaded;
}
function resolve(base2, path) {
  const baseparts = path[0] === "/" ? [] : base2.slice(1).split("/");
  const pathparts = path[0] === "/" ? path.slice(1).split("/") : path.split("/");
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
  return `/${baseparts.join("/")}`;
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
  context,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const {module} = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module.load) {
    const load_input = {
      page: page2,
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
        if (options2.read && url.startsWith(options2.paths.assets)) {
          url = url.replace(options2.paths.assets, "");
        }
        if (url.startsWith("//")) {
          throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
        }
        let response;
        if (/^[a-zA-Z]+:/.test(url)) {
          response = await fetch(url, opts);
        } else {
          const [path, search] = url.split("?");
          const resolved = resolve(request.path, path);
          const filename = resolved.slice(1);
          const filename_html = `${filename}/index.html`;
          const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
          if (asset) {
            if (options2.read) {
              response = new Response(options2.read(asset.file), {
                headers: {
                  "content-type": asset.type
                }
              });
            } else {
              response = await fetch(`http://${page2.host}/${asset.file}`, opts);
            }
          }
          if (!response) {
            const headers = {...opts.headers};
            if (opts.credentials !== "omit") {
              uses_credentials = true;
              headers.cookie = request.headers.cookie;
              if (!headers.authorization) {
                headers.authorization = request.headers.authorization;
              }
            }
            const rendered = await respond$2({
              host: request.host,
              method: opts.method || "GET",
              headers,
              path: resolved,
              rawBody: opts.body,
              query: new URLSearchParams(search)
            }, options2, {
              fetched: url,
              initiator: route
            });
            if (rendered) {
              if (state.prerender) {
                state.prerender.dependencies.set(resolved, rendered);
              }
              response = new Response(rendered.body, {
                status: rendered.status,
                headers: rendered.headers
              });
            }
          }
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                fetched.push({
                  url,
                  json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
                });
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
      context: {...context}
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
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
const escaped$2 = {
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
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
async function respond_with_error({request, options: options2, state, $session, status, error: error2}) {
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
    context: {},
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
      context: loaded.context,
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
  } catch (error3) {
    options2.handle_error(error3);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
async function respond$1({request, options: options2, state, $session, route}) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (error3) {
    options2.handle_error(error3);
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
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error2;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page: page2,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({status, error: error2} = loaded.loaded);
            }
          } catch (e2) {
            options2.handle_error(e2);
            status = 500;
            error2 = e2;
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page: page2,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (e2) {
                  options2.handle_error(e2);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error2,
      branch: branch && branch.filter(Boolean),
      page: page2
    });
  } catch (error3) {
    options2.handle_error(error3);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession({context: request.context});
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
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
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler({...request, params});
    if (response) {
      if (typeof response !== "object") {
        return {
          status: 500,
          body: `Invalid response from route ${request.path}; 
						 expected an object, got ${typeof response}`,
          headers: {}
        };
      }
      let {status = 200, body, headers = {}} = response;
      headers = lowercase_keys(headers);
      if (typeof body === "object" && !("content-type" in headers) || headers["content-type"] === "application/json") {
        headers = {...headers, "content-type": "application/json"};
        body = JSON.stringify(body);
      }
      return {status, body, headers};
    }
  }
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    _map.set(this, void 0);
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
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield key;
      }
    }
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value;
      }
    }
  }
}
_map = new WeakMap();
function parse_body(req) {
  const raw = req.rawBody;
  if (!raw)
    return raw;
  const [type, ...directives] = req.headers["content-type"].split(/;\s*/);
  if (typeof raw === "string") {
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const {data, append} = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const {data, append} = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond$2(incoming, options2, state = {}) {
  if (incoming.path.endsWith("/") && incoming.path !== "/") {
    const q = incoming.query.toString();
    return {
      status: 301,
      headers: {
        location: encodeURI(incoming.path.slice(0, -1) + (q ? `?${q}` : ""))
      }
    };
  }
  const incoming_with_body = {
    ...incoming,
    body: parse_body(incoming)
  };
  const context = await options2.hooks.getContext(incoming_with_body) || {};
  try {
    return await options2.hooks.handle({
      request: {
        ...incoming_with_body,
        params: null,
        context
      },
      render: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession({context}),
            page_config: {ssr: false, router: true, hydrate: true},
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (e2) {
    options2.handle_error(e2);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e2.stack : e2.message
    };
  }
}
function hash(str) {
  let hash2 = 5381, i = str.length;
  while (i)
    hash2 = hash2 * 33 ^ str.charCodeAt(--i);
  return (hash2 >>> 0).toString(36);
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
function set_store_value(store, ret, value = ret) {
  store.set(value);
  return ret;
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
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext$1(key) {
  return get_current_component().$$.context.get(key);
}
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
  function $$render(result, props, bindings, slots) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({$$});
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, options2 = {}) => {
      on_destroy = [];
      const result = {title: "", head: "", css: new Set()};
      const html = $$render(result, props, {}, options2);
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
var root_svelte_svelte_type_style_lang = "#svelte-announcer.svelte-1y31lbn{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}";
const css$6 = {
  code: "#svelte-announcer.svelte-1y31lbn{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n</script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\tNavigated to {title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}</style>"],"names":[],"mappings":"AAqDO,gCAAiB,CAAC,SAAS,QAAQ,CAAC,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,SAAS,MAAM,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC,OAAO,GAAG,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {stores} = $$props;
  let {page: page2} = $$props;
  let {components} = $$props;
  let {props_0 = null} = $$props;
  let {props_1 = null} = $$props;
  let {props_2 = null} = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  let mounted = false;
  let navigated = false;
  let title = null;
  onMount(() => {
    const unsubscribe = stores.page.subscribe(() => {
      if (mounted) {
        navigated = true;
        title = document.title || "untitled page";
      }
    });
    mounted = true;
    return unsubscribe;
  });
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

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1y31lbn"}">${navigated ? `Navigated to ${escape(title)}` : ``}</div>` : ``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var parse_1 = parse;
var decode = decodeURIComponent;
var pairSplitRegExp = /; */;
function parse(str, options2) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  var obj = {};
  var opt = options2 || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf("=");
    if (eq_idx < 0) {
      continue;
    }
    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();
    if (val[0] == '"') {
      val = val.slice(1, -1);
    }
    if (obj[key] == void 0) {
      obj[key] = tryDecode(val, dec);
    }
  }
  return obj;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch (e2) {
    return str;
  }
}
async function getContext({headers}) {
  const cookies = parse_1(headers.cookie || "");
  const jwt = cookies.jwt && Buffer.from(cookies.jwt, "base64").toString("utf-8");
  return {
    user: jwt ? JSON.parse(jwt) : null
  };
}
function getSession({context}) {
  return {
    user: context.user && {
      username: context.user.username,
      email: context.user.email
    }
  };
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  getContext,
  getSession
});
const template = ({head, body}) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.ico" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
let options = null;
function init(settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-70cfb8c8.js",
      css: ["/./_app/assets/start-b97461fb.css"],
      js: ["/./_app/start-70cfb8c8.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/singletons-6b53f818.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2) => {
      console.error(error2.stack);
      error2.stack = options.get_stack(error2);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    router: true,
    ssr: true,
    target: "#svelte",
    template
  };
}
const d = decodeURIComponent;
const empty = () => ({});
const manifest = {
  assets: [{file: "favicon.ico", size: 1150, type: "image/vnd.microsoft.icon"}, {file: "images/app-image.webp", size: 74688, type: "image/webp"}, {file: "images/feature-image2.webp", size: 65954, type: "image/webp"}, {file: "logo-192.png", size: 4760, type: "image/png"}, {file: "logo-512.png", size: 13928, type: "image/png"}, {file: "logo.webp", size: 7916, type: "image/webp"}, {file: "logo_light.webp", size: 5204, type: "image/webp"}, {file: "robots.txt", size: 103, type: "text/plain"}],
  layout: "src/routes/$layout.svelte",
  error: "src/routes/$error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/terms-of-service\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/terms-of-service/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/privacy-policy\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/privacy-policy/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/changelog\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/changelog/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/dashboard/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/features\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/features/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/contact/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/pricing\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/pricing/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/logout\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/logout/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/signup\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/signup/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/about/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/login\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/login/index.svelte"],
      b: ["src/routes/$error.svelte"]
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
      a: ["src/routes/$layout.svelte", "src/routes/blog/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/docs\/?$/,
      params: empty,
      a: ["src/routes/$layout.svelte", "src/routes/docs/index.svelte"],
      b: ["src/routes/$error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/docs\/([^/]+?)\/?$/,
      params: (m) => ({slug: d(m[1])}),
      a: ["src/routes/$layout.svelte", "src/routes/docs/[slug].svelte"],
      b: ["src/routes/$error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getContext: hooks.getContext || (() => ({})),
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({request, render: render2}) => render2(request))
});
const module_lookup = {
  "src/routes/$layout.svelte": () => Promise.resolve().then(function() {
    return $layout$1;
  }),
  "src/routes/$error.svelte": () => Promise.resolve().then(function() {
    return $error$1;
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
const metadata_lookup = {"src/routes/$layout.svelte": {entry: "/./_app/pages/$layout.svelte-6fe35785.js", css: ["/./_app/assets/header.svelte_svelte&type=style&lang-7f83142b.css"], js: ["/./_app/pages/$layout.svelte-6fe35785.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/stores-94e58e4f.js", "/./_app/chunks/button-abdd0101.js"], styles: null}, "src/routes/$error.svelte": {entry: "/./_app/pages/$error.svelte-26ec6ffc.js", css: ["/./_app/assets/pages/$error.svelte-33a184c4.css", "/./_app/assets/header.svelte_svelte&type=style&lang-7f83142b.css"], js: ["/./_app/pages/$error.svelte-26ec6ffc.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/index.svelte": {entry: "/./_app/pages/index.svelte-be613332.js", css: ["/./_app/assets/pages/index.svelte-d869b5b8.css"], js: ["/./_app/pages/index.svelte-be613332.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/signup-b8706f1a.js", "/./_app/chunks/button-abdd0101.js", "/./_app/chunks/open-graph-1088df74.js", "/./_app/chunks/stores-94e58e4f.js"], styles: null}, "src/routes/terms-of-service/index.svelte": {entry: "/./_app/pages/terms-of-service/index.svelte-391d0689.js", css: [], js: ["/./_app/pages/terms-of-service/index.svelte-391d0689.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/privacy-policy/index.svelte": {entry: "/./_app/pages/privacy-policy/index.svelte-c0759183.js", css: ["/./_app/assets/pages/privacy-policy/index.svelte-52f8d936.css"], js: ["/./_app/pages/privacy-policy/index.svelte-c0759183.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/changelog/index.svelte": {entry: "/./_app/pages/changelog/index.svelte-38c1b8a4.js", css: [], js: ["/./_app/pages/changelog/index.svelte-38c1b8a4.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/dashboard/index.svelte": {entry: "/./_app/pages/dashboard/index.svelte-cd0c580d.js", css: [], js: ["/./_app/pages/dashboard/index.svelte-cd0c580d.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/features/index.svelte": {entry: "/./_app/pages/features/index.svelte-b23421a1.js", css: [], js: ["/./_app/pages/features/index.svelte-b23421a1.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/contact/index.svelte": {entry: "/./_app/pages/contact/index.svelte-d3132e29.js", css: [], js: ["/./_app/pages/contact/index.svelte-d3132e29.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/button-abdd0101.js"], styles: null}, "src/routes/pricing/index.svelte": {entry: "/./_app/pages/pricing/index.svelte-ff21cbc4.js", css: [], js: ["/./_app/pages/pricing/index.svelte-ff21cbc4.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/logout/index.svelte": {entry: "/./_app/pages/logout/index.svelte-2528758c.js", css: [], js: ["/./_app/pages/logout/index.svelte-2528758c.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/stores-94e58e4f.js", "/./_app/chunks/utils-cf215c6e.js"], styles: null}, "src/routes/signup/index.svelte": {entry: "/./_app/pages/signup/index.svelte-2d084fbc.js", css: [], js: ["/./_app/pages/signup/index.svelte-2d084fbc.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/signup-b8706f1a.js"], styles: null}, "src/routes/about/index.svelte": {entry: "/./_app/pages/about/index.svelte-7b0b2a42.js", css: ["/./_app/assets/pages/about/index.svelte-59987484.css"], js: ["/./_app/pages/about/index.svelte-7b0b2a42.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/login/index.svelte": {entry: "/./_app/pages/login/index.svelte-a837e5e9.js", css: [], js: ["/./_app/pages/login/index.svelte-a837e5e9.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/stores-94e58e4f.js", "/./_app/chunks/singletons-6b53f818.js", "/./_app/chunks/utils-cf215c6e.js"], styles: null}, "src/routes/blog/index.svelte": {entry: "/./_app/pages/blog/index.svelte-6cf76d74.js", css: [], js: ["/./_app/pages/blog/index.svelte-6cf76d74.js", "/./_app/chunks/vendor-9b726d4d.js"], styles: null}, "src/routes/docs/index.svelte": {entry: "/./_app/pages/docs/index.svelte-638a4b5a.js", css: ["/./_app/assets/pages/docs/index.svelte-c3821242.css"], js: ["/./_app/pages/docs/index.svelte-638a4b5a.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/index-5d0f9f3a.js", "/./_app/chunks/open-graph-1088df74.js", "/./_app/chunks/stores-94e58e4f.js"], styles: null}, "src/routes/docs/[slug].svelte": {entry: "/./_app/pages/docs/[slug].svelte-aabe693c.js", css: [], js: ["/./_app/pages/docs/[slug].svelte-aabe693c.js", "/./_app/chunks/vendor-9b726d4d.js", "/./_app/chunks/index-5d0f9f3a.js", "/./_app/chunks/open-graph-1088df74.js", "/./_app/chunks/stores-94e58e4f.js"], styles: null}};
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
init({paths: {base: "", assets: "/."}});
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond$2({...request, host}, options, {prerender: prerender2});
}
function post$3() {
  return {
    headers: {
      "set-cookie": "jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    },
    body: {
      ok: true
    }
  };
}
var logout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  post: post$3
});
function respond(body) {
  if (body.errors) {
    return {status: 401, body};
  }
  const json = JSON.stringify(body.user);
  const value = Buffer.from(json).toString("base64");
  console.log("JSON", json);
  return {
    headers: {
      "set-cookie": `jwt=${value}; Path=/; HttpOnly; Secure`
    },
    body
  };
}
let uri = "https://api.digitalbk.app";
const BASE_LOGIN_URI = `${uri}/auth/local`;
const GRAPHQL_URI = `${uri}/graphql`;
const base = BASE_LOGIN_URI;
async function send({method, data, token}) {
  const opts = {method, headers: {}};
  if (data) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }
  if (token) {
    opts.headers["Authorization"] = `Token ${token}`;
  }
  return fetch(`${base}`, opts).then((r2) => r2.text()).then((json) => {
    try {
      return JSON.parse(json);
    } catch (err) {
      return json;
    }
  });
}
function post$2(data, token) {
  return send({method: "POST", data, token});
}
async function post$1(request) {
  const body = await post$2({
    identifier: request.body.email,
    password: request.body.password
  });
  console.log(body);
  return respond(body);
}
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  post: post$1
});
var global = '/*! tailwindcss v2.1.2 | MIT License | https://tailwindcss.com*/\n\n/*! modern-normalize v1.0.0 | MIT License | https://github.com/sindresorhus/modern-normalize */:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji}hr{height:0;color:inherit}abbr[title]{-webkit-text-decoration:underline dotted;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}[type=button],[type=submit],button{-webkit-appearance:button}legend{padding:0}progress{vertical-align:baseline}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}button{background-color:transparent;background-image:none}button:focus{outline:1px dotted;outline:5px auto -webkit-focus-ring-color}fieldset,ol,ul{margin:0;padding:0}ol,ul{list-style:none}html{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{font-family:inherit;line-height:inherit}*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}hr{border-top-width:1px}img{border-style:solid}textarea{resize:vertical}input::-moz-placeholder, textarea::-moz-placeholder{opacity:1;color:#9ca3af}input:-ms-input-placeholder, textarea:-ms-input-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button{cursor:pointer}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}button,input,optgroup,select,textarea{padding:0;line-height:inherit;color:inherit}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.prose{color:#fff;max-width:65ch}.prose [class~=lead]{color:#4b5563;font-size:1.25em;line-height:1.6;margin-top:1.2em;margin-bottom:1.2em}.prose a{color:#3182ce;text-decoration:underline;font-weight:500}.prose a:hover{color:#2c5282}.prose strong{color:#3182ce;font-weight:600}.prose strong:hover{color:#2c5282}.prose ol[type=A]{--list-counter-style:upper-alpha}.prose ol[type=a]{--list-counter-style:lower-alpha}.prose ol[type=i]{--list-counter-style:lower-roman}.prose ol[type="1"]{--list-counter-style:decimal}.prose ol>li{position:relative;padding-left:1.75em}.prose ol>li:before{content:counter(list-item,var(--list-counter-style,decimal)) ".";position:absolute;font-weight:400;color:#6b7280;left:0}.prose ul>li{position:relative;padding-left:1.75em}.prose ul>li:before{content:"";position:absolute;background-color:#d1d5db;border-radius:50%;width:.375em;height:.375em;top:.6875em;left:.25em}.prose hr{border-color:#e5e7eb;border-top-width:1px;margin-top:3em;margin-bottom:3em}.prose blockquote{font-weight:500;font-style:italic;color:#fff;border-left-width:.25rem;border-left-color:#e5e7eb;quotes:"\\201C""\\201D""\\2018""\\2019";margin-top:1.6em;margin-bottom:1.6em;padding-left:1em}.prose blockquote p:first-of-type:before{content:open-quote}.prose blockquote p:last-of-type:after{content:close-quote}.prose h1{color:#fff;font-weight:800;font-size:2.25em;margin-top:0;margin-bottom:.8888889em;line-height:1.1111111}.prose h2{color:#fff;font-weight:700;font-size:1.5em;margin-top:2em;margin-bottom:1em;line-height:1.3333333}.prose h3{color:#fff;font-weight:600;font-size:1.25em;margin-top:1.6em;margin-bottom:.6em;line-height:1.6}.prose h4{color:#111827;font-weight:600;margin-top:1.5em;margin-bottom:.5em;line-height:1.5}.prose figure figcaption{color:#6b7280;font-size:.875em;line-height:1.4285714;margin-top:.8571429em}.prose code{color:#111827;font-weight:600;font-size:.875em}.prose code:after,.prose code:before{content:"`"}.prose a code{color:#111827}.prose pre{color:#e5e7eb;background-color:#1f2937;overflow-x:auto;font-size:.875em;line-height:1.7142857;margin-top:1.7142857em;margin-bottom:1.7142857em;border-radius:.375rem;padding:.8571429em 1.1428571em}.prose pre code{background-color:transparent;border-width:0;border-radius:0;padding:0;font-weight:400;color:inherit;font-size:inherit;font-family:inherit;line-height:inherit}.prose pre code:after,.prose pre code:before{content:none}.prose table{width:100%;table-layout:auto;text-align:left;margin-top:2em;margin-bottom:2em;font-size:.875em;line-height:1.7142857}.prose thead{color:#111827;font-weight:600;border-bottom-width:1px;border-bottom-color:#d1d5db}.prose thead th{vertical-align:bottom;padding-right:.5714286em;padding-bottom:.5714286em;padding-left:.5714286em}.prose tbody tr{border-bottom-width:1px;border-bottom-color:#e5e7eb}.prose tbody tr:last-child{border-bottom-width:0}.prose tbody td{vertical-align:top;padding:.5714286em}.prose{font-size:1rem;line-height:1.75}.prose p{margin-top:1.25em;margin-bottom:1.25em}.prose figure,.prose img,.prose video{margin-top:2em;margin-bottom:2em}.prose figure>*{margin-top:0;margin-bottom:0}.prose h2 code{font-size:.875em}.prose h3 code{font-size:.9em}.prose ol,.prose ul{margin-top:1.25em;margin-bottom:1.25em}.prose li{margin-top:.5em;margin-bottom:.5em}.prose>ul>li p{margin-top:.75em;margin-bottom:.75em}.prose>ul>li>:first-child{margin-top:1.25em}.prose>ul>li>:last-child{margin-bottom:1.25em}.prose>ol>li>:first-child{margin-top:1.25em}.prose>ol>li>:last-child{margin-bottom:1.25em}.prose ol ol,.prose ol ul,.prose ul ol,.prose ul ul{margin-top:.75em;margin-bottom:.75em}.prose h2+*,.prose h3+*,.prose h4+*,.prose hr+*{margin-top:0}.prose thead th:first-child{padding-left:0}.prose thead th:last-child{padding-right:0}.prose tbody td:first-child{padding-left:0}.prose tbody td:last-child{padding-right:0}.prose>:first-child{margin-top:0}.prose>:last-child{margin-bottom:0}.prose-indigo a,.prose-indigo a code{color:#4f46e5}.space-x-4>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(1rem*var(--tw-space-x-reverse));margin-left:calc(1rem*(1 - var(--tw-space-x-reverse)))}.bg-black{--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity))}.bg-white{--tw-bg-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity))}.bg-gray-100{--tw-bg-opacity:1;background-color:rgba(243,244,246,var(--tw-bg-opacity))}.bg-gray-200{--tw-bg-opacity:1;background-color:rgba(229,231,235,var(--tw-bg-opacity))}.bg-gray-400{--tw-bg-opacity:1;background-color:rgba(156,163,175,var(--tw-bg-opacity))}.bg-gray-800{--tw-bg-opacity:1;background-color:rgba(31,41,55,var(--tw-bg-opacity))}.bg-gray-900{--tw-bg-opacity:1;background-color:rgba(17,24,39,var(--tw-bg-opacity))}.bg-indigo-100{--tw-bg-opacity:1;background-color:rgba(224,231,255,var(--tw-bg-opacity))}.bg-indigo-500{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}.hover\\:bg-gray-200:hover{--tw-bg-opacity:1;background-color:rgba(229,231,235,var(--tw-bg-opacity))}.hover\\:bg-gray-500:hover{--tw-bg-opacity:1;background-color:rgba(107,114,128,var(--tw-bg-opacity))}.hover\\:bg-gray-800:hover{--tw-bg-opacity:1;background-color:rgba(31,41,55,var(--tw-bg-opacity))}.hover\\:bg-indigo-500:hover{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}.hover\\:bg-indigo-600:hover{--tw-bg-opacity:1;background-color:rgba(79,70,229,var(--tw-bg-opacity))}.focus\\:bg-white:focus{--tw-bg-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity))}.bg-opacity-50{--tw-bg-opacity:0.5}.border-gray-200{--tw-border-opacity:1;border-color:rgba(229,231,235,var(--tw-border-opacity))}.border-gray-300{--tw-border-opacity:1;border-color:rgba(209,213,219,var(--tw-border-opacity))}.border-gray-900{--tw-border-opacity:1;border-color:rgba(17,24,39,var(--tw-border-opacity))}.border-indigo-500{--tw-border-opacity:1;border-color:rgba(99,102,241,var(--tw-border-opacity))}.hover\\:border-white:hover{--tw-border-opacity:1;border-color:rgba(255,255,255,var(--tw-border-opacity))}.focus\\:border-indigo-500:focus{--tw-border-opacity:1;border-color:rgba(99,102,241,var(--tw-border-opacity))}.rounded{border-radius:.25rem}.rounded-md{border-radius:.375rem}.rounded-lg{border-radius:.5rem}.rounded-full{border-radius:9999px}.rounded-bl{border-bottom-left-radius:.25rem}.border-dashed{border-style:dashed}.border-0{border-width:0}.border-2{border-width:2px}.border-4{border-width:4px}.border{border-width:1px}.border-t{border-top-width:1px}.border-b{border-bottom-width:1px}.block{display:block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.grid{display:grid}.hidden{display:none}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.place-items-center{place-items:center}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.flex-1{flex:1 1 0%}.flex-initial{flex:0 1 auto}.flex-grow{flex-grow:1}.flex-shrink-0{flex-shrink:0}.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}.font-extrabold{font-weight:800}.h-3{height:.75rem}.h-4{height:1rem}.h-5{height:1.25rem}.h-6{height:1.5rem}.h-8{height:2rem}.h-12{height:3rem}.h-16{height:4rem}.h-32{height:8rem}.h-96{height:24rem}.h-full{height:100%}.h-screen{height:100vh}.text-xs{font-size:.75rem;line-height:1rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem}.text-lg,.text-xl{line-height:1.75rem}.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-5xl{font-size:3rem;line-height:1}.leading-6{line-height:1.5rem}.leading-7{line-height:1.75rem}.leading-8{line-height:2rem}.leading-none{line-height:1}.leading-tight{line-height:1.25}.leading-normal{line-height:1.5}.leading-relaxed{line-height:1.625}.list-none{list-style-type:none}.m-2{margin:.5rem}.-m-2{margin:-.5rem}.-m-4{margin:-1rem}.my-4{margin-top:1rem;margin-bottom:1rem}.mx-auto{margin-left:auto;margin-right:auto}.mb-1{margin-bottom:.25rem}.ml-1{margin-left:.25rem}.mt-2{margin-top:.5rem}.mr-2{margin-right:.5rem}.mb-2{margin-bottom:.5rem}.ml-2{margin-left:.5rem}.mt-3{margin-top:.75rem}.mr-3{margin-right:.75rem}.mb-3{margin-bottom:.75rem}.ml-3{margin-left:.75rem}.mt-4{margin-top:1rem}.mr-4{margin-right:1rem}.mb-4{margin-bottom:1rem}.ml-4{margin-left:1rem}.mb-5{margin-bottom:1.25rem}.mt-6{margin-top:1.5rem}.mr-6{margin-right:1.5rem}.mb-6{margin-bottom:1.5rem}.mt-8{margin-top:2rem}.mb-8{margin-bottom:2rem}.mt-10{margin-top:2.5rem}.mb-10{margin-bottom:2.5rem}.mb-12{margin-bottom:3rem}.mt-20{margin-top:5rem}.mb-20{margin-bottom:5rem}.mt-auto{margin-top:auto}.ml-auto{margin-left:auto}.-mt-3{margin-top:-.75rem}.-ml-3{margin-left:-.75rem}.-mb-10{margin-bottom:-2.5rem}.max-h-screen{max-height:100vh}.max-w-xs{max-width:20rem}.max-w-5xl{max-width:64rem}.object-cover{-o-object-fit:cover;object-fit:cover}.object-center{-o-object-position:center;object-position:center}.opacity-50{opacity:.5}.focus\\:outline-none:focus,.outline-none{outline:2px solid transparent;outline-offset:2px}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-y-auto{overflow-y:auto}.overflow-x-hidden{overflow-x:hidden}.p-2{padding:.5rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.px-2{padding-left:.5rem;padding-right:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.px-3{padding-left:.75rem;padding-right:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.px-4{padding-left:1rem;padding-right:1rem}.py-5{padding-top:1.25rem;padding-bottom:1.25rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.py-8{padding-top:2rem;padding-bottom:2rem}.px-8{padding-left:2rem;padding-right:2rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-24{padding-top:6rem;padding-bottom:6rem}.pr-0{padding-right:0}.pb-2{padding-bottom:.5rem}.pt-4{padding-top:1rem}.pb-4{padding-bottom:1rem}.pb-5{padding-bottom:1.25rem}.pt-8{padding-top:2rem}.pb-10{padding-bottom:2.5rem}.pt-12{padding-top:3rem}.pb-12{padding-bottom:3rem}.pt-24{padding-top:6rem}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.inset-0{right:0;left:0}.inset-0,.inset-y-0{top:0;bottom:0}.top-0{top:0}.right-0{right:0}.left-0{left:0}.right-4{right:1rem}.bottom-4{bottom:1rem}.top-1\\/2{top:50%}.left-1\\/2{left:50%}.resize-none{resize:none}*{--tw-shadow:0 0 transparent}.shadow-lg{--tw-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);box-shadow:var(--tw-ring-offset-shadow,0 0 transparent),var(--tw-ring-shadow,0 0 transparent),var(--tw-shadow)}*{--tw-ring-inset:var(--tw-empty,/*!*/ /*!*/);--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,0.5);--tw-ring-offset-shadow:0 0 transparent;--tw-ring-shadow:0 0 transparent}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 transparent)}.focus\\:ring-indigo-200:focus{--tw-ring-opacity:1;--tw-ring-color:rgba(199,210,254,var(--tw-ring-opacity))}.text-center{text-align:center}.text-right{text-align:right}.text-black{--tw-text-opacity:1;color:rgba(0,0,0,var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}.text-gray-50{--tw-text-opacity:1;color:rgba(249,250,251,var(--tw-text-opacity))}.text-gray-100{--tw-text-opacity:1;color:rgba(243,244,246,var(--tw-text-opacity))}.text-gray-300{--tw-text-opacity:1;color:rgba(209,213,219,var(--tw-text-opacity))}.text-gray-400{--tw-text-opacity:1;color:rgba(156,163,175,var(--tw-text-opacity))}.text-gray-500{--tw-text-opacity:1;color:rgba(107,114,128,var(--tw-text-opacity))}.text-gray-600{--tw-text-opacity:1;color:rgba(75,85,99,var(--tw-text-opacity))}.text-gray-700{--tw-text-opacity:1;color:rgba(55,65,81,var(--tw-text-opacity))}.text-gray-800{--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity))}.text-gray-900{--tw-text-opacity:1;color:rgba(17,24,39,var(--tw-text-opacity))}.text-indigo-300{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}.hover\\:text-white:hover{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}.hover\\:text-gray-100:hover{--tw-text-opacity:1;color:rgba(243,244,246,var(--tw-text-opacity))}.hover\\:text-indigo-500:hover{--tw-text-opacity:1;color:rgba(99,102,241,var(--tw-text-opacity))}.hover\\:underline:hover{text-decoration:underline}.tracking-tight{letter-spacing:-.025em}.tracking-widest{letter-spacing:.1em}.w-3{width:.75rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-8{width:2rem}.w-12{width:3rem}.w-16{width:4rem}.w-60{width:15rem}.w-72{width:18rem}.w-80{width:20rem}.w-auto{width:auto}.w-1\\/2{width:50%}.w-2\\/5{width:40%}.w-full{width:100%}.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}.z-50{z-index:50}.gap-2{gap:.5rem}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.auto-cols-min{grid-auto-columns:-webkit-min-content;grid-auto-columns:min-content}.transform{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;transform:translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transition{transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:background-color,border-color,color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.duration-200{transition-duration:.2s}.duration-300{transition-duration:.3s}.filter{--tw-blur:var(--tw-empty,/*!*/ /*!*/);--tw-brightness:var(--tw-empty,/*!*/ /*!*/);--tw-contrast:var(--tw-empty,/*!*/ /*!*/);--tw-grayscale:var(--tw-empty,/*!*/ /*!*/);--tw-hue-rotate:var(--tw-empty,/*!*/ /*!*/);--tw-invert:var(--tw-empty,/*!*/ /*!*/);--tw-saturate:var(--tw-empty,/*!*/ /*!*/);--tw-sepia:var(--tw-empty,/*!*/ /*!*/);--tw-drop-shadow:var(--tw-empty,/*!*/ /*!*/);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}:root{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif}section{margin-left:auto;margin-right:auto;max-width:64rem;padding:4rem 2rem}body{--tw-bg-opacity:1;background-color:rgba(17,24,39,var(--tw-bg-opacity));font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--tw-text-opacity:1;color:rgba(243,244,246,var(--tw-text-opacity));font-weight:400;font-size:1rem;line-height:1.5rem;line-height:1.5;letter-spacing:0;overflow-wrap:break-word}main{text-align:center;padding:1rem;margin-left:auto;margin-right:auto}button{border-radius:.25rem;border-width:1px;padding:.5rem 2rem;--tw-border-opacity:1;border-color:rgba(75,85,99,var(--tw-border-opacity));--tw-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);box-shadow:var(--tw-ring-offset-shadow,0 0 transparent),var(--tw-ring-shadow,0 0 transparent),var(--tw-shadow);outline:2px solid transparent;outline-offset:2px}@media (min-width:640px){h1{max-width:none}}h2,h3,h4,h5,span{color:rgba(165,180,252,var(--tw-text-opacity))}a,h2,h3,h4,h5,span{--tw-text-opacity:1}a{color:rgba(249,250,251,var(--tw-text-opacity))}p{letter-spacing:.025em}input:focus{--tw-bg-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity))}input{--tw-bg-opacity:0.5;border-color:rgba(17,24,39,var(--tw-border-opacity))}input,input:focus{--tw-border-opacity:1}input:focus{border-color:rgba(99,102,241,var(--tw-border-opacity))}input{border-radius:.25rem;border-width:1px;font-size:1rem;line-height:1.5rem;line-height:2rem;outline:2px solid transparent;outline-offset:2px;padding:.25rem .75rem}input:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 transparent);--tw-ring-opacity:1;--tw-ring-color:rgba(199,210,254,var(--tw-ring-opacity))}input{--tw-text-opacity:1;color:rgba(55,65,81,var(--tw-text-opacity));width:100%;transition-property:background-color,border-color,color,fill,stroke;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.2s;margin-bottom:.5rem}@media (min-width:640px){.sm\\:flex-row{flex-direction:row}.sm\\:justify-start{justify-content:flex-start}.sm\\:h-full{height:100%}.sm\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.sm\\:text-4xl{font-size:2.25rem;line-height:2.5rem}.sm\\:mt-0{margin-top:0}.sm\\:ml-auto{margin-left:auto}.sm\\:text-left{text-align:left}}@media (min-width:768px){.md\\:border-gray-600{--tw-border-opacity:1;border-color:rgba(75,85,99,var(--tw-border-opacity))}.md\\:border-r-4{border-right-width:4px}.md\\:flex{display:flex}.md\\:flex-row{flex-direction:row}.md\\:flex-row-reverse{flex-direction:row-reverse}.md\\:flex-col{flex-direction:column}.md\\:flex-nowrap{flex-wrap:nowrap}.md\\:items-center{align-items:center}.md\\:h-3\\/6{height:50%}.md\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.md\\:mt-0{margin-top:0}.md\\:mr-0{margin-right:0}.md\\:mb-0{margin-bottom:0}.md\\:ml-auto{margin-left:auto}.md\\:max-w-xs{max-width:20rem}.md\\:overflow-auto{overflow:auto}.md\\:pt-8{padding-top:2rem}.md\\:pr-10{padding-right:2.5rem}.md\\:pr-16{padding-right:4rem}.md\\:pl-20{padding-left:5rem}.md\\:relative{position:relative}.md\\:left-0{left:0}.md\\:bottom-10{bottom:2.5rem}.md\\:top-20{top:5rem}.md\\:text-left{text-align:left}.md\\:text-center{text-align:center}.md\\:w-auto{width:auto}.md\\:w-1\\/2{width:50%}.md\\:w-1\\/3{width:33.333333%}.md\\:w-2\\/3{width:66.666667%}.md\\:w-1\\/5{width:20%}.md\\:w-4\\/5{width:80%}}@media (min-width:1024px){.lg\\:prose-xl{font-size:1.25rem;line-height:1.8}.lg\\:prose-xl p{margin-top:1.2em;margin-bottom:1.2em}.lg\\:prose-xl [class~=lead]{font-size:1.2em;line-height:1.5;margin-top:1em;margin-bottom:1em}.lg\\:prose-xl blockquote{margin-top:1.6em;margin-bottom:1.6em;padding-left:1.0666667em}.lg\\:prose-xl h1{font-size:2.8em;margin-top:0;margin-bottom:.8571429em;line-height:1}.lg\\:prose-xl h2{font-size:1.8em;margin-top:1.5555556em;margin-bottom:.8888889em;line-height:1.1111111}.lg\\:prose-xl h3{font-size:1.5em;margin-top:1.6em;margin-bottom:.6666667em;line-height:1.3333333}.lg\\:prose-xl h4{margin-top:1.8em;margin-bottom:.6em;line-height:1.6}.lg\\:prose-xl figure,.lg\\:prose-xl img,.lg\\:prose-xl video{margin-top:2em;margin-bottom:2em}.lg\\:prose-xl figure>*{margin-top:0;margin-bottom:0}.lg\\:prose-xl figure figcaption{font-size:.9em;line-height:1.5555556;margin-top:1em}.lg\\:prose-xl code{font-size:.9em}.lg\\:prose-xl h2 code{font-size:.8611111em}.lg\\:prose-xl h3 code{font-size:.9em}.lg\\:prose-xl pre{font-size:.9em;line-height:1.7777778;margin-top:2em;margin-bottom:2em;border-radius:.5rem;padding:1.1111111em 1.3333333em}.lg\\:prose-xl ol,.lg\\:prose-xl ul{margin-top:1.2em;margin-bottom:1.2em}.lg\\:prose-xl li{margin-top:.6em;margin-bottom:.6em}.lg\\:prose-xl ol>li{padding-left:1.8em}.lg\\:prose-xl ol>li:before{left:0}.lg\\:prose-xl ul>li{padding-left:1.8em}.lg\\:prose-xl ul>li:before{width:.35em;height:.35em;top:.725em;left:.25em}.lg\\:prose-xl>ul>li p{margin-top:.8em;margin-bottom:.8em}.lg\\:prose-xl>ul>li>:first-child{margin-top:1.2em}.lg\\:prose-xl>ul>li>:last-child{margin-bottom:1.2em}.lg\\:prose-xl>ol>li>:first-child{margin-top:1.2em}.lg\\:prose-xl>ol>li>:last-child{margin-bottom:1.2em}.lg\\:prose-xl ol ol,.lg\\:prose-xl ol ul,.lg\\:prose-xl ul ol,.lg\\:prose-xl ul ul{margin-top:.8em;margin-bottom:.8em}.lg\\:prose-xl hr{margin-top:2.8em;margin-bottom:2.8em}.lg\\:prose-xl h2+*,.lg\\:prose-xl h3+*,.lg\\:prose-xl h4+*,.lg\\:prose-xl hr+*{margin-top:0}.lg\\:prose-xl table{font-size:.9em;line-height:1.5555556}.lg\\:prose-xl thead th{padding-right:.6666667em;padding-bottom:.8888889em;padding-left:.6666667em}.lg\\:prose-xl thead th:first-child{padding-left:0}.lg\\:prose-xl thead th:last-child{padding-right:0}.lg\\:prose-xl tbody td{padding:.8888889em .6666667em}.lg\\:prose-xl tbody td:first-child{padding-left:0}.lg\\:prose-xl tbody td:last-child{padding-right:0}.lg\\:prose-xl>:first-child{margin-top:0}.lg\\:prose-xl>:last-child{margin-bottom:0}.lg\\:space-x-0>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(0px*var(--tw-space-x-reverse));margin-left:calc(0px*(1 - var(--tw-space-x-reverse)))}.lg\\:block{display:block}.lg\\:inline-block{display:inline-block}.lg\\:flex{display:flex}.lg\\:hidden{display:none}.lg\\:items-start{align-items:flex-start}.lg\\:items-center{align-items:center}.lg\\:flex-none{flex:none}.lg\\:flex-grow{flex-grow:1}.lg\\:float-right{float:right}.lg\\:mx-0{margin-left:0;margin-right:0}.lg\\:mt-0{margin-top:0}.lg\\:mb-0{margin-bottom:0}.lg\\:overflow-auto{overflow:auto}.lg\\:py-2{padding-top:.5rem;padding-bottom:.5rem}.lg\\:py-6{padding-top:1.5rem;padding-bottom:1.5rem}.lg\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.lg\\:pr-0{padding-right:0}.lg\\:pl-12{padding-left:3rem}.lg\\:static{position:static}.lg\\:inset-0{top:0;right:0;bottom:0;left:0}.lg\\:text-left{text-align:left}.lg\\:text-center{text-align:center}.lg\\:w-auto{width:auto}.lg\\:w-1\\/2{width:50%}.lg\\:w-2\\/3{width:66.666667%}.lg\\:w-1\\/4{width:25%}.lg\\:w-3\\/5{width:60%}.lg\\:w-2\\/6{width:33.333333%}.lg\\:translate-x-0{--tw-translate-x:0px}}@media (min-width:1280px){.xl\\:w-1\\/3{width:33.333333%}}';
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
const ssr = typeof window === "undefined";
const getStores = () => {
  const stores = getContext$1("__svelte__");
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
  throw new Error(ssr ? `Can only ${verb} session store in browser` : `Cannot ${verb} session store before subscribing`);
};
const session = {
  subscribe(fn) {
    const store = getStores().session;
    if (!ssr) {
      session.set = store.set;
      session.update = store.update;
    }
    return store.subscribe(fn);
  },
  set: (value) => {
    error("set");
  },
  update: (updater) => {
    error("update");
  }
};
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {text} = $$props;
  let {clickEvent} = $$props;
  let {href} = $$props;
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.clickEvent === void 0 && $$bindings.clickEvent && clickEvent !== void 0)
    $$bindings.clickEvent(clickEvent);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  return `<a${add_attribute("href", href, 0)} class="${"mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full py-4 px-8 shadow-lg"}">${text ? ` ${escape(text)} ` : ` ${slots.default ? slots.default({}) : ``} `}</a>`;
});
var header_svelte_svelte_type_style_lang = "a.svelte-1i5ehjo{font-size:1rem;line-height:1.5rem;margin-top:1rem;display:inline;margin-right:1rem;color:rgba(255,255,255,var(--tw-text-opacity))}a.svelte-1i5ehjo,a.svelte-1i5ehjo:hover{--tw-text-opacity:1}a.svelte-1i5ehjo:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media(min-width:1024px){a.svelte-1i5ehjo{display:inline-block;margin-top:0}}";
const css$5 = {
  code: "a.svelte-1i5ehjo{font-size:1rem;line-height:1.5rem;margin-top:1rem;display:inline;margin-right:1rem;color:rgba(255,255,255,var(--tw-text-opacity))}a.svelte-1i5ehjo,a.svelte-1i5ehjo:hover{--tw-text-opacity:1}a.svelte-1i5ehjo:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media(min-width:1024px){a.svelte-1i5ehjo{display:inline-block;margin-top:0}}",
  map: '{"version":3,"file":"header.svelte","sources":["header.svelte"],"sourcesContent":["<script>\\r\\n  import { session } from \\"$app/stores\\";\\r\\n  import Button from \\"$lib/components/generics/button.svelte\\";\\r\\n  // import Href from \\"./generics/Href.svelte\\";\\r\\n\\r\\n  function toggleMenu() {\\r\\n    var item = document.getElementById(\\"hidden-menu\\");\\r\\n    var btn = document.getElementById(\\"hidden-menubtn\\");\\r\\n\\r\\n    item.classList.toggle(\\"hidden\\");\\r\\n    btn.classList.toggle(\\"hidden\\");\\r\\n  }\\r\\n</script>\\r\\n\\r\\n<!-- component -->\\r\\n<nav\\r\\n  class=\\"flex items-center justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left\\"\\r\\n>\\r\\n  <div class=\\"flex items-center flex-no-shrink text-white mr-6\\">\\r\\n    <span class=\\"font-semibold text-xl tracking-tight text-gray-50\\"\\r\\n      ><a href=\\"/\\"\\r\\n        ><img\\r\\n          class=\\"w-72\\"\\r\\n          src=\\"logo_light.webp\\"\\r\\n          alt=\\"Digital Business Keys\\"\\r\\n        /></a\\r\\n      ></span\\r\\n    >\\r\\n  </div>\\r\\n  <div class=\\"block lg:hidden z-50 py-4 lg:py-2\\">\\r\\n    <button\\r\\n      on:click={toggleMenu}\\r\\n      class=\\"flex items-center px-3 py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white\\"\\r\\n    >\\r\\n      <svg\\r\\n        class=\\"h-3 w-3\\"\\r\\n        viewBox=\\"0 0 20 20\\"\\r\\n        fill=\\"white\\"\\r\\n        xmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n        ><title>Menu</title>\\r\\n        <path d=\\"M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z\\" /></svg\\r\\n      >\\r\\n    </button>\\r\\n  </div>\\r\\n  <div\\r\\n    class=\\"w-full block flex-grow lg:flex lg:items-center md:items-center lg:w-auto z-50 md:text-center lg:text-center\\"\\r\\n  >\\r\\n    <div\\r\\n      id=\\"hidden-menu\\"\\r\\n      class=\\"text-sm lg:flex-grow hidden lg:block md:items-center lg:items-center md:text-center lg:text-center\\"\\r\\n    >\\r\\n      <a href=\\"/docs\\" rel=\\"prefetch\\" class=\\"nav-link\\" on:click={toggleMenu}\\r\\n        >Docs</a\\r\\n      >\\r\\n      <a href=\\"/features\\" rel=\\"prefetch\\" on:click={toggleMenu}>Features</a>\\r\\n      <a href=\\"/blog\\" rel=\\"prefetch\\" on:click={toggleMenu}>Blog</a>\\r\\n      <a href=\\"contact\\" rel=\\"prefetch\\" on:click={toggleMenu}>Contact Us</a>\\r\\n    </div>\\r\\n    {#if $session.user}\\r\\n      <div id=\\"hidden-menubtn\\" class=\\"hidden lg:block\\">\\r\\n        <Button text=\\"Dashboard\\" href=\\"/dashboard\\" clickEvent={toggleMenu} />\\r\\n        <Button text=\\"Logout\\" href=\\"/logout\\" clickEvent={toggleMenu} />\\r\\n      </div>\\r\\n    {:else}\\r\\n      <div id=\\"hidden-menubtn\\" class=\\"hidden lg:block\\">\\r\\n        <Button text=\\"Sign Up\\" href=\\"/signup\\" clickEvent={toggleMenu} />\\r\\n        <Button text=\\"Sign In\\" href=\\"/login\\" clickEvent={toggleMenu} />\\r\\n      </div>\\r\\n    {/if}\\r\\n  </div>\\r\\n</nav>\\r\\n\\r\\n<style>a{font-size:1rem;line-height:1.5rem;margin-top:1rem;display:inline;margin-right:1rem;color:rgba(255,255,255,var(--tw-text-opacity))}a,a:hover{--tw-text-opacity:1}a:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media (min-width:1024px){a{display:inline-block;margin-top:0}}</style>\\r\\n"],"names":[],"mappings":"AAwEO,gBAAC,CAAC,UAAU,IAAI,CAAC,YAAY,MAAM,CAAC,WAAW,IAAI,CAAC,QAAQ,MAAM,CAAC,aAAa,IAAI,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,gBAAC,CAAC,gBAAC,MAAM,CAAC,kBAAkB,CAAC,CAAC,gBAAC,MAAM,CAAC,MAAM,KAAK,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,MAAM,AAAC,WAAW,MAAM,CAAC,CAAC,gBAAC,CAAC,QAAQ,YAAY,CAAC,WAAW,CAAC,CAAC,CAAC"}'
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
<nav class="${"flex items-center justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left"}"><div class="${"flex items-center flex-no-shrink text-white mr-6"}"><span class="${"font-semibold text-xl tracking-tight text-gray-50"}"><a href="${"/"}" class="${"svelte-1i5ehjo"}"><img class="${"w-72"}" src="${"logo_light.webp"}" alt="${"Digital Business Keys"}"></a></span></div>
  <div class="${"block lg:hidden z-50 py-4 lg:py-2"}"><button class="${"flex items-center px-3 py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white"}"><svg class="${"h-3 w-3"}" viewBox="${"0 0 20 20"}" fill="${"white"}" xmlns="${"http://www.w3.org/2000/svg"}"><title>Menu</title><path d="${"M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"}"></path></svg></button></div>
  <div class="${"w-full block flex-grow lg:flex lg:items-center md:items-center lg:w-auto z-50 md:text-center lg:text-center"}"><div id="${"hidden-menu"}" class="${"text-sm lg:flex-grow hidden lg:block md:items-center lg:items-center md:text-center lg:text-center"}"><a href="${"/docs"}" rel="${"prefetch"}" class="${"nav-link svelte-1i5ehjo"}">Docs</a>
      <a href="${"/features"}" rel="${"prefetch"}" class="${"svelte-1i5ehjo"}">Features</a>
      <a href="${"/blog"}" rel="${"prefetch"}" class="${"svelte-1i5ehjo"}">Blog</a>
      <a href="${"contact"}" rel="${"prefetch"}" class="${"svelte-1i5ehjo"}">Contact Us</a></div>
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
const $layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${slots.default ? slots.default({}) : ``}

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var $layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: $layout
});
var $error_svelte_svelte_type_style_lang = "h1.svelte-be3lyz,p.svelte-be3lyz{margin:0 auto}h1.svelte-be3lyz{font-size:2.8em;font-weight:700;margin:0 0 .5em}p.svelte-be3lyz{margin:1em auto}@media(min-width:480px){h1.svelte-be3lyz{font-size:4em}}";
const css$4 = {
  code: "h1.svelte-be3lyz,p.svelte-be3lyz{margin:0 auto}h1.svelte-be3lyz{font-size:2.8em;font-weight:700;margin:0 0 .5em}p.svelte-be3lyz{margin:1em auto}@media(min-width:480px){h1.svelte-be3lyz{font-size:4em}}",
  map: '{"version":3,"file":"$error.svelte","sources":["$error.svelte"],"sourcesContent":["<script>\\r\\n  import { dev } from \\"$app/env\\";\\r\\n  import Layout from \\"./$layout.svelte\\";\\r\\n  export let error, status;\\r\\n</script>\\r\\n\\r\\n<svelte:head>\\r\\n  <title>{status}</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"col-md-9\\">\\r\\n  <h1>{status}</h1>\\r\\n\\r\\n  <p>{error.message}</p>\\r\\n\\r\\n  {#if dev && error.stack}\\r\\n    <pre>{error.stack}</pre>\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style>h1,p{margin:0 auto}h1{font-size:2.8em;font-weight:700;margin:0 0 .5em}p{margin:1em auto}@media (min-width:480px){h1{font-size:4em}}</style>\\r\\n"],"names":[],"mappings":"AAoBO,gBAAE,CAAC,eAAC,CAAC,OAAO,CAAC,CAAC,IAAI,CAAC,gBAAE,CAAC,UAAU,KAAK,CAAC,YAAY,GAAG,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,eAAC,CAAC,OAAO,GAAG,CAAC,IAAI,CAAC,MAAM,AAAC,WAAW,KAAK,CAAC,CAAC,gBAAE,CAAC,UAAU,GAAG,CAAC,CAAC"}'
};
const $error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {error: error2} = $$props, {status} = $$props;
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  $$result.css.add(css$4);
  return `${$$result.head += `${$$result.title = `<title>${escape(status)}</title>`, ""}`, ""}

<div class="${"col-md-9"}"><h1 class="${"svelte-be3lyz"}">${escape(status)}</h1>

  <p class="${"svelte-be3lyz"}">${escape(error2.message)}</p>

  ${``}
</div>`;
});
var $error$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: $error
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
var pricing_svelte_svelte_type_style_lang = ".active.svelte-1hd2jug{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}";
const css$3 = {
  code: ".active.svelte-1hd2jug{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}",
  map: `{"version":3,"file":"pricing.svelte","sources":["pricing.svelte"],"sourcesContent":["<script>\\r\\n    let priceType = \\"monthly\\";\\r\\n\\r\\n    function toggleMonthly() {\\r\\n        priceType = \\"monthly\\";\\r\\n    }\\r\\n\\r\\n    function toggleAnnual() {\\r\\n        priceType = \\"yearly\\";\\r\\n    }\\r\\n</script>\\r\\n\\r\\n<style lang=\\"postcss\\">.active{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}</style>\\r\\n\\r\\n<section class=\\"text-gray-50 body-font overflow-hidden\\">\\r\\n    <div class=\\"container px-5 py-24 mx-auto\\">\\r\\n        <div class=\\"flex flex-col text-center w-full mb-20\\">\\r\\n            <h1 class=\\"sm:text-4xl text-3xl font-medium title-font mb-2\\">\\r\\n                Pricing\\r\\n            </h1>\\r\\n            <p class=\\"lg:w-2/3 mx-auto leading-relaxed text-base\\">\\r\\n                A free trial and different tiers to cater to all types of users\\r\\n                and budgets.\\r\\n            </p>\\r\\n            <div\\r\\n                class=\\"flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6\\">\\r\\n                <button\\r\\n                    class:active={priceType === 'monthly'}\\r\\n                    class=\\"py-1 px-4 text-white focus:outline-none\\"\\r\\n                    on:click={toggleMonthly}>Monthly</button>\\r\\n                <button\\r\\n                    class:active={priceType === 'yearly'}\\r\\n                    class=\\"py-1 px-4 focus:outline-none\\"\\r\\n                    on:click={toggleAnnual}>Annually</button>\\r\\n            </div>\\r\\n        </div>\\r\\n        <div class=\\"flex flex-wrap -m-4\\">\\r\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\r\\n                <div\\r\\n                    class=\\"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden\\">\\r\\n                    <h2\\r\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\r\\n                        TRIAL\\r\\n                    </h2>\\r\\n                    <h1\\r\\n                        class=\\"text-5xl pb-4 mb-4 border-b border-gray-200 leading-none\\">\\r\\n                        Free\\r\\n                    </h1>\\r\\n                    <p class=\\"flex items-center  mb-2\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>Save your Digital Assets\\r\\n                    </p>\\r\\n                    <p class=\\"flex items-center mb-2\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>Save your Important Business Details\\r\\n                    </p>\\r\\n                    <p class=\\"flex items-center mb-6\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>View status of your assets\\r\\n                    </p>\\r\\n                    <button\\r\\n                        class=\\"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded\\">Buy\\r\\n                        <svg\\r\\n                            fill=\\"none\\"\\r\\n                            stroke=\\"currentColor\\"\\r\\n                            stroke-linecap=\\"round\\"\\r\\n                            stroke-linejoin=\\"round\\"\\r\\n                            stroke-width=\\"2\\"\\r\\n                            class=\\"w-4 h-4 ml-auto\\"\\r\\n                            viewBox=\\"0 0 24 24\\">\\r\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\r\\n                        </svg>\\r\\n                    </button>\\r\\n                    <p class=\\"text-xs text-gray-400 mt-3\\">\\r\\n                        Try the app for free for 14 days.\\r\\n                    </p>\\r\\n                </div>\\r\\n            </div>\\r\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\r\\n                <div\\r\\n                    class=\\"h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden\\">\\r\\n                    <span\\r\\n                        class=\\"bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl\\">POPULAR</span>\\r\\n                    <h2\\r\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\r\\n                        ESSENTIAL\\r\\n                    </h2>\\r\\n                    <h1\\r\\n                        class=\\"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200\\">\\r\\n                        {#if priceType == 'monthly'}\\r\\n                            <span>$5</span>\\r\\n                            <span\\r\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/mo</span>\\r\\n                        {:else}\\r\\n                            <span>$50</span>\\r\\n                            <span\\r\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/yr</span>\\r\\n                        {/if}\\r\\n                    </h1>\\r\\n                    <p class=\\"flex items-center  mb-2\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>All Trial Features\\r\\n                    </p>\\r\\n                    <p class=\\"flex items-center mb-2\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>Save multiple assets\\r\\n                    </p>\\r\\n                    <p class=\\"flex items-center mb-6\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>Email and export\\r\\n                    </p>\\r\\n                    <button\\r\\n                        class=\\"flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded\\">Buy\\r\\n                        <svg\\r\\n                            fill=\\"none\\"\\r\\n                            stroke=\\"currentColor\\"\\r\\n                            stroke-linecap=\\"round\\"\\r\\n                            stroke-linejoin=\\"round\\"\\r\\n                            stroke-width=\\"2\\"\\r\\n                            class=\\"w-4 h-4 ml-auto\\"\\r\\n                            viewBox=\\"0 0 24 24\\">\\r\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\r\\n                        </svg>\\r\\n                    </button>\\r\\n                    <p class=\\"text-xs text-gray-500 mt-3\\">\\r\\n                        All the features for your small business.\\r\\n                    </p>\\r\\n                </div>\\r\\n            </div>\\r\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\r\\n                <div\\r\\n                    class=\\"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden\\">\\r\\n                    <h2\\r\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\r\\n                        PREMIUM\\r\\n                    </h2>\\r\\n                    <h1\\r\\n                        class=\\"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200\\">\\r\\n                        {#if priceType == 'monthly'}\\r\\n                            <span>$8</span>\\r\\n                            <span\\r\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/mo</span>\\r\\n                        {:else}\\r\\n                            <span>$90</span>\\r\\n                            <span\\r\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/yr</span>\\r\\n                        {/if}\\r\\n                    </h1>\\r\\n                    <p class=\\"flex items-center  mb-2\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>All Trial & Essential Features\\r\\n                    </p>\\r\\n                    <p class=\\"flex items-center mb-2\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>Setup notifications for your assets\\r\\n                    </p>\\r\\n                    <p class=\\"flex items-center mb-6\\">\\r\\n                        <span\\r\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\r\\n                            <svg\\r\\n                                fill=\\"none\\"\\r\\n                                stroke=\\"currentColor\\"\\r\\n                                stroke-linecap=\\"round\\"\\r\\n                                stroke-linejoin=\\"round\\"\\r\\n                                stroke-width=\\"2.5\\"\\r\\n                                class=\\"w-3 h-3\\"\\r\\n                                viewBox=\\"0 0 24 24\\">\\r\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\r\\n                            </svg>\\r\\n                        </span>Automatic service checks to ensure your assets\\r\\n                        are always working\\r\\n                    </p>\\r\\n                    <button\\r\\n                        class=\\"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded\\">Buy\\r\\n                        <svg\\r\\n                            fill=\\"none\\"\\r\\n                            stroke=\\"currentColor\\"\\r\\n                            stroke-linecap=\\"round\\"\\r\\n                            stroke-linejoin=\\"round\\"\\r\\n                            stroke-width=\\"2\\"\\r\\n                            class=\\"w-4 h-4 ml-auto\\"\\r\\n                            viewBox=\\"0 0 24 24\\">\\r\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\r\\n                        </svg>\\r\\n                    </button>\\r\\n                    <p class=\\"text-xs text-gray-500 mt-3\\">\\r\\n                        Perfect for business critical services.\\r\\n                    </p>\\r\\n                </div>\\r\\n            </div>\\r\\n        </div>\\r\\n    </div>\\r\\n</section>\\r\\n"],"names":[],"mappings":"AAYsB,sBAAO,CAAC,gBAAgB,CAAC,CAAC,iBAAiB,KAAK,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,eAAe,CAAC,CAAC,CAAC"}`
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
                    <p class="${"flex items-center  mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
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
                    <p class="${"flex items-center  mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
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
                    <p class="${"flex items-center  mb-2"}"><span class="${"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0"}"><svg fill="${"none"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2.5"}" class="${"w-3 h-3"}" viewBox="${"0 0 24 24"}"><path d="${"M20 6L9 17l-5-5"}"></path></svg>
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
  let {description} = $$props;
  let {image} = $$props;
  let {title} = $$props;
  let {type} = $$props;
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

<div class="${"pt-24"}"><div class="${"container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center"}">
    <div class="${"flex flex-col md:w-1/2 justify-center px-4 items-start text-center md:text-left"}"><h1 class="${"my-4 text-5xl font-bold leading-tight"}">Store. Manage. Monitor.<br>
        Your critical Digital Business Assets
      </h1>
      <p class="${"leading-normal text-xl mb-8 text-indigo-300"}">Manage and secure your business&#39;s digital business assets and monitor
        your essential business services such as email and website in the
        simple-to-use Digital Business Keys app.
      </p>

      ${$session.user ? `${validate_component(Button, "Button").$$render($$result, {text: "Dashboard", href: "dashboard"}, {}, {})}` : `<div class="${"flex-initial justify-center items-start text-center md:text-left"}">${validate_component(Button, "Button").$$render($$result, {text: "Try Free!", href: "signup"}, {}, {})}

          ${validate_component(Button, "Button").$$render($$result, {text: "Sign In", href: "login"}, {}, {})}</div>`}</div>
    
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
  default: Routes
});
const prerender$7 = true;
const Terms_of_service = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$c = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Terms_of_service,
  prerender: prerender$7
});
var index_svelte_svelte_type_style_lang$2 = "h1.svelte-czkh7d,h2.svelte-czkh7d{padding-bottom:1.25rem}p.svelte-czkh7d{padding-bottom:2.5rem}";
const css$2 = {
  code: "h1.svelte-czkh7d,h2.svelte-czkh7d{padding-bottom:1.25rem}p.svelte-czkh7d{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n  export const prerender = true;\\r\\n  export const hydrate = true;\\r\\n  export const router = true;\\r\\n</script>\\r\\n\\r\\n<section>\\r\\n  <h1>Privacy Policy</h1>\\r\\n\\r\\n  <h2>\\r\\n    In this Privacy Policy \u201CServices\u201D indicates the Service and products offered\\r\\n    and provided by Digital Business Keys across desktop, mobile, tablet and\\r\\n    apps (including any subdomains)\\r\\n  </h2>\\r\\n\\r\\n  <h2>Information we collect about you</h2>\\r\\n  <p>\\r\\n    We collect information about you when you input it into the Services or\\r\\n    otherwise provide it to us and when other sources provide it to us including\\r\\n    but not limited to when you register for an account, create or modify your\\r\\n    profile, sign-up for or make purchases through the Services. Information you\\r\\n    provide to us may be including, but is not limited to your name, address,\\r\\n    phone number, email, gender, occupation, business interests and any other\\r\\n    information provided. We keep track of your preferences when you select\\r\\n    settings within the Services. We collect information about you when you use\\r\\n    our Services, including browsing our websites and taking certain actions\\r\\n    within the Services.\\r\\n  </p>\\r\\n\\r\\n  <h2>How we use information we collect</h2>\\r\\n\\r\\n  <p>\\r\\n    We use the personal information we have collected largely for the purpose of\\r\\n    providing you with products and services that you have requested by\\r\\n    registering an account and agreeing to the Services Terms and Conditions to\\r\\n    create and maintain your account and ensure you comply and adhere to our\\r\\n    terms of use. We are always improving our Services. We use information\\r\\n    identified from usage of the service and feedback to troubleshoot, identify\\r\\n    trends and usage and improve our Services as well as to develop new\\r\\n    products, features and technologies that benefit our users. We send you\\r\\n    email notifications when you interact with the Services. We use your contact\\r\\n    information to send transactional communications via email and within the\\r\\n    Services, including confirming your purchases, reminding you of subscription\\r\\n    expirations,updates, security alerts, and administrative messages. We use\\r\\n    your contact information and information about how you use the Services to\\r\\n    send promotional communications that may be of specific interest to you,\\r\\n    including by email with the ability to opt out of the promotional\\r\\n    communications easily accessible.\\r\\n  </p>\\r\\n\\r\\n  <h2>Security</h2>\\r\\n  <p>\\r\\n    We strive to ensure the security, integrity and privacy of personal\\r\\n    information we collect. We use reasonable security measures to protect your\\r\\n    personal information from unauthorised access, modification and disclosure.\\r\\n    Our employees, contractors, agents and service providers who provide\\r\\n    services related to our information systems, are obliged by law to respect\\r\\n    the confidentiality of any personal information held by us. We review and\\r\\n    update our security measures in light of current technologies.\\r\\n    Unfortunately, no data transmission over the internet can be guaranteed to\\r\\n    be totally secure.\\r\\n  </p>\\r\\n\\r\\n  <h2>Access to your Information</h2>\\r\\n\\r\\n  <p>\\r\\n    If, at any time, you discover that information held about you is incorrect\\r\\n    or you would like to review and confirm the accuracy of your personal\\r\\n    information, you can contact us. Our Services give you the ability to access\\r\\n    and update certain information about you from within the Service. You can\\r\\n    also gain access to the personal information we hold about you, subject to\\r\\n    certain exceptions provided for by law. To request access to your personal\\r\\n    information, please contact us.\\r\\n  </p>\\r\\n\\r\\n  <h2>Changes to our Privacy Policy</h2>\\r\\n\\r\\n  <p>\\r\\n    Amendments to this policy will be posted on this page and will be effective\\r\\n    when posted, if the changes are significant, we will provide a more\\r\\n    prominent notice.\\r\\n  </p>\\r\\n</section>\\r\\n\\r\\n<style lang=\\"postcss\\">h1,h2{padding-bottom:1.25rem}p{padding-bottom:2.5rem}</style>\\r\\n"],"names":[],"mappings":"AAoFsB,gBAAE,CAAC,gBAAE,CAAC,eAAe,OAAO,CAAC,eAAC,CAAC,eAAe,MAAM,CAAC"}'
};
const prerender$6 = true;
const hydrate = true;
const router = true;
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
  default: Privacy_policy,
  prerender: prerender$6,
  hydrate,
  router
});
const Changelog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$a = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Changelog
});
const User_asset_card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {user} = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<div><h1 class="${"text-2xl font-medium text-white"}">Your Digital Assets</h1>

  <div class="${"bg-white .border rounded-md text-black"}">${escape(user.username)}</div></div>`;
});
function load$4({session: session2}) {
  const {user} = session2;
  console.log(user);
  if (!user) {
    return {status: 302, redirect: "/login"};
  }
  return {props: {user}};
}
const Dashboard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {user} = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `
<div><div x-data="${""}"><div class="${"flex h-screen bg-gray-800 font-roboto"}"><div class="${"fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden"}"></div>

      <div class="${"fixed z-30 inset-y-0 left-0 w-60 transition duration-300 transform bg-gray-900 overflow-y-auto lg:translate-x-0 lg:static lg:inset-0"}"><div class="${"flex items-center justify-center mt-8"}"><div class="${"flex items-center"}"><span class="${"text-white text-2xl font-semibold"}">Dashboard</span></div></div>

        <nav class="${"flex flex-col mt-10 px-4 text-center"}"><a href="${"#"}" class="${"py-2 text-sm text-gray-100 bg-gray-800 rounded"}">Overview</a>
          <a href="${"#"}" class="${"mt-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded"}">Settings</a></nav></div>

      <div class="${"flex-1 flex flex-col overflow-hidden"}"><header class="${"flex justify-between items-center p-6"}"><div class="${"flex items-center space-x-4 lg:space-x-0"}"><button class="${"text-gray-300 focus:outline-none lg:hidden"}"><svg class="${"h-6 w-6"}" viewBox="${"0 0 24 24"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M4 6H20M4 12H20M4 18H11"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path></svg></button>

            <div><h1 class="${"text-2xl font-medium text-white"}">Welcome ${escape(user.username)}</h1></div></div></header>

        <main class="${"flex-1 overflow-x-hidden overflow-y-auto"}"><div class="${"container mx-auto px-6 py-8"}"><div class="${"grid place-items-center h-96 text-gray-300 text-xl border-4 border-gray-300 border-dashed"}">${validate_component(User_asset_card, "UserAssetCard").$$render($$result, {user}, {}, {})}</div></div></main></div></div></div></div>

`;
});
var index$9 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Dashboard,
  load: load$4
});
const Features = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$8 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Features
});
const prerender$5 = true;
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
        <div class="${"p-2 w-full"}">${validate_component(Button, "Button").$$render($$result, {clickEvent: submit, href: "/"}, {}, {default: () => `Submit`})}</div>
        <div class="${"p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center"}"><a class="${"text-indigo-300 pb-4"}" href="${"mailto:digitalbusinesskeys@gmail.com&subject=Contact%20Form"}">Email Us</a><br>

          <span class="${"inline-flex pt-4"}"><a class="${"text-gray-500"}" href="${"https://www.facebook.com"}"><svg fill="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"}"></path></svg></a>
            <a class="${"ml-4 text-gray-500"}" href="${"https://www.twitter.com"}"><svg fill="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"}"></path></svg></a></span></div></div></div></div></section>`;
});
var index$7 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Contact,
  prerender: prerender$5
});
const prerender$4 = true;
const Pricing = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$6 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Pricing,
  prerender: prerender$4
});
function post(endpoint, data) {
  return fetch(endpoint, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data || {}),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((r2) => r2.json());
}
function load$3({session: session2}) {
  const {user} = session2;
  console.log(user);
  if (!user) {
    return {status: 302, redirect: "/login"};
  }
  return {props: {user}};
}
const Logout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  onMount(async () => {
    await post(`auth/logout`);
    set_store_value(session, $session.user = null, $session);
  });
  $$unsubscribe_session();
  return ``;
});
var index$5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Logout,
  load: load$3
});
const prerender$3 = true;
const Signup_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Signup, "Signup").$$render($$result, {}, {}, {})}`;
});
var index$4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Signup_1,
  prerender: prerender$3
});
var index_svelte_svelte_type_style_lang$1 = "h1.svelte-1bnbrug{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1.svelte-1bnbrug,h2.svelte-1bnbrug{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p.svelte-1bnbrug{padding-bottom:2.5rem}";
const css$1 = {
  code: "h1.svelte-1bnbrug{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1.svelte-1bnbrug,h2.svelte-1bnbrug{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p.svelte-1bnbrug{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport const prerender = true;\\r\\n</script>\\r\\n\\r\\n<style lang=\\"postcss\\">h1{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1,h2{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p{padding-bottom:2.5rem}</style>\\r\\n\\r\\n\\r\\n<div class=\\"px-8 py-16 mx-auto max-w-5xl\\">\\r\\n\\t<h1>About Us</h1>\\r\\n\\r\\n\\t<p>\\r\\n\\t\\tDigital business keys is a critical app developed to empower businesses\\r\\n\\t\\tto take control of their digital business assets and respond to issues\\r\\n\\t\\tthat can commonly impact website availability, email receiving and\\r\\n\\t\\tsending and digital project assets. Digital Business Keys app provides a\\r\\n\\t\\tservice that has long been neglect by business owners and the industries\\r\\n\\t\\tthat assist them in taking their businesses online Designed to be as\\r\\n\\t\\tsimple as possible to allow any level of user to get the critical\\r\\n\\t\\tcontrol they need for the digital presence of their business.\\r\\n\\t</p>\\r\\n\\r\\n\\t<h2>Our Story</h2>\\r\\n\\r\\n\\t<p>\\r\\n\\t\\tOur team has extensive industry experience in developing and\\r\\n\\t\\timplementing custom and out of the box solutions. We thrive in\\r\\n\\t\\tenvironments that enable us to deliver the best results for our clients.\\r\\n\\t\\tFrom this fundamental work ethic grew the idea for the Digital Business\\r\\n\\t\\tKeys app as a tool to plug the gap we saw develop in the industry in\\r\\n\\t\\tcustomer education, knowledge and tools to provide confidence in\\r\\n\\t\\tmanagement of these business critical digital assets.\\r\\n\\t</p>\\r\\n</div>\\r\\n"],"names":[],"mappings":"AAIsB,iBAAE,CAAC,kBAAkB,CAAC,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,iBAAE,CAAC,iBAAE,CAAC,eAAe,OAAO,CAAC,UAAU,OAAO,CAAC,YAAY,OAAO,CAAC,gBAAC,CAAC,eAAe,MAAM,CAAC"}'
};
const prerender$2 = true;
const About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<div class="${"px-8 py-16 mx-auto max-w-5xl"}"><h1 class="${"svelte-1bnbrug"}">About Us</h1>

	<p class="${"svelte-1bnbrug"}">Digital business keys is a critical app developed to empower businesses
		to take control of their digital business assets and respond to issues
		that can commonly impact website availability, email receiving and
		sending and digital project assets. Digital Business Keys app provides a
		service that has long been neglect by business owners and the industries
		that assist them in taking their businesses online Designed to be as
		simple as possible to allow any level of user to get the critical
		control they need for the digital presence of their business.
	</p>

	<h2 class="${"svelte-1bnbrug"}">Our Story</h2>

	<p class="${"svelte-1bnbrug"}">Our team has extensive industry experience in developing and
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
  default: About,
  prerender: prerender$2
});
async function load$2({session: session2}) {
  if (session2.user) {
    return {status: 302, redirect: "/"};
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
              <input type="${"text"}" id="${"email"}" name="${"email"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-6"}"${add_attribute("value", email, 1)}></div></div>
          <div class="${"p-2"}"><div class="${"container mx-auto max-w-xs"}" data-children-count="${"1"}"><label for="${"password"}" class="${"leading-7 text-sm text-gray-50"}">Password *</label>
              <input type="${"password"}" id="${"password"}" name="${"password"}" data-kwimpalastatus="${"alive"}" data-kwimpalaid="${"1610104456246-7"}"${add_attribute("value", password, 1)}></div>

            <div class="${"p-2 w-full"}"><button type="${"submit"}" class="${"flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"}">Login</button></div></div></form></div></div></section>`}`;
});
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Login,
  load: load$2
});
const Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Blog
});
const GET_DOCS = `
  {
    documentations {
      id
      title
      Slug
      content
      Description
    }
  }
`;
var e = {"": ["<em>", "</em>"], _: ["<strong>", "</strong>"], "*": ["<strong>", "</strong>"], "~": ["<s>", "</s>"], "\n": ["<br />"], " ": ["<br />"], "-": ["<hr />"]};
function n(e2) {
  return e2.replace(RegExp("^" + (e2.match(/^(\t| )+/) || "")[0], "gm"), "");
}
function r(e2) {
  return (e2 + "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function t(a, c) {
  var o, l, g, s2, p, u = /((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)/gm, m = [], h = "", i = c || {}, d2 = 0;
  function f(n2) {
    var r2 = e[n2[1] || ""], t2 = m[m.length - 1] == n2;
    return r2 ? r2[1] ? (t2 ? m.pop() : m.push(n2), r2[0 | t2]) : r2[0] : n2;
  }
  function $() {
    for (var e2 = ""; m.length; )
      e2 += f(m[m.length - 1]);
    return e2;
  }
  for (a = a.replace(/^\[(.+?)\]:\s*(.+)$/gm, function(e2, n2, r2) {
    return i[n2.toLowerCase()] = r2, "";
  }).replace(/^\n+|\n+$/g, ""); g = u.exec(a); )
    l = a.substring(d2, g.index), d2 = u.lastIndex, o = g[0], l.match(/[^\\](\\\\)*\\$/) || ((p = g[3] || g[4]) ? o = '<pre class="code ' + (g[4] ? "poetry" : g[2].toLowerCase()) + '"><code' + (g[2] ? ' class="language-' + g[2].toLowerCase() + '"' : "") + ">" + n(r(p).replace(/^\n+|\n+$/g, "")) + "</code></pre>" : (p = g[6]) ? (p.match(/\./) && (g[5] = g[5].replace(/^\d+/gm, "")), s2 = t(n(g[5].replace(/^\s*[>*+.-]/gm, ""))), p == ">" ? p = "blockquote" : (p = p.match(/\./) ? "ol" : "ul", s2 = s2.replace(/^(.*)(\n|$)/gm, "<li>$1</li>")), o = "<" + p + ">" + s2 + "</" + p + ">") : g[8] ? o = '<img src="' + r(g[8]) + '" alt="' + r(g[7]) + '">' : g[10] ? (h = h.replace("<a>", '<a href="' + r(g[11] || i[l.toLowerCase()]) + '">'), o = $() + "</a>") : g[9] ? o = "<a>" : g[12] || g[14] ? o = "<" + (p = "h" + (g[14] ? g[14].length : g[13] > "=" ? 1 : 2)) + ">" + t(g[12] || g[15], i) + "</" + p + ">" : g[16] ? o = "<code>" + r(g[16]) + "</code>" : (g[17] || g[1]) && (o = f(g[17] || "--"))), h += l, h += o;
  return (h + a.substring(d2) + $()).replace(/^\n+|\n+$/g, "");
}
var index_svelte_svelte_type_style_lang = 'ul.svelte-1kgxi19{margin:0 0 1em;line-height:1.5}h2.svelte-1kgxi19:before{display:block;content:" ";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}';
const css = {
  code: 'ul.svelte-1kgxi19{margin:0 0 1em;line-height:1.5}h2.svelte-1kgxi19:before{display:block;content:" ";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}',
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport const prerender = true;\\r\\n\\r\\n  import { GRAPHQL_URI } from \\"../../lib/config\\";\\r\\n  import { GET_DOCS } from \\"../../lib/graphql/requests\\";\\r\\n  console.log(GRAPHQL_URI);\\r\\n\\r\\n  /**\\r\\n   * @type {import(\'@sveltejs/kit\').Load}\\r\\n   */\\r\\n  export async function load() {\\r\\n    let items;\\r\\n    try {\\r\\n      const res = await fetch(`${GRAPHQL_URI}`, {\\r\\n        method: \\"POST\\",\\r\\n        headers: {\\r\\n          \\"Content-Type\\": \\"application/json\\",\\r\\n        },\\r\\n        body: JSON.stringify({ query: GET_DOCS }),\\r\\n      });\\r\\n\\r\\n      items = await res.json();\\r\\n      items = items.data.documentations;\\r\\n      console.log(items.data.documentations)\\r\\n    } catch (e) {\\r\\n      console.log(e.message);\\r\\n    }\\r\\n\\r\\n    return {\\r\\n      props: {\\r\\n        items,\\r\\n      },\\r\\n    };\\r\\n  }\\r\\n\\r\\n  let promise = load();\\r\\n</script>\\r\\n\\r\\n<script>\\r\\n  import snarkdown from \\"snarkdown\\";\\r\\n  import OpenGraph from \\"$lib/components/open-graph.svelte\\";\\r\\n\\r\\n  export let items;\\r\\n\\r\\n  function phoneNav() {\\r\\n    var item = document.getElementById(\\"p-nav\\");\\r\\n\\r\\n    item.classList.toggle(\\"hidden\\");\\r\\n  }\\r\\n</script>\\r\\n\\r\\n<OpenGraph\\r\\n  description=\\"Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more\\"\\r\\n  title=\\"Digital Business Keys - Documentation\\"\\r\\n  type=\\"website\\"\\r\\n/>\\r\\n\\r\\n{#await promise}\\r\\n\\r\\n  <p>...loading</p>\\r\\n{:then data}\\r\\n  <div class=\\"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl\\">\\r\\n    <div\\r\\n      id=\\"p-nav\\"\\r\\n      class=\\"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600\\"\\r\\n    >\\r\\n      <div class=\\"md:relative mx-auto lg:float-right lg:px-6\\">\\r\\n        <ul\\r\\n          class=\\"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20\\"\\r\\n        >\\r\\n          {#each items as doc}\\r\\n            <div\\r\\n              class=\\"lg:flex-none flex w-full md:max-w-xs bg-purple text-black\\"\\r\\n            >\\r\\n              <li class=\\"text-black pb-2\\">\\r\\n                <p class=\\"hover:bg-indigo-500 text-black\\">\\r\\n                  <a\\r\\n                    on:click={phoneNav}\\r\\n                    class=\\"text-black\\"\\r\\n                    rel=\\"prefetch\\"\\r\\n                    href=\\"docs#{doc.Slug}\\">{doc.title}</a\\r\\n                  >\\r\\n                </p>\\r\\n              </li>\\r\\n            </div>\\r\\n          {/each}\\r\\n        </ul>\\r\\n      </div>\\r\\n    </div>\\r\\n\\r\\n    <div class=\\"w-full md:w-4/5\\">\\r\\n      <h1\\r\\n        class=\\"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 \\"\\r\\n      >\\r\\n        Documentation\\r\\n      </h1>\\r\\n      <div class=\\"container pt-12 px-6\\">\\r\\n        {#each items as doc}\\r\\n          <div id={doc.Slug} class=\\"mb-12 overflow-auto\\r\\n                    \\">\\r\\n            <h2 class=\\"pb-10\\">{doc.title}</h2>\\r\\n\\r\\n            <article class=\\"prose prose-indigo lg:prose-xl\\">\\r\\n              {@html snarkdown(doc.content)}\\r\\n            </article>\\r\\n          </div>\\r\\n        {/each}\\r\\n      </div>\\r\\n    </div>\\r\\n    <button\\r\\n      on:click={phoneNav}\\r\\n      class=\\"fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden\\"\\r\\n    >\\r\\n      <svg\\r\\n        width=\\"24\\"\\r\\n        height=\\"24\\"\\r\\n        fill=\\"none\\"\\r\\n        class=\\"absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform\\"\\r\\n        ><path\\r\\n          d=\\"M4 8h16M4 16h16\\"\\r\\n          stroke=\\"currentColor\\"\\r\\n          stroke-width=\\"2\\"\\r\\n          stroke-linecap=\\"round\\"\\r\\n          stroke-linejoin=\\"round\\"\\r\\n        /></svg\\r\\n      >\\r\\n    </button>\\r\\n\\r\\n  </div>\\r\\n{/await}\\r\\n\\r\\n<style>ul{margin:0 0 1em;line-height:1.5}h2:before{display:block;content:\\" \\";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}</style>\\r\\n"],"names":[],"mappings":"AAmIO,iBAAE,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,YAAY,GAAG,CAAC,iBAAE,OAAO,CAAC,QAAQ,KAAK,CAAC,QAAQ,GAAG,CAAC,WAAW,MAAM,CAAC,OAAO,KAAK,CAAC,WAAW,MAAM,CAAC,eAAe,IAAI,CAAC"}'
};
const prerender$1 = true;
console.log(GRAPHQL_URI);
async function load$1() {
  let items;
  try {
    const res = await fetch(`${GRAPHQL_URI}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query: GET_DOCS})
    });
    items = await res.json();
    items = items.data.documentations;
    console.log(items.data.documentations);
  } catch (e2) {
    console.log(e2.message);
  }
  return {props: {items}};
}
let promise = load$1();
const Docs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {items} = $$props;
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  $$result.css.add(css);
  return `${validate_component(Open_graph, "OpenGraph").$$render($$result, {
    description: "Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more",
    title: "Digital Business Keys - Documentation",
    type: "website"
  }, {}, {})}

${function(__value) {
    if (is_promise(__value))
      return `

  <p>...loading</p>
`;
    return function(data) {
      return `
  <div class="${"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl"}"><div id="${"p-nav"}" class="${"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600"}"><div class="${"md:relative mx-auto lg:float-right lg:px-6"}"><ul class="${"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20 svelte-1kgxi19"}">${each(items, (doc) => `<div class="${"lg:flex-none flex w-full md:max-w-xs bg-purple text-black"}"><li class="${"text-black pb-2"}"><p class="${"hover:bg-indigo-500 text-black"}"><a class="${"text-black"}" rel="${"prefetch"}" href="${"docs#" + escape(doc.Slug)}">${escape(doc.title)}</a>
                </p></li>
            </div>`)}</ul></div></div>

    <div class="${"w-full md:w-4/5"}"><h1 class="${"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 "}">Documentation
      </h1>
      <div class="${"container pt-12 px-6"}">${each(items, (doc) => `<div${add_attribute("id", doc.Slug, 0)} class="${"mb-12 overflow-auto\r\n                    "}"><h2 class="${"pb-10 svelte-1kgxi19"}">${escape(doc.title)}</h2>

            <article class="${"prose prose-indigo lg:prose-xl"}">${t(doc.content)}</article>
          </div>`)}</div></div>
    <button class="${"fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden"}"><svg width="${"24"}" height="${"24"}" fill="${"none"}" class="${"absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform"}"><path d="${"M4 8h16M4 16h16"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path></svg></button></div>
`;
    }();
  }(promise)}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Docs,
  prerender: prerender$1,
  load: load$1
});
const prerender = true;
async function load({page: page2, fetch: fetch2}) {
  const res = await fetch2(`${GRAPHQL_URI}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({query: GET_DOCS})
  });
  const items = await res.json();
  if (items) {
    const pagename = page2.path;
    console.log(items.data);
    items.data.documentations = items.data.documentations.filter((doc) => pagename.includes(doc.Slug));
    return {pagedata: items.data.documentations[0]};
  }
}
const U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {pagedata} = $$props;
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

<div>${t(pagedata.content)}</div>`;
});
var _slug_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: U5Bslugu5D,
  prerender,
  load
});
export {init, render};
