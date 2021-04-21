<script context="module">
  export const prerender = true;
  import snarkdown from "snarkdown";
  import { GRAPHQL_URI } from "../../lib/config";
  import { GET_DOCS } from "../../lib/graphql/requests";

  export async function load({ page, fetch }) {
    const res = await fetch(`${GRAPHQL_URI}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: GET_DOCS }),
    });

    const items = await res.json();

    if (items) {
      const pagename = page.path;
      console.log(items.data);
      items.data.documentations = items.data.documentations.filter((doc) =>
        pagename.includes(doc.Slug)
      );
      return { pagedata: items.data.documentations[0] };
    }
  }
</script>

<script>
  import OpenGraph from "$lib/components/open-graph.svelte";
  export let pagedata;
</script>

<OpenGraph
  description="Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more"
  title="Digital Business Keys - {pagedata.title}"
  type="website"
/>

<a class="mt-3 pb-12 text-indigo-300 inline-flex items-center" href="/docs">
  <svg
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    class="w-4 h-4 ml-2"
    viewBox="0 0 24 24"
  >
    <path d="M5 13h14M12 6l-7 7l7 6" />
  </svg>
  Go Back</a
>

<h1 class="sm:text-3xl text-2xl font-medium title-font text-gray-50">
  {pagedata.title}
</h1>

<div>
  {@html snarkdown(pagedata.content)}
</div>
