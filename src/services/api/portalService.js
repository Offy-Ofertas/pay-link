import {
  listColaboradores,
  saveColaborador,
  updateColaborador,
} from "@/services/db";

function normalizarLogin(login) {
  return String(login || "").trim().toLowerCase();
}

function normalizarCpf(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

export async function listarColaboradoresPortal() {
  return listColaboradores();
}

export async function buscarColaboradorPortalPorCpf(cpf) {
  const cpfLimpo = normalizarCpf(cpf);
  if (!cpfLimpo) return null;
  const lista = await listarColaboradoresPortal();
  const encontrados = Array.isArray(lista) ? lista : [];
  return (
    encontrados.find((item) => normalizarCpf(item.cpf) === cpfLimpo) || null
  );
}

export async function buscarColaboradorPortalPorLogin(login) {
  const loginLimpo = normalizarLogin(login);
  if (!loginLimpo) return null;
  const lista = await listarColaboradoresPortal();
  const encontrados = Array.isArray(lista) ? lista : [];
  return (
    encontrados.find(
      (item) => normalizarLogin(item.login) === loginLimpo
    ) || null
  );
}

export async function criarColaboradorPortal(payload) {
  return saveColaborador(normalizarPayload(payload));
}

export async function atualizarColaboradorPortal(id, payload) {
  return updateColaborador(id, normalizarPayload(payload));
}

function normalizarPayload(payload) {
  if (!payload) return payload;
  const {
    dataNascimento,
    contaSalario,
    menorAprendiz,
    mesesEmpresa,
    avisoPrevio,
    aptoEmprestimo,
    senhaProvisoria,
    criadoEm,
    atualizadoEm,
    ...resto
  } = payload;

  return {
    ...resto,
    data_nascimento: payload.data_nascimento ?? dataNascimento,
    conta_salario: payload.conta_salario ?? contaSalario,
    menor_aprendiz: payload.menor_aprendiz ?? menorAprendiz,
    meses_empresa: payload.meses_empresa ?? mesesEmpresa,
    aviso_previo: payload.aviso_previo ?? avisoPrevio,
    apto_emprestimo: payload.apto_emprestimo ?? aptoEmprestimo,
    senha_provisoria: payload.senha_provisoria ?? senhaProvisoria,
    criado_em: payload.criado_em ?? criadoEm,
    atualizado_em: payload.atualizado_em ?? atualizadoEm,
  };
}
