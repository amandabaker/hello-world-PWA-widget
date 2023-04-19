// When SW is installed, cache urls for later use.
self.addEventListener('install', (event) => {

  self.skipWaiting();

  // Cache content for offline use.
  const urlsToCache = ['/', 'app.js'];
   event.waitUntil(async () => {
      const cache = await caches.open('pwa-assets');
      return cache.addAll(urlsToCache);
   });
});

// Once SW is activated, claim clients to set the new instance as the controller.
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// If fetch fails, serve content from cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
    .catch(error => {
      return caches.match(event.request) ;
    })
  );
});

// When widget is installed/pinned, push initial state.
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(updateWidget(event));
});

// When widget is shown, update content to ensure it is up-to-date.
self.addEventListener('widgetresume', (event) => {
  event.waitUntil(updateWidget(event));
});

// When the user clicks an element with an associated Action.Execute,
// handle according to the 'verb' in event.action.
self.addEventListener('widgetclick', (event) => {
  if (event.action == "updateName") {
    event.waitUntil(updateName(event));
  }
});

// When the widget is uninstalled/unpinned, clean up any unnecessary
// periodic sync or widget-related state.
self.addEventListener('widgetuninstall', (event) => {});

const updateWidget = async (event) => {
  // The widget definition represents the fields specified in the manifest.
  const widgetDefinition = event.widget.definition;

  // Fetch the template and data defined in the manifest to generate the payload.
  const payload = {
    template: JSON.stringify(await (await fetch(widgetDefinition.msAcTemplate)).json()),
    data: JSON.stringify(await (await fetch(widgetDefinition.data)).json()),
  };

  // Push payload to widget.
  await self.widgets.updateByInstanceId(event.instanceId, payload);
}

const updateName = async (event) => {
  const name = event.data.json().name;

  // The widget definition represents the fields specified in the manifest.
  const widgetDefinition = event.widget.definition;

  // Fetch the template and data defined in the manifest to generate the payload.
  const payload = {
    template: JSON.stringify(await (await fetch(widgetDefinition.msAcTemplate)).json()),
    data: JSON.stringify({name}),
  };

  // Push payload to widget.
  await self.widgets.updateByInstanceId(event.instanceId, payload);
}
