<script>
  export let text;
  export let clickEvent;
  export let href;
</script>

<a
  on:click={clickEvent}
  {href}
  class="mt-4 lg:inline-block inline lg:mt-0 text-teal-lighter hover:text-white mr-4"
  >{#if text} {text} {:else} Link {/if}</a
>
