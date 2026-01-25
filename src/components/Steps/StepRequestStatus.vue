<template>
  <BaseCard>
    <div class="text-center pb-4">
      <v-icon :color="statusColor" size="64">mdi-file-check</v-icon>
      <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
        {{ titulo }}
      </h3>
      <p class="text-subtitle-1 text-medium-emphasis">
        {{ mensagem }}
      </p>
    </div>

    <v-sheet class="info-box" color="grey-lighten-5" rounded="lg">
      <div class="info-item">
        <span class="label">Status</span>
        <span class="value">{{ statusLabel }}</span>
      </div>
      <div class="info-item">
        <span class="label">Valor solicitado</span>
        <span class="value">R$ {{ formatarMoeda(solicitacao.valorSolicitado || solicitacao.valor) }}</span>
      </div>
      <div class="info-item">
        <span class="label">Total</span>
        <span class="value">R$ {{ formatarMoeda(solicitacao.valorTotal || solicitacao.valor) }}</span>
      </div>
      <div class="info-item">
        <span class="label">Parcelas</span>
        <span class="value">{{ solicitacao.parcelas || 1 }}x</span>
      </div>
      <div class="info-item">
        <span class="label">Solicitado em</span>
        <span class="value">{{ formatarData(solicitacao.criadoEm || solicitacao.criado_em) }}</span>
      </div>
    </v-sheet>

    <v-alert v-if="isAprovada" type="info" variant="tonal" class="mt-6" rounded="lg">
      Sua solicitacao ja foi aprovada. Aguarde o fluxo finalizar para solicitar novamente.
    </v-alert>

    <v-btn block color="primary" class="mt-6" @click="store.resetarFluxo()">
      Voltar ao inicio
    </v-btn>
  </BaseCard>
</template>

<script setup>
import { computed } from "vue";
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();
const solicitacao = computed(() => store.solicitacaoAtual || {});
const status = computed(() => solicitacao.value.status || "");
const isAprovada = computed(() =>
  ["APROVADA", "VALIDADA"].includes(status.value)
);

const titulo = computed(() =>
  status.value === "PENDENTE" ? "Solicitacao em analise" : "Solicitacao aprovada"
);

const mensagem = computed(() =>
  status.value === "PENDENTE"
    ? "Voce ja possui uma solicitacao pendente. Aguarde a analise do RH."
    : "Voce ja possui uma solicitacao aprovada neste momento."
);

const statusLabel = computed(() => {
  if (status.value === "PENDENTE") return "Em analise";
  if (status.value === "APROVADA") return "Aprovada pelo RH";
  if (status.value === "VALIDADA") return "Validada pelo colaborador";
  return status.value || "-";
});

const statusColor = computed(() =>
  status.value === "PENDENTE" ? "warning" : "success"
);

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
</script>

<style scoped>
.info-box {
  padding: 20px;
  margin: 0 auto 12px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-weight: 500;
}

.label {
  color: #6b7280;
}

.value {
  color: #111827;
}
</style>
