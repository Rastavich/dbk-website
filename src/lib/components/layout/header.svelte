<script>
  import { session } from "$app/stores";
  import Button from "$lib/components/generics/button.svelte";
  // import Href from "./generics/Href.svelte";

  function toggleMenu() {
    var item = document.getElementById("hidden-menu");
    var btn = document.getElementById("hidden-menubtn");

    item.classList.toggle("hidden");
    btn.classList.toggle("hidden");
  }
</script>

<!-- component -->
<nav
  class="flex justify-between flex-wrap bg-teal p-6 z-50 text-right lg:text-left"
>
  <div class="flex items-center flex-no-shrink text-white mr-6">
    <span class="font-semibold text-xl tracking-tight text-gray-50"
      ><a href="/"
        ><img
          class="w-60 md:w-72 lg:w-72"
          src="logo_light.webp"
          alt="Digital Business Keys"
        /></a
      ></span
    >
  </div>
  <div class="block lg:hidden z-50 lg:py-2">
    <button
      on:click={toggleMenu}
      class="flex px-3 my-3 md:my-5 lg:py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white"
    >
      <svg
        class="h-3 w-3"
        viewBox="0 0 20 20"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        ><title>Menu</title>
        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg
      >
    </button>
  </div>
  <div
    class="w-full block flex-grow lg:flex lg:items-center md:items-center lg:w-auto z-50 md:text-center lg:text-center"
  >
    <div
      id="hidden-menu"
      class="text-sm lg:flex-grow hidden lg:block md:items-center lg:items-center md:text-center lg:text-center"
    >
      <a href="/docs" rel="prefetch" class="nav-link" on:click={toggleMenu}
        >Docs</a
      >
      <a href="/features" rel="prefetch" on:click={toggleMenu}>Features</a>
      <a href="/blog" rel="prefetch" on:click={toggleMenu}>Blog</a>
      <a href="contact" rel="prefetch" on:click={toggleMenu}>Contact Us</a>
    </div>
    {#if $session.user}
      <div id="hidden-menubtn" class="hidden lg:block">
        <Button text="Dashboard" href="/dashboard" clickEvent={toggleMenu} />
        <Button text="Logout" href="/logout" clickEvent={toggleMenu} />
      </div>
    {:else}
      <div id="hidden-menubtn" class="hidden lg:block">
        <Button text="Sign Up" href="/signup" clickEvent={toggleMenu} />
        <Button text="Sign In" href="/login" clickEvent={toggleMenu} />
      </div>
    {/if}
  </div>
</nav>

<style>
  a {
    @apply mt-4 text-base;
    @apply inline lg:inline-block lg:mt-0 text-white hover:text-indigo-500 mr-4;
  }
</style>
