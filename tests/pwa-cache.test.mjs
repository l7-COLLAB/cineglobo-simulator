import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

test('PWA lista todos os módulos locais exigidos pela versão integrada',()=>{
 const sw=readFileSync('sw.js','utf8');
 assert.match(sw,/cineglobo-v24-integrated/);
 const resources=['index.html','visuals.js','training-rules.mjs','performance-monitor.js','checkout-zone.js','character-kit.js','static-batching.js','manifest.webmanifest','icon.svg'];
 for(const file of resources){
  assert.equal(existsSync(file),true,`O módulo ${file} deve existir na distribuição`);
  assert.ok(sw.includes(`"./${file}"`),`O service worker deve precachear ${file}`);
 }
 assert.match(sw,/event\.request\.method!=='GET'/);
});
