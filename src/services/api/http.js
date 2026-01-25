const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function buildUrl(path, query) {
  const safePath = String(path || "").replace(/^\/+/, "");
  const url = new URL(`${API_URL}/${safePath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, query } = options;
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao comunicar com a API.");
  }

  if (response.status === 204) return null;
  return response.json();
}
