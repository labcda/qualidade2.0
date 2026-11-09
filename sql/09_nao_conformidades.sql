-- Qualidade 2.0 · não conformidades, incidentes e eventos adversos (substitui FR 006 e FR 038)
-- Rode uma vez no SQL Editor do Supabase.
create table if not exists q2_nc (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,                 -- OC 2026-001
  tipo text not null default 'nc' check (tipo in ('nc','evento','near','never')),
  data date not null,
  unidade text default 'Matriz', setor text default '', origem text default '',
  descricao text not null default '', impacto boolean not null default false, gravidade text default '',
  correcao text default '',
  aberto_por text default '',
  status text not null default 'aberta' check (status in ('aberta','em_analise','em_acao','verificacao','encerrada')),
  causa_tipo jsonb not null default '[]'::jsonb, causa text default '',
  acoes jsonb not null default '[]'::jsonb,
  notivisa text default '', eficacia text default '',
  encerrada_em date, encerrado_por text default '',
  historico jsonb not null default '[]'::jsonb,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);
create index if not exists q2_nc_status_idx on q2_nc (status, data desc);
alter table q2_nc enable row level security;
drop policy if exists "q2_nc_ler" on q2_nc;
create policy "q2_nc_ler" on q2_nc for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_nc_esc" on q2_nc;
create policy "q2_nc_esc" on q2_nc for all to authenticated
  using (q2_papel() in ('admin','elabora','revisa','aprova')) with check (q2_papel() in ('admin','elabora','revisa','aprova'));
