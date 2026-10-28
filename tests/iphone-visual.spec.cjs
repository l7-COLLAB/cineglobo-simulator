const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('iPhone horizontal: cena usa tela toda, mantém nitidez e HUD recolhido',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:896,height:414});
 await page.addInitScript(()=>{
  localStorage.setItem('cineglobo_config',JSON.stringify({mouse:22,touch:22,quality:'low',fps:30,volume:40}));
  localStorage.removeItem('cineglobo_visual_migration_v8');
 });
 await page.route('**/index.html',async route=>{
  const src=fs.readFileSync('index.html','utf8');
  const html=src.replace('function applyGraphics(){',
  'window.__iphoneV8={renderer:()=>renderer,player:()=>({...player}),joy:()=>({...joy}),settings:()=>({...settings}),furniture:()=>scene.getObjectByName("Mobiliário arredondado do foyer"),world:()=>world,resize:resizeGame};\nfunction applyGraphics(){');
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html',{waitUntil:'load'});
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 const initial=await page.evaluate(()=>{
  const canvas=document.querySelector('#scene canvas'),v=window.__iphoneV8;
  const bounds=canvas.getBoundingClientRect(),scene=document.querySelector('#scene').getBoundingClientRect();
  return {bounds:{x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height},scene:{width:scene.width,height:scene.height},pixelRatio:v.renderer().getPixelRatio(),quality:v.settings().quality,touch:v.settings().touch,hidden:document.body.classList.contains('hud-closed'),furniture:!!v.furniture(),furnitureDraws:v.furniture()?.userData.lobbyFurnitureReport?.mergedDraws,markerDimensions:v.world().filter(x=>x.marker?.userData.trainingWorldMarker).map(x=>x.marker.geometry.parameters)};
 });
 expect(initial.bounds.x).toBe(0);
 expect(initial.bounds.y).toBe(0);
 expect(initial.bounds.width).toBe(896);
 expect(initial.bounds.height).toBe(414);
 expect(initial.scene.width).toBe(896);
 expect(initial.quality).toBe('medium');
 expect(initial.touch).toBe(34);
 expect(initial.pixelRatio).toBeGreaterThanOrEqual(1.25);
 expect(initial.hidden).toBe(true);
 expect(initial.furniture).toBe(true);
 expect(initial.furnitureDraws).toBe(1);
 expect(initial.markerDimensions.length).toBeGreaterThanOrEqual(6);
 expect(initial.markerDimensions.every(m=>m.height<.25&&m.depth<.09)).toBe(true);
 await expect(page.locator('#hud')).toBeHidden();
 await page.locator('#mobileHudToggle').click();
 await expect(page.locator('#hud')).toBeVisible();
 await page.locator('#mobileHudToggle').click();
 await expect(page.locator('#hud')).toBeHidden();
 const controlBoxes=await page.evaluate(()=>{
  const a=document.querySelector('#mobileHudToggle').getBoundingClientRect();
  const b=document.querySelector('#pauseBtn').getBoundingClientRect();
  return {toggleTop:a.top,pauseBottom:b.bottom,toggleRight:a.right,pauseLeft:b.left};
 });
 // Menu de tarefas abaixo do cabeçalho ou afastado da ação de pausa.
 expect(controlBoxes.toggleTop>=controlBoxes.pauseBottom-5||controlBoxes.toggleRight<=controlBoxes.pauseLeft).toBe(true);
 await page.locator('#enter').click();
 await page.mouse.move(618,219);
 await page.mouse.down();
 await page.mouse.move(750,247,{steps:8});
 await page.mouse.up();
 const yaw=await page.evaluate(()=>window.__iphoneV8.player().yaw);
 expect(Math.abs(yaw)).toBeGreaterThan(.25);
 // O joystick aplica direção contínua com limite e retorna ao neutro.
 const pad=await page.locator('#joy').boundingBox();
 await page.mouse.move(pad.x+pad.width/2,pad.y+pad.height/2);
 await page.mouse.down();
 await page.mouse.move(pad.x+pad.width/2,pad.y+pad.height/2-38,{steps:6});
 const held=await page.evaluate(()=>window.__iphoneV8.joy());
 expect(held.y).toBeLessThan(-.4);
 await page.mouse.up();
 expect((await page.evaluate(()=>window.__iphoneV8.joy())).y).toBe(0);
 await page.locator('#pauseBtn').click();
 await expect(page.locator('#pauseOverlay')).toBeVisible();
 expect(await page.locator('#quality').inputValue()).toBe('medium');
 await page.locator('#quality').selectOption('high');
 expect(await page.evaluate(()=>window.__iphoneV8.renderer().getPixelRatio())).toBeGreaterThanOrEqual(1.7);
 await page.locator('#quality').selectOption('low');
 expect(await page.evaluate(()=>window.__iphoneV8.renderer().getPixelRatio())).toBeLessThanOrEqual(.91);
 await page.screenshot({path:'test-results/iphone-v8-fullscreen.png',fullPage:true});
 expect(errors).toEqual([]);
});

test('rotação simula troca de viewport sem deixar uma metade sem canvas',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 let rect=await page.locator('#scene canvas').boundingBox();
 expect(rect.width).toBe(390);
 expect(rect.height).toBe(844);
 await page.setViewportSize({width:844,height:390});
 await expect.poll(async()=>{
  const b=await page.locator('#scene canvas').boundingBox();
  return [Math.round(b.width),Math.round(b.height)];
 }).toEqual([844,390]);
 await expect(page.locator('#mobileHudToggle')).toBeVisible();
});
