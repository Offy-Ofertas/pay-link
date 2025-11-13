import { defineStore } from "pinia";
import {
  listarSolicitacoes as listarSolicitacoesApi,
  atualizarStatus as atualizarStatusApi,
  excluirSolicitacao as excluirSolicitacaoApi,
} from "@/services/api/financeiroService";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    solicitacoes: [],
    carregandoSolicitacoes: false,
    snackbar: { show: false, message: "", color: "success" },
  }),
  actions: {
    async carregarSolicitacoes() {
      this.carregandoSolicitacoes = true;
      try {
        const lista = await listarSolicitacoesApi();
        this.solicitacoes = Array.isArray(lista) ? lista : [];
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        this.showSnackbar(
          "Não foi possível carregar as solicitações.",
          "error"
        );
      } finally {
        this.carregandoSolicitacoes = false;
      }
    },

    async atualizarStatus(id, novoStatus) {
      const solicitacaoId = String(id);
      const item = this.solicitacoes.find(
        (s) => String(s.id) === solicitacaoId
      );
      if (!item) {
        this.showSnackbar("Solicitação não encontrada.", "error");
        return;
      }

      const statusAnterior = item.status;
      const processadoAnterior = item.processadoEm;
      item.status = novoStatus;

      try {
        const atualizado = await atualizarStatusApi(item.id, novoStatus);
        if (atualizado?.processadoEm) {
          item.processadoEm = atualizado.processadoEm;
        } else if (novoStatus !== "PENDENTE") {
          item.processadoEm = new Date().toISOString();
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        item.status = statusAnterior;
        item.processadoEm = processadoAnterior;
        this.showSnackbar("Erro ao atualizar status. Tente novamente.", "error");
        throw error;
      }
    },

    buscarSolicitacao(id) {
      const solicitacaoId = String(id);
      return this.solicitacoes.find((s) => String(s.id) === solicitacaoId);
    },
    async excluirSolicitacao(id) {
      const solicitacaoId = String(id);
      const idx = this.solicitacoes.findIndex(
        (s) => String(s.id) === solicitacaoId
      );
      if (idx === -1) {
        this.showSnackbar("Solicitação não encontrada.", "error");
        return;
      }

      const removida = this.solicitacoes[idx];
      this.solicitacoes.splice(idx, 1);

      try {
        await excluirSolicitacaoApi(removida.id);
        this.showSnackbar("Solicitação excluída com sucesso.");
      } catch (error) {
        console.error("Erro ao excluir solicitação:", error);
        this.solicitacoes.splice(idx, 0, removida);
        this.showSnackbar("Erro ao excluir solicitação.", "error");
        throw error;
      }
    },
    showSnackbar(message, color = "success") {
      this.snackbar = { show: true, message, color };
      setTimeout(() => (this.snackbar.show = false), 3000);
    },
  },
});
