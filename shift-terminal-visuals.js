import * as THREE from 'three';

/**
 * Decoração rígida dos terminais de turno.
 * Três InstancedMesh reutilizam exatamente três geometrias e três materiais.
 * Os pontos de toque/AGIR continuam entidades independentes no índice world.
 */
export function createShiftTerminalVisuals(scene,terminalPositions,inspectionPositions){
 const unit=new THREE.BoxGeometry(1,1,1);
 const metallic=new THREE.MeshStandardMaterial({color:0x9e7850,metalness:.28,roughness:.63});
 const dark=new THREE.MeshStandardMaterial({color:0x2c303b,roughness:.65});
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=200;
 const c=canvas.getContext('2d');c.fillStyle='#1b232e';c.fillRect(0,0,512,200);
 c.strokeStyle='#bc9160';c.lineWidth=8;c.strokeRect(10,10,492,180);
 c.fillStyle='#ecd9b9';c.textAlign='center';c.font='bold 39px Arial';c.fillText('CINE GLOBO',256,91);
 c.font='26px Arial';c.fillText('CONTROLE DE TURNO',256,145);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const screenMaterial=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
 const trimParts=[],darkParts=[],screens=[];
 const points=[];
 const register=(positions,name,type)=>{
  for(const position of positions){
   const anchor=new THREE.Group();anchor.name=position.name;
   anchor.position.set(position.x,0,position.z);
   anchor.userData.trainingInteraction=true;
   scene.add(anchor);
   points.push({...position,marker:anchor,type});
  }
 };
 register(terminalPositions,'Terminais','terminal');
 register(inspectionPositions,'Inspeções','inspection');
 const addPart=(arr,x,y,z,sx,sy,sz)=>{
  arr.push({x,y,z,sx,sy,sz});
 };
 for(const position of terminalPositions){
  const {x,z}=position;
  addPart(trimParts,x,.60,z,.12,.82,.14);
  addPart(darkParts,x,1.08,z,.76,.12,.46);
  addPart(screens,x,1.10,z+.239,.66,.27,1);
 }
 for(const position of inspectionPositions){
  const {x,z}=position;
  addPart(trimParts,x,1.04,z,.52,.13,.32);
  addPart(darkParts,x,1.24,z,.28,.29,.16);
 }
 const dummy=new THREE.Object3D();
 function addInstances(name,geometry,material,parts){
  const instance=new THREE.InstancedMesh(geometry,material,parts.length);
  instance.name=name;instance.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  parts.forEach((p,i)=>{
   dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,0);
   dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();
   instance.setMatrixAt(i,dummy.matrix);
  });
  instance.instanceMatrix.needsUpdate=true;
  instance.computeBoundingSphere();
  scene.add(instance);
  return instance;
 }
 const meshes=[
  addInstances('Turnos · acabamento metálico instanciado',unit,metallic,trimParts),
  addInstances('Turnos · gabinetes instanciados',unit,dark,darkParts),
  addInstances('Turnos · telas instanciadas',new THREE.PlaneGeometry(1,1),screenMaterial,screens)
 ];
 return {
  points,
  meshes,
  report:{
   legacyEstimatedDraws:terminalPositions.length*3+inspectionPositions.length*2,
   instancedDraws:meshes.length,
   instances:meshes.reduce((n,m)=>n+m.count,0),
   interactivePoints:points.length
  }
 };
}
