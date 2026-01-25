-- Adiciona campos necessarios ao novo fluxo na tabela public.solicitacoes
alter table public.solicitacoes
  add column if not exists email text,
  add column if not exists colaborador_id text,
  add column if not exists valor_solicitado numeric,
  add column if not exists valor_total numeric,
  add column if not exists taxa_percentual numeric default 0.15,
  add column if not exists parcelas integer default 1,
  add column if not exists valor_parcela numeric;

-- Indices basicos
create index if not exists solicitacoes_cpf_idx on public.solicitacoes (cpf);
create index if not exists solicitacoes_status_idx on public.solicitacoes (status);
create index if not exists solicitacoes_colaborador_id_idx on public.solicitacoes (colaborador_id);
