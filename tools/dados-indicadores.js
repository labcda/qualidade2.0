/* Gera data/indicadores.js (modo demonstração) e sql/08_indicadores.sql (banco) a partir das planilhas de indicadores
   (FR 047 Indicadores de Segurança do Paciente e Indicador Pesquisa de Satisfação), lidas em 09/11/2026.
   Os valores abaixo foram extraídos das planilhas; julho a dezembro/2025 estavam zerados (ainda não coletados) e não foram importados. */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const DEF = [
  // codigo, nome, unidade, meta, sentido (maior = quanto maior melhor; menor = quanto menor melhor; neutro), grupo, fórmula
  ['satisfacao', 'Satisfação dos pacientes', '%', 90, 'maior', 'Experiência do paciente', 'respostas de satisfação atendida ÷ perguntas respondidas x 100 (PQ 027)'],
  ['ident_erros', 'Erros de identificação do paciente ou da amostra', 'nº', null, 'menor', 'Segurança do paciente', 'nº de erros de identificação no mês'],
  ['higiene_alcool', 'Consumo de álcool para higienização das mãos', 'qtd', null, 'neutro', 'Segurança do paciente', 'quantidade consumida no mês'],
  ['higiene_sabonete', 'Consumo de sabonete para higienização das mãos', 'qtd', null, 'neutro', 'Segurança do paciente', 'quantidade consumida no mês'],
  ['queda_dano', 'Quedas de pacientes com dano', 'nº', 0, 'menor', 'Segurança do paciente', 'nº de quedas com dano no mês'],
  ['queda_sem_dano', 'Quedas de pacientes sem dano', 'nº', 0, 'menor', 'Segurança do paciente', 'nº de quedas sem dano no mês'],
  ['pacientes_queda', 'Pacientes considerados no indicador de quedas', 'nº', null, 'neutro', 'Segurança do paciente', 'nº de pacientes no período'],
  ['amostras_rejeitadas', 'Amostras rejeitadas ou recoletadas', '%', null, 'menor', 'Pré-analítica', 'amostras rejeitadas/recoletadas ÷ total de amostras x 100'],
  ['tempo_espera', 'Tempo médio de espera para atendimento', 'min', null, 'menor', 'Pré-analítica', 'tempo médio entre a chegada e o atendimento'],
  ['tat', 'Tempo de liberação dos resultados (TAT)', 'h', null, 'menor', 'Pré-analítica', 'tempo médio entre o cadastro e a liberação do laudo'],
  ['amostras_nc', 'Amostras não conformes (coagulação, hemólise, contaminação)', '%', null, 'menor', 'Pré-analítica', 'amostras não conformes do tipo ÷ amostras do tipo x 100'],
  ['ciq_fora', 'Resultados do CIQ fora do limite', '%', null, 'menor', 'Analítica', 'corridas de CIQ reprovadas ÷ total de corridas x 100'],
  ['ceq_aceitavel', 'Controle externo (CEQ) aceitável', '%', null, 'maior', 'Analítica', 'resultados aceitáveis ÷ resultados avaliados x 100'],
  ['repeticoes', 'Repetições de exames', '%', null, 'menor', 'Analítica', 'exames repetidos ÷ total de exames x 100'],
  ['laudos_prazo', 'Laudos entregues no prazo', '%', null, 'maior', 'Pós-analítica', 'laudos no prazo ÷ total de laudos x 100'],
  ['laudos_atraso', 'Laudos liberados com atraso', '%', null, 'menor', 'Pós-analítica', 'laudos com atraso ÷ total de laudos x 100'],
  ['laudos_retificados', 'Laudos retificados', '%', null, 'menor', 'Pós-analítica', 'laudos retificados ÷ laudos emitidos x 100'],
  ['criticos_prazo', 'Valores críticos comunicados no prazo', '%', null, 'maior', 'Pós-analítica', 'críticos comunicados no prazo ÷ total de críticos x 100'],
  ['manifestacoes', 'Manifestações e reclamações', '%', null, 'menor', 'Experiência do paciente', 'manifestações ÷ atendimentos x 100'],
  ['nc_prazo', 'Não conformidades encerradas no prazo', '%', null, 'maior', 'Gestão', 'NC encerradas no prazo ÷ NC abertas x 100'],
  ['eventos_adversos', 'Incidentes e eventos adversos notificados', 'nº', null, 'neutro', 'Segurança do paciente', 'nº de incidentes notificados'],
  ['preventiva', 'Manutenção preventiva cumprida', '%', null, 'maior', 'Gestão', 'preventivas executadas ÷ previstas x 100'],
  ['treinamentos', 'Treinamentos realizados', '%', null, 'maior', 'Gestão', 'treinamentos realizados ÷ previstos x 100']
];
// valores de 2025 (jan a jun), conforme as planilhas
const VAL = {
  ident_erros: [8, 2, 7, 10, 9, 10],
  higiene_alcool: [5, 0, 2, 1, 2, 2],
  higiene_sabonete: [2, 0, 1, 1, 1, 1],
  queda_dano: [0, 0, 0, 0, 0, 0],
  queda_sem_dano: [0, 0, 0, 0, 0, 0],
  pacientes_queda: [45, 20, 40, 14, 25, 33],
  satisfacao: [96.8, 99.6, 98.3, 97.2, 98.5, 98.1]
};
const FONTE = { satisfacao: 'Planilha "Indicador Pesquisa de Satisfação em Porcentagem"', default: 'Planilha "FR 047 - Indicadores de Segurança do Paciente"' };
const defs = DEF.map(function (d, i) { return { codigo: d[0], nome: d[1], unidade: d[2], meta: d[3], sentido: d[4], grupo: d[5], formula: d[6], ordem: i + 1 }; });
const vals = [];
Object.keys(VAL).forEach(function (c) { VAL[c].forEach(function (v, i) { vals.push({ codigo: c, ano: 2025, mes: i + 1, valor: v, fonte: FONTE[c] || FONTE.default }); }); });
fs.writeFileSync(path.join(R, 'data', 'indicadores.js'), '/* Indicadores: definições e valores iniciais das planilhas (tools/dados-indicadores.js) */\nwindow.Q2_IND_DEF = ' + JSON.stringify(defs) + ';\nwindow.Q2_IND_VAL = ' + JSON.stringify(vals) + ';\n');
const q = function (s) { return s === null || s === undefined ? 'null' : "'" + String(s).replace(/'/g, "''") + "'"; };
let sql = `-- Qualidade 2.0 · indicadores (definições, metas e valores mensais)
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
` + defs.map(function (d) { return '  (' + [q(d.codigo), q(d.nome), q(d.unidade), d.meta === null ? 'null' : d.meta, q(d.sentido), q(d.grupo), q(d.formula), d.ordem].join(', ') + ')'; }).join(',\n') + `
on conflict (codigo) do nothing;

insert into q2_ind_val (codigo, ano, mes, valor, fonte, atualizado_por) values
` + vals.map(function (v) { return '  (' + [q(v.codigo), v.ano, v.mes, v.valor, q(v.fonte), q('Importação das planilhas (09/11/2026)')].join(', ') + ')'; }).join(',\n') + `
on conflict (codigo, ano, mes) do nothing;
`;
fs.writeFileSync(path.join(R, 'sql', '08_indicadores.sql'), sql);
console.log('definições:', defs.length, 'valores:', vals.length);
