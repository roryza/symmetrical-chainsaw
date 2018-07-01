'use strict';

var cacheName = 'CCCache-v1';

self.addEventListener('install', function (event) {
  console.log('SW install');
  return event.waitUntil(caches.open(cacheName).then(function (cache) {
    return cache.addAll(['index.html', 'app.js', 'idb.js', 'idbcurrencyconverter.js', 'main.css', 'https://fonts.googleapis.com/css?family=Muli', 'https://fonts.gstatic.com/s/muli/v11/7Auwp_0qiz-afTzGLRrX.woff2', 'https://fonts.gstatic.com/s/muli/v11/7Auwp_0qiz-afTLGLQ.woff2']);
  }));
});

self.addEventListener('activate', function (event) {
  console.log('SW activate');
  return event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(
    // delete anything else not mine
    cacheNames.filter(function (name) {
      return name !== cacheName;
    }).map(function (otherCache) {
      console.log('Deleting cache ' + otherCache);
      caches.delete(otherCache);
      return true;
    }));
  }));
});

self.addEventListener('fetch', function (event) {
  console.log('SW fetching: ' + event.request.url);

  var requestUrl = new URL(event.request.url);

  // if there's any files we missed pre-caching above either locally or from google fonts (the dynamically generated 
  // css might reference different kinds of font files for other browsers) we want to cache them
  if (requestUrl.origin === location.origin || requestUrl.origin === 'https://fonts.gstatic.com') {

    // return "homepage"
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.open(cacheName).then(function (cache) {
        return cache.match('index.html').then(function (response) {
          if (response) {
            console.log('Found in cache: ' + event.request.url);
            return response;
          }

          console.log('Need network for: ' + event.request.url);
          return fetch(event.request).then(function (networkResponse) {
            cache.put('index.html', networkResponse.clone());
            return networkResponse;
          });
        });
      }));
      return;
    }

    console.log('Serving from cache: ' + event.request.url);
    // if not cached, fetch from network and cache
    event.respondWith(caches.open(cacheName).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        if (response) {
          console.log('Found in cache: ' + event.request.url);
          return response;
        }

        console.log('Need network for: ' + event.request.url);
        return fetch(event.request).then(function (networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }));
    return;
  }
  // https://free.currencyconverterapi.com bypasses cache


  // https://fonts.googleapis.com should be served from cache here
  console.log('Attempting to serve from network: ' + event.request.url);
  // catch all in case we have it in the cache, but we're not caching api requests as we'll handle with IndexedDB
  event.respondWith(caches.match(event.request).then(function (response) {
    return response || fetch(event.request).catch(function (reason) {
      Promise.reject(new Error('Offline'));
      console.log('We cant fetch, must be offline:', reason);
    });
  }).catch(function () {
    Promise.reject(new Error('Offline'));
  }));
});

self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});