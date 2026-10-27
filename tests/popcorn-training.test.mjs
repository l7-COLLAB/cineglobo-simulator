import test from 'node:test';
import assert from 'node:assert/strict';
import {createPopcornBatch,applyPopcornAction,advancePopcornBatch,createMixedTub,applyMixedTubAction,SIMULATED_TARGET_C,SLOW_POP_INTERVAL_SECONDS} from '../popcorn-training.mjs';

const act=(state,action)=>applyPopcornAction(state,action);
const run=(initial,steps)=>{
 let s=initial;
 for(const step of steps){
  const outcome=act(s,step);assert.equal(outcome.error,null,'Ação '+step+': '+outcome.message);s=outcome.state;
 }
 return s;
};
function animateUntil(s,expected,iterations=240){
 for(let i=0;i<iterations&&s.phase!==expected;i++)s=advancePopcornBatch(s,.05);
 assert.equal(s.phase,expected);
 return s;
}
function completeSalted(){
 let s=run(createPopcornBatch('salgada'),['begin','base','heat']);
 s=animateUntil(s,'heated');
 s=run(s,['motor','mix','corn','lid']);
 s=animateUntil(s,'slow');
 return run(s,['stop','tilt']);
}
function completeSweet(){
 let s=run(createPopcornBatch('doce'),['begin','oil','heat']);
 s=animateUntil(s,'heated');
 s=run(s,['motor','corn','chocolate','lid']);
 s=animateUntil(s,'slow');
 return run(s,['stop','tilt']);
}
test('salgada requer base correta, ingredientes, motor, tampa e desligamento antes de inclinar',()=>{
 let s=createPopcornBatch('salgada');
 const early=act(s,'motor');assert.ok(early.error);assert.equal(early.state.motor,false);
 s=run(s,['begin','base','heat']);assert.equal(s.phase,'heating');assert.equal(s.temperatureC,25);
 assert.ok(act(s,'motor').error);
 s=animateUntil(s,'heated');assert.equal(s.temperatureC,SIMULATED_TARGET_C);
 s=run(s,['motor','mix','corn']);
 assert.ok(act(s,'corn').error);
 assert.ok(act(s,'stop').error);
 s=run(s,['lid']);assert.equal(s.phase,'popping');
 assert.ok(act(s,'tilt').error);
 s=animateUntil(s,'slow');assert.equal(s.popIntervalSeconds,SLOW_POP_INTERVAL_SECONDS);
 s=run(s,['stop','tilt']);assert.equal(s.completed,true);assert.equal(s.motor,false);
 assert.equal(s.phase,'ready');
});
test('doce utiliza óleo, milho e chocolate em pó, sem caramelo ou açúcar',()=>{
 let s=run(createPopcornBatch('doce'),['begin','oil','heat']);
 s=animateUntil(s,'heated');
 s=run(s,['motor','corn']);
 assert.ok(act(s,'lid').error);
 assert.ok(act(s,'mix').error);
 assert.ok(act(s,'caramel').error);
 s=run(s,['chocolate','lid']);
 s=animateUntil(s,'slow');
 s=run(s,['stop','tilt']);
 assert.equal(s.completed,true);
 assert.deepEqual(s.ingredients,['oil','corn','chocolate']);
});
test('sal fica informativo e não afeta avaliação enquanto ordem não está aprovada',()=>{
 let s=createPopcornBatch('salgada');
 let result=act(s,'salt');assert.equal(result.error,null);assert.equal(result.state.errors,0);
 s=run(s,['begin','base','heat']);s=animateUntil(s,'heated');
 s=run(s,['motor','salt','mix','corn','lid']);const recorded=s.ingredients.includes('salt');
 assert.equal(recorded,true);
 assert.equal(act(s,'salt').error,null);
 s=animateUntil(s,'slow');s=run(s,['stop','tilt']);
 assert.equal(act(s,'salt').error,null);
 assert.equal(act(s,'salt').state.errors,s.errors);
});
test('as máquinas funcionam independentemente e não avançam sem tick válido',()=>{
 let salted=run(createPopcornBatch('salgada'),['begin','base','heat']);
 const sweet=createPopcornBatch('doce');
 assert.equal(advancePopcornBatch(salted,0),salted);
 assert.equal(advancePopcornBatch(salted,-1),salted);
 assert.equal(advancePopcornBatch(salted,NaN),salted);
 salted=advancePopcornBatch(salted,.05);
 assert.ok(salted.temperatureC>25);
 assert.equal(sweet.phase,'idle');
 assert.equal(sweet.temperatureC,0);
});
test('balde misto exige ambas as receitas prontas e a sequência salgada/doce/salgada',()=>{
 const salted=completeSalted(),sweet=completeSweet();
 let tub=createMixedTub();
 assert.ok(applyMixedTubAction(tub,'saltHalf',{}).error);
 assert.ok(applyMixedTubAction(tub,'sweetHalf',{salted,sweet}).error);
 for(const action of ['saltHalf','sweetHalf','saltFinish']){
  const step=applyMixedTubAction(tub,action,{salted,sweet});
  assert.equal(step.error,null);
  tub=step.state;
 }
 assert.equal(tub.completed,true);
 assert.equal(tub.steps.length,3);
 assert.ok(applyMixedTubAction(tub,'saltFinish',{salted,sweet}).error);
 assert.equal(applyMixedTubAction(tub,'reset').state.phase,'empty');
});
