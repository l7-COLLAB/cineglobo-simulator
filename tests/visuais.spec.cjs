const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('personagens econômicos, pipoqueiras separadas e acabamento de referência',async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/index.html',async route=>{
   let html=fs.readFileSync('index.html','utf8');
   // Dados técnicos temporários apenas na resposta do teste: não expostos na versão pública.
   html=html.replace('function applyGraphics(){',`window.__visualTest={scene:()=>scene,trainer:()=>trainer,trainerParts:()=>trainerParts,procedural:()=>!trainerRealistic,workers:()=>npcTeam,client:()=>queueCustomer,checkout:()=>checkoutVisual,renderer:()=>renderer,shiftVisuals:()=>shiftTerminalVisualReport,batches:()=>staticBatchReport,details:()=>staticDetailReport,world:()=>world,lights:()=>lights,rooms:()=>roomScenes,doors:()=>doors,refreshRooms:()=>updateVisibleRooms(),position:(x,z)=>{player.x=x;player.z=z;player.yaw=0;player.pitch=0;}};\nfunction applyGraphics(){`);
   await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 const metrics=await page.evaluate(()=>{
   const {scene,workers,client,renderer}=window.__visualTest;
   const customer=client();
   const staff=workers().find(w=>w.role==='caixa').g;
   const machines=['SALGADA','DOCE'].map(flavor=>{
     const root=scene().getObjectByName('Pipoqueira visual · '+flavor);
     const meshes=[];root?.traverse(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry')meshes.push(o)});
     return {exists:!!root,boxMeshes:meshes.length,instancedBoxGroups:meshes.filter(m=>m.isInstancedMesh).length,distinctBoxGeometries:new Set(meshes.map(m=>m.geometry.uuid)).size};
   });
   return {
     workers:workers().length,
     trainerOptimization:(()=>{const t=window.__visualTest.trainer();return {procedural:window.__visualTest.procedural(),root:t.userData.optimization?.trunk,arms:t.userData.optimization?.arms,armGroups:window.__visualTest.trainerParts().length,handMovesWithArm:window.__visualTest.trainerParts().every(a=>a.pivot.children.some(m=>m.isMesh&&m.name?.includes('consolidados')))}})(),

     separateActors:customer!==staff,
     sharedLegGeometry:customer.userData.walkingLimbs[0].leg.children[0].geometry===staff.userData.walkingLimbs[0].leg.children[0].geometry,
     customerLimbs:customer.userData.walkingLimbs.length,
     staffHasIndependentArms:!!staff.userData['arm-1']&&!!staff.userData['arm1'],
     customerCanSpeak:typeof customer.userData.updateSpeech==='function',
     optimizedActors:[...workers().map(w=>w.g),customer].map(actor=>({
       title:actor.name,
       torsoMeshes:actor.children.filter(c=>c.isMesh&&c.name==='Corpo e rosto · malha agrupada').length,
       walkingGroups:actor.userData.walkingLimbs.length,
       legs:actor.userData.walkingLimbs.map(l=>({meshes:l.leg.children.filter(c=>c.isMesh).length,shared:l.leg.children[0].geometry===staff.userData.walkingLimbs[0].leg.children[0].geometry})),
       arms:actor.userData.walkingLimbs.map(l=>l.arm.children.filter(c=>c.isMesh).length),
       before:actor.userData.graphicOptimization.originalBodyDraws+actor.userData.graphicOptimization.originalLimbDraws,
       after:actor.userData.graphicOptimization.bodyDraws+actor.userData.graphicOptimization.limbDraws
     })),

     machines,
     batches:window.__visualTest.batches(),
     shiftVisuals:window.__visualTest.shiftVisuals(),
     details:window.__visualTest.details(),
     equipmentMarkersPresent:window.__visualTest.world().some(o=>o.name==='Computador do caixa'&&o.marker?.visible===false),
     lightingMeshesPreserved:window.__visualTest.lights().every(o=>o.parent===scene()),
     drawCalls:renderer().info.render.calls,
     triangles:renderer().info.render.triangles
   };
 });
 expect(metrics.workers).toBe(3);
 expect(metrics.trainerOptimization.procedural).toBe(true);
 expect(metrics.trainerOptimization.root.objectsReplaced).toBeGreaterThanOrEqual(10);
 expect(metrics.trainerOptimization.root.mergedDraws).toBeLessThan(metrics.trainerOptimization.root.originalDraws);
 expect(metrics.trainerOptimization.armGroups).toBe(2);
 expect(metrics.trainerOptimization.arms.every(a=>a.objectsReplaced>=2)).toBe(true);
 expect(metrics.trainerOptimization.handMovesWithArm).toBe(true);
 expect(metrics.separateActors).toBe(true);
 expect(metrics.sharedLegGeometry).toBe(true);
 expect(metrics.customerLimbs).toBe(2);
 expect(metrics.staffHasIndependentArms).toBe(true);
 expect(metrics.customerCanSpeak).toBe(true);
 expect(metrics.optimizedActors.length).toBe(4);
 for(const actor of metrics.optimizedActors){
  expect(actor.torsoMeshes).toBe(1);
  expect(actor.walkingGroups).toBe(2);
  expect(actor.legs.every(l=>l.meshes===1&&l.shared)).toBe(true);
  expect(actor.arms.every(n=>n===1)).toBe(true);
  expect(actor.before-actor.after).toBeGreaterThanOrEqual(8);
 }
 expect(metrics.drawCalls).toBeLessThanOrEqual(150); // engenharia, mesmo percurso de referência em Chromium simulado

 for(const m of metrics.machines){
   expect(m.exists).toBe(true);
   expect(m.instancedBoxGroups).toBeGreaterThanOrEqual(2);
   expect(m.boxMeshes).toBeLessThan(20);
   expect(m.distinctBoxGeometries).toBeLessThanOrEqual(2);
 }
 expect(metrics.details.caixa.originalDraws).toBeGreaterThan(7);
 expect(metrics.details.terminal.originalDraws).toBeGreaterThan(8);
 expect(metrics.details.caixa.mergedDraws).toBeGreaterThanOrEqual(1);
 expect(metrics.details.caixa.mergedDraws).toBeLessThanOrEqual(3);
 expect(metrics.details.caixa.originalDraws).toBeGreaterThan(metrics.details.caixa.mergedDraws+7);
 expect(metrics.details.terminal.mergedDraws).toBe(1);
 expect(metrics.batches.epiRack.objectsReplaced).toBeGreaterThanOrEqual(3);
 // O agrupamento não apaga os alvos individuais de segurança.
 const epiStatus=await page.evaluate(()=>window.__visualTest.world().filter(o=>o.epiStation).map(o=>({name:o.name,markerExists:!!o.marker,parentExists:!!o.marker?.parent})));
 expect(epiStatus.length).toBeGreaterThanOrEqual(5);
 expect(epiStatus.every(m=>m.markerExists&&m.parentExists)).toBe(true);
 expect(metrics.batches.clickMarkers.instances).toBeGreaterThanOrEqual(6);
 expect(metrics.batches.clickMarkers.savedDraws).toBeGreaterThanOrEqual(5);
 const hallPosters=await page.evaluate(()=>{
  const mesh=window.__visualTest.scene().getObjectByName('Molduras de cartazes do hall');
  return {instanced:!!mesh?.isInstancedMesh,count:mesh?.count||0};
 });
 expect(hallPosters).toEqual({instanced:true,count:3});
 const signAtlas=await page.evaluate(()=>{
  const sign=window.__visualTest.scene().getObjectByName('Sinalização fixa em atlas');
  return {exists:!!sign,count:sign?.userData.signs||0,vertices:sign?.geometry?.attributes.position.count||0};
 });
 expect(signAtlas.exists).toBe(true);
 expect(signAtlas.count).toBeGreaterThanOrEqual(4);
 expect(signAtlas.vertices).toBe(signAtlas.count*6);

  expect(metrics.shiftVisuals.interactivePoints).toBe(6);
 expect(metrics.shiftVisuals.legacyEstimatedDraws).toBe(15);
 expect(metrics.shiftVisuals.instancedDraws).toBe(3);
 expect(metrics.shiftVisuals.instances).toBe(15);
 const shiftInstancing=await page.evaluate(()=>{
  const expected=['Turnos · acabamento metálico instanciado','Turnos · gabinetes instanciados','Turnos · telas instanciadas'];
  return expected.map(name=>{
   const obj=window.__visualTest.scene().getObjectByName(name);
   return {exists:!!obj,instanced:!!obj?.isInstancedMesh,count:obj?.count||0};
  });
 });
 expect(shiftInstancing.every(x=>x.exists&&x.instanced)).toBe(true);
 expect(shiftInstancing.map(x=>x.count)).toEqual([6,6,3]);
  expect(metrics.batches.hall.objectsReplaced).toBeGreaterThan(4);
 for(const flavor of ['SALGADA','DOCE']){
   expect(metrics.batches['Pipoqueira '+flavor].objectsReplaced).toBeGreaterThan(12);
   expect(metrics.batches['Pipoqueira '+flavor].originalDraws).toBeGreaterThan(metrics.batches['Pipoqueira '+flavor].batchDraws);
 }
 expect(metrics.equipmentMarkersPresent).toBe(true);
 expect(metrics.lightingMeshesPreserved).toBe(true);
 // Porta fechada oculta a sala; abrir a porta ou entrar mantém o ambiente disponível.
 const roomsCheck=await page.evaluate(()=>{
   const api=window.__visualTest,rooms=api.rooms(),doors=api.doors();
   api.refreshRooms();
   const initialClosed=!rooms['Sala 1'].group.visible&&!rooms['Sala 2'].group.visible;
   const door=doors.find(d=>d.x===-4);
   door.open=true;api.refreshRooms();
   const opens=rooms['Sala 1'].group.visible&&!rooms['Sala 2'].group.visible;
   door.open=false;api.position(-4,-13.5);api.refreshRooms();
   const remainsVisibleInside=rooms['Sala 1'].group.visible;
   api.position(0,1.5);api.refreshRooms();
   return {initialClosed,opens,remainsVisibleInside};
 });
 expect(roomsCheck).toEqual({initialClosed:true,opens:true,remainsVisibleInside:true});
 console.log('Métricas em Chromium simulado (não representam Safari físico):',JSON.stringify({
  drawCalls:metrics.drawCalls,triangles:metrics.triangles,optimizedActors:metrics.optimizedActors,trainerOptimization:metrics.trainerOptimization,machines:metrics.machines,batches:metrics.batches,details:metrics.details
 }));
 await page.evaluate(()=>{
   window.__visualTest.position(0,1.5);
   window.__visualTest.client().visible=true;
   window.__visualTest.client().userData.updateSpeech('Bem-vindo ao caixa','Atendimento simulado');
 });
 await page.waitForTimeout(500);
 await page.screenshot({path:'test-results/visuais-referencia-caixa.png',fullPage:true});
 expect(errors).toEqual([]);
});
