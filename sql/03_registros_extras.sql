-- =====================================================================
-- Qualidade 2.0 — parte 3: completa a migração (rode DEPOIS do 02_registros_migracao_v2.sql)
-- Supabase > SQL Editor > New query > cole tudo > Run.  Pode rodar mais de uma vez (não duplica).
--
-- Traz também: não conformidades, indicadores e metas, tarefas de rotina, ativos/equipamentos prediais,
-- planos de contingência, assinaturas de registros e revisões de documentos.
-- Só copia: nada é alterado nem apagado na Qualidade anterior.
-- =====================================================================

insert into q2_registros (origem, origem_id, form, titulo, unidade, periodo, dia, item, usuario, dados, criado_em)
select l.aba, l.id, '',
  case l.aba
    when 'NCs' then 'Não conformidade'
    when 'Indicadores' then 'Indicador (valor do mês)'
    when 'IndMetas' then 'Meta de indicador'
    when 'Tarefas' then 'Tarefa de rotina (cadastro)'
    when 'Ativos' then 'Ativo / equipamento'
    when 'Contingencias' then 'Plano de contingência'
    when 'AssinaturasRegistro' then 'Assinatura de registro'
    when 'Revisoes' then 'Revisão de documento'
    else l.aba end,
  coalesce(l.dados->>'unidade', ''),
  coalesce(nullif(l.dados->>'mes', ''), nullif(l.dados->>'periodo', ''), ''),
  coalesce(q2_data_segura(l.dados->>'data'), q2_data_segura(l.dados->>'data_abertura'), q2_data_segura(l.dados->>'mes'), q2_data_segura(l.dados->>'atualizado_em'), l.criado_em::date),
  case l.aba
    when 'NCs' then btrim(coalesce(l.dados->>'codigo', '') || ' ' || coalesce(l.dados->>'descricao', ''))
    when 'Indicadores' then coalesce(l.dados->>'indicador', '')
    when 'IndMetas' then coalesce(l.dados->>'indicador', '')
    when 'Tarefas' then coalesce(l.dados->>'titulo', '')
    when 'Ativos' then coalesce(l.dados->>'nome', '')
    when 'Contingencias' then coalesce(l.dados->>'titulo', '')
    when 'AssinaturasRegistro' then btrim(coalesce(l.dados->>'form', '') || ' ' || coalesce(l.dados->>'ref_id', ''))
    when 'Revisoes' then coalesce(l.dados->>'codigo', '')
    else '' end,
  coalesce(nullif(l.dados->>'usuario', ''), nullif(l.dados->>'registrado_por', ''), nullif(l.dados->>'responsavel', ''), nullif(l.dados->>'nome', ''), ''),
  l.dados,
  l.criado_em
from public.qual_linhas l
where l.aba in ('NCs','Indicadores','IndMetas','Tarefas','Ativos','Contingencias','AssinaturasRegistro','Revisoes')
on conflict (origem, origem_id) do nothing;

-- controle analítico e pendências de apoio: separa por tipo (ex.: HEMA_REPET, HEMA_APOIO) para achar cada um
update q2_registros set titulo = 'Controle analítico · ' || replace(initcap(lower(coalesce(dados->>'tipo', ''))), '_', ' ')
where origem = 'ControleAnalitico' and coalesce(dados->>'tipo', '') <> '';
update q2_registros set titulo = 'Aguardando retorno do apoio · ' || replace(initcap(lower(coalesce(dados->>'tipo', ''))), '_', ' ')
where origem = 'CQPendentes' and coalesce(dados->>'tipo', '') <> '';

select origem, titulo, count(*) as quantidade from q2_registros group by origem, titulo order by origem, titulo;
