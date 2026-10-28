/**
 * Seleção contextual estável e independente do DOM/Three.js.
 * Proximidade tem precedência; visão evita acionar itens distantes pelas costas.
 * Colisões e portas evitam acionamento através do sofá/parede.
 */
const regularRange=1.88;
export function nearestInteraction({player,targets=[],blockers=[],doors=[],previous=null}={}){
 if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.z))return null;
 const yaw=Number.isFinite(player.yaw)?player.yaw:0;
 const facingX=-Math.sin(yaw),facingZ=-Math.cos(yaw);
 let best=null,bestScore=Infinity;
 for(const target of targets){
  if(!target||typeof target.callback!=='function'||!Number.isFinite(target.x)||!Number.isFinite(target.z))continue;
  const dx=target.x-player.x,dz=target.z-player.z,dist=Math.hypot(dx,dz);
  const computer=target.name==='Computador do caixa';
  const instructor=target.instructor===true||target.name==='Conversar com instrutor';
  const range=computer?2.25:instructor?2.20:regularRange;
  if(dist<.12||dist>range)continue;
  const forward=(dx*facingX+dz*facingZ)/dist;
  // Ao lado do equipamento: não exigir girar a câmera exatamente para ele.
  // Mais longe: só bloqueia o alvo claramente às costas.
  if(dist>1.22&&forward<-.12)continue;
  if(!canReach(player,target,blockers,doors))continue;
  const closeness=dist;
  const anglePenalty=dist<=1.22?0:(1-forward)*.25;
  const sticky=previous===target ? 0.30 : 0;
  const priority=target.epiStation ? 0.11 : computer ? 0.10 : 0;
  const score=closeness+anglePenalty-sticky-priority;
  if(score<bestScore){bestScore=score;best=target}
 }
 return best;
}
function insideRectangle(x,z,box,pad=0){
 return Math.abs(x-box.x)<=box.w/2+pad&&Math.abs(z-box.z)<=box.d/2+pad;
}
function segmentCrossesRectangle(x1,z1,x2,z2,b){
 // Slab clipping: intersect only the open segment, not extension of the line.
 let low=0,high=1;
 const dx=x2-x1,dz=z2-z1;
 const axes=[[x1,dx,b.x-b.w/2-.03,b.x+b.w/2+.03],[z1,dz,b.z-b.d/2-.03,b.z+b.d/2+.03]];
 for(const [p,d,min,max] of axes){
  if(Math.abs(d)<1e-8){if(p<min||p>max)return false;continue}
  const t1=(min-p)/d,t2=(max-p)/d;
  low=Math.max(low,Math.min(t1,t2));high=Math.min(high,Math.max(t1,t2));
  if(low>high)return false;
 }
 return high>.02&&low<.98;
}
export function canReach(player,target,blockers=[],doors=[]){
 const x1=player.x,z1=player.z,x2=target.x,z2=target.z;
 if(![x1,z1,x2,z2].every(Number.isFinite))return false;
 // Hall x salas: não permitir interagir através da divisória.
 const boundary=-10.83,across=(z1-boundary)*(z2-boundary)<0;
 if(across){
  const t=(boundary-z1)/(z2-z1),atX=x1+(x2-x1)*t;
  const allowed=doors.some(d=>d.open&&Math.abs(d.x-atX)<.82);
  if(!allowed)return false;
 }
 // A divisória central separa Sala 1 e Sala 2.
 if(z1<-11.1&&z2<-11.1&&x1*x2<0)return false;
 for(const b of blockers){
  if(!b||!Number.isFinite(b.x)||!Number.isFinite(b.z))continue;
  // Computador e similares situados sobre balcão são acessíveis do lado
  // correto; o próprio móvel que abriga o alvo não o invalida.
  if(insideRectangle(x2,z2,b,.04))continue;
  if(insideRectangle(x1,z1,b,.08))continue;
  if(segmentCrossesRectangle(x1,z1,x2,z2,b))return false;
 }
 return true;
}
