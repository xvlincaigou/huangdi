/* 皇帝成长计划 · 网页复刻版 —— 游戏引擎（纯逻辑，不依赖 DOM） */
import { DATA } from './data.js';

/* ---------- 工具 ---------- */
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }

let uidCounter = 1;
function uid() { return uidCounter++; }

function personName() { return pick(DATA.surnames) + pick(DATA.givenNames); }

function makeOfficial(q) {
  // q: 质量基准 0-100
  return {
    id: uid(),
    name: personName(),
    zhongcheng: clamp(q + rnd(-15, 25), 5, 99),  // 忠诚
    yexin: clamp(rnd(10, 85), 5, 99),            // 野心
    qinglian: clamp(q + rnd(-20, 20), 5, 99),    // 清廉
    zhihui: clamp(q + rnd(-10, 30), 5, 99),      // 智慧
    wuli: clamp(q + rnd(-10, 30), 5, 99)         // 武力
  };
}

function makeCandidate(lit, shuyuan) {
  // 科举考生：质量受皇帝文学与书院等级影响
  const base = rnd(20, 60) + Math.floor(lit / 3) + shuyuan * 5;
  const o = makeOfficial(clamp(base, 10, 100));
  o.yexin = clamp(rnd(5, 70), 5, 99);
  return o;
}

function makeConcubine(meili, title) {
  return {
    id: uid(),
    name: pick(DATA.concubineNames),
    meili: clamp(meili, 10, 100),   // 魅力
    chongai: rnd(20, 50),           // 宠爱
    title: title || '才人'
  };
}

/* ---------- 新游戏 ---------- */
function newGame() {
  const s = {
    ver: 1,
    era: '建初',
    year: 1, month: 1, period: 0,
    age: 18,
    lifespan: rnd(48, 62),
    attrs: {
      wenxue: rnd(25, 45), wuyi: rnd(20, 40), caiyi: rnd(20, 40),
      daode: rnd(25, 45), tineng: rnd(35, 55)
    },
    vitals: { tili: 90, jiankang: 85, kuaile: 70 },
    huangwei: 50, minxin: 60,
    treasury: 800,
    taxRate: 0.15,
    officials: {},
    idle: [],
    army: { soldiers: 5, training: 40 },  // soldiers 单位：万
    buildings: { jishi: 0, simiao: 0, shuyuan: 0, xiaochang: 0, tiejiang: 0, lingqin: 0 },
    construction: null,   // {key, left}
    harem: [],
    children: [],
    pregnant: [],         // {left, name}
    countries: DATA.countries.map(c => ({ name: c.name, power: c.power, loot: c.loot, desc: c.desc, done: false })),
    trade: null,          // {left, zhihui, name}
    flags: { sacrificed: false, selectedShow: 0, alchemyMonth: 0, doctorMonth: 0, kejuMonth: 0, lihuayuanMonth: 0 },
    inCourt: false,
    pending: null,        // 待抉择事件 {type, ...}
    over: null,           // 结局 {title, score, detail}
    log: [],
    stats: { battles: 0, wins: 0, keju: 0, children: 0 }
  };
  DATA.posts.forEach(p => { s.officials[p] = makeOfficial(rnd(35, 60)); });
  const empress = makeConcubine(rnd(55, 75), '皇后');
  s.harem.push(empress);
  log(s, '先帝驾崩，你于灵前继位，改元' + s.era + '。江山社稷，自此系于你一身。', 'important');
  log(s, '传闻每月清晨上朝可理朝政，晌午与晚上可自由安排，深夜须回宫休息。');
  return s;
}

/* ---------- 日志 ---------- */
function log(s, msg, cls) {
  s.log.push({ t: s.era + '元年'.replace('元年', s.year + '年') + DATA.months[s.month - 1] + ' ' + DATA.periods[s.period], msg, cls: cls || '' });
  if (s.log.length > 200) s.log.splice(0, s.log.length - 200);
}

/* ---------- 存档 ---------- */
const SAVE_KEY = 'huangdi_save_v1';
function save(s) {
  try { if (typeof localStorage !== 'undefined') { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); return true; } } catch (e) {}
  return false;
}
function loadSave() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const s = JSON.parse(raw); if (s && s.ver === 1) return s; }
    }
  } catch (e) {}
  return null;
}
function hasSave() {
  try { return typeof localStorage !== 'undefined' && !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

/* ---------- 派生数值 ---------- */
function avgQinglian(s) {
  let sum = 0, n = 0;
  DATA.posts.forEach(p => { const o = s.officials[p]; if (o) { sum += o.qinglian; n++; } });
  return n ? sum / n : 50;
}
function conqueredCount(s) { return s.countries.filter(c => c.done).length; }
function weaponBonus(s) { return 1 + s.buildings.tiejiang * 0.1; }
function generalBonus(s) {
  const gen = s.officials['中央将军'];
  if (!gen) return 1;
  return 1 + (gen.wuli + gen.zhihui) / 400;
}
function armyPower(s) {
  return s.army.soldiers * (s.army.training / 100) * weaponBonus(s) * generalBonus(s);
}
function canCourt(s) { return s.vitals.tili >= 40 && s.vitals.jiankang >= 50; }

/* ---------- 时段推进 ---------- */
function advancePeriod(s) {
  if (s.period < 3) {
    s.period++;
    if (s.period === 3) log(s, '夜深了，该回宫休息了。');
  }
}

/* ---------- 上朝 ---------- */
function holdCourt(s) {
  if (s.period !== 0) return { ok: false, msg: '现在不是清晨，无法上朝。' };
  if (!canCourt(s)) return { ok: false, msg: '龙体欠安（体力≥40且健康≥50才能上朝），先去休息或调养吧。' };
  s.vitals.tili -= 10;
  s.inCourt = true;
  log(s, '你登上宣政殿，百官山呼万岁。');
  return { ok: true };
}
function skipCourt(s) {
  if (s.period !== 0) return { ok: false, msg: '现在不是清晨。' };
  log(s, '你罢了早朝。百官议论纷纷。', 'bad');
  s.huangwei = clamp(s.huangwei - 2, 0, 999);
  advancePeriod(s);
  return { ok: true };
}
function endCourt(s) {
  s.inCourt = false;
  log(s, '退朝。百官散去。');
  advancePeriod(s);
  return { ok: true };
}

/* ---------- 吏部 ---------- */
function dismiss(s, post) {
  const o = s.officials[post];
  if (!o) return { ok: false, msg: '该职位本就空缺。' };
  s.officials[post] = null;
  log(s, '你罢免了' + post + o.name + '。');
  return { ok: true };
}
function appoint(s, post, talentId) {
  const idx = s.idle.findIndex(t => t.id === talentId);
  if (idx < 0) return { ok: false, msg: '此人不在候选之列。' };
  const t = s.idle.splice(idx, 1)[0];
  const old = s.officials[post];
  s.officials[post] = t;
  log(s, '你任命' + t.name + '为' + post + (old ? '，' + old.name + '被替换' : '') + '。', 'good');
  return { ok: true };
}

/* ---------- 礼部：科举 / 祭祀 / 贸易 ---------- */
function keju(s) {
  if (s.month === 1) return { ok: false, msg: '正月开岁，不行科举。' };
  if (s.flags.kejuMonth === s.year * 100 + s.month) return { ok: false, msg: '本月已举行过科举。' };
  s.flags.kejuMonth = s.year * 100 + s.month;
  s.stats.keju++;
  const list = [];
  for (let i = 0; i < 3; i++) list.push(makeCandidate(s.attrs.wenxue, s.buildings.shuyuan));
  s.pending = { type: 'keju', list };
  log(s, '科举开考，天下士子云集京城。');
  return { ok: true };
}
function kejuPick(s, id) {
  if (!s.pending || s.pending.type !== 'keju') return { ok: false, msg: '没有进行中的科举。' };
  if (id !== null) {
    const c = s.pending.list.find(x => x.id === id);
    if (!c) return { ok: false, msg: '无效的人选。' };
    if (s.idle.length >= 12) return { ok: false, msg: '候补官员已满，请先任命或罢免。' };
    s.idle.push(c);
    log(s, '你钦点' + c.name + '为进士，入候补之列。', 'good');
  } else {
    log(s, '本科无一人入你法眼，全部落榜。');
  }
  s.pending = null;
  return { ok: true };
}
function sacrifice(s) {
  if (s.month !== 1) return { ok: false, msg: '祭祀天地须在正月举行。' };
  if (s.flags.sacrificed) return { ok: false, msg: '今年已举行过祭祀。' };
  if (s.treasury < 50) return { ok: false, msg: '国库不足五十万两，无法举行大典。' };
  s.treasury -= 50;
  s.flags.sacrificed = true;
  s.minxin = clamp(s.minxin + 5, 0, 100);
  s.huangwei = clamp(s.huangwei + 5, 0, 999);
  log(s, '你于天坛祭天，祈求一年风调雨顺。民心、皇威皆升。', 'good');
  return { ok: true };
}
function startTrade(s, talentId) {
  if (s.trade) return { ok: false, msg: '商队尚未归来，不可再派。' };
  const idx = s.idle.findIndex(t => t.id === talentId);
  if (idx < 0) return { ok: false, msg: '此人不在候补之列。' };
  const t = s.idle[idx];
  if (t.zhihui < 55) return { ok: false, msg: '此人智慧不足（需≥55），恐辱使命。' };
  s.idle.splice(idx, 1);
  s.trade = { left: 12, zhihui: t.zhihui, name: t.name };
  log(s, '你派' + t.name + '率商队出使西域，约一年后归来。');
  return { ok: true };
}

/* ---------- 户部 ---------- */
function setTax(s, rate) {
  if ([1, 4, 7, 10].indexOf(s.month) < 0) return { ok: false, msg: '税率仅可于正月、四月、七月、十月调整。' };
  const opt = DATA.taxOptions.find(o => o.rate === rate);
  if (!opt) return { ok: false, msg: '无效的税率。' };
  s.taxRate = rate;
  s.minxin = clamp(s.minxin + opt.minxin, 0, 100);
  log(s, '你下旨将税率调整为「' + opt.name + '」。' + (opt.minxin > 0 ? '百姓称颂。' : opt.minxin < 0 ? '民间颇有怨言。' : ''));
  return { ok: true };
}
function census(s) {
  if (s.treasury < 30) return { ok: false, msg: '国库不足三十万两。' };
  s.treasury -= 30;
  s.minxin = clamp(s.minxin + 2, 0, 100);
  log(s, '户部普查户口，安置流民，民心稍安。');
  return { ok: true };
}

/* ---------- 兵部 ---------- */
function recruitSoldiers(s, n) {
  const cost = n * 2; // 每万兵 2 万两
  if (s.treasury < cost) return { ok: false, msg: '国库不足，征兵' + n + '万需' + cost + '万两。' };
  s.treasury -= cost;
  s.army.soldiers += n;
  s.army.training = clamp(Math.round((s.army.training * (s.army.soldiers - n) + 30 * n) / s.army.soldiers), 0, 100);
  log(s, '你征召新兵' + n + '万，全军现有' + s.army.soldiers + '万。训练度有所下降。');
  return { ok: true };
}
function trainArmy(s) {
  const gain = 5 + s.buildings.xiaochang * 2;
  s.army.training = clamp(s.army.training + gain, 0, 100);
  log(s, '兵部组织操练，训练度 +' + gain + '。');
  return { ok: true };
}
function campaign(s, idx) {
  const c = s.countries[idx];
  if (!c || c.done) return { ok: false, msg: '无效的目标。' };
  if (idx > 0 && !s.countries[idx - 1].done) return { ok: false, msg: '须先平定' + s.countries[idx - 1].name + '，方可远征。' };
  if (s.army.soldiers < 10) return { ok: false, msg: '兵力不足十万，不可轻启战端。' };
  s.stats.battles++;
  const atk = armyPower(s) * (0.9 + Math.random() * 0.2);
  const def = c.power * (0.9 + Math.random() * 0.2);
  if (atk > def) {
    const lossRatio = clamp(def / atk, 0.08, 0.55);
    const lost = Math.max(1, Math.round(s.army.soldiers * lossRatio * 0.5));
    s.army.soldiers -= lost;
    c.done = true;
    s.stats.wins++;
    s.treasury += c.loot;
    s.huangwei = clamp(s.huangwei + Math.round(c.power / 4), 0, 999);
    s.minxin = clamp(s.minxin + 5, 0, 100);
    log(s, '大捷！王师攻克' + c.name + '，掠得库银' + c.loot + '万两，折损兵马' + lost + '万。皇威大振！', 'important');
    if (chance(0.6)) {
      const beauty = makeConcubine(rnd(60, 95));
      s.pending = { type: 'captive', girl: beauty };
      log(s, '敌军献上绝色美女，是否纳入后宫？');
    }
    if (conqueredCount(s) === s.countries.length) {
      log(s, '普天之下，莫非王土！你完成了统一天下的不世之功！', 'important');
      s.huangwei += 100;
    }
  } else {
    const lost = Math.max(2, Math.round(s.army.soldiers * 0.4));
    s.army.soldiers = Math.max(0, s.army.soldiers - lost);
    s.huangwei = clamp(s.huangwei - 8, 0, 999);
    s.minxin = clamp(s.minxin - 5, 0, 100);
    log(s, '出师不利，王师败于' + c.name + '，折损兵马' + lost + '万。朝野震动。', 'bad');
  }
  return { ok: true };
}
function captiveChoice(s, accept) {
  if (!s.pending || s.pending.type !== 'captive') return { ok: false, msg: '没有待处置的俘虏。' };
  if (accept) {
    s.harem.push(s.pending.girl);
    log(s, s.pending.girl.name + '被纳入后宫。', 'good');
  } else {
    log(s, '你命人将美女遣散还乡。');
  }
  s.pending = null;
  return { ok: true };
}

/* ---------- 工部 ---------- */
function build(s, key) {
  const b = DATA.buildings[key];
  if (!b) return { ok: false, msg: '无此建筑。' };
  if (s.construction) return { ok: false, msg: '已有工程在建（' + DATA.buildings[s.construction.key].name + '），须待完工。' };
  if (s.buildings[key] >= b.max) return { ok: false, msg: b.name + '已达最高等级。' };
  const cost = b.cost * (s.buildings[key] + 1);
  if (s.treasury < cost) return { ok: false, msg: '国库不足，需' + cost + '万两。' };
  s.treasury -= cost;
  s.construction = { key, left: b.months };
  log(s, '工部奉旨营建' + b.name + '（' + (s.buildings[key] + 1) + '级），工期' + b.months + '个月。');
  return { ok: true };
}

/* ---------- 刑部 ---------- */
function investigate(s) {
  if (s.treasury < 10) return { ok: false, msg: '国库不足十万两。' };
  s.treasury -= 10;
  let found = null;
  DATA.posts.forEach(p => {
    const o = s.officials[p];
    if (o && o.yexin > o.zhongcheng && o.yexin > 60 && (!found || o.yexin > found.yexin)) found = o;
  });
  if (found) {
    found.yexin = clamp(found.yexin - rnd(10, 25), 5, 99);
    log(s, '刑部暗访百官，敲打了心怀异志的' + found.name + '，其野心有所收敛。', 'good');
  } else {
    log(s, '刑部监察百官，暂未发现异动。');
  }
  return { ok: true };
}

/* ---------- 自由行动（晌午/晚上） ---------- */
function freeOk(s, costTili) {
  if (s.period === 0) return { ok: false, msg: '清晨请先上朝或罢朝。' };
  if (s.period === 3) return { ok: false, msg: '深夜了，回宫休息吧。' };
  if (s.vitals.tili < (costTili || 5)) return { ok: false, msg: '体力不支，先去养心殿休息。' };
  return { ok: true };
}
function trainAttr(s, attr, gain, tiliCost, label) {
  const chk = freeOk(s, tiliCost);
  if (!chk.ok) return chk;
  s.vitals.tili -= tiliCost;
  const bonus = 1 + (s.attrs.tineng > 70 ? 0.5 : 0);
  const real = Math.max(1, Math.round(gain * bonus));
  s.attrs[attr] = clamp(s.attrs[attr] + real, 0, 100);
  log(s, label + '，' + attrName(attr) + ' +' + real + '。');
  advancePeriod(s);
  return { ok: true };
}
function attrName(a) {
  return { wenxue: '文学', wuyi: '武艺', caiyi: '才艺', daode: '道德', tineng: '体能' }[a] || a;
}

const actions = {
  study(s)   { return trainAttr(s, 'wenxue', rnd(2, 4), 8,  '你在藏书阁苦读诗书'); },
  martial(s) { return trainAttr(s, 'wuyi',   rnd(2, 4), 12, '你在习武场操练武艺'); },
  music(s)   { return trainAttr(s, 'caiyi',  rnd(2, 4), 8,  '你在琴音楼抚琴弄曲'); },
  temple(s)  {
    const chk = freeOk(s, 5); if (!chk.ok) return chk;
    s.vitals.tili -= 5;
    s.attrs.daode = clamp(s.attrs.daode + rnd(2, 3), 0, 100);
    s.vitals.kuaile = clamp(s.vitals.kuaile + 3, 0, 100);
    log(s, '你在佛寺听经礼佛，心境澄明，道德 +' + 2 + '。');
    advancePeriod(s);
    return { ok: true };
  },
  hunt(s) {
    const chk = freeOk(s, 15); if (!chk.ok) return chk;
    s.vitals.tili -= 15;
    const autumn = [8, 9, 10].indexOf(s.month) >= 0;
    const gain = rnd(2, 3) + (autumn ? 2 : 0);
    s.attrs.tineng = clamp(s.attrs.tineng + gain, 0, 100);
    s.vitals.kuaile = clamp(s.vitals.kuaile + 5, 0, 100);
    log(s, '你在围猎场纵马驰骋' + (autumn ? '，秋猎正当时' : '') + '，体能 +' + gain + '。');
    advancePeriod(s);
    return { ok: true };
  },
  doctor(s) {
    const chk = freeOk(s, 5); if (!chk.ok) return chk;
    if (s.flags.doctorMonth === s.year * 100 + s.month) return { ok: false, msg: '太医本月已请过脉，下月再来。' };
    s.flags.doctorMonth = s.year * 100 + s.month;
    s.vitals.tili -= 5;
    const heal = chance(0.15) ? 100 : rnd(15, 30);
    s.vitals.jiankang = clamp(s.vitals.jiankang + heal, 0, 100);
    log(s, '太医为你请脉开方，健康 +' + heal + '。', 'good');
    advancePeriod(s);
    return { ok: true };
  },
  yipinlou(s) {
    const chk = freeOk(s, 5); if (!chk.ok) return chk;
    if ([1, 7].indexOf(s.month) < 0) { return { ok: false, msg: '包打听行踪不定，唯有正月与七月在一品楼现身。' }; }
    if (s.treasury < 50) return { ok: false, msg: '国库不足五十万两，付不起荐才的谢礼。' };
    s.treasury -= 50;
    s.vitals.tili -= 5;
    const t = makeOfficial(rnd(70, 95));
    t.yexin = clamp(rnd(5, 45), 5, 99);
    if (s.idle.length < 12) { s.idle.push(t); log(s, '包打听为你引荐了奇才' + t.name + '（已入候补）。', 'good'); }
    else log(s, '包打听引荐了' + t.name + '，可惜候补已满，错失人才。', 'bad');
    advancePeriod(s);
    return { ok: true };
  },
  lihuayuan(s) {
    const chk = freeOk(s, 5); if (!chk.ok) return chk;
    if (s.flags.lihuayuanMonth === s.year * 100 + s.month) return { ok: false, msg: '本月已去过梨花苑，注意龙体。' };
    if (s.treasury < 20) return { ok: false, msg: '国库不足二十万两。' };
    s.flags.lihuayuanMonth = s.year * 100 + s.month;
    s.treasury -= 20;
    s.vitals.tili = clamp(s.vitals.tili + 10, 0, 100);
    s.vitals.kuaile = clamp(s.vitals.kuaile + 15, 0, 100);
    s.vitals.jiankang = clamp(s.vitals.jiankang - 3, 0, 100);
    log(s, '你在梨花苑听曲饮酒，快活似神仙。快乐 +15，健康 -3。');
    advancePeriod(s);
    return { ok: true };
  },
  alchemy(s) {
    const chk = freeOk(s, 5); if (!chk.ok) return chk;
    if (s.flags.alchemyMonth === s.year * 100 + s.month) return { ok: false, msg: '丹炉本月已开过一炉。' };
    if (s.treasury < 100) return { ok: false, msg: '国库不足一百万两，无力开炉炼丹。' };
    s.flags.alchemyMonth = s.year * 100 + s.month;
    s.treasury -= 100;
    s.vitals.tili -= 5;
    if (chance(0.6)) {
      s.lifespan += 1;
      log(s, '丹成！你服下一枚延寿丹，寿数 +1 年。', 'good');
    } else {
      log(s, '炉火忽熄，只炼出一炉废丹。', 'bad');
    }
    advancePeriod(s);
    return { ok: true };
  },
  rest(s) {
    if (s.period === 0) return { ok: false, msg: '清晨请先上朝或罢朝。' };
    if (s.period === 3) return { ok: false, msg: '深夜请直接回宫安睡。' };
    s.vitals.tili = clamp(s.vitals.tili + 25, 0, 100);
    log(s, '你在养心殿小憩片刻，体力 +25。');
    advancePeriod(s);
    return { ok: true };
  }
};

/* ---------- 后宫 ---------- */
function haremVisit(s, id) {
  const chk = freeOk(s, 10); if (!chk.ok) return chk;
  const c = s.harem.find(x => x.id === id);
  if (!c) return { ok: false, msg: '查无此人。' };
  s.vitals.tili -= 10;
  s.vitals.kuaile = clamp(s.vitals.kuaile + 12, 0, 100);
  s.vitals.jiankang = clamp(s.vitals.jiankang - 5, 0, 100);
  c.chongai = clamp(c.chongai + 10, 0, 999);
  log(s, '你临幸了' + c.title + c.name + '。快乐 +12，健康 -5。');
  if (s.pregnant.length < 3 && chance(0.22 + c.meili / 500)) {
    s.pregnant.push({ left: 10, name: c.name });
    log(s, c.name + '被诊出喜脉，后宫上下喜气洋洋。', 'good');
  }
  advancePeriod(s);
  return { ok: true };
}
function haremAccompany(s, id) {
  const chk = freeOk(s, 5); if (!chk.ok) return chk;
  const c = s.harem.find(x => x.id === id);
  if (!c) return { ok: false, msg: '查无此人。' };
  s.vitals.tili -= 5;
  s.vitals.kuaile = clamp(s.vitals.kuaile + 6, 0, 100);
  c.chongai = clamp(c.chongai + 5, 0, 999);
  log(s, '你陪伴' + c.name + '赏花弈棋，宠爱 +5。');
  advancePeriod(s);
  return { ok: true };
}
function selectShow(s) {
  const chk = freeOk(s, 5); if (!chk.ok) return chk;
  if (s.flags.selectedShow === s.year) return { ok: false, msg: '今年已举办过选秀。' };
  if (s.year % 3 !== 0) return { ok: false, msg: '选秀三年一举，逢' + (Math.ceil(s.year / 3) * 3) + '年方可举办。' };
  if (s.treasury < 80) return { ok: false, msg: '国库不足八十万两，无力操办选秀。' };
  s.flags.selectedShow = s.year;
  s.treasury -= 80;
  s.vitals.tili -= 5;
  const n = rnd(1, 2);
  for (let i = 0; i < n; i++) {
    const meili = clamp(rnd(40, 80) + Math.floor(s.attrs.caiyi / 3), 10, 100);
    const c = makeConcubine(meili);
    s.harem.push(c);
    log(s, '秀女' + c.name + '（魅力' + c.meili + '）入选后宫，册为才人。', 'good');
  }
  advancePeriod(s);
  return { ok: true };
}
function makeHeir(s) {
  const princes = s.children.filter(c => c.gender === '皇子' && !c.heir);
  if (!princes.length) return { ok: false, msg: '尚无皇子可立。' };
  if (s.children.some(c => c.heir)) return { ok: false, msg: '已立过储君。' };
  princes[0].heir = true;
  s.huangwei = clamp(s.huangwei + 10, 0, 999);
  log(s, '你下旨立皇子' + princes[0].name + '为储君，国本既定。', 'important');
  return { ok: true };
}

/* ---------- 深夜：安寝 → 月度结算 ---------- */
function sleep(s) {
  if (s.period !== 3) return { ok: false, msg: '还没到深夜。' };
  nextMonth(s);
  return { ok: true };
}

function nextMonth(s) {
  // 安寝恢复
  s.vitals.tili = clamp(s.vitals.tili + 40 + Math.floor(s.attrs.tineng / 3), 0, 100);

  // 月份推进
  s.month++;
  if (s.month > 12) {
    s.month = 1; s.year++; s.age++;
    s.flags.sacrificed = false;
    log(s, '—— ' + s.era + s.year + '年，你' + s.age + '岁了 ——', 'important');
  }
  s.period = 0;
  s.inCourt = false;

  // 快乐影响健康
  s.vitals.jiankang = clamp(s.vitals.jiankang + Math.round((s.vitals.kuaile - 50) / 12), 0, 100);
  // 快乐自然回落
  s.vitals.kuaile = clamp(s.vitals.kuaile - 2, 0, 100);

  // 生病
  if (s.vitals.jiankang < 40 && chance(0.5)) {
    s.vitals.tili = clamp(s.vitals.tili - 25, 0, 100);
    s.lifespan -= 1;
    log(s, '你染了风寒，太医叮嘱静养。健康过低会折损寿数！', 'bad');
  }

  // 月度开支
  let expense = DATA.posts.length * 2 + Math.round(s.army.soldiers * 0.3) + s.harem.length * 2;
  s.treasury -= expense;

  // 季度税收（四/七/十/正月入库）
  if ([1, 4, 7, 10].indexOf(s.month) >= 0) {
    const ql = avgQinglian(s);
    const income = Math.round(
      300 * (s.taxRate / 0.15) *
      (0.5 + s.minxin / 200) *
      (0.6 + ql / 250) *
      (1 + 0.25 * conqueredCount(s) + 0.08 * s.buildings.jishi)
    );
    if (income > 0) {
      s.treasury += income;
      log(s, '季度税赋入库 +' + income + '万两。', 'good');
    }
  }

  // 国库亏空
  if (s.treasury < 0) {
    s.treasury = 0;
    s.minxin = clamp(s.minxin - 6, 0, 100);
    s.huangwei = clamp(s.huangwei - 4, 0, 999);
    DATA.posts.forEach(p => { const o = s.officials[p]; if (o) o.zhongcheng = clamp(o.zhongcheng - 5, 0, 99); });
    log(s, '国库亏空！百官俸禄无着，军心民心浮动。', 'bad');
  }

  // 民心漂移
  const taxOpt = DATA.taxOptions.find(o => o.rate === s.taxRate);
  let drift = (taxOpt ? taxOpt.minxin : 0) + s.buildings.simiao;
  if (s.minxin < 60) drift += 1; else if (s.minxin > 80) drift -= 1;
  s.minxin = clamp(s.minxin + drift, 0, 100);

  // 军队训练
  s.army.training = clamp(s.army.training + 1 + s.buildings.xiaochang, 0, 100);

  // 工程进度
  if (s.construction) {
    s.construction.left--;
    if (s.construction.left <= 0) {
      const key = s.construction.key;
      s.buildings[key]++;
      s.construction = null;
      log(s, DATA.buildings[key].name + '（' + s.buildings[key] + '级）竣工！', 'good');
      if (key === 'lingqin') s.huangwei = clamp(s.huangwei + 30, 0, 999);
    }
  }

  // 贸易归来
  if (s.trade) {
    s.trade.left--;
    if (s.trade.left <= 0) {
      if (chance(0.8)) {
        const profit = Math.round(rnd(60, 150) * s.trade.zhihui / 60);
        s.treasury += profit;
        log(s, s.trade.name + '率商队满载而归，获利 ' + profit + ' 万两！', 'good');
      } else {
        log(s, s.trade.name + '的商队途中遇劫，血本无归。', 'bad');
      }
      s.trade = null;
    }
  }

  // 妃嫔生产
  for (let i = s.pregnant.length - 1; i >= 0; i--) {
    const p = s.pregnant[i];
    p.left--;
    if (p.left <= 0) {
      s.pregnant.splice(i, 1);
      const gender = chance(0.55) ? '皇子' : '公主';
      const name = pick(DATA.childNames);
      s.children.push({ name, gender, heir: false });
      s.stats.children++;
      s.vitals.kuaile = clamp(s.vitals.kuaile + 10, 0, 100);
      log(s, p.name + '诞下' + gender + name + '，皇室添丁！', 'important');
    }
  }

  // 随机事件
  randomEvent(s);

  // 驾崩判定
  if (s.vitals.jiankang <= 0) {
    gameOver(s, '你积劳成疾，龙驭上宾。');
  } else if (s.age >= s.lifespan) {
    gameOver(s, '你寿终正寝，享年' + s.age + '岁。');
  }

  save(s);
}

/* ---------- 随机事件 ---------- */
function randomEvent(s) {
  if (s.over || s.pending) return;
  if (!chance(0.4)) return;
  const roll = rnd(1, 100);
  const chengxiang = s.officials['丞相'];

  if (roll <= 22) {
    // 灾害
    let disasterChance = s.flags.sacrificed ? 0.5 : 1;
    if (chengxiang && chengxiang.zhihui > 70) disasterChance *= 0.7;
    if (!chance(disasterChance)) { log(s, '丞相' + (chengxiang ? chengxiang.name : '') + '处置得当，四方无大灾。'); return; }
    const cost = rnd(30, 80);
    s.pending = { type: 'disaster', cost };
    log(s, '急报：多地遭灾，需拨款 ' + cost + ' 万两赈济！', 'bad');
  } else if (roll <= 38) {
    // 刺客
    const def = s.attrs.wuyi + rnd(0, 50);
    if (def > 60) {
      s.huangwei = clamp(s.huangwei + 3, 0, 999);
      log(s, '有刺客夜闯禁宫，被你亲手击退！皇威 +3。', 'good');
    } else {
      const dmg = rnd(10, 25);
      s.vitals.jiankang = clamp(s.vitals.jiankang - dmg, 0, 100);
      log(s, '有刺客行刺，你躲闪不及受了伤，健康 -' + dmg + '。勤练武艺可防身！', 'bad');
    }
  } else if (roll <= 52) {
    // 谋反
    let rebel = null;
    DATA.posts.forEach(p => {
      const o = s.officials[p];
      if (o && o.yexin > o.zhongcheng && o.yexin > 65 && (!rebel || o.yexin > rebel.yexin)) rebel = { o, post: p };
    });
    if (rebel) {
      if (s.army.soldiers >= 20) {
        const lost = Math.min(s.army.soldiers, rnd(2, 6));
        s.army.soldiers -= lost;
        s.officials[rebel.post] = null;
        s.huangwei = clamp(s.huangwei + 5, 0, 999);
        log(s, rebel.post + rebel.o.name + '举兵谋反！你派中央军平定叛乱，折损' + lost + '万兵马。', 'bad');
      } else {
        s.treasury = Math.max(0, s.treasury - 100);
        s.minxin = clamp(s.minxin - 10, 0, 100);
        s.huangwei = clamp(s.huangwei - 10, 0, 999);
        s.officials[rebel.post] = null;
        log(s, rebel.post + rebel.o.name + '谋反，京城大乱！因兵力不足，朝廷付出了惨重代价才平息事态。', 'bad');
      }
    }
  } else if (roll <= 64) {
    // 敌国犯边
    const target = s.countries.find(c => !c.done);
    if (target && s.huangwei < 45 && armyPower(s) < target.power * 0.6) {
      const loss = rnd(20, 60);
      s.treasury = Math.max(0, s.treasury - loss);
      s.minxin = clamp(s.minxin - 6, 0, 100);
      log(s, target.name + '犯边劫掠，边关损失 ' + loss + ' 万两。皇威不足、军备松弛所致！', 'bad');
    }
  } else if (roll <= 80) {
    // 祥瑞
    const gain = rnd(10, 40);
    s.treasury += gain;
    s.minxin = clamp(s.minxin + 2, 0, 100);
    log(s, '地方进献祥瑞与贡品，国库 +' + gain + ' 万两，万民称颂。', 'good');
  } else {
    // 民间轶事
    s.vitals.kuaile = clamp(s.vitals.kuaile + 4, 0, 100);
    log(s, pick([
      '京城说书人正讲你的故事，百姓听得津津有味。',
      '今年风调雨顺，田间稻浪滚滚。',
      '有老农献上新培育的稻种，你嘉赏了他。',
      '宫中桂花开了，香气袭人。'
    ]));
  }
}

function disasterChoice(s, pay) {
  if (!s.pending || s.pending.type !== 'disaster') return { ok: false, msg: '没有待处理的灾情。' };
  const cost = s.pending.cost;
  if (pay) {
    if (s.treasury < cost) return { ok: false, msg: '国库不足 ' + cost + ' 万两，无法拨款。' };
    s.treasury -= cost;
    s.minxin = clamp(s.minxin + 4, 0, 100);
    log(s, '你下旨拨款 ' + cost + ' 万两赈灾，灾民感念皇恩。', 'good');
  } else {
    s.minxin = clamp(s.minxin - 8, 0, 100);
    s.huangwei = clamp(s.huangwei - 3, 0, 999);
    log(s, '你对灾情置之不理，灾民流离失所，民怨沸腾。', 'bad');
  }
  s.pending = null;
  return { ok: true };
}

/* ---------- 结局 ---------- */
function gameOver(s, reason) {
  const conquered = conqueredCount(s);
  const a = s.attrs;
  let title, desc;
  if (conquered === s.countries.length) {
    title = '武皇帝'; desc = '你横扫六合、一统天下，武功赫赫，青史留名。';
  } else if (conquered >= 3) {
    title = '昭武皇帝'; desc = '你开疆拓土，威震四方，虽未竟全功，亦是一代雄主。';
  } else if (a.wenxue >= 80 && s.minxin >= 70) {
    title = '文皇帝'; desc = '你崇文兴教，海内晏然，文风蔚起，堪称治世明君。';
  } else if (s.minxin >= 80 && s.treasury >= 1500) {
    title = '明皇帝'; desc = '你勤政爱民，国库充盈，百姓安居乐业，是为盛世。';
  } else if (s.minxin < 30) {
    title = '哀皇帝'; desc = '你在位时民不聊生，怨声载道，身后令人唏嘘。';
  } else if (s.vitals.kuaile >= 80 && s.stats.children >= 5) {
    title = '康皇帝'; desc = '你一生逍遥，儿孙绕膝，虽无大功，亦算福寿双全。';
  } else {
    title = '平皇帝'; desc = '你平平常常地过完了一生帝王路，无功亦无过。';
  }
  const score = Math.round(
    s.treasury / 10 + s.minxin * 2 + s.huangwei * 2 + conquered * 500 +
    s.stats.children * 30 + (a.wenxue + a.wuyi + a.caiyi + a.daode + a.tineng) +
    s.age * 5
  );
  s.over = { title, score, reason, desc };
  log(s, reason + ' 谥号：' + title + '。', 'important');
  save(s);
}

/* ---------- 导出 ---------- */
export const Engine = {
  newGame, save, loadSave, hasSave,
  holdCourt, skipCourt, endCourt,
  dismiss, appoint,
  keju, kejuPick, sacrifice, startTrade,
  setTax, census,
  recruitSoldiers, trainArmy, campaign, captiveChoice,
  build, investigate,
  actions, haremVisit, haremAccompany, selectShow, makeHeir,
  sleep, nextMonth, disasterChoice,
  armyPower, avgQinglian, conqueredCount, canCourt,
  DATA
};
