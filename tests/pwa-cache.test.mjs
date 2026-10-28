import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

test('PWA lista todos os módulos locais exigidos pela versão integrada',()=>{
 const sw=readFileSync('sw.js','utf8');
 assert.match(sw,/cineglobo-v34-interacoes-touch/);
 const resources=['index.html','visuals.js','navigation.mjs','interaction-targeting.mjs','training-rules.mjs','performance-monitor.js','checkout-zone.js','character-kit.js','static-batching.js','popcorn-training.mjs','room-training.mjs','shift-training.mjs','shift-terminal-visuals.js','manifest.webmanifest','icon.svg'];
 for(const file of resources){
  assert.equal(existsSync(file),true,`O módulo ${file} deve existir na distribuição`);
  assert.ok(sw.includes(`"./${file}"`),`O service worker deve precachear ${file}`);
 }
 assert.ok(sw.includes('"./vendor/three.module.js"'),'O renderizador Three.js precisa fazer parte do cache offline');
 const html=readFileSync('index.html','utf8');
 assert.match(html,/"three":"\.\/vendor\/three\.module\.js"/);
 assert.doesNotMatch(html,/cdn\.jsdelivr\.net|unpkg\.com|Soldier\.glb|GLTFLoader/);
  assert.match(sw,/event\.request\.method!=='GET'/);
});
