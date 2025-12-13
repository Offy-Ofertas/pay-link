<template>
    <BaseCard>
        
        <v-icon color="primary" size="64">mdi-cash-multiple</v-icon>
        
        <h4 class="mt-3 text-h5 font-weight-bold text-primary">
            Sistema de Gestão de Adiantamentos
        </h4>
        
        <p class="text-medium-emphasis mt-3 mb-8"> Plataforma interna para a solicitação eficiente e segura de recursos financeiros.
        </p>
        
        <BaseButton 
            block 
            size="large" 
            class="mb-10" 
            @click="store.nextStep()"
        >
            Acessar Sistema
        </BaseButton>
        
        <p class="text-caption mt-8 text-grey-darken-1">
            © 2025 - Todos os direitos reservados
        </p>
    </BaseCard>
</template>

<script setup>
    import BaseCard from '@/components/Shared/BaseCard.vue'
    import BaseButton from '@/components/Shared/BaseButton.vue'
    import { useTotemStore } from '@/stores/totem'
    const store = useTotemStore()
</script>