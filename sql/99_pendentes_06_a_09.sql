-- ================= 06_fia100.sql =================
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

-- ================= 07_assinaturas.sql =================
-- Qualidade 2.0 · assinaturas cadastradas (aparecem nos documentos e nos formulários)
-- Rode uma vez no SQL Editor do Supabase.
create table if not exists q2_assinaturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cargo text default '',
  registro text default '',
  imagem text not null,                  -- imagem PNG em data URL (redimensionada no navegador)
  ativo boolean not null default true,
  atualizado_por text default '',
  atualizado_em timestamptz not null default now()
);
alter table q2_assinaturas enable row level security;
drop policy if exists "q2_assinaturas_ler" on q2_assinaturas;
create policy "q2_assinaturas_ler" on q2_assinaturas for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_assinaturas_esc" on q2_assinaturas;
create policy "q2_assinaturas_esc" on q2_assinaturas for all to authenticated
  using (q2_papel() in ('admin','aprova')) with check (q2_papel() in ('admin','aprova'));

-- ================= 08_indicadores.sql =================
-- Qualidade 2.0 · indicadores (definições, metas e valores mensais)
-- Os valores de jan a jun/2025 vêm das planilhas "FR 047 - Indicadores de Segurança do Paciente" e "Indicador Pesquisa de Satisfação em Porcentagem".
-- Rode uma vez no SQL Editor do Supabase. Pode rodar de novo sem duplicar nem apagar o que foi digitado.
create table if not exists q2_ind_def (
  codigo text primary key, nome text not null, unidade text default '', meta numeric,
  sentido text not null default 'neutro' check (sentido in ('maior','menor','neutro')),
  grupo text default '', formula text default '', ordem int default 0, ativo boolean not null default true
);
create table if not exists q2_ind_val (
  id uuid primary key default gen_random_uuid(),
  codigo text not null references q2_ind_def(codigo) on delete cascade,
  ano int not null, mes int not null check (mes between 1 and 12),
  valor numeric not null, obs text default '', fonte text default '',
  atualizado_por text default '', atualizado_em timestamptz not null default now(),
  unique (codigo, ano, mes)
);
alter table q2_ind_def enable row level security;
alter table q2_ind_val enable row level security;
do $$ declare t text; begin
  foreach t in array array['q2_ind_def','q2_ind_val'] loop
    execute format('drop policy if exists "%1$s_ler" on %1$s', t);
    execute format('create policy "%1$s_ler" on %1$s for select to authenticated using (q2_papel() is not null)', t);
    execute format('drop policy if exists "%1$s_esc" on %1$s', t);
    execute format('create policy "%1$s_esc" on %1$s for all to authenticated using (q2_papel() in (''admin'',''elabora'',''revisa'',''aprova'')) with check (q2_papel() in (''admin'',''elabora'',''revisa'',''aprova''))', t);
  end loop;
end $$;

insert into q2_ind_def (codigo, nome, unidade, meta, sentido, grupo, formula, ordem) values
  ('satisfacao', 'Satisfação dos pacientes', '%', 90, 'maior', 'Experiência do paciente', 'respostas de satisfação atendida ÷ perguntas respondidas x 100 (PQ 027)', 1),
  ('ident_erros', 'Erros de identificação do paciente ou da amostra', 'nº', null, 'menor', 'Segurança do paciente', 'nº de erros de identificação no mês', 2),
  ('higiene_alcool', 'Consumo de álcool para higienização das mãos', 'qtd', null, 'neutro', 'Segurança do paciente', 'quantidade consumida no mês', 3),
  ('higiene_sabonete', 'Consumo de sabonete para higienização das mãos', 'qtd', null, 'neutro', 'Segurança do paciente', 'quantidade consumida no mês', 4),
  ('queda_dano', 'Quedas de pacientes com dano', 'nº', 0, 'menor', 'Segurança do paciente', 'nº de quedas com dano no mês', 5),
  ('queda_sem_dano', 'Quedas de pacientes sem dano', 'nº', 0, 'menor', 'Segurança do paciente', 'nº de quedas sem dano no mês', 6),
  ('pacientes_queda', 'Pacientes considerados no indicador de quedas', 'nº', null, 'neutro', 'Segurança do paciente', 'nº de pacientes no período', 7),
  ('amostras_rejeitadas', 'Amostras rejeitadas ou recoletadas', '%', null, 'menor', 'Pré-analítica', 'amostras rejeitadas/recoletadas ÷ total de amostras x 100', 8),
  ('tempo_espera', 'Tempo médio de espera para atendimento', 'min', null, 'menor', 'Pré-analítica', 'tempo médio entre a chegada e o atendimento', 9),
  ('tat', 'Tempo de liberação dos resultados (TAT)', 'h', null, 'menor', 'Pré-analítica', 'tempo médio entre o cadastro e a liberação do laudo', 10),
  ('amostras_nc', 'Amostras não conformes (coagulação, hemólise, contaminação)', '%', null, 'menor', 'Pré-analítica', 'amostras não conformes do tipo ÷ amostras do tipo x 100', 11),
  ('ciq_fora', 'Resultados do CIQ fora do limite', '%', null, 'menor', 'Analítica', 'corridas de CIQ reprovadas ÷ total de corridas x 100', 12),
  ('ceq_aceitavel', 'Controle externo (CEQ) aceitável', '%', null, 'maior', 'Analítica', 'resultados aceitáveis ÷ resultados avaliados x 100', 13),
  ('repeticoes', 'Repetições de exames', '%', null, 'menor', 'Analítica', 'exames repetidos ÷ total de exames x 100', 14),
  ('laudos_prazo', 'Laudos entregues no prazo', '%', null, 'maior', 'Pós-analítica', 'laudos no prazo ÷ total de laudos x 100', 15),
  ('laudos_atraso', 'Laudos liberados com atraso', '%', null, 'menor', 'Pós-analítica', 'laudos com atraso ÷ total de laudos x 100', 16),
  ('laudos_retificados', 'Laudos retificados', '%', null, 'menor', 'Pós-analítica', 'laudos retificados ÷ laudos emitidos x 100', 17),
  ('criticos_prazo', 'Valores críticos comunicados no prazo', '%', null, 'maior', 'Pós-analítica', 'críticos comunicados no prazo ÷ total de críticos x 100', 18),
  ('manifestacoes', 'Manifestações e reclamações', '%', null, 'menor', 'Experiência do paciente', 'manifestações ÷ atendimentos x 100', 19),
  ('nc_prazo', 'Não conformidades encerradas no prazo', '%', null, 'maior', 'Gestão', 'NC encerradas no prazo ÷ NC abertas x 100', 20),
  ('eventos_adversos', 'Incidentes e eventos adversos notificados', 'nº', null, 'neutro', 'Segurança do paciente', 'nº de incidentes notificados', 21),
  ('preventiva', 'Manutenção preventiva cumprida', '%', null, 'maior', 'Gestão', 'preventivas executadas ÷ previstas x 100', 22),
  ('treinamentos', 'Treinamentos realizados', '%', null, 'maior', 'Gestão', 'treinamentos realizados ÷ previstos x 100', 23)
on conflict (codigo) do nothing;

insert into q2_ind_val (codigo, ano, mes, valor, fonte, atualizado_por) values
  ('ident_erros', 2025, 1, 8, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('ident_erros', 2025, 2, 2, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('ident_erros', 2025, 3, 7, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('ident_erros', 2025, 4, 10, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('ident_erros', 2025, 5, 9, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('ident_erros', 2025, 6, 10, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_alcool', 2025, 1, 5, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_alcool', 2025, 2, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_alcool', 2025, 3, 2, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_alcool', 2025, 4, 1, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_alcool', 2025, 5, 2, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_alcool', 2025, 6, 2, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_sabonete', 2025, 1, 2, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_sabonete', 2025, 2, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_sabonete', 2025, 3, 1, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_sabonete', 2025, 4, 1, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_sabonete', 2025, 5, 1, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('higiene_sabonete', 2025, 6, 1, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_dano', 2025, 1, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_dano', 2025, 2, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_dano', 2025, 3, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_dano', 2025, 4, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_dano', 2025, 5, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_dano', 2025, 6, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_sem_dano', 2025, 1, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_sem_dano', 2025, 2, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_sem_dano', 2025, 3, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_sem_dano', 2025, 4, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_sem_dano', 2025, 5, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('queda_sem_dano', 2025, 6, 0, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('pacientes_queda', 2025, 1, 45, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('pacientes_queda', 2025, 2, 20, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('pacientes_queda', 2025, 3, 40, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('pacientes_queda', 2025, 4, 14, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('pacientes_queda', 2025, 5, 25, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('pacientes_queda', 2025, 6, 33, 'Planilha "FR 047 - Indicadores de Segurança do Paciente"', 'Importação das planilhas (09/11/2026)'),
  ('satisfacao', 2025, 1, 96.8, 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', 'Importação das planilhas (09/11/2026)'),
  ('satisfacao', 2025, 2, 99.6, 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', 'Importação das planilhas (09/11/2026)'),
  ('satisfacao', 2025, 3, 98.3, 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', 'Importação das planilhas (09/11/2026)'),
  ('satisfacao', 2025, 4, 97.2, 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', 'Importação das planilhas (09/11/2026)'),
  ('satisfacao', 2025, 5, 98.5, 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', 'Importação das planilhas (09/11/2026)'),
  ('satisfacao', 2025, 6, 98.1, 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', 'Importação das planilhas (09/11/2026)')
on conflict (codigo, ano, mes) do nothing;

-- ================= 09_nao_conformidades.sql =================
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

