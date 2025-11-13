<!-- src/layouts/DefaultLayout.vue -->
<template>
    <v-app class="default-layout">
        <v-main class="default-main">
            <slot />
        </v-main>

        <v-footer class="default-footer">
            © 2025 Sua Empresa - Todos os direitos reservados
        </v-footer>
    </v-app>
</template>

<style scoped>
    .default-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f4f6fb;
    }

    .default-main {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;

    }

    .default-footer {
        justify-content: center;
        color: #5c6b7a;
        background: transparent;
    }
</style>
