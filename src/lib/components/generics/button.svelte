<script>
  export let text;
  export let clickEvent;
  export let href;
</script>

<a
  on:click={clickEvent}
  {href}
  class="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full py-4 px-8 shadow-lg"
  >{#if text} {text} {:else} <slot /> {/if}</a
>
