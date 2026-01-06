<template>
  <div class="step-container">
    <v-card
      class="step-card"
      :class="{ 'step-card--mobile': smAndDown }"
      :elevation="smAndDown ? 0 : 10"
      :max-width="smAndDown ? '100%' : 480"
    >
      <div class="content">
        <v-icon color="primary" size="56">
          mdi-check-decagram-outline
        </v-icon>

        <h3 class="title">
          Processamento da Solicitação
        </h3>

        <v-alert
          type="success"
          variant="tonal"
          class="mb-6 py-4"
          rounded="lg"
        >
          Seu pedido foi enviado para análise final do banco.
          <br />
          <span class="font-weight-medium">
            Se aprovado, o valor será creditado em:
          </span>
          <br />
          <strong class="text-h6 text-success">
            {{ dataPrevistaFormatada }}
          </strong>
        </v-alert>

        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          rounded="lg"
        >
          Você receberá um <strong>e-mail e/ou SMS</strong> de confirmação
          ou reprovação assim que o banco finalizar a análise,
          em até <strong>2 dias úteis</strong>.
        </v-alert>

        <div class="actions">
          <v-btn
            variant="outlined"
            color="grey"
            block
            @click="store.prevStep"
          >
            Voltar
          </v-btn>

          <v-btn
            color="primary"
            block
            @click="concluir"
          >
            Concluir
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useTotemStore } from "@/stores/totem";
import { format, addDays, getDay } from "date-fns";

const { smAndDown } = useDisplay();
const store = useTotemStore();

function isDiaUtil(date) {
  const diaSemana = getDay(date);
  return diaSemana >= 1 && diaSemana <= 5;
}

const dataPrevista = computed(() => {
  let data = new Date();
  data = addDays(data, 1);

  while (!isDiaUtil(data)) {
    data = addDays(data, 1);
  }

  return data;
});

const dataPrevistaFormatada = computed(() => {
  return format(dataPrevista.value, "dd/MM/yyyy");
});

function concluir() {
  store.selecionarData(dataPrevistaFormatada.value);
}
</script>

<style scoped>
.step-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-card {
  padding: 28px;
  border-radius: 16px;
}

.step-card--mobile {
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 20px 16px;
}

.content {
  text-align: center;
}

.title {
  color: var(--v-theme-primary);
  margin: 16px 0 24px;
  font-weight: 500;
}

.actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
