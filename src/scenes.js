/* 皇帝成长计划 · 网页复刻版 —— 场景绘制（基于 svgkit） */
import { K } from './svgkit.js';

/* ---------- 页头横幅：暮色宫殿剪影 ---------- */
function banner() {
  const W = 1200, H = 200;
  let s = K.sky('bn', 3, W, H);
  s += K.stars(7, 60, W, 110);
  s += K.moon(W * 0.82, 52, 26);
  s += K.mtn('0,150 160,96 320,150 480,110 640,150', H, '#1c2438', .8);
  s += K.mtn('120,160 300,120 520,160 700,126 900,160', H, '#141a2a', .9);
  // 宫殿群剪影
  const c = '#0d0f18';
  s += K.wall(0, 168, W, 32, c);
  s += K.hall(W * 0.5, 168, 150, 34, { wall: c, roof: c, roofH: 30 });
  s += K.hall(W * 0.28, 168, 96, 26, { wall: c, roof: c, roofH: 22 });
  s += K.hall(W * 0.72, 168, 96, 26, { wall: c, roof: c, roofH: 22 });
  s += K.hall(W * 0.12, 168, 64, 20, { wall: c, roof: c, roofH: 16 });
  s += K.hall(W * 0.88, 168, 64, 20, { wall: c, roof: c, roofH: 16 });
  // 灯火点点
  [0.2, 0.35, 0.5, 0.65, 0.8].forEach(f => {
    s += '<circle cx="' + W * f + '" cy="176" r="2.2" fill="#ffb84d" opacity=".9"/>';
  });
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
}

/* ---------- 宣政殿 · 上朝 ---------- */
function court() {
  const W = 800, H = 360;
  let s = '<defs><linearGradient id="ct-bg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#2a1410"/><stop offset=".6" stop-color="#4a241a"/><stop offset="1" stop-color="#5a3020"/></linearGradient>' +
    '<linearGradient id="ct-beam" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#ffe9b0" stop-opacity=".28"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></linearGradient></defs>';
  s += '<rect width="' + W + '" height="' + H + '" fill="url(#ct-bg)"/>';
  // 顶部梁枋
  for (let i = 0; i < 5; i++) s += '<rect x="0" y="' + (i * 14) + '" width="' + W + '" height="5" fill="#1a0d08" opacity="' + (0.9 - i * 0.16) + '"/>';
  // 光柱
  s += '<polygon points="330,0 380,0 340,360 260,360" fill="url(#ct-beam)"/>';
  s += '<polygon points="430,0 480,0 540,360 460,360" fill="url(#ct-beam)"/>';
  // 丹陛台阶 + 龙椅屏风
  s += '<rect x="310" y="120" width="180" height="14" fill="#7a6a58"/>';
  s += '<rect x="322" y="106" width="156" height="14" fill="#8a7a68"/>';
  s += '<rect x="334" y="92" width="132" height="14" fill="#9a8a78"/>';
  // 金屏风
  s += '<rect x="346" y="30" width="108" height="64" rx="4" fill="#c9a227" stroke="#8a6a1a" stroke-width="2"/>';
  s += '<path d="M 360 70 Q 380 40 400 62 Q 420 84 440 50" stroke="#8a6a1a" stroke-width="3" fill="none"/>' +
    '<circle cx="400" cy="46" r="7" fill="#8a6a1a"/>';
  // 龙椅
  s += '<rect x="382" y="58" width="36" height="36" rx="3" fill="#6a4a1a" stroke="#c9a227" stroke-width="2"/>';
  // 皇帝
  s += '<path d="M 388 92 L 392 70 Q 400 64 408 70 L 412 92 Z" fill="#e8b83a"/>';
  s += '<circle cx="400" cy="62" r="7" fill="#f2c9a0"/>';
  s += '<rect x="392" y="52" width="16" height="5" rx="2" fill="#1a1a1a"/>' +
    '<rect x="398" y="44" width="4" height="9" fill="#c9a227"/>';
  // 红毯
  s += '<polygon points="386,134 414,134 460,360 340,360" fill="#8c2a20"/>' +
    '<polygon points="392,134 408,134 446,360 354,360" fill="#a63a2e"/>';
  // 立柱（近大远小）
  [[120, 26, 1], [240, 20, .82], [560, 20, .82], [680, 26, 1]].forEach(c => {
    s += '<rect x="' + (c[0] - c[1] / 2) + '" y="30" width="' + c[1] + '" height="' + H * c[2] + '" fill="#7c2a21"/>' +
      '<rect x="' + (c[0] - c[1] / 2 - 4) + '" y="24" width="' + (c[1] + 8) + '" height="10" fill="#5c1f18"/>' +
      '<rect x="' + (c[0] - c[1] / 2 - 4) + '" y="' + (30 + H * c[2] - 8) + '" width="' + (c[1] + 8) + '" height="10" fill="#5c1f18"/>';
  });
  // 悬挂灯笼
  s += K.lantern(180, 78, 1.1) + K.lantern(620, 78, 1.1);
  // 文武百官（两列跪拜）
  const robes = ['#2a4a6a', '#3a3a5a', '#4a2a4a', '#2a4a4a'];
  for (let i = 0; i < 4; i++) {
    s += K.kneel(300 - i * 8, 330 - i * 42, 1 + i * 0.12, robes[i % 4]);
    s += K.kneel(500 + i * 8, 330 - i * 42, 1 + i * 0.12, robes[(i + 2) % 4]);
  }
  s += '<rect x="0" y="' + (H - 24) + '" width="' + W + '" height="24" fill="#1a0d08" opacity=".6"/>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
}

/* ---------- 皇城舆图（可点击） ---------- */
function map(p) {
  const W = 800, H = 600;
  p = p === undefined ? 1 : p;
  let s = K.sky('map', p, W, H);
  if (p === 3) s += K.stars(11, 70, W, 200);
  s += K.celestial(p, W);
  s += K.cloud(150, 70, 1.2, .5) + K.cloud(620, 110, 1, .45);
  s += K.mtn('0,300 90,210 180,300 260,240 340,300', 320, '#6a7a8a', .55);
  s += K.mtn('460,300 560,220 660,300 740,250 800,290', 320, '#6a7a8a', .5);
  // 大地
  s += '<rect x="0" y="300" width="' + W + '" height="' + (H - 300) + '" fill="#5a6a42"/>';
  s += '<rect x="0" y="300" width="' + W + '" height="14" fill="#4a5a36"/>';
  // 道路
  s += '<polygon points="388,496 412,496 440,600 360,600" fill="#9a8a6a"/>' +
    '<polygon points="392,496 408,496 430,600 370,600" fill="#b0a080"/>';

  /* 宫城 */
  s += K.wall(180, 252, 440, 14, '#8a5a44');            // 上墙
  s += K.wall(180, 484, 440, 14, '#8a5a44');            // 下墙
  s += '<rect x="180" y="252" width="14" height="246" fill="#8a5a44"/>';   // 左墙
  s += '<rect x="606" y="252" width="14" height="246" fill="#8a5a44"/>';   // 右墙
  s += '<rect x="194" y="266" width="412" height="218" fill="#6a7a4e"/>';  // 宫内地面
  // 角楼
  s += K.hall(187, 252, 34, 14, { roofH: 12 });
  s += K.hall(613, 252, 34, 14, { roofH: 12 });
  // 城门楼
  s += '<rect x="372" y="470" width="56" height="28" fill="#5a3a2a"/>';
  s += '<path d="M 384 498 L 384 484 Q 400 474 416 484 L 416 498 Z" fill="#2a1a10"/>';
  s += K.hall(400, 470, 52, 18, { roofH: 14 });

  /* 宫内建筑（可点击区域） */
  // 宣政殿
  s += '<g class="zone" data-goto="xuanzheng">' + K.hall(400, 330, 110, 34, { plaque: '宣政殿', roofH: 26 }) + '</g>';
  // 藏书阁
  s += '<g class="zone" data-goto="study">' + K.hall(268, 400, 62, 22, { wall: '#8c6a3a', roofH: 18 }) + K.label(268, 424, '藏书阁', 13) + '</g>';
  // 太医院
  s += '<g class="zone" data-goto="doctor">' + K.hall(532, 400, 62, 22, { wall: '#7a6a5a', roofH: 18 }) + K.label(532, 424, '太医院', 13) + '</g>';
  // 养心殿
  s += '<g class="zone" data-goto="rest">' + K.hall(268, 466, 68, 22, { roofH: 18 }) + K.label(268, 490, '养心殿', 13) + '</g>';
  // 琴音楼
  s += '<g class="zone" data-goto="music">' + K.hall(532, 466, 62, 22, { wall: '#8c4a6a', roofH: 18 }) + K.label(532, 490, '琴音楼', 13) + '</g>';
  // 炼丹房
  s += '<g class="zone" data-goto="alchemy">' + K.hall(400, 396, 54, 18, { wall: '#5a4a3a', roofH: 15 }) + K.smoke(412, 366, .8) + K.label(448, 392, '炼丹房', 13) + '</g>';
  // 后宫
  s += '<g class="zone" data-goto="harem">' + K.hall(400, 452, 76, 24, { wall: '#b04a5a', roofH: 20 }) +
    K.blossom(340, 452, .8) + K.blossom(462, 450, .7) + K.label(400, 478, '后宫', 13) + '</g>';
  // 宫内点缀
  s += K.pine(220, 330, .7) + K.pine(580, 330, .7) + K.lantern(330, 300, .8) + K.lantern(470, 300, .8);

  /* 城外 */
  // 佛寺（左上山间）
  s += '<g class="zone" data-goto="temple">' +
    '<polygon points="40,360 120,280 200,360" fill="#4a5a48"/>' +
    K.pagoda(120, 330, 3, 44) + K.pine(70, 356, .8) + K.pine(170, 350, .9) + K.smoke(134, 300, .7) +
    K.label(120, 384, '佛寺', 13) + '</g>';
  // 围猎场（左下）
  s += '<g class="zone" data-goto="hunt">' +
    K.pine(60, 520, 1) + K.pine(96, 530, 1.2) + K.pine(180, 524, 1) +
    '<path d="M 120 530 L 136 506 L 152 530 Z" fill="#c2a06a"/>' +   // 帐篷
    '<rect x="134" y="520" width="4" height="10" fill="#5a3a26"/>' +
    // 小鹿
    '<ellipse cx="205" cy="540" rx="10" ry="6" fill="#a08050"/>' +
    '<line x1="199" y1="544" x2="199" y2="552" stroke="#a08050" stroke-width="2"/>' +
    '<line x1="211" y1="544" x2="211" y2="552" stroke="#a08050" stroke-width="2"/>' +
    '<line x1="212" y1="536" x2="218" y2="528" stroke="#a08050" stroke-width="2.4"/>' +
    '<circle cx="219" cy="526" r="3" fill="#a08050"/>' +
    '<path d="M 218 523 L 215 518 M 220 523 L 223 517" stroke="#8a6a3a" stroke-width="1.2"/>' +
    K.label(120, 566, '围猎场', 13) + '</g>';
  // 一品楼（右上）
  s += '<g class="zone" data-goto="yipinlou">' +
    K.hall(688, 400, 66, 24, { wall: '#b08a3a', roofH: 18 }) +
    K.hall(688, 366, 48, 18, { wall: '#b08a3a', roofH: 14 }) +
    K.flag(730, 400, .9, '#c23a2e') + K.lantern(656, 386, .8) + K.lantern(720, 386, .8) +
    K.label(688, 426, '一品楼', 13) + '</g>';
  // 梨花苑（右下）
  s += '<g class="zone" data-goto="lihuayuan">' +
    K.hall(688, 500, 60, 20, { wall: '#a05a6a', roofH: 16 }) +
    K.blossom(640, 502, .9, '#f0d8d8') + K.blossom(736, 500, .8, '#f0d8d8') +
    K.lantern(664, 486, .8) + K.lantern(712, 486, .8) +
    K.label(688, 526, '梨花苑', 13) + '</g>';
  // 习武场（宫城外左）
  s += '<g class="zone" data-goto="martial">' +
    '<rect x="40" y="420" width="120" height="56" fill="#b09a6a"/>' +
    '<rect x="40" y="420" width="120" height="6" fill="#a08a5a"/>' +
    K.flag(56, 420, .9, '#c23a2e') + K.flag(144, 420, .9, '#3a4a6a') +
    // 兵器架
    '<line x1="80" y1="448" x2="80" y2="424" stroke="#5a3a26" stroke-width="2"/>' +
    '<line x1="88" y1="448" x2="88" y2="422" stroke="#5a3a26" stroke-width="2"/>' +
    '<line x1="96" y1="448" x2="96" y2="426" stroke="#5a3a26" stroke-width="2"/>' +
    '<line x1="76" y1="434" x2="100" y2="434" stroke="#5a3a26" stroke-width="2"/>' +
    // 箭靶
    '<circle cx="130" cy="440" r="10" fill="#e8dcc0"/><circle cx="130" cy="440" r="6.4" fill="#c23a2e"/><circle cx="130" cy="440" r="3" fill="#e8dcc0"/>' +
    '<line x1="130" y1="450" x2="130" y2="462" stroke="#5a3a26" stroke-width="2"/>' +
    K.label(100, 492, '习武场', 13) + '</g>';
  // 印章装饰
  s += '<rect x="742" y="536" width="40" height="40" rx="4" fill="#a63a2e" opacity=".9"/>' +
    '<text x="762" y="562" text-anchor="middle" font-size="17" fill="#f5e6c8" class="plq">御览</text>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
}

/* ================= 场景·续 ================= */

function frame(w, h, inner) {
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}

/* ---------- 后宫：月夜庭院 ---------- */
function harem(p) {
  p = p === undefined ? 3 : p;
  const W = 800, H = 320;
  let s = K.sky('hr', p, W, H);
  if (p === 3 || p === 2) s += K.stars(21, 50, W, 140);
  s += p >= 2 ? K.moon(620, 62, 24) : K.celestial(p, W);
  s += K.cloud(180, 66, 1, .4);
  s += '<rect x="0" y="230" width="' + W + '" height="90" fill="#3a4a3a"/>';
  // 池塘
  s += '<ellipse cx="590" cy="286" rx="150" ry="26" fill="#2a4a5a"/>' +
    '<ellipse cx="560" cy="282" rx="60" ry="10" fill="#3a6a7a" opacity=".6"/>' +
    '<path d="M 520 280 q 6 -8 12 0 q -6 8 -12 0" fill="#e8a0b0"/>' +
    '<circle cx="640" cy="284" r="4" fill="#e8a0b0" opacity=".8"/>';
  // 凉亭
  s += '<rect x="180" y="216" width="120" height="10" fill="#8a8578"/>';
  s += '<rect x="196" y="160" width="8" height="60" fill="#7c2a21"/><rect x="276" y="160" width="8" height="60" fill="#7c2a21"/>';
  s += K.roof(240, 160, 130, 30, '#3a4a6a');
  s += '<rect x="216" y="190" width="48" height="26" fill="#5a3a2a" opacity=".8"/>';
  // 仕女剪影
  s += '<path d="M 232 216 L 236 192 Q 240 186 244 192 L 248 216 Z" fill="#d8a0b0"/>' +
    '<circle cx="240" cy="184" r="6" fill="#f2c9a0"/>' +
    '<circle cx="240" cy="178" r="6.4" fill="#1a1a1a"/>' +
    '<circle cx="236" y="172" r="2.6" cy="172" fill="#1a1a1a"/>';
  // 花树与灯
  s += K.blossom(90, 240, 1.3) + K.blossom(380, 246, 1) + K.blossom(720, 236, 1.1, '#f0d8d8');
  s += K.lantern(150, 200, 1) + K.lantern(330, 206, 1) + K.lantern(470, 210, 1);
  // 宫墙远景
  s += '<rect x="420" y="206" width="380" height="10" fill="#6a4a3a" opacity=".7"/>';
  return frame(W, H, s);
}

/* ---------- 藏书阁：室内书斋 ---------- */
function study() {
  const W = 800, H = 320;
  let s = '<rect width="' + W + '" height="' + H + '" fill="#2e2118"/>';
  // 书架墙
  for (let sh = 0; sh < 2; sh++) {
    const x0 = 40 + sh * 240;
    s += '<rect x="' + x0 + '" y="30" width="220" height="220" fill="#4a3423"/>';
    for (let row = 0; row < 4; row++) {
      s += '<rect x="' + (x0 + 8) + '" y="' + (42 + row * 52) + '" width="204" height="44" fill="#3a281a"/>';
      const r = K.lcg(sh * 10 + row + 3);
      for (let b = 0; b < 12; b++) {
        const bw = 8 + r() * 8, bh = 30 + r() * 12;
        const cols = ['#8c3a2e', '#3a5a8c', '#3a8c5a', '#8c6a3a', '#6a4a8c', '#a08a5a'];
        s += '<rect x="' + (x0 + 12 + b * 17) + '" y="' + (82 + row * 52 - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + cols[Math.floor(r() * 6)] + '"/>';
      }
    }
  }
  // 窗（夜色竹影）
  s += '<rect x="560" y="40" width="200" height="140" fill="#141c33" stroke="#5a4a3a" stroke-width="6"/>' +
    K.moon(700, 80, 16) +
    '<path d="M 600 180 Q 610 120 606 100 M 620 180 Q 626 130 634 108 M 640 180 Q 638 140 646 120" stroke="#2d5a3a" stroke-width="4" fill="none"/>' +
    '<line x1="660" y1="40" x2="660" y2="180" stroke="#5a4a3a" stroke-width="4"/>';
  // 书案
  s += '<rect x="480" y="230" width="280" height="16" fill="#5a3a26"/>' +
    '<rect x="496" y="246" width="12" height="50" fill="#4a2e1a"/><rect x="732" y="246" width="12" height="50" fill="#4a2e1a"/>';
  // 摊开的书卷
  s += '<rect x="540" y="214" width="80" height="16" rx="3" fill="#e8dcc0"/>' +
    '<line x1="580" y1="214" x2="580" y2="230" stroke="#b0a080" stroke-width="2"/>' +
    '<path d="M 550 218 h 22 M 550 224 h 22 M 590 218 h 22 M 590 224 h 22" stroke="#8a7a5a" stroke-width="1.4"/>';
  // 烛台
  s += '<rect x="700" y="206" width="6" height="24" fill="#8a6a3a"/>' +
    '<circle cx="703" cy="200" r="10" fill="#ffb84d" opacity=".35" class="anim-lantern"/>' +
    '<ellipse cx="703" cy="198" rx="3.4" ry="6" fill="#ffcf6e" class="anim-lantern"/>';
  // 地面
  s += '<rect x="0" y="296" width="' + W + '" height="24" fill="#1e150e"/>';
  return frame(W, H, s);
}

/* ---------- 习武场 ---------- */
function martial(p) {
  p = p === undefined ? 1 : p;
  const W = 800, H = 320;
  let s = K.sky('ma', p, W, H);
  s += K.celestial(p, W);
  s += K.mtn('0,240 120,170 240,240 360,190 480,240', 260, '#6a7a8a', .5);
  s += '<rect x="0" y="240" width="' + W + '" height="80" fill="#b09a6a"/>';
  s += '<rect x="0" y="240" width="' + W + '" height="10" fill="#a08a5a"/>';
  // 栅栏
  for (let i = 0; i < 12; i++) s += '<rect x="' + (30 + i * 64) + '" y="226" width="5" height="20" fill="#5a3a26"/>';
  s += '<rect x="20" y="232" width="760" height="4" fill="#5a3a26"/>';
  // 帅旗
  s += K.flag(120, 240, 1.6, '#c23a2e') + K.flag(680, 240, 1.6, '#3a4a6a');
  // 兵器架
  s += '<rect x="300" y="200" width="8" height="46" fill="#5a3a26"/><rect x="380" y="200" width="8" height="46" fill="#5a3a26"/>' +
    '<rect x="292" y="206" width="104" height="6" fill="#5a3a26"/>';
  for (let i = 0; i < 4; i++) {
    const x = 312 + i * 22;
    s += '<line x1="' + x + '" y1="246" x2="' + (x + 6) + '" y2="188" stroke="#7a5a3a" stroke-width="3"/>' +
      '<polygon points="' + (x + 6) + ',188 ' + (x + 2) + ',198 ' + (x + 10) + ',198" fill="#c0c0c0"/>';
  }
  // 箭靶
  s += '<circle cx="560" cy="220" r="24" fill="#e8dcc0"/><circle cx="560" cy="220" r="16" fill="#c23a2e"/><circle cx="560" cy="220" r="8" fill="#e8dcc0"/><circle cx="560" cy="220" r="3" fill="#c23a2e"/>' +
    '<line x1="560" y1="244" x2="560" y2="268" stroke="#5a3a26" stroke-width="4"/>';
  // 石锁
  s += '<rect x="180" y="252" width="26" height="18" rx="4" fill="#8a8578"/><rect x="188" y="244" width="10" height="10" fill="none" stroke="#8a8578" stroke-width="3"/>';
  // 操练的武士
  s += K.figure(450, 262, 1.2, '#5a3a6a') +
    '<line x1="438" y1="236" x2="472" y2="212" stroke="#7a5a3a" stroke-width="3"/>' +
    '<polygon points="472,212 466,222 476,220" fill="#c0c0c0"/>';
  s += K.figure(640, 266, 1.1, '#3a5a6a');
  return frame(W, H, s);
}

/* ---------- 琴音楼：室内 ---------- */
function music() {
  const W = 800, H = 320;
  let s = '<rect width="' + W + '" height="' + H + '" fill="#33222a"/>';
  // 屏风
  s += '<rect x="520" y="40" width="240" height="200" fill="#4a3040" stroke="#8a6a3a" stroke-width="4"/>';
  s += '<rect x="536" y="56" width="208" height="168" fill="#e8dcc0" opacity=".9"/>';
  s += '<path d="M 560 190 Q 600 120 580 100 Q 620 140 660 90 Q 650 150 700 120" stroke="#8c4a5a" stroke-width="3" fill="none"/>' +
    '<circle cx="580" cy="100" r="6" fill="#c26a7a"/><circle cx="660" cy="90" r="7" fill="#c26a7a"/><circle cx="700" cy="120" r="5" fill="#c26a7a"/>' +
    '<path d="M 560 200 q 30 -14 60 0 q 30 14 60 0" stroke="#6a8a5a" stroke-width="3" fill="none"/>';
  // 窗
  s += '<rect x="40" y="40" width="150" height="120" fill="#1c2438" stroke="#5a4a3a" stroke-width="6"/>' + K.moon(140, 80, 14);
  // 琴桌与古琴
  s += '<rect x="180" y="220" width="360" height="14" fill="#4a2e1a"/>' +
    '<rect x="200" y="234" width="12" height="60" fill="#3a2412"/><rect x="508" y="234" width="12" height="60" fill="#3a2412"/>';
  s += '<rect x="220" y="204" width="280" height="16" rx="8" fill="#2a1a10"/>' +
    '<rect x="220" y="204" width="280" height="6" rx="3" fill="#3a2412"/>';
  for (let i = 0; i < 7; i++) s += '<line x1="230" y1="' + (207 + i * 1.6) + '" x2="490" y2="' + (207 + i * 1.6) + '" stroke="#c0b090" stroke-width=".7"/>';
  // 香炉
  s += '<rect x="150" y="226" width="20" height="12" rx="3" fill="#8a6a3a"/>' + K.smoke(160, 220, .8);
  // 灯笼
  s += K.lantern(300, 90, 1.2) + K.lantern(430, 90, 1.2);
  s += '<rect x="0" y="294" width="' + W + '" height="26" fill="#241218"/>';
  return frame(W, H, s);
}

/* ---------- 佛寺：山间古刹 ---------- */
function temple(p) {
  p = p === undefined ? 1 : p;
  const W = 800, H = 320;
  let s = K.sky('tm', p, W, H);
  if (p === 3) s += K.stars(31, 40, W, 130);
  s += K.celestial(p, W);
  s += K.cloud(200, 80, 1.1, .5) + K.cloud(560, 60, .9, .45);
  s += K.mtn('0,280 140,150 280,280 400,190 520,280', 300, '#5a6a6a', .6);
  s += K.mtn('300,290 460,170 620,290 720,230 800,280', 300, '#4a5a52', .75);
  // 主山峰与塔
  s += '<polygon points="240,320 400,120 560,320" fill="#3f4f42"/>';
  s += K.pagoda(400, 220, 4, 64);
  // 石阶
  s += '<path d="M 400 320 L 400 240" stroke="#9a9588" stroke-width="14" stroke-dasharray="6 5"/>';
  // 山门
  s += K.hall(400, 316, 60, 20, { roofH: 15 });
  // 松柏
  s += K.pine(300, 300, 1.1) + K.pine(500, 296, 1.2) + K.pine(200, 310, .9) + K.pine(620, 306, 1);
  // 香炉烟
  s += K.smoke(430, 250, 1);
  s += K.birds(620, 90, 1, '#4a4a4a');
  return frame(W, H, s);
}

/* ---------- 围猎场 ---------- */
function hunt(p) {
  p = p === undefined ? 1 : p;
  const W = 800, H = 320;
  let s = K.sky('ht', p, W, H);
  s += K.celestial(p, W);
  s += K.mtn('0,250 150,160 300,250 450,180 600,250 720,200 800,240', 270, '#6a7a8a', .5);
  s += '<rect x="0" y="250" width="' + W + '" height="70" fill="#6a7a42"/>';
  // 草丛
  const r = K.lcg(5);
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = 262 + r() * 50;
    s += '<path d="M ' + x + ' ' + y + ' l 3 -8 l 3 8 M ' + (x + 5) + ' ' + y + ' l 3 -10 l 3 10" stroke="#4a5a2e" stroke-width="1.6" fill="none"/>';
  }
  // 树林
  s += K.pine(80, 260, 1.3) + K.pine(140, 270, 1) + K.pine(700, 264, 1.2) + K.pine(640, 274, .9);
  // 帐篷
  s += '<path d="M 300 280 L 340 236 L 380 280 Z" fill="#c2a06a"/>' +
    '<path d="M 340 236 L 340 280" stroke="#a08050" stroke-width="2"/>' +
    '<path d="M 330 280 L 340 262 L 350 280 Z" fill="#5a3a26"/>';
  s += K.flag(340, 236, 1, '#c23a2e');
  // 奔鹿
  s += '<ellipse cx="520" cy="266" rx="16" ry="9" fill="#a08050"/>' +
    '<path d="M 506 272 L 500 286 M 514 274 L 512 288 M 528 274 L 532 288 M 534 270 L 542 282" stroke="#a08050" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M 534 260 L 546 246" stroke="#a08050" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="548" cy="243" r="5" fill="#a08050"/>' +
    '<path d="M 546 238 L 540 228 M 549 238 L 552 226 M 548 240 L 556 232" stroke="#8a6a3a" stroke-width="1.8"/>';
  // 箭矢
  s += '<line x1="440" y1="240" x2="470" y2="248" stroke="#5a3a26" stroke-width="2"/>' +
    '<polygon points="470,248 462,244 462,252" fill="#c0c0c0"/>';
  s += K.birds(240, 100, 1.1, '#4a4a4a');
  return frame(W, H, s);
}

/* ---------- 太医院：室内药柜 ---------- */
function doctor() {
  const W = 800, H = 320;
  let s = '<rect width="' + W + '" height="' + H + '" fill="#2a241c"/>';
  // 百子柜
  s += '<rect x="40" y="30" width="380" height="240" fill="#4a3a26"/>';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
    s += '<rect x="' + (50 + c * 45) + '" y="' + (40 + r * 38) + '" width="38" height="30" fill="#5a4a30" stroke="#3a2e1a" stroke-width="1.5"/>' +
      '<circle cx="' + (69 + c * 45) + '" cy="' + (55 + r * 38) + '" r="2.6" fill="#c9a227"/>';
  }
  // 挂药包
  for (let i = 0; i < 5; i++) {
    s += '<line x1="' + (480 + i * 40) + '" y1="40" x2="' + (480 + i * 40) + '" y2="58" stroke="#8a6a3a" stroke-width="2"/>' +
      '<rect x="' + (470 + i * 40) + '" y="58" width="20" height="26" rx="4" fill="#b09a6a"/>';
  }
  // 案几：药碾、脉枕
  s += '<rect x="460" y="220" width="300" height="14" fill="#5a3a26"/>' +
    '<rect x="476" y="234" width="12" height="60" fill="#4a2e1a"/><rect x="732" y="234" width="12" height="60" fill="#4a2e1a"/>';
  s += '<rect x="500" y="204" width="46" height="16" rx="8" fill="#8a8578"/>' +   // 药碾
    '<circle cx="523" cy="200" r="9" fill="#9a9588"/>' +
    '<rect x="580" y="208" width="34" height="12" rx="6" fill="#c26a7a"/>' +      // 脉枕
    '<rect x="640" y="196" width="60" height="24" rx="3" fill="#e8dcc0"/>' +      // 药方
    '<path d="M 648 204 h 44 M 648 210 h 44 M 648 216 h 30" stroke="#8a7a5a" stroke-width="1.4"/>';
  // 捣药罐
  s += '<path d="M 700 130 L 730 130 L 724 160 L 706 160 Z" fill="#7a5a3a"/>' +
    '<line x1="715" y1="110" x2="715" y2="132" stroke="#5a3a26" stroke-width="5" stroke-linecap="round"/>';
  s += K.lantern(450, 60, 1) + K.lantern(760, 200, 1);
  s += '<rect x="0" y="294" width="' + W + '" height="26" fill="#1c1812"/>';
  return frame(W, H, s);
}

/* ---------- 一品楼：街市酒楼 ---------- */
function yipinlou(p) {
  p = p === undefined ? 1 : p;
  const W = 800, H = 320;
  let s = K.sky('yp', p, W, H);
  if (p === 3) s += K.stars(41, 40, W, 120);
  s += p >= 2 ? K.moon(640, 60, 20) : K.celestial(p, W);
  s += '<rect x="0" y="250" width="' + W + '" height="70" fill="#6a625a"/>';
  // 主楼两层
  s += K.hall(400, 250, 180, 44, { wall: '#b08a3a', roofH: 30, plaque: '一品楼' });
  s += K.hall(400, 176, 130, 34, { wall: '#b08a3a', roofH: 24 });
  // 酒旗
  s += K.flag(510, 220, 1.4, '#c23a2e');
  s += '<rect x="508" y="172" width="26" height="20" fill="#e8dcc0"/>' +
    '<text x="521" y="187" text-anchor="middle" font-size="14" fill="#a63a2e" class="plq">酒</text>';
  // 灯笼串
  for (let i = 0; i < 5; i++) s += K.lantern(300 + i * 50, 210, .9);
  // 邻舍
  s += K.hall(160, 252, 90, 30, { wall: '#8c6a4a', roofH: 20 });
  s += K.hall(640, 252, 90, 30, { wall: '#8c6a4a', roofH: 20 });
  // 行人
  s += K.figure(260, 300, 1, '#3a5a8c') + K.figure(560, 304, 1.1, '#3a8c5a') + K.figure(620, 300, .95, '#6a4a8c');
  // 摊贩
  s += '<rect x="80" y="280" width="60" height="10" fill="#5a3a26"/>' +
    '<circle cx="95" cy="274" r="6" fill="#c23a2e"/><circle cx="110" cy="274" r="6" fill="#e8a35c"/><circle cx="125" cy="274" r="6" fill="#7fb069"/>';
  return frame(W, H, s);
}

/* ---------- 梨花苑：夜晚庭院 ---------- */
function lihuayuan() {
  const W = 800, H = 320;
  let s = K.sky('lh', 3, W, H);
  s += K.stars(51, 60, W, 150);
  s += K.moon(180, 60, 22);
  s += '<rect x="0" y="240" width="' + W + '" height="80" fill="#2e3a2e"/>';
  // 回廊
  s += '<rect x="80" y="186" width="260" height="8" fill="#5a3a2a"/>';
  for (let i = 0; i < 6; i++) s += '<rect x="' + (92 + i * 48) + '" y="194" width="6" height="54" fill="#7c2a21"/>';
  s += K.roof(210, 186, 270, 40, '#3a4a6a');
  // 梨花树（白）
  s += K.blossom(520, 250, 1.6, '#f0e0e0') + K.blossom(660, 256, 1.2, '#e8d0d8') + K.blossom(420, 258, 1, '#f0d8d8');
  // 石灯与红灯
  s += K.lantern(120, 220, 1.1) + K.lantern(300, 220, 1.1) + K.lantern(600, 210, 1);
  // 飘落花瓣
  const r = K.lcg(9);
  for (let i = 0; i < 14; i++) {
    s += '<ellipse cx="' + (420 + r() * 300) + '" cy="' + (140 + r() * 140) + '" rx="' + (2 + r() * 1.6) + '" ry="' + (1.2 + r()) + '" fill="#f0e0e0" opacity="' + (0.4 + r() * 0.5) + '"/>';
  }
  // 石桌凳
  s += '<circle cx="200" cy="262" r="16" fill="#8a8578"/><rect x="196" y="262" width="8" height="20" fill="#7a7568"/>' +
    '<circle cx="160" cy="272" r="9" fill="#8a8578"/><circle cx="240" cy="272" r="9" fill="#8a8578"/>';
  return frame(W, H, s);
}

/* ---------- 炼丹房 ---------- */
function alchemy() {
  const W = 800, H = 320;
  let s = '<rect width="' + W + '" height="' + H + '" fill="#241c14"/>';
  // 窗（夜）
  s += '<rect x="620" y="36" width="140" height="110" fill="#141c33" stroke="#5a4a3a" stroke-width="6"/>' + K.moon(710, 70, 13);
  // 符纸墙
  for (let i = 0; i < 4; i++) {
    s += '<rect x="' + (60 + i * 46) + '" y="40" width="26" height="60" fill="#e8d8a0"/>' +
      '<path d="M ' + (66 + i * 46) + ' 50 h 14 M ' + (66 + i * 46) + ' 60 h 14 M ' + (68 + i * 46) + ' 70 q 5 6 10 0 M ' + (66 + i * 46) + ' 84 h 14" stroke="#a63a2e" stroke-width="1.6" fill="none"/>';
  }
  // 架上的葫芦药罐
  s += '<rect x="60" y="150" width="220" height="8" fill="#4a3423"/>';
  for (let i = 0; i < 4; i++) {
    const x = 90 + i * 50;
    s += '<circle cx="' + x + '" cy="136" r="9" fill="#8a6a3a"/><circle cx="' + x + '" cy="124" r="6" fill="#8a6a3a"/>' +
      '<rect x="' + (x - 2) + '" y="116" width="4" height="5" fill="#5a3a26"/>';
  }
  // 八卦炼丹炉
  s += '<ellipse cx="430" cy="286" rx="90" ry="12" fill="#1a140e"/>';
  s += '<path d="M 370 280 L 360 200 Q 360 150 430 150 Q 500 150 500 200 L 490 280 Z" fill="#5a4a3a"/>' +
    '<path d="M 360 200 Q 360 150 430 150 Q 500 150 500 200 L 496 220 L 364 220 Z" fill="#6a5a48"/>' +
    '<circle cx="430" cy="186" r="16" fill="#2a2018" stroke="#c9a227" stroke-width="2"/>' +
    '<path d="M 430 170 a 16 16 0 0 1 0 32 a 8 8 0 0 1 0 -16 a 8 8 0 0 0 0 -16" fill="#c9a227"/>' +
    '<rect x="352" y="276" width="14" height="24" fill="#4a3a2a"/><rect x="494" y="276" width="14" height="24" fill="#4a3a2a"/>';
  // 炉火
  s += '<circle cx="430" cy="252" r="26" fill="#ff9a3c" opacity=".3" class="anim-lantern"/>' +
    '<path d="M 414 262 Q 420 240 430 248 Q 436 236 446 262 Z" fill="#ff9a3c" class="anim-lantern"/>' +
    '<path d="M 420 262 Q 426 248 432 254 Q 438 246 442 262 Z" fill="#ffcf6e"/>';
  s += K.smoke(430, 140, 1.2);
  // 蒲团
  s += '<ellipse cx="600" cy="280" rx="30" ry="10" fill="#8c6a3a"/>';
  s += '<rect x="0" y="296" width="' + W + '" height="24" fill="#181209"/>';
  return frame(W, H, s);
}

/* ---------- 养心殿：静室 ---------- */
function rest() {
  const W = 800, H = 320;
  let s = '<rect width="' + W + '" height="' + H + '" fill="#22202a"/>';
  // 窗（星空）
  s += '<rect x="80" y="40" width="180" height="130" fill="#10162a" stroke="#4a3a2a" stroke-width="6"/>' +
    K.stars(61, 16, 170, 110) + K.moon(210, 76, 14);
  s += '<line x1="170" y1="40" x2="170" y2="170" stroke="#4a3a2a" stroke-width="4"/>';
  // 床榻与帷帐
  s += '<rect x="380" y="60" width="8" height="220" fill="#5a3a26"/><rect x="700" y="60" width="8" height="220" fill="#5a3a26"/>' +
    '<rect x="372" y="52" width="344" height="10" fill="#5a3a26"/>';
  s += '<path d="M 388 62 L 388 200 Q 440 160 480 120 L 480 62 Z" fill="#8c4a5a" opacity=".55"/>' +
    '<path d="M 700 62 L 700 200 Q 648 160 608 120 L 608 62 Z" fill="#8c4a5a" opacity=".55"/>';
  s += '<rect x="400" y="220" width="290" height="34" rx="6" fill="#6a4a3a"/>' +
    '<rect x="410" y="206" width="270" height="18" rx="8" fill="#c9b27a"/>' +
    '<rect x="420" y="196" width="60" height="16" rx="8" fill="#e8dcc0"/>';
  // 烛台
  s += '<rect x="320" y="180" width="8" height="70" fill="#8a6a3a"/>' +
    '<rect x="308" y="246" width="32" height="8" rx="3" fill="#8a6a3a"/>' +
    '<circle cx="324" cy="170" r="12" fill="#ffb84d" opacity=".3" class="anim-lantern"/>' +
    '<ellipse cx="324" cy="168" rx="4" ry="7" fill="#ffcf6e" class="anim-lantern"/>';
  // 盆景
  s += '<rect x="120" y="230" width="50" height="20" rx="4" fill="#7a5a3a"/>' + K.pine(145, 232, .8);
  s += '<rect x="0" y="296" width="' + W + '" height="24" fill="#16141c"/>';
  return frame(W, H, s);
}

/* ---------- 深夜安寝：夜色宫殿 ---------- */
function sleep() {
  const W = 800, H = 300;
  let s = K.sky('sl', 3, W, H);
  s += K.stars(71, 90, W, 160);
  s += K.moon(600, 70, 30);
  s += K.cloud(200, 80, 1, .25);
  const c = '#12141f';
  s += K.mtn('0,240 160,180 320,240 480,190 640,240', 260, '#1a2030', .8);
  s += K.wall(0, 236, W, 64, c);
  s += K.hall(400, 236, 130, 30, { wall: c, roof: c, roofH: 26 });
  s += K.hall(200, 236, 80, 22, { wall: c, roof: c, roofH: 18 });
  s += K.hall(600, 236, 80, 22, { wall: c, roof: c, roofH: 18 });
  // 更楼
  s += K.hall(720, 236, 46, 40, { wall: c, roof: c, roofH: 16 });
  // 灯火
  [150, 300, 400, 500, 650].forEach(x => {
    s += '<circle cx="' + x + '" cy="248" r="2.6" fill="#ffb84d" opacity=".9" class="anim-lantern"/>';
  });
  s += '<text x="400" y="120" text-anchor="middle" font-size="30" fill="#e8dcc0" opacity=".8" class="plq">夜 深 了</text>';
  return frame(W, H, s);
}

/* ---------- 战争地图 ---------- */
function warmap(countries) {
  const W = 800, H = 260;
  let s = K.sky('wm', 1, W, H);
  s += K.cloud(140, 50, 1, .5) + K.cloud(560, 40, .9, .45);
  s += '<rect x="0" y="170" width="' + W + '" height="90" fill="#6a7a4e"/>';
  s += K.mtn('0,180 80,120 160,180', 190, '#8a9a8a', .7);
  // 路线
  s += '<path d="M 700 200 L 560 200 L 420 205 L 280 200 L 140 205" stroke="#9a8a6a" stroke-width="10" stroke-dasharray="12 8" fill="none"/>';
  // 各国据点（从右到左：皇、日本、突厥、吐蕃、印度、波斯）
  const nodes = [
    { x: 700, name: '中原', own: true },
    { x: 560, key: 0 }, { x: 420, key: 1 }, { x: 280, key: 2 }, { x: 140, key: 3 }
  ];
  // 波斯在最左
  nodes.push({ x: 40, key: 4 });
  nodes.forEach(n => {
    if (n.own) {
      s += K.hall(n.x, 200, 56, 20, { roofH: 16 });
      s += K.flag(n.x + 24, 180, 1, '#c9a227');
      s += K.label(n.x, 232, '中原', 13);
    } else {
      const c = countries[n.key];
      const done = c && c.done;
      const flagCols = ['#c23a2e', '#3a5a8c', '#7fb069', '#e8a35c', '#6a4a8c'];
      const col = done ? '#c9a227' : flagCols[n.key % 5];
      // 营寨
      s += '<rect x="' + (n.x - 22) + '" y="182" width="44" height="20" fill="' + (done ? '#7a6a3a' : '#4a4a55') + '"/>' +
        '<polygon points="' + (n.x - 28) + ',182 ' + n.x + ',166 ' + (n.x + 28) + ',182" fill="' + (done ? '#8a7a48' : '#55555f') + '"/>';
      s += K.flag(n.x + 18, 168, .9, col);
      if (done) s += '<text x="' + n.x + '" y="160" text-anchor="middle" font-size="15" fill="#c9a227" class="lbl">✓</text>';
      s += K.label(n.x, 232, (c ? c.name : '') + (done ? '·平' : ''), 12);
    }
  });
  // 日本画成海岛
  s += '<ellipse cx="560" cy="216" rx="40" ry="8" fill="#4a6a7a" opacity=".6"/>';
  return frame(W, H, s);
}

/* ---------- 结局：陵寝夕阳 ---------- */
function ending() {
  const W = 800, H = 340;
  let s = K.sky('ed', 2, W, H);
  s += K.sun(400, 190, 40, '#ff9a5c');
  s += K.cloud(160, 70, 1.1, .4) + K.cloud(620, 90, 1, .35);
  s += K.mtn('0,240 140,150 280,240 420,170 560,240 700,180 800,230', 260, '#5a4a5a', .7);
  // 神道
  s += '<polygon points="360,340 440,340 420,240 380,240" fill="#8a8078"/>';
  // 石像生
  [[330, 300], [470, 300], [345, 262], [455, 262]].forEach((p, i) => {
    const sc = i < 2 ? 1 : 0.8;
    s += '<rect x="' + (p[0] - 6 * sc) + '" y="' + (p[1] - 22 * sc) + '" width="' + 12 * sc + '" height="' + 22 * sc + '" fill="#9a9588"/>' +
      '<circle cx="' + p[0] + '" cy="' + (p[1] - 26 * sc) + '" r="' + 5 * sc + '" fill="#9a9588"/>';
  });
  // 宝顶与碑亭
  s += '<path d="M 340 240 Q 400 180 460 240 Z" fill="#4a5a42"/>';
  s += K.hall(400, 236, 60, 22, { roofH: 18, wall: '#7a4a3a' });
  s += K.pine(300, 240, 1) + K.pine(500, 240, 1) + K.pine(250, 250, .8) + K.pine(550, 250, .8);
  s += K.birds(240, 90, 1.2, '#3a2a3a');
  return frame(W, H, s);
}

export const SCENES = {
  banner, court, map,
  harem, study, martial, music, temple, hunt, doctor,
  yipinlou, lihuayuan, alchemy, rest, sleep, warmap, ending
};
