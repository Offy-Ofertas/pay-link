<template>
  <BaseCard>
    <v-icon color="success" size="64">mdi-check-circle</v-icon>

    <h4 class="mt-3 text-h5 font-weight-bold text-success">
      Solicitação enviada
    </h4>

    <p class="text-medium-emphasis mt-3 mb-6">
      O RH recebeu sua solicitacao. Voce sera avisado por e-mail quando
      houver aprovacao ou recusa.
    </p>

    <v-sheet class="info-box" color="grey-lighten-5" rounded="lg">
      <div class="info-item">
        <span class="label">CPF</span>
        <span class="value">{{ store.colaboradorPortal?.cpf }}</span>
      </div>
      <div class="info-item">
        <span class="label">Valor solicitado</span>
        <span class="value">R$ {{ formatarMoeda(store.solicitacao.valorSolicitado) }}</span>
      </div>
      <div class="info-item">
        <span class="label">Total com acrescimo</span>
        <span class="value">R$ {{ formatarMoeda(store.solicitacao.valorTotal) }}</span>
      </div>
    </v-sheet>

    <BaseButton block size="large" class="mt-6" @click="store.resetarFluxo()">
      Concluir
    </BaseButton>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import BaseButton from "@/components/Shared/BaseButton.vue";
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
