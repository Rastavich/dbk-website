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
  export let user;
</script>

<h1 class="text-4xl px-8 font-extrabold text-gray-50">Dashboard</h1>

<main class="auto-cols-min flex">
  <!-- Account -->
  <div class="w-2/5 flex-wrap">
    <h2 class="text-3xl font-extrabold pb-4 text-gray-50">Account</h2>
    <div class="grid-cols-1 gap-2">
      <div>
        <input class="text-black p-2" bind:value={user.username} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.email} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.tradingName} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.legalName} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.abn} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.acn} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.businessPhone} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.businessEmail} />
      </div>
    </div>
  </div>

  <!-- Billing -->
  <div class="w-2/5 flex-wrap">
    <h2 class="text-3xl font-extrabold pb-4 text-gray-50">Billing</h2>
    <div class="grid-cols-1 gap-2">
      <div>
        <input class="text-black p-2" bind:value={user.username} />
      </div>
      <div>
        <input class="text-black p-2" bind:value={user.email} />
      </div>
    </div>
  </div>
</main>
