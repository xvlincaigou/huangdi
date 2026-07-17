/* 皇帝成长计划 · 网页复刻版 —— UI 渲染层 */
(function () {
'use strict';

const E = window.Engine;
const DATA = window.DATA;
let S = null;               // 当前游戏状态
let courtTab = 'li';        // 吏/户/礼/兵/刑/工
let placeView = null;       // null=地图, 'harem'=后宫

const $ = sel => document.querySelector(sel);

/* ---------- 工具 ---------- */
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toast(msg) { modal('提示', '<p>' + esc(msg) + '</p>', [{ label: '知道了', fn: closeModal }]); }
function modal(title, bodyHTML, actions) {
  const m = $('#modal');
  m.innerHTML = '<div class="box"><h3>' + title + '</h3><div class="body">' + bodyHTML + '</div><div class="actions"></div></div>';
  const bar = m.querySelector('.actions');
  (actions || []).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn' + (a.primary ? ' primary' : '');
    b.textContent = a.label;
    b.onclick = a.fn;
    bar.appendChild(b);
  });
  m.classList.remove('hidden');
}
function closeModal() { $('#modal').classList.add('hidden'); $('#modal').innerHTML = ''; }

function run(fn) {
  const r = fn();
  if (r && !r.ok && r.msg) { render(); toast(r.msg); return; }
  render();
}

/* ---------- 渲染入口 ---------- */
function render() {
  if (!S) return;
  renderClock();
  renderVitals();
  renderAttrs();
  renderLog();
  if (S.over) { renderEnding(); return; }
  renderPanel();
  // 待抉择事件弹窗
  if (S.pending) renderPending();
}

function renderClock() {
  $('#clock').innerHTML = esc(S.era) + S.year + '年 · ' + DATA.months[S.month - 1] +
    ' · <span class="period">' + DATA.periods[S.period] + '</span>';
}

function renderVitals() {
  const v = S.vitals;
  const items = [
    ['年龄', S.age + '岁'], ['国库', Math.round(S.treasury) + '万'], ['民心', S.minxin],
    ['皇威', S.huangwei], ['体力', v.tili], ['健康', v.jiankang], ['快乐', v.kuaile]
  ];
  $('#vitals').innerHTML = items.map(([k, val]) => {
    const low = (k === '体力' || k === '健康' || k === '快乐' || k === '民心') && val < 40 ? ' low' : '';
    return '<span class="v' + low + '">' + k + ' <b>' + val + '</b></span>';
  }).join('');
}

function renderAttrs() {
  const a = S.attrs;
  const rows = [
    ['文学', a.wenxue], ['武艺', a.wuyi], ['才艺', a.caiyi], ['道德', a.daode], ['体能', a.tineng],
    ['军队', S.army.soldiers + '万 / 训练' + S.army.training],
    ['皇子', S.children.filter(c => c.gender === '皇子').length + ' / 公主 ' + S.children.filter(c => c.gender === '公主').length],
    ['疆域', E.conqueredCount(S) + ' / ' + S.countries.length + ' 国']
  ];
  $('#attrs').innerHTML = '<h3>御览</h3>' + rows.map(([k, v]) =>
    '<div class="row"><span>' + k + '</span><span class="val">' + v + '</span></div>').join('');
}

function renderLog() {
  const el = $('#log');
  el.innerHTML = S.log.slice(-60).map(e =>
    '<p class="' + (e.cls || '') + '"><small>' + esc(e.t) + '</small> ' + esc(e.msg) + '</p>').join('');
  el.scrollTop = el.scrollHeight;
}

/* ---------- 主面板 ---------- */
function renderPanel() {
  const p = $('#panel');
  if (S.period === 0 && !S.inCourt) {
    placeView = null;
    p.innerHTML = '<h2>宣政殿</h2>' +
      '<p class="desc">五更天，文武百官已列队殿外，等候早朝。</p>' +
      '<button class="btn primary" data-act="holdCourt">上朝理政</button> ' +
      '<button class="btn" data-act="skipCourt">今日罢朝</button>' +
      (E.canCourt(S) ? '' : '<p class="desc msg-bad" style="margin-top:8px">体力或健康不足，无法上朝（需体力≥40、健康≥50）。</p>');
    return;
  }
  if (S.inCourt) { renderCourt(p); return; }
  if (S.period === 3) {
    placeView = null;
    p.innerHTML = '<h2>养心殿</h2>' +
      '<p class="desc">夜已深，宫中更鼓声声。安寝之后，便是新的一月。</p>' +
      '<button class="btn primary" data-act="sleep">回宫安寝（进入下一月）</button>';
    return;
  }
  if (placeView === 'harem') { renderHarem(p); return; }
  renderMap(p);
}

function renderMap(p) {
  const places = [
    ['study', '藏书阁', '苦读诗书，文学↑'],
    ['martial', '习武场', '操练武艺，武艺↑'],
    ['music', '琴音楼', '抚琴弄曲，才艺↑'],
    ['temple', '佛寺', '听经礼佛，道德↑'],
    ['hunt', '围猎场', '纵马围猎，体能↑（秋季更佳）'],
    ['doctor', '太医院', '请脉调养，健康↑（每月一次）'],
    ['yipinlou', '一品楼', '包打听荐才（正月/七月）'],
    ['lihuayuan', '梨花苑', '听曲饮酒，快乐↑体力↑'],
    ['alchemy', '炼丹房', '开炉炼丹，可延寿（百万两/月）'],
    ['rest', '养心殿', '小憩片刻，体力+25']
  ];
  p.innerHTML = '<h2>皇城舆图</h2>' +
    '<p class="desc">' + DATA.periods[S.period] + '时分，陛下想去何处？</p>' +
    '<div class="grid">' +
    places.map(([act, name, sub]) =>
      '<div class="place"><div class="name">' + name + '</div><div class="sub">' + sub + '</div>' +
      '<button class="btn small" data-act="' + act + '">前往</button></div>').join('') +
    '<div class="place"><div class="name">后宫</div><div class="sub">妃嫔 ' + S.harem.length + ' 人 · 皇嗣 ' + S.children.length + ' 人</div>' +
    '<button class="btn small" data-act="openHarem">前往</button></div>' +
    '</div>';
}

/* ---------- 上朝 ---------- */
function renderCourt(p) {
  const tabs = [['li', '吏部'], ['hu', '户部'], ['li2', '礼部'], ['bing', '兵部'], ['xing', '刑部'], ['gong', '工部']];
  let html = '<h2>宣政殿 · 早朝</h2><div class="tabs">' +
    tabs.map(([k, n]) => '<button class="btn small' + (courtTab === k ? ' active' : '') + '" data-tab="' + k + '">' + n + '</button>').join('') +
    '</div><div id="courtBody"></div>' +
    '<div style="margin-top:14px"><button class="btn primary" data-act="endCourt">退朝</button></div>';
  p.innerHTML = html;
  const body = $('#courtBody');
  if (courtTab === 'li') renderLi(body);
  else if (courtTab === 'hu') renderHu(body);
  else if (courtTab === 'li2') renderLi2(body);
  else if (courtTab === 'bing') renderBing(body);
  else if (courtTab === 'xing') renderXing(body);
  else if (courtTab === 'gong') renderGong(body);
}

function offCell(o, key) {
  if (!o) return '<td>-</td>';
  let cls = '';
  if (key === 'yexin' && (o.yexin > o.zhongcheng || o.yexin > 65)) cls = ' class="warn"';
  if (key === 'qinglian' && o.qinglian < 40) cls = ' class="warn"';
  if (key === 'zhongcheng' && o.zhongcheng < 40) cls = ' class="warn"';
  return '<td' + cls + '>' + o[key] + '</td>';
}

function renderLi(el) {
  let html = '<p class="desc">百官考课：<span class="msg-bad">野心＞忠诚或野心＞65 者易生异心</span>，清廉低者侵蚀税收。</p>' +
    '<table class="tb"><tr><th>职位</th><th>姓名</th><th>忠诚</th><th>野心</th><th>清廉</th><th>智慧</th><th>武力</th><th></th></tr>';
  DATA.posts.forEach(post => {
    const o = S.officials[post];
    html += '<tr><td>' + post + '</td><td>' + (o ? esc(o.name) : '<span class="msg-bad">空缺</span>') + '</td>' +
      offCell(o, 'zhongcheng') + offCell(o, 'yexin') + offCell(o, 'qinglian') + offCell(o, 'zhihui') + offCell(o, 'wuli') +
      '<td>' + (o ? '<button class="btn small danger" data-dismiss="' + post + '">罢免</button>' : '') + '</td></tr>';
  });
  html += '</table>';
  html += '<h4>候补官员（' + S.idle.length + '/12）</h4>';
  if (!S.idle.length) html += '<p class="desc">暂无候补。可通过科举、一品楼荐才获得。</p>';
  else {
    html += '<table class="tb"><tr><th>姓名</th><th>忠诚</th><th>野心</th><th>清廉</th><th>智慧</th><th>武力</th><th>任命为</th></tr>';
    S.idle.forEach(t => {
      html += '<tr><td>' + esc(t.name) + '</td><td>' + t.zhongcheng + '</td><td>' + t.yexin + '</td><td>' + t.qinglian + '</td><td>' + t.zhihui + '</td><td>' + t.wuli + '</td>' +
        '<td><select data-appoint="' + t.id + '"><option value="">选择职位</option>' +
        DATA.posts.map(post => '<option value="' + post + '">' + post + '</option>').join('') + '</select></td></tr>';
    });
    html += '</table>';
  }
  el.innerHTML = html;
}

function renderHu(el) {
  const canAdjust = [1, 4, 7, 10].indexOf(S.month) >= 0;
  el.innerHTML = '<p class="desc">国库 <b class="msg-gold">' + Math.round(S.treasury) + '</b> 万两 · 官员平均清廉 ' + Math.round(E.avgQinglian(S)) +
    ' · 税于正/四/七/十月入库，届时方可调整税率。</p>' +
    '<h4>调整税率' + (canAdjust ? '' : '（本月不可调整）') + '</h4>' +
    DATA.taxOptions.map(o =>
      '<button class="btn small' + (S.taxRate === o.rate ? ' primary' : '') + '" data-tax="' + o.rate + '"' + (canAdjust ? '' : ' disabled') + '>' +
      o.name + ' ' + (o.rate * 100) + '%</button>').join(' ') +
    '<h4>其他政务</h4>' +
    '<button class="btn small" data-act="census">户口普查（30万两，民心+2）</button>';
}

function renderLi2(el) {
  let html = '<h4>科举取士</h4>' +
    '<p class="desc">每月一次（正月除外）。皇帝文学越高、书院等级越高，越易得英才。当前文学 ' + S.attrs.wenxue + '，书院 ' + S.buildings.shuyuan + ' 级。</p>' +
    '<button class="btn small" data-act="keju"' + (S.month === 1 ? ' disabled' : '') + '>开科取士</button>' +
    '<h4>祭祀天地</h4>' +
    '<p class="desc">正月举行（50万两），保佑一年少灾，民心+5、皇威+5。' + (S.flags.sacrificed ? '今年已祭。' : '') + '</p>' +
    '<button class="btn small" data-act="sacrifice"' + (S.month === 1 && !S.flags.sacrificed ? '' : ' disabled') + '>举行祭祀</button>' +
    '<h4>西域贸易</h4>';
  if (S.trade) html += '<p class="desc">' + esc(S.trade.name) + '率商队在外，约 ' + S.trade.left + ' 个月后归来。</p>';
  else {
    html += '<p class="desc">派一名智慧≥55的候补官员出使，一年后获利归来。</p>';
    const ok = S.idle.filter(t => t.zhihui >= 55);
    if (!ok.length) html += '<p class="desc">候补中没有智慧≥55者。</p>';
    else html += ok.map(t => '<button class="btn small" data-trade="' + t.id + '">派 ' + esc(t.name) + '（智慧' + t.zhihui + '）</button>').join(' ');
  }
  el.innerHTML = html;
}

function renderBing(el) {
  const power = Math.round(E.armyPower(S));
  let html = '<p class="desc">现有兵马 <b class="msg-gold">' + S.army.soldiers + '</b> 万 · 训练度 ' + S.army.training +
    ' · 铁匠铺 ' + S.buildings.tiejiang + ' 级 · 综合战力 <b class="msg-gold">' + power + '</b></p>' +
    '<button class="btn small" data-recruit="10">征兵10万（20万两）</button> ' +
    '<button class="btn small" data-recruit="50">征兵50万（100万两）</button> ' +
    '<button class="btn small" data-act="trainArmy">操练军队</button>' +
    '<h4>征伐天下</h4><table class="tb"><tr><th>国家</th><th>国力</th><th>国情</th><th></th></tr>';
  S.countries.forEach((c, i) => {
    const locked = i > 0 && !S.countries[i - 1].done;
    html += '<tr><td>' + c.name + '</td><td>' + c.power + '</td><td>' + c.desc + '</td><td>' +
      (c.done ? '<span class="msg-ok">已平定</span>' :
        locked ? '<span class="msg-bad">须先平定' + S.countries[i - 1].name + '</span>' :
        '<button class="btn small danger" data-campaign="' + i + '">出征</button>') + '</td></tr>';
  });
  html += '</table>';
  el.innerHTML = html;
}

function renderXing(el) {
  el.innerHTML = '<p class="desc">刑部暗访百官，敲打野心过高者（10万两/次）。</p>' +
    '<button class="btn small" data-act="investigate">监察百官</button>';
}

function renderGong(el) {
  let html = '';
  if (S.construction) {
    const b = DATA.buildings[S.construction.key];
    html += '<p class="desc msg-gold">在建工程：' + b.name + '，尚需 ' + S.construction.left + ' 个月。</p>';
  }
  html += '<table class="tb"><tr><th>建筑</th><th>等级</th><th>功效</th><th>造价</th><th></th></tr>';
  Object.keys(DATA.buildings).forEach(key => {
    const b = DATA.buildings[key];
    const lv = S.buildings[key];
    const cost = b.cost * (lv + 1);
    html += '<tr><td>' + b.name + '</td><td>' + lv + ' / ' + b.max + '</td><td>' + b.desc + '</td><td>' + (lv >= b.max ? '-' : cost + '万') + '</td><td>' +
      (lv >= b.max ? '<span class="msg-ok">已满级</span>' : '<button class="btn small" data-build="' + key + '"' + (S.construction ? ' disabled' : '') + '>营建</button>') + '</td></tr>';
  });
  html += '</table>';
  el.innerHTML = html;
}

/* ---------- 后宫 ---------- */
function renderHarem(p) {
  let html = '<h2>后宫</h2><p class="desc"><button class="btn small" data-act="closeHarem">← 返回舆图</button></p>';
  html += '<table class="tb"><tr><th>位份</th><th>姓名</th><th>魅力</th><th>宠爱</th><th></th></tr>';
  S.harem.forEach(c => {
    html += '<tr><td>' + c.title + '</td><td>' + esc(c.name) + '</td><td>' + c.meili + '</td><td>' + c.chongai + '</td><td>' +
      '<button class="btn small" data-visit="' + c.id + '">临幸</button> ' +
      '<button class="btn small" data-accompany="' + c.id + '">陪伴</button></td></tr>';
  });
  html += '</table>';
  if (S.pregnant.length) html += '<p class="desc msg-ok">有 ' + S.pregnant.length + ' 位妃嫔正怀着龙嗣。</p>';
  html += '<h4>选秀</h4><p class="desc">三年一举（逢3、6、9…年），80万两。才艺越高，越易得名妃。下次：第' + (Math.ceil((S.year + 1) / 3) * 3 || 3) + '年。</p>' +
    '<button class="btn small" data-act="selectShow">举办选秀</button>';
  html += '<h4>皇嗣（' + S.children.length + '）</h4>';
  if (!S.children.length) html += '<p class="desc">尚无皇嗣。</p>';
  else html += '<p class="desc">' + S.children.map(c => c.gender + esc(c.name) + (c.heir ? '（储君）' : '')).join('、') + '</p>';
  html += '<button class="btn small" data-act="makeHeir">立储君</button>';
  p.innerHTML = html;
}

/* ---------- 待抉择事件 ---------- */
function renderPending() {
  const pd = S.pending;
  if (pd.type === 'keju') {
    let body = '<table class="tb"><tr><th>姓名</th><th>忠诚</th><th>野心</th><th>清廉</th><th>智慧</th><th>武力</th><th></th></tr>';
    pd.list.forEach(c => {
      body += '<tr><td>' + esc(c.name) + '</td><td>' + c.zhongcheng + '</td><td>' + c.yexin + '</td><td>' + c.qinglian + '</td><td>' + c.zhihui + '</td><td>' + c.wuli + '</td>' +
        '<td><button class="btn small primary" data-keju="' + c.id + '">钦点</button></td></tr>';
    });
    body += '</table>';
    modal('科举放榜', body, [{ label: '全部落榜', fn: () => { closeModal(); run(() => E.kejuPick(S, null)); } }]);
  } else if (pd.type === 'disaster') {
    modal('灾情急报', '<p>多地遭灾，灾民嗷嗷待哺。赈灾需拨款 <b class="msg-gold">' + pd.cost + '</b> 万两（国库现有 ' + Math.round(S.treasury) + ' 万两）。</p>',
      [
        { label: '拨款赈灾', primary: true, fn: () => { closeModal(); run(() => E.disasterChoice(S, true)); } },
        { label: '置之不理', fn: () => { closeModal(); run(() => E.disasterChoice(S, false)); } }
      ]);
  } else if (pd.type === 'captive') {
    const girl = pd.girl;
    modal('献俘', '<p>敌军献上美女 <b class="msg-gold">' + esc(girl.name) + '</b>（魅力 ' + girl.meili + '），如何处置？</p>',
      [
        { label: '纳入后宫', primary: true, fn: () => { closeModal(); run(() => E.captiveChoice(S, true)); } },
        { label: '遣散还乡', fn: () => { closeModal(); run(() => E.captiveChoice(S, false)); } }
      ]);
  }
}

/* ---------- 结局 ---------- */
function renderEnding() {
  const o = S.over;
  $('#panel').innerHTML = '<div class="ending"><h2>驾 崩</h2>' +
    '<p>' + esc(o.reason) + '</p>' +
    '<div class="谥号">' + esc(o.title) + '</div>' +
    '<div class="score">一生功过评分：<b class="msg-gold">' + o.score + '</b></div>' +
    '<div class="detail"><p>' + esc(o.desc) + '</p>' +
    '<p>在位 ' + S.year + ' 年，享年 ' + S.age + ' 岁。平定 ' + E.conqueredCount(S) + ' 国，皇嗣 ' + S.children.length + ' 人，国库余银 ' + Math.round(S.treasury) + ' 万两。</p></div>' +
    '<button class="btn primary" data-act="restart">再世为君（新游戏）</button></div>';
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  $('#topbtns').addEventListener('click', e => {
    const cmd = e.target.dataset.cmd;
    if (!cmd) return;
    if (cmd === 'save') { E.save(S); toast('已存档。'); }
    else if (cmd === 'load') {
      const s = E.loadSave();
      if (s) { S = s; placeView = null; render(); toast('已读档。'); }
      else toast('没有找到存档。');
    }
    else if (cmd === 'restart') {
      modal('新游戏', '<p>确定要放弃当前进度，重新登基吗？</p>', [
        { label: '确定', primary: true, fn: () => { closeModal(); S = E.newGame(); placeView = null; E.save(S); render(); } },
        { label: '取消', fn: closeModal }
      ]);
    }
    else if (cmd === 'help') {
      modal('玩法说明', DATA.help.map(h => '<p>' + esc(h) + '</p>').join(''), [{ label: '朕知道了', primary: true, fn: closeModal }]);
    }
  });

  $('#panel').addEventListener('click', e => {
    const t = e.target;
    if (t.dataset.tab) { courtTab = t.dataset.tab; render(); return; }
    if (t.dataset.dismiss) run(() => E.dismiss(S, t.dataset.dismiss));
    else if (t.dataset.tax !== undefined) run(() => E.setTax(S, parseFloat(t.dataset.tax)));
    else if (t.dataset.trade) run(() => E.startTrade(S, parseInt(t.dataset.trade)));
    else if (t.dataset.recruit) run(() => E.recruitSoldiers(S, parseInt(t.dataset.recruit)));
    else if (t.dataset.campaign) run(() => E.campaign(S, parseInt(t.dataset.campaign)));
    else if (t.dataset.build) run(() => E.build(S, t.dataset.build));
    else if (t.dataset.visit) run(() => E.haremVisit(S, parseInt(t.dataset.visit)));
    else if (t.dataset.accompany) run(() => E.haremAccompany(S, parseInt(t.dataset.accompany)));
    else if (t.dataset.act) {
      const act = t.dataset.act;
      if (act === 'holdCourt') run(() => E.holdCourt(S));
      else if (act === 'skipCourt') run(() => E.skipCourt(S));
      else if (act === 'endCourt') run(() => E.endCourt(S));
      else if (act === 'sleep') run(() => E.sleep(S));
      else if (act === 'openHarem') { placeView = 'harem'; render(); }
      else if (act === 'closeHarem') { placeView = null; render(); }
      else if (act === 'restart') { S = E.newGame(); placeView = null; E.save(S); render(); }
      else if (E.actions[act]) run(() => E.actions[act](S));
      else if (act === 'keju') run(() => E.keju(S));
      else if (act === 'sacrifice') run(() => E.sacrifice(S));
      else if (act === 'census') run(() => E.census(S));
      else if (act === 'trainArmy') run(() => E.trainArmy(S));
      else if (act === 'investigate') run(() => E.investigate(S));
      else if (act === 'selectShow') run(() => E.selectShow(S));
      else if (act === 'makeHeir') run(() => E.makeHeir(S));
    }
  });

  $('#panel').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.appoint && t.value) run(() => E.appoint(S, t.value, parseInt(t.dataset.appoint)));
  });

  $('#modal').addEventListener('click', e => {
    const t = e.target;
    if (t.dataset.keju) { closeModal(); run(() => E.kejuPick(S, parseInt(t.dataset.keju))); }
  });
}

/* ---------- 启动 ---------- */
function init() {
  S = E.loadSave() || E.newGame();
  E.save(S);
  bindEvents();
  render();
}

document.addEventListener('DOMContentLoaded', init);
})();
