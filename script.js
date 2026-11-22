(() => {
const C = CONFIG, G = C.goal;
const $ = s => document.querySelector(s);
const val = n => (document.querySelector(`input[name=${n}]:checked`) || {}).value;
const rnd = (a, b) => a + Math.random() * (b - a);
const shuffle = a => [...a].sort(() => Math.random() - .5);
const MN = 24, ON = 18;               // 화면에 그릴 입자 최대 개수
const t1 = $('#tank1'), t2 = $('#tank2');
let S, rs, M = [], N = [], O = [];    // S=게임 변수, rs=실험1 진행 상태

// ---- 게임 변수 ----
function newGame() {
  S = { metal: C.start.metal, organic: C.start.organic, resource: C.start.resource,
        recovered: false, stage: 1, trial: 0, result: null, history: [], chosen: null, s2: null };
  rs = 'idle';
  document.querySelectorAll('input[type=radio]').forEach(i => i.checked = false);
  go(1); talk('start');
}
function go(n) {
  S.stage = n;
  document.querySelectorAll('.screen').forEach((e, i) => e.classList.toggle('active', i + 1 === n));
  $('#hMetal').textContent = S.metal; $('#hOrg').textContent = S.organic; $('#hRes').textContent = S.resource;
  document.querySelectorAll('#steps li').forEach((e, i) => {
    e.classList.toggle('active', i + 1 === n); e.classList.toggle('done', i + 1 < n);
  });
  if (n === 2) { initTank1(); ui1(); say('say2'); $('#res1').textContent = ''; $('#note1').textContent = ''; talk('exp1'); }
  if (n === 3) { initStage3(); renderLog3(); talk('exp2'); }
  if (n === 4) closeTalk();
  scrollTo(0, 0);
}

// ---- 공통 도구 ----
function mkOpts(id, obj, name, fmt) {
  $(id).innerHTML = Object.entries(obj).map(([k, v]) =>
    `<label><input type="radio" name="${name}" value="${k}"><span><b>${v.label}</b><small>${fmt(v)}</small></span></label>`).join('');
}
function P(tank, cls, x, y) {
  const e = document.createElement('i'); e.className = 'p ' + cls;
  e.style.left = x + '%'; e.style.top = y + '%'; tank.appendChild(e); return e;
}
const mv = (e, x, y) => { e.style.left = x + '%'; e.style.top = y + '%'; };
const clearP = t => t.querySelectorAll('.p').forEach(e => e.remove());
function say(id, who, text) {
  const b = $('#' + id);
  if (!who) { b.classList.remove('show'); return; }
  const c = C.characters[who];
  b.innerHTML = `<div class="face"><img alt="${c.name}" src="${c.img}"></div><div><strong>${c.name}</strong><br>“${text}”</div>`;
  const img = b.querySelector('img'); img.onerror = () => { img.parentNode.textContent = c.name[0]; };
  b.classList.add('show');
}

// ---- 안내 대사: 화면 아래 띠로 표시, 클릭하면 다음/닫기 (게임 조작은 막지 않음) ----
let q = [], muted = false;
function talk(key) { if (muted) return; q = (C.talk[key] || []).slice(); nextTalk(); }
function nextTalk() {
  const bar = $('#talk'), l = q.shift();
  if (!l) { bar.hidden = true; document.body.classList.remove('talking'); return; }
  const c = C.characters[l.who], f = bar.querySelector('.face');
  bar.querySelector('.tx').innerHTML = `<strong>${c.name}</strong><br>${l.text}`;
  f.innerHTML = `<img alt="${c.name}" src="${c.img}">`;
  const img = f.firstChild; img.onerror = () => { f.textContent = c.name[0]; };
  $('#talkNext').textContent = q.length ? '다음' : '닫기';
  bar.hidden = false; document.body.classList.add('talking');
}
const closeTalk = () => { q = []; nextTalk(); };

// ---- 연구 기록 ----
const MODEL = '※ 실제 과학적 측정값이 아니라 교육용 모델의 결과입니다.';
const lab = (d, m) => `${C.dose[d].label}·${C.mix[m].label}`;
const okTag = ok => `<span class="${ok ? 'ok' : 'no'}">${ok ? '✔ 달성' : '✘ 미달'}</span>`;
const diff = n => n > 0 ? '+' + n : n < 0 ? '−' + (-n) : '0';
function bestCombo() {                                   // 목표를 달성하는 조합 중 비용이 가장 낮은 것
  let b = null;
  for (const d in C.dose) for (const m in C.mix)
    if (metal1(d, m) <= G.metal && (!b || cost1(d, m) < b.c)) b = { d, m, c: cost1(d, m) };
  return b;
}
function diag1(r) {
  const b = bestCombo();
  if (r.metal <= G.metal)
    return b && b.c < r.cost ? `목표 달성. 소모 ${b.c}로 달성하는 조합(${lab(b.d, b.m)})도 있어요.` : '목표 달성. 달성 조합 중 소모가 가장 적어요.';
  const why = [];
  if (r.dose === 'low') why.push('투입량이 적어 포집할 입자가 부족했어요');
  if (r.mix === 'short') why.push('혼합 시간이 짧아 결합이 부족했어요');
  if (!why.length) why.push('제거량이 아직 부족했어요');
  return `${why.join(', ')}. 개선 예: ${lab(b.d, b.m)} (소모 ${b.c})`;
}
const bestUV = () => Object.keys(C.uv).filter(k => C.uv[k].organic <= G.organic).sort((x, y) => C.uv[x].cost - C.uv[y].cost)[0];
function diag2(b) {
  const k = bestUV();
  if (b.organic <= G.organic)
    return k && C.uv[k].cost < b.cost ? `목표 달성. '${C.uv[k].label}' 조사(소모 ${C.uv[k].cost})로도 달성해요.` : '목표 달성. 달성 조건 중 소모가 가장 적어요.';
  return `조사 시간이 짧아 분해가 부족했어요. '${C.uv[k].label}' 이상(소모 ${C.uv[k].cost})이 필요하니 앞 실험에서 자원을 아껴야 해요.`;
}
const head = '<tr><th>실험</th><th>조건</th><th>오염도 (전→후)</th><th>자원 소모</th><th>목표</th><th>원인·개선 방향</th></tr>';
function recTable() {
  const a = S.chosen, b = S.s2;
  return `<table class="final">${head}` +
    (a ? `<tr><td>중금속 제거</td><td>${lab(a.dose, a.mix)}</td><td>${C.start.metal}→${a.metal}</td><td>${a.cost}</td><td>${okTag(a.metal <= G.metal)}</td><td class="diag">${diag1(a)}</td></tr>` : '') +
    (b ? `<tr><td>광촉매</td><td>조사 ${C.uv[b.uv].label}</td><td>${C.start.organic}→${b.organic}</td><td>${b.cost}</td><td>${okTag(b.organic <= G.organic)}</td><td class="diag">${diag2(b)}</td></tr>` : '') + '</table>';
}
function renderLog2() {                                  // 모의 실험 비교표
  const h = S.history;
  let html = '<h3>연구 기록 · 모의 실험 비교</h3>';
  if (!h.length) html += '<p class="small">모의 실험을 하면 조건별 결과가 여기에 기록돼요.</p>';
  else {
    html += '<table class="final"><tr><th>회차</th><th>조건 (투입·혼합)</th><th>중금속 (전→후)</th><th>자원 소모</th><th>목표</th><th>원인·개선 방향</th></tr>' +
      h.map((r, i) => `<tr><td>${i + 1}회</td><td>${lab(r.dose, r.mix)}</td><td>${C.start.metal}→${r.metal}</td><td>${r.cost}</td><td>${okTag(r.metal <= G.metal)}</td><td class="diag">${diag1(r)}</td></tr>`).join('') + '</table>';
    if (h.length === 2) html += `<p class="cmp">비교: 2회는 1회보다 중금속 오염도 ${diff(h[1].metal - h[0].metal)}, 자원 소모 ${diff(h[1].cost - h[0].cost)}</p>`;
  }
  $('#log2').innerHTML = html + `<p class="small">${MODEL}</p>`;
}
function renderLog3() {
  $('#log3').innerHTML = `<h3>연구 기록</h3>${recTable()}<p class="small">${MODEL}</p>`;
}
function renderReport() {
  const used = C.start.resource - S.resource, red = (C.start.metal - S.metal) + (C.start.organic - S.organic);
  $('#report').innerHTML = `<h3>연구 기록</h3>${recTable()}
    <div class="two"><div><h3>자원 효율</h3><p>소모한 자원 ${used} / ${C.start.resource} (남은 자원 ${S.resource})<br>오염도 총 ${red}점 감소 → 자원 1당 약 ${used ? (red / used).toFixed(2) : '-'}점<br><span class="small">이 모델에서는 값이 높을수록 효율적입니다.</span></p></div>
    <div><h3>실제 식수 공급 전에 더 필요한 검증</h3><ul><li><b>미생물 검사</b>: 병원성 미생물이 없는지 확인</li><li><b>잔류 나노입자 확인</b>: 회수 후 물에 남은 입자 측정</li><li><b>유해 부산물 검증</b>: 분해 중 생긴 물질의 안전성 확인</li></ul></div></div>
    <p class="small">${MODEL}</p>`;
}

// ---- 원리 보기 ----
function openPrinciple(n) {
  $('#pr1').hidden = n !== 1; $('#pr2').hidden = n !== 2;
  $('#dlgTitle').textContent = n === 1 ? '원리 보기: 자성 나노입자 중금속 제거' : '원리 보기: TiO₂ 광촉매 처리';
  $('#dlg').showModal();
}

// ---- 실험 1: 중금속 제거 ----
const metal1 = (d, m) => Math.max(0, C.start.metal - C.dose[d].remove - C.mix[m].bonus);
const cost1 = (d, m) => C.dose[d].cost + C.mix[m].cost + C.recoverCost;

function initTank1() {
  clearP(t1); M = []; N = [];
  for (let i = 0; i < MN; i++) M.push(P(t1, 'metal', rnd(4, 80), rnd(8, 88)));
  t1.style.setProperty('--m', (C.start.metal / 80 * .6).toFixed(2));
  $('#magnet').classList.remove('on');
}
function ui1() {
  const d = val('dose'), m = val('mix'), sel = d && m;
  $('#cost1').textContent = sel ? cost1(d, m) : '-';
  $('#btnMix').disabled = !(sel && rs === 'idle');
  $('#btnMag').disabled = rs !== 'mixed';
  $('#btnRetry').disabled = !(rs === 'done' && S.trial < 2);
  document.querySelectorAll('#s2 .opt input').forEach(i => i.disabled = rs !== 'idle');
  $('#trialInfo').textContent = `모의 실험 기록 (${S.trial}/2)`;
  const canPick = rs === 'idle' || rs === 'done';
  renderLog2();
  $('#hist').innerHTML = S.history.map((r, i) =>
    `<tr><td>${i + 1}회</td><td>${C.dose[r.dose].label}·${C.mix[r.mix].label}</td><td>중금속 ${r.metal}</td><td>비용 ${r.cost}</td>
     <td><button class="btn" data-i="${i}" ${canPick ? '' : 'disabled'}>확정</button></td></tr>`).join('');
}
function startMix() {
  const d = val('dose'), m = val('mix'); rs = 'mixing'; ui1(); $('#note1').textContent = '';
  N = [];
  for (let i = 0; i < C.dose[d].nanoCount; i++) {
    const e = P(t1, 'nano', rnd(5, 80), -8); N.push(e);
    setTimeout(() => mv(e, rnd(5, 80), rnd(10, 85)), i * 60);
  }
  const tick = setInterval(() => [...N, ...M.filter(e => !e.dataset.b)].forEach(e => mv(e, rnd(4, 80), rnd(8, 88))), 900);
  setTimeout(() => {
    clearInterval(tick);
    const bound = M.length - Math.round(M.length * metal1(d, m) / C.start.metal);
    shuffle(M).slice(0, bound).forEach((e, i) => {
      e.dataset.b = 1; e.classList.add('bound');
      const n = N[i % N.length]; mv(e, parseFloat(n.style.left) + rnd(-3, 3), parseFloat(n.style.top) + rnd(-4, 4));
    });
    rs = 'mixed'; $('#note1').textContent = C.recoverNote; ui1(); talk('mixed');
  }, C.mix[m].ms);
}
function doMagnet() {
  rs = 'magnet'; ui1(); $('#magnet').classList.add('on');
  [...N, ...M.filter(e => e.dataset.b)].forEach(e => mv(e, rnd(88, 95), rnd(8, 88)));
  setTimeout(() => {
    const d = val('dose'), m = val('mix'), r = { dose: d, mix: m, metal: metal1(d, m), cost: cost1(d, m) };
    S.trial++; S.history.push(r); rs = 'done'; $('#note1').textContent = '';
    t1.style.setProperty('--m', (r.metal / 80 * .6).toFixed(2));
    $('#res1').textContent = `중금속 오염도 ${r.metal} / 실험 비용 ${r.cost}`;
    if (r.metal > G.metal) say('say2', 'riwa', C.lines.riwa);
    ui1();
  }, 1800);
}
function retry() {
  rs = 'idle'; initTank1(); $('#res1').textContent = ''; say('say2'); ui1();
}
function confirmDesign(i) {
  const r = S.history[i];
  S.resource -= r.cost; S.metal = r.metal; S.recovered = true; S.chosen = r;   // 자원은 확정할 때 한 번만 차감
  go(3);
}

// ---- 실험 2: 광촉매 ----
function initStage3() {
  clearP(t2); O = [];
  const mc = Math.round(MN * S.metal / C.start.metal), oc = Math.round(ON * S.organic / C.start.organic);
  for (let i = 0; i < mc; i++) P(t2, 'metal', rnd(4, 92), rnd(8, 88));
  for (let i = 0; i < oc; i++) O.push(P(t2, 'org', rnd(4, 92), rnd(8, 88)));
  t2.style.setProperty('--m', (S.metal / 80 * .6).toFixed(2));
  t2.style.setProperty('--o', (S.organic / 60 * .5).toFixed(2));
  mkOpts('#uvOpt', C.uv, 'uv', v => `오염도 ${v.organic} · 비용 ${v.cost}`);
  document.querySelectorAll('#uvOpt input').forEach(i => { if (C.uv[i.value].cost > S.resource) { i.disabled = true; i.nextSibling.querySelector('small').textContent = '자원 부족'; } });
  $('#res3Left').textContent = S.resource; $('#res3').textContent = ''; say('say3');
  $('#btnUV').disabled = true; $('#btnFinal').disabled = true;
}
function startUV() {
  const key = val('uv'), u = C.uv[key]; $('#btnUV').disabled = true;
  document.querySelectorAll('#uvOpt input').forEach(i => i.disabled = true);
  $('#lamp').classList.add('on'); $('#beam').classList.add('on');
  const tick = setInterval(() => O.forEach(e => mv(e, rnd(4, 92), rnd(8, 88))), 900);
  const remove = O.length - Math.round(ON * u.organic / C.start.organic);
  shuffle(O).slice(0, remove).forEach((e, i) => setTimeout(() => e.classList.add('gone'), 500 + i * (2600 / Math.max(remove, 1))));
  setTimeout(() => {
    clearInterval(tick); $('#lamp').classList.remove('on'); $('#beam').classList.remove('on');
    S.organic = u.organic; S.resource -= u.cost;          // 유기오염도만 변하고 중금속은 그대로
    t2.style.setProperty('--o', (S.organic / 60 * .5).toFixed(2));
    $('#hOrg').textContent = S.organic; $('#hRes').textContent = S.resource; $('#res3Left').textContent = S.resource;
    $('#res3').textContent = `유기오염도 ${S.organic} / 남은 자원 ${S.resource}`;
    if (S.organic > G.organic) say('say3', 'serin', C.lines.serin);
    S.s2 = { uv: key, organic: S.organic, cost: u.cost }; renderLog3(); talk('beforeFinal');
    $('#btnFinal').disabled = false;
  }, 3400);
}

// ---- 최종 평가 ----
function judge() {
  if (S.metal > G.metal || S.organic > G.organic || !S.recovered) return 'fail';
  return S.resource >= G.successResource ? 'success' : 'partial';
}
function finalScreen() {
  const k = judge(); S.result = k; go(4);
  const row = (n, v, ok) => `<tr><td>${n}</td><td>${v}</td><td class="${ok ? 'ok' : 'no'}">${ok ? '✔ 달성' : '✘ 미달'}</td></tr>`;
  $('#fTable').innerHTML =
    row('중금속 오염도 (목표 ≤ ' + G.metal + ')', S.metal, S.metal <= G.metal) +
    row('유기오염도 (목표 ≤ ' + G.organic + ')', S.organic, S.organic <= G.organic) +
    row('나노입자 회수', S.recovered ? '회수 완료' : '미회수', S.recovered) +
    `<tr><td>남은 연구 자원 (운영 기준 ≥ ${G.successResource})</td><td>${S.resource}</td><td class="${S.resource >= G.successResource ? 'ok' : 'no'}">${S.resource >= G.successResource ? '✔ 충분' : '✘ 부족'}</td></tr>`;
  $('#judge').textContent = C.results[k].title; $('#judge').className = k;
  $('#verdict').textContent = C.results[k].text;
  renderReport();
  if (k === 'fail') say('say4', 'mayra', C.lines.mayra);
  else if (C.lines[k]) say('say4', C.lines[k].who, C.lines[k].text);
  else say('say4');
}

// ---- 시작 ----
$('#gM').textContent = G.metal; $('#gO').textContent = G.organic;
$('#iM').textContent = C.start.metal; $('#iO').textContent = C.start.organic; $('#iR').textContent = C.start.resource;
mkOpts('#doseOpt', C.dose, 'dose', v => `제거 ${v.remove} · 비용 ${v.cost}`);
mkOpts('#mixOpt', C.mix, 'mix', v => `보정 ${v.bonus > 0 ? '+' : ''}${v.bonus} · 비용 ${v.cost}`);
$('#btnStart').onclick = () => go(2);
$('#btnMix').onclick = startMix; $('#btnMag').onclick = doMagnet; $('#btnRetry').onclick = retry;
$('#hist').onclick = e => { const b = e.target.closest('button'); if (b && !b.disabled) confirmDesign(+b.dataset.i); };
$('#s2').addEventListener('change', ui1);
$('#uvOpt').addEventListener('change', () => $('#btnUV').disabled = false);
$('#talk').onclick = e => { if (!e.target.closest('button') || e.target.id === 'talkNext') nextTalk(); };
$('#btnTalkToggle').onclick = () => { muted = !muted; $('#btnTalkToggle').textContent = '대사: ' + (muted ? '꺼짐' : '켜짐'); if (muted) closeTalk(); };
$('#btnP1').onclick = () => openPrinciple(1); $('#btnP2').onclick = () => openPrinciple(2);
$('#dlgClose').onclick = () => $('#dlg').close();
$('#dlg').addEventListener('click', e => { if (e.target === $('#dlg')) $('#dlg').close(); });
$('#btnUV').onclick = startUV; $('#btnFinal').onclick = finalScreen; $('#btnAgain').onclick = newGame;
newGame();
})();
