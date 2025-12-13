<template>
  <div class="step-container">
    <v-card class="pa-8 " elevation="10" max-width="480">
      <div class="text-center">
        <v-icon color="primary" size="60">mdi-cash-multiple</v-icon>

        <h3 class="text-primary mt-3 mb-6 font-weight-medium">
          Escolha o valor desejado
        </h3>

        <v-alert type="info" variant="tonal" class="mb-6 text-body-2" rounded="lg">
          Você pode solicitar entre R$ {{ minValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }} e R$ {{ maxValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}.
        </v-alert>

        <v-text-field
          v-model="valorInput"
          label="Valor da Solicitação"
          :placeholder="formatarValor(minValor)"
          variant="outlined"
          density="default"
          prepend-inner-icon="mdi-currency-usd"
          :rules="[regrasValor]"
          :disabled="maxValor < minValor"
          @input="maskValue"
          class="mb-6"
        ></v-text-field>

        <v-alert
          v-if="!isValorValido && valorInput"
          type="error"
          variant="tonal"
          class="mb-6 text-body-2"
          rounded="lg"
        >
          O valor deve estar entre R$ {{ minValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }} e R$ {{ maxValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}.
        </v-alert>
        
        <v-alert 
            v-if="isValorValido && selectedValue > 0" 
            type="warning" 
            variant="tonal" 
            class="mb-6 text-body-2" 
            rounded="lg"
        >
            Valor solicitado: R$ {{ formatarValorDisplay(selectedValue) }} 
            <br>
            Taxa (10% de Juros): R$ {{ formatarValorDisplay(valorTaxa) }}
            <br>
            **Valor Total a Pagar:** R$ {{ formatarValorDisplay(valorTotalComTaxa) }}
        </v-alert>


        <div v-if="isValorValido && selectedValue" class="mt-6">
          <div class="d-flex align-center justify-center mb-3">
              <h4 class="text-body-1 font-weight-medium mr-2">Escolha o número de parcelas</h4>
              <v-icon 
                  color="primary" 
                  size="small" 
                  @click="dialogInfo = true"
                  class="cursor-pointer"
              >
                  mdi-information-outline
              </v-icon>
          </div>

          <v-btn
            block height="50"
            class="mb-2"
            :color="parcelas === 1 ? 'primary' : ''"
            :variant="parcelas === 1 ? 'flat' : 'tonal'"
            @click="parcelas = 1"
          >
            1x (R$ {{ calcularParcela(1) }})
          </v-btn>

          <v-btn
            block height="50"
            :color="parcelas === 2 ? 'primary' : ''"
            :variant="parcelas === 2 ? 'flat' : 'tonal'"
            @click="parcelas = 2"
          >
            2x (R$ {{ calcularParcela(2) }})
          </v-btn>
        </div>

        <div class="d-flex justify-space-between mt-8">
          <v-btn variant="outlined" color="grey" class="px-6" @click="store.prevStep">
            Voltar
          </v-btn>

          <v-btn
            color="primary"
            class="px-8"
            :disabled="!isValorValido || !parcelas"
            @click="avancar"
          >
            Avançar
          </v-btn>
        </div>
      </div>
    </v-card>

    <v-dialog v-model="dialogInfo" max-width="400">
        <v-card rounded="lg">
            <v-card-title class="d-flex align-center bg-primary text-white">
                <v-icon left class="mr-2">mdi-cash-lock-open</v-icon>
                Informação de Pagamento
            </v-card-title>
            <v-card-text class="py-5 text-body-1">
                O pagamento das parcelas será feito mediante **desconto direto na sua folha de pagamento**.
                <br><br>
                A cobrança de cada parcela ocorrerá automaticamente na data de pagamento do seu salário, conforme o número de parcelas escolhido.
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="primary" variant="flat" @click="dialogInfo = false">Entendi</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTotemStore } from "@/stores/totem";
import { buscarColaboradorPorCpf } from "@/services/api/colaboradorService";

const store = useTotemStore();
const valorInput = ref(''); 
const parcelas = ref(null);
const minValor = 100; 
const percentualJuros = 0.10; 
const dialogInfo = ref(false); // Estado do modal

const selectedValue = computed(() => {
  if (!valorInput.value) return 0;
  const numericString = valorInput.value.replace(/[R$\.]/g, '').replace(',', '.');
  return Number(numericString);
});

const valorTaxa = computed(() => {
    return selectedValue.value * percentualJuros;
});


const valorTotalComTaxa = computed(() => {
    return selectedValue.value + valorTaxa.value;
});

const salarioNumerico = computed(() => {
  if (!store.colaborador?.salario) return 0;
  return Number(store.colaborador.salario.replace(/[R$\.\s]/g, '').replace(',', '.'));
});
const maxValor = computed(() => Math.floor(salarioNumerico.value * 0.15));

const isValorValido = computed(() => {
  const valor = selectedValue.value;
  return valor >= minValor && valor <= maxValor.value;
});

function maskValue(event) {
  let value = event.target.value.replace(/\D/g, ""); 

  if (!value) {
    valorInput.value = "";
    parcelas.value = null; 
    return;
  }
  
  value = (Number(value) / 100).toFixed(2).replace(".", ",");
  
  const parts = value.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  valorInput.value = `${formattedIntegerPart},${decimalPart}`;

  if (!isValorValido.value) {
    parcelas.value = null;
  }
}

watch(selectedValue, (newVal) => {
    if (newVal < minValor || newVal > maxValor.value) {
        parcelas.value = null;
    }
});


function formatarValor(valor) {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatarValorDisplay(valor) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}


function calcularParcela(qtd) {
  if (!selectedValue.value || !isValorValido.value) return "0,00";
  
  return (valorTotalComTaxa.value / qtd).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
}

function regrasValor(value) {
  if (!value) return true; 
  if (!isValorValido.value) {
    return `O valor deve ser entre R$ ${minValor.toLocaleString('pt-BR')} e R$ ${maxValor.value.toLocaleString('pt-BR')}`;
  }
  return true;
}

function avancar() {
  if (!isValorValido.value || !parcelas.value) return;

  store.selecionarValor({
    valor: valorTotalComTaxa.value, 
    valorBase: selectedValue.value, 
    taxa: valorTaxa.value,
    parcelas: parcelas.value
  });
}

onMounted(async () => {
  const cpfLimpo = store.cpf.replace(/\D/g, "");
  const colaborador = await buscarColaboradorPorCpf(cpfLimpo);
  store.colaborador = colaborador;
});
</script>

<style scoped>
.step-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cursor-pointer {
    cursor: pointer;
}
</style>