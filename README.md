# Pay Link – Manual de Uso

Aplicação Vue 3 + Vuetify para gestão de solicitações de adiantamento salarial. Possui dois contextos principais:

- **Totem do colaborador**: fluxo guiado para registro das solicitações no ponto físico.
- **Painel administrativo**: módulo do RH para acompanhar solicitações, validar/cancelar e manter o cadastro de colaboradores.

Todos os dados ficam em um JSON Server local (`server/db.json`), simulando o backend oficial.

---

## 1. Pré-requisitos

- Node 18+
- npm 9+ (ou outro gerenciador compatível)
- JSON Server (já incluso nas dependências)

Instale tudo com:

```bash
npm install
```

### Servidores necessários

| Serviço            | Comando       | URL                    |
|--------------------|---------------|------------------------|
| Front-end (Vite)   | `npm run dev` | http://localhost:3000  |
| API Mock (JSON)    | `npm run api` | http://localhost:4000  |

> A aplicação consome `VITE_API_URL` (padrão `http://localhost:4000`). Ajuste em `.env` se for apontar para outro host.

---

## 2. Acesso e autenticação

Credenciais ficam na coleção `usuarios` do `server/db.json`. Exemplos padrão:

- Usuário: `admin` / Senha: `1234`
- Usuário: `finance` / Senha: `1234`

Fluxo:
1. Acesse `/login`.
2. Informe usuário e senha.
3. Clique em **Entrar no painel**. Usuários autenticados são redirecionados para `/admin/solicitacoes`.

A tela também permite criar novos usuários (mock). O cadastro grava diretamente na coleção `usuarios`.

---

## 3. Totem do colaborador (`/totem`)

Fluxo de passos controlado por `useTotemStore`:

1. **Boas-vindas** – apresenta o totem e inicia o processo.
2. **CPF** – formata/valida o CPF e consulta o colaborador.
3. **Confirmação de dados** – mostra registro do colaborador e envia código por e-mail (mock).
4. **Validação do código** – código fixo `123456`.
5. **Escolha do valor** – colaborador seleciona o valor disponível.
6. **Escolha da data** – define data do pagamento.
7. **Sucesso** – confirmação final e reinício do fluxo.

### Regras aplicadas durante a validação do CPF

- CPF precisa existir e estar ativo (sem demissão registrada).
- Colaboradores com **menos de 3 meses** de empresa são bloqueados.
- Não é permitido ter solicitação **pendente** nem **aprovada** em aberto.
- Solicitações **canceladas** geram bloqueio de 15 dias contados da data de processamento. O totem informa quantos dias restam e a data de liberação; se o RH excluir a solicitação cancelada, o colaborador pode solicitar imediatamente.

Mensagens ao colaborador são exibidas via snackbar, com reset automático do fluxo quando necessário.

---

## 4. Painel administrativo

### 4.1 Solicitações (`/admin/solicitacoes`)

- Tabela com filtros por nome/CPF e status.
- Atualização automática a cada 5 s.
- Botão **Validar** aparece apenas em itens pendentes; itens processados exibem **Acessar**.

#### Detalhes e validação (`/admin/solicitacoes/:id/validar`)

- Mostra dados do colaborador, status, datas de criação/processamento e histórico.
- **Pendentes**: botões Aprovar (status `APROVADA`) ou Cancelar (`CANCELADA`).
- **Aprovadas**: informações apenas para leitura + botão Voltar.
- **Canceladas**: alerta mostra quantos dias faltam para nova solicitação; oferece botão **Excluir solicitação**. A exclusão remove o registro de `server/db.json`, libera o colaborador imediatamente e pede confirmação prévia.

### 4.2 Colaboradores (`/admin/colaboradores`)

- Lista e filtros básicos, com suporte a importação CSV via `papaparse`.
- Formulário (`/admin/colaboradores/novo` e `/admin/colaboradores/:id`) permite criar/editar dados (nome, CPF, departamento, admissão, demissão, etc.).
- Exclusões e alterações atualizam o JSON Server em tempo real.

### 4.3 Login / gestão de usuários

- Além do login, a própria tela permite criar novos usuários administrativos (mock) preenchendo nome, usuário, senha e confirmação.
- Os registros são simples, sem hashing. Para ambientes produtivos, troque por um backend seguro.

---

## 5. Regras de negócio resumidas

| Cenário                        | Regra                                                                                           |
|--------------------------------|-------------------------------------------------------------------------------------------------|
| Aprovação/cancelamento         | Somente no painel administrativo. A mudança grava `processadoEm` automaticamente.              |
| Exclusão de canceladas         | Disponível apenas para solicitações `CANCELADA` e libera o colaborador imediatamente.          |
| Bloqueio por aprovação         | Colaboradores com solicitação `APROVADA` não podem abrir nova até o próximo ciclo definido pelo RH. |
| Bloqueio por cancelamento      | Totem impede nova solicitação por 15 dias após o cancelamento, exibindo contagem regressiva.   |
| Elegibilidade do colaborador   | Necessita CPF válido, status ativo, sem demissão e mínimo de 3 meses na empresa.                |
| Comunicação                    | Código de verificação enviado por e-mail (mock). WhatsApp e outros canais podem ser plugados futuramente. |

---

## 6. Estrutura de dados (JSON Server)

- `solicitacoes`: `{ id, nome, cpf, valor, data, status, criadoEm, processadoEm }`.
- `colaboradores`: cadastro completo consumido pelo totem e painel.
- `usuarios`: credenciais simples usadas no login mock.

Edite o arquivo `server/db.json` manualmente ou utilize as telas do painel para popular cada coleção.

---

## 7. Scripts úteis

```bash
npm run dev    # inicia o front-end com Vite
npm run api    # inicia o JSON Server para as coleções
npm run build  # build de produção
npm run lint   # roda ESLint com --fix
```

Para rodar em produção, execute `npm run build` e sirva o conteúdo de `dist/` com o servidor de sua preferência.

---

## 8. Próximos passos sugeridos

- Integrar backend real (REST ou GraphQL) substituindo o JSON Server.
- Conectar envio real de WhatsApp/E-mail usando provedores como Twilio, WPPConnect ou EmailJS.
- Adicionar relatórios gráficos (há um componente de exemplo fácil de reativar) e trilha de auditoria para o RH.

Para dúvidas adicionais, consulte a equipe responsável pelo Pay Link.
