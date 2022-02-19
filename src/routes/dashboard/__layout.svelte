<script context="module">
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
  import SideBar from './sideBar.svelte';
  import Overview from './overview.svelte';

  export let user;
  export let jwt;
</script>

<!-- Use flex for a 2 column layout with a sidemenu -->
<div class="flex">
  <!-- Sidebar -->
  <div class="w-64">
    <SideBar />
  </div>

  <!-- Main content -->
  <div class="flex-1 bg-gray-600">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold leading-6 text-gray-900">
          Dashboard
        </h1>
        <Overview user jwt />
        <div class="hidden md:block">
          <div class="flex">
            <a
              href="#"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-300 focus:outline-none focus:text-gray-900 focus:bg-gray-50 transition duration-150 ease-in-out"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="-ml-px px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:text-gray-900 focus:bg-gray-50 transition duration-150 ease-in-out"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="-ml-px px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:text-gray-900 focus:bg-gray-50 transition duration-150 ease-in-out"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<slot />
