<template>
  <AdminLayout>
    <div class="pa-6">

      <!-- 🔹 Título -->
      <h2 class="text-h5 font-weight-bold mb-4">Colaboradores</h2>

      <!-- 🔹 Filtros -->
      <v-card class="pa-3 mb-3 rounded-lg" elevation="0">
        <v-row dense>
          <v-col cols="12" md="8">
            <div class="d-flex flex-column flex-sm-row ga-2">
              <v-btn color="primary" @click="irParaNovo" v-if="!smAndDown">
                <v-icon start>mdi-plus</v-icon>
                Adicionar
              </v-btn>

              <v-btn
                color="secondary"
                variant="outlined"
                @click="abrirImportacao"
                v-if="!smAndDown"
              >
                <v-icon start>mdi-file-import</v-icon>
                Importar
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="filtroNome"
              label="Buscar colaborador"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card>

      <v-progress-linear
        v-if="carregando"
        indeterminate
        color="primary"
        class="mb-3"
      />

      <!-- ================= DESKTOP ================= -->
      <v-data-table
        v-if="!smAndDown"
        :headers="headers"
        :items="colaboradoresFiltrados"
        class="elevation-1 rounded-lg"
        density="comfortable"
        no-data-text="Nenhum colaborador encontrado"
      >
        <template #item.admissao="{ item }">
          {{ formatarData(item.admissao) }}
        </template>

        <template #item.demissao="{ item }">
          <v-chip v-if="item.demissao" color="grey" size="small">
            {{ formatarData(item.demissao) }}
          </v-chip>
          <span v-else>—</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-center">
            <v-btn size="small" color="primary" @click="editar(item)">
              Editar
            </v-btn>
            <v-btn size="small" color="error" @click="confirmarExclusao(item)">
              Excluir
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- ================= MOBILE ================= -->
      <div v-else class="d-flex flex-column ga-3">
        <v-card
          v-for="item in colaboradoresFiltrados"
          :key="item.id"
          class="pa-4 rounded-lg"
          elevation="1"
        >
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ item.nome }}
              </div>
              <div class="text-caption text-grey">
                {{ item.cargo }}
              </div>
            </div>

            <v-menu>
              <template #activator="{ props }">
                <v-btn icon variant="text" v-bind="props">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list density="compact">
                <v-list-item @click="editar(item)">
                  <v-list-item-title>Editar</v-list-item-title>
                </v-list-item>
                <v-list-item @click="confirmarExclusao(item)">
                  <v-list-item-title class="text-error">
                    Excluir
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <v-divider class="my-2" />

          <div class="text-caption">
            <strong>CPF:</strong> {{ item.cpf }}
          </div>
          <div class="text-caption">
            <strong>Admissão:</strong> {{ formatarData(item.admissao) }}
          </div>
          <div class="text-caption" v-if="item.demissao">
            <strong>Demissão:</strong> {{ formatarData(item.demissao) }}
          </div>
        </v-card>
      </div>
    </div>

    <!-- 🔹 FAB MOBILE -->
    <v-btn
      v-if="smAndDown"
      class="fab-btn"
      color="primary"
      icon
      @click="irParaNovo"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <!-- 🔹 Diálogo exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="400px">
      <v-card>
        <v-card-title class="font-weight-bold">
          Confirmar exclusão
        </v-card-title>
        <v-card-text>
          Deseja excluir <strong>{{ colaboradorSelecionado?.nome }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogExcluir = false">Cancelar</v-btn>
          <v-btn color="error" @click="remover">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();

const router = useRouter();
const colaboradorStore = useColaboradorStore();
const admin = useAdminStore();

const filtroNome = ref("");
const dialogExcluir = ref(false);
const colaboradorSelecionado = ref(null);

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
    admin.showSnackbar("Erro ao carregar colaboradores", "error");
  });
});

const carregando = computed(() => colaboradorStore.carregando);

const colaboradoresFiltrados = computed(() =>
  colaboradorStore.colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(filtroNome.value.toLowerCase())
  )
);

function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  return isNaN(d) ? data : d.toLocaleDateString("pt-BR");
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
  try {
    await colaboradorStore.remover(colaboradorSelecionado.value.id);
    admin.showSnackbar("Colaborador removido", "success");
  } catch {
    admin.showSnackbar("Erro ao remover colaborador", "error");
  } finally {
    dialogExcluir.value = false;
  }
}
</script>

<style scoped>
.fab-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10;
}

@media (max-width: 600px) {
  .pa-6 {
    padding: 16px !important;
  }

  h2 {
    font-size: 20px;
  }
}
</style>
