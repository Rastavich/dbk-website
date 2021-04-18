const sveltePreprocess = require("svelte-preprocess");
// const node = require("@sveltejs/adapter-node");
const vercel = require("@sveltejs/adapter-vercel");
const pkg = require("./package.json");
/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    sveltePreprocess({
      defaults: {
        style: "postcss",
      },
      postcss: true,
    }),
  ],
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: vercel(),
    hydrate: true,
    prerender: {
      crawl: true,
      enabled: false,
      force: false,
      pages: ["*"],
    },
    router: true,
    ssr: true,
    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",

    vite: {
      ssr: {
        noExternal:
          process.env.NODE_ENV === "production"
            ? [
                ...Object.keys(pkg.dependencies),
                ...Object.keys(pkg.devDependencies),
              ]
            : [],
      },
    },
  },
};
