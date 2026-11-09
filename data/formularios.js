/* Formulários de rotina DIÁRIA (os mesmos da Qualidade anterior: campos, faixas e unidades). Cada item = um cartão em "O que preencher hoje".
   tipo do campo: check (marcou / não marcou), numero (com faixa min/max: fora da faixa exige observação), texto. */
window.Q2_ROTINA = [
  { form: 'FR 010', t: 'Controle de temperatura e umidade · Área Técnica', unidade: 'Matriz', item: 'Área Técnica', aviso: 'Temperatura 18 a 24 °C; umidade relativa 40 a 80 %. Fora da faixa: descreva a ação nas observações.',
    cols: [{ id: 'tmin', label: 'Temp. mín (°C)', tipo: 'numero', min: 18, max: 24 }, { id: 'tmax', label: 'Temp. máx (°C)', tipo: 'numero', min: 18, max: 24 }, { id: 'umin', label: 'Umid. mín (%)', tipo: 'numero', min: 40, max: 80 }, { id: 'umax', label: 'Umid. máx (%)', tipo: 'numero', min: 40, max: 80 }, { id: 'obs', label: 'Observações / ação', tipo: 'texto' }] },
  { form: 'FR 004', t: 'Limpeza das centrífugas', unidade: 'Matriz', item: 'Área Técnica',
    cols: [{ id: 'alcool', label: 'Álcool 70% (diária)', tipo: 'check' }, { id: 'cacapas', label: 'Caçapas c/ álcool 70% (semanal)', tipo: 'check' }, { id: 'obs', label: 'Obs.', tipo: 'texto' }] },
  { form: 'FR 005', t: 'Limpeza de pias e bancadas', unidade: 'Matriz', item: 'Área Técnica',
    cols: [{ id: 'alcool', label: 'Álcool 70%', tipo: 'check' }, { id: 'organizar', label: 'Organizar', tipo: 'check' }, { id: 'arear', label: 'Arear pia', tipo: 'check' }, { id: 'hipoclorito', label: 'Hipoclorito 1% bancadas (semanal)', tipo: 'check' }, { id: 'obs', label: 'Obs.', tipo: 'texto' }] },
  { form: 'FR 034', t: 'Limpeza de equipamentos · A15', unidade: 'Matriz', item: 'A15',
    cols: [{ id: 'externa', label: 'Limpeza externa', tipo: 'check' }, { id: 'final', label: 'Limpeza - final de expediente', tipo: 'check' }, { id: 'concentrada', label: 'Limpeza concentrada quinzenal', tipo: 'check' }, { id: 'obs', label: 'Obs.', tipo: 'texto' }] },
  { form: 'FR 035', t: 'Limpeza de equipamentos · KX', unidade: 'Matriz', item: 'KX',
    cols: [{ id: 'externa', label: 'Limpeza externa', tipo: 'check' }, { id: 'final', label: 'Limpeza - final de expediente', tipo: 'check' }, { id: 'concentrada', label: 'Limpeza concentrada quinzenal', tipo: 'check' }, { id: 'obs', label: 'Obs.', tipo: 'texto' }] },
  { form: 'FR 049', t: 'Limpeza e degelo da geladeira · Matriz', unidade: 'Matriz', item: 'Geladeira Matriz',
    cols: [{ id: 'alcool', label: 'Álcool 70% (diária)', tipo: 'check' }, { id: 'degelo', label: 'Degelo e limpeza (mensal)', tipo: 'check' }, { id: 'obs', label: 'Obs.', tipo: 'texto' }] },
  { form: 'FR 049', t: 'Limpeza e degelo da geladeira · Mata Fria', unidade: 'Mata Fria', item: 'Geladeira Mata Fria',
    cols: [{ id: 'alcool', label: 'Álcool 70% (diária)', tipo: 'check' }, { id: 'degelo', label: 'Degelo e limpeza (mensal)', tipo: 'check' }, { id: 'obs', label: 'Obs.', tipo: 'texto' }] }
];
