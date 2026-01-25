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
          <v-col cols="12" md="4" class="d-flex justify-end">
            <v-btn color="primary" variant="tonal" @click="exportarRelatorio">
              Exportar Excel (CSV)
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
import { ref, computed, onMounted } from "vue";
import Papa from "papaparse";
import AdminLayout from "@/layouts/AdminLayout.vue";
import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";
import { useAdminStore } from "@/stores/admin";

const admin = useAdminStore();
const filtroNome = ref("");

const headers = [
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
  return admin.relatorios.filter((r) => {
    return (
      r.nome?.toLowerCase().includes(termo) || String(r.cpf || "").includes(termo)
    );
  });
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

function exportarRelatorio() {
  const linhas = relatoriosFiltrados.value.map((item) => ({
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
