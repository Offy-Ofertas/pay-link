<!-- src/pages/login.vue -->
<template>
    <DefaultLayout>
        <v-container class="login-page" fluid>
            <v-card class="login-card" elevation="12">
                <v-row class="ma-0" no-gutters>
                    <v-col cols="12" md="6" class="hero-col d-none d-md-flex">
                        <div class="hero-content">
                            <v-chip color="white" text-color="primary" class="mb-6" variant="elevated">
                                <v-icon start size="20">mdi-shield-lock</v-icon>
                                Acesso seguro
                            </v-chip>
                            <h2>Portal Administrativo</h2>
                            <p class="mb-8">
                                Acompanhe e valide solicitações de adiantamento em um painel moderno,
                                rápido e preparado para o time de RH.
                            </p>
                            <ul class="hero-list">
                                <li>
                                    <v-icon size="20">mdi-check-circle</v-icon>
                                    Alertas em tempo real
                                </li>
                                <li>
                                    <v-icon size="20">mdi-check-circle</v-icon>
                                    Histórico de validações
                                </li>
                                <li>
                                    <v-icon size="20">mdi-check-circle</v-icon>
                                    Dados protegidos
                                </li>
                            </ul>
                        </div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <div class="form-wrapper">
                            <div class="text-center mb-7">
                                <v-avatar color="primary" size="60" class="mb-3">
                                    <v-icon color="white" size="32">mdi-account-group</v-icon>
                                </v-avatar>
                                <h1>Bem-vindo de volta</h1>
                                <p>Entre com suas credenciais para acessar o painel administrativo.</p>
                            </div>

                            <v-btn-toggle v-model="modo" mandatory class="tabs-toggle mb-6" color="primary"
                                divided>
                                <v-btn value="login" class="text-none font-weight-medium">
                                    Entrar
                                </v-btn>
                                <v-btn value="cadastro" class="text-none font-weight-medium">
                                    Criar acesso
                                </v-btn>
                            </v-btn-toggle>

                            <div v-if="modo === 'login'">
                                <v-form @submit.prevent="handleLogin" class="d-flex flex-column ga-4">
                                    <v-text-field v-model="username" label="Usuário" variant="solo-filled" rounded="lg"
                                        prepend-inner-icon="mdi-account" density="comfortable"
                                        placeholder="nome.sobrenome@empresa.com" hide-details />

                                    <v-text-field v-model="password" :type="mostrarSenhaLogin ? 'text' : 'password'"
                                        label="Senha" variant="solo-filled" rounded="lg" density="comfortable"
                                        prepend-inner-icon="mdi-lock"
                                        :append-inner-icon="mostrarSenhaLogin ? 'mdi-eye-off' : 'mdi-eye'"
                                        @click:append-inner="toggleSenhaLogin" hide-details />

                                    <div class="d-flex align-center justify-space-between">
                                        <v-checkbox-btn v-model="lembrar" label="Lembrar acesso" color="primary" density="compact" />
                                        <v-btn variant="text" class="text-primary text-none px-0">
                                            Esqueci minha senha
                                        </v-btn>
                                    </div>

                                    <BaseButton :disabled="!podeEntrar || autenticando" :loading="autenticando"
                                        @click="handleLogin">
                                        Entrar no painel
                                    </BaseButton>
                                </v-form>

                                <v-alert v-if="erro" type="error" class="mt-4" border="start" border-color="error"
                                    variant="tonal" closable @click:close="erro = ''">
                                    {{ erro }}
                                </v-alert>
                            </div>

                            <div v-else>
                                <v-form @submit.prevent="cadastrarUsuario" class="d-flex flex-column ga-4">
                                    <v-text-field v-model="novoNome" label="Nome completo" variant="solo-filled" rounded="lg"
                                        prepend-inner-icon="mdi-account" density="comfortable" hide-details />

                                    <v-text-field v-model="novoUsuario" label="Usuário" variant="solo-filled" rounded="lg"
                                        prepend-inner-icon="mdi-email" density="comfortable"
                                        placeholder="nome.sobrenome@empresa.com" hide-details />

                                    <v-text-field v-model="novaSenha" :type="mostrarSenhaCadastro ? 'text' : 'password'"
                                        label="Senha" variant="solo-filled" rounded="lg" density="comfortable"
                                        prepend-inner-icon="mdi-lock"
                                        :append-inner-icon="mostrarSenhaCadastro ? 'mdi-eye-off' : 'mdi-eye'"
                                        @click:append-inner="toggleSenhaCadastro" hide-details />

                                    <v-text-field v-model="confirmaSenha" :type="mostrarSenhaCadastro ? 'text' : 'password'"
                                        label="Confirmar senha" variant="solo-filled" rounded="lg" density="comfortable"
                                        prepend-inner-icon="mdi-lock-check" hide-details />

                                    <BaseButton :disabled="!podeCadastrar || criando" :loading="criando"
                                        color="secondary" @click="cadastrarUsuario">
                                        Criar acesso
                                    </BaseButton>
                                </v-form>

                                <v-alert v-if="cadastroSucesso" type="success" class="mt-4" border="start"
                                    border-color="success" variant="tonal" closable
                                    @click:close="cadastroSucesso = ''">
                                    {{ cadastroSucesso }}
                                </v-alert>

                                <v-alert v-if="cadastroErro" type="error" class="mt-4" border="start"
                                    border-color="error" variant="tonal" closable @click:close="cadastroErro = ''">
                                    {{ cadastroErro }}
                                </v-alert>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card>
        </v-container>
    </DefaultLayout>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import DefaultLayout from '@/layouts/DefaultLayout.vue'
    import BaseButton from '@/components/Shared/BaseButton.vue'
    import { useAuthStore } from '@/stores/auth'

    const router = useRouter()
    const auth = useAuthStore()

    const modo = ref('login')
    const username = ref('')
    const password = ref('')
    const lembrar = ref(false)
    const mostrarSenhaLogin = ref(false)
    const autenticando = ref(false)
    const erro = ref('')

    const novoNome = ref('')
    const novoUsuario = ref('')
    const novaSenha = ref('')
    const confirmaSenha = ref('')
    const mostrarSenhaCadastro = ref(false)
    const criando = ref(false)
    const cadastroErro = ref('')
    const cadastroSucesso = ref('')

    const podeEntrar = computed(() => username.value.trim() && password.value.trim())
    const podeCadastrar = computed(
        () =>
            novoNome.value.trim() &&
            novoUsuario.value.trim() &&
            novaSenha.value.trim() &&
            confirmaSenha.value.trim()
    )

    watch([username, password], () => {
        if (erro.value) erro.value = ''
    })

    watch([novoNome, novoUsuario, novaSenha, confirmaSenha], () => {
        if (cadastroErro.value) cadastroErro.value = ''
    })

    watch(modo, () => {
        erro.value = ''
        cadastroErro.value = ''
        cadastroSucesso.value = ''
    })

    function toggleSenhaLogin() {
        mostrarSenhaLogin.value = !mostrarSenhaLogin.value
    }

    function toggleSenhaCadastro() {
        mostrarSenhaCadastro.value = !mostrarSenhaCadastro.value
    }

    function limparCamposCadastro() {
        novoNome.value = ''
        novoUsuario.value = ''
        novaSenha.value = ''
        confirmaSenha.value = ''
    }

    async function handleLogin() {
        if (!podeEntrar.value || autenticando.value) return

        erro.value = ''
        autenticando.value = true

        try {
            const ok = await auth.login({
                username: username.value.trim(),
                password: password.value.trim(),
                remember: lembrar.value,
            })

            if (!ok) {
                erro.value = 'Usuário ou senha inválidos.'
                return
            }

            router.push('/admin')
        } catch (e) {
            console.error('Erro de autenticação:', e)
            erro.value = 'Não foi possível conectar. Tente novamente.'
        } finally {
            autenticando.value = false
        }
    }

    async function cadastrarUsuario() {
        if (!podeCadastrar.value || criando.value) return

        if (novaSenha.value !== confirmaSenha.value) {
            cadastroErro.value = 'As senhas não conferem.'
            return
        }

        criando.value = true
        cadastroErro.value = ''
        cadastroSucesso.value = ''

        try {
            await auth.cadastrarUsuario({
                nome: novoNome.value.trim(),
                username: novoUsuario.value.trim(),
                password: novaSenha.value.trim(),
            })
            cadastroSucesso.value = 'Usuário criado com sucesso! Utilize seus dados para entrar.'
            username.value = novoUsuario.value.trim()
            password.value = ''
            modo.value = 'login'
            limparCamposCadastro()
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error)
            cadastroErro.value = error.message || 'Não foi possível criar o usuário.'
        } finally {
            criando.value = false
        }
    }
</script>

<style scoped>
    .login-page {
        background: radial-gradient(circle at top, #e3f2fd, #e1f5fe, #e8eaf6);
        padding: 24px;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .login-card {
        max-width: 960px;
        width: 100%;
        border-radius: 28px;
        overflow: hidden;
    }

    .hero-col {
        background: linear-gradient(135deg, #1a49ff, #0d2fb8);
        color: #fff;
    }

    .hero-content {
        padding: 48px;
    }

    .hero-content h2 {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 16px;
    }

    .hero-content p {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.85);
    }

    .hero-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: #fff;
    }

    .hero-list li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
    }

    .form-wrapper {
        padding: 48px 40px;
    }

    .form-wrapper h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1a1a1a;
    }

    .form-wrapper p {
        color: #5c6b7a;
        margin: 0;
    }

    @media (max-width: 960px) {
        .form-wrapper {
            padding: 32px 24px 40px;
        }
    }
</style>
