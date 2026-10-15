// Centralized API base URL — single source of truth for the admin panel.
//
// Previously every page defined its own copy of this constant, so a
// misconfigured VITE_API_URL (e.g. missing the trailing "/api" on the
// deployed host) silently broke some pages but not others. This normalizes
// whatever is provided so that mistake can't happen again.

const RAW_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function normalize(url) {
  let clean = url.replace(/\/+$/, "");

  if (!/\/api$/.test(clean)) {
    clean = `${clean}/api`;
  }

  return clean;
}

export const API_URL = normalize(RAW_URL);

export default API_URL;
