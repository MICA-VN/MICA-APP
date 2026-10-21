const MANIFEST_PATH = "/contents/manifest.webmanifest";

function manifestError(message, status) {
  return new Response(message, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function createManifestResponse(request, assets) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.method !== "GET") {
    return manifestError("Method Not Allowed", 405);
  }
  if (!assets || typeof assets.fetch !== "function") {
    console.error("Cloudflare Assets binding is unavailable for the manifest");
    return manifestError("Manifest is unavailable", 503);
  }

  try {
    const assetResponse = await assets.fetch(
      new Request(new URL(MANIFEST_PATH, request.url)),
    );
    if (assetResponse.status === 404) {
      return manifestError("Manifest not found", 404);
    }
    if (!assetResponse.ok) {
      console.error("Cloudflare Assets manifest request failed", assetResponse.status);
      return manifestError("Manifest is unavailable", 502);
    }

    return new Response(assetResponse.body, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/manifest+json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Failed to load manifest from Cloudflare Assets", error);
    return manifestError("Manifest is unavailable", 502);
  }
}
