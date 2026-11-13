/* Formulários criados direto no sistema (sem modelo em papel) */
window.Q2_FORMS = (window.Q2_FORMS || []).filter(function (f) { return f.c !== 'FR 044'; }).concat([
  {
    c: 'FR 087', t: 'Termo de Nomeação do Núcleo de Segurança do Paciente (NSP)', cat: 'Segurança do paciente e ocorrências', modo: 'evento',
    aviso: 'Ato de nomeação do NSP (RDC ANVISA 36/2013; PQ 032 e PQ 067). A Diretoria indica os membros e o Coordenador. Atribuições: promover e apoiar ações de segurança do paciente; implantar o Plano de Segurança do Paciente (PQ 033) e monitorar seus indicadores; analisar as notificações de incidentes e eventos adversos (PQ 014), decidir sobre a notificação no NOTIVISA e acompanhar as ações; difundir a cultura de segurança e promover capacitações; manter as atas das reuniões (FR 023). A assinatura cadastrada de cada nomeado e da Diretoria sai no registro quando o nome é escolhido nos campos.',
    campos: [
      { id: 'data', label: 'Data da nomeação', tipo: 'data', obrig: 1 },
      { id: 'tipo', label: 'Tipo do ato', tipo: 'select', opcoes: ['Nomeação inicial', 'Renovação', 'Substituição de membro', 'Alteração da composição'], obrig: 1 },
      { id: 'vigencia_ini', label: 'Início da vigência', tipo: 'data', obrig: 1 },
      { id: 'vigencia_fim', label: 'Fim da vigência (opcional)', tipo: 'data' },
      { id: 'diretor', label: 'Diretor responsável pela nomeação', tipo: 'texto', obrig: 1 },
      { id: 'coord', label: 'Coordenador do NSP', tipo: 'texto', obrig: 1 },
      { id: 's_membros', label: 'Membros nomeados', tipo: 'secao' },
      {
        id: 'membros', label: 'Membros do NSP (inclua o Coordenador)', tipo: 'tabela', n: 4,
        colunas: [
          { id: 'nome', label: 'Nome', tipo: 'texto' },
          { id: 'funcao', label: 'Função no NSP', tipo: 'select', opcoes: ['Coordenador', 'Coordenador substituto', 'Membro', 'Responsável pela notificação no NOTIVISA'] },
          { id: 'setor', label: 'Setor que representa', tipo: 'texto' },
          { id: 'cargo', label: 'Cargo', tipo: 'texto' }
        ],
        linhas: []
      },
      { id: 'ata', label: 'Ata de reunião em que foi indicado (FR 023, data)', tipo: 'texto' },
      { id: 'ciencia', label: 'Nomeados que dão ciência e aceite (escolha os colaboradores)', tipo: 'textarea', obrig: 1 },
      { id: 'obs', label: 'Observações', tipo: 'textarea' }
    ]
  }
  ,{
    c: 'FR 044', t: 'Análise do Perfil de Atendimento', cat: 'Relatórios gerenciais', modo: 'evento',
    aviso: 'Análise semestral do perfil de atendimento (PQ 034). Preencha os números do período nas tabelas: o sistema calcula os percentuais, desenha os gráficos e compara com o semestre anterior no registro e no relatório. Sexo e faixa etária vêm do relatório do sistema do laboratório.',
    campos: [
      { id: 'data_ini', label: 'Data início', tipo: 'data', obrig: 1 },
      { id: 'data', label: 'Data final', tipo: 'data', obrig: 1 },
      { id: 'total_atend', label: 'Total de atendimentos no período', tipo: 'numero', obrig: 1 },
      { id: 'total_exames', label: 'Total de exames realizados no período', tipo: 'numero' },
      { id: 's_top10', label: 'Top 10 exames realizados', tipo: 'secao' },
      { id: 'top10', label: 'Top 10 exames', tipo: 'tabela', n: 10, colunas: [{ id: 'exame', label: 'Exame', tipo: 'texto' }, { id: 'qtd', label: 'Quantidade', tipo: 'texto' }], linhas: [] },
      { id: 's_unidade', label: 'Atendimento por unidade', tipo: 'secao' },
      { id: 'unidades', label: 'Atendimentos por unidade', tipo: 'tabela', n: 0, colunas: [{ id: 'un', label: 'Unidade', tipo: 'texto' }, { id: 'qtd', label: 'Atendimentos', tipo: 'texto' }], linhas: [['Matriz', ''], ['Mata Fria', '']] },
      { id: 's_convenio', label: 'Atendimento por convênio', tipo: 'secao' },
      { id: 'convenios', label: 'Atendimentos por convênio', tipo: 'tabela', n: 3, colunas: [{ id: 'cv', label: 'Convênio', tipo: 'texto' }, { id: 'qtd', label: 'Atendimentos', tipo: 'texto' }], linhas: [['Particular', ''], ['Unimed', ''], ['Outros convênios', '']] },
      { id: 's_sexo', label: 'Atendimento por sexo e faixa etária', tipo: 'secao' },
      { id: 'faixas', label: 'Pacientes por sexo e faixa etária', tipo: 'tabela', n: 0, colunas: [{ id: 'fx', label: 'Faixa etária', tipo: 'texto' }, { id: 'f', label: 'Feminino', tipo: 'texto' }, { id: 'm', label: 'Masculino', tipo: 'texto' }], linhas: [['0 a 12 anos', '', ''], ['13 a 17 anos', '', ''], ['18 a 39 anos', '', ''], ['40 a 59 anos', '', ''], ['60 anos ou mais', '', '']] },
      { id: 's_secao', label: 'Seção por atendimento', tipo: 'secao' },
      { id: 'secoes', label: 'Exames por seção', tipo: 'tabela', n: 0, colunas: [{ id: 'sc', label: 'Seção', tipo: 'texto' }, { id: 'qtd', label: 'Exames', tipo: 'texto' }], linhas: [['Hematologia', ''], ['Bioquímica', ''], ['Imunologia', ''], ['Hormônios', ''], ['Parasitologia', ''], ['Urinálise', ''], ['Microbiologia', ''], ['Biologia molecular', ''], ['Outras', '']] },
      { id: 's_analise', label: 'Análise crítica', tipo: 'secao' },
      { id: 'achados', label: 'Principais achados (o que mudou, o que chama atenção)', tipo: 'textarea' },
      { id: 'metas', label: 'Metas definidas para o próximo semestre', tipo: 'textarea' },
      { id: 'acoes', label: 'Plano de ação', tipo: 'tabela', n: 3, colunas: [{ id: 'o', label: 'O que será feito', tipo: 'texto' }, { id: 'q', label: 'Quem', tipo: 'texto' }, { id: 'd', label: 'Até quando', tipo: 'data' }], linhas: [] },
      { id: 'final', label: 'Relatório final (análise crítica)', tipo: 'textarea', obrig: 1 },
      { id: 'nsp', label: 'Resultado repassado ao Núcleo de Segurança do Paciente?', tipo: 'select', opcoes: ['Sim', 'Não'] },
      { id: 'nsp_data', label: 'Data do repasse ao NSP', tipo: 'data' },
      { id: 'diretoria', label: 'Diretor que analisou', tipo: 'texto' }
    ]
  }
]);
