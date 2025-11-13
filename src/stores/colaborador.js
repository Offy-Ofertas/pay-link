import { defineStore } from "pinia";
import {
  listarColaboradores,
  criarColaborador,
  atualizarColaborador,
  excluirColaborador,
  buscarColaboradorPorId,
  buscarColaboradorPorCpf,
} from "@/services/api/colaboradorService";

export const useColaboradorStore = defineStore("colaboradores", {
  state: () => ({
    colaboradores: [],
    carregando: false,
    carregado: false,
  }),
  actions: {
    async carregarColaboradores() {
      if (this.carregando) return;
      this.carregando = true;
      try {
        this.colaboradores = await listarColaboradores();
        this.carregado = true;
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
        throw error;
      } finally {
        this.carregando = false;
      }
    },

    async criar(colaborador) {
      const novo = await criarColaborador(colaborador);
      this.colaboradores.push(novo);
      return novo;
    },

    async atualizar(id, dados) {
      const atualizado = await atualizarColaborador(id, dados);
      const idx = this.colaboradores.findIndex((c) => c.id === id);
      if (idx !== -1) {
        this.colaboradores[idx] = atualizado;
      } else {
        this.colaboradores.push(atualizado);
      }
      return atualizado;
    },

    async remover(id) {
      await excluirColaborador(id);
      this.colaboradores = this.colaboradores.filter((c) => c.id !== id);
    },

    buscarPorId(id) {
      return this.colaboradores.find((c) => c.id === id);
    },

    async buscarPorIdAsync(id) {
      return buscarColaboradorPorId(id);
    },

    async buscarPorCpf(cpf) {
      return buscarColaboradorPorCpf(cpf);
    },
  },
});
