<template>
    <BaseCard class="cpf-card">
        <div class="cpf-header">
            <v-icon color="primary" size="72">mdi-card-account-details</v-icon>
            <h3>Digite seu CPF para continuar</h3>
            <p>Usamos o CPF para localizar seus dados e garantir que apenas você continue o processo.</p>
        </div>

        <v-text-field v-model="store.cpf" placeholder="000.000.000-00" class="cpf-input mt-4" variant="solo-filled"
            rounded="lg" density="comfortable" maxlength="14" hide-details autofocus @input="maskCpf"
            prepend-inner-icon="mdi-shield-account" />

        <div class="tips-card mt-4">
            <v-icon color="primary" size="20">mdi-information</v-icon>
            <span>Somente números – se preferir, utilize o teclado numérico do totem.</span>
        </div>

        <div class="actions mt-8">
            <v-btn variant="outlined" color="grey-darken-1" rounded="lg" size="large"
                class="text-none font-weight-medium action-btn"
                @click="store.prevStep()">
                Voltar
            </v-btn>

            <v-btn color="primary" rounded="lg" size="large" elevation="3"
                class="text-none font-weight-medium action-btn"
                @click="store.validarCpf()">
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
    .cpf-card {
        padding: 32px;
    }

    .cpf-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .cpf-header h3 {
        font-size: 1.4rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-top: 8px;
    }

    .cpf-header p {
        color: #5c6b7a;
        margin: 0;
    }

    .cpf-input :deep(input) {
        text-align: center;
        font-size: 1.4rem;
        letter-spacing: 3px;
        font-weight: 600;
    }

    .tips-card {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #eef5ff;
        border-radius: 16px;
        padding: 12px 16px;
        font-size: 0.9rem;
        color: #1a2b4c;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
    }

    .action-btn {
        flex: 1;
        min-width: 150px;
    }

    .v-card {
        background: #fff;
        border-radius: 24px;
        box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.08);
    }

    h3 {
        color: #1a49ff;
    }
</style>
