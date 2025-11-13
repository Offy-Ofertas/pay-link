// src/stores/auth.js
import { defineStore } from "pinia";
import { listUsuarios, saveUsuario } from "@/services/db";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Não foi possível carregar usuário armazenado.", error);
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: getStoredUser(),
    token: localStorage.getItem("authToken") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login({ username, password }) {
      const usuarios = await listUsuarios();
      const usuario = usuarios.find(
        (u) => u.username === username && u.senha === password
      );

      if (!usuario) {
        return false;
      }

      this.user = {
        id: usuario.id,
        name: usuario.nome,
        role: usuario.role || "RH",
      };
      this.token = `token-${usuario.id}-${Date.now()}`;
      localStorage.setItem("authToken", this.token);
      localStorage.setItem("authUser", JSON.stringify(this.user));
      return true;
    },

    async cadastrarUsuario({ nome, username, password, role = "RH" }) {
      if (!nome || !username || !password) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      const usuarios = await listUsuarios();
      if (usuarios.some((u) => u.username === username)) {
        throw new Error("Já existe um usuário com esse login.");
      }

      const novoUsuario = {
        id: `usr-${Date.now()}`,
        nome,
        username,
        senha: password,
        role,
      };

      await saveUsuario(novoUsuario);
      return novoUsuario;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    },
  },
});
