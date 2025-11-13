<template>
    <BaseCard>
        <v-icon color="primary" size="64">mdi-cash-multiple</v-icon>
        <h4 class="mt-4 text-primary">Totem de Adiantamento Interno</h4>
        <p class="text-medium-emphasis mt-2">
            Bem-vindo! Solicite seu adiantamento de forma rápida e segura.
        </p>
        <BaseButton class="mt-6" @click="store.nextStep()">Iniciar Solicitação</BaseButton>
        <p class="text-caption mt-8 text-grey-darken-1">
            © 2025 Sua Empresa - Todos os direitos reservados
        </p>
    </BaseCard>
</template>

<script setup>
    import BaseCard from '@/components/Shared/BaseCard.vue'
    import BaseButton from '@/components/Shared/BaseButton.vue'
    import { useTotemStore } from '@/stores/totem'
    const store = useTotemStore()
</script>
