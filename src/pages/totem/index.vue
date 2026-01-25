<template>
    <div class="totem-shell">
        <component :is="currentStep" />
        <BaseSnackbar />
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { useTotemStore } from "@/stores/totem";

    import { onMounted } from "vue";
    import { useRoute } from "vue-router";

    import StepWelcome from "@/components/Steps/StepWelcome.vue";
    import StepLogin from "@/components/Steps/StepLogin.vue";
    import StepFirstAccess from "@/components/Steps/StepFirstAccess.vue";
    import StepFirstAccessSuccess from "@/components/Steps/StepFirstAccessSuccess.vue";
    import StepPasswordChange from "@/components/Steps/StepPasswordChange.vue";
    import StepRequestStatus from "@/components/Steps/StepRequestStatus.vue";
    import StepEligibility from "@/components/Steps/StepEligibility.vue";
    import StepValue from "@/components/Steps/StepValue.vue";
    import StepConfirmRequest from "@/components/Steps/StepConfirmRequest.vue";
    import StepRequestSuccess from "@/components/Steps/StepRequestSuccess.vue";
    import BaseSnackbar from "@/components/Shared/BaseSnackbar.vue";

    const store = useTotemStore();

    const route = useRoute();
    const steps = {
        1: StepWelcome,
        2: StepLogin,
        3: StepFirstAccess,
        4: StepFirstAccessSuccess,
        5: StepPasswordChange,
        6: StepRequestStatus,
        7: StepEligibility,
        8: StepValue,
        9: StepConfirmRequest,
        10: StepRequestSuccess,
    };

    const currentStep = computed(() => steps[store.step]);

    onMounted(() => {
        if (route.query?.["primeiro-acesso"] === "1") {
            store.marcarPrimeiroAcessoEmail(true);
            store.goToStep(2);
        }
        if (route.query?.login) {
            store.login.login = String(route.query.login);
        }
    });
</script>

<style scoped>
    .totem-shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 32px 16px;
        font-family: 'Inter', 'Roboto', sans-serif;
        color: #1f2a37;
    }

    :deep(.v-card) {
        font-family: inherit;
    }
</style>
