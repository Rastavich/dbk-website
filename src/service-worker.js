import { build, timestamp } from "$service-worker";

const staticCacheName = `staticCache-v${timestamp}`;
const dynamicCacheName = `dynamicCache-v${timestamp}`;

self.addEventListener("install", (event) => {
  console.log("install");
  event.waitUntil(
    caches
      .open(staticCacheName)
      .then((cache) => cache.addAll(build))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("Activate");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});
