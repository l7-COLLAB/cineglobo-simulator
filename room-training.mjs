/**
 * Regras puras de conferência e rotina de salas do CineGlobo Simulator.
 * Cinema e bilhetes são demonstrações. Sem acesso a dados comerciais/reais.
 */
const SEAT=/^[A-J](?:[1-9]|1[0-2])$/;
const VALID_FORMATS=new Set(['2D','3D']);
const VALID_ROOMS=new Set(['Sala 1','Sala 2']);
export function sessionIssues(session,city){
 const issues=[];
 if(!session||!['film','time','room','format'].every(k=>typeof session[k]==='string'&&k.trim()))return ['Selecione uma sessão completa.'];
 if(session.city!==city)issues.push('A sessão não pertence à unidade escolhida.');
 if(!VALID_ROOMS.has(session.room))issues.push('Sala não cadastrada nesta planta demonstrativa.');
 if(!VALID_FORMATS.has(session.format))issues.push('Formato da sessão inválido.');
 if(city==='Ijuí'&&session.room==='Sala 1'&&session.format==='3D')issues.push('Sala 1 de Ijuí é somente 2D.');
 if(!/^\d{2}:\d{2}$/.test(session.time))issues.push('Horário da sessão inválido.');
 return issues;
}
export function ticketIssues(ticket,{city,session}={}){
 const issues=sessionIssues(session,city);
 if(!ticket||typeof ticket!=='object')return [...issues,'Ingresso não encontrado.'];
 if(ticket.status!=='novo')issues.push(ticket.status==='validado'?'Ingresso já validado.':'Status de ingresso inválido.');
 if(ticket.city!==city)issues.push('Ingresso de outra unidade.');
 if(session){
  if(ticket.film!==session.film)issues.push('Filme diferente da sessão selecionada.');
  if(ticket.time!==session.time)issues.push('Horário incompatível.');
  if(ticket.room!==session.room)issues.push('Sala diferente da entrada.');
  if(ticket.format!==session.format)issues.push('Formato 2D/3D incompatível.');
 }
 if(typeof ticket.seat!=='string'||!SEAT.test(ticket.seat))issues.push('Poltrona fora do mapa A–J, 1–12.');
 return issues;
}
export function createRoomRoutine(room){
 if(!VALID_ROOMS.has(room))throw new Error('Sala não cadastrada.');
 return {room,session:null,phase:'aguardando',ticketsValidated:0,mode:'entrada',seatCheck:false,floorCheck:false,itemsCollected:false,glassesCollected:false,completed:false,errors:0};
}
function fail(s,message){return {state:{...s,errors:s.errors+1},error:message,message};}
function ok(state,message){return {state,error:null,message};}
export function applyRoomAction(state,action,{session,city='Ijuí'}={}){
 if(!state||!VALID_ROOMS.has(state.room))throw new Error('Estado de sala inválido.');
 const s=state;
 const selected=session||s.session;
 if(action==='reset')return ok(createRoomRoutine(s.room),'Treinamento da sala reiniciado.');
 if(s.completed)return fail(s,'A rotina já foi concluída. Reinicie para outro exercício.');
 if(action==='admission'){
  const issues=sessionIssues(selected,city);
  if(issues.length)return fail(s,issues.join(' '));
  if(selected.room!==s.room)return fail(s,'Escolha uma sessão da sala correspondente.');
  if(s.phase!=='aguardando')return fail(s,'A recepção desta sala já foi iniciada.');
  return ok({...s,session:{...selected},phase:'entrada',mode:'entrada'},'Recepção iniciada. Arandelas acesas e LEDs de orientação mantidos.');
 }
 if(action==='validate'){
  if(s.phase!=='entrada')return fail(s,'Inicie a recepção antes de validar ingressos na rotina.');
  return ok({...s,ticketsValidated:s.ticketsValidated+1},'Ingresso fictício conferido e registrado na recepção.');
 }
 if(action==='film'){
  if(s.phase!=='entrada')return fail(s,'A transição para o filme exige a fase de recepção.');
  if(s.ticketsValidated<1)return fail(s,'Valide ao menos um ingresso fictício antes de simular o início do filme.');
  return ok({...s,phase:'filme',mode:'filme'},'Fim dos comerciais: arandelas apagadas, somente LEDs ligados.');
 }
 if(action==='cleaning'){
  if(s.phase!=='filme')return fail(s,'A limpeza só começa após o término da sessão simulada.');
  return ok({...s,phase:'limpeza',mode:'limpeza'},'Luzes gerais acesas. Inicie a verificação visual da sala.');
 }
 if(['seats','floor','items','glasses'].includes(action)){
  if(s.phase!=='limpeza')return fail(s,'As conferências devem ocorrer durante a fase de limpeza.');
  if(action==='glasses'&&selected?.format!=='3D')return ok(s,'Óculos 3D não são exigidos nesta sessão 2D.');
  const key={seats:'seatCheck',floor:'floorCheck',items:'itemsCollected',glasses:'glassesCollected'}[action];
  if(s[key])return ok(s,'Esta conferência já foi realizada.');
  const title={seats:'Poltronas A–J conferidas',floor:'Piso e corredores inspecionados',items:'Resíduos e objetos esquecidos conferidos',glasses:'Óculos 3D recolhidos no jogo'}[action];
  return ok({...s,[key]:true},title+'.');
 }
 if(action==='finish'){
  if(s.phase!=='limpeza')return fail(s,'Conclua o filme e inicie a limpeza antes de encerrar.');
  const missing=[];
  if(!s.seatCheck)missing.push('poltronas');
  if(!s.floorCheck)missing.push('piso/corredores');
  if(!s.itemsCollected)missing.push('objetos esquecidos');
  if(selected?.format==='3D'&&!s.glassesCollected)missing.push('óculos 3D');
  if(missing.length)return fail(s,'Conferências pendentes: '+missing.join(', ')+'.');
  return ok({...s,phase:'concluida',completed:true},'Rotina de sala concluída por ações verificadas.');
 }
 return fail(s,'Ação indisponível nesta etapa.');
}
