/* Gera as telas de preenchimento (data/formularios2.js) dos formulários FR que ainda não tinham tela no sistema,
   a partir do texto de cada FR em data/documentos.js. Uso: node tools/gerar-formularios.js */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
global.window = {};
(0, eval)(fs.readFileSync(path.join(R, 'data', 'documentos.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(R, 'data', 'formularios.js'), 'utf8'));
const TEM = new Set(window.Q2_FORMS.map(function (f) { return f.c; }));
const CAT = {
  'Relatórios gerenciais': ['FR 050', 'FR 059', 'FR 060', 'FR 061', 'FR 062', 'FR 077', 'FR 083', 'FR 086', 'FR 078'],
  'Resultados e qualidade': ['FR 006', 'FR 024', 'FR 052', 'FR 064', 'FR 085', 'FR 069'],
  'Segurança do paciente e ocorrências': ['FR 051', 'FR 066', 'FR 067', 'FR 071', 'FR 080', 'FR 081', 'FR 076', 'FR 079'],
  'Equipamentos e manutenção': ['FR 053', 'FR 054', 'FR 055', 'FR 056', 'FR 057', 'FR 058', 'FR 084'],
  'Documentos administrativos e RH': ['FR 063', 'FR 068', 'FR 072', 'FR 073', 'FR 082'],
  'Recebimento e fornecedores': ['FR 065'],
  'Controle interno e laboratório de apoio': ['FR 074'],
  'Limpeza e conservação': ['FR 075'],
  'Atendimento ao paciente': ['FR 070'],
  'Auditoria interna': ['FR 048']
};
function catDe(c) { for (var k in CAT) if (CAT[k].indexOf(c) >= 0) return k; return 'Outros formulários'; }
function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'campo'; }
function limpa(s) { return String(s || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(); }

/* tipo do campo a partir do rótulo */
function inferir(label0) {
  var label = limpa(label0).replace(/:$/, ''), m, c = { label: label, tipo: 'texto' };
  if (/\(\s*S\s*\/\s*N\s*\)/i.test(label)) { c.label = label.replace(/\s*\(\s*S\s*\/\s*N\s*\)/i, ''); c.tipo = 'select'; c.opcoes = ['Sim', 'Não']; return c; }
  if ((m = /\(([^()]+)\)\s*$/.exec(label)) && !/:/.test(m[1])) {
    var op = m[1].split(/\s*(?:\/|;|,|\bou\b)\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (op.length >= 2 && op.length <= 8 && op.every(function (x) { return x.length <= 28; }) && !/%|nº|n°/.test(m[1])) { c.label = label.replace(/\s*\([^()]+\)\s*$/, ''); c.tipo = 'select'; c.opcoes = op.map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }); return c; }
  }
  if (/\((%|nº|n°|n\.º)\)\s*$/i.test(label)) { c.tipo = 'numero'; return c; }
  if (/^data\b|\bdata\b(?!s)/i.test(label) && !/inicial e final/i.test(label)) { c.tipo = 'data'; return c; }
  if (/\bhor[aá]rio\b|^hora\b/i.test(label)) { c.tipo = 'hora'; return c; }
  if (label.length > 70 || /descri|an[aá]lise|a[cç][aã]o|causa|observa|resumo|decis|conclus|justific|motivo|conte[uú]do|pauta|objetivo|conduta|pendên|encaminh|medidas|situa[cç][aã]o encontrada/i.test(label)) { c.tipo = 'textarea'; return c; }
  return c;
}
function celulas(l) { return l.replace(/^\||\|\s*$/g, '').split('|').map(function (x) { return limpa(x); }); }
function tabelaDe(L, i) { var rows = []; while (i < L.length && /^\|/.test(L[i])) { if (!/^\|\s*:?-{2,}/.test(L[i])) rows.push(celulas(L[i])); i++; } return { rows: rows, fim: i }; }
function vazia(r) { return r.every(function (x) { return !x; }); }

function gerar(d) {
  var L = d.texto.split('\n'), campos = [], aviso = '', secao = '', i = 0, usados = {};
  function id(label) { var b = slug(label), k = b, n = 2; while (usados[k]) k = b + '_' + n++; usados[k] = 1; return k; }
  function add(c) { c.id = id(c.label); campos.push(c); }
  while (i < L.length) {
    var l = L[i], m;
    if ((m = /^##\s+(?:\d+\s+)?(.*)$/.exec(l))) { secao = limpa(m[1]); i++; if (/Hist[oó]rico/i.test(secao)) { while (i < L.length && !/^##\s/.test(L[i])) i++; continue; } if (/^Finalidade$/i.test(secao)) { var p = []; while (i < L.length && L[i].trim() && !/^##\s/.test(L[i])) { p.push(L[i]); i++; } aviso = limpa(p.join(' ')); secao = ''; continue; } if (secao) campos.push({ id: id('s_' + secao), label: secao, tipo: 'secao' }); continue; }
    if (/^\|/.test(l)) {
      var t = tabelaDe(L, i); i = t.fim; var rows = t.rows; if (!rows.length) continue;
      var hdr = rows[0], body = rows.slice(1);
      if (hdr[0] === 'Versão' && /^Data/.test(hdr[1] || '')) continue;
      if (/^Elabora/.test(hdr[0]) && /Revis/.test(hdr[1] || '')) continue;
      // campos "Rótulo: " no início da tabela (o resto vira outra tabela)
      var k0 = 0; while (k0 < rows.length && /:$/.test(rows[k0][0])) { add(inferir(rows[k0][0])); k0++; }
      if (k0) { rows = rows.slice(k0); if (!rows.length) continue; hdr = rows[0]; body = rows.slice(1); }
      if (hdr.length === 2 && /^Campo$/i.test(hdr[0])) { body.forEach(function (r) { if (r[0]) add(inferir(r[0])); }); continue; }
      // checklist C / NC
      var chk = /C\s*\/\s*NC/i.test(hdr.join(' ')) || (/^Situa/i.test(hdr[1] || '') && body[0] && /^C$/i.test(body[0][1] || ''));
      if (chk) {
        var grupos = [], g = null, titulo0 = /^[A-ZÀ-Ú0-9 .,/()-]{4,}$/.test(hdr[0]) && /^Situa/i.test(hdr[1] || '') ? hdr[0] : '';
        if (titulo0) { g = { t: titulo0, itens: [] }; grupos.push(g); }
        body.forEach(function (r) {
          if (!r[0] || /^C$/i.test(r[1] || '') && !r[0]) return; if (!r[0]) return;
          var cap = /^[A-ZÀ-Ú0-9 .,/()-]{4,}$/.test(r[0]) && !r[0].match(/[a-zà-ú]/);
          if (cap) { g = { t: r[0], itens: [] }; grupos.push(g); return; }
          if (!g) { g = { t: secao || 'Itens', itens: [] }; grupos.push(g); }
          g.itens.push(r[0]);
        });
        grupos = grupos.filter(function (x) { return x.itens.length; });
        if (grupos.length) { var ult = campos[campos.length - 1]; if (ult && ult.tipo === 'checklist') { grupos.forEach(function (x) { ult.grupos.push(x); }); } else add({ label: secao || 'Itens verificados', tipo: 'checklist', grupos: grupos }); }
        continue;
      }
      // matriz mensal
      if (hdr.some(function (x) { return /^Jan/i.test(x); }) && hdr.some(function (x) { return /^Dez/i.test(x); })) { add({ label: secao || 'Valores por mês', tipo: 'grade', linhas: body.map(function (r) { return r[0]; }).filter(Boolean), colunas: hdr.slice(1) }); continue; }
      if (hdr.length === 1) continue;
      // tabela com linhas a preencher (ou já preenchidas)
      var cheia = body.some(function (r) { return !vazia(r); });
      var cols = hdr.map(function (x) { var c = inferir(x); return { id: slug(x), label: x, tipo: c.tipo === 'data' ? 'data' : c.tipo === 'select' ? 'select' : 'texto', opcoes: c.opcoes }; });
      var vistos = {}; cols.forEach(function (c, k) { var b = c.id, n = 2; while (vistos[c.id]) c.id = b + '_' + n++; vistos[c.id] = 1; });
      add({ label: secao || 'Registros', tipo: 'tabela', colunas: cols, linhas: cheia ? body.filter(function (r) { return !vazia(r); }) : [], n: cheia ? 0 : Math.max(3, Math.min(body.length, 6)) });
      continue;
    }
    if ((m = /^(.{2,90}?):\s*[_\s]{4,}\s*$/.exec(l))) { add(inferir(m[1])); i++; continue; }
    i++;
  }
  // remove seções vazias
  campos = campos.filter(function (c, k) { return c.tipo !== 'secao' || (campos[k + 1] && campos[k + 1].tipo !== 'secao'); });
  var temData = campos.some(function (c) { return c.tipo === 'data' && /^data/.test(c.id); });
  if (!temData) campos.unshift({ id: 'data', label: 'Data do registro', tipo: 'data', obrig: 1 });
  else { var dc = campos.filter(function (c) { return c.tipo === 'data'; })[0]; if (dc && dc.id !== 'data') { /* o motor usa o campo "data" como data do registro */ dc.id = 'data'; } }
  return { campos: campos, aviso: aviso };
}

/* formulários com estrutura própria (não vêm só do texto) */
const ESPECIAIS = {
  'FR 006': function () {
    return { campos: [
      { id: 'data', label: 'Data de abertura', tipo: 'data', obrig: 1 }, { id: 'responsavel', label: 'Responsável pela identificação e abertura (nome)', tipo: 'texto', obrig: 1 }, { id: 'setor', label: 'Setor', tipo: 'texto', obrig: 1 },
      { id: 'origem', label: 'Origem da não conformidade', tipo: 'select', obrig: 1, opcoes: ['Reclamação de clientes', 'Padrões não conformes', 'Auditoria', 'Colaborador', 'Equipamentos não conformes', 'Pesquisa de satisfação', 'CEQ', 'CIQ', 'Incidente e/ou evento adverso', 'Outros'] },
      { id: 'descricao', label: 'Descrição da situação', tipo: 'textarea', obrig: 1 }, { id: 'impacto', label: 'Houve impacto para os pacientes?', tipo: 'select', obrig: 1, opcoes: ['Sim', 'Não'] },
      { id: 'correcao', label: 'Correção imediata', tipo: 'textarea' }, { id: 'correcao_resp', label: 'Responsável pela execução da correção', tipo: 'texto' },
      { id: 'causa_tipo', label: 'Análise da causa raiz: categoria', tipo: 'multi', opcoes: ['Processos', 'Matéria-prima', 'Mão de obra', 'Equipamentos', 'Outros'] }, { id: 'causa', label: 'Análise da causa raiz', tipo: 'textarea' },
      { id: 'acoes', label: 'Ação a ser tomada', tipo: 'tabela', colunas: [{ id: 'o_que', label: 'O que?', tipo: 'texto' }, { id: 'quem', label: 'Quem?', tipo: 'texto' }, { id: 'quando', label: 'Quando?', tipo: 'data' }, { id: 'onde', label: 'Onde?', tipo: 'texto' }], linhas: [], n: 3 },
      { id: 'envolvidos', label: 'Ciência dos envolvidos (nome e cargo, um por linha)', tipo: 'textarea' }, { id: 'eficacia', label: 'Verificação da eficácia da ação (data e resultado)', tipo: 'textarea' }
    ], aviso: 'Toda não conformidade é registrada aqui, analisada quanto à causa e acompanhada até a verificação da eficácia da ação, conforme o PQ 014.' };
  },
  'FR 024': function () {
    var n = function (id, l) { return { id: id, label: l, tipo: 'numero', min: 0, max: 10 }; };
    return { campos: [
      { id: 'data', label: 'Data da resposta', tipo: 'data', obrig: 1 }, { id: 'canal', label: 'Como foi respondida', tipo: 'select', opcoes: ['Aplicativo (NPS)', 'Registrada pela recepção'] },
      n('p1', 'Esclarecimento de dúvidas antes do atendimento (0 a 10)'), n('p2', 'Atendimento na recepção (0 a 10)'), n('p3', 'Tempo de espera (0 a 10)'), n('p4', 'Atendimento e cuidado na coleta (0 a 10)'), n('p5', 'Ambiente, limpeza e conforto (0 a 10)'), n('p6', 'Entrega e clareza do resultado (0 a 10)'), n('p7', 'Atendimento geral e pós-atendimento (0 a 10)'),
      { id: 'nps', label: 'De 0 a 10, o quanto recomendaria o CDA Laboratório? (NPS)', tipo: 'numero', min: 0, max: 10 }, { id: 'comentario', label: 'Comentário do paciente', tipo: 'textarea' }, { id: 'identificacao', label: 'Identificação e contato (opcional)', tipo: 'texto' }
    ], aviso: 'Notas de 0 a 3: satisfação não atendida; 4 a 6: parcialmente atendida; 7 a 10: atendida (PQ 027). Cada resposta entra no índice de satisfação.' };
  }
};

const out = [];
window.Q2_DOCS.filter(function (d) { return d.tipo === 'FR' && !TEM.has(d.codigo) && d.codigo !== 'FR 001'; }).forEach(function (d) {
  var g = ESPECIAIS[d.codigo] ? ESPECIAIS[d.codigo]() : gerar(d);
  var f = { c: d.codigo, t: d.titulo, cat: catDe(d.codigo), modo: 'evento', campos: g.campos };
  if (g.aviso) f.aviso = g.aviso;
  out.push(f);
});
fs.writeFileSync(path.join(R, 'data', 'formularios2.js'), '/* Formulários gerados a partir do texto dos FR (tools/gerar-formularios.js) */\nwindow.Q2_FORMS = (window.Q2_FORMS || []).concat(' + JSON.stringify(out) + ');\n');
var resumo = {}; out.forEach(function (f) { f.campos.forEach(function (c) { resumo[c.tipo] = (resumo[c.tipo] || 0) + 1; }); });
console.log('formulários gerados:', out.length, resumo);
