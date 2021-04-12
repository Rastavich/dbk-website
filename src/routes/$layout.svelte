<script>
  import "../global.css";
  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header.svelte";
</script>

<svelte:head>
  <title>Digital Bussiness Keys</title>
</svelte:head>

<Header />

<slot />

<Footer />
