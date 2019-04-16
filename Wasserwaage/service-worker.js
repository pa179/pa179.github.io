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

// Cleanup old cache storages
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (CACHE_VERSION !== cacheName) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                // Version #1: Cache all (!) responses and return error page
                // Clone the request
                let fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        let responseToCache = response.clone();

                        caches.open(CACHE_VERSION)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        return caches.match(OFFLINE_URL);
                    });

                // Version #2: Return error page
                return fetch(event.request)
                    .catch(() => {
                        return caches.match(OFFLINE_URL);
                    });
            })
    );
});