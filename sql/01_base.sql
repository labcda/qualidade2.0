-- Qualidade 2.0 · CDA — estrutura do banco (rode UMA vez no SQL Editor do Supabase)
-- Tabelas separadas do painel (prefixo q2_). Login pelo Supabase Auth (e-mail e senha).

create extension if not exists pgcrypto;

-- ---------- perfis ----------
create table if not exists q2_perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text default '',
  papel text not null default 'consulta' check (papel in ('admin','elabora','revisa','aprova','consulta')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- o primeiro usuário que se cadastra vira administrador; os demais entram como "consulta" até o admin ajustar
create or replace function q2_novo_usuario() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into q2_perfis (id, nome, email, papel)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)), new.email,
          case when (select count(*) from q2_perfis) = 0 then 'admin' else 'consulta' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists q2_on_auth_user on auth.users;
create trigger q2_on_auth_user after insert on auth.users for each row execute function q2_novo_usuario();

-- papel de quem está logado (usado nas regras de acesso)
create or replace function q2_papel() returns text language sql stable security definer set search_path = public as $$
  select papel from q2_perfis where id = auth.uid() and ativo
$$;

-- ---------- documentos ----------
create table if not exists q2_documentos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  titulo text not null,
  tipo text not null default 'PQ',
  unidade text not null default 'Matriz',
  versao text not null default '1',
  status text not null default 'rascunho' check (status in ('rascunho','em_revisao','vigente','obsoleto')),
  texto text not null default '',
  elaborador text default '', revisor text default '', aprovador text default '',
  data_elaboracao date, data_revisao date, data_vigencia date, proxima_revisao date,
  origem text default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists q2_documentos_codigo_idx on q2_documentos (codigo, titulo, unidade);

create table if not exists q2_doc_versoes (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references q2_documentos(id) on delete cascade,
  versao text not null, status text, texto text, autor text default '', motivo text default '',
  criado_em timestamptz not null default now()
);

-- ---------- programa Unimed ----------
create table if not exists q2_respostas (
  codigo text primary key,                 -- ex.: 2.4.12
  resposta text not null default 'N' check (resposta in ('A','P','N','NA')),
  constatacao text default '',
  futuro boolean not null default false,
  atualizado_por text default '',
  atualizado_em timestamptz not null default now()
);
create table if not exists q2_evidencias (
  id uuid primary key default gen_random_uuid(),
  req_codigo text not null,
  tipo text not null check (tipo in ('documento','legal','registro','link','nota')),
  ref text not null default '',            -- código do documento, id do legal, rota do registro ou endereço
  nota text default '',
  criado_por text default '',
  criado_em timestamptz not null default now()
);
create index if not exists q2_evidencias_req_idx on q2_evidencias (req_codigo);

-- ---------- documentos legais ----------
create table if not exists q2_legais (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'outro',
  descricao text not null default '',
  numero text default '', orgao text default '',
  emissao date, validade date,
  arquivo_path text default '', arquivo_nome text default '',
  obs text default '',
  ativo boolean not null default true,
  atualizado_em timestamptz not null default now()
);

-- ---------- registros do dia a dia ----------
create table if not exists q2_equipamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null, tipo text default 'geladeira', local text default '',
  minimo numeric, maximo numeric, ativo boolean not null default true
);
create table if not exists q2_temperaturas (
  id uuid primary key default gen_random_uuid(),
  equip_id uuid references q2_equipamentos(id) on delete set null,
  equip_nome text default '',
  dia date not null default current_date,
  turno text default 'manhã',
  valor numeric not null,
  situacao text default 'ok',              -- ok | desvio
  acao text default '',
  usuario text default '',
  criado_em timestamptz not null default now()
);
create index if not exists q2_temp_dia_idx on q2_temperaturas (dia);

create table if not exists q2_log (
  id bigserial primary key, quando timestamptz not null default now(), usuario text default '', acao text default '', detalhe text default ''
);

-- ---------- segurança (RLS) ----------
alter table q2_perfis enable row level security;
alter table q2_documentos enable row level security;
alter table q2_doc_versoes enable row level security;
alter table q2_respostas enable row level security;
alter table q2_evidencias enable row level security;
alter table q2_legais enable row level security;
alter table q2_equipamentos enable row level security;
alter table q2_temperaturas enable row level security;
alter table q2_log enable row level security;

do $$ declare t text; begin
  foreach t in array array['q2_documentos','q2_doc_versoes','q2_respostas','q2_evidencias','q2_legais','q2_equipamentos','q2_temperaturas','q2_log'] loop
    execute format('drop policy if exists "%1$s_ler" on %1$s', t);
    execute format('create policy "%1$s_ler" on %1$s for select to authenticated using (q2_papel() is not null)', t);
  end loop;
  foreach t in array array['q2_documentos','q2_doc_versoes','q2_respostas','q2_evidencias','q2_legais','q2_equipamentos'] loop
    execute format('drop policy if exists "%1$s_esc" on %1$s', t);
    execute format('create policy "%1$s_esc" on %1$s for all to authenticated using (q2_papel() in (''admin'',''elabora'',''revisa'',''aprova'')) with check (q2_papel() in (''admin'',''elabora'',''revisa'',''aprova''))', t);
  end loop;
end $$;
drop policy if exists "q2_temperaturas_esc" on q2_temperaturas;
create policy "q2_temperaturas_esc" on q2_temperaturas for all to authenticated using (q2_papel() in ('admin','elabora','revisa','aprova')) with check (q2_papel() in ('admin','elabora','revisa','aprova'));
drop policy if exists "q2_log_ins" on q2_log;
create policy "q2_log_ins" on q2_log for insert to authenticated with check (q2_papel() is not null);

drop policy if exists "q2_perfis_ler" on q2_perfis;
create policy "q2_perfis_ler" on q2_perfis for select to authenticated using (id = auth.uid() or q2_papel() = 'admin');
drop policy if exists "q2_perfis_admin" on q2_perfis;
create policy "q2_perfis_admin" on q2_perfis for all to authenticated using (q2_papel() = 'admin') with check (q2_papel() = 'admin');

-- ---------- anexos dos documentos legais (PDF/foto) ----------
insert into storage.buckets (id, name, public) values ('q2-anexos', 'q2-anexos', false) on conflict (id) do nothing;
drop policy if exists "q2_anexos_ler" on storage.objects;
create policy "q2_anexos_ler" on storage.objects for select to authenticated using (bucket_id = 'q2-anexos' and q2_papel() is not null);
drop policy if exists "q2_anexos_esc" on storage.objects;
create policy "q2_anexos_esc" on storage.objects for insert to authenticated with check (bucket_id = 'q2-anexos' and q2_papel() in ('admin','elabora','revisa','aprova'));
drop policy if exists "q2_anexos_del" on storage.objects;
create policy "q2_anexos_del" on storage.objects for delete to authenticated using (bucket_id = 'q2-anexos' and q2_papel() in ('admin','elabora','revisa','aprova'));

-- ---------- equipamentos iniciais ----------
insert into q2_equipamentos (nome, tipo, local, minimo, maximo)
select * from (values
  ('Geladeira de reagentes','geladeira','Área técnica',2,8),
  ('Geladeira de amostras','geladeira','Área técnica',2,8),
  ('Freezer','freezer','Área técnica',-25,-15),
  ('Banho-maria','banho-maria','Área técnica',35,39),
  ('Sala técnica (ambiente)','ambiente','Área técnica',18,25)
) v(nome,tipo,local,minimo,maximo)
where not exists (select 1 from q2_equipamentos);

-- Se você já criou seu usuário antes de rodar este arquivo, torne-o administrador assim
-- (troque o e-mail):
-- insert into q2_perfis (id, nome, email, papel) select id, 'Diego', email, 'admin' from auth.users where email = 'drdiegopadua@gmail.com' on conflict (id) do update set papel = 'admin';
