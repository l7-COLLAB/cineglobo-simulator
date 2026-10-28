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
 return {role,city,started:false,completed:false,phase:'aguardando',events:[],errors:[],revision:1};
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
 const updated={...state,events};
 updated.phase=phaseFrom(updated);
 updated.completed=updated.phase==='concluido';
 return {state:updated,changed:true};
}
export function recordShiftError(state,source,message){
 if(!state?.started||state.completed)return state;
 const cleanSource=String(source||'Operação').slice(0,45);
 const cleanMessage=String(message||'Ação inválida').replace(/\d{11}/g,'[dado ocultado]').slice(0,180);
 const errors=[...state.errors,{source:cleanSource,message:cleanMessage,step:state.events.length+1}].slice(-MAX_SHIFT_ERRORS);
 return {...state,errors};
}
export function shiftProgress(state){
 const all=getShiftGoals(state);
 return {done:all.filter(g=>g.done).length,total:all.length,errors:state.errors.length,phase:state.phase};
}
export function makeShiftReport(state){
 if(!state?.completed)return null;
 return {kind:'cineglobo-demo-shift-report',role:state.role,city:state.city,
  achievements:getShiftGoals(state).map(g=>({id:g.id,phase:g.phase,done:g.done})),
  errors:state.errors.map(e=>({...e})),completed:true,revision:state.revision};
}
