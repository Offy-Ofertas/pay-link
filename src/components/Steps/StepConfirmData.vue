<template>
  <BaseCard>
    <div class="text-center">
      <v-icon color="primary" size="80">mdi-account-circle-outline</v-icon>
      <h3 class="mt-4 text-primary font-weight-medium">Confirme seus dados</h3>
    </div>

    <div class="info-card mt-6 pa-5">
      <div class="info-row">
        <div class="info-item">
          <span class="label">Nome</span>
          <span class="value">{{ colaborador?.nome }}</span>
        </div>
        <div class="info-item">
          <span class="label">CPF</span>
          <span class="value">{{ mascararCpf(colaborador?.cpf || store.cpf) }}</span>
        </div>
      </div>

      <div class="info-row">
        <div class="info-item">
          <span class="label">Cargo</span>
          <span class="value">{{ colaborador?.cargo }}</span>
        </div>
        <div class="info-item">
          <span class="label">Departamento</span>
          <span class="value">{{ colaborador?.departamento }}</span>
        </div>
      </div>

      <div class="info-row single">
        <div class="info-item">
          <span class="label">E-mail</span>
          <span class="value">{{ mascararEmail(colaborador?.email) }}</span>
        </div>
      </div>
    </div>

    <div class="alert-container mt-6">
      <div class="alert-icon">
        <v-icon color="primary" size="22">mdi-shield-check</v-icon>
      </div>
      <div class="alert-text">
        Para sua segurança, enviaremos um código de verificação para seu e-mail cadastrado.
      </div>
    </div>

    <div class="d-flex justify-space-between mt-8">
      <v-btn variant="outlined" color="grey-darken-1" rounded="lg" size="large"
        class="w-45 text-none font-weight-medium" @click="store.prevStep()">
        Voltar
      </v-btn>

      <v-btn color="primary" rounded="lg" size="large" elevation="3" class="w-45 text-none font-weight-medium"
        @click="store.enviarCodigo()">
        Enviar Código
      </v-btn>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";
import { computed } from "vue";

const store = useTotemStore();
const colaborador = computed(() => store.colaborador);

function mascararEmail(email) {
  if (!email) return "";
  const [nome, dominio] = email.split("@");
  return `${nome[0]}***@${dominio}`;
}

function mascararCpf(cpf) {
  if (!cpf) return "";
  const apenasNumeros = cpf.replace(/\D/g, "");
  const prefixo = apenasNumeros.substring(0, 3);
  return `${prefixo}.***.***-**`;
}
</script>

<style scoped>
.info-card {
  background-color: #f9fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 16px;
}

.info-row.single {
  justify-content: flex-start;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 3px;
}

.value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  background: #ffffff;
  padding: 6px 10px;
  border-radius: 8px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.alert-container {
  display: flex;
  align-items: flex-start;
  background: linear-gradient(90deg, #eef5ff 0%, #e6f0ff 100%);
  border-left: 4px solid #1a49ff;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.alert-icon {
  margin-right: 10px;
  margin-top: 0;
  flex-shrink: 0;
}

.alert-text {
  flex-grow: 1;
  color: #1e40af;
  font-size: 0.95rem;
  line-height: 1.4;
  font-weight: 500;
}

.w-45 {
  width: 48%;
}

@media (max-width: 600px) {
  .info-row {
    flex-direction: column;
    margin-bottom: 0;
    gap: 12px;
  }

  .info-card {
    padding: 15px;
  }

  .info-row:not(:last-child) {
    margin-bottom: 15px;
  }

  .info-row.single {
    justify-content: initial;
  }

  .w-45 {
    width: 100%;
  }

  .d-flex.justify-space-between.mt-8 {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
