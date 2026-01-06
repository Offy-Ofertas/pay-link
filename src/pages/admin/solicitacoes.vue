<template>
  <AdminLayout>
    <div class="pa-4 pa-md-6">
      <!-- Título -->
      <h2 class="page-title mb-4">Solicitações</h2>

      <!-- Filtros -->
      <v-card class="pa-4 mb-4 rounded-lg" elevation="0">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filtroNome"
              label="Buscar por nome ou CPF"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtroStatus"
              :items="['Todos', 'PENDENTE', 'APROVADA', 'CANCELADA']"
              label="Status"
              density="compact"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- MOBILE — CARDS -->
      <div v-if="smAndDown" class="mobile-list">
        <v-card
          v-for="item in solicitacoesFiltradas"
          :key="item.id"
          class="mb-3 rounded-lg"
          elevation="1"
        >
          <div class="pa-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <strong>{{ item.nome }}</strong>
              <v-chip
                size="small"
                :color="statusColor(item.status)"
                class="text-uppercase"
              >
                {{ item.status }}
              </v-chip>
            </div>

            <div class="text-body-2 text-grey-darken-1 mb-1">
              CPF: {{ item.cpf }}
            </div>

            <div class="text-body-2 mb-1">
              Valor: <strong>{{ item.valor }}</strong>
            </div>

            <div class="text-body-2 mb-3">
              Data: {{ item.data }}
            </div>

            <v-btn
              block
              size="small"
              :color="item.status === 'PENDENTE' ? 'primary' : 'grey-darken-1'"
              :variant="item.status === 'PENDENTE' ? 'flat' : 'tonal'"
              @click="abrirDetalhes(item.id)"
            >
              <v-icon start>
                mdi-file-eye
              </v-icon>
              {{ item.status === 'PENDENTE' ? 'Validar' : 'Acessar' }}
            </v-btn>
          </div>
        </v-card>

        <v-alert
          v-if="!solicitacoesFiltradas.length"
          type="info"
          variant="tonal"
        >
          Nenhuma solicitação encontrada
        </v-alert>
      </div>

      <!-- DESKTOP — TABELA -->
      <v-data-table
        v-else
        :headers="headers"
        :items="solicitacoesFiltradas"
        class="rounded-lg elevation-1"
        density="comfortable"
        no-data-text="Nenhuma solicitação encontrada"
      >
        <template #item.status="{ item }">
          <v-chip
            size="small"
            variant="flat"
            :color="statusColor(item.status)"
            class="text-uppercase font-weight-medium"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            size="small"
            :color="item.status === 'PENDENTE' ? 'primary' : 'grey-darken-1'"
            :variant="item.status === 'PENDENTE' ? 'flat' : 'tonal'"
            @click="abrirDetalhes(item.id)"
          >
            <v-icon start>
              mdi-file-eye
            </v-icon>
            {{ item.status === 'PENDENTE' ? 'Validar' : 'Acessar' }}
          </v-btn>
        </template>
      </v-data-table>

      <!-- Snackbar -->
      <BaseSnackbar context="admin" />
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import BaseSnackbar from '@/components/Shared/BaseSnackbar.vue'
import { useAdminStore } from '@/stores/admin'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const admin = useAdminStore()
const router = useRouter()

const filtroNome = ref('')
const filtroStatus = ref('Todos')

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
  pollId = setInterval(admin.carregarSolicitacoes, 5000)
})

onUnmounted(() => {
  if (pollId) clearInterval(pollId)
})

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
  if (status === 'APROVADA') return 'success'
  if (status === 'CANCELADA') return 'error'
  if (status === 'PENDENTE') return 'warning'
  return 'grey'
}

function abrirDetalhes(id) {
  router.push(`/admin/solicitacoes/${id}/validar`)
}
</script>

<style scoped>
.page-title {
  font-weight: 700;
  color: #1a1a1a;
}

.mobile-list {
  display: flex;
  flex-direction: column;
}
</style>
