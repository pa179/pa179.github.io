const VERSION = "1.0";
const CACHE_VERSION = "pww" + VERSION;

let cacheablePages = [
    "/Wasserwaage/index.html"
];

// Pre-Cache all cacheable pags
self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_VERSION)
        .then(cache => {
            return cache.addAll(cacheablePages);
        })
        .then(() => {
            return self.skipWaiting();
        })
   );
});