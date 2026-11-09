-- =====================================================================
-- Qualidade 2.0 — parte 2: FORMULÁRIOS PREENCHIDOS (traz tudo o que já foi registrado na Qualidade anterior)
-- Supabase > SQL Editor > New query > cole tudo > Run.  Pode rodar mais de uma vez (não duplica).
--
-- O que faz:
--  1) cria a tabela q2_registros (um registro preenchido = uma linha, com os campos em "dados");
--  2) COPIA de qual_linhas (Qualidade anterior) os registros: formulários (FR), controle analítico, checklists, tarefas feitas,
--     manutenções, ordens de serviço, calibrações, proficiências, eventos de contingência e fechamentos mensais;
--  3) traz equipamentos e temperaturas para as telas de temperatura da Qualidade 2.0.
-- NÃO copia: questionários dos pacientes ("QP ..."), links da recepção, senhas/PIN e assinaturas (dados sensíveis).
-- Nada é apagado nem alterado na Qualidade anterior: é só uma cópia.
-- =====================================================================

create table if not exists q2_registros (
  id bigint generated always as identity primary key,
  origem text not null,                       -- aba de origem (Registros, ControleAnalitico, ...)
  origem_id bigint,                           -- id em qual_linhas (evita copiar duas vezes)
  form text not null default '',              -- código do formulário, ex.: FR 001 (vazio se não for um formulário FR)
  titulo text not null default '',            -- nome mostrado na tela
  unidade text not null default '',
  periodo text not null default '',           -- AAAA-MM ou AAAA-MM-DD
  dia date,                                   -- data do registro (filtros e relatórios)
  item text not null default '',
  usuario text not null default '',
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz,
  unique (origem, origem_id)
);
create index if not exists q2_registros_form_idx on q2_registros (form, dia);
create index if not exists q2_registros_origem_idx on q2_registros (origem, dia);
alter table q2_registros enable row level security;
drop policy if exists "q2_registros_ler" on q2_registros;
create policy "q2_registros_ler" on q2_registros for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_registros_esc" on q2_registros;
create policy "q2_registros_esc" on q2_registros for all to authenticated using (q2_papel() in ('admin','elabora','revisa','aprova')) with check (q2_papel() in ('admin','elabora','revisa','aprova'));

alter table q2_temperaturas add column if not exists origem_id bigint;
create unique index if not exists q2_temp_origem_idx on q2_temperaturas (origem_id) where origem_id is not null;

-- funções de apoio (leitura segura de datas e JSON antigos)
create or replace function q2_data_segura(t text) returns date language plpgsql immutable as $$
begin
  if t is null or btrim(t) = '' then return null; end if;
  if t ~ '^\d{4}-\d{2}-\d{2}' then return substr(t, 1, 10)::date; end if;
  if t ~ '^\d{2}/\d{2}/\d{4}' then return to_date(substr(t, 1, 10), 'DD/MM/YYYY'); end if;
  if t ~ '^\d{4}-\d{2}$' then return (t || '-01')::date; end if;
  return null;
exception when others then return null;
end $$;

create or replace function q2_num_seguro(t text) returns numeric language plpgsql immutable as $
begin
  if t is null or btrim(t) = '' then return null; end if;
  return replace(btrim(t), ',', '.')::numeric;
exception when others then return null;
end $;

create or replace function q2_json_seguro(t text) returns jsonb language plpgsql immutable as $$
begin
  if t is null or btrim(t) = '' then return '{}'::jsonb; end if;
  return t::jsonb;
exception when others then return jsonb_build_object('texto', t);
end $$;

create or replace function q2_codigo_form(t text) returns text language sql immutable as $$
  select case when upper(btrim(coalesce(t, ''))) ~ '^[A-Z]{2,3}\s*\d+'
    then substring(upper(btrim(t)) from '^[A-Z]{2,3}') || ' ' || lpad((substring(upper(btrim(t)) from '\d+'))::int::text, 3, '0')
    else '' end
$$;

-- ---------- 1) formulários (FR) e demais registros ----------
insert into q2_registros (origem, origem_id, form, titulo, unidade, periodo, dia, item, usuario, dados, criado_em)
select l.aba, l.id,
  case when l.aba = 'Registros' then q2_codigo_form(l.dados->>'form') else '' end,
  case l.aba
    when 'Registros' then coalesce(nullif(btrim(l.dados->>'form'), ''), 'Formulário')
    when 'Fechamentos' then 'Fechamento mensal · ' || coalesce(l.dados->>'form', '')
    when 'ControleAnalitico' then 'Controle analítico'
    when 'CQPendentes' then 'Controle analítico pendente (aguardando apoio)'
    when 'TarefasFeitas' then 'Tarefa de rotina feita'
    when 'Checklists' then 'Checklist'
    when 'Manutencoes' then 'Manutenção'
    when 'OrdensServico' then 'Ordem de serviço'
    when 'Calibracoes' then 'Calibração'
    when 'Proficiencias' then 'Proficiência / ensaio'
    when 'ContingenciaEventos' then 'Evento de contingência'
    else l.aba end,
  coalesce(l.dados->>'unidade', ''),
  coalesce(nullif(l.dados->>'periodo', ''), ''),
  coalesce(q2_data_segura(l.dados->>'data'), q2_data_segura(l.dados->>'data_realizada'), q2_data_segura(l.dados->>'data_solicitacao'), q2_data_segura(l.dados->>'data_final'),
           q2_data_segura(l.dados->>'periodo'), q2_data_segura(l.dados->>'criado_em'), q2_data_segura(l.dados->>'registrado_em'), l.criado_em::date),
  coalesce(l.dados->>'item', l.dados->>'analito', l.dados->>'titulo', l.dados->>'ativo_nome', l.dados->>'setor', l.dados->>'cenario', ''),
  coalesce(nullif(l.dados->>'usuario', ''), nullif(l.dados->>'registrado_por', ''), nullif(l.dados->>'responsavel', ''), nullif(l.dados->>'solicitante', ''), ''),
  case when l.aba = 'Registros' then
         jsonb_strip_nulls(q2_json_seguro(l.dados->>'dados') || jsonb_build_object('_registro', coalesce(l.dados->>'id', ''), '_versao', coalesce(l.dados->>'versao', ''), '_retifica_de', coalesce(l.dados->>'retifica_de', '')))
       else l.dados end,
  coalesce(
    (case when coalesce(l.dados->>'criado_em', l.dados->>'registrado_em') ~ '^\d{4}-\d{2}-\d{2}' then (coalesce(l.dados->>'criado_em', l.dados->>'registrado_em'))::timestamptz end),
    l.criado_em)
from public.qual_linhas l
where l.aba in ('Registros','Fechamentos','ControleAnalitico','CQPendentes','TarefasFeitas','Checklists','Manutencoes','OrdensServico','Calibracoes','Proficiencias','ContingenciaEventos')
  and not (l.aba = 'Registros' and coalesce(l.dados->>'form', '') ilike 'QP %')
on conflict (origem, origem_id) do nothing;

-- ---------- 2) equipamentos e temperaturas ----------
insert into q2_equipamentos (nome, tipo, local, minimo, maximo, ativo)
select distinct on (lower(btrim(l.dados->>'nome'))) btrim(l.dados->>'nome'),
  case when lower(coalesce(l.dados->>'tipo', '')) like '%freez%' then 'freezer'
       when lower(coalesce(l.dados->>'tipo', '')) like '%banho%' then 'banho-maria'
       when lower(coalesce(l.dados->>'tipo', '')) like '%ambient%' or lower(coalesce(l.dados->>'tipo', '')) like '%sala%' then 'ambiente'
       else 'geladeira' end,
  coalesce(l.dados->>'unidade', ''),
  q2_num_seguro(l.dados->>'faixa_min'), q2_num_seguro(l.dados->>'faixa_max'),
  coalesce(l.dados->>'ativo', '') <> 'nao'
from public.qual_linhas l
where l.aba = 'Equipamentos' and btrim(coalesce(l.dados->>'nome', '')) <> ''
  and not exists (select 1 from q2_equipamentos e where lower(e.nome) = lower(btrim(l.dados->>'nome')));

-- se vieram equipamentos reais, desativa os 5 de exemplo que não existem na Qualidade anterior
update q2_equipamentos set ativo = false
where nome in ('Geladeira de reagentes','Geladeira de amostras','Freezer','Banho-maria','Sala técnica (ambiente)')
  and exists (select 1 from public.qual_linhas where aba = 'Equipamentos')
  and not exists (select 1 from public.qual_linhas x where x.aba = 'Equipamentos' and lower(btrim(x.dados->>'nome')) = lower(q2_equipamentos.nome));

insert into q2_temperaturas (equip_id, equip_nome, dia, turno, valor, situacao, acao, usuario, criado_em, origem_id)
select e.id, e.nome, coalesce(q2_data_segura(l.dados->>'data'), l.criado_em::date),
  coalesce(nullif(l.dados->>'turno', ''), 'manhã'),
  replace(l.dados->>'atual', ',', '.')::numeric,
  case when upper(coalesce(l.dados->>'situacao', '')) like 'DESVIO%' then 'desvio' else 'ok' end,
  coalesce(l.dados->>'acao_corretiva', ''), coalesce(l.dados->>'usuario', ''), l.criado_em, l.id
from public.qual_linhas l
join q2_equipamentos e on lower(e.nome) = lower(btrim(l.dados->>'equip_nome'))
where l.aba = 'Temperaturas' and coalesce(l.dados->>'atual', '') ~ '^-?\d+([.,]\d+)?$'
on conflict (origem_id) where origem_id is not null do nothing;

-- ---------- conferência (resultado aparece na tela) ----------
select 'registros' as tipo, origem as detalhe, count(*) as quantidade from q2_registros group by origem
union all select 'temperaturas', 'q2_temperaturas', count(*) from q2_temperaturas
union all select 'equipamentos', 'q2_equipamentos', count(*) from q2_equipamentos where ativo
order by 1, 2;
