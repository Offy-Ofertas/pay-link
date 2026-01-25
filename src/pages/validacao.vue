<template>
  <div class="validacao-shell">
    <v-card class="validacao-card" elevation="8" max-width="520">
      <v-card-title class="text-h6 font-weight-bold">
        Confirmacao de identidade
      </v-card-title>
      <v-card-text>
        <v-alert v-if="erro" type="error" variant="tonal" class="mb-4">
          {{ erro }}
        </v-alert>

        <v-alert
          v-else-if="sucesso"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          Validacao concluida. O pagamento sera realizado em ate 3 dias.
        </v-alert>

        <template v-else>
          <p class="text-body-2 mb-4">
            Informe a conta salario para confirmar sua identidade e valide seu
            rosto para concluir.
          </p>

          <v-text-field
            v-model="contaInformada"
            label="Conta salario"
            placeholder="0000-0"
            variant="outlined"
            class="mb-3"
          />

          <v-alert v-if="contaInvalida" type="warning" variant="tonal" class="mb-4">
            Conta salario nao confere com o cadastro do RH.
          </v-alert>

          <v-btn
            block
            color="primary"
            class="mb-3"
            @click="abrirFace"
          >
            Validar rosto
          </v-btn>

          <v-chip
            v-if="store.faceStatus === 'aprovado'"
            color="success"
            variant="flat"
            class="mb-4"
          >
            Rosto validado
          </v-chip>

          <v-btn
            block
            color="success"
            :disabled="!podeConfirmar"
            @click="confirmar"
          >
            Confirmar validacao
          </v-btn>
        </template>
      </v-card-text>
    </v-card>

    <FaceModal />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import FaceModal from "@/components/Shared/FaceModal.vue";
import { useTotemStore } from "@/stores/totem";
import { buscarSolicitacaoPorId, atualizarStatus } from "@/services/api/financeiroService";
import { buscarColaboradorRh } from "@/services/api/rhService";
import { buscarColaboradorPortalPorCpf } from "@/services/api/portalService";
import { criarRelatorio } from "@/services/api/relatorioService";
import { enviarEmailPagamento } from "@/services/api/emailService";

const route = useRoute();
const store = useTotemStore();

const solicitacao = ref(null);
const colaboradorRh = ref(null);
const colaboradorPortal = ref(null);
const contaInformada = ref("");
const contaInvalida = ref(false);
const erro = ref("");
const sucesso = ref(false);

const podeConfirmar = computed(() => {
  return (
    !contaInvalida.value &&
    contaInformada.value &&
    store.faceStatus === "aprovado"
  );
});

onMounted(async () => {
  store.faceStatus = "pendente";
  store.faceSnapshot = "";
  const id = route.query?.solicitacaoId;
  if (!id) {
    erro.value = "Solicitacao nao informada.";
    return;
  }

  const resposta = await buscarSolicitacaoPorId(String(id));
  if (!resposta) {
    erro.value = "Solicitacao nao encontrada.";
    return;
  }
  solicitacao.value = resposta;

  colaboradorPortal.value = await buscarColaboradorPortalPorCpf(resposta.cpf);
  if (colaboradorPortal.value) {
    store.colaboradorPortal = colaboradorPortal.value;
  }
  colaboradorRh.value = await buscarColaboradorRh({
    cpf: resposta.cpf,
  });

  if (!colaboradorRh.value) {
    erro.value = "Nao foi possivel carregar os dados do RH.";
  }
});

function abrirFace() {
  store.showFaceModal = true;
}

async function confirmar() {
  contaInvalida.value = false;
  if (!colaboradorRh.value) return;

  const contaRh = String(
    colaboradorRh.value.conta_salario || colaboradorRh.value.contaSalario || ""
  ).trim();
  const contaUser = String(contaInformada.value || "").trim();
  if (contaUser !== contaRh) {
    contaInvalida.value = true;
    return;
  }

  try {
    await atualizarStatus(solicitacao.value.id, "VALIDADA");

    const previsao = new Date();
    previsao.setDate(previsao.getDate() + 3);

    await criarRelatorio({
      id: `rel-${Date.now()}`,
      solicitacao_id: solicitacao.value.id,
      nome: solicitacao.value.nome,
      cpf: solicitacao.value.cpf,
      email: colaboradorPortal.value?.email || "",
      telefone: colaboradorPortal.value?.telefone || "",
      valor_solicitado: solicitacao.value.valorSolicitado,
      valor_total: solicitacao.value.valorTotal,
      parcelas: solicitacao.value.parcelas,
      criado_em: new Date().toISOString(),
      previsao_pagamento: previsao.toISOString().slice(0, 10),
    });

    if (colaboradorPortal.value?.email) {
      await enviarEmailPagamento({
        to: colaboradorPortal.value.email,
        nome: colaboradorPortal.value.nome,
      });
    }

    sucesso.value = true;
  } catch (error) {
    erro.value = "Nao foi possivel concluir a validacao.";
  }
}
</script>

<style scoped>
.validacao-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.validacao-card {
  width: 100%;
}
</style>
