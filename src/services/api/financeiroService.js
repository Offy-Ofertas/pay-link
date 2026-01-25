// src/services/api/financeiroService.js
import {
  saveSolicitacao,
  listSolicitacoes,
  updateSolicitacaoStatus,
  deleteSolicitacao,
} from "@/services/db";

function formatarValorNumero(valor) {
  if (typeof valor === "number") {
    return Number.isNaN(valor) ? 0 : valor;
  }
  const numero = Number(String(valor).replace(/\./g, "").replace(",", "."));
  return Number.isNaN(numero) ? 0 : numero;
}

function normalizarDataISO(dataStr) {
  if (!dataStr) return null;
  if (/\d{2}\/\d{2}\/\d{4}/.test(dataStr)) {
    const [d, m, y] = dataStr.split("/");
    return `${y}-${m}-${d}`;
  }
  const dt = new Date(dataStr);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

function extrairMesAno(data) {
  if (!data) return { mes: null, ano: null };
  if (data.includes("-")) {
    const [ano, mes] = data.split("-");
    return { mes, ano };
  }
  if (data.includes("/")) {
    const [dia, mes, ano] = data.split("/");
    return { mes, ano };
  }
  return { mes: null, ano: null };
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
  email,
  colaboradorId,
  valorSolicitado,
  valorTotal,
  taxaPercentual,
  parcelas,
  valorParcela,
  data,
  status = "PENDENTE",
}) {
  if (!cpf) {
    throw new Error("CPF é obrigatório para criar a solicitação.");
  }

  const dataBase = data || new Date().toISOString().slice(0, 10);
  const jaExiste = await verificarSolicitacaoMes(cpf, dataBase);
  if (jaExiste) {
    throw new Error("Você já possui uma solicitação registrada neste mês.");
  }

  const dataISO = normalizarDataISO(dataBase);
  if (!dataISO) {
    throw new Error("Data inválida. Use o formato dd/mm/aaaa.");
  }

  const valorNumero = formatarValorNumero(valorTotal ?? valorSolicitado);

  const solicitacao = {
    id: `sol-${Date.now()}`,
    nome: nome || "Colaborador",
    cpf,
    email: email || "",
    colaborador_id: colaboradorId || "",
    valor: valorNumero,
    valor_solicitado: formatarValorNumero(valorSolicitado),
    valor_total: valorNumero,
    taxa_percentual: typeof taxaPercentual === "number" ? taxaPercentual : 0.15,
    parcelas: parcelas || 1,
    valor_parcela: formatarValorNumero(valorParcela || valorNumero),
    data: dataISO,
    status,
    criado_em: new Date().toISOString(),
    processado_em: null,
  };

  const salvo = await saveSolicitacao(solicitacao);
  return normalizarSolicitacao(salvo || solicitacao);
}

export async function listarSolicitacoes() {
  const lista = await listSolicitacoes();
  return Array.isArray(lista) ? lista.map(normalizarSolicitacao) : [];
}

export async function buscarSolicitacaoPorId(id) {
  if (!id) return null;
  try {
    const lista = await listSolicitacoes();
    const item = Array.isArray(lista)
      ? lista.find((s) => String(s.id) === String(id))
      : null;
    return normalizarSolicitacao(item);
  } catch (error) {
    return null;
  }
}

export async function atualizarStatus(id, status) {
  const payload = {
    status,
    processado_em: new Date().toISOString(),
  };
  const atualizado = await updateSolicitacaoStatus(id, payload);
  return normalizarSolicitacao(atualizado);
}

export async function excluirSolicitacao(id) {
  return deleteSolicitacao(id);
}

function normalizarSolicitacao(raw) {
  if (!raw) return raw;
  return {
    id: raw.id,
    cpf: raw.cpf,
    nome: raw.nome,
    email: raw.email,
    colaboradorId: raw.colaborador_id || raw.colaboradorId,
    valor: raw.valor,
    valorSolicitado: raw.valor_solicitado ?? raw.valorSolicitado ?? raw.valor,
    valorTotal: raw.valor_total ?? raw.valorTotal ?? raw.valor,
    taxaPercentual: raw.taxa_percentual ?? raw.taxaPercentual ?? 0.15,
    parcelas: raw.parcelas ?? 1,
    valorParcela: raw.valor_parcela ?? raw.valorParcela ?? raw.valor,
    data: raw.data,
    status: raw.status,
    criadoEm: raw.criado_em || raw.criadoEm,
    processadoEm: raw.processado_em || raw.processadoEm,
  };
}
