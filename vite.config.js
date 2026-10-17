import react from "@vitejs/plugin-react";
import { createSvgAssetResponse } from "./cloudflare/api/assets/svg.js";
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
          if (requestUrl.pathname !== "/api/assets/svg") {
            next();
            return;
          }

          try {
            const response = await createSvgAssetResponse(
              new Request(requestUrl, {
                method: req.method,
                headers: req.headers,
              }),
              loadSvgAsset,
            );
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
