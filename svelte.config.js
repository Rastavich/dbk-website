import sveltePreprocess from "svelte-preprocess";
import vercel from "@sveltejs/adapter-vercel";
// const pkg = require("./package.json");

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: vercel(),
    target: "#svelte",

    vite: () => ({}),
  },

  preprocess: [
    sveltePreprocess({
      defaults: {
        style: "postcss",
      },
      postcss: true,
    }),
  ],
};

export default config;
