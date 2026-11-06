/* Conversor de texto simples (estilo Markdown) para HTML, e montagem do papel timbrado. */
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function inl(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<i>$2</i>'); }
  function md(t) {
    var L = String(t || '').replace(/\r/g, '').split('\n'), h = '', i = 0, lista = null;
    function fecha() { if (lista) { h += '</' + lista + '>'; lista = null; } }
    while (i < L.length) {
      var l = L[i], m;
      if (!l.trim()) { fecha(); i++; continue; }
      if ((m = /^(#{1,3})\s+(.*)$/.exec(l))) { fecha(); h += '<h' + (m[1].length + 1) + '>' + inl(m[2]) + '</h' + (m[1].length + 1) + '>'; i++; continue; }
      if (/^---+\s*$/.test(l)) { fecha(); h += '<hr>'; i++; continue; }
      if (/^>\s?/.test(l)) { fecha(); var q = []; while (i < L.length && /^>\s?/.test(L[i])) { q.push(L[i].replace(/^>\s?/, '')); i++; } h += '<blockquote>' + q.map(inl).join('<br>') + '</blockquote>'; continue; }
      if (/^\|/.test(l)) {
        fecha(); var rows = []; while (i < L.length && /^\|/.test(L[i])) { if (!/^\|\s*:?-{2,}/.test(L[i])) rows.push(L[i].replace(/^\||\|\s*$/g, '').split('|').map(function (c) { return c.trim(); })); i++; }
        h += '<table><thead><tr>' + rows[0].map(function (c) { return '<th>' + inl(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.slice(1).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inl(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; continue;
      }
      if ((m = /^\s*[-•]\s+(.*)$/.exec(l))) { if (lista !== 'ul') { fecha(); h += '<ul>'; lista = 'ul'; } h += '<li>' + inl(m[1]) + '</li>'; i++; continue; }
      if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(l))) { if (lista !== 'ol') { fecha(); h += '<ol>'; lista = 'ol'; } h += '<li>' + inl(m[1]) + '</li>'; i++; continue; }
      fecha(); var p = [l]; i++; while (i < L.length && L[i].trim() && !/^(#{1,3}\s|\||>|\s*[-•]\s|\s*\d+[.)]\s|---)/.test(L[i])) { p.push(L[i]); i++; } h += '<p>' + p.map(inl).join(' ') + '</p>';
    }
    fecha(); return h;
  }
  /* ornamento do papel timbrado (fitas turquesa), em SVG */
  function fitaTopo() { return '<svg class="orn orn-topo" viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="gt1" x1="0" x2="1"><stop offset="0" stop-color="#0b8793"/><stop offset="1" stop-color="#14c4b0"/></linearGradient><linearGradient id="gt2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#14c4b0"/><stop offset="1" stop-color="#0a6f78"/></linearGradient></defs><path d="M0 28 C70 18 130 52 210 62 C240 66 262 50 262 36 L262 0 L0 0Z" fill="url(#gt1)"/><path d="M0 62 C60 54 120 84 200 84 C236 84 268 70 292 52" fill="none" stroke="#9aa6a8" stroke-width="3" stroke-linecap="round" opacity=".7"/><ellipse cx="258" cy="20" rx="84" ry="46" fill="none" stroke="url(#gt2)" stroke-width="20" transform="rotate(-18 258 20)"/><path d="M360 0 C400 8 420 26 420 64 L420 0Z" fill="url(#gt1)"/></svg>'; }
  function fitaBase() { return '<svg class="orn orn-base" viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="gb1" x1="0" x2="1"><stop offset="0" stop-color="#14c4b0"/><stop offset="1" stop-color="#0b8793"/></linearGradient></defs><path d="M420 150 C350 160 290 128 210 118 C180 114 158 130 158 144 L158 170 L420 170Z" fill="url(#gb1)"/><path d="M420 118 C360 126 300 96 220 96 C184 96 152 110 128 128" fill="none" stroke="#9aa6a8" stroke-width="3" stroke-linecap="round" opacity=".7"/><ellipse cx="162" cy="150" rx="84" ry="46" fill="none" stroke="url(#gb1)" stroke-width="20" transform="rotate(-18 162 150)"/><path d="M60 170 C20 162 0 144 0 106 L0 170Z" fill="url(#gb1)"/></svg>'; }
  var ST = { rascunho: 'Rascunho', em_revisao: 'Em revisão', vigente: 'Vigente', obsoleto: 'Obsoleto' };
  function fmtData(d) { if (!d) return '—'; var p = String(d).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : d; }
  /* papel timbrado: usa o modelo escolhido (logo, linha, coluna lateral com ficha, rodapé de contato), na paleta do sistema */
  function folha(d, corpo, opt) {
    opt = opt || {}; var C = window.Q2_CONFIG.LAB, hoje = new Date().toLocaleDateString('pt-BR');
    var ficha = '<div class="fi-bloco"><span class="fi-nome">' + esc(d.codigo || '') + '</span><span class="fi-cargo">' + esc(d.tipo === 'FR' ? 'Formulário' : d.tipo === 'MQ' ? 'Manual da Qualidade' : d.tipo === 'ITA' ? 'Instrução de trabalho' : d.tipo === 'DC' ? 'Descrição de cargo' : d.tipo === 'L' ? 'Lista' : 'Procedimento') + '</span></div>' +
      '<dl class="fi-dl"><dt>Versão</dt><dd>' + esc(d.versao || '1') + '</dd><dt>Situação</dt><dd>' + esc(ST[d.status] || d.status || '') + '</dd><dt>Vigência</dt><dd>' + fmtData(d.data_vigencia) + '</dd><dt>Próx. revisão</dt><dd>' + fmtData(d.proxima_revisao) + '</dd><dt>Unidade</dt><dd>' + esc(d.unidade || 'Matriz') + '</dd></dl>';
    var ass = opt.sem_assinatura ? '' : '<div class="assin"><div><span class="ln"></span><b>' + esc(d.elaborador || '—') + '</b><small>Elaboração' + (d.data_elaboracao ? ' · ' + fmtData(d.data_elaboracao) : '') + '</small></div><div><span class="ln"></span><b>' + esc(d.revisor || '—') + '</b><small>Revisão' + (d.data_revisao ? ' · ' + fmtData(d.data_revisao) : '') + '</small></div><div><span class="ln"></span><b>' + esc(d.aprovador || '—') + '</b><small>Aprovação' + (d.data_vigencia ? ' · ' + fmtData(d.data_vigencia) : '') + '</small></div></div>';
    return '<article class="folha">' + fitaTopo() + fitaBase() +
      '<header class="cab"><img src="img/logo-cda.png" alt="CDA"><div class="cab-t"><b>' + esc(C.nome) + '</b><small>' + esc(C.sub) + '</small></div><span class="cab-d">' + hoje + '</span></header><div class="regua"></div>' +
      '<aside class="lateral"><span class="ponto"></span><div class="fio"></div><span class="ponto"></span>' + '<div class="lat-c">' + ficha + '</div></aside>' +
      '<table class="flow"><thead><tr><td><div class="esp-t"></div></td></tr></thead><tbody><tr><td class="miolo"><h1 class="tit">' + esc(d.titulo || '') + '</h1>' + corpo + ass + '</td></tr></tbody><tfoot><tr><td><div class="esp-b"></div></td></tr></tfoot></table>' +
      '<footer class="rodape"><span><i>☎</i>' + esc(C.fone) + ' · ' + esc(C.whats) + '</span><span><i>✉</i>' + esc(C.email) + '</span><span><i>⌂</i>' + esc(C.endereco) + '</span></footer></article>';
  }
  window.MD = { md: md, esc: esc, folha: folha, fmtData: fmtData, ST: ST };
})();
