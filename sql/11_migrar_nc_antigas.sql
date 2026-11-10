-- Migra as não conformidades do registro antigo do painel (public.nc_registros) para a tela nova (q2_nc).
-- Pode rodar mais de uma vez: o que já foi migrado não duplica. Não apaga nada do registro antigo.
-- Pré-requisito: sql/09_nao_conformidades.sql já rodado.
insert into q2_nc (numero, tipo, data, unidade, setor, origem, descricao, impacto, gravidade, correcao, aberto_por, status,
                   causa_tipo, causa, acoes, notivisa, eficacia, encerrada_em, encerrado_por, historico, criado_em)
select
  'NC ' || r.codigo,
  'nc',
  case when r.data_abertura ~ '^\d{4}-\d{2}-\d{2}$' then r.data_abertura::date
       when r.data_abertura ~ '^\d{2}/\d{2}/\d{4}$' then to_date(r.data_abertura, 'DD/MM/YYYY')
       else (r.criado_em at time zone 'America/Sao_Paulo')::date end,
  'Matriz', r.setor, r.origem,
  btrim(r.descricao
        || case when r.evidencias <> '' then E'\n\nEvidências: ' || r.evidencias else '' end
        || case when r.processo_afetado <> '' then E'\nProcesso afetado: ' || r.processo_afetado else '' end
        || case when r.gravidade <> '' then E'\nGravidade (registro antigo): ' || r.gravidade else '' end
        || case when r.responsavel_analise <> '' then E'\nResponsável pela análise indicado: ' || r.responsavel_analise else '' end),
  false, '', r.acao_imediata, coalesce(nullif(r.responsavel_abertura, ''), r.criado_por),
  case when lower(r.status) ~ '^(fechad|encerrad|conclu)' then 'encerrada' else 'aberta' end,
  '[]'::jsonb, '', '[]'::jsonb, '', '',
  case when lower(r.status) ~ '^(fechad|encerrad|conclu)' then (r.criado_em at time zone 'America/Sao_Paulo')::date end,
  case when lower(r.status) ~ '^(fechad|encerrad|conclu)' then 'Migração do registro antigo' else '' end,
  jsonb_build_array(jsonb_build_object('quando', now(), 'quem', 'Sistema',
    'texto', 'Migrada do registro antigo (NC ' || r.codigo || ', situação lá: ' || r.status || ')'
             || case when r.hora <> '' then ', hora ' || r.hora else '' end
             || case when r.pdf_path <> '' then '. PDF original: ' || r.pdf_path else '' end)),
  r.criado_em
from public.nc_registros r
order by r.ano, r.numero
on conflict (numero) do nothing;

-- Conferência: devem aparecer as NC antigas (numero começa com "NC ").
select numero, data, setor, status, left(descricao, 60) as descricao from q2_nc where numero like 'NC %' order by numero;
