<script context="module">
  import Button from '$lib/components/generics/button.svelte';
  export async function load({ session }) {
    let { user, jwt } = session;
    if (user === null && jwt === null) {
      return {
        status: 302,
        redirect: '/login',
      };
    }
    return await {
      props: { user, jwt },
    };
  }
</script>

<script>
  import UserAssetCard from '$lib/components/dashboard/user-asset-card.svelte';
  import { GRAPHQL_URI } from '../../lib/config';
  import { GET_WEBSITES } from '../../lib/graphql/requests';
  import { post } from '$lib/api.js';
  import { digitalAsset } from '$lib/assetStore';

  export let user;
  export let jwt;
  let items;

  async function getUserDigitalAssets() {
    // Get from store before calling API again
    if ($digitalAsset) {
      items = $digitalAsset;
      return items;
    }

    if (user && jwt) {
      const res = await post(GRAPHQL_URI, JSON.parse(GET_WEBSITES), jwt)
        .then((res) => {
          items = res.data.digitalAssets;
        })
        .catch((error) => console.log(error));
    }
    digitalAsset.set(items);
    return items;
  }

  let promise = getUserDigitalAssets();

  // function that uses tailwindcss to toggle the dashboard left side bar open/closed
  function toggleSidebar() {
    document.getElementById('dashboard-sidebar').classList.toggle('hidden');
  }
</script>

<!-- component -->
<div>
  <div x-data="">
    <div class="flex h-screen bg-gray-800 font-roboto">
      <div
        id="opacity"
        class="fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden"
      />

      <div
        id="dashboard-sidebar"
        class="fixed z-30 inset-y-0 left-0 w-60 sm:w-32 transition duration-300 transform bg-gray-900 overflow-y-auto lg:translate-x-0 lg:static lg:inset-0 dashboard-sidebar"
      >
        <div class="flex items-center justify-center mt-8">
          <div class="flex items-center">
            <span class="text-white text-2xl font-semibold">Dashboard</span>
            <Button text="X" href="" clickEvent={toggleSidebar} />
          </div>
        </div>

        <nav class="flex flex-col mt-10 px-4 text-center">
          <a href="#" class="py-2 text-sm text-gray-100 bg-gray-800 rounded"
            >Overview</a
          >
          <a
            href="#"
            class="mt-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded"
            >Settings</a
          >
          <a
            href="#"
            class="mt-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded"
            >Account</a
          >
          <a
            href="#"
            class="mt-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded"
            >Billing</a
          >
        </nav>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="flex justify-between items-center p-6">
          <div class="flex items-center space-x-4 lg:space-x-0">
            <button
              class="text-gray-300 focus:outline-none lg:hidden"
              on:click={toggleSidebar}
            >
              <sv
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H11"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </sv>
            </button>

            <div>
              <h1 class="text-2xl font-medium text-white">
                Welcome {user.legalName}
              </h1>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto">
          <div class="container mx-auto px-6 py-8">
            <div
              class="grid place-items-center h-96 text-gray-300 text-xl border-4 border-gray-300 border-dashed"
            >
              <!-- pass the user.digital_assets array as a prop to user assets card-->
              {#await promise}
                <p>Loading...</p>
              {:then data}
                {#each items as item}
                  <UserAssetCard digitalAsset={item} />
                {/each}
              {/await}
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</div>

<!-- <main class="auto-cols-min flex">
  Account
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

  Billing
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
</main> -->
