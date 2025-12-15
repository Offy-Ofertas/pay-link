<!-- src/pages/admin/solicitacoesValidar.vue -->
<template>
    <AdminLayout>
        <div class="pa-6">
            <h2 class="text-h5 font-weight-bold mb-4">Validação de Solicitação</h2>

            <v-progress-linear v-if="carregando" indeterminate color="primary" class="mb-4" />

            <v-card v-if="!carregando && solicitacao" class="pa-6 rounded-lg" elevation="2">
                <v-row>
                    <v-col cols="12" md="6">
                        <h3 class="text-subtitle-1 font-weight-bold mb-2">Dados do colaborador</h3>
                        <p><strong>Nome:</strong> {{ solicitacao.nome }}</p>
                        <p><strong>CPF:</strong> {{ solicitacao.cpf }}</p>
                        <p><strong>Valor:</strong> {{ solicitacao.valor }}</p>
                        <p><strong>Data do pagamento:</strong> {{ solicitacao.data }}</p>
                        <p><strong>Solicitado em:</strong> {{ formatarDataHora(solicitacao.criado_em || solicitacao.criadoEm) }}</p>
                        <p v-if="solicitacao.processadoEm || solicitacao.processado_em"><strong>Processado em:</strong>
                            {{ formatarDataHora(solicitacao.processadoEm || solicitacao.processado_em) }}</p>
                    </v-col>

                    <v-col cols="12" md="6">
                        <h3 class="text-subtitle-1 font-weight-bold mb-2">Situação atual</h3>
                        <v-chip :color="statusColor(solicitacao.status)" variant="flat">
                            {{ solicitacao.status }}
                        </v-chip>
                    </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>

                <v-alert v-if="ehPendente" type="info" variant="tonal" class="mb-4">
                    Confirme a solicitação de adiantamento. Após validar, o colaborador será notificado via WhatsApp.
                </v-alert>

                <v-alert v-else-if="ehAprovada" type="success" variant="tonal" class="mb-4">
                    Esta solicitação foi aprovada em
                    <strong>{{ formatarDataHora(solicitacao.processadoEm || solicitacao.processado_em) }}</strong>. As informações abaixo são apenas
                    para consulta.
                </v-alert>

                <v-alert v-else-if="ehCancelada" type="warning" variant="tonal" class="mb-4">
                    Esta solicitação foi cancelada em
                    <strong>{{ formatarDataHora(solicitacao.processadoEm || solicitacao.processado_em) }}</strong>.
                    <div v-if="diasRestantesCancelada > 0" class="mt-2">
                        Faltam <strong>{{ diasRestantesCancelada }} dia(s)</strong> para que o colaborador possa fazer
                        uma nova solicitação (liberação prevista para {{ dataLiberacaoFormatada }}). Caso seja
                        necessário liberar antes, exclua esta solicitação.
                    </div>
                    <div v-else class="mt-2">
                        O período de 15 dias já foi cumprido e o colaborador pode solicitar novamente. Você pode
                        manter o registro para histórico ou excluí-lo, se desejar.
                    </div>
                </v-alert>

                <v-row v-if="ehPendente">
                    <v-col cols="12" md="6">
                        <v-btn color="success" block @click="validarSolicitacao">
                            <v-icon start>mdi-check</v-icon> Validar Solicitação
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-btn color="error" block @click="cancelarSolicitacao">
                            <v-icon start>mdi-close</v-icon> Cancelar Solicitação
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row v-else-if="ehAprovada">
                    <v-col cols="12" md="4">
                        <v-btn color="primary" block @click="voltarParaLista">
                            <v-icon start>mdi-arrow-left</v-icon> Voltar
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row v-else-if="ehCancelada" class="ga-4">
                    <v-col cols="12" md="5">
                        <v-btn color="error" block @click="abrirDialogoExclusao">
                            <v-icon start>mdi-delete</v-icon> Excluir Solicitação
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-btn variant="tonal" color="grey-darken-1" block @click="voltarParaLista">
                            <v-icon start>mdi-arrow-left</v-icon> Voltar
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>

            <v-alert v-else-if="!carregando" type="error" variant="tonal">
                Solicitação não encontrada.
            </v-alert>

            <v-dialog v-model="dialogExcluir" max-width="460">
                <v-card>
                    <v-card-title class="font-weight-bold">
                        Excluir solicitação
                    </v-card-title>
                    <v-card-text>
                        Esta ação irá apagar a solicitação de {{ nomeColaborador }} e, após isso, o colaborador poderá
                        fazer uma nova solicitação. Deseja continuar?
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="text" @click="dialogExcluir = false" :disabled="excluindo">
                            Cancelar
                        </v-btn>
                        <v-btn color="error" :loading="excluindo" @click="confirmarExclusao">
                            <v-icon start>mdi-delete</v-icon> Excluir
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <BaseSnackbar context="admin" />
    </AdminLayout>
</template>

<script setup>
    import { computed, onMounted, ref } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { useAdminStore } from "@/stores/admin";
    import AdminLayout from "@/layouts/AdminLayout.vue";
    import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";

    const route = useRoute();
    const router = useRouter();
    const admin = useAdminStore();
    const solicitacao = ref(null);
    const carregando = ref(true);
    const dialogExcluir = ref(false);
    const excluindo = ref(false);

    const statusAtual = computed(() => solicitacao.value?.status || "");
    const ehPendente = computed(() => statusAtual.value === "PENDENTE");
    const ehAprovada = computed(() => statusAtual.value === "APROVADA");
    const ehCancelada = computed(() => statusAtual.value === "CANCELADA");
    const nomeColaborador = computed(() => solicitacao.value?.nome || "o colaborador");
    const infoReaplicacao = computed(() => {
        if (!ehCancelada.value) {
            return { diasRestantes: 0, liberacao: null };
        }

        const referencia = solicitacao.value?.processado_em || solicitacao.value?.criado_em;
        if (!referencia) {
            return { diasRestantes: 0, liberacao: null };
        }

        const processada = new Date(referencia);
        if (Number.isNaN(processada.getTime())) {
            return { diasRestantes: 0, liberacao: null };
        }

        const liberacao = new Date(processada);
        liberacao.setDate(liberacao.getDate() + 15);

        const hoje = new Date();
        const diffMs = liberacao.getTime() - hoje.getTime();
        const diasRestantes = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

        return { diasRestantes, liberacao };
    });

    const diasRestantesCancelada = computed(() => infoReaplicacao.value.diasRestantes);
    const dataLiberacaoFormatada = computed(() => {
        const data = infoReaplicacao.value.liberacao;
        if (!data) return '—';
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    });

    onMounted(async () => {
        try {
            await admin.carregarSolicitacoes();
            solicitacao.value = admin.buscarSolicitacao(route.params.id);
            if (!solicitacao.value) {
                admin.showSnackbar("Solicitação não encontrada.", "error");
            }
        } catch (error) {
            console.error("Erro ao carregar solicitações:", error);
            admin.showSnackbar("Erro ao carregar solicitação.", "error");
        } finally {
            carregando.value = false;
        }
    });

    function statusColor(status) {
        switch (status) {
            case "APROVADA": return "success";
            case "CANCELADA": return "error";
            case "PENDENTE": return "warning";
            default: return "grey";
        }
    }

    function formatarDataHora(isoString) {
        if (!isoString) return "—";
        const data = new Date(isoString);
        if (isNaN(data.getTime())) return "—";
        return data.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function validarSolicitacao() {
        try {
            await admin.atualizarStatus(route.params.id, "APROVADA");
            admin.showSnackbar("Solicitação aprovada com sucesso!", "success");
            router.push("/admin/solicitacoes");
        } catch (error) {
            console.error("Erro ao aprovar solicitação:", error);
            admin.showSnackbar(
                "Não foi possível aprovar a solicitação. Tente novamente.",
                "error"
            );
        }
    }

    async function cancelarSolicitacao() {
        try {
            await admin.atualizarStatus(route.params.id, "CANCELADA");
            admin.showSnackbar("Solicitação cancelada.", "error");
            router.push("/admin/solicitacoes");
        } catch (error) {
            console.error("Erro ao cancelar solicitação:", error);
            admin.showSnackbar(
                "Não foi possível cancelar a solicitação. Tente novamente.",
                "error"
            );
        }
    }

    function voltarParaLista() {
        router.push("/admin/solicitacoes");
    }

    function abrirDialogoExclusao() {
        dialogExcluir.value = true;
    }

    async function confirmarExclusao() {
        if (!solicitacao.value) return;
        excluindo.value = true;
        try {
            await admin.excluirSolicitacao(solicitacao.value.id);
            dialogExcluir.value = false;
            router.push("/admin/solicitacoes");
        } catch (error) {
            console.error("Erro ao excluir solicitação:", error);
        } finally {
            excluindo.value = false;
        }
    }
</script>

<style scoped>
    h2 {
        color: #1a1a1a;
    }
</style>
