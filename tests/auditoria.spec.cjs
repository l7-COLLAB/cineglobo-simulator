const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test('Auditoria: instrutor começa fora dos colisores e contorna o sofá',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async route=>{
  const html=fs.readFileSync('index.html','utf8').replace('function applyGraphics(){',
   "window.__audit={trainer:()=>trainer,follow:trainerFollow,player,canStand,planWalkingRoute};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 const check=await page.evaluate(()=>{
  const t=window.__audit,p=t.trainer().position;
  const start={x:p.x,z:p.z};
  const goal={x:-2.35,z:2.8};
  return {start,free:t.canStand(start.x,start.z),path:t.planWalkingRoute(start,goal,t.canStand)};
 });
 expect(check.free).toBe(true);
 expect(check.start.x).toBeGreaterThan(1.8);
 expect(check.path.length).toBeGreaterThan(3);
 expect(check.path.every(p=>!(Math.abs(p.x)<1.2&&Math.abs(p.z-2.8)<2.52))).toBe(true);
 expect(errors).toEqual([]);
});
test('Auditoria: sala no modo filme realmente escurece materiais, LEDs mantidos',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async route=>{
  const html=fs.readFileSync('index.html','utf8').replace('function applyGraphics(){',
   "window.__audit={lighting:()=>roomLighting,setRoomLights,rooms:()=>roomScenes};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 const result=await page.evaluate(()=>{
  const t=window.__audit;
  return ['Sala 1','Sala 2'].map(name=>{
   const L=t.lighting()[name];
   const count=L.surfaces?.length||0;
   t.setRoomLights(name,'filme');
   const dark=L.surfaces?.filter(m=>m.base.r>.08).map(m=>m.material.color.r/m.base.r)||[];
   const film={mode:L.mode,leds:L.leds.every(o=>o.visible),sconce:L.sconceLight.intensity,clean:L.cleanLight.intensity,ratios:dark};
   t.setRoomLights(name,'limpeza');
   const bright=L.surfaces?.filter(m=>m.base.r>.08).map(m=>m.material.color.r/m.base.r)||[];
   return {name,count,film,bright};
  });
 });
 expect(result).toHaveLength(2);
 for(const r of result){
  expect(r.count).toBeGreaterThan(6);
  expect(r.film).toMatchObject({mode:'filme',leds:true,sconce:0,clean:0});
  expect(r.film.ratios.length).toBeGreaterThan(5);
  expect(r.film.ratios.every(x=>x<.14&&x>.09)).toBe(true);
  expect(r.bright.every(x=>Math.abs(x-1)<.001)).toBe(true);
 }
 expect(errors).toEqual([]);
});
