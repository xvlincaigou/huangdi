/* 皇帝成长计划 · 网页复刻版 —— UI 渲染层 */
import { DATA } from './data.js';
import { Engine as E } from './engine.js';
import { SCENES } from './scenes.js';
import { avatar } from './avatars.js';

let S = null;               // 当前游戏状态
let courtTab = 'li';        // 吏/户/礼/兵/刑/工
let placeView = null;       // null=舆图, 'harem'=后宫, 其他=地点 key

const $ = sel => document.querySelector(sel);

/* ---------- 场景图（名画素材，缺失时回退 SVG） ---------- */
const SCENE_IMGS = {
  banner: 'assets/scenes/banner.jpg',
  court: 'assets/scenes/court.jpg',
  harem: 'assets/scenes/harem.jpg',
  study: 'assets/scenes/study.jpg',
  martial: 'assets/scenes/martial.jpg',
  temple: 'assets/scenes/temple.jpg',
  hunt: 'assets/scenes/hunt.jpg',
  yipinlou: 'assets/scenes/yipinlou.jpg',
  lihuayuan: 'assets/scenes/lihuayuan.jpg',
  doctor: 'assets/scenes/doctor.jpg',
  alchemy: 'assets/scenes/alchemy.jpg',
  rest: 'assets/scenes/rest.jpg',
  sleep: 'assets/scenes/sleep.jpg',
  ending: 'assets/scenes/ending.jpg'
};
function sceneHTML(name, caption) {
  if (SCENE_IMGS[name]) {
    return '<div class="scene-frame"><img src="' + SCENE_IMGS[name] + '" alt="' + esc(caption || name) + '" loading="lazy" onerror="window.__sceneFallback(this,\'' + name + '\')"></div>';
  }
  if (SCENES[name]) {
    return '<div class="scene-frame">' + SCENES[name](S ? S.period : 1) + '</div>';
  }
  return '';
}
/* 图片加载失败时回退到手绘 SVG 场景 */
window.__sceneFallback = function (img, name) {
  const div = img.parentNode;
  if (SCENES[name]) div.innerHTML = SCENES[name](S ? S.period : 1);
  else img.remove();
};

/* ---------- 地点配置 ---------- */
const PLACES = {
  study:     { name: '藏书阁', desc: '汗牛充栋，书香四溢。',       act: 'study',     actLabel: '苦读诗书', effect: '文学↑ · 体力-8' },
  martial:   { name: '习武场', desc: '沙场点兵，刀枪林立。',       act: 'martial',   actLabel: '操练武艺', effect: '武艺↑ · 体力-12' },
  music:     { name: '琴音楼', desc: '丝竹之声，余音绕梁。',       act: 'music',     actLabel: '抚琴弄曲', effect: '才艺↑ · 体力-8' },
  temple:    { name: '佛寺',   desc: '古刹钟声，香烟缭绕。',       act: 'temple',    actLabel: '听经礼佛', effect: '道德↑ · 体力-5' },
  hunt:      { name: '围猎场', desc: '秋高马肥，正是围猎时节。',   act: 'hunt',      actLabel: '纵马围猎', effect: '体能↑ · 体力-15（秋季更佳）' },
  doctor:    { name: '太医院', desc: '药香扑鼻，太医恭候。',       act: 'doctor',    actLabel: '请脉调养', effect: '健康↑ · 每月一次' },
  yipinlou:  { name: '一品楼', desc: '京城第一楼，三教九流汇聚。', act: 'yipinlou',  actLabel: '寻访包打听', effect: '正月/七月现身 · 50万两' },
  lihuayuan: { name: '梨花苑', desc: '梨花院落，笙歌彻夜。',       act: 'lihuayuan', actLabel: '听曲饮酒', effect: '快乐↑ 体力↑ 健康↓ · 20万两' },
  alchemy:   { name: '炼丹房', desc: '丹炉青烟袅袅，炉火纯青。',   act: 'alchemy',   actLabel: '开炉炼丹', effect: '六成几率寿数+1 · 100万两' },
  rest:      { name: '养心殿', desc: '静谧安宁，适合小憩。',       act: 'rest',      actLabel: '小憩片刻', effect: '体力+25' },
  xuanzheng: { name: '宣政殿', desc: '已经退朝了。明日清晨，再来理政。' }
};

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
  if (document.body) document.body.className = 'period-' + S.period;
  renderClock();
  renderVitals();
  renderAttrs();
  renderLog();
  if (S.over) { renderEnding(); return; }
  renderPanel();
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
    p.innerHTML = sceneHTML('court', '宣政殿') +
      '<h2>宣政殿</h2>' +
      '<p class="desc">五更天，文武百官已列队殿外，等候早朝。</p>' +
      '<button class="btn primary" data-act="holdCourt">上朝理政</button> ' +
      '<button class="btn" data-act="skipCourt">今日罢朝</button>' +
      (E.canCourt(S) ? '' : '<p class="desc msg-bad" style="margin-top:8px">体力或健康不足，无法上朝（需体力≥40、健康≥50）。</p>');
    return;
  }
  if (S.inCourt) { renderCourt(p); return; }
  if (S.period === 3) {
    placeView = null;
    p.innerHTML = sceneHTML('sleep', '深夜') +
      '<h2>养心殿</h2>' +
      '<p class="desc">夜已深，宫中更鼓声声。安寝之后，便是新的一月。</p>' +
      '<button class="btn primary" data-act="sleep">回宫安寝（进入下一月）</button>';
    return;
  }
  if (placeView === 'harem') { renderHarem(p); return; }
  if (placeView && PLACES[placeView]) { renderPlace(p, PLACES[placeView]); return; }
  renderMap(p);
}

function renderMap(p) {
  p.innerHTML = '<h2>皇城舆图</h2>' +
    '<p class="desc">' + DATA.periods[S.period] + '时分，陛下想去何处？点击舆图中的建筑。</p>' +
    '<div class="scene-frame map-frame">' + SCENES.map(S.period) + '</div>';
}

function renderPlace(p, pl) {
  const sceneKey = placeView === 'xuanzheng' ? 'court' : placeView;
  let html = sceneHTML(sceneKey, pl.name);
  html += '<h2>' + pl.name + '</h2><p class="desc">' + pl.desc + '</p>';
  if (pl.act) {
    html += '<p class="desc msg-gold">' + pl.effect + '</p>' +
      '<button class="btn primary" data-act="' + pl.act + '">' + pl.actLabel + '</button> ';
  }
  html += '<button class="btn" data-act="closePlace">返回舆图</button>';
  p.innerHTML = html;
}

/* ---------- 上朝 ---------- */
function renderCourt(p) {
  const tabs = [['li', '吏部'], ['hu', '户部'], ['li2', '礼部'], ['bing', '兵部'], ['xing', '刑部'], ['gong', '工部']];
  let html = sceneHTML('court', '宣政殿') +
    '<h2>宣政殿 · 早朝</h2><div class="tabs">' +
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

function avCell(name, kind) {
  return '<td class="av">' + avatar(name, kind, 40) + '</td>';
}

function renderLi(el) {
  let html = '<p class="desc">百官考课：<span class="msg-bad">野心＞忠诚或野心＞65 者易生异心</span>，清廉低者侵蚀税收。</p>' +
    '<table class="tb"><tr><th></th><th>职位</th><th>姓名</th><th>忠诚</th><th>野心</th><th>清廉</th><th>智慧</th><th>武力</th><th></th></tr>';
  DATA.posts.forEach(post => {
    const o = S.officials[post];
    const kind = post === '中央将军' ? 'general' : 'official';
    html += '<tr>' + (o ? avCell(o.name, kind) : '<td class="av">-</td>') +
      '<td>' + post + '</td><td>' + (o ? esc(o.name) : '<span class="msg-bad">空缺</span>') + '</td>' +
      offCell(o, 'zhongcheng') + offCell(o, 'yexin') + offCell(o, 'qinglian') + offCell(o, 'zhihui') + offCell(o, 'wuli') +
      '<td>' + (o ? '<button class="btn small danger" data-dismiss="' + post + '">罢免</button>' : '') + '</td></tr>';
  });
  html += '</table>';
  html += '<h4>候补官员（' + S.idle.length + '/12）</h4>';
  if (!S.idle.length) html += '<p class="desc">暂无候补。可通过科举、一品楼荐才获得。</p>';
  else {
    html += '<table class="tb"><tr><th></th><th>姓名</th><th>忠诚</th><th>野心</th><th>清廉</th><th>智慧</th><th>武力</th><th>任命为</th></tr>';
    S.idle.forEach(t => {
      html += '<tr>' + avCell(t.name, 'official') +
        '<td>' + esc(t.name) + '</td><td>' + t.zhongcheng + '</td><td>' + t.yexin + '</td><td>' + t.qinglian + '</td><td>' + t.zhihui + '</td><td>' + t.wuli + '</td>' +
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
  let html = '<div class="scene-frame">' + SCENES.warmap(S.countries) + '</div>' +
    '<p class="desc">现有兵马 <b class="msg-gold">' + S.army.soldiers + '</b> 万 · 训练度 ' + S.army.training +
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
  let html = sceneHTML('harem', '后宫');
  html += '<h2>后宫</h2><p class="desc"><button class="btn small" data-act="closePlace">← 返回舆图</button></p>';
  html += '<table class="tb"><tr><th></th><th>位份</th><th>姓名</th><th>魅力</th><th>宠爱</th><th></th></tr>';
  S.harem.forEach(c => {
    html += '<tr>' + avCell(c.name, 'woman') +
      '<td>' + c.title + '</td><td>' + esc(c.name) + '</td><td>' + c.meili + '</td><td>' + c.chongai + '</td><td>' +
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
    let body = '<table class="tb"><tr><th></th><th>姓名</th><th>忠诚</th><th>野心</th><th>清廉</th><th>智慧</th><th>武力</th><th></th></tr>';
    pd.list.forEach(c => {
      body += '<tr>' + avCell(c.name, 'official') +
        '<td>' + esc(c.name) + '</td><td>' + c.zhongcheng + '</td><td>' + c.yexin + '</td><td>' + c.qinglian + '</td><td>' + c.zhihui + '</td><td>' + c.wuli + '</td>' +
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
    modal('献俘', '<div style="text-align:center">' + avatar(girl.name, 'woman', 72) + '</div>' +
      '<p>敌军献上美女 <b class="msg-gold">' + esc(girl.name) + '</b>（魅力 ' + girl.meili + '），如何处置？</p>',
      [
        { label: '纳入后宫', primary: true, fn: () => { closeModal(); run(() => E.captiveChoice(S, true)); } },
        { label: '遣散还乡', fn: () => { closeModal(); run(() => E.captiveChoice(S, false)); } }
      ]);
  }
}

/* ---------- 结局 ---------- */
function renderEnding() {
  const o = S.over;
  $('#panel').innerHTML = sceneHTML('ending', '陵寝') +
    '<div class="ending"><h2>驾 崩</h2>' +
    '<p>' + esc(o.reason) + '</p>' +
    '<div class="谥号">' + esc(o.title) + '</div>' +
    '<div class="score">一生功过评分：<b class="msg-gold">' + o.score + '</b></div>' +
    '<div class="detail"><p>' + esc(o.desc) + '</p>' +
    '<p>在位 ' + S.year + ' 年，享年 ' + S.age + ' 岁。平定 ' + E.conqueredCount(S) + ' 国，皇嗣 ' + S.children.length + ' 人，国库余银 ' + Math.round(S.treasury) + ' 万两。</p></div>' +
    '<button class="btn primary" data-act="restart">再世为君（新游戏）</button></div>';
}

/* ---------- 事件绑定 ---------- */
const CLICK_SEL = '[data-act],[data-goto],[data-tab],[data-dismiss],[data-tax],[data-trade],[data-recruit],[data-campaign],[data-build],[data-visit],[data-accompany],[data-keju]';
function pickTarget(e) {
  const t = e.target;
  if (t && typeof t.closest === 'function') {
    const c = t.closest(CLICK_SEL);
    if (c) return c;
  }
  return t;
}

function bindEvents() {
  $('#topbtns').addEventListener('click', e => {
    const cmd = e.target.dataset ? e.target.dataset.cmd : undefined;
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
    const t = pickTarget(e);
    const d = t.dataset || {};
    if (d.tab) { courtTab = d.tab; render(); return; }
    if (d.goto) { placeView = d.goto; render(); return; }
    if (d.dismiss) run(() => E.dismiss(S, d.dismiss));
    else if (d.tax !== undefined) run(() => E.setTax(S, parseFloat(d.tax)));
    else if (d.trade) run(() => E.startTrade(S, parseInt(d.trade)));
    else if (d.recruit) run(() => E.recruitSoldiers(S, parseInt(d.recruit)));
    else if (d.campaign) run(() => E.campaign(S, parseInt(d.campaign)));
    else if (d.build) run(() => E.build(S, d.build));
    else if (d.visit) run(() => E.haremVisit(S, parseInt(d.visit)));
    else if (d.accompany) run(() => E.haremAccompany(S, parseInt(d.accompany)));
    else if (d.act) {
      const act = d.act;
      if (act === 'holdCourt') run(() => E.holdCourt(S));
      else if (act === 'skipCourt') run(() => E.skipCourt(S));
      else if (act === 'endCourt') run(() => E.endCourt(S));
      else if (act === 'sleep') run(() => E.sleep(S));
      else if (act === 'closePlace') { placeView = null; render(); }
      else if (act === 'restart') { S = E.newGame(); placeView = null; E.save(S); render(); }
      else if (E.actions[act]) { placeView = null; run(() => E.actions[act](S)); }
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
    if (t.dataset && t.dataset.appoint && t.value) run(() => E.appoint(S, t.value, parseInt(t.dataset.appoint)));
  });

  $('#modal').addEventListener('click', e => {
    const t = pickTarget(e);
    if (t.dataset && t.dataset.keju) { closeModal(); run(() => E.kejuPick(S, parseInt(t.dataset.keju))); }
  });
}

/* ---------- 启动 ---------- */
function init() {
  S = E.loadSave() || E.newGame();
  E.save(S);
  // 页头横幅
  const bn = $('#bannerScene');
  if (bn) bn.innerHTML = SCENE_IMGS.banner
    ? '<img src="' + SCENE_IMGS.banner + '" alt="千里江山" onerror="window.__sceneFallback(this,\'banner\')">'
    : SCENES.banner();
  bindEvents();
  render();
}

document.addEventListener('DOMContentLoaded', init);
