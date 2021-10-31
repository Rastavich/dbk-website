<script>
  import { page } from '$app/stores';

  export let description;
  export let image;
  export let title;
  export let type;

  const url = `https://${$page.host}${$page.path}`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta
    name="keywords"
    content="secure, business security, security, Store passwords app, Store passwords in chrome, Store passwords on iphone, mobile app, app, android app, ios app"
  />
  <meta name="description" content={description} />

  <!-- https://ogp.me -->
  <meta property="og:image" content={image || ''} />
  <meta property="og:description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url} />
</svelte:head>
