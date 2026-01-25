<template>
  <BaseCard>
    <div class="text-center pb-4">
      <v-icon color="primary" size="64">mdi-file-check</v-icon>
      <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
        Confirmar solicitacao
      </h3>
      <p class="text-subtitle-1 text-medium-emphasis">
        Revise os valores antes de enviar para o RH.
      </p>
    </div>

    <v-sheet class="info-box" color="grey-lighten-5" rounded="lg">
      <div class="info-item">
        <span class="label">Valor solicitado</span>
        <span class="value">R$ {{ formatarMoeda(store.solicitacao.valorSolicitado) }}</span>
      </div>
      <div class="info-item">
        <span class="label">Acrescimo</span>
        <span class="value">15%</span>
      </div>
      <div class="info-item">
        <span class="label">Total</span>
        <span class="value">R$ {{ formatarMoeda(store.solicitacao.valorTotal) }}</span>
      </div>
      <div class="info-item">
        <span class="label">Parcelas</span>
        <span class="value">{{ store.solicitacao.parcelas }}x de R$ {{ formatarMoeda(store.solicitacao.valorParcela) }}</span>
      </div>
    </v-sheet>

    <div class="actions d-flex flex-wrap justify-center" style="gap: 16px;">
      <v-btn
        variant="outlined"
        color="grey-darken-1"
        rounded="lg"
        size="large"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.prevStep()"
      >
        Voltar
      </v-btn>

      <v-btn
        color="primary"
        rounded="lg"
        size="large"
        elevation="3"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.confirmarSolicitacao()"
      >
        Enviar solicitacao
      </v-btn>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();

function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return "-";
  return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
</script>

<style scoped>
.info-box {
  padding: 20px;
  margin-bottom: 24px;
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
