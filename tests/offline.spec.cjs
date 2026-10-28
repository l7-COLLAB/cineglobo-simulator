const {test,expect}=require('@playwright/test');

/**
 * Executa no pacote dist/ do GitHub Pages (mesmos arquivos usados na publicação).
 * Em localhost seguro, o SW tem acesso ao cache persistente.
 * O teste não representa uso offline no Safari físico.
 */
test('PWA abre e inicia o cinema sem rede depois da primeira instalação',async({page,context})=>{
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const host=new URL(test.info().project.use.baseURL||'http://127.0.0.1:8765').origin;
 const outsiders=[];
 page.on('request',request=>{
  if(!request.url().startsWith(host))outsiders.push(request.url());
 });
 await page.goto('/index.html',{waitUntil:'load'});
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),{timeout:15000}).toBe(true);
 const cached=await page.evaluate(async()=>{
  const keys=await caches.keys();
  const cache=await caches.open(keys.find(key=>key.startsWith('cineglobo-v30-'))||'');
  const files=['./index.html','./vendor/three.module.js','./character-kit.js','./sw.js'];
  return {keys,files:await Promise.all(files.map(async f=>({file:f,present:Boolean(await cache.match(f))})))};
 });
 expect(cached.keys.some(k=>k==='cineglobo-v30-offline-three')).toBe(true);
 expect(cached.files.filter(f=>f.file!=='./sw.js').every(f=>f.present)).toBe(true);
 await context.setOffline(true);
 await page.reload({waitUntil:'load',timeout:30000});
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 await expect(page.locator('#pauseBtn')).toBeVisible();
 await page.locator('#pauseBtn').click();
 await expect(page.getByText('Jogo pausado',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>navigator.onLine)).toBe(false);
 expect(errors).toEqual([]);
 expect(outsiders).toEqual([]);
 await context.setOffline(false);
});
