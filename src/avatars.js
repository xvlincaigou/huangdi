/* 皇帝成长计划 · 网页复刻版 —— 程序化人物头像（按名字种子生成） */

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.codePointAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const SKINS = ['#f2c9a0', '#eebd90', '#e8b285', '#f5d2aa'];
const ROBES = ['#3a5a8c', '#8c3a3a', '#3a8c5a', '#6a4a8c', '#8c6a3a', '#2a6a7a'];
const ROBES_F = ['#c26a7a', '#8c5a9a', '#5a8c7a', '#c28a5a', '#7a6ac2', '#b05a6a'];

/**
 * 生成头像 SVG
 * @param name 人物姓名（作随机种子）
 * @param kind 'official' 文官 | 'general' 武将 | 'woman' 妃嫔
 * @param size 输出尺寸（默认 72 viewBox）
 */
export function avatar(name, kind, size) {
  const h = hashStr(name + '|' + kind);
  const pick = (arr, n) => arr[(h >>> (n * 3)) % arr.length];
  const skin = pick(SKINS, 0);
  const robe = kind === 'woman' ? pick(ROBES_F, 1) : pick(ROBES, 1);
  const eyeShape = (h >>> 5) % 3;
  const mouthW = 4 + (h >>> 7) % 3;

  let s = '<circle cx="36" cy="36" r="35" fill="#221a14"/>';
  s += '<circle cx="36" cy="36" r="34" fill="' + robe + '"/>';
  // 肩部衣袍
  s += '<path d="M 8 66 Q 12 46 36 44 Q 60 46 64 66 Q 50 72 36 72 Q 22 72 8 66 Z" fill="' + robe + '"/>';
  // 衣领
  s += '<path d="M 30 46 L 36 54 L 42 46 L 40 44 L 36 47 L 32 44 Z" fill="#e8dcc0"/>';
  // 脸
  s += '<ellipse cx="36" cy="30" rx="13" ry="14" fill="' + skin + '"/>';

  if (kind === 'woman') {
    // 发髻
    s += '<path d="M 22 30 Q 20 12 36 11 Q 52 12 50 30 Q 48 20 36 19 Q 24 20 22 30 Z" fill="#1a1410"/>';
    s += '<circle cx="24" cy="15" r="5.5" fill="#1a1410"/><circle cx="48" cy="15" r="5.5" fill="#1a1410"/>';
    // 发簪与花
    s += '<line x1="46" y1="10" x2="56" y2="4" stroke="#d4af37" stroke-width="1.6"/>' +
      '<circle cx="57" cy="4" r="2" fill="#d4af37"/>';
    const fc = pick(['#e8a0b0', '#c23a2e', '#e8c85a'], 3);
    s += '<circle cx="23" cy="11" r="2.4" fill="' + fc + '"/><circle cx="26" cy="9" r="1.8" fill="' + fc + '"/>';
    // 腮红与唇
    s += '<circle cx="28" cy="34" r="2.6" fill="#e8a0a0" opacity=".5"/><circle cx="44" cy="34" r="2.6" fill="#e8a0a0" opacity=".5"/>';
    s += '<path d="M 33 38 Q 36 40 39 38" stroke="#c23a2e" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  } else if (kind === 'general') {
    // 头盔
    s += '<path d="M 22 28 Q 22 10 36 10 Q 50 10 50 28 L 46 28 Q 46 16 36 16 Q 26 16 26 28 Z" fill="#5a5a6a"/>';
    s += '<path d="M 36 10 L 36 4" stroke="#c23a2e" stroke-width="2.4"/>' +
      '<circle cx="36" cy="4" r="2.6" fill="#c23a2e"/>';
    s += '<rect x="21" y="26" width="30" height="3" rx="1.5" fill="#4a4a5a"/>';
    // 须
    if ((h >>> 9) % 2) s += '<path d="M 30 40 Q 36 46 42 40 L 42 44 Q 36 50 30 44 Z" fill="#3a2a1a"/>';
    s += '<path d="M 32 38 Q 36 40 40 38" stroke="#7a4a3a" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  } else {
    // 乌纱帽
    s += '<path d="M 23 28 Q 23 14 36 14 Q 49 14 49 28 L 46 28 Q 46 19 36 19 Q 26 19 26 28 Z" fill="#1a1a1a"/>';
    s += '<rect x="22" y="24" width="28" height="5" rx="2" fill="#1a1a1a"/>';
    s += '<rect x="8" y="25" width="15" height="4" rx="2" fill="#1a1a1a"/><rect x="49" y="25" width="15" height="4" rx="2" fill="#1a1a1a"/>';
    // 胡须（年长官员）
    if ((h >>> 9) % 3 === 0) {
      s += '<path d="M 31 40 Q 36 48 41 40 L 40 46 Q 36 52 32 46 Z" fill="#4a4a4a"/>';
    }
    s += '<path d="M 32 38 Q 36 ' + (38 + mouthW / 3) + ' 40 38" stroke="#7a4a3a" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  }

  // 眉眼
  const ey = 29;
  if (eyeShape === 0) {
    s += '<circle cx="30.5" cy="' + ey + '" r="1.5" fill="#1a1a1a"/><circle cx="41.5" cy="' + ey + '" r="1.5" fill="#1a1a1a"/>';
  } else if (eyeShape === 1) {
    s += '<path d="M 28 ' + ey + ' Q 30.5 ' + (ey - 2) + ' 33 ' + ey + '" stroke="#1a1a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M 39 ' + ey + ' Q 41.5 ' + (ey - 2) + ' 44 ' + ey + '" stroke="#1a1a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  } else {
    s += '<path d="M 28 ' + (ey + 1) + ' Q 30.5 ' + (ey - 1) + ' 33 ' + (ey + 1) + '" stroke="#1a1a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M 39 ' + (ey + 1) + ' Q 41.5 ' + (ey - 1) + ' 44 ' + (ey + 1) + '" stroke="#1a1a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  }
  s += '<path d="M 28 24 Q 30.5 22.5 33 24 M 39 24 Q 41.5 22.5 44 24" stroke="#3a2a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>';

  const svg = '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + '>' + s + '</svg>';
  return svg;
}

/** 头像 data URI（可直接用于 img src / CSS） */
export function avatarURI(name, kind) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(name, kind));
}
