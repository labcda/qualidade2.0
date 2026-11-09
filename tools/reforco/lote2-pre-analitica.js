/* Lote 2 · fase pré-analítica. Base: RDC ANVISA 978/2025, ABNT NBR ISO 15189 item 7.2 (processos pré-exame), Manual ONA. */
const P = 'RDC ANVISA nº 978/2025 (fase pré-analítica); ABNT NBR ISO 15189, item 7.2 (processos pré-exame: ';
module.exports = {
  'PQ 004': {
    n: P + 'coleta e manuseio da amostra primária); Norma SNA-DICQ (SBAC), coleta de amostras; Manual ONA, segurança do paciente na coleta; NR-32; CLSI GP41 (referência técnica de coleta de sangue venoso)',
    e: [
      'O paciente é identificado com dois identificadores (nome completo e data de nascimento) conferidos com o documento e com a etiqueta, antes e depois da coleta (PQ 036).',
      'O pedido médico e o cadastro são conferidos quanto ao exame, ao preparo (jejum, medicamentos, horário) e à amostra necessária; o desvio de preparo é registrado e informado ao paciente.',
      'A coleta segue a ordem dos tubos, o tempo de torniquete e a homogeneização definidos na ITA 001, com material descartável, EPIs e descarte de perfurocortantes no ato (PQ 025 e PQ 061).',
      'O coletor é treinado e avaliado (PQ 022 e PQ 059), e o paciente recebe orientação sobre o procedimento; intercorrências seguem o PQ 031.',
      'Os tubos são identificados na presença do paciente, e a hora e o responsável pela coleta ficam registrados no sistema do laboratório (LIS).'
    ],
    i: 'taxa de amostras recoletadas por falha de coleta e erros de identificação por mês (tela Indicadores).',
    d: 'falha de identificação, de coleta ou de preparo é registrada como ocorrência no sistema (Não conformidades), com recoleta quando possível e comunicação ao paciente.'
  },
  'PQ 005': {
    n: P + 'informação ao paciente e coleta pelo próprio paciente); RDC ANVISA nº 978/2025; Norma SNA-DICQ (SBAC), orientação ao cliente; Manual ONA, orientação e educação do paciente',
    e: [
      'O paciente recebe instruções escritas e verbais, claras, para cada tipo de material (urina, fezes, escarro, swab), incluindo frasco, higiene, horário, conservação e prazo de entrega ao laboratório.',
      'No recebimento, a amostra é conferida quanto à identificação, ao volume, ao frasco, ao tempo desde a coleta e às condições de conservação (critérios do PQ 020); amostra fora do critério não é processada sem decisão do Responsável Técnico.',
      'A confirmação de que a coleta foi feita pelo paciente fica registrada no cadastro, e o laudo, quando necessário, informa que a coleta não foi realizada pelo laboratório.',
      'As orientações de preparo são mantidas atualizadas junto ao catálogo de exames (PQ 024) e disponíveis para o paciente no cadastro e no aplicativo.'
    ],
    i: 'percentual de amostras coletadas pelo paciente rejeitadas ou recoletadas.',
    d: 'amostra inadequada gera contato com o paciente para nova coleta e registro da causa no sistema, para ajustar a orientação.'
  },
  'PQ 009': {
    n: P + 'recebimento, preparo e armazenamento das amostras); RDC ANVISA nº 978/2025; Norma SNA-DICQ (SBAC), amostras; Manual ONA, rastreabilidade e armazenamento de amostras',
    e: [
      'Toda amostra tem identificação única e rastreável do cadastro ao descarte, por etiqueta gerada pelo LIS, e a cadeia (coleta, triagem, análise, armazenamento) fica registrada.',
      'As condições de conservação (temperatura, tempo, proteção da luz) são definidas por exame e monitoradas: a temperatura de geladeiras, freezers e ambiente é registrada diariamente (FR 001 e FR 010) com limites e ação em caso de desvio.',
      'A soroteca guarda as amostras pelo tempo definido, com localização e data de descarte, e o descarte segue o PQ 012 e o PGRSS (PQ 061).',
      'O acesso à área de amostras é restrito a pessoas autorizadas, para proteger a integridade e a confidencialidade.'
    ],
    i: 'percentual de dias com temperatura registrada e dentro do limite (tela Registros do dia).',
    d: 'temperatura fora do limite ou amostra sem identificação: segregar o material, avaliar a integridade com o Responsável Técnico e registrar a ocorrência.'
  },
  'PQ 018': {
    n: P + 'coleta primária fora das instalações e transporte); RDC ANVISA nº 978/2025; NR-32; Manual ONA, atendimento domiciliar',
    e: [
      'O atendimento domiciliar é agendado com dados do paciente, endereço, exames e preparo, e confirmado com o paciente antes da visita.',
      'O profissional leva material, EPIs, caixa térmica e termômetro, identifica-se e confere dois identificadores do paciente; a coleta e o descarte seguem o mesmo padrão do laboratório.',
      'A temperatura e o tempo de transporte da amostra até o laboratório são registrados (FR 047) e conferidos no recebimento, conforme o PQ 045.',
      'Resíduos perfurocortantes são levados ao laboratório no coletor rígido, e acidentes seguem o PQ 030.'
    ],
    i: 'amostras de coleta domiciliar recoletadas ou rejeitadas e atrasos no atendimento agendado.',
    d: 'amostra fora de temperatura ou tempo: avaliar com o Responsável Técnico, recoletar se necessário e registrar a ocorrência.'
  },
  'PQ 020': {
    n: P + 'recebimento de amostras e critérios de aceitação ou rejeição); RDC ANVISA nº 978/2025; Norma SNA-DICQ (SBAC), critérios de rejeição; Manual ONA, segurança na fase pré-analítica',
    e: [
      'Os critérios de aceitação e rejeição estão definidos por tipo de exame (identificação, volume, hemólise, coágulo, lipemia, frasco, conservação, tempo) e são aplicados por todos os técnicos.',
      'Amostra rejeitada é registrada com a causa e o paciente é comunicado; amostra insubstituível ou de coleta difícil só é processada com decisão do Responsável Técnico, e o laudo traz a ressalva sobre a condição da amostra.',
      'As causas de rejeição são classificadas e analisadas todo mês para ações de melhoria na coleta e na orientação ao paciente.',
      'Indicadores por tipo (coagulação, hemólise, contaminação de hemocultura e urocultura) alimentam a tela Indicadores (PQ 053).'
    ],
    i: 'taxa de amostras rejeitadas ou recoletadas e amostras não conformes por tipo, mensal.',
    d: 'causa recorrente de rejeição gera ocorrência e ação corretiva no setor de origem.'
  },
  'PQ 023': {
    n: P + 'informações ao paciente, requisição e cadastro); RDC ANVISA nº 978/2025; LGPD (Lei nº 13.709/2018); Manual ONA, acolhimento e identificação do paciente',
    e: [
      'O cadastro registra identificação completa do paciente, médico solicitante, convênio, exames, data e hora, e o paciente recebe o comprovante de atendimento com número de registro, data, exames, prazo e forma de entrega do resultado.',
      'O paciente recebe orientação sobre o preparo e sobre o prazo; solicitações incompletas ou ilegíveis são esclarecidas com o médico ou o paciente antes da coleta.',
      'Prioridades de atendimento (idosos, gestantes, pessoas com deficiência, urgências) são aplicadas conforme a lei e o PQ 063.',
      'Os dados do paciente são tratados conforme a LGPD (PQ 058), com acesso por perfil e consentimento quando exigido.'
    ],
    i: 'tempo médio de espera para atendimento e erros de cadastro identificados por mês.',
    d: 'erro de cadastro é corrigido com registro da retificação e, se houver impacto no resultado, tratado como ocorrência.'
  },
  'PQ 043': {
    n: P + 'transporte e recebimento de amostras de postos de coleta); RDC ANVISA nº 978/2025; Manual ONA, rastreabilidade do transporte',
    e: [
      'O malote é fechado no LIS, impresso para conferência e acompanha o envio; no recebimento, a matriz confere amostra por amostra com a relação.',
      'A temperatura da maleta é registrada na saída (FR 047) e conferida na chegada, com limites e tempo máximo definidos.',
      'Divergências (amostra faltante, sem identificação, em condição inadequada) são registradas na hora e comunicadas ao posto, e a amostra segue o critério do PQ 020.',
      'O relatório do malote conferido é anexado ao registro no sistema.'
    ],
    i: 'malotes com divergência e amostras fora de temperatura no recebimento.',
    d: 'amostra não localizada ou fora do critério: acionar o posto, registrar a ocorrência e providenciar nova coleta.'
  },
  'PQ 044': {
    n: P + 'armazenamento temporário e manuseio de amostras); RDC ANVISA nº 978/2025; Manual ONA, armazenamento seguro',
    e: [
      'O armazenamento temporário no posto de coleta ocorre em equipamento próprio, com temperatura monitorada e registrada, e com amostras identificadas e separadas por tipo.',
      'Os limites de temperatura e tempo de permanência antes do envio estão definidos, e o desvio é registrado e comunicado à matriz.',
      'O acesso ao armazenamento é restrito à equipe, e há limpeza programada (PQ 029).'
    ],
    i: 'dias com temperatura fora do limite no posto de coleta.',
    d: 'desvio de temperatura: segregar as amostras, avaliar com o Responsável Técnico e registrar a ocorrência.'
  },
  'PQ 045': {
    n: P + 'transporte de amostras); RDC ANVISA nº 978/2025; RDC ANVISA nº 504/2021 (transporte de material biológico); Manual ONA, transporte seguro',
    e: [
      'O transporte usa embalagem tripla ou equivalente, identificada com o símbolo de risco biológico, em caixa térmica com temperatura controlada e registro (FR 047).',
      'O transportador é treinado em biossegurança e em conduta em derramamento ou acidente (PQ 025 e PQ 030).',
      'O prazo máximo entre coleta e processamento é respeitado por exame, e atrasos são registrados.',
      'Amostras enviadas a laboratórios de apoio seguem as condições exigidas por cada apoio (PQ 056).'
    ],
    i: 'amostras recebidas fora de temperatura ou de prazo por mês.',
    d: 'derramamento: descontaminar conforme o PQ 025; amostra comprometida: registrar, comunicar o paciente e recoletar.'
  },
  'PQ 063': {
    n: P + 'informações e coleta em pacientes com necessidades especiais); RDC ANVISA nº 978/2025; Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência); Lei nº 10.741/2003 (Estatuto da Pessoa Idosa); Manual ONA, cuidado centrado no paciente',
    e: [
      'Crianças, idosos, gestantes, pessoas com deficiência, pacientes em jejum prolongado e com dificuldade de acesso venoso têm atendimento adaptado, com acompanhante permitido e comunicação adequada.',
      'O consentimento do responsável é obtido quando o paciente não puder decidir (PQ 068), e a coleta especial é registrada (FR 076).',
      'Há critérios para interromper a coleta e acionar o Responsável Técnico (PQ 031 e PQ 069).',
      'A estrutura permite acessibilidade física e prioridade de atendimento, conforme a legislação.'
    ],
    i: 'coletas especiais registradas e intercorrências nesses atendimentos.',
    d: 'intercorrência: aplicar o PQ 031, registrar a ocorrência no sistema e avaliar a ação preventiva.'
  }
};
