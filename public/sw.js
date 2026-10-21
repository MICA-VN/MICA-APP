const CACHE_NAME = "mica-app-shell-v9";
const WORKER_API_BASE_URL = "https://mica-app-api.mica-vn.workers.dev";
const MANIFEST_URL = new URL("/api/contents/manifest", WORKER_API_BASE_URL).href;
const API_BASE_URL = self.location.hostname === "mica.page.gd"
  ? WORKER_API_BASE_URL
  : self.location.origin;
const SVG_NAMES = [
  "ai-tutor",
  "assignments",
  "camera",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "clock",
  "close",
  "edit",
  "home",
  "image",
  "library",
  "maximize",
  "minimize",
  "MICA-Logo",
  "offline",
  "online",
  "periodic-table",
  "plus",
  "send",
  "sun",
  "trash",
  "user",
];
const APP_SHELL_URLS = [
  "/",
  "/images/MICA-TextLogo.png",
];

function svgAssetUrl(name, dimensions, baseUrl = API_BASE_URL) {
  const url = new URL("/api/assets/svg", baseUrl);
  url.searchParams.set("name", name);
  Object.entries(dimensions).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.href;
}

const SVG_ASSET_URLS = [
  ...SVG_NAMES.map((name) => svgAssetUrl(name, { size: "24" })),
  ...[
    ["MICA-Logo", { size: "40" }],
    ["MICA-Logo", { size: "64" }],
    ["MICA-Logo", { size: "192" }],
    ["MICA-Logo", { size: "512" }],
    ["MICA-Logo", { w: "180", h: "180" }],
    ["user", { size: "26" }],
    ["offline", { size: "22" }],
    ["online", { size: "22" }],
    ["home", { size: "23" }],
    ["periodic-table", { size: "23" }],
  ].map(([name, dimensions]) => svgAssetUrl(name, dimensions)),
  ...[
    ["MICA-Logo", { size: "24" }],
    ["MICA-Logo", { size: "192" }],
    ["MICA-Logo", { size: "512" }],
    ["MICA-Logo", { w: "180", h: "180" }],
  ].map(([name, dimensions]) => svgAssetUrl(name, dimensions, WORKER_API_BASE_URL)),
].filter((url, index, urls) => urls.indexOf(url) === index);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const shellResponse = await fetch("/");
      if (!shellResponse.ok) throw new Error("Failed to cache application shell");

      const shellMarkup = await shellResponse.clone().text();
      await cache.put("/", shellResponse);

      const appAssetUrls = [
        ...shellMarkup.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g),
      ].map((match) => new URL(match[1], self.location.origin).href);

      await Promise.all([
        ...APP_SHELL_URLS.slice(1).map((url) => cache.add(url)),
        ...appAssetUrls.map((url) => cache.add(url)),
      ]);
      const assetResults = await Promise.allSettled(
        [MANIFEST_URL, ...SVG_ASSET_URLS].map((url) => cache.add(url)),
      );
      assetResults.forEach((result, index) => {
        if (result.status === "rejected") {
          const url = [MANIFEST_URL, ...SVG_ASSET_URLS][index];
          console.warn("Failed to pre-cache remote app asset", url, result.reason);
        }
      });
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("mica-app-shell-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);
  const isAppRequest = requestUrl.origin === self.location.origin;
  const isApiSvgRequest = requestUrl.pathname === "/api/assets/svg" &&
    (requestUrl.origin === API_BASE_URL || requestUrl.origin === WORKER_API_BASE_URL);
  const isApiManifestRequest = requestUrl.href === MANIFEST_URL;

  if (
    request.method !== "GET" ||
    (!isAppRequest && !isApiSvgRequest && !isApiManifestRequest)
  ) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy)),
          );
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        if (isAppRequest && request.mode === "navigate") {
          const appShell = await caches.match("/");
          if (appShell) return appShell;
        }
        return Response.error();
      }),
  );
});
