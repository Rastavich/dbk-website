<script context="module">
  export async function load({ session }) {
    if (session.jwt) {
      return {
        status: 302,
        redirect: '/',
      };
    }

    return {};
  }
</script>

<script>
  import { session } from '$app/stores';
  import { goto } from '$app/navigation';
  import { post } from '$lib/utils.js';

  let email = '';
  let password = '';
  let loginError = false;
  let loading = false;
  let loginBtnTxt = 'Login';

  async function handleLogin(event) {
    loading = true;
    const response = await post(`auth/login`, { email, password }).catch(
      (err) => {
        loading = false;
        loginBtnTxt = 'Login';
        loginError = true;
        console.log(err);
      }
    );

    if (response.user != undefined) {
      $session.user = response.user;
      goto('/dashboard');
    }
  }
</script>

<section>
  <div class="container px-5 py-5 mx-auto">
    <div class="flex flex-col text-center w-full mb-12">
      <form on:submit|preventDefault={handleLogin} method="post">
        <div class="p-2">
          <div class="container mx-auto max-w-xs" data-children-count="1">
            <label for="email" class="leading-7 text-sm text-gray-50"
              >Email *</label
            >
            <input
              type="text"
              id="email"
              bind:value={email}
              name="email"
              data-kwimpalastatus="alive"
              data-kwimpalaid="1610104456246-6"
            />
          </div>
        </div>
        <div class="p-2">
          <div class="container mx-auto max-w-xs" data-children-count="1">
            <label for="password" class="leading-7 text-sm text-gray-50"
              >Password *</label
            >
            <input
              type="password"
              id="password"
              bind:value={password}
              name="password"
              data-kwimpalastatus="alive"
              data-kwimpalaid="1610104456246-7"
            />
          </div>

          {#if loginError}
            <div class="p-2 w-full">
              <p class="text-red-500 ">
                Login Error, please check your credentials.
              </p>
            </div>
          {/if}

          <div class="p-2 w-full">
            <button
              type="submit"
              class="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              disabled={loading}
              on:click={() => {
                loading = true;
                loginBtnTxt = 'Loading...';
                handleLogin();
              }}>{loginBtnTxt}</button
            >
          </div>
        </div>
      </form>
    </div>
  </div>
</section>
