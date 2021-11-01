<script>
  import '../global.css';
  import Footer from '$lib/components/layout/footer.svelte';
  import Header from '$lib/components/layout/header.svelte';
</script>

<svelte:head>
  <!-- Google Tag Manager -->
  <script>
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-59ZQVXC');
  </script>
  <!-- End Google Tag Manager -->
</svelte:head>

<!-- Center the main tag -->
<div class="w-full">
  <!-- Google Tag Manager (noscript) -->
  <noscript
    ><iframe
      src="https://www.googletagmanager.com/ns.html?id=GTM-59ZQVXC"
      height="0"
      width="0"
      style="display:none;visibility:hidden"
    /></noscript
  >
  <!-- End Google Tag Manager (noscript) -->
</div>

<Header />

<slot />

<Footer />
