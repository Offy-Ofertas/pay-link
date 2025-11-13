// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import TotemPage from "@/pages/totem/index.vue";
import AdminSolicitacoes from "@/pages/admin/solicitacoes.vue";
import SolicitacoesValidar from "@/pages/admin/solicitacoesValidar.vue";
import AdminColaboradores from "@/pages/admin/colaborador.vue";
import ColaboradorForm from "@/pages/admin/colaboradorForm.vue";
import LoginPage from "@/pages/login.vue";

const routes = [
  { path: "/", redirect: "/totem" },
  { path: "/totem", name: "Totem", component: TotemPage },

  // --- Área administrativa ---
  {
    path: "/admin",
    redirect: "/admin/solicitacoes",
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/solicitacoes",
    name: "AdminSolicitacoes",
    component: AdminSolicitacoes,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/solicitacoes/:id/validar",
    name: "SolicitacoesValidar",
    component: SolicitacoesValidar,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/colaboradores",
    name: "AdminColaboradores",
    component: AdminColaboradores,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/colaboradores/novo",
    name: "AdminColaboradorNovo",
    component: ColaboradorForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/colaboradores/:id",
    name: "AdminColaboradorEditar",
    component: ColaboradorForm,
    meta: { requiresAuth: true },
  },

  // --- Login ---
  { path: "/login", name: "Login", component: LoginPage },

  // --- Rota padrão 404 ---
  { path: "/:pathMatch(.*)*", redirect: "/totem" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "Login" };
  }

  if (to.name === "Login" && auth.isAuthenticated) {
    return { name: "AdminSolicitacoes" };
  }

  return true;
});

export default router;
