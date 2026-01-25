<template>
  <BaseCard>
    <div class="text-center pb-4">
      <v-icon color="primary" size="64">mdi-clipboard-check</v-icon>
      <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
        Analise de elegibilidade
      </h3>
      <p class="text-subtitle-1 text-medium-emphasis">
        Verificamos seus criterios com base nos dados do RH.
      </p>
    </div>

    <v-alert
      v-if="store.elegibilidade.elegivel"
      type="success"
      variant="tonal"
      class="mb-6"
      rounded="lg"
    >
      Voce esta apto para solicitar o microcredito.
    </v-alert>

    <v-alert
      v-else
      type="error"
      variant="tonal"
      class="mb-6"
      rounded="lg"
    >
      Nao foi possivel liberar a solicitacao.
    </v-alert>

    <v-sheet
      v-if="!store.elegibilidade.elegivel"
      color="grey-lighten-5"
      rounded="lg"
      class="pa-4 mb-6 text-left"
    >
      <h4 class="text-subtitle-1 font-weight-bold mb-2">Motivos</h4>
      <ul class="motivos">
        <li v-for="(motivo, idx) in store.elegibilidade.motivos" :key="idx">
          {{ motivo }}
        </li>
      </ul>
    </v-sheet>

    <div class="actions d-flex flex-wrap justify-center" style="gap: 16px;">
      <v-btn
        variant="outlined"
        color="grey-darken-1"
        rounded="lg"
        size="large"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.resetarFluxo()"
      >
        Encerrar
      </v-btn>

      <v-btn
        v-if="store.elegibilidade.elegivel"
        color="primary"
        rounded="lg"
        size="large"
        elevation="3"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.nextStep()"
      >
        Continuar
      </v-btn>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();
</script>

<style scoped>
.motivos {
  margin: 0;
  padding-left: 18px;
  color: #374151;
}
</style>
