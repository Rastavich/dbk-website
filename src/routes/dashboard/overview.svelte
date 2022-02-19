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

    console.log(jwt, user);

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
</script>

<!-- component -->
<div>
  <div>
    <h1 class="text-2xl font-medium text-white">
      Welcome {user.legalName}
    </h1>
  </div>

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
