<template>
    <BaseCard>
        <div class="text-center">
            <v-icon color="success" size="80">mdi-shield-check</v-icon>
            <h3 class="mt-4 text-primary font-weight-medium">Digite o código de verificação</h3>
        </div>

        <!-- Mensagem de envio -->
        <div class="success-box mt-6 pa-3 d-flex align-center justify-center">
            <v-icon color="success" class="mr-2">mdi-email-check-outline</v-icon>
            <span>
                Código enviado para <strong>{{ mascararEmail(store.colaborador?.email) }}</strong>
            </span>
        </div>

        <!-- Campo de código -->
        <v-text-field v-model="codigo" label="Insira o código de 6 dígitos" type="text" maxlength="6" class="mt-6"
            variant="outlined" hide-details density="comfortable"
            style="font-size: 1.5rem; letter-spacing: 6px; text-align: center;" />

        <!-- Link de reenvio -->
        <div class="text-center mt-3">
            <span class="text-grey-darken-1">Não recebeu o código?</span>
            <a href="#" class="reenviar-link" @click.prevent="reenviarCodigo">
                Reenviar
            </a>
        </div>

        <!-- Botões -->
        <div class="d-flex justify-space-between mt-8">
            <v-btn variant="outlined" color="grey-darken-1" rounded="lg" size="large"
                class="w-45 text-none font-weight-medium" @click="store.prevStep()">
                Voltar
            </v-btn>

            <v-btn color="primary" rounded="lg" size="large" elevation="3" class="w-45 text-none font-weight-medium"
                :disabled="codigo.length < 6" @click="validarCodigo">
                Validar Código
            </v-btn>
        </div>
    </BaseCard>
</template>

<script setup>
    import BaseCard from '@/components/Shared/BaseCard.vue'
    import { useTotemStore } from '@/stores/totem'
    import { ref } from 'vue'

    const store = useTotemStore()
    const codigo = ref('')
    function mascararEmail(email) {
        if (!email) return ''
        const [nome, dominio] = email.split('@')
        return `${nome[0]}***@${dominio}`
    }

    function validarCodigo() {
        if (codigo.value.length === 6) {
            store.validarCodigo(codigo.value)
        } else {
            alert('Digite um código válido de 6 dígitos.')
        }
    }

    function reenviarCodigo() {
        store.enviarCodigo()
    }
</script>

<style scoped>
    .success-box {
        background-color: #e8f8ee;
        color: #166534;
        border-radius: 12px;
        border-left: 4px solid #22c55e;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .reenviar-link {
        color: #1a49ff;
        font-weight: 600;
        margin-left: 4px;
        text-decoration: none;
    }

    .reenviar-link:hover {
        text-decoration: underline;
    }

    h3 {
        color: #1a49ff;
    }

    .w-45 {
        width: 48%;
    }
</style>
