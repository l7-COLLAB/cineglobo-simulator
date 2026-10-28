const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('turno de caixa: abertura física, venda real do jogo, fechamento e histórico de erros',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async route=>{
  const source=fs.readFileSync('index.html','utf8');
  const html=source.replace('function applyGraphics(){',
   "window.__shiftTest={world:()=>world,shift:()=>shiftState,history:()=>shiftHistory,openCash,summonCustomer,read:()=>lastDeliveredCodes,trainerAdvice,setRole,invalidSale:()=>validateCustomerSale(null,null,[],'Inteira','Pix',0,{},[])};\nfunction applyGraphics(){");
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 const controls=await page.evaluate(()=>({
  terminals:window.__shiftTest.world().filter(o=>o.name.startsWith('Terminal de turno')).map(o=>o.name),
  checks:window.__shiftTest.world().filter(o=>o.name.startsWith('Conferir estoque')||o.name.startsWith('Inspecionar bancada')||o.name.startsWith('Conferir saída')).length
 }));
 expect(controls.terminals.length).toBe(3);
 expect(controls.checks).toBe(3);
 expect(await page.evaluate(()=>window.__shiftTest.shift().started)).toBe(false);
 await page.evaluate(()=>window.__shiftTest.world().find(o=>o.name==='Terminal de turno Caixa').callback());
 await expect(page.getByText('Terminal de turno · Caixa',{exact:true})).toBeVisible();
 await page.locator('[data-shift-start]').click();
 expect(await page.evaluate(()=>window.__shiftTest.shift().phase)).toBe('abertura');
 await page.locator('#closeModal').click();
 // O computador do PDV, a impressora e o catálogo precisam ser usados.
 await page.evaluate(()=>window.__shiftTest.openCash());
 await page.locator('#closeModal').click();
 await page.evaluate(()=>window.__shiftTest.world().find(o=>o.name==='Mini impressora').callback());
 await page.evaluate(()=>window.__shiftTest.world().find(o=>o.name==='Televisão do catálogo').callback());
 expect(await page.evaluate(()=>window.__shiftTest.shift().phase)).toBe('atendimento');
 // Ações incorretas geram histórico, mas não completam a meta.
 await page.evaluate(()=>window.__shiftTest.invalidSale());
 expect(await page.evaluate(()=>window.__shiftTest.shift().errors.length)).toBe(1);
 await page.evaluate(()=>window.__shiftTest.trainerAdvice());
 await expect(page.locator('#speech')).toContainText('Chame um cliente');

 // O atendimento usa a interface e a animação reais do jogo.
 await page.evaluate(()=>window.__shiftTest.summonCustomer());
 await expect(page.locator('[data-customer-choice="hello"]')).toBeVisible({timeout:15000});
 await page.locator('[data-customer-choice="hello"]').click();
 await page.locator('[data-customer-choice="check"]').click();
 await page.locator('[data-customer-choice="open"]').click();
 await page.locator('[data-cash="session"]').first().click();
 await page.locator('[data-cash="seat"][data-value="A3"]').click();
 await page.locator('[data-cash="seat"][data-value="A4"]').click();
 await page.locator('[data-cash="next"]').click();
 await page.locator('[data-cash="next"]').click();
 await page.locator('[data-cash="finish"]').click();
 await page.locator('[data-cash="deliver"]').click();
 await expect(page.getByText('Obrigado pelo atendimento! Agora vou guardar meus ingressos.',{exact:true})).toBeVisible({timeout:15000});
 expect(await page.evaluate(()=>window.__shiftTest.shift().phase)).toBe('fechamento');
 expect(await page.evaluate(()=>window.__shiftTest.read().length)).toBe(2);
 // O comprovante da venda segue disponível para conferir depois do próximo cliente.
 await page.locator('[data-customer-choice="reset"]').click();
 await page.evaluate(()=>window.__shiftTest.world().find(o=>o.name==='Terminal de turno Caixa').callback());
 await page.locator('[data-shift-action="receipt-audited"]').click();
 await page.locator('[data-shift-action="pos-shutdown"]').click();
 const report=await page.evaluate(()=>({shift:window.__shiftTest.shift(),history:window.__shiftTest.history()}));
 expect(report.shift.phase).toBe('concluido');
 expect(report.shift.completed).toBe(true);
 expect(report.shift.errors.length).toBe(1);
 expect(report.history.length).toBe(1);
 expect(report.history[0].errors.length).toBe(1);
 await expect(page.getByText(/6\/6 metas/)).toBeVisible();
 await page.screenshot({path:'test-results/turno-caixa-mobile.png',fullPage:true});
 expect(errors).toEqual([]);
});
