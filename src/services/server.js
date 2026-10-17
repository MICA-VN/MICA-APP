import express from "express";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createSvgAssetResponse } from "../../cloudflare/api/assets/svg.js";
import { loadSvgAsset } from "./svgAssets.js";

const app = express();
const port = Number(process.env.PORT || 3000);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(__dirname, "../../dist");

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

app.use(express.static(distDirectory));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distDirectory, "index.html"));
});

app.listen(port, () => {
  console.log(`MICA đang chạy tại http://localhost:${port}`);
});