import * as THREE from 'three';

/**
 * Kit de personagens originais para o cinema.
 * Não necessita de GLB, CDN adicional, animação esquelética ou texturas externas.
 * Geometrias e materiais são compartilhados; poses permanecem independentes.
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
let badgeMaterial=null;
function uniformBadge(){
 if(badgeMaterial)return badgeMaterial;
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=72;
 const context=canvas.getContext('2d');
 context.fillStyle='#191c22';context.fillRect(0,0,128,72);
 context.strokeStyle='#c0a06d';context.lineWidth=5;context.strokeRect(3,3,122,66);
 context.font='bold 42px sans-serif';context.textAlign='center';context.fillStyle='#f7e8d2';context.fillText('CG',64,51);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 badgeMaterial=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
 return badgeMaterial;
}
function mesh(group,geo,mat,x,y,z){
 const obj=new THREE.Mesh(geo,mat);obj.position.set(x,y,z);group.add(obj);return obj;
}
/**
 * @returns THREE.Group com userData.walkingLimbs e controles de braços legados
 */
export function createCinemaCharacter({role='cliente',uniformColor=0x46647a,skinColor=0xbb8665,hairColor=0x292124}={}){
 const worker=role!=='cliente';
 const root=new THREE.Group();
 root.name=worker?'Funcionário virtual · '+role:'Cliente virtual · atendimento';
 const cloth=material(uniformColor);
 const skin=material(skinColor,'skin');
 const dark=material(0x262b34);
 const hair=material(hairColor,'hair');

 const torso=mesh(root,geometry.torso,cloth,0,1.215,0);
 torso.scale.set(1.12,1,1.18);
 mesh(root,geometry.neck,skin,0,1.65,0);
 mesh(root,geometry.head,skin,0,1.81,0);
 mesh(root,geometry.hair,hair,0,1.858,-.016);
 mesh(root,geometry.nose,skin,0,1.79,.165);
 // Dois olhos em uma chamada de desenho, com o mesmo material.
 const eyes=new THREE.InstancedMesh(geometry.eye,eyesMaterial,2);
 const eyeTransform=new THREE.Object3D();
 for(let i=0;i<2;i++){
   eyeTransform.position.set(i===0?-.061:.061,1.834,.149);
   eyeTransform.updateMatrix();eyes.setMatrixAt(i,eyeTransform.matrix);
 }
 eyes.computeBoundingSphere();root.add(eyes);

 // Articulações independentes por personagem, sem recriar material/geometria.
 const walkingLimbs=[];
 for(const side of [-1,1]){
   const leg=new THREE.Group();leg.position.set(side*.105,.845,0);root.add(leg);
   mesh(leg,geometry.pants,dark,0,-.36,0);
   const shoe=mesh(leg,geometry.shoe,dark,0,-.71,.085);
   shoe.scale.set(1.05,.52,1.56);
   const arm=new THREE.Group();arm.position.set(side*.264,1.53,0);root.add(arm);
   const sleeve=mesh(arm,geometry.sleeve,cloth,side*.012,-.215,0);
   sleeve.rotation.z=side*.07;
   mesh(arm,geometry.hand,skin,side*.02,-.49,.015);
   walkingLimbs.push({leg,arm,side});
   root.userData['arm'+side]=arm;
 }
 root.userData.walkingLimbs=walkingLimbs;
 root.userData.characterRole=role;

 if(worker){
   const collar=mesh(root,geometry.collar,material(0x171b21),0,1.595,.011);
   collar.rotation.x=Math.PI/2;
   mesh(root,geometry.badge,uniformBadge(),.082,1.45,.213);
   if(role==='bomboniere'){
     mesh(root,geometry.cap,material(0x1c1e25),0,1.906,-.014);
     mesh(root,geometry.visor,material(0x1c1e25),0,1.908,.155);
   }
 }
 return root;
}
