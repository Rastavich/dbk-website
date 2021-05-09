var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = {exports: {}}).exports, mod), mod.exports;
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};
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

// node_modules/.pnpm/cookie@0.4.1/node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/.pnpm/cookie@0.4.1/node_modules/cookie/index.js"(exports2) {
    "use strict";
    exports2.parse = parse;
    exports2.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
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
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// node_modules/.pnpm/snarkdown@2.0.0/node_modules/snarkdown/dist/snarkdown.js
var require_snarkdown = __commonJS({
  "node_modules/.pnpm/snarkdown@2.0.0/node_modules/snarkdown/dist/snarkdown.js"(exports2, module2) {
    var e = {"": ["<em>", "</em>"], _: ["<strong>", "</strong>"], "*": ["<strong>", "</strong>"], "~": ["<s>", "</s>"], "\n": ["<br />"], " ": ["<br />"], "-": ["<hr />"]};
    function n(e2) {
      return e2.replace(RegExp("^" + (e2.match(/^(\t| )+/) || "")[0], "gm"), "");
    }
    function r(e2) {
      return (e2 + "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    module2.exports = function t(a, o) {
      var c, l, s2, g, p, u = /((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)/gm, m = [], h = "", i = o || {}, d2 = 0;
      function $(n2) {
        var r2 = e[n2[1] || ""], t2 = m[m.length - 1] == n2;
        return r2 ? r2[1] ? (t2 ? m.pop() : m.push(n2), r2[0 | t2]) : r2[0] : n2;
      }
      function f() {
        for (var e2 = ""; m.length; )
          e2 += $(m[m.length - 1]);
        return e2;
      }
      for (a = a.replace(/^\[(.+?)\]:\s*(.+)$/gm, function(e2, n2, r2) {
        return i[n2.toLowerCase()] = r2, "";
      }).replace(/^\n+|\n+$/g, ""); s2 = u.exec(a); )
        l = a.substring(d2, s2.index), d2 = u.lastIndex, c = s2[0], l.match(/[^\\](\\\\)*\\$/) || ((p = s2[3] || s2[4]) ? c = '<pre class="code ' + (s2[4] ? "poetry" : s2[2].toLowerCase()) + '"><code' + (s2[2] ? ' class="language-' + s2[2].toLowerCase() + '"' : "") + ">" + n(r(p).replace(/^\n+|\n+$/g, "")) + "</code></pre>" : (p = s2[6]) ? (p.match(/\./) && (s2[5] = s2[5].replace(/^\d+/gm, "")), g = t(n(s2[5].replace(/^\s*[>*+.-]/gm, ""))), p == ">" ? p = "blockquote" : (p = p.match(/\./) ? "ol" : "ul", g = g.replace(/^(.*)(\n|$)/gm, "<li>$1</li>")), c = "<" + p + ">" + g + "</" + p + ">") : s2[8] ? c = '<img src="' + r(s2[8]) + '" alt="' + r(s2[7]) + '">' : s2[10] ? (h = h.replace("<a>", '<a href="' + r(s2[11] || i[l.toLowerCase()]) + '">'), c = f() + "</a>") : s2[9] ? c = "<a>" : s2[12] || s2[14] ? c = "<" + (p = "h" + (s2[14] ? s2[14].length : s2[13] > "=" ? 1 : 2)) + ">" + t(s2[12] || s2[15], i) + "</" + p + ">" : s2[16] ? c = "<code>" + r(s2[16]) + "</code>" : (s2[17] || s2[1]) && (c = $(s2[17] || "--"))), h += l, h += c;
      return (h + a.substring(d2) + f()).replace(/^\n+|\n+$/g, "");
    };
  }
});

// .svelte-kit/cloudflare-workers/node_modules/mime/Mime.js
var require_Mime = __commonJS({
  ".svelte-kit/cloudflare-workers/node_modules/mime/Mime.js"(exports2, module2) {
    "use strict";
    function Mime() {
      this._types = Object.create(null);
      this._extensions = Object.create(null);
      for (let i = 0; i < arguments.length; i++) {
        this.define(arguments[i]);
      }
      this.define = this.define.bind(this);
      this.getType = this.getType.bind(this);
      this.getExtension = this.getExtension.bind(this);
    }
    Mime.prototype.define = function(typeMap, force) {
      for (let type in typeMap) {
        let extensions = typeMap[type].map(function(t) {
          return t.toLowerCase();
        });
        type = type.toLowerCase();
        for (let i = 0; i < extensions.length; i++) {
          const ext = extensions[i];
          if (ext[0] === "*") {
            continue;
          }
          if (!force && ext in this._types) {
            throw new Error('Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".');
          }
          this._types[ext] = type;
        }
        if (force || !this._extensions[type]) {
          const ext = extensions[0];
          this._extensions[type] = ext[0] !== "*" ? ext : ext.substr(1);
        }
      }
    };
    Mime.prototype.getType = function(path) {
      path = String(path);
      let last = path.replace(/^.*[/\\]/, "").toLowerCase();
      let ext = last.replace(/^.*\./, "").toLowerCase();
      let hasPath = last.length < path.length;
      let hasDot = ext.length < last.length - 1;
      return (hasDot || !hasPath) && this._types[ext] || null;
    };
    Mime.prototype.getExtension = function(type) {
      type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
      return type && this._extensions[type.toLowerCase()] || null;
    };
    module2.exports = Mime;
  }
});

// .svelte-kit/cloudflare-workers/node_modules/mime/types/standard.js
var require_standard = __commonJS({
  ".svelte-kit/cloudflare-workers/node_modules/mime/types/standard.js"(exports2, module2) {
    module2.exports = {"application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomdeleted+xml": ["atomdeleted"], "application/atomsvc+xml": ["atomsvc"], "application/atsc-dwd+xml": ["dwd"], "application/atsc-held+xml": ["held"], "application/atsc-rsat+xml": ["rsat"], "application/bdoc": ["bdoc"], "application/calendar+xml": ["xcs"], "application/ccxml+xml": ["ccxml"], "application/cdfx+xml": ["cdfx"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["ecma", "es"], "application/emma+xml": ["emma"], "application/emotionml+xml": ["emotionml"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/fdt+xml": ["fdt"], "application/font-tdpfr": ["pfr"], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hjson": ["hjson"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/its+xml": ["its"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lgr+xml": ["lgr"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mmt-aei+xml": ["maei"], "application/mmt-usd+xml": ["musd"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/mrb-consumer+xml": ["*xdf"], "application/mrb-publish+xml": ["*xdf"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/n-quads": ["nq"], "application/n-triples": ["nt"], "application/node": ["cjs"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/p2p-overlay+xml": ["relo"], "application/patch-ops-error+xml": ["*xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/provenance+xml": ["provx"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf", "owl"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/route-apd+xml": ["rapd"], "application/route-s-tsid+xml": ["sls"], "application/route-usd+xml": ["rusd"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/senml+xml": ["senmlx"], "application/sensml+xml": ["sensmlx"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/sieve": ["siv", "sieve"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/swid+xml": ["swidtag"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/toml": ["toml"], "application/ttml+xml": ["ttml"], "application/ubjson": ["ubj"], "application/urc-ressheet+xml": ["rsheet"], "application/urc-targetdesc+xml": ["td"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/xaml+xml": ["xaml"], "application/xcap-att+xml": ["xav"], "application/xcap-caps+xml": ["xca"], "application/xcap-diff+xml": ["xdf"], "application/xcap-el+xml": ["xel"], "application/xcap-error+xml": ["xer"], "application/xcap-ns+xml": ["xns"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xliff+xml": ["xlf"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["*xsl", "xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": ["*3gpp"], "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp3": ["*mp3"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/wave": ["*wav"], "audio/webm": ["weba"], "audio/xm": ["xm"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/aces": ["exr"], "image/apng": ["apng"], "image/avif": ["avif"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/dicom-rle": ["drle"], "image/emf": ["emf"], "image/fits": ["fits"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/heic": ["heic"], "image/heic-sequence": ["heics"], "image/heif": ["heif"], "image/heif-sequence": ["heifs"], "image/hej2k": ["hej2"], "image/hsj2": ["hsj2"], "image/ief": ["ief"], "image/jls": ["jls"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jph": ["jph"], "image/jphc": ["jhc"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/jxr": ["jxr"], "image/jxra": ["jxra"], "image/jxrs": ["jxrs"], "image/jxs": ["jxs"], "image/jxsc": ["jxsc"], "image/jxsi": ["jxsi"], "image/jxss": ["jxss"], "image/ktx": ["ktx"], "image/ktx2": ["ktx2"], "image/png": ["png"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/t38": ["t38"], "image/tiff": ["tif", "tiff"], "image/tiff-fx": ["tfx"], "image/webp": ["webp"], "image/wmf": ["wmf"], "message/disposition-notification": ["disposition-notification"], "message/global": ["u8msg"], "message/global-delivery-status": ["u8dsn"], "message/global-disposition-notification": ["u8mdn"], "message/global-headers": ["u8hdr"], "message/rfc822": ["eml", "mime"], "model/3mf": ["3mf"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/mtl": ["mtl"], "model/obj": ["obj"], "model/stl": ["stl"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["*x3db", "x3dbz"], "model/x3d+fastinfoset": ["x3db"], "model/x3d+vrml": ["*x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "model/x3d-vrml": ["x3dv"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/mdx": ["mdx"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/richtext": ["rtx"], "text/rtf": ["*rtf"], "text/sgml": ["sgml", "sgm"], "text/shex": ["shex"], "text/slim": ["slim", "slm"], "text/spdx": ["spdx"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vtt": ["vtt"], "text/xml": ["*xml"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/iso.segment": ["m4s"], "video/jpeg": ["jpgv"], "video/jpm": ["*jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/webm": ["webm"]};
  }
});

// .svelte-kit/cloudflare-workers/node_modules/mime/types/other.js
var require_other = __commonJS({
  ".svelte-kit/cloudflare-workers/node_modules/mime/types/other.js"(exports2, module2) {
    module2.exports = {"application/prs.cww": ["cww"], "application/vnd.1000minds.decision-model+xml": ["1km"], "application/vnd.3gpp.pic-bw-large": ["plb"], "application/vnd.3gpp.pic-bw-small": ["psb"], "application/vnd.3gpp.pic-bw-var": ["pvb"], "application/vnd.3gpp2.tcap": ["tcap"], "application/vnd.3m.post-it-notes": ["pwn"], "application/vnd.accpac.simply.aso": ["aso"], "application/vnd.accpac.simply.imp": ["imp"], "application/vnd.acucobol": ["acu"], "application/vnd.acucorp": ["atc", "acutc"], "application/vnd.adobe.air-application-installer-package+zip": ["air"], "application/vnd.adobe.formscentral.fcdt": ["fcdt"], "application/vnd.adobe.fxp": ["fxp", "fxpl"], "application/vnd.adobe.xdp+xml": ["xdp"], "application/vnd.adobe.xfdf": ["xfdf"], "application/vnd.ahead.space": ["ahead"], "application/vnd.airzip.filesecure.azf": ["azf"], "application/vnd.airzip.filesecure.azs": ["azs"], "application/vnd.amazon.ebook": ["azw"], "application/vnd.americandynamics.acc": ["acc"], "application/vnd.amiga.ami": ["ami"], "application/vnd.android.package-archive": ["apk"], "application/vnd.anser-web-certificate-issue-initiation": ["cii"], "application/vnd.anser-web-funds-transfer-initiation": ["fti"], "application/vnd.antix.game-component": ["atx"], "application/vnd.apple.installer+xml": ["mpkg"], "application/vnd.apple.keynote": ["key"], "application/vnd.apple.mpegurl": ["m3u8"], "application/vnd.apple.numbers": ["numbers"], "application/vnd.apple.pages": ["pages"], "application/vnd.apple.pkpass": ["pkpass"], "application/vnd.aristanetworks.swi": ["swi"], "application/vnd.astraea-software.iota": ["iota"], "application/vnd.audiograph": ["aep"], "application/vnd.balsamiq.bmml+xml": ["bmml"], "application/vnd.blueice.multipass": ["mpm"], "application/vnd.bmi": ["bmi"], "application/vnd.businessobjects": ["rep"], "application/vnd.chemdraw+xml": ["cdxml"], "application/vnd.chipnuts.karaoke-mmd": ["mmd"], "application/vnd.cinderella": ["cdy"], "application/vnd.citationstyles.style+xml": ["csl"], "application/vnd.claymore": ["cla"], "application/vnd.cloanto.rp9": ["rp9"], "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"], "application/vnd.cluetrust.cartomobile-config": ["c11amc"], "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"], "application/vnd.commonspace": ["csp"], "application/vnd.contact.cmsg": ["cdbcmsg"], "application/vnd.cosmocaller": ["cmc"], "application/vnd.crick.clicker": ["clkx"], "application/vnd.crick.clicker.keyboard": ["clkk"], "application/vnd.crick.clicker.palette": ["clkp"], "application/vnd.crick.clicker.template": ["clkt"], "application/vnd.crick.clicker.wordbank": ["clkw"], "application/vnd.criticaltools.wbs+xml": ["wbs"], "application/vnd.ctc-posml": ["pml"], "application/vnd.cups-ppd": ["ppd"], "application/vnd.curl.car": ["car"], "application/vnd.curl.pcurl": ["pcurl"], "application/vnd.dart": ["dart"], "application/vnd.data-vision.rdz": ["rdz"], "application/vnd.dbf": ["dbf"], "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"], "application/vnd.dece.ttml+xml": ["uvt", "uvvt"], "application/vnd.dece.unspecified": ["uvx", "uvvx"], "application/vnd.dece.zip": ["uvz", "uvvz"], "application/vnd.denovo.fcselayout-link": ["fe_launch"], "application/vnd.dna": ["dna"], "application/vnd.dolby.mlp": ["mlp"], "application/vnd.dpgraph": ["dpg"], "application/vnd.dreamfactory": ["dfac"], "application/vnd.ds-keypoint": ["kpxx"], "application/vnd.dvb.ait": ["ait"], "application/vnd.dvb.service": ["svc"], "application/vnd.dynageo": ["geo"], "application/vnd.ecowin.chart": ["mag"], "application/vnd.enliven": ["nml"], "application/vnd.epson.esf": ["esf"], "application/vnd.epson.msf": ["msf"], "application/vnd.epson.quickanime": ["qam"], "application/vnd.epson.salt": ["slt"], "application/vnd.epson.ssf": ["ssf"], "application/vnd.eszigno3+xml": ["es3", "et3"], "application/vnd.ezpix-album": ["ez2"], "application/vnd.ezpix-package": ["ez3"], "application/vnd.fdf": ["fdf"], "application/vnd.fdsn.mseed": ["mseed"], "application/vnd.fdsn.seed": ["seed", "dataless"], "application/vnd.flographit": ["gph"], "application/vnd.fluxtime.clip": ["ftc"], "application/vnd.framemaker": ["fm", "frame", "maker", "book"], "application/vnd.frogans.fnc": ["fnc"], "application/vnd.frogans.ltf": ["ltf"], "application/vnd.fsc.weblaunch": ["fsc"], "application/vnd.fujitsu.oasys": ["oas"], "application/vnd.fujitsu.oasys2": ["oa2"], "application/vnd.fujitsu.oasys3": ["oa3"], "application/vnd.fujitsu.oasysgp": ["fg5"], "application/vnd.fujitsu.oasysprs": ["bh2"], "application/vnd.fujixerox.ddd": ["ddd"], "application/vnd.fujixerox.docuworks": ["xdw"], "application/vnd.fujixerox.docuworks.binder": ["xbd"], "application/vnd.fuzzysheet": ["fzs"], "application/vnd.genomatix.tuxedo": ["txd"], "application/vnd.geogebra.file": ["ggb"], "application/vnd.geogebra.tool": ["ggt"], "application/vnd.geometry-explorer": ["gex", "gre"], "application/vnd.geonext": ["gxt"], "application/vnd.geoplan": ["g2w"], "application/vnd.geospace": ["g3w"], "application/vnd.gmx": ["gmx"], "application/vnd.google-apps.document": ["gdoc"], "application/vnd.google-apps.presentation": ["gslides"], "application/vnd.google-apps.spreadsheet": ["gsheet"], "application/vnd.google-earth.kml+xml": ["kml"], "application/vnd.google-earth.kmz": ["kmz"], "application/vnd.grafeq": ["gqf", "gqs"], "application/vnd.groove-account": ["gac"], "application/vnd.groove-help": ["ghf"], "application/vnd.groove-identity-message": ["gim"], "application/vnd.groove-injector": ["grv"], "application/vnd.groove-tool-message": ["gtm"], "application/vnd.groove-tool-template": ["tpl"], "application/vnd.groove-vcard": ["vcg"], "application/vnd.hal+xml": ["hal"], "application/vnd.handheld-entertainment+xml": ["zmm"], "application/vnd.hbci": ["hbci"], "application/vnd.hhe.lesson-player": ["les"], "application/vnd.hp-hpgl": ["hpgl"], "application/vnd.hp-hpid": ["hpid"], "application/vnd.hp-hps": ["hps"], "application/vnd.hp-jlyt": ["jlt"], "application/vnd.hp-pcl": ["pcl"], "application/vnd.hp-pclxl": ["pclxl"], "application/vnd.hydrostatix.sof-data": ["sfd-hdstx"], "application/vnd.ibm.minipay": ["mpy"], "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"], "application/vnd.ibm.rights-management": ["irm"], "application/vnd.ibm.secure-container": ["sc"], "application/vnd.iccprofile": ["icc", "icm"], "application/vnd.igloader": ["igl"], "application/vnd.immervision-ivp": ["ivp"], "application/vnd.immervision-ivu": ["ivu"], "application/vnd.insors.igm": ["igm"], "application/vnd.intercon.formnet": ["xpw", "xpx"], "application/vnd.intergeo": ["i2g"], "application/vnd.intu.qbo": ["qbo"], "application/vnd.intu.qfx": ["qfx"], "application/vnd.ipunplugged.rcprofile": ["rcprofile"], "application/vnd.irepository.package+xml": ["irp"], "application/vnd.is-xpr": ["xpr"], "application/vnd.isac.fcs": ["fcs"], "application/vnd.jam": ["jam"], "application/vnd.jcp.javame.midlet-rms": ["rms"], "application/vnd.jisp": ["jisp"], "application/vnd.joost.joda-archive": ["joda"], "application/vnd.kahootz": ["ktz", "ktr"], "application/vnd.kde.karbon": ["karbon"], "application/vnd.kde.kchart": ["chrt"], "application/vnd.kde.kformula": ["kfo"], "application/vnd.kde.kivio": ["flw"], "application/vnd.kde.kontour": ["kon"], "application/vnd.kde.kpresenter": ["kpr", "kpt"], "application/vnd.kde.kspread": ["ksp"], "application/vnd.kde.kword": ["kwd", "kwt"], "application/vnd.kenameaapp": ["htke"], "application/vnd.kidspiration": ["kia"], "application/vnd.kinar": ["kne", "knp"], "application/vnd.koan": ["skp", "skd", "skt", "skm"], "application/vnd.kodak-descriptor": ["sse"], "application/vnd.las.las+xml": ["lasxml"], "application/vnd.llamagraphics.life-balance.desktop": ["lbd"], "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"], "application/vnd.lotus-1-2-3": ["123"], "application/vnd.lotus-approach": ["apr"], "application/vnd.lotus-freelance": ["pre"], "application/vnd.lotus-notes": ["nsf"], "application/vnd.lotus-organizer": ["org"], "application/vnd.lotus-screencam": ["scm"], "application/vnd.lotus-wordpro": ["lwp"], "application/vnd.macports.portpkg": ["portpkg"], "application/vnd.mcd": ["mcd"], "application/vnd.medcalcdata": ["mc1"], "application/vnd.mediastation.cdkey": ["cdkey"], "application/vnd.mfer": ["mwf"], "application/vnd.mfmp": ["mfm"], "application/vnd.micrografx.flo": ["flo"], "application/vnd.micrografx.igx": ["igx"], "application/vnd.mif": ["mif"], "application/vnd.mobius.daf": ["daf"], "application/vnd.mobius.dis": ["dis"], "application/vnd.mobius.mbk": ["mbk"], "application/vnd.mobius.mqy": ["mqy"], "application/vnd.mobius.msl": ["msl"], "application/vnd.mobius.plc": ["plc"], "application/vnd.mobius.txf": ["txf"], "application/vnd.mophun.application": ["mpn"], "application/vnd.mophun.certificate": ["mpc"], "application/vnd.mozilla.xul+xml": ["xul"], "application/vnd.ms-artgalry": ["cil"], "application/vnd.ms-cab-compressed": ["cab"], "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"], "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"], "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"], "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"], "application/vnd.ms-excel.template.macroenabled.12": ["xltm"], "application/vnd.ms-fontobject": ["eot"], "application/vnd.ms-htmlhelp": ["chm"], "application/vnd.ms-ims": ["ims"], "application/vnd.ms-lrm": ["lrm"], "application/vnd.ms-officetheme": ["thmx"], "application/vnd.ms-outlook": ["msg"], "application/vnd.ms-pki.seccat": ["cat"], "application/vnd.ms-pki.stl": ["*stl"], "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"], "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"], "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"], "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"], "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"], "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"], "application/vnd.ms-project": ["mpp", "mpt"], "application/vnd.ms-word.document.macroenabled.12": ["docm"], "application/vnd.ms-word.template.macroenabled.12": ["dotm"], "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"], "application/vnd.ms-wpl": ["wpl"], "application/vnd.ms-xpsdocument": ["xps"], "application/vnd.mseq": ["mseq"], "application/vnd.musician": ["mus"], "application/vnd.muvee.style": ["msty"], "application/vnd.mynfc": ["taglet"], "application/vnd.neurolanguage.nlu": ["nlu"], "application/vnd.nitf": ["ntf", "nitf"], "application/vnd.noblenet-directory": ["nnd"], "application/vnd.noblenet-sealer": ["nns"], "application/vnd.noblenet-web": ["nnw"], "application/vnd.nokia.n-gage.ac+xml": ["*ac"], "application/vnd.nokia.n-gage.data": ["ngdat"], "application/vnd.nokia.n-gage.symbian.install": ["n-gage"], "application/vnd.nokia.radio-preset": ["rpst"], "application/vnd.nokia.radio-presets": ["rpss"], "application/vnd.novadigm.edm": ["edm"], "application/vnd.novadigm.edx": ["edx"], "application/vnd.novadigm.ext": ["ext"], "application/vnd.oasis.opendocument.chart": ["odc"], "application/vnd.oasis.opendocument.chart-template": ["otc"], "application/vnd.oasis.opendocument.database": ["odb"], "application/vnd.oasis.opendocument.formula": ["odf"], "application/vnd.oasis.opendocument.formula-template": ["odft"], "application/vnd.oasis.opendocument.graphics": ["odg"], "application/vnd.oasis.opendocument.graphics-template": ["otg"], "application/vnd.oasis.opendocument.image": ["odi"], "application/vnd.oasis.opendocument.image-template": ["oti"], "application/vnd.oasis.opendocument.presentation": ["odp"], "application/vnd.oasis.opendocument.presentation-template": ["otp"], "application/vnd.oasis.opendocument.spreadsheet": ["ods"], "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"], "application/vnd.oasis.opendocument.text": ["odt"], "application/vnd.oasis.opendocument.text-master": ["odm"], "application/vnd.oasis.opendocument.text-template": ["ott"], "application/vnd.oasis.opendocument.text-web": ["oth"], "application/vnd.olpc-sugar": ["xo"], "application/vnd.oma.dd2+xml": ["dd2"], "application/vnd.openblox.game+xml": ["obgx"], "application/vnd.openofficeorg.extension": ["oxt"], "application/vnd.openstreetmap.data+xml": ["osm"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"], "application/vnd.openxmlformats-officedocument.presentationml.slide": ["sldx"], "application/vnd.openxmlformats-officedocument.presentationml.slideshow": ["ppsx"], "application/vnd.openxmlformats-officedocument.presentationml.template": ["potx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.template": ["xltx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.template": ["dotx"], "application/vnd.osgeo.mapguide.package": ["mgp"], "application/vnd.osgi.dp": ["dp"], "application/vnd.osgi.subsystem": ["esa"], "application/vnd.palm": ["pdb", "pqa", "oprc"], "application/vnd.pawaafile": ["paw"], "application/vnd.pg.format": ["str"], "application/vnd.pg.osasli": ["ei6"], "application/vnd.picsel": ["efif"], "application/vnd.pmi.widget": ["wg"], "application/vnd.pocketlearn": ["plf"], "application/vnd.powerbuilder6": ["pbd"], "application/vnd.previewsystems.box": ["box"], "application/vnd.proteus.magazine": ["mgz"], "application/vnd.publishare-delta-tree": ["qps"], "application/vnd.pvi.ptid1": ["ptid"], "application/vnd.quark.quarkxpress": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"], "application/vnd.rar": ["rar"], "application/vnd.realvnc.bed": ["bed"], "application/vnd.recordare.musicxml": ["mxl"], "application/vnd.recordare.musicxml+xml": ["musicxml"], "application/vnd.rig.cryptonote": ["cryptonote"], "application/vnd.rim.cod": ["cod"], "application/vnd.rn-realmedia": ["rm"], "application/vnd.rn-realmedia-vbr": ["rmvb"], "application/vnd.route66.link66+xml": ["link66"], "application/vnd.sailingtracker.track": ["st"], "application/vnd.seemail": ["see"], "application/vnd.sema": ["sema"], "application/vnd.semd": ["semd"], "application/vnd.semf": ["semf"], "application/vnd.shana.informed.formdata": ["ifm"], "application/vnd.shana.informed.formtemplate": ["itp"], "application/vnd.shana.informed.interchange": ["iif"], "application/vnd.shana.informed.package": ["ipk"], "application/vnd.simtech-mindmapper": ["twd", "twds"], "application/vnd.smaf": ["mmf"], "application/vnd.smart.teacher": ["teacher"], "application/vnd.software602.filler.form+xml": ["fo"], "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"], "application/vnd.spotfire.dxp": ["dxp"], "application/vnd.spotfire.sfs": ["sfs"], "application/vnd.stardivision.calc": ["sdc"], "application/vnd.stardivision.draw": ["sda"], "application/vnd.stardivision.impress": ["sdd"], "application/vnd.stardivision.math": ["smf"], "application/vnd.stardivision.writer": ["sdw", "vor"], "application/vnd.stardivision.writer-global": ["sgl"], "application/vnd.stepmania.package": ["smzip"], "application/vnd.stepmania.stepchart": ["sm"], "application/vnd.sun.wadl+xml": ["wadl"], "application/vnd.sun.xml.calc": ["sxc"], "application/vnd.sun.xml.calc.template": ["stc"], "application/vnd.sun.xml.draw": ["sxd"], "application/vnd.sun.xml.draw.template": ["std"], "application/vnd.sun.xml.impress": ["sxi"], "application/vnd.sun.xml.impress.template": ["sti"], "application/vnd.sun.xml.math": ["sxm"], "application/vnd.sun.xml.writer": ["sxw"], "application/vnd.sun.xml.writer.global": ["sxg"], "application/vnd.sun.xml.writer.template": ["stw"], "application/vnd.sus-calendar": ["sus", "susp"], "application/vnd.svd": ["svd"], "application/vnd.symbian.install": ["sis", "sisx"], "application/vnd.syncml+xml": ["xsm"], "application/vnd.syncml.dm+wbxml": ["bdm"], "application/vnd.syncml.dm+xml": ["xdm"], "application/vnd.syncml.dmddf+xml": ["ddf"], "application/vnd.tao.intent-module-archive": ["tao"], "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"], "application/vnd.tmobile-livetv": ["tmo"], "application/vnd.trid.tpt": ["tpt"], "application/vnd.triscape.mxs": ["mxs"], "application/vnd.trueapp": ["tra"], "application/vnd.ufdl": ["ufd", "ufdl"], "application/vnd.uiq.theme": ["utz"], "application/vnd.umajin": ["umj"], "application/vnd.unity": ["unityweb"], "application/vnd.uoml+xml": ["uoml"], "application/vnd.vcx": ["vcx"], "application/vnd.visio": ["vsd", "vst", "vss", "vsw"], "application/vnd.visionary": ["vis"], "application/vnd.vsf": ["vsf"], "application/vnd.wap.wbxml": ["wbxml"], "application/vnd.wap.wmlc": ["wmlc"], "application/vnd.wap.wmlscriptc": ["wmlsc"], "application/vnd.webturbo": ["wtb"], "application/vnd.wolfram.player": ["nbp"], "application/vnd.wordperfect": ["wpd"], "application/vnd.wqd": ["wqd"], "application/vnd.wt.stf": ["stf"], "application/vnd.xara": ["xar"], "application/vnd.xfdl": ["xfdl"], "application/vnd.yamaha.hv-dic": ["hvd"], "application/vnd.yamaha.hv-script": ["hvs"], "application/vnd.yamaha.hv-voice": ["hvp"], "application/vnd.yamaha.openscoreformat": ["osf"], "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"], "application/vnd.yamaha.smaf-audio": ["saf"], "application/vnd.yamaha.smaf-phrase": ["spf"], "application/vnd.yellowriver-custom-menu": ["cmp"], "application/vnd.zul": ["zir", "zirz"], "application/vnd.zzazz.deck+xml": ["zaz"], "application/x-7z-compressed": ["7z"], "application/x-abiword": ["abw"], "application/x-ace-compressed": ["ace"], "application/x-apple-diskimage": ["*dmg"], "application/x-arj": ["arj"], "application/x-authorware-bin": ["aab", "x32", "u32", "vox"], "application/x-authorware-map": ["aam"], "application/x-authorware-seg": ["aas"], "application/x-bcpio": ["bcpio"], "application/x-bdoc": ["*bdoc"], "application/x-bittorrent": ["torrent"], "application/x-blorb": ["blb", "blorb"], "application/x-bzip": ["bz"], "application/x-bzip2": ["bz2", "boz"], "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"], "application/x-cdlink": ["vcd"], "application/x-cfs-compressed": ["cfs"], "application/x-chat": ["chat"], "application/x-chess-pgn": ["pgn"], "application/x-chrome-extension": ["crx"], "application/x-cocoa": ["cco"], "application/x-conference": ["nsc"], "application/x-cpio": ["cpio"], "application/x-csh": ["csh"], "application/x-debian-package": ["*deb", "udeb"], "application/x-dgc-compressed": ["dgc"], "application/x-director": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"], "application/x-doom": ["wad"], "application/x-dtbncx+xml": ["ncx"], "application/x-dtbook+xml": ["dtb"], "application/x-dtbresource+xml": ["res"], "application/x-dvi": ["dvi"], "application/x-envoy": ["evy"], "application/x-eva": ["eva"], "application/x-font-bdf": ["bdf"], "application/x-font-ghostscript": ["gsf"], "application/x-font-linux-psf": ["psf"], "application/x-font-pcf": ["pcf"], "application/x-font-snf": ["snf"], "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"], "application/x-freearc": ["arc"], "application/x-futuresplash": ["spl"], "application/x-gca-compressed": ["gca"], "application/x-glulx": ["ulx"], "application/x-gnumeric": ["gnumeric"], "application/x-gramps-xml": ["gramps"], "application/x-gtar": ["gtar"], "application/x-hdf": ["hdf"], "application/x-httpd-php": ["php"], "application/x-install-instructions": ["install"], "application/x-iso9660-image": ["*iso"], "application/x-java-archive-diff": ["jardiff"], "application/x-java-jnlp-file": ["jnlp"], "application/x-keepass2": ["kdbx"], "application/x-latex": ["latex"], "application/x-lua-bytecode": ["luac"], "application/x-lzh-compressed": ["lzh", "lha"], "application/x-makeself": ["run"], "application/x-mie": ["mie"], "application/x-mobipocket-ebook": ["prc", "mobi"], "application/x-ms-application": ["application"], "application/x-ms-shortcut": ["lnk"], "application/x-ms-wmd": ["wmd"], "application/x-ms-wmz": ["wmz"], "application/x-ms-xbap": ["xbap"], "application/x-msaccess": ["mdb"], "application/x-msbinder": ["obd"], "application/x-mscardfile": ["crd"], "application/x-msclip": ["clp"], "application/x-msdos-program": ["*exe"], "application/x-msdownload": ["*exe", "*dll", "com", "bat", "*msi"], "application/x-msmediaview": ["mvb", "m13", "m14"], "application/x-msmetafile": ["*wmf", "*wmz", "*emf", "emz"], "application/x-msmoney": ["mny"], "application/x-mspublisher": ["pub"], "application/x-msschedule": ["scd"], "application/x-msterminal": ["trm"], "application/x-mswrite": ["wri"], "application/x-netcdf": ["nc", "cdf"], "application/x-ns-proxy-autoconfig": ["pac"], "application/x-nzb": ["nzb"], "application/x-perl": ["pl", "pm"], "application/x-pilot": ["*prc", "*pdb"], "application/x-pkcs12": ["p12", "pfx"], "application/x-pkcs7-certificates": ["p7b", "spc"], "application/x-pkcs7-certreqresp": ["p7r"], "application/x-rar-compressed": ["*rar"], "application/x-redhat-package-manager": ["rpm"], "application/x-research-info-systems": ["ris"], "application/x-sea": ["sea"], "application/x-sh": ["sh"], "application/x-shar": ["shar"], "application/x-shockwave-flash": ["swf"], "application/x-silverlight-app": ["xap"], "application/x-sql": ["sql"], "application/x-stuffit": ["sit"], "application/x-stuffitx": ["sitx"], "application/x-subrip": ["srt"], "application/x-sv4cpio": ["sv4cpio"], "application/x-sv4crc": ["sv4crc"], "application/x-t3vm-image": ["t3"], "application/x-tads": ["gam"], "application/x-tar": ["tar"], "application/x-tcl": ["tcl", "tk"], "application/x-tex": ["tex"], "application/x-tex-tfm": ["tfm"], "application/x-texinfo": ["texinfo", "texi"], "application/x-tgif": ["*obj"], "application/x-ustar": ["ustar"], "application/x-virtualbox-hdd": ["hdd"], "application/x-virtualbox-ova": ["ova"], "application/x-virtualbox-ovf": ["ovf"], "application/x-virtualbox-vbox": ["vbox"], "application/x-virtualbox-vbox-extpack": ["vbox-extpack"], "application/x-virtualbox-vdi": ["vdi"], "application/x-virtualbox-vhd": ["vhd"], "application/x-virtualbox-vmdk": ["vmdk"], "application/x-wais-source": ["src"], "application/x-web-app-manifest+json": ["webapp"], "application/x-x509-ca-cert": ["der", "crt", "pem"], "application/x-xfig": ["fig"], "application/x-xliff+xml": ["*xlf"], "application/x-xpinstall": ["xpi"], "application/x-xz": ["xz"], "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"], "audio/vnd.dece.audio": ["uva", "uvva"], "audio/vnd.digital-winds": ["eol"], "audio/vnd.dra": ["dra"], "audio/vnd.dts": ["dts"], "audio/vnd.dts.hd": ["dtshd"], "audio/vnd.lucent.voice": ["lvp"], "audio/vnd.ms-playready.media.pya": ["pya"], "audio/vnd.nuera.ecelp4800": ["ecelp4800"], "audio/vnd.nuera.ecelp7470": ["ecelp7470"], "audio/vnd.nuera.ecelp9600": ["ecelp9600"], "audio/vnd.rip": ["rip"], "audio/x-aac": ["aac"], "audio/x-aiff": ["aif", "aiff", "aifc"], "audio/x-caf": ["caf"], "audio/x-flac": ["flac"], "audio/x-m4a": ["*m4a"], "audio/x-matroska": ["mka"], "audio/x-mpegurl": ["m3u"], "audio/x-ms-wax": ["wax"], "audio/x-ms-wma": ["wma"], "audio/x-pn-realaudio": ["ram", "ra"], "audio/x-pn-realaudio-plugin": ["rmp"], "audio/x-realaudio": ["*ra"], "audio/x-wav": ["*wav"], "chemical/x-cdx": ["cdx"], "chemical/x-cif": ["cif"], "chemical/x-cmdf": ["cmdf"], "chemical/x-cml": ["cml"], "chemical/x-csml": ["csml"], "chemical/x-xyz": ["xyz"], "image/prs.btif": ["btif"], "image/prs.pti": ["pti"], "image/vnd.adobe.photoshop": ["psd"], "image/vnd.airzip.accelerator.azv": ["azv"], "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"], "image/vnd.djvu": ["djvu", "djv"], "image/vnd.dvb.subtitle": ["*sub"], "image/vnd.dwg": ["dwg"], "image/vnd.dxf": ["dxf"], "image/vnd.fastbidsheet": ["fbs"], "image/vnd.fpx": ["fpx"], "image/vnd.fst": ["fst"], "image/vnd.fujixerox.edmics-mmr": ["mmr"], "image/vnd.fujixerox.edmics-rlc": ["rlc"], "image/vnd.microsoft.icon": ["ico"], "image/vnd.ms-dds": ["dds"], "image/vnd.ms-modi": ["mdi"], "image/vnd.ms-photo": ["wdp"], "image/vnd.net-fpx": ["npx"], "image/vnd.pco.b16": ["b16"], "image/vnd.tencent.tap": ["tap"], "image/vnd.valve.source.texture": ["vtf"], "image/vnd.wap.wbmp": ["wbmp"], "image/vnd.xiff": ["xif"], "image/vnd.zbrush.pcx": ["pcx"], "image/x-3ds": ["3ds"], "image/x-cmu-raster": ["ras"], "image/x-cmx": ["cmx"], "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"], "image/x-icon": ["*ico"], "image/x-jng": ["jng"], "image/x-mrsid-image": ["sid"], "image/x-ms-bmp": ["*bmp"], "image/x-pcx": ["*pcx"], "image/x-pict": ["pic", "pct"], "image/x-portable-anymap": ["pnm"], "image/x-portable-bitmap": ["pbm"], "image/x-portable-graymap": ["pgm"], "image/x-portable-pixmap": ["ppm"], "image/x-rgb": ["rgb"], "image/x-tga": ["tga"], "image/x-xbitmap": ["xbm"], "image/x-xpixmap": ["xpm"], "image/x-xwindowdump": ["xwd"], "message/vnd.wfa.wsc": ["wsc"], "model/vnd.collada+xml": ["dae"], "model/vnd.dwf": ["dwf"], "model/vnd.gdl": ["gdl"], "model/vnd.gtw": ["gtw"], "model/vnd.mts": ["mts"], "model/vnd.opengex": ["ogex"], "model/vnd.parasolid.transmit.binary": ["x_b"], "model/vnd.parasolid.transmit.text": ["x_t"], "model/vnd.usdz+zip": ["usdz"], "model/vnd.valve.source.compiled-map": ["bsp"], "model/vnd.vtu": ["vtu"], "text/prs.lines.tag": ["dsc"], "text/vnd.curl": ["curl"], "text/vnd.curl.dcurl": ["dcurl"], "text/vnd.curl.mcurl": ["mcurl"], "text/vnd.curl.scurl": ["scurl"], "text/vnd.dvb.subtitle": ["sub"], "text/vnd.fly": ["fly"], "text/vnd.fmi.flexstor": ["flx"], "text/vnd.graphviz": ["gv"], "text/vnd.in3d.3dml": ["3dml"], "text/vnd.in3d.spot": ["spot"], "text/vnd.sun.j2me.app-descriptor": ["jad"], "text/vnd.wap.wml": ["wml"], "text/vnd.wap.wmlscript": ["wmls"], "text/x-asm": ["s", "asm"], "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"], "text/x-component": ["htc"], "text/x-fortran": ["f", "for", "f77", "f90"], "text/x-handlebars-template": ["hbs"], "text/x-java-source": ["java"], "text/x-lua": ["lua"], "text/x-markdown": ["mkd"], "text/x-nfo": ["nfo"], "text/x-opml": ["opml"], "text/x-org": ["*org"], "text/x-pascal": ["p", "pas"], "text/x-processing": ["pde"], "text/x-sass": ["sass"], "text/x-scss": ["scss"], "text/x-setext": ["etx"], "text/x-sfv": ["sfv"], "text/x-suse-ymp": ["ymp"], "text/x-uuencode": ["uu"], "text/x-vcalendar": ["vcs"], "text/x-vcard": ["vcf"], "video/vnd.dece.hd": ["uvh", "uvvh"], "video/vnd.dece.mobile": ["uvm", "uvvm"], "video/vnd.dece.pd": ["uvp", "uvvp"], "video/vnd.dece.sd": ["uvs", "uvvs"], "video/vnd.dece.video": ["uvv", "uvvv"], "video/vnd.dvb.file": ["dvb"], "video/vnd.fvt": ["fvt"], "video/vnd.mpegurl": ["mxu", "m4u"], "video/vnd.ms-playready.media.pyv": ["pyv"], "video/vnd.uvvu.mp4": ["uvu", "uvvu"], "video/vnd.vivo": ["viv"], "video/x-f4v": ["f4v"], "video/x-fli": ["fli"], "video/x-flv": ["flv"], "video/x-m4v": ["m4v"], "video/x-matroska": ["mkv", "mk3d", "mks"], "video/x-mng": ["mng"], "video/x-ms-asf": ["asf", "asx"], "video/x-ms-vob": ["vob"], "video/x-ms-wm": ["wm"], "video/x-ms-wmv": ["wmv"], "video/x-ms-wmx": ["wmx"], "video/x-ms-wvx": ["wvx"], "video/x-msvideo": ["avi"], "video/x-sgi-movie": ["movie"], "video/x-smv": ["smv"], "x-conference/x-cooltalk": ["ice"]};
  }
});

// .svelte-kit/cloudflare-workers/node_modules/mime/index.js
var require_mime = __commonJS({
  ".svelte-kit/cloudflare-workers/node_modules/mime/index.js"(exports2, module2) {
    "use strict";
    var Mime = require_Mime();
    module2.exports = new Mime(require_standard(), require_other());
  }
});

// .svelte-kit/cloudflare-workers/node_modules/@cloudflare/kv-asset-handler/dist/types.js
var require_types = __commonJS({
  ".svelte-kit/cloudflare-workers/node_modules/@cloudflare/kv-asset-handler/dist/types.js"(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || function() {
      var extendStatics = function(d2, b) {
        extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d3, b2) {
          d3.__proto__ = b2;
        } || function(d3, b2) {
          for (var p in b2)
            if (b2.hasOwnProperty(p))
              d3[p] = b2[p];
        };
        return extendStatics(d2, b);
      };
      return function(d2, b) {
        extendStatics(d2, b);
        function __() {
          this.constructor = d2;
        }
        d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports2, "__esModule", {value: true});
    exports2.InternalError = exports2.NotFoundError = exports2.MethodNotAllowedError = exports2.KVError = void 0;
    var KVError = function(_super) {
      __extends(KVError2, _super);
      function KVError2(message, status) {
        var _newTarget = this.constructor;
        if (status === void 0) {
          status = 500;
        }
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        _this.name = KVError2.name;
        _this.status = status;
        return _this;
      }
      return KVError2;
    }(Error);
    exports2.KVError = KVError;
    var MethodNotAllowedError = function(_super) {
      __extends(MethodNotAllowedError2, _super);
      function MethodNotAllowedError2(message, status) {
        if (message === void 0) {
          message = "Not a valid request method";
        }
        if (status === void 0) {
          status = 405;
        }
        return _super.call(this, message, status) || this;
      }
      return MethodNotAllowedError2;
    }(KVError);
    exports2.MethodNotAllowedError = MethodNotAllowedError;
    var NotFoundError2 = function(_super) {
      __extends(NotFoundError3, _super);
      function NotFoundError3(message, status) {
        if (message === void 0) {
          message = "Not Found";
        }
        if (status === void 0) {
          status = 404;
        }
        return _super.call(this, message, status) || this;
      }
      return NotFoundError3;
    }(KVError);
    exports2.NotFoundError = NotFoundError2;
    var InternalError = function(_super) {
      __extends(InternalError2, _super);
      function InternalError2(message, status) {
        if (message === void 0) {
          message = "Internal Error in KV Asset Handler";
        }
        if (status === void 0) {
          status = 500;
        }
        return _super.call(this, message, status) || this;
      }
      return InternalError2;
    }(KVError);
    exports2.InternalError = InternalError;
  }
});

// .svelte-kit/cloudflare-workers/node_modules/@cloudflare/kv-asset-handler/dist/index.js
var require_dist = __commonJS({
  ".svelte-kit/cloudflare-workers/node_modules/@cloudflare/kv-asset-handler/dist/index.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve2) {
          resolve2(value);
        });
      }
      return new (P || (P = Promise))(function(resolve2, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = exports2 && exports2.__generator || function(thisArg, body) {
      var _ = {label: 0, sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      }, trys: [], ops: []}, f, y, t, g;
      return g = {next: verb(0), "throw": verb(1), "return": verb(2)}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (_)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return {value: op[1], done: false};
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return {value: op[0] ? op[1] : void 0, done: true};
      }
    };
    Object.defineProperty(exports2, "__esModule", {value: true});
    exports2.InternalError = exports2.NotFoundError = exports2.MethodNotAllowedError = exports2.serveSinglePageApp = exports2.mapRequestToAsset = exports2.getAssetFromKV = void 0;
    var mime = require_mime();
    var types_1 = require_types();
    Object.defineProperty(exports2, "MethodNotAllowedError", {enumerable: true, get: function() {
      return types_1.MethodNotAllowedError;
    }});
    Object.defineProperty(exports2, "NotFoundError", {enumerable: true, get: function() {
      return types_1.NotFoundError;
    }});
    Object.defineProperty(exports2, "InternalError", {enumerable: true, get: function() {
      return types_1.InternalError;
    }});
    var mapRequestToAsset = function(request) {
      var parsedUrl = new URL(request.url);
      var pathname = parsedUrl.pathname;
      if (pathname.endsWith("/")) {
        pathname = pathname.concat("index.html");
      } else if (!mime.getType(pathname)) {
        pathname = pathname.concat("/index.html");
      }
      parsedUrl.pathname = pathname;
      return new Request(parsedUrl.toString(), request);
    };
    exports2.mapRequestToAsset = mapRequestToAsset;
    function serveSinglePageApp(request) {
      request = mapRequestToAsset(request);
      var parsedUrl = new URL(request.url);
      if (parsedUrl.pathname.endsWith(".html")) {
        return new Request(parsedUrl.origin + "/index.html", request);
      } else {
        return request;
      }
    }
    exports2.serveSinglePageApp = serveSinglePageApp;
    var defaultCacheControl = {
      browserTTL: null,
      edgeTTL: 2 * 60 * 60 * 24,
      bypassCache: false
    };
    var getAssetFromKV2 = function(event, options2) {
      return __awaiter(void 0, void 0, void 0, function() {
        var request, ASSET_NAMESPACE, ASSET_MANIFEST, SUPPORTED_METHODS, rawPathKey, pathIsEncoded, requestKey, parsedUrl, pathname, pathKey, cache, mimeType, shouldEdgeCache, cacheKey, evalCacheOpts, shouldSetBrowserCache, response, headers, shouldRevalidate, body;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              options2 = Object.assign({
                ASSET_NAMESPACE: __STATIC_CONTENT,
                ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
                mapRequestToAsset,
                cacheControl: defaultCacheControl,
                defaultMimeType: "text/plain"
              }, options2);
              request = event.request;
              ASSET_NAMESPACE = options2.ASSET_NAMESPACE;
              ASSET_MANIFEST = typeof options2.ASSET_MANIFEST === "string" ? JSON.parse(options2.ASSET_MANIFEST) : options2.ASSET_MANIFEST;
              if (typeof ASSET_NAMESPACE === "undefined") {
                throw new types_1.InternalError("there is no KV namespace bound to the script");
              }
              SUPPORTED_METHODS = ["GET", "HEAD"];
              if (!SUPPORTED_METHODS.includes(request.method)) {
                throw new types_1.MethodNotAllowedError(request.method + " is not a valid request method");
              }
              rawPathKey = new URL(request.url).pathname.replace(/^\/+/, "");
              pathIsEncoded = false;
              if (ASSET_MANIFEST[rawPathKey]) {
                requestKey = request;
              } else if (ASSET_MANIFEST[decodeURIComponent(rawPathKey)]) {
                pathIsEncoded = true;
                requestKey = request;
              } else {
                requestKey = options2.mapRequestToAsset(request);
              }
              parsedUrl = new URL(requestKey.url);
              pathname = pathIsEncoded ? decodeURIComponent(parsedUrl.pathname) : parsedUrl.pathname;
              pathKey = pathname.replace(/^\/+/, "");
              cache = caches.default;
              mimeType = mime.getType(pathKey) || options2.defaultMimeType;
              if (mimeType.startsWith("text")) {
                mimeType += "; charset=utf-8";
              }
              shouldEdgeCache = false;
              if (typeof ASSET_MANIFEST !== "undefined") {
                if (ASSET_MANIFEST[pathKey]) {
                  pathKey = ASSET_MANIFEST[pathKey];
                  shouldEdgeCache = true;
                }
              }
              cacheKey = new Request(parsedUrl.origin + "/" + pathKey, request);
              evalCacheOpts = function() {
                switch (typeof options2.cacheControl) {
                  case "function":
                    return options2.cacheControl(request);
                  case "object":
                    return options2.cacheControl;
                  default:
                    return defaultCacheControl;
                }
              }();
              options2.cacheControl = Object.assign({}, defaultCacheControl, evalCacheOpts);
              if (options2.cacheControl.bypassCache || options2.cacheControl.edgeTTL === null || request.method == "HEAD") {
                shouldEdgeCache = false;
              }
              shouldSetBrowserCache = typeof options2.cacheControl.browserTTL === "number";
              response = null;
              if (!shouldEdgeCache)
                return [3, 2];
              return [4, cache.match(cacheKey)];
            case 1:
              response = _a.sent();
              _a.label = 2;
            case 2:
              if (!response)
                return [3, 3];
              headers = new Headers(response.headers);
              shouldRevalidate = false;
              shouldRevalidate = [
                request.headers.has("range") !== true,
                request.headers.has("if-none-match"),
                response.headers.has("etag"),
                request.headers.get("if-none-match") === "" + pathKey
              ].every(Boolean);
              if (shouldRevalidate) {
                if (response.body && "cancel" in Object.getPrototypeOf(response.body)) {
                  response.body.cancel();
                  console.log("Body exists and environment supports readable streams. Body cancelled");
                } else {
                  console.log("Environment doesnt support readable streams");
                }
                headers.set("cf-cache-status", "REVALIDATED");
                response = new Response(null, {
                  status: 304,
                  headers,
                  statusText: "Not Modified"
                });
              } else {
                headers.set("CF-Cache-Status", "HIT");
                response = new Response(response.body, {headers});
              }
              return [3, 5];
            case 3:
              return [4, ASSET_NAMESPACE.get(pathKey, "arrayBuffer")];
            case 4:
              body = _a.sent();
              if (body === null) {
                throw new types_1.NotFoundError("could not find " + pathKey + " in your content namespace");
              }
              response = new Response(body);
              if (shouldEdgeCache) {
                response.headers.set("Accept-Ranges", "bytes");
                response.headers.set("Content-Length", body.length);
                if (!response.headers.has("etag")) {
                  response.headers.set("etag", "" + pathKey);
                }
                response.headers.set("Cache-Control", "max-age=" + options2.cacheControl.edgeTTL);
                event.waitUntil(cache.put(cacheKey, response.clone()));
                response.headers.set("CF-Cache-Status", "MISS");
              }
              _a.label = 5;
            case 5:
              response.headers.set("Content-Type", mimeType);
              if (shouldSetBrowserCache) {
                response.headers.set("Cache-Control", "max-age=" + options2.cacheControl.browserTTL);
              } else {
                response.headers.delete("Cache-Control");
              }
              return [2, response];
          }
        });
      });
    };
    exports2.getAssetFromKV = getAssetFromKV2;
  }
});

// node_modules/.pnpm/@sveltejs+kit@1.0.0-next.99_svelte@3.38.2+vite@2.2.3/node_modules/@sveltejs/kit/dist/ssr.js
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
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start = noop) {
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
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
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
var s$1 = JSON.stringify;
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
var s = JSON.stringify;
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
  const {module: module2} = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
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
            const rendered = await respond({
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
                  json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
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
    loaded = await module2.load.call(null, load_input);
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
var escaped = {
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
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
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
          } catch (e) {
            options2.handle_error(e);
            status = 500;
            error2 = e;
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
                } catch (e) {
                  options2.handle_error(e);
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
  const $session = await options2.hooks.getSession(request);
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
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
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
      if (typeof body === "object" && (!("content-type" in headers) || headers["content-type"] === "application/json")) {
        headers = {...headers, "content-type": "application/json"};
        body = JSON.stringify(body);
      }
      return {status, body, headers};
    }
  }
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
var _map;
var ReadOnlyFormData = class {
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
};
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
async function respond(incoming, options2, state = {}) {
  if (incoming.path.endsWith("/") && incoming.path !== "/") {
    const q = incoming.query.toString();
    return {
      status: 301,
      headers: {
        location: encodeURI(incoming.path.slice(0, -1) + (q ? `?${q}` : ""))
      }
    };
  }
  try {
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers: lowercase_keys(incoming.headers),
        body: parse_body(incoming),
        params: null,
        locals: {}
      },
      render: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
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
  } catch (e) {
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function hash(str) {
  let hash2 = 5381, i = str.length;
  while (i)
    hash2 = hash2 * 33 ^ str.charCodeAt(--i);
  return (hash2 >>> 0).toString(36);
}

// node_modules/.pnpm/svelte@3.38.2/node_modules/svelte/internal/index.mjs
function noop2() {
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
function is_function(thing) {
  return typeof thing === "function";
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function set_store_value(store, ret, value = ret) {
  store.set(value);
  return ret;
}
var tasks = new Set();
var active_docs = new Set();
var current_component;
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
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
var resolved_promise = Promise.resolve();
var seen_callbacks = new Set();
var outroing = new Set();
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
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
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
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
    render: (props = {}, {$$slots = {}, context = new Map()} = {}) => {
      on_destroy = [];
      const result = {title: "", head: "", css: new Set()};
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
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: "open"});
    }
    connectedCallback() {
      const {on_mount} = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr, _oldValue, newValue) {
      this[attr] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop2;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index2 = callbacks.indexOf(callback);
        if (index2 !== -1)
          callbacks.splice(index2, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}

// .svelte-kit/output/server/app.js
var import_cookie = __toModule(require_cookie());
var import_snarkdown = __toModule(require_snarkdown());
var css$6 = {
  code: "#svelte-announcer.svelte-1y31lbn{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n</script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}</style>"],"names":[],"mappings":"AAqDO,gCAAiB,CAAC,SAAS,QAAQ,CAAC,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,SAAS,MAAM,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC,OAAO,GAAG,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1y31lbn"}">${navigated ? `${escape2(title)}` : ``}</div>` : ``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
async function handle({request, render: render2}) {
  const cookies = await import_cookie.default.parse(request.headers.cookie || "");
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
  const response = await render2(request);
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
var template = ({head, body}) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.ico" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
function init(settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-84285aed.js",
      css: ["/./_app/assets/start-b97461fb.css"],
      js: ["/./_app/start-84285aed.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/singletons-bb9012b7.js"]
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
var d = decodeURIComponent;
var empty = () => ({});
var manifest = {
  assets: [{file: "favicon.ico", size: 1150, type: "image/vnd.microsoft.icon"}, {file: "images/app-image.webp", size: 74688, type: "image/webp"}, {file: "images/feature-image2.webp", size: 65954, type: "image/webp"}, {file: "logo-192.png", size: 4760, type: "image/png"}, {file: "logo-512.png", size: 13928, type: "image/png"}, {file: "logo.webp", size: 7916, type: "image/webp"}, {file: "logo_light.webp", size: 5204, type: "image/webp"}, {file: "robots.txt", size: 100, type: "text/plain"}],
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
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({request, render: render2}) => render2(request))
});
var module_lookup = {
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
var metadata_lookup = {"src/routes/$layout.svelte": {entry: "/./_app/pages/$layout.svelte-c22140f7.js", css: ["/./_app/assets/pages/$layout.svelte-758d7f09.css"], js: ["/./_app/pages/$layout.svelte-c22140f7.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/stores-1bba30e8.js", "/./_app/chunks/button-bda43d45.js"], styles: null}, "src/routes/$error.svelte": {entry: "/./_app/pages/$error.svelte-7cbf4174.js", css: ["/./_app/assets/pages/$error.svelte-b6106204.css"], js: ["/./_app/pages/$error.svelte-7cbf4174.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/index.svelte": {entry: "/./_app/pages/index.svelte-5254c81b.js", css: ["/./_app/assets/pages/index.svelte-d869b5b8.css"], js: ["/./_app/pages/index.svelte-5254c81b.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/signup-af903f3c.js", "/./_app/chunks/button-bda43d45.js", "/./_app/chunks/open-graph-17b21669.js", "/./_app/chunks/stores-1bba30e8.js"], styles: null}, "src/routes/terms-of-service/index.svelte": {entry: "/./_app/pages/terms-of-service/index.svelte-ac032910.js", css: [], js: ["/./_app/pages/terms-of-service/index.svelte-ac032910.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/privacy-policy/index.svelte": {entry: "/./_app/pages/privacy-policy/index.svelte-0eb0ccfc.js", css: ["/./_app/assets/pages/privacy-policy/index.svelte-52f8d936.css"], js: ["/./_app/pages/privacy-policy/index.svelte-0eb0ccfc.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/changelog/index.svelte": {entry: "/./_app/pages/changelog/index.svelte-0d1e8e8c.js", css: [], js: ["/./_app/pages/changelog/index.svelte-0d1e8e8c.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/dashboard/index.svelte": {entry: "/./_app/pages/dashboard/index.svelte-420652b2.js", css: [], js: ["/./_app/pages/dashboard/index.svelte-420652b2.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/features/index.svelte": {entry: "/./_app/pages/features/index.svelte-f9d89c21.js", css: [], js: ["/./_app/pages/features/index.svelte-f9d89c21.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/contact/index.svelte": {entry: "/./_app/pages/contact/index.svelte-50f0f975.js", css: [], js: ["/./_app/pages/contact/index.svelte-50f0f975.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/button-bda43d45.js"], styles: null}, "src/routes/pricing/index.svelte": {entry: "/./_app/pages/pricing/index.svelte-30cf89ed.js", css: [], js: ["/./_app/pages/pricing/index.svelte-30cf89ed.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/logout/index.svelte": {entry: "/./_app/pages/logout/index.svelte-34aafafe.js", css: [], js: ["/./_app/pages/logout/index.svelte-34aafafe.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/stores-1bba30e8.js", "/./_app/chunks/utils-8ab506d1.js"], styles: null}, "src/routes/signup/index.svelte": {entry: "/./_app/pages/signup/index.svelte-6c64f7ab.js", css: [], js: ["/./_app/pages/signup/index.svelte-6c64f7ab.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/signup-af903f3c.js"], styles: null}, "src/routes/about/index.svelte": {entry: "/./_app/pages/about/index.svelte-f4d01b1b.js", css: ["/./_app/assets/pages/about/index.svelte-59987484.css"], js: ["/./_app/pages/about/index.svelte-f4d01b1b.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/login/index.svelte": {entry: "/./_app/pages/login/index.svelte-486ab403.js", css: [], js: ["/./_app/pages/login/index.svelte-486ab403.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/stores-1bba30e8.js", "/./_app/chunks/singletons-bb9012b7.js", "/./_app/chunks/utils-8ab506d1.js"], styles: null}, "src/routes/blog/index.svelte": {entry: "/./_app/pages/blog/index.svelte-c3309ada.js", css: [], js: ["/./_app/pages/blog/index.svelte-c3309ada.js", "/./_app/chunks/vendor-6fa84470.js"], styles: null}, "src/routes/docs/index.svelte": {entry: "/./_app/pages/docs/index.svelte-1e962e10.js", css: ["/./_app/assets/pages/docs/index.svelte-c3821242.css"], js: ["/./_app/pages/docs/index.svelte-1e962e10.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/index-71af2701.js", "/./_app/chunks/open-graph-17b21669.js", "/./_app/chunks/stores-1bba30e8.js"], styles: null}, "src/routes/docs/[slug].svelte": {entry: "/./_app/pages/docs/[slug].svelte-847ab658.js", css: [], js: ["/./_app/pages/docs/[slug].svelte-847ab658.js", "/./_app/chunks/vendor-6fa84470.js", "/./_app/chunks/index-71af2701.js", "/./_app/chunks/open-graph-17b21669.js", "/./_app/chunks/stores-1bba30e8.js"], styles: null}};
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
  return respond({...request, host}, options, {prerender: prerender2});
}
function post$3() {
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
  post: post$3
});
function respond2(body) {
  if (body.errors) {
    return {status: 401, body};
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
var uri = "https://api.digitalbk.app";
var BASE_LOGIN_URI = `${uri}/auth/local`;
var GRAPHQL_URI = `${uri}/graphql`;
var base = BASE_LOGIN_URI;
async function send({method, data, token}) {
  const opts = {method, headers: {}};
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
function post$2(data, token) {
  return send({method: "POST", data, token});
}
async function post$1(request) {
  const body = await post$2({
    identifier: request.body.email,
    password: request.body.password
  });
  return respond2(body);
}
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  post: post$1
});
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
        ${escape2(date)}
        Digital Business Keys
      </p>
      <span class="${"inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start"}"><a href="${"https://facebook.com"}"><svg fill="${"black"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"}"></path></svg></a>
        <a href="${"https://twitter.com"}" class="${"ml-3"}"><svg fill="${"black"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"}"></path></svg></a>
        <a href="${"https://linkedin.com"}" class="${"ml-3"}"><svg fill="${"black"}" stroke="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"0"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path stroke="${"none"}" d="${"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"}"></path><circle cx="${"4"}" cy="${"4"}" r="${"2"}" stroke="${"none"}"></circle></svg></a></span></div></div></footer>`;
});
var ssr = typeof window === "undefined";
var getStores = () => {
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
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var error = (verb) => {
  throw new Error(ssr ? `Can only ${verb} session store in browser` : `Cannot ${verb} session store before subscribing`);
};
var session = {
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
var Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {text} = $$props;
  let {clickEvent} = $$props;
  let {href} = $$props;
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.clickEvent === void 0 && $$bindings.clickEvent && clickEvent !== void 0)
    $$bindings.clickEvent(clickEvent);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  return `<a${add_attribute("href", href, 0)} class="${"mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full py-4 px-8 shadow-lg"}">${text ? ` ${escape2(text)} ` : ` ${slots.default ? slots.default({}) : ``} `}</a>`;
});
var css$5 = {
  code: "a.svelte-1i5ehjo{font-size:1rem;line-height:1.5rem;margin-top:1rem;display:inline;margin-right:1rem;color:rgba(255,255,255,var(--tw-text-opacity))}a.svelte-1i5ehjo,a.svelte-1i5ehjo:hover{--tw-text-opacity:1}a.svelte-1i5ehjo:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media(min-width:1024px){a.svelte-1i5ehjo{display:inline-block;margin-top:0}}",
  map: '{"version":3,"file":"header.svelte","sources":["header.svelte"],"sourcesContent":["<script>\\n  import { session } from \\"$app/stores\\";\\n  import Button from \\"$lib/components/generics/button.svelte\\";\\n  // import Href from \\"./generics/Href.svelte\\";\\n\\n  function toggleMenu() {\\n    var item = document.getElementById(\\"hidden-menu\\");\\n    var btn = document.getElementById(\\"hidden-menubtn\\");\\n\\n    item.classList.toggle(\\"hidden\\");\\n    btn.classList.toggle(\\"hidden\\");\\n  }\\n</script>\\n\\n<!-- component -->\\n<nav\\n  class=\\"flex justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left\\"\\n>\\n  <div class=\\"flex items-center flex-no-shrink text-white mr-6\\">\\n    <span class=\\"font-semibold text-xl tracking-tight text-gray-50\\"\\n      ><a href=\\"/\\"\\n        ><img\\n          class=\\"w-60 md:w-72 lg:w-72\\"\\n          src=\\"logo_light.webp\\"\\n          alt=\\"Digital Business Keys\\"\\n        /></a\\n      ></span\\n    >\\n  </div>\\n  <div class=\\"block lg:hidden z-50 lg:py-2\\">\\n    <button\\n      on:click={toggleMenu}\\n      class=\\"flex px-3 my-3 md:my-5 lg:py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white\\"\\n    >\\n      <svg\\n        class=\\"h-3 w-3\\"\\n        viewBox=\\"0 0 20 20\\"\\n        fill=\\"white\\"\\n        xmlns=\\"http://www.w3.org/2000/svg\\"\\n        ><title>Menu</title>\\n        <path d=\\"M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z\\" /></svg\\n      >\\n    </button>\\n  </div>\\n  <div\\n    class=\\"w-full block flex-grow lg:flex lg:items-center md:items-center lg:w-auto z-50 md:text-center lg:text-center\\"\\n  >\\n    <div\\n      id=\\"hidden-menu\\"\\n      class=\\"text-sm lg:flex-grow hidden lg:block md:items-center lg:items-center md:text-center lg:text-center\\"\\n    >\\n      <a href=\\"/docs\\" rel=\\"prefetch\\" class=\\"nav-link\\" on:click={toggleMenu}\\n        >Docs</a\\n      >\\n      <a href=\\"/features\\" rel=\\"prefetch\\" on:click={toggleMenu}>Features</a>\\n      <a href=\\"/blog\\" rel=\\"prefetch\\" on:click={toggleMenu}>Blog</a>\\n      <a href=\\"contact\\" rel=\\"prefetch\\" on:click={toggleMenu}>Contact Us</a>\\n    </div>\\n    {#if $session.user}\\n      <div id=\\"hidden-menubtn\\" class=\\"hidden lg:block\\">\\n        <Button text=\\"Dashboard\\" href=\\"/dashboard\\" clickEvent={toggleMenu} />\\n        <Button text=\\"Logout\\" href=\\"/logout\\" clickEvent={toggleMenu} />\\n      </div>\\n    {:else}\\n      <div id=\\"hidden-menubtn\\" class=\\"hidden lg:block\\">\\n        <Button text=\\"Sign Up\\" href=\\"/signup\\" clickEvent={toggleMenu} />\\n        <Button text=\\"Sign In\\" href=\\"/login\\" clickEvent={toggleMenu} />\\n      </div>\\n    {/if}\\n  </div>\\n</nav>\\n\\n<style>a{font-size:1rem;line-height:1.5rem;margin-top:1rem;display:inline;margin-right:1rem;color:rgba(255,255,255,var(--tw-text-opacity))}a,a:hover{--tw-text-opacity:1}a:hover{color:rgba(99,102,241,var(--tw-text-opacity))}@media (min-width:1024px){a{display:inline-block;margin-top:0}}</style>\\n"],"names":[],"mappings":"AAwEO,gBAAC,CAAC,UAAU,IAAI,CAAC,YAAY,MAAM,CAAC,WAAW,IAAI,CAAC,QAAQ,MAAM,CAAC,aAAa,IAAI,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,gBAAC,CAAC,gBAAC,MAAM,CAAC,kBAAkB,CAAC,CAAC,gBAAC,MAAM,CAAC,MAAM,KAAK,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,MAAM,AAAC,WAAW,MAAM,CAAC,CAAC,gBAAC,CAAC,QAAQ,YAAY,CAAC,WAAW,CAAC,CAAC,CAAC"}'
};
function toggleMenu() {
  var item = document.getElementById("hidden-menu");
  var btn = document.getElementById("hidden-menubtn");
  item.classList.toggle("hidden");
  btn.classList.toggle("hidden");
}
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  $$result.css.add(css$5);
  $$unsubscribe_session();
  return `
<nav class="${"flex justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left"}"><div class="${"flex items-center flex-no-shrink text-white mr-6"}"><span class="${"font-semibold text-xl tracking-tight text-gray-50"}"><a href="${"/"}" class="${"svelte-1i5ehjo"}"><img class="${"w-60 md:w-72 lg:w-72"}" src="${"logo_light.webp"}" alt="${"Digital Business Keys"}"></a></span></div>
  <div class="${"block lg:hidden z-50 lg:py-2"}"><button class="${"flex px-3 my-3 md:my-5 lg:py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white"}"><svg class="${"h-3 w-3"}" viewBox="${"0 0 20 20"}" fill="${"white"}" xmlns="${"http://www.w3.org/2000/svg"}"><title>Menu</title><path d="${"M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"}"></path></svg></button></div>
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
var $layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${slots.default ? slots.default({}) : ``}

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var $layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: $layout
});
var css$4 = {
  code: "section.svelte-15d98kd{margin-top:var(--xx-large)}section.svelte-15d98kd:last-of-type{margin-bottom:var(--xx-large)}@media(max-width:972px){section.svelte-15d98kd{margin-top:var(--x-large)}section.svelte-15d98kd:last-of-type{margin-bottom:var(--x-large)}}",
  map: '{"version":3,"file":"section.svelte","sources":["section.svelte"],"sourcesContent":["<script>\\n    export let id;\\n  </script>\\n  \\n  <style lang=\\"scss\\">section{margin-top:var(--xx-large)}section:last-of-type{margin-bottom:var(--xx-large)}@media (max-width:972px){section{margin-top:var(--x-large)}section:last-of-type{margin-bottom:var(--x-large)}}</style>\\n  \\n  <section {id}>\\n    <slot />\\n  </section>"],"names":[],"mappings":"AAIqB,sBAAO,CAAC,WAAW,IAAI,UAAU,CAAC,CAAC,sBAAO,aAAa,CAAC,cAAc,IAAI,UAAU,CAAC,CAAC,MAAM,AAAC,WAAW,KAAK,CAAC,CAAC,sBAAO,CAAC,WAAW,IAAI,SAAS,CAAC,CAAC,sBAAO,aAAa,CAAC,cAAc,IAAI,SAAS,CAAC,CAAC,CAAC"}'
};
var Section = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {id} = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  $$result.css.add(css$4);
  return `<section${add_attribute("id", id, 0)} class="${"svelte-15d98kd"}">${slots.default ? slots.default({}) : ``}</section>`;
});
var prerender$1 = true;
function load$5({error: error2, status}) {
  return {props: {error: error2, status}};
}
var $error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {status} = $$props;
  let {error: error2} = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<div class="${"error-page row"}">${validate_component(Section, "Section").$$render($$result, {}, {}, {
    default: () => `<img src="${"/images/illustration-large.jpg"}" alt="${"Digital Business Keys"}">
    <h1>${escape2(status)}</h1>
    <p>Oh, no! Something went wrong on our side.</p>

    ${``}

    <p><a href="${"/contact"}">Contact Us</a></p>
    <p><a class="${"btn"}" href="${"/"}">Go Home</a></p>`
  })}</div>

${``}`;
});
var $error$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: $error,
  prerender: prerender$1,
  load: load$5
});
var Call_to_action = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Featured_section = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Features$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var css$3 = {
  code: ".active.svelte-1hd2jug{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}",
  map: `{"version":3,"file":"pricing.svelte","sources":["pricing.svelte"],"sourcesContent":["<script>\\n    let priceType = \\"monthly\\";\\n\\n    function toggleMonthly() {\\n        priceType = \\"monthly\\";\\n    }\\n\\n    function toggleAnnual() {\\n        priceType = \\"yearly\\";\\n    }\\n</script>\\n\\n<style lang=\\"postcss\\">.active{--tw-bg-opacity:1;background-color:rgba(99,102,241,var(--tw-bg-opacity))}</style>\\n\\n<section class=\\"text-gray-50 body-font overflow-hidden\\">\\n    <div class=\\"container px-5 py-24 mx-auto\\">\\n        <div class=\\"flex flex-col text-center w-full mb-20\\">\\n            <h1 class=\\"sm:text-4xl text-3xl font-medium title-font mb-2\\">\\n                Pricing\\n            </h1>\\n            <p class=\\"lg:w-2/3 mx-auto leading-relaxed text-base\\">\\n                A free trial and different tiers to cater to all types of users\\n                and budgets.\\n            </p>\\n            <div\\n                class=\\"flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6\\">\\n                <button\\n                    class:active={priceType === 'monthly'}\\n                    class=\\"py-1 px-4 text-white focus:outline-none\\"\\n                    on:click={toggleMonthly}>Monthly</button>\\n                <button\\n                    class:active={priceType === 'yearly'}\\n                    class=\\"py-1 px-4 focus:outline-none\\"\\n                    on:click={toggleAnnual}>Annually</button>\\n            </div>\\n        </div>\\n        <div class=\\"flex flex-wrap -m-4\\">\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\n                <div\\n                    class=\\"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden\\">\\n                    <h2\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\n                        TRIAL\\n                    </h2>\\n                    <h1\\n                        class=\\"text-5xl pb-4 mb-4 border-b border-gray-200 leading-none\\">\\n                        Free\\n                    </h1>\\n                    <p class=\\"flex items-center  mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Save your Digital Assets\\n                    </p>\\n                    <p class=\\"flex items-center mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Save your Important Business Details\\n                    </p>\\n                    <p class=\\"flex items-center mb-6\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>View status of your assets\\n                    </p>\\n                    <button\\n                        class=\\"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded\\">Buy\\n                        <svg\\n                            fill=\\"none\\"\\n                            stroke=\\"currentColor\\"\\n                            stroke-linecap=\\"round\\"\\n                            stroke-linejoin=\\"round\\"\\n                            stroke-width=\\"2\\"\\n                            class=\\"w-4 h-4 ml-auto\\"\\n                            viewBox=\\"0 0 24 24\\">\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\n                        </svg>\\n                    </button>\\n                    <p class=\\"text-xs text-gray-400 mt-3\\">\\n                        Try the app for free for 14 days.\\n                    </p>\\n                </div>\\n            </div>\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\n                <div\\n                    class=\\"h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden\\">\\n                    <span\\n                        class=\\"bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl\\">POPULAR</span>\\n                    <h2\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\n                        ESSENTIAL\\n                    </h2>\\n                    <h1\\n                        class=\\"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200\\">\\n                        {#if priceType == 'monthly'}\\n                            <span>$5</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/mo</span>\\n                        {:else}\\n                            <span>$50</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/yr</span>\\n                        {/if}\\n                    </h1>\\n                    <p class=\\"flex items-center  mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>All Trial Features\\n                    </p>\\n                    <p class=\\"flex items-center mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Save multiple assets\\n                    </p>\\n                    <p class=\\"flex items-center mb-6\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Email and export\\n                    </p>\\n                    <button\\n                        class=\\"flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded\\">Buy\\n                        <svg\\n                            fill=\\"none\\"\\n                            stroke=\\"currentColor\\"\\n                            stroke-linecap=\\"round\\"\\n                            stroke-linejoin=\\"round\\"\\n                            stroke-width=\\"2\\"\\n                            class=\\"w-4 h-4 ml-auto\\"\\n                            viewBox=\\"0 0 24 24\\">\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\n                        </svg>\\n                    </button>\\n                    <p class=\\"text-xs text-gray-500 mt-3\\">\\n                        All the features for your small business.\\n                    </p>\\n                </div>\\n            </div>\\n            <div class=\\"p-4 xl:w-1/3 md:w-1/3 w-full\\">\\n                <div\\n                    class=\\"h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden\\">\\n                    <h2\\n                        class=\\"text-sm tracking-widest title-font mb-1 font-medium\\">\\n                        PREMIUM\\n                    </h2>\\n                    <h1\\n                        class=\\"text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200\\">\\n                        {#if priceType == 'monthly'}\\n                            <span>$8</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/mo</span>\\n                        {:else}\\n                            <span>$90</span>\\n                            <span\\n                                class=\\"text-lg ml-1 font-normal text-gray-500\\">/yr</span>\\n                        {/if}\\n                    </h1>\\n                    <p class=\\"flex items-center  mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>All Trial & Essential Features\\n                    </p>\\n                    <p class=\\"flex items-center mb-2\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Setup notifications for your assets\\n                    </p>\\n                    <p class=\\"flex items-center mb-6\\">\\n                        <span\\n                            class=\\"w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0\\">\\n                            <svg\\n                                fill=\\"none\\"\\n                                stroke=\\"currentColor\\"\\n                                stroke-linecap=\\"round\\"\\n                                stroke-linejoin=\\"round\\"\\n                                stroke-width=\\"2.5\\"\\n                                class=\\"w-3 h-3\\"\\n                                viewBox=\\"0 0 24 24\\">\\n                                <path d=\\"M20 6L9 17l-5-5\\" />\\n                            </svg>\\n                        </span>Automatic service checks to ensure your assets\\n                        are always working\\n                    </p>\\n                    <button\\n                        class=\\"flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded\\">Buy\\n                        <svg\\n                            fill=\\"none\\"\\n                            stroke=\\"currentColor\\"\\n                            stroke-linecap=\\"round\\"\\n                            stroke-linejoin=\\"round\\"\\n                            stroke-width=\\"2\\"\\n                            class=\\"w-4 h-4 ml-auto\\"\\n                            viewBox=\\"0 0 24 24\\">\\n                            <path d=\\"M5 12h14M12 5l7 7-7 7\\" />\\n                        </svg>\\n                    </button>\\n                    <p class=\\"text-xs text-gray-500 mt-3\\">\\n                        Perfect for business critical services.\\n                    </p>\\n                </div>\\n            </div>\\n        </div>\\n    </div>\\n</section>\\n"],"names":[],"mappings":"AAYsB,sBAAO,CAAC,gBAAgB,CAAC,CAAC,iBAAiB,KAAK,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,eAAe,CAAC,CAAC,CAAC"}`
};
var Pricing$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Open_graph = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  return `${$$result.head += `${$$result.title = `<title>${escape2(title)}</title>`, ""}<meta name="${"keywords"}" content="${"secure, business security, security, Store passwords app, Store passwords in chrome, Store passwords on iphone, mobile app, app, android app, ios app"}" data-svelte="svelte-1vf07oe"><meta name="${"description"}"${add_attribute("content", description, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:image"}" content="${""}" data-svelte="svelte-1vf07oe"><meta property="${"og:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:title"}"${add_attribute("content", title, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:type"}"${add_attribute("content", type, 0)} data-svelte="svelte-1vf07oe"><meta property="${"og:url"}"${add_attribute("content", url, 0)} data-svelte="svelte-1vf07oe">`, ""}`;
});
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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

      ${$session.user ? `${validate_component(Button, "Button").$$render($$result, {text: "Dashboard", href: "dashboard"}, {}, {})}` : `<div class="${"lg:flex-initial justify-center lg:items-start md:items-start text-center md:text-left"}">${validate_component(Button, "Button").$$render($$result, {text: "Try Free!", href: "signup"}, {}, {})}

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
var Terms_of_service = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$c = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Terms_of_service
});
var css$2 = {
  code: "h1.svelte-czkh7d,h2.svelte-czkh7d{padding-bottom:1.25rem}p.svelte-czkh7d{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n  // export const prerender = true;\\n  // export const hydrate = true;\\n  // export const router = true;\\n</script>\\n\\n<section>\\n  <h1>Privacy Policy</h1>\\n\\n  <h2>\\n    In this Privacy Policy \u201CServices\u201D indicates the Service and products offered\\n    and provided by Digital Business Keys across desktop, mobile, tablet and\\n    apps (including any subdomains)\\n  </h2>\\n\\n  <h2>Information we collect about you</h2>\\n  <p>\\n    We collect information about you when you input it into the Services or\\n    otherwise provide it to us and when other sources provide it to us including\\n    but not limited to when you register for an account, create or modify your\\n    profile, sign-up for or make purchases through the Services. Information you\\n    provide to us may be including, but is not limited to your name, address,\\n    phone number, email, gender, occupation, business interests and any other\\n    information provided. We keep track of your preferences when you select\\n    settings within the Services. We collect information about you when you use\\n    our Services, including browsing our websites and taking certain actions\\n    within the Services.\\n  </p>\\n\\n  <h2>How we use information we collect</h2>\\n\\n  <p>\\n    We use the personal information we have collected largely for the purpose of\\n    providing you with products and services that you have requested by\\n    registering an account and agreeing to the Services Terms and Conditions to\\n    create and maintain your account and ensure you comply and adhere to our\\n    terms of use. We are always improving our Services. We use information\\n    identified from usage of the service and feedback to troubleshoot, identify\\n    trends and usage and improve our Services as well as to develop new\\n    products, features and technologies that benefit our users. We send you\\n    email notifications when you interact with the Services. We use your contact\\n    information to send transactional communications via email and within the\\n    Services, including confirming your purchases, reminding you of subscription\\n    expirations,updates, security alerts, and administrative messages. We use\\n    your contact information and information about how you use the Services to\\n    send promotional communications that may be of specific interest to you,\\n    including by email with the ability to opt out of the promotional\\n    communications easily accessible.\\n  </p>\\n\\n  <h2>Security</h2>\\n  <p>\\n    We strive to ensure the security, integrity and privacy of personal\\n    information we collect. We use reasonable security measures to protect your\\n    personal information from unauthorised access, modification and disclosure.\\n    Our employees, contractors, agents and service providers who provide\\n    services related to our information systems, are obliged by law to respect\\n    the confidentiality of any personal information held by us. We review and\\n    update our security measures in light of current technologies.\\n    Unfortunately, no data transmission over the internet can be guaranteed to\\n    be totally secure.\\n  </p>\\n\\n  <h2>Access to your Information</h2>\\n\\n  <p>\\n    If, at any time, you discover that information held about you is incorrect\\n    or you would like to review and confirm the accuracy of your personal\\n    information, you can contact us. Our Services give you the ability to access\\n    and update certain information about you from within the Service. You can\\n    also gain access to the personal information we hold about you, subject to\\n    certain exceptions provided for by law. To request access to your personal\\n    information, please contact us.\\n  </p>\\n\\n  <h2>Changes to our Privacy Policy</h2>\\n\\n  <p>\\n    Amendments to this policy will be posted on this page and will be effective\\n    when posted, if the changes are significant, we will provide a more\\n    prominent notice.\\n  </p>\\n</section>\\n\\n<style lang=\\"postcss\\">h1,h2{padding-bottom:1.25rem}p{padding-bottom:2.5rem}</style>\\n"],"names":[],"mappings":"AAoFsB,gBAAE,CAAC,gBAAE,CAAC,eAAe,OAAO,CAAC,eAAC,CAAC,eAAe,MAAM,CAAC"}'
};
var Privacy_policy = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Changelog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$a = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Changelog
});
var User_asset_card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {user} = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<div><h1 class="${"text-2xl font-medium text-white"}">Your Digital Assets</h1>

  <div class="${"bg-white .border rounded-md text-black"}">${escape2(user.username)}</div></div>`;
});
function load$4({session: session2}) {
  const {user} = session2;
  console.log("Session Dashboard:", session2);
  if (!user) {
    return {status: 302, redirect: "/login"};
  }
  return {props: {user}};
}
var Dashboard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let {user} = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `
<div><div x-data="${""}"><div class="${"flex h-screen bg-gray-800 font-roboto"}"><div class="${"fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden"}"></div>

      <div class="${"fixed z-30 inset-y-0 left-0 w-60 transition duration-300 transform bg-gray-900 overflow-y-auto lg:translate-x-0 lg:static lg:inset-0"}"><div class="${"flex items-center justify-center mt-8"}"><div class="${"flex items-center"}"><span class="${"text-white text-2xl font-semibold"}">Dashboard</span></div></div>

        <nav class="${"flex flex-col mt-10 px-4 text-center"}"><a href="${"#"}" class="${"py-2 text-sm text-gray-100 bg-gray-800 rounded"}">Overview</a>
          <a href="${"#"}" class="${"mt-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded"}">Settings</a></nav></div>

      <div class="${"flex-1 flex flex-col overflow-hidden"}"><header class="${"flex justify-between items-center p-6"}"><div class="${"flex items-center space-x-4 lg:space-x-0"}"><button class="${"text-gray-300 focus:outline-none lg:hidden"}"><svg class="${"h-6 w-6"}" viewBox="${"0 0 24 24"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M4 6H20M4 12H20M4 18H11"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path></svg></button>

            <div><h1 class="${"text-2xl font-medium text-white"}">Welcome ${escape2(user.username)}</h1></div></div></header>

        <main class="${"flex-1 overflow-x-hidden overflow-y-auto"}"><div class="${"container mx-auto px-6 py-8"}"><div class="${"grid place-items-center h-96 text-gray-300 text-xl border-4 border-gray-300 border-dashed"}">${validate_component(User_asset_card, "UserAssetCard").$$render($$result, {user}, {}, {})}</div></div></main></div></div></div></div>

`;
});
var index$9 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Dashboard,
  load: load$4
});
var Features = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$8 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Features
});
function submit() {
}
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Pricing = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$6 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Pricing
});
function post(endpoint, data) {
  return fetch(endpoint, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data || {}),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((r) => r.json());
}
function load$3({session: session2}) {
  const {user} = session2;
  console.log(user);
  if (!user) {
    return {status: 302, redirect: "/login"};
  }
  return {props: {user}};
}
var Logout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Signup_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Signup, "Signup").$$render($$result, {}, {}, {})}`;
});
var index$4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Signup_1
});
var css$1 = {
  code: "h1.svelte-1bnbrug{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1.svelte-1bnbrug,h2.svelte-1bnbrug{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p.svelte-1bnbrug{padding-bottom:2.5rem}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\t// export const prerender = true;\\n</script>\\n\\n<style lang=\\"postcss\\">h1{--tw-text-opacity:1;color:rgba(165,180,252,var(--tw-text-opacity))}h1,h2{padding-bottom:1.25rem;font-size:1.25rem;line-height:1.75rem}p{padding-bottom:2.5rem}</style>\\n\\n\\n<div class=\\"px-8 py-16 mx-auto max-w-5xl\\">\\n\\t<h1>About Us</h1>\\n\\n\\t<p>\\n\\t\\tDigital business keys is a critical app developed to empower businesses\\n\\t\\tto take control of their digital business assets and respond to issues\\n\\t\\tthat can commonly impact website availability, email receiving and\\n\\t\\tsending and digital project assets. Digital Business Keys app provides a\\n\\t\\tservice that has long been neglect by business owners and the industries\\n\\t\\tthat assist them in taking their businesses online Designed to be as\\n\\t\\tsimple as possible to allow any level of user to get the critical\\n\\t\\tcontrol they need for the digital presence of their business.\\n\\t</p>\\n\\n\\t<h2>Our Story</h2>\\n\\n\\t<p>\\n\\t\\tOur team has extensive industry experience in developing and\\n\\t\\timplementing custom and out of the box solutions. We thrive in\\n\\t\\tenvironments that enable us to deliver the best results for our clients.\\n\\t\\tFrom this fundamental work ethic grew the idea for the Digital Business\\n\\t\\tKeys app as a tool to plug the gap we saw develop in the industry in\\n\\t\\tcustomer education, knowledge and tools to provide confidence in\\n\\t\\tmanagement of these business critical digital assets.\\n\\t</p>\\n</div>\\n"],"names":[],"mappings":"AAIsB,iBAAE,CAAC,kBAAkB,CAAC,CAAC,MAAM,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,iBAAE,CAAC,iBAAE,CAAC,eAAe,OAAO,CAAC,UAAU,OAAO,CAAC,YAAY,OAAO,CAAC,gBAAC,CAAC,eAAe,MAAM,CAAC"}'
};
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  default: About
});
async function load$2({session: session2}) {
  if (session2.jwt) {
    return {status: 302, redirect: "/"};
  }
  return {};
}
var Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
var Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: Blog
});
var GET_DOCS = `
  {
    documentations {
      id
      title
      Slug
      content
    }
  }
`;
var css = {
  code: 'ul.svelte-1kgxi19{margin:0 0 1em;line-height:1.5}h2.svelte-1kgxi19:before{display:block;content:" ";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}',
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\t// export const prerender = true;\\n\\n  import { GRAPHQL_URI } from \\"../../lib/config\\";\\n  import { GET_DOCS } from \\"../../lib/graphql/requests\\";\\n  console.log(GRAPHQL_URI);\\n\\n  /**\\n   * @type {import(\'@sveltejs/kit\').Load}\\n   */\\n  export async function load() {\\n    let items;\\n    try {\\n      const res = await fetch(`${GRAPHQL_URI}`, {\\n        method: \\"POST\\",\\n        headers: {\\n          \\"Content-Type\\": \\"application/json\\",\\n        },\\n        body: JSON.stringify({ query: GET_DOCS }),\\n      });\\n\\n      items = await res.json();\\n      items = items.data.documentations;\\n      console.log(items.data.documentations)\\n    } catch (e) {\\n      console.log(e.message);\\n    }\\n\\n    return {\\n      props: {\\n        items,\\n      },\\n    };\\n  }\\n\\n  let promise = load();\\n</script>\\n\\n<script>\\n  import snarkdown from \\"snarkdown\\";\\n  import OpenGraph from \\"$lib/components/open-graph.svelte\\";\\n\\n  export let items;\\n\\n  function phoneNav() {\\n    var item = document.getElementById(\\"p-nav\\");\\n\\n    item.classList.toggle(\\"hidden\\");\\n  }\\n</script>\\n\\n<OpenGraph\\n  description=\\"Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more\\"\\n  title=\\"Digital Business Keys - Documentation\\"\\n  type=\\"website\\"\\n/>\\n\\n{#await promise}\\n\\n  <p>...loading</p>\\n{:then data}\\n  <div class=\\"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl\\">\\n    <div\\n      id=\\"p-nav\\"\\n      class=\\"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600\\"\\n    >\\n      <div class=\\"md:relative mx-auto lg:float-right lg:px-6\\">\\n        <ul\\n          class=\\"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20\\"\\n        >\\n          {#each items as doc}\\n            <div\\n              class=\\"lg:flex-none flex w-full md:max-w-xs bg-purple text-black\\"\\n            >\\n              <li class=\\"text-black pb-2\\">\\n                <p class=\\"hover:bg-indigo-500 text-black\\">\\n                  <a\\n                    on:click={phoneNav}\\n                    class=\\"text-black\\"\\n                    rel=\\"prefetch\\"\\n                    href=\\"docs#{doc.Slug}\\">{doc.title}</a\\n                  >\\n                </p>\\n              </li>\\n            </div>\\n          {/each}\\n        </ul>\\n      </div>\\n    </div>\\n\\n    <div class=\\"w-full md:w-4/5\\">\\n      <h1\\n        class=\\"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 \\"\\n      >\\n        Documentation\\n      </h1>\\n      <div class=\\"container pt-12 px-6\\">\\n        {#each items as doc}\\n          <div id={doc.Slug} class=\\"mb-12 overflow-auto\\n                    \\">\\n            <h2 class=\\"pb-10\\">{doc.title}</h2>\\n\\n            <article class=\\"prose prose-indigo lg:prose-xl\\">\\n              {@html snarkdown(doc.content)}\\n            </article>\\n          </div>\\n        {/each}\\n      </div>\\n    </div>\\n    <button\\n      on:click={phoneNav}\\n      class=\\"fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden\\"\\n    >\\n      <svg\\n        width=\\"24\\"\\n        height=\\"24\\"\\n        fill=\\"none\\"\\n        class=\\"absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform\\"\\n        ><path\\n          d=\\"M4 8h16M4 16h16\\"\\n          stroke=\\"currentColor\\"\\n          stroke-width=\\"2\\"\\n          stroke-linecap=\\"round\\"\\n          stroke-linejoin=\\"round\\"\\n        /></svg\\n      >\\n    </button>\\n\\n  </div>\\n{/await}\\n\\n<style>ul{margin:0 0 1em;line-height:1.5}h2:before{display:block;content:\\" \\";margin-top:-185px;height:185px;visibility:hidden;pointer-events:none}</style>\\n"],"names":[],"mappings":"AAmIO,iBAAE,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,YAAY,GAAG,CAAC,iBAAE,OAAO,CAAC,QAAQ,KAAK,CAAC,QAAQ,GAAG,CAAC,WAAW,MAAM,CAAC,OAAO,KAAK,CAAC,WAAW,MAAM,CAAC,eAAe,IAAI,CAAC"}'
};
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
  } catch (e) {
    console.log(e.message);
  }
  return {props: {items}};
}
var promise = load$1();
var Docs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  <div class="${"flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl"}"><div id="${"p-nav"}" class="${"hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600"}"><div class="${"md:relative mx-auto lg:float-right lg:px-6"}"><ul class="${"m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20 svelte-1kgxi19"}">${each(items, (doc) => `<div class="${"lg:flex-none flex w-full md:max-w-xs bg-purple text-black"}"><li class="${"text-black pb-2"}"><p class="${"hover:bg-indigo-500 text-black"}"><a class="${"text-black"}" rel="${"prefetch"}" href="${"docs#" + escape2(doc.Slug)}">${escape2(doc.title)}</a>
                </p></li>
            </div>`)}</ul></div></div>

    <div class="${"w-full md:w-4/5"}"><h1 class="${"z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 "}">Documentation
      </h1>
      <div class="${"container pt-12 px-6"}">${each(items, (doc) => `<div${add_attribute("id", doc.Slug, 0)} class="${"mb-12 overflow-auto\n                    "}"><h2 class="${"pb-10 svelte-1kgxi19"}">${escape2(doc.title)}</h2>

            <article class="${"prose prose-indigo lg:prose-xl"}">${(0, import_snarkdown.default)(doc.content)}</article>
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
var prerender = true;
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
var U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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

<h1 class="${"sm:text-3xl text-2xl font-medium title-font text-gray-50"}">${escape2(pagedata.title)}</h1>

<div>${(0, import_snarkdown.default)(pagedata.content)}</div>`;
});
var _slug_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: U5Bslugu5D,
  prerender,
  load
});

// .svelte-kit/cloudflare-workers/entry.js
var import_kv_asset_handler = __toModule(require_dist());
addEventListener("fetch", (event) => {
  event.respondWith(handle2(event));
});
async function handle2(event) {
  if (event.request.method == "GET") {
    try {
      return await (0, import_kv_asset_handler.getAssetFromKV)(event);
    } catch (e) {
      if (!(e instanceof import_kv_asset_handler.NotFoundError)) {
        return new Response("Error loading static asset:" + (e.message || e.toString()), {
          status: 500
        });
      }
    }
  }
  const request = event.request;
  const request_url = new URL(request.url);
  try {
    const rendered = await render({
      host: request_url.host,
      path: request_url.pathname,
      query: request_url.searchParams,
      rawBody: request.body ? await read(request) : null,
      headers: Object.fromEntries(request.headers),
      method: request.method
    });
    if (rendered) {
      return new Response(rendered.body, {
        status: rendered.status,
        headers: rendered.headers
      });
    }
  } catch (e) {
    return new Response("Error rendering route:" + (e.message || e.toString()), {status: 500});
  }
  return new Response({
    status: 404,
    statusText: "Not Found"
  });
}
function read(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/octet-stream")) {
    return request.arrayBuffer();
  }
  return request.text();
}
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
