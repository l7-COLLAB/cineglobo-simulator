/**
 * Fluxo de turno exclusivamente demonstrativo.
 * Metas avançam somente por eventos de interações do jogo: nada de marcar
 * checklist sem conferir o estado da simulação. Não avalia trabalho real.
 */
export const SHIFT_GOALS={
 caixa:{
  abertura:[
   {id:'pos',event:'pos-opened',title:'Abrir o computador do caixa'},
   {id:'printer',event:'printer-checked',title:'Conferir mini impressora'},
   {id:'catalogue',event:'catalogue-checked',title:'Verificar catálogo de sessões'}
  ],
  atendimento:[
   {id:'served',event:'sale-delivered',title:'Atender e entregar ingressos corretos ao cliente'}
  ],
  fechamento:[
   {id:'audit',event:'receipt-audited',title:'Conferir os bilhetes emitidos no relatório fictício'},
   {id:'posclosed',event:'pos-shutdown',title:'Encerrar terminal de caixa do turno'}
  ]
 },
 bomboniere:{
  abertura:[
   {id:'epi',event:'epi-verified',title:'Vestir e conferir os EPIs'},
   {id:'stock',event:'stock-inspected',title:'Inspecionar os recipientes de insumos na estação'}
  ],
  atendimento:[
   {id:'salted',event:'salted-ready',title:'Preparar uma batelada salgada na máquina correta'},
   {id:'sweet',event:'sweet-ready',title:'Preparar uma batelada doce com chocolate em pó'},
   {id:'mixed',event:'mixed-ready',title:'Montar o balde misto na sequência correta'}
  ],
  fechamento:[
   {id:'motors',event:'motors-checked',title:'Confirmar misturadores desligados'},
   {id:'station',event:'station-inspected',title:'Inspecionar bancada e resíduos visuais'}
  ]
 },
 sala:{
  abertura:[
   {id:'doors',event:'doors-checked',title:'Conferir portas de acesso à sala'},
   {id:'reception',event:'reception-opened',title:'Iniciar recepção pelo painel de iluminação'}
  ],
  atendimento:[
   {id:'scan',event:'ticket-approved',title:'Validar ingresso da sessão correta no leitor'},
   {id:'routine',event:'room-completed',title:'Concluir filme e inspeções da sala'}
  ],
  fechamento:[
   {id:'lighting',event:'lights-checked',title:'Conferir iluminação de limpeza após a sessão'},
   {id:'exit',event:'exit-inspected',title:'Inspecionar saída e concluir o turno'}
  ]
 }
};
export const SHIFT_PHASES=['abertura','atendimento','fechamento'];
export const MAX_SHIFT_ERRORS=25;
export function createShift(role,city){
 if(!SHIFT_GOALS[role])throw new Error('Função de turno inválida.');
 return {role,city,started:false,completed:false,phase:'aguardando',events:[],errors:[],attempts:{},helpRequests:0,errorCount:0,revision:2};
}
export function getShiftGoals(state){
 if(!state||!SHIFT_GOALS[state.role])return [];
 return SHIFT_PHASES.flatMap(phase=>SHIFT_GOALS[state.role][phase].map(g=>({...g,phase,done:state.events.includes(g.event)})));
}
export function nextShiftGoal(state){
 return getShiftGoals(state).find(g=>!g.done)||null;
}
function phaseFrom(state){
 if(SHIFT_PHASES.every(phase=>SHIFT_GOALS[state.role][phase].every(g=>state.events.includes(g.event))))return 'concluido';
 for(const phase of SHIFT_PHASES){
  if(SHIFT_GOALS[state.role][phase].some(g=>!state.events.includes(g.event)))return phase;
 }
 return 'concluido';
}
export function beginShift(state){
 if(!state||!SHIFT_GOALS[state.role])throw new Error('Estado inválido.');
 if(state.started&&!state.completed)return {state,error:'O turno já está aberto.'};
 return {state:createStartedShift(state.role,state.city),error:null};
}
function createStartedShift(role,city){return {...createShift(role,city),started:true,phase:'abertura'};}
export function recordShiftEvent(state,event){
 if(!state?.started||state.completed)return {state,changed:false};
 const pending=SHIFT_GOALS[state.role][state.phase]||[];
 if(!pending.some(g=>g.event===event)||state.events.includes(event))return {state,changed:false};
 const events=[...state.events,event];
 const counts=state.attempts?.[event]||{success:0,errors:0};
 const attempts={...(state.attempts||{}),[event]:{success:counts.success+1,errors:counts.errors}};
 const updated={...state,events,attempts};
 updated.phase=phaseFrom(updated);
 updated.completed=updated.phase==='concluido';
 return {state:updated,changed:true};
}
export function recordShiftError(state,source,message){
 if(!state?.started||state.completed)return state;
 const cleanSource=String(source||'Operação').slice(0,45);
 const cleanMessage=String(message||'Ação inválida').replace(/\d{11}/g,'[dado ocultado]').slice(0,180);
 const goal=nextShiftGoal(state);
 const current=goal?(state.attempts?.[goal.event]||{success:0,errors:0}):null;
 const attempts=goal?{...(state.attempts||{}),[goal.event]:{success:current.success,errors:current.errors+1}}:(state.attempts||{});
 const errors=[...state.errors,{source:cleanSource,message:cleanMessage,step:state.events.length+1,goalId:goal?.id||null}].slice(-MAX_SHIFT_ERRORS);
 return {...state,errors,attempts,errorCount:Math.min(10000,(state.errorCount??state.errors.length)+1)};
}
export function shiftProgress(state){
 const all=getShiftGoals(state);
 const attempts=Object.values(state?.attempts||{}).reduce((total,a)=>total+Number(a.success||0)+Number(a.errors||0),0);
 return {done:all.filter(g=>g.done).length,total:all.length,errors:state?.errors?.length||0,totalErrors:state?.errorCount??state?.errors?.length??0,attempts,helpRequests:state?.helpRequests||0,phase:state?.phase||'aguardando'};
}
/**
 * Avaliação ilustrativa baseada apenas em metas/erros capturados localmente.
 * Não certifica aptidão. Meta obrigatória incompleta = exercício pendente.
 */
export function assessShift(state){
 const goals=getShiftGoals(state);
 const done=goals.filter(g=>g.done).length,total=goals.length;
 const errors=state?.errorCount??state?.errors?.length??0;
 const attemptedActions=Object.values(state?.attempts||{}).reduce((n,a)=>n+Number(a.success||0)+Number(a.errors||0),0);
 const helpRequests=state?.helpRequests||0;
 const completionPercent=total?Math.round(done/total*100):0;
 const score=Math.max(0,Math.min(100,100-errors*5));
 const finished=Boolean(state?.started&&state?.completed&&done===total);
 const label=!finished?'Em andamento':score>=90?'Concluído · poucos erros':score>=75?'Concluído · revisar ocorrências':'Concluído · repetir exercício recomendado';
 return {
  role:state?.role||'',city:state?.city||'',finished,done,total,completionPercent,
  errors,score,label,attemptedActions,successfulActions:done,failedAttempts:Math.max(0,attemptedActions-done),helpRequests,retryRecommended:finished&&errors>=5,
  isCertification:false,officialTrainingApproved:false
 };
}
export function makeShiftReport(state){
 const assessment=assessShift(state);
 if(!assessment.finished)return null;
 return {kind:'cineglobo-demo-shift-report',role:state.role,city:state.city,
  achievements:getShiftGoals(state).map(g=>({id:g.id,phase:g.phase,done:g.done})),
  errors:state.errors.map(e=>({...e})),assessment,completed:true,revision:state.revision};
}

/**
 * Ajuda solicitada pelo aluno. É registrada apenas no exercício ativo.
 * Não desconta pontos: pedir ajuda é comportamento desejável no treinamento.
 */
export function recordShiftHelp(state){
 if(!state?.started||state.completed)return state;
 return {...state,helpRequests:Math.min(10000,(state.helpRequests||0)+1)};
}

/**
 * Guias para treinamento demonstrativo. Não correspondem a procedimentos
 * institucionais homologados nem substituem manuais de equipamento.
 */
const GUIDANCE={
 'pos-opened':['Acesse o computador de treinamento pelo lado do operador.','O aluno precisa reconhecer o posto certo antes de vender.','Volte ao computador do caixa, aproxime-se e use E ou AGIR.'],
 'printer-checked':['Interaja com a mini impressora indicada ao lado do monitor.','Conferir os periféricos evita interromper o atendimento virtual.','Procure a mini impressora no balcão; um clique no terminal não substitui a interação.'],
 'catalogue-checked':['Confira a televisão de programação no setor de caixa.','O pedido depende de escolher uma sessão disponível na simulação.','Verifique filme, horário e formato na programação fictícia.'],
 'sale-delivered':['Chame um cliente, confirme filme, horário, formato, quantidade e categoria; escolha lugares juntos, confira o pagamento, emita e entregue os ingressos pela animação.','O ciclo só termina quando o pedido correto é entregue, não apenas quando o botão de venda é pressionado.','Se a venda falhar, confira novamente o pedido e as poltronas; retorne à etapa anterior e repita a entrega.'],
 'receipt-audited':['Abra o terminal do turno e confira os ingressos fictícios emitidos e entregues.','A conferência final vincula o atendimento ao encerramento do exercício.','Se o relatório estiver indisponível, conclua primeiro uma entrega válida ao cliente virtual.'],
 'pos-shutdown':['Encerre o computador pelo terminal do setor após conferir os comprovantes.','O fechamento só deve ocorrer depois do atendimento e da conferência.','Volte à conferência dos bilhetes e só então conclua o terminal.'],
 'epi-verified':['Na bancada de EPIs, interaja com os itens exigidos pelo exercício e confirme o preparo.','A simulação exige reconhecer os equipamentos de proteção antes da operação virtual.','Confira os itens pendentes no painel; requisitos reais dependem de validação da empresa.'],
 'stock-inspected':['Inspecione os recipientes de insumos pelo objeto 3D da estação.','O aluno deve identificar os insumos virtuais antes de iniciar as máquinas.','Aproxime-se dos recipientes até aparecer o botão AGIR.'],
 'salted-ready':['Execute as etapas apresentadas na pipoqueira salgada simulada.','As etapas são avaliadas como regras do jogo, não como receita oficial.','Use as mensagens da máquina para corrigir a sequência; o momento do sal não é pontuado sem validação.'],
 'sweet-ready':['Utilize a pipoqueira doce virtual e os ingredientes indicados no exercício.','Cada máquina possui um ciclo separado, evitando aprovação por ações em outro equipamento.','Reinicie a batelada virtual se necessário; não reproduza parâmetros térmicos reais a partir do jogo.'],
 'mixed-ready':['Interaja com o balde misto e siga a sequência visual do exercício.','O progresso depende de concluir os dois sabores e montar o balde.','Confirme que as duas bateladas simuladas foram concluídas e repita a ordem apresentada.'],
 'motors-checked':['No terminal, confira os dois misturadores depois de concluir as bateladas.','O encerramento exige verificar o estado dos equipamentos simulados.','Se alguma máquina estiver ativa, conclua o ciclo virtual antes de tentar novamente.'],
 'station-inspected':['Interaja com a bancada de finalização após conferir as máquinas.','O jogo avalia apenas inspeção visual, não limpeza técnica real.','Procure o ponto de inspeção da bancada; não utilize produtos químicos por instrução do simulador.'],
 'doors-checked':['Aproxime-se da porta da sala e utilize o comando de interação.','O acesso à sala depende de reconhecer o percurso e seus controles.','Ajuste sua posição perto da porta; não é possível agir através de uma parede.'],
 'reception-opened':['No painel da sala, selecione o início da recepção.','As luzes de recepção antecedem a etapa de validação do ingresso virtual.','Escolha uma sessão da mesma sala antes de iniciar o exercício.'],
 'ticket-approved':['Valide um bilhete fictício ainda não utilizado, compatível com sessão, formato e sala.','O controle impede entrada com ingresso incorreto ou reutilizado.','Releia os dados do ingresso; tente o código de demonstração correto, sem inserir CPF real.'],
 'room-completed':['Conclua o filme no painel e realize as inspeções visuais da sala.','A missão exige estados observáveis antes de considerar a sala pronta.','Volte ao painel e confira as etapas pendentes; não há procedimento de limpeza real homologado.'],
 'lights-checked':['No terminal, confira a iluminação de limpeza da sala concluída.','O estado visual da sala deve corresponder ao exercício de fechamento.','Finalize a rotina e confirme o modo de iluminação no painel correto.'],
 'exit-inspected':['Aproxime-se do ponto de inspeção da saída da sala.','O percurso de fechamento precisa terminar com uma conferência visual.','Se AGIR não aparecer, chegue perto do ponto de saída e confira a etapa anterior.']
};
export function getShiftGuidance(state){
 if(!state?.started)return {event:null,title:'Iniciar treinamento',how:'Escolha uma função e inicie o turno no terminal 3D do setor.',why:'O exercício só registra metas após seu início.',correction:'Aproxime-se do terminal do seu setor e toque em Iniciar abertura.'};
 const goal=nextShiftGoal(state);
 if(!goal)return {event:null,title:'Exercício finalizado',how:'Abra o terminal do setor para revisar o relatório ilustrativo.',why:'Todas as metas verificáveis deste exercício estão concluídas.',correction:'Para praticar novamente, inicie outro turno sem usar dados reais.'};
 const [how,why,correction]=GUIDANCE[goal.event]||['Interaja com o equipamento indicado.','Esta meta depende de uma ação executada no jogo.','Revise a etapa atual antes de tentar novamente.'];
 return {event:goal.event,title:goal.title,how,why,correction};
}
