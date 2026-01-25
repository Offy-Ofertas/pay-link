const RH_SUPABASE_URL = import.meta.env.VITE_RH_SUPABASE_URL;
const RH_SUPABASE_ANON_KEY = import.meta.env.VITE_RH_SUPABASE_ANON_KEY;

function buildHeaders(extra = {}) {
  if (!RH_SUPABASE_URL || !RH_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase RH não configurado. Defina VITE_RH_SUPABASE_URL e VITE_RH_SUPABASE_ANON_KEY."
    );
  }

  return {
    apikey: RH_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${RH_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function supabaseRhRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, query = {} } = options;
  const url = new URL(`${RH_SUPABASE_URL}/rest/v1/${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  if (!url.searchParams.has("select") && method === "GET") {
    url.searchParams.set("select", "*");
  }

  const response = await fetch(url.toString(), {
    method,
    headers: buildHeaders({ Prefer: "return=representation", ...headers }),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao comunicar com o Supabase RH.");
  }

  if (response.status === 204) return null;
  return response.json();
}
