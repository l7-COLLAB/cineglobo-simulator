import * as THREE from 'three';

// Texturas pequenas geradas localmente, sem imagens ou downloads adicionais.
// Texturas PBR leves e determinísticas: sem downloads, APIs externas ou imagens protegidas.
// Um atlas pequeno é repetido no cenário; detalhes finos continuam visíveis em dispositivos móveis.
function surfaceTexture(kind, relief=false){
 const c=document.createElement('canvas');c.width=c.height=256;
 const ctx=c.getContext('2d');
 let seed=kind==='floor'?113:kind==='wall'?227:341;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 if(kind==='floor'){
   ctx.fillStyle=relief?'#c0c0c0':'#403b39';ctx.fillRect(0,0,256,256);
   for(let y=0;y<4;y++)for(let x=0;x<4;x++){
     const v=relief?190+Math.floor(random()*26):0;
     ctx.fillStyle=relief?`rgb(${v},${v},${v})`:
       ['#655e58','#5e5a56','#68615b','#625d59'][Math.floor(random()*4)];
     ctx.fillRect(x*64+2,y*64+2,60,60);
     // Sulcos de rejunte e discreta diferença de relevo entre placas.
     ctx.fillStyle=relief?'#858585':'#34302f';
     ctx.fillRect(x*64,y*64,2,64);ctx.fillRect(x*64,y*64,64,2);
   }
 }else if(kind==='wall'){
   ctx.fillStyle=relief?'#c6c6c6':'#393538';ctx.fillRect(0,0,256,256);
   for(let x=0;x<256;x+=32){
     const v=relief?192+Math.floor(random()*13):0;
     ctx.fillStyle=relief?`rgb(${v},${v},${v})`:
       ['#393438','#3e393d','#363337','#403a3c'][Math.floor(random()*4)];
     ctx.fillRect(x+2,0,29,256);
     ctx.fillStyle=relief?'#969696':'#242126';ctx.fillRect(x,0,2,256);
   }
 }else{
   ctx.fillStyle=relief?'#c7c7c7':'#44353b';ctx.fillRect(0,0,256,256);
   for(let y=0;y<256;y+=4){
     ctx.fillStyle=relief?'#bdbdbd':y%8===0?'#4b3c41':'#403238';
     ctx.fillRect(0,y,256,1);
   }
 }
 const dots=kind==='floor'?2300:kind==='wall'?1800:1150;
 for(let i=0;i<dots;i++){
   const x=Math.floor(random()*256),y=Math.floor(random()*256);
   ctx.fillStyle=relief?(random()>.5?'#dadada':'#afafaf'):(random()>.5?'#ffffff0c':'#00000014');
   ctx.fillRect(x,y,1+Math.floor(random()*2),1);
 }
 const texture=new THREE.CanvasTexture(c);
 if(!relief)texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.repeat.set(kind==='floor'?6:kind==='wall'?2:3,kind==='floor'?9:kind==='wall'?2:5);
 texture.anisotropy=4;
 return texture;
}
function contactShadows(scene){
 // Sombra de contato pré-calculada: evita shadow maps dinâmicos, caros no Safari móvel.
 const c=document.createElement('canvas');c.width=c.height=128;
 const ctx=c.getContext('2d');
 const gradient=ctx.createRadialGradient(64,64,7,64,64,63);
 gradient.addColorStop(0,'rgba(0,0,0,.63)');
 gradient.addColorStop(.52,'rgba(0,0,0,.37)');
 gradient.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(c);
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 const geometry=new THREE.PlaneGeometry(1,1);
 for(const [name,x,z,w,d] of [
   ['Sombra da bilheteria',-4.6,-3.7,6.2,2.6],
   ['Sombra da bomboniere',3.7,-4.6,6.2,2.8],
   ['Sombra do sofá-ilha',0,2.8,4.2,6]
 ]){
   const shadow=new THREE.Mesh(geometry,material);
   shadow.name=name;shadow.rotation.x=-Math.PI/2;
   shadow.position.set(x,.026,z);shadow.scale.set(w,d,1);
   shadow.renderOrder=1;scene.add(shadow);
 }
}
export function upholsteredGeometry(w,h,d){
 const r=Math.min(w,h)*.16,s=new THREE.Shape(),a=-w/2,b=-h/2;
 s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
 const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:3});g.translate(0,0,-d/2);return g;
}
export function finishCinema(scene){
 const floor=surfaceTexture('floor'),wall=surfaceTexture('wall');
 const floorRelief=surfaceTexture('floor',true),wallRelief=surfaceTexture('wall',true);
 // Modificar somente superfícies estruturais identificadas pela posição e dimensão.
 scene.children.forEach(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry')return;const p=o.geometry.parameters;
 if(p.width===17&&p.depth===22&&o.position.y<0){o.material.map=floor;o.material.color.set('#ffffff');o.material.metalness=.06;o.material.roughness=.77;o.material.roughnessMap=floorRelief;o.material.bumpMap=floorRelief;o.material.bumpScale=.008;o.material.needsUpdate=true;}
 if(p.height===4&&Math.abs(o.position.x)>8){o.material.map=wall;o.material.color.set('#ffffff');o.material.metalness=0;o.material.roughness=.95;o.material.bumpMap=wallRelief;o.material.bumpScale=.003;o.material.needsUpdate=true;}
 if(p.width===5&&p.height===1.22){o.material.color.set('#713038');o.material.metalness=.13;o.material.roughness=.49;}
 if(p.width===5&&p.height===1.4){o.material.color.set('#7e343c');o.material.metalness=.10;o.material.roughness=.47;}
 });
 const brass=new THREE.MeshStandardMaterial({color:'#b49459',metalness:.65,roughness:.4});
 const dark=new THREE.MeshStandardMaterial({color:'#17191e',roughness:.9});
 const warm=new THREE.MeshBasicMaterial({color:'#ffcb87'});
 const unit=new THREE.BoxGeometry(1,1,1);
 const parts=[];
 for(const side of [-1,1]){parts.push([side*8.18,.16,0,.08,.25,21.5]);parts.push([side*8.18,3.35,0,.08,.04,21.5]);}
 const strips=new THREE.InstancedMesh(unit,brass,parts.length),m=new THREE.Object3D();parts.forEach((p,i)=>{m.position.set(...p.slice(0,3));m.scale.set(...p.slice(3));m.updateMatrix();strips.setMatrixAt(i,m.matrix)});strips.computeBoundingSphere();scene.add(strips);
 // Painéis de programação decorativos e sinalização; nenhum novo obstáculo.
 // Três molduras idênticas em uma única chamada, preservando cada cartaz.
 const posterFrames=new THREE.InstancedMesh(unit,dark,3);
 posterFrames.name='Molduras de cartazes do hall';
 for(const [i,z] of [-5,0,5].entries()){
   m.position.set(8.18,2,z);m.rotation.set(0,0,0);m.scale.set(.09,1.9,1.3);m.updateMatrix();
   posterFrames.setMatrixAt(i,m.matrix);
 }
 posterFrames.instanceMatrix.needsUpdate=true;posterFrames.computeBoundingSphere();scene.add(posterFrames);
 for(const [i,z] of [-5,0,5].entries()){
 const c=document.createElement('canvas');c.width=256;c.height=384;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,256,384);grad.addColorStop(0,['#183849','#542532','#3d354c'][i]);grad.addColorStop(1,'#10151d');ctx.fillStyle=grad;ctx.fillRect(0,0,256,384);ctx.strokeStyle='#c6a064';ctx.lineWidth=2;ctx.strokeRect(12,12,232,360);ctx.fillStyle='#ead5b1';ctx.textAlign='center';ctx.font='bold 27px sans-serif';ctx.fillText('CINE GLOBO',128,65);ctx.font='18px sans-serif';ctx.fillText(['BEM-VINDO','BOMBONIERE','BOA SESSÃO'][i],128,230);ctx.font='13px sans-serif';ctx.fillText('AMBIENTE DE TREINAMENTO',128,320);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const poster=new THREE.Mesh(new THREE.PlaneGeometry(1.16,1.74),new THREE.MeshBasicMaterial({map:t}));poster.position.set(8.12,2,z);poster.rotation.y=-Math.PI/2;scene.add(poster);
 }
 const glow=new THREE.InstancedMesh(unit,warm,4);for(let i=0;i<4;i++){m.position.set(-6+i*4,3.58,0);m.scale.set(.04,.025,18);m.updateMatrix();glow.setMatrixAt(i,m.matrix)}glow.computeBoundingSphere();scene.add(glow);
 // Etapa visual v2.1: detalhes de profundidade com geometria compartilhada.
 // Usamos instancing para reduzir o custo por objeto no iPhone.
 const trimMat=new THREE.MeshStandardMaterial({color:'#8c643f',metalness:.42,roughness:.55});
 const pathMat=new THREE.MeshStandardMaterial({color:'#ffffff',map:surfaceTexture('fabric'),roughness:.97});
 const trimParts=[];
 for(const side of [-1,1]){
   // Rodapés e guias embutidas, sem interferir em colisões.
   trimParts.push([side*7.92,.12,0,.075,.22,21.2]);
   trimParts.push([side*7.92,3.62,0,.075,.055,21.2]);
 }
 for(const z of [-8,-4,0,4,8])trimParts.push([0,.012,z,10,.015,.035]);
 const details=new THREE.InstancedMesh(unit,trimMat,trimParts.length);
 details.name='Acabamentos do hall';
 trimParts.forEach((p,i)=>{m.position.set(p[0],p[1],p[2]);m.scale.set(p[3],p[4],p[5]);m.rotation.set(0,0,0);m.updateMatrix();details.setMatrixAt(i,m.matrix);});
 details.instanceMatrix.needsUpdate=true;
 details.computeBoundingSphere();scene.add(details);
 const carpet=new THREE.Mesh(new THREE.PlaneGeometry(2.35,13),pathMat);
 carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.021,0);
 carpet.name='Passadeira de orientação';scene.add(carpet);
 // Placas 2D pequenas reutilizam a mesma textura para ambos os lados do hall.
 const cv=document.createElement('canvas');cv.width=512;cv.height=128;
 const cx=cv.getContext('2d');cx.fillStyle='#141920';cx.fillRect(0,0,512,128);
 cx.strokeStyle='#b48a50';cx.lineWidth=5;cx.strokeRect(7,7,498,114);
 cx.font='bold 35px sans-serif';cx.fillStyle='#f1d4a3';cx.textAlign='center';
 cx.fillText('CINE GLOBO',256,54);cx.font='23px sans-serif';
 cx.fillText('TREINAMENTO INTERATIVO',256,92);
 const st=new THREE.CanvasTexture(cv);st.colorSpace=THREE.SRGBColorSpace;
 const signMat=new THREE.MeshBasicMaterial({map:st,side:THREE.DoubleSide});
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.9,.72),signMat);
 sign.position.set(0,3.16,-9.7);sign.name='Identificação do cinema';scene.add(sign);
 contactShadows(scene);
 return {decorativeDrawCalls:14,visualProfile:'PBR procedural leve + sombra de contato'};
}
