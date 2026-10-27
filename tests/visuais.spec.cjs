const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('personagens econômicos, pipoqueiras separadas e acabamento de referência',async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/index.html',async route=>{
   let html=fs.readFileSync('index.html','utf8');
   // Dados técnicos temporários apenas na resposta do teste: não expostos na versão pública.
   html=html.replace('function applyGraphics(){',`window.__visualTest={scene:()=>scene,workers:()=>npcTeam,client:()=>queueCustomer,checkout:()=>checkoutVisual,renderer:()=>renderer,batches:()=>staticBatchReport,world:()=>world,lights:()=>lights,rooms:()=>roomScenes,doors:()=>doors,refreshRooms:()=>updateVisibleRooms(),position:(x,z)=>{player.x=x;player.z=z;player.yaw=0;player.pitch=0;}};\nfunction applyGraphics(){`);
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
     separateActors:customer!==staff,
     sharedLegGeometry:customer.userData.walkingLimbs[0].leg.children[0].geometry===staff.userData.walkingLimbs[0].leg.children[0].geometry,
     customerLimbs:customer.userData.walkingLimbs.length,
     staffHasIndependentArms:!!staff.userData['arm-1']&&!!staff.userData['arm1'],
     customerCanSpeak:typeof customer.userData.updateSpeech==='function',
     machines,
     batches:window.__visualTest.batches(),
     equipmentMarkersPresent:window.__visualTest.world().some(o=>o.name==='Computador do caixa'&&o.marker?.visible===false),
     lightingMeshesPreserved:window.__visualTest.lights().every(o=>o.parent===scene()),
     drawCalls:renderer().info.render.calls,
     triangles:renderer().info.render.triangles
   };
 });
 expect(metrics.workers).toBe(3);
 expect(metrics.separateActors).toBe(true);
 expect(metrics.sharedLegGeometry).toBe(true);
 expect(metrics.customerLimbs).toBe(2);
 expect(metrics.staffHasIndependentArms).toBe(true);
 expect(metrics.customerCanSpeak).toBe(true);
 for(const m of metrics.machines){
   expect(m.exists).toBe(true);
   expect(m.instancedBoxGroups).toBeGreaterThanOrEqual(2);
   expect(m.boxMeshes).toBeLessThan(20);
   expect(m.distinctBoxGeometries).toBeLessThanOrEqual(2);
 }
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
  drawCalls:metrics.drawCalls,triangles:metrics.triangles,machines:metrics.machines,batches:metrics.batches
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
