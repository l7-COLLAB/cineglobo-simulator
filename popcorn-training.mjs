/**
 * Motor de treinamento FICTÍCIO da bomboniere.
 * São estados de jogo; NÃO são procedimentos térmicos nem instruções reais de segurança.
 * Etapa de adição do sal: posição pendente de confirmação operacional e NÃO avaliada.
 */
export const SIMULATED_TARGET_C=200;
export const SLOW_POP_INTERVAL_SECONDS=1.5;
const KINDS=new Set(['salgada','doce']);
const actions={
 salgada:['begin','base','heat','motor','mix','corn','salt','lid','stop','tilt','reset'],
 doce:['begin','oil','heat','motor','corn','chocolate','lid','stop','tilt','reset']
};
export const recipeLabels={
 salgada:{base:'Base preparada: 1 L de óleo + 1 L de manteiga (referência de bancada, não dose por batelada)',mix:'1 copo de mistura',corn:'1 copo de milho',salt:'1 colher rasa de sal especial (momento ainda pendente)'},
 doce:{oil:'1 copo de óleo',corn:'1 copo de milho',chocolate:'1 copo de chocolate em pó — nunca caramelo'}
};

export function createPopcornBatch(kind){
 if(!KINDS.has(kind))throw new Error('Tipo de pipoqueira inválido.');
 return {kind,phase:'idle',temperatureC:0,motor:false,lid:false,ingredients:[],seconds:0,popIntervalSeconds:null,errors:0,help:0,completed:false};
}
function fail(s,message){return {state:{...s,errors:s.errors+1},error:message,message};}
function ok(state,message){return {state,error:null,message};}
function has(s,item){return s.ingredients.includes(item)}
function add(s,item){return {...s,ingredients:[...s.ingredients,item]}}
function requireLoading(s){return ['loading','heated','mixing'].includes(s.phase)}
export function applyPopcornAction(s,action){
 if(!s||!KINDS.has(s.kind)||!actions[s.kind].includes(action))return fail(s||createPopcornBatch('salgada'),'Controle indisponível nesta pipoqueira.');
 if(action==='reset')return ok(createPopcornBatch(s.kind),'Batelada reiniciada, sem ingredientes transferidos.');
 if(action==='salt'){
  // Ordem ainda não aprovada: apenas anota o ingrediente, sem erro nem nota.
  if(s.phase==='idle'||s.phase==='popping'||s.phase==='slow'||s.phase==='stopped'||s.completed)
   return ok(s,'O momento do sal ainda não foi confirmado; esta ação é informativa e não vale erro.');
  if(has(s,'salt'))return ok(s,'Sal registrado anteriormente. O momento exato não está sendo avaliado.');
  return ok(add(s,'salt'),'1 colher rasa de sal especial registrada sem avaliação da sequência.');
 }
 if(s.completed)return fail(s,'Batelada pronta. Reinicie a máquina para treinar outra produção.');
 if(action==='begin'){
  if(s.phase!=='idle')return fail(s,'O preparo já foi iniciado.');
  return ok({...s,phase:'loading'},'Estação preparada. Confira a base ou o óleo do sabor escolhido.');
 }
 if(s.phase==='idle')return fail(s,'Inicie o preparo da pipoqueira antes de operar os comandos.');
 if(action==='base'){
  if(s.kind!=='salgada'||s.phase!=='loading'||has(s,'base'))return fail(s,'A base só pode ser conferida no início da pipoca salgada.');
  return ok(add(s,'base'),'Base de referência conferida: 1 L óleo + 1 L manteiga. Não é dose individual.');
 }
 if(action==='oil'){
  if(s.kind!=='doce'||s.phase!=='loading'||has(s,'oil'))return fail(s,'Coloque o óleo no começo da simulação da pipoca doce.');
  return ok(add(s,'oil'),'1 copo de óleo registrado na batelada doce.');
 }
 if(action==='heat'){
  if(s.phase!=='loading'||!has(s,s.kind==='salgada'?'base':'oil'))return fail(s,'Primeiro confira a base/óleo correto antes de aquecer no jogo.');
  return ok({...s,temperatureC:25,phase:'heating'},'Aquecimento fictício iniciado. Aguarde o mostrador chegar a 200 °C.');
 }
 if(action==='motor'){
  if(s.phase!=='heated'||s.temperatureC!==SIMULATED_TARGET_C)return fail(s,'Aguarde o painel simulado chegar a 200 °C.');
  return ok({...s,motor:true,phase:'mixing'},'Misturador acionado no simulador.');
 }
 if(action==='mix'||action==='corn'||action==='chocolate'){
  if(s.phase!=='mixing'||!s.motor||s.lid)return fail(s,'Com o motor ativo, coloque os ingredientes antes de fechar a tampa.');
  if(action==='mix'&&s.kind!=='salgada'||action==='chocolate'&&s.kind!=='doce')return fail(s,'Este ingrediente pertence a outra receita.');
  if(has(s,action))return fail(s,'Este copo de ingrediente já foi adicionado.');
  // Pipoca salgada: mistura + milho. Doce: milho + óleo previamente adicionado + chocolate.
  return ok(add(s,action),recipeLabels[s.kind][action]+' registrado.');
 }
 if(action==='lid'){
  if(s.phase!=='mixing'||!s.motor)return fail(s,'Antes da tampa, ligue o misturador e prepare os ingredientes.');
  const required=s.kind==='salgada'?['base','mix','corn']:['oil','corn','chocolate'];
  const missing=required.filter(x=>!has(s,x));
  if(missing.length)return fail(s,'Faltam ingredientes obrigatórios: '+missing.map(x=>recipeLabels[s.kind][x]).join('; ')+'.');
  return ok({...s,lid:true,phase:'popping',seconds:0},'Tampa simulada fechada. Observe o intervalo das pipocas; aguarde a desaceleração.');
 }
 if(action==='stop'){
  if(s.phase!=='slow'||!s.motor)return fail(s,'No jogo, desligue somente quando os estouros simulados ficarem espaçados de 1 a 2 segundos.');
  return ok({...s,motor:false,phase:'stopped'},'Motor desligado antes de inclinar o caldeirão.');
 }
 if(action==='tilt'){
  if(s.phase!=='stopped'||s.motor)return fail(s,'Desligue o motor e aguarde o sinal de conclusão antes de inclinar.');
  return ok({...s,phase:'ready',completed:true},'Caldeirão inclinado. Pipoca '+s.kind+' pronta na simulação.');
 }
 return fail(s,'Ação não reconhecida.');
}
export function advancePopcornBatch(s,seconds){
 if(!s||!Number.isFinite(seconds)||seconds<=0)return s;
 const dt=Math.min(seconds,.05);
 if(s.phase==='heating'){
  const temp=Math.min(SIMULATED_TARGET_C,s.temperatureC+35*dt);
  return {...s,temperatureC:temp,phase:temp>=SIMULATED_TARGET_C?'heated':'heating'};
 }
 if(s.phase!=='popping'||!s.motor||!s.lid)return s;
 const elapsed=Math.min(8,s.seconds+dt);
 if(elapsed>=8)return {...s,seconds:8,phase:'slow',popIntervalSeconds:SLOW_POP_INTERVAL_SECONDS};
 return {...s,seconds:elapsed};
}
export function createMixedTub(){return {phase:'empty',steps:[],errors:0,completed:false};}
export function applyMixedTubAction(s,action,{salted,sweet}={}){
 const failTub=message=>({state:{...s,errors:s.errors+1},error:message,message});
 if(action==='reset')return {state:createMixedTub(),error:null,message:'Balde misto reiniciado.'};
 if(s.completed)return failTub('O balde já está montado.');
 const expected=['saltHalf','sweetHalf','saltFinish'][s.steps.length];
 if(action!==expected)return failTub('Ordem de montagem: primeiro metade salgada, depois metade doce, acabamento com salgada.');
 if(!salted?.completed||!sweet?.completed)return failTub('Prepare uma batelada salgada e uma doce antes da montagem.');
 const steps=[...s.steps,action];
 return {state:{...s,steps,completed:steps.length===3,phase:steps.length===3?'ready':'assembling'},error:null,message:steps.length===3?'Balde misto finalizado e conferido.':steps.length===1?'Primeira metade salgada colocada.':'Metade doce separada da salgada.'};
}
