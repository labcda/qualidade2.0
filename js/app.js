/* Qualidade 2.0 · CDA — interface */
(function () {
  var $ = function (id) { return document.getElementById(id); }, h = MD.esc, REQ = window.Q2_REQ, DOM = window.Q2_DOMINIOS, GRP = window.Q2_GRUPOS;
  var S = { pg: 'inicio', dom: 'D1', filtro: 'todos', aberto: {}, d: { docs: [], resp: {}, evid: [], legais: [], equip: [], temps: [] }, docId: null, busca: '', tipo: '', situ: '' };
  var RLAB = { A: 'Atende', P: 'Parcial', N: 'Não atende', NA: 'Não se aplica' }, RCOR = { A: '#16a34a', P: '#d97706', N: '#dc2626', NA: '#64748b', F: '#7c6cf0' };
  var LEG_NOME = {}; window.Q2_LEGAIS.forEach(function (l) { LEG_NOME[l[0]] = l[1]; });
  function toast(t, e) { var x = document.createElement('div'); x.className = 'toast' + (e ? ' e' : ''); x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.remove(); }, 3600); }
  function hoje() { return new Date().toISOString().slice(0, 10); }
  function dias(d) { if (!d) return null; return Math.round((new Date(String(d).slice(0, 10) + 'T12:00:00') - new Date(hoje() + 'T12:00:00')) / 864e5); }
  function modal(html, quando) { var o = document.createElement('div'); o.className = 'ov'; o.innerHTML = '<div class="md">' + html + '</div>'; document.body.appendChild(o); o.addEventListener('mousedown', function (e) { if (e.target === o) o.remove(); }); o.fechar = function () { o.remove(); }; if (quando) quando(o); return o; }

  /* ---------- dados e cálculos ---------- */
  var BIB_VER = '2026-11-06b';   // muda quando o texto da biblioteca é corrigido: no modo demonstração, reaplica os textos
  async function carregar() {
    var r = await Promise.all([DB.docs(), DB.respostas(), DB.evid(), DB.legais(), DB.equip(), DB.temps(somaDias(hoje(), -400), hoje())]);
    S.d.docs = r[0]; S.d.resp = r[1]; S.d.evid = r[2]; S.d.legais = r[3]; S.d.equip = r[4]; S.d.temps = r[5];
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
  var MENU = [['inicio', '⌂', 'Início'], ['programa', '✓', 'Autoavaliação'], ['docs', '▤', 'Documentos'], ['legais', '⚖', 'Documentos legais'], ['registros', '☰', 'Registros do dia'], ['relatorio', '⎙', 'Relatório'], ['ajustes', '⚙', 'Ajustes']];
  function irPara(p, extra) { S.pg = p; if (extra) Object.assign(S, extra); if (p !== 'docs') S.docId = null; render(); window.scrollTo(0, 0); $('side').classList.remove('aberto'); history.replaceState(null, '', '#' + p); }
  function menu() {
    var u = DB.user, pend = S.d.legais.filter(function (l) { var n = dias(l.validade); return n !== null && n <= 60; }).length;
    $('side').innerHTML = '<div class="marca"><img src="img/logo-cda.png" alt="CDA"><div><b>Qualidade 2.0</b><small>Laboratório CDA</small></div></div>' +
      MENU.map(function (m, i) { return (i === 5 ? '<div class="tit">Consulta</div>' : '') + '<button class="nv' + (S.pg === m[0] ? ' on' : '') + '" data-ir="' + m[0] + '"><i>' + m[1] + '</i><span>' + m[2] + '</span>' + (m[0] === 'legais' && pend ? '<em>' + pend + '</em>' : '') + '</button>'; }).join('') +
      '<div class="eu"><div class="av">' + h((u.nome || '?').charAt(0).toUpperCase()) + '</div><div><b>' + h(u.nome) + '</b><small>' + h(({ admin: 'Administrador', elabora: 'Elabora', revisa: 'Revisa', aprova: 'Aprova', consulta: 'Consulta' })[u.papel]) + (DB.demo ? ' · demonstração' : '') + '</small></div><button data-sair>Sair</button></div>';
  }
  function topo(t, s, extra) { return '<div class="topo"><button class="menu-m" data-menu>☰ Menu</button><h1>' + t + (s ? '<small>' + s + '</small>' : '') + '</h1>' + (extra || '') + '<div class="busca" data-busca>🔎 Procurar <kbd>Ctrl K</kbd></div></div>'; }
  function render() {
    menu(); var m = $('main');
    var f = { inicio: pgInicio, programa: pgPrograma, docs: pgDocs, legais: pgLegais, registros: pgRegistros, evid: pgEvid, relatorio: pgRelatorio, ajustes: pgAjustes }[S.pg] || pgInicio;
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
    var ev = p.docs.map(function (e) { var nr = e.d ? regsDoForm(e.c).length : 0; if (nr) return '<button class="tg ok" data-rel="' + e.c + '" title="Abrir o relatório dos registros preenchidos no sistema">✔ ' + h(e.c) + ' · ' + nr + ' registros <small>ver relatório</small></button>'; return e.d ? '<button class="tg" data-doc="' + e.d.id + '" title="' + h(e.d.titulo) + '">▤ ' + h(e.c) + ' <small>v' + h(e.d.versao) + '</small></button>' : '<span class="tg sem" title="Ainda não existe no sistema">✗ ' + h(e.c) + '</span>'; }).join('');
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

  /* ---------- relatório de evidência (registros feitos no sistema) ---------- */
  function pgEvid() {
    var cod = S.rel && S.rel.cod, nd = (S.rel && S.rel.dias) || 30; if (!cod) return pgInicio();
    var d = docPorCod(cod) || { codigo: cod, titulo: cod, versao: '1', status: 'vigente' }, de = somaDias(hoje(), -nd), ate = hoje();
    var regs = regsDoForm(cod).filter(function (t) { return t.dia >= de && t.dia <= ate; }).sort(function (a, b) { return a.dia < b.dia ? -1 : a.dia > b.dia ? 1 : (a.criado_em || '') < (b.criado_em || '') ? -1 : 1; });
    var eq = {}; S.d.equip.forEach(function (e) { eq[e.id] = e; });
    var desv = regs.filter(function (t) { return t.situacao !== 'ok'; });
    var o = '<button class="voltar" data-voltar-ev>← Voltar</button><div class="barra-doc topo"><h1>Relatório de evidência<small>' + h(d.codigo + ' · ' + d.titulo) + '</small></h1><select id="ev-per" style="width:auto"><option value="30"' + (nd === 30 ? ' selected' : '') + '>Últimos 30 dias</option><option value="90"' + (nd === 90 ? ' selected' : '') + '>Últimos 90 dias</option><option value="180"' + (nd === 180 ? ' selected' : '') + '>Últimos 180 dias</option><option value="365"' + (nd === 365 ? ' selected' : '') + '>Últimos 12 meses</option></select><button class="btn" data-imprimir>🖨 Imprimir / salvar PDF</button></div>';
    var c = '<p>Relatório gerado automaticamente a partir dos registros preenchidos no sistema, no período de <b>' + MD.fmtData(de) + '</b> a <b>' + MD.fmtData(ate) + '</b>. Emitido em ' + MD.fmtData(hoje()) + ' por ' + h(DB.user ? DB.user.nome : '') + '.</p>';
    if (!regs.length) c += '<p><b>Nenhum registro neste período.</b></p>';
    else {
      c += '<h2>Resumo</h2><table><thead><tr><th>Equipamento</th><th>Faixa</th><th>Registros</th><th>Mínima</th><th>Máxima</th><th>Média</th><th>Fora da faixa</th></tr></thead><tbody>';
      var ids = []; regs.forEach(function (t) { if (ids.indexOf(t.equip_id) < 0) ids.push(t.equip_id); });
      ids.forEach(function (id) { var l = regs.filter(function (t) { return t.equip_id === id; }), v = l.map(function (t) { return Number(t.valor); }), e = eq[id] || {}; c += '<tr><td>' + h(e.nome || l[0].equip_nome || '') + '</td><td>' + e.minimo + ' a ' + e.maximo + ' °C</td><td>' + l.length + '</td><td>' + Math.min.apply(null, v).toFixed(1) + '</td><td>' + Math.max.apply(null, v).toFixed(1) + '</td><td>' + (v.reduce(function (a, b) { return a + b; }, 0) / v.length).toFixed(1) + '</td><td>' + l.filter(function (t) { return t.situacao !== 'ok'; }).length + '</td></tr>'; });
      c += '</tbody></table><h2>Registros</h2><table><thead><tr><th>Data</th><th>Turno</th><th>Equipamento</th><th>°C</th><th>Situação</th><th>Ação corretiva</th><th>Responsável</th></tr></thead><tbody>' + regs.map(function (t) { return '<tr><td>' + MD.fmtData(t.dia) + '</td><td>' + h(t.turno || '') + '</td><td>' + h((eq[t.equip_id] || {}).nome || t.equip_nome || '') + '</td><td>' + t.valor + '</td><td>' + (t.situacao === 'ok' ? 'Conforme' : '<b>Desvio</b>') + '</td><td>' + h(t.acao || '') + '</td><td>' + h(t.usuario || '') + '</td></tr>'; }).join('') + '</tbody></table>';
      c += '<p>' + regs.length + ' registros, ' + desv.length + ' fora da faixa' + (desv.length ? ', todos com ação corretiva descrita acima.' : '.') + '</p>';
    }
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

  /* ---------- registros do dia ---------- */
  function pgRegistros() {
    var dia = S.rdia || hoje(), o = topo('Registros do dia', 'Rotina diária do laboratório');
    o += '<div class="grade g4 anim" style="margin-bottom:18px">' + [['🌡️', 'Temperaturas', 'Geladeiras, freezer, banho-maria e ambiente', 1], ['🧼', 'Limpeza e conservação', 'Em breve neste sistema; continua no painel atual', 0], ['🧪', 'Controle interno', 'Em breve neste sistema; continua no painel atual', 0], ['⚠️', 'Não conformidades', 'Em breve neste sistema; continua no painel atual', 0]].map(function (c) { return '<div class="vidro pad" style="' + (c[3] ? 'border-left:5px solid var(--tq)' : 'opacity:.7') + '"><div style="font-size:1.6rem">' + c[0] + '</div><b>' + c[1] + '</b><div style="color:var(--mut);font-size:.78rem;margin-top:4px">' + c[2] + '</div></div>'; }).join('') + '</div>';
    o += '<h2 class="sec">Temperaturas</h2><div class="barra"><input type="date" id="r-dia" value="' + dia + '" style="max-width:190px"><button class="btn s p" data-rhoje>Hoje</button></div><div class="vidro pad" id="temp-box"><div class="vazio">Carregando…</div></div>';
    setTimeout(carregaTemp, 30); return o;
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
    if ((a = t.closest('[data-rel]'))) return irPara('evid', { rel: { cod: a.dataset.rel, dias: 30 } });
    if (t.closest('[data-voltar-ev]')) return irPara('programa');
    if ((a = t.closest('[data-doc]'))) return irPara('docs', { docId: a.dataset.doc });
    if (t.closest('[data-voltar]')) { S.docId = null; return render(); }
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
    if (e.target.id === 'f-q') { S.busca = e.target.value; var p = e.target.selectionStart; render(); var n = $('f-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'f-t') { S.tipo = e.target.value; render(); } if (e.target.id === 'f-s') { S.situ = e.target.value; render(); } if (e.target.id === 'ev-per') { S.rel.dias = Number(e.target.value); render(); } if (e.target.id === 'r-dia') { S.rdia = e.target.value || hoje(); carregaTemp(); } });
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
    var p = (location.hash || '').slice(1); if (['inicio', 'programa', 'docs', 'legais', 'registros', 'relatorio', 'ajustes'].indexOf(p) >= 0) S.pg = p;
    render();
  }
  (async function () { try { var u = await DB.init(); if (u) iniciar(); else telaLogin(); } catch (e) { telaLogin(e.message); } })();
})();
