import test from 'node:test';
import assert from 'node:assert/strict';
import {planWalkingRoute} from '../navigation.mjs';
const sofa=(x,z)=>Math.abs(x)<=1.2&&Math.abs(z-2.8)<=2.52;
const walkable=(x,z)=>x>-7.4&&x<7.4&&z>-10&&z<10&&!sofa(x,z);

test('Acompanhante contorna sofá em vez de atravessá-lo ou ficar preso',()=>{
 const start={x:2.25,z:6.55},goal={x:-2.35,z:2.8};
 const route=planWalkingRoute(start,goal,walkable);
 assert.ok(route.length>=5,'A rota deve contornar a obstrução');
 for(const point of route)assert.equal(walkable(point.x,point.z),true,'Nenhum ponto pode atravessar o sofá');
 assert.ok(Math.hypot(route.at(-1).x-goal.x,route.at(-1).z-goal.z)<.08);
 assert.ok(route.some(p=>p.z>5.3||p.z<.28),'Deve contornar uma das pontas');
});
test('Acompanhante não atravessa parede e não usa diagonal cortando esquina',()=>{
 const corridor=(x,z)=>walkable(x,z)&&!(x>0&&x<3&&z>-.3&&z<4.2);
 const route=planWalkingRoute({x:4.5,z:1},{x:-3,z:1},corridor);
 assert.ok(route.length>0);
 assert.ok(route.every(p=>corridor(p.x,p.z)));
});
test('Destino dentro de sofá é rejeitado',()=>{
 assert.deepEqual(planWalkingRoute({x:2,z:7},{x:0,z:3},walkable),[]);
});
test('Destino próximo da borda é ajustado à célula transitável mais próxima',()=>{
 const route=planWalkingRoute({x:2,z:6.5},{x:1.26,z:1.1},walkable);
 assert.ok(route.length>0);
 assert.ok(route.every(p=>walkable(p.x,p.z)));
});
