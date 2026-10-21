import {
  normalizePeriodicTableFields,
  readPeriodicTableRange,
} from "./periodic-table-data.js";

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_RESULT_ROWS = 500;

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

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) return null;

  const reader = request.body?.getReader();
  if (!reader) return undefined;

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
  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  });

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    return undefined;
  }
}

export async function createPeriodicTableResponse(request, database) {
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
  if (body === undefined || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ error: "Request body must be a JSON object" }, 400);
  }

  const { fields, from, to } = body;
  const requestedFields = normalizePeriodicTableFields(fields);
  if (!requestedFields) {
    return jsonResponse({ error: "A non-empty list of supported fields is required" }, 400);
  }
  if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
    return jsonResponse({
      error: `from and to must define an atomic-number range of at most ${MAX_RESULT_ROWS} elements`,
    }, 400);
  }
  if (
    from < 1 ||
    to < from ||
    to - from + 1 > MAX_RESULT_ROWS
  ) {
    return jsonResponse({
      error: `from and to must define an atomic-number range of at most ${MAX_RESULT_ROWS} elements`,
    }, 400);
  }
  if (!database || typeof database.prepare !== "function") {
    console.error("Cloudflare D1 binding DB is unavailable");
    return jsonResponse({ error: "Periodic table database is unavailable" }, 503);
  }

  try {
    const { fields: returnedFields, rows } = await readPeriodicTableRange(
      database,
      requestedFields,
      from,
      to,
    );
    if (rows.length > MAX_RESULT_ROWS) {
      return jsonResponse({ error: `Query result exceeds ${MAX_RESULT_ROWS} rows` }, 400);
    }
    return jsonResponse({
      fields: returnedFields,
      from,
      to,
      rows,
    });
  } catch (error) {
    console.error("Periodic table D1 query failed", error);
    return jsonResponse({ error: "Periodic table query failed" }, 500);
  }
}
