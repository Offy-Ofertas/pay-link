import { defineStore } from "pinia";
import {
  enviarCodigoPorEmail,
  enviarLinkAssinaturaEmail,
} from "@/services/api/emailService";
import {
  criarSolicitacao,
  listarSolicitacoes,
} from "@/services/api/financeiroService";
import {
  atualizarColaborador,
  buscarColaboradorPorCpf,
  buscarColaboradorPorId,
} from "@/services/api/colaboradorService";
import { verificarFace } from "@/services/api/faceService";

export const useTotemStore = defineStore("totem", {
  state: () => ({
    step: 1,
    cpf: "",
    colaborador: null,
    codigoGerado: "",
    codigoExpirado: false,
    faceStatus: "pendente",
    faceSnapshot: "",
    showFaceModal: false,
    valor: null,
    data: null,
    assinaturaEmailEnviado: false,
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
    cancelarFace() {
      this.showFaceModal = false;
      this.faceStatus = "pendente";
      this.faceSnapshot = "";
      this.codigoGerado = "";
      this.codigoExpirado = false;
      this.colaborador = null;
      this.cpf = "";
      this.step = 2; // volta para o preenchimento de CPF
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
      this.codigoExpirado = false;
      this.faceStatus = "pendente";
      this.faceSnapshot = "";
      this.showFaceModal = false;
      this.valor = null;
      this.data = null;
      this.assinaturaEmailEnviado = false;
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
          const referencia =
            s.processadoEm || s.processado_em || s.criadoEm || s.criado_em;
          if (!referencia) return false;
          return calcularDiasDesde(referencia) < 15;
        });

        if (canceladaRecente) {
          const referencia =
            canceladaRecente.processadoEm ||
            canceladaRecente.processado_em ||
            canceladaRecente.criadoEm ||
            canceladaRecente.criado_em;
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
        this.faceStatus = "aprovado";
        this.faceSnapshot = "";
        this.showFaceModal = false;

        this.showSnackbar(
          `CPF validado com sucesso! Bem-vindo(a), ${this.colaborador.nome}`,
          "success"
        );
        this.goToStep(3);
      } catch (error) {
        console.error("Erro ao validar CPF:", error);
        this.showSnackbar(
          "Não foi possível validar o CPF. Tente novamente.",
          "error"
        );
      }
    },

    // ---------------------------------
    // Etapa 2.1 - Reconhecimento facial
    // ---------------------------------
    async validarFace({ imagemBase64, faceHash }) {
      if (!this.colaborador?.id) {
        this.showSnackbar("Colaborador inválido. Reinicie o fluxo.", "error");
        return;
      }

      this.showFaceModal = false;
      this.faceStatus = "verificando";

      try {
        const resultado = await verificarFace({
          colaboradorId: this.colaborador.id,
          cpf: this.colaborador.cpf,
          imagemBase64,
          faceHash,
        });

        this.faceSnapshot = imagemBase64;

        if (resultado.status === "aprovado") {
          this.faceStatus = "aprovado";
          this.showSnackbar("Rosto reconhecido com sucesso!", "success");
          this.showFaceModal = false;
          this.goToStep(3);
        } else if (resultado.status === "registrado") {
          this.faceStatus = "aprovado";
          this.showSnackbar("Face cadastrada e validada.", "success");
          this.showFaceModal = false;
          this.goToStep(3);
        } else {
          this.faceStatus = "reprovado";
          this.showSnackbar("Rosto não reconhecido. Tente novamente.", "error");
        }
      } catch (error) {
        console.error("Erro ao validar face:", error);
        this.faceStatus = "erro";
        this.showSnackbar(
          error?.message || "Não foi possível validar o rosto.",
          "error"
        );
      }
    },

    // ---------------------------------
    // Etapa 2 - Confirmar dados / enviar código
    // ---------------------------------
    async enviarCodigo() {
      if (this.faceStatus !== "aprovado") {
        this.showSnackbar(
          "Finalize o reconhecimento facial para continuar.",
          "warning"
        );
        return;
      }

      this.codigoExpirado = false;
      const codigo = gerarCodigoNumerico();
      const expiraEm = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      this.codigoGerado = codigo;

      try {
        const colaboradorAtualizado = await atualizarColaborador(
          this.colaborador?.id,
          {
            ...this.colaborador,
            codigo_validacao_codigo: codigo,
            codigo_validacao_expira_em: expiraEm,
          }
        );

        this.colaborador = {
          ...colaboradorAtualizado,
          cpf: formatarCpf(colaboradorAtualizado.cpf || this.cpf),
        };
      } catch (error) {
        console.error("Erro ao salvar código:", error);
        this.showSnackbar(
          "Não foi possível gerar o código. Tente novamente.",
          "error"
        );
        return;
      }

      if (this.colaborador?.email) {
        try {
          await enviarCodigoPorEmail({
            to: this.colaborador.email,
            nome: this.colaborador.nome,
            codigo: this.codigoGerado,
          });
          console.log("Código enviado por e-mail com sucesso.");
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
      try {
        const colaboradorAtual = this.colaborador?.id
          ? await buscarColaboradorPorId(this.colaborador.id)
          : null;

        const codigoSalvo =
          colaboradorAtual?.codigo_validacao_codigo ||
          colaboradorAtual?.codigo_validacao?.codigo;
        const expiraEm =
          colaboradorAtual?.codigo_validacao_expira_em ||
          colaboradorAtual?.codigo_validacao?.expiraEm;
        const expirado = expiraEm
          ? new Date(expiraEm).getTime() < Date.now()
          : false;

        if (expirado || !codigoSalvo) {
          this.codigoExpirado = expirado;
          const mensagem = expirado
            ? "Codigo expirado, por favor, gere outro"
            : "Código inválido. Gere um novo código.";
          this.showSnackbar(mensagem, "error");
          return;
        }

        if (codigoDigitado === codigoSalvo) {
          this.codigoExpirado = false;
          this.showSnackbar("Código validado com sucesso!", "success");
          this.colaborador = {
            ...colaboradorAtual,
            cpf: formatarCpf(colaboradorAtual?.cpf || this.cpf),
          };
          this.nextStep();
        } else {
          this.codigoExpirado = false;
          this.showSnackbar("Código incorreto. Tente novamente.", "error");
        }
      } catch (error) {
        console.error("Erro ao validar código:", error);
        this.showSnackbar(
          "Não foi possível validar o código. Tente novamente.",
          "error"
        );
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
        await this.enviarEmailAssinatura();
        this.goToStep(7); // vai direto para a tela de sucesso
      } catch (error) {
        console.error("Erro ao registrar solicitação:", error);
        this.showSnackbar(
          error?.message || "Erro ao registrar a solicitação. Tente novamente.",
          error?.message ? "warning" : "error"
        );
      }
    },
    async enviarEmailAssinatura() {
      if (!this.colaborador?.email || this.assinaturaEmailEnviado) return;

      const baseUrl = "http://localhost:3001";
      const params = new URLSearchParams();
      const valorParam = formatarValorParaUrl(this.valor?.valor ?? this.valor);

      if (valorParam) params.set("valor", valorParam);
      if (this.colaborador?.nome) {
        params.set("nome", this.colaborador.nome);
        params.set("assinatura", this.colaborador.nome);
      }
      if (this.data) params.set("data", this.data);
      if (this.colaborador?.cpf) params.set("cpf", this.colaborador.cpf);
      if (this.colaborador?.id) params.set("colaboradorId", this.colaborador.id);

      const link = `${baseUrl}/assinatura-eletronica?${params.toString()}`;

      try {
        await enviarLinkAssinaturaEmail({
          to: this.colaborador.email,
          nome: this.colaborador.nome,
          link,
        });
        this.assinaturaEmailEnviado = true;
      } catch (error) {
        console.warn("Falha ao enviar e-mail de assinatura:", error);
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

function formatarValorParaUrl(valor) {
  const numero = Number(valor);
  if (!Number.isNaN(numero)) {
    return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }
  return valor ? String(valor) : "";
}

function gerarCodigoNumerico() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
