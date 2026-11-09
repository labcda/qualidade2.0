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
