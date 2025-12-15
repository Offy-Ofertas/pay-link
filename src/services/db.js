const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const config = {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Erro ao comunicar com o servidor.");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

// --- Solicitações ---
export async function listSolicitacoes() {
  return request("/solicitacoes");
}

export async function saveSolicitacao(solicitacao) {
  return request("/solicitacoes", {
    method: "POST",
    body: solicitacao,
  });
}

export async function updateSolicitacaoStatus(id, data) {
  return request(`/solicitacoes/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteSolicitacao(id) {
  return request(`/solicitacoes/${id}`, {
    method: "DELETE",
  });
}

// --- Usuários ---
export async function listUsuarios() {
  return request("/usuarios");
}

export async function saveUsuario(usuario) {
  return request("/usuarios", {
    method: "POST",
    body: usuario,
  });
}

// --- Colaboradores ---
export async function listColaboradores() {
  return request("/colaboradores");
}

export async function saveColaborador(colaborador) {
  return request("/colaboradores", {
    method: "POST",
    body: colaborador,
  });
}

export async function updateColaborador(id, data) {
  return request(`/colaboradores/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteColaborador(id) {
  return request(`/colaboradores/${id}`, {
    method: "DELETE",
  });
}

export async function getColaboradorById(id) {
  try {
    return await request(`/colaboradores/${id}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function getColaboradorByCpf(cpf) {
  const somenteDigitos = (cpf || "").replace(/\D/g, "");
  const lista = await listColaboradores();
  console.log(lista);

  return lista.find(
    (colab) =>
      (colab.cpf || "").replace(/\D/g, "") === somenteDigitos &&
      colab.ativo !== false
  );
}
