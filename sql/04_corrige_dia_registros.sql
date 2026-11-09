-- =====================================================================
-- Qualidade 2.0 — parte 4: corrige o DIA dos formulários copiados (rode DEPOIS do 02 e do 03)
-- Supabase > SQL Editor > New query > cole tudo > Run.  Pode rodar mais de uma vez.
--
-- Nos formulários mensais da Qualidade anterior o "período" é o mês (AAAA-MM) e o dia do lançamento fica em "chave".
-- A cópia anterior usou o 1º dia do mês. Este arquivo acerta o dia de cada registro e guarda a chave original.
-- =====================================================================

update q2_registros r set
  periodo = coalesce(nullif(l.dados->>'periodo', ''), r.periodo),
  dia = case
    when coalesce(l.dados->>'periodo', '') ~ '^\d{4}-\d{2}$' and coalesce(l.dados->>'chave', '') ~ '^\d{1,2}$' and (l.dados->>'chave')::int between 1 and 31
      then least(((l.dados->>'periodo') || '-01')::date + ((l.dados->>'chave')::int - 1),
                 (date_trunc('month', ((l.dados->>'periodo') || '-01')::date) + interval '1 month - 1 day')::date)
    else r.dia end,
  dados = r.dados || jsonb_build_object('_chave', coalesce(l.dados->>'chave', ''))
from public.qual_linhas l
where r.origem = 'Registros' and r.origem_id = l.id;

-- conferência: formulário, item, dia e quem registrou
select form, item, dia, usuario from q2_registros where origem = 'Registros' order by dia desc, form limit 40;
