<script context="module">
  export const prerender = true;
  export function load({ error, status }) {
    return {
      props: { error, status },
    };
  }
</script>

<script lang="ts">
  import { dev } from "$app/env";
  import Section from "$lib/components/section.svelte";
  export let status: number;
  export let error: Error;
</script>

<div class="error-page row">
  <Section>
    <img
      src="/images/illustration-large.jpg"
      alt="Digital Business Keys"
    />
    <h1>{status}</h1>
    <p>Oh, no! Something went wrong on our side.</p>

    {#if dev}
      <p>{error.message}</p>
    {/if}

    <p>
      <a href="/contact">Contact Us</a>
    </p>
    <p>
      <a class="btn" href="/">Go Home</a>
    </p>
  </Section>
</div>

{#if dev && error.stack}
  <article class="card">
    <pre>{error.stack}</pre>
  </article>
{/if}