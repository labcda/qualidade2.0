-- Qualidade 2.0 · assinaturas cadastradas (aparecem nos documentos e nos formulários)
-- Rode uma vez no SQL Editor do Supabase.
create table if not exists q2_assinaturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cargo text default '',
  registro text default '',
  imagem text not null,                  -- imagem PNG em data URL (redimensionada no navegador)
  ativo boolean not null default true,
  atualizado_por text default '',
  atualizado_em timestamptz not null default now()
);
alter table q2_assinaturas enable row level security;
drop policy if exists "q2_assinaturas_ler" on q2_assinaturas;
create policy "q2_assinaturas_ler" on q2_assinaturas for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_assinaturas_esc" on q2_assinaturas;
create policy "q2_assinaturas_esc" on q2_assinaturas for all to authenticated
  using (q2_papel() in ('admin','aprova')) with check (q2_papel() in ('admin','aprova'));
