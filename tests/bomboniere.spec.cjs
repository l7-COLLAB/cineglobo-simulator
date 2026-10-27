const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('bomboniere interativa: EPI, duas pipoqueiras, ingredientes e balde misto no mobile',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async route=>{
  let html=fs.readFileSync('index.html','utf8');
  // Acesso técnico exclusivamente injetado no teste, não publicado no jogo.
  html=html.replace('function applyGraphics(){',
  "window.__popTest={setRole,epi:()=>epi,grantEpiForTest:()=>{epi.started=true;epi.cap=true;epi.hair=true;epi.uniform=true;epi.gloves=true;epi.checked=true;epi.finished=true;refreshEpiHUD()},machineAction,batches:()=>popcornTraining,tub:()=>mixedTub,step:(dt=.05)=>animatePopcornTraining(dt),models:()=>popcornModels,world:()=>world};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 await page.evaluate(()=>window.__popTest.setRole('bomboniere'));
 await page.evaluate(()=>window.__popTest.machineAction('salgada'));
 await expect(page.locator('#modal.visible')).toHaveCount(0);
 const g=await page.evaluate(()=>{
  const t=window.__popTest;
  return {machines:Object.keys(t.models()).sort(),controls:t.world().filter(o=>/Misturador|Tampa|Inclinar caldeirão/.test(o.name)).length,epi:t.epi().finished};
 });
 expect(g.machines).toEqual(['doce','salgada']);
 expect(g.controls).toBe(6);
 expect(g.epi).toBe(false);
 // Preparação simulada apenas no teste, sem atalho no produto.
 await page.evaluate(()=>window.__popTest.grantEpiForTest());
 await page.evaluate(()=>window.__popTest.machineAction('salgada'));
 await expect(page.getByText('Pipoqueira SALGADA',{exact:true})).toBeVisible();
 const click=async(kind,action)=>page.locator('[data-popcorn-kind="'+kind+'"][data-popcorn-action="'+action+'"]').click();
 await click('salgada','begin');
 await click('salgada','base');
 await click('salgada','heat');
 await expect(page.locator('#popcornLive')).toContainText('Aquecimento no jogo');
 // Aceleração determinística do tempo simulado somente no teste.
 await page.evaluate(()=>{for(let i=0;i<110;i++)window.__popTest.step()});
 await expect(page.locator('#popcornLive')).toContainText('200 °C');
 await click('salgada','motor');
 await click('salgada','mix');
 await click('salgada','corn');
 await click('salgada','salt');
 const saltErrors=await page.evaluate(()=>window.__popTest.batches().salgada.errors);
 await click('salgada','lid');
 await click('salgada','stop');
 expect(await page.evaluate(()=>window.__popTest.batches().salgada.phase)).toBe('popping');
 await page.evaluate(()=>{for(let i=0;i<165;i++)window.__popTest.step()});
 await click('salgada','stop');
 await click('salgada','tilt');
 const salty=await page.evaluate(()=>window.__popTest.batches().salgada);
 expect(salty.completed).toBe(true);
 expect(salty.errors).toBe(saltErrors+1); // Somente desligamento prematuro.
 await page.evaluate(()=>window.__popTest.machineAction('doce'));
 await click('doce','begin');
 await click('doce','oil');
 await click('doce','heat');
 await page.evaluate(()=>{for(let i=0;i<110;i++)window.__popTest.step()});
 await click('doce','motor');
 await click('doce','corn');
 await click('doce','chocolate');
 await click('doce','lid');
 await page.evaluate(()=>{for(let i=0;i<165;i++)window.__popTest.step()});
 await click('doce','stop');
 await click('doce','tilt');
 const sweet=await page.evaluate(()=>window.__popTest.batches().doce);
 expect(sweet.completed).toBe(true);
 expect(sweet.ingredients).toContain('chocolate');
 expect(sweet.ingredients).not.toContain('caramel');
 await page.evaluate(()=>window.__popTest.world().find(o=>o.name==='Montar balde misto').callback());
 for(const action of ['saltHalf','sweetHalf','saltFinish'])await click('misto',action);
 expect(await page.evaluate(()=>window.__popTest.tub().completed)).toBe(true);
 await expect(page.getByText('Balde misto · montagem simulada',{exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/bomboniere-preparo-mobile.png',fullPage:true});
 expect(errors).toEqual([]);
});
