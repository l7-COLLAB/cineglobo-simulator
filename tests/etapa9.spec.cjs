const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('Etapa 9: sofá quatro lados, fila, uniformes e luzes visíveis',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async route=>{
  const src=fs.readFileSync('index.html','utf8');
  const html=src.replace('function applyGraphics(){',
  "window.__stage9={scene:()=>scene,world:()=>world,player,trainer:()=>trainer,trainerFollow,follow:updateTrainerFollow,lighting:()=>roomLighting,rooms:()=>roomScenes,doors:()=>doors,preview:openRoomLightPreview,setLights:previewRoomLights,role:setRole,seated:()=>seatedAtSofa};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();

 const initial=await page.evaluate(()=>{
  const t=window.__stage9;
  const couch=t.scene().getObjectByName('Sofá ilha central de quatro lados');
  const queue=t.scene().getObjectByName('Organizadores de fila até bilheteria');
  return {
   couch:!!couch,sofaParts:couch?.userData.lobbyFurnitureReport?.objectsReplaced,
   oldTables:!!t.scene().getObjectByName('Mobiliário arredondado do foyer'),
   queue:!!queue,queueParts:queue?.userData.queueReport?.objectsReplaced,
   seats:t.world().filter(i=>i.name.startsWith('Sentar no sofá')).map(i=>i.name),
   switches:t.world().filter(i=>i.name.startsWith('Interruptor de luz')).map(i=>i.name),
   uniforms:t.scene().children.filter(i=>i.name.startsWith('Funcionário virtual')).map(g=>({
    uniform:g.userData.uniform,logo:!!g.getObjectByName('Logo Cine Globo no boné')
   })),
   trainerCap:!!t.trainer().getObjectByName('Logo Cine Globo no boné do instrutor')
  };
 });
 expect(initial.couch).toBe(true);
 expect(initial.sofaParts).toBeGreaterThanOrEqual(10);
 expect(initial.oldTables).toBe(false);
 expect(initial.queue).toBe(true);
 expect(initial.queueParts).toBeGreaterThanOrEqual(20);
 expect(initial.seats).toHaveLength(4);
 expect(initial.switches).toHaveLength(2);
 expect(initial.uniforms).toHaveLength(3);
 expect(initial.uniforms.every(x=>x.uniform?.shirt==='preta'&&x.uniform?.cap==='preto'&&x.logo)).toBe(true);
 expect(initial.trainerCap).toBe(true);

 for(const side of ['esquerda','direita','entrada','caixa']){
  await page.evaluate(side=>{
   const spot=window.__stage9.world().find(o=>o.name==='Sentar no sofá · '+side);
   spot.callback();
  },side);
  expect(await page.evaluate(()=>window.__stage9.seated())).toBe(side);
 }
 // Alternar o mesmo assento permite se levantar.
 await page.evaluate(()=>window.__stage9.world().find(o=>o.name==='Sentar no sofá · caixa').callback());
 expect(await page.evaluate(()=>window.__stage9.seated())).toBe(null);

 // Botão acionado no interruptor funciona sem escolher a função Sala, mas não dá metas.
 await page.evaluate(()=>window.__stage9.world().find(o=>o.name==='Interruptor de luz Sala 1').callback());
 await expect(page.getByText('Interruptor · Sala 1')).toBeVisible();
 await page.locator('[data-room-light-preview="limpeza"]').click();
 let light=await page.evaluate(()=>{
  const t=window.__stage9,L=t.lighting()['Sala 1'];
  return {mode:L.mode,clean:L.cleanLight.intensity,sconce:L.sconceLight.intensity,ceiling:L.ceiling.map(x=>x.bulb.material.emissiveIntensity),visible:t.rooms()['Sala 1'].group.visible,door:t.doors().find(d=>d.x===-4)?.open};
 });
 expect(light.mode).toBe('limpeza');
 expect(light.clean).toBeGreaterThan(5);
 expect(light.ceiling.every(x=>x>=4)).toBe(true);
 expect(light.visible).toBe(true);
 expect(light.door).toBe(true);
 await page.locator('[data-room-light-preview="filme"]').click();
 light=await page.evaluate(()=>{const L=window.__stage9.lighting()['Sala 1'];return {mode:L.mode,clean:L.cleanLight.intensity,sconce:L.sconceLight.intensity,leds:L.leds.every(x=>x.visible)}});
 expect(light).toEqual({mode:'filme',clean:0,sconce:0,leds:true});
 await page.locator('[data-room-light-preview="entrada"]').click();
 light=await page.evaluate(()=>{const L=window.__stage9.lighting()['Sala 1'];return {mode:L.mode,clean:L.cleanLight.intensity,sconce:L.sconceLight.intensity}});
 expect(light.mode).toBe('entrada');expect(light.clean).toBe(0);expect(light.sconce).toBeGreaterThan(4);
 await page.locator('#closeModal').click();
 expect(errors).toEqual([]);
});
test('Etapa 9: botão AGIR contextual e ajudante estável',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async route=>{
  const html=fs.readFileSync('index.html','utf8').replace('function applyGraphics(){',
  "window.__stage9={player,trainer:()=>trainer,follow:updateTrainerFollow};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 await page.evaluate(()=>{const p=window.__stage9.player;p.x=7.4;p.z=8.9;p.yaw=0});
 await expect.poll(()=>page.locator('#touchInteract').evaluate(el=>getComputedStyle(el).display)).toBe('none');
 await page.evaluate(()=>{const p=window.__stage9.player;p.x=-4;p.z=-8.5;p.yaw=0});
 await expect.poll(()=>page.locator('#touchInteract').evaluate(el=>getComputedStyle(el).display)).toBe('block');
 await page.evaluate(()=>{const p=window.__stage9.player;p.x=7.4;p.z=8.9;p.yaw=0});
 await expect.poll(()=>page.locator('#touchInteract').evaluate(el=>getComputedStyle(el).display)).toBe('none');
 const movement=await page.evaluate(()=>{
  const t=window.__stage9,p=t.player;p.x=3;p.z=7.6;
  for(let k=0;k<90;k++){p.z-=.02;t.follow(.05)}
  const x=t.trainer().position.x,z=t.trainer().position.z;
  for(let k=0;k<170;k++){p.yaw+=.047;t.follow(.05)}
  return Math.hypot(x-t.trainer().position.x,z-t.trainer().position.z);
 });
 expect(movement).toBeLessThan(.15);
 expect(errors).toEqual([]);
});
