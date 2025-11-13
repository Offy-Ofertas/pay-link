// src/services/api/financeiroService.js
import {
  saveSolicitacao,
  listSolicitacoes,
  updateSolicitacaoStatus,
  deleteSolicitacao,
} from "@/services/db";

function formatarValor(valor) {
  if (!valor && valor !== 0) return "R$ 0,00";
  const numero = Number(valor);
  if (Number.isNaN(numero)) return valor;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function extrairMesAno(data) {
  if (!data) return { mes: null, ano: null };
  const [dia, mes, ano] = data.split("/");
  return { mes, ano };
}

async function verificarSolicitacaoMes(cpf, data) {
  const lista = await listSolicitacoes();
  const { mes: mesNovo, ano: anoNovo } = extrairMesAno(data);
  if (!mesNovo || !anoNovo) return false;

  return lista.some((s) => {
    const { mes, ano } = extrairMesAno(s.data);
    return s.cpf === cpf && mes === mesNovo && ano === anoNovo;
  });
}

export async function criarSolicitacao({
  cpf,
  nome,
  valor,
  data,
  status = "PENDENTE",
}) {
  if (!cpf) {
    throw new Error("CPF é obrigatório para criar a solicitação.");
  }

  const jaExiste = await verificarSolicitacaoMes(cpf, data);
  if (jaExiste) {
    throw new Error("Você já possui uma solicitação registrada neste mês.");
  }

  const solicitacao = {
    id: `sol-${Date.now()}`,
    nome: nome || "Colaborador",
    cpf,
    valor: formatarValor(valor),
    data,
    status,
    criadoEm: new Date().toISOString(),
  };

  await saveSolicitacao(solicitacao);
  return solicitacao;
}

export async function listarSolicitacoes() {
  return listSolicitacoes();
}

export async function atualizarStatus(id, status) {
  const payload = {
    status,
    processadoEm: new Date().toISOString(),
  };
  return updateSolicitacaoStatus(id, payload);
}

export async function excluirSolicitacao(id) {
  return deleteSolicitacao(id);
}
