<script>
  import CallToAction from "$lib/components/home/call-to-action.svelte";
  import FeaturedSection from "$lib/components/home/featured-section.svelte";
  import Features from "$lib/components/home/features.svelte";
  import Pricing from "$lib/components/home/pricing.svelte";
  import Signup from "$lib/components/home/signup.svelte";
  import Button from "$lib/components/generics/button.svelte";
  import OpenGraph from "$lib/components/open-graph.svelte";

  import { session } from "$app/stores";
</script>

<OpenGraph
  description="Digital Business Keys secures your businesses critical digital business assets to ensure your business is always online."
  title="Digital Business Keys - Store. Manage. Monitor"
  type="website"
/>

<div class="pt-0 md:pt-5 lg:pt-24">
  <div
    class="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center"
  >
    <!--Left Col-->
    <div
      class="flex flex-col md:w-1/2 justify-center px-4 items-start text-center md:text-left"
    >
      <h1 class="my-4 text-5xl font-bold leading-tight">
        Store. Manage. Monitor.<br />
        Your critical Digital Business Assets
      </h1>
      <p class="leading-normal text-xl mb-8 text-indigo-300">
        Manage and secure your business's digital business assets and monitor
        your essential business services such as email and website in the
        simple-to-use Digital Business Keys app.
      </p>

      {#if $session.user}
        <Button text="Dashboard" href="dashboard" />
      {:else}
        <div
          class="lg:flex-initial justify-center lg:items-start md:items-start text-center md:text-left"
        >
          <Button text="Try Free!" href="signup" />

          <Button text="Sign In" href="login" />
        </div>
      {/if}
    </div>
    <!--Right Col-->
    <div class="w-full md:w-1/2 py-6 text-center">
      <img
        class="w-full z-50 rounded-md"
        src="/images/feature-image2.webp"
        alt="people building app"
      />
    </div>
  </div>
  <section
    class="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center"
  >
    <FeaturedSection />
    <Features />
    <Pricing />
    <CallToAction />
    <Signup />
  </section>
</div>
