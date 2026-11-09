/* Lote 4 · fase pós-analítica, experiência e direitos do paciente. Base: RDC ANVISA 978/2025, ABNT NBR ISO 15189 itens 7.4, 7.7 e 4.3, Manual ONA. */
module.exports = {
  'PQ 011': {
    n: 'RDC ANVISA nº 978/2025 (laudo e liberação de resultados); ABNT NBR ISO 15189, item 7.4 (processos pós-exame, relato de resultados) e 7.6; Norma SNA-DICQ (SBAC), laudos; Manual ONA, resultados e comunicação',
    e: [
      'O laudo contém, no mínimo: identificação do laboratório, endereço e telefone; identificação e registro do responsável técnico e do profissional que liberou; nome e identificação do paciente; data da coleta e da emissão; exame, amostra e método; resultado com unidade; valores de referência; limitações do método e observações pertinentes.',
      'Os resultados são revisados antes da liberação (coerência com dados anteriores e com o quadro do paciente, valores críticos, resultados de controle aceitáveis) por profissional habilitado, com liberação identificada no LIS.',
      'Valores críticos são comunicados ao médico ou ao paciente imediatamente, com registro de quem comunicou, a quem e quando (L 002 e FR 025).',
      'Retificação de laudo já liberado só ocorre com justificativa, sob autorização do Responsável Técnico, com nova versão identificada e comunicação a quem recebeu o anterior; o original permanece rastreável.',
      'Laudos e dados são guardados por, no mínimo, 5 anos, rastreáveis (PQ 003), e as amostras são guardadas pelo tempo definido para eventual reanálise.'
    ],
    i: 'laudos retificados, laudos liberados com atraso e valores críticos comunicados no prazo, mensais.',
    d: 'laudo com erro: comunicar quem o recebeu, emitir a retificação e registrar a ocorrência para análise da causa.'
  },
  'PQ 042': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 7.4.1 (relato de resultados); LGPD (Lei nº 13.709/2018); Manual ONA, entrega de resultados e privacidade',
    e: [
      'O laudo é entregue ao paciente ou a representante autorizado, após conferência de identidade (documento), por meio físico em envelope fechado ou meio eletrônico seguro com acesso individual.',
      'A entrega a terceiros exige autorização do paciente e registro (FR 070), e as entregas são rastreáveis.',
      'O prazo de entrega informado no atendimento é cumprido; atrasos são registrados e comunicados ao paciente.',
      'Resultados de urgência seguem o fluxo definido (L 003) e o contato imediato quando houver valores críticos (FR 025).'
    ],
    i: 'laudos entregues no prazo e entregas a terceiros sem autorização (meta: zero).',
    d: 'laudo entregue a pessoa não autorizada: acionar o Responsável Técnico, registrar como incidente de dados (PQ 058) e comunicar o paciente.'
  },
  'PQ 027': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 7.7 (reclamações) e 8.6 (melhoria); Código de Defesa do Consumidor (Lei nº 8.078/1990); Norma SNA-DICQ (SBAC), satisfação e reclamações; Manual ONA, experiência do paciente (monitoramento, análise e ações)',
    e: [
      'A satisfação é medida de forma contínua por pesquisa (FR 024), com metodologia definida (índice de satisfação e NPS), meta e análise mensal (PQ 053).',
      'Toda manifestação (elogio, sugestão, reclamação, denúncia) recebida por qualquer canal é registrada no sistema (FR 037) e classificada por criticidade, com prazo de análise definido (FR 085).',
      'O paciente recebe retorno da análise dentro do prazo, mesmo quando a manifestação for anônima e houver canal de resposta; o retorno fica registrado.',
      'As causas das manifestações são analisadas, e as ações de melhoria entram no plano de ação (FR 062); manifestações negativas recorrentes são tratadas em reunião (FR 023).',
      'Os resultados de satisfação e manifestações são levados à análise crítica pela direção (PQ 054).'
    ],
    i: 'índice de satisfação (meta 90%), manifestações por 100 atendimentos e percentual respondido no prazo.',
    d: 'manifestação sem resposta no prazo: escalonar ao Responsável Técnico e à Diretoria e registrar a causa do atraso.'
  },
  'PQ 068': {
    n: 'ABNT NBR ISO 15189, item 4.3 (requisitos relativos ao paciente); RDC ANVISA nº 978/2025; LGPD (Lei nº 13.709/2018); Manual ONA, direitos do paciente e consentimento',
    e: [
      'Procedimentos que envolvem risco ou desconforto relevante, coletas especiais e uso de dados e amostras para fins além da rotina têm consentimento livre e esclarecido, em linguagem simples, registrado no sistema (FR 079).',
      'O paciente é informado sobre finalidade, riscos, alternativas e direito de recusar ou retirar o consentimento sem prejuízo ao atendimento.',
      'Para menores e pacientes sem capacidade de decidir, o consentimento é dado pelo responsável legal, com identificação.',
      'O consentimento fica vinculado ao atendimento e disponível por 5 anos, e o paciente recebe cópia.'
    ],
    i: 'procedimentos que exigem consentimento realizados com termo registrado (meta: 100%).',
    d: 'procedimento sem termo: suspender o que for possível, obter o consentimento e registrar a ocorrência.'
  },
  'PQ 034': {
    n: 'RDC ANVISA nº 978/2025; RDC ANVISA nº 36/2013 (segurança do paciente); Manual ONA, gestão do perfil assistencial',
    e: [
      'O perfil de atendimento é levantado periodicamente (faixas etárias, exames mais realizados, convênios, pacientes com necessidades especiais) a partir do LIS, e registrado no sistema (FR 044).',
      'O resultado orienta o dimensionamento de pessoas, a prioridade de atendimento, o catálogo de exames e o plano de segurança do paciente (MQ 002).',
      'A análise é feita ao menos uma vez por ano e apresentada na análise crítica pela direção (PQ 054).'
    ],
    i: 'perfil atualizado nos últimos 12 meses (sim ou não).',
    d: 'perfil desatualizado: o Supervisor de Qualidade refaz o levantamento no prazo definido pela Diretoria.'
  }
};
