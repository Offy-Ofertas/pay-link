<template>
    <div class="step-container">
        <v-card class="pa-8 rounded-xl" elevation="10" max-width="480">
            <div class="text-center">
                <!-- Ícone e título -->
                <v-icon color="primary" size="60">mdi-calendar</v-icon>
                <h3 class="text-primary mt-3 mb-6 font-weight-medium">
                    Escolha a data de recebimento
                </h3>

                <!-- Aviso -->
                <v-alert type="info" variant="tonal" class="mb-6 text-body-2" rounded="lg">
                    O pagamento será realizado no dia útil seguinte à data escolhida.
                </v-alert>

                <!-- Lista de datas com scroll apenas no Y -->
                <div class="data-lista">
                    <v-btn v-for="data in datas" :key="data" block height="56" class="data-btn mb-3"
                        :color="selectedDate === data ? 'primary' : 'grey-lighten-4'"
                        :variant="selectedDate === data ? 'flat' : 'tonal'" @click="selectDate(data)">
                        <span :class="[
                            'font-weight-medium',
                            selectedDate === data ? 'text-white' : 'text-grey-darken-3'
                        ]">
                            {{ data }}
                        </span>
                    </v-btn>
                </div>

                <!-- Botões de navegação -->
                <div class="d-flex justify-space-between mt-8">
                    <v-btn variant="outlined" color="grey" class="px-6" @click="store.prevStep">
                        Voltar
                    </v-btn>

                    <v-btn color="primary" class="px-8" :disabled="!selectedDate" @click="confirmar">
                        Confirmar
                    </v-btn>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    import { useTotemStore } from "@/stores/totem";
    import { format } from "date-fns";

    const store = useTotemStore();
    const selectedDate = ref(null);

    // const hoje = new Date(); // produção
    const hoje = new Date();

    // Gera todas as datas úteis a partir de amanhã até o último dia útil do mês
    const datas = computed(() => {
        const lista = [];
        const dataAtual = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate()
        );
        dataAtual.setDate(dataAtual.getDate() + 1); // começa no dia seguinte

        const ultimoDiaMes = new Date(
            dataAtual.getFullYear(),
            dataAtual.getMonth() + 1,
            0
        );

        while (dataAtual <= ultimoDiaMes) {
            const diaSemana = dataAtual.getDay(); // 0 domingo ... 6 sábado
            if (diaSemana >= 1 && diaSemana <= 5) {
                lista.push(format(new Date(dataAtual), "dd/MM/yyyy"));
            }
            dataAtual.setDate(dataAtual.getDate() + 1);
        }

        return lista;
    });

    function selectDate(data) {
        selectedDate.value = data;
    }

    function confirmar() {
        if (selectedDate.value) {
            store.selecionarData(selectedDate.value); // mantém o fluxo antigo
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

    .data-lista {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-height: 240px;
        /* define altura fixa */
        overflow-y: auto;
        /* scroll só no eixo Y */
        overflow-x: hidden;
        padding-right: 4px;
    }

    .data-btn {
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease-in-out;
        width: 100%;
    }

    .data-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
</style>
