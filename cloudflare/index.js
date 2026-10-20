import { createSvgAssetResponse } from "./api/assets/svg.js";
import { createPeriodicTableResponse } from "./api/contents/periodic-table.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/assets/svg") {
      return createSvgAssetResponse(request, async (name) => {
        const assetResponse = await env.ASSETS.fetch(
          new Request(new URL(`/svg/${name}.svg`, request.url)),
        );
        if (assetResponse.status === 404) return null;
        if (!assetResponse.ok) {
          throw new Error(`SVG asset request failed with status ${assetResponse.status}`);
        }
        return assetResponse.text();
      });
    }

    if (url.pathname === "/api/contents/periodic_table") {
      return createPeriodicTableResponse(request, async () => {
        const databaseResponse = await env.ASSETS.fetch(
          new Request(new URL("/contents/periodic_table.db", request.url)),
        );
        if (databaseResponse.status === 404) return null;
        if (!databaseResponse.ok) {
          throw new Error(`Database asset request failed with status ${databaseResponse.status}`);
        }
        return new Uint8Array(await databaseResponse.arrayBuffer());
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
