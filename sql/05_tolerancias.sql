-- =====================================================================
-- Qualidade 2.0 — parte 5: TOLERÂNCIA POR ANALITO (controle analítico)
-- Supabase > SQL Editor > New query > cole tudo > Run.  Pode rodar mais de uma vez (não apaga o que você já editou).
--
-- Cada analito tem um limite de variação: percentual e/ou valor absoluto (vale o que for MAIOR, como no CLIA).
-- Sem linha na tabela, o analito usa ±10% (padrão). Só admin e RT (perfil "aprova") alteram.
-- Os valores iniciais abaixo são os do CLIA (regra final de 2022, em vigor desde 2024) confirmados em fontes secundárias:
-- o RT deve conferir e aprovar. Ureia, CPK e bilirrubina direta ficam de fora até o RT definir.
-- =====================================================================

create table if not exists q2_tolerancias (
  chave text primary key,                    -- nome do analito sem acento e em minúsculas
  analito text not null,
  percentual numeric not null default 10,
  absoluto numeric,                          -- opcional: diferença absoluta aceita (na unidade abaixo)
  unidade text not null default '',
  fonte text not null default '',
  atualizado_por text not null default '',
  atualizado_em timestamptz not null default now()
);
alter table q2_tolerancias enable row level security;
drop policy if exists "q2_tolerancias_ler" on q2_tolerancias;
create policy "q2_tolerancias_ler" on q2_tolerancias for select to authenticated using (q2_papel() is not null);
drop policy if exists "q2_tolerancias_esc" on q2_tolerancias;
create policy "q2_tolerancias_esc" on q2_tolerancias for all to authenticated using (q2_papel() in ('admin','aprova')) with check (q2_papel() in ('admin','aprova'));

insert into q2_tolerancias (chave, analito, percentual, absoluto, unidade, fonte, atualizado_por) values
  ('glicose', 'Glicose', 8, 6, 'mg/dL', 'CLIA 2024 · conferir com o RT', 'valor inicial'),
  ('colesterol', 'Colesterol', 10, null, '', 'CLIA 2024 · conferir com o RT', 'valor inicial'),
  ('triglicerideos', 'Triglicerídeos', 15, null, '', 'CLIA 2024 · conferir com o RT', 'valor inicial'),
  ('acido urico', 'Ácido úrico', 10, null, '', 'CLIA 2024 · conferir com o RT', 'valor inicial'),
  ('creatinina', 'Creatinina', 10, 0.2, 'mg/dL', 'CLIA 2024 · conferir com o RT', 'valor inicial'),
  ('tgo', 'TGO', 15, 6, 'U/L', 'CLIA 2024 (AST) · conferir com o RT', 'valor inicial'),
  ('tgp', 'TGP', 15, 6, 'U/L', 'CLIA 2024 (ALT) · conferir com o RT', 'valor inicial'),
  ('bilirrubina total', 'Bilirrubina total', 20, 0.4, 'mg/dL', 'CLIA 2024 · conferir com o RT', 'valor inicial'),
  ('gama gt', 'Gama GT', 15, 5, 'U/L', 'CLIA 2024 · conferir com o RT', 'valor inicial')
on conflict (chave) do nothing;

select analito, percentual, absoluto, unidade from q2_tolerancias order by analito;
