import * as THREE from 'three';

/**
 * Kit de personagens procedurais otimizado para o navegador.
 * Um único desenho para torso/rosto/cabelo, um por braço e um por perna.
 * Preserva articulações independentes, olhos, badge e fala dinâmica.
 * Geometrias de pernas são compartilhadas entre todos os personagens.
 */
const geometry={
 torso:new THREE.CylinderGeometry(.195,.155,.74,12),
 neck:new THREE.CylinderGeometry(.075,.088,.13,10),
 head:new THREE.SphereGeometry(.168,14,10),
 hair:new THREE.SphereGeometry(.173,14,8,0,Math.PI*2,0,Math.PI*.52),
 sleeve:new THREE.CylinderGeometry(.082,.069,.45,10),
 hand:new THREE.SphereGeometry(.064,10,8),
 pants:new THREE.CylinderGeometry(.106,.083,.70,10),
 shoe:new THREE.SphereGeometry(.125,10,8),
 eye:new THREE.SphereGeometry(.014,7,5),
 nose:new THREE.SphereGeometry(.025,7,5),
 collar:new THREE.TorusGeometry(.09,.012,6,16),
 cap:new THREE.SphereGeometry(.18,12,8,0,Math.PI*2,0,Math.PI*.43),
 visor:new THREE.BoxGeometry(.27,.026,.16),
 badge:new THREE.PlaneGeometry(.16,.085)
};
const cachedMaterials=new Map();
function material(color,kind='fabric'){
 const key=String(color)+'-'+kind;
 if(!cachedMaterials.has(key))cachedMaterials.set(key,new THREE.MeshStandardMaterial({
  color,metalness:0,roughness:kind==='skin'?.86:kind==='hair'?.92:.95
 }));
 return cachedMaterials.get(key);
}
const eyesMaterial=material(0x2c2424,'hair');
const rigidMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.91,metalness:0,vertexColors:true});
const sharedLegMaterial=material(0x262b34);
let badgeMaterial=null;
function uniformBadge(){
 if(badgeMaterial)return badgeMaterial;
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=72;
 const context=canvas.getContext('2d');
 context.fillStyle='#191c22';context.fillRect(0,0,128,72);
 context.strokeStyle='#c0a06d';context.lineWidth=5;context.strokeRect(3,3,122,66);
 context.font='bold 42px sans-serif';context.textAlign='center';context.fillStyle='#f7e8d2';
 context.fillText('CG',64,51);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 badgeMaterial=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
 return badgeMaterial;
}
/**
 * Combina apenas geometria de peças rígidas de um mesmo referencial local.
 * Cada cor original vira atributo RGB por vértice. Não mescla textura, rigging,
 * animações, instâncias ou hierarquias; as articulações continuam como Groups.
 */
function combineRigidParts(parts,{colors=true}={}){
 const prepared=[];
 let vertexCount=0;
 const temp=new THREE.Object3D();
 for(const part of parts){
  const {geo,at=[0,0,0],scale=[1,1,1],rotation=[0,0,0]}=part;
  temp.position.set(...at);temp.scale.set(...scale);temp.rotation.set(...rotation);temp.updateMatrix();
  const copy=geo.index?geo.toNonIndexed():geo.clone();
  copy.applyMatrix4(temp.matrix);
  const count=copy.attributes.position.count;
  if(!copy.attributes.normal||copy.attributes.normal.count!==count){copy.dispose();throw new Error('Geometria inválida no personagem')}
  prepared.push({copy,count,color:new THREE.Color(part.color??0xffffff)});
  vertexCount+=count;
 }
 const position=new Float32Array(vertexCount*3),normal=new Float32Array(vertexCount*3);
 const color=colors?new Float32Array(vertexCount*3):null;
 let offset=0;
 for(const part of prepared){
  const p=part.copy.getAttribute('position'),n=part.copy.getAttribute('normal');
  for(let i=0;i<part.count;i++){
   const dest=(offset+i)*3;
   position[dest]=p.getX(i);position[dest+1]=p.getY(i);position[dest+2]=p.getZ(i);
   normal[dest]=n.getX(i);normal[dest+1]=n.getY(i);normal[dest+2]=n.getZ(i);
   if(color){color[dest]=part.color.r;color[dest+1]=part.color.g;color[dest+2]=part.color.b}
  }
  offset+=part.count;
  part.copy.dispose();
 }
 const final=new THREE.BufferGeometry();
 final.setAttribute('position',new THREE.BufferAttribute(position,3));
 final.setAttribute('normal',new THREE.BufferAttribute(normal,3));
 if(color)final.setAttribute('color',new THREE.BufferAttribute(color,3));
 final.computeBoundingSphere();
 return final;
}
const sharedLegGeometry=combineRigidParts([
 {geo:geometry.pants,at:[0,-.36,0]},
 {geo:geometry.shoe,at:[0,-.71,.085],scale:[1.05,.52,1.56]}
],{colors:false});
const mainCache=new Map();
const armCache=new Map();
function faceGeometry(role,uniformColor,skinColor,hairColor){
 const worker=role!=='cliente';
 const signature=[role,uniformColor,skinColor,hairColor].join(':');
 if(mainCache.has(signature))return mainCache.get(signature);
 const pieces=[
  {geo:geometry.torso,at:[0,1.215,0],scale:[1.12,1,1.18],color:uniformColor},
  {geo:geometry.neck,at:[0,1.65,0],color:skinColor},
  {geo:geometry.head,at:[0,1.81,0],color:skinColor},
  {geo:geometry.hair,at:[0,1.858,-.016],color:hairColor},
  {geo:geometry.nose,at:[0,1.79,.165],color:skinColor},
  {geo:geometry.eye,at:[-.061,1.834,.149],color:0x2c2424},
  {geo:geometry.eye,at:[.061,1.834,.149],color:0x2c2424}
 ];
 if(worker){
  pieces.push({geo:geometry.collar,at:[0,1.595,.011],rotation:[Math.PI/2,0,0],color:0x171b21});
  pieces.push({geo:geometry.cap,at:[0,1.906,-.014],color:0x111315});
  pieces.push({geo:geometry.visor,at:[0,1.908,.155],color:0x111315});
 }
 const final=combineRigidParts(pieces);
 mainCache.set(signature,final);
 return final;
}
function armGeometry(side,uniformColor,skinColor){
 const key=[side,uniformColor,skinColor].join(':');
 if(armCache.has(key))return armCache.get(key);
 const combined=combineRigidParts([
  {geo:geometry.sleeve,at:[side*.012,-.215,0],rotation:[0,0,side*.07],color:uniformColor},
  {geo:geometry.hand,at:[side*.02,-.49,.015],color:skinColor}
 ]);
 armCache.set(key,combined);
 return combined;
}
export function createCinemaCharacter({role='cliente',uniformColor=0x46647a,skinColor=0xbb8665,hairColor=0x292124}={}){
 const worker=role!=='cliente';
 // Uniforme Cine Globo: mesmo preto e boné em Caixa, Bomboniere e Sala.
 if(worker)uniformColor=0x111315;
 const root=new THREE.Group();
 root.name=worker?'Funcionário virtual · '+role:'Cliente virtual · atendimento';
 const torso=new THREE.Mesh(faceGeometry(role,uniformColor,skinColor,hairColor),rigidMaterial);
 torso.name='Corpo e rosto · malha agrupada';
 root.add(torso);
 // Os olhos já são geometrias coloridas da cabeça: sem draw call separado.
 const walkingLimbs=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.105,.845,0);root.add(leg);
  const legPiece=new THREE.Mesh(sharedLegGeometry,sharedLegMaterial);legPiece.name='Perna e calçado · malha compartilhada';leg.add(legPiece);
  const arm=new THREE.Group();arm.position.set(side*.264,1.53,0);root.add(arm);
  const armPiece=new THREE.Mesh(armGeometry(side,uniformColor,skinColor),rigidMaterial);
  armPiece.name='Manga e mão · malha agrupada';arm.add(armPiece);
  walkingLimbs.push({leg,arm,side});
  root.userData['arm'+side]=arm;
 }
 root.userData.walkingLimbs=walkingLimbs;
 root.userData.characterRole=role;
 if(worker){
  const capLogo=new THREE.Mesh(geometry.badge,uniformBadge());
  capLogo.name='Logo Cine Globo no boné';
  capLogo.position.set(0,1.934,.195);
  capLogo.scale.set(.78,.78,1);
  root.add(capLogo);
  root.userData.uniform={shirt:'preta',cap:'preto',logo:true};
 }
 root.userData.graphicOptimization={
  independentLimbs:4,
  originalBodyDraws:worker?8:5,
  bodyDraws:1,
  originalLimbDraws:8,
  limbDraws:4,
  badges:worker?1:0,
  eyes:0
 };
 return root;
}
