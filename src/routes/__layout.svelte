<script>
  import '../global.css';
  import Footer from '$lib/components/layout/footer.svelte';
  import Header from '$lib/components/layout/header.svelte';
</script>

<!-- Center the main tag -->
<div class="w-full">
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</div>
