<template>
  <div class="step-container">
    <v-card
      class="step-card"
      :class="{ 'step-card--mobile': smAndDown }"
      :elevation="smAndDown ? 0 : 10"
      :max-width="smAndDown ? '100%' : 480"
    >
      <div class="content">
        <v-icon color="primary" size="56">mdi-cash-multiple</v-icon>

        <h3 class="title">
          Escolha o valor desejado
        </h3>

        <v-alert type="info" variant="tonal" class="mb-6" rounded="lg">
          Você pode solicitar entre
          <strong>R$ {{ minValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</strong>
          e
          <strong>R$ {{ maxValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</strong>.
        </v-alert>

        <v-text-field
          v-model="valorInput"
          label="Valor da Solicitação"
          :placeholder="formatarValor(minValor)"
          variant="outlined"
          prepend-inner-icon="mdi-currency-usd"
          :rules="[regrasValor]"
          :disabled="maxValor < minValor"
          @input="maskValue"
          class="mb-6"
        />

        <v-alert
          v-if="!isValorValido && valorInput"
          type="error"
          variant="tonal"
          class="mb-6"
          rounded="lg"
        >
          O valor deve estar entre
          R$ {{ minValor.toLocaleString('pt-BR') }}
          e
          R$ {{ maxValor.toLocaleString('pt-BR') }}.
        </v-alert>

        <!-- <v-alert
          v-if="isValorValido && selectedValue > 0"
          type="warning"
          variant="tonal"
          class="mb-6"
          rounded="lg"
        >
          <strong>Resumo</strong><br />
          Valor solicitado: R$ {{ formatarValorDisplay(selectedValue) }}<br />
          Taxa (10%): R$ {{ formatarValorDisplay(valorTaxa) }}<br />
          <strong>Total:</strong> R$ {{ formatarValorDisplay(valorTotalComTaxa) }}
        </v-alert> -->

        <div v-if="isValorValido && selectedValue" class="mt-6">
          <div class="parcelas-title">
            <span>Escolha o número de parcelas</span>
            <v-icon
              size="small"
              color="primary"
              class="cursor-pointer"
              @click="dialogInfo = true"
            >
              mdi-information-outline
            </v-icon>
          </div>

          <v-btn
            block
            height="52"
            class="mb-2"
            :color="parcelas === 1 ? 'primary' : undefined"
            :variant="parcelas === 1 ? 'flat' : 'tonal'"
            @click="parcelas = 1"
          >
            1x (R$ {{ calcularParcela(1) }})
          </v-btn>

          <v-btn
            block
            height="52"
            :color="parcelas === 2 ? 'primary' : undefined"
            :variant="parcelas === 2 ? 'flat' : 'tonal'"
            @click="parcelas = 2"
          >
            2x (R$ {{ calcularParcela(2) }})
          </v-btn>
        </div>

        <div class="actions">
          <v-btn
            variant="outlined"
            color="grey"
            block
            @click="store.prevStep"
          >
            Voltar
          </v-btn>

          <v-btn
            color="primary"
            block
            :disabled="!isValorValido || !parcelas"
            @click="avancar"
          >
            Avançar
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- MODAL INFO -->
    <v-dialog v-model="dialogInfo" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">
          Informação de Pagamento
        </v-card-title>
        <v-card-text class="py-5">
          O pagamento das parcelas será feito por
          <strong>desconto direto na folha</strong>.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="primary" @click="dialogInfo = false">Entendi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useDisplay } from "vuetify";
import { useTotemStore } from "@/stores/totem";
import { buscarColaboradorPorCpf } from "@/services/api/colaboradorService";

const { smAndDown } = useDisplay();
const store = useTotemStore();

const valorInput = ref("");
const parcelas = ref(null);
const dialogInfo = ref(false);

const minValor = 100;

const selectedValue = computed(() => {
  if (!valorInput.value) return 0;
  return Number(valorInput.value.replace(/\./g, "").replace(",", "."));
});

const salarioNumerico = computed(() => {
  if (!store.colaborador?.salario) return 0;
  return Number(store.colaborador.salario.replace(/[R$\.\s]/g, "").replace(",", "."));
});

const maxValor = computed(() => Math.floor(salarioNumerico.value * 0.15));

const isValorValido = computed(() => {
  return selectedValue.value >= minValor && selectedValue.value <= maxValor.value;
});

function maskValue(e) {
  let value = e.target.value.replace(/\D/g, "");
  if (!value) {
    valorInput.value = "";
    parcelas.value = null;
    return;
  }
  value = (value / 100).toFixed(2).replace(".", ",");
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  valorInput.value = value;
}

watch(selectedValue, () => {
  if (!isValorValido.value) parcelas.value = null;
});

function calcularParcela(qtd) {
  return (selectedValue.value / qtd).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
}

function formatarValor(valor) {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatarValorDisplay(valor) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function regrasValor() {
  if (!isValorValido.value) {
    return `Valor entre R$ ${minValor} e R$ ${maxValor.value}`;
  }
  return true;
}

function avancar() {
  store.selecionarValor({
    valor: selectedValue.value,
    valorBase: selectedValue.value,
    taxa: 0,
    parcelas: parcelas.value,
  });
}

onMounted(async () => {
  const cpfLimpo = store.cpf.replace(/\D/g, "");
  store.colaborador = await buscarColaboradorPorCpf(cpfLimpo);
});
</script>

<style scoped>
.step-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-card {
  padding: 28px;
  border-radius: 16px;
}

.step-card--mobile {
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 20px 16px;
}

.content {
  text-align: center;
}

.title {
  color: var(--v-theme-primary);
  margin: 16px 0 24px;
  font-weight: 500;
}

.parcelas-title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
