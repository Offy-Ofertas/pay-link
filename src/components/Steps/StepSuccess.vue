<template>
  <div class="step-container">
    <v-card
      class="step-card"
      :class="{ 'step-card--mobile': smAndDown }"
      :elevation="smAndDown ? 0 : 10"
      :max-width="smAndDown ? '100%' : 440"
    >
      <div class="content">
        <!-- Ícone e título -->
        <v-icon color="success" size="64">
          mdi-check-circle
        </v-icon>

        <h3 class="title">
          Sua solicitação foi registrada com sucesso!
        </h3>

        <!-- Dados -->
        <v-sheet
          class="info-box"
          color="grey-lighten-5"
          rounded="lg"
          elevation="smAndDown ? 0 : 1"
          max-width="340"
        >
          <div class="info-item">
            <p class="label">CPF</p>
            <p class="value">{{ store.cpf }}</p>
          </div>

          <div class="info-item">
            <p class="label">Valor</p>
            <p class="value">R$ {{ store.valor.valor }},00</p>
          </div>

          <div class="info-item">
            <p class="label">Data</p>
            <p class="value">{{ store.data }}</p>
          </div>
        </v-sheet>

        <!-- Alerta -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          rounded="lg"
        >
          <div class="d-flex align-center justify-center">
            <v-icon size="18" color="primary" class="mr-2">
              mdi-email-outline
            </v-icon>
            Você receberá um e-mail com o link para autenticar
            e assinar o documento.
          </div>
        </v-alert>

        <!-- Botão -->
        <v-btn
          color="primary"
          block
          height="52"
          @click="voltarInicio"
        >
          Concluir
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useDisplay } from "vuetify";
import { useTotemStore } from "@/stores/totem";

const { smAndDown } = useDisplay();
const store = useTotemStore();

let timer = null;

// Clique manual
function voltarInicio() {
  clearTimeout(timer);
  store.resetarFluxo();
}

// Auto reset (totem)
onMounted(() => {
  timer = setTimeout(() => {
    store.resetarFluxo();
  }, 10000);
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<style scoped>
.step-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card padrão */
.step-card {
  padding: 28px;
  border-radius: 16px;
}

/* Mobile / Totem */
.step-card--mobile {
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 20px 16px;
}

/* Conteúdo */
.content {
  text-align: center;
}

.title {
  color: var(--v-theme-success);
  margin: 16px 0 24px;
  font-weight: 500;
}

/* Caixa de informações */
.info-box {
  padding: 20px;
  margin: 0 auto 24px;
}

.info-item {
  text-align: left;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.value {
  font-weight: 500;
}
</style>
