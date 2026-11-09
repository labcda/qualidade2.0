/* Camada de dados: Supabase (produção) ou localStorage (modo demonstração, sem chave configurada). */
(function () {
  var C = window.Q2_CONFIG, uid = function () { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  var demo = !C.SUPABASE_ANON_KEY, sb = null, st = { user: null };
  if (!demo && window.supabase) sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

  /* ---------- armazenamento demonstração ---------- */
  var KEY = 'q2_demo_v1';
  function ld() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function sv(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { console.warn('[demo] não foi possível salvar', e); } }
  function banco() {
    var d = ld(); if (d) return d;
    d = { docs: [], versoes: [], respostas: {}, evid: [], legais: [], equip: [], temp: [], perfis: [], log: [] };
    d.equip = [['Geladeira de reagentes', 'geladeira', 'Área técnica', 2, 8], ['Geladeira de amostras', 'geladeira', 'Área técnica', 2, 8], ['Freezer', 'freezer', 'Área técnica', -25, -15], ['Banho-maria', 'banho-maria', 'Área técnica', 35, 39], ['Sala técnica (ambiente)', 'ambiente', 'Área técnica', 18, 25]].map(function (e) { return { id: uid(), nome: e[0], tipo: e[1], local: e[2], minimo: e[3], maximo: e[4], ativo: true }; });
    sv(d); return d;
  }
  var ok = function (v) { return Promise.resolve(v); };

  function err(e) { if (e && e.message) throw e; if (e) throw new Error(String(e)); }
  async function q(p) { var r = await p; if (r.error) throw new Error(r.error.message || 'Erro no banco'); return r.data; }

  var DB = {
    demo: demo,
    get user() { return st.user; },
    async init() {
      if (demo) { try { var u = JSON.parse(localStorage.getItem('q2_demo_user')); if (u) st.user = u; } catch (e) { } return st.user; }
      var s = (await sb.auth.getSession()).data.session; if (!s) return null;
      return DB._perfil(s.user);
    },
    /* Entrada única: dentro do painel CDA (iframe), o painel entrega um token de uso único e o login do painel vale aqui também. */
    sso() {
      return new Promise(function (res) {
        if (demo || window.parent === window) return res(null);
        var feito = false, T = null;
        function fim(v) { if (feito) return; feito = true; clearTimeout(T); window.removeEventListener('message', on); res(v); }
        function origemOk(o) { return /^https:\/\/([a-z0-9-]+\.)?painel-cda\.pages\.dev$/.test(o) || /^http:\/\/localhost:\d+$/.test(o); }
        async function on(e) {
          if (!origemOk(e.origin)) return; var m = e.data; if (!m || m.tipo !== 'q2-sso') return;
          if (m.erro || !m.token_hash) return fim(null);
          try { var r = await sb.auth.verifyOtp({ token_hash: m.token_hash, type: 'magiclink' }); if (r.error) throw r.error; fim(await DB._perfil(r.data.user)); } catch (er) { console.warn('[sso]', er); fim(null); }
        }
        window.addEventListener('message', on);
        try { window.parent.postMessage({ tipo: 'q2-pronto' }, '*'); } catch (e) { return fim(null); }
        T = setTimeout(function () { fim(null); }, 9000);
      });
    },
    async _perfil(u) {
      var p = await q(sb.from('q2_perfis').select('*').eq('id', u.id).maybeSingle());
      if (!p) throw new Error('Seu usuário ainda não tem perfil. Peça ao administrador para liberar o acesso.');
      if (!p.ativo) throw new Error('Seu acesso está desativado. Fale com o administrador.');
      st.user = { id: u.id, nome: p.nome || u.email, email: u.email, papel: p.papel }; return st.user;
    },
    async login(email, senha) {
      if (demo) throw new Error('Modo demonstração: use o botão Entrar como demonstração.');
      var r = await sb.auth.signInWithPassword({ email: email, password: senha });
      if (r.error) throw new Error(r.error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : r.error.message);
      return DB._perfil(r.data.user);
    },
    async cadastrar(nome, email, senha) {
      if (demo) throw new Error('Cadastro só funciona depois de configurar o Supabase.');
      var r = await sb.auth.signUp({ email: email, password: senha, options: { data: { nome: nome } } });
      if (r.error) throw new Error(r.error.message);
      if (!r.data.session) throw new Error('Cadastro criado. Confirme o e-mail (se o Supabase pedir) e entre em seguida.');
      return DB._perfil(r.data.user);
    },
    demoLogin(nome, papel) { st.user = { id: 'demo', nome: nome || 'Demonstração', email: 'demo@local', papel: papel || 'admin' }; localStorage.setItem('q2_demo_user', JSON.stringify(st.user)); return st.user; },
    async logout() { if (demo) { localStorage.removeItem('q2_demo_user'); } else { await sb.auth.signOut(); } st.user = null; },
    pode(acao) { var p = st.user && st.user.papel; if (!p) return false; if (acao === 'ler') return true; if (acao === 'admin') return p === 'admin'; if (acao === 'aprovar') return p === 'admin' || p === 'aprova'; return p !== 'consulta'; },

    /* ----- documentos ----- */
    async docs() { if (demo) return ok(banco().docs.slice()); return q(sb.from('q2_documentos').select('*').order('codigo')); },
    async saveDoc(d) {
      d.atualizado_em = new Date().toISOString();
      if (demo) { var b = banco(), i = b.docs.findIndex(function (x) { return x.id === d.id; }); if (i < 0) { d.id = d.id || uid(); d.criado_em = d.atualizado_em; b.docs.push(d); } else b.docs[i] = Object.assign(b.docs[i], d); sv(b); return d; }
      var row = Object.assign({}, d); if (!row.id) delete row.id;
      return q(sb.from('q2_documentos').upsert(row, { onConflict: 'id' }).select().single());
    },
    async saveDocs(lista) {   // importação em lote
      if (demo) { var b = banco(); lista.forEach(function (d) { var i = b.docs.findIndex(function (x) { return x.codigo === d.codigo && x.titulo === d.titulo && x.unidade === d.unidade; }); if (i < 0) { d.id = uid(); b.docs.push(d); } else b.docs[i] = Object.assign(b.docs[i], d); }); sv(b); return lista.length; }
      for (var k = 0; k < lista.length; k += 40) await q(sb.from('q2_documentos').upsert(lista.slice(k, k + 40), { onConflict: 'codigo,titulo,unidade' }));
      return lista.length;
    },
    async versoes(docId) { if (demo) return ok(banco().versoes.filter(function (v) { return v.doc_id === docId; }).sort(function (a, b) { return b.criado_em < a.criado_em ? -1 : 1; })); return q(sb.from('q2_doc_versoes').select('*').eq('doc_id', docId).order('criado_em', { ascending: false })); },
    async addVersao(v) { v.criado_em = new Date().toISOString(); if (demo) { var b = banco(); v.id = uid(); b.versoes.push(v); sv(b); return v; } return q(sb.from('q2_doc_versoes').insert(v).select().single()); },

    /* ----- programa Unimed ----- */
    async respostas() { if (demo) return ok(Object.assign({}, banco().respostas)); var l = await q(sb.from('q2_respostas').select('*')), o = {}; l.forEach(function (r) { o[r.codigo] = r; }); return o; },
    async saveResposta(r) {
      r.atualizado_em = new Date().toISOString(); r.atualizado_por = st.user ? st.user.nome : '';
      if (demo) { var b = banco(); b.respostas[r.codigo] = Object.assign(b.respostas[r.codigo] || {}, r); sv(b); return r; }
      return q(sb.from('q2_respostas').upsert(r, { onConflict: 'codigo' }).select().single());
    },
    async saveRespostas(lista) { if (demo) { var b = banco(); lista.forEach(function (r) { b.respostas[r.codigo] = r; }); sv(b); return; } for (var k = 0; k < lista.length; k += 60) await q(sb.from('q2_respostas').upsert(lista.slice(k, k + 60), { onConflict: 'codigo' })); },
    async evid() { if (demo) return ok(banco().evid.slice()); return q(sb.from('q2_evidencias').select('*').order('criado_em')); },
    async addEvid(e) { e.criado_por = st.user ? st.user.nome : ''; if (demo) { var b = banco(); e.id = uid(); e.criado_em = new Date().toISOString(); b.evid.push(e); sv(b); return e; } return q(sb.from('q2_evidencias').insert(e).select().single()); },
    async delEvid(id) { if (demo) { var b = banco(); b.evid = b.evid.filter(function (x) { return x.id !== id; }); sv(b); return; } return q(sb.from('q2_evidencias').delete().eq('id', id)); },
    async addEvids(lista) { if (demo) { var b = banco(); lista.forEach(function (e) { e.id = uid(); e.criado_em = new Date().toISOString(); b.evid.push(e); }); sv(b); return; } for (var k = 0; k < lista.length; k += 80) await q(sb.from('q2_evidencias').insert(lista.slice(k, k + 80))); },

    /* ----- documentos legais ----- */
    async legais() { if (demo) return ok(banco().legais.filter(function (x) { return x.ativo !== false; })); return q(sb.from('q2_legais').select('*').eq('ativo', true).order('tipo')); },
    async saveLegal(l) {
      l.atualizado_em = new Date().toISOString();
      if (demo) { var b = banco(), i = b.legais.findIndex(function (x) { return x.id === l.id; }); if (i < 0) { l.id = l.id || uid(); b.legais.push(l); } else b.legais[i] = Object.assign(b.legais[i], l); sv(b); return l; }
      var row = Object.assign({}, l); if (!row.id) delete row.id;
      return q(sb.from('q2_legais').upsert(row, { onConflict: 'id' }).select().single());
    },
    async delLegal(id) { return DB.saveLegal({ id: id, ativo: false }); },
    async upload(file) {
      if (demo) { return new Promise(function (res, rej) { if (file.size > 900000) return rej(new Error('No modo demonstração o anexo pode ter até 900 KB.')); var r = new FileReader(); r.onload = function () { res({ path: 'demo:' + r.result, nome: file.name }); }; r.onerror = rej; r.readAsDataURL(file); }); }
      var path = new Date().getFullYear() + '/' + uid() + '-' + file.name.replace(/[^A-Za-z0-9._-]/g, '_');
      var r = await sb.storage.from('q2-anexos').upload(path, file, { contentType: file.type || 'application/octet-stream' });
      if (r.error) throw new Error(r.error.message); return { path: path, nome: file.name };
    },
    async anexoUrl(path) { if (!path) return ''; if (path.indexOf('demo:') === 0) return path.slice(5); var r = await sb.storage.from('q2-anexos').createSignedUrl(path, 600); if (r.error) throw new Error(r.error.message); return r.data.signedUrl; },

    /* ----- registros do dia ----- */
    async equip() { if (demo) return ok(banco().equip.filter(function (e) { return e.ativo; })); return q(sb.from('q2_equipamentos').select('*').eq('ativo', true).order('nome')); },
    async temps(de, ate) { if (demo) return ok(banco().temp.filter(function (t) { return t.dia >= de && t.dia <= ate; })); return q(sb.from('q2_temperaturas').select('*').gte('dia', de).lte('dia', ate).order('criado_em')); },
    async addTemp(t) { t.usuario = st.user ? st.user.nome : ''; if (demo) { var b = banco(); t.id = uid(); t.criado_em = new Date().toISOString(); b.temp.push(t); sv(b); return t; } return q(sb.from('q2_temperaturas').insert(t).select().single()); },

    /* ----- formulários preenchidos (q2_registros) ----- */
    async registrosResumo() {
      if (demo) return (banco().regs || []).map(function (r) { var x = Object.assign({}, r); delete x.dados; return x; });
      try {
        var out = [], de = 0, passo = 1000;
        for (;;) { var r = await sb.from('q2_registros').select('id,origem,form,titulo,unidade,periodo,dia,item,usuario').order('id', { ascending: false }).range(de, de + passo - 1); if (r.error) throw r.error; out = out.concat(r.data); if (r.data.length < passo || out.length >= 40000) break; de += passo; }
        return out;
      } catch (e) { console.warn('[registros]', e.message || e); return []; }
    },
    async registro(id) { if (demo) return (banco().regs || []).filter(function (r) { return r.id === id; })[0] || null; return q(sb.from('q2_registros').select('*').eq('id', id).single()); },
    async registrosChave(chave, de, ate) {
      if (demo) return (banco().regs || []).filter(function (r) { return (/^[A-Z]{2,3} \d{3}$/.test(chave) ? r.form === chave : (r.titulo === chave && !r.form)) && (!de || r.dia >= de) && (!ate || r.dia <= ate); });
      var f = sb.from('q2_registros').select('id,form,titulo,dia,item,usuario,dados');
      f = /^[A-Z]{2,3} \d{3}$/.test(chave) ? f.eq('form', chave) : f.eq('titulo', chave).eq('form', '');
      if (de) f = f.gte('dia', de); if (ate) f = f.lte('dia', ate);
      return q(f.order('dia').limit(5000));
    },

    async pendentesApoio() {
      if (demo) return (banco().regs || []).filter(function (r) { return r.origem === 'CQPendentes'; });
      return q(sb.from('q2_registros').select('*').eq('origem', 'CQPendentes').order('dia'));
    },
    async addRegistros(lista) {
      if (demo) { var b = banco(); b.regs = b.regs || []; lista.forEach(function (r) { r.id = b.regs.reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0) + 1; b.regs.push(r); }); sv(b); return; }
      for (var k = 0; k < lista.length; k += 50) await q(sb.from('q2_registros').insert(lista.slice(k, k + 50)));
    },
    async updRegistro(id, patch) {
      if (demo) { var b = banco(), i = (b.regs || []).findIndex(function (x) { return x.id === id; }); if (i >= 0) b.regs[i] = Object.assign(b.regs[i], patch); sv(b); return; }
      return q(sb.from('q2_registros').update(patch).eq('id', id));
    },

    /* ----- usuários ----- */
    async perfis() { if (demo) return ok([{ id: 'demo', nome: st.user.nome, email: 'demo@local', papel: st.user.papel, ativo: true }]); return q(sb.from('q2_perfis').select('*').order('nome')); },
    async savePerfil(p) { if (demo) return p; return q(sb.from('q2_perfis').update({ nome: p.nome, papel: p.papel, ativo: p.ativo }).eq('id', p.id)); },
    async log(acao, detalhe) { try { if (demo) return; await sb.from('q2_log').insert({ usuario: st.user ? st.user.nome : '', acao: acao, detalhe: detalhe || '' }); } catch (e) { } },
    resetDemo() { localStorage.removeItem(KEY); }
  };
  window.DB = DB; window.uid = uid;
})();
