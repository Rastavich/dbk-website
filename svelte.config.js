import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-vercel';
// import adapter from '@sveltejs/adapter-static';
// const pkg = require("./package.json");

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
    }),
    target: '#svelte',

    vite: () => ({}),
  },

  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
};

export default config;
