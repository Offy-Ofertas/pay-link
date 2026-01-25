<template>
  <BaseCard>
    <div class="text-center pb-4">
      <v-icon color="primary" size="64">mdi-login</v-icon>
      <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
        Acessar sua conta
      </h3>
      <p class="text-subtitle-1 text-medium-emphasis">
        Use o login enviado por e-mail e sua senha atual.
      </p>
    </div>

    <v-text-field
      v-model="store.login.login"
      label="Login"
      variant="outlined"
      class="mb-4"
      clearable
    />

    <v-text-field
      v-model="store.login.senha"
      label="Senha"
      type="password"
      variant="outlined"
      class="mb-6"
      clearable
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
        @click="store.loginColaborador()"
      >
        Entrar
      </v-btn>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();
</script>
