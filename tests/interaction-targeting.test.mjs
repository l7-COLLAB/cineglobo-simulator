import test from 'node:test';
import assert from 'node:assert/strict';
import {nearestInteraction,canReach} from '../interaction-targeting.mjs';
const target=(name,x,z,extra={})=>({name,x,z,callback:()=>{},...extra});
const player=(x,z,yaw=0)=>({x,z,yaw});

test('Perto do equipamento não precisa girar o iPhone para uma direção exata',()=>{
 const door=target('Caixa próximo',1,0);
 const chosen=nearestInteraction({player:player(0,0,Math.PI/2),targets:[door]});
 assert.equal(chosen,door);
});
test('AGIR não fica disponível para setores distantes nem atrás de quem joga',()=>{
 const far=target('Caixa longe',3,0);
 const behind=target('Caixa atrás',0,1.65);
 assert.equal(nearestInteraction({player:player(0,0),targets:[far]}),null);
 assert.equal(nearestInteraction({player:player(0,0),targets:[behind]}),null);
});
test('Objeto atrás de balcão ou sofá não pode ser acionado através de obstáculo',()=>{
 const box={x:0,z:0,w:.8,d:2};
 const item=target('Atrás do sofá',-.80,0);
 const loc=player(.80,0,-Math.PI/2);
 assert.equal(canReach(loc,item,[box]),false);
 assert.equal(nearestInteraction({player:loc,targets:[item],blockers:[box]}),null);
});
test('Equipamento montado em cima de um balcão continua acessível por seu lado',()=>{
 const box={x:-5,z:-3.5,w:2.5,d:1.6};
 const item=target('Computador do caixa',-5,-3.85);
 const loc=player(-5,-5.25,Math.PI); // olhando para o computador à frente, não de costas
 assert.equal(canReach(loc,item,[box]),true);
 assert.equal(nearestInteraction({player:loc,targets:[item],blockers:[box]}),item);
});
test('Paredes de sala impedem botão através de porta fechada',()=>{
 const loc=player(-4,-10.1),inside=target('Painel interno',-4,-11.35);
 const door={x:-4,open:false};
 assert.equal(nearestInteraction({player:loc,targets:[inside],doors:[door]}),null);
 door.open=true;
 assert.equal(nearestInteraction({player:loc,targets:[inside],doors:[door]}),inside);
});
test('O alvo atual tem estabilidade quando existem dois itens próximos',()=>{
 const a=target('Leitor',-.25,-1.02),b=target('Interruptor',.15,-.92);
 const loc=player(0,0);
 assert.equal(nearestInteraction({player:loc,targets:[a,b],previous:a}),a);
 assert.equal(nearestInteraction({player:loc,targets:[a,b],previous:b}),b);
});
test('Uma ação removida ou sem callback nunca é ativada',()=>{
 assert.equal(nearestInteraction({player:player(0,0),targets:[{name:'Cenário',x:0,z:-.5}]}),null);
 assert.equal(nearestInteraction({player:{x:NaN,z:0},targets:[target('Caixa',0,-.4)]}),null);
});
