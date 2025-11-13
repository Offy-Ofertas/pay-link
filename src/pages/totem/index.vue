<template>
    <div class="totem-shell">
        <component :is="currentStep" />
        <BaseSnackbar />
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { useTotemStore } from "@/stores/totem";

    import StepWelcome from "@/components/Steps/StepWelcome.vue";
    import StepCpf from "@/components/Steps/StepCpf.vue";
    import StepConfirmData from "@/components/Steps/StepConfirmData.vue";
    import StepCodeValidation from "@/components/Steps/StepCodeValidation.vue";
    import StepValue from "@/components/Steps/StepValue.vue";
    import StepDate from "@/components/Steps/StepDate.vue";
    import StepSuccess from "@/components/Steps/StepSuccess.vue";
    import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";

    const store = useTotemStore();

    const steps = {
        1: StepWelcome,
        2: StepCpf,
        3: StepConfirmData,
        4: StepCodeValidation,
        5: StepValue,
        6: StepDate,
        7: StepSuccess,
    };

    const currentStep = computed(() => steps[store.step]);
</script>

<style scoped>
    .totem-shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 32px 16px;
        background: radial-gradient(circle at top, #f2f6ff 0%, #e5ecff 45%, #fdfdff 100%);
        font-family: 'Inter', 'Roboto', sans-serif;
        color: #1f2a37;
    }

    :deep(.v-card) {
        font-family: inherit;
    }
</style>
