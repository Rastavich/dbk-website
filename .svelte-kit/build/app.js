import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "..\\..\\src\\hooks\\index.js";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"/favicon.ico\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\t\t" + head + "\n\t</head>\n\t<body>\n\t\t<div id=\"svelte\">" + body + "</div>\n\t</body>\n</html>\n";

let options = null;

const default_settings = { paths: {"base":"","assets":"/."} };

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings = default_settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: "/./_app/start-062d5536.js",
			css: ["/./_app/assets/start-b97461fb.css"],
			js: ["/./_app/start-062d5536.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/singletons-bb9012b7.js"]
		},
		fetched: undefined,
		floc: false,
		get_component_path: id => "/./_app/" + entry_lookup[id],
		get_stack: error => String(error), // for security
		handle_error: error => {
			console.error(error.stack);
			error.stack = options.get_stack(error);
		},
		hooks: get_hooks(user_hooks),
		hydrate: true,
		initiator: undefined,
		load_component,
		manifest,
		paths: settings.paths,
		read: settings.read,
		root,
		service_worker: '/service-worker.js',
		router: true,
		ssr: true,
		target: "#svelte",
		template,
		trailing_slash: "never"
	};
}

const d = decodeURIComponent;
const empty = () => ({});

const manifest = {
	assets: [{"file":"favicon.ico","size":1150,"type":"image/vnd.microsoft.icon"},{"file":"images/app-image.webp","size":74688,"type":"image/webp"},{"file":"images/feature-image2.webp","size":65954,"type":"image/webp"},{"file":"logo-192.png","size":4760,"type":"image/png"},{"file":"logo-512.png","size":13928,"type":"image/png"},{"file":"logo.webp","size":7916,"type":"image/webp"},{"file":"logo_light.webp","size":5204,"type":"image/webp"},{"file":"manifest.json","size":1070,"type":"application/json"},{"file":"robots.txt","size":103,"type":"text/plain"}],
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
	serverFetch: hooks.serverFetch || fetch
});

const module_lookup = {
	"src/routes/__layout.svelte": () => import("..\\..\\src\\routes\\__layout.svelte"),"src/routes/__error.svelte": () => import("..\\..\\src\\routes\\__error.svelte"),"src/routes/index.svelte": () => import("..\\..\\src\\routes\\index.svelte"),"src/routes/terms-of-service/index.svelte": () => import("..\\..\\src\\routes\\terms-of-service\\index.svelte"),"src/routes/privacy-policy/index.svelte": () => import("..\\..\\src\\routes\\privacy-policy\\index.svelte"),"src/routes/changelog/index.svelte": () => import("..\\..\\src\\routes\\changelog\\index.svelte"),"src/routes/dashboard/index.svelte": () => import("..\\..\\src\\routes\\dashboard\\index.svelte"),"src/routes/features/index.svelte": () => import("..\\..\\src\\routes\\features\\index.svelte"),"src/routes/contact/index.svelte": () => import("..\\..\\src\\routes\\contact\\index.svelte"),"src/routes/pricing/index.svelte": () => import("..\\..\\src\\routes\\pricing\\index.svelte"),"src/routes/logout/index.svelte": () => import("..\\..\\src\\routes\\logout\\index.svelte"),"src/routes/signup/index.svelte": () => import("..\\..\\src\\routes\\signup\\index.svelte"),"src/routes/about/index.svelte": () => import("..\\..\\src\\routes\\about\\index.svelte"),"src/routes/login/index.svelte": () => import("..\\..\\src\\routes\\login\\index.svelte"),"src/routes/blog/index.svelte": () => import("..\\..\\src\\routes\\blog\\index.svelte"),"src/routes/docs/index.svelte": () => import("..\\..\\src\\routes\\docs\\index.svelte"),"src/routes/docs/[slug].svelte": () => import("..\\..\\src\\routes\\docs\\[slug].svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"/./_app/pages/__layout.svelte-342e8e17.js","css":["/./_app/assets/pages/__layout.svelte-72de0231.css"],"js":["/./_app/pages/__layout.svelte-342e8e17.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/stores-ecd6cb1b.js","/./_app/chunks/button-ff288475.js"],"styles":null},"src/routes/__error.svelte":{"entry":"/./_app/pages/__error.svelte-d0047cf6.js","css":["/./_app/assets/pages/__error.svelte-c7a15572.css"],"js":["/./_app/pages/__error.svelte-d0047cf6.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/index.svelte":{"entry":"/./_app/pages/index.svelte-d6cc44c4.js","css":["/./_app/assets/pages/index.svelte-d869b5b8.css"],"js":["/./_app/pages/index.svelte-d6cc44c4.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/signup-61a92987.js","/./_app/chunks/button-ff288475.js","/./_app/chunks/open-graph-e512d3a6.js","/./_app/chunks/stores-ecd6cb1b.js"],"styles":null},"src/routes/terms-of-service/index.svelte":{"entry":"/./_app/pages/terms-of-service/index.svelte-3bbc6038.js","css":[],"js":["/./_app/pages/terms-of-service/index.svelte-3bbc6038.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/privacy-policy/index.svelte":{"entry":"/./_app/pages/privacy-policy/index.svelte-e82df043.js","css":["/./_app/assets/pages/privacy-policy/index.svelte-52f8d936.css"],"js":["/./_app/pages/privacy-policy/index.svelte-e82df043.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/changelog/index.svelte":{"entry":"/./_app/pages/changelog/index.svelte-26af2134.js","css":[],"js":["/./_app/pages/changelog/index.svelte-26af2134.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/dashboard/index.svelte":{"entry":"/./_app/pages/dashboard/index.svelte-79d977d9.js","css":[],"js":["/./_app/pages/dashboard/index.svelte-79d977d9.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/features/index.svelte":{"entry":"/./_app/pages/features/index.svelte-4cf9e859.js","css":[],"js":["/./_app/pages/features/index.svelte-4cf9e859.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/contact/index.svelte":{"entry":"/./_app/pages/contact/index.svelte-822460f8.js","css":[],"js":["/./_app/pages/contact/index.svelte-822460f8.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/button-ff288475.js"],"styles":null},"src/routes/pricing/index.svelte":{"entry":"/./_app/pages/pricing/index.svelte-592b6c33.js","css":[],"js":["/./_app/pages/pricing/index.svelte-592b6c33.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/logout/index.svelte":{"entry":"/./_app/pages/logout/index.svelte-9e4c244d.js","css":[],"js":["/./_app/pages/logout/index.svelte-9e4c244d.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/stores-ecd6cb1b.js","/./_app/chunks/utils-cf215c6e.js"],"styles":null},"src/routes/signup/index.svelte":{"entry":"/./_app/pages/signup/index.svelte-30154832.js","css":[],"js":["/./_app/pages/signup/index.svelte-30154832.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/signup-61a92987.js"],"styles":null},"src/routes/about/index.svelte":{"entry":"/./_app/pages/about/index.svelte-8a07128e.js","css":["/./_app/assets/pages/about/index.svelte-59987484.css"],"js":["/./_app/pages/about/index.svelte-8a07128e.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/login/index.svelte":{"entry":"/./_app/pages/login/index.svelte-e38d2840.js","css":[],"js":["/./_app/pages/login/index.svelte-e38d2840.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/stores-ecd6cb1b.js","/./_app/chunks/singletons-bb9012b7.js","/./_app/chunks/utils-cf215c6e.js"],"styles":null},"src/routes/blog/index.svelte":{"entry":"/./_app/pages/blog/index.svelte-ef92ca59.js","css":[],"js":["/./_app/pages/blog/index.svelte-ef92ca59.js","/./_app/chunks/vendor-53ff72c6.js"],"styles":null},"src/routes/docs/index.svelte":{"entry":"/./_app/pages/docs/index.svelte-c8b2e020.js","css":["/./_app/assets/pages/docs/index.svelte-c3821242.css"],"js":["/./_app/pages/docs/index.svelte-c8b2e020.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/index-8fc7aa11.js","/./_app/chunks/open-graph-e512d3a6.js","/./_app/chunks/stores-ecd6cb1b.js"],"styles":null},"src/routes/docs/[slug].svelte":{"entry":"/./_app/pages/docs/[slug].svelte-6c10727d.js","css":[],"js":["/./_app/pages/docs/[slug].svelte-6c10727d.js","/./_app/chunks/vendor-53ff72c6.js","/./_app/chunks/index-8fc7aa11.js","/./_app/chunks/open-graph-e512d3a6.js","/./_app/chunks/stores-ecd6cb1b.js"],"styles":null}};

async function load_component(file) {
	return {
		module: await module_lookup[file](),
		...metadata_lookup[file]
	};
}

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}