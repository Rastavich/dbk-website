<script>
  import Button from '$lib/components/generics/button.svelte';
  // function that uses tailwindcss to toggle the dashboard left side bar open/closed
  function toggleSidebar() {
    document.getElementById('dashboard-sidebar').classList.toggle('hidden');
  }
</script>

<div class="flex items-center justify-center mt-8">
  <div class="flex items-center">
    <Button text="X" href="" clickEvent={toggleSidebar} />
  </div>
</div>

<nav class="flex flex-col mt-10 px-4 text-center">
  <a href="#" class="py-2 text-sm text-gray-100 bg-gray-800 rounded">Overview</a
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
