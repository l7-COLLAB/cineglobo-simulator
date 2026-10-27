import * as THREE from 'three';

/**
 * Agrupa caixas geométricas estáticas por material e área.
 * Cada instância preserva escala, rotação, posição e cor originais.
 * Nunca executa em elementos que exigem controle individual.
 */
const UNIT_CUBE=new THREE.BoxGeometry(1,1,1);

function isEligible(mesh,excluded){
 if(!mesh?.isMesh||mesh.isInstancedMesh||mesh.isSkinnedMesh||excluded.has(mesh))return false;
 if(mesh.visible===false||mesh.renderOrder!==0||mesh.castShadow||mesh.receiveShadow)return false;
 if(mesh.geometry?.type!=='BoxGeometry')return false;
 const p=mesh.geometry.parameters;
 if(!p||![p.width,p.height,p.depth].every(v=>Number.isFinite(v)&&v>0))return false;
 const m=mesh.material;
 if(!m?.isMeshStandardMaterial||Array.isArray(m))return false;
 if(m.transparent||m.opacity!==1||m.side!==THREE.FrontSide||m.vertexColors||m.wireframe)return false;
 if(m.emissive?.getHex()!==0||m.alphaTest!==0)return false;
 if(m.map||m.normalMap||m.roughnessMap||m.metalnessMap||m.aoMap||m.emissiveMap||m.alphaMap||m.envMap||m.lightMap||m.bumpMap||m.displacementMap)return false;
 if(m.skinning||m.morphTargets||m.morphNormals)return false;
 return true;
}
function materialKey(m){
 // A cor pode variar por instância; outros atributos visuais precisam coincidir.
 return [m.roughness,m.metalness,m.flatShading?1:0,m.toneMapped?1:0,m.depthTest?1:0,m.depthWrite?1:0,m.polygonOffset?1:0,m.fog?1:0].join(':');
}
export function batchStaticBoxes(parent,{exclude=[],minCount=2}={}){
 const excluded=new Set(exclude);
 const bins=new Map();
 // Apenas filhos diretos: não tocar em hierarquias animadas dos personagens,
 // portas, mãos, caldeirões, rack de EPIs ou objetos de interação.
 for(const obj of [...parent.children]){
  if(!isEligible(obj,excluded))continue;
  const key=materialKey(obj.material);
  if(!bins.has(key))bins.set(key,[]);
  bins.get(key).push(obj);
 }
 const report={groups:0,originalDraws:0,batchDraws:0,objectsReplaced:0};
 for(const group of bins.values()){
  if(group.length<minCount)continue;
  const source=group[0].material;
  const mergedMaterial=source.clone();
  mergedMaterial.color.set(0xffffff);
  const batch=new THREE.InstancedMesh(UNIT_CUBE,mergedMaterial,group.length);
  batch.name='Lote estático · '+parent.name;
  batch.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const pose=new THREE.Object3D();
  for(let i=0;i<group.length;i++){
   const original=group[i];
   pose.position.copy(original.position);
   pose.quaternion.copy(original.quaternion);
   const {width,height,depth}=original.geometry.parameters;
   pose.scale.set(original.scale.x*width,original.scale.y*height,original.scale.z*depth);
   pose.updateMatrix();
   batch.setMatrixAt(i,pose.matrix);
   batch.setColorAt(i,original.material.color);
  }
  batch.instanceMatrix.needsUpdate=true;
  if(batch.instanceColor)batch.instanceColor.needsUpdate=true;
  batch.computeBoundingSphere();
  // Preserva os demais objetos do mesmo pai, inclusive suas interações.
  group.forEach(mesh=>parent.remove(mesh));
  parent.add(batch);
  report.groups++;
  report.originalDraws+=group.length;
  report.batchDraws++;
  report.objectsReplaced+=group.length;
 }
 return report;
}
