import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const svgDirectory = fileURLToPath(new URL("../../private/svg/", import.meta.url));

export async function loadSvgAsset(name) {
  try {
    return await readFile(path.join(svgDirectory, `${name}.svg`), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
