/* Lote 3 · fase analítica, equipamentos, insumos, controle da qualidade e apoio. Base: RDC ANVISA 978/2025, ABNT NBR ISO 15189 itens 6.4 a 6.8 e 7.3, Manual ONA. */
const IT = function (area, itens) {
  return {
    n: 'RDC ANVISA nº 978/2025 (fase analítica); ABNT NBR ISO 15189, item 7.3 (processos de exame: procedimentos, verificação de métodos e garantia da validade dos resultados); Norma SNA-DICQ (SBAC), procedimentos analíticos; Manual ONA, processos de diagnóstico',
    e: [
      'O método está descrito em instrução de trabalho aprovada, com princípio, amostra, reagentes, equipamentos, procedimento, controle da qualidade, limitações e referências, e disponível no local de uso (' + area + ').',
      'O método foi verificado antes do uso (PQ 055), e o desempenho é acompanhado pelo controle interno e externo (PQ 006 e PQ 007).',
      'Reagentes, calibradores e controles são conferidos quanto a lote e validade no uso (PQ 015 e FR 065), e os equipamentos estão calibrados e com manutenção em dia (PQ 052).',
      'O analista é treinado e tem competência avaliada para o exame (PQ 022 e PQ 059).'
    ].concat(itens || []),
    i: 'resultados de controle interno fora do limite, repetições de exames e resultado do controle externo por analito, mensais.',
    d: 'resultado do controle fora do critério: suspender a liberação dos resultados do exame, investigar a causa, corrigir e registrar a ocorrência no sistema (PQ 006 e PQ 014).'
  };
};
module.exports = {
  'PQ 006': {
    n: 'RDC ANVISA nº 978/2025 (controle interno da qualidade, art. 3º e demais); ABNT NBR ISO 15189, item 7.3.7 (garantia da validade dos resultados dos exames: controle interno); Norma SNA-DICQ (SBAC), controle interno da qualidade; Manual ONA, controle de qualidade analítico; PNCQ e CONTROLLAB (programas de proficiência e controle)',
    e: [
      'O controle interno é realizado para todos os analitos em frequência definida (diária na bioquímica, semanal ou por corrida nos demais, conforme o método), com materiais de, no mínimo, dois níveis quando aplicável, e antes da liberação dos resultados.',
      'Para cada analito e lote de controle há média, limite inferior e superior definidos (bula do fabricante ou cálculo próprio, após acúmulo de dados), registrados no sistema (Controle analítico).',
      'Os resultados são avaliados por regras de aceitação (por exemplo, valor fora dos limites, tendência e deslocamento nos gráficos de Levey-Jennings); resultado reprovado impede a liberação dos exames da corrida até a investigação.',
      'A investigação considera reagente, calibração, equipamento, água reagente, operador e amostra-controle, e a ação corretiva é registrada com a repetição do controle após a correção.',
      'A troca de lote de reagente, calibrador ou controle é registrada e acompanhada de verificação do desempenho.',
      'Os dados do controle são revisados pelo Responsável Técnico e analisados mensalmente, e a incerteza de medição usa esses dados (PQ 051).'
    ],
    i: 'percentual de corridas de controle interno reprovadas por analito e tempo para correção, mensais.',
    d: 'resultado fora dos limites: não liberar, investigar, corrigir, repetir o controle e reavaliar resultados de pacientes liberados desde o último controle aceitável; registrar a ocorrência.'
  },
  'PQ 007': {
    n: 'RDC ANVISA nº 978/2025 (controle externo da qualidade); ABNT NBR ISO 15189, item 7.3.7 (participação em comparações interlaboratoriais e ensaios de proficiência); Norma SNA-DICQ (SBAC), controle externo da qualidade; Manual ONA, controle de qualidade analítico; regulamentos dos provedores PNCQ e CONTROLLAB',
    e: [
      'O laboratório participa de programa de ensaios de proficiência para todos os analitos e áreas para os quais o programa estiver disponível, com provedor reconhecido e contrato vigente (Documentos legais).',
      'As amostras do controle externo são processadas como amostras de pacientes, pelos mesmos analistas e métodos, e os resultados são enviados dentro do prazo do provedor.',
      'O desempenho é avaliado quando o relatório chega: resultado inaceitável ou tendência exige investigação, ação corretiva e verificação de eficácia, com ata (FR 033).',
      'Para analitos sem programa disponível, o laboratório usa comparação interlaboratorial alternativa (troca de amostras com outro laboratório ou comparação com o apoio), com critério de aceitação definido.',
      'Os relatórios e as ações ficam no sistema (Controle analítico) e são analisados criticamente (PQ 054).'
    ],
    i: 'percentual de resultados aceitáveis nos ensaios de proficiência por ciclo (meta definida pela Diretoria) e prazo de envio dos resultados.',
    d: 'resultado inaceitável: investigar a causa, avaliar o impacto em resultados de pacientes, corrigir e registrar (PQ 014).'
  },
  'PQ 015': {
    n: 'RDC ANVISA nº 978/2025 (reagentes e insumos); ABNT NBR ISO 15189, item 6.6 (reagentes e materiais de consumo); Norma SNA-DICQ (SBAC), reagentes e insumos; Manual ONA, gestão de materiais e insumos',
    e: [
      'Os reagentes e insumos têm registro na ANVISA e são adquiridos de fornecedor qualificado (PQ 008); no recebimento são conferidos lote, validade, integridade e temperatura (FR 020).',
      'O estoque é organizado por validade (primeiro que vence, primeiro que sai) e conservado nas condições do fabricante, com temperatura monitorada (FR 001); o material vencido é segregado e descartado.',
      'Lote novo é verificado antes do uso na rotina (controle, comparação com o lote anterior ou calibração) e o lote e a validade em uso ficam registrados (FR 065).',
      'Reagentes preparados ou fracionados são identificados com data de preparo, validade e responsável.',
      'As bulas e as fichas de segurança (FISPQ) ficam disponíveis no setor, e reclamações técnicas seguem o PQ 060.'
    ],
    i: 'reagentes vencidos descartados, recebimentos fora de temperatura e lotes usados sem verificação registrada.',
    d: 'uso de reagente vencido ou sem verificação: suspender os exames, avaliar o impacto em resultados já liberados e registrar a ocorrência.'
  },
  'PQ 017': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 6.4 (equipamentos) e 6.5 (calibração do equipamento e rastreabilidade metrológica); Norma SNA-DICQ (SBAC), instrumentos de medição; Manual ONA, gestão de equipamentos',
    e: [
      'Pipetas, termômetros e demais instrumentos de medição são calibrados por laboratório com rastreabilidade à Rede Brasileira de Calibração (RBC/Inmetro), com certificado que informa correção e incerteza.',
      'O certificado é avaliado pelo Responsável Técnico quanto ao critério de aceitação, e a correção do certificado é aplicada quando necessária.',
      'A periodicidade de calibração e verificação é definida por instrumento (ficha do equipamento, FR 057 e FR 058) e acompanhada pelo sistema (Equipamentos).',
      'Entre calibrações, o termômetro é comparado com o padrão de referência, e instrumento fora do critério é retirado de uso e identificado.',
      'Resultados gerados com instrumento fora do critério são avaliados quanto ao impacto.'
    ],
    i: 'percentual de instrumentos com calibração em dia (meta: 100%).',
    d: 'instrumento com calibração vencida ou fora do critério: retirar de uso, avaliar resultados e registrar a ocorrência (PQ 014).'
  },
  'PQ 021': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 6.3 (instalações e condições ambientais) e 6.6 (reagentes e consumíveis); especificação de água reagente conforme o tipo exigido pelo método e pelo fabricante do equipamento (CLSI C03); Norma SNA-DICQ (SBAC), água reagente',
    e: [
      'O tipo de água exigido por cada método e equipamento está definido, e o sistema de purificação tem manutenção, troca de filtros e cartuchos nos prazos do fabricante.',
      'A condutividade e a reatividade da água são verificadas na frequência definida e registradas (FR 011), com limite de aceitação e ação em caso de desvio.',
      'Os controles microbiológicos e demais análises periódicas são feitos por fornecedor qualificado, e os laudos são arquivados no sistema.',
      'Água fora do critério suspende o uso nos equipamentos até a correção e a nova verificação.'
    ],
    i: 'percentual de dias com condutividade dentro do limite e troca de filtros no prazo.',
    d: 'água fora do critério: suspender o uso, corrigir (manutenção, troca de cartucho), reverificar e avaliar resultados do período, com registro da ocorrência.'
  },
  'PQ 024': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 7.2 e 7.3 (exames); lista nacional de doenças de notificação compulsória do Ministério da Saúde (edição vigente); Norma SNA-DICQ (SBAC), escopo de exames; Manual ONA, processos de diagnóstico',
    e: [
      'O catálogo de exames informa para cada exame: amostra, preparo, método, prazo, valores de referência e se é feito no laboratório ou no apoio (L 001).',
      'Exames em caráter de urgência (L 003) e com valores críticos (L 002) têm fluxo e prazo definidos.',
      'Doenças e agravos de notificação compulsória são notificados à vigilância no prazo legal pelo responsável designado, com comprovante anexado ao registro.',
      'Mudanças de método, de equipamento ou de valores de referência passam por verificação (PQ 055) e comunicação aos usuários antes de entrar em uso.'
    ],
    i: 'cumprimento do prazo de liberação dos resultados e notificações compulsórias feitas no prazo.',
    d: 'exame sem método verificado ou com prazo descumprido: registrar a ocorrência e comunicar o paciente quando houver atraso.'
  },
  'PQ 051': {
    n: 'ABNT NBR ISO 15189, item 7.3.4 (incerteza de medição dos valores medidos) e ISO/TS 20914 (orientação para estimativa da incerteza em laboratório clínico); RDC ANVISA nº 978/2025; Norma SNA-DICQ (SBAC), incerteza de medição',
    e: [
      'A incerteza de medição é estimada para os mensurandos quantitativos, a partir de dados de controle interno (imprecisão) e de ensaios de proficiência ou materiais de referência (viés), conforme o método descrito neste procedimento (FR 052).',
      'O resultado é comparado com a especificação de desempenho definida pelo laboratório (por exemplo, variação biológica ou limites do fabricante), com a fonte registrada.',
      'A estimativa é refeita ao menos uma vez por ano e quando houver mudança de método, equipamento ou lote de calibrador, e fica disponível ao usuário que a solicitar.',
      'Incerteza acima da especificação gera ação (investigação do método, calibração, treinamento).'
    ],
    i: 'percentual de mensurandos com incerteza estimada e dentro da especificação.',
    d: 'incerteza acima da meta: investigar a causa, corrigir e registrar a ocorrência.'
  },
  'PQ 052': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 6.4 e 6.5 (equipamentos, calibração e rastreabilidade); Norma SNA-DICQ (SBAC), equipamentos; Manual ONA, gestão de equipamentos e manutenção; RDC ANVISA nº 50/2002 (estrutura física)',
    e: [
      'Cada equipamento tem cadastro com identificação, fabricante, número de série, local, data de instalação, manual e periodicidade de manutenção e calibração (FR 057 e tela Equipamentos).',
      'Antes de entrar em uso, o equipamento é verificado (instalação, verificação de desempenho) e liberado pelo Responsável Técnico; ao sair de uso por defeito, é identificado e segregado.',
      'A manutenção preventiva segue o cronograma (FR 054) e a corretiva gera ordem de serviço (FR 055), e os registros ficam no sistema com o equipamento.',
      'Após reparo ou deslocamento, o desempenho é verificado antes de voltar à rotina, e os resultados do período são avaliados quando houver suspeita de impacto.',
      'Manutenção predial, ar-condicionado e instalações seguem o checklist (FR 053 e FR 084).'
    ],
    i: 'manutenção preventiva cumprida no prazo (meta 100%) e tempo de equipamento parado por falha.',
    d: 'preventiva não realizada ou equipamento fora de desempenho: retirar de uso, reprogramar, avaliar resultados e registrar a ocorrência.'
  },
  'PQ 055': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 7.3.2 (seleção e verificação de métodos) e 7.3.3 (validação de métodos próprios); Norma SNA-DICQ (SBAC), verificação e validação de métodos; Manual ONA, processos analíticos',
    e: [
      'Métodos comerciais são verificados antes do uso na rotina, com os parâmetros indicados pelo fabricante (precisão, exatidão, faixa de medição, quando aplicável) e critério de aceitação definido (FR 064).',
      'Métodos próprios (in house) ou modificados são validados, com os desempenhos exigidos para a finalidade.',
      'Os intervalos de referência são adotados do fabricante ou da literatura e verificados quanto à adequação à população atendida, e a fonte é registrada no laudo.',
      'A verificação é repetida quando houver mudança de método, equipamento, lote crítico ou local, e os resultados são aprovados pelo Responsável Técnico.'
    ],
    i: 'percentual de métodos em uso com verificação documentada.',
    d: 'método sem verificação: suspender a liberação até concluir a verificação e registrar a ocorrência.'
  },
  'PQ 056': {
    n: 'RDC ANVISA nº 978/2025 (laboratório de apoio); ABNT NBR ISO 15189, item 6.8 (produtos e serviços fornecidos externamente) e 7.2.5 a 7.2.6; Norma SNA-DICQ (SBAC), exames em laboratório de apoio; Manual ONA, serviços terceirizados',
    e: [
      'O apoio é qualificado antes do uso: licenças, responsável técnico, escopo, participação em controle externo e, quando houver, acreditação; a avaliação é periódica (FR 027).',
      'Há contrato formal que define responsabilidades, prazos, condições de envio e sigilo, e o cadastro dos apoios é mantido atualizado (DC 013).',
      'O envio de cada amostra é registrado com condições de transporte e prazo (FR 074), e o resultado recebido é conferido e identifica o laboratório que o executou.',
      'O laudo informa quando o exame foi realizado em laboratório de apoio, e o resultado do apoio é transcrito sem alteração.',
      'O desempenho do apoio (prazo, qualidade, reclamações) é avaliado e levado à análise crítica.'
    ],
    i: 'prazo médio de retorno do apoio e ocorrências por apoio.',
    d: 'falha do apoio (atraso, amostra perdida, erro): registrar a ocorrência, comunicar o paciente e avaliar a continuidade do fornecedor.'
  },
  'PQ 016': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 7.6 (gestão de informação); LGPD (Lei nº 13.709/2018); Norma SNA-DICQ (SBAC), sistema de informática; Manual ONA, segurança da informação',
    e: [
      'O LIS é verificado antes do uso e após mudanças (cálculos, interface com equipamentos, laudos), e as alterações passam por teste e registro.',
      'O acesso é por login pessoal e perfil, com rastreabilidade de quem cadastrou, alterou e liberou cada resultado e laudo.',
      'Há cópia de segurança dos dados em nuvem, testada, e plano de contingência para indisponibilidade do sistema (PQ 050).',
      'A transferência de resultados dos equipamentos é conferida, e a transcrição manual tem dupla checagem (PQ 010).'
    ],
    i: 'tempo de indisponibilidade do LIS e erros de transcrição detectados.',
    d: 'falha do sistema ou erro de dado: aplicar a contingência, corrigir, avaliar impacto nos laudos e registrar a ocorrência.'
  },
  'PQ 010': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, itens 7.3 e 7.6; Norma SNA-DICQ (SBAC), planilhas de trabalho e transcrição; Manual ONA, rastreabilidade do processo',
    e: [
      'Os mapas de trabalho são gerados pelo LIS a partir do cadastro, para assegurar que todos os exames cadastrados sejam executados e resultados correspondam à amostra e ao paciente certos.',
      'Resultados manuais são conferidos antes da transcrição (dupla checagem para exames definidos pelo Responsável Técnico, como a dupla observação de lâminas).',
      'Mapas preenchidos são digitalizados e anexados ao registro, com guarda de 5 anos, conforme o PQ 003.'
    ],
    i: 'erros de transcrição detectados na conferência.',
    d: 'erro de transcrição: corrigir com registro, avaliar se o resultado foi liberado e registrar a ocorrência.'
  },
  'PQ 008': {
    n: 'RDC ANVISA nº 978/2025; ABNT NBR ISO 15189, item 6.8 (produtos e serviços fornecidos externamente); Norma SNA-DICQ (SBAC), qualificação de fornecedores; Manual ONA, gestão de fornecedores',
    e: [
      'Fornecedores de insumos, serviços críticos (calibração, manutenção, destinação de resíduos, transporte, apoio) são qualificados antes do uso, com documentos regulatórios, e reavaliados periodicamente.',
      'A lista de fornecedores qualificados é mantida pelo Supervisor de Qualidade, e compras só são feitas dela.',
      'O desempenho (prazo, qualidade, reclamações) é registrado e usado na reavaliação; fornecedor reprovado é inativado e o motivo é registrado.',
      'Contratos com tratamento de dados pessoais têm cláusulas de proteção (PQ 058).'
    ],
    i: 'percentual de fornecedores críticos com qualificação vigente.',
    d: 'fornecedor com falha grave: suspender compras, avaliar o impacto e registrar a ocorrência.'
  },
  'ITA 003': IT('imunocromatografia'),
  'ITA 004': IT('FR e ASLO por aglutinação'),
  'ITA 005': IT('VDRL'),
  'ITA 006': IT('VHS'),
  'ITA 007': IT('coagulação', ['O tempo de coleta e a proporção sangue/anticoagulante são verificados antes da análise, e os controles são realizados no início de cada turno de coagulação.']),
  'ITA 008': IT('imuno-hematologia', ['Resultados de tipagem ABO e Rh têm dupla conferência, e discordância com registro anterior é investigada antes da liberação.']),
  'ITA 009': IT('urinálise'),
  'ITA 010': IT('parasitologia'),
  'ITA 011': IT('pesquisa de sangue oculto'),
  'ITA 012': IT('hematologia', ['O hemograma tem critérios de revisão de lâmina e de liberação por alarmes do equipamento definidos pelo Responsável Técnico.']),
  'ITA 013': IT('bioquímica'),
  'ITA 014': IT('bioquímica'),
  'ITA 015': IT('imunoensaio por fluorescência'),
  'ITA 016': IT('microbiologia (urocultura)', ['A seleção das amostras de urocultura enviadas ao apoio segue critério definido, e a coleta e o transporte cumprem o prazo exigido pelo apoio.'])
};
