<script context="module">
	// export const prerender = true;

  import { GRAPHQL_URI } from "../../lib/config";
  import { GET_DOCS } from "../../lib/graphql/requests";
  console.log(GRAPHQL_URI);

  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load() {
    let items;
    try {
      const res = await fetch(`${GRAPHQL_URI}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: GET_DOCS }),
      });

      items = await res.json();
      items = items.data.documentations;
      console.log(items.data.documentations)
    } catch (e) {
      console.log(e.message);
    }

    return {
      props: {
        items,
      },
    };
  }

  let promise = load();
</script>

<script>
  import snarkdown from "snarkdown";
  import OpenGraph from "$lib/components/open-graph.svelte";

  export let items;

  function phoneNav() {
    var item = document.getElementById("p-nav");

    item.classList.toggle("hidden");
  }
</script>

<OpenGraph
  description="Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more"
  title="Digital Business Keys - Documentation"
  type="website"
/>

{#await promise}

  <p>...loading</p>
{:then data}
  <div class="flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl">
    <div
      id="p-nav"
      class="hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600"
    >
      <div class="md:relative mx-auto lg:float-right lg:px-6">
        <ul
          class="m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20"
        >
          {#each items as doc}
            <div
              class="lg:flex-none flex w-full md:max-w-xs bg-purple text-black"
            >
              <li class="text-black pb-2">
                <p class="hover:bg-indigo-500 text-black">
                  <a
                    on:click={phoneNav}
                    class="text-black"
                    rel="prefetch"
                    href="docs#{doc.Slug}">{doc.title}</a
                  >
                </p>
              </li>
            </div>
          {/each}
        </ul>
      </div>
    </div>

    <div class="w-full md:w-4/5">
      <h1
        class="z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 "
      >
        Documentation
      </h1>
      <div class="container pt-12 px-6">
        {#each items as doc}
          <div id={doc.Slug} class="mb-12 overflow-auto
                    ">
            <h2 class="pb-10">{doc.title}</h2>

            <article class="prose prose-indigo lg:prose-xl">
              {@html snarkdown(doc.content)}
            </article>
          </div>
        {/each}
      </div>
    </div>
    <button
      on:click={phoneNav}
      class="fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden"
    >
      <svg
        width="24"
        height="24"
        fill="none"
        class="absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform"
        ><path
          d="M4 8h16M4 16h16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        /></svg
      >
    </button>

  </div>
{/await}

<style>
  ul {
    margin: 0 0 1em 0;
    line-height: 1.5;
  }

  h2::before {
    display: block;
    content: " ";
    margin-top: -185px;
    height: 185px;
    visibility: hidden;
    pointer-events: none;
  }
</style>
