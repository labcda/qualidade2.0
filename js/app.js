/* Qualidade 2.0 · CDA — interface */
(function () {
  var $ = function (id) { return document.getElementById(id); }, h = MD.esc, REQ = window.Q2_REQ, DOM = window.Q2_DOMINIOS, GRP = window.Q2_GRUPOS;
  var S = { pg: 'inicio', dom: 'D1', filtro: 'todos', aberto: {}, d: { docs: [], resp: {}, evid: [], legais: [], equip: [], temps: [], regs: [], tol: {}, fia: [], fiaFx: null }, docId: null, busca: '', tipo: '', situ: '' };
  var RLAB = { A: 'Atende', P: 'Parcial', N: 'Não atende', NA: 'Não se aplica' }, RCOR = { A: '#16a34a', P: '#d97706', N: '#dc2626', NA: '#64748b', F: '#7c6cf0' };
  var LEG_NOME = {}; window.Q2_LEGAIS.forEach(function (l) { LEG_NOME[l[0]] = l[1]; });
  function toast(t, e) { var x = document.createElement('div'); x.className = 'toast' + (e ? ' e' : ''); x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.remove(); }, 3600); }
  function hoje() { return new Date().toISOString().slice(0, 10); }
  function dias(d) { if (!d) return null; return Math.round((new Date(String(d).slice(0, 10) + 'T12:00:00') - new Date(hoje() + 'T12:00:00')) / 864e5); }
  function modal(html, quando) { var o = document.createElement('div'); o.className = 'ov'; o.innerHTML = '<div class="md">' + html + '</div>'; document.body.appendChild(o); o.addEventListener('mousedown', function (e) { if (e.target === o) o.remove(); }); o.fechar = function () { o.remove(); }; if (quando) quando(o); return o; }

  /* ---------- dados e cálculos ---------- */
  var BIB_VER = '2026-11-06b';   // muda quando o texto da biblioteca é corrigido: no modo demonstração, reaplica os textos
  async function carregar() {
    var r = await Promise.all([DB.docs(), DB.respostas(), DB.evid(), DB.legais(), DB.equip(), DB.temps(somaDias(hoje(), -400), hoje()), DB.registrosResumo(), DB.tolerancias(), DB.fia(), DB.fiaFaixas()]);
    S.d.docs = r[0]; S.d.resp = r[1]; S.d.evid = r[2]; S.d.legais = r[3]; S.d.equip = r[4]; S.d.temps = r[5]; S.d.regs = r[6] || []; S.d.tol = {}; (r[7] || []).forEach(function (t) { S.d.tol[t.chave] = t; }); S.d.fia = r[8] || []; S.d.fiaFx = r[9] || null;
    if (DB.demo && !S.d.docs.length) { await semear(true); }
    if (DB.demo && S.d.docs.length) { try { if (localStorage.getItem('q2_bib_ver') !== BIB_VER) { var up = (window.Q2_DOCS || []).filter(function (d) { return d.origem === 'Biblioteca CDA 10/2026'; }).map(function (d) { return { codigo: d.codigo, titulo: d.titulo, unidade: d.unidade || 'Matriz', texto: d.texto }; }); await DB.saveDocs(up); localStorage.setItem('q2_bib_ver', BIB_VER); S.d.docs = await DB.docs(); } } catch (e) { } }
  }
  async function semear(silencioso) {
    var docs = (window.Q2_DOCS || []).map(function (d) { return Object.assign({ unidade: 'Matriz', versao: '1', status: 'rascunho', elaborador: 'Diêgo Padua Silva', data_elaboracao: '2026-11-06' }, d); });
    await DB.saveDocs(docs);
    var resp = REQ.filter(function (r) { return !S.d.resp[r[0]]; }).map(function (r) { return { codigo: r[0], resposta: r[5], constatacao: r[9] || '', futuro: !!r[7], atualizado_por: 'Autoavaliação Unimed (06/11/2026)' }; });
    if (resp.length) await DB.saveRespostas(resp);
    await carregar(); if (!silencioso) toast('Biblioteca e autoavaliação carregadas.'); if (!silencioso) render();
  }
  function resp(r) { var x = S.d.resp[r[0]]; return x ? { v: x.resposta, c: x.constatacao || '', f: !!x.futuro } : { v: r[5], c: r[9] || '', f: !!r[7] }; }
  function docPorCod(c) { return S.d.docs.filter(function (d) { return d.codigo === c && d.status !== 'obsoleto'; })[0]; }
  function somaDias(d, n) { var x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
  /* formulários preenchidos dentro do sistema = evidência automática. Cada formulário (FR) aponta para os tipos de equipamento que registra. */
  var FR_TEMP = { 'FR 001': ['geladeira', 'freezer'], 'FR 009': ['banho-maria'], 'FR 010': ['ambiente'] };
  function regsDoForm(cod) { var tp = FR_TEMP[cod]; if (!tp) return []; var ids = S.d.equip.filter(function (e) { return tp.indexOf(e.tipo) >= 0; }).map(function (e) { return e.id; }); return S.d.temps.filter(function (t) { return ids.indexOf(t.equip_id) >= 0; }); }
  function legaisDoTipo(t) { return S.d.legais.filter(function (l) { return l.tipo === t; }); }
  function legalSit(l) { var n = dias(l.validade); if (!l.validade) return { c: '#94a3b8', t: 'Sem validade' }; if (n < 0) return { c: '#dc2626', t: 'Vencido há ' + (-n) + ' d' }; if (n <= 60) return { c: '#d97706', t: 'Vence em ' + n + ' d' }; return { c: '#16a34a', t: 'Em dia · ' + MD.fmtData(l.validade) }; }
  /* comprovação automática: documentos da biblioteca + documentos legais cadastrados + evidências manuais */
  function prova(r) {
    var docs = (r[6] || []).map(function (c) { return { c: c, d: docPorCod(c) }; });
    var leg = r[8] ? legaisDoTipo(r[8]) : [];
    var man = S.d.evid.filter(function (e) { return e.req_codigo === r[0]; });
    return { docs: docs, legais: leg, manuais: man, ok: docs.some(function (x) { return x.d; }) || leg.length > 0 || man.length > 0 };
  }
  function contagem(lista) { var o = { A: 0, P: 0, N: 0, NA: 0, F: 0, t: 0, sem: 0 }; lista.forEach(function (r) { var x = resp(r); o.t++; if (x.f && x.v !== 'A') o.F++; else o[x.v]++; if (!prova(r).ok && x.v !== 'NA' && !x.f) o.sem++; }); return o; }

  /* ---------- estrutura ---------- */
  var MENU = [['inicio', '⌂', 'Início'], ['programa', '✓', 'Autoavaliação'], ['docs', '▤', 'Documentos'], ['legais', '⚖', 'Documentos legais'], ['registros', '☰', 'Registros do dia'], ['frm', '✎', 'Preencher formulário'], ['regs', '▦', 'Formulários preenchidos'], ['cq', '◔', 'Controle analítico'], ['relatorio', '⎙', 'Relatório'], ['ajustes', '⚙', 'Ajustes']];
  function irPara(p, extra) { S.pg = p; if (extra) Object.assign(S, extra); if (p !== 'docs') S.docId = null; render(); window.scrollTo(0, 0); $('side').classList.remove('aberto'); history.replaceState(null, '', '#' + p); }
  function menu() {
    var u = DB.user, pend = S.d.legais.filter(function (l) { var n = dias(l.validade); return n !== null && n <= 60; }).length;
    $('side').innerHTML = '<div class="marca"><img src="img/logo-cda.png" alt="CDA"><div><b>Qualidade 2.0</b><small>Laboratório CDA</small></div></div>' +
      MENU.map(function (m, i) { return (i === 8 ? '<div class="tit">Consulta</div>' : '') + '<button class="nv' + (S.pg === m[0] ? ' on' : '') + '" data-ir="' + m[0] + '"><i>' + m[1] + '</i><span>' + m[2] + '</span>' + (m[0] === 'legais' && pend ? '<em>' + pend + '</em>' : '') + '</button>'; }).join('') +
      '<div class="eu"><div class="av">' + h((u.nome || '?').charAt(0).toUpperCase()) + '</div><div><b>' + h(u.nome) + '</b><small>' + h(({ admin: 'Administrador', elabora: 'Elabora', revisa: 'Revisa', aprova: 'Aprova', consulta: 'Consulta' })[u.papel]) + (DB.demo ? ' · demonstração' : '') + '</small></div><button data-sair>Sair</button></div>';
  }
  function topo(t, s, extra) { return '<div class="topo"><button class="menu-m" data-menu>☰ Menu</button><h1>' + t + (s ? '<small>' + s + '</small>' : '') + '</h1>' + (extra || '') + '<div class="busca" data-busca>🔎 Procurar <kbd>Ctrl K</kbd></div></div>'; }
  function render() {
    menu(); var m = $('main');
    var f = { inicio: pgInicio, programa: pgPrograma, docs: pgDocs, legais: pgLegais, registros: pgRegistros, frm: pgForms, regs: pgRegs, cq: pgCq, evid: pgEvid, relatorio: pgRelatorio, ajustes: pgAjustes }[S.pg] || pgInicio;
    m.innerHTML = f();
    if (S.pg === 'inicio') requestAnimationFrame(function () { document.querySelectorAll('.bar i[data-w]').forEach(function (e) { e.style.width = e.dataset.w + '%'; }); var a = $('anelc'); if (a) a.style.strokeDashoffset = a.dataset.off; });
  }
  function barra(o, tot) { var seg = [['A', RCOR.A], ['P', RCOR.P], ['N', RCOR.N], ['F', RCOR.F], ['NA', RCOR.NA]]; return '<div class="bar">' + seg.map(function (s) { return '<i style="width:0;background:' + s[1] + '" data-w="' + (tot ? (o[s[0]] / tot * 100).toFixed(1) : 0) + '"></i>'; }).join('') + '</div>'; }

  /* ---------- início ---------- */
  function pgInicio() {
    var tot = contagem(REQ), apl = tot.t - tot.NA, pct = apl ? Math.round(tot.A / apl * 100) : 0, C = 2 * Math.PI * 70;
    var u = DB.user, hr = new Date().getHours(), sd = hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
    var vencendo = S.d.legais.filter(function (l) { var n = dias(l.validade); return n !== null && n <= 60; }).sort(function (a, b) { return dias(a.validade) - dias(b.validade); });
    var falta = REQ.filter(function (r) { var x = resp(r); return (x.v === 'N' || x.v === 'P') && !x.f; });
    var rasc = S.d.docs.filter(function (d) { return d.status === 'rascunho' || d.status === 'em_revisao'; });
    var o = topo(sd + ', ' + h((u.nome || '').split(' ')[0]), 'Sua central de qualidade para a autoavaliação dos prestadores e para a acreditação');
    if (!S.d.docs.length) o += '<div class="vidro pad" style="margin-bottom:18px;border-left:6px solid #d97706"><b>Biblioteca ainda vazia.</b> <span style="color:var(--mut)">Carregue os documentos iniciais (POPs, instruções, formulários e os novos para a Unimed) e a autoavaliação de 06/11/2026.</span><div style="margin-top:12px"><button class="btn p" data-semear>Carregar biblioteca inicial</button></div></div>';
    o += '<div class="vidro heroi anim"><div class="anel"><svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="70" fill="none" stroke="rgba(16,181,164,.15)" stroke-width="16"/><circle id="anelc" cx="85" cy="85" r="70" fill="none" stroke="url(#ga)" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" data-off="' + (C * (1 - pct / 100)) + '" style="transition:stroke-dashoffset 1.3s cubic-bezier(.2,.8,.2,1)"/><defs><linearGradient id="ga" x1="0" x2="1"><stop offset="0" stop-color="#0e9aa7"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs></svg><div class="c"><div><b>' + pct + '%</b><small>dos requisitos atendidos</small></div></div></div>' +
      '<div><h2>Autoavaliação · autoavaliação</h2><p>' + tot.A + ' de ' + apl + ' requisitos aplicáveis atendem. ' + (falta.length ? 'Faltam ' + falta.length + ' para chegar a 100%.' : 'Tudo atendido, parabéns!') + (tot.sem ? ' <b style="color:#b91c1c">' + tot.sem + ' ainda sem comprovação no sistema.</b>' : ' Todos têm comprovação.') + '</p><div class="leg"><span><i style="background:' + RCOR.A + '"></i>' + tot.A + ' atendem</span><span><i style="background:' + RCOR.P + '"></i>' + tot.P + ' parciais</span><span><i style="background:' + RCOR.N + '"></i>' + tot.N + ' não atendem</span><span><i style="background:' + RCOR.F + '"></i>' + tot.F + ' futuros</span><span><i style="background:' + RCOR.NA + '"></i>' + tot.NA + ' n/a</span></div><div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-ir="programa">Ver requisitos</button><button class="btn s" data-ir="relatorio">Relatório para imprimir</button></div></div></div>';
    o += '<h2 class="sec">Os 5 domínios</h2><div class="grade g5 anim">' + Object.keys(DOM).map(function (k) { var c = contagem(REQ.filter(function (r) { return r[1] === k; })), a = c.t - c.NA; return '<button class="vidro dom" data-dom="' + k + '"><span class="d">' + k + '</span><b>' + DOM[k].nome + '</b>' + barra(c, c.t) + '<div class="n"><span>' + c.A + ' de ' + c.t + '</span><span>' + (a ? Math.round(c.A / a * 100) : 0) + '%</span></div></button>'; }).join('') + '</div>';
    o += '<h2 class="sec">Precisa de atenção <span>' + (vencendo.length + Math.min(falta.length, 6) + rasc.length) + '</span></h2><div class="lista anim">';
    vencendo.slice(0, 4).forEach(function (l) { var s = legalSit(l); o += '<button class="acao" style="--c:' + s.c + '" data-ir="legais"><span class="ic">⚖</span><span class="t"><b>' + h(LEG_NOME[l.tipo] || l.descricao) + '</b><small>' + s.t + (l.numero ? ' · nº ' + h(l.numero) : '') + '</small></span><span class="selo" style="background:#fff;color:' + s.c + '">Documento legal</span></button>'; });
    falta.slice(0, 6).forEach(function (r) { var x = resp(r); o += '<button class="acao" style="--c:' + RCOR[x.v] + '" data-req="' + r[0] + '"><span class="ic">' + (x.v === 'N' ? '✗' : '◐') + '</span><span class="t"><b>' + r[0] + ' · ' + h(r[3].slice(0, 110)) + (r[3].length > 110 ? '…' : '') + '</b><small>' + (prova(r).ok ? 'Já há documento no sistema; falta ajustar a resposta' : 'Falta documento de comprovação') + '</small></span><span class="selo ' + x.v + '">' + RLAB[x.v] + '</span></button>'; });
    rasc.slice(0, 4).forEach(function (d) { o += '<button class="acao" data-doc="' + d.id + '"><span class="ic">▤</span><span class="t"><b>' + h(d.codigo + ' · ' + d.titulo) + '</b><small>Aguardando ' + (d.status === 'rascunho' ? 'revisão' : 'aprovação do RT') + '</small></span><span class="selo ' + d.status + '">' + MD.ST[d.status] + '</span></button>'; });
    if (!vencendo.length && !falta.length && !rasc.length) o += '<div class="vazio">Nada pendente. 🎉</div>';
    return o + '</div>';
  }

  /* ---------- programa Unimed ---------- */
  var FILTROS = [['todos', 'Todos'], ['A', 'Atendem'], ['P', 'Parciais'], ['N', 'Não atendem'], ['F', 'Futuros'], ['sem', 'Sem comprovação']];
  function passa(r) { var x = resp(r), f = S.filtro; if (f === 'todos') return true; if (f === 'F') return x.f; if (f === 'sem') return !prova(r).ok && x.v !== 'NA' && !x.f; return !x.f && x.v === f; }
  function pgPrograma() {
    var o = topo('Autoavaliação', 'Autoavaliação do portal Valor Conecta · 141 requisitos', '<button class="btn" data-ir="relatorio">⎙ Relatório</button>');
    o += '<div class="dtab">' + Object.keys(DOM).map(function (k) { var c = contagem(REQ.filter(function (r) { return r[1] === k; })); return '<button class="' + (S.dom === k ? 'on' : '') + '" data-dom="' + k + '">' + k + ' · ' + DOM[k].nome + '<small>' + c.A + '/' + c.t + ' atendem</small></button>'; }).join('') + '</div>';
    o += '<p style="color:var(--mut);margin:0 0 14px;font-size:.88rem">' + DOM[S.dom].desc + '</p><div class="chips">' + FILTROS.map(function (f) { return '<button class="chip' + (S.filtro === f[0] ? ' on' : '') + '" data-filtro="' + f[0] + '">' + (RCOR[f[0]] ? '<i style="--c:' + RCOR[f[0]] + '"></i>' : '') + f[1] + '</button>'; }).join('') + '</div>';
    var grupos = []; REQ.filter(function (r) { return r[1] === S.dom; }).forEach(function (r) { if (grupos.indexOf(r[2]) < 0) grupos.push(r[2]); });
    var alvo = S.alvo; var any = false;
    grupos.forEach(function (g) {
      var todos = REQ.filter(function (r) { return r[2] === g; }), lista = todos.filter(passa); if (!lista.length) return; any = true;
      var c = contagem(todos), ab = S.aberto[g] || (alvo && lista.some(function (r) { return r[0] === alvo; })) || S.filtro !== 'todos';
      o += '<section class="vidro grp' + (ab ? ' aberto' : '') + '"><button data-grp="' + g + '"><i class="seta">▶</i><b>' + g + ' · ' + GRP[g] + '</b><small>' + c.A + '/' + c.t + '</small><span style="width:110px">' + barra(c, c.t) + '</span></button><div class="corpo">' + lista.map(reqHTML).join('') + '</div></section>';
    });
    if (!any) o += '<div class="vazio">Nenhum requisito neste filtro.</div>';
    if (S.alvo) setTimeout(function () { var e = document.querySelector('[data-r-cod="' + S.alvo + '"]'); if (e) { e.scrollIntoView({ block: 'center', behavior: 'smooth' }); e.style.boxShadow = '0 0 0 4px rgba(16,181,164,.45)'; } S.alvo = null; }, 80);
    return o;
  }
  function reqHTML(r) {
    var x = resp(r), p = prova(r), cor = x.f ? RCOR.F : RCOR[x.v], pode = DB.pode('escrever');
    var ev = p.docs.map(function (e) { var nr = e.d ? regsDoForm(e.c).length + nRegs(e.c) : 0; if (nr) return '<button class="tg ok" data-rel="' + e.c + '" title="Abrir o relatório dos registros preenchidos no sistema">✔ ' + h(e.c) + ' · ' + nr + ' registros <small>ver relatório</small></button>'; return e.d ? '<button class="tg" data-doc="' + e.d.id + '" title="' + h(e.d.titulo) + '">▤ ' + h(e.c) + ' <small>v' + h(e.d.versao) + '</small></button>' : '<span class="tg sem" title="Ainda não existe no sistema">✗ ' + h(e.c) + '</span>'; }).join('');
    ev += p.legais.map(function (l) { var s = legalSit(l); return '<button class="tg' + (l.arquivo_path ? ' ok' : '') + '" ' + (l.arquivo_path ? 'data-anexo="' + l.id + '" title="Abrir o documento anexado"' : 'data-ir="legais" title="Sem anexo ainda: abrir o cadastro"') + ' style="border-left:4px solid ' + s.c + '">' + (l.arquivo_path ? '✔ 📎 ' : '⚖ ') + h(LEG_NOME[l.tipo]) + (l.numero ? ' nº ' + h(l.numero) : '') + '</button>'; }).join('');
    ev += p.manuais.map(function (e) { return '<span class="tg">' + (e.tipo === 'link' ? '<a href="' + h(e.ref) + '" target="_blank" rel="noopener" style="color:inherit">🔗 ' + h(e.nota || e.ref) + '</a>' : '📝 ' + h(e.nota || e.ref)) + (pode ? ' <b data-delev="' + e.id + '" style="cursor:pointer" title="Remover">×</b>' : '') + '</span>'; }).join('');
    if (r[8] && !p.legais.length) ev += '<button class="tg sem" data-ir="legais">⚖ Cadastrar ' + h(LEG_NOME[r[8]]) + '</button>';
    return '<div class="req" data-r-cod="' + r[0] + '" style="--cs:' + cor + '"><div class="l1"><span class="cod">' + r[0] + '</span><p>' + h(r[3]) + '</p><span class="selo ' + (x.f ? 'F' : x.v) + '">' + (x.f ? 'Futuro' : RLAB[x.v]) + '</span></div><div class="base">' + h(r[4]) + '</div>' +
      (x.c ? '<div class="obs">📌 ' + h(x.c) + '</div>' : '') + '<div class="ev">' + (ev || '<span class="tg sem">Sem comprovação ainda</span>') + (pode ? '<button class="tg" data-addev="' + r[0] + '">＋ evidência</button>' : '') + '</div>' +
      (pode ? '<div class="ed">' + ['A', 'P', 'N', 'NA'].map(function (k) { return '<button data-set="' + r[0] + '" data-r="' + k + '" class="' + (!x.f && x.v === k ? 'on' : '') + '">' + RLAB[k] + '</button>'; }).join('') + '<button data-fut="' + r[0] + '" data-f class="' + (x.f ? 'on' : '') + '">Marcar como futuro</button><button data-nota="' + r[0] + '">Constatação</button></div>' : '') + '</div>';
  }
  async function setResp(cod, v, f, c) {
    var r = REQ.filter(function (x) { return x[0] === cod; })[0], x = resp(r), n = { codigo: cod, resposta: v == null ? x.v : v, futuro: f == null ? x.f : f, constatacao: c == null ? x.c : c };
    try { await DB.saveResposta(n); S.d.resp[cod] = Object.assign(S.d.resp[cod] || {}, n); DB.log('resposta', cod + ' = ' + n.resposta + (n.futuro ? ' (futuro)' : '')); render(); } catch (e) { toast(e.message, 1); }
  }
  function addEvid(cod) {
    var r = REQ.filter(function (x) { return x[0] === cod; })[0];
    modal('<h3>Evidência para ' + cod + '</h3><label class="cmp"><span>Tipo</span><select id="ev-t"><option value="documento">Documento da biblioteca</option><option value="link">Link (endereço na internet)</option><option value="nota">Observação / onde fica o registro</option></select></label><label class="cmp" id="ev-w1"><span>Documento</span><select id="ev-d">' + S.d.docs.slice().sort(function (a, b) { return a.codigo < b.codigo ? -1 : 1; }).map(function (d) { return '<option value="' + h(d.codigo) + '">' + h(d.codigo + ' · ' + d.titulo) + '</option>'; }).join('') + '</select></label><label class="cmp oculto" id="ev-w2"><span>Endereço ou texto</span><input id="ev-r" placeholder="https://… ou descrição"></label><label class="cmp"><span>Comentário (aparece no relatório)</span><input id="ev-n" placeholder="Ex.: registros de outubro/2026"></label><div class="bt"><button class="btn s" data-x>Cancelar</button><button class="btn" id="ev-ok">Salvar evidência</button></div>', function (o) {
      var t = o.querySelector('#ev-t'); t.onchange = function () { o.querySelector('#ev-w1').classList.toggle('oculto', t.value !== 'documento'); o.querySelector('#ev-w2').classList.toggle('oculto', t.value === 'documento'); };
      o.querySelector('[data-x]').onclick = o.fechar;
      o.querySelector('#ev-ok').onclick = async function () { var tp = t.value, ref = tp === 'documento' ? o.querySelector('#ev-d').value : o.querySelector('#ev-r').value.trim(); if (!ref) return toast('Preencha o endereço ou o texto.', 1); try { var e = await DB.addEvid({ req_codigo: cod, tipo: tp, ref: ref, nota: o.querySelector('#ev-n').value.trim() }); S.d.evid.push(e); o.fechar(); render(); toast('Evidência adicionada.'); } catch (er) { toast(er.message, 1); } };
    });
  }
  function notaReq(cod) {
    var r = REQ.filter(function (x) { return x[0] === cod; })[0];
    modal('<h3>Constatação · ' + cod + '</h3><p style="color:var(--mut);font-size:.85rem;margin-top:0">' + h(r[3].slice(0, 180)) + '</p><label class="cmp"><span>Constatação / plano para atender</span><textarea id="nt">' + h(resp(r).c) + '</textarea></label><div class="bt"><button class="btn s" data-x>Cancelar</button><button class="btn" id="nt-ok">Salvar</button></div>', function (o) { o.querySelector('[data-x]').onclick = o.fechar; o.querySelector('#nt-ok').onclick = function () { setResp(cod, null, null, o.querySelector('#nt').value.trim()); o.fechar(); }; });
  }

  /* ---------- documentos ---------- */
  var TIPOS = { MQ: 'Manual', PQ: 'Procedimentos (PQ)', ITA: 'Instruções (ITA)', FR: 'Formulários (FR)', DC: 'Cargos (DC)', L: 'Listas' };
  function pgDocs() { return S.docId ? pgDoc() : pgDocsLista(); }
  function pgDocsLista() {
    var q = MD.esc(S.busca).toLowerCase(), l = S.d.docs.filter(function (d) { return d.status !== 'obsoleto' && (!S.tipo || d.tipo === S.tipo) && (!S.situ || d.status === S.situ) && (!q || (d.codigo + ' ' + d.titulo).toLowerCase().indexOf(q) >= 0); }).sort(function (a, b) { return a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : 0; });
    var o = topo('Documentos', S.d.docs.length + ' documentos na biblioteca', DB.pode('escrever') ? '<button class="btn" data-novodoc>＋ Novo documento</button>' : '');
    o += '<div class="barra"><input id="f-q" placeholder="Procurar por código ou título…" value="' + h(S.busca) + '"><select id="f-t"><option value="">Todos os tipos</option>' + Object.keys(TIPOS).map(function (k) { return '<option value="' + k + '"' + (S.tipo === k ? ' selected' : '') + '>' + TIPOS[k] + '</option>'; }).join('') + '</select><select id="f-s"><option value="">Qualquer situação</option>' + Object.keys(MD.ST).map(function (k) { return '<option value="' + k + '"' + (S.situ === k ? ' selected' : '') + '>' + MD.ST[k] + '</option>'; }).join('') + '</select></div>';
    o += l.length ? '<div class="cards anim">' + l.map(function (d) { var tem = d.texto && d.texto.length > 40; return '<button class="vidro dc" data-doc="' + d.id + '"><span class="cd">' + h(d.codigo) + ' · ' + (TIPOS[d.tipo] || d.tipo) + '</span><b>' + h(d.titulo) + '</b><span class="rod"><span class="selo ' + d.status + '">' + MD.ST[d.status] + '</span><span>v' + h(d.versao) + '</span>' + (tem ? '' : '<span style="color:#b45309">sem texto</span>') + '</span></button>'; }).join('') + '</div>' : '<div class="vazio">Nenhum documento encontrado.</div>';
    return o;
  }
  function pgDoc() {
    var d = S.d.docs.filter(function (x) { return x.id === S.docId; })[0]; if (!d) { S.docId = null; return pgDocsLista(); }
    var pode = DB.pode('escrever'), reqs = REQ.filter(function (r) { return (r[6] || []).indexOf(d.codigo) >= 0; });
    var o = '<button class="voltar" data-voltar>← Voltar aos documentos</button><div class="barra-doc topo"><h1>' + h(d.codigo) + '<small>' + h(d.titulo) + '</small></h1><span class="selo ' + d.status + '">' + MD.ST[d.status] + '</span>' +
      '<button class="btn" data-imprimir>🖨 Imprimir</button>' + (pode ? '<button class="btn s" data-editar>✎ Editar</button>' : '') + (pode && d.status === 'rascunho' ? '<button class="btn s" data-sit="em_revisao">Enviar para revisão</button>' : '') + (DB.pode('aprovar') && d.status !== 'vigente' ? '<button class="btn" style="background:#16a34a" data-sit="vigente">✔ Aprovar e publicar</button>' : '') + (pode && d.status === 'vigente' ? '<button class="btn s" data-novaver>Nova versão</button>' : '') + '<button class="btn s" data-hist>Histórico</button></div>';
    o += '<div class="fundo-folha">' + MD.folha(d, d.texto && d.texto.length > 10 ? MD.md(d.texto) : '<div class="vazio nao-imprime">Este documento ainda não tem texto no sistema. ' + (pode ? 'Clique em Editar para escrever ou colar o conteúdo.' : '') + '</div>') + '</div>';
    if (reqs.length) o += '<div class="vidro pad nao-imprime" style="margin-top:18px"><b>Este documento comprova os requisitos:</b><div class="chips" style="margin:10px 0 0">' + reqs.map(function (r) { return '<button class="chip" data-req="' + r[0] + '">' + r[0] + '</button>'; }).join('') + '</div></div>';
    return o;
  }
  function editarDoc(d) {
    var novo = !d;
    d = d || { codigo: '', titulo: '', tipo: 'PQ', unidade: 'Matriz', versao: '1', status: 'rascunho', texto: '' };
    modal('<h3>' + (novo ? 'Novo documento' : 'Editar ' + h(d.codigo)) + '</h3><div class="l2"><label class="cmp"><span>Código</span><input id="e-c" value="' + h(d.codigo) + '" placeholder="PQ 071"></label><label class="cmp"><span>Tipo</span><select id="e-t">' + Object.keys(TIPOS).map(function (k) { return '<option value="' + k + '"' + (d.tipo === k ? ' selected' : '') + '>' + TIPOS[k] + '</option>'; }).join('') + '</select></label></div><label class="cmp"><span>Título</span><input id="e-ti" value="' + h(d.titulo) + '"></label><div class="l2"><label class="cmp"><span>Elaboração</span><input id="e-el" value="' + h(d.elaborador || '') + '"></label><label class="cmp"><span>Revisão</span><input id="e-rv" value="' + h(d.revisor || '') + '"></label></div><label class="cmp"><span>Texto (use # Título, ## Seção, - lista, | tabela |, **negrito**, > destaque)</span><textarea id="e-tx" style="min-height:300px;font-family:Consolas,monospace;font-size:.82rem">' + h(d.texto || '') + '</textarea></label><label class="cmp"><span>Motivo da alteração (fica no histórico)</span><input id="e-m" placeholder="Ex.: atualização conforme RDC 978/2025"></label><div class="bt"><button class="btn s" data-x>Cancelar</button><button class="btn" id="e-ok">Salvar</button></div>', function (o) {
      o.querySelector('[data-x]').onclick = o.fechar;
      o.querySelector('#e-ok').onclick = async function () {
        var n = Object.assign({}, d, { codigo: o.querySelector('#e-c').value.trim(), tipo: o.querySelector('#e-t').value, titulo: o.querySelector('#e-ti').value.trim(), elaborador: o.querySelector('#e-el').value.trim(), revisor: o.querySelector('#e-rv').value.trim(), texto: o.querySelector('#e-tx').value });
        if (!n.codigo || !n.titulo) return toast('Informe código e título.', 1);
        try { if (!novo) await DB.addVersao({ doc_id: d.id, versao: d.versao, status: d.status, texto: d.texto, autor: DB.user.nome, motivo: o.querySelector('#e-m').value.trim() || 'Edição' }); var s = await DB.saveDoc(n); await carregar(); S.docId = s.id || n.id; o.fechar(); render(); toast('Documento salvo.'); DB.log('doc', n.codigo); } catch (e) { toast(e.message, 1); }
      };
    });
  }
  async function mudarSit(d, st) {
    var n = { id: d.id, status: st }; if (st === 'em_revisao') { n.data_revisao = hoje(); n.revisor = d.revisor || ''; }
    if (st === 'vigente') { n.aprovador = DB.user.nome; n.data_vigencia = hoje(); var p = new Date(); p.setFullYear(p.getFullYear() + 2); n.proxima_revisao = p.toISOString().slice(0, 10); }
    try { await DB.addVersao({ doc_id: d.id, versao: d.versao, status: st, texto: d.texto, autor: DB.user.nome, motivo: 'Situação: ' + MD.ST[st] }); await DB.saveDoc(Object.assign({}, d, n)); await carregar(); render(); toast('Situação atualizada: ' + MD.ST[st]); } catch (e) { toast(e.message, 1); }
  }
  async function novaVersao(d) {
    try { var nv = String((parseFloat(d.versao) || 1) + 1); await DB.addVersao({ doc_id: d.id, versao: d.versao, status: d.status, texto: d.texto, autor: DB.user.nome, motivo: 'Arquivada ao abrir versão ' + nv }); await DB.saveDoc(Object.assign({}, d, { versao: nv, status: 'rascunho', aprovador: '', data_vigencia: null })); await carregar(); render(); toast('Versão ' + nv + ' aberta como rascunho.'); } catch (e) { toast(e.message, 1); }
  }
  async function historico(d) {
    var l = await DB.versoes(d.id);
    modal('<h3>Histórico de ' + h(d.codigo) + '</h3>' + (l.length ? '<table class="tbl"><thead><tr><th>Quando</th><th>Versão</th><th>Quem</th><th>O quê</th></tr></thead><tbody>' + l.map(function (v) { return '<tr><td>' + new Date(v.criado_em).toLocaleString('pt-BR') + '</td><td>' + h(v.versao) + '</td><td>' + h(v.autor) + '</td><td>' + h(v.motivo) + '</td></tr>'; }).join('') + '</tbody></table>' : '<div class="vazio">Sem alterações registradas ainda.</div>') + '<div class="bt"><button class="btn s" data-x>Fechar</button></div>', function (o) { o.querySelector('[data-x]').onclick = o.fechar; });
  }

  /* ---------- formulários preenchidos (vieram da Qualidade anterior e os novos) ---------- */
  function nRegs(cod) { return S.d.regs.filter(function (r) { return r.form === cod; }).length; }
  function chaveReg(r) { return r.form || r.titulo; }
  function rotuloCampo(k) { var t = String(k).replace(/^_+/, '').replace(/_/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); }
  function valorCampo(v) { if (v === null || v === undefined) return ''; if (v === true) return 'Sim'; if (v === false) return 'Não'; if (typeof v === 'string' && /^\s*[\[{]/.test(v)) { try { return valorCampo(JSON.parse(v)); } catch (e) { return v; } } if (Array.isArray(v)) return v.map(valorCampo).join('; '); if (typeof v === 'object' && v.s !== undefined && Object.keys(v).length <= 2) return v.s + (v.o ? ' — ' + v.o : ''); if (typeof v === 'object') return Object.keys(v).map(function (k) { return rotuloCampo(k) + ': ' + valorCampo(v[k]); }).join(' · '); return String(v); }
  function camposVisiveis(dados) { return Object.keys(dados || {}).filter(function (k) { return k.charAt(0) !== '_' && valorCampo(dados[k]) !== ''; }); }
  function grupoReg() {
    var g = {}; S.d.regs.forEach(function (r) { var k = chaveReg(r), x = g[k] || (g[k] = { chave: k, form: r.form, titulo: r.titulo, n: 0, ultimo: '', usuarios: {} }); x.n++; if (r.dia && r.dia > x.ultimo) x.ultimo = r.dia; if (r.usuario) x.usuarios[r.usuario] = 1; });
    return Object.keys(g).map(function (k) { var x = g[k], d = x.form && docPorCod(x.form); if (d) x.titulo = x.form + ' · ' + d.titulo; return x; }).sort(function (a, b) { return b.n - a.n; });
  }
  function pgRegs() {
    var R = S.reg || (S.reg = { chave: '', q: '', mes: '', id: null });
    if (R.rel && R.chave) return pgRegRel();
    if (R.id) return pgRegDetalhe();
    if (R.chave) return pgRegLista();
    var q = MD.esc(R.q || '').toLowerCase(), g = grupoReg().filter(function (x) { return !q || x.titulo.toLowerCase().indexOf(q) >= 0; });
    var o = topo('Formulários preenchidos', S.d.regs.length + ' registros guardados', '');
    o += '<div class="barra"><input id="rg-q" placeholder="Procurar formulário…" value="' + h(R.q || '') + '"></div>';
    if (!S.d.regs.length) return o + '<div class="vazio">Ainda não há registros aqui. Rode o arquivo <b>sql/02_registros_migracao_v2.sql</b> no Supabase para trazer os formulários da Qualidade anterior.</div>';
    o += g.length ? '<div class="cards anim">' + g.map(function (x) { return '<button class="vidro dc" data-regg="' + h(x.chave) + '"><span class="cd">' + (x.form ? 'FORMULÁRIO' : 'REGISTRO') + '</span><b>' + h(x.titulo) + '</b><span class="rod"><span>' + x.n + ' registro' + (x.n > 1 ? 's' : '') + '</span>' + (x.ultimo ? '<span>último: ' + MD.fmtData(x.ultimo) + '</span>' : '') + '<span>' + Object.keys(x.usuarios).length + ' pessoa(s)</span></span></button>'; }).join('') + '</div>' : '<div class="vazio">Nenhum formulário encontrado.</div>';
    return o;
  }
  function pgRegLista() {
    var R = S.reg, g = grupoReg().filter(function (x) { return x.chave === R.chave; })[0]; if (!g) { R.chave = ''; return pgRegs(); }
    var todos = S.d.regs.filter(function (r) { return chaveReg(r) === R.chave; }).sort(function (a, b) { return (b.dia || '') < (a.dia || '') ? -1 : 1; });
    var meses = []; todos.forEach(function (r) { var m = (r.dia || '').slice(0, 7); if (m && meses.indexOf(m) < 0) meses.push(m); });
    var q = MD.esc(R.q || '').toLowerCase(), l = todos.filter(function (r) { return (!R.mes || (r.dia || '').slice(0, 7) === R.mes) && (!q || (r.item + ' ' + r.usuario + ' ' + r.titulo).toLowerCase().indexOf(q) >= 0); });
    var o = '<button class="voltar" data-regvolta>← Voltar aos formulários</button><div class="barra-doc topo"><h1>' + h(g.titulo) + '<small>' + g.n + ' registros</small></h1><button class="btn" data-regrel>🖨 Relatório do período</button></div>';
    o += '<div class="barra"><input id="rg-q" placeholder="Procurar por item ou responsável…" value="' + h(R.q || '') + '"><select id="rg-mes"><option value="">Todos os meses</option>' + meses.map(function (m) { return '<option value="' + m + '"' + (R.mes === m ? ' selected' : '') + '>' + m.slice(5) + '/' + m.slice(0, 4) + '</option>'; }).join('') + '</select></div>';
    o += '<div class="vidro pad" style="overflow:auto"><table class="tbl"><thead><tr><th>Data</th><th>Item</th><th>Responsável</th><th></th></tr></thead><tbody>' + (l.slice(0, 300).map(function (r) { return '<tr><td>' + (r.dia ? MD.fmtData(r.dia) : '—') + '</td><td>' + h(r.item || r.titulo) + '</td><td>' + h(r.usuario) + '</td><td><button class="btn p s" data-regver="' + r.id + '">Abrir</button></td></tr>'; }).join('') || '<tr><td colspan="4">Nenhum registro neste filtro.</td></tr>') + '</tbody></table>' + (l.length > 300 ? '<p style="color:var(--mut)">Mostrando 300 de ' + l.length + '. Use o filtro de mês para ver os demais.</p>' : '') + '</div>';
    return o;
  }
  function pgRegDetalhe() {
    var R = S.reg, r = S.d.regs.filter(function (x) { return x.id === R.id; })[0]; if (!r) { R.id = null; return pgRegLista(); }
    var lib = r.form && docPorCod(r.form), d = lib ? Object.assign({}, lib, { titulo: lib.titulo }) : { codigo: r.form || 'REG', titulo: r.titulo, versao: '1', status: 'vigente', tipo: 'FR' };
    var o = '<button class="voltar" data-regvolta2>← Voltar à lista</button><div class="barra-doc topo"><h1>' + h(r.form || 'Registro') + '<small>' + h(r.titulo) + (r.dia ? ' · ' + MD.fmtData(r.dia) : '') + '</small></h1><button class="btn" data-imprimir>🖨 Imprimir / salvar PDF</button></div>';
    var corpo = '<p>Registro preenchido no sistema' + (r.usuario ? ' por <b>' + h(r.usuario) + '</b>' : '') + (r.dia ? ' em <b>' + MD.fmtData(r.dia) + '</b>' : '') + (r.unidade ? ' · unidade ' + h(r.unidade) : '') + (r.item ? ' · item ' + h(r.item) : '') + '.</p><div id="reg-corpo">Carregando…</div>';
    setTimeout(async function () { try { var x = (await DB.registro(r.id)) || r, c = $('reg-corpo'); if (!c) return; var ks = camposVisiveis(x.dados); c.innerHTML = ks.length ? '<table><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>' + ks.map(function (k) { return '<tr><td>' + h(rotuloCampo(k)) + '</td><td>' + h(valorCampo(x.dados[k])) + '</td></tr>'; }).join('') + '</tbody></table>' + (x.dados && x.dados._motivo_retificacao ? '<p><b>Retificação:</b> ' + h(x.dados._motivo_retificacao) + '</p>' : '') : '<p>Sem campos preenchidos.</p>'; } catch (e) { var c2 = $('reg-corpo'); if (c2) c2.innerHTML = '<div class="erro">' + h(e.message) + '</div>'; } }, 30);
    return o + '<div class="fundo-folha">' + MD.folha(Object.assign({}, d, { titulo: r.titulo }), corpo) + '</div>';
  }
  /* tabela de registros de um formulário num período (relatório de evidência e relatório do período) */
  async function tabelaRegs(chave, de, ate, caixa) {
    var box = $(caixa); if (!box) return 0;
    try {
      var l = await DB.registrosChave(chave, de, ate); box = $(caixa); if (!box) return 0;
      if (!l.length) { box.innerHTML = ''; return 0; }
      var freq = {}; l.forEach(function (r) { camposVisiveis(r.dados).forEach(function (k) { freq[k] = (freq[k] || 0) + 1; }); });
      var cols = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 4);
      box.innerHTML = '<h2>Registros preenchidos</h2><table><thead><tr><th>Data</th><th>Item</th><th>Responsável</th>' + cols.map(function (k) { return '<th>' + h(rotuloCampo(k)) + '</th>'; }).join('') + '</tr></thead><tbody>' + l.map(function (r) { return '<tr><td>' + (r.dia ? MD.fmtData(r.dia) : '') + '</td><td>' + h(r.item || '') + '</td><td>' + h(r.usuario || '') + '</td>' + cols.map(function (k) { return '<td>' + h(valorCampo((r.dados || {})[k]).slice(0, 80)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table><p>' + l.length + ' registro(s) no período.</p>';
      return l.length;
    } catch (e) { if ($(caixa)) $(caixa).innerHTML = '<div class="erro">' + h(e.message) + '</div>'; return 0; }
  }
  function pgRegRel() {
    var R = S.reg, g = grupoReg().filter(function (x) { return x.chave === R.chave; })[0] || { titulo: R.chave }, nd = R.dias || 90, de = somaDias(hoje(), -nd), ate = hoje();
    var lib = g.form && docPorCod(g.form), d = lib || { codigo: g.form || 'REG', titulo: g.titulo, versao: '1', status: 'vigente', tipo: 'FR' };
    var o = '<button class="voltar" data-regvolta2>← Voltar</button><div class="barra-doc topo"><h1>Relatório do período<small>' + h(g.titulo) + '</small></h1><select id="rg-per" style="width:auto">' + [[30, 'Últimos 30 dias'], [90, 'Últimos 90 dias'], [180, 'Últimos 180 dias'], [365, 'Últimos 12 meses'], [3650, 'Tudo']].map(function (p) { return '<option value="' + p[0] + '"' + (nd === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select><button class="btn" data-imprimir>🖨 Imprimir / salvar PDF</button></div>';
    var c = '<p>Relatório gerado a partir dos registros preenchidos no sistema, de <b>' + MD.fmtData(de) + '</b> a <b>' + MD.fmtData(ate) + '</b>. Emitido em ' + MD.fmtData(hoje()) + ' por ' + h(DB.user ? DB.user.nome : '') + '.</p><div id="rg-rel">Carregando…</div>';
    setTimeout(async function () { var n = await tabelaRegs(R.chave, de, ate, 'rg-rel'); var b = $('rg-rel'); if (b && !n && !b.innerHTML) b.innerHTML = '<p><b>Nenhum registro neste período.</b></p>'; }, 30);
    return o + '<div class="fundo-folha">' + MD.folha(Object.assign({}, d, { titulo: 'Relatório · ' + g.titulo }), c) + '</div>';
  }

  /* ---------- relatório de evidência (registros feitos no sistema) ---------- */
  function pgEvid() {
    var cod = S.rel && S.rel.cod, nd = (S.rel && S.rel.dias) || 30; if (!cod) return pgInicio();
    var d = docPorCod(cod) || { codigo: cod, titulo: cod, versao: '1', status: 'vigente' }, de = somaDias(hoje(), -nd), ate = hoje();
    var regs = regsDoForm(cod).filter(function (t) { return t.dia >= de && t.dia <= ate; }).sort(function (a, b) { return a.dia < b.dia ? -1 : a.dia > b.dia ? 1 : (a.criado_em || '') < (b.criado_em || '') ? -1 : 1; });
    var eq = {}; S.d.equip.forEach(function (e) { eq[e.id] = e; });
    var desv = regs.filter(function (t) { return t.situacao !== 'ok'; });
    var o = '<button class="voltar" data-voltar-ev>← Voltar</button><div class="barra-doc topo"><h1>Relatório de evidência<small>' + h(d.codigo + ' · ' + d.titulo) + '</small></h1><select id="ev-per" style="width:auto"><option value="30"' + (nd === 30 ? ' selected' : '') + '>Últimos 30 dias</option><option value="90"' + (nd === 90 ? ' selected' : '') + '>Últimos 90 dias</option><option value="180"' + (nd === 180 ? ' selected' : '') + '>Últimos 180 dias</option><option value="365"' + (nd === 365 ? ' selected' : '') + '>Últimos 12 meses</option></select><button class="btn" data-imprimir>🖨 Imprimir / salvar PDF</button></div>';
    var c = '<p>Relatório gerado automaticamente a partir dos registros preenchidos no sistema, no período de <b>' + MD.fmtData(de) + '</b> a <b>' + MD.fmtData(ate) + '</b>. Emitido em ' + MD.fmtData(hoje()) + ' por ' + h(DB.user ? DB.user.nome : '') + '.</p>';
    if (!regs.length && !nRegs(cod)) c += '<p><b>Nenhum registro neste período.</b></p>';
    else {
      c += '<h2>Resumo</h2><table><thead><tr><th>Equipamento</th><th>Faixa</th><th>Registros</th><th>Mínima</th><th>Máxima</th><th>Média</th><th>Fora da faixa</th></tr></thead><tbody>';
      var ids = []; regs.forEach(function (t) { if (ids.indexOf(t.equip_id) < 0) ids.push(t.equip_id); });
      ids.forEach(function (id) { var l = regs.filter(function (t) { return t.equip_id === id; }), v = l.map(function (t) { return Number(t.valor); }), e = eq[id] || {}; c += '<tr><td>' + h(e.nome || l[0].equip_nome || '') + '</td><td>' + e.minimo + ' a ' + e.maximo + ' °C</td><td>' + l.length + '</td><td>' + Math.min.apply(null, v).toFixed(1) + '</td><td>' + Math.max.apply(null, v).toFixed(1) + '</td><td>' + (v.reduce(function (a, b) { return a + b; }, 0) / v.length).toFixed(1) + '</td><td>' + l.filter(function (t) { return t.situacao !== 'ok'; }).length + '</td></tr>'; });
      c += '</tbody></table><h2>Registros</h2><table><thead><tr><th>Data</th><th>Turno</th><th>Equipamento</th><th>°C</th><th>Situação</th><th>Ação corretiva</th><th>Responsável</th></tr></thead><tbody>' + regs.map(function (t) { return '<tr><td>' + MD.fmtData(t.dia) + '</td><td>' + h(t.turno || '') + '</td><td>' + h((eq[t.equip_id] || {}).nome || t.equip_nome || '') + '</td><td>' + t.valor + '</td><td>' + (t.situacao === 'ok' ? 'Conforme' : '<b>Desvio</b>') + '</td><td>' + h(t.acao || '') + '</td><td>' + h(t.usuario || '') + '</td></tr>'; }).join('') + '</tbody></table>';
      c += '<p>' + regs.length + ' registros de temperatura, ' + desv.length + ' fora da faixa' + (desv.length ? ', todos com ação corretiva descrita acima.' : '.') + '</p>';
    }
    if (nRegs(cod)) { c += '<div id="evid-regs">Carregando registros…</div>'; setTimeout(function () { tabelaRegs(cod, de, ate, 'evid-regs'); }, 30); }
    return o + '<div class="fundo-folha">' + MD.folha(Object.assign({}, d, { titulo: 'Relatório de evidência · ' + d.titulo }), c) + '</div>';
  }

  /* ---------- documentos legais ---------- */
  function pgLegais() {
    var pode = DB.pode('escrever');
    var GR = [['Licenças e autorizações', 'Para funcionar legalmente', ['licenca_sanitaria', 'alvara', 'cnes', 'avcb', 'certificado_rt', 'licenca_ambiental', 'pgrss']], ['Contratos', 'Serviços e parceiros', ['contrato_proficiencia', 'contrato_apoio', 'contrato_manutencao', 'contrato_servico_critico']], ['Certificações', 'Planejamento futuro: acreditação e qualidade monitorada', ['acreditacao', 'qualiss', 'iso'], 1], ['Outros documentos', 'Qualquer outro documento com validade', ['outro']]];
    var cod = {}; window.Q2_LEGAIS.forEach(function (x) { cod[x[0]] = x[2]; });
    var todos = S.d.legais, emDia = 0, vence = 0, venc = 0, falta = 0;
    todos.forEach(function (x) { var n = dias(x.validade); if (n !== null && n < 0) venc++; else if (n !== null && n <= 60) vence++; else emDia++; });
    GR.forEach(function (g) { if (!g[3] && g[2][0] !== 'outro') g[2].forEach(function (t) { if (!todos.some(function (x) { return x.tipo === t; })) falta++; }); });
    var o = topo('Documentos legais', 'Licenças, alvarás, certificados e contratos, com aviso de vencimento', pode ? '<button class="btn" data-novolegal>＋ Cadastrar documento</button>' : '');
    o += '<div class="lg-res anim">' + [['Em dia', emDia, '#16a34a'], ['Vencem em até 60 dias', vence, '#d97706'], ['Vencidos', venc, '#dc2626'], ['Ainda não cadastrados', falta, '#64748b']].map(function (c) { return '<div class="vidro" style="--c:' + c[2] + '"><b>' + c[1] + '</b><span>' + c[0] + '</span></div>'; }).join('') + '</div>';
    GR.forEach(function (g) {
      var linhas = '';
      g[2].forEach(function (t) {
        var regs = todos.filter(function (x) { return x.tipo === t; }).sort(function (a, b) { var p = dias(a.validade), q = dias(b.validade); return (p === null ? 9e5 : p) - (q === null ? 9e5 : q); });
        var nome = LEG_NOME[t], c = cod[t] ? '<small class="lg-cod">req. ' + cod[t] + '</small>' : '';
        if (!regs.length) {
          if (t === 'outro') return;
          linhas += '<div class="lg-l vazio-l"><i class="pt" style="--c:#cbd5e1"></i><div class="lg-n"><b>' + h(nome) + '</b>' + c + '</div><div class="lg-s" style="color:var(--mut)">' + (g[3] ? 'Previsto para o futuro' : 'Não cadastrado') + '</div><div class="lg-m"></div><div class="lg-a">' + (pode ? '<button class="btn p s" data-novolegal="' + t + '">＋ Cadastrar</button>' : '') + '</div></div>';
        } else regs.forEach(function (x) {
          var s = legalSit(x);
          linhas += '<div class="lg-l"><i class="pt" style="--c:' + s.c + '"></i><div class="lg-n"><b>' + h(x.descricao || nome) + '</b>' + (t === 'outro' ? '' : c) + '</div><div class="lg-s" style="color:' + s.c + '">' + s.t + '</div><div class="lg-m">' + (x.numero ? 'nº ' + h(x.numero) : '') + (x.orgao ? '<small>' + h(x.orgao) + '</small>' : '') + '</div><div class="lg-a">' + (x.arquivo_path ? '<button class="btn p s" data-anexo="' + x.id + '">📎 Anexo</button>' : '') + (pode ? '<button class="btn p s" data-edlegal="' + x.id + '">Editar</button><button class="btn p v s" data-dellegal="' + x.id + '">Remover</button>' : '') + '</div></div>';
        });
      });
      if (g[2][0] === 'outro' && !linhas) return;
      o += '<section class="vidro lg-g anim' + (g[3] ? ' fut' : '') + '"><header><h2>' + g[0] + '</h2><span>' + g[1] + '</span></header>' + linhas + '</section>';
    });
    return o;
  }
  function editarLegal(l, tipo) {
    var novo = !l; l = l || { tipo: tipo || 'licenca_sanitaria' };
    modal('<h3>' + (novo ? 'Cadastrar documento legal' : 'Editar documento') + '</h3><label class="cmp"><span>Tipo</span><select id="l-t">' + window.Q2_LEGAIS.map(function (x) { return '<option value="' + x[0] + '"' + (l.tipo === x[0] ? ' selected' : '') + '>' + h(x[1]) + '</option>'; }).join('') + '</select></label><label class="cmp"><span>Descrição</span><input id="l-d" value="' + h(l.descricao || '') + '" placeholder="Ex.: Licença sanitária 2026"></label><div class="l2"><label class="cmp"><span>Número</span><input id="l-n" value="' + h(l.numero || '') + '"></label><label class="cmp"><span>Órgão emissor</span><input id="l-o" value="' + h(l.orgao || '') + '"></label></div><div class="l2"><label class="cmp"><span>Emissão</span><input type="date" id="l-e" value="' + h(l.emissao || '') + '"></label><label class="cmp"><span>Validade</span><input type="date" id="l-v" value="' + h(l.validade || '') + '"></label></div><label class="cmp"><span>Anexo (PDF ou foto)' + (l.arquivo_nome ? ' — atual: ' + h(l.arquivo_nome) : '') + '</span><input type="file" id="l-f" accept=".pdf,image/*"></label><label class="cmp"><span>Observações</span><input id="l-ob" value="' + h(l.obs || '') + '"></label><div class="bt"><button class="btn s" data-x>Cancelar</button><button class="btn" id="l-ok">Salvar</button></div>', function (o) {
      o.querySelector('[data-x]').onclick = o.fechar;
      o.querySelector('#l-ok').onclick = async function () {
        var n = Object.assign({}, l, { tipo: o.querySelector('#l-t').value, descricao: o.querySelector('#l-d').value.trim(), numero: o.querySelector('#l-n').value.trim(), orgao: o.querySelector('#l-o').value.trim(), emissao: o.querySelector('#l-e').value || null, validade: o.querySelector('#l-v').value || null, obs: o.querySelector('#l-ob').value.trim(), ativo: true });
        try { var f = o.querySelector('#l-f').files[0]; if (f) { var u = await DB.upload(f); n.arquivo_path = u.path; n.arquivo_nome = u.nome; } await DB.saveLegal(n); await carregar(); o.fechar(); render(); toast('Documento legal salvo.'); DB.log('legal', n.tipo); } catch (e) { toast(e.message, 1); }
      };
    });
  }

  /* ---------- controle analítico: variação dos resultados e tolerância por analito ---------- */
  var CQ_NOMES = { HEMA_REPET: 'Hematologia · reanálise do dia anterior', HEMA_APOIO: 'Hematologia · apoio', BIOQ_APOIO: 'Bioquímica · apoio' };
  var CORES_CQ = ['#0e9aa7', '#7c3aed', '#d97706', '#2563eb', '#db2777', '#059669', '#9333ea', '#ea580c', '#0891b2', '#65a30d', '#be123c', '#475569', '#ca8a04', '#4f46e5'];
  function chaveAn(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function fmtN(n) { return isNaN(n) ? '' : String(Math.round(n * 100) / 100).replace('.', ','); }
  /* limite de cada analito: percentual e/ou valor absoluto (vale o que for MAIOR). Sem cadastro: ±10%. */
  function tolDe(an) {
    var t = (S.d.tol || {})[chaveAn(an)];
    if (!t) return { pct: CQ_TOL, abs: null, unidade: '', fonte: '', definido: false };
    var a = t.absoluto === null || t.absoluto === undefined || t.absoluto === '' ? null : Number(t.absoluto);
    return { pct: Number(t.percentual) || CQ_TOL, abs: isNaN(a) ? null : a, unidade: t.unidade || '', fonte: t.fonte || '', definido: true };
  }
  function limiteTxt(t) { return '±' + fmtN(t.pct) + '%' + (t.abs !== null ? ' ou ' + fmtN(t.abs) + (t.unidade ? ' ' + t.unidade : '') : ''); }
  function foraDe(an, ref, med, v) { var t = tolDe(an); return !(Math.abs(v) <= t.pct || (t.abs !== null && Math.abs(med - ref) <= t.abs)); }
  function cqLinhas(lista) {
    return lista.map(function (r) {
      var d = r.dados || {}, an = d.analito || r.item || '', ref = numBR(d.valor_ref), med = numBR(d.valor_medido), v = numBR(d.variacao_pct), t = tolDe(an);
      return { id: r.id, dia: r.dia || d.data || '', amostra: d.amostra || '', analito: an, equipamento: d.equipamento || '', apoio: d.lab_apoio || '', tipo: d.tipo || '', ref: ref, med: med, v: v, tol: t.pct, lim: limiteTxt(t), fora: isNaN(v) ? false : foraDe(an, ref, med, v), anulado: d.anulado === 'sim', acao: d.acao_corretiva || '' };
    }).filter(function (r) { return !r.anulado; });
  }
  /* gráfico: modo 'um' (um analito, eixo em %), 'grupo' (várias linhas) ou 'todos' (pontos); em 'grupo' e 'todos' o eixo é "% do limite" (100 = limite de cada analito) */
  function svgVariacao(l, modo) {
    l = l.filter(function (r) { return !isNaN(r.v) && r.dia; }).sort(function (a, b) { return a.dia < b.dia ? -1 : 1; }); if (!l.length) return '';
    var norm = modo !== 'um', W = 720, H = modo === 'grupo' ? 230 : 200, pl = 44, pr = 12, pt = 12, pb = 26, t0 = Date.parse(l[0].dia), t1 = Date.parse(l[l.length - 1].dia), band = norm ? 100 : l[0].tol, M = norm ? 300 : Math.max(30, Math.ceil(band * 3)), nomes = [];
    l.forEach(function (r) { if (nomes.indexOf(r.analito) < 0) nomes.push(r.analito); });
    function xs(d) { return pl + (t1 === t0 ? (W - pl - pr) / 2 : (Date.parse(d) - t0) / (t1 - t0) * (W - pl - pr)); }
    function yv(r) { return norm ? (r.tol ? r.v / r.tol * 100 : r.v) : r.v; }
    function ys(v) { return pt + (M - Math.max(-M, Math.min(M, v))) / (2 * M) * (H - pt - pb); }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;max-width:100%" role="img" aria-label="Variação dos resultados ao longo do tempo"><rect x="' + pl + '" y="' + ys(band) + '" width="' + (W - pl - pr) + '" height="' + (ys(-band) - ys(band)) + '" fill="rgba(22,163,74,.13)"/>';
    [[band, '+' + fmtN(band) + '%'], [0, '0'], [-band, '-' + fmtN(band) + '%']].forEach(function (g) { s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + ys(g[0]) + '" y2="' + ys(g[0]) + '" stroke="' + (g[0] === 0 ? '#94a3b8' : '#16a34a') + '" stroke-dasharray="' + (g[0] === 0 ? '0' : '4 3') + '" stroke-width=".8"/><text x="' + (pl - 6) + '" y="' + (ys(g[0]) + 3) + '" font-size="10" text-anchor="end" fill="#64748b">' + g[1] + '</text>'; });
    if (modo === 'grupo') nomes.forEach(function (n, k) { var pts = l.filter(function (r) { return r.analito === n; }); s += '<polyline fill="none" stroke="' + CORES_CQ[k % CORES_CQ.length] + '" stroke-width="1.3" stroke-opacity=".75" points="' + pts.map(function (r) { return xs(r.dia).toFixed(1) + ',' + ys(yv(r)).toFixed(1); }).join(' ') + '"/>'; });
    l.forEach(function (r) {
      var cor = modo === 'grupo' ? CORES_CQ[nomes.indexOf(r.analito) % CORES_CQ.length] : (r.fora ? '#dc2626' : '#16a34a');
      s += '<circle cx="' + xs(r.dia).toFixed(1) + '" cy="' + ys(yv(r)).toFixed(1) + '" r="' + (r.fora ? 4 : 3.2) + '" fill="' + cor + '" fill-opacity=".85"' + (modo === 'grupo' && r.fora ? ' stroke="#dc2626" stroke-width="2"' : '') + '><title>' + h(r.analito + ' · ' + MD.fmtData(r.dia) + ' · ' + fmtN(r.v) + '% (limite ' + r.lim + ')') + '</title></circle>';
    });
    s += '<text x="' + pl + '" y="' + (H - 8) + '" font-size="10" fill="#64748b">' + MD.fmtData(l[0].dia) + '</text><text x="' + (W - pr) + '" y="' + (H - 8) + '" font-size="10" text-anchor="end" fill="#64748b">' + MD.fmtData(l[l.length - 1].dia) + '</text></svg>';
    if (norm) s += '<div style="color:#64748b;font-size:.74rem;margin-top:2px">O eixo mostra a variação como porcentagem do limite de cada analito: 100% é o limite dele (as tolerâncias são diferentes).</div>';
    if (modo === 'grupo') s += '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px;font-size:.78rem">' + nomes.map(function (n, k) { return '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:14px;height:4px;border-radius:2px;background:' + CORES_CQ[k % CORES_CQ.length] + '"></i>' + h(n) + '</span>'; }).join('') + '<span style="color:#dc2626">● contorno vermelho = fora do limite</span></div>';
    return s;
  }
  function cqResumo(l) {
    var n = l.length, fora = l.filter(function (r) { return r.fora; }).length, mx = l.reduce(function (m, r) { return isNaN(r.v) ? m : Math.max(m, Math.abs(r.v)); }, 0);
    return { n: n, fora: fora, ok: n - fora, pct: n ? Math.round((n - fora) / n * 1000) / 10 : 0, max: mx };
  }
  function cqTabela(l, limite) {
    var ord = l.slice().sort(function (a, b) { return a.dia < b.dia ? 1 : a.dia > b.dia ? -1 : 0; });
    return '<table class="tbl"><thead><tr><th>Data</th><th>Amostra</th><th>Analito</th><th>Equipamento</th><th>Apoio</th><th>Referência</th><th>Medido</th><th>Variação</th><th>Limite</th><th>Situação</th></tr></thead><tbody>' +
      ord.slice(0, limite || 400).map(function (r) { return '<tr><td>' + (r.dia ? MD.fmtData(r.dia) : '') + '</td><td>' + h(r.amostra) + '</td><td>' + h(r.analito) + '</td><td>' + h(r.equipamento) + '</td><td>' + h(r.apoio) + '</td><td>' + fmtN(r.ref) + '</td><td>' + fmtN(r.med) + '</td><td><b style="color:' + (r.fora ? '#dc2626' : '#15803d') + '">' + (r.v > 0 ? '+' : '') + fmtN(r.v) + '%</b></td><td>' + h(r.lim) + '</td><td>' + (r.fora ? '<b style="color:#dc2626">FORA</b>' : 'OK') + (r.fora && r.acao ? '<br><small>' + h(r.acao) + '</small>' : '') + '</td></tr>'; }).join('') +
      '</tbody></table>' + (ord.length > (limite || 400) ? '<p style="color:var(--mut)">Mostrando ' + (limite || 400) + ' de ' + ord.length + '. Use os filtros para ver os demais.</p>' : '');
  }
  function cqFiltrar(todos) {
    var F = S.cq || (S.cq = { tipo: '', per: 90, analito: '', rel: false }), de = F.per ? somaDias(hoje(), -F.per) : '';
    return todos.filter(function (r) { var grupo = F.analito === '__HEMA__' ? r.tipo.indexOf('HEMA') === 0 : (F.analito === '__BIOQ__' ? r.tipo.indexOf('BIOQ') === 0 : true); return (!F.tipo || r.tipo === F.tipo) && (!F.analito || /^__/.test(F.analito) ? grupo : r.analito === F.analito) && (!de || r.dia >= de); });
  }
  function modoGraf(F) { return F.analito && !/^__/.test(F.analito) ? 'um' : (/^__/.test(F.analito || '') ? 'grupo' : 'todos'); }
  function pgCq() {
    var F = S.cq || (S.cq = { tipo: '', per: 90, analito: '', rel: false, tol: false });
    if (F.fia) return pgFia();
    if (F.tol) return pgTol();
    var o = F.rel ? '<button class="voltar" data-cqvolta>← Voltar</button><div class="barra-doc topo"><h1>Relatório de controle analítico<small>Variação dos resultados</small></h1><button class="btn" data-imprimir>🖨 Imprimir / salvar PDF</button></div>'
      : topo('Controle analítico', 'Variação dos resultados: CDA × apoio e reanálise', '<button class="btn s" data-cqfia>FIA 100</button><button class="btn s" data-cqtol>⚖ Tolerância por analito</button><button class="btn" data-cqrel>🖨 Relatório</button>');
    o += '<div id="cq-box"><div class="vazio">Carregando…</div></div>';
    setTimeout(carregaCq, 20); return o;
  }
  async function carregaCq() {
    var box = $('cq-box'); if (!box) return;
    try {
      var todos = cqLinhas(await DB.controleAnalitico()), F = S.cq; box = $('cq-box'); if (!box) return;
      var analitos = []; todos.forEach(function (r) { if (r.analito && analitos.indexOf(r.analito) < 0) analitos.push(r.analito); }); analitos.sort();
      var l = cqFiltrar(todos), rs = cqResumo(l);
      var corpo = '<div class="grade g4" style="margin-bottom:14px">' + [['Comparações', rs.n, '#0e9aa7'], ['Dentro do limite', rs.ok + ' (' + fmtN(rs.pct) + '%)', '#16a34a'], ['Fora do limite', rs.fora, rs.fora ? '#dc2626' : '#64748b'], ['Maior variação', fmtN(rs.max) + '%', '#d97706']].map(function (c) { return '<div class="vidro pad" style="border-left:5px solid ' + c[2] + '"><div style="font-size:1.5rem;font-weight:800;color:' + c[2] + '">' + c[1] + '</div><div style="color:var(--mut);font-size:.78rem;font-weight:700">' + c[0] + '</div></div>'; }).join('') + '</div>';
      if (F.rel) {
        var tipoTxt = F.tipo ? CQ_NOMES[F.tipo] || F.tipo : 'Todos os tipos', pr = F.per ? 'últimos ' + F.per + ' dias' : 'todo o período', an = [];
        l.forEach(function (r) { if (an.indexOf(r.analito) < 0) an.push(r.analito); });
        var lim = '<h2>Limites aplicados</h2><table><thead><tr><th>Analito</th><th>Limite (vale o maior)</th><th>Fonte do critério</th></tr></thead><tbody>' + an.sort().map(function (a) { var t = tolDe(a); return '<tr><td>' + h(a) + '</td><td>' + h(limiteTxt(t)) + '</td><td>' + h(t.definido ? t.fonte || 'definido pelo RT' : 'padrão do sistema (±' + CQ_TOL + '%)') + '</td></tr>'; }).join('') + '</tbody></table>';
        var c = '<p>Variação percentual entre o resultado do CDA e a referência (laboratório de apoio ou reanálise), avaliada pela tabela de tolerância por analito vigente. ' + h(tipoTxt) + (F.analito ? ' · ' + h(F.analito === '__HEMA__' ? 'Hemograma completo' : F.analito === '__BIOQ__' ? 'Bioquímica completa' : F.analito) : '') + ' · ' + pr + '. Emitido em ' + MD.fmtData(hoje()) + ' por ' + h(DB.user ? DB.user.nome : '') + '.</p>' +
          '<table><thead><tr><th>Comparações</th><th>Dentro do limite</th><th>Fora do limite</th><th>Maior variação</th></tr></thead><tbody><tr><td>' + rs.n + '</td><td>' + rs.ok + ' (' + fmtN(rs.pct) + '%)</td><td>' + rs.fora + '</td><td>' + fmtN(rs.max) + '%</td></tr></tbody></table>' + lim + svgVariacao(l, modoGraf(F)) + cqTabela(l, 600);
        box.innerHTML = '<div class="fundo-folha">' + MD.folha({ codigo: 'CQ', titulo: 'Controle analítico · variação dos resultados', versao: '1', status: 'vigente', tipo: 'FR' }, c) + '</div>';
        return;
      }
      var filtros = '<div class="barra"><select id="cq-tipo"><option value="">Todos os tipos</option>' + Object.keys(CQ_NOMES).map(function (k) { return '<option value="' + k + '"' + (F.tipo === k ? ' selected' : '') + '>' + CQ_NOMES[k] + '</option>'; }).join('') + '</select><select id="cq-per">' + [[30, 'Últimos 30 dias'], [90, 'Últimos 90 dias'], [180, 'Últimos 180 dias'], [365, 'Últimos 12 meses'], [0, 'Tudo']].map(function (p) { return '<option value="' + p[0] + '"' + (F.per === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select><select id="cq-an"><option value="">Todos os analitos</option>' + (todos.some(function (r) { return r.tipo.indexOf('HEMA') === 0; }) ? '<option value="__HEMA__"' + (F.analito === '__HEMA__' ? ' selected' : '') + '>Hemograma · todos juntos no gráfico</option>' : '') + (todos.some(function (r) { return r.tipo.indexOf('BIOQ') === 0; }) ? '<option value="__BIOQ__"' + (F.analito === '__BIOQ__' ? ' selected' : '') + '>Bioquímica · todos juntos no gráfico</option>' : '') + analitos.map(function (a) { return '<option' + (F.analito === a ? ' selected' : '') + '>' + h(a) + '</option>'; }).join('') + '</select></div>';
      box.innerHTML = filtros + corpo + (l.length ? '<div class="vidro pad" style="margin-bottom:14px"><b style="font-size:.9rem">Variação ao longo do tempo</b><div style="color:var(--mut);font-size:.75rem;margin-bottom:6px">A faixa verde é o limite aceito. Pontos vermelhos estão fora dele.</div>' + svgVariacao(l, modoGraf(F)) + '</div><div class="vidro pad" style="overflow:auto">' + cqTabela(l) + '</div>' : '<div class="vazio">Nenhum resultado neste filtro.</div>');
    } catch (e) { box = $('cq-box'); if (box) box.innerHTML = '<div class="erro">' + h(e.message) + '</div>'; }
  }
  /* tabela de tolerância por analito (só admin e RT alteram) */
  function pgTol() {
    var o = '<button class="voltar" data-tolvolta>← Voltar ao controle analítico</button>' + topo('Tolerância por analito', 'Limite de variação aceito em cada exame', '');
    o += '<div class="vidro pad" style="margin-bottom:14px;font-size:.86rem;line-height:1.55"><b>Como funciona.</b> O resultado fica dentro do limite se a variação for menor ou igual ao <b>percentual</b> <i>ou</i> se a diferença for menor ou igual ao <b>valor absoluto</b>: vale o que for <b>maior</b> (como no CLIA). Isso evita marcar como "fora" um resultado de valor baixo com diferença pequena. Analito sem cadastro usa <b>±' + CQ_TOL + '%</b>. ' + (DB.pode('aprovar') ? 'Você pode editar.' : 'Só o administrador e o RT alteram esta tabela.') + '<br><span style="color:var(--mut)">Os valores iniciais vêm do CLIA (2024) e precisam da conferência e aprovação do RT; o campo "Fonte" fica registrado e aparece no relatório.</span></div><div id="tol-box"><div class="vazio">Carregando…</div></div>';
    setTimeout(carregaTol, 20); return o;
  }
  async function carregaTol() {
    var box = $('tol-box'); if (!box) return;
    try {
      var linhas = cqLinhas(await DB.controleAnalitico()), pode = DB.pode('aprovar'), nomes = {}, ts = S.d.tol || {};
      linhas.forEach(function (r) { if (r.analito) nomes[chaveAn(r.analito)] = r.analito; }); Object.keys(ts).forEach(function (k) { nomes[k] = ts[k].analito || k; });
      var ch = Object.keys(nomes).sort(function (a, b) { return nomes[a] < nomes[b] ? -1 : 1; }); box = $('tol-box'); if (!box) return;
      var inp = function (k, campo, v, ph, w) { return pode ? '<input data-tolc="' + h(k) + '" data-tolf="' + campo + '" value="' + h(v === null || v === undefined ? '' : v) + '" placeholder="' + ph + '" style="width:' + w + ';padding:7px 9px;border:1px solid var(--bd);border-radius:9px;font:inherit;font-size:.84rem;background:#fff">' : h(v === null || v === undefined || v === '' ? '—' : v); };
      box.innerHTML = '<div class="vidro pad" style="overflow:auto"><table class="tbl"><thead><tr><th>Analito</th><th>Variação % (±)</th><th>ou diferença absoluta</th><th>Unidade</th><th>Fonte do critério</th><th>Situação</th>' + (pode ? '<th></th>' : '') + '</tr></thead><tbody>' + ch.map(function (k) {
        var t = ts[k], def = !!t; return '<tr><td><b>' + h(nomes[k]) + '</b></td><td>' + inp(k, 'percentual', def ? t.percentual : '', String(CQ_TOL), '80px') + '</td><td>' + inp(k, 'absoluto', def ? t.absoluto : '', 'opcional', '90px') + '</td><td>' + inp(k, 'unidade', def ? t.unidade : '', 'mg/dL', '80px') + '</td><td>' + inp(k, 'fonte', def ? t.fonte : '', 'Ex.: CLIA 2024', '210px') + '</td><td>' + (def ? '<span class="selo A">definido</span>' : '<span class="selo P">padrão ±' + CQ_TOL + '%</span>') + (def && t.atualizado_por ? '<br><small style="color:var(--mut)">' + h(t.atualizado_por) + '</small>' : '') + '</td>' + (pode ? '<td style="white-space:nowrap"><button class="btn p s" data-tolsalvar="' + h(k) + '">Salvar</button>' + (def ? ' <button class="btn p v s" data-toldel="' + h(k) + '" title="Volta ao padrão">Padrão</button>' : '') + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>' +
        (pode ? '<div class="vidro pad" style="margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="font-size:.86rem">Adicionar analito</b><input id="tol-novo" placeholder="Nome do analito (como aparece nos resultados)" style="flex:1;min-width:220px;padding:8px 10px;border:1px solid var(--bd);border-radius:10px;font:inherit;background:#fff"><button class="btn" data-toladd>＋ Adicionar</button></div>' : '');
    } catch (e) { box = $('tol-box'); if (box) box.innerHTML = '<div class="erro">' + h(e.message) + '</div>'; }
  }
  async function salvarTol(k) {
    var g = function (f) { var el = document.querySelector('[data-tolc="' + k + '"][data-tolf="' + f + '"]'); return el ? el.value.trim() : ''; };
    var pc = numBR(g('percentual')), ab = g('absoluto'), abn = ab === '' ? null : numBR(ab);
    if (isNaN(pc) || pc <= 0) throw new Error('Informe a variação percentual (maior que zero).');
    if (abn !== null && (isNaN(abn) || abn < 0)) throw new Error('Diferença absoluta inválida.');
    var atual = (S.d.tol || {})[k] || {}, linha = { chave: k, analito: atual.analito || g('analito') || k, percentual: pc, absoluto: abn, unidade: g('unidade'), fonte: g('fonte'), atualizado_por: DB.user.nome, atualizado_em: new Date().toISOString() };
    if (!atual.analito) { var nm = (document.querySelector('[data-tolc="' + k + '"]').closest('tr').querySelector('b') || {}).textContent; if (nm) linha.analito = nm; }
    await DB.saveTolerancia(linha); S.d.tol = S.d.tol || {}; S.d.tol[k] = linha; DB.log('tolerancia', linha.analito + ' ' + pc + '%' + (abn !== null ? ' / ' + abn : ''));
    toast('Tolerância de ' + linha.analito + ' salva.'); carregaTol();
  }
  function varApoio(inp) {
    var id = inp.dataset.apid, i = Number(inp.dataset.api), r = (S.apoio || []).filter(function (x) { return String(x.id) === String(id); })[0]; if (!r) return;
    var d = r.dados || {}, x = (S.apRows[id] || [])[i], out = document.querySelector('[data-apvar="' + id + '|' + i + '"]'); if (!x || !out) return;
    var l = jsonSeg(d.linhas_json, []).filter(function (y) { return y.analito === x.analito; })[0], n = numBR(inp.value);
    if (!l || isNaN(n) || !inp.value.trim()) { out.textContent = ''; out.className = 'ap-var'; return; }
    var cda = numBR(l.valor_medido), rep = d.tipo === 'HEMA_REPET', ref = rep ? cda : n, med = rep ? n : cda;
    if (!ref) { out.textContent = 'referência zero: sem cálculo'; out.className = 'ap-var fora'; return; }
    var v = Math.round((med - ref) / ref * 10000) / 100, fora = foraDe(x.analito, ref, med, v), t = tolDe(x.analito);
    out.textContent = 'Variação ' + (v > 0 ? '+' : '') + fmtN(v) + '% · ' + (fora ? 'FORA do limite' : 'dentro do limite') + ' (' + limiteTxt(t) + ')'; out.className = 'ap-var ' + (fora ? 'fora' : 'ok');
  }

  /* ---------- Controle da Analisa FIA 100 (semanal) ---------- */
  var FIA_PAD = { c1_min: 300, c1_max: 500, c2_min: 5000, c2_max: 8000, unidade: 'mIU/mL' };
  function fiaFx() { return Object.assign({}, FIA_PAD, S.d.fiaFx || {}); }
  function iniSemana(dia) { var d = new Date(dia + 'T12:00:00'), w = (d.getDay() + 6) % 7; return somaDias(dia, -w); }
  function fiaDaSemana(dia) { var a = iniSemana(dia), b = somaDias(a, 6); return S.d.fia.filter(function (r) { return r.data >= a && r.data <= b; })[0]; }
  function fiaFora(r) { var f = fiaFx(), a = Number(r.controle1), b = Number(r.controle2); return a < Number(f.c1_min) || a > Number(f.c1_max) || b < Number(f.c2_min) || b > Number(f.c2_max); }
  function fmtMil(n) { return Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 3 }); }
  function cartaoFiaHoje(dia, pode) {
    var fr = fiaDaSemana(dia), f = fiaFx();
    return '<div class="vidro hj-it ' + (fr ? 'ok' : 'pend') + '"><span class="hj-pt"></span><div class="hj-t"><b>Controle da Analisa FIA 100 <span class="selo P" style="margin-left:6px">semanal</span></b><small>Faixa: controle 1 de ' + fmtMil(f.c1_min) + ' a ' + fmtMil(f.c1_max) + ' · controle 2 de ' + fmtMil(f.c2_min) + ' a ' + fmtMil(f.c2_max) + ' ' + h(f.unidade) + (fr ? ' · lançado em ' + MD.fmtData(fr.data) + (fr.registrado_por ? ' por ' + h(fr.registrado_por) : '') + (fiaFora(fr) ? ' · <b style="color:#dc2626">FORA da faixa</b>' : '') : ' · ainda não lançado nesta semana') + '</small></div>' +
      (fr ? '<button class="btn s p" data-cqfia>Ver histórico</button>' : (pode ? '<button class="btn s" data-hjabrir="fia">Preencher</button>' : '')) +
      (fr ? '' : '<div class="hj-form"><div class="hj-campos"><label class="cmp"><span>Controle 1 <i>(' + fmtMil(f.c1_min) + ' a ' + fmtMil(f.c1_max) + ')</i></span><input inputmode="decimal" id="fia-c1"></label><label class="cmp"><span>Controle 2 <i>(' + fmtMil(f.c2_min) + ' a ' + fmtMil(f.c2_max) + ')</i></span><input inputmode="decimal" id="fia-c2"></label><label class="cmp"><span>Observação / ação</span><input id="fia-obs"></label></div><div class="bt"><button class="btn" data-fiasalvar>Registrar</button></div></div>') + '</div>';
  }
  async function salvarFia() {
    var dia = S.rdData || hoje(), a = numBR($('fia-c1').value), b = numBR($('fia-c2').value), obs = $('fia-obs').value.trim();
    if (isNaN(a) || isNaN(b)) throw new Error('Informe o controle 1 e o controle 2.');
    var reg = { data: dia, controle1: a, controle2: b, obs: obs, registrado_por: DB.user.nome };
    if (fiaFora(reg) && !obs) throw new Error('Resultado fora da faixa: descreva a ação em "Observação / ação".');
    await DB.saveFia(reg); DB.log('fia', dia + ' c1=' + a + ' c2=' + b); await carregar(); render(); toast('Controle da FIA 100 registrado.');
  }
  function svgFia(l, k, min, max, titulo) {
    var d = l.filter(function (r) { return r[k] !== null && r[k] !== undefined; }).sort(function (a, b) { return a.data < b.data ? -1 : 1; }); if (!d.length) return '';
    var W = 720, H = 170, pl = 52, pr = 12, pt = 12, pb = 24, t0 = Date.parse(d[0].data), t1 = Date.parse(d[d.length - 1].data), lo = Math.min(min, Math.min.apply(null, d.map(function (r) { return Number(r[k]); }))), hi = Math.max(max, Math.max.apply(null, d.map(function (r) { return Number(r[k]); }))), pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
    function xs(x) { return pl + (t1 === t0 ? (W - pl - pr) / 2 : (Date.parse(x) - t0) / (t1 - t0) * (W - pl - pr)); }
    function ys(v) { return pt + (hi - v) / (hi - lo) * (H - pt - pb); }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto" role="img" aria-label="' + h(titulo) + '"><rect x="' + pl + '" y="' + ys(max) + '" width="' + (W - pl - pr) + '" height="' + (ys(min) - ys(max)) + '" fill="rgba(22,163,74,.13)"/>';
    [min, max].forEach(function (g) { s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + ys(g) + '" y2="' + ys(g) + '" stroke="#16a34a" stroke-dasharray="4 3" stroke-width=".8"/><text x="' + (pl - 6) + '" y="' + (ys(g) + 3) + '" font-size="10" text-anchor="end" fill="#64748b">' + fmtMil(g) + '</text>'; });
    s += '<polyline fill="none" stroke="#0e9aa7" stroke-width="1.2" stroke-opacity=".7" points="' + d.map(function (r) { return xs(r.data).toFixed(1) + ',' + ys(Number(r[k])).toFixed(1); }).join(' ') + '"/>';
    d.forEach(function (r) { var f = Number(r[k]) < min || Number(r[k]) > max; s += '<circle cx="' + xs(r.data).toFixed(1) + '" cy="' + ys(Number(r[k])).toFixed(1) + '" r="3.6" fill="' + (f ? '#dc2626' : '#16a34a') + '"><title>' + MD.fmtData(r.data) + ' · ' + fmtMil(r[k]) + '</title></circle>'; });
    return s + '<text x="' + pl + '" y="' + (H - 6) + '" font-size="10" fill="#64748b">' + MD.fmtData(d[0].data) + '</text><text x="' + (W - pr) + '" y="' + (H - 6) + '" font-size="10" text-anchor="end" fill="#64748b">' + MD.fmtData(d[d.length - 1].data) + '</text></svg>';
  }
  function pgFia() {
    var f = fiaFx(), l = S.d.fia.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; }), pode = DB.pode('aprovar');
    var o = '<button class="voltar" data-fiavolta>← Voltar</button>' + topo('Controle da Analisa FIA 100', 'Lançamento semanal · controle 1 e controle 2', '<button class="btn" data-imprimir>🖨 Imprimir</button>');
    o += '<div class="vidro pad" style="margin-bottom:14px"><b style="font-size:.9rem">Faixa aceitável</b> <span style="color:var(--mut);font-size:.78rem">(' + h(f.unidade) + ')</span><div class="hj-campos" style="margin-top:8px">' + [['c1_min', 'Controle 1 · mínimo'], ['c1_max', 'Controle 1 · máximo'], ['c2_min', 'Controle 2 · mínimo'], ['c2_max', 'Controle 2 · máximo']].map(function (c) { return pode ? '<label class="cmp"><span>' + c[1] + '</span><input data-fiafx="' + c[0] + '" value="' + h(f[c[0]]) + '"></label>' : '<div><small style="color:var(--mut)">' + c[1] + '</small><br><b>' + fmtMil(f[c[0]]) + '</b></div>'; }).join('') + '</div>' + (pode ? '<div class="bt" style="margin-top:8px"><button class="btn s p" data-fiafxsalvar>Salvar faixas</button></div>' : '') + '</div>';
    if (!l.length) return o + '<div class="vazio">Nenhum lançamento ainda. Registre o primeiro em Registros do dia → O que preencher hoje.</div>';
    o += '<div class="vidro pad" style="margin-bottom:14px"><b style="font-size:.9rem">Controle 1</b>' + svgFia(l, 'controle1', Number(f.c1_min), Number(f.c1_max), 'Controle 1') + '</div><div class="vidro pad" style="margin-bottom:14px"><b style="font-size:.9rem">Controle 2</b>' + svgFia(l, 'controle2', Number(f.c2_min), Number(f.c2_max), 'Controle 2') + '</div>';
    o += '<div class="vidro pad" style="overflow:auto"><table class="tbl"><thead><tr><th>Data</th><th>Controle 1</th><th>Controle 2</th><th>Situação</th><th>Observação</th><th>Registrado por</th></tr></thead><tbody>' + l.map(function (r) { var fo = fiaFora(r); return '<tr><td>' + MD.fmtData(r.data) + '</td><td>' + fmtMil(r.controle1) + '</td><td>' + fmtMil(r.controle2) + '</td><td>' + (fo ? '<b style="color:#dc2626">FORA</b>' : 'OK') + '</td><td>' + h(r.obs || '') + '</td><td>' + h(r.registrado_por || '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return o;
  }

  /* ---------- Preencher formulário: todos os FR da Qualidade anterior ---------- */
  function defForm(cod) { return window.Q2_FORMS.filter(function (f) { return f.c === cod; })[0]; }
  function camposDe(f) { return f.modo === 'mensal' ? (f.cols || []) : (f.campos || []); }
  function catalogoForms() { return window.Q2_FORMS.concat([{ c: 'FIA', t: 'Controle da Analisa FIA 100 (semanal)', cat: 'Controle interno e laboratório de apoio', modo: 'fia' }]); }
  function pgForms() {
    var R = S.frm || (S.frm = { cod: '', q: '' });
    if (R.cod === 'FIA') { R.cod = ''; S.cq = S.cq || { tipo: '', per: 90, analito: '', rel: false }; S.cq.fia = true; return pgFia(); }
    if (R.cod) return pgFormPreencher();
    var q = MD.esc(R.q || '').toLowerCase(), lista = catalogoForms().filter(function (f) { return !q || (f.c + ' ' + f.t + ' ' + f.cat).toLowerCase().indexOf(q) >= 0; }), cats = [];
    lista.forEach(function (f) { if (cats.indexOf(f.cat) < 0) cats.push(f.cat); });
    var o = topo('Preencher formulário', window.Q2_FORMS.length + 1 + ' formulários e controles', '');
    o += '<div class="barra"><input id="fm-q" placeholder="Procurar formulário (código ou nome)…" value="' + h(R.q || '') + '"></div>';
    cats.forEach(function (c) {
      o += '<h2 class="sec">' + h(c) + '</h2><div class="cards anim">' + lista.filter(function (f) { return f.cat === c; }).map(function (f) {
        var n = S.d.regs.filter(function (r) { return r.form === f.c; }).length;
        return '<button class="vidro dc" data-frmabrir="' + h(f.c) + '"><span class="cd">' + h(f.c) + ' · ' + (f.modo === 'mensal' ? 'FOLHA DIÁRIA/MENSAL' : f.modo === 'fia' ? 'SEMANAL' : 'REGISTRO') + '</span><b>' + h(f.t) + '</b><span class="rod"><span>' + (f.modo === 'fia' ? S.d.fia.length : n) + ' registro' + ((f.modo === 'fia' ? S.d.fia.length : n) === 1 ? '' : 's') + '</span></span></button>';
      }).join('') + '</div>';
    });
    return o;
  }
  function campoHtml(c) {
    var lb = h(c.label) + (c.obrig ? ' <i class="obr">*</i>' : '') + (c.min != null || c.max != null ? ' <i>(' + (c.min != null ? c.min : '') + ' a ' + (c.max != null ? c.max : '') + ')</i>' : '');
    var op = (c.opcoes || []).map(function (x) { return '<option>' + h(x) + '</option>'; }).join('');
    if (c.tipo === 'check') return '<label class="hj-ck"><input type="checkbox" data-fv="' + c.id + '"> ' + h(c.label) + '</label>';
    if (c.tipo === 'textarea') return '<label class="cmp fv-w"><span>' + lb + '</span><textarea data-fv="' + c.id + '" rows="3"></textarea></label>';
    if (c.tipo === 'select') return '<label class="cmp"><span>' + lb + '</span><select data-fv="' + c.id + '"><option value="">—</option>' + op + '</select></label>';
    if (c.tipo === 'multi') return '<div class="cmp fv-w"><span>' + lb + '</span><div class="fv-multi">' + (c.opcoes || []).map(function (x) { return '<label class="hj-ck"><input type="checkbox" data-fvm="' + c.id + '" value="' + h(x) + '"> ' + h(x) + '</label>'; }).join('') + '</div></div>';
    if (c.tipo === 'grade') return '<div class="cmp fv-w"><span>' + lb + '</span><div style="overflow:auto"><table class="tbl"><thead><tr><th></th>' + c.colunas.map(function (x) { return '<th>' + h(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + c.linhas.map(function (l) { return '<tr><td><b>' + h(l) + '</b></td>' + c.colunas.map(function (k) { return '<td><input data-fvg="' + c.id + '" data-l="' + h(l) + '" data-k="' + h(k) + '" style="width:100%;min-width:90px;padding:6px 8px;border:1px solid var(--bd);border-radius:8px;font:inherit"></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>';
    if (c.tipo === 'checklist') return '<div class="cmp fv-w"><span>' + lb + '</span>' + c.grupos.map(function (g, gi) { return '<h4 class="fv-g">' + h(g.t) + '</h4>' + g.itens.map(function (it, ii) { var nm = 'ck-' + c.id + '-' + gi + '-' + ii; return '<div class="fv-ck"><span>' + h(it) + '</span><span class="fv-r">' + ['C', 'NC', 'NA'].map(function (v) { return '<label><input type="radio" name="' + nm + '" data-fvc="' + c.id + '" data-i="' + h(it) + '" value="' + v + '"> ' + v + '</label>'; }).join('') + '</span><input data-fvco="' + c.id + '" data-i="' + h(it) + '" placeholder="obs." style="min-width:140px;padding:5px 8px;border:1px solid var(--bd);border-radius:8px;font:inherit;font-size:.8rem"></div>'; }).join(''); }).join('') + '</div>';
    var tp = c.tipo === 'data' ? 'date' : c.tipo === 'hora' ? 'time' : 'text', val = c.tipo === 'data' && c.id === 'data' ? ' value="' + hoje() + '"' : '';
    return '<label class="cmp"><span>' + lb + '</span><input type="' + tp + '"' + (c.tipo === 'numero' ? ' inputmode="decimal"' : '') + val + ' data-fv="' + c.id + '"></label>';
  }
  function pgFormPreencher() {
    var R = S.frm, f = defForm(R.cod); if (!f) { R.cod = ''; return pgForms(); }
    var mens = f.modo === 'mensal', pode = DB.pode('escrever');
    var o = '<button class="voltar" data-frmvolta>← Voltar aos formulários</button><div class="barra-doc topo"><h1>' + h(f.c) + '<small>' + h(f.t) + '</small></h1></div>';
    if (!pode) return o + '<div class="vazio">Seu perfil é só de consulta: não é possível preencher formulários.</div>';
    o += '<div class="vidro pad">' + (f.aviso ? '<p class="hj-av">' + h(f.aviso) + '</p>' : '') + (f.alerta ? '<p class="hj-av" style="background:#fee2e2;color:#991b1b">' + h(f.alerta.msg) + '</p>' : '');
    o += '<div class="hj-campos" style="margin-bottom:12px"><label class="cmp"><span>Unidade</span><select id="fv-un"><option>Matriz</option><option>Mata Fria</option></select></label>' +
      (mens ? '<label class="cmp"><span>Data</span><input type="date" id="fv-dia" value="' + hoje() + '" max="' + hoje() + '"></label>' + (f.itens && f.itens.length ? '<label class="cmp"><span>' + h(f.item_label || 'Item') + '</span><select id="fv-item">' + f.itens.map(function (x) { return '<option>' + h(x) + '</option>'; }).join('') + '</select></label>' : '') : '') + '</div>';
    var cs = camposDe(f), curtos = cs.filter(function (c) { return ['check', 'numero', 'texto', 'data', 'hora', 'select'].indexOf(c.tipo) >= 0; }), longos = cs.filter(function (c) { return curtos.indexOf(c) < 0; });
    o += '<div class="hj-campos">' + curtos.map(campoHtml).join('') + '</div>' + longos.map(campoHtml).join('');
    o += '<div class="bt" style="margin-top:14px"><button class="btn" data-frmsalvar>Registrar</button></div></div>';
    return o;
  }
  function lerForm(f) {
    var cs = camposDe(f), dados = {}, fora = [], erros = [], root = document;
    cs.forEach(function (c) {
      var v;
      if (c.tipo === 'check') { dados[c.id] = !!root.querySelector('[data-fv="' + c.id + '"]').checked; return; }
      if (c.tipo === 'multi') { v = [].slice.call(root.querySelectorAll('[data-fvm="' + c.id + '"]:checked')).map(function (x) { return x.value; }); if (v.length) dados[c.id] = v; else if (c.obrig) erros.push(c.label); return; }
      if (c.tipo === 'grade') { var g = {}, n = 0; [].slice.call(root.querySelectorAll('[data-fvg="' + c.id + '"]')).forEach(function (i) { var t = i.value.trim(); if (!t) return; (g[i.dataset.l] = g[i.dataset.l] || {})[i.dataset.k] = t; n++; }); if (n) dados[c.id] = g; else if (c.obrig) erros.push(c.label); return; }
      if (c.tipo === 'checklist') { var ck = {}, m = 0; [].slice.call(root.querySelectorAll('[data-fvc="' + c.id + '"]:checked')).forEach(function (i) { var oel = root.querySelector('[data-fvco="' + c.id + '"][data-i="' + i.dataset.i.replace(/"/g, '\\"') + '"]'); ck[i.dataset.i] = { s: i.value, o: oel ? oel.value.trim() : '' }; m++; }); if (m) dados[c.id] = ck; else if (c.obrig) erros.push(c.label); return; }
      var el = root.querySelector('[data-fv="' + c.id + '"]'); v = el ? el.value.trim() : '';
      if (!v) { if (c.obrig) erros.push(c.label); return; }
      if (c.tipo === 'numero') { var n2 = numBR(v); if (isNaN(n2)) { erros.push(c.label + ' (valor inválido)'); return; } dados[c.id] = n2; if ((c.min != null && n2 < c.min) || (c.max != null && n2 > c.max)) fora.push(c.label); return; }
      dados[c.id] = v;
    });
    if (f.pontuacao) { var tot = 0; cs.forEach(function (c) { if (c.pts && dados[c.id] !== undefined) tot += c.pts[dados[c.id]] || 0; }); dados._pontuacao = tot; }
    return { dados: dados, fora: fora, erros: erros };
  }
  async function salvarForm() {
    var R = S.frm, f = defForm(R.cod); if (!f) return;
    var r = lerForm(f); if (r.erros.length) throw new Error('Preencha: ' + r.erros.join(', ') + '.');
    var mens = f.modo === 'mensal', un = $('fv-un').value, dia = mens ? $('fv-dia').value : (r.dados.data || hoje()), item = mens && $('fv-item') ? $('fv-item').value : '';
    if (!dia) throw new Error('Informe a data.');
    if (!mens && !r.dados.data) dia = hoje();
    if (f.desvio === 'obs' && r.fora.length && !r.dados.obs) throw new Error('Fora da faixa: ' + r.fora.join(', ') + '. Descreva a ação em "Observações".');
    if (mens && S.d.regs.some(function (x) { return x.origem === 'Registros' && x.form === f.c && x.item === item && (x.unidade || 'Matriz') === un && x.dia === dia; })) throw new Error('Este formulário já foi registrado para essa data, item e unidade.');
    r.dados._chave = mens ? String(Number(dia.slice(8))) : ''; r.dados._versao = 'q2';
    await DB.addRegistros([{ origem: 'Registros', form: f.c, titulo: f.c, unidade: un, periodo: mens ? dia.slice(0, 7) : dia, dia: dia, item: item, usuario: DB.user.nome, criado_em: new Date().toISOString(), dados: r.dados }]);
    DB.log('registro', f.c + ' ' + item + ' ' + dia);
    var av = f.alerta && r.dados[f.alerta.campo] && f.alerta.valores.indexOf(r.dados[f.alerta.campo]) >= 0 ? f.alerta.msg : '';
    await carregar(); S.frm.cod = ''; render(); toast('Registrado: ' + f.c + ' · ' + f.t + '.'); if (av) setTimeout(function () { toast(av, 1); }, 600);
  }

  /* ---------- O que preencher hoje (formulários de rotina diária) ---------- */
  function rotinaFeita(it, dia) { return S.d.regs.filter(function (r) { return r.origem === 'Registros' && r.form === it.form && r.item === it.item && (r.unidade || 'Matriz') === it.unidade && r.dia === dia; })[0]; }
  function tempsFeitas(dia) { var eq = S.d.equip; return { n: eq.filter(function (e) { return S.d.temps.some(function (t) { return t.equip_id === e.id && t.dia === dia; }); }).length, total: eq.length }; }
  function pendHoje(dia) { var p = window.Q2_ROTINA.filter(function (it) { return !rotinaFeita(it, dia); }).length, t = tempsFeitas(dia); return p + (t.total - t.n) + (fiaDaSemana(dia) ? 0 : 1); }
  function pgHoje() {
    var dia = S.rdData || hoje(), tf = tempsFeitas(dia), o = '<div class="barra"><label class="hj-dt">Data do registro <input type="date" id="rd-data" value="' + dia + '" max="' + hoje() + '"></label><button class="btn s p" data-rdhoje>Hoje</button><span style="color:var(--mut);font-size:.8rem">Você pode lançar um dia que ficou para trás.</span></div><div class="hj-lista">';
    o += '<div class="vidro hj-it ' + (tf.total && tf.n >= tf.total ? 'ok' : 'pend') + '"><span class="hj-pt"></span><div class="hj-t"><b>Temperatura das geladeiras</b><small>' + (tf.total ? tf.n + ' de ' + tf.total + ' equipamentos registrados nesta data' : 'Nenhum equipamento cadastrado') + '</small></div><button class="btn s p" data-rdtab="temp">' + (tf.n >= tf.total ? 'Ver' : 'Registrar') + '</button></div>';
    o += cartaoFiaHoje(dia, DB.pode('escrever'));
    window.Q2_ROTINA.forEach(function (it, i) {
      var f = rotinaFeita(it, dia), pode = DB.pode('escrever');
      o += '<div class="vidro hj-it ' + (f ? 'ok' : 'pend') + '" data-hjcard="' + i + '"><span class="hj-pt"></span><div class="hj-t"><b>' + h(it.t) + '</b><small>' + h(it.form) + ' · ' + h(it.item) + (it.unidade !== 'Matriz' ? ' · ' + h(it.unidade) : '') + (f ? ' · registrado por ' + h(f.usuario || '—') : '') + '</small></div>' +
        (f ? '<button class="btn s p" data-regver2="' + f.id + '">Ver registro</button>' : (pode ? '<button class="btn s" data-hjabrir="' + i + '">Preencher</button>' : '')) +
        (f ? '' : '<div class="hj-form">' + (it.aviso ? '<p class="hj-av">' + h(it.aviso) + '</p>' : '') + '<div class="hj-campos">' + it.cols.map(function (c) {
          if (c.tipo === 'check') return '<label class="hj-ck"><input type="checkbox" data-hjf="' + c.id + '"> ' + h(c.label) + '</label>';
          return '<label class="cmp hj-c"><span>' + h(c.label) + (c.min != null ? ' <i>(' + c.min + ' a ' + c.max + ')</i>' : '') + '</span><input ' + (c.tipo === 'numero' ? 'inputmode="decimal"' : '') + ' data-hjf="' + c.id + '"></label>';
        }).join('') + '</div><div class="bt"><button class="btn" data-hjsalvar="' + i + '">Registrar</button></div></div>') + '</div>';
    });
    return o + '</div>';
  }
  async function salvarRotina(i) {
    var it = window.Q2_ROTINA[i], dia = S.rdData || hoje(), card = document.querySelector('[data-hjcard="' + i + '"]'), dados = {}, fora = [], marcou = false, mediu = false;
    if (rotinaFeita(it, dia)) throw new Error('Este formulário já foi registrado nesta data.');
    it.cols.forEach(function (c) {
      var el = card.querySelector('[data-hjf="' + c.id + '"]');
      if (c.tipo === 'check') { dados[c.id] = !!el.checked; if (el.checked) marcou = true; }
      else if (c.tipo === 'numero') { var v = el.value.trim(); if (v === '') return; var n = numBR(v); if (isNaN(n)) throw new Error('Valor inválido em "' + c.label + '".'); dados[c.id] = n; mediu = true; if (c.min != null && (n < c.min || n > c.max)) fora.push(c.label); }
      else if (el.value.trim()) dados[c.id] = el.value.trim();
    });
    var temNum = it.cols.some(function (c) { return c.tipo === 'numero'; }), temCk = it.cols.some(function (c) { return c.tipo === 'check'; });
    if (temNum && !mediu) throw new Error('Preencha ao menos uma medição.');
    if (!temNum && temCk && !marcou && !dados.obs) throw new Error('Marque o que foi feito (ou explique nas observações o motivo de não ter feito).');
    if (fora.length && !dados.obs) throw new Error('Fora da faixa: ' + fora.join(', ') + '. Descreva a ação nas observações.');
    dados._chave = String(Number(dia.slice(8))); dados._versao = 'q2';
    await DB.addRegistros([{ origem: 'Registros', form: it.form, titulo: it.form, unidade: it.unidade, periodo: dia.slice(0, 7), dia: dia, item: it.item, usuario: DB.user.nome, criado_em: new Date().toISOString(), dados: dados }]);
    DB.log('registro', it.form + ' ' + it.item + ' ' + dia + (fora.length ? ' (fora da faixa)' : ''));
    await carregar(); render(); toast('Registrado: ' + it.t + '.');
  }

  /* ---------- aguardando retorno do apoio (digitar o que o laboratório de apoio devolveu) ---------- */
  var CQ_TOL = 10;
  function nomeTipoCq(t) { var s = String(t || '').toLowerCase().replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  function nomeCqLongo(t) { return { HEMA_REPET: 'Hematologia · reanálise da amostra do dia anterior', HEMA_APOIO: 'Hematologia · confronto com laboratório de apoio', BIOQ_APOIO: 'Bioquímica · confronto com laboratório de apoio' }[t] || nomeTipoCq(t); }
  function jsonSeg(s, pad) { try { return typeof s === 'string' ? JSON.parse(s || '') : (s || pad); } catch (e) { return pad; } }
  function numBR(v) { var s = String(v === null || v === undefined ? '' : v).trim(); if (!s) return NaN; if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.'); return parseFloat(s); }
  function analitosUnicos(linhas) { var u = [], vis = {}; linhas.forEach(function (l) { if (!vis[l.analito]) { vis[l.analito] = 1; u.push(l.analito); } }); return u; }
  async function carregaApoio() {
    var box;
    try {
      var l = (await DB.pendentesApoio()).filter(function (r) { var st = (r.dados || {}).status; return st === 'PENDENTE' || st === 'PARCIAL'; }).sort(function (a, b) { return (a.dados.data || '') < (b.dados.data || '') ? -1 : 1; });
      S.apoio = l; S.apRows = {}; var bn = $('apoio-n'); if (bn) bn.textContent = l.length || ''; box = $('apoio-box'); if (!box) return;
      box.innerHTML = l.length ? l.map(function (r) { return cartaoApoio(r, l.length === 1); }).join('') : '<div class="vazio">Nenhuma amostra aguardando o retorno do apoio.</div>';
    } catch (e) { box = $('apoio-box'); if (box) box.innerHTML = '<div class="erro">' + h(e.message) + '</div>'; }
  }
  function cartaoApoio(r, aberto) {
    var d = r.dados || {}, labs = jsonSeg(d.labs_json, []), linhas = jsonSeg(d.linhas_json, []), feito = jsonSeg(d.feito_json, []), esp = Math.max(0, -(dias(d.data) || 0)), rep = d.tipo === 'HEMA_REPET', rows = [];
    labs.forEach(function (lab) { analitosUnicos(linhas).forEach(function (an) { if (feito.indexOf(an + '|' + lab) < 0) rows.push({ analito: an, lab: lab }); }); });
    S.apRows[r.id] = rows;
    var corpo = rows.map(function (x, i) {
      var l = linhas.filter(function (y) { return y.analito === x.analito; })[0] || {};
      return '<div class="ap-l"><div class="ap-a"><b>' + h(x.analito) + '</b><small>' + (rep ? 'Original' : 'CDA') + ': ' + h(l.valor_medido) + (l.equipamento ? ' · ' + h(l.equipamento) : '') + '</small></div><div class="ap-in"><input inputmode="decimal" data-apid="' + r.id + '" data-api="' + i + '" placeholder="' + (rep ? 'Reanálise' : h(x.lab)) + '"><label class="ap-nf"><input type="checkbox" data-apid="' + r.id + '" data-apnf="' + i + '"> não feito</label></div><div class="ap-var" data-apvar="' + r.id + '|' + i + '"></div></div>';
    }).join('');
    return '<div class="vidro ap-card' + (aberto ? ' aberto' : '') + '" data-apcard="' + r.id + '"><button type="button" class="ap-head" data-apabrir="' + r.id + '"><span class="ap-tt"><b>Amostra ' + h(d.amostra) + '</b><small>' + h(nomeCqLongo(d.tipo)) + ' · coletada em ' + MD.fmtData(d.data) + '</small></span><span class="ap-meta"><span class="selo ' + (esp > 7 ? 'N' : 'P') + '">há ' + esp + ' dia' + (esp === 1 ? '' : 's') + '</span><em>' + rows.length + ' exame' + (rows.length === 1 ? '' : 's') + '</em><i class="ap-seta">▾</i></span></button>' +
      '<div class="ap-corpo">' + (d.status === 'PARCIAL' ? '<p class="ap-obs">Já foram lançados ' + feito.length + ' resultado(s); faltam os abaixo.</p>' : '') + '<div class="ap-grid">' + (corpo || '<p>Tudo lançado.</p>') + '</div>' +
      '<label class="cmp" style="margin-top:12px"><span>Ação corretiva (só se algum resultado ficar fora do limite do analito)</span><input data-apacao="' + r.id + '"></label><div class="bt"><button class="btn p v" data-apcancel="' + r.id + '">Cancelar envio</button><button class="btn" data-apsalvar="' + r.id + '">Salvar retorno</button></div></div></div>';
  }
  async function salvarApoio(id) {
    var r = (S.apoio || []).filter(function (x) { return String(x.id) === String(id); })[0]; if (!r) return;
    var d = r.dados || {}, labs = jsonSeg(d.labs_json, []), cda = jsonSeg(d.linhas_json, []), feito = jsonSeg(d.feito_json, []), rows = S.apRows[id] || [], card = document.querySelector('[data-apcard="' + id + '"]');
    var novas = [], marca = [], naoFeitos = [];
    rows.forEach(function (x, i) {
      var inp = card.querySelector('[data-api="' + i + '"]'), nf = card.querySelector('[data-apnf="' + i + '"]'), v = inp ? inp.value.trim() : '';
      if (nf && nf.checked) { marca.push(x.analito + '|' + x.lab); naoFeitos.push(x.analito + ' (' + x.lab + ')'); return; }
      if (!v) return;
      var n = numBR(v); if (isNaN(n)) throw new Error('Valor inválido em ' + x.analito + '.');
      cda.filter(function (l) { return l.analito === x.analito; }).forEach(function (l) {
        if (d.tipo === 'HEMA_REPET') novas.push({ analito: l.analito, equipamento: l.equipamento || '', lab_apoio: '', ref: numBR(l.valor_medido), med: n });
        else novas.push({ analito: l.analito, equipamento: l.equipamento || '', lab_apoio: x.lab, ref: n, med: numBR(l.valor_medido) });
      });
      marca.push(x.analito + '|' + x.lab);
    });
    if (!marca.length) throw new Error('Digite ao menos um valor devolvido pelo apoio (ou marque o exame como "não feito").');
    var acao = card.querySelector('[data-apacao="' + id + '"]').value.trim(), grupo = 'Q' + Date.now().toString(36).toUpperCase(), agora = new Date().toISOString(), fora = [], regs = [];
    novas.forEach(function (n, i) {
      if (isNaN(n.ref) || isNaN(n.med)) throw new Error('Valor inválido em ' + n.analito + '.');
      if (n.ref === 0) throw new Error('O valor de referência de ' + n.analito + ' é zero: não dá para calcular a variação.');
      var vr = Math.round(((n.med - n.ref) / n.ref * 100) * 100) / 100, t = tolDe(n.analito), ok = !foraDe(n.analito, n.ref, n.med, vr); if (!ok) fora.push(n.analito + ': ' + vr + '% (limite ' + limiteTxt(t) + ')');
      regs.push({ origem: 'ControleAnalitico', form: '', titulo: 'Controle analítico · ' + nomeTipoCq(d.tipo), unidade: '', periodo: '', dia: d.data, item: n.analito, usuario: DB.user.nome, criado_em: agora,
        dados: { id: 'CQ' + Date.now().toString(36).toUpperCase() + i, grupo: grupo, tipo: d.tipo, data: d.data, equipamento: n.equipamento, lab_apoio: n.lab_apoio, amostra: d.amostra, analito: n.analito, valor_ref: String(n.ref), valor_medido: String(n.med), variacao_pct: String(vr), tolerancia_pct: String(t.pct), tolerancia_abs: t.abs === null ? '' : String(t.abs), situacao: ok ? 'OK' : 'FORA', usuario: DB.user.nome, acao_corretiva: acao, observacao: 'Retorno do apoio em ' + hoje() + ' (lançamento ' + (d.id || '') + ')' + (naoFeitos.length ? ' - Não realizado pelo apoio: ' + naoFeitos.join(', ') : ''), registrado_em: agora, anulado: '', motivo_anulacao: '' } });
    });
    if (fora.length && !acao) throw new Error('Há ' + fora.length + ' resultado(s) fora do limite (' + fora.join('; ') + '). Descreva a ação corretiva.');
    if (regs.length) await DB.addRegistros(regs);
    var nf = feito.concat(marca), total = analitosUnicos(cda).length * labs.length, status = nf.length >= total ? 'CONCLUIDO' : 'PARCIAL';
    await DB.updRegistro(r.id, { dados: Object.assign({}, d, { feito_json: JSON.stringify(nf), status: status, atualizado_em: agora }) });
    DB.log('apoio', (d.id || '') + ' ' + marca.length + ' retorno(s) -> ' + status);
    await carregar(); render(); toast(status === 'CONCLUIDO' ? 'Retorno salvo. Amostra concluída.' : 'Retorno salvo. Ainda faltam resultados desta amostra.');
  }
  async function cancelarApoio(id) {
    var r = (S.apoio || []).filter(function (x) { return String(x.id) === String(id); })[0]; if (!r) return;
    var motivo = prompt('Por que este envio será cancelado? (fica registrado)'); if (!motivo || !motivo.trim()) return;
    var d = r.dados || {};
    await DB.updRegistro(r.id, { dados: Object.assign({}, d, { status: 'CANCELADO', observacao: ((d.observacao ? d.observacao + ' | ' : '') + 'Cancelado: ' + motivo.trim() + ' (por ' + DB.user.nome + ' em ' + hoje() + ')'), atualizado_em: new Date().toISOString() }) });
    DB.log('apoio', (d.id || '') + ' cancelado'); await carregar(); render(); toast('Envio cancelado.');
  }

  /* ---------- registros do dia ---------- */
  function pgRegistros() {
    var tab = S.rdTab || 'hoje', dia = S.rdia || hoje(), o = topo('Registros do dia', 'Tudo o que se preenche na rotina do laboratório');
    function aba(id, ic, t, d, extra) { return '<button type="button" class="vidro pad rd-card' + (tab === id ? ' on' : '') + '" data-rdtab="' + id + '"><span class="rd-ic">' + ic + '</span><b>' + t + (extra || '') + '</b><small>' + d + '</small></button>'; }
    var ph = pendHoje(S.rdData || hoje());
    o += '<div class="anim rd-tabs" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px">' + aba('hoje', '✅', 'O que preencher hoje', 'Limpeza, temperatura e umidade, geladeiras', ph ? '<em class="rd-n">' + ph + '</em>' : '') + aba('apoio', '⏳', 'Aguardando retorno do apoio', 'Digite o que o laboratório de apoio devolveu', '<em class="rd-n" id="apoio-n"></em>') + aba('temp', '🌡️', 'Temperaturas', 'Geladeiras, freezer, banho-maria e ambiente') +
      '<button type="button" class="vidro pad rd-card" data-ir="frm"><span class="rd-ic">✎</span><b>Outros formulários</b><small>Todos os formulários e controles da qualidade</small></button><button type="button" class="vidro pad rd-card" data-ir="cq"><span class="rd-ic">◔</span><b>Variação dos resultados</b><small>Controle analítico: tabela, gráfico e relatório</small></button><button type="button" class="vidro pad rd-card" data-ir="regs"><span class="rd-ic">▦</span><b>Formulários preenchidos</b><small>Ver e imprimir o que já foi registrado</small></button></div>';
    if (tab === 'hoje') o += pgHoje();
    else if (tab === 'apoio') o += '<div id="apoio-box"><div class="vazio">Carregando…</div></div>';
    else { o += '<div class="barra"><input type="date" id="r-dia" value="' + dia + '" style="max-width:190px"><button class="btn s p" data-rhoje>Hoje</button></div><div class="vidro pad" id="temp-box"><div class="vazio">Carregando…</div></div>'; setTimeout(carregaTemp, 30); }
    setTimeout(carregaApoio, 20); return o;
  }
  async function carregaTemp() {
    var box = $('temp-box'); if (!box) return; var dia = S.rdia || hoje();
    try {
      var eq = await DB.equip(), ts = await DB.temps(dia, dia), pode = DB.pode('escrever');
      box.innerHTML = '<table class="tbl"><thead><tr><th>Equipamento</th><th>Faixa</th><th>Registros de ' + MD.fmtData(dia) + '</th>' + (pode ? '<th style="width:240px">Novo registro</th>' : '') + '</tr></thead><tbody>' + eq.map(function (e) {
        var l = ts.filter(function (t) { return t.equip_id === e.id; });
        return '<tr><td><b>' + h(e.nome) + '</b><br><small style="color:var(--mut)">' + h(e.local || '') + '</small></td><td>' + e.minimo + ' a ' + e.maximo + ' °C</td><td>' + (l.map(function (t) { return '<span class="selo ' + (t.situacao === 'ok' ? 'A' : 'N') + '" title="' + h(t.usuario) + '">' + h(t.turno) + ': ' + t.valor + ' °C</span> '; }).join('') || '<span style="color:var(--mut)">Nenhum</span>') + '</td>' + (pode ? '<td><div style="display:flex;gap:6px"><select data-tt="' + e.id + '" style="width:90px;padding:8px"><option>manhã</option><option>tarde</option><option>noite</option></select><input type="number" step="0.1" data-tv="' + e.id + '" placeholder="°C" style="width:80px;padding:8px"><button class="btn p" data-regtemp="' + e.id + '">Salvar</button></div></td>' : '') + '</tr>';
      }).join('') + '</tbody></table>';
    } catch (e) { box.innerHTML = '<div class="erro">' + h(e.message) + '</div>'; }
  }
  async function regTemp(id) {
    var eq = (await DB.equip()).filter(function (e) { return e.id === id; })[0], v = parseFloat(String(document.querySelector('[data-tv="' + id + '"]').value).replace(',', '.')); if (isNaN(v)) return toast('Digite a temperatura.', 1);
    var fora = v < eq.minimo || v > eq.maximo, acao = '';
    if (fora) { acao = prompt('Temperatura fora da faixa (' + eq.minimo + ' a ' + eq.maximo + ' °C). Qual foi a ação corretiva?') || ''; if (!acao.trim()) return toast('Informe a ação corretiva para registrar um desvio.', 1); }
    try { await DB.addTemp({ equip_id: id, equip_nome: eq.nome, dia: S.rdia || hoje(), turno: document.querySelector('[data-tt="' + id + '"]').value, valor: v, situacao: fora ? 'desvio' : 'ok', acao: acao }); toast(fora ? 'Desvio registrado.' : 'Temperatura registrada.'); carregaTemp(); } catch (e) { toast(e.message, 1); }
  }

  /* ---------- relatório ---------- */
  function pgRelatorio() {
    var tot = contagem(REQ), apl = tot.t - tot.NA, C = window.Q2_CONFIG.LAB, hojeBR = new Date().toLocaleDateString('pt-BR');
    var o = '<div class="topo nao-imprime"><button class="menu-m" data-menu>☰ Menu</button><h1>Relatório de conformidade<small>Prova de que cada requisito tem comprovação no sistema</small></h1><button class="btn" data-imprimir>🖨 Imprimir / salvar PDF</button></div>';
    o += '<div class="vidro pad rel" style="background:#fff"><div class="cab-r" style="display:flex;align-items:center;gap:14px;border-bottom:3px solid var(--tq);padding-bottom:12px;margin-bottom:14px"><img src="img/logo-cda.png" style="height:56px"><div style="flex:1"><h2 style="font-size:16pt;color:var(--esc)">Relatório de conformidade · Autoavaliação</h2><div style="font-size:9pt;color:#55777a">' + h(C.nome) + ' · ' + h(C.fone) + ' · ' + h(C.email) + ' · emitido em ' + hojeBR + '</div></div></div>';
    o += '<p style="font-size:10pt">Resumo da autoavaliação (portal Valor Conecta): <b>' + tot.A + ' de ' + apl + '</b> requisitos aplicáveis atendem (<b>' + (apl ? Math.round(tot.A / apl * 100) : 0) + '%</b>); ' + tot.P + ' parciais, ' + tot.N + ' não atendem, ' + tot.F + ' marcados como evolução futura e ' + tot.NA + ' não se aplicam. ' + (tot.sem ? '<b>' + tot.sem + ' requisitos ainda sem comprovação.</b>' : 'Todos os requisitos aplicáveis possuem comprovação.') + '</p>';
    o += '<table><thead><tr><th>Domínio</th><th>Requisitos</th><th>Atendem</th><th>Parciais</th><th>Não atendem</th><th>Futuros</th><th>N/A</th><th>% atende</th></tr></thead><tbody>' + Object.keys(DOM).map(function (k) { var c = contagem(REQ.filter(function (r) { return r[1] === k; })), a = c.t - c.NA; return '<tr><td><b>' + k + ' · ' + DOM[k].nome + '</b></td><td>' + c.t + '</td><td>' + c.A + '</td><td>' + c.P + '</td><td>' + c.N + '</td><td>' + c.F + '</td><td>' + c.NA + '</td><td><b>' + (a ? Math.round(c.A / a * 100) : 0) + '%</b></td></tr>'; }).join('') + '</tbody></table>';
    Object.keys(DOM).forEach(function (k) {
      o += '<h3 class="tit-d quebra">' + k + ' · ' + DOM[k].nome + '</h3><table><thead><tr><th style="width:42px">Item</th><th>Requisito</th><th style="width:62px">Resposta</th><th style="width:34%">Comprovação no sistema</th></tr></thead><tbody>';
      var gAtual = ''; REQ.filter(function (r) { return r[1] === k; }).forEach(function (r) {
        if (r[2] !== gAtual) { gAtual = r[2]; o += '<tr><td colspan="4" style="background:#f0faf8;font-weight:800;color:var(--esc)">' + gAtual + ' · ' + h(GRP[gAtual]) + '</td></tr>'; }
        var x = resp(r), p = prova(r), ev = [];
        p.docs.forEach(function (e) { ev.push(e.d ? '▤ ' + h(e.c) + ' — ' + h(e.d.titulo) + ' (v' + h(e.d.versao) + ', ' + MD.ST[e.d.status].toLowerCase() + (e.d.data_vigencia ? ', vig. ' + MD.fmtData(e.d.data_vigencia) : '') + ')' : '✗ ' + h(e.c) + ' (pendente)'); });
        p.legais.forEach(function (l) { ev.push('⚖ ' + h(LEG_NOME[l.tipo]) + (l.numero ? ' nº ' + h(l.numero) : '') + (l.validade ? ' — validade ' + MD.fmtData(l.validade) : '')); });
        p.manuais.forEach(function (e) { ev.push('📝 ' + h(e.nota || e.ref)); });
        o += '<tr><td><b>' + r[0] + '</b></td><td>' + h(r[3]) + (x.c ? '<br><i style="color:#7a5b00">Constatação: ' + h(x.c) + '</i>' : '') + '</td><td><span class="s ' + (x.f ? 'F' : x.v) + '">' + (x.f ? 'Futuro' : RLAB[x.v]) + '</span></td><td style="font-size:7.4pt">' + (ev.join('<br>') || '<span class="s N">Sem comprovação</span>') + '</td></tr>';
      }); o += '</tbody></table>';
    });
    o += '<h3 class="tit-d quebra">Documentos legais</h3>' + (S.d.legais.length ? '<table><thead><tr><th>Documento</th><th>Número</th><th>Órgão</th><th>Emissão</th><th>Validade</th><th>Situação</th></tr></thead><tbody>' + S.d.legais.map(function (l) { var s = legalSit(l); return '<tr><td>' + h(LEG_NOME[l.tipo] || l.descricao) + '</td><td>' + h(l.numero) + '</td><td>' + h(l.orgao) + '</td><td>' + MD.fmtData(l.emissao) + '</td><td>' + MD.fmtData(l.validade) + '</td><td style="color:' + s.c + ';font-weight:800">' + s.t + '</td></tr>'; }).join('') + '</tbody></table>' : '<p>Nenhum documento legal cadastrado.</p>');
    o += '<h3 class="tit-d">Biblioteca de documentos (' + S.d.docs.filter(function (d) { return d.status !== 'obsoleto'; }).length + ')</h3><table><thead><tr><th>Código</th><th>Título</th><th>Versão</th><th>Situação</th><th>Elaboração</th><th>Aprovação</th></tr></thead><tbody>' + S.d.docs.filter(function (d) { return d.status !== 'obsoleto'; }).sort(function (a, b) { return a.codigo < b.codigo ? -1 : 1; }).map(function (d) { return '<tr><td><b>' + h(d.codigo) + '</b></td><td>' + h(d.titulo) + '</td><td>' + h(d.versao) + '</td><td>' + MD.ST[d.status] + '</td><td>' + h(d.elaborador || '—') + '</td><td>' + h(d.aprovador || '—') + (d.data_vigencia ? ' · ' + MD.fmtData(d.data_vigencia) : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return o;
  }

  /* ---------- ajustes ---------- */
  function pgAjustes() {
    var o = topo('Ajustes', 'Usuários, dados e informações do sistema');
    o += '<div class="vidro pad"><h2 class="sec" style="margin-top:0">Sobre</h2><p style="margin:0;color:var(--mut)">' + (DB.demo ? '<b style="color:#b45309">Modo demonstração:</b> os dados ficam só neste navegador. Para usar com a equipe, configure a chave do Supabase em <code>js/config.js</code> e rode <code>sql/01_base.sql</code>.' : 'Conectado ao Supabase. Dados compartilhados com toda a equipe.') + '</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button class="btn s" data-semear>Carregar/atualizar biblioteca e autoavaliação</button>' + (DB.demo ? '<button class="btn v" data-resetdemo>Apagar dados de demonstração</button>' : '') + '</div></div>';
    if (DB.pode('admin')) o += '<h2 class="sec">Usuários</h2><div class="vidro pad" id="usu-box"><div class="vazio">Carregando…</div></div>';
    if (DB.pode('admin')) setTimeout(carregaUsu, 30); return o;
  }
  async function carregaUsu() {
    var b = $('usu-box'); if (!b) return; try {
      var l = await DB.perfis(); b.innerHTML = '<table class="tbl"><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ativo</th></tr></thead><tbody>' + l.map(function (p) { return '<tr><td><input data-pn="' + p.id + '" value="' + h(p.nome) + '" style="padding:8px"></td><td>' + h(p.email || '') + '</td><td><select data-pp="' + p.id + '" style="padding:8px">' + [['admin', 'Administrador'], ['elabora', 'Elabora'], ['revisa', 'Revisa'], ['aprova', 'Aprova (RT)'], ['consulta', 'Só consulta']].map(function (x) { return '<option value="' + x[0] + '"' + (p.papel === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></td><td><input type="checkbox" data-pa="' + p.id + '"' + (p.ativo ? ' checked' : '') + ' style="width:auto"></td></tr>'; }).join('') + '</tbody></table><div class="bt" style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn" data-salvarusu>Salvar usuários</button></div><p style="color:var(--mut);font-size:.78rem;margin:8px 0 0">Para novas pessoas: elas se cadastram na tela de entrada (“Criar conta”) e você libera o perfil aqui.</p>';
      b._lista = l;
    } catch (e) { b.innerHTML = '<div class="erro">' + h(e.message) + '</div>'; }
  }

  /* ---------- busca global ---------- */
  function busca() {
    var o = modal('<input id="bg" placeholder="Procurar documento, requisito ou documento legal…" autocomplete="off" style="font-size:1.05rem;padding:15px"><div class="res-b" id="bg-r" style="margin-top:10px;max-height:60vh;overflow:auto"></div>', function (o) {
      var nz = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
      var itens = S.d.docs.map(function (d) { return ['▤', d.codigo + ' · ' + d.titulo, 'Documento', 'data-doc="' + d.id + '"']; }).concat(REQ.map(function (r) { return ['✓', r[0] + ' · ' + r[3].slice(0, 90), 'Requisito', 'data-req="' + r[0] + '"']; })).concat(S.d.legais.map(function (l) { return ['⚖', (LEG_NOME[l.tipo] || '') + ' ' + (l.descricao || ''), 'Legal', 'data-ir="legais"']; }));
      var q = o.querySelector('#bg'), r = o.querySelector('#bg-r');
      function lista() { var v = nz(q.value), l = itens.filter(function (x) { return !v || nz(x[1]).indexOf(v) >= 0; }).slice(0, 12); r.innerHTML = l.map(function (x) { return '<button class="op" ' + x[3] + ' data-fecha>' + x[0] + ' <b style="font-size:.86rem">' + h(x[1]) + '</b><small>' + x[2] + '</small></button>'; }).join('') || '<div class="vazio">Nada encontrado.</div>'; }
      q.oninput = lista; lista(); q.focus(); q.onkeydown = function (e) { if (e.key === 'Enter') { var p = r.querySelector('.op'); if (p) p.click(); } if (e.key === 'Escape') o.fechar(); };
    });
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', async function (e) {
    var t = e.target.closest ? e.target : e.target.parentElement; if (!t.closest) return; var a;
    if (t.closest('[data-fecha]')) { var ov = t.closest('.ov'); setTimeout(function () { if (ov) ov.remove(); }, 0); }
    if ((a = t.closest('[data-ir]'))) return irPara(a.dataset.ir);
    if ((a = t.closest('[data-dom]'))) return irPara('programa', { dom: a.dataset.dom, filtro: 'todos' });
    if ((a = t.closest('[data-filtro]'))) { S.filtro = a.dataset.filtro; return render(); }
    if ((a = t.closest('[data-grp]'))) { S.aberto[a.dataset.grp] = !S.aberto[a.dataset.grp]; var s = a.closest('.grp'); s.classList.toggle('aberto', S.aberto[a.dataset.grp]); return; }
    if ((a = t.closest('[data-req]'))) { var r = REQ.filter(function (x) { return x[0] === a.dataset.req; })[0]; S.filtro = 'todos'; S.aberto[r[2]] = true; return irPara('programa', { dom: r[1], alvo: r[0] }); }
    if ((a = t.closest('[data-rel]'))) { if (!regsDoForm(a.dataset.rel).length && nRegs(a.dataset.rel)) return irPara('regs', { reg: { chave: a.dataset.rel, q: '', mes: '', id: null, rel: true, dias: 30 } }); return irPara('evid', { rel: { cod: a.dataset.rel, dias: 30 } }); }
    if (t.closest('[data-voltar-ev]')) return irPara('programa');
    if ((a = t.closest('[data-doc]'))) return irPara('docs', { docId: a.dataset.doc });
    if (t.closest('[data-voltar]')) { S.docId = null; return render(); }
    if ((a = t.closest('[data-regg]'))) { S.reg = { chave: a.dataset.regg, q: '', mes: '', id: null }; return render(); }
    if ((a = t.closest('[data-regver]'))) { S.reg.id = Number(a.dataset.regver); return render(); }
    if (t.closest('[data-regvolta]')) { S.reg = { chave: '', q: '', mes: '', id: null }; return render(); }
    if (t.closest('[data-regvolta2]')) { S.reg.id = null; S.reg.rel = false; return render(); }
    if (t.closest('[data-regrel]')) { S.reg.rel = true; S.reg.dias = 90; S.reg.id = null; return render(); }
    if (t.closest('[data-cqfia]')) { S.cq = S.cq || { tipo: '', per: 90, analito: '', rel: false }; S.cq.fia = true; S.cq.tol = false; return irPara('cq'); }
    if (t.closest('[data-fiavolta]')) { S.cq.fia = false; return render(); }
    if (t.closest('[data-fiasalvar]')) { try { await salvarFia(); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-fiafxsalvar]')) { try { var fx = {}; [].slice.call(document.querySelectorAll('[data-fiafx]')).forEach(function (i) { var n = numBR(i.value); if (isNaN(n)) throw new Error('Faixa inválida.'); fx[i.dataset.fiafx] = n; }); if (fx.c1_min >= fx.c1_max || fx.c2_min >= fx.c2_max) throw new Error('O mínimo precisa ser menor que o máximo.'); fx.unidade = fiaFx().unidade; await DB.saveFiaFaixas(fx); S.d.fiaFx = Object.assign({ id: 1 }, fx); toast('Faixas salvas.'); render(); } catch (er) { toast(er.message, 1); } return; }
    if ((a = t.closest('[data-frmabrir]'))) { S.frm = { cod: a.dataset.frmabrir, q: '' }; return render(); }
    if (t.closest('[data-frmvolta]')) { S.frm = { cod: '', q: '' }; return render(); }
    if (t.closest('[data-frmsalvar]')) { try { await salvarForm(); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-cqtol]')) { S.cq.tol = true; return render(); }
    if (t.closest('[data-tolvolta]')) { S.cq.tol = false; return render(); }
    if ((a = t.closest('[data-tolsalvar]'))) { try { await salvarTol(a.dataset.tolsalvar); } catch (er) { toast(er.message, 1); } return; }
    if ((a = t.closest('[data-toldel]'))) { try { await DB.delTolerancia(a.dataset.toldel); delete S.d.tol[a.dataset.toldel]; toast('Voltou ao padrão (±' + CQ_TOL + '%).'); carregaTol(); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-toladd]')) { try { var nm = $('tol-novo').value.trim(); if (!nm) throw new Error('Digite o nome do analito.'); var kk = chaveAn(nm), ln = { chave: kk, analito: nm, percentual: CQ_TOL, absoluto: null, unidade: '', fonte: '', atualizado_por: DB.user.nome, atualizado_em: new Date().toISOString() }; await DB.saveTolerancia(ln); S.d.tol[kk] = ln; toast('Analito adicionado. Ajuste os limites e salve.'); carregaTol(); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-cqrel]')) { S.cq.rel = true; return render(); }
    if (t.closest('[data-cqvolta]')) { S.cq.rel = false; return render(); }
    if ((a = t.closest('[data-hjabrir]'))) { a.closest('.hj-it').classList.toggle('aberto'); return; }
    if ((a = t.closest('[data-hjsalvar]'))) { try { await salvarRotina(Number(a.dataset.hjsalvar)); } catch (er) { toast(er.message, 1); } return; }
    if ((a = t.closest('[data-regver2]'))) { var rg = S.d.regs.filter(function (x) { return String(x.id) === a.dataset.regver2; })[0]; if (rg) { S.reg = { chave: rg.form || rg.titulo, q: '', mes: '', id: rg.id }; return irPara('regs'); } return; }
    if (t.closest('[data-rdhoje]')) { S.rdData = hoje(); return render(); }
    if ((a = t.closest('[data-rdtab]'))) { S.rdTab = a.dataset.rdtab; return render(); }
    if ((a = t.closest('[data-apabrir]'))) { a.closest('.ap-card').classList.toggle('aberto'); return; }
    if ((a = t.closest('[data-apsalvar]'))) { try { await salvarApoio(a.dataset.apsalvar); } catch (er) { toast(er.message, 1); } return; }
    if ((a = t.closest('[data-apcancel]'))) { try { await cancelarApoio(a.dataset.apcancel); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-imprimir]')) return window.print();
    if (t.closest('[data-busca]')) return busca();
    if (t.closest('[data-menu]')) return $('side').classList.toggle('aberto');
    if (t.closest('[data-sair]')) { await DB.logout(); return location.reload(); }
    if (t.closest('[data-semear]')) { try { await semear(false); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-resetdemo]')) { if (confirm('Apagar todos os dados de demonstração deste navegador?')) { DB.resetDemo(); location.reload(); } return; }
    if ((a = t.closest('[data-set]'))) return setResp(a.dataset.set, a.dataset.r, false);
    if ((a = t.closest('[data-fut]'))) { var rr = REQ.filter(function (x) { return x[0] === a.dataset.fut; })[0]; return setResp(a.dataset.fut, null, !resp(rr).f); }
    if ((a = t.closest('[data-nota]'))) return notaReq(a.dataset.nota);
    if ((a = t.closest('[data-addev]'))) return addEvid(a.dataset.addev);
    if ((a = t.closest('[data-delev]'))) { try { await DB.delEvid(a.dataset.delev); S.d.evid = S.d.evid.filter(function (x) { return x.id !== a.dataset.delev; }); render(); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-novodoc]')) return editarDoc(null);
    var d = S.docId && S.d.docs.filter(function (x) { return x.id === S.docId; })[0];
    if (t.closest('[data-editar]') && d) return editarDoc(d);
    if ((a = t.closest('[data-sit]')) && d) { if (a.dataset.sit === 'vigente' && !confirm('Aprovar e publicar ' + d.codigo + ' como vigente? Fica registrado em seu nome.')) return; return mudarSit(d, a.dataset.sit); }
    if (t.closest('[data-novaver]') && d) return novaVersao(d);
    if (t.closest('[data-hist]') && d) return historico(d);
    if ((a = t.closest('[data-novolegal]'))) return editarLegal(null, a.dataset.novolegal || '');
    if ((a = t.closest('[data-edlegal]'))) return editarLegal(S.d.legais.filter(function (x) { return x.id === a.dataset.edlegal; })[0]);
    if ((a = t.closest('[data-dellegal]'))) { if (confirm('Remover este documento legal?')) { await DB.delLegal(a.dataset.dellegal); await carregar(); render(); } return; }
    if ((a = t.closest('[data-anexo]'))) { try { var l = S.d.legais.filter(function (x) { return x.id === a.dataset.anexo; })[0]; window.open(await DB.anexoUrl(l.arquivo_path), '_blank'); } catch (er) { toast(er.message, 1); } return; }
    if (t.closest('[data-rhoje]')) { S.rdia = hoje(); return render(); }
    if ((a = t.closest('[data-regtemp]'))) return regTemp(a.dataset.regtemp);
    if (t.closest('[data-salvarusu]')) { var b = $('usu-box'); try { for (var i = 0; i < b._lista.length; i++) { var p = b._lista[i]; await DB.savePerfil({ id: p.id, nome: b.querySelector('[data-pn="' + p.id + '"]').value, papel: b.querySelector('[data-pp="' + p.id + '"]').value, ativo: b.querySelector('[data-pa="' + p.id + '"]').checked }); } toast('Usuários salvos.'); } catch (er) { toast(er.message, 1); } return; }
  });
  document.addEventListener('input', function (e) {
    if (e.target.dataset && e.target.dataset.api !== undefined && e.target.dataset.apid) varApoio(e.target);
    if (e.target.id === 'fm-q') { S.frm = S.frm || { cod: '', q: '' }; S.frm.q = e.target.value; var p3 = e.target.selectionStart; render(); var n3 = $('fm-q'); if (n3) { n3.focus(); n3.setSelectionRange(p3, p3); } }
    if (e.target.id === 'rg-q') { S.reg.q = e.target.value; var pp = e.target.selectionStart; render(); var nn = $('rg-q'); if (nn) { nn.focus(); nn.setSelectionRange(pp, pp); } }
    if (e.target.id === 'f-q') { S.busca = e.target.value; var p = e.target.selectionStart; render(); var n = $('f-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'f-t') { S.tipo = e.target.value; render(); } if (e.target.id === 'f-s') { S.situ = e.target.value; render(); } if (e.target.id === 'cq-tipo') { S.cq.tipo = e.target.value; carregaCq(); } if (e.target.id === 'cq-per') { S.cq.per = Number(e.target.value); carregaCq(); } if (e.target.id === 'cq-an') { S.cq.analito = e.target.value; carregaCq(); } if (e.target.id === 'rd-data') { S.rdData = e.target.value || hoje(); render(); } if (e.target.id === 'rg-mes') { S.reg.mes = e.target.value; render(); } if (e.target.id === 'rg-per') { S.reg.dias = Number(e.target.value); render(); } if (e.target.id === 'ev-per') { S.rel.dias = Number(e.target.value); render(); } if (e.target.id === 'r-dia') { S.rdia = e.target.value || hoje(); carregaTemp(); } });
  document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && DB.user) { e.preventDefault(); busca(); } });

  /* ---------- entrada ---------- */
  function telaLogin(msg) {
    $('app').classList.add('oculto'); var L = $('login'); L.classList.remove('oculto');
    var criar = false;
    function desenha() {
      L.innerHTML = '<div class="lg-card"><img src="img/logo-cda.png" alt="CDA"><h1>Qualidade 2.0</h1><p class="s">Laboratório CDA · programa de qualidade e acreditação</p>' +
        (DB.demo ? '<div class="lg-aviso"><b>Modo demonstração.</b> O Supabase ainda não foi configurado: você pode explorar tudo; os dados ficam só neste navegador.</div><label class="cmp" style="margin-top:14px"><span>Seu nome</span><input id="lg-n" value="Diêgo Padua Silva"></label><label class="cmp"><span>Perfil</span><select id="lg-p"><option value="admin">Administrador</option><option value="aprova">Aprova (RT)</option><option value="elabora">Elabora</option><option value="consulta">Só consulta</option></select></label><button class="btn" id="lg-demo">Entrar como demonstração</button>' :
          (criar ? '<label class="cmp"><span>Nome</span><input id="lg-n"></label>' : '') + '<label class="cmp"><span>E-mail</span><input id="lg-e" type="email" autocomplete="username"></label><label class="cmp"><span>Senha</span><input id="lg-s" type="password" autocomplete="' + (criar ? 'new-password' : 'current-password') + '"></label><button class="btn" id="lg-ok">' + (criar ? 'Criar conta' : 'Entrar') + '</button><p style="text-align:center;margin:14px 0 0;font-size:.82rem"><a href="#" id="lg-troca" style="color:var(--esc);font-weight:800">' + (criar ? 'Já tenho conta' : 'Criar conta') + '</a></p>') +
        '<div id="lg-erro">' + (msg ? '<div class="erro">' + h(msg) + '</div>' : '') + '</div></div>';
      var ok = $('lg-ok'), dm = $('lg-demo'), tr = $('lg-troca');
      if (tr) tr.onclick = function (e) { e.preventDefault(); criar = !criar; msg = ''; desenha(); };
      if (dm) dm.onclick = function () { DB.demoLogin($('lg-n').value.trim(), $('lg-p').value); iniciar(); };
      if (ok) { var go = async function () { ok.disabled = true; try { if (criar) await DB.cadastrar($('lg-n').value.trim(), $('lg-e').value.trim(), $('lg-s').value); else await DB.login($('lg-e').value.trim(), $('lg-s').value); iniciar(); } catch (er) { ok.disabled = false; $('lg-erro').innerHTML = '<div class="erro">' + h(er.message) + '</div>'; } }; ok.onclick = go; $('lg-s').onkeydown = function (e) { if (e.key === 'Enter') go(); }; }
    } desenha();
  }
  async function iniciar() {
    try { await carregar(); } catch (e) { return telaLogin('Não foi possível carregar os dados: ' + e.message); }
    $('login').classList.add('oculto'); $('app').classList.remove('oculto');
    var p = (location.hash || '').slice(1); if (['inicio', 'programa', 'docs', 'legais', 'registros', 'frm', 'regs', 'cq', 'relatorio', 'ajustes'].indexOf(p) >= 0) S.pg = p;
    render();
  }
  (async function () { try { var u = await DB.init(); if (!u && window.parent !== window && !DB.demo) { document.body.insertAdjacentHTML('beforeend', '<div id="sso-msg" style="position:fixed;inset:0;display:grid;place-items:center;background:#e9f6f5;color:#0b6b66;font:600 1rem sans-serif">Entrando com a sua conta do painel…</div>'); u = await DB.sso(); var m = document.getElementById('sso-msg'); if (m) m.remove(); } if (u) iniciar(); else telaLogin(DB.ssoMotivo ? 'Entrada automática não funcionou: ' + DB.ssoMotivo + (DB.armazenamentoOk() ? '' : ' · o navegador está bloqueando o armazenamento deste site dentro do painel.') : undefined); } catch (e) { var m2 = document.getElementById('sso-msg'); if (m2) m2.remove(); telaLogin(e.message); } })();
})();
