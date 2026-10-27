import test from 'node:test';
import assert from 'node:assert/strict';
import {ticketIssues,sessionIssues,createRoomRoutine,applyRoomAction} from '../room-training.mjs';

const session={city:'Ijuí',film:'Aventura Estelar (demonstração)',time:'14:00',room:'Sala 1',format:'2D'};
const ticket={code:'CG-DEMO-TST',city:'Ijuí',film:session.film,time:session.time,room:session.room,format:session.format,seat:'E6',status:'novo'};
const context={city:'Ijuí',session};

test('ingresso válido exige sessão completa, unidade, filme, horário, sala, formato, assento e status',()=>{
 assert.deepEqual(ticketIssues(ticket,context),[]);
 const changes=[
  ['city','Santa Rosa','outra unidade'],['film','Filme errado','Filme diferente'],
  ['time','19:30','Horário incompatível'],['room','Sala 2','Sala diferente'],
  ['format','3D','Formato 2D/3D incompatível'],['status','validado','já validado'],
  ['seat','K99','Poltrona fora']
 ];
 for(const [key,value,expected] of changes){
  const issues=ticketIssues({...ticket,[key]:value},context).join(' ');
  assert.ok(issues.includes(expected),key+' => '+issues);
 }
 assert.ok(ticketIssues(null,context).join(' ').includes('não encontrado'));
 assert.ok(ticketIssues(ticket,{city:'Ijuí',session:null}).join(' ').includes('Selecione uma sessão completa'));
});
test('sala 1 de Ijuí não recebe 3D e sessões de outra cidade são rejeitadas',()=>{
 assert.ok(sessionIssues({...session,format:'3D'},'Ijuí').join(' ').includes('somente 2D'));
 assert.ok(sessionIssues(session,'Santa Rosa').join(' ').includes('não pertence'));
 assert.deepEqual(sessionIssues({...session,room:'Sala 2',format:'3D'},'Ijuí'),[]);
});
test('sala 2D exige ingresso validado, passagem dos comerciais e inspeções efetivas',()=>{
 let s=createRoomRoutine('Sala 1');
 function step(a){const result=applyRoomAction(s,a,{session,city:'Ijuí'});s=result.state;return result}
 assert.ok(step('film').error);
 assert.equal(step('admission').error,null);
 assert.equal(s.mode,'entrada');
 assert.ok(step('film').error);
 assert.equal(step('validate').error,null);
 assert.equal(step('film').error,null);assert.equal(s.mode,'filme');
 assert.ok(step('finish').error);
 assert.equal(step('cleaning').error,null);assert.equal(s.mode,'limpeza');
 assert.ok(step('finish').error);
 for(const a of ['seats','floor','items'])assert.equal(step(a).error,null);
 assert.equal(step('glasses').error,null);assert.equal(s.glassesCollected,false);
 assert.equal(step('finish').error,null);assert.equal(s.completed,true);
 assert.ok(step('seats').error);
 assert.equal(step('reset').error,null);assert.equal(s.completed,false);
});
test('sessão 3D na sala 2 requer recolhimento de óculos no cenário demonstrativo',()=>{
 const s3d={...session,room:'Sala 2',format:'3D'};
 let s=createRoomRoutine('Sala 2');
 for(const a of ['admission','validate','film','cleaning','seats','floor','items']){
  const result=applyRoomAction(s,a,{session:s3d,city:'Ijuí'});assert.equal(result.error,null);s=result.state;
 }
 const missing=applyRoomAction(s,'finish',{session:s3d,city:'Ijuí'});
 assert.match(missing.error,/óculos 3D/);
 s=applyRoomAction(s,'glasses',{session:s3d,city:'Ijuí'}).state;
 assert.equal(applyRoomAction(s,'finish',{session:s3d,city:'Ijuí'}).state.completed,true);
});
test('não permite iniciar rotina da sala errada',()=>{
 const s=createRoomRoutine('Sala 1');
 const result=applyRoomAction(s,'admission',{session:{...session,room:'Sala 2'},city:'Ijuí'});
 assert.ok(result.error);
 assert.equal(result.state.phase,'aguardando');
});
