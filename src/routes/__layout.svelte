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
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-N9NEQNPNN0"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-N9NEQNPNN0');
  </script>
</svelte:head>

<!-- Center the main tag -->
<div class="w-full">
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</div>
