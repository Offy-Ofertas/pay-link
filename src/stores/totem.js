import { defineStore } from "pinia";
import { buscarColaboradorRh } from "@/services/api/rhService";
import {
  buscarColaboradorPortalPorCpf,
  buscarColaboradorPortalPorLogin,
  criarColaboradorPortal,
  atualizarColaboradorPortal,
} from "@/services/api/portalService";
import {
  criarSolicitacao,
  listarSolicitacoes,
} from "@/services/api/financeiroService";
import { verificarFace } from "@/services/api/faceService";
import { enviarCredenciaisPrimeiroAcessoEmail } from "@/services/api/emailService";

export const useTotemStore = defineStore("totem", {
  state: () => ({
    step: 1,
    entrada: null,
    cadastro: {
      cpf: "",
      nome: "",
      email: "",
      nascimento: "",
      telefone: "",
      lgpd: false,
    },
    login: {
      login: "",
      senha: "",
    },
    veioDoEmailPrimeiroAcesso: false,
    senhaNova: "",
    senhaConfirmacao: "",
    colaboradorPortal: null,
    colaboradorRh: null,
    elegibilidade: {
      elegivel: false,
      motivos: [],
    },
    solicitacao: {
      valorSolicitado: null,
      valorTotal: null,
      taxaPercentual: 0.15,
      parcelas: null,
      valorParcela: null,
    },
    solicitacaoAtual: null,
    solicitacaoCriada: null,
    conta_salario: "",
    faceStatus: "pendente",
    faceSnapshot: "",
    showFaceModal: false,
    snackbar: { show: false, message: "", color: "success" },
  }),

  actions: {
    showSnackbar(message, color = "success") {
      this.snackbar = { show: true, message, color };
      setTimeout(() => {
        this.snackbar.show = false;
      }, 3000);
    },

    goToStep(step) {
      this.step = step;
    },
    nextStep() {
      this.step += 1;
    },
    prevStep() {
      if (this.step > 1) this.step -= 1;
    },
    resetarFluxo() {
      this.step = 1;
      this.entrada = null;
      this.cadastro = {
        cpf: "",
        nome: "",
        email: "",
        nascimento: "",
        telefone: "",
        lgpd: false,
      };
      this.login = { login: "", senha: "" };
      this.senhaNova = "";
      this.senhaConfirmacao = "";
      this.colaboradorPortal = null;
      this.colaboradorRh = null;
      this.veioDoEmailPrimeiroAcesso = false;
      this.elegibilidade = { elegivel: false, motivos: [] };
      this.solicitacao = {
        valorSolicitado: null,
        valorTotal: null,
        taxaPercentual: 0.15,
        parcelas: null,
        valorParcela: null,
      };
      this.solicitacaoAtual = null;
      this.solicitacaoCriada = null;
      this.conta_salario = "";
      this.faceStatus = "pendente";
      this.faceSnapshot = "";
      this.showFaceModal = false;
    },

    escolherEntrada(tipo) {
      this.entrada = tipo;
      if (tipo === "acessar") {
        this.goToStep(2);
      } else {
        this.goToStep(3);
      }
    },

    marcarPrimeiroAcessoEmail(flag = true) {
      this.veioDoEmailPrimeiroAcesso = flag;
    },

    async iniciarAlteracaoSenhaPorLink(login) {
      if (!login) return;
      try {
        const usuario = await buscarColaboradorPortalPorLogin(login);
        if (!usuario) {
          this.showSnackbar(
            "Nao encontramos seu cadastro. Realize o primeiro acesso.",
            "warning"
          );
          return;
        }
        this.colaboradorPortal = usuario;
        this.goToStep(5);
      } catch (error) {
        console.error("Erro ao abrir alteracao de senha:", error);
        this.showSnackbar(
          "Nao foi possivel abrir a alteracao de senha.",
          "error"
        );
      }
    },

    async registrarPrimeiroAcesso() {
      const { cpf, nome, email, nascimento, telefone, lgpd } = this.cadastro;
      if (!cpf || !nome || !email || !nascimento || !telefone) {
        this.showSnackbar("Preencha todos os campos obrigatorios.", "warning");
        return;
      }
      if (!lgpd) {
        this.showSnackbar(
          "Aceite o termo da LGPD para continuar.",
          "warning"
        );
        return;
      }

      try {
        const existente = await buscarColaboradorPortalPorCpf(cpf);
        if (existente) {
          this.showSnackbar(
            "Seu acesso ja existe. Use a opcao Acessar.",
            "warning"
          );
          return;
        }

        const rh = await buscarColaboradorRh({ cpf });
        if (!rh) {
          this.showSnackbar(
            "Nao localizamos seu cadastro no RH. Verifique os dados.",
            "error"
          );
          return;
        }

        const login = (rh.email || email || "").trim().toLowerCase();
        const senhaProvisoria = gerarSenhaProvisoria();
        const novo = {
          id: `portal-${Date.now()}`,
          nome: rh.nome,
          cpf: rh.cpf,
          cargo: rh.cargo || "",
          departamento: rh.departamento || "",
          email: rh.email || email,
          telefone: rh.telefone || telefone,
          salario: rh.salario || "",
          admissao: rh.admissao || null,
          demissao: rh.demissao ?? null,
          ativo: rh.ativo ?? true,
          data_nascimento: rh.dataNascimento || rh.data_nascimento || nascimento,
          conta_salario: rh.contaSalario || rh.conta_salario || "",
          menor_aprendiz: rh.menorAprendiz ?? rh.menor_aprendiz ?? false,
          meses_empresa: rh.mesesEmpresa ?? rh.meses_empresa ?? null,
          aviso_previo: rh.avisoPrevio ?? rh.aviso_previo ?? false,
          apto_emprestimo: rh.aptoEmprestimo ?? rh.apto_emprestimo ?? true,
          login,
          senha: senhaProvisoria,
          senha_provisoria: true,
          criado_em: new Date().toISOString(),
        };

        const salvo = await criarColaboradorPortal(novo);
        this.colaboradorPortal = salvo || novo;

        const link = `${window.location.origin}/totem?primeiro-acesso=1&login=${encodeURIComponent(
          login
        )}`;

        await enviarCredenciaisPrimeiroAcessoEmail({
          to: novo.email,
          nome: novo.nome,
          login,
          senha: senhaProvisoria,
          link,
        });

        this.goToStep(4);
      } catch (error) {
        console.error("Erro no primeiro acesso:", error);
        this.showSnackbar(
          error?.message || "Nao foi possivel concluir o cadastro.",
          "error"
        );
      }
    },

    async loginColaborador() {
      const { login, senha } = this.login;
      if (!login || !senha) {
        this.showSnackbar("Informe login e senha.", "warning");
        return;
      }

      try {
        const usuario = await buscarColaboradorPortalPorLogin(login);
        if (!usuario || usuario.senha !== senha) {
          this.showSnackbar("Login ou senha invalidos.", "error");
          return;
        }

        this.colaboradorPortal = usuario;
        const rh = await buscarColaboradorRh({ cpf: usuario.cpf });
        if (!rh) {
          this.showSnackbar(
            "Nao foi possivel carregar seus dados do RH.",
            "error"
          );
          return;
        }
        this.colaboradorRh = rh;

        if (this.veioDoEmailPrimeiroAcesso) {
          this.goToStep(5);
          return;
        }

        const bloqueado = await this.verificarSolicitacaoExistente();
        if (!bloqueado) {
          this.prepararElegibilidade();
        }
      } catch (error) {
        console.error("Erro ao logar:", error);
        this.showSnackbar("Nao foi possivel autenticar.", "error");
      }
    },

    async alterarSenha() {
      if (!this.colaboradorPortal) return;
      if (!this.senhaNova || !this.senhaConfirmacao) {
        this.showSnackbar("Informe a nova senha.", "warning");
        return;
      }
      if (this.senhaNova !== this.senhaConfirmacao) {
        this.showSnackbar("As senhas nao conferem.", "warning");
        return;
      }

      try {
        const atualizado = await atualizarColaboradorPortal(
          this.colaboradorPortal.id,
          {
            senha: this.senhaNova,
            senha_provisoria: false,
          }
        );
        this.colaboradorPortal = atualizado;
        this.senhaNova = "";
        this.senhaConfirmacao = "";
        this.veioDoEmailPrimeiroAcesso = false;
        this.showSnackbar("Senha atualizada com sucesso.", "success");
        const bloqueado = await this.verificarSolicitacaoExistente();
        if (!bloqueado) {
          this.prepararElegibilidade();
        }
      } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        this.showSnackbar("Nao foi possivel atualizar a senha.", "error");
      }
    },

    prepararElegibilidade() {
      const resultado = avaliarElegibilidade(this.colaboradorRh);
      this.elegibilidade = resultado;
      this.goToStep(7);
    },

    selecionarValor({ valorSolicitado, parcelas }) {
      const taxaPercentual = 0.15;
      const total = valorSolicitado * (1 + taxaPercentual);
      const valorParcela = total / parcelas;
      this.solicitacao = {
        valorSolicitado,
        valorTotal: total,
        taxaPercentual,
        parcelas,
        valorParcela,
      };
      this.nextStep();
    },

    async confirmarSolicitacao() {
      if (!this.colaboradorPortal) return;
      const { valorSolicitado, valorTotal, taxaPercentual, parcelas, valorParcela } =
        this.solicitacao;
      if (!valorSolicitado || !parcelas) {
        this.showSnackbar("Informe o valor e as parcelas.", "warning");
        return;
      }

      try {
        const criada = await criarSolicitacao({
          cpf: this.colaboradorPortal.cpf,
          nome: this.colaboradorPortal.nome,
          email: this.colaboradorPortal.email,
          colaboradorId: this.colaboradorPortal.id,
          valorSolicitado,
          valorTotal,
          taxaPercentual,
          parcelas,
          valorParcela,
          status: "PENDENTE",
        });

        this.solicitacaoCriada = criada;
        this.goToStep(10);
      } catch (error) {
        console.error("Erro ao criar solicitacao:", error);
        this.showSnackbar(
          error?.message || "Nao foi possivel registrar a solicitacao.",
          "error"
        );
      }
    },

    async verificarSolicitacaoExistente() {
      const cpf = this.colaboradorPortal?.cpf;
      if (!cpf) return false;

      try {
        const lista = await listarSolicitacoes();
        const cpfLimpo = String(cpf).replace(/\D/g, "");
        const solicitacoes = (Array.isArray(lista) ? lista : []).filter((s) => {
          const cpfItem = String(s.cpf || "").replace(/\D/g, "");
          return cpfItem === cpfLimpo;
        });

        if (!solicitacoes.length) {
          this.solicitacaoAtual = null;
          return false;
        }

        const ordenar = (a, b) => {
          const dataA = obterTimestamp(a);
          const dataB = obterTimestamp(b);
          return dataB - dataA;
        };

        const pendentes = solicitacoes
          .filter((s) => s.status === "PENDENTE")
          .sort(ordenar);
        if (pendentes.length) {
          this.solicitacaoAtual = pendentes[0];
          this.goToStep(6);
          return true;
        }

        const aprovadas = solicitacoes
          .filter((s) => ["APROVADA", "VALIDADA"].includes(s.status))
          .sort(ordenar);
        if (aprovadas.length) {
          this.solicitacaoAtual = aprovadas[0];
          this.goToStep(6);
          return true;
        }

        this.solicitacaoAtual = null;
        return false;
      } catch (error) {
        console.error("Erro ao verificar solicitacoes:", error);
        return false;
      }
    },

    async validarFace({ imagemBase64, faceHash }) {
      if (!this.colaboradorPortal?.id) {
        this.showSnackbar("Colaborador invalido.", "error");
        return;
      }

      this.showFaceModal = false;
      this.faceStatus = "verificando";

      try {
        const resultado = await verificarFace({
          colaboradorId: this.colaboradorPortal.id,
          cpf: this.colaboradorPortal.cpf,
          imagemBase64,
          faceHash,
        });

        this.faceSnapshot = imagemBase64;

        if (resultado.status === "aprovado" || resultado.status === "registrado") {
          this.faceStatus = "aprovado";
          this.showSnackbar("Rosto validado com sucesso!", "success");
        } else {
          this.faceStatus = "reprovado";
          this.showSnackbar("Rosto nao reconhecido. Tente novamente.", "error");
        }
      } catch (error) {
        console.error("Erro ao validar face:", error);
        this.faceStatus = "erro";
        this.showSnackbar(
          error?.message || "Nao foi possivel validar o rosto.",
          "error"
        );
      }
    },

    cancelarFace() {
      this.showFaceModal = false;
      this.faceStatus = "pendente";
      this.faceSnapshot = "";
    },
  },
});

function gerarSenhaProvisoria() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function avaliarElegibilidade(colaborador) {
  const motivos = [];
  if (!colaborador) {
    motivos.push("Dados do RH nao encontrados.");
    return { elegivel: false, motivos };
  }

    const menorAprendiz = colaborador.menor_aprendiz ?? colaborador.menorAprendiz;
    if (menorAprendiz) {
      motivos.push("Colaborador menor aprendiz nao pode solicitar.");
    }

  const mesesEmpresa =
    Number(colaborador.meses_empresa ?? colaborador.mesesEmpresa) ||
    calcularMesesDesde(colaborador.admissao);
  if (mesesEmpresa < 3) {
    motivos.push("Necessario ter no minimo 3 meses de empresa.");
  }

  const avisoPrevio = colaborador.aviso_previo ?? colaborador.avisoPrevio;
  if (avisoPrevio) {
    motivos.push("Colaborador em aviso previo nao pode solicitar.");
  }

  const apto = colaborador.apto_emprestimo ?? colaborador.aptoEmprestimo;
  if (apto === false) {
    motivos.push("Colaborador nao esta apto para emprestimo.");
  }

  return { elegivel: motivos.length === 0, motivos };
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

function obterTimestamp(solicitacao) {
  const referencia =
    solicitacao?.processadoEm ||
    solicitacao?.processado_em ||
    solicitacao?.criadoEm ||
    solicitacao?.criado_em;
  if (!referencia) return 0;
  const data = new Date(referencia);
  return Number.isNaN(data.getTime()) ? 0 : data.getTime();
}
