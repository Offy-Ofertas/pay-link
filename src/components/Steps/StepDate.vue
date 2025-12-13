<template>
    <div class="step-container">
        <v-card class="pa-8" elevation="10" max-width="480">
            <div class="text-center">
                <v-icon color="primary" size="60">mdi-check-decagram-outline</v-icon>
                
                <h3 class="text-primary mt-3 mb-6 font-weight-medium">
                    Processamento da Solicitação
                </h3>

                <v-alert type="success" variant="tonal" class="mb-6 py-4 text-body-1" rounded="lg">
                    Seu pedido foi enviado para análise final do banco.
                    <br>
                    <span class="font-weight-medium">Se aprovado, o valor será creditado em:</span>
                    <br>
                    <strong class="text-h6 text-success">{{ dataPrevistaFormatada }}</strong>
                </v-alert>

                <v-alert type="info" variant="tonal" class="mb-6 text-body-2" rounded="lg">
                    Você receberá um **e-mail e/ou SMS** de confirmação ou reprovação assim que o banco finalizar a análise, em até 2 dias úteis.
                </v-alert>

                <div class="d-flex justify-space-between mt-8">
                    <v-btn variant="outlined" color="grey" class="px-6" @click="store.prevStep">
                        Voltar
                    </v-btn>

                    <v-btn color="primary" class="px-8" @click="concluir">
                        Concluir
                    </v-btn>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { useTotemStore } from "@/stores/totem";
    import { format, addDays, getDay } from "date-fns";

    const store = useTotemStore();

    function isDiaUtil(date) {
        const diaSemana = getDay(date);
        return diaSemana >= 1 && diaSemana <= 5;
    }

    const dataPrevista = computed(() => {
        let dataCalculada = new Date();
        
        dataCalculada = addDays(dataCalculada, 1);

        while (!isDiaUtil(dataCalculada)) {
            dataCalculada = addDays(dataCalculada, 1);
        }

        return dataCalculada;
    });

    const dataPrevistaFormatada = computed(() => {
        return format(dataPrevista.value, "dd/MM/yyyy");
    });

    function concluir() {
        store.selecionarData(dataPrevistaFormatada.value); 
        
    }
</script>

<style scoped>
    .step-container {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>