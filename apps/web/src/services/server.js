import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(__dirname, "../../dist");

app.use(express.static(distDirectory));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distDirectory, "index.html"));
});

app.listen(port, () => {
  console.log(`MICA đang chạy tại http://localhost:${port}`);
});