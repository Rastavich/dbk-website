import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "../../src/hooks/index.js";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"/favicon.ico\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\t\t" + head + "\n\t</head>\n\t<body>\n\t\t<div id=\"svelte\">" + body + "</div>\n\t</body>\n</html>\n";

let options = null;

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: "/./_app/start-84285aed.js",
			css: ["/./_app/assets/start-b97461fb.css"],
			js: ["/./_app/start-84285aed.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/singletons-bb9012b7.js"]
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
		router: true,
		ssr: true,
		target: "#svelte",
		template
	};
}

const d = decodeURIComponent;
const empty = () => ({});

const manifest = {
	assets: [{"file":"favicon.ico","size":1150,"type":"image/vnd.microsoft.icon"},{"file":"images/app-image.webp","size":74688,"type":"image/webp"},{"file":"images/feature-image2.webp","size":65954,"type":"image/webp"},{"file":"logo-192.png","size":4760,"type":"image/png"},{"file":"logo-512.png","size":13928,"type":"image/png"},{"file":"logo.webp","size":7916,"type":"image/webp"},{"file":"logo_light.webp","size":5204,"type":"image/webp"},{"file":"robots.txt","size":100,"type":"text/plain"}],
	layout: "src/routes/$layout.svelte",
	error: "src/routes/$error.svelte",
	routes: [
		{
						type: 'page',
						pattern: /^\/$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/terms-of-service\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/terms-of-service/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/privacy-policy\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/privacy-policy/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/changelog\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/changelog/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/dashboard\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/dashboard/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/features\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/features/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/contact\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/contact/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/pricing\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/pricing/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/logout\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/logout/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/signup\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/signup/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/about\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/about/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/login\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/login/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/auth\/logout\/?$/,
						params: empty,
						load: () => import("../../src/routes/auth/logout.js")
					},
		{
						type: 'endpoint',
						pattern: /^\/auth\/login\/?$/,
						params: empty,
						load: () => import("../../src/routes/auth/login.js")
					},
		{
						type: 'page',
						pattern: /^\/blog\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/blog/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/docs\/?$/,
						params: empty,
						a: ["src/routes/$layout.svelte", "src/routes/docs/index.svelte"],
						b: ["src/routes/$error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/docs\/([^/]+?)\/?$/,
						params: (m) => ({ slug: d(m[1])}),
						a: ["src/routes/$layout.svelte", "src/routes/docs/[slug].svelte"],
						b: ["src/routes/$error.svelte"]
					}
	]
};

// this looks redundant, but the indirection allows us to access
// named imports without triggering Rollup's missing import detection
const get_hooks = hooks => ({
	getSession: hooks.getSession || (() => ({})),
	handle: hooks.handle || (({ request, render }) => render(request))
});

const module_lookup = {
	"src/routes/$layout.svelte": () => import("../../src/routes/$layout.svelte"),"src/routes/$error.svelte": () => import("../../src/routes/$error.svelte"),"src/routes/index.svelte": () => import("../../src/routes/index.svelte"),"src/routes/terms-of-service/index.svelte": () => import("../../src/routes/terms-of-service/index.svelte"),"src/routes/privacy-policy/index.svelte": () => import("../../src/routes/privacy-policy/index.svelte"),"src/routes/changelog/index.svelte": () => import("../../src/routes/changelog/index.svelte"),"src/routes/dashboard/index.svelte": () => import("../../src/routes/dashboard/index.svelte"),"src/routes/features/index.svelte": () => import("../../src/routes/features/index.svelte"),"src/routes/contact/index.svelte": () => import("../../src/routes/contact/index.svelte"),"src/routes/pricing/index.svelte": () => import("../../src/routes/pricing/index.svelte"),"src/routes/logout/index.svelte": () => import("../../src/routes/logout/index.svelte"),"src/routes/signup/index.svelte": () => import("../../src/routes/signup/index.svelte"),"src/routes/about/index.svelte": () => import("../../src/routes/about/index.svelte"),"src/routes/login/index.svelte": () => import("../../src/routes/login/index.svelte"),"src/routes/blog/index.svelte": () => import("../../src/routes/blog/index.svelte"),"src/routes/docs/index.svelte": () => import("../../src/routes/docs/index.svelte"),"src/routes/docs/[slug].svelte": () => import("../../src/routes/docs/[slug].svelte")
};

const metadata_lookup = {"src/routes/$layout.svelte":{"entry":"/./_app/pages/$layout.svelte-c22140f7.js","css":["/./_app/assets/pages/$layout.svelte-758d7f09.css"],"js":["/./_app/pages/$layout.svelte-c22140f7.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/stores-1bba30e8.js","/./_app/chunks/button-bda43d45.js"],"styles":null},"src/routes/$error.svelte":{"entry":"/./_app/pages/$error.svelte-7cbf4174.js","css":["/./_app/assets/pages/$error.svelte-b6106204.css"],"js":["/./_app/pages/$error.svelte-7cbf4174.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/index.svelte":{"entry":"/./_app/pages/index.svelte-5254c81b.js","css":["/./_app/assets/pages/index.svelte-d869b5b8.css"],"js":["/./_app/pages/index.svelte-5254c81b.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/signup-af903f3c.js","/./_app/chunks/button-bda43d45.js","/./_app/chunks/open-graph-17b21669.js","/./_app/chunks/stores-1bba30e8.js"],"styles":null},"src/routes/terms-of-service/index.svelte":{"entry":"/./_app/pages/terms-of-service/index.svelte-ac032910.js","css":[],"js":["/./_app/pages/terms-of-service/index.svelte-ac032910.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/privacy-policy/index.svelte":{"entry":"/./_app/pages/privacy-policy/index.svelte-0eb0ccfc.js","css":["/./_app/assets/pages/privacy-policy/index.svelte-52f8d936.css"],"js":["/./_app/pages/privacy-policy/index.svelte-0eb0ccfc.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/changelog/index.svelte":{"entry":"/./_app/pages/changelog/index.svelte-0d1e8e8c.js","css":[],"js":["/./_app/pages/changelog/index.svelte-0d1e8e8c.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/dashboard/index.svelte":{"entry":"/./_app/pages/dashboard/index.svelte-420652b2.js","css":[],"js":["/./_app/pages/dashboard/index.svelte-420652b2.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/features/index.svelte":{"entry":"/./_app/pages/features/index.svelte-f9d89c21.js","css":[],"js":["/./_app/pages/features/index.svelte-f9d89c21.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/contact/index.svelte":{"entry":"/./_app/pages/contact/index.svelte-50f0f975.js","css":[],"js":["/./_app/pages/contact/index.svelte-50f0f975.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/button-bda43d45.js"],"styles":null},"src/routes/pricing/index.svelte":{"entry":"/./_app/pages/pricing/index.svelte-30cf89ed.js","css":[],"js":["/./_app/pages/pricing/index.svelte-30cf89ed.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/logout/index.svelte":{"entry":"/./_app/pages/logout/index.svelte-34aafafe.js","css":[],"js":["/./_app/pages/logout/index.svelte-34aafafe.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/stores-1bba30e8.js","/./_app/chunks/utils-8ab506d1.js"],"styles":null},"src/routes/signup/index.svelte":{"entry":"/./_app/pages/signup/index.svelte-6c64f7ab.js","css":[],"js":["/./_app/pages/signup/index.svelte-6c64f7ab.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/signup-af903f3c.js"],"styles":null},"src/routes/about/index.svelte":{"entry":"/./_app/pages/about/index.svelte-f4d01b1b.js","css":["/./_app/assets/pages/about/index.svelte-59987484.css"],"js":["/./_app/pages/about/index.svelte-f4d01b1b.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/login/index.svelte":{"entry":"/./_app/pages/login/index.svelte-486ab403.js","css":[],"js":["/./_app/pages/login/index.svelte-486ab403.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/stores-1bba30e8.js","/./_app/chunks/singletons-bb9012b7.js","/./_app/chunks/utils-8ab506d1.js"],"styles":null},"src/routes/blog/index.svelte":{"entry":"/./_app/pages/blog/index.svelte-c3309ada.js","css":[],"js":["/./_app/pages/blog/index.svelte-c3309ada.js","/./_app/chunks/vendor-6fa84470.js"],"styles":null},"src/routes/docs/index.svelte":{"entry":"/./_app/pages/docs/index.svelte-1e962e10.js","css":["/./_app/assets/pages/docs/index.svelte-c3821242.css"],"js":["/./_app/pages/docs/index.svelte-1e962e10.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/index-71af2701.js","/./_app/chunks/open-graph-17b21669.js","/./_app/chunks/stores-1bba30e8.js"],"styles":null},"src/routes/docs/[slug].svelte":{"entry":"/./_app/pages/docs/[slug].svelte-847ab658.js","css":[],"js":["/./_app/pages/docs/[slug].svelte-847ab658.js","/./_app/chunks/vendor-6fa84470.js","/./_app/chunks/index-71af2701.js","/./_app/chunks/open-graph-17b21669.js","/./_app/chunks/stores-1bba30e8.js"],"styles":null}};

async function load_component(file) {
	return {
		module: await module_lookup[file](),
		...metadata_lookup[file]
	};
}

init({ paths: {"base":"","assets":"/."} });

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}