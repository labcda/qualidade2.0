/* Lote 5 · segurança do paciente, biossegurança, saúde ocupacional, resíduos, emergências, pessoas. Base: RDC 36/2013, RDC 978/2025, RDC 222/2018, NRs, ISO 15189 itens 6.2, 6.3, 7.5, 7.8, 8.7, Manual ONA. */
const SP = 'RDC ANVISA nº 36/2013 (segurança do paciente em serviços de saúde); Portaria MS nº 529/2013 (Programa Nacional de Segurança do Paciente); ';
const OC = 'registrar a ocorrência no sistema (Não conformidades), tratar a causa e verificar a eficácia da ação (PQ 014).';
module.exports = {
  'PQ 014': {
    n: 'RDC ANVISA nº 978/2025; RDC ANVISA nº 36/2013; ABNT NBR ISO 15189, itens 7.5 (controle de trabalho não conforme), 8.6 (melhoria) e 8.7 (não conformidades e ações corretivas); Nota Técnica GVIMS/GGTES/ANVISA sobre notificação de incidentes e eventos adversos; Norma SNA-DICQ (SBAC), não conformidades; Manual ONA, gestão de ocorrências',
    e: [
      'Qualquer não conformidade, incidente ou evento adverso é registrado no sistema pelo colaborador que o identificou, no mesmo dia, com número, data, setor e descrição; cada ocorrência segue o fluxo aberta, análise da causa, ações, verificação de eficácia e encerramento.',
      'O trabalho não conforme (resultado ou processo fora do especificado) é contido imediatamente: suspender a atividade ou a liberação, avaliar o impacto em resultados já liberados e comunicar quem foi afetado, inclusive o médico ou o paciente quando necessário.',
      'A ação corretiva trata a causa, e não só o sintoma, com responsável e prazo, e a eficácia é verificada antes do encerramento; ocorrências recorrentes e de alto risco levam a revisão de processos e da matriz de riscos (PQ 049).',
      'Eventos adversos são classificados quanto ao dano, notificados ao Sistema Nacional de Vigilância Sanitária (NOTIVISA) nos prazos da norma, e Never Events em até 72 horas, com investigação em até 60 dias.',
      'Os resultados (quantidade, tipo, tempo de tratamento, recorrência) são indicadores e vão à análise crítica pela direção (PQ 054).'
    ],
    i: 'ocorrências encerradas no prazo (meta definida pela Diretoria), recorrentes e incidentes por mês.',
    d: 'ocorrência sem tratamento no prazo: escalonar ao Responsável Técnico e à Diretoria.'
  },
  'PQ 012': {
    n: 'RDC ANVISA nº 222/2018 (resíduos de serviços de saúde); Resolução CONAMA nº 358/2005; NR-32; ABNT NBR ISO 15189, itens 6.3 e 7.2.7; Manual ONA, gerenciamento de resíduos',
    e: [
      'Material biológico é descartado após o tempo de guarda definido, segregado como resíduo do grupo A, e perfurocortantes como grupo E, conforme o PGRSS (PQ 061).',
      'Material potencialmente infectante recebe descontaminação ou tratamento antes do descarte quando exigido, e culturas e amostras com agentes de risco seguem a regra de inativação.',
      'A saída de resíduos é registrada (FR 075), e o abrigo é identificado, fechado e higienizado.',
      'Os EPIs são usados no descarte, e acidentes seguem o PQ 030.'
    ],
    i: 'geração de resíduos por grupo no mês e não conformidades de segregação.',
    d: 'segregação incorreta ou vazamento: conter, descontaminar, registrar a ocorrência e treinar a equipe.'
  },
  'PQ 019': {
    n: 'RDC ANVISA nº 50/2002 (projetos físicos de estabelecimentos de saúde); ABNT NBR ISO 15189, item 6.3 (instalações e condições ambientais); NR-24 e NR-17; Manual ONA, infraestrutura e ambiente',
    e: [
      'As instalações têm áreas adequadas e separadas para atendimento, coleta, triagem, análises, armazenamento e apoio, com acesso controlado às áreas técnicas.',
      'Condições ambientais (temperatura, umidade, iluminação, ruído, ventilação) são monitoradas onde afetam equipamentos e resultados, com registro (FR 010) e ação em caso de desvio.',
      'Manutenção predial, ar-condicionado, instalações elétricas e hidráulicas seguem checklist periódico (FR 053 e FR 084).',
      'Limpeza e conservação seguem o PQ 028, e o controle de pragas é feito por empresa licenciada com certificado arquivado.'
    ],
    i: 'checklists prediais realizados no prazo e itens não conformes encerrados.',
    d: 'condição ambiental fora do limite ou item predial defeituoso: abrir ordem de serviço (FR 055) e avaliar impacto nos resultados.'
  },
  'PQ 022': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 6.2 (pessoal: competência, treinamento e educação continuada); NR-1 e NR-32 (capacitação); Norma SNA-DICQ (SBAC), treinamento; Manual ONA, desenvolvimento de pessoas',
    e: [
      'Há levantamento anual de necessidades e cronograma de treinamentos (FR 082), cobrindo biossegurança, segurança do paciente, procedimentos, LGPD, resíduos, emergências e as ITAs de cada área.',
      'Todo colaborador novo recebe integração e treinamento nos procedimentos que executa antes de atuar sem supervisão.',
      'Cada treinamento é registrado (FR 002) com data, tema, carga horária, instrutor, participantes e avaliação de eficácia; treinamentos externos têm certificado anexado.',
      'A eficácia é verificada por avaliação prática ou teórica, e falhas geram novo treinamento; os registros alimentam a matriz de competências (PQ 059).'
    ],
    i: 'treinamentos realizados em relação aos previstos e colaboradores com treinamento obrigatório em dia.',
    d: 'treinamento obrigatório vencido: reprogramar em até 30 dias e restringir atividades de risco até concluir.'
  },
  'PQ 059': {
    n: 'ABNT NBR ISO 15189, item 6.2 (competência, autorização e monitoramento do desempenho do pessoal); RDC ANVISA nº 978/2025; Norma SNA-DICQ (SBAC), qualificação do pessoal; Manual ONA, competência profissional',
    e: [
      'Cada função tem descrição de cargo (DC), com requisitos de formação, experiência e registro em conselho quando aplicável, e a seleção e admissão seguem esses requisitos.',
      'A competência é avaliada antes de autorizar o colaborador a executar uma atividade, e periodicamente (no mínimo anualmente) por observação, resultados de controle e avaliação (FR 063).',
      'Autorizações para atividades específicas (liberar resultados, operar equipamentos, coletar) ficam registradas na matriz de competências.',
      'O desempenho insatisfatório gera treinamento, supervisão ou mudança de função, com registro.'
    ],
    i: 'colaboradores com competência avaliada nos últimos 12 meses (meta: 100%).',
    d: 'competência não demonstrada: suspender a autorização da atividade até novo treinamento e reavaliação.'
  },
  'PQ 025': {
    n: 'RDC ANVISA nº 978/2025; NR-32 (segurança e saúde no trabalho em serviços de saúde); NR-6 (EPI); NR-7 (PCMSO); NR-9 (avaliação de riscos); ABNT NBR ISO 15189, item 6.3; Manual ONA, segurança dos profissionais',
    e: [
      'Os riscos biológicos, químicos, físicos, ergonômicos e de acidentes são avaliados, e as medidas de controle (coletivas, administrativas e EPIs) estão definidas por área (PQ 046).',
      'Os EPIs são fornecidos gratuitamente, adequados ao risco, com termo de recebimento e treinamento (FR 021), e o uso é obrigatório.',
      'A vacinação dos profissionais (hepatite B, tétano e outras indicadas) e os exames ocupacionais seguem o PCMSO, com registro (FR 068).',
      'Perfurocortantes são descartados no ato em coletor rígido, sem reencapar; derramamentos têm protocolo de descontaminação.',
      'Substâncias químicas têm FISPQ disponível e rotulagem, e as áreas de risco têm sinalização e acesso restrito.'
    ],
    i: 'acidentes com material biológico por mês e colaboradores com vacinação e exames em dia.',
    d: 'acidente ou descumprimento: aplicar o PQ 030, registrar a ocorrência e reforçar a medida de controle.'
  },
  'PQ 028': {
    n: 'RDC ANVISA nº 978/2025; RDC ANVISA nº 63/2011 (boas práticas de funcionamento); NR-32; Manual ONA, limpeza e controle de infecção',
    e: [
      'A limpeza e a desinfecção seguem rotina por área, com produtos, concentrações, tempo de contato e frequência definidos, e executadas por pessoal treinado com EPIs.',
      'Superfícies com material biológico são descontaminadas imediatamente; as áreas críticas (coleta, bancadas, centrífugas) têm frequência maior.',
      'O cumprimento é registrado nos formulários de limpeza (FR 004, FR 005, FR 035), e os produtos têm registro e validade, com FISPQ.',
      'A eficácia é verificada por inspeção visual e, quando definido, por monitoramento ambiental.'
    ],
    i: 'registros de limpeza preenchidos no prazo (tela Registros do dia).',
    d: 'limpeza não realizada ou registro ausente: executar, registrar a ocorrência e reforçar a orientação.'
  },
  'PQ 029': {
    n: 'RDC ANVISA nº 978/2025; NR-32; recomendações do fabricante de geladeiras e centrífugas; Manual ONA, limpeza e manutenção de equipamentos',
    e: [
      'A limpeza e a descontaminação de geladeiras, freezers e centrífugas seguem periodicidade definida, com produto compatível com o material do equipamento.',
      'A limpeza só é feita com o equipamento desligado ou com amostras realocadas em local com temperatura controlada, e o período fora de operação é registrado.',
      'Após a limpeza, a temperatura é verificada antes de recolocar amostras e reagentes, e o registro é feito no sistema.'
    ],
    i: 'limpezas programadas realizadas no prazo.',
    d: 'derramamento ou limpeza vencida: descontaminar imediatamente e registrar a ocorrência.'
  },
  'PQ 030': {
    n: 'NR-32 (acidentes com perfurocortantes e material biológico); NR-7 (PCMSO); Lei nº 8.213/1991 (comunicação de acidente de trabalho); RDC ANVISA nº 978/2025; Manual ONA, segurança do profissional',
    e: [
      'Após acidente com material biológico: lavar a área com água e sabão, comunicar o chefe imediato e o Responsável Técnico, e encaminhar o profissional a atendimento médico no tempo indicado pelo protocolo (profilaxia pós-exposição o mais cedo possível).',
      'O acidente é registrado no sistema (FR 067) e comunicado à Previdência pela CAT quando for acidente de trabalho; o paciente-fonte é avaliado conforme o protocolo.',
      'A causa é investigada e as medidas de prevenção são implementadas (PQ 046), e o profissional é acompanhado conforme o PCMSO.',
      'O profissional pode recusar condutas, mediante termo (FR 018), e a recusa é registrada.'
    ],
    i: 'acidentes com material biológico e percentual comunicado e registrado no prazo.',
    d: 'acidente não comunicado ou sem registro: registrar imediatamente, comunicar a Diretoria e iniciar a investigação.'
  },
  'PQ 031': {
    n: SP + 'RDC ANVISA nº 978/2025; Manual ONA, atendimento a intercorrências',
    e: [
      'A equipe sabe reconhecer e atender mal-estar, desmaio, convulsão, hipoglicemia e reação alérgica, mantendo o paciente em local seguro e chamando o Responsável Técnico.',
      'O kit de emergência e os telefones do serviço de referência estão acessíveis e conferidos (FR 080; PQ 069).',
      'Toda intercorrência é registrada no sistema (Não conformidades ou FR 081) com horário, conduta, destino e orientação à família, e é analisada pelo NSP.',
      'A equipe recebe treinamento periódico em primeiros socorros (PQ 022).'
    ],
    i: 'intercorrências por mês e tempo até a primeira conduta.',
    d: 'conduta inadequada ou atraso: registrar a ocorrência, analisar a causa e treinar a equipe.'
  },
  'PQ 032': {
    n: SP + 'RDC ANVISA nº 978/2025; Manual ONA, segurança do paciente',
    e: [
      'O Núcleo de Segurança do Paciente (NSP) é instituído por ato da Diretoria, com membros, coordenador e regimento (FR 016), e cadastrado no órgão sanitário.',
      'O NSP elabora e acompanha o Plano de Segurança do Paciente (MQ 002 e PQ 033), com ações para identificação do paciente, higienização das mãos, comunicação, prevenção de quedas e notificação de eventos.',
      'O NSP analisa as ocorrências registradas no sistema, classifica o dano, notifica no NOTIVISA quando devido e propõe melhorias.',
      'As reuniões têm periodicidade definida (FR 078) e ata registrada no sistema (FR 023), com acompanhamento de pendências.',
      'O NSP divulga os resultados à equipe e à direção (FR 083).'
    ],
    i: 'reuniões do NSP realizadas conforme o cronograma e ações do plano concluídas no prazo.',
    d: 'reunião não realizada: reagendar em até 15 dias e registrar a justificativa.'
  },
  'PQ 033': {
    n: SP + 'RDC ANVISA nº 36/2013, que exige o Plano de Segurança do Paciente em Serviços de Saúde (PSP); Manual ONA, segurança do paciente (níveis 1 e 2)',
    e: [
      'O plano identifica os riscos aos pacientes, define estratégias e ações (identificação, higiene das mãos, comunicação, quedas, eventos adversos, cultura de segurança) com responsáveis, prazos e indicadores.',
      'Está disponível a todos os profissionais, e a equipe é capacitada (PQ 022).',
      'O plano é monitorado e a eficácia das metas é analisada periodicamente (FR 083), e revisado ao menos uma vez por ano.'
    ],
    i: 'ações do plano concluídas no prazo e indicadores de segurança dentro da meta.',
    d: 'meta não atingida: analisar a causa e incluir ação no plano de melhoria.'
  },
  'PQ 035': {
    n: SP + 'Protocolo de Prevenção de Quedas (Portaria MS nº 2.095/2013); Manual ONA, segurança do paciente',
    e: [
      'Pacientes com risco de queda (idosos, crianças, gestantes, pessoas com mobilidade reduzida, pós-coleta com mal-estar) são identificados no atendimento e orientados.',
      'O ambiente é seguro (piso, sinalização de piso molhado, cadeiras estáveis, apoio), e há acompanhamento do paciente até se recuperar após a coleta.',
      'Toda queda é registrada no sistema (Não conformidades) como evento, com dano, conduta e análise pelo NSP, e é indicador mensal.'
    ],
    i: 'quedas com e sem dano por mês (tela Indicadores).',
    d: 'queda: prestar socorro, registrar o evento e analisar a causa com o NSP.'
  },
  'PQ 036': {
    n: SP + 'Protocolo de Identificação do Paciente (Portaria MS nº 2.095/2013); RDC ANVISA nº 978/2025; Manual ONA, identificação segura',
    e: [
      'O paciente é identificado com, no mínimo, dois identificadores (nome completo e data de nascimento), conferidos de forma ativa (o paciente informa) e com documento, em cada etapa.',
      'As etiquetas são impressas na presença do paciente e conferidas após a impressão; a identificação do tubo ocorre antes de sair da frente do paciente.',
      'Falhas de identificação são registradas no sistema como ocorrência e como indicador mensal.'
    ],
    i: 'erros de identificação por mês (tela Indicadores).',
    d: 'erro de identificação: segregar, recoletar quando necessário, comunicar o paciente e registrar o evento.'
  },
  'PQ 037': {
    n: SP + 'Protocolo de Comunicação Efetiva (Joint Commission/OMS, metas de segurança); Manual ONA, comunicação efetiva',
    e: [
      'Informações críticas (valores críticos, trocas de turno, pendências) são passadas de forma completa, com confirmação do recebimento (leitura de volta).',
      'Resultados críticos são comunicados ao médico ou ao paciente imediatamente, com registro de quem recebeu e quando (FR 025).',
      'A comunicação interna usa canais definidos (grupo institucional, mural, reuniões), e as decisões são registradas.'
    ],
    i: 'valores críticos comunicados no prazo.',
    d: 'falha de comunicação: registrar a ocorrência e revisar o fluxo.'
  },
  'PQ 038': {
    n: SP + 'Nota Técnica GVIMS/GGTES/ANVISA sobre notificação de incidentes e eventos adversos; NOTIVISA; Manual ONA, notificação e análise de eventos',
    e: [
      'Todos os colaboradores registram incidentes, eventos adversos e near miss no sistema (Não conformidades), no mesmo dia, sem punição pelo registro (cultura justa).',
      'O NSP classifica o dano, analisa a causa e notifica no NOTIVISA conforme os prazos, e eventos graves e Never Events seguem o PQ 070.',
      'O paciente e a família são informados com clareza e transparência quando houver evento adverso que os afete.',
      'Os resultados são divulgados à equipe e à direção (FR 083).'
    ],
    i: 'incidentes e eventos notificados, eventos notificados no NOTIVISA no prazo.',
    d: 'evento não notificado no prazo: notificar imediatamente, registrar o motivo do atraso e reforçar o fluxo.'
  },
  'PQ 039': {
    n: SP + 'RDC ANVISA nº 42/2010 e Protocolo de Higienização das Mãos (OMS, cinco momentos); NR-32; Manual ONA, controle de infecção',
    e: [
      'A higienização das mãos é feita nos cinco momentos (antes do contato com o paciente, antes de procedimento asséptico, após risco de exposição a fluidos, após contato com o paciente e após contato com o ambiente do paciente).',
      'Pias, sabonete, papel toalha e preparação alcoólica estão disponíveis nos pontos de assistência, e a técnica é treinada (PQ 022).',
      'A adesão é monitorada por observação e pelo consumo de álcool e sabonete (tela Indicadores).'
    ],
    i: 'consumo de álcool e sabonete e adesão observada, mensais.',
    d: 'baixa adesão: reforçar o treinamento e registrar a ação no plano de melhoria.'
  },
  'PQ 040': {
    n: SP + 'avaliação da cultura de segurança do paciente (AHRQ/ANVISA, instrumento HSOPSC); Manual ONA, cultura de segurança e cultura justa',
    e: [
      'A cultura de segurança é avaliada periodicamente com questionário padronizado aplicado à equipe, de forma anônima, e os resultados são analisados pelo NSP.',
      'Os pontos fortes e as oportunidades de melhoria viram ações do plano (MQ 002 e FR 062).',
      'O laboratório promove a cultura justa: erros são tratados como falha de sistema, com apoio ao profissional, e condutas imprudentes são tratadas de forma distinta.'
    ],
    i: 'participação da equipe na avaliação e evolução dos resultados entre as avaliações.',
    d: 'baixa participação ou piora do resultado: ação de sensibilização e nova avaliação.'
  },
  'PQ 041': {
    n: SP + 'lista de Never Events do Ministério da Saúde/ANVISA e Nota Técnica de notificação (notificação em até 72 horas); Manual ONA, eventos sentinela',
    e: [
      'Os Never Events aplicáveis ao laboratório (por exemplo, identificação errada de amostra com dano grave, resultado trocado com dano) estão listados e a equipe os conhece.',
      'A ocorrência é registrada no sistema no mesmo dia, com tipo Never Event, e a Diretoria e o Responsável Técnico são acionados imediatamente.',
      'Notificação ao NOTIVISA em até 72 horas e investigação detalhada em até 60 dias (FR 045), com ações para evitar recorrência.'
    ],
    i: 'Never Events notificados no prazo (meta: 100%) e ocorridos (meta: zero).',
    d: 'Never Event: aplicar o PQ 070, investigar e comunicar o paciente e a família.'
  },
  'PQ 046': {
    n: 'NR-1 (gerenciamento de riscos ocupacionais, PGR); NR-7 (PCMSO); NR-9; NR-32; NR-6 (EPI); Manual ONA, saúde e segurança do trabalho',
    e: [
      'O Programa de Gerenciamento de Riscos (PGR) identifica e avalia os perigos por função, com plano de ação e revisão periódica.',
      'O PCMSO define exames admissionais, periódicos e demissionais, e o controle da vacinação (FR 068).',
      'EPIs adequados são fornecidos e conferidos (FR 021), e a CIPA ou o designado participa da avaliação e das investigações (PQ 067).',
      'Acidentes e quase acidentes são registrados e investigados (PQ 030).'
    ],
    i: 'colaboradores com exames e vacinação em dia e acidentes por mês.',
    d: 'risco não controlado: medida imediata, registro no sistema e revisão do PGR.'
  },
  'PQ 047': {
    n: 'Instrução técnica do Corpo de Bombeiros do estado (prevenção e combate a incêndio); NR-23 (proteção contra incêndios); Manual ONA, segurança das instalações',
    e: [
      'Extintores e sinalização de emergência estão instalados, com validade em dia, e as rotas de fuga, desobstruídas.',
      'A equipe é treinada em combate inicial a incêndio e abandono, e os simulados são registrados (FR 066).',
      'O AVCB ou CLCB é mantido em dia (Documentos legais), e as inspeções são registradas.'
    ],
    i: 'extintores com validade em dia e simulados realizados no ano.',
    d: 'extintor vencido ou rota obstruída: corrigir imediatamente e registrar a ocorrência.'
  },
  'PQ 048': {
    n: 'RDC ANVISA nº 978/2025 (posto de coleta); NR-32; RDC ANVISA nº 63/2011; Manual ONA, segurança em unidades de coleta',
    e: [
      'O posto de coleta cumpre os mesmos requisitos de biossegurança, higiene, identificação e descarte da matriz.',
      'Há pia com sabonete, papel toalha e álcool, descarte de perfurocortantes, EPIs e kit de limpeza, e os registros de limpeza e temperatura são feitos no sistema.',
      'O posto é auditado periodicamente (FR 048), e as não conformidades são tratadas no sistema.'
    ],
    i: 'auditorias do posto realizadas e itens não conformes encerrados.',
    d: 'item não conforme: abrir ocorrência, corrigir e reauditar o item.'
  },
  'PQ 050': {
    n: 'ABNT NBR ISO 15189, item 7.8 (continuidade e preparação para emergências); RDC ANVISA nº 978/2025; ABNT NBR ISO 22301 (referência de continuidade); Manual ONA, gestão de contingências',
    e: [
      'Os cenários de interrupção (falta de energia, falha do LIS, falha de equipamento, indisponibilidade de água, pandemia, desastre) têm plano de resposta e de retomada, com responsáveis e contatos.',
      'O plano é testado ao menos uma vez por ano em simulação (FR 066), e os resultados geram melhorias.',
      'Em contingência, os formulários de papel de emergência permitem cadastro e liberação manual, e os dados são digitados no sistema quando ele voltar.',
      'O plano é revisado a cada ano e quando houver mudança relevante.'
    ],
    i: 'simulações realizadas no ano e tempo de recuperação em ocorrências reais.',
    d: 'contingência acionada: registrar a ocorrência (FR 051), avaliar o impacto e revisar o plano.'
  },
  'PQ 060': {
    n: 'RDC ANVISA nº 36/2013; NOTIVISA (tecnovigilância e queixas técnicas); Manual ONA, vigilância de produtos para saúde',
    e: [
      'Queixas técnicas e eventos adversos com produtos para saúde (reagentes, equipamentos, materiais) são registrados (FR 071) e notificados ao fabricante e à ANVISA pelo NOTIVISA quando devido.',
      'Alertas sanitários e recolhimentos de lote são verificados pelo Responsável Técnico, que retira o produto afetado e avalia o impacto nos resultados.',
      'As notificações e o retorno do fabricante ficam anexados ao registro no sistema.'
    ],
    i: 'queixas técnicas notificadas no prazo.',
    d: 'produto suspeito: segregar, não usar, notificar e registrar a ocorrência.'
  },
  'PQ 061': {
    n: 'RDC ANVISA nº 222/2018; Resolução CONAMA nº 358/2005; NR-32; Manual ONA, gerenciamento de resíduos',
    e: [
      'O PGRSS descreve a geração, a segregação, o acondicionamento, a coleta, o armazenamento e a destinação dos resíduos de cada grupo, com responsável pelo plano.',
      'A coleta, o tratamento e a destinação são feitos por empresa licenciada, com manifesto e certificado arquivados.',
      'A geração por grupo é registrada (FR 075) e a equipe é treinada (PQ 022).'
    ],
    i: 'geração por grupo e conformidade da destinação.',
    d: 'desvio de segregação ou de destinação: corrigir, registrar a ocorrência e treinar.'
  },
  'PQ 067': {
    n: 'NR-5 (CIPA); RDC ANVISA nº 36/2013 (Núcleo de Segurança do Paciente); Manual ONA, liderança e comissões',
    e: [
      'O designado de CIPA e os membros do NSP são nomeados por ato formal (FR 016), com mandato e atribuições definidas.',
      'As reuniões seguem o cronograma anual (FR 078), com pauta, lista de presença e ata no sistema (FR 023).',
      'As pendências das reuniões anteriores são acompanhadas, e a efetividade das comissões é analisada na análise crítica (PQ 054).'
    ],
    i: 'reuniões realizadas no prazo e pendências concluídas.',
    d: 'reunião não realizada: reagendar em até 15 dias.'
  },
  'PQ 069': {
    n: 'RDC ANVISA nº 978/2025; Manual ONA, atendimento a urgências e emergências; protocolos de suporte básico de vida (BLS) como referência técnica',
    e: [
      'O serviço de referência para urgência e emergência (SAMU 192, ambulância ou hospital de referência) é definido e acordado por contrato ou pactuação, com telefones afixados e atualizados.',
      'O kit de emergência é conferido mensalmente e após o uso (FR 080), e a remoção é registrada (FR 081).',
      'A equipe é treinada em primeiros socorros e em acionamento do serviço de referência, com simulados.'
    ],
    i: 'kits conferidos no prazo e tempo até o acionamento da remoção.',
    d: 'kit incompleto ou vencido: repor imediatamente e registrar a ocorrência.'
  },
  'PQ 070': {
    n: SP + 'Nota Técnica da ANVISA sobre eventos adversos graves e óbito; Manual ONA, eventos sentinela',
    e: [
      'Evento adverso grave ou óbito é comunicado à Diretoria e ao Responsável Técnico imediatamente, registrado no sistema no mesmo dia e notificado ao NOTIVISA.',
      'A investigação detalhada (FR 045) é concluída em até 60 dias, com análise de causa raiz e plano de ação.',
      'O paciente e a família recebem comunicação clara e apoio, e os documentos ficam no sistema para a autoridade sanitária.'
    ],
    i: 'eventos graves notificados e investigados no prazo (meta: 100%).',
    d: 'prazo descumprido: escalonar à Diretoria e registrar o motivo.'
  },
  'PQ 026': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 5.3 e 6.2; Manual ONA, dimensionamento e atribuições',
    e: [
      'O memorial descreve as atividades de cada função, em consonância com as descrições de cargo (DC) e com a capacidade técnica do profissional.',
      'O dimensionamento da equipe considera a demanda do perfil de atendimento (PQ 034), e a distribuição é revista quando a demanda muda.',
      'As atribuições são registradas e conhecidas por todos, e a delegação de atividades é autorizada por competência (PQ 059).'
    ],
    i: 'revisão do memorial e do dimensionamento nos últimos 12 meses.',
    d: 'atribuição sem competência: suspender a atividade e treinar.'
  }
};
