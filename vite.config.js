import react from "@vitejs/plugin-react";
import { createPeriodicTableResponse } from "./cloudflare/api/contents/periodic-table.js";
import { createSvgAssetResponse } from "./cloudflare/api/assets/svg.js";
import { loadPeriodicTableDatabase } from "./src/services/periodicTableDatabase.js";
import { loadSvgAsset } from "./src/services/svgAssets.js";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "svg-assets-api",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const requestUrl = new URL(req.url ?? "/", "http://localhost");
          const isSvgRequest = requestUrl.pathname === "/api/assets/svg";
          const isPeriodicTableRequest = requestUrl.pathname === "/api/contents/periodic_table";
          if (!isSvgRequest && !isPeriodicTableRequest) {
            next();
            return;
          }

          try {
            let response;
            if (isSvgRequest) {
              response = await createSvgAssetResponse(
                new Request(requestUrl, {
                  method: req.method,
                  headers: req.headers,
                }),
                loadSvgAsset,
              );
            } else {
              let body = "";
              for await (const chunk of req) {
                body += chunk;
                if (body.length > 16 * 1024) {
                  res.statusCode = 413;
                  res.end(JSON.stringify({ error: "Request body is too large" }));
                  return;
                }
              }
              response = await createPeriodicTableResponse(
                new Request(requestUrl, {
                  method: req.method,
                  headers: req.headers,
                  body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
                }),
                loadPeriodicTableDatabase,
              );
            }
            res.statusCode = response.status;
            response.headers.forEach((value, name) => res.setHeader(name, value));
            res.end(await response.text());
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    }
  },
});
