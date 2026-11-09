-- =====================================================================
-- Qualidade 2.0 — parte 6: CONTROLE DA ANALISA FIA 100 (lançamento semanal)
-- Supabase > SQL Editor > New query > cole tudo > Run.  Pode rodar mais de uma vez (não duplica).
--
-- Cria as tabelas da Qualidade 2.0 e COPIA os lançamentos e as faixas que já existem na Qualidade anterior
-- (fia_controles e fia_faixas). Nada é alterado nem apagado lá.
-- =====================================================================

create table if not exists q2_fia (
  id bigint generated always as identity primary key,
  data date not null unique,
  controle1 numeric(14,3) not null,
  controle2 numeric(14,3) not null,
  obs text not null default '',
  registrado_por text not null default '',
  criado_em timestamptz not null default now()
);
create table if not exists q2_fia_faixas (
  id int primary key default 1 check (id = 1),
  c1_min numeric(14,3) not null default 300,
  c1_max numeric(14,3) not null default 500,
  c2_min numeric(14,3) not null default 5000,
  c2_max numeric(14,3) not null default 8000,
  unidade text not null default 'mIU/mL'
);
alter table q2_fia enable row level security;
alter table q2_fia_faixas enable row level security;
drop policy if exists "q2_fia_ler" on q2_fia;
create policy "q2_fia_ler" on q2_fia for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_fia_esc" on q2_fia;
create policy "q2_fia_esc" on q2_fia for all to authenticated using (q2_papel() in ('admin','elabora','revisa','aprova')) with check (q2_papel() in ('admin','elabora','revisa','aprova'));
drop policy if exists "q2_fia_faixas_ler" on q2_fia_faixas;
create policy "q2_fia_faixas_ler" on q2_fia_faixas for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_fia_faixas_esc" on q2_fia_faixas;
create policy "q2_fia_faixas_esc" on q2_fia_faixas for all to authenticated using (q2_papel() in ('admin','aprova')) with check (q2_papel() in ('admin','aprova'));

-- copia da Qualidade anterior
insert into q2_fia_faixas (id, c1_min, c1_max, c2_min, c2_max, unidade)
select 1, c1_min, c1_max, c2_min, c2_max, unidade from public.fia_faixas where id = 1
on conflict (id) do nothing;
insert into q2_fia_faixas (id) values (1) on conflict (id) do nothing;

insert into q2_fia (data, controle1, controle2, obs, registrado_por, criado_em)
select data, controle1, controle2, obs, registrado_por, criado_em from public.fia_controles
on conflict (data) do nothing;

select 'lançamentos' as o_que, count(*) as quantidade, min(data)::text as de, max(data)::text as ate from q2_fia
union all select 'faixas', count(*), c1_min::text || ' a ' || c1_max::text, c2_min::text || ' a ' || c2_max::text from q2_fia_faixas group by c1_min, c1_max, c2_min, c2_max;
