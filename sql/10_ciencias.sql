-- Qualidade 2.0 · ciência (leitura e treinamento) dos colaboradores nos documentos, com a assinatura cadastrada
-- Rode uma vez no SQL Editor do Supabase.
create table if not exists q2_ciencias (
  id uuid primary key default gen_random_uuid(),
  doc_codigo text not null, versao text not null default '1',
  nome text not null, cargo text default '',
  data date not null default current_date,
  registrado_por text default '',
  criado_em timestamptz not null default now(),
  unique (doc_codigo, versao, nome)
);
alter table q2_ciencias enable row level security;
drop policy if exists "q2_ciencias_ler" on q2_ciencias;
create policy "q2_ciencias_ler" on q2_ciencias for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_ciencias_esc" on q2_ciencias;
create policy "q2_ciencias_esc" on q2_ciencias for all to authenticated
  using (q2_papel() in ('admin','elabora','revisa','aprova')) with check (q2_papel() in ('admin','elabora','revisa','aprova'));
