/**
 * Planejador A* determinístico para acompanhantes em áreas internas.
 * Cada passo é validado pelo mesmo mapa de colisões usado pelo jogador.
 * Não atravessa paredes ou sofás; sem física pesada ou dependências.
 */
export function planWalkingRoute(start,goal,isWalkable,{
 step=.50,minX=-7.5,maxX=7.5,minZ=-21.25,maxZ=10.25,maxVisited=3500
}={}){
 if(!start||!goal||typeof isWalkable!=='function'||step<=0)return [];
 if(!isWalkable(goal.x,goal.z))return [];
 const columns=Math.floor((maxX-minX)/step)+1,rows=Math.floor((maxZ-minZ)/step)+1;
 const at=(x,z)=>({x:minX+x*step,z:minZ+z*step});
 const cell=p=>({x:Math.max(0,Math.min(columns-1,Math.round((p.x-minX)/step))),z:Math.max(0,Math.min(rows-1,Math.round((p.z-minZ)/step)))});
 const closestWalkable=p=>{
  const preferred=cell(p);let best=null,distance=Infinity;
  for(let radius=0;radius<=3;radius++)for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){
   const x=preferred.x+dx,z=preferred.z+dz;
   if(x<0||z<0||x>=columns||z>=rows)continue;
   const q=at(x,z);if(!isWalkable(q.x,q.z))continue;
   const d=Math.hypot(q.x-p.x,q.z-p.z);
   if(d<distance){best={x,z};distance=d}
  }
  return best;
 };
 const source=closestWalkable(start),target=closestWalkable(goal);
 if(!source||!target)return [];
 const index=(x,z)=>z*columns+x;
 const from=index(source.x,source.z),to=index(target.x,target.z);
 const score=new Float64Array(columns*rows).fill(Infinity);
 const parent=new Int32Array(columns*rows).fill(-1);
 const closed=new Uint8Array(columns*rows);
 const open=[{id:from,priority:0}],dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
 score[from]=0;
 const distance=(x,z)=>Math.hypot(x-target.x,z-target.z);
 let visited=0,found=from===to;
 while(open.length&&visited++<maxVisited&&!found){
  let best=0;
  for(let i=1;i<open.length;i++)if(open[i].priority<open[best].priority)best=i;
  const entry=open.splice(best,1)[0],id=entry.id;
  if(closed[id])continue;
  closed[id]=1;
  if(id===to){found=true;break}
  const x=id%columns,z=Math.floor(id/columns);
  for(const [dx,dz] of dirs){
   const nx=x+dx,nz=z+dz;if(nx<0||nx>=columns||nz<0||nz>=rows)continue;
   const nextId=index(nx,nz);if(closed[nextId])continue;
   const pos=at(nx,nz);
   if(!isWalkable(pos.x,pos.z))continue;
   // Sem diagonais cruzando quinas de paredes ou mobiliário.
   if(dx&&dz&&(!isWalkable(at(x+dx,z).x,at(x+dx,z).z)||!isWalkable(at(x,z+dz).x,at(x,z+dz).z)))continue;
   const candidate=score[id]+Math.hypot(dx,dz);
   if(candidate>=score[nextId])continue;
   score[nextId]=candidate;parent[nextId]=id;
   open.push({id:nextId,priority:candidate+distance(nx,nz)});
  }
 }
 if(!found)return [];
 const route=[],guard=columns*rows;
 for(let id=to,count=0;id!==from&&count<guard;id=parent[id],count++){
  if(id<0)return [];
  const point=at(id%columns,Math.floor(id/columns));
  route.push(point);
 }
 route.reverse();
 if(route.length){
  // O objetivo exato pode não coincidir com o centro da célula.
  const tail=route[route.length-1];
  if(Math.hypot(tail.x-goal.x,tail.z-goal.z)>.07&&isWalkable(goal.x,goal.z))route.push({x:goal.x,z:goal.z});
 }else if(Math.hypot(start.x-goal.x,start.z-goal.z)>.04)route.push({x:goal.x,z:goal.z});
 return route;
}
