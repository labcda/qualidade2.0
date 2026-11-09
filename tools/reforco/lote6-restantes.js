/* Lote 6 · manuais, proteção de dados, documentos externos e coleta de sangue (ITA 001). */
module.exports = {
  'MQ 001': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189 (estrutura e governança, recursos, processos e sistema de gestão: itens 4 a 8); Norma SNA-DICQ (SBAC), 7ª edição; Manual ONA, requisitos de liderança e gestão',
    e: [
      'O manual descreve a política da qualidade, os objetivos, a estrutura organizacional, as responsabilidades e a interação dos processos, e remete a cada procedimento (PQ) que implementa cada requisito.',
      'A direção compromete-se com o sistema de gestão, a imparcialidade e a melhoria contínua (PQ 057 e PQ 054), e assegura os recursos necessários.',
      'O manual e os documentos citados estão disponíveis a todos os colaboradores no sistema (Qualidade 2.0), e as revisões seguem o PQ 001 e o PQ 002.',
      'A conformidade do sistema é verificada por auditorias internas (PQ 013), indicadores (PQ 053) e controle externo da qualidade (PQ 007).'
    ],
    i: 'revisão anual do manual realizada e política da qualidade divulgada a toda a equipe.',
    d: 'requisito sem procedimento correspondente: elaborar o documento e registrar a ação no plano de melhoria.'
  },
  'MQ 002': {
    n: 'RDC ANVISA nº 36/2013 (Plano de Segurança do Paciente); Portaria MS nº 529/2013; Protocolos básicos de segurança do paciente (Portaria MS nº 2.095/2013); Manual ONA, segurança do paciente (níveis 1, 2 e 3)',
    e: [
      'O plano descreve os riscos do serviço, as estratégias e ações, os responsáveis e os prazos, e cobre identificação do paciente, higienização das mãos, comunicação, prevenção de quedas, notificação de eventos e cultura de segurança.',
      'Está disponível a todos os colaboradores no sistema e é conhecido pela equipe por meio de treinamento (PQ 022).',
      'É monitorado por indicadores (PQ 053) e relatório periódico do NSP (FR 083), com análise da eficácia das ações, e revisado ao menos uma vez por ano.',
      'Os incidentes e eventos adversos são registrados no sistema pelo próprio colaborador e analisados pelo NSP (PQ 014 e PQ 038).'
    ],
    i: 'ações do plano concluídas no prazo e relatório periódico de segurança do paciente emitido.',
    d: 'meta não cumprida: analisar a causa e incluir nova ação no plano.'
  },
  'PQ 058': {
    n: 'Lei nº 13.709/2018 (LGPD); ABNT NBR ISO 15189, itens 4.2 (confidencialidade) e 7.6 (gestão de informação); ABNT NBR ISO/IEC 27001 (referência de segurança da informação); Manual ONA, gestão da informação e privacidade',
    e: [
      'O laboratório tem encarregado de dados, mapeamento dos dados pessoais, base legal por finalidade (tutela da saúde, obrigação legal e consentimento quando aplicável) e aviso de privacidade ao paciente.',
      'O acesso aos dados é por perfil e por necessidade, com login pessoal; todos os colaboradores assinam o termo de sigilo (FR 013).',
      'Incidentes com dados pessoais são registrados no sistema, avaliados e comunicados ao titular e à ANPD quando houver risco relevante.',
      'Os titulares podem exercer seus direitos (acesso, correção, informação), e as solicitações são registradas e respondidas no prazo legal.',
      'Contratos com fornecedores que tratam dados incluem cláusulas de proteção, e os dados são guardados pelo prazo legal.'
    ],
    i: 'colaboradores com termo de sigilo vigente e incidentes de dados no período.',
    d: 'incidente de dados: conter, avaliar o risco, registrar e comunicar conforme a LGPD.'
  },
  'PQ 062': {
    n: 'RDC ANVISA nº 978/2025; RDC ANVISA nº 63/2011; legislação sanitária, de bombeiros e ambiental aplicável; ABNT NBR ISO 15189, item 5.1 (entidade legal); Manual ONA, requisitos de regularidade',
    e: [
      'Alvará de funcionamento, licença sanitária, CNES, certidão de responsabilidade técnica, AVCB/CLCB, licença ambiental quando exigida e contratos críticos são controlados com data de validade (tela Documentos legais).',
      'O sistema alerta os documentos próximos do vencimento, e a renovação é iniciada com antecedência definida (FR 073).',
      'A legislação e as normas aplicáveis são identificadas e mantidas atualizadas, e as mudanças são avaliadas quanto ao impacto nos procedimentos.',
      'Cópias digitais ficam no sistema, e originais ficam acessíveis para a fiscalização.'
    ],
    i: 'documentos legais vigentes (meta: 100%) e vencimentos nos próximos 60 dias.',
    d: 'documento vencido: priorizar a renovação, informar a Diretoria e registrar a ocorrência.'
  },
  'ITA 001': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 7.2.4 (coleta e manuseio de amostras primárias); NR-32; CLSI GP41 (coleta de sangue venoso); Manual ONA, coleta segura',
    e: [
      'O paciente é identificado com dois identificadores (PQ 036), o preparo é confirmado, e os materiais estão dentro da validade.',
      'A ordem dos tubos, o tempo de torniquete, a antissepsia, a homogeneização e o volume são seguidos; os tubos são identificados na presença do paciente.',
      'O descarte de agulhas é imediato em coletor rígido, sem reencapar, e as luvas são trocadas entre pacientes, com higiene das mãos.',
      'Intercorrências e falhas de coleta são registradas e tratadas (PQ 031 e PQ 014).'
    ],
    i: 'amostras recoletadas por falha de coleta e acidentes por perfurocortantes por mês.',
    d: 'falha de coleta ou acidente: aplicar o PQ 031 ou o PQ 030 e registrar a ocorrência.'
  }
};
