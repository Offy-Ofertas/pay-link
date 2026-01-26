<template>
  <AdminLayout>
    <div class="pa-4 pa-md-6">
      <h2 class="page-title mb-4">Relatorios de pagamento</h2>

      <v-card class="pa-4 mb-4 rounded-lg" elevation="0">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filtroNome"
              label="Buscar por nome ou CPF"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dataInicio"
              type="date"
              label="Data inicio"
              density="compact"
              clearable
              :max="dataFim || undefined"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dataFim"
              type="date"
              label="Data fim"
              density="compact"
              clearable
              :min="dataInicio || undefined"
            />
          </v-col>
          <v-col cols="12" md="2" class="d-flex justify-end">
            <v-btn color="primary" variant="tonal" @click="exportarRelatorio">
              Gerar relatorio (CSV)
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-data-table
        :headers="headers"
        :items="relatoriosFiltrados"
        class="rounded-lg elevation-1"
        density="comfortable"
        no-data-text="Nenhum relatorio encontrado"
      >
        <template #header.selecionado>
          <v-checkbox-btn
            :model-value="todosSelecionados"
            :indeterminate="algunsSelecionados"
            @update:model-value="alternarSelecionarTodos"
          />
        </template>
        <template #item.selecionado="{ item }">
          <v-checkbox-btn
            :model-value="selecionados.includes(item._id)"
            @update:model-value="() => alternarSelecao(item._id)"
          />
        </template>
        <template #item.valorTotal="{ item }">
          R$ {{ formatarMoeda(item.valor_total || item.valorTotal) }}
        </template>
        <template #item.parcelas="{ item }">
          {{ item.parcelas }}x
        </template>
        <template #item.criadoEm="{ item }">
          {{ formatarData(item.criado_em || item.criadoEm) }}
        </template>
        <template #item.previsaoPagamento="{ item }">
          {{ formatarData(item.previsao_pagamento || item.previsaoPagamento) }}
        </template>
      </v-data-table>

      <BaseSnackbar context="admin" />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Papa from "papaparse";
import AdminLayout from "@/layouts/AdminLayout.vue";
import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";
import { useAdminStore } from "@/stores/admin";

const admin = useAdminStore();
const filtroNome = ref("");
const dataInicio = ref("");
const dataFim = ref("");
const selecionados = ref([]);

const headers = [
  { title: "", key: "selecionado", sortable: false, width: 48 },
  { title: "Nome", key: "nome" },
  { title: "CPF", key: "cpf" },
  { title: "Valor total", key: "valorTotal" },
  { title: "Parcelas", key: "parcelas" },
  { title: "Criado em", key: "criadoEm" },
  { title: "Previsao pagamento", key: "previsaoPagamento" },
];

onMounted(() => {
  admin.carregarRelatorios();
});

const relatoriosFiltrados = computed(() => {
  const termo = filtroNome.value.toLowerCase();
  const inicioMs = parseDateInput(dataInicio.value, false);
  const fimMs = parseDateInput(dataFim.value, true);

  return admin.relatorios
    .filter((r) => {
      const matchTexto =
        r.nome?.toLowerCase().includes(termo) ||
        String(r.cpf || "").includes(termo);

      if (!matchTexto) return false;

      const criadoEmMs = parseRelatorioDate(r);
      if (inicioMs !== null && (criadoEmMs === null || criadoEmMs < inicioMs)) {
        return false;
      }
      if (fimMs !== null && (criadoEmMs === null || criadoEmMs > fimMs)) {
        return false;
      }
      return true;
    })
    .map((r, index) => ({
      ...r,
      _id: getRelatorioId(r, index),
    }));
});

const todosSelecionados = computed(() => {
  if (!relatoriosFiltrados.value.length) return false;
  return relatoriosFiltrados.value.every((item) =>
    selecionados.value.includes(item._id)
  );
});

const algunsSelecionados = computed(() => {
  if (!relatoriosFiltrados.value.length) return false;
  const algum = relatoriosFiltrados.value.some((item) =>
    selecionados.value.includes(item._id)
  );
  return algum && !todosSelecionados.value;
});

const relatoriosParaExportar = computed(() => {
  if (!selecionados.value.length) return relatoriosFiltrados.value;
  const ids = new Set(selecionados.value);
  return relatoriosFiltrados.value.filter((item) => ids.has(item._id));
});

watch(relatoriosFiltrados, (lista) => {
  const ids = new Set(lista.map((item) => item._id));
  selecionados.value = selecionados.value.filter((id) => ids.has(id));
});

function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return "-";
  return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function formatarData(data) {
  if (!data) return "-";
  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("pt-BR");
}

function parseDateInput(valor, endOfDay) {
  if (!valor) return null;
  const [ano, mes, dia] = valor.split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  const dt = new Date(ano, mes - 1, dia);
  if (endOfDay) {
    dt.setHours(23, 59, 59, 999);
  } else {
    dt.setHours(0, 0, 0, 0);
  }
  return dt.getTime();
}

function parseRelatorioDate(item) {
  const data = item.criado_em || item.criadoEm;
  if (!data) return null;
  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt.getTime();
}

function getRelatorioId(item, index) {
  return String(
    item.solicitacao_id ||
      item.solicitacaoId ||
      item.id ||
      item.uuid ||
      `${item.cpf || "cpf"}-${item.criado_em || item.criadoEm || index}`
  );
}

function alternarSelecao(id) {
  const idx = selecionados.value.indexOf(id);
  if (idx >= 0) {
    selecionados.value.splice(idx, 1);
  } else {
    selecionados.value.push(id);
  }
}

function alternarSelecionarTodos(valor) {
  if (valor) {
    selecionados.value = relatoriosFiltrados.value.map((item) => item._id);
  } else {
    selecionados.value = [];
  }
}

function exportarRelatorio() {
  const linhas = relatoriosParaExportar.value.map((item) => ({
    nome: item.nome || "",
    cpf: item.cpf || "",
    email: item.email || item.email_colaborador || "",
    telefone: item.telefone || "",
    valor_solicitado: item.valor_solicitado || item.valorSolicitado || item.valor,
    valor_total: item.valor_total || item.valorTotal || item.valor,
    parcelas: item.parcelas || 1,
    criado_em: item.criado_em || item.criadoEm || "",
    previsao_pagamento:
      item.previsao_pagamento || item.previsaoPagamento || "",
    solicitacao_id: item.solicitacao_id || item.solicitacaoId || "",
  }));

  const csv = Papa.unparse(linhas, {
    delimiter: ";",
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `relatorios-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.page-title {
  font-weight: 700;
  color: #1a1a1a;
}
</style>
