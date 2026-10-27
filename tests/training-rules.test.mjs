import test from 'node:test';
import assert from 'node:assert/strict';
import { saleError } from '../training-rules.mjs';

const session={film:'Filme demonstrativo',time:'14:00',room:'Sala 1',format:'2D'};
const prices={Inteira:30,Meia:15,Promocional:20};
const mission={city:'Ijuí',session:{...session},count:2,category:'Inteira',stage:'selling'};
const standard={session,seats:['A3','A4'],category:'Inteira',prices,payment:'Pix',mission};
const run=(changes={})=>saleError({...standard,...changes});

test('pedido completo e coerente permite emitir ingresso fictício',()=>{
 assert.equal(run(),'');
});
test('não aprova filme, sala, horário ou formato divergentes',()=>{
 for(const field of ['film','time','room','format']){
  const changed={...session,[field]:'DIVERGENTE'};
  assert.match(run({session:changed}),/Confira filme/);
 }
});
test('quantidade e categoria pedidas são obrigatórias',()=>{
 assert.match(run({seats:['A3']}),/exatamente 2/);
 assert.match(run({category:'Meia'}),/categoria solicitada/);
});
test('assentos devem ser únicos, válidos e adjacentes no atendimento',()=>{
 assert.match(run({seats:['A3','A3']}),/inválida ou repetida/);
 assert.match(run({seats:['K1','K2']}),/inválida ou repetida/);
 assert.match(run({seats:['A3','A5']}),/lugares juntos/);
 assert.match(run({seats:['A12','B1']}),/lugares juntos/);
});
test('não permite vender poltrona já ocupada',()=>{
 assert.match(run({occupiedSeats:new Set(['A4'])}),/já está ocupada/);
});
test('não emite com valor insuficiente em dinheiro',()=>{
 assert.match(run({payment:'Dinheiro',received:59.99}),/insuficiente/);
 assert.equal(run({payment:'Dinheiro',received:60}),'');
});
test('rejeita preços inválidos e forma de pagamento inexistente',()=>{
 assert.match(run({prices:{Inteira:-1}}),/Preço ou categoria inválidos/);
 assert.match(run({payment:'não existe'}),/forma de pagamento/);
});
test('permite treinamento de caixa independente sem missão de cliente',()=>{
 assert.equal(run({mission:null,seats:['J12'],payment:'Débito'}),'');
});
test('bloqueia vendas sem sessão e sem poltronas',()=>{
 assert.match(run({session:null}),/sessão válida/);
 assert.match(run({seats:[]}),/entre 1 e 6/);
});
