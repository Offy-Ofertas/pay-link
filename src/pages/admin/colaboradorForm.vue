<template>
    <AdminLayout>
        <div class="pa-6">
            <v-btn variant="text" class="mb-4" prepend-icon="mdi-arrow-left" @click="voltar">
                Voltar
            </v-btn>

            <v-card class="pa-6 rounded-lg form-card" elevation="2">
                <h2 class="text-h5 font-weight-bold mb-4">
                    {{ isEdit ? 'Editar Colaborador' : 'Novo Colaborador' }}
                </h2>

                <v-form ref="formRef">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.nome" label="Nome completo" prepend-inner-icon="mdi-account"
                                required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.cpf" label="CPF" prepend-inner-icon="mdi-card-account-details"
                                required @input="mascararCpf" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.cargo" label="Cargo" prepend-inner-icon="mdi-briefcase" required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.departamento" label="Departamento"
                                prepend-inner-icon="mdi-office-building" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.email" label="E-mail" prepend-inner-icon="mdi-email" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.telefone" label="Telefone" prepend-inner-icon="mdi-phone" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.admissao" label="Data de admissão" type="date"
                                prepend-inner-icon="mdi-calendar" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.demissao" label="Data de demissão" type="date"
                                prepend-inner-icon="mdi-calendar-remove" />
                        </v-col>
                    </v-row>
                </v-form>

                <div class="d-flex justify-end ga-3 mt-4">
                    <v-btn variant="text" @click="voltar">Cancelar</v-btn>
                    <v-btn color="primary" :loading="salvando" @click="salvar">
                        <v-icon start>mdi-content-save</v-icon>
                        {{ isEdit ? 'Atualizar' : 'Salvar' }}
                    </v-btn>
                </div>
            </v-card>
        </div>

        <BaseSnackbar context="admin" />
    </AdminLayout>
</template>

<script setup>
    import { ref, computed, onMounted } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import AdminLayout from "@/layouts/AdminLayout.vue";
    import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";
    import { useColaboradorStore } from "@/stores/colaborador";
    import { useAdminStore } from "@/stores/admin";

    const route = useRoute();
    const router = useRouter();
    const colaboradorStore = useColaboradorStore();
    const admin = useAdminStore();

    const formRef = ref(null);
    const salvando = ref(false);
    const form = ref({
        nome: "",
        cpf: "",
        cargo: "",
        departamento: "",
        email: "",
        telefone: "",
        admissao: "",
        demissao: "",
    });

    const isEdit = computed(() => !!route.params.id);

    onMounted(async () => {
        if (!colaboradorStore.carregado) {
            await colaboradorStore.carregarColaboradores().catch(() => {
                admin.showSnackbar("Erro ao carregar colaboradores.", "error");
            });
        }

        if (isEdit.value) {
            const existente = colaboradorStore.buscarPorId(route.params.id);
            if (!existente) {
                admin.showSnackbar("Colaborador não encontrado.", "error");
                voltar();
                return;
            }
            form.value = {
                ...existente,
                admissao: existente.admissao || "",
                demissao: existente.demissao || "",
            };
        }
    });

    async function salvar() {
        if (!form.value.nome || !form.value.cpf || !form.value.cargo) {
            admin.showSnackbar("Preencha nome, CPF e cargo.", "warning");
            return;
        }

        form.value.cpf = formatarCpf(form.value.cpf);
        if (!cpfEhValido(form.value.cpf)) {
            admin.showSnackbar("CPF inválido. Confira os números digitados.", "warning");
            return;
        }

        salvando.value = true;
        try {
            if (isEdit.value) {
                await colaboradorStore.atualizar(route.params.id, form.value);
                admin.showSnackbar("Colaborador atualizado com sucesso!", "success");
            } else {
                await colaboradorStore.criar(form.value);
                admin.showSnackbar("Colaborador cadastrado com sucesso!", "success");
            }
            voltar();
        } catch (error) {
            console.error("Erro ao salvar colaborador:", error);
            admin.showSnackbar(error?.message || "Erro ao salvar colaborador.", "error");
        } finally {
            salvando.value = false;
        }
    }

    function voltar() {
        router.push("/admin/colaboradores");
    }

    function mascararCpf() {
        form.value.cpf = formatarCpf(form.value.cpf);
    }

    function formatarCpf(valor) {
        const apenasNumeros = (valor || "").replace(/\D/g, "").slice(0, 11);
        return apenasNumeros
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    function cpfEhValido(cpf) {
        const somenteDigitos = (cpf || "").replace(/\D/g, "");
        if (somenteDigitos.length !== 11) return false;
        if (/^(\d)\1+$/.test(somenteDigitos)) return false;

        const calc = (slice) => {
            let soma = 0;
            for (let i = 0; i < slice.length; i++) {
                soma += Number(slice[i]) * (slice.length + 1 - i);
            }
            const resto = (soma * 10) % 11;
            return resto === 10 ? 0 : resto;
        };

        const primeiro = calc(somenteDigitos.slice(0, 9));
        const segundo = calc(somenteDigitos.slice(0, 10));

        return (
            primeiro === Number(somenteDigitos[9]) &&
            segundo === Number(somenteDigitos[10])
        );
    }
</script>

<style scoped>
    h2 {
        color: #1a1a1a;
    }

    .form-card {
        max-width: 960px;
        width: 100%;
        margin: 0 auto;
    }
</style>
