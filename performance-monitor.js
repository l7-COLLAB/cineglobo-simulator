/**
 * Instrumentação opcional do CineGlobo Simulator.
 * Dados coletados somente no navegador e exportados apenas por ação do usuário.
 * Intervalos de renderização não equivalem a tempo exato de GPU.
 */
export function createPerformanceMonitor(renderer,getArea){
 const root=document.createElement('pre');
 root.id='cinegloboTechnicalMonitor';
 root.setAttribute('role','status');
 root.setAttribute('aria-label','Métricas técnicas do simulador');
 Object.assign(root.style,{
  position:'fixed',right:'max(8px, env(safe-area-inset-right))',
  top:'max(84px, env(safe-area-inset-top))',zIndex:'8',
  margin:'0',padding:'10px',maxWidth:'min(300px, 85vw)',
  background:'rgba(9,14,20,.90)',color:'#e8e9df',
  border:'1px solid #a7845e',borderRadius:'9px',
  font:'11px/1.45 ui-monospace, monospace',
  pointerEvents:'none',whiteSpace:'pre-wrap',display:'none'
 });
 document.body.appendChild(root);
 let enabled=false,previous=0,lastPaint=0,initialGeometries=null,peakGeometries=0,contextLossCount=0;
 renderer.domElement.addEventListener('webglcontextlost',()=>{contextLossCount++});
 const recent=[],areas=new Map();
 function percentile(values,p=.95){
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return Math.round(sorted[Math.ceil(sorted.length*p)-1]*10)/10;
 }
 function countKnownTransfers(){
  const records=performance.getEntriesByType?.('resource')||[];
  const bytes=records.reduce((n,e)=>n+(Number(e.transferSize)||0),0);
  return bytes||null; // pode excluir cache e transferências cross-origin
 }
 function reset(){
  previous=0;lastPaint=0;recent.length=0;
  // Preserva histórico por área para exportar depois de pausar ou ocultar aba.
 }
 function setEnabled(next){
  const wasEnabled=enabled;
  enabled=Boolean(next);
  root.style.display=enabled?'block':'none';
  reset();
  if(enabled&&!wasEnabled){areas.clear();initialGeometries=renderer.info.memory.geometries;peakGeometries=initialGeometries;contextLossCount=0;root.textContent='Coletando medições do navegador...'}
  return enabled;
 }
 function record(now){
  if(!enabled)return;
  if(previous){
   const elapsed=now-previous;
   // Abas suspensas e grandes interrupções não contaminam os percentis.
   if(elapsed>0&&elapsed<200){
    const area=String(getArea());
    let a=areas.get(area);
    if(!a){a={frames:0,elapsedMs:0,intervals:[],callsSum:0,trianglesSum:0,maxCalls:0,maxTriangles:0};areas.set(area,a)}
    a.frames++;a.elapsedMs+=elapsed;
    a.intervals.push(elapsed);if(a.intervals.length>360)a.intervals.shift();
    a.callsSum+=renderer.info.render.calls;
    a.trianglesSum+=renderer.info.render.triangles;
    a.maxCalls=Math.max(a.maxCalls,renderer.info.render.calls);
    a.maxTriangles=Math.max(a.maxTriangles,renderer.info.render.triangles);
    recent.push(elapsed);if(recent.length>180)recent.shift();
   }
  }
  previous=now;
  peakGeometries=Math.max(peakGeometries,renderer.info.memory.geometries);
  if(now-lastPaint<1000)return;
  lastPaint=now;
  const current=String(getArea());
  const a=areas.get(current);
  const fps=a?.elapsedMs?1000*a.frames/a.elapsedMs:0;
  const trackedSeconds=Array.from(areas.values()).reduce((n,a)=>n+a.elapsedMs,0)/1000;
  root.textContent=[
   'CINEGLOBO | DIAGNÓSTICO',
   'Área: '+current,
   'FPS observados na área: '+fps.toFixed(1),
   'Teste 20 min ativo: '+(trackedSeconds/60).toFixed(1)+'/20,0 min',
   'Contexto WebGL perdido: '+contextLossCount+' vez(es)',
   'Intervalo p95 recente: '+(percentile(recent)?.toFixed(1)||'--')+' ms',
   'Draw calls: '+renderer.info.render.calls,
   'Triângulos: '+renderer.info.render.triangles.toLocaleString('pt-BR'),
   'Geometrias: '+renderer.info.memory.geometries,
   'Texturas: '+renderer.info.memory.textures,
   'Pixel ratio: '+renderer.getPixelRatio().toFixed(2),
   'Transferência conhecida: '+(countKnownTransfers()===null?'não mensurável':(countKnownTransfers()/1048576).toFixed(2)+' MB*'),
   '*Valores de cache/CDN podem estar ausentes.',
   'Sem envio automático. Exporte no menu de pausa.'
  ].join('\n');
 }
 function getReport(){
  const byArea={};
  for(const [name,a] of areas){
   byArea[name]={
    frames:a.frames,
    durationSeconds:Math.round(a.elapsedMs/100)/10,
    observedFps:a.elapsedMs?Math.round((1000*a.frames/a.elapsedMs)*10)/10:null,
    frameIntervalP95ms:percentile(a.intervals),
    averageDrawCalls:a.frames?Math.round(a.callsSum/a.frames):null,
    maxDrawCalls:a.maxCalls,
    averageTriangles:a.frames?Math.round(a.trianglesSum/a.frames):null,
    maxTriangles:a.maxTriangles
   };
  }
  const trackedSeconds=Array.from(areas.values()).reduce((n,a)=>n+a.elapsedMs,0)/1000;
  return {
   kind:'cineglobo-simulator-performance-report',
   activeObservedSeconds:Math.round(trackedSeconds*10)/10,
   activeTwentyMinuteSampleReached:trackedSeconds>=1200,
   contextLossCount,
   geometryCountAtStart:initialGeometries,
   geometryCountPeak:peakGeometries,
   geometryCountChange:initialGeometries===null?null:renderer.info.memory.geometries-initialGeometries,
   generatedAt:new Date().toISOString(),
   browser:navigator.userAgent,
   pixelRatio:renderer.getPixelRatio(),
   canvasSize:{width:renderer.domElement.width,height:renderer.domElement.height},
   geometryCount:renderer.info.memory.geometries,
   textureCount:renderer.info.memory.textures,
   knownTransferredBytes:countKnownTransfers(),
   notes:[
    'Medições de intervalos entre quadros desenhados; não são medições exatas da GPU.',
    'FPS limitados pelas configurações e por possíveis restrições de economia de energia.',
    'Transferência pode excluir cache e conteúdo cross-origin.',
    'Relatório local: não é enviado automaticamente a um servidor.',
    'Teste de 20 minutos mede tempo ativo amostrado; não substitui avaliação física de aquecimento, memória, bateria ou Safari.',
    'Contextos WebGL perdidos são contados, não há garantia de recuperação automática.'
   ],
   areas:byArea
  };
 }
 return {record,reset,setEnabled,isEnabled:()=>enabled,getReport};
}
