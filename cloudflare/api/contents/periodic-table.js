// Cloudflare Workers failed while instantiating sql.js' embedded WebAssembly build.
// The ASM build is larger and slower, but is fully self-contained and is ample for
// this small, read-only periodic-table database.
import initSqlJs from "sql.js/dist/sql-asm.js";

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_QUERY_LENGTH = 8 * 1024;
const MAX_RESULT_ROWS = 500;
let sqlRuntime;

function getSqlRuntime() {
  sqlRuntime ??= initSqlJs();
  return sqlRuntime;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isSingleSelect(sql) {
  if (typeof sql !== "string" || sql.length > MAX_QUERY_LENGTH || !/^SELECT\b/i.test(sql.trim())) {
    return false;
  }

  let quote = null;
  let lineComment = false;
  let blockComment = false;
  let statementEnded = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (character === "\n" || character === "\r") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === quote) {
        if (next === quote && quote !== "]") index += 1;
        else quote = null;
      }
      continue;
    }
    if (character === "-" && next === "-") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      if (statementEnded) return false;
      quote = character;
      continue;
    }
    if (character === "[") {
      if (statementEnded) return false;
      quote = "]";
      continue;
    }
    if (character === ";") {
      if (statementEnded) return false;
      statementEnded = true;
      continue;
    }
    if (statementEnded && !/\s/.test(character)) return false;
  }

  return !quote && !blockComment;
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) return null;

  const reader = request.body?.getReader();
  if (!reader) return null;

  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    return undefined;
  }
}

export async function createPeriodicTableResponse(request, loadDatabase) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const body = await readJsonBody(request);
  if (body === null) return jsonResponse({ error: "Request body is too large" }, 413);
  if (body === undefined || !isSingleSelect(body?.sql)) {
    return jsonResponse({ error: "Provide one read-only SELECT statement in the sql field" }, 400);
  }

  let databaseBytes;
  try {
    databaseBytes = await loadDatabase();
  } catch (error) {
    console.error("Failed to load periodic table database", error);
    return jsonResponse({ error: "Failed to load periodic table database" }, 500);
  }
  if (databaseBytes === null) {
    return jsonResponse({ error: "Periodic table database not found" }, 404);
  }

  let database;
  try {
    const SQL = await getSqlRuntime();
    database = new SQL.Database(databaseBytes);
    database.exec("PRAGMA query_only = ON");
    const statement = database.prepare(body.sql);
    const columns = statement.getColumnNames();
    const rows = [];

    while (statement.step()) {
      if (rows.length === MAX_RESULT_ROWS) {
        statement.free();
        return jsonResponse({ error: `Query result exceeds ${MAX_RESULT_ROWS} rows` }, 400);
      }
      rows.push(statement.getAsObject());
    }
    statement.free();

    return jsonResponse({ columns, rows });
  } catch (error) {
    console.error("Periodic table SQL query failed", error);
    return jsonResponse({ error: "SQL query failed or is not read-only" }, 400);
  } finally {
    database?.close();
  }
}

export { isSingleSelect };
