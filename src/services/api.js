export const CLOUDFLARE_API_BASE_URL = "https://mica-app-api.mica-vn.workers.dev";
const HOSTNAME = "mica.page.gd";

export function getApiBaseUrl(hostname, origin) {
  return hostname === HOSTNAME ? CLOUDFLARE_API_BASE_URL : origin;
}

export function getCloudflareApiUrl(path) {
  return new URL(path.replace(/^\/+/, ""), `${CLOUDFLARE_API_BASE_URL}/`).toString();
}

export function getApiUrl(path) {
  const baseUrl = getApiBaseUrl(window.location.hostname, window.location.origin);
  return new URL(path.replace(/^\/+/, ""), `${baseUrl}/`).toString();
}
