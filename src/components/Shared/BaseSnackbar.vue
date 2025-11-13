<template>
    <v-snackbar v-model="store.snackbar.show" :color="store.snackbar.color" timeout="3500" location="top center"
        rounded="lg">
        {{ store.snackbar.message }}
    </v-snackbar>
</template>

<script setup>
    import { useTotemStore } from '@/stores/totem'
    import { useAdminStore } from '@/stores/admin'

    const props = defineProps({
        context: {
            type: String,
            default: 'totem'
        }
    })

    let store
    if (props.context === 'admin') {
        store = useAdminStore()
    } else {
        store = useTotemStore()
    }
</script>
