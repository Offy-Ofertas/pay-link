<template>
    <v-card class="pa-8 pa-md-10 text-center totem-card" elevation="10" rounded="0">
        <slot />
    </v-card>
</template>

<script setup></script>

<style scoped>
    .totem-card {
        max-width: 520px;
        width: 100%;
        margin: auto;
        border: 1px solid rgba(15, 23, 42, 0.05);
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
        font-family: 'Inter', 'Roboto', sans-serif;
    }
</style>