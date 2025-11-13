<template>
    <AdminLayout>
        <div class="pa-6">
            <!-- 🔹 Título -->
            <h2 class="text-h5 font-weight-bold mb-4">Colaboradores</h2>

            <!-- 🔹 Filtros -->
            <v-card class="pa-3 mb-3 rounded-lg" elevation="0">
                <v-row dense>
                    <v-col>
                        <div class="d-flex flex-wrap align-center botao-grupo">
                            <v-btn color="primary" @click="irParaNovo">
                                <v-icon>mdi-plus</v-icon> ADICIONAR
                            </v-btn>
                            <v-btn color="secondary" variant="outlined" @click="abrirImportacao">
                                <v-icon start>mdi-file-import</v-icon>
                                Importar
                            </v-btn>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filtroNome" label="Buscar colaborador" prepend-inner-icon="mdi-magnify"
                            density="compact" hide-details clearable />
                    </v-col>
                </v-row>
            </v-card>

            <v-progress-linear v-if="carregando" indeterminate color="primary" class="mb-3" />

            <!-- 🔹 Tabela -->
            <v-data-table :headers="headers" :items="colaboradoresFiltrados" class="elevation-1 rounded-lg"
                density="comfortable" no-data-text="Nenhum colaborador encontrado">
                <!-- Status -->
                <template v-slot:[`item.admissao`]="{ item }">
                    {{ formatarData(item.admissao) }}
                </template>
                <template v-slot:[`item.demissao`]="{ item }">
                    <v-chip v-if="item.demissao" color="grey" size="small" variant="flat">
                        {{ formatarData(item.demissao) }}
                    </v-chip>
                    <span v-else>—</span>
                </template>

                <!-- Ações -->
                <template v-slot:[`item.actions`]="{ item }">
                    <div class="d-flex align-center justify-center ga-2">
                        <v-btn size="small" color="primary" variant="flat" class="px-3" @click="editar(item)">
                            <v-icon start>mdi-pencil</v-icon> Editar
                        </v-btn>

                        <v-btn size="small" color="error" variant="flat" class="px-3" @click="confirmarExclusao(item)">
                            <v-icon start>mdi-delete</v-icon> Excluir
                        </v-btn>
                    </div>
                </template>
            </v-data-table>

        </div>

        <!-- 🔹 Diálogo de confirmação -->
        <v-dialog v-model="dialogExcluir" max-width="400px">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">
                    Confirmar exclusão
                </v-card-title>
                <v-card-text>
                    Tem certeza que deseja excluir
                    <strong>{{ colaboradorSelecionado?.nome }}</strong>?
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="dialogExcluir = false">Cancelar</v-btn>
                    <v-btn color="error" @click="remover">Excluir</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 🔹 Modal de importação -->
        <v-dialog v-model="dialogImport" max-width="520px">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">
                    Importar colaboradores
                </v-card-title>
                <v-card-text>
                    <v-select v-model="formato" :items="formatos" label="Formato do arquivo" class="mb-4" />

                    <v-alert type="info" variant="tonal" class="mb-4">
                        Arquivo deve conter colunas: nome, cpf, cargo, departamento, email, telefone, admissao,
                        demissao.
                    </v-alert>

                    <v-file-input v-model="arquivo" :accept="acceptTypes" label="Selecione um arquivo" show-size
                        prepend-inner-icon="mdi-paperclip" />
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="fecharImportacao">Cancelar</v-btn>
                    <v-btn color="primary" :loading="importando" :disabled="!arquivo" @click="processarImportacao">
                        Importar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 🔹 Snackbar -->
        <BaseSnackbar context="admin" />
    </AdminLayout>
</template>

<script setup>
    import AdminLayout from "@/layouts/AdminLayout.vue";
    import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";
    import { ref, computed, onMounted } from "vue";
    import { useRouter } from "vue-router";
    import { useColaboradorStore } from "@/stores/colaborador";
    import { useAdminStore } from "@/stores/admin";
    import Papa from "papaparse";

    const router = useRouter();
    const colaboradorStore = useColaboradorStore();
    const admin = useAdminStore();

    const filtroNome = ref("");
    const dialogExcluir = ref(false);
    const dialogImport = ref(false);
    const colaboradorSelecionado = ref(null);
    const arquivo = ref(null);
    const formato = ref("csv");
    const importando = ref(false);
    const formatos = [
        { title: "CSV", value: "csv" },
        { title: "JSON", value: "json" },
    ];

    const headers = [
        { title: "Nome", key: "nome" },
        { title: "CPF", key: "cpf" },
        { title: "Cargo", key: "cargo" },
        { title: "Admissão", key: "admissao" },
        { title: "Demissão", key: "demissao" },
        { title: "Ações", key: "actions", sortable: false },
    ];

    onMounted(() => {
        colaboradorStore.carregarColaboradores().catch(() => {
            admin.showSnackbar("Erro ao carregar colaboradores.", "error");
        });
    });

    const carregando = computed(() => colaboradorStore.carregando);

    const colaboradoresFiltrados = computed(() => {
        return colaboradorStore.colaboradores.filter((c) =>
            c.nome.toLowerCase().includes(filtroNome.value.toLowerCase())
        );
    });

    function formatarData(data) {
        if (!data) return "";
        const d = new Date(data);
        return Number.isNaN(d.getTime())
            ? data
            : d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
    }

    function irParaNovo() {
        router.push("/admin/colaboradores/novo");
    }

    function editar(item) {
        router.push(`/admin/colaboradores/${item.id}`);
    }

    function confirmarExclusao(item) {
        colaboradorSelecionado.value = item;
        dialogExcluir.value = true;
    }

    async function remover() {
        if (!colaboradorSelecionado.value) return;
        try {
            await colaboradorStore.remover(colaboradorSelecionado.value.id);
            admin.showSnackbar("Colaborador removido com sucesso.", "success");
        } catch (error) {
            console.error("Erro ao remover colaborador:", error);
            admin.showSnackbar("Não foi possível remover o colaborador.", "error");
        } finally {
            dialogExcluir.value = false;
        }
    }

    function abrirImportacao() {
        dialogImport.value = true;
    }

    function fecharImportacao() {
        dialogImport.value = false;
        arquivo.value = null;
        formato.value = "csv";
    }

    const acceptTypes = computed(() =>
        formato.value === "json" ? "application/json,.json" : ".csv,text/csv"
    );

    async function processarImportacao() {
        if (!arquivo.value) return;
        importando.value = true;
        try {
            const file = Array.isArray(arquivo.value) ? arquivo.value[0] : arquivo.value;
            const registros =
                formato.value === "json" ? await lerJson(file) : await lerCsv(file);

            let importados = 0;
            for (const registro of registros) {
                if (!registro.nome || !registro.cpf || !registro.cargo) continue;
                try {
                    await colaboradorStore.criar({
                        nome: registro.nome,
                        cpf: registro.cpf,
                        cargo: registro.cargo,
                        departamento: registro.departamento,
                        email: registro.email,
                        telefone: registro.telefone,
                        admissao: normalizarData(registro.admissao),
                        demissao: normalizarData(registro.demissao),
                    });
                    importados++;
                } catch (error) {
                    console.warn("Erro ao importar registro", registro, error);
                }
            }

            admin.showSnackbar(
                importados
                    ? `${importados} colaboradores importados com sucesso.`
                    : "Nenhum colaborador válido foi importado.",
                importados ? "success" : "warning"
            );
            fecharImportacao();
        } catch (error) {
            console.error("Erro na importação:", error);
            admin.showSnackbar("Erro ao importar arquivo.", "error");
        } finally {
            importando.value = false;
        }
    }

    function lerJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const json = JSON.parse(reader.result);
                    resolve(Array.isArray(json) ? json : []);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    function lerCsv(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: reject,
            });
        });
    }

    function normalizarData(valor) {
        if (!valor) return "";
        const data = new Date(valor);
        return Number.isNaN(data.getTime()) ? "" : data.toISOString().slice(0, 10);
    }
</script>

<style scoped>
    h2 {
        color: #1a1a1a;
    }

    .fab-btn {
        position: fixed;
        bottom: 32px;
        right: 32px;
    }

    .botao-grupo {
        gap: 12px;
    }
</style>
