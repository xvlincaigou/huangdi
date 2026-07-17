/* 无头模拟测试：在 node 中加载引擎，模拟玩家操作，验证逻辑与数值平衡 */
import { DATA } from '../src/data.js';
import { Engine as E } from '../src/engine.js';

let failures = 0;
function check(cond, label) {
  if (!cond) { failures++; console.error('  ✗ ' + label); }
  else console.log('  ✓ ' + label);
}
function num(v) { return typeof v === 'number' && isFinite(v); }

/* ---------- 1. 新游戏状态 ---------- */
console.log('== 新游戏 ==');
let s = E.newGame();
check(s.year === 1 && s.month === 1 && s.period === 0, '初始时间正确');
check(DATA.posts.every(p => s.officials[p]), '初始八官齐备');
check(s.harem.length === 1 && s.harem[0].title === '皇后', '初始有皇后');
check(num(s.treasury) && s.treasury === 800, '国库初始 800 万');

/* ---------- 2. 上朝流程 ---------- */
console.log('== 上朝 ==');
let r = E.holdCourt(s);
check(r.ok && s.inCourt, '可以上朝');
r = E.keju(s);
check(!r.ok, '正月不行科举');
r = E.setTax(s, 0.20);
check(r.ok && s.taxRate === 0.20, '正月可调税率');
const tBefore = s.treasury;
r = E.sacrifice(s);
check(r.ok && s.flags.sacrificed && s.treasury === tBefore - 50, '正月祭祀');
r = E.endCourt(s);
check(r.ok && !s.inCourt && s.period === 1, '退朝进入晌午');
// 进入二月
E.actions.rest(s); E.actions.rest(s); E.sleep(s);
r = E.holdCourt(s);
check(r.ok && s.month === 2, '二月上朝');
r = E.keju(s);
check(r.ok && s.pending && s.pending.type === 'keju' && s.pending.list.length === 3, '科举产生3名考生');
const cand = s.pending.list[0];
r = E.kejuPick(s, cand.id);
check(r.ok && s.idle.length === 1 && !s.pending, '钦点入候补');
r = E.appoint(s, '吏部尚书', cand.id);
check(r.ok && s.officials['吏部尚书'].id === cand.id && s.idle.length === 0, '任命官员');
r = E.setTax(s, 0.10);
check(!r.ok, '二月不可调税率');
r = E.recruitSoldiers(s, 10);
check(r.ok && s.army.soldiers === 15, '征兵10万');
r = E.trainArmy(s);
check(r.ok, '操练军队');
r = E.build(s, 'jishi');
check(r.ok && s.construction && s.construction.key === 'jishi', '营建集市');
r = E.investigate(s);
check(r.ok, '刑部监察');
r = E.endCourt(s);
check(r.ok && s.period === 1, '再次退朝');

/* ---------- 3. 自由行动 ---------- */
console.log('== 自由行动 ==');
const wx = s.attrs.wenxue;
r = E.actions.study(s);
check(r.ok && s.attrs.wenxue > wx && s.period === 2, '藏书阁学习推进到晚上');
r = E.actions.rest(s);
check(r.ok && s.period === 3, '养心殿休息推进到深夜');
r = E.actions.study(s);
check(!r.ok, '深夜不可再行动');
r = E.sleep(s);
check(r.ok && s.month === 3 && s.period === 0, '安寝进入三月');

/* ---------- 4. 后宫 ---------- */
console.log('== 后宫 ==');
E.holdCourt(s); E.endCourt(s);
const c0 = s.harem[0];
const kl = s.vitals.kuaile;
r = E.haremVisit(s, c0.id);
check(r.ok && s.vitals.kuaile >= kl && s.period === 2, '临幸推进时段');
r = E.selectShow(s);
check(!r.ok, '非选秀年不可选秀');
E.actions.rest(s);
E.sleep(s);

/* ---------- 5. 长期模拟：勤勉玩家 40 年 ---------- */
console.log('== 长期模拟（勤勉玩家） ==');
s = E.newGame();
let months = 0, courtDays = 0, errors = [];
while (!s.over && months < 600) {
  months++;
  try {
    // 清晨
    if (E.canCourt(s)) {
      E.holdCourt(s); courtDays++;
      if (s.month !== 1 && s.flags.kejuMonth !== s.year * 100 + s.month) {
        E.keju(s);
        if (s.pending && s.pending.type === 'keju') {
          // 选野心低、忠诚高者
          const best = s.pending.list.slice().sort((a, b) => (a.yexin - a.zhongcheng) - (b.yexin - b.zhongcheng))[0];
          if (s.idle.length < 12) E.kejuPick(s, best.id); else E.kejuPick(s, null);
        }
      }
      if (s.month === 1 && !s.flags.sacrificed) E.sacrifice(s);
      // 换掉野心>忠诚 的官员
      DATA.posts.forEach(p => {
        const o = s.officials[p];
        if (o && o.yexin > o.zhongcheng && s.idle.length) {
          const best = s.idle.slice().sort((a, b) => (a.yexin - a.zhongcheng) - (b.yexin - b.zhongcheng))[0];
          if (best && best.yexin < best.zhongcheng) E.appoint(s, p, best.id);
        }
      });
      // 建设
      if (!s.construction && s.treasury > 400) {
        for (const k of ['jishi', 'tiejiang', 'xiaochang', 'shuyuan', 'simiao', 'lingqin']) {
          if (s.buildings[k] < DATA.buildings[k].max) { E.build(s, k); break; }
        }
      }
      // 军备
      if (s.treasury > 800 && s.army.soldiers < 120) E.recruitSoldiers(s, 50);
      if (s.army.training < 90) E.trainArmy(s);
      // 出征
      const next = s.countries.findIndex(c => !c.done);
      if (next >= 0 && E.armyPower(s) > s.countries[next].power * 1.3) {
        E.campaign(s, next);
        if (s.pending && s.pending.type === 'captive') E.captiveChoice(s, true);
      }
      E.endCourt(s);
    } else {
      E.skipCourt(s);
    }
    // 晌午
    if (s.vitals.jiankang < 60) E.actions.doctor(s);
    else if (s.vitals.tili < 50) E.actions.rest(s);
    else E.actions.study(s);
    // 晚上
    if (s.vitals.tili < 40) E.actions.rest(s);
    else if (s.vitals.kuaile < 40 && s.harem.length) E.haremAccompany(s, s.harem[0].id);
    else E.actions.martial(s);
    // 处理灾害弹窗
    if (s.pending && s.pending.type === 'disaster') E.disasterChoice(s, s.treasury > s.pending.cost);
    // 深夜
    E.sleep(s);
    if (s.pending && s.pending.type === 'disaster') E.disasterChoice(s, s.treasury > s.pending.cost);
  } catch (err) {
    errors.push('month ' + months + ': ' + err.message);
    break;
  }
  // 不变量检查
  if (!num(s.treasury) || !num(s.vitals.tili) || !num(s.minxin) || !num(s.huangwei)) {
    errors.push('month ' + months + ': 数值出现 NaN'); break;
  }
}
check(errors.length === 0, '模拟 ' + months + ' 个月无异常' + (errors.length ? '：' + errors[0] : ''));
check(s.over !== null, '游戏最终迎来结局（' + (s.over ? s.over.title : '无') + '）');
console.log('  结局: ' + (s.over && s.over.title) + ' | 在位 ' + s.year + ' 年 | 享年 ' + s.age +
  ' | 国库 ' + Math.round(s.treasury) + ' | 平定 ' + E.conqueredCount(s) + ' 国 | 皇嗣 ' + s.children.length +
  ' | 上朝 ' + courtDays + ' 天 | 评分 ' + (s.over && s.over.score));
check(s.year >= 10, '勤勉玩家至少在位10年');
check(E.conqueredCount(s) >= 1, '勤勉玩家至少平定一国');

/* ---------- 6. 昏君模拟：不上朝只享乐 ---------- */
console.log('== 昏君模拟 ==');
s = E.newGame();
months = 0;
while (!s.over && months < 480) {
  months++;
  E.skipCourt(s);
  if (s.vitals.tili >= 15) E.actions.lihuayuan(s); else E.actions.rest(s);
  if (s.harem.length && s.vitals.tili >= 10) E.haremVisit(s, s.harem[0].id); else E.actions.rest(s);
  if (s.pending && s.pending.type === 'disaster') E.disasterChoice(s, false);
  E.sleep(s);
  if (s.pending && s.pending.type === 'disaster') E.disasterChoice(s, false);
}
check(s.over !== null, '昏君也会迎来结局（' + (s.over && s.over.title) + '）');
console.log('  结局: ' + (s.over && s.over.title) + ' | 在位 ' + s.year + ' 年 | 民心 ' + s.minxin + ' | 国库 ' + Math.round(s.treasury));

/* ---------- 7. 存档读档 ---------- */
console.log('== 存档 ==');
s = E.newGame();
const json = JSON.stringify(s);
const s2 = JSON.parse(json);
check(s2.officials['丞相'].name === s.officials['丞相'].name, '状态可序列化/恢复');

console.log(failures === 0 ? '\n全部通过 ✓' : '\n有 ' + failures + ' 项失败 ✗');
process.exit(failures === 0 ? 0 : 1);
