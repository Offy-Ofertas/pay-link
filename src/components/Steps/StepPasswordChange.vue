<template>
  <BaseCard>
    <div class="text-center pb-4">
      <v-icon color="primary" size="64">mdi-lock-reset</v-icon>
      <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
        Atualize sua senha
      </h3>
      <p class="text-subtitle-1 text-medium-emphasis">
        Defina uma nova senha para continuar no portal.
      </p>
    </div>

    <v-text-field
      v-model="store.senhaNova"
      label="Nova senha"
      type="password"
      variant="outlined"
      class="mb-3"
    />

    <v-text-field
      v-model="store.senhaConfirmacao"
      label="Confirmar senha"
      type="password"
      variant="outlined"
      class="mb-6"
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
        Cancelar
      </v-btn>

      <v-btn
        color="primary"
        rounded="lg"
        size="large"
        elevation="3"
        class="text-none font-weight-medium flex-grow-1"
        @click="store.alterarSenha()"
      >
        Atualizar senha
      </v-btn>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();
</script>
