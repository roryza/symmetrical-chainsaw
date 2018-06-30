

self.addEventListener('fetch', event => {
    console.log(`SW fetching: ${event.request.url}`);

    const requestUrl = new URL(event.request.url);
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });