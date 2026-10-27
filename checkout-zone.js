import * as THREE from 'three';

// Acabamentos originais, demonstrativos e econômicos para a região de atendimento.
// Não modificam colisores, pontos de venda, preços ou regras de aprovação.
const unit=new THREE.BoxGeometry(1,1,1);
const white=new THREE.MeshBasicMaterial({color:0xf0e7d7});
const brass=new THREE.MeshStandardMaterial({color:0xa78a5b,metalness:.42,roughness:.55});
const wine=new THREE.MeshStandardMaterial({color:0x622330,roughness:.74});
const charcoal=new THREE.MeshStandardMaterial({color:0x22252d,roughness:.86});
const paperGeo=new THREE.PlaneGeometry(.255,.26);

function makeLabel(title,subtitle,width=1.9,height=.53){
  const c=document.createElement('canvas');c.width=512;c.height=160;
  const ctx=c.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,160);
  gradient.addColorStop(0,'#27242b');gradient.addColorStop(1,'#10141b');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,512,160);
  ctx.strokeStyle='#b69a6b';ctx.lineWidth=7;ctx.strokeRect(8,8,496,144);
  ctx.textAlign='center';ctx.fillStyle='#f6e7c9';ctx.font='bold 37px sans-serif';
  ctx.fillText(title,256,69);
  ctx.fillStyle='#d2b78c';ctx.font='23px sans-serif';ctx.fillText(subtitle,256,115);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
}
function cube(group,mat,pos,size){
  const mesh=new THREE.Mesh(unit,mat);mesh.position.set(...pos);mesh.scale.set(...size);group.add(mesh);return mesh;
}
function instanced(group,mat,values){
  const mesh=new THREE.InstancedMesh(unit,mat,values.length);
  const proxy=new THREE.Object3D();
  values.forEach(([x,y,z,w,h,d],i)=>{
    proxy.position.set(x,y,z);proxy.scale.set(w,h,d);proxy.updateMatrix();
    mesh.setMatrixAt(i,proxy.matrix);
  });
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();group.add(mesh);return mesh;
}

export function createCheckoutZone(scene){
  const decor=new THREE.Group();decor.name='Zona de atendimento | acabamento';scene.add(decor);
  // Faixa frontal do caixa: aplicada sobre a face já existente; sem criar balcão/colisor novo.
  cube(decor,wine,[-4.6,.78,-2.835],[4.75,.74,.045]);
  cube(decor,charcoal,[-4.6,.78,-2.798],[2.7,.36,.026]);
  const branding=makeLabel('CINE GLOBO','BILHETERIA · TREINAMENTO',2.54,.48);
  branding.position.set(-4.6,.82,-2.766);decor.add(branding);
  // Frisos em instâncias: detalhe perto do aluno com baixa contagem de draw calls.
  const trims=[];
  for(let x=-6.79;x<=-2.3;x+=.45)trims.push([x,1.105,-2.808,.025,.045,.035]);
  trims.push([-4.6,.40,-2.798,4.67,.026,.03]);
  instanced(decor,brass,trims);
  // Molduras de vidro e cardápio traseiro, sem transparência/reflexos em tempo real.
  const backPanel=makeLabel('BOMBONIERE','PIPOCAS · BEBIDAS · COMBOS',2.45,.74);
  backPanel.position.set(3.72,3.13,-8.33);decor.add(backPanel);
  const shelves=[];
  for(const y of [1.02,1.58,2.14])shelves.push([3.7,y,-8.38,3.65,.075,.47]);
  instanced(decor,charcoal,shelves);
  // Recipientes decorativos em uma só instância. Objetos não são ingredientes interativos.
  const containers=[];
  for(let level=0;level<2;level++)for(let i=0;i<6;i++)
    containers.push([2.32+i*.55,1.19+level*.55,-8.36,.25,.27,.25]);
  instanced(decor,wine,containers);
  // Placas visuais discretas do fluxo de atendimento, sem bloquear circulação.
  const customerMarker=makeLabel('ATENDIMENTO','AGUARDE SUA VEZ',1.48,.4);
  customerMarker.position.set(-4.65,1.99,-2.65);
  customerMarker.visible=false;decor.add(customerMarker);

  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
  const ink=canvas.getContext('2d');
  const receiptTexture=new THREE.CanvasTexture(canvas);
  receiptTexture.colorSpace=THREE.SRGBColorSpace;
  const receiptMat=new THREE.MeshBasicMaterial({map:receiptTexture,side:THREE.DoubleSide,transparent:true,depthWrite:false});
  const receipt=new THREE.Mesh(paperGeo,receiptMat);
  // Impressora no mundo após a rotação do conjunto de periféricos, no lado do operador.
  receipt.position.set(-4.55,1.55,-3.548);receipt.name='Comprovante fictício na impressora';
  receipt.visible=false;decor.add(receipt);

  let mode='idle',progress=0,callback=null,customer=null;
  function print(order){
    const ticket=order||{};
    ink.fillStyle='#f7f3e9';ink.fillRect(0,0,256,320);
    ink.fillStyle='#25313c';ink.textAlign='center';
    ink.font='bold 27px sans-serif';ink.fillText('CINE GLOBO',128,48);
    ink.font='bold 21px sans-serif';ink.fillText('SEM VALIDADE',128,91);
    ink.font='19px sans-serif';ink.fillText('SIMULADOR',128,125);
    ink.font='18px sans-serif';ink.fillText(String(ticket.film||'SESSÃO').slice(0,19),128,177);
    ink.fillText(String(ticket.time||'--:--')+' · '+String(ticket.room||'SALA'),128,212);
    ink.fillText(String(ticket.seats||'--').slice(0,24),128,250);
    ink.font='15px sans-serif';ink.fillText('TREINAMENTO FICTÍCIO',128,292);
    receiptTexture.needsUpdate=true;
    receipt.visible=true;mode='printing';progress=0;callback=null;
    receipt.position.set(-4.55,1.55,-3.548);
  }
  function reset(){
    mode='idle';progress=0;callback=null;receipt.visible=false;
    if(customer?.userData?.demoTicket)customer.userData.demoTicket.visible=false;
    customer=null;customerMarker.visible=false;
  }
  function beginHandoff(person,done){
    if(mode==='handoff')return false;
    customer=person||null;callback=typeof done==='function'?done:null;
    progress=0;mode='handoff';receipt.visible=true;
    // Permite acompanhar a passagem do comprovante da impressora até o cliente.
    receipt.position.set(-4.55,1.70,-3.548);
    return true;
  }
  function tick(dt){
    if(mode==='idle')return;
    progress+=Math.max(0,dt);
    if(mode==='printing'){
      const t=Math.min(1,progress/.65);
      receipt.position.y=1.55+t*.16;
      if(t===1)mode='printed';
    }else if(mode==='handoff'){
      const t=Math.min(1,progress/1.1);
      receipt.position.y=1.71-.38*t;
      receipt.position.z=-3.548+1.60*t;
      receipt.position.x=-4.55-.10*t;
      if(t===1){
        receipt.visible=false;mode='idle';
        if(customer){
          let held=customer.userData.demoTicket;
          if(!held){
            held=new THREE.Mesh(new THREE.PlaneGeometry(.18,.22),white);
            held.name='Ingresso fictício recebido pelo cliente';
            held.position.set(-.23,1.2,-.18);
            customer.add(held);customer.userData.demoTicket=held;
          }
          held.visible=true;
        }
        const fn=callback;callback=null;if(fn)fn();
      }
    }
  }
  return {print,reset,beginHandoff,tick,sceneRoot:decor};
}
