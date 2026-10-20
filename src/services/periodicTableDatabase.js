import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const databasePath = fileURLToPath(
  new URL("../../private/contents/periodic_table.db", import.meta.url),
);

export async function loadPeriodicTableDatabase() {
  try {
    return await readFile(databasePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
