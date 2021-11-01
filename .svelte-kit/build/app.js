import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths, assets } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "..\\..\\src\\hooks\\index.js";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"/favicon.ico\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\t\t" + head + "\n\t</head>\n\t<body>\n\t\t<div id=\"svelte\">" + body + "</div>\n\t</body>\n</html>\n";

let options = null;

const default_settings = { paths: {"base":"","assets":""} };

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings = default_settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	const hooks = get_hooks(user_hooks);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: assets + "/_app/start-84e0a3cc.js",
			css: [assets + "/_app/assets/start-464e9d0a.css"],
			js: [assets + "/_app/start-84e0a3cc.js",assets + "/_app/chunks/vendor-d12625f6.js",assets + "/_app/chunks/singletons-12a22614.js"]
		},
		fetched: undefined,
		floc: false,
		get_component_path: id => assets + "/_app/" + entry_lookup[id],
		get_stack: error => String(error), // for security
		handle_error: (error, request) => {
			hooks.handleError({ error, request });
			error.stack = options.get_stack(error);
		},
		hooks,
		hydrate: true,
		initiator: undefined,
		load_component,
		manifest,
		paths: settings.paths,
		prerender: true,
		read: settings.read,
		root,
		service_worker: null,
		router: true,
		ssr: true,
		target: "#svelte",
		template,
		trailing_slash: "never"
	};
}

// input has already been decoded by decodeURI
// now handle the rest that decodeURIComponent would do
const d = s => s
	.replace(/%23/g, '#')
	.replace(/%3[Bb]/g, ';')
	.replace(/%2[Cc]/g, ',')
	.replace(/%2[Ff]/g, '/')
	.replace(/%3[Ff]/g, '?')
	.replace(/%3[Aa]/g, ':')
	.replace(/%40/g, '@')
	.replace(/%26/g, '&')
	.replace(/%3[Dd]/g, '=')
	.replace(/%2[Bb]/g, '+')
	.replace(/%24/g, '$');

const empty = () => ({});

const manifest = {
	assets: [{"file":"favicon.ico","size":1150,"type":"image/vnd.microsoft.icon"},{"file":"images/app-image.webp","size":74688,"type":"image/webp"},{"file":"images/feature-image2.webp","size":65954,"type":"image/webp"},{"file":"logo-192.png","size":4760,"type":"image/png"},{"file":"logo-512.png","size":13928,"type":"image/png"},{"file":"logo.webp","size":7916,"type":"image/webp"},{"file":"logo_light.webp","size":5204,"type":"image/webp"},{"file":"robots.txt","size":100,"type":"text/plain"}],
	layout: "src/routes/__layout.svelte",
	error: "src/routes/__error.svelte",
	routes: [
		{
						type: 'page',
						pattern: /^\/$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/terms-of-service\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/terms-of-service/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/privacy-policy\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/privacy-policy/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/changelog\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/changelog/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/dashboard\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/dashboard/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/features\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/features/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/contact\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/contact/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/pricing\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/pricing/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/logout\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/logout/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/signup\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/signup/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/about\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/about/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/login\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/login/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/auth\/logout\/?$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\auth\\logout.js")
					},
		{
						type: 'endpoint',
						pattern: /^\/auth\/login\/?$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\auth\\login.js")
					},
		{
						type: 'page',
						pattern: /^\/blog\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/blog/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/docs\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/docs/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/docs\/([^/]+?)\/?$/,
						params: (m) => ({ slug: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/docs/[slug].svelte"],
						b: ["src/routes/__error.svelte"]
					}
	]
};

// this looks redundant, but the indirection allows us to access
// named imports without triggering Rollup's missing import detection
const get_hooks = hooks => ({
	getSession: hooks.getSession || (() => ({})),
	handle: hooks.handle || (({ request, resolve }) => resolve(request)),
	handleError: hooks.handleError || (({ error }) => console.error(error.stack)),
	externalFetch: hooks.externalFetch || fetch
});

const module_lookup = {
	"src/routes/__layout.svelte": () => import("../../src/routes/__layout.svelte"),"src/routes/__error.svelte": () => import("../../src/routes/__error.svelte"),"src/routes/index.svelte": () => import("../../src/routes/index.svelte"),"src/routes/terms-of-service/index.svelte": () => import("../../src/routes/terms-of-service/index.svelte"),"src/routes/privacy-policy/index.svelte": () => import("../../src/routes/privacy-policy/index.svelte"),"src/routes/changelog/index.svelte": () => import("../../src/routes/changelog/index.svelte"),"src/routes/dashboard/index.svelte": () => import("../../src/routes/dashboard/index.svelte"),"src/routes/features/index.svelte": () => import("../../src/routes/features/index.svelte"),"src/routes/contact/index.svelte": () => import("../../src/routes/contact/index.svelte"),"src/routes/pricing/index.svelte": () => import("../../src/routes/pricing/index.svelte"),"src/routes/logout/index.svelte": () => import("../../src/routes/logout/index.svelte"),"src/routes/signup/index.svelte": () => import("../../src/routes/signup/index.svelte"),"src/routes/about/index.svelte": () => import("../../src/routes/about/index.svelte"),"src/routes/login/index.svelte": () => import("../../src/routes/login/index.svelte"),"src/routes/blog/index.svelte": () => import("../../src/routes/blog/index.svelte"),"src/routes/docs/index.svelte": () => import("../../src/routes/docs/index.svelte"),"src/routes/docs/[slug].svelte": () => import("../../src/routes/docs/[slug].svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"pages/__layout.svelte-19e7fcf2.js","css":["assets/pages/__layout.svelte-3b96862c.css"],"js":["pages/__layout.svelte-19e7fcf2.js","chunks/vendor-d12625f6.js","chunks/stores-f4f24851.js","chunks/button-e7c1731c.js"],"styles":[]},"src/routes/__error.svelte":{"entry":"pages/__error.svelte-6e6bc99d.js","css":["assets/pages/__error.svelte-ae89a356.css"],"js":["pages/__error.svelte-6e6bc99d.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/index.svelte":{"entry":"pages/index.svelte-fd04169b.js","css":["assets/pages/index.svelte-4c72270e.css"],"js":["pages/index.svelte-fd04169b.js","chunks/vendor-d12625f6.js","chunks/signup-97a2691e.js","chunks/button-e7c1731c.js","chunks/open-graph-2db86038.js","chunks/stores-f4f24851.js"],"styles":[]},"src/routes/terms-of-service/index.svelte":{"entry":"pages/terms-of-service/index.svelte-c2dc59c3.js","css":[],"js":["pages/terms-of-service/index.svelte-c2dc59c3.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/privacy-policy/index.svelte":{"entry":"pages/privacy-policy/index.svelte-16f530f9.js","css":["assets/pages/privacy-policy/index.svelte-09f04462.css"],"js":["pages/privacy-policy/index.svelte-16f530f9.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/changelog/index.svelte":{"entry":"pages/changelog/index.svelte-2d4cf0e5.js","css":[],"js":["pages/changelog/index.svelte-2d4cf0e5.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/dashboard/index.svelte":{"entry":"pages/dashboard/index.svelte-9fc213e2.js","css":[],"js":["pages/dashboard/index.svelte-9fc213e2.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/features/index.svelte":{"entry":"pages/features/index.svelte-bdf4fbb2.js","css":[],"js":["pages/features/index.svelte-bdf4fbb2.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/contact/index.svelte":{"entry":"pages/contact/index.svelte-a960b766.js","css":[],"js":["pages/contact/index.svelte-a960b766.js","chunks/vendor-d12625f6.js","chunks/button-e7c1731c.js"],"styles":[]},"src/routes/pricing/index.svelte":{"entry":"pages/pricing/index.svelte-bbd2039b.js","css":[],"js":["pages/pricing/index.svelte-bbd2039b.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/logout/index.svelte":{"entry":"pages/logout/index.svelte-54e9c639.js","css":[],"js":["pages/logout/index.svelte-54e9c639.js","chunks/vendor-d12625f6.js","chunks/stores-f4f24851.js","chunks/utils-8ab506d1.js"],"styles":[]},"src/routes/signup/index.svelte":{"entry":"pages/signup/index.svelte-718ce5d1.js","css":[],"js":["pages/signup/index.svelte-718ce5d1.js","chunks/vendor-d12625f6.js","chunks/signup-97a2691e.js"],"styles":[]},"src/routes/about/index.svelte":{"entry":"pages/about/index.svelte-570cbcac.js","css":["assets/pages/about/index.svelte-2cb57b6d.css"],"js":["pages/about/index.svelte-570cbcac.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/login/index.svelte":{"entry":"pages/login/index.svelte-f98867d3.js","css":[],"js":["pages/login/index.svelte-f98867d3.js","chunks/vendor-d12625f6.js","chunks/stores-f4f24851.js","chunks/singletons-12a22614.js","chunks/utils-8ab506d1.js"],"styles":[]},"src/routes/blog/index.svelte":{"entry":"pages/blog/index.svelte-1ffc951f.js","css":[],"js":["pages/blog/index.svelte-1ffc951f.js","chunks/vendor-d12625f6.js"],"styles":[]},"src/routes/docs/index.svelte":{"entry":"pages/docs/index.svelte-3121857d.js","css":["assets/pages/docs/index.svelte-2a728569.css"],"js":["pages/docs/index.svelte-3121857d.js","chunks/vendor-d12625f6.js","chunks/index-71af2701.js","chunks/open-graph-2db86038.js","chunks/stores-f4f24851.js"],"styles":[]},"src/routes/docs/[slug].svelte":{"entry":"pages/docs/[slug].svelte-fba5ee35.js","css":[],"js":["pages/docs/[slug].svelte-fba5ee35.js","chunks/vendor-d12625f6.js","chunks/index-71af2701.js","chunks/open-graph-2db86038.js","chunks/stores-f4f24851.js"],"styles":[]}};

async function load_component(file) {
	const { entry, css, js, styles } = metadata_lookup[file];
	return {
		module: await module_lookup[file](),
		entry: assets + "/_app/" + entry,
		css: css.map(dep => assets + "/_app/" + dep),
		js: js.map(dep => assets + "/_app/" + dep),
		styles
	};
}

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}