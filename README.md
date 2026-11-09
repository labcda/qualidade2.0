# Qualidade 2.0 · Laboratório CDA

Sistema de gestão da qualidade do CDA, separado do painel ADM. Reúne:

- **Autoavaliação** — os 141 requisitos da autoavaliação (portal Valor Conecta), com resposta, constatação e evidências ligadas a documentos, documentos legais e registros.
- **Documentos** — biblioteca (MQ, PQ, ITA, FR, DC, L) lida e impressa dentro do sistema, no papel timbrado turquesa; versões, histórico, revisão e aprovação do RT.
- **Documentos legais** — licença sanitária, alvará, CNES, AVCB, contratos… com número, validade, anexo e aviso de vencimento.
- **Registros do dia** — temperaturas (primeira rotina migrada).
- **Relatório** — comprovação de cada requisito, pronto para imprimir ou salvar em PDF.

## Como colocar no ar

1. **Banco:** no Supabase (SQL Editor) rode `sql/01_base.sql` uma vez.
2. **Chave:** em `js/config.js`, cole a *anon / publishable key* (Project Settings → API) em `SUPABASE_ANON_KEY`. Enquanto vazia, o sistema abre em **modo demonstração** (dados só no navegador).
3. **Hospedagem:** Cloudflare Pages ligado a este repositório (sem build; pasta raiz `/`).
4. **Primeiro acesso:** abra o site → *Criar conta*. O primeiro usuário vira administrador. Depois, em *Ajustes → Usuários*, libere os perfis (elabora, revisa, aprova, consulta).
5. **Conteúdo inicial:** na tela Início, clique em *Carregar biblioteca inicial* (180 documentos + autoavaliação de 06/11/2026).

## Estrutura

```
index.html          shell
css/app.css         visual (vidro turquesa)   css/print.css   impressão A4 timbrada
js/config.js        URL e chave do Supabase    js/db.js        dados (Supabase ou demonstração)
js/md.js            texto → HTML e papel timbrado   js/app.js   telas
data/requisitos.js  catálogo dos 141 requisitos
data/biblioteca.js  163 documentos extraídos dos .docx de 10/2026
data/novos.js       documentos novos para a Unimed (PQ 064–070, FR 077–086)
tools/extrair-docx.ps1  regenera data/biblioteca.js a partir da pasta do Drive
sql/01_base.sql     tabelas, regras de acesso (RLS) e anexos
```

Todos os documentos novos entram como **rascunho**; só o RT (perfil *aprova*) publica como vigente.

## Formulários preenchidos
Rode `sql/02_registros_migracao_v2.sql` no Supabase para copiar os registros da Qualidade anterior (formulários FR, controle analítico, checklists, tarefas, manutenções, ordens de serviço, calibrações, proficiências, contingência, fechamentos) e as temperaturas. Eles aparecem no menu **Formulários preenchidos**, comprovam os requisitos automaticamente e têm relatório imprimível. Abra o site com `?demo` para testar sem login.
