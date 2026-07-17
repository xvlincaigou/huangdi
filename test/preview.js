/* 场景预览：把每个场景渲染成 SVG 文件，供 rsvg-convert 转 PNG */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCENES as S } from '../src/scenes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, 'preview');
fs.mkdirSync(out, { recursive: true });

const CSS = '<style>text{font-family:STKaiti,KaiTi,serif}.lbl{fill:#e8c85a;stroke:#2a1f14;stroke-width:3;paint-order:stroke;letter-spacing:2px}.plq{font-family:STKaiti,KaiTi,serif}</style>';

const jobs = {
  banner: () => S.banner(),
  court: () => S.court(),
  map_day: () => S.map(1),
  map_night: () => S.map(3),
  harem: () => S.harem(3),
  study: () => S.study(),
  martial: () => S.martial(1),
  music: () => S.music(),
  temple: () => S.temple(1),
  hunt: () => S.hunt(1),
  doctor: () => S.doctor(),
  yipinlou: () => S.yipinlou(2),
  lihuayuan: () => S.lihuayuan(),
  alchemy: () => S.alchemy(),
  rest: () => S.rest(),
  sleep: () => S.sleep(),
  warmap: () => S.warmap([{ name: '日本', done: true }, { name: '突厥', done: false }, { name: '吐蕃', done: false }, { name: '印度', done: false }, { name: '波斯', done: false }]),
  ending: () => S.ending()
};

for (const [name, fn] of Object.entries(jobs)) {
  let svg = fn();
  svg = svg.replace('xmlns="http://www.w3.org/2000/svg">', 'xmlns="http://www.w3.org/2000/svg">' + CSS);
  fs.writeFileSync(path.join(out, name + '.svg'), svg);
}
console.log('已生成 ' + Object.keys(jobs).length + ' 个场景 SVG 到 ' + out);
