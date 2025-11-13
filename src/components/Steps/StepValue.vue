<template>
    <div class="step-container">
        <v-card class="pa-8 rounded-xl" elevation="10" max-width="480">
            <div class="text-center">
                <v-icon color="primary" size="60">mdi-cash-multiple</v-icon>
                <h3 class="text-primary mt-3 mb-6 font-weight-medium">
                    Escolha o valor desejado
                </h3>

                <v-alert type="info" variant="tonal" class="mb-6 text-body-2" rounded="lg">
                    Cada funcionário pode ter apenas uma solicitação ativa por mês.
                </v-alert>

                <!-- Botões de valor -->
                <div class="valor-lista">
                    <v-btn v-for="valor in valores" :key="valor" block height="56" class="valor-btn mb-3"
                        :color="selectedValue === valor ? 'primary' : 'grey-lighten-4'"
                        :variant="selectedValue === valor ? 'flat' : 'tonal'" @click="selectValue(valor)">
                        <span :class="[
                            'font-weight-medium',
                            selectedValue === valor ? 'text-white' : 'text-grey-darken-3'
                        ]">
                            {{ formatarValor(valor) }}
                        </span>
                    </v-btn>
                </div>

                <!-- Navegação -->
                <div class="d-flex justify-space-between mt-8">
                    <v-btn variant="outlined" color="grey" class="px-6" @click="store.prevStep">
                        Voltar
                    </v-btn>

                    <v-btn color="primary" class="px-8" :disabled="!selectedValue" @click="avancar">
                        Avançar
                    </v-btn>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    import { ref } from "vue";
    import { useTotemStore } from "@/stores/totem";

    const store = useTotemStore();
    const selectedValue = ref(null);
    const valores = [100, 200, 300];

    function selectValue(valor) {
        selectedValue.value = valor;
    }

    function formatarValor(valor) {
        return `R$ ${valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
        })}`;
    }

    function avancar() {
        if (selectedValue.value) {
            store.selecionarValor(selectedValue.value);
        }
    }
</script>

<style scoped>
    .step-container {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .valor-lista {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .valor-btn {
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        transition: all 0.2s ease-in-out;
    }
</style>
