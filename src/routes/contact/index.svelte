<script context="module">
  // export const prerender = true;
</script>

<script>
  import Button from '$lib/components/generics/button.svelte';
  import { NOTION_URI, NOTION_TOKEN } from '$lib/config/index.js';
  import Error from '../__error.svelte';

  function submit(data) {
    if (data) {
      let opts = {};
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
      opts.headers['Authorization'] = `Token ${NOTION_TOKEN}`;

      fetch(NOTION_URI, opts)
        .then((r) => {
          return r.text();
        })
        .catch((err) => {
          throw new Error(err);
        });
    }
  }
</script>

<section class="text-white-500 body-font relative">
  <div class="container px-5 py-5 mx-auto">
    <div class="flex flex-col text-center w-full mb-12">
      <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4">
        Contact Us
      </h1>
      <p class="lg:w-2/3 mx-auto leading-relaxed text-base text-indigo-300">
        Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical
        gentrify.
      </p>
    </div>
    <div class="lg:w-1/2 md:w-2/3 mx-auto">
      <div class="flex flex-wrap -m-2">
        <div class="p-2 w-1/2">
          <div class="relative" data-children-count="1">
            <label for="name" class="leading-7 text-sm text-gray-50"
              >Name *</label
            >
            <input
              type="text"
              id="name"
              name="name"
              class="w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              data-kwimpalastatus="alive"
              data-kwimpalaid="1610104456246-6"
            />
          </div>
        </div>
        <div class="p-2 w-1/2">
          <div class="relative" data-children-count="1">
            <label for="email" class="leading-7 text-sm text-gray-50"
              >Email *</label
            >
            <input
              type="email"
              id="email"
              name="email"
              class="w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              data-kwimpalastatus="alive"
              data-kwimpalaid="1610104456246-7"
            />
          </div>
        </div>
        <div class="p-2 w-full">
          <div class="relative" data-children-count="1">
            <label for="email" class="leading-7 text-sm text-gray-50"
              >Business Website Url *</label
            >
            <input
              type="email"
              id="email"
              name="email"
              class="w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              data-kwimpalastatus="alive"
              data-kwimpalaid="1610104456246-7"
            />
          </div>
        </div>
        <div class="p-2 w-full">
          <div class="relative" data-children-count="1">
            <label for="message" class="leading-7 text-sm text-gray-50"
              >Message</label
            >
            <textarea
              id="message"
              name="message"
              class="w-full bg-white-500 bg-opacity-50 rounded border border-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
            />
          </div>
        </div>
        <div class="p-2 w-full">
          <Button clickEvent={submit} href="" text="Submit" />
        </div>
        <div class="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
          <a
            class="text-indigo-300 pb-4"
            href="mailto:digitalbusinesskeys@gmail.com&subject=Contact%20Form"
            >Email Us</a
          ><br />

          <span class="inline-flex pt-4">
            <a class="text-gray-500" href="https://www.facebook.com">
              <svg
                fill="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                />
              </svg>
            </a>
            <a class="ml-4 text-gray-500" href="https://www.twitter.com">
              <svg
                fill="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                />
              </svg>
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
