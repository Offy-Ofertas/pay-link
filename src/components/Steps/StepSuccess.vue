<template>
    <div class="step-container">
        <v-card class="pa-8 rounded-xl" elevation="10" max-width="440">
            <div class="text-center">
                <!-- Ícone e título -->
                <v-icon color="success" size="64">mdi-check-circle</v-icon>
                <h3 class="text-success mt-3 mb-6 font-weight-medium">
                    Sua solicitação foi registrada com sucesso!
                </h3>

                <!-- Dados -->
                <v-sheet class="pa-5 mb-6 mx-auto" color="grey-lighten-5" rounded="lg" elevation="1" max-width="340">
                    <div class="text-start mb-3">
                        <p class="mb-1 text-caption text-grey-darken-1">CPF</p>
                        <p class="font-weight-medium">{{ store.cpf }}</p>
                    </div>

                    <div class="text-start mb-3">
                        <p class="mb-1 text-caption text-grey-darken-1">Valor</p>
                        <p class="font-weight-medium">R$ {{ store.valor }},00</p>
                    </div>

                    <div class="text-start">
                        <p class="mb-1 text-caption text-grey-darken-1">Data</p>
                        <p class="font-weight-medium">{{ store.data }}</p>
                    </div>
                </v-sheet>

                <!-- Alerta -->
                <v-alert type="info" variant="tonal" class="mb-6 text-body-2 d-flex align-center justify-center"
                    rounded="lg">
                    <v-icon size="18" color="primary" class="mr-2">mdi-whatsapp</v-icon>
                    Você receberá uma mensagem no WhatsApp com a confirmação.
                </v-alert>

                <!-- Botão -->
                <v-btn color="primary" class="px-10" @click="voltarInicio">
                    Concluir
                </v-btn>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    import { onMounted, onUnmounted } from "vue";
    import { useTotemStore } from "@/stores/totem";

    const store = useTotemStore();
    let timer = null;

    // Se clicar em concluir → volta na hora
    function voltarInicio() {
        clearTimeout(timer);
        store.resetarFluxo();
    }

    // Se não clicar → volta sozinho após 6 segundos
    onMounted(() => {
        timer = setTimeout(() => {
            store.resetarFluxo();
        }, 6000);
    });

    onUnmounted(() => {
        clearTimeout(timer);
    });
</script>

<style scoped>
    .step-container {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
