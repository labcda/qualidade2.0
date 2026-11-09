/* Reescreve a biblioteca de documentos para o Qualidade 2.0:
   - tudo no sistema (sem Drive, pasta, nuvem avulsa ou papel como local de arquivo);
   - cada documento aponta os formulários preenchidos no sistema e os requisitos do Programa Unimed que atende;
   - assinaturas e histórico passam a vir do sistema (o quadro de assinaturas no texto é removido).
   Uso: node tools/reescrever-pops.js   (lê data/_origem/*.js e grava data/documentos.js) */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const ORI = path.join(R, 'data', '_origem');
global.window = {};
['biblioteca', 'novos', 'requisitos'].forEach(function (f) { (0, eval)(fs.readFileSync(path.join(ORI, f + '.js'), 'utf8')); });
const REQ = window.Q2_REQ, DOCS = window.Q2_DOCS;
const HOJE_BR = '09/11/2026';

/* ---------- utilidades ---------- */
function linhas(t) { return t.replace(/\r/g, '').split('\n'); }
function sec(t, n) { // devolve [ini, fim) das linhas da seção "## n ..."
  var L = linhas(t), ini = -1, fim = L.length;
  for (var i = 0; i < L.length; i++) { if (ini < 0 && new RegExp('^## ' + n + '\\b').test(L[i])) ini = i; else if (ini >= 0 && /^## \d/.test(L[i])) { fim = i; break; } }
  return ini < 0 ? null : [ini, fim];
}
function trocaSec(t, n, corpo) { var s = sec(t, n); if (!s) return t; var L = linhas(t); var tit = L[s[0]]; L.splice(s[0], s[1] - s[0], tit + '\n' + corpo.replace(/^\n+|\n+$/g, '') + '\n'); return L.join('\n'); }

/* ---------- 1. limpeza geral ---------- */
function limpa(d) {
  var L = linhas(d.texto), o = [], i = 0;
  while (i < L.length) {
    var l = L[i];
    // quadro de assinaturas do texto antigo: o sistema passa a gerar com as assinaturas cadastradas
    if (/^\|\s*Elaboração\s*\|\s*Revisão\s*\|\s*Aprovação/.test(l)) { while (i < L.length && /^\|/.test(L[i])) i++; continue; }
    // cabeçalho/ficha de formulário (o sistema gera a ficha)
    if (/^\|\s*FORMULÁRIO DE REGISTRO\s*·/.test(l) || /^\|\s*CÓDIGO\s*\|\s*VERSÃO/.test(l)) { while (i < L.length && /^\|/.test(L[i])) i++; continue; }
    o.push(l); i++;
  }
  var t = o.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return t;
}

/* ---------- 2. tabelas de "Controle de Registros" ---------- */
const DIARIOS = ['FR 001', 'FR 004', 'FR 005', 'FR 009', 'FR 010', 'FR 034', 'FR 035', 'FR 049'];
const CIQ = ['FR 028', 'FR 029', 'FR 033', 'FR 039'];
function localDe(linha) {
  var f = (linha.match(/FR \d{3}/g) || [])[0];
  if (/Lista Mestra/i.test(linha)) return 'Qualidade 2.0 · Documentos';
  if (f && DIARIOS.indexOf(f) >= 0) return 'Qualidade 2.0 · Registros do dia';
  if (f && CIQ.indexOf(f) >= 0) return 'Qualidade 2.0 · Controle analítico';
  if (/licen|alvar|certid|contrato/i.test(linha)) return 'Qualidade 2.0 · Documentos legais';
  if (/equipamento|calibra|manuten/i.test(linha)) return 'Qualidade 2.0 · Equipamentos';
  if (f) return 'Qualidade 2.0 · Preencher formulário';
  return 'Qualidade 2.0';
}
function tabelaRegistros(t) {
  var L = linhas(t), out = [], i = 0;
  while (i < L.length) {
    if (/^\|/.test(L[i]) && /Local/i.test(L[i]) && /Forma|Meio/i.test(L[i])) {
      var cab = L[i].replace(/^\||\|\s*$/g, '').split('|').map(function (c) { return c.trim(); });
      var il = cab.findIndex(function (c) { return /^Local/i.test(c); }), ifm = cab.findIndex(function (c) { return /^(Forma|Meio)/i.test(c); });
      out.push(L[i]); i++;
      while (i < L.length && /^\|/.test(L[i])) {
        if (/^\|\s*:?-{2,}/.test(L[i])) { out.push(L[i]); i++; continue; }
        var c = L[i].replace(/^\||\|\s*$/g, '').split('|').map(function (x) { return x.trim(); });
        var fisico = /certificado|original|assinad|autoriza|notifica|extintor|malote|EPI|CIAT|termo/i.test(c[0] + ' ' + (c[il] || '')) && /f[ií]sic|papel|impresso|pasta|almoxarifado/i.test((c[il] || '') + ' ' + (c[ifm] || ''));
        c[il] = localDe(c[0]);
        c[ifm] = fisico ? 'Digital (original físico, quando houver, anexado ao registro)' : 'Digital';
        out.push('| ' + c.join(' | ') + ' |'); i++;
      }
      continue;
    }
    out.push(L[i]); i++;
  }
  return out.join('\n');
}

/* ---------- 3. frases específicas ---------- */
const FRASES = [
  ['PQ 006', 'Os dados ficam em arquivo Excel na nuvem.', 'Os dados são registrados no sistema da Qualidade (Controle analítico), com a comparação de cada resultado com o laudo do apoio.'],
  ['PQ 006', 'Os dados de ambos os controles são gerados em PDF e armazenados na nuvem.', 'Os resultados de ambos os controles são registrados no sistema da Qualidade (Controle analítico), com o PDF do analisador anexado ao registro.'],
  ['PQ 006', 'que mensalmente é transformado em PDF e salvo na nuvem.', 'cujo PDF mensal é anexado ao registro no sistema da Qualidade (Controle analítico).'],
  ['PQ 006', 'com dados inseridos em formulário e salvos na nuvem.', 'com os dados lançados no sistema da Qualidade (Controle analítico).'],
  ['PQ 006', 'O resultado é registrado em formulário, salvo na nuvem, e confrontado', 'O resultado é lançado no sistema da Qualidade (Controle analítico) e confrontado'],
  ['PQ 006', 'Os dados são registrados em formulário e salvos na nuvem.', 'Os dados são lançados no sistema da Qualidade (Controle analítico).'],
  ['PQ 006', 'O registro em formulário digital próprio, salvo na nuvem, é feito', 'O registro, feito diretamente no sistema da Qualidade (Controle analítico), é realizado'],
  ['PQ 007', 'são registradas em formulário próprio e arquivadas na nuvem;', 'são registradas no sistema da Qualidade (formulário de não conformidade, FR 006);'],
  ['PQ 008', 'Na nuvem, em mídia digital, ficam arquivados os fornecedores ativos e os inativos', 'No sistema da Qualidade ficam registrados os fornecedores ativos e os inativos'],
  ['PQ 014', 'As não conformidades são abertas por meio digital, com arquivo na nuvem, separadas', 'As não conformidades são abertas diretamente no sistema da Qualidade, separadas'],
  ['PQ 014', 'Os formulários de incidentes e eventos adversos são digitais e ficam salvos na nuvem, de fácil acesso.', 'Os formulários de incidentes e eventos adversos são preenchidos no sistema da Qualidade, onde ficam registrados e de fácil acesso.'],
  ['PQ 040', 'O relatório é arquivado em nuvem para', 'O relatório é guardado no sistema da Qualidade para'],
  ['ITA 013', 'resultados e gráficos de Levey-Jennings arquivados na nuvem.', 'resultados e gráficos de Levey-Jennings registrados no sistema da Qualidade (Controle analítico).'],
  ['PQ 027', 'Os formulários ficam expostos e de fácil acesso. Ao final do atendimento, a recepção incentiva o paciente a preencher o formulário e depositá-lo na urna.', 'A pesquisa fica de fácil acesso ao paciente (aplicativo) e, quando o paciente preferir, a recepção a preenche com ele diretamente no sistema. Ao final do atendimento, a recepção incentiva o paciente a respondê-la.'],
  ['PQ 027', 'No final de cada mês, os formulários são retirados das urnas e entregues ao Supervisor de Qualidade, que analisa os dados e gera', 'No final de cada mês, o Supervisor de Qualidade analisa as respostas registradas no sistema e gera'],
  ['PQ 027', 'é produzida e exposta na recepção uma arte (SmartArt) com a satisfação dos clientes no mês anterior. O modelo está no anexo.', 'o sistema apresenta o resultado, que é divulgado à equipe e exposto na recepção por meio do relatório de impressão do sistema.'],
  ['PQ 027', 'As reuniões têm ata, assinada pelos presentes, e são arquivadas.', 'As reuniões têm ata registrada no sistema (FR 023), com os participantes identificados.'],
  ['PQ 014', 'Todas as reuniões são registradas em ata, assinada pelos participantes.', 'Todas as reuniões são registradas em ata no sistema (FR 023), com os participantes identificados.'],
  ['PQ 068', '4. Uma via fica com o paciente e outra é arquivada junto ao cadastro do atendimento.', '4. O termo é registrado no sistema, junto ao cadastro do atendimento; o paciente recebe uma cópia do termo (digital ou impressa pelo relatório do sistema).'],
  ['PQ 022', 'uma cópia é arquivada no dossiê do funcionário.', 'uma cópia digitalizada é anexada ao registro de treinamento do funcionário no sistema.'],
  ['PQ 069', '### 5.5 Comunicação e análise', '### 5.4 Comunicação e análise'],
  ['PQ 010', 'Depois de digitadas, as planilhas são arquivadas.', 'Depois de digitadas, as planilhas são digitalizadas e anexadas ao registro no sistema da Qualidade (PQ 003).'],
  ['PQ 017', 'O certificado tem pasta própria para guarda.', 'O certificado é digitalizado e anexado ao cadastro do instrumento no sistema da Qualidade (Equipamentos); o original fica guardado em pasta própria.'],
  ['PQ 024', 'imprime-se a notificação, que é arquivada na pasta de Notificação da Vigilância Sanitária do laboratório', 'anexa-se o comprovante da notificação ao registro no sistema da Qualidade'],
  ['PQ 027', 'disponível impresso na recepção e também em formato digital (NPS do aplicativo); as respostas dos dois formatos compõem o índice.', 'respondido no formato digital (NPS do aplicativo ou formulário do sistema, preenchido na recepção quando o paciente preferir); todas as respostas são lançadas no sistema e compõem o índice.'],
  ['PQ 062', '3. Arquivo. Cópias digitais ficam no Drive institucional e os originais, quando exigidos, em local acessível para apresentar à fiscalização.', '3. Arquivo. As cópias digitais são anexadas no sistema (Qualidade 2.0 › Documentos legais) e os originais, quando exigidos, ficam em local acessível para apresentar à fiscalização.'],
  ['PQ 068', 'Cadastro do paciente / arquivo da recepção | Digital ou papel', 'Cadastro do paciente (LIS) e cópia no sistema da Qualidade | Digital']
];
function frases(d, t) {
  FRASES.forEach(function (f) { if (f[0] === d.codigo && t.indexOf(f[1]) >= 0) t = t.split(f[1]).join(f[2]); });
  return t.replace(/Nuvem \(Drive institucional\)/g, 'Qualidade 2.0').replace(/Drive institucional \(Qualidade\) e originais na Diretoria/g, 'Qualidade 2.0 · Documentos legais').replace(/Drive institucional \(Qualidade\)/g, 'Qualidade 2.0').replace(/Área técnica e Drive/g, 'Qualidade 2.0');
}

const APOS = [
  ['PQ 053', '| Gestão | Incidentes e eventos adversos', [
    '| Pré-analítica | Tempo de liberação dos resultados (TAT) | tempo médio entre o cadastro e a liberação do laudo, por grupo de exames (rotina e urgência) | Mensal |',
    '| Pré-analítica | Amostras não conformes por tipo (coagulação, hemólise, contaminação de hemocultura e de urocultura) | nº de amostras não conformes do tipo ÷ nº de amostras do tipo x 100 | Mensal |',
    '| Pós-analítica | Laudos liberados com atraso | nº de laudos liberados após o prazo ÷ nº total de laudos x 100 | Mensal |',
    '| Segurança do paciente | Eventos adversos por falha na identificação do paciente | nº de eventos ÷ nº de atendimentos x 100 | Mensal |',
    '| Segurança do paciente | Quedas de pacientes | nº de quedas ocorridas no período | Mensal |',
    '| Segurança do paciente | Eventos adversos relacionados a medicação (se aplicável) | nº de eventos notificados | Mensal |']],
  ['FR 059', '| Incidentes e eventos adversos (nº)', ['Tempo de liberação dos resultados (TAT)', 'Amostras não conformes: coagulação (%)', 'Amostras não conformes: hemólise (%)', 'Contaminação de hemocultura / urocultura (%)', 'Laudos liberados com atraso (%)', 'Eventos adversos por falha de identificação (nº)', 'Quedas de pacientes (nº)', 'Eventos relacionados a medicação, se aplicável (nº)'].map(function (n) { return '| ' + n + ' |' + new Array(13).fill('  ').join('|') + '|'; })]
];
const FIM_SEC = [
  ['PQ 040', 5, '- A capacitação em segurança do paciente (FR 082) inclui o protocolo e o fluxograma de notificação de incidentes, eventos adversos e near miss (PQ 038), com lista de presença e avaliação registradas no sistema.'],
  ['PQ 054', 5, '- A análise crítica inclui os indicadores de segurança do paciente (FR 083) e os resultados das notificações de incidentes, eventos adversos e near miss. As decisões e ações ficam registradas no sistema (FR 060 e FR 062) e são divulgadas à direção e à equipe.'],
  ['PQ 025', 5, '- O designado de CIPA (PQ 067) participa da avaliação dos riscos ocupacionais e das investigações de acidentes de trabalho.']
];
function adic(d, t) {
  var L = linhas(t);
  APOS.forEach(function (a) { if (a[0] !== d.codigo) return; var i = L.findIndex(function (x) { return x.indexOf(a[1]) === 0; }); if (i < 0) throw new Error('âncora ' + a[0]); L.splice.apply(L, [i + 1, 0].concat(a[2])); });
  t = L.join('\n');
  FIM_SEC.forEach(function (a) { if (a[0] !== d.codigo) return; var s2 = sec(t, a[1]); if (!s2) throw new Error('sec ' + a[0]); var M = linhas(t); var fim = s2[1]; while (fim > s2[0] && !M[fim - 1].trim()) fim--; M.splice(fim, 0, a[2]); t = M.join('\n'); });
  return t;
}
/* ---------- 4. PQ 001, 002 e 003: reescritos à mão ---------- */
const MAO = {
  'PQ 001': {
    3: `- Documento controlado: documento do Sistema da Qualidade com código, versão, data de vigência e aprovação eletrônica, mantido no sistema (Qualidade 2.0) e na Lista Mestra, disponível em sua versão vigente.
- Lista Mestra (LM 001): relação de todos os documentos do Sistema da Qualidade, com código, título, versão e situação. É gerada pelo próprio sistema (Qualidade 2.0 › Documentos).
- PQ (Procedimento da Qualidade): descreve como uma atividade é executada e controlada. ITA (Instrução de Trabalho Analítica): descreve a execução de um exame. DC (Descrição de Cargo): atribuições e requisitos de um cargo. FR (Formulário/Registro): modelo de registro, preenchido diretamente no sistema. MQ (Manual da Qualidade): descreve o Sistema da Qualidade e a política da qualidade.
- Versão: número sequencial do documento (1.0, 2.0...); cada revisão aprovada gera uma nova versão, e o sistema guarda todas as versões anteriores.
- Assinatura eletrônica: registro, no sistema, da pessoa que elaborou, revisou ou aprovou o documento, com a assinatura cadastrada, a data e a hora.`,
    4: `- Diretoria do Laboratório: aprova os documentos do Sistema da Qualidade e assegura os recursos para sua elaboração e revisão.
- Chefes de Setores: elaboram e revisam os documentos de seus setores e garantem que sejam seguidos.
- Supervisor de Qualidade: orienta a elaboração conforme este procedimento, confere o padrão, mantém os cadastros de assinaturas e garante que somente a versão vigente esteja disponível no sistema.`,
    '5.2': `Todos os documentos usam o padrão visual CDA, gerado pelo sistema, com:

- Cabeçalho com a logomarca, o tipo do documento (Procedimento da Qualidade, Instrução de Trabalho etc.), o título e a data de emissão;
- Ficha de identificação com código, versão, situação, vigência, data da próxima revisão e unidade;
- Aviso de documento controlado: a cópia impressa só é válida se emitida do sistema e conferida com a versão vigente;
- Quadro de assinaturas de elaboração, revisão e aprovação/liberação, montado pelo sistema com a assinatura eletrônica cadastrada de cada responsável, a data e a versão assinada.`,
    '5.5': `- O autor elabora o documento no sistema (situação "Rascunho"); um segundo profissional o revisa (situação "Em revisão"); a Diretoria (ou o Responsável Técnico, quando delegado) o aprova e libera (situação "Vigente").
- Cada etapa só pode ser concluída por usuário com o perfil correspondente (elabora, revisa, aprova) e fica registrada com nome, data, hora e assinatura eletrônica.
- Após a aprovação, a Lista Mestra é atualizada automaticamente e a versão anterior passa para "Obsoleto", mantida no sistema para consulta histórica.
- O documento aprovado só é alterado por uma nova versão; o sistema não permite editar a versão vigente.`
  },
  'PQ 002': {
    3: `- Documento controlado: documento do Sistema da Qualidade com código, versão e aprovação eletrônica, disponível em sua versão vigente no sistema (Qualidade 2.0).
- Dado controlado: informação do Sistema da Qualidade (tabelas, registros e formulários preenchidos) cuja alteração e disponibilidade são controladas pelo sistema.
- Lista Mestra: relação de todos os documentos do Sistema da Qualidade, com código, versão, data de revisão e situação, gerada pelo sistema.
- Documento obsoleto: versão substituída, que deixa de aparecer como vigente e permanece no sistema para consulta histórica.
- Assinatura eletrônica: registro da pessoa que elaborou, revisou ou aprovou o documento, com assinatura cadastrada, data e hora.`,
    4: `- Diretor do Laboratório: analisar criticamente, aprovar e liberar os documentos e suas revisões, com assinatura eletrônica.
- Supervisor de Qualidade: manter a Lista Mestra e o cadastro de assinaturas, acompanhar os prazos de revisão e verificar o uso apenas da versão vigente.
- Usuários dos documentos: consultar apenas a versão vigente, no sistema, e comunicar inconsistências.`,
    5: `- Os documentos e dados do CDA Laboratório são elaborados, revisados e aprovados dentro do sistema (Qualidade 2.0); a redação final é aprovada e liberada pelo Diretor do Laboratório ou pelo Responsável Técnico, com assinatura eletrônica.
- A versão vigente de cada documento está disponível a todos os usuários autorizados em todos os locais de utilização, por meio do sistema.
- As revisões e substituições são submetidas à análise crítica do aprovador antes de entrar em vigor. O sistema registra quem elaborou, revisou e aprovou, e quando.
- A revisão é feita no máximo a cada 12 meses ou a qualquer tempo, quando houver mudança de norma, de processo ou de resultado de auditoria. O sistema indica os documentos com revisão próxima do vencimento.
- Quando uma nova versão é aprovada, a anterior passa para "Obsoleto" automaticamente, deixando de ser exibida como vigente. As versões obsoletas ficam guardadas no sistema por, no mínimo, 5 anos, para consulta histórica.
- A natureza de cada revisão é registrada no histórico do documento, para subsidiar a análise crítica e a aprovação.
- Impressões são feitas por meio do relatório de impressão do sistema, que identifica o documento como cópia controlada, com a data e a hora de emissão. Cópias impressas não são arquivadas nos setores.
- Acesso: leitura para todos os usuários cadastrados; elaboração, revisão e aprovação conforme o perfil de cada um. O sistema registra os acessos que alteram documentos.

São considerados documentos e dados do Sistema da Qualidade do CDA Laboratório:
### 5.1 Manual da Qualidade (MQ)
### 5.2 Descrição de Cargos (DC)
### 5.3 Procedimentos da Qualidade (PQ)
### 5.4 Instruções de Trabalho (ITA)
### 5.5 Formulários de Registros (FR)

- A sistemática para controle de dados é definida nos procedimentos onde são gerados, bem como o responsável pela análise crítica e aprovação dos mesmos.`,
    6: `| Registro | Responsável pela coleta | Local de arquivamento | Forma | Tempo de guarda |
|---|---|---|---|---|
| MQ, DC, PQ, ITA, FR (todas as versões) | Supervisor de Qualidade | Qualidade 2.0 · Documentos | Digital | Vigência + 5 anos |
| Lista Mestra (LM 001) | Supervisor de Qualidade | Qualidade 2.0 · Documentos | Digital | Enquanto vigente + 5 anos |
| Registro de elaboração, revisão e aprovação (assinaturas eletrônicas) | Sistema | Qualidade 2.0 · Documentos | Digital | Vigência + 5 anos |`
  },
  'PQ 003': {
    3: `- Dado bruto: informação original obtida na execução das atividades (resultados de controle da qualidade, formulários preenchidos no sistema, registros de não conformidade e impressos de equipamentos, estes digitalizados e anexados ao registro).
- Registro: documento que apresenta resultados obtidos ou fornece evidências de atividades realizadas.
- Rastreabilidade: possibilidade de recuperar o histórico de um registro (quem, quando, o quê).
- Assinatura eletrônica: identificação de quem preencheu ou aprovou o registro, feita pelo login pessoal do usuário e, quando aplicável, pela assinatura cadastrada no sistema.`,
    4: `- Chefes de Setores: garantir que os registros do setor sejam preenchidos no sistema no dia da atividade e que os anexos (impressos de equipamentos, certificados) sejam digitalizados e anexados.
- Todos os usuários: preencher os formulários diretamente no sistema, com o próprio login; não compartilhar senha.
- Supervisor de Qualidade: verificar a completude dos registros, os prazos de guarda e as cópias de segurança do sistema.
- Fornecedor do LIS (Criasoft): manter o backup em nuvem dos laudos e do cadastro dos pacientes.
- Responsável pela Tecnologia/Sistema da Qualidade: manter as cópias de segurança do Qualidade 2.0 e o controle de acessos.`,
    5: `- Todos os formulários do Sistema da Qualidade são preenchidos diretamente no sistema (Qualidade 2.0 › Preencher formulário ou Registros do dia). Não se usa formulário impresso como registro.
- Cada registro guarda automaticamente a data e a hora do preenchimento, o usuário e a unidade; correções não apagam o registro original, pois ficam registradas no histórico de alterações.
- Registros que dependem de documento externo (certificados de calibração, laudos do apoio, impressos de equipamentos, licenças, termos assinados pelo paciente) são digitalizados e anexados ao registro correspondente no sistema.
- Os registros ficam organizados por formulário, unidade e data, o que permite localizar qualquer registro e emitir o relatório de impressão sempre que necessário (auditoria, fiscalização, análise crítica).
- Os registros dos laudos emitidos e do cadastro do paciente estão disponíveis no sistema de informática laboratorial (LIS), com cópia de segurança em nuvem sob responsabilidade da empresa fornecedora do sistema.
- Todos os dados brutos e registros ficam guardados pelo prazo mínimo de 5 (cinco) anos, salvo prazo maior exigido pela legislação.
- A partir de 2024 o CDA Laboratório digitalizou praticamente todos os processos que antes exigiam papel; o sistema da Qualidade é o repositório único desses registros.
- O acesso é controlado por perfil de usuário; os registros são confidenciais e só são consultados por pessoas autorizadas (PQ 058).`,
    6: `| Registro | Responsável pela coleta | Local de arquivamento | Forma | Tempo de guarda |
|---|---|---|---|---|
| Formulários preenchidos do Sistema da Qualidade | Chefes de Setores | Qualidade 2.0 · Registros do dia / Preencher formulário | Digital | 5 anos |
| Impressos de equipamentos e demais anexos | Chefes de Setores | Qualidade 2.0 (anexo ao registro) | Digital | 5 anos |
| Laudos e cadastro de pacientes | Recepção e Área Técnica | LIS (com cópia de segurança em nuvem) | Digital | 5 anos |`
  }
};
function aplicaMao(d, t) {
  var m = MAO[d.codigo]; if (!m) return t;
  Object.keys(m).forEach(function (k) { t = trocaSec(t, k, m[k]); });
  // subitens (5.2, 5.5) do PQ 001
  ['5.2', '5.5'].forEach(function (k) {
    if (!m[k]) return; var L = linhas(t), ini = -1, fim = L.length;
    for (var i = 0; i < L.length; i++) { if (ini < 0 && L[i].indexOf('### ' + k) === 0) ini = i; else if (ini >= 0 && /^#{2,3} /.test(L[i])) { fim = i; break; } }
    if (ini >= 0) { L.splice(ini + 1, fim - ini - 1, m[k] + '\n'); t = L.join('\n'); }
  });
  return t;
}

/* ---------- 5. histórico: a linha do rascunho passa a registrar a reescrita ---------- */
function historico(d, t) {
  var L = linhas(t), mudou = false;
  for (var i = L.length - 1; i >= 0; i--) {
    if (/^\|/.test(L[i]) && /Rascunho IA/.test(L[i]) && !/^\|\s*Vers/.test(L[i])) {
      var c = L[i].replace(/^\||\|\s*$/g, '').split('|').map(function (x) { return x.trim(); });
      if (c.length >= 4) { c[1] = HOJE_BR; c[2] = c[2].replace(/\s*Pendente de aprovação do RT\.?$/i, '').replace(/\.$/, '') + '. Reescrito para o sistema Qualidade 2.0 (registros e assinaturas no sistema, requisitos do Programa Unimed). Pendente de aprovação do RT.'; L[i] = '| ' + c.join(' | ') + ' |'; mudou = true; }
      break;
    }
  }
  return L.join('\n');
}

/* ---------- 6. formulários usados e requisitos da Unimed ---------- */
const TIT = {}; DOCS.forEach(function (d) { TIT[d.codigo] = d.titulo; });
function reqsDe(cod) { return REQ.filter(function (r) { return r[6].indexOf(cod) >= 0; }); }
function frsDe(d, t) {
  var s = {}; (t.match(/FR \d{3}/g) || []).forEach(function (c) { if (c !== d.codigo && TIT[c]) s[c] = 1; });
  reqsDe(d.codigo).forEach(function (r) { r[6].forEach(function (c) { if (/^FR /.test(c) && TIT[c]) s[c] = 1; }); });
  return Object.keys(s).sort();
}
function blocoForms(d, t) {
  var f = frsDe(d, t); if (!f.length) return '';
  return '### Formulários preenchidos no sistema\nOs formulários abaixo são preenchidos diretamente no sistema (Qualidade 2.0 › Preencher formulário ou Registros do dia). Cada registro guarda data, hora, usuário e unidade, e pode ser impresso por meio do relatório de impressão do sistema, quando necessário.\n\n' + f.map(function (c) { return '- ' + c + ' – ' + TIT[c]; }).join('\n') + '\n';
}
function blocoUnimed(d) {
  var r = reqsDe(d.codigo); if (!r.length) return '';
  return 'Este documento comprova os requisitos abaixo do Programa de Qualidade da Unimed (Valor Conecta), conforme a autoavaliação do laboratório:\n\n' + r.map(function (x) { var tx = x[3].replace(/\s+/g, ' ').trim(); if (tx.length > 260) tx = tx.slice(0, 257).replace(/\s+\S*$/, '') + '…'; return '- **' + x[0] + '** – ' + tx; }).join('\n') + '\n';
}
function anexos(d, t) {
  var u = blocoUnimed(d); if (!u) return t;
  var corpo = '### Requisitos do Programa Unimed atendidos\n' + u;
  if (sec(t, 8)) return trocaSec(t, 8, corpo.replace(/^### /, '### '));
  return t.replace(/\s+$/, '') + '\n## Requisitos do Programa Unimed atendidos\n' + u;
}
function insereForms(d, t) {
  if (d.tipo !== 'PQ' && d.tipo !== 'MQ') return t;
  var b = blocoForms(d, t); if (!b) return t;
  var s = sec(t, 6); if (!s) return t;
  var L = linhas(t); L.splice(s[1], 0, b); return L.join('\n');
}

/* ---------- execução ---------- */
const vistos = {}, saida = [];
DOCS.forEach(function (d) {
  var k = d.codigo + '|' + d.titulo + '|' + (d.unidade || 'Matriz'); if (vistos[k]) return; vistos[k] = 1;
  var t = limpa(d);
  t = aplicaMao(d, t);
  t = adic(d, t);
  t = tabelaRegistros(t);
  t = frases(d, t);
  t = historico(d, t);
  if (d.tipo !== 'FR') { t = insereForms(d, t); t = anexos(d, t); }
  t = t.replace(/\n{3,}/g, '\n\n').trim();
  var n = Object.assign({}, d, { texto: t, origem: 'Biblioteca CDA 11/2026 · reescrita no sistema' });
  saida.push(n);
});
if (fs.existsSync(path.join(__dirname, '..', 'data', '_formularios_extra.js'))) { /* reservado */ }
const js = '/* Biblioteca de documentos do CDA Laboratório, reescrita para o Qualidade 2.0 (gerada por tools/reescrever-pops.js em ' + HOJE_BR + ') */\nwindow.Q2_DOCS = ' + JSON.stringify(saida) + ';\n';
fs.writeFileSync(path.join(R, 'data', 'documentos.js'), js);
console.log('documentos:', saida.length, 'bytes:', js.length);
