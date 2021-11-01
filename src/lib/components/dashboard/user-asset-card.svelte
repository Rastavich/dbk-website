<script>
  export let digitalAsset;

  // console.log(digitalAsset.websites);
</script>

<div>
  <h1 class="text-2xl font-medium text-white">Your Digital Assets</h1>

  <div class="bg-white .border rounded-md text-black">
    {#each digitalAsset.websites as website}
      {website.url}
    {/each}
  </div>
</div>
