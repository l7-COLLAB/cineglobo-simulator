const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('iPhone: AGIR permanece contextual e toque revalida a distância',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/index.html',async route=>{
  const html=fs.readFileSync('index.html','utf8').replace('function applyGraphics(){',
    "window.__tapTest={player,world,trigger:activateNearbyTarget,blocked:()=>paused};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 await page.evaluate(()=>{
  const {player,world}=window.__tapTest;
  window.__tapTest.called=0;
  player.x=7.1;player.z=9.2;player.yaw=Math.PI;
  world.push({x:7.1,z:9.9,name:'Ponto de teste mobile',callback:()=>window.__tapTest.called++});
 });
 await expect.poll(()=>page.locator('#touchInteract').evaluate(e=>getComputedStyle(e).display)).toBe('block');
 await expect(page.locator('#touchInteract')).toHaveAttribute('aria-label','Interagir: Ponto de teste mobile');
 await page.locator('#touchInteract').click();
 expect(await page.evaluate(()=>window.__tapTest.called)).toBe(1);
 // Simula toque atrasado depois de sair do alcance, antes de renderizar novo frame.
 await page.evaluate(()=>{window.__tapTest.player.x=7.1;window.__tapTest.player.z=5.5;window.__tapTest.trigger()});
 expect(await page.evaluate(()=>window.__tapTest.called)).toBe(1);
 await expect.poll(()=>page.locator('#touchInteract').evaluate(e=>getComputedStyle(e).display)).toBe('none');
 // Pausar fecha AGIR, independentemente de ponteiros pendentes.
 await page.locator('#pauseBtn').click();
 expect(await page.locator('#touchInteract').evaluate(e=>getComputedStyle(e).display)).toBe('none');
 expect(errors).toEqual([]);
});
test('iPhone: perda de foco e abertura de painel limpam joystick imediatamente',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/index.html',async route=>{
  const html=fs.readFileSync('index.html','utf8').replace('function applyGraphics(){',
    "window.__tapTest={joystick:()=>({...joy}),reset:resetTouchState};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 const pad=await page.locator('#joy').boundingBox();
 await page.mouse.move(pad.x+pad.width/2,pad.y+pad.height/2);
 await page.mouse.down();
 await page.mouse.move(pad.x+pad.width/2,pad.y+pad.height/2-32,{steps:5});
 expect((await page.evaluate(()=>window.__tapTest.joystick())).y).toBeLessThan(-.30);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 expect((await page.evaluate(()=>window.__tapTest.joystick())).y).toBe(0);
 expect(await page.locator('#nub').evaluate(el=>el.style.transform)).toBe('none');
 await page.mouse.up();
 await page.locator('#pauseBtn').click();
 expect((await page.evaluate(()=>window.__tapTest.joystick())).y).toBe(0);
 expect(errors).toEqual([]);
});
