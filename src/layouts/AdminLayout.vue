<template>
    <v-app>
        <!-- 🔹 Menu lateral -->
        <v-navigation-drawer v-model="drawer" app color="grey-lighten-5" width="240" elevation="1"
            :permanent="!$vuetify.display.smAndDown">
            <v-list nav density="comfortable">
                <v-list-item prepend-icon="mdi-file-document-outline" title="Solicitações"
                    :active="route.path === '/admin/solicitacoes'" @click="goTo('/admin/solicitacoes')" />
                <v-list-item prepend-icon="mdi-account-multiple" title="Colaboradores"
                    :active="route.path.startsWith('/admin/colaboradores')" @click="goTo('/admin/colaboradores')" />
            </v-list>
        </v-navigation-drawer>

        <!-- 🔹 Barra superior -->
        <v-app-bar app color="primary" dark elevation="1">
            <v-app-bar-nav-icon @click="drawer = !drawer" />

            <v-toolbar-title class="font-weight-bold">
                <v-icon start class="mr-2">mdi-account-group</v-icon>
                Gestão de Solicitações - RH
            </v-toolbar-title>

            <v-spacer />

            <div class="mr-4 d-flex align-center">
                <v-icon start>mdi-account-circle</v-icon>
                <span>{{ auth.user?.name || "Usuário" }}</span>
            </div>

            <v-btn icon @click="logout">
                <v-icon>mdi-logout</v-icon>
            </v-btn>
        </v-app-bar>

        <!-- 🔹 Conteúdo principal -->
        <v-main>
            <v-container fluid class="py-2 px-2">
                <slot />
            </v-container>
        </v-main>

        <!-- 🔹 Rodapé -->
        <v-footer app color="grey-lighten-4" height="48" class="text-grey text-center">
            <v-col>© 2025 Adiantamento — Todos os direitos reservados</v-col>
        </v-footer>
    </v-app>
</template>

<script setup>
    import { ref } from "vue";
    import { useRouter, useRoute } from "vue-router";
    import { useAuthStore } from "@/stores/auth";

    const drawer = ref(true);
    const router = useRouter();
    const route = useRoute();
    const auth = useAuthStore();

    function goTo(path) {
        router.push(path);
    }

    function logout() {
        auth.logout();
        router.push("/login");
    }
</script>

<style scoped>
    .v-list-item--active {
        background-color: #e3f2fd !important;
        color: #0d47a1 !important;
        font-weight: 600;
    }
</style>
