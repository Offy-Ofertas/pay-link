import { supabaseRequest } from "@/services/supabaseClient";

// --- Solicitações ---
export async function listSolicitacoes() {
  return supabaseRequest("solicitacoes", { query: { order: "criado_em.desc" } });
}

export async function saveSolicitacao(solicitacao) {
  const response = await supabaseRequest("solicitacoes", {
    method: "POST",
    body: [solicitacao],
  });
  return Array.isArray(response) ? response[0] : response;
}

export async function updateSolicitacaoStatus(id, data) {
  const response = await supabaseRequest("solicitacoes", {
    method: "PATCH",
    query: { id: `eq.${id}` },
    body: data,
  });
  return Array.isArray(response) ? response[0] : response;
}

export async function deleteSolicitacao(id) {
  return supabaseRequest("solicitacoes", {
    method: "DELETE",
    query: { id: `eq.${id}` },
  });
}

// --- Usuários ---
export async function listUsuarios() {
  return supabaseRequest("usuarios");
}

export async function saveUsuario(usuario) {
  const response = await supabaseRequest("usuarios", {
    method: "POST",
    body: [usuario],
  });
  return Array.isArray(response) ? response[0] : response;
}

// --- Colaboradores ---
export async function listColaboradores() {
  return supabaseRequest("colaboradores");
}

export async function saveColaborador(colaborador) {
  const response = await supabaseRequest("colaboradores", {
    method: "POST",
    body: [colaborador],
  });
  return Array.isArray(response) ? response[0] : response;
}

export async function updateColaborador(id, data) {
  const response = await supabaseRequest("colaboradores", {
    method: "PATCH",
    query: { id: `eq.${id}` },
    body: data,
  });
  return Array.isArray(response) ? response[0] : response;
}

export async function deleteColaborador(id) {
  return supabaseRequest("colaboradores", {
    method: "DELETE",
    query: { id: `eq.${id}` },
  });
}

export async function getColaboradorById(id) {
  try {
    const response = await supabaseRequest("colaboradores", {
      query: { id: `eq.${id}`, limit: 1 },
    });
    return Array.isArray(response) && response.length ? response[0] : null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function getColaboradorByCpf(cpf) {
  const somenteDigitos = (cpf || "").replace(/\D/g, "");
  if (!somenteDigitos) return null;

  // busca geral e filtra no front para evitar problemas de formatação
  const geral = await supabaseRequest("colaboradores", {
    query: { select: "*", limit: 1000 },
  });
  const lista = Array.isArray(geral) ? geral : [];
  const colabFallback = lista.find((c) => {
    const cpfColab = (c.cpf || "").replace(/\D/g, "");
    return cpfColab === somenteDigitos;
  });

  return colabFallback || null;
}
