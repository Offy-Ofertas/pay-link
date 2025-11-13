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
    admissao: normalizarData(payload.admissao),
    demissao: payload.demissao ? normalizarData(payload.demissao) : null,
  };

  await saveColaborador(novo);
  return novo;
}

export async function atualizarColaborador(id, payload) {
  if (!payload?.nome || !payload?.cpf || !payload?.cargo) {
    throw new Error("Preencha nome, CPF e cargo.");
  }

  return updateColaborador(id, {
    ...payload,
    admissao: normalizarData(payload.admissao),
    demissao: payload.demissao ? normalizarData(payload.demissao) : null,
  });
}

export async function excluirColaborador(id) {
  await deleteColaborador(id);
}
