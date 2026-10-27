/**
 * Painel de diagnóstico opt-in. Medidas são amostras do navegador em execução,
 * não benchmarks certificados; p95 avalia intervalos entre quadros renderizados.
 */
export function createPerformanceMonitor(renderer,getArea){
 const root=document.createElement('pre');
 root.id='cinegloboTechnicalMonitor';
 root.setAttribute('role','status');
 root.setAttribute('aria-label','Métricas técnicas do simulador');
 Object.assign(root.style,{position:'fixed',right:'max(8px, env(safe-area-inset-right))',top:'max(84px, env(safe-area-inset-top))',zIndex:'8',margin:'0',padding:'10px',maxWidth:'min(300px, 85vw)',background:'rgba(9,14,20,.90)',color:'#e8e9df',border:'1px solid #a7845e',borderRadius:'9px',font:'11px/1.45 ui-monospace, monospace',pointerEvents:'none',whiteSpace:'pre-wrap',display:'none'});
 document.body.appendChild(root);
 let enabled=false,previous=0,elapsed=0,frames=0,lastPaint=0;
 const intervals=[];
 const countKnownTransfers=()=>{
   if(!performance.getEntriesByType)return 'indisponível';
   const entries=performance.getEntriesByType('resource');
   const bytes=entries.reduce((n,e)=>n+(e.transferSize||0),0);
   return bytes?((bytes/1048576).toFixed(2)+' MB*'):'não mensurável';
 };
 const reset=()=>{previous=0;lastPaint=0;elapsed=0;frames=0;intervals.length=0;};
 function record(now){
   if(!enabled)return;
   if(previous){
     const ms=now-previous;
     if(ms>0&&ms<500){intervals.push(ms);if(intervals.length>180)intervals.shift();elapsed+=ms;frames++;}
   }
   previous=now;
   if(now-lastPaint<1000)return;
   lastPaint=now;
   const sorted=[...intervals].sort((a,b)=>a-b);
   const p95=sorted.length?sorted[Math.ceil(sorted.length*.95)-1]:0;
   const info=renderer.info;
   const fps=elapsed>0?1000*frames/elapsed:0;
   root.textContent=[
    'CINEGLOBO | DIAGNÓSTICO',
    'Área: '+String(getArea()),
    'FPS observados: '+fps.toFixed(1),
    'Intervalo p95: '+p95.toFixed(1)+' ms',
    'Draw calls: '+info.render.calls,
    'Triângulos: '+info.render.triangles.toLocaleString('pt-BR'),
    'Geometrias: '+info.memory.geometries,
    'Texturas: '+info.memory.textures,
    'Pixel ratio: '+renderer.getPixelRatio().toFixed(2),
    'Transferência conhecida: '+countKnownTransfers(),
    '*Pode excluir cache/CDN. Não equivale ao peso total.',
    'Medições válidas somente neste dispositivo.'
   ].join('\n');
 }
 function setEnabled(next){enabled=Boolean(next);root.style.display=enabled?'block':'none';reset();if(enabled)root.textContent='Coletando medições do navegador...';return enabled;}
 return {record,reset,setEnabled,isEnabled:()=>enabled};
}
