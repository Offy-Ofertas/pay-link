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

    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    font-family: 'Inter', 'Roboto', sans-serif;
}
</style>
