const c = [
	() => import("..\\components\\layout.svelte"),
	() => import("..\\components\\error.svelte"),
	() => import("..\\..\\..\\src\\routes\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\terms-of-service\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\privacy-policy\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\changelog\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\dashboard\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\features\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\contact\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\pricing\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\logout\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\signup\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\about\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\login\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\blog\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\docs\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\docs\\[slug].svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/terms-of-service/index.svelte
	[/^\/terms-of-service\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/privacy-policy/index.svelte
	[/^\/privacy-policy\/?$/, [c[0], c[4]], [c[1]]],

	// src/routes/changelog/index.svelte
	[/^\/changelog\/?$/, [c[0], c[5]], [c[1]]],

	// src/routes/dashboard/index.svelte
	[/^\/dashboard\/?$/, [c[0], c[6]], [c[1]]],

	// src/routes/features/index.svelte
	[/^\/features\/?$/, [c[0], c[7]], [c[1]]],

	// src/routes/contact/index.svelte
	[/^\/contact\/?$/, [c[0], c[8]], [c[1]]],

	// src/routes/pricing/index.svelte
	[/^\/pricing\/?$/, [c[0], c[9]], [c[1]]],

	// src/routes/logout/index.svelte
	[/^\/logout\/?$/, [c[0], c[10]], [c[1]]],

	// src/routes/signup/index.svelte
	[/^\/signup\/?$/, [c[0], c[11]], [c[1]]],

	// src/routes/about/index.svelte
	[/^\/about\/?$/, [c[0], c[12]], [c[1]]],

	// src/routes/login/index.svelte
	[/^\/login\/?$/, [c[0], c[13]], [c[1]]],

	// src/routes/auth/logout.js
	[/^\/auth\/logout\/?$/],

	// src/routes/auth/login.js
	[/^\/auth\/login\/?$/],

	// src/routes/blog/index.svelte
	[/^\/blog\/?$/, [c[0], c[14]], [c[1]]],

	// src/routes/docs/index.svelte
	[/^\/docs\/?$/, [c[0], c[15]], [c[1]]],

	// src/routes/docs/[slug].svelte
	[/^\/docs\/([^/]+?)\/?$/, [c[0], c[16]], [c[1]], (m) => ({ slug: d(m[1])})]
];

export const fallback = [c[0](), c[1]()];