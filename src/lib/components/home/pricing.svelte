<script>
    let priceType = "monthly";

    function toggleMonthly() {
        priceType = "monthly";
    }

    function toggleAnnual() {
        priceType = "yearly";
    }
</script>

<style lang="postcss">
    .active {
        @apply bg-indigo-500;
    }
</style>

<section class="text-gray-50 body-font overflow-hidden">
    <div class="container px-5 py-24 mx-auto">
        <div class="flex flex-col text-center w-full mb-20">
            <h1 class="sm:text-4xl text-3xl font-medium title-font mb-2">
                Pricing
            </h1>
            <p class="lg:w-2/3 mx-auto leading-relaxed text-base">
                A free trial and different tiers to cater to all types of users
                and budgets.
            </p>
            <div
                class="flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6">
                <button
                    class:active={priceType === 'monthly'}
                    class="py-1 px-4 text-white focus:outline-none"
                    on:click={toggleMonthly}>Monthly</button>
                <button
                    class:active={priceType === 'yearly'}
                    class="py-1 px-4 focus:outline-none"
                    on:click={toggleAnnual}>Annually</button>
            </div>
        </div>
        <div class="flex flex-wrap -m-4">
            <div class="p-4 xl:w-1/3 md:w-1/3 w-full">
                <div
                    class="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                    <h2
                        class="text-sm tracking-widest title-font mb-1 font-medium">
                        TRIAL
                    </h2>
                    <h1
                        class="text-5xl pb-4 mb-4 border-b border-gray-200 leading-none">
                        Free
                    </h1>
                    <p class="flex items-center  mb-2">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>Save your Digital Assets
                    </p>
                    <p class="flex items-center mb-2">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>Save your Important Business Details
                    </p>
                    <p class="flex items-center mb-6">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>View status of your assets
                    </p>
                    <button
                        class="flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded">Buy
                        <svg
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            class="w-4 h-4 ml-auto"
                            viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <p class="text-xs text-gray-400 mt-3">
                        Try the app for free for 14 days.
                    </p>
                </div>
            </div>
            <div class="p-4 xl:w-1/3 md:w-1/3 w-full">
                <div
                    class="h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden">
                    <span
                        class="bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">POPULAR</span>
                    <h2
                        class="text-sm tracking-widest title-font mb-1 font-medium">
                        ESSENTIAL
                    </h2>
                    <h1
                        class="text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                        {#if priceType == 'monthly'}
                            <span>$5</span>
                            <span
                                class="text-lg ml-1 font-normal text-gray-500">/mo</span>
                        {:else}
                            <span>$50</span>
                            <span
                                class="text-lg ml-1 font-normal text-gray-500">/yr</span>
                        {/if}
                    </h1>
                    <p class="flex items-center  mb-2">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>All Trial Features
                    </p>
                    <p class="flex items-center mb-2">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>Save multiple assets
                    </p>
                    <p class="flex items-center mb-6">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>Email and export
                    </p>
                    <button
                        class="flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded">Buy
                        <svg
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            class="w-4 h-4 ml-auto"
                            viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <p class="text-xs text-gray-500 mt-3">
                        All the features for your small business.
                    </p>
                </div>
            </div>
            <div class="p-4 xl:w-1/3 md:w-1/3 w-full">
                <div
                    class="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden">
                    <h2
                        class="text-sm tracking-widest title-font mb-1 font-medium">
                        PREMIUM
                    </h2>
                    <h1
                        class="text-5xl leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                        {#if priceType == 'monthly'}
                            <span>$8</span>
                            <span
                                class="text-lg ml-1 font-normal text-gray-500">/mo</span>
                        {:else}
                            <span>$90</span>
                            <span
                                class="text-lg ml-1 font-normal text-gray-500">/yr</span>
                        {/if}
                    </h1>
                    <p class="flex items-center  mb-2">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>All Trial & Essential Features
                    </p>
                    <p class="flex items-center mb-2">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>Setup notifications for your assets
                    </p>
                    <p class="flex items-center mb-6">
                        <span
                            class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                class="w-3 h-3"
                                viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>Automatic service checks to ensure your assets
                        are always working
                    </p>
                    <button
                        class="flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded">Buy
                        <svg
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            class="w-4 h-4 ml-auto"
                            viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <p class="text-xs text-gray-500 mt-3">
                        Perfect for business critical services.
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>
