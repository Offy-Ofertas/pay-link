<template>
    <AdminLayout>
        <div class="pa-6">
            <!-- 🔹 Título -->
            <h2 class="text-h5 font-weight-bold mb-4">Solicitações</h2>

            <!-- 🔹 Filtros -->
            <v-card class="pa-3 mb-4 rounded-lg" elevation="0">
                <v-row dense>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filtroNome" label="Buscar por nome ou CPF"
                            prepend-inner-icon="mdi-magnify" density="compact" hide-details clearable />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filtroStatus" :items="['Todos', 'PENDENTE', 'APROVADA', 'CANCELADA']"
                            label="Status" density="compact" hide-details />
                    </v-col>
                </v-row>
            </v-card>

            <!-- 🔹 Tabela -->
            <v-data-table :headers="headers" :items="solicitacoesFiltradas" class="elevation-1 rounded-lg"
                density="comfortable" no-data-text="Nenhuma solicitação encontrada">
                <!-- Status -->
                <template v-slot:[`item.status`]="{ item }">
                    <v-chip :color="statusColor(item.status)" variant="flat" size="small"
                        class="text-uppercase font-weight-medium">
                        {{ item.status }}
                    </v-chip>
                </template>

                <!-- Ações -->
                <template v-slot:[`item.actions`]="{ item }">
                    <div class="d-flex align-center justify-center ga-2">
                        <v-btn v-if="item.status === 'PENDENTE'" size="small" color="primary" variant="flat"
                            class="px-3" @click="abrirDetalhes(item.id)">
                            <v-icon start>mdi-file-eye</v-icon> Validar
                        </v-btn>

                        <v-btn v-else size="small" color="grey-darken-1" variant="tonal" class="px-3 text-none"
                            @click="abrirDetalhes(item.id)">
                            <v-icon start>mdi-file-eye-outline</v-icon> Acessar
                        </v-btn>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- 🔹 Snackbar -->
        <BaseSnackbar context="admin" />
    </AdminLayout>
</template>

<script setup>
    import AdminLayout from '@/layouts/AdminLayout.vue'
    import BaseSnackbar from '@/components/Shared/BaseSnackbar.vue'
    import { useAdminStore } from '@/stores/admin'
    import { ref, computed, onMounted, onUnmounted } from 'vue'
    import { useRouter } from 'vue-router'

    const admin = useAdminStore()
    const router = useRouter()

    // Filtros
    const filtroNome = ref('')
    const filtroStatus = ref('Todos')

    // Cabeçalhos
    const headers = [
        { title: 'Nome', key: 'nome' },
        { title: 'CPF', key: 'cpf' },
        { title: 'Valor', key: 'valor' },
        { title: 'Data', key: 'data' },
        { title: 'Status', key: 'status' },
        { title: 'Ações', key: 'actions', sortable: false },
    ]

    let pollId = null

    onMounted(() => {
        admin.carregarSolicitacoes()
        pollId = setInterval(() => {
            admin.carregarSolicitacoes()
        }, 5000)
    })

    onUnmounted(() => {
        if (pollId) clearInterval(pollId)
    })

    // Filtragem
    const solicitacoesFiltradas = computed(() => {
        return admin.solicitacoes.filter((s) => {
            const nomeOuCpf =
                s.nome.toLowerCase().includes(filtroNome.value.toLowerCase()) ||
                s.cpf.includes(filtroNome.value)
            const statusOk =
                filtroStatus.value === 'Todos' || s.status === filtroStatus.value
            return nomeOuCpf && statusOk
        })
    })

    function statusColor(status) {
        switch (status) {
            case 'APROVADA':
                return 'success'
            case 'CANCELADA':
                return 'error'
            case 'PENDENTE':
                return 'warning'
            default:
                return 'grey'
        }
    }

    function abrirDetalhes(id) {
        router.push(`/admin/solicitacoes/${id}/validar`)
    }
</script>

<style scoped>
    h2 {
        color: #1a1a1a;
    }
</style>
