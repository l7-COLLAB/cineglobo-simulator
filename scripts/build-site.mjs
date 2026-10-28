/**
 * Monta o pacote estático do jogo, incluindo a biblioteca Three.js local.
 * Páginas do jogo e PWA não dependem de CDN nem de servidor de computador local.
 */
import {readdir,readFile,copyFile,mkdir,rm,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';

const root=resolve('.');
const dist=join(root,'dist');
const threePackage=join(root,'node_modules','three');
const rendererModule=join(threePackage,'build','three.module.js');
const thirdPartyLicense=join(threePackage,'LICENSE');
await stat(rendererModule).catch(()=>{throw new Error('Three.js não instalado. Execute npm install antes de npm run build.')});
await rm(dist,{recursive:true,force:true});
await mkdir(join(dist,'vendor'),{recursive:true});

const entries=await readdir(root,{withFileTypes:true});
const exported=[];
for(const entry of entries){
 if(!entry.isFile()||!(/\.(?:html|js|mjs|svg|webmanifest|png|jpg|jpeg|webp)$/.test(entry.name)))continue;
 await copyFile(join(root,entry.name),join(dist,entry.name));
 exported.push(entry.name);
}
await copyFile(rendererModule,join(dist,'vendor','three.module.js'));
await copyFile(thirdPartyLicense,join(dist,'vendor','three-LICENSE.txt'));

const html=await readFile(join(dist,'index.html'),'utf8');
const sw=await readFile(join(dist,'sw.js'),'utf8');
const mapping='<script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script>';
if(!html.includes(mapping)||!html.includes("import * as THREE from 'three'"))throw new Error('As importações do Three.js não estão apontando para vendor local.');
if(/cdn\.jsdelivr\.net|unpkg\.com|Soldier\.glb|GLTFLoader/.test(html))throw new Error('Dependência externa não removida da versão offline.');
const match=sw.match(/const LOCAL=(\[[^;]+\]);/);
if(!match)throw new Error('Service worker sem lista de pré-cache.');
const appShell=JSON.parse(match[1]);
if(!appShell.includes('./vendor/three.module.js'))throw new Error('Three.js precisa estar no pré-cache.');
for(const asset of appShell){
 const path=asset==='./'?'index.html':asset.replace(/^\.\//,'');
 await stat(join(dist,path)).catch(()=>{throw new Error('Recurso da PWA ausente no dist: '+asset)});
}
console.log('CineGlobo Simulator: pacote HTTPS/PWA gerado em dist/',{
 localFiles:exported.length,
 cachedFiles:appShell.length,
 threeVersion:'0.165.0'
});
