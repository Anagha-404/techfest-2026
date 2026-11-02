// One place for every call to our backend.
//
// VITE_API_URL is empty by default, so requests go to "/api/..." on the same
// site: in development Vite forwards them to localhost:5000 (vite.config.js),
// and on Netlify the _redirects file forwards them to Render. Because the
// browser sees one site, the login cookie can use SameSite=Strict.
const API_URL = import.meta.env.VITE_API_URL || "";

export async function apiFetch(path, options = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    credentials: "include", // send the httpOnly login cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await res.json().catch(() => ({}));

  return { ok: res.ok, status: res.status, data };
}

// Turn a backend error reply into one readable message.
export function errorText(data) {
  if (data.errors && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join(", ");
  }
  return data.message || "Something went wrong";
}
