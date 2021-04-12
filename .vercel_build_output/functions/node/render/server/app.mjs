import {randomBytes, createHash} from "crypto";
import http from "http";
import https from "https";
import zlib from "zlib";
import Stream, {PassThrough as PassThrough$2, pipeline} from "stream";
import {types} from "util";
import Url, {format, parse as parse$1, resolve, URLSearchParams as URLSearchParams$1} from "url";
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
function dataUriToBuffer(uri2) {
  if (!/^data:/i.test(uri2)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri2 = uri2.replace(/\r?\n/g, "");
  const firstComma = uri2.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri2.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri2.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
const {Readable: Readable$1} = Stream;
const wm = new WeakMap();
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
class Blob$1 {
  constructor(blobParts = [], options = {type: ""}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob$1) {
        buffer = element;
      } else {
        buffer = Buffer.from(typeof element === "string" ? element : String(element));
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });
    const type = options.type === void 0 ? "" : String(options.type).toLowerCase();
    wm.set(this, {
      type: /[^\u0020-\u007E]/.test(type) ? "" : type,
      size,
      parts
    });
  }
  get size() {
    return wm.get(this).size;
  }
  get type() {
    return wm.get(this).type;
  }
  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    return Readable$1.from(read(wm.get(this).parts));
  }
  slice(start = 0, end = this.size, type = "") {
    const {size} = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) {
          break;
        }
      }
    }
    const blob = new Blob$1([], {type});
    Object.assign(wm.get(blob), {size: span, parts: blobParts});
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
}
Object.defineProperties(Blob$1.prototype, {
  size: {enumerable: true},
  type: {enumerable: true},
  slice: {enumerable: true}
});
var fetchBlob = Blob$1;
class FetchBaseError extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
}
class FetchError$1 extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
}
const NAME = Symbol.toStringTag;
const isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
const isBlob$1 = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
const isAbortSignal$1 = (object) => {
  return typeof object === "object" && object[NAME] === "AbortSignal";
};
const carriage = "\r\n";
const dashes = "-".repeat(2);
const carriageLength = Buffer.byteLength(carriage);
const getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob$1(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
const getBoundary = () => randomBytes(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob$1(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob$1(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
const INTERNALS$2$1 = Symbol("Body internals");
class Body$1 {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob$1(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof Stream)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = Stream.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2$1] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof Stream) {
      body.on("error", (err) => {
        const error2 = err instanceof FetchBaseError ? err : new FetchError$1(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
        this[INTERNALS$2$1].error = error2;
      });
    }
  }
  get body() {
    return this[INTERNALS$2$1].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2$1].disturbed;
  }
  async arrayBuffer() {
    const {buffer, byteOffset, byteLength} = await consumeBody$1(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2$1].body && this[INTERNALS$2$1].body.type || "";
    const buf = await this.buffer();
    return new fetchBlob([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody$1(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody$1(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody$1(this);
  }
}
Object.defineProperties(Body$1.prototype, {
  body: {enumerable: true},
  bodyUsed: {enumerable: true},
  arrayBuffer: {enumerable: true},
  blob: {enumerable: true},
  json: {enumerable: true},
  text: {enumerable: true}
});
async function consumeBody$1(data) {
  if (data[INTERNALS$2$1].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2$1].disturbed = true;
  if (data[INTERNALS$2$1].error) {
    throw data[INTERNALS$2$1].error;
  }
  let {body} = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob$1(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof Stream)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError$1(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    if (error2 instanceof FetchBaseError) {
      throw error2;
    } else {
      throw new FetchError$1(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError$1(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError$1(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
const clone$1 = (instance, highWaterMark) => {
  let p1;
  let p2;
  let {body} = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof Stream && typeof body.getBoundary !== "function") {
    p1 = new PassThrough$2({highWaterMark});
    p2 = new PassThrough$2({highWaterMark});
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2$1].body = p1;
    body = p2;
  }
  return body;
};
const extractContentType$1 = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob$1(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2$1].boundary}`;
  }
  if (body instanceof Stream) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
const getTotalBytes$1 = (request) => {
  const {body} = request;
  if (body === null) {
    return 0;
  }
  if (isBlob$1(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2$1].boundary);
  }
  return null;
};
const writeToStream$1 = (dest, {body}) => {
  if (body === null) {
    dest.end();
  } else if (isBlob$1(body)) {
    body.stream().pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
const validateHeaderName = typeof http.validateHeaderName === "function" ? http.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(err, "code", {value: "ERR_INVALID_HTTP_TOKEN"});
    throw err;
  }
};
const validateHeaderValue = typeof http.validateHeaderValue === "function" ? http.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const err = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(err, "code", {value: "ERR_INVALID_CHAR"});
    throw err;
  }
};
class Headers$1 extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers$1) {
      const raw = init2.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback) {
    for (const name of this.keys()) {
      callback(this.get(name), name);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
}
Object.defineProperties(Headers$1.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = {enumerable: true};
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers$1(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch (e2) {
      return false;
    }
  }));
}
const redirectStatus = new Set([301, 302, 303, 307, 308]);
const isRedirect = (code) => {
  return redirectStatus.has(code);
};
const INTERNALS$1$1 = Symbol("Response internals");
class Response$1 extends Body$1 {
  constructor(body = null, options = {}) {
    super(body, options);
    const status = options.status || 200;
    const headers = new Headers$1(options.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType$1(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1$1] = {
      url: options.url,
      status,
      statusText: options.statusText || "",
      headers,
      counter: options.counter,
      highWaterMark: options.highWaterMark
    };
  }
  get url() {
    return this[INTERNALS$1$1].url || "";
  }
  get status() {
    return this[INTERNALS$1$1].status;
  }
  get ok() {
    return this[INTERNALS$1$1].status >= 200 && this[INTERNALS$1$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1$1].highWaterMark;
  }
  clone() {
    return new Response$1(clone$1(this, this.highWaterMark), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response$1(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
}
Object.defineProperties(Response$1.prototype, {
  url: {enumerable: true},
  status: {enumerable: true},
  ok: {enumerable: true},
  redirected: {enumerable: true},
  statusText: {enumerable: true},
  headers: {enumerable: true},
  clone: {enumerable: true}
});
const getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash.length] === "?" ? "?" : "";
};
const INTERNALS$3 = Symbol("Request internals");
const isRequest$1 = (object) => {
  return typeof object === "object" && typeof object[INTERNALS$3] === "object";
};
class Request$1 extends Body$1 {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest$1(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest$1(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest$1(input) && input.body !== null ? clone$1(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers$1(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType$1(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest$1(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal !== null && !isAbortSignal$1(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS$3] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS$3].method;
  }
  get url() {
    return format(this[INTERNALS$3].parsedURL);
  }
  get headers() {
    return this[INTERNALS$3].headers;
  }
  get redirect() {
    return this[INTERNALS$3].redirect;
  }
  get signal() {
    return this[INTERNALS$3].signal;
  }
  clone() {
    return new Request$1(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
}
Object.defineProperties(Request$1.prototype, {
  method: {enumerable: true},
  url: {enumerable: true},
  headers: {enumerable: true},
  redirect: {enumerable: true},
  clone: {enumerable: true},
  signal: {enumerable: true}
});
const getNodeRequestOptions$1 = (request) => {
  const {parsedURL} = request[INTERNALS$3];
  const headers = new Headers$1(request[INTERNALS$3].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes$1(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let {agent} = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
class AbortError$1 extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
}
const supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch$2(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request$1(url, options_);
    const options = getNodeRequestOptions$1(request);
    if (!supportedSchemas.has(options.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options.protocol === "data:") {
      const data = src(request.url);
      const response2 = new Response$1(data, {headers: {"Content-Type": data.typeFull}});
      resolve2(response2);
      return;
    }
    const send2 = (options.protocol === "https:" ? https : http).request;
    const {signal} = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError$1("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof Stream.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send2(options);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError$1(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError$1(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error2) {
                reject(error2);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError$1(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers$1(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof Stream.Readable) {
              reject(new FetchError$1("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch$2(new Request$1(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = pipeline(response_, new PassThrough$2(), (error2) => {
        reject(error2);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response$1(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: zlib.Z_SYNC_FLUSH,
        finishFlush: zlib.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = pipeline(body, zlib.createGunzip(zlibOptions), (error2) => {
          reject(error2);
        });
        response = new Response$1(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = pipeline(response_, new PassThrough$2(), (error2) => {
          reject(error2);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = pipeline(body, zlib.createInflate(), (error2) => {
              reject(error2);
            });
          } else {
            body = pipeline(body, zlib.createInflateRaw(), (error2) => {
              reject(error2);
            });
          }
          response = new Response$1(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = pipeline(body, zlib.createBrotliDecompress(), (error2) => {
          reject(error2);
        });
        response = new Response$1(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response$1(body, responseOptions);
      resolve2(response);
    });
    writeToStream$1(request_, request);
  });
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
const s = JSON.stringify;
async function respond$1({request, options, $session, route, status = 200, error: error2}) {
  const serialized_session = try_serialize($session, (error3) => {
    throw new Error(`Failed to serialize session data: ${error3.message}`);
  });
  const serialized_data = [];
  const match = error2 ? null : route.pattern.exec(request.path);
  const params = error2 ? {} : route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let uses_credentials = false;
  const fetcher = async (resource, opts = {}) => {
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
    if (options.local && url.startsWith(options.paths.assets)) {
      url = url.replace(options.paths.assets, "");
    }
    const parsed = parse$1(url);
    let response;
    if (parsed.protocol) {
      response = await fetch$2(parsed.href, opts);
    } else {
      const resolved = resolve(request.path, parsed.pathname);
      const filename = resolved.slice(1);
      const filename_html = `${filename}/index.html`;
      const asset = options.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
      if (asset) {
        if (options.get_static_file) {
          response = new Response$1(options.get_static_file(asset.file), {
            headers: {
              "content-type": asset.type
            }
          });
        } else {
          response = await fetch$2(`http://${page2.host}/${asset.file}`, opts);
        }
      }
      if (!response) {
        const headers2 = {...opts.headers};
        if (opts.credentials !== "omit") {
          uses_credentials = true;
          headers2.cookie = request.headers.cookie;
          if (!headers2.authorization) {
            headers2.authorization = request.headers.authorization;
          }
        }
        const rendered2 = await ssr$1({
          host: request.host,
          method: opts.method || "GET",
          headers: headers2,
          path: resolved,
          body: opts.body,
          query: new URLSearchParams$1(parsed.query || "")
        }, {
          ...options,
          fetched: url,
          initiator: route
        });
        if (rendered2) {
          if (options.dependencies) {
            options.dependencies.set(resolved, rendered2);
          }
          response = new Response$1(rendered2.body, {
            status: rendered2.status,
            headers: rendered2.headers
          });
        }
      }
    }
    if (response && page_config.hydrate) {
      const proxy = new Proxy(response, {
        get(response2, key, receiver) {
          async function text() {
            const body2 = await response2.text();
            const headers2 = {};
            response2.headers.forEach((value, key2) => {
              if (key2 !== "etag" && key2 !== "set-cookie")
                headers2[key2] = value;
            });
            serialized_data.push({
              url,
              json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers2)},"body":${escape$1(body2)}}`
            });
            return body2;
          }
          if (key === "text") {
            return text;
          }
          if (key === "json") {
            return async () => {
              return JSON.parse(await text());
            };
          }
          return Reflect.get(response2, key, receiver);
        }
      });
      return proxy;
    }
    return response || new Response$1("Not found", {
      status: 404
    });
  };
  const component_promises = error2 ? [options.manifest.layout()] : [options.manifest.layout(), ...route.parts.map((part) => part.load())];
  const components2 = [];
  const props_promises = [];
  let context = {};
  let maxage;
  let page_component;
  try {
    page_component = error2 ? {ssr: options.ssr, router: options.router, hydrate: options.hydrate} : await component_promises[component_promises.length - 1];
  } catch (e2) {
    return await respond$1({
      request,
      options,
      $session,
      route: null,
      status: 500,
      error: e2 instanceof Error ? e2 : {name: "Error", message: e2.toString()}
    });
  }
  const page_config = {
    ssr: "ssr" in page_component ? page_component.ssr : options.ssr,
    router: "router" in page_component ? page_component.router : options.router,
    hydrate: "hydrate" in page_component ? page_component.hydrate : options.hydrate
  };
  if (options.only_render_prerenderable_pages) {
    if (error2) {
      return {
        status,
        headers: {},
        body: error2.message
      };
    }
    if (!page_component.prerender) {
      return {
        status: 204,
        headers: {},
        body: null
      };
    }
  }
  let rendered;
  if (page_config.ssr) {
    for (let i = 0; i < component_promises.length; i += 1) {
      let loaded;
      try {
        const mod = await component_promises[i];
        components2[i] = mod.default;
        if (mod.load) {
          loaded = await mod.load.call(null, {
            page: page2,
            get session() {
              uses_credentials = true;
              return $session;
            },
            fetch: fetcher,
            context: {...context}
          });
          if (!loaded && mod === page_component)
            return;
        }
      } catch (e2) {
        if (error2)
          throw e2 instanceof Error ? e2 : new Error(e2);
        loaded = {
          error: e2 instanceof Error ? e2 : {name: "Error", message: e2.toString()},
          status: 500
        };
      }
      if (loaded) {
        loaded = normalize(loaded);
        if (loaded.error) {
          return await respond$1({
            request,
            options,
            $session,
            route: null,
            status: loaded.status,
            error: loaded.error
          });
        }
        if (loaded.redirect) {
          return {
            status: loaded.status,
            headers: {
              location: loaded.redirect
            }
          };
        }
        if (loaded.context) {
          context = {
            ...context,
            ...loaded.context
          };
        }
        maxage = loaded.maxage || 0;
        props_promises[i] = loaded.props;
      }
    }
    const session2 = writable($session);
    let session_tracking_active = false;
    const unsubscribe = session2.subscribe(() => {
      if (session_tracking_active)
        uses_credentials = true;
    });
    session_tracking_active = true;
    if (error2) {
      if (options.dev) {
        error2.stack = await options.get_stack(error2);
      } else {
        error2.stack = String(error2);
      }
    }
    const props = {
      status,
      error: error2,
      stores: {
        page: writable(null),
        navigating: writable(null),
        session: session2
      },
      page: page2,
      components: components2
    };
    for (let i = 0; i < props_promises.length; i += 1) {
      props[`props_${i}`] = await props_promises[i];
    }
    try {
      rendered = options.root.render(props);
    } catch (e2) {
      if (error2)
        throw e2 instanceof Error ? e2 : new Error(e2);
      return await respond$1({
        request,
        options,
        $session,
        route: null,
        status: 500,
        error: e2 instanceof Error ? e2 : {name: "Error", message: e2.toString()}
      });
    } finally {
      unsubscribe();
    }
  } else {
    rendered = {
      head: "",
      html: "",
      css: ""
    };
  }
  const js_deps = route && page_config.ssr ? route.js : [];
  const css_deps = route && page_config.ssr ? route.css : [];
  const style = route && page_config.ssr ? route.style : "";
  const prefix = `${options.paths.assets}/${options.app_dir}`;
  const links = options.amp ? `<style amp-custom>${style || (await Promise.all(css_deps.map((dep) => options.get_amp_css(dep)))).join("\n")}</style>` : [
    ...js_deps.map((dep) => `<link rel="modulepreload" href="${prefix}/${dep}">`),
    ...css_deps.map((dep) => `<link rel="stylesheet" href="${prefix}/${dep}">`)
  ].join("\n			");
  let init2 = "";
  if (options.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"></script>`;
  } else if (page_config.router || page_config.hydrate) {
    init2 = `
		<script type="module">
			import { start } from ${s(options.entry)};
			start({
				target: ${options.target ? `document.querySelector(${s(options.target)})` : "document.body"},
				paths: ${s(options.paths)},
				session: ${serialized_session},
				host: ${request.host ? s(request.host) : "location.host"},
				route: ${!!page_config.router},
				hydrate: ${page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: ${route ? `[
						${(route ? route.parts : []).map((part) => `import(${s(options.get_component_path(part.id))})`).join(",\n						")}
					]` : "[]"},
					page: {
						host: ${request.host ? s(request.host) : "location.host"}, // TODO this is redundant
						path: ${s(request.path)},
						query: new URLSearchParams(${s(request.query.toString())}),
						params: ${s(params)}
					}
				}` : "null"}
			});
		</script>`;
  }
  const head = [
    rendered.head,
    style && !options.amp ? `<style data-svelte>${style}</style>` : "",
    links,
    init2
  ].join("\n\n");
  const body = options.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({url, json}) => `<script type="svelte-data" url="${url}">${json}</script>`).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${uses_credentials ? "private" : "public"}, max-age=${maxage}`;
  }
  return {
    status,
    headers,
    body: options.template({head, body})
  };
}
async function render_page(request, route, options) {
  if (options.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options.hooks.getSession({context: request.context});
  const response = await respond$1({
    request,
    options,
    $session,
    route,
    status: route ? 200 : 404,
    error: route ? null : new Error(`Not found: ${request.path}`)
  });
  if (response) {
    return response;
  }
  if (options.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${options.fetched}`
    };
  }
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
async function render_route(request, route) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler({...request, params});
    if (response) {
      if (typeof response !== "object" || response.body == null) {
        return {
          status: 500,
          body: `Invalid response from route ${request.path}; ${response.body == null ? "body is missing" : `expected an object, got ${typeof response}`}`,
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
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function md5(body) {
  return createHash("md5").update(body).digest("hex");
}
async function ssr$1(incoming, options) {
  if (incoming.path.endsWith("/") && incoming.path !== "/") {
    const q = incoming.query.toString();
    return {
      status: 301,
      headers: {
        location: incoming.path.slice(0, -1) + (q ? `?${q}` : "")
      }
    };
  }
  const context = await options.hooks.getContext(incoming) || {};
  try {
    return await options.hooks.handle({
      ...incoming,
      params: null,
      context
    }, async (request) => {
      for (const route of options.manifest.routes) {
        if (!route.pattern.test(request.path))
          continue;
        const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options);
        if (response) {
          if (response.status === 200) {
            if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
              const etag = `"${md5(response.body)}"`;
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
      return await render_page(request, null, options);
    });
  } catch (e2) {
    if (e2 && e2.stack) {
      e2.stack = await options.get_stack(e2);
    }
    console.error(e2 && e2.stack || e2);
    return {
      status: 500,
      headers: {},
      body: options.dev ? e2.stack : e2.message
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
    render: (props = {}, options = {}) => {
      on_destroy = [];
      const result = {title: "", head: "", css: new Set()};
      const html = $$render(result, props, {}, options);
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
var global$1 = '/*! tailwindcss v2.0.4 | MIT License | https://tailwindcss.com*/\n\n/*! modern-normalize v1.0.0 | MIT License | https://github.com/sindresorhus/modern-normalize */:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji}hr{height:0;color:inherit}abbr[title]{-webkit-text-decoration:underline dotted;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}[type=button],[type=submit],button{-webkit-appearance:button}legend{padding:0}progress{vertical-align:baseline}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}button{background-color:transparent;background-image:none}button:focus{outline:1px dotted;outline:5px auto -webkit-focus-ring-color}fieldset,ol,ul{margin:0;padding:0}ol,ul{list-style:none}html{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{font-family:inherit;line-height:inherit}*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}hr{border-top-width:1px}img{border-style:solid}textarea{resize:vertical}input::-moz-placeholder, textarea::-moz-placeholder{opacity:1;color:#9ca3af}input:-ms-input-placeholder, textarea:-ms-input-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button{cursor:pointer}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}button,input,optgroup,select,textarea{padding:0;line-height:inherit;color:inherit}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.prose{color:#374151;max-width:65ch}.prose [class~=lead]{color:#4b5563;font-size:1.25em;line-height:1.6;margin-top:1.2em;margin-bottom:1.2em}.prose a{color:#111827;text-decoration:underline;font-weight:500}.prose strong{color:#111827;font-weight:600}.prose ol[type=A]{--list-counter-style:upper-alpha}.prose ol[type=a]{--list-counter-style:lower-alpha}.prose ol[type=i]{--list-counter-style:lower-roman}.prose ol[type="1"]{--list-counter-style:decimal}.prose ol>li{position:relative;padding-left:1.75em}.prose ol>li:before{content:counter(list-item,var(--list-counter-style,decimal)) ".";position:absolute;font-weight:400;color:#6b7280;left:0}.prose ul>li{position:relative;padding-left:1.75em}.prose ul>li:before{content:"";position:absolute;background-color:#d1d5db;border-radius:50%;width:.375em;height:.375em;top:.6875em;left:.25em}.prose hr{border-color:#e5e7eb;border-top-width:1px;margin-top:3em;margin-bottom:3em}.prose blockquote{font-weight:500;font-style:italic;color:#111827;border-left-width:.25rem;border-left-color:#e5e7eb;quotes:"\\201C""\\201D""\\2018""\\2019";margin-top:1.6em;margin-bottom:1.6em;padding-left:1em}.prose blockquote p:first-of-type:before{content:open-quote}.prose blockquote p:last-of-type:after{content:close-quote}.prose h1{color:#111827;font-weight:800;font-size:2.25em;margin-top:0;margin-bottom:.8888889em;line-height:1.1111111}.prose h2{color:#111827;font-weight:700;font-size:1.5em;margin-top:2em;margin-bottom:1em;line-height:1.3333333}.prose h3{font-size:1.25em;margin-top:1.6em;margin-bottom:.6em;line-height:1.6}.prose h3,.prose h4{color:#111827;font-weight:600}.prose h4{margin-top:1.5em;margin-bottom:.5em;line-height:1.5}.prose figure figcaption{color:#6b7280;font-size:.875em;line-height:1.4285714;margin-top:.8571429em}.prose code{color:#111827;font-weight:600;font-size:.875em}.prose code:after,.prose code:before{content:"`"}.prose a code{color:#111827}.prose pre{color:#e5e7eb;background-color:#1f2937;overflow-x:auto;font-size:.875em;line-height:1.7142857;margin-top:1.7142857em;margin-bottom:1.7142857em;border-radius:.375rem;padding:.8571429em 1.1428571em}.prose pre code{background-color:transparent;border-width:0;border-radius:0;padding:0;font-weight:400;color:inherit;font-size:inherit;font-family:inherit;line-height:inherit}.prose pre code:after,.prose pre code:before{content:none}.prose table{width:100%;table-layout:auto;text-align:left;margin-top:2em;margin-bottom:2em;font-size:.875em;line-height:1.7142857}.prose thead{color:#111827;font-weight:600;border-bottom-width:1px;border-bottom-color:#d1d5db}.prose thead th{vertical-align:bottom;padding-right:.5714286em;padding-bottom:.5714286em;padding-left:.5714286em}.prose tbody tr{border-bottom-width:1px;border-bottom-color:#e5e7eb}.prose tbody tr:last-child{border-bottom-width:0}.prose tbody td{vertical-align:top;padding:.5714286em}.prose{font-size:1rem;line-height:1.75}.prose p{margin-top:1.25em;margin-bottom:1.25em}.prose figure,.prose img,.prose video{margin-top:2em;margin-bottom:2em}.prose figure>*{margin-top:0;margin-bottom:0}.prose h2 code{font-size:.875em}.prose h3 code{font-size:.9em}.prose ol,.prose ul{margin-top:1.25em;margin-bottom:1.25em}.prose li{margin-top:.5em;margin-bottom:.5em}.prose>ul>li p{margin-top:.75em;margin-bottom:.75em}.prose>ul>li>:first-child{margin-top:1.25em}.prose>ul>li>:last-child{margin-bottom:1.25em}.prose>ol>li>:first-child{margin-top:1.25em}.prose>ol>li>:last-child{margin-bottom:1.25em}.prose ol ol,.prose ol ul,.prose ul ol,.prose ul ul{margin-top:.75em;margin-bottom:.75em}.prose h2+*,.prose h3+*,.prose h4+*,.prose hr+*{margin-top:0}.prose thead th:first-child{padding-left:0}.prose thead th:last-child{padding-right:0}.prose tbody td:first-child{padding-left:0}.prose tbody td:last-child{padding-right:0}.prose>:first-child{margin-top:0}.prose>:last-child{margin-bottom:0}.prose-indigo a,.prose-indigo a code{color:#4f46e5}.space-x-4>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(1rem*var(--tw-space-x-reverse));margin-left:calc(1rem*(1 - var(--tw-space-x-reverse)))}.bg-white{--tw-bg-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity))}.bg-gray-100{--tw-bg-opacity:1;background-color:rgba(243,244,246,var(--tw-bg-opacity))}.bg-gray-200{--tw-bg-opacity:1;background-color:rgba(229,231,235,var(--tw-bg-opacity))}.bg-gray-400{--tw-bg-opacity:1;background-color:rgba(156,163,175,var(--tw-bg-opacity))}.bg-gray-900{--tw-bg-opacity:1;background-color:rgba(17,24,39,var(--tw-bg-opacity))}.bg-indigo-100{--tw-bg-opacity:1;background-color:rgba(224,231,255,var(--tw-bg-opacity))}.bg-indigo-500{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}.hover\\:bg-gray-200:hover{--tw-bg-opacity:1;background-color:rgba(229,231,235,var(--tw-bg-opacity))}.hover\\:bg-gray-500:hover{--tw-bg-opacity:1;background-color:rgba(107,114,128,var(--tw-bg-opacity))}.hover\\:bg-indigo-500:hover{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}.hover\\:bg-indigo-600:hover{--tw-bg-opacity:1;background-color:rgba(79,70,229,var(--tw-bg-opacity))}.focus\\:bg-white:focus{--tw-bg-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity))}.bg-opacity-50{--tw-bg-opacity:0.5}.border-gray-200{--tw-border-opacity:1;border-color:rgba(229,231,235,var(--tw-border-opacity))}.border-gray-300{--tw-border-opacity:1;border-color:rgba(209,213,219,var(--tw-border-opacity))}.border-gray-900{--tw-border-opacity:1;border-color:rgba(17,24,39,var(--tw-border-opacity))}.border-indigo-500{--tw-border-opacity:1;border-color:rgba(99,102,241,var(--tw-border-opacity))}.hover\\:border-white:hover{--tw-border-opacity:1;border-color:rgba(255,255,255,var(--tw-border-opacity))}.focus\\:border-indigo-500:focus{--tw-border-opacity:1;border-color:rgba(99,102,241,var(--tw-border-opacity))}.rounded{border-radius:.25rem}.rounded-md{border-radius:.375rem}.rounded-lg{border-radius:.5rem}.rounded-full{border-radius:9999px}.rounded-bl{border-bottom-left-radius:.25rem}.border-0{border-width:0}.border-2{border-width:2px}.border{border-width:1px}.border-t{border-top-width:1px}.border-b{border-bottom-width:1px}.block{display:block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.hidden{display:none}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.flex-initial{flex:0 1 auto}.flex-grow{flex-grow:1}.flex-shrink-0{flex-shrink:0}.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}.font-extrabold{font-weight:800}.h-3{height:.75rem}.h-4{height:1rem}.h-5{height:1.25rem}.h-6{height:1.5rem}.h-8{height:2rem}.h-12{height:3rem}.h-16{height:4rem}.h-32{height:8rem}.h-full{height:100%}.text-xs{font-size:.75rem;line-height:1rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem}.text-lg,.text-xl{line-height:1.75rem}.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-5xl{font-size:3rem;line-height:1}.leading-6{line-height:1.5rem}.leading-7{line-height:1.75rem}.leading-8{line-height:2rem}.leading-none{line-height:1}.leading-tight{line-height:1.25}.leading-normal{line-height:1.5}.leading-relaxed{line-height:1.625}.list-none{list-style-type:none}.m-2{margin:.5rem}.-m-2{margin:-.5rem}.-m-4{margin:-1rem}.my-4{margin-top:1rem;margin-bottom:1rem}.mx-auto{margin-left:auto;margin-right:auto}.mb-1{margin-bottom:.25rem}.ml-1{margin-left:.25rem}.mt-2{margin-top:.5rem}.mr-2{margin-right:.5rem}.mb-2{margin-bottom:.5rem}.ml-2{margin-left:.5rem}.mt-3{margin-top:.75rem}.mr-3{margin-right:.75rem}.mb-3{margin-bottom:.75rem}.ml-3{margin-left:.75rem}.mt-4{margin-top:1rem}.mr-4{margin-right:1rem}.mb-4{margin-bottom:1rem}.ml-4{margin-left:1rem}.mb-5{margin-bottom:1.25rem}.mt-6{margin-top:1.5rem}.mr-6{margin-right:1.5rem}.mb-6{margin-bottom:1.5rem}.mt-8{margin-top:2rem}.mb-8{margin-bottom:2rem}.mt-10{margin-top:2.5rem}.mb-10{margin-bottom:2.5rem}.mb-12{margin-bottom:3rem}.mt-20{margin-top:5rem}.mb-20{margin-bottom:5rem}.mt-auto{margin-top:auto}.ml-auto{margin-left:auto}.-mt-3{margin-top:-.75rem}.-ml-3{margin-left:-.75rem}.-mb-10{margin-bottom:-2.5rem}.max-h-screen{max-height:100vh}.max-w-xs{max-width:20rem}.max-w-5xl{max-width:64rem}.object-cover{-o-object-fit:cover;object-fit:cover}.object-center{-o-object-position:center;object-position:center}.focus\\:outline-none:focus,.outline-none{outline:2px solid transparent;outline-offset:2px}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.p-2{padding:.5rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.px-2{padding-left:.5rem;padding-right:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.px-3{padding-left:.75rem;padding-right:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.px-4{padding-left:1rem;padding-right:1rem}.py-5{padding-top:1.25rem;padding-bottom:1.25rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-24{padding-top:6rem;padding-bottom:6rem}.pr-0{padding-right:0}.pb-2{padding-bottom:.5rem}.pt-4{padding-top:1rem}.pb-4{padding-bottom:1rem}.pb-5{padding-bottom:1.25rem}.pt-8{padding-top:2rem}.pb-10{padding-bottom:2.5rem}.pt-12{padding-top:3rem}.pb-12{padding-bottom:3rem}.pt-24{padding-top:6rem}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.top-0{top:0}.right-0{right:0}.right-4{right:1rem}.bottom-4{bottom:1rem}.top-1\\/2{top:50%}.left-1\\/2{left:50%}.resize-none{resize:none}*{--tw-shadow:0 0 transparent}.shadow-lg{--tw-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);box-shadow:var(--tw-ring-offset-shadow,0 0 transparent),var(--tw-ring-shadow,0 0 transparent),var(--tw-shadow)}*{--tw-ring-inset:var(--tw-empty,/*!*/ /*!*/);--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,0.5);--tw-ring-offset-shadow:0 0 transparent;--tw-ring-shadow:0 0 transparent}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 transparent)}.focus\\:ring-indigo-200:focus{--tw-ring-opacity:1;--tw-ring-color:rgba(199,210,254,var(--tw-ring-opacity))}.text-center{text-align:center}.text-right{text-align:right}.text-black{--tw-text-opacity:1;color:rgba(0,0,0,var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}.text-gray-50{--tw-text-opacity:1;color:rgba(249,250,251,var(--tw-text-opacity))}.text-gray-300{--tw-text-opacity:1;color:rgba(209,213,219,var(--tw-text-opacity))}.text-gray-400{--tw-text-opacity:1;color:rgba(156,163,175,var(--tw-text-opacity))}.text-gray-500{--tw-text-opacity:1;color:rgba(107,114,128,var(--tw-text-opacity))}.text-gray-600{--tw-text-opacity:1;color:rgba(75,85,99,var(--tw-text-opacity))}.text-gray-700{--tw-text-opacity:1;color:rgba(55,65,81,var(--tw-text-opacity))}.text-gray-800{--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity))}.text-gray-900{--tw-text-opacity:1;color:rgba(17,24,39,var(--tw-text-opacity))}.text-indigo-300{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}.hover\\:text-white:hover{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}.hover\\:text-indigo-500:hover{--tw-text-opacity:1;color:rgba(99,102,241,var(--tw-text-opacity))}.hover\\:underline:hover{text-decoration:underline}.tracking-tight{letter-spacing:-.025em}.tracking-widest{letter-spacing:.1em}.w-3{width:.75rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-8{width:2rem}.w-12{width:3rem}.w-16{width:4rem}.w-72{width:18rem}.w-80{width:20rem}.w-auto{width:auto}.w-1\\/2{width:50%}.w-2\\/5{width:40%}.w-full{width:100%}.z-0{z-index:0}.z-10{z-index:10}.z-50{z-index:50}.gap-2{gap:.5rem}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.auto-cols-min{grid-auto-columns:-webkit-min-content;grid-auto-columns:min-content}.transform{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;transform:translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transition{transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:background-color,border-color,color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.duration-200{transition-duration:.2s}.duration-300{transition-duration:.3s}:root{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif}section{margin-left:auto;margin-right:auto;max-width:64rem;padding:4rem 2rem}body{--tw-bg-opacity:1;background-color:rgba(17,24,39,var(--tw-bg-opacity));font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--tw-text-opacity:1;color:rgba(243,244,246,var(--tw-text-opacity));font-weight:400;font-size:1rem;line-height:1.5rem;line-height:1.5;letter-spacing:0;overflow-wrap:break-word}main{text-align:center;padding:1rem;margin-left:auto;margin-right:auto}button{border-radius:.25rem;border-width:1px;padding:.5rem 2rem;--tw-border-opacity:1;border-color:rgba(75,85,99,var(--tw-border-opacity));--tw-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);box-shadow:var(--tw-ring-offset-shadow,0 0 transparent),var(--tw-ring-shadow,0 0 transparent),var(--tw-shadow);outline:2px solid transparent;outline-offset:2px}@media (min-width:640px){h1{max-width:none}}h2,h3,h4,h5,span{color:rgba(165,180,252,var(--tw-text-opacity))}a,h2,h3,h4,h5,span{--tw-text-opacity:1}a{color:rgba(249,250,251,var(--tw-text-opacity))}p{letter-spacing:.025em}input:focus{--tw-bg-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity))}input{--tw-bg-opacity:0.5;border-color:rgba(17,24,39,var(--tw-border-opacity))}input,input:focus{--tw-border-opacity:1}input:focus{border-color:rgba(99,102,241,var(--tw-border-opacity))}input{border-radius:.25rem;border-width:1px;font-size:1rem;line-height:1.5rem;line-height:2rem;outline:2px solid transparent;outline-offset:2px;padding:.25rem .75rem}input:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 transparent);--tw-ring-opacity:1;--tw-ring-color:rgba(199,210,254,var(--tw-ring-opacity))}input{--tw-text-opacity:1;color:rgba(55,65,81,var(--tw-text-opacity));width:100%;transition-property:background-color,border-color,color,fill,stroke;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.2s;margin-bottom:.5rem}@media (min-width:640px){.sm\\:flex-row{flex-direction:row}.sm\\:justify-start{justify-content:flex-start}.sm\\:h-full{height:100%}.sm\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.sm\\:text-4xl{font-size:2.25rem;line-height:2.5rem}.sm\\:mt-0{margin-top:0}.sm\\:ml-auto{margin-left:auto}.sm\\:text-left{text-align:left}}@media (min-width:768px){.md\\:border-gray-600{--tw-border-opacity:1;border-color:rgba(75,85,99,var(--tw-border-opacity))}.md\\:border-r-4{border-right-width:4px}.md\\:flex{display:flex}.md\\:flex-row{flex-direction:row}.md\\:flex-row-reverse{flex-direction:row-reverse}.md\\:flex-col{flex-direction:column}.md\\:flex-nowrap{flex-wrap:nowrap}.md\\:items-center{align-items:center}.md\\:h-3\\/6{height:50%}.md\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.md\\:mt-0{margin-top:0}.md\\:mr-0{margin-right:0}.md\\:mb-0{margin-bottom:0}.md\\:ml-auto{margin-left:auto}.md\\:max-w-xs{max-width:20rem}.md\\:overflow-auto{overflow:auto}.md\\:pt-8{padding-top:2rem}.md\\:pr-10{padding-right:2.5rem}.md\\:pr-16{padding-right:4rem}.md\\:pl-20{padding-left:5rem}.md\\:relative{position:relative}.md\\:left-0{left:0}.md\\:bottom-10{bottom:2.5rem}.md\\:top-20{top:5rem}.md\\:text-left{text-align:left}.md\\:text-center{text-align:center}.md\\:w-auto{width:auto}.md\\:w-1\\/2{width:50%}.md\\:w-1\\/3{width:33.333333%}.md\\:w-2\\/3{width:66.666667%}.md\\:w-1\\/5{width:20%}.md\\:w-4\\/5{width:80%}}@media (min-width:1024px){.lg\\:prose-xl{font-size:1.25rem;line-height:1.8}.lg\\:prose-xl p{margin-top:1.2em;margin-bottom:1.2em}.lg\\:prose-xl [class~=lead]{font-size:1.2em;line-height:1.5;margin-top:1em;margin-bottom:1em}.lg\\:prose-xl blockquote{margin-top:1.6em;margin-bottom:1.6em;padding-left:1.0666667em}.lg\\:prose-xl h1{font-size:2.8em;margin-top:0;margin-bottom:.8571429em;line-height:1}.lg\\:prose-xl h2{font-size:1.8em;margin-top:1.5555556em;margin-bottom:.8888889em;line-height:1.1111111}.lg\\:prose-xl h3{font-size:1.5em;margin-top:1.6em;margin-bottom:.6666667em;line-height:1.3333333}.lg\\:prose-xl h4{margin-top:1.8em;margin-bottom:.6em;line-height:1.6}.lg\\:prose-xl figure,.lg\\:prose-xl img,.lg\\:prose-xl video{margin-top:2em;margin-bottom:2em}.lg\\:prose-xl figure>*{margin-top:0;margin-bottom:0}.lg\\:prose-xl figure figcaption{font-size:.9em;line-height:1.5555556;margin-top:1em}.lg\\:prose-xl code{font-size:.9em}.lg\\:prose-xl h2 code{font-size:.8611111em}.lg\\:prose-xl h3 code{font-size:.9em}.lg\\:prose-xl pre{font-size:.9em;line-height:1.7777778;margin-top:2em;margin-bottom:2em;border-radius:.5rem;padding:1.1111111em 1.3333333em}.lg\\:prose-xl ol,.lg\\:prose-xl ul{margin-top:1.2em;margin-bottom:1.2em}.lg\\:prose-xl li{margin-top:.6em;margin-bottom:.6em}.lg\\:prose-xl ol>li{padding-left:1.8em}.lg\\:prose-xl ol>li:before{left:0}.lg\\:prose-xl ul>li{padding-left:1.8em}.lg\\:prose-xl ul>li:before{width:.35em;height:.35em;top:.725em;left:.25em}.lg\\:prose-xl>ul>li p{margin-top:.8em;margin-bottom:.8em}.lg\\:prose-xl>ul>li>:first-child{margin-top:1.2em}.lg\\:prose-xl>ul>li>:last-child{margin-bottom:1.2em}.lg\\:prose-xl>ol>li>:first-child{margin-top:1.2em}.lg\\:prose-xl>ol>li>:last-child{margin-bottom:1.2em}.lg\\:prose-xl ol ol,.lg\\:prose-xl ol ul,.lg\\:prose-xl ul ol,.lg\\:prose-xl ul ul{margin-top:.8em;margin-bottom:.8em}.lg\\:prose-xl hr{margin-top:2.8em;margin-bottom:2.8em}.lg\\:prose-xl h2+*,.lg\\:prose-xl h3+*,.lg\\:prose-xl h4+*,.lg\\:prose-xl hr+*{margin-top:0}.lg\\:prose-xl table{font-size:.9em;line-height:1.5555556}.lg\\:prose-xl thead th{padding-right:.6666667em;padding-bottom:.8888889em;padding-left:.6666667em}.lg\\:prose-xl thead th:first-child{padding-left:0}.lg\\:prose-xl thead th:last-child{padding-right:0}.lg\\:prose-xl tbody td{padding:.8888889em .6666667em}.lg\\:prose-xl tbody td:first-child{padding-left:0}.lg\\:prose-xl tbody td:last-child{padding-right:0}.lg\\:prose-xl>:first-child{margin-top:0}.lg\\:prose-xl>:last-child{margin-bottom:0}.lg\\:block{display:block}.lg\\:inline-block{display:inline-block}.lg\\:flex{display:flex}.lg\\:hidden{display:none}.lg\\:items-start{align-items:flex-start}.lg\\:items-center{align-items:center}.lg\\:flex-none{flex:none}.lg\\:flex-grow{flex-grow:1}.lg\\:float-right{float:right}.lg\\:mx-0{margin-left:0;margin-right:0}.lg\\:mt-0{margin-top:0}.lg\\:mb-0{margin-bottom:0}.lg\\:overflow-auto{overflow:auto}.lg\\:py-2{padding-top:.5rem;padding-bottom:.5rem}.lg\\:py-6{padding-top:1.5rem;padding-bottom:1.5rem}.lg\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.lg\\:pr-0{padding-right:0}.lg\\:pl-12{padding-left:3rem}.lg\\:text-left{text-align:left}.lg\\:text-center{text-align:center}.lg\\:w-auto{width:auto}.lg\\:w-1\\/2{width:50%}.lg\\:w-2\\/3{width:66.666667%}.lg\\:w-1\\/4{width:25%}.lg\\:w-3\\/5{width:60%}.lg\\:w-2\\/6{width:33.333333%}}@media (min-width:1280px){.xl\\:w-1\\/3{width:33.333333%}}';
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
var header_svelte = "a.svelte-1i5ehjo{font-size:1rem;line-height:1.5rem;margin-top:1rem;display:inline;margin-right:1rem;color:rgba(255,255,255,var(--tw-text-opacity))}a.svelte-1i5ehjo,a.svelte-1i5ehjo:hover{--tw-text-opacity:1}a.svelte-1i5ehjo:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media(min-width:1024px){a.svelte-1i5ehjo{display:inline-block;margin-top:0}}";
const css$6 = {
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
  $$result.css.add(css$6);
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
  return `${$$result.head += `${$$result.title = `<title>Digital Bussiness Keys</title>`, ""}`, ""}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${slots.default ? slots.default({}) : ``}

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var $layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: $layout
});
var $error_svelte = "h1.svelte-be3lyz,p.svelte-be3lyz{margin:0 auto}h1.svelte-be3lyz{font-size:2.8em;font-weight:700;margin:0 0 .5em}p.svelte-be3lyz{margin:1em auto}@media(min-width:480px){h1.svelte-be3lyz{font-size:4em}}";
const css$5 = {
  code: "h1.svelte-be3lyz,p.svelte-be3lyz{margin:0 auto}h1.svelte-be3lyz{font-size:2.8em;font-weight:700;margin:0 0 .5em}p.svelte-be3lyz{margin:1em auto}@media(min-width:480px){h1.svelte-be3lyz{font-size:4em}}",
  map: '{"version":3,"file":"$error.svelte","sources":["$error.svelte"],"sourcesContent":["<script>\\r\\n  import { dev } from \\"$app/env\\";\\r\\n  import Layout from \\"./$layout.svelte\\";\\r\\n  export let error, status;\\r\\n</script>\\r\\n\\r\\n<svelte:head>\\r\\n  <title>{status}</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"col-md-9\\">\\r\\n  <h1>{status}</h1>\\r\\n\\r\\n  <p>{error.message}</p>\\r\\n\\r\\n  {#if dev && error.stack}\\r\\n    <pre>{error.stack}</pre>\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style>h1,p{margin:0 auto}h1{font-size:2.8em;font-weight:700;margin:0 0 .5em}p{margin:1em auto}@media (min-width:480px){h1{font-size:4em}}</style>\\r\\n"],"names":[],"mappings":"AAoBO,gBAAE,CAAC,eAAC,CAAC,OAAO,CAAC,CAAC,IAAI,CAAC,gBAAE,CAAC,UAAU,KAAK,CAAC,YAAY,GAAG,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,eAAC,CAAC,OAAO,GAAG,CAAC,IAAI,CAAC,MAAM,AAAC,WAAW,KAAK,CAAC,CAAC,gBAAE,CAAC,UAAU,GAAG,CAAC,CAAC"}'
};
const $error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {error: error2} = $$props, {status} = $$props;
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  $$result.css.add(css$5);
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
var root_svelte = "#svelte-announcer.svelte-1y31lbn{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}";
const css$4 = {
  code: "#svelte-announcer.svelte-1y31lbn{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\timport ErrorComponent from \\"..\\\\\\\\..\\\\\\\\..\\\\\\\\src\\\\\\\\routes\\\\\\\\$error.svelte\\";\\n\\n\\t// error handling\\n\\texport let status = undefined;\\n\\texport let error = undefined;\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\n\\tconst Layout = components[0];\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title;\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n</script>\\n\\n<Layout {...(props_0 || {})}>\\n\\t{#if error}\\n\\t\\t<ErrorComponent {status} {error}/>\\n\\t{:else}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}/>\\n\\t{/if}\\n</Layout>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\tNavigated to {title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}</style>"],"names":[],"mappings":"AAyDO,gCAAiB,CAAC,SAAS,QAAQ,CAAC,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,SAAS,MAAM,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC,OAAO,GAAG,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {status = void 0} = $$props;
  let {error: error2 = void 0} = $$props;
  let {stores} = $$props;
  let {page: page2} = $$props;
  let {components: components2} = $$props;
  let {props_0 = null} = $$props;
  let {props_1 = null} = $$props;
  const Layout = components2[0];
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  let mounted = false;
  let navigated = false;
  let title = null;
  onMount(() => {
    const unsubscribe = stores.page.subscribe(() => {
      if (mounted) {
        navigated = true;
        title = document.title;
      }
    });
    mounted = true;
    return unsubscribe;
  });
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components2 !== void 0)
    $$bindings.components(components2);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  $$result.css.add(css$4);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(Layout, "Layout").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${error2 ? `${validate_component($error, "ErrorComponent").$$render($$result, {status, error: error2}, {}, {})}` : `${validate_component(components2[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {})}`}`
  })}

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1y31lbn"}">${navigated ? `Navigated to ${escape(title)}` : ``}</div>` : ``}`;
});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var parse_1 = parse;
var decode = decodeURIComponent;
var pairSplitRegExp = /; */;
function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  var obj = {};
  var opt = options || {};
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
function init({paths, prerendering}) {
}
const d = decodeURIComponent;
const empty = () => ({});
const components = [
  () => Promise.resolve().then(function() {
    return index$d;
  }),
  () => Promise.resolve().then(function() {
    return index$c;
  }),
  () => Promise.resolve().then(function() {
    return index$b;
  }),
  () => Promise.resolve().then(function() {
    return index$a;
  }),
  () => Promise.resolve().then(function() {
    return index$9;
  }),
  () => Promise.resolve().then(function() {
    return index$8;
  }),
  () => Promise.resolve().then(function() {
    return index$7;
  }),
  () => Promise.resolve().then(function() {
    return index$6;
  }),
  () => Promise.resolve().then(function() {
    return index$5;
  }),
  () => Promise.resolve().then(function() {
    return index$4;
  }),
  () => Promise.resolve().then(function() {
    return index$3;
  }),
  () => Promise.resolve().then(function() {
    return index$2;
  }),
  () => Promise.resolve().then(function() {
    return index$1;
  }),
  () => Promise.resolve().then(function() {
    return index;
  }),
  () => Promise.resolve().then(function() {
    return _slug_;
  })
];
const client_component_lookup = {".svelte/build/runtime/internal/start.js": "start-9f0f937e.js", "src/routes/index.svelte": "pages\\index.svelte-07e692f1.js", "src/routes/terms-of-service/index.svelte": "pages\\terms-of-service\\index.svelte-008338c3.js", "src/routes/privacy-policy/index.svelte": "pages\\privacy-policy\\index.svelte-4442e628.js", "src/routes/changelog/index.svelte": "pages\\changelog\\index.svelte-f077f2de.js", "src/routes/dashboard/index.svelte": "pages\\dashboard\\index.svelte-14bd038b.js", "src/routes/features/index.svelte": "pages\\features\\index.svelte-fd9f39e0.js", "src/routes/contact/index.svelte": "pages\\contact\\index.svelte-ce3d9714.js", "src/routes/pricing/index.svelte": "pages\\pricing\\index.svelte-ee0ff8b3.js", "src/routes/logout/index.svelte": "pages\\logout\\index.svelte-f2589f98.js", "src/routes/signup/index.svelte": "pages\\signup\\index.svelte-5e9b0727.js", "src/routes/about/index.svelte": "pages\\about\\index.svelte-fa47f5a8.js", "src/routes/login/index.svelte": "pages\\login\\index.svelte-8655f1b6.js", "src/routes/blog/index.svelte": "pages\\blog\\index.svelte-cafcd661.js", "src/routes/docs/index.svelte": "pages\\docs\\index.svelte-3087454f.js", "src/routes/docs/[slug].svelte": "pages\\docs\\[slug].svelte-148dfd9a.js"};
const manifest = {
  assets: [{file: "favicon.ico", size: 1150, type: "image/vnd.microsoft.icon"}, {file: "images/app-image.png", size: 129536, type: "image/png"}, {file: "images/feature-image2.jpg", size: 233417, type: "image/jpeg"}, {file: "logo-192.png", size: 4760, type: "image/png"}, {file: "logo-512.png", size: 13928, type: "image/png"}, {file: "logo.webp", size: 7916, type: "image/webp"}, {file: "logo_light.webp", size: 5204, type: "image/webp"}, {file: "robots.txt", size: 67, type: "text/plain"}],
  layout: () => Promise.resolve().then(function() {
    return $layout$1;
  }),
  error: () => Promise.resolve().then(function() {
    return $error$1;
  }),
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      parts: [{id: "src/routes/index.svelte", load: components[0]}],
      css: ["assets/start-2d3e93df.css", "assets/pages\\index.svelte-49f9a304.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\index.svelte-07e692f1.js", "chunks/signup-5c5c6132.js"]
    },
    {
      type: "page",
      pattern: /^\/terms-of-service\/?$/,
      params: empty,
      parts: [{id: "src/routes/terms-of-service/index.svelte", load: components[1]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\terms-of-service\\index.svelte-008338c3.js"]
    },
    {
      type: "page",
      pattern: /^\/privacy-policy\/?$/,
      params: empty,
      parts: [{id: "src/routes/privacy-policy/index.svelte", load: components[2]}],
      css: ["assets/start-2d3e93df.css", "assets/pages\\privacy-policy\\index.svelte-02bf4239.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\privacy-policy\\index.svelte-4442e628.js"]
    },
    {
      type: "page",
      pattern: /^\/changelog\/?$/,
      params: empty,
      parts: [{id: "src/routes/changelog/index.svelte", load: components[3]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\changelog\\index.svelte-f077f2de.js"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/?$/,
      params: empty,
      parts: [{id: "src/routes/dashboard/index.svelte", load: components[4]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\dashboard\\index.svelte-14bd038b.js"]
    },
    {
      type: "page",
      pattern: /^\/features\/?$/,
      params: empty,
      parts: [{id: "src/routes/features/index.svelte", load: components[5]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\features\\index.svelte-fd9f39e0.js"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      parts: [{id: "src/routes/contact/index.svelte", load: components[6]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\contact\\index.svelte-ce3d9714.js"]
    },
    {
      type: "page",
      pattern: /^\/pricing\/?$/,
      params: empty,
      parts: [{id: "src/routes/pricing/index.svelte", load: components[7]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\pricing\\index.svelte-ee0ff8b3.js"]
    },
    {
      type: "page",
      pattern: /^\/logout\/?$/,
      params: empty,
      parts: [{id: "src/routes/logout/index.svelte", load: components[8]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\logout\\index.svelte-f2589f98.js", "chunks/utils-cf215c6e.js"]
    },
    {
      type: "page",
      pattern: /^\/signup\/?$/,
      params: empty,
      parts: [{id: "src/routes/signup/index.svelte", load: components[9]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\signup\\index.svelte-5e9b0727.js", "chunks/signup-5c5c6132.js"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      parts: [{id: "src/routes/about/index.svelte", load: components[10]}],
      css: ["assets/start-2d3e93df.css", "assets/pages\\about\\index.svelte-137023d0.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\about\\index.svelte-fa47f5a8.js"]
    },
    {
      type: "page",
      pattern: /^\/login\/?$/,
      params: empty,
      parts: [{id: "src/routes/login/index.svelte", load: components[11]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\login\\index.svelte-8655f1b6.js", "chunks/utils-cf215c6e.js"]
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
      parts: [{id: "src/routes/blog/index.svelte", load: components[12]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\blog\\index.svelte-cafcd661.js"]
    },
    {
      type: "page",
      pattern: /^\/docs\/?$/,
      params: empty,
      parts: [{id: "src/routes/docs/index.svelte", load: components[13]}],
      css: ["assets/start-2d3e93df.css", "assets/pages\\docs\\index.svelte-80485e00.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\docs\\index.svelte-3087454f.js", "chunks/snarkdown.es-0fe202fd.js"]
    },
    {
      type: "page",
      pattern: /^\/docs\/([^/]+?)\/?$/,
      params: (m) => ({slug: d(m[1])}),
      parts: [{id: "src/routes/docs/[slug].svelte", load: components[14]}],
      css: ["assets/start-2d3e93df.css"],
      js: ["start-9f0f937e.js", "chunks/vendor-3aa37ad1.js", "chunks/singletons-6b53f818.js", "chunks/stores-12deee46.js", "chunks/button-6d1f3f37.js", "pages\\docs\\[slug].svelte-148dfd9a.js", "chunks/snarkdown.es-0fe202fd.js"]
    }
  ]
};
const get_hooks = (hooks2) => ({
  getContext: hooks2.getContext || (() => ({})),
  getSession: hooks2.getSession || (() => ({})),
  handle: hooks2.handle || ((request, render2) => render2(request))
});
const hooks = get_hooks(user_hooks);
function render(request, {
  paths = {base: "", assets: "/."},
  local = false,
  dependencies,
  only_render_prerenderable_pages = false,
  get_static_file
} = {}) {
  return ssr$1({
    ...request,
    host: request.headers["host"]
  }, {
    paths,
    local,
    template,
    manifest,
    target: "#svelte",
    entry: "/./_app/start-9f0f937e.js",
    root: Root,
    hooks,
    dev: false,
    amp: false,
    dependencies,
    only_render_prerenderable_pages,
    app_dir: "_app",
    get_component_path: (id) => "/./_app/" + client_component_lookup[id],
    get_stack: (error2) => error2.stack,
    get_static_file,
    get_amp_css: (dep) => amp_css_lookup[dep],
    ssr: true,
    router: true,
    hydrate: true
  });
}
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
  return `<section class="${"text-gray-600 body-font"}"><div class="${"container px-5 py-24 mx-auto flex flex-wrap"}"><div class="${"lg:w-1/2 w-full mb-10 lg:mb-0 rounded-lg overflow-hidden"}"><img alt="${"feature"}" class="${"object-cover object-center h-95 w-80"}" src="${"/images/app-image.png"}"></div>
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
var pricing_svelte = ".active.svelte-1hd2jug{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}";
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
  return `${$$result.head += `${$$result.title = `<title>${escape(title)}</title>`, ""}<meta name="${"keywords"}" content="${"secure, business security, security, cloud ide, github ide, gitlab ide, javascript, online ide, web ide, code review"}" data-svelte="svelte-1fznzgj"><meta name="${"description"}"${add_attribute("content", description, 0)} data-svelte="svelte-1fznzgj"><meta property="${"og:image"}" content="${""}" data-svelte="svelte-1fznzgj"><meta property="${"og:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-1fznzgj"><meta property="${"og:title"}"${add_attribute("content", title, 0)} data-svelte="svelte-1fznzgj"><meta property="${"og:type"}"${add_attribute("content", type, 0)} data-svelte="svelte-1fznzgj"><meta property="${"og:url"}"${add_attribute("content", url, 0)} data-svelte="svelte-1fznzgj">`, ""}`;
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
        simple-to-use Digital Business Keys app
      </p>

      ${$session.user ? `${validate_component(Button, "Button").$$render($$result, {text: "Dashboard", href: "dashboard"}, {}, {})}` : `<div class="${"flex-initial justify-center items-start text-center md:text-left"}">${validate_component(Button, "Button").$$render($$result, {text: "Try Free!", href: "signup"}, {}, {})}

          ${validate_component(Button, "Button").$$render($$result, {text: "Sign In", href: "login"}, {}, {})}</div>`}</div>
    
    <div class="${"w-full md:w-1/2 py-6 text-center"}"><img class="${"w-full z-50 rounded-md"}" src="${"/images/feature-image2.jpg"}" alt="${"people building app"}"></div></div>
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
const Terms_of_service = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$c = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Terms_of_service
});
var index_svelte$2 = "h1.svelte-czkh7d,h2.svelte-czkh7d{padding-bottom:1.25rem}p.svelte-czkh7d{padding-bottom:2.5rem}";
const css$2 = {
  code: "h1.svelte-czkh7d,h2.svelte-czkh7d{padding-bottom:1.25rem}p.svelte-czkh7d{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<section>\\r\\n  <h1>Privacy Policy</h1>\\r\\n\\r\\n  <h2>\\r\\n    In this Privacy Policy \u201CServices\u201D indicates the Service and products offered\\r\\n    and provided by Digital Business Keys across desktop, mobile, tablet and\\r\\n    apps (including any subdomains)\\r\\n  </h2>\\r\\n\\r\\n  <h2>Information we collect about you</h2>\\r\\n  <p>\\r\\n    We collect information about you when you input it into the Services or\\r\\n    otherwise provide it to us and when other sources provide it to us including\\r\\n    but not limited to when you register for an account, create or modify your\\r\\n    profile, sign-up for or make purchases through the Services. Information you\\r\\n    provide to us may be including, but is not limited to your name, address,\\r\\n    phone number, email, gender, occupation, business interests and any other\\r\\n    information provided. We keep track of your preferences when you select\\r\\n    settings within the Services. We collect information about you when you use\\r\\n    our Services, including browsing our websites and taking certain actions\\r\\n    within the Services.\\r\\n  </p>\\r\\n\\r\\n  <h2>How we use information we collect</h2>\\r\\n\\r\\n  <p>\\r\\n    We use the personal information we have collected largely for the purpose of\\r\\n    providing you with products and services that you have requested by\\r\\n    registering an account and agreeing to the Services Terms and Conditions to\\r\\n    create and maintain your account and ensure you comply and adhere to our\\r\\n    terms of use. We are always improving our Services. We use information\\r\\n    identified from usage of the service and feedback to troubleshoot, identify\\r\\n    trends and usage and improve our Services as well as to develop new\\r\\n    products, features and technologies that benefit our users. We send you\\r\\n    email notifications when you interact with the Services. We use your contact\\r\\n    information to send transactional communications via email and within the\\r\\n    Services, including confirming your purchases, reminding you of subscription\\r\\n    expirations,updates, security alerts, and administrative messages. We use\\r\\n    your contact information and information about how you use the Services to\\r\\n    send promotional communications that may be of specific interest to you,\\r\\n    including by email with the ability to opt out of the promotional\\r\\n    communications easily accessible.\\r\\n  </p>\\r\\n\\r\\n  <h2>Security</h2>\\r\\n  <p>\\r\\n    We strive to ensure the security, integrity and privacy of personal\\r\\n    information we collect. We use reasonable security measures to protect your\\r\\n    personal information from unauthorised access, modification and disclosure.\\r\\n    Our employees, contractors, agents and service providers who provide\\r\\n    services related to our information systems, are obliged by law to respect\\r\\n    the confidentiality of any personal information held by us. We review and\\r\\n    update our security measures in light of current technologies.\\r\\n    Unfortunately, no data transmission over the internet can be guaranteed to\\r\\n    be totally secure.\\r\\n  </p>\\r\\n\\r\\n  <h2>Access to your Information</h2>\\r\\n\\r\\n  <p>\\r\\n    If, at any time, you discover that information held about you is incorrect\\r\\n    or you would like to review and confirm the accuracy of your personal\\r\\n    information, you can contact us. Our Services give you the ability to access\\r\\n    and update certain information about you from within the Service. You can\\r\\n    also gain access to the personal information we hold about you, subject to\\r\\n    certain exceptions provided for by law. To request access to your personal\\r\\n    information, please contact us.\\r\\n  </p>\\r\\n\\r\\n  <h2>Changes to our Privacy Policy</h2>\\r\\n\\r\\n  <p>\\r\\n    Amendments to this policy will be posted on this page and will be effective\\r\\n    when posted, if the changes are significant, we will provide a more\\r\\n    prominent notice.\\r\\n  </p>\\r\\n</section>\\r\\n\\r\\n<style lang=\\"postcss\\">h1,h2{padding-bottom:1.25rem}p{padding-bottom:2.5rem}</style>\\r\\n"],"names":[],"mappings":"AA8EsB,gBAAE,CAAC,gBAAE,CAAC,eAAe,OAAO,CAAC,eAAC,CAAC,eAAe,MAAM,CAAC"}'
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
  default: Privacy_policy
});
const Changelog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$a = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Changelog
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
  return `<h1 class="${"text-4xl px-8 font-extrabold text-gray-50"}">Dashboard</h1>

<main class="${"auto-cols-min flex"}">
  <div class="${"w-2/5 flex-wrap"}"><h2 class="${"text-3xl font-extrabold pb-4 text-gray-50"}">Account</h2>
    <div class="${"grid-cols-1 gap-2"}"><div><input class="${"text-black p-2"}"${add_attribute("value", user.username, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.email, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.tradingName, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.legalName, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.abn, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.acn, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.businessPhone, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.businessEmail, 1)}></div></div></div>

  
  <div class="${"w-2/5 flex-wrap"}"><h2 class="${"text-3xl font-extrabold pb-4 text-gray-50"}">Billing</h2>
    <div class="${"grid-cols-1 gap-2"}"><div><input class="${"text-black p-2"}"${add_attribute("value", user.username, 1)}></div>
      <div><input class="${"text-black p-2"}"${add_attribute("value", user.email, 1)}></div></div></div></main>`;
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
  default: Contact
});
const Pricing = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$6 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Pricing
});
function post$3(endpoint, data) {
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
    await post$3(`auth/logout`);
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
const Signup_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Signup, "Signup").$$render($$result, {}, {}, {})}`;
});
var index$4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Signup_1
});
var index_svelte$1 = "h1.svelte-1bnbrug{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1.svelte-1bnbrug,h2.svelte-1bnbrug{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p.svelte-1bnbrug{padding-bottom:2.5rem}";
const css$1 = {
  code: "h1.svelte-1bnbrug{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1.svelte-1bnbrug,h2.svelte-1bnbrug{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p.svelte-1bnbrug{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<style lang=\\"postcss\\">h1{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1,h2{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p{padding-bottom:2.5rem}</style>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>About</title>\\r\\n</svelte:head>\\r\\n<div class=\\"px-8 py-16 mx-auto max-w-5xl\\">\\r\\n\\t<h1>About Us</h1>\\r\\n\\r\\n\\t<p>\\r\\n\\t\\tDigital business keys is a critical app developed to empower businesses\\r\\n\\t\\tto take control of their digital business assets and respond to issues\\r\\n\\t\\tthat can commonly impact website availability, email receiving and\\r\\n\\t\\tsending and digital project assets. Digital Business Keys app provides a\\r\\n\\t\\tservice that has long been neglect by business owners and the industries\\r\\n\\t\\tthat assist them in taking their businesses online Designed to be as\\r\\n\\t\\tsimple as possible to allow any level of user to get the critical\\r\\n\\t\\tcontrol they need for the digital presence of their business.\\r\\n\\t</p>\\r\\n\\r\\n\\t<h2>Our Story</h2>\\r\\n\\r\\n\\t<p>\\r\\n\\t\\tOur team has extensive industry experience in developing and\\r\\n\\t\\timplementing custom and out of the box solutions. We thrive in\\r\\n\\t\\tenvironments that enable us to deliver the best results for our clients.\\r\\n\\t\\tFrom this fundamental work ethic grew the idea for the Digital Business\\r\\n\\t\\tKeys app as a tool to plug the gap we saw develop in the industry in\\r\\n\\t\\tcustomer education, knowledge and tools to provide confidence in\\r\\n\\t\\tmanagement of these business critical digital assets.\\r\\n\\t</p>\\r\\n</div>\\r\\n"],"names":[],"mappings":"AAAsB,iBAAE,CAAC,kBAAkB,CAAC,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,iBAAE,CAAC,iBAAE,CAAC,eAAe,OAAO,CAAC,UAAU,OAAO,CAAC,YAAY,OAAO,CAAC,gBAAC,CAAC,eAAe,MAAM,CAAC"}'
};
const About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>About</title>`, ""}`, ""}
<div class="${"px-8 py-16 mx-auto max-w-5xl"}"><h1 class="${"svelte-1bnbrug"}">About Us</h1>

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
  default: About
});
async function load$2({session: session2}) {
  console.log("Sessions:", session2);
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
      images {
        url
        previewUrl
      }
    }
  }
`;
let uri = "https://api.digitalbk.app";
const BASE_LOGIN_URI = `${uri}/auth/local`;
const GRAPHQL_URI = `${uri}/graphql`;
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
var index_svelte = 'ul.svelte-1kgxi19{margin:0 0 1em;line-height:1.5}h2.svelte-1kgxi19:before{display:block;content:" ";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}';
const css = {
  code: 'ul.svelte-1kgxi19{margin:0 0 1em;line-height:1.5}h2.svelte-1kgxi19:before{display:block;content:" ";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}',
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n  import { GRAPHQL_URI } from \\"../../lib/config\\";\\r\\n  import { GET_DOCS } from \\"../../lib/graphql/requests\\";\\r\\n\\r\\n  /**\\r\\n   * @type {import(\'@sveltejs/kit\').Load}\\r\\n   */\\r\\n  export async function load() {\\r\\n    let items;\\r\\n    try {\\r\\n      const res = await fetch(`${GRAPHQL_URI}`, {\\r\\n        method: \\"POST\\",\\r\\n        headers: {\\r\\n          \\"Content-Type\\": \\"application/json\\",\\r\\n        },\\r\\n        body: JSON.stringify({ query: GET_DOCS }),\\r\\n      });\\r\\n\\r\\n      items = await res.json();\\r\\n      items = items.data.documentations;\\r\\n    } catch (e) {\\r\\n      console.log(e.message);\\r\\n    }\\r\\n\\r\\n    return {\\r\\n      props: {\\r\\n        items,\\r\\n      },\\r\\n    };\\r\\n  }\\r\\n\\r\\n  let promise = load();\\r\\n</script>\\r\\n\\r\\n<script>\\r\\n  import snarkdown from \\"snarkdown\\";\\r\\n\\r\\n  export let items;\\r\\n\\r\\n  function phoneNav() {\\r\\n    var item = document.getElementById(\\"p-nav\\");\\r\\n\\r\\n    item.classList.toggle(\\"hidden\\");\\r\\n  }\\r\\n</script>\\r\\n\\r\\n<svelte:head>\\r\\n  <title>Docs</title>\\r\\n  <meta\\r\\n    name=\\"Description\\"\\r\\n    content=\\"Documentation for Digital Business Keys to explain core concepts like\\r\\n  DNS, Domain Names, Domain Hosts, Emails and more\\"\\r\\n  />\\r\\n</svelte:head>\\r\\n\\r\\n{#await promise}\\r\\n  <p>...loading</p>\\r\\n{:then data}\\r\\n  <div class=\\"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl\\">\\r\\n    <div\\r\\n      id=\\"p-nav\\"\\r\\n      class=\\"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600\\"\\r\\n    >\\r\\n      <div class=\\"md:relative mx-auto lg:float-right lg:px-6\\">\\r\\n        <ul\\r\\n          class=\\"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20\\"\\r\\n        >\\r\\n          {#each items as doc}\\r\\n            <!-- we\'re using the non-standard `rel=prefetch` attribute to\\r\\n                    tell Sapper to load the data for the page as soon as\\r\\n                    the user hovers over the link or taps it, instead of\\r\\n                    waiting for the \'click\' event -->\\r\\n\\r\\n            <div\\r\\n              class=\\"lg:flex-none flex w-full md:max-w-xs bg-purple text-black\\"\\r\\n            >\\r\\n              <li class=\\"text-black pb-2\\">\\r\\n                <p class=\\"hover:bg-indigo-500 text-black\\">\\r\\n                  <a\\r\\n                    on:click={phoneNav}\\r\\n                    class=\\"text-black\\"\\r\\n                    rel=\\"prefetch\\"\\r\\n                    href=\\"docs#{doc.Slug}\\">{doc.title}</a\\r\\n                  >\\r\\n                </p>\\r\\n              </li>\\r\\n            </div>\\r\\n          {/each}\\r\\n        </ul>\\r\\n      </div>\\r\\n    </div>\\r\\n\\r\\n    <div class=\\"w-full md:w-4/5\\">\\r\\n      <h1\\r\\n        class=\\"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 \\"\\r\\n      >\\r\\n        Documentation\\r\\n      </h1>\\r\\n      <div class=\\"container pt-12 px-6\\">\\r\\n        {#each items as doc}\\r\\n          <div id={doc.Slug} class=\\"mb-12 overflow-auto\\r\\n                    \\">\\r\\n            <h2 class=\\"pb-10\\">{doc.title}</h2>\\r\\n\\r\\n            <article class=\\"prose prose-indigo lg:prose-xl\\">\\r\\n              {@html snarkdown(doc.content)}\\r\\n            </article>\\r\\n          </div>\\r\\n        {/each}\\r\\n      </div>\\r\\n    </div>\\r\\n    <button\\r\\n      on:click={phoneNav}\\r\\n      class=\\"fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden\\"\\r\\n    >\\r\\n      <svg\\r\\n        width=\\"24\\"\\r\\n        height=\\"24\\"\\r\\n        fill=\\"none\\"\\r\\n        class=\\"absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform\\"\\r\\n        ><path\\r\\n          d=\\"M4 8h16M4 16h16\\"\\r\\n          stroke=\\"currentColor\\"\\r\\n          stroke-width=\\"2\\"\\r\\n          stroke-linecap=\\"round\\"\\r\\n          stroke-linejoin=\\"round\\"\\r\\n        /></svg\\r\\n      >\\r\\n    </button>\\r\\n  </div>\\r\\n{/await}\\r\\n\\r\\n<style>ul{margin:0 0 1em;line-height:1.5}h2:before{display:block;content:\\" \\";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}</style>\\r\\n"],"names":[],"mappings":"AAoIO,iBAAE,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,YAAY,GAAG,CAAC,iBAAE,OAAO,CAAC,QAAQ,KAAK,CAAC,QAAQ,GAAG,CAAC,WAAW,MAAM,CAAC,OAAO,KAAK,CAAC,WAAW,MAAM,CAAC,eAAe,IAAI,CAAC"}'
};
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
  return `${$$result.head += `${$$result.title = `<title>Docs</title>`, ""}<meta name="${"Description"}" content="${"Documentation for Digital Business Keys to explain core concepts like\r\n  DNS, Domain Names, Domain Hosts, Emails and more"}" data-svelte="svelte-1bpcqul">`, ""}

${function(__value) {
    if (is_promise(__value))
      return `
  <p>...loading</p>
`;
    return function(data) {
      return `
  <div class="${"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl"}"><div id="${"p-nav"}" class="${"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600"}"><div class="${"md:relative mx-auto lg:float-right lg:px-6"}"><ul class="${"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20 svelte-1kgxi19"}">${each(items, (doc) => `

            <div class="${"lg:flex-none flex w-full md:max-w-xs bg-purple text-black"}"><li class="${"text-black pb-2"}"><p class="${"hover:bg-indigo-500 text-black"}"><a class="${"text-black"}" rel="${"prefetch"}" href="${"docs#" + escape(doc.Slug)}">${escape(doc.title)}</a>
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
  return `${$$result.head += `${$$result.title = `<title>${escape(pagedata.title)}</title>`, ""}`, ""}

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
function post$2() {
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
  post: post$2
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
      "set-cookie": [
        `jwt=${value}; Path=/; HttpOnly; Secure`
      ]
    },
    body
  };
}
const Readable = Stream.Readable;
const BUFFER = Symbol("buffer");
const TYPE = Symbol("type");
class Blob {
  constructor() {
    this[TYPE] = "";
    const blobParts = arguments[0];
    const options = arguments[1];
    const buffers = [];
    let size = 0;
    if (blobParts) {
      const a = blobParts;
      const length = Number(a.length);
      for (let i = 0; i < length; i++) {
        const element = a[i];
        let buffer;
        if (element instanceof Buffer) {
          buffer = element;
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(element);
        } else if (element instanceof Blob) {
          buffer = element[BUFFER];
        } else {
          buffer = Buffer.from(typeof element === "string" ? element : String(element));
        }
        size += buffer.length;
        buffers.push(buffer);
      }
    }
    this[BUFFER] = Buffer.concat(buffers);
    let type = options && options.type !== void 0 && String(options.type).toLowerCase();
    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type;
    }
  }
  get size() {
    return this[BUFFER].length;
  }
  get type() {
    return this[TYPE];
  }
  text() {
    return Promise.resolve(this[BUFFER].toString());
  }
  arrayBuffer() {
    const buf = this[BUFFER];
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    return Promise.resolve(ab);
  }
  stream() {
    const readable = new Readable();
    readable._read = function() {
    };
    readable.push(this[BUFFER]);
    readable.push(null);
    return readable;
  }
  toString() {
    return "[object Blob]";
  }
  slice() {
    const size = this.size;
    const start = arguments[0];
    const end = arguments[1];
    let relativeStart, relativeEnd;
    if (start === void 0) {
      relativeStart = 0;
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0);
    } else {
      relativeStart = Math.min(start, size);
    }
    if (end === void 0) {
      relativeEnd = size;
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0);
    } else {
      relativeEnd = Math.min(end, size);
    }
    const span = Math.max(relativeEnd - relativeStart, 0);
    const buffer = this[BUFFER];
    const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
    const blob = new Blob([], {type: arguments[2]});
    blob[BUFFER] = slicedBuffer;
    return blob;
  }
}
Object.defineProperties(Blob.prototype, {
  size: {enumerable: true},
  type: {enumerable: true},
  slice: {enumerable: true}
});
Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: "Blob",
  writable: false,
  enumerable: false,
  configurable: true
});
function FetchError(message, type, systemError) {
  Error.call(this, message);
  this.message = message;
  this.type = type;
  if (systemError) {
    this.code = this.errno = systemError.code;
  }
  Error.captureStackTrace(this, this.constructor);
}
FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = "FetchError";
let convert;
try {
  convert = require("encoding").convert;
} catch (e2) {
}
const INTERNALS = Symbol("Body internals");
const PassThrough = Stream.PassThrough;
function Body(body) {
  var _this = this;
  var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$size = _ref.size;
  let size = _ref$size === void 0 ? 0 : _ref$size;
  var _ref$timeout = _ref.timeout;
  let timeout = _ref$timeout === void 0 ? 0 : _ref$timeout;
  if (body == null) {
    body = null;
  } else if (isURLSearchParams(body)) {
    body = Buffer.from(body.toString());
  } else if (isBlob(body))
    ;
  else if (Buffer.isBuffer(body))
    ;
  else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
    body = Buffer.from(body);
  } else if (ArrayBuffer.isView(body)) {
    body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  } else if (body instanceof Stream)
    ;
  else {
    body = Buffer.from(String(body));
  }
  this[INTERNALS] = {
    body,
    disturbed: false,
    error: null
  };
  this.size = size;
  this.timeout = timeout;
  if (body instanceof Stream) {
    body.on("error", function(err) {
      const error2 = err.name === "AbortError" ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
      _this[INTERNALS].error = error2;
    });
  }
}
Body.prototype = {
  get body() {
    return this[INTERNALS].body;
  },
  get bodyUsed() {
    return this[INTERNALS].disturbed;
  },
  arrayBuffer() {
    return consumeBody.call(this).then(function(buf) {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    });
  },
  blob() {
    let ct = this.headers && this.headers.get("content-type") || "";
    return consumeBody.call(this).then(function(buf) {
      return Object.assign(new Blob([], {
        type: ct.toLowerCase()
      }), {
        [BUFFER]: buf
      });
    });
  },
  json() {
    var _this2 = this;
    return consumeBody.call(this).then(function(buffer) {
      try {
        return JSON.parse(buffer.toString());
      } catch (err) {
        return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, "invalid-json"));
      }
    });
  },
  text() {
    return consumeBody.call(this).then(function(buffer) {
      return buffer.toString();
    });
  },
  buffer() {
    return consumeBody.call(this);
  },
  textConverted() {
    var _this3 = this;
    return consumeBody.call(this).then(function(buffer) {
      return convertBody(buffer, _this3.headers);
    });
  }
};
Object.defineProperties(Body.prototype, {
  body: {enumerable: true},
  bodyUsed: {enumerable: true},
  arrayBuffer: {enumerable: true},
  blob: {enumerable: true},
  json: {enumerable: true},
  text: {enumerable: true}
});
Body.mixIn = function(proto) {
  for (const name of Object.getOwnPropertyNames(Body.prototype)) {
    if (!(name in proto)) {
      const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
      Object.defineProperty(proto, name, desc);
    }
  }
};
function consumeBody() {
  var _this4 = this;
  if (this[INTERNALS].disturbed) {
    return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
  }
  this[INTERNALS].disturbed = true;
  if (this[INTERNALS].error) {
    return Body.Promise.reject(this[INTERNALS].error);
  }
  let body = this.body;
  if (body === null) {
    return Body.Promise.resolve(Buffer.alloc(0));
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return Body.Promise.resolve(body);
  }
  if (!(body instanceof Stream)) {
    return Body.Promise.resolve(Buffer.alloc(0));
  }
  let accum = [];
  let accumBytes = 0;
  let abort = false;
  return new Body.Promise(function(resolve2, reject) {
    let resTimeout;
    if (_this4.timeout) {
      resTimeout = setTimeout(function() {
        abort = true;
        reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, "body-timeout"));
      }, _this4.timeout);
    }
    body.on("error", function(err) {
      if (err.name === "AbortError") {
        abort = true;
        reject(err);
      } else {
        reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, "system", err));
      }
    });
    body.on("data", function(chunk) {
      if (abort || chunk === null) {
        return;
      }
      if (_this4.size && accumBytes + chunk.length > _this4.size) {
        abort = true;
        reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, "max-size"));
        return;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    });
    body.on("end", function() {
      if (abort) {
        return;
      }
      clearTimeout(resTimeout);
      try {
        resolve2(Buffer.concat(accum, accumBytes));
      } catch (err) {
        reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, "system", err));
      }
    });
  });
}
function convertBody(buffer, headers) {
  if (typeof convert !== "function") {
    throw new Error("The package `encoding` must be installed to use the textConverted() function");
  }
  const ct = headers.get("content-type");
  let charset = "utf-8";
  let res, str;
  if (ct) {
    res = /charset=([^;]*)/i.exec(ct);
  }
  str = buffer.slice(0, 1024).toString();
  if (!res && str) {
    res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
  }
  if (!res && str) {
    res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
    if (!res) {
      res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
      if (res) {
        res.pop();
      }
    }
    if (res) {
      res = /charset=(.*)/i.exec(res.pop());
    }
  }
  if (!res && str) {
    res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
  }
  if (res) {
    charset = res.pop();
    if (charset === "gb2312" || charset === "gbk") {
      charset = "gb18030";
    }
  }
  return convert(buffer, "UTF-8", charset).toString();
}
function isURLSearchParams(obj) {
  if (typeof obj !== "object" || typeof obj.append !== "function" || typeof obj.delete !== "function" || typeof obj.get !== "function" || typeof obj.getAll !== "function" || typeof obj.has !== "function" || typeof obj.set !== "function") {
    return false;
  }
  return obj.constructor.name === "URLSearchParams" || Object.prototype.toString.call(obj) === "[object URLSearchParams]" || typeof obj.sort === "function";
}
function isBlob(obj) {
  return typeof obj === "object" && typeof obj.arrayBuffer === "function" && typeof obj.type === "string" && typeof obj.stream === "function" && typeof obj.constructor === "function" && typeof obj.constructor.name === "string" && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}
function clone(instance) {
  let p1, p2;
  let body = instance.body;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof Stream && typeof body.getBoundary !== "function") {
    p1 = new PassThrough();
    p2 = new PassThrough();
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS].body = p1;
    body = p2;
  }
  return body;
}
function extractContentType(body) {
  if (body === null) {
    return null;
  } else if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  } else if (isURLSearchParams(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  } else if (isBlob(body)) {
    return body.type || null;
  } else if (Buffer.isBuffer(body)) {
    return null;
  } else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
    return null;
  } else if (ArrayBuffer.isView(body)) {
    return null;
  } else if (typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  } else if (body instanceof Stream) {
    return null;
  } else {
    return "text/plain;charset=UTF-8";
  }
}
function getTotalBytes(instance) {
  const body = instance.body;
  if (body === null) {
    return 0;
  } else if (isBlob(body)) {
    return body.size;
  } else if (Buffer.isBuffer(body)) {
    return body.length;
  } else if (body && typeof body.getLengthSync === "function") {
    if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || body.hasKnownLength && body.hasKnownLength()) {
      return body.getLengthSync();
    }
    return null;
  } else {
    return null;
  }
}
function writeToStream(dest, instance) {
  const body = instance.body;
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    body.stream().pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
}
Body.Promise = global.Promise;
const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
function validateName(name) {
  name = `${name}`;
  if (invalidTokenRegex.test(name) || name === "") {
    throw new TypeError(`${name} is not a legal HTTP header name`);
  }
}
function validateValue(value) {
  value = `${value}`;
  if (invalidHeaderCharRegex.test(value)) {
    throw new TypeError(`${value} is not a legal HTTP header value`);
  }
}
function find(map, name) {
  name = name.toLowerCase();
  for (const key in map) {
    if (key.toLowerCase() === name) {
      return key;
    }
  }
  return void 0;
}
const MAP = Symbol("map");
class Headers {
  constructor() {
    let init2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
    this[MAP] = Object.create(null);
    if (init2 instanceof Headers) {
      const rawHeaders = init2.raw();
      const headerNames = Object.keys(rawHeaders);
      for (const headerName of headerNames) {
        for (const value of rawHeaders[headerName]) {
          this.append(headerName, value);
        }
      }
      return;
    }
    if (init2 == null)
      ;
    else if (typeof init2 === "object") {
      const method = init2[Symbol.iterator];
      if (method != null) {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        const pairs = [];
        for (const pair of init2) {
          if (typeof pair !== "object" || typeof pair[Symbol.iterator] !== "function") {
            throw new TypeError("Each header pair must be iterable");
          }
          pairs.push(Array.from(pair));
        }
        for (const pair of pairs) {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          this.append(pair[0], pair[1]);
        }
      } else {
        for (const key of Object.keys(init2)) {
          const value = init2[key];
          this.append(key, value);
        }
      }
    } else {
      throw new TypeError("Provided initializer must be an object");
    }
  }
  get(name) {
    name = `${name}`;
    validateName(name);
    const key = find(this[MAP], name);
    if (key === void 0) {
      return null;
    }
    return this[MAP][key].join(", ");
  }
  forEach(callback) {
    let thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
    let pairs = getHeaders(this);
    let i = 0;
    while (i < pairs.length) {
      var _pairs$i = pairs[i];
      const name = _pairs$i[0], value = _pairs$i[1];
      callback.call(thisArg, value, name, this);
      pairs = getHeaders(this);
      i++;
    }
  }
  set(name, value) {
    name = `${name}`;
    value = `${value}`;
    validateName(name);
    validateValue(value);
    const key = find(this[MAP], name);
    this[MAP][key !== void 0 ? key : name] = [value];
  }
  append(name, value) {
    name = `${name}`;
    value = `${value}`;
    validateName(name);
    validateValue(value);
    const key = find(this[MAP], name);
    if (key !== void 0) {
      this[MAP][key].push(value);
    } else {
      this[MAP][name] = [value];
    }
  }
  has(name) {
    name = `${name}`;
    validateName(name);
    return find(this[MAP], name) !== void 0;
  }
  delete(name) {
    name = `${name}`;
    validateName(name);
    const key = find(this[MAP], name);
    if (key !== void 0) {
      delete this[MAP][key];
    }
  }
  raw() {
    return this[MAP];
  }
  keys() {
    return createHeadersIterator(this, "key");
  }
  values() {
    return createHeadersIterator(this, "value");
  }
  [Symbol.iterator]() {
    return createHeadersIterator(this, "key+value");
  }
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];
Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
  value: "Headers",
  writable: false,
  enumerable: false,
  configurable: true
});
Object.defineProperties(Headers.prototype, {
  get: {enumerable: true},
  forEach: {enumerable: true},
  set: {enumerable: true},
  append: {enumerable: true},
  has: {enumerable: true},
  delete: {enumerable: true},
  keys: {enumerable: true},
  values: {enumerable: true},
  entries: {enumerable: true}
});
function getHeaders(headers) {
  let kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "key+value";
  const keys = Object.keys(headers[MAP]).sort();
  return keys.map(kind === "key" ? function(k) {
    return k.toLowerCase();
  } : kind === "value" ? function(k) {
    return headers[MAP][k].join(", ");
  } : function(k) {
    return [k.toLowerCase(), headers[MAP][k].join(", ")];
  });
}
const INTERNAL = Symbol("internal");
function createHeadersIterator(target, kind) {
  const iterator = Object.create(HeadersIteratorPrototype);
  iterator[INTERNAL] = {
    target,
    kind,
    index: 0
  };
  return iterator;
}
const HeadersIteratorPrototype = Object.setPrototypeOf({
  next() {
    if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
      throw new TypeError("Value of `this` is not a HeadersIterator");
    }
    var _INTERNAL = this[INTERNAL];
    const target = _INTERNAL.target, kind = _INTERNAL.kind, index2 = _INTERNAL.index;
    const values = getHeaders(target, kind);
    const len = values.length;
    if (index2 >= len) {
      return {
        value: void 0,
        done: true
      };
    }
    this[INTERNAL].index = index2 + 1;
    return {
      value: values[index2],
      done: false
    };
  }
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));
Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
  value: "HeadersIterator",
  writable: false,
  enumerable: false,
  configurable: true
});
function exportNodeCompatibleHeaders(headers) {
  const obj = Object.assign({__proto__: null}, headers[MAP]);
  const hostHeaderKey = find(headers[MAP], "Host");
  if (hostHeaderKey !== void 0) {
    obj[hostHeaderKey] = obj[hostHeaderKey][0];
  }
  return obj;
}
function createHeadersLenient(obj) {
  const headers = new Headers();
  for (const name of Object.keys(obj)) {
    if (invalidTokenRegex.test(name)) {
      continue;
    }
    if (Array.isArray(obj[name])) {
      for (const val of obj[name]) {
        if (invalidHeaderCharRegex.test(val)) {
          continue;
        }
        if (headers[MAP][name] === void 0) {
          headers[MAP][name] = [val];
        } else {
          headers[MAP][name].push(val);
        }
      }
    } else if (!invalidHeaderCharRegex.test(obj[name])) {
      headers[MAP][name] = [obj[name]];
    }
  }
  return headers;
}
const INTERNALS$1 = Symbol("Response internals");
const STATUS_CODES = http.STATUS_CODES;
class Response {
  constructor() {
    let body = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
    let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    Body.call(this, body, opts);
    const status = opts.status || 200;
    const headers = new Headers(opts.headers);
    if (body != null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      url: opts.url,
      status,
      statusText: opts.statusText || STATUS_CODES[status],
      headers,
      counter: opts.counter
    };
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  clone() {
    return new Response(clone(this), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected
    });
  }
}
Body.mixIn(Response.prototype);
Object.defineProperties(Response.prototype, {
  url: {enumerable: true},
  status: {enumerable: true},
  ok: {enumerable: true},
  redirected: {enumerable: true},
  statusText: {enumerable: true},
  headers: {enumerable: true},
  clone: {enumerable: true}
});
Object.defineProperty(Response.prototype, Symbol.toStringTag, {
  value: "Response",
  writable: false,
  enumerable: false,
  configurable: true
});
const INTERNALS$2 = Symbol("Request internals");
const parse_url = Url.parse;
const format_url = Url.format;
const streamDestructionSupported = "destroy" in Stream.Readable.prototype;
function isRequest(input) {
  return typeof input === "object" && typeof input[INTERNALS$2] === "object";
}
function isAbortSignal(signal) {
  const proto = signal && typeof signal === "object" && Object.getPrototypeOf(signal);
  return !!(proto && proto.constructor.name === "AbortSignal");
}
class Request {
  constructor(input) {
    let init2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let parsedURL;
    if (!isRequest(input)) {
      if (input && input.href) {
        parsedURL = parse_url(input.href);
      } else {
        parsedURL = parse_url(`${input}`);
      }
      input = {};
    } else {
      parsedURL = parse_url(input.url);
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input) && input.body !== null) && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    let inputBody = init2.body != null ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    Body.call(this, inputBody, {
      timeout: init2.timeout || input.timeout || 0,
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody != null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2)
      signal = init2.signal;
    if (signal != null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS$2] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow !== void 0 ? init2.follow : input.follow !== void 0 ? input.follow : 20;
    this.compress = init2.compress !== void 0 ? init2.compress : input.compress !== void 0 ? input.compress : true;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
  }
  get method() {
    return this[INTERNALS$2].method;
  }
  get url() {
    return format_url(this[INTERNALS$2].parsedURL);
  }
  get headers() {
    return this[INTERNALS$2].headers;
  }
  get redirect() {
    return this[INTERNALS$2].redirect;
  }
  get signal() {
    return this[INTERNALS$2].signal;
  }
  clone() {
    return new Request(this);
  }
}
Body.mixIn(Request.prototype);
Object.defineProperty(Request.prototype, Symbol.toStringTag, {
  value: "Request",
  writable: false,
  enumerable: false,
  configurable: true
});
Object.defineProperties(Request.prototype, {
  method: {enumerable: true},
  url: {enumerable: true},
  headers: {enumerable: true},
  redirect: {enumerable: true},
  clone: {enumerable: true},
  signal: {enumerable: true}
});
function getNodeRequestOptions(request) {
  const parsedURL = request[INTERNALS$2].parsedURL;
  const headers = new Headers(request[INTERNALS$2].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  if (!parsedURL.protocol || !parsedURL.hostname) {
    throw new TypeError("Only absolute URLs are supported");
  }
  if (!/^https?:$/.test(parsedURL.protocol)) {
    throw new TypeError("Only HTTP(S) protocols are supported");
  }
  if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
    throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");
  }
  let contentLengthValue = null;
  if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body != null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number") {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate");
  }
  let agent = request.agent;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  return Object.assign({}, parsedURL, {
    method: request.method,
    headers: exportNodeCompatibleHeaders(headers),
    agent
  });
}
function AbortError(message) {
  Error.call(this, message);
  this.type = "aborted";
  this.message = message;
  Error.captureStackTrace(this, this.constructor);
}
AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = "AbortError";
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;
function fetch$1(url, opts) {
  if (!fetch$1.Promise) {
    throw new Error("native promise missing, set fetch.Promise to your favorite alternative");
  }
  Body.Promise = fetch$1.Promise;
  return new fetch$1.Promise(function(resolve2, reject) {
    const request = new Request(url, opts);
    const options = getNodeRequestOptions(request);
    const send2 = (options.protocol === "https:" ? https : http).request;
    const signal = request.signal;
    let response = null;
    const abort = function abort2() {
      let error2 = new AbortError("The user aborted a request.");
      reject(error2);
      if (request.body && request.body instanceof Stream.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body)
        return;
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = function abortAndFinalize2() {
      abort();
      finalize();
    };
    const req = send2(options);
    let reqTimeout;
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    function finalize() {
      req.abort();
      if (signal)
        signal.removeEventListener("abort", abortAndFinalize);
      clearTimeout(reqTimeout);
    }
    if (request.timeout) {
      req.once("socket", function(socket) {
        reqTimeout = setTimeout(function() {
          reject(new FetchError(`network timeout at: ${request.url}`, "request-timeout"));
          finalize();
        }, request.timeout);
      });
    }
    req.on("error", function(err) {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    req.on("response", function(res) {
      clearTimeout(reqTimeout);
      const headers = createHeadersLenient(res.headers);
      if (fetch$1.isRedirect(res.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : resolve_url(request.url, location);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (err) {
                reject(err);
              }
            }
            break;
          case "follow":
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOpts = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              timeout: request.timeout,
              size: request.size
            };
            if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === "POST") {
              requestOpts.method = "GET";
              requestOpts.body = void 0;
              requestOpts.headers.delete("content-length");
            }
            resolve2(fetch$1(new Request(locationURL, requestOpts)));
            finalize();
            return;
        }
      }
      res.once("end", function() {
        if (signal)
          signal.removeEventListener("abort", abortAndFinalize);
      });
      let body = res.pipe(new PassThrough$1());
      const response_options = {
        url: request.url,
        status: res.statusCode,
        statusText: res.statusMessage,
        headers,
        size: request.size,
        timeout: request.timeout,
        counter: request.counter
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || res.statusCode === 204 || res.statusCode === 304) {
        response = new Response(body, response_options);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: zlib.Z_SYNC_FLUSH,
        finishFlush: zlib.Z_SYNC_FLUSH
      };
      if (codings == "gzip" || codings == "x-gzip") {
        body = body.pipe(zlib.createGunzip(zlibOptions));
        response = new Response(body, response_options);
        resolve2(response);
        return;
      }
      if (codings == "deflate" || codings == "x-deflate") {
        const raw = res.pipe(new PassThrough$1());
        raw.once("data", function(chunk) {
          if ((chunk[0] & 15) === 8) {
            body = body.pipe(zlib.createInflate());
          } else {
            body = body.pipe(zlib.createInflateRaw());
          }
          response = new Response(body, response_options);
          resolve2(response);
        });
        return;
      }
      if (codings == "br" && typeof zlib.createBrotliDecompress === "function") {
        body = body.pipe(zlib.createBrotliDecompress());
        response = new Response(body, response_options);
        resolve2(response);
        return;
      }
      response = new Response(body, response_options);
      resolve2(response);
    });
    writeToStream(req, request);
  });
}
fetch$1.isRedirect = function(code) {
  return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};
fetch$1.Promise = global.Promise;
const base = BASE_LOGIN_URI;
async function send({method, data, token}) {
  const opts = {method, headers: {}};
  console.log("Method", method, "Data", data, "Token", token);
  if (data) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }
  if (token) {
    opts.headers["Authorization"] = `Token ${token}`;
  }
  return fetch$1(`${base}`, opts).then((r2) => r2.text()).then((json) => {
    try {
      return JSON.parse(json);
    } catch (err) {
      return json;
    }
  });
}
function post$1(data, token) {
  return send({method: "POST", data, token});
}
async function post(request) {
  const body = await post$1({
    identifier: request.body.email,
    password: request.body.password
  });
  console.log(body);
  return respond(body);
}
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  post
});
export {init, render};
