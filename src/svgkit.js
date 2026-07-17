/* 皇帝成长计划 · 网页复刻版 —— SVG 场景库（纯代码生成的古风场景） */
/* ================= 基础工具 ================= */
// 确定性伪随机（用于星星等）
function lcg(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

// 时段天空
const SKIES = [
  ['#3a5a8c', '#e8a35c', '#f7d794'],  // 清晨
  ['#4a90c2', '#87c6e8', '#dceef5'],  // 晌午
  ['#2c2c54', '#c26a4a', '#e8a35c'],  // 晚上
  ['#070b1a', '#141c33', '#24304f']   // 深夜
];

function sky(id, p, w, h) {
  const c = SKIES[p] || SKIES[1];
  return '<defs><linearGradient id="' + id + '-sky" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/>' +
    '</linearGradient></defs><rect width="' + w + '" height="' + h + '" fill="url(#' + id + '-sky)"/>';
}

function stars(seed, n, w, h) {
  const r = lcg(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (r() * w).toFixed(1), y = (r() * h).toFixed(1), rad = (0.6 + r() * 1.2).toFixed(1), o = (0.35 + r() * 0.55).toFixed(2);
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="#fff" opacity="' + o + '"/>';
  }
  return s;
}

function sun(x, y, r, c) {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r * 2.2 + '" fill="' + c + '" opacity=".18"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + r * 1.4 + '" fill="' + c + '" opacity=".3"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/>';
}
function moon(x, y, r) {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r * 2 + '" fill="#f5ead0" opacity=".15"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f5ead0"/>' +
    '<circle cx="' + (x - r * .3) + '" cy="' + (y - r * .2) + '" r="' + r * .18 + '" fill="#d8cba8" opacity=".5"/>' +
    '<circle cx="' + (x + r * .25) + '" cy="' + (y + r * .3) + '" r="' + r * .12 + '" fill="#d8cba8" opacity=".4"/>';
}
// 按时段放天体
function celestial(p, w) {
  if (p === 0) return sun(w * 0.78, 88, 26, '#ffd76e');
  if (p === 1) return sun(w * 0.5, 60, 24, '#fff3b0');
  if (p === 2) return sun(w * 0.2, 150, 24, '#ff9a5c') + moon(w * 0.8, 60, 14);
  return moon(w * 0.76, 66, 22);
}

function cloud(x, y, s, o) {
  return '<g class="anim-cloud" opacity="' + o + '">' +
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + 26 * s + '" ry="' + 10 * s + '" fill="#fff"/>' +
    '<ellipse cx="' + (x - 18 * s) + '" cy="' + (y + 4 * s) + '" rx="' + 16 * s + '" ry="' + 7 * s + '" fill="#fff"/>' +
    '<ellipse cx="' + (x + 20 * s) + '" cy="' + (y + 4 * s) + '" rx="' + 18 * s + '" ry="' + 8 * s + '" fill="#fff"/>' +
    '<ellipse cx="' + (x + 2 * s) + '" cy="' + (y - 7 * s) + '" rx="' + 15 * s + '" ry="' + 8 * s + '" fill="#fff"/></g>';
}

function mtn(points, baseY, fill, o) {
  return '<polygon points="0,' + baseY + ' ' + points + ' 800,' + baseY + '" fill="' + fill + '" opacity="' + (o || 1) + '"/>';
}

function birds(x, y, s, c) {
  let r = '';
  for (let i = 0; i < 3; i++) {
    const dx = x + i * 22 * s, dy = y + (i % 2) * 10 * s;
    r += '<path d="M ' + dx + ' ' + dy + ' q ' + 5 * s + ' ' + -5 * s + ' ' + 10 * s + ' 0 q ' + 5 * s + ' ' + -5 * s + ' ' + 10 * s + ' 0" fill="none" stroke="' + (c || '#333') + '" stroke-width="' + 1.6 * s + '" stroke-linecap="round"/>';
  }
  return r;
}

/* ================= 建筑构件 ================= */
// 翘角屋顶：x 中心，y 檐口线，w 宽，h 脊高
function roof(x, y, w, h, fill) {
  const l = x - w / 2 - 14, r = x + w / 2 + 14;
  return '<path d="M ' + l + ' ' + (y - 5) +
    ' Q ' + (x - w / 4) + ' ' + (y - h - 5) + ' ' + x + ' ' + (y - h) +
    ' Q ' + (x + w / 4) + ' ' + (y - h - 5) + ' ' + r + ' ' + (y - 5) +
    ' Q ' + (x + w / 4) + ' ' + (y + 7) + ' ' + x + ' ' + (y + 7) +
    ' Q ' + (x - w / 4) + ' ' + (y + 7) + ' ' + l + ' ' + (y - 5) + ' Z" fill="' + fill + '"/>' +
    '<rect x="' + (x - w * 0.16) + '" y="' + (y - h - 4) + '" width="' + w * 0.32 + '" height="5" rx="2.5" fill="' + fill + '"/>';
}

// 宫殿：x 中心，yBase 台基底，w 宽，hWall 墙高；opt: {wall, roof, roofH, door, plaque}
function hall(x, yBase, w, hWall, opt) {
  opt = opt || {};
  const wallC = opt.wall || '#a63a2e';
  const roofC = opt.roof || '#3a4a6a';
  const roofH = opt.roofH || Math.max(14, w * 0.22);
  const topY = yBase - 10 - hWall;
  let s = '';
  // 台基两层
  s += '<rect x="' + (x - w / 2 - 8) + '" y="' + (yBase - 5) + '" width="' + (w + 16) + '" height="6" fill="#8a8578"/>';
  s += '<rect x="' + (x - w / 2 - 4) + '" y="' + (yBase - 11) + '" width="' + (w + 8) + '" height="6" fill="#9a9588"/>';
  // 墙体
  s += '<rect x="' + (x - w / 2) + '" y="' + topY + '" width="' + w + '" height="' + hWall + '" fill="' + wallC + '"/>';
  // 柱
  const n = Math.max(2, Math.round(w / 34));
  for (let i = 0; i <= n; i++) {
    const cx = x - w / 2 + (w / n) * i;
    s += '<rect x="' + (cx - 1.8) + '" y="' + topY + '" width="3.6" height="' + hWall + '" fill="#6a2018"/>';
  }
  // 门与窗
  s += '<rect x="' + (x - 7) + '" y="' + (yBase - 28) + '" width="14" height="17" fill="#3a1a12"/>';
  if (w >= 56) {
    s += '<rect x="' + (x - w / 2 + 8) + '" y="' + (yBase - 30) + '" width="10" height="10" fill="#f7d794" opacity=".85"/>';
    s += '<rect x="' + (x + w / 2 - 18) + '" y="' + (yBase - 30) + '" width="10" height="10" fill="#f7d794" opacity=".85"/>';
  }
  // 屋顶
  s += roof(x, topY, w + 8, roofH, roofC);
  // 匾额
  if (opt.plaque) {
    s += '<rect x="' + (x - 16) + '" y="' + (topY + 3) + '" width="32" height="11" rx="2" fill="#1a2a4a" stroke="#d4af37" stroke-width="1"/>' +
      '<text x="' + x + '" y="' + (topY + 12) + '" text-anchor="middle" font-size="8.5" fill="#d4af37" class="plq">' + opt.plaque + '</text>';
  }
  return s;
}

function pagoda(x, yBase, tiers, w) {
  let s = '', y = yBase, ww = w;
  for (let i = 0; i < tiers; i++) {
    const hWall = 16;
    s += '<rect x="' + (x - ww / 2) + '" y="' + (y - hWall) + '" width="' + ww + '" height="' + hWall + '" fill="#a63a2e"/>';
    s += roof(x, y - hWall, ww + 6, 12, '#3a4a6a');
    y = y - hWall - 13;
    ww *= 0.76;
  }
  s += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y - 14) + '" stroke="#d4af37" stroke-width="2"/>' +
    '<circle cx="' + x + '" cy="' + (y - 15) + '" r="3" fill="#d4af37"/>';
  return s;
}

function pine(x, y, s, c) {
  c = c || '#2d5a3a';
  return '<rect x="' + (x - 2 * s) + '" y="' + (y - 12 * s) + '" width="' + 4 * s + '" height="' + 12 * s + '" fill="#5a3a26"/>' +
    '<polygon points="' + x + ',' + (y - 46 * s) + ' ' + (x - 13 * s) + ',' + (y - 26 * s) + ' ' + (x + 13 * s) + ',' + (y - 26 * s) + '" fill="' + c + '"/>' +
    '<polygon points="' + x + ',' + (y - 38 * s) + ' ' + (x - 16 * s) + ',' + (y - 16 * s) + ' ' + (x + 16 * s) + ',' + (y - 16 * s) + '" fill="' + c + '"/>' +
    '<polygon points="' + x + ',' + (y - 28 * s) + ' ' + (x - 18 * s) + ',' + (y - 8 * s) + ' ' + (x + 18 * s) + ',' + (y - 8 * s) + '" fill="' + c + '"/>';
}

function blossom(x, y, s, petal) {
  petal = petal || '#e8a0b0';
  let t = '<path d="M ' + x + ' ' + y + ' Q ' + (x - 3 * s) + ' ' + (y - 14 * s) + ' ' + (x + 2 * s) + ' ' + (y - 24 * s) + '" stroke="#5a3a26" stroke-width="' + 3.4 * s + '" fill="none" stroke-linecap="round"/>';
  const blobs = [[0, -30, 13], [-11, -24, 9], [11, -25, 10], [-5, -36, 8], [7, -34, 8]];
  blobs.forEach(b => {
    t += '<circle cx="' + (x + b[0] * s) + '" cy="' + (y + b[1] * s) + '" r="' + b[2] * s + '" fill="' + petal + '" opacity=".92"/>';
  });
  // 落花
  t += '<ellipse cx="' + (x - 16 * s) + '" cy="' + (y - 6 * s) + '" rx="' + 2.4 * s + '" ry="' + 1.4 * s + '" fill="' + petal + '" opacity=".7"/>' +
    '<ellipse cx="' + (x + 15 * s) + '" cy="' + (y - 12 * s) + '" rx="' + 2.2 * s + '" ry="' + 1.3 * s + '" fill="' + petal + '" opacity=".6"/>' +
    '<ellipse cx="' + (x + 6 * s) + '" cy="' + (y - 2 * s) + '" rx="' + 2.6 * s + '" ry="' + 1.5 * s + '" fill="' + petal + '" opacity=".65"/>';
  return t;
}

function lantern(x, y, s) {
  return '<g class="anim-lantern">' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + 13 * s + '" fill="#ff9a3c" opacity=".22"/>' +
    '<line x1="' + x + '" y1="' + (y - 15 * s) + '" x2="' + x + '" y2="' + (y - 9 * s) + '" stroke="#8a6a3a" stroke-width="' + 1.2 * s + '"/>' +
    '<rect x="' + (x - 4 * s) + '" y="' + (y - 10 * s) + '" width="' + 8 * s + '" height="' + 2.6 * s + '" fill="#8a6a3a"/>' +
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + 7 * s + '" ry="' + 8.6 * s + '" fill="#c23a2e"/>' +
    '<path d="M ' + (x - 3.4 * s) + ' ' + (y - 8 * s) + ' Q ' + (x - 4.6 * s) + ' ' + y + ' ' + (x - 3.4 * s) + ' ' + (y + 8 * s) + '" stroke="#8c2a20" stroke-width="' + 0.9 * s + '" fill="none"/>' +
    '<path d="M ' + (x + 3.4 * s) + ' ' + (y - 8 * s) + ' Q ' + (x + 4.6 * s) + ' ' + y + ' ' + (x + 3.4 * s) + ' ' + (y + 8 * s) + '" stroke="#8c2a20" stroke-width="' + 0.9 * s + '" fill="none"/>' +
    '<rect x="' + (x - 3.4 * s) + '" y="' + (y + 7.6 * s) + '" width="' + 6.8 * s + '" height="' + 2.4 * s + '" fill="#8a6a3a"/>' +
    '<line x1="' + x + '" y1="' + (y + 10 * s) + '" x2="' + x + '" y2="' + (y + 15 * s) + '" stroke="#d4af37" stroke-width="' + 1.1 * s + '"/></g>';
}

// 站立人物（官员）
function figure(x, y, s, robe, skin) {
  skin = skin || '#f2c9a0';
  return '<path d="M ' + (x - 9 * s) + ' ' + y + ' L ' + (x - 6 * s) + ' ' + (y - 24 * s) + ' Q ' + x + ' ' + (y - 29 * s) + ' ' + (x + 6 * s) + ' ' + (y - 24 * s) + ' L ' + (x + 9 * s) + ' ' + y + ' Z" fill="' + robe + '"/>' +
    '<circle cx="' + x + '" cy="' + (y - 32 * s) + '" r="' + 5.4 * s + '" fill="' + skin + '"/>' +
    '<path d="M ' + (x - 5.4 * s) + ' ' + (y - 34 * s) + ' Q ' + x + ' ' + (y - 40 * s) + ' ' + (x + 5.4 * s) + ' ' + (y - 34 * s) + ' L ' + (x + 5.4 * s) + ' ' + (y - 36 * s) + ' Q ' + x + ' ' + (y - 42 * s) + ' ' + (x - 5.4 * s) + ' ' + (y - 36 * s) + ' Z" fill="#1a1a1a"/>' +
    '<rect x="' + (x - 6.5 * s) + '" y="' + (y - 41 * s) + '" width="' + 13 * s + '" height="' + 3.4 * s + '" rx="' + 1.6 * s + '" fill="#1a1a1a"/>' +
    '<rect x="' + (x - 12 * s) + '" y="' + (y - 39.6 * s) + '" width="' + 6 * s + '" height="' + 2 * s + '" rx="' + 1 * s + '" fill="#1a1a1a"/>' +
    '<rect x="' + (x + 6 * s) + '" y="' + (y - 39.6 * s) + '" width="' + 6 * s + '" height="' + 2 * s + '" rx="' + 1 * s + '" fill="#1a1a1a"/>';
}
// 跪拜人物
function kneel(x, y, s, robe, skin) {
  skin = skin || '#f2c9a0';
  return '<ellipse cx="' + x + '" cy="' + (y - 3 * s) + '" rx="' + 10 * s + '" ry="' + 4.6 * s + '" fill="' + robe + '"/>' +
    '<path d="M ' + (x - 7 * s) + ' ' + (y - 5 * s) + ' L ' + (x - 5 * s) + ' ' + (y - 18 * s) + ' Q ' + x + ' ' + (y - 22 * s) + ' ' + (x + 5 * s) + ' ' + (y - 18 * s) + ' L ' + (x + 7 * s) + ' ' + (y - 5 * s) + ' Z" fill="' + robe + '"/>' +
    '<circle cx="' + x + '" cy="' + (y - 24 * s) + '" r="' + 4.8 * s + '" fill="' + skin + '"/>' +
    '<rect x="' + (x - 5.6 * s) + '" y="' + (y - 31 * s) + '" width="' + 11.2 * s + '" height="' + 3 * s + '" rx="' + 1.4 * s + '" fill="#1a1a1a"/>';
}

// 宫墙段（带垛口）
function wall(x, y, w, h, fill) {
  fill = fill || '#8a5a44';
  let s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
  const n = Math.floor(w / 16);
  for (let i = 0; i < n; i++) {
    s += '<rect x="' + (x + 3 + i * 16) + '" y="' + (y - 5) + '" width="9" height="5" fill="' + fill + '"/>';
  }
  return s;
}

function smoke(x, y, s) {
  return '<g class="anim-smoke" stroke="#bbb" stroke-width="' + 2.6 * s + '" fill="none" stroke-linecap="round" opacity=".5">' +
    '<path d="M ' + x + ' ' + y + ' Q ' + (x - 6 * s) + ' ' + (y - 12 * s) + ' ' + x + ' ' + (y - 22 * s) + '"/>' +
    '<path d="M ' + (x + 5 * s) + ' ' + y + ' Q ' + (x + 11 * s) + ' ' + (y - 14 * s) + ' ' + (x + 4 * s) + ' ' + (y - 26 * s) + '"/></g>';
}

function flag(x, y, s, c, poleC) {
  return '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y - 26 * s) + '" stroke="' + (poleC || '#5a3a26') + '" stroke-width="' + 1.8 * s + '"/>' +
    '<path d="M ' + x + ' ' + (y - 26 * s) + ' L ' + (x + 16 * s) + ' ' + (y - 22 * s) + ' L ' + x + ' ' + (y - 17 * s) + ' Z" fill="' + c + '"/>';
}

// 场景标签
function label(x, y, txt, size) {
  return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 15) + '" class="lbl">' + txt + '</text>';
}

/* ================= 导出 ================= */
export const K = {
  SKIES, sky, stars, sun, moon, celestial, cloud, mtn, birds,
  roof, hall, pagoda, pine, blossom, lantern, figure, kneel,
  wall, smoke, flag, label, lcg
};
