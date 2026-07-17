/* UI 冒烟测试：用最小 DOM 桩加载 ui.js，驱动渲染与点击，捕获运行时错误 */
'use strict';

/* ---------- 最小 DOM 桩 ---------- */
function makeEl(tag) {
  const el = {
    tagName: tag || 'div',
    _innerHTML: '',
    children: [],
    dataset: {},
    style: {},
    scrollTop: 0,
    scrollHeight: 0,
    className: '',
    textContent: '',
    value: '',
    onclick: null,
    _listeners: {},
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    set innerHTML(v) { this._innerHTML = v; this.children = []; },
    get innerHTML() { return this._innerHTML; },
    appendChild(c) { this.children.push(c); },
    addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
    querySelector(sel) { return getEl(this._id + ' ' + sel); },
    fire(type, ev) { (this._listeners[type] || []).forEach(fn => fn(ev || { target: { dataset: {} } })); }
  };
  return el;
}
const elCache = {};
function getEl(sel) {
  if (!elCache[sel]) { elCache[sel] = makeEl(); elCache[sel]._id = sel; }
  return elCache[sel];
}

globalThis.window = globalThis;
globalThis.document = {
  querySelector: getEl,
  createElement: tag => makeEl(tag),
  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
  _listeners: {},
  fire(type) { (this._listeners[type] || []).forEach(fn => fn()); }
};

/* ---------- 加载游戏 ---------- */
require('../js/data.js');
require('../js/engine.js');
require('../js/ui.js');

const E = globalThis.Engine;
let failures = 0;
function check(cond, label) {
  if (!cond) { failures++; console.error('  ✗ ' + label); }
  else console.log('  ✓ ' + label);
}
function panel() { return getEl('#panel').innerHTML; }
function clickPanel(dataset) { getEl('#panel').fire('click', { target: { dataset } }); }

/* ---------- 启动 ---------- */
console.log('== 启动 ==');
document.fire('DOMContentLoaded');
check(panel().indexOf('宣政殿') >= 0, '初始渲染宣政殿');
check(getEl('#clock').innerHTML.indexOf('建初') >= 0, '时钟显示年号');
check(getEl('#vitals').innerHTML.indexOf('国库') >= 0, '状态条渲染');
check(getEl('#attrs').innerHTML.indexOf('文学') >= 0, '属性栏渲染');

/* ---------- 上朝与各部 ---------- */
console.log('== 上朝 ==');
clickPanel({ act: 'holdCourt' });
check(panel().indexOf('早朝') >= 0, '上朝后显示早朝面板');
for (const tab of ['hu', 'li2', 'bing', 'xing', 'gong', 'li']) {
  clickPanel({ tab });
  check(getEl('#courtBody').innerHTML.length > 100, '切换到' + tab + '部标签');
}
check(getEl('#courtBody').innerHTML.indexOf('百官考课') >= 0, '吏部官员表渲染');
// 正月不行科举，先推进到二月再试
clickPanel({ act: 'endCourt' });
clickPanel({ act: 'rest' });
clickPanel({ act: 'rest' });
clickPanel({ act: 'sleep' });
clickPanel({ act: 'holdCourt' });
clickPanel({ tab: 'li2' });
clickPanel({ act: 'keju' });
check(getEl('#modal').innerHTML.indexOf('科举放榜') >= 0, '科举弹窗');
check(getEl('#modal').innerHTML.indexOf('钦点') >= 0, '弹窗含钦点按钮');
// 点“全部落榜”（真实按钮走 modal 创建路径）
const actionsStub = getEl('#modal .actions');
const 落榜Btn = actionsStub.children.find(b => b.textContent === '全部落榜');
check(!!落榜Btn, '落榜按钮已创建');
if (落榜Btn) 落榜Btn.onclick();
check(getEl('#modal').classList.contains('hidden'), '选择后弹窗关闭');
clickPanel({ act: 'endCourt' });
check(panel().indexOf('皇城舆图') >= 0, '退朝后显示皇城舆图');

/* ---------- 自由行动 ---------- */
console.log('== 自由行动 ==');
for (const act of ['study', 'martial']) {
  clickPanel({ act });
  check(panel().length > 50, '行动 ' + act + ' 后面板重渲染');
}
check(panel().indexOf('安寝') >= 0, '深夜显示安寝面板');
clickPanel({ act: 'sleep' });
check(panel().indexOf('宣政殿') >= 0 || getEl('#modal').innerHTML.indexOf('灾情') >= 0, '安寝进入新月');

/* ---------- 后宫 ---------- */
console.log('== 后宫 ==');
// 推进到晌午
clickPanel({ act: 'skipCourt' });
clickPanel({ act: 'openHarem' });
check(panel().indexOf('后宫') >= 0 && panel().indexOf('皇后') >= 0, '后宫面板显示皇后');
clickPanel({ act: 'closeHarem' });
check(panel().indexOf('皇城舆图') >= 0, '返回舆图');

/* ---------- 连续跑 24 个月 ---------- */
console.log('== 长跑 ==');
let err = null;
try {
  for (let i = 0; i < 24; i++) {
    // 通过面板点击驱动完整一月
    clickPanel({ act: 'holdCourt' });
    if (panel().indexOf('早朝') < 0) clickPanel({ act: 'skipCourt' });
    else clickPanel({ act: 'endCourt' });
    clickPanel({ act: 'study' });
    clickPanel({ act: 'rest' });
    clickPanel({ act: 'sleep' });
    // 若出现灾情弹窗，选择置之不理（通过引擎层，桩中直接关闭）
    const m = getEl('#modal');
    if (m.innerHTML.indexOf('灾情急报') >= 0) {
      m.classList.add('hidden');
    }
  }
} catch (e) { err = e; }
check(!err, '24 个月面板驱动无异常' + (err ? '：' + err.message : ''));
check(getEl('#log').innerHTML.length > 100, '起居注有内容');

/* ---------- 顶栏按钮 ---------- */
console.log('== 顶栏 ==');
try {
  getEl('#topbtns').fire('click', { target: { dataset: { cmd: 'help' } } });
  check(getEl('#modal').innerHTML.indexOf('玩法说明') >= 0, '帮助弹窗');
  getEl('#topbtns').fire('click', { target: { dataset: { cmd: 'save' } } });
  check(true, '存档按钮无异常');
} catch (e) { check(false, '顶栏按钮异常：' + e.message); }

console.log(failures === 0 ? '\nUI 冒烟全部通过 ✓' : '\n有 ' + failures + ' 项失败 ✗');
process.exit(failures === 0 ? 0 : 1);
