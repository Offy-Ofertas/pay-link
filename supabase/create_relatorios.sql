-- Cria tabela de relatorios para o fluxo de pagamento
create table if not exists public.relatorios (
  id text primary key,
  solicitacao_id text,
  nome text,
  cpf text,
  email text,
  telefone text,
  valor_solicitado numeric,
  valor_total numeric,
  parcelas integer,
  criado_em timestamptz default now(),
  previsao_pagamento date
);

create index if not exists relatorios_cpf_idx on public.relatorios (cpf);
create index if not exists relatorios_solicitacao_idx on public.relatorios (solicitacao_id);
