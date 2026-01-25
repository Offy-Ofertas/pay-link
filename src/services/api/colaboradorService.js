// src/services/api/colaboradorService.js
import {
  listColaboradores,
  saveColaborador,
  updateColaborador,
  deleteColaborador,
  getColaboradorById,
  getColaboradorByCpf,
} from "@/services/db";

function gerarId() {
  return `col-${Date.now()}`;
}

function normalizarData(valor) {
  if (!valor) return "";
  const date = new Date(valor);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export async function listarColaboradores() {
  return listColaboradores();
}

export async function buscarColaboradorPorId(id) {
  return getColaboradorById(id);
}

export async function buscarColaboradorPorCpf(cpf) {
  return getColaboradorByCpf(cpf);
}

export async function criarColaborador(payload) {
  if (!payload?.nome || !payload?.cpf || !payload?.cargo) {
    throw new Error("Preencha nome, CPF e cargo.");
  }

  const novo = {
    id: payload.id || gerarId(),
    nome: payload.nome,
    cpf: payload.cpf,
    cargo: payload.cargo,
    departamento: payload.departamento || "",
    email: payload.email || "",
    telefone: payload.telefone || "",
    salario: payload.salario ?? "",
    admissao: normalizarData(payload.admissao),
    demissao: payload.demissao ? normalizarData(payload.demissao) : null,
    menor_aprendiz: !!payload.menorAprendiz,
    meses_empresa: payload.mesesEmpresa ?? null,
    aviso_previo: !!payload.avisoPrevio,
    apto_emprestimo: payload.aptoEmprestimo ?? true,
    conta_salario: payload.contaSalario || "",
    data_nascimento: payload.dataNascimento || "",
  };

  await saveColaborador(novo);
  return novo;
}

export async function atualizarColaborador(id, payload) {
  if (!payload?.nome || !payload?.cpf || !payload?.cargo) {
    throw new Error("Preencha nome, CPF e cargo.");
  }

  const ativo =
    payload.ativo !== undefined ? payload.ativo : payload.isAtivo;

  const atualizado = {
    nome: payload.nome,
    cpf: payload.cpf,
    cargo: payload.cargo,
    departamento: payload.departamento || "",
    email: payload.email || "",
    telefone: payload.telefone || "",
    salario: payload.salario ?? "",
    admissao: normalizarData(payload.admissao),
    demissao: payload.demissao ? normalizarData(payload.demissao) : null,
    ativo,
    data_nascimento: payload.dataNascimento ?? payload.data_nascimento ?? "",
    conta_salario: payload.contaSalario ?? payload.conta_salario ?? "",
    menor_aprendiz: payload.menorAprendiz ?? payload.menor_aprendiz ?? false,
    meses_empresa: payload.mesesEmpresa ?? payload.meses_empresa ?? null,
    aviso_previo: payload.avisoPrevio ?? payload.aviso_previo ?? false,
    apto_emprestimo: payload.aptoEmprestimo ?? payload.apto_emprestimo ?? true,
    login: payload.login,
    senha: payload.senha,
    senha_provisoria: payload.senhaProvisoria ?? payload.senha_provisoria,
  };

  return updateColaborador(id, atualizado);
}

export async function excluirColaborador(id) {
  await deleteColaborador(id);
}
