const MAX_DIMENSION = 2048;
const SVG_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]*$/i;

function parseDimension(value) {
  if (!/^\d+$/.test(value ?? "")) return null;

  const dimension = Number(value);
  return Number.isSafeInteger(dimension) && dimension > 0 && dimension <= MAX_DIMENSION
    ? dimension
    : null;
}

function withDimensions(svg, width, height) {
  if (!/^\uFEFF?\s*<svg\b[^>]*>/i.test(svg)) {
    throw new TypeError("SVG asset has no root svg element");
  }

  return svg.replace(/^\uFEFF?\s*<svg\b([^>]*)>/i, (_match, attributes) => {
    const withoutDimensions = attributes.replace(/\s+(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gi, "");
    return `<svg${withoutDimensions} width="${width}" height="${height}">`;
  });
}

export async function createSvgAssetResponse(request, loadSvg) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  const url = new URL(request.url);
  const nameValues = url.searchParams.getAll("name");
  const sizeValues = url.searchParams.getAll("size");
  const widthValues = url.searchParams.getAll("w");
  const heightValues = url.searchParams.getAll("h");

  if (nameValues.length !== 1 || !SVG_NAME_PATTERN.test(nameValues[0])) {
    return new Response("A valid SVG name is required", { status: 400 });
  }

  const hasSize = sizeValues.length > 0;
  const hasDimensions = widthValues.length > 0 || heightValues.length > 0;
  if (
    sizeValues.length > 1 ||
    widthValues.length > 1 ||
    heightValues.length > 1 ||
    (hasSize && hasDimensions) ||
    (!hasSize && hasDimensions && (widthValues.length !== 1 || heightValues.length !== 1))
  ) {
    return new Response("Use either size or both w and h", { status: 400 });
  }

  const width = hasSize
    ? parseDimension(sizeValues[0])
    : hasDimensions
      ? parseDimension(widthValues[0])
      : 24;
  const height = hasSize
    ? parseDimension(sizeValues[0])
    : hasDimensions
      ? parseDimension(heightValues[0])
      : 24;

  if (width === null || height === null) {
    return new Response(`Dimensions must be integers between 1 and ${MAX_DIMENSION}`, {
      status: 400,
    });
  }

  let svg;
  try {
    svg = await loadSvg(nameValues[0]);
  } catch (error) {
    console.error("Failed to load SVG asset", error);
    return new Response("Failed to load SVG asset", { status: 500 });
  }

  if (svg === null) {
    return new Response("SVG asset not found", { status: 404 });
  }

  let responseBody;
  try {
    responseBody = withDimensions(svg, width, height);
  } catch (error) {
    console.error("Invalid SVG asset", error);
    return new Response("Invalid SVG asset", { status: 500 });
  }

  return new Response(responseBody, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
