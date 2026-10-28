import test from 'node:test';
import assert from 'node:assert/strict';
import {SHIFT_GOALS,SHIFT_PHASES,createShift,beginShift,recordShiftEvent,recordShiftError,getShiftGoals,nextShiftGoal,shiftProgress,makeShiftReport,MAX_SHIFT_ERRORS} from '../shift-training.mjs';

const eventsByRole={
 caixa:{abertura:['pos-opened','printer-checked','catalogue-checked'],atendimento:['sale-delivered'],fechamento:['receipt-audited','pos-shutdown']},
 bomboniere:{abertura:['epi-verified','stock-inspected'],atendimento:['salted-ready','sweet-ready','mixed-ready'],fechamento:['motors-checked','station-inspected']},
 sala:{abertura:['doors-checked','reception-opened'],atendimento:['ticket-approved','room-completed'],fechamento:['lights-checked','exit-inspected']}
};
test('o turno permanece inativo até começar no terminal, por setor e cidade',()=>{
 for(const role of Object.keys(SHIFT_GOALS)){
  const inactive=createShift(role,'Ijuí');
  assert.equal(inactive.started,false);assert.equal(inactive.phase,'aguardando');
  const ignored=recordShiftEvent(inactive,eventsByRole[role].abertura[0]);
  assert.equal(ignored.changed,false);
  assert.deepEqual(ignored.state,inactive);
  const started=beginShift(inactive);
  assert.equal(started.error,null);assert.equal(started.state.phase,'abertura');
  assert.equal(started.state.role,role);
  assert.equal(started.state.city,'Ijuí');
  assert.ok(beginShift(started.state).error);
 }
});
for(const role of Object.keys(eventsByRole)){
 test('fluxo completo por ações '+role+' (abertura, atendimento e fechamento)',()=>{
  let s=beginShift(createShift(role,'Ijuí')).state;
  // Uma ação adiantada não antecipa os objetivos de outra etapa.
  assert.equal(recordShiftEvent(s,eventsByRole[role].atendimento[0]).changed,false);
  assert.equal(shiftProgress(s).done,0);
  for(const phase of SHIFT_PHASES){
   assert.equal(s.phase,phase);
   const actions=eventsByRole[role][phase];
   for(const event of actions){
    const next=recordShiftEvent(s,event);
    assert.equal(next.changed,true,role+' / '+event);
    s=next.state;
    assert.equal(recordShiftEvent(s,event).changed,false,'sem registrar duplicatas');
   }
  }
  assert.equal(s.completed,true);
  assert.equal(s.phase,'concluido');
  const p=shiftProgress(s);assert.equal(p.done,p.total);
  assert.equal(getShiftGoals(s).every(g=>g.done),true);
  assert.equal(nextShiftGoal(s),null);
  assert.equal(recordShiftEvent(s,eventsByRole[role].abertura[0]).changed,false);
  const report=makeShiftReport(s);
  assert.equal(report.kind,'cineglobo-demo-shift-report');
  assert.equal(report.completed,true);
  assert.equal(report.achievements.length,p.total);
  assert.equal(beginShift(s).state.phase,'abertura');
 });
}
test('erros ficam limitados e sem vazamento de sequência com 11 dígitos',()=>{
 let state=beginShift(createShift('caixa','Ijuí')).state;
 assert.equal(makeShiftReport(state),null);
 for(let i=0;i<50;i++)state=recordShiftError(state,'Caixa','CPF fictício 11122233344 incorreto');
 assert.equal(state.errors.length,MAX_SHIFT_ERRORS);
 assert.equal(state.errors.some(e=>e.message.includes('11122233344')),false);
 assert.equal(shiftProgress(state).errors,MAX_SHIFT_ERRORS);
 const readonly=recordShiftError(createShift('sala','Ijuí'),'Sala','Erro');
 assert.equal(readonly.errors.length,0);
});
test('catálogos de eventos são explícitos, sem checkbox livre ou ação desconhecida',()=>{
 for(const role of Object.keys(SHIFT_GOALS)){
  const s=beginShift(createShift(role,'Santa Rosa')).state;
  assert.equal(recordShiftEvent(s,'marcar-tudo').changed,false);
  assert.equal(recordShiftEvent(s,'receipt-audited').changed,role==='caixa'?false:false);
  assert.equal(shiftProgress(s).done,0);
 }
});
