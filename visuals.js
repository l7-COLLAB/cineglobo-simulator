import * as THREE from 'three';

// Texturas pequenas geradas localmente, sem imagens ou downloads adicionais.
function surfaceTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
 x.fillStyle=kind==='floor'?'#605852':'#28262b';x.fillRect(0,0,256,256);
 for(let i=0;i<1800;i++){const n=(i*73)%256,m=(i*127+Math.floor(i/256)*19)%256;x.fillStyle=i%2?'#ffffff08':'#0000000b';x.fillRect(n,m,2,2);}
 if(kind==='floor'){x.strokeStyle='#343133';x.lineWidth=2;x.strokeRect(1,1,254,254);}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(kind==='floor'?12:3,kind==='floor'?16:3);return texture;
}
export function upholsteredGeometry(w,h,d){
 const r=Math.min(w,h)*.16,s=new THREE.Shape(),a=-w/2,b=-h/2;
 s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
 const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:3});g.translate(0,0,-d/2);return g;
}
export function finishCinema(scene){
 const floor=surfaceTexture('floor'),wall=surfaceTexture('wall');
 // Modificar somente superfícies estruturais identificadas pela posição e dimensão.
 scene.children.forEach(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry')return;const p=o.geometry.parameters;
 if(p.width===17&&p.depth===22&&o.position.y<0){o.material.map=floor;o.material.color.set('#ffffff');o.material.roughness=.72;o.material.needsUpdate=true;}
 if(p.height===4&&Math.abs(o.position.x)>8){o.material.map=wall;o.material.color.set('#c3b6aa');o.material.needsUpdate=true;}
 if(p.width===5&&p.height===1.22){o.material.color.set('#8d1d2d');o.material.roughness=.46;}
 if(p.width===5&&p.height===1.4){o.material.color.set('#951f30');o.material.roughness=.46;}
 });
 const brass=new THREE.MeshStandardMaterial({color:'#b49459',metalness:.65,roughness:.4});
 const dark=new THREE.MeshStandardMaterial({color:'#17191e',roughness:.9});
 const warm=new THREE.MeshBasicMaterial({color:'#ffcb87'});
 const unit=new THREE.BoxGeometry(1,1,1);
 const parts=[];
 for(const side of [-1,1]){parts.push([side*8.18,.16,0,.08,.25,21.5]);parts.push([side*8.18,3.35,0,.08,.04,21.5]);}
 const strips=new THREE.InstancedMesh(unit,brass,parts.length),m=new THREE.Object3D();parts.forEach((p,i)=>{m.position.set(...p.slice(0,3));m.scale.set(...p.slice(3));m.updateMatrix();strips.setMatrixAt(i,m.matrix)});strips.computeBoundingSphere();scene.add(strips);
 // Painéis de programação decorativos e sinalização; nenhum novo obstáculo.
 for(const [i,z] of [-5,0,5].entries()){
 const frame=new THREE.Mesh(unit,dark);frame.position.set(8.18,2,z);frame.scale.set(.09,1.9,1.3);scene.add(frame);
 const c=document.createElement('canvas');c.width=256;c.height=384;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,256,384);grad.addColorStop(0,['#183849','#542532','#3d354c'][i]);grad.addColorStop(1,'#10151d');ctx.fillStyle=grad;ctx.fillRect(0,0,256,384);ctx.strokeStyle='#c6a064';ctx.lineWidth=2;ctx.strokeRect(12,12,232,360);ctx.fillStyle='#ead5b1';ctx.textAlign='center';ctx.font='bold 27px sans-serif';ctx.fillText('CINE GLOBO',128,65);ctx.font='18px sans-serif';ctx.fillText(['BEM-VINDO','BOMBONIERE','BOA SESSÃO'][i],128,230);ctx.font='13px sans-serif';ctx.fillText('AMBIENTE DE TREINAMENTO',128,320);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const poster=new THREE.Mesh(new THREE.PlaneGeometry(1.16,1.74),new THREE.MeshBasicMaterial({map:t}));poster.position.set(8.12,2,z);poster.rotation.y=-Math.PI/2;scene.add(poster);
 }
 const glow=new THREE.InstancedMesh(unit,warm,4);for(let i=0;i<4;i++){m.position.set(-6+i*4,3.58,0);m.scale.set(.04,.025,18);m.updateMatrix();glow.setMatrixAt(i,m.matrix)}glow.computeBoundingSphere();scene.add(glow);
 return {decorativeDrawCalls:8};
}
