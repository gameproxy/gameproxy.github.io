var cacheName = "files";

addEventListener("fetch", function(event) {
    var request = event.request;

    if (request.method != "GET") {return;}

    event.respondWith(async function() {
        var fetchResponse = fetch(request);

        event.waitUntil((async function() {
            var responseCopy = (await fetchResponse).clone();
            var cache = await caches.open(cacheName);

            await cache.put(request, responseCopy);
        })());

        if (request.headers.get("Accept").includes("text/html")) {
            try {
                return await fetchResponse;
            } catch (e) {
                return caches.match(request);
            }
        } else {
            var cacheResponse = await caches.match(request);

            return cacheResponse || fetchResponse;
        }
    });
});