import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';

test('Pacote web do simulador não referencia projetos independentes',()=>{
 const files=readdirSync('.').filter(path=>/\.(?:html|js|mjs|svg|webmanifest)$/.test(path));
 assert.ok(files.includes('index.html'));
 assert.ok(files.includes('sw.js'));
 for(const path of files){
  const text=readFileSync(path,'utf8');
  assert.doesNotMatch(text,/arquivosombrio|arquivo[-_ ]sombrio|lw[-_ ]?tech|plouven|\.supabase\.co|pages\.dev/i, 'Referência cruzada inesperada em '+path);
 }
});

test('A distribuição copia somente recursos executáveis e licença da biblioteca local',()=>{
 const build=readFileSync('scripts/build-site.mjs','utf8');
 assert.match(build,/entry\.isFile\(\)/);
 assert.match(build,/\.\/vendor|three\.module\.js/);
 assert.match(build,/three-LICENSE\.txt/);
 assert.doesNotMatch(build,/copyFile\([^)]*\.env/);
});

test('Agenda escapa dados de sessão editados no navegador',()=>{
 const html=readFileSync('index.html','utf8');
 for(const field of ['time','film','room','format']){
  assert.ok(html.includes('escapeHtml(s.'+field+')'), 'Campo de agenda sem escape: '+field);
 }
 assert.doesNotMatch(html,/\$\{s\.time\} · \$\{s\.film\}/);
});
