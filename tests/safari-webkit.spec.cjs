const {test,expect}=require('@playwright/test');

test('WebKit móvel: jogo inicia e aceita AGIR, janela e pausa',async({page})=>{
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/index.html',{waitUntil:'load'});
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 await expect(page.locator('#pauseBtn')).toBeVisible();
 await page.locator('#mobileHudToggle').click();
 await expect(page.locator('#hud')).toBeVisible();
 await page.locator('#mobileHudToggle').click();
 await expect(page.locator('#hud')).toBeHidden();
 await page.locator('#pauseBtn').click();
 await expect(page.locator('#pauseOverlay')).toBeVisible();
 await page.locator('#resumeBtn').click();
 await expect(page.locator('#pauseOverlay')).toBeHidden();
 expect(errors).toEqual([]);
});
test('WebKit móvel: canvas acompanha rotação e não exige CDN externa',async({page})=>{
 const network=[];
 page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:8765'))network.push(request.url())});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.setViewportSize({width:844,height:390});
 await expect.poll(async()=>{
  const rect=await page.locator('#scene canvas').boundingBox();
  return [Math.round(rect.width),Math.round(rect.height)];
 }).toEqual([844,390]);
 expect(network).toEqual([]);
});
