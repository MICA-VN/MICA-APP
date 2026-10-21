import express from "express";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createSvgAssetResponse } from "../../cloudflare/api/assets/svg.js";
import { getCloudflareApiUrl } from "./api.js";
import { loadSvgAsset } from "./svgAssets.js";

const app = express();
const port = Number(process.env.PORT || 3000);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(__dirname, "../../dist");

app.use(express.json({ limit: "16kb" }));

app.get("/api/assets/svg", async (req, res) => {
  const request = new Request(`http://${req.get("host")}${req.originalUrl}`, {
    method: req.method,
    headers: req.headers,
  });
  const response = await createSvgAssetResponse(request, loadSvgAsset);
  res.status(response.status);
  response.headers.forEach((value, name) => res.set(name, value));
  res.send(await response.text());
});

app.post("/api/contents/periodic_table", async (req, res) => {
  try {
    const response = await fetch(getCloudflareApiUrl("/api/contents/periodic_table"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.status(response.status);
    response.headers.forEach((value, name) => res.set(name, value));
    res.send(await response.text());
  } catch (error) {
    console.error("Failed to forward periodic table request to Cloudflare", error);
    res.status(502).json({
      error: "Cloudflare periodic table API is unavailable.",
    });
  }
});

app.use(express.static(distDirectory));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distDirectory, "index.html"));
});

app.listen(port, () => {
  console.log(`MICA đang chạy tại http://localhost:${port}`);
});