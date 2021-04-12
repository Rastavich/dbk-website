<script context="module">
  export function load({ session }) {
    const { user } = session;
    console.log(user);
    if (!user) {
      return {
        status: 302,
        redirect: "/login",
      };
    }
    return {
      props: { user },
    };
  }
</script>

<script>
  import { session } from "$app/stores";
  import { post } from "$lib/utils.js";
  import { onMount } from "svelte";

  onMount(async () => {
    await post(`auth/logout`);
    // this will trigger a redirect, because it
    // causes the `load` function to run again
    $session.user = null;
  });
</script>
