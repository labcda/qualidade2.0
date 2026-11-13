/* Texto dos FR 006 (Não conformidade) e FR 038 (Incidentes e Eventos Adversos): espelham a tela Não conformidades › Nova ocorrência do sistema. */
const NL = '\n';
const REGISTRO = [
  '| Campo | Preenchimento |', '|---|---|',
  '| Número | Gerado pelo sistema (OC aaaa-nnn) |',
  '| Tipo | Não conformidade · Incidente / evento adverso · Near miss · Never event |',
  '| Data da ocorrência | Data em que aconteceu |',
  '| Unidade | Matriz ou Mata Fria |',
  '| Setor | Setor onde aconteceu (ex.: Recepção, Coleta, Hematologia) |',
  '| Origem | Reclamação de clientes · Padrões não conformes · Auditoria · Colaborador · Equipamentos não conformes · Pesquisa de satisfação · CEQ · CIQ · Incidente / evento adverso · Visita técnica do NSP · Outros |',
  '| Houve impacto para o paciente? | Sim ou Não |',
  '| Gravidade (incidentes e eventos) | Sem dano (incidente) · Dano leve · Dano moderado · Dano grave · Óbito |',
  '| Descrição do que aconteceu | Texto livre |',
  '| Correção imediata | O que foi feito na hora |',
  '| Registrado por | Colaborador que abriu a ocorrência, com o próprio login, data e hora (automático) |'
].join(NL);
const ANALISE = [
  '| Campo | Preenchimento |', '|---|---|',
  '| Causa raiz (tipo) | Processos · Matéria-prima · Mão de obra · Equipamentos · Ambiente · Outros |',
  '| Causa identificada | Por que aconteceu |',
  '| Plano de ação | O que será feito · Quem · Até quando · Feita (sim/não) |',
  '| Notificação à vigilância (NOTIVISA) | Situação e número do protocolo (incidentes e eventos adversos) |',
  '| Verificação da eficácia | As ações resolveram? Como foi verificado, data e resultado |',
  '| Encerramento | Responsável Técnico ou Diretoria, com identificação eletrônica e data |'
].join(NL);
const FLUXO = 'Fluxo no sistema: **Aberta** (aguardando análise) → **Em análise** (causa raiz) → **Ações em andamento** → **Verificação de eficácia** → **Encerrada**. O sistema guarda o histórico de tudo o que foi feito na ocorrência.';
const FR006 = [
  'Formulário preenchido diretamente no sistema: **Qualidade 2.0 › Não conformidades › Nova ocorrência**. Qualquer colaborador abre a sua ocorrência com o próprio login; a ocorrência vai para a tela do Responsável Técnico e do NSP, que analisam a causa, definem o plano de ação e finalizam.',
  '', '## 1. Abertura (feita por quem identificou a ocorrência)', '', REGISTRO,
  '', '## 2. Análise e plano de ação (Responsável Técnico, NSP e Qualidade)', '', ANALISE,
  '', '## 3. Situação', '', FLUXO,
  '', '## 4. Assinaturas', '', 'O relatório impresso da ocorrência traz a assinatura cadastrada de quem abriu e de quem analisou e encerrou, tiradas do cadastro de assinaturas do sistema.'
].join(NL);
const FR038 = [
  'Este formulário é preenchido no mesmo lugar da não conformidade: **Qualidade 2.0 › Não conformidades › Nova ocorrência**, escolhendo o tipo **Incidente / evento adverso** (ou Near miss / Never event). O registro substitui o antigo formulário em papel.',
  '', '## 1. Abertura (feita por quem identificou ou presenciou)', '', REGISTRO,
  '', 'Classificação do dano: Near miss (quase falha) · Incidente sem dano · Incidente com dano (evento adverso, informando o grau: leve, moderado, grave ou óbito).',
  '', '## 2. Análise (Responsável Técnico e NSP)', '', ANALISE,
  '', '## 3. Eventos graves', '', 'Never event, dano grave ou óbito: o sistema exibe um aviso. A notificação ao NOTIVISA é feita em até 72 horas e abre-se a investigação detalhada no FR 045 (Relatório de Investigação de Evento Adverso Grave ou Óbito), concluída em até 60 dias.',
  '', '## 4. Situação', '', FLUXO
].join(NL);
const FR039 = [
  'Formulário preenchido diretamente no sistema: **Qualidade 2.0 › Rotina do dia › Preencher formulário** (busque por ASO, FR ou VDRL). Controle **quinzenal** dos testes de aglutinação e floculação (PQ 006), com controle negativo e positivo de cada teste.',
  '', '| Campo | Preenchimento |', '|---|---|',
  '| Data | Data do controle |',
  '| Lote / validade dos reagentes | Texto |',
  '| Fator reumatoide (FR) | Controle negativo: não reagente (esperado) · Controle positivo: reagente (esperado) |',
  '| ASLO / ASO (antiestreptolisina O) | Controle negativo: não reagente (esperado) · Controle positivo: reagente (esperado) |',
  '| VDRL | Controle negativo: não reagente (esperado) · Controle positivo: reagente (esperado) |',
  '| Responsável pela execução | Colaborador, com a assinatura cadastrada |',
  '| Observações / ação | Se algum controle não reagir como esperado, o teste é inválido: repetir e descrever a ação |'
].join(NL);
module.exports = { 'FR 006': FR006, 'FR 038': FR038, 'FR 039': FR039 };
