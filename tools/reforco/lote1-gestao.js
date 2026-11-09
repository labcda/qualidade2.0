/* Lote 1 · gestão e sistema da qualidade. Base: RDC ANVISA 978/2025, ABNT NBR ISO 15189 (itens conforme a edição 2022; conferir com a edição adotada pela norma SNA-DICQ vigente), Manual ONA. */
module.exports = {
  'PQ 001': {
    n: 'RDC ANVISA nº 978/2025 (sistema de gestão da qualidade e documentação); ABNT NBR ISO 15189, itens 8.2 (documentação do sistema de gestão) e 8.3 (controle dos documentos); Norma SNA-DICQ (SBAC), requisitos de documentação; Manual ONA, requisitos de gestão documental',
    e: [
      'Os objetivos, a política da qualidade e os procedimentos que sustentam o serviço estão documentados e acessíveis a todos os colaboradores (MQ 001 e documentos controlados).',
      'Todo documento tem identificação única (código), título, versão, data de vigência, paginação e responsável; isso é gerado pelo sistema, que exige código e título para salvar um documento.',
      'Todo documento é aprovado por pessoa autorizada antes de entrar em uso: no sistema, somente o perfil de aprovação (Responsável Técnico ou Diretoria) libera um documento como vigente.',
      'A estrutura de cada tipo de documento (PQ, ITA, DC, FR, MQ) é padronizada, e a linguagem é objetiva e compreensível por quem executa a tarefa.',
      'Os documentos são analisados criticamente em intervalo definido (no máximo 12 meses) e sempre que mudar norma, processo, equipamento ou resultado de auditoria.'
    ],
    i: 'percentual de documentos com revisão em dia (meta: 100%), obtido da lista de documentos do sistema, e análise na análise crítica pela direção (PQ 054).',
    d: 'documento vencido, sem aprovação ou fora do padrão é tratado como não conformidade (PQ 014) e a versão anterior só continua em uso até a nova ser aprovada.'
  },
  'PQ 002': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 8.3 (controle dos documentos do sistema de gestão); Norma SNA-DICQ (SBAC), controle de documentos e dados; Manual ONA, gestão e controle de documentos',
    e: [
      'Somente a versão vigente fica disponível nos locais de uso: o sistema mostra a situação de cada documento (rascunho, em revisão ou vigente) e preserva as versões anteriores no histórico, para consulta.',
      'Alterações são analisadas e aprovadas por pessoa autorizada, com identificação de quem alterou, quando e por quê (histórico de versões do sistema).',
      'Documentos de origem externa que orientam o trabalho (legislação, normas, bulas, manuais de equipamentos e instruções de uso de reagentes) são identificados e mantidos atualizados: a legislação e as licenças ficam em Documentos legais, e bulas e manuais ficam arquivados em formato digital e identificados na Lista Mestra de documentos externos, mantida pelo Supervisor de Qualidade.',
      'Registros e dados da qualidade (formulários preenchidos, controles, indicadores) são dados controlados: não podem ser apagados, e correções ficam registradas com autor e data.',
      'A Lista Mestra é gerada pelo sistema e mostra código, título, versão, situação e data da próxima revisão de cada documento.'
    ],
    i: 'número de documentos vencidos para revisão e de ocorrências de uso de documento obsoleto, apresentados na análise crítica.',
    d: 'uso de documento obsoleto ou sem aprovação gera ocorrência no sistema (Não conformidades), com correção imediata e verificação de eficácia.'
  },
  'PQ 003': {
    n: 'RDC ANVISA nº 978/2025 (registros e rastreabilidade; guarda de laudos e dados brutos); ABNT NBR ISO 15189, itens 8.4 (controle de registros) e 7.6 (gestão de informação); LGPD (Lei nº 13.709/2018); Norma SNA-DICQ (SBAC), controle de registros; Manual ONA, gestão da informação e prontuário',
    e: [
      'Cada registro é identificável e rastreável: data, hora, usuário e unidade são gravados automaticamente pelo sistema no momento do preenchimento.',
      'Correções nunca apagam o dado original: a alteração fica no histórico, com autor, data e motivo (retificação), conforme exige a rastreabilidade das etapas do processo.',
      'Registros são legíveis, protegidos contra perda e acesso indevido (perfis por função, login pessoal, cópia de segurança) e recuperáveis quando solicitados por auditoria ou fiscalização.',
      'O tempo de guarda de cada tipo de registro está definido no item "Controle de Registros" de cada procedimento; laudos, dados brutos e registros da qualidade são guardados por, no mínimo, 5 anos.',
      'Descarte ao fim da guarda é decidido pelo Supervisor de Qualidade e registrado, respeitando a confidencialidade dos dados do paciente.'
    ],
    i: 'percentual de registros obrigatórios do dia preenchidos no prazo (tela Registros do dia) e número de retificações por mês.',
    d: 'registro ausente, incompleto ou fora do prazo é tratado como ocorrência (PQ 014), e a ausência de rastreabilidade de resultado é comunicada ao Responsável Técnico.'
  },
  'PQ 013': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 8.8 (avaliações e auditorias, incluindo auditorias internas); Norma SNA-DICQ (SBAC), auditoria interna; Manual ONA, auditoria interna e melhoria contínua',
    e: [
      'Há um programa anual de auditorias internas (FR 061), que cobre todos os processos e requisitos do sistema da qualidade em intervalos planejados, considerando a importância dos processos, os resultados de auditorias anteriores e os riscos.',
      'Critérios e escopo de cada auditoria estão definidos (FR 040 e FR 048 para o posto de coleta), e os auditores são imparciais: não auditam o próprio trabalho.',
      'Os resultados são relatados à direção e às chefias dos setores auditados (FR 008), e cada achado vira ocorrência no sistema, com correção e ação corretiva no prazo.',
      'A eficácia das ações corretivas é verificada antes do encerramento do achado, e o conjunto das auditorias é levado à análise crítica pela direção (PQ 054).',
      'Os registros das auditorias (programa, listas de verificação, relatórios) ficam no sistema, com os auditores identificados.'
    ],
    i: 'percentual do programa anual de auditorias cumprido (meta: 100%) e percentual de não conformidades de auditoria encerradas no prazo.',
    d: 'auditoria não realizada no prazo é reprogramada pelo Supervisor de Qualidade e justificada na análise crítica; achado não tratado no prazo é levado à Diretoria.'
  },
  'PQ 049': {
    n: 'RDC ANVISA nº 978/2025 (gestão de riscos); ABNT NBR ISO 15189, itens 8.5 (ações para abordar riscos e oportunidades) e 5.6 (gestão de riscos); ABNT NBR ISO 31000; Norma SNA-DICQ (SBAC), gestão de riscos; Manual ONA, gestão de riscos nos níveis 1 e 2',
    e: [
      'Os riscos às atividades do laboratório e à segurança do paciente são identificados por processo (pré-analítico, analítico, pós-analítico e apoio), avaliados por probabilidade e gravidade e priorizados na matriz (FR 050).',
      'Para cada risco priorizado há ação preventiva, responsável e prazo, e o plano é integrado ao plano de segurança do paciente (MQ 002) e ao plano de contingência (PQ 050).',
      'Oportunidades de melhoria são avaliadas junto com os riscos e viram ações do plano de melhoria (FR 062).',
      'A matriz é revisada ao menos uma vez por ano, e sempre que houver incidente grave, mudança de processo, de equipamento ou de local.',
      'O resultado da gestão de riscos é apresentado na análise crítica pela direção (PQ 054).'
    ],
    i: 'percentual de riscos de nível alto com plano de ação em andamento ou concluído (meta: 100%) e data da última revisão da matriz.',
    d: 'risco de nível alto sem plano é levado ao Responsável Técnico e à Diretoria em até 30 dias; ocorrência que materializa um risco vira registro no sistema e revisão da matriz.'
  },
  'PQ 053': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 8.8.2 (indicadores da qualidade) e item 8.6 (melhoria); Norma SNA-DICQ (SBAC), indicadores da qualidade; Manual ONA, gestão por indicadores (nível 2: monitoramento e análise; nível 3: comparação com referências externas)',
    e: [
      'Os indicadores cobrem as fases pré-analítica, analítica e pós-analítica e a gestão, com objetivo, método de cálculo, periodicidade, meta e responsável definidos para cada um (tela Indicadores).',
      'Os indicadores mínimos do Programa Unimed (tempo de espera, TAT, recoleta, amostras não conformes, retificação de laudos, laudos com atraso, CIQ e CEQ) e os de segurança do paciente (identificação, quedas, higienização das mãos) são acompanhados mensalmente.',
      'Cada resultado é comparado com a meta e com os meses anteriores, e a tendência é analisada; resultado fora da meta tem causa analisada e plano de ação (FR 062).',
      'Os resultados são divulgados à equipe e à direção e usados nas decisões (PQ 054).',
      'A lista de indicadores é revisada anualmente quanto à utilidade, e a série histórica é mantida no sistema.'
    ],
    i: 'percentual de indicadores lançados no prazo no mês (meta: 100%) e percentual de indicadores fora da meta com plano de ação.',
    d: 'indicador sem lançamento no prazo é cobrado ao responsável pelo dado pelo Supervisor de Qualidade; indicador fora da meta gera plano de ação no sistema.'
  },
  'PQ 054': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 8.9 (análise crítica pela direção); Norma SNA-DICQ (SBAC), análise crítica pela direção; Manual ONA, liderança e análise crítica do desempenho',
    e: [
      'A direção analisa o sistema de gestão em intervalos planejados, no mínimo uma vez ao ano, para assegurar sua adequação, eficácia e alinhamento com a política da qualidade.',
      'A pauta contém, no mínimo: situação das ações de análises anteriores; mudanças internas e externas; atingimento dos objetivos; indicadores; resultados de auditorias internas e externas; não conformidades e ações corretivas; controle externo da qualidade; manifestações e satisfação; incidentes e eventos adversos; desempenho de fornecedores e laboratórios de apoio; análise de riscos; adequação de recursos e treinamentos.',
      'As decisões e ações (melhoria do sistema, necessidade de recursos, mudanças) são registradas na ata (FR 060), com responsável e prazo, e viram ações no plano (FR 062).',
      'A direção assegura que as ações decididas sejam executadas no prazo, e o resultado é verificado na análise seguinte.'
    ],
    i: 'análise crítica realizada no mínimo anualmente e percentual das ações da análise anterior concluídas no prazo.',
    d: 'análise não realizada no prazo é reagendada pela Diretoria em até 30 dias; ação não concluída é reavaliada e justificada na ata seguinte.'
  },
  'PQ 057': {
    n: 'ABNT NBR ISO 15189, itens 4.1 (imparcialidade) e 4.2 (confidencialidade); RDC ANVISA nº 978/2025; LGPD (Lei nº 13.709/2018); Norma SNA-DICQ (SBAC), imparcialidade e confidencialidade; Manual ONA, ética e conduta',
    e: [
      'A direção se compromete formalmente com a imparcialidade: nenhuma pressão comercial, financeira ou hierárquica pode comprometer a qualidade ou o resultado de um exame.',
      'Os riscos à imparcialidade (relações com operadoras, fornecedores, apoio, parentesco e interesses financeiros) são identificados continuamente e avaliados na matriz de riscos (PQ 049).',
      'Colaboradores e prestadores assinam a declaração de imparcialidade e conflito de interesses (FR 072) e o termo de sigilo (FR 013) na admissão e quando houver mudança de situação.',
      'Situação de conflito é declarada à chefia imediata e ao Responsável Técnico, que decidem a medida (afastar a pessoa da decisão, por exemplo) e registram no sistema.',
      'Informações obtidas na prestação do serviço são confidenciais, exceto quando a lei exigir a divulgação, e o paciente é informado quando isso ocorrer.'
    ],
    i: 'percentual de colaboradores e prestadores com declaração de imparcialidade e termo de sigilo vigentes (meta: 100%).',
    d: 'conflito de interesse não declarado é tratado como ocorrência no sistema e analisado pela Diretoria e pelo Responsável Técnico.'
  },
  'PQ 064': {
    n: 'Lei nº 12.846/2013 (Lei Anticorrupção) e Decreto nº 11.129/2022 (programa de integridade); LGPD (Lei nº 13.709/2018); ABNT NBR ISO 37001 e 37301 (referência de boas práticas); Manual ONA, liderança, governança e ética',
    e: [
      'Existe política de compliance e integridade aprovada pela Diretoria, com código de conduta que proíbe fraude, corrupção, suborno, conflito de interesses e uso indevido de dados e recursos.',
      'Há canal de denúncia acessível, confidencial e com garantia de não retaliação; as denúncias são registradas no sistema (Não conformidades) e apuradas por pessoa sem envolvimento com o fato.',
      'Todos os colaboradores são treinados na admissão e anualmente (FR 002), e os fornecedores e laboratórios de apoio são avaliados também quanto à integridade (PQ 008 e PQ 056).',
      'Os riscos de integridade fazem parte da matriz de riscos (PQ 049) e são revisados anualmente.',
      'O resultado do programa (denúncias, apurações, treinamentos) é levado à análise crítica pela direção (PQ 054).'
    ],
    i: 'percentual de colaboradores treinados em compliance no ano e número de denúncias recebidas e apuradas no prazo.',
    d: 'indício de irregularidade é registrado no sistema no mesmo dia, apurado em prazo definido pela Diretoria e, se confirmado, gera medida disciplinar e ação corretiva.'
  },
  'PQ 065': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 5.2 (direção do laboratório), 5.5 (objetivos e políticas) e 7.4 (atividades pós-exame); Manual ONA, liderança, cuidado centrado no paciente e governança clínica',
    e: [
      'A governança técnica define quem decide sobre protocolos, métodos, liberação de resultados e condutas clínicas do laboratório (Responsável Técnico e responsáveis designados), com atribuições registradas nas descrições de cargo (DC).',
      'Os protocolos são baseados em evidência e em normas, e são revisados periodicamente (PQ 001 e PQ 002).',
      'O cuidado é centrado no paciente: orientação clara de preparo, privacidade, respeito às diferenças e prioridades (PQ 023 e PQ 063), consentimento quando aplicável (PQ 068) e participação do paciente por meio da pesquisa de satisfação e das manifestações (PQ 027).',
      'Desempenho clínico e de segurança é medido por indicadores (PQ 053) e discutido em reuniões com registro de ata (FR 023).',
      'Resultados críticos e situações de risco têm fluxo definido de comunicação ao médico ou ao paciente (L 002 e FR 025).'
    ],
    i: 'percentual de resultados críticos comunicados no prazo e índice de satisfação dos pacientes (meta 90%).',
    d: 'decisão técnica sem registro ou fora do protocolo é registrada como ocorrência no sistema e avaliada pelo Responsável Técnico.'
  },
  'PQ 066': {
    n: 'ABNT NBR ISO 15189, itens 5.3 (atividades do laboratório) e 5.4 (estrutura e autoridade); abordagem por processos (ISO 9001:2015, item 4.4); RDC ANVISA nº 978/2025; Manual ONA, gestão por processos',
    e: [
      'Os processos operacionais, de gestão e de apoio estão mapeados (FR 077), com entradas, saídas, responsáveis, documentos associados e indicador de cada um.',
      'As interações entre os processos (do cadastro ao laudo, e do apoio ao analítico) estão descritas, e cada ponto de transferência de responsabilidade tem registro.',
      'Os riscos de cada processo são tratados na matriz (PQ 049) e seus indicadores, na tela Indicadores (PQ 053).',
      'O mapa é revisado anualmente e quando um processo for criado, alterado ou terceirizado, e a versão vigente fica disponível no sistema.'
    ],
    i: 'mapa revisado nos últimos 12 meses (sim ou não) e percentual de processos com indicador definido.',
    d: 'processo sem responsável ou sem documento é registrado como ocorrência, e o responsável é definido pela Diretoria no prazo de 30 dias.'
  }
};
