/* Formulários criados direto no sistema (sem modelo em papel) */
window.Q2_FORMS = (window.Q2_FORMS || []).concat([
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
]);
