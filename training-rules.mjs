/**
 * Regras puras da bilheteria de treinamento.
 * Não acessa DOM, tickets reais nem armazenamento: testável independentemente do 3D.
 * Valores e pedidos são fictícios.
 */
const SEAT_PATTERN=/^[A-J](?:[1-9]|1[0-2])$/;
const ALLOWED_PAYMENTS=new Set(['Pix','Crédito','Débito','Dinheiro']);
export function saleError({session,seats,category,prices,payment='Pix',received=0,occupiedSeats=[],mission=null}={}){
 if(!session||!['film','time','room','format'].every(k=>typeof session[k]==='string'&&session[k].trim()))return 'Escolha uma sessão válida antes de vender.';
 if(!Array.isArray(seats)||seats.length<1||seats.length>6)return 'Selecione entre 1 e 6 poltronas.';
 if(seats.some(s=>typeof s!=='string'||!SEAT_PATTERN.test(s))||new Set(seats).size!==seats.length)return 'Seleção de poltronas inválida ou repetida.';
 if(new Set(occupiedSeats).size&&seats.some(s=>new Set(occupiedSeats).has(s)))return 'Uma poltrona já está ocupada. Escolha novamente.';
 if(!prices||!Object.prototype.hasOwnProperty.call(prices,category)||!Number.isFinite(Number(prices[category]))||Number(prices[category])<0)return 'Preço ou categoria inválidos: confira o cadastro demonstrativo.';
 if(!ALLOWED_PAYMENTS.has(payment))return 'Selecione uma forma de pagamento válida.';
 const totalCents=Math.round(Number(prices[category])*100)*seats.length;
 if(payment==='Dinheiro'&&(!Number.isFinite(Number(received))||Math.round(Number(received)*100)<totalCents))return 'O valor recebido é insuficiente para esta venda fictícia.';
 if(mission&&mission.stage==='selling'){
   if(!mission.session||['film','time','room','format'].some(k=>session[k]!==mission.session[k]))return 'Confira filme, horário, sala e formato do pedido.';
   if(seats.length!==mission.count)return 'O cliente pediu exatamente '+mission.count+' ingressos.';
   if(category!==mission.category)return 'Neste exercício, a categoria solicitada é '+mission.category+'.';
   const sorted=[...seats].sort((a,b)=>a[0].localeCompare(b[0])||Number(a.slice(1))-Number(b.slice(1)));
   if(sorted.some((seat,i)=>i&&(seat[0]!==sorted[i-1][0]||Number(seat.slice(1))!==Number(sorted[i-1].slice(1))+1)))return 'Escolha lugares juntos na mesma fileira.';
 }
 return '';
}
