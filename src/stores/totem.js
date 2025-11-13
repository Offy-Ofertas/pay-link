import { defineStore } from "pinia";
import { enviarCodigoPorEmail } from "@/services/api/emailService";
import {
  criarSolicitacao,
  listarSolicitacoes,
} from "@/services/api/financeiroService";
import { buscarColaboradorPorCpf } from "@/services/api/colaboradorService";

export const useTotemStore = defineStore("totem", {
  state: () => ({
    step: 1,
    cpf: "",
    colaborador: null,
    codigoGerado: "",
    valor: null,
    data: null,
    snackbar: { show: false, message: "", color: "success" },
  }),

  actions: {
    bloquearFluxo(mensagem, cor = "warning") {
      this.showSnackbar(mensagem, cor);
      setTimeout(() => this.resetarFluxo(), 3000);
    },
    // ---------------------------------
    // Notificações
    // ---------------------------------
    showSnackbar(message, color = "success") {
      this.snackbar = { show: true, message, color };
      setTimeout(() => {
        this.snackbar.show = false;
      }, 3000);
    },

    // ---------------------------------
    // Navegação
    // ---------------------------------
    goToStep(step) {
      this.step = step;
    },
    nextStep() {
      this.step++;
    },
    prevStep() {
      if (this.step > 1) this.step--;
    },
    resetarFluxo() {
      this.step = 1;
      this.cpf = "";
      this.colaborador = null;
      this.codigoGerado = "";
      this.valor = null;
      this.data = null;
    },

    // ---------------------------------
    // Etapa 1 - Validação de CPF
    // ---------------------------------
    async validarCpf() {
      const cpfLimpo = (this.cpf || "").replace(/\D/g, "");
      if (!cpfEhValido(cpfLimpo)) {
        this.showSnackbar("CPF inválido. Verifique e tente novamente.", "warning");
        return;
      }

      try {
        const colaborador = await buscarColaboradorPorCpf(cpfLimpo);

        if (!colaborador) {
          this.showSnackbar(
            "CPF não encontrado. Verifique e tente novamente.",
            "error"
          );
          return;
        }

        if (!colaborador.admissao) {
          this.bloquearFluxo(
            "Data de admissão não cadastrada. Procure o RH."
          );
          return;
        }

        const mesesEmpresa = calcularMesesDesde(colaborador.admissao);
        if (mesesEmpresa <= 3) {
          this.bloquearFluxo(
            "Colaboradores com menos de 3 meses não podem solicitar adiantamento."
          );
          return;
        }

        if (colaborador.demissao) {
          this.bloquearFluxo(
            "Colaborador desligado. Solicitação não permitida."
          );
          return;
        }

        const solicitacoes = await listarSolicitacoes();
        const solicitacoesDoCpf = solicitacoes?.filter(
          (s) => (s.cpf || "").replace(/\D/g, "") === cpfLimpo
        );

        const possuiPendente = solicitacoesDoCpf?.some(
          (s) => s.status === "PENDENTE"
        );
        if (possuiPendente) {
          this.bloquearFluxo(
            "Você já possui uma solicitação em andamento. Aguarde o processamento."
          );
          return;
        }

        const canceladaRecente = solicitacoesDoCpf?.find((s) => {
          if (s.status !== "CANCELADA") return false;
          const referencia = s.processadoEm || s.criadoEm;
          if (!referencia) return false;
          return calcularDiasDesde(referencia) < 15;
        });

        if (canceladaRecente) {
          const referencia = canceladaRecente.processadoEm || canceladaRecente.criadoEm;
          const diasDecorridos = calcularDiasDesde(referencia);
          const diasRestantes = Math.max(1, 15 - diasDecorridos);
          const dataLiberacao = adicionarDias(referencia, 15);
          const dataFormatada = formatarDataCurta(dataLiberacao);
          this.bloquearFluxo(
            `Sua última solicitação foi cancelada. Aguarde ${diasRestantes} dia(s) (até ${dataFormatada}) ou peça ao RH para excluí-la.`,
            "warning"
          );
          return;
        }

        const possuiAtendida = solicitacoesDoCpf?.some(
          (s) => s.status === "APROVADA"
        );
        if (possuiAtendida) {
          this.bloquearFluxo(
            "Você já possui uma solicitação atendida recentemente. Aguarde o próximo ciclo."
          );
          return;
        }

        this.colaborador = {
          ...colaborador,
          cpf: formatarCpf(colaborador.cpf || this.cpf),
        };
        this.cpf = this.colaborador.cpf;

        this.showSnackbar(
          `CPF validado com sucesso! Bem-vindo(a), ${this.colaborador.nome}`,
          "success"
        );

        this.nextStep();
      } catch (error) {
        console.error("Erro ao validar CPF:", error);
        this.showSnackbar(
          "Não foi possível validar o CPF. Tente novamente.",
          "error"
        );
      }
    },

    // ---------------------------------
    // Etapa 2 - Confirmar dados / enviar código
    // ---------------------------------
    async enviarCodigo() {
      this.codigoGerado = "123456"; // código fixo para testes
      if (this.colaborador?.email) {
        try {
          await enviarCodigoPorEmail({
            to: this.colaborador.email,
            nome: this.colaborador.nome,
            codigo: this.codigoGerado,
          });
        } catch (error) {
          console.warn("Envio real de e-mail não configurado:", error);
        }
      }

      this.showSnackbar(
        `Código enviado para ${this.colaborador?.email || "seu e-mail"}`,
        "success"
      );
      this.nextStep();
    },

    // ---------------------------------
    // Etapa 3 - Validação do código
    // ---------------------------------
    async validarCodigo(codigoDigitado) {
      const codigoCorreto = this.codigoGerado || "123456";

      if (codigoDigitado === codigoCorreto) {
        this.showSnackbar("Código validado com sucesso!", "success");
        this.nextStep();
      } else {
        this.showSnackbar("Código incorreto. Tente novamente.", "error");
      }
    },

    // ---------------------------------
    // Etapa 4 - Selecionar valor
    // ---------------------------------
    selecionarValor(valor) {
      this.valor = valor;
      this.showSnackbar(`Valor selecionado: ${formatarMoeda(valor)}`, "success");
      this.nextStep();
    },

    // ---------------------------------
    // Etapa 5 - Selecionar data
    // ---------------------------------
    async selecionarData(data) {
      this.data = data;
      this.showSnackbar(
        `Data selecionada com sucesso! Você receberá em ${data}`,
        "success"
      );

      try {
        await criarSolicitacao({
          cpf: this.cpf,
          nome: this.colaborador?.nome,
          valor: this.valor,
          data,
        });
        this.goToStep(7); // vai direto para a tela de sucesso
      } catch (error) {
        console.error("Erro ao registrar solicitação:", error);
        this.showSnackbar(
          error?.message || "Erro ao registrar a solicitação. Tente novamente.",
          error?.message ? "warning" : "error"
        );
      }
    },
  },
});

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return valor;
  return formatadorMoeda.format(numero);
}

function formatarCpf(cpf) {
  const apenasNumeros = (cpf || "").replace(/\D/g, "");
  if (!apenasNumeros) return "";
  return apenasNumeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function cpfEhValido(cpf) {
  const somenteDigitos = (cpf || "").replace(/\D/g, "");
  if (somenteDigitos.length !== 11) return false;
  if (/^(\d)\1+$/.test(somenteDigitos)) return false;

  const calcDigito = (slice) => {
    let soma = 0;
    for (let i = 0; i < slice.length; i++) {
      soma += Number(slice[i]) * (slice.length + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiro = calcDigito(somenteDigitos.slice(0, 9));
  const segundo = calcDigito(somenteDigitos.slice(0, 10));

  return (
    primeiro === Number(somenteDigitos[9]) &&
    segundo === Number(somenteDigitos[10])
  );
}

function calcularMesesDesde(dataISO) {
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return 0;
  const agora = new Date();
  let meses =
    (agora.getFullYear() - data.getFullYear()) * 12 +
    (agora.getMonth() - data.getMonth());
  if (agora.getDate() < data.getDate()) meses -= 1;
  return meses;
}

function calcularDiasDesde(dataISO) {
  if (!dataISO) return Number.MAX_SAFE_INTEGER;
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return Number.MAX_SAFE_INTEGER;
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function adicionarDias(dataISO, dias) {
  if (!dataISO) return null;
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return null;
  data.setDate(data.getDate() + dias);
  return data;
}

function formatarDataCurta(data) {
  if (!data || Number.isNaN(data.getTime())) return "—";
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
