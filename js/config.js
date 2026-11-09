/* Configuração do Qualidade 2.0.
   Cole a "anon / publishable key" em SUPABASE_ANON_KEY (Supabase → Project Settings → API).
   Enquanto estiver vazia, o sistema abre em MODO DEMONSTRAÇÃO (dados só neste navegador). */
window.Q2_CONFIG = {
  SUPABASE_URL: 'https://ajwtskohneeqraytgmvh.supabase.co',
  SUPABASE_ANON_KEY: (location.search.indexOf('demo') >= 0 ? '' : 'sb_publishable_MDZcar8zW9SWX_1cmvTqYQ_tMv52pgL'),   // abrir com ?demo usa o modo demonstração (dados só no navegador)
  LAB: { nome: 'Laboratório CDA', sub: 'Análises Clínicas', fone: '(27) 3735-1546', whats: '(27) 99898-0658', email: 'contato@laboratoriocda.com.br', endereco: 'Atualize o endereço em js/config.js', site: 'laboratoriocda.com.br' }
};
