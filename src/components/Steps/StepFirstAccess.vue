<template>
  <BaseCard>
    <div class="text-center pb-4">
      <v-icon color="primary" size="64">mdi-account-plus</v-icon>
      <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
        Primeiro acesso
      </h3>
      <p class="text-subtitle-1 text-medium-emphasis">
        Informe seus dados para localizar seu cadastro no RH.
      </p>
    </div>

    <v-text-field
      v-model="store.cadastro.cpf"
      label="CPF"
      placeholder="000.000.000-00"
      variant="outlined"
      class="mb-3"
      maxlength="14"
      @input="maskCpf"
    />

    <v-text-field
      v-model="store.cadastro.nome"
      label="Nome completo"
      variant="outlined"
      class="mb-3"
      clearable
    />

    <v-text-field
      v-model="store.cadastro.email"
      label="E-mail"
      variant="outlined"
      class="mb-3"
      clearable
    />

    <v-text-field
      v-model="store.cadastro.nascimento"
      label="Data de nascimento"
      type="date"
      variant="outlined"
      class="mb-3"
    />

    <v-text-field
      v-model="store.cadastro.telefone"
      label="Telefone"
      placeholder="(00) 00000-0000"
      variant="outlined"
      class="mb-4"
      maxlength="15"
      @input="maskTelefone"
    />

    <v-checkbox
      v-model="store.cadastro.lgpd"
      label="Concordo com o uso dos meus dados para fins do credito (LGPD)."
      color="primary"
      class="mb-4"
    />

    <div class="actions d-flex flex-wrap justify-center" style="gap: 16px;">
      <v-btn
        variant="outlined"
        color="grey-darken-1"
        rounded="lg"
        size="large"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.resetarFluxo()"
      >
        Voltar
      </v-btn>

      <v-btn
        color="primary"
        rounded="lg"
        size="large"
        elevation="3"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.registrarPrimeiroAcesso()"
      >
        Confirmar cadastro
      </v-btn>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();

function maskCpf() {
  store.cadastro.cpf = store.cadastro.cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskTelefone() {
  const digits = store.cadastro.telefone.replace(/\D/g, "");
  if (digits.length <= 10) {
    store.cadastro.telefone = digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
    return;
  }
  store.cadastro.telefone = digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
</script>
