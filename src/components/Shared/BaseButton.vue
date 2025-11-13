<template>
    <v-btn :color="color" class="text-none" rounded="lg" size="large" elevation="2" block v-bind="$attrs">
        <slot />
    </v-btn>
</template>

<script setup>
    defineProps({
        color: { type: String, default: 'primary' },
    })
</script>
