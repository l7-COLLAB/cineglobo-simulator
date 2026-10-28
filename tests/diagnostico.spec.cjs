const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('diagnóstico local sobrevive à pausa e produz resumo por área',async({page})=>{
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/index.html',async route=>{
  let html=fs.readFileSync('index.html','utf8');
  html=html.replace('function applyGraphics(){',
   'window.__diagnosticTest={report:()=>technicalMonitor?.getReport(),enabled:()=>technicalMonitor?.isEnabled()};\nfunction applyGraphics(){');
  await route.fulfill({contentType:'text/html',body:html});
 });
 await page.goto('/index.html');
 await expect(page.locator('#scene canvas')).toBeVisible({timeout:45000});
 await page.locator('#enter').click();
 await page.locator('#pauseBtn').click();
 await expect(page.locator('#techBtn')).toBeVisible();
 await page.locator('#exportTechBtn').click();
 await expect(page.locator('#techStatus')).toContainText('Nenhuma amostra registrada');
 await page.locator('#techBtn').click();
 await expect(page.locator('#techBtn')).toHaveAttribute('aria-pressed','true');
 await page.locator('#resumeBtn').click();
 await page.waitForTimeout(1800);
 await page.locator('#pauseBtn').click();
 const report=await page.evaluate(()=>window.__diagnosticTest.report());
 expect(report.kind).toBe('cineglobo-simulator-performance-report');
 expect(report.notes.some(note=>note.includes('não são medições exatas da GPU'))).toBe(true);
 expect(Object.keys(report.areas).length).toBeGreaterThan(0);
 const hall=report.areas.Hall||Object.values(report.areas)[0];
 expect(hall.frames).toBeGreaterThan(0);
 expect(hall.frameIntervalP95ms).toBeGreaterThan(0);
 expect(hall.maxDrawCalls).toBeGreaterThan(0);
 expect(report.activeObservedSeconds).toBeGreaterThan(0);
 expect(report.activeTwentyMinuteSampleReached).toBe(false);
 expect(report.contextLossCount).toBe(0);
 expect(report.geometryCountAtStart).toBeGreaterThan(0);
 expect(report.geometryCountPeak).toBeGreaterThanOrEqual(report.geometryCountAtStart);
 expect(report.notes.some(note=>note.includes('20 minutos'))).toBe(true);

 expect(Number.isFinite(hall.observedFps)).toBe(true);
 expect(errors).toEqual([]);
});
