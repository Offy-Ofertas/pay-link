<template>
  <BaseCard>
    <v-icon color="success" size="64">mdi-email-check</v-icon>

    <h4 class="mt-3 text-h5 font-weight-bold text-success">
      Cadastro confirmado
    </h4>

    <p class="text-medium-emphasis mt-3 mb-8">
      Enviamos seu login e senha provisoria por e-mail. Acesse o link
      recebido para alterar sua senha e continuar.
    </p>

    <BaseButton block size="large" class="mb-6" @click="store.resetarFluxo()">
      Voltar ao inicio
    </BaseButton>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/components/Shared/BaseCard.vue";
import BaseButton from "@/components/Shared/BaseButton.vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();
</script>
