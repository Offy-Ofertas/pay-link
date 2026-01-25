<template>
    <BaseCard>
        <v-icon color="primary" size="64">mdi-account-key</v-icon>

        <h4 class="mt-3 text-h5 font-weight-bold text-primary">
            Portal de Microcredito
        </h4>

        <p class="text-medium-emphasis mt-3 mb-8">
            Acesse sua conta ou realize o primeiro cadastro para solicitar o credito.
        </p>

        <BaseButton
            block
            size="large"
            class="mb-4"
            @click="store.escolherEntrada('acessar')"
        >
            Acessar
        </BaseButton>

        <BaseButton
            block
            size="large"
            variant="outlined"
            @click="store.escolherEntrada('primeiro')"
        >
            Primeiro acesso
        </BaseButton>

        <p class="text-caption mt-8 text-grey-darken-1">
            © 2025 - Microcredito
        </p>
    </BaseCard>
</template>

<script setup>
    import BaseCard from '@/components/Shared/BaseCard.vue'
    import BaseButton from '@/components/Shared/BaseButton.vue'
    import { useTotemStore } from '@/stores/totem'
    const store = useTotemStore()
</script>
