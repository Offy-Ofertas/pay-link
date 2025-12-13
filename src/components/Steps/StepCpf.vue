<template>
    <BaseCard>
        <div class="text-center pb-4"> 
            <v-icon color="primary" size="64">mdi-card-account-details</v-icon> 
            
            <h3 class="text-h5 font-weight-bold mt-4 mb-2 text-primary">
                Digite seu CPF para continuar
            </h3>
            
            <p class="text-subtitle-1 text-medium-emphasis">
                Usamos o CPF para localizar seus dados e garantir a segurança do processo.
            </p>
        </div>

        <v-text-field 
            v-model="store.cpf" 
            placeholder="000.000.000-00" 
            class="cpf-input mt-6 mb-6" 
            variant="underlined" 
            rounded="0" 
            density="default" 
            maxlength="14" 
            hide-details 
            autofocus 
            @input="maskCpf"
            clearable
        />

        <div class="actions d-flex flex-wrap justify-center" style="gap: 16px;">
            <v-btn 
                variant="outlined" 
                color="grey-darken-1" 
                rounded="lg" 
                size="large"
                class="text-none font-weight-medium flex-grow-1"
                @click="store.prevStep()"
            >
                Voltar
            </v-btn>

            <v-btn 
                color="primary" 
                rounded="lg" 
                size="large" 
                elevation="3"
                :disabled="store.cpf.length !== 14"
                class="text-none font-weight-medium flex-grow-1"
                @click="store.validarCpf()"
            >
                Avançar
            </v-btn>
        </div>
    </BaseCard>
</template>

<script setup>
    import BaseCard from '@/components/Shared/BaseCard.vue'
    import { useTotemStore } from '@/stores/totem'

    const store = useTotemStore()

    function maskCpf() {
        store.cpf = store.cpf
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
</script>

<style scoped>
  
    .cpf-input :deep(input) {
        text-align: center;
        font-size: 1.8rem; 
        letter-spacing: 3px;
        font-weight: 700; 
    }

    @media (max-width: 600px) {
        .cpf-input :deep(input) {
            font-size: 1.4rem; 
            letter-spacing: 1.5px;
        }
    }
    
    .cpf-input :deep(.v-field__underline) {
        border-color: #1a49ff !important; 
        border-width: 2px !important;
    }
    
    .cpf-input :deep(.v-field) {
        padding-top: 0;
        padding-bottom: 0;
    }
</style>