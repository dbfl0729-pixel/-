const STORAGE_KEY = 'derm_inventory_operational_v7';
const money = (n) => new Intl.NumberFormat('ko-KR').format(Math.round(Number(n || 0)));
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthISO = (d = new Date()) => d.toISOString().slice(0, 7);
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const DAILY_NAMES = [
  '(하라셀) 시트팩',
  '(더마소드) 겔시트팩',
  '(더마소드) 리바이브팩',
  '(하라셀) 모델링팩',
  '(피부미소) 해면',
];

const WEEKLY_NAMES = [
  '글러브',
  '(더마소드) 클렌징 젤',
  '(쎄라덤) 토너',
  '아토베리어 크림',
  '셀퓨전씨 로션',
  '셀퓨전씨 크림',
  '(더마소드) 재생크림',
  '선크림',
  '(히스토랩) 알로에 젤',
  '진정 젤',
  '초음파 겔',
  '(피부미소) 절단솜 4x6',
  '(피부미소) 거즈 30x35',
  'GA20',
  'GA30',
  '중화제',
];

const MONTHLY_NAMES = [
  '(피부미소) 팩붓',
  '(피부미소) 스파출라',
  '(피부미소) 코메도 압출기 고리형',
  '(피부미소) 유리볼',
  '카프리가스',
  '니들 26G (100개)',
  '면봉',
  '(하라셀) 클렌징 밀크',
  '(히스토랩) 비타민 앰플 P',
  '(히스토랩) 비타민 앰플 V',
  '2B Aladdin Peeling Powder',
  '2B Bio Peeling Preparation Pro',
  '2B Bio Aladdin Peel',
];

const COUPANG_NAMES = [
  '세제', '섬유유연제', '퐁퐁', '아이깨끗해', '세탁청소가루', '칫솔', '매직스펀지',
  '수세미', '세탁망', '고무줄', '파우더룸티슈', '웨건티슈',
];

const PER_PATIENT_TARGETS = new Set([
  '(하라셀) 시트팩',
  '(더마소드) 겔시트팩',
  '(더마소드) 리바이브팩',
]);

const UNIT_OPTIONS = ['개', '장', '박스', '병', '통', 'kg', 'g', 'ml', 'L', '세트'];
const CYCLE_OPTIONS = ['일일', '주간', '월간', '입고전용', '쿠팡', '선결제', '기타'];


const KEEP_CONFIG = {
  sheetmask: {
    name: '겔시트팩(선결제)',
    unit: '장',
    defaultShipQty: 10,
    tiers: [
      { tier: '300장', total_qty: 300, unit_cost: 1300 },
      { tier: '500장', total_qty: 500, unit_cost: 1000 },
    ],
    mapToItemName: '(더마소드) 겔시트팩',
  },
  modeling: {
    name: '모델링팩(선결제)',
    unit: 'kg',
    defaultShipQty: 1,
    tiers: [{ tier: '100kg', total_qty: 100, unit_cost: 10000 }],
    mapToItemName: '(하라셀) 모델링팩',
  },
};


const ORDER_MAP = (() => {
  const map = {};
  [...DAILY_NAMES, ...WEEKLY_NAMES, ...MONTHLY_NAMES, ...COUPANG_NAMES].forEach((name, idx) => {
    map[name] = idx + 1;
  });
  return map;
})();

function sortItemsStable(items) {
  return items.slice().sort((a, b) => {
    const ao = ORDER_MAP[a.name] ?? 999999;
    const bo = ORDER_MAP[b.name] ?? 999999;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, 'ko');
  });
}

const TAB_DEFS = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'daily', label: '일일 재고' },
  { key: 'weekly', label: '주간 점검' },
  { key: 'monthlycheck', label: '월간 점검' },
  { key: 'inbound', label: '입고' },
  { key: 'coupang', label: '쿠팡' },
  { key: 'prepaid', label: '선결제(킵)' },
  { key: 'report', label: '월간 보고' },
  { key: 'items', label: '품목' },
];

function makeItem(id, name, cycle, unit, extra = {}) {
  return {
    id,
    name,
    cycle,
    base_unit: unit,
    hidden: false,
    active: true,
    base_cost: 0,
    note: '',
    ...extra,
  };
}

function buildSeedItems() {
  let id = 1;
  const items = [];
  DAILY_NAMES.forEach((name) => items.push(makeItem(id++, name, '일일', name.includes('모델링팩') ? 'kg' : (name.includes('해면') ? '개' : '장'))));
  WEEKLY_NAMES.forEach((name) => items.push(makeItem(id++, name, '주간', name.includes('글러브') ? '박스' : '개')));
  MONTHLY_NAMES.forEach((name) => items.push(makeItem(id++, name, '월간', name.includes('카프리가스') ? '개' : '개')));
  COUPANG_NAMES.forEach((name) => items.push(makeItem(id++, name, '쿠팡', '개')));
  return items;
}

function seed() {
  const now = new Date().toISOString();
  return {
    version: 7,
    created_at: now,
    updated_at: now,
    items: buildSeedItems(),
    inbound: [], // {id,date,item_id,qty,unit_cost,memo}
    patients: {}, // {date:number}
    dailyRecords: {}, // {date:{item_id:{qty,memo}}}
    weeklyRecords: {},
    monthlyRecords: {},
    coupangRecords: {}, // {date:{item_id:{checked,memo}}}
    keep: {
      sheetmask: { tier: '300장', shipped_total: 0, hospital_stock: 0 },
      modeling: { tier: '100kg', shipped_total: 0, hospital_stock: 0 },
    },
  };
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let db = migrate(load() || seed());
save();

function save() {
  db.updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function migrate(data) {
  if (!data || !data.items) return seed();
  const next = { ...seed(), ...data };
  next.version = 7;
  next.items = Array.isArray(data.items) ? data.items.map((it, idx) => ({
    id: it.id || idx + 1,
    name: it.name || `품목${idx + 1}`,
    cycle: it.cycle || inferCycle(it),
    base_unit: it.base_unit || it.unit || '개',
    hidden: !!it.hidden,
    active: it.active !== false,
    base_cost: toNum(it.base_cost),
    note: it.note || '',
  })) : buildSeedItems();
  next.inbound = Array.isArray(data.inbound) ? data.inbound : [];
  next.patients = data.patients || {};
  next.dailyRecords = data.dailyRecords || convertOldDaily(data.dailyA || {});
  next.weeklyRecords = data.weeklyRecords || {};
  next.monthlyRecords = data.monthlyRecords || {};
  next.coupangRecords = data.coupangRecords || {};
  next.keep = {
    sheetmask: { tier: '300장', shipped_total: 0, hospital_stock: 0, ...(data.keep?.sheetmask || {}) },
    modeling: { tier: '100kg', shipped_total: 0, hospital_stock: 0, ...(data.keep?.modeling || {}) },
  };
  ensureSeedItems(next);
  return next;
}

function inferCycle(it) {
  if (it.grade === 'A' || it.category === '일 관리') return '일일';
  if (it.category && String(it.category).includes('월')) return '월간';
  if (it.category && String(it.category).includes('쿠팡')) return '쿠팡';
  return '주간';
}

function convertOldDaily(oldDaily) {
  const out = {};
  for (const [date, rows] of Object.entries(oldDaily)) {
    out[date] = {};
    for (const [itemId, v] of Object.entries(rows || {})) {
      out[date][itemId] = {
        qty: v.close_qty ?? '',
        use_qty: v.manual_use ?? '',
        memo: v.memo || '',
      };
    }
  }
  return out;
}

function ensureSeedItems(targetDb) {
  const existing = new Set(targetDb.items.map((x) => x.name));
  let maxId = targetDb.items.reduce((m, x) => Math.max(m, toNum(x.id)), 0);
  buildSeedItems().forEach((it) => {
    if (!existing.has(it.name)) targetDb.items.push({ ...it, id: ++maxId });
  });
}

const $ = (q) => document.querySelector(q);
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

let activeTab = 'dashboard';

function getItemById(id) {
  return db.items.find((x) => String(x.id) === String(id));
}

function getVisibleItemsByCycle(cycle) {
  return sortItemsStable(db.items.filter((x) => x.active && !x.hidden && x.cycle === cycle));
}

function getAllItemsByCycle(cycle) {
  return sortItemsStable(db.items.filter((x) => x.cycle === cycle));
}

function datesOf(recordMap) {
  return Object.keys(recordMap || {}).sort().reverse();
}

function latestQty(recordMap, itemId, date) {
  const dates = Object.keys(recordMap || {}).filter((d) => d <= date).sort();
  for (let i = dates.length - 1; i >= 0; i -= 1) {
    const val = recordMap[dates[i]]?.[String(itemId)]?.qty;
    if (val !== '' && val !== undefined && val !== null) return toNum(val);
  }
  return 0;
}

function prevDateISO(date) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function sumInbound(itemId, date) {
  return db.inbound.filter((r) => r.item_id === itemId && r.date === date).reduce((a, r) => a + toNum(r.qty), 0);
}

function latestUnitCost(itemId) {
  const rows = db.inbound.filter((r) => r.item_id === itemId && toNum(r.unit_cost) > 0).sort((a, b) => `${a.date}-${a.id}`.localeCompare(`${b.date}-${b.id}`));
  return rows.length ? toNum(rows[rows.length - 1].unit_cost) : 0;
}

function renderTabs() {
  const host = $('#tabs');
  host.innerHTML = '';
  TAB_DEFS.forEach((t) => {
    const b = el('button', { class: `tab${activeTab === t.key ? ' active' : ''}`, type: 'button', onclick: () => { activeTab = t.key; render(); } });
    b.textContent = t.label;
    host.appendChild(b);
  });
}

function render() {
  renderTabs();
  const app = $('#app');
  app.innerHTML = '';
  const map = {
    dashboard: renderDashboard,
    daily: renderDaily,
    weekly: () => renderCheckTab('주간 점검', '주간', db.weeklyRecords),
    monthlycheck: () => renderCheckTab('월간 점검', '월간', db.monthlyRecords),
    inbound: renderInbound,
    coupang: renderCoupang,
    prepaid: renderPrepaid,
    report: renderMonthlyReport,
    items: renderItems,
  };
  app.appendChild(map[activeTab]());
}

function kpiBox(name, val) {
  const box = el('div', { class: 'box' });
  box.appendChild(el('div', { class: 'name', html: name }));
  box.appendChild(el('div', { class: 'val', html: val }));
  return box;
}

function renderDashboard() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '대시보드' }));

  const ym = monthISO();
  const dailyDates = Object.keys(db.dailyRecords).filter((d) => d.startsWith(ym));
  const weeklyDates = Object.keys(db.weeklyRecords).filter((d) => d.startsWith(ym));
  const monthlyDates = Object.keys(db.monthlyRecords).filter((d) => d.startsWith(ym));
  const inboundRows = db.inbound.filter((r) => r.date.startsWith(ym));
  const patients = Object.keys(db.patients).filter((d) => d.startsWith(ym)).reduce((a, d) => a + toNum(db.patients[d]), 0);
  let threeUse = 0;
  getVisibleItemsByCycle('일일').forEach((it) => {
    if (!PER_PATIENT_TARGETS.has(it.name)) return;
    dailyDates.forEach((d) => {
      const prev = latestQty(db.dailyRecords, it.id, prevDateISO(d));
      const inbound = sumInbound(it.id, d);
      const close = toNum(db.dailyRecords[d]?.[String(it.id)]?.qty);
      threeUse += Math.max(prev + inbound - close, 0);
    });
  });

  const kpi = el('div', { class: 'kpi' });
  kpi.appendChild(kpiBox('이번달 환자수', patients ? money(patients) : '0'));
  kpi.appendChild(kpiBox('일일 재고 저장일', money(dailyDates.length)));
  kpi.appendChild(kpiBox('주간 점검 저장일', money(weeklyDates.length)));
  kpi.appendChild(kpiBox('월간 점검 저장일', money(monthlyDates.length)));
  kpi.appendChild(kpiBox('이번달 입고 건수', money(inboundRows.length)));
  kpi.appendChild(kpiBox('3개 품목 환자대비 사용량', patients ? (threeUse / patients).toFixed(3) : '-'));
  card.appendChild(kpi);

  const hiddenCount = db.items.filter((x) => x.active && x.hidden).length;
  const inactiveCount = db.items.filter((x) => !x.active).length;
  const note = el('div', { class: 'mini', html: `숨김 품목 ${hiddenCount}개 · 비활성 품목 ${inactiveCount}개 · 숨김 품목은 운영 화면에서만 제외됩니다.` });
  card.appendChild(note);
  return card;
}

function buildSavedDateSelect(recordMap, currentDate) {
  const sel = el('select');
  const first = document.createElement('option');
  first.value = '';
  first.textContent = '저장된 날짜';
  sel.appendChild(first);
  datesOf(recordMap).forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    if (d === currentDate) opt.selected = true;
    sel.appendChild(opt);
  });
  return sel;
}


function renderDaily() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '일일 재고' }));

  const dateInput = el('input', { type: 'date', value: todayISO() });
  let savedSel = buildSavedDateSelect(db.dailyRecords, dateInput.value);
  const patientInput = el('input', { type: 'number', value: String(toNum(db.patients[dateInput.value])) });
  const saveBtn = el('button', { class: 'btn primary', type: 'button' });
  saveBtn.textContent = '재고 저장하기';

  card.appendChild(el('div', { class: 'row' }, [
    el('label', {}, [document.createTextNode('날짜'), dateInput]),
    el('label', {}, [document.createTextNode('저장된 날짜 목록'), savedSel]),
    el('label', {}, [document.createTextNode('당일 총 환자수'), patientInput]),
    el('div', { class: 'right', style: 'margin-left:auto' }, [saveBtn]),
  ]));

  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>품목</th>
        <th>단위</th>
        <th class="num">전일 재고</th>
        <th class="num">당일 입고</th>
        <th class="num">퇴근 재고(입력)</th>
        <th class="num">실제 사용량(자동)</th>
        <th class="num">사용 인원</th>
        <th>상태</th>
      </tr>
    </thead>
    <tbody></tbody>`;
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector('tbody');

  function getDailyComputed(date, itemId) {
    const prev = latestQty(db.dailyRecords, itemId, prevDateISO(date));
    const inbound = sumInbound(itemId, date);
    const stored = db.dailyRecords[date]?.[String(itemId)] || {};
    const close = stored.qty === '' || stored.qty === undefined || stored.qty === null ? 0 : toNum(stored.qty);
    const actualUse = Math.max(prev + inbound - close, 0);
    return { prev, inbound, close, actualUse, stored };
  }

  function statusHtml(itemName, actualUse, usePeopleRaw) {
    if (!PER_PATIENT_TARGETS.has(itemName)) return '-';
    if (usePeopleRaw === '' || usePeopleRaw === undefined || usePeopleRaw === null) {
      return '<span class="chip">미입력</span>';
    }
    const usePeople = toNum(usePeopleRaw);
    return actualUse === usePeople
      ? '<span class="chip ok">일치</span>'
      : '<span class="chip bad">일치하지않음</span>';
  }

  function renderRows() {
    const d = dateInput.value;
    tbody.innerHTML = '';
    const items = getVisibleItemsByCycle('일일');
    if (!items.length) {
      const tr = el('tr');
      tr.innerHTML = '<td colspan="8"><div class="empty">표시할 일일 품목이 없습니다.</div></td>';
      tbody.appendChild(tr);
      return;
    }

    items.forEach((it) => {
      const { prev, inbound, actualUse, stored } = getDailyComputed(d, it.id);
      const qtyInput = el('input', { type: 'number', value: stored.qty ?? '' });
      const isTarget = PER_PATIENT_TARGETS.has(it.name);
      const useInput = isTarget ? el('input', { type: 'number', value: stored.use_qty ?? '' }) : null;

      const tr = el('tr');
      tr.innerHTML = `
        <td>${it.name}</td>
        <td>${it.base_unit}</td>
        <td class="num">${money(prev)}</td>
        <td class="num">${money(inbound)}</td>
        <td></td>
        <td class="num">${money(actualUse)}</td>
        <td></td>
        <td></td>`;

      tr.children[4].appendChild(qtyInput);
      if (isTarget) {
        tr.children[6].appendChild(useInput);
      } else {
        tr.children[6].textContent = '-';
      }

      const syncRow = () => {
        const closeVal = qtyInput.value;
        const closeNum = closeVal === '' ? 0 : toNum(closeVal);
        const nextActualUse = Math.max(prev + inbound - closeNum, 0);
        tr.children[5].textContent = money(nextActualUse);
        tr.children[7].innerHTML = statusHtml(it.name, nextActualUse, isTarget ? useInput.value : '');
      };

      qtyInput.oninput = syncRow;
      if (useInput) useInput.oninput = syncRow;
      syncRow();
      tbody.appendChild(tr);
    });
  }

  saveBtn.onclick = () => {
    const d = dateInput.value;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const items = getVisibleItemsByCycle('일일');
    if (!db.dailyRecords[d]) db.dailyRecords[d] = {};
    items.forEach((it, idx) => {
      const tr = rows[idx];
      const qty = tr.children[4].querySelector('input').value;
      const useCell = tr.children[6];
      const useInput = useCell.querySelector('input');
      const useQty = useInput ? useInput.value : '';
      db.dailyRecords[d][String(it.id)] = {
        qty: qty === '' ? '' : toNum(qty),
        use_qty: useQty === '' ? '' : toNum(useQty),
      };
    });
    db.patients[d] = toNum(patientInput.value);
    save();
    alert('저장 완료');
    render();
  };

  function bindSavedSelect(node) {
    node.onchange = () => {
      if (node.value) {
        dateInput.value = node.value;
        patientInput.value = String(toNum(db.patients[node.value]));
        renderRows();
      }
    };
  }

  function refreshSavedDates() {
    const replacement = buildSavedDateSelect(db.dailyRecords, dateInput.value);
    savedSel.replaceWith(replacement);
    savedSel = replacement;
    bindSavedSelect(savedSel);
  }

  dateInput.onchange = () => {
    patientInput.value = String(toNum(db.patients[dateInput.value]));
    refreshSavedDates();
    renderRows();
  };
  bindSavedSelect(savedSel);
  renderRows();
  card.appendChild(el('div', { class: 'mini', html: '당일 총 환자수는 전체 관리 환자 수입니다. 사용 인원은 시트팩·겔시트팩·리바이브팩을 실제 사용한 사람 수만 입력합니다. 상태는 실제 사용량(전일 재고 + 당일 입고 - 퇴근 재고)과 사용 인원을 비교해 표시합니다.' }));
  return card;
}

function renderCheckTab(title, cycle, recordMap) {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: title }));
  const dateInput = el('input', { type: 'date', value: todayISO() });
  const savedSel = buildSavedDateSelect(recordMap, dateInput.value);
  const saveBtn = el('button', { class: 'btn primary', type: 'button' });
  saveBtn.textContent = '재고 저장하기';

  card.appendChild(el('div', { class: 'row' }, [
    el('label', {}, [document.createTextNode('날짜'), dateInput]),
    el('label', {}, [document.createTextNode('저장된 날짜 목록'), savedSel]),
    el('div', { class: 'right', style: 'margin-left:auto' }, [saveBtn]),
  ]));

  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>품목</th><th>단위</th><th class="num">재고 수량(입력)</th><th>메모</th></tr></thead><tbody></tbody>';
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector('tbody');

  function renderRows() {
    const d = dateInput.value;
    const items = getVisibleItemsByCycle(cycle);
    tbody.innerHTML = '';
    if (!items.length) {
      const tr = el('tr');
      tr.innerHTML = '<td colspan="4"><div class="empty">표시할 품목이 없습니다.</div></td>';
      tbody.appendChild(tr);
      return;
    }
    items.forEach((it) => {
      const row = recordMap[d]?.[String(it.id)] || {};
      const qtyInput = el('input', { type: 'number', value: row.qty ?? '' });
      const memoInput = el('input', { type: 'text', value: row.memo || '', style: 'min-width:180px' });
      const tr = el('tr');
      tr.innerHTML = `<td>${it.name}</td><td>${it.base_unit}</td><td></td><td></td>`;
      tr.children[2].appendChild(qtyInput);
      tr.children[3].appendChild(memoInput);
      tbody.appendChild(tr);
    });
  }

  saveBtn.onclick = () => {
    const d = dateInput.value;
    if (!recordMap[d]) recordMap[d] = {};
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const items = getVisibleItemsByCycle(cycle);
    items.forEach((it, idx) => {
      const tr = rows[idx];
      recordMap[d][String(it.id)] = {
        qty: tr.children[2].querySelector('input').value === '' ? '' : toNum(tr.children[2].querySelector('input').value),
        memo: tr.children[3].querySelector('input').value || '',
      };
    });
    save();
    alert('저장 완료');
    render();
  };

  savedSel.onchange = () => {
    if (savedSel.value) {
      dateInput.value = savedSel.value;
      renderRows();
    }
  };
  dateInput.onchange = renderRows;
  renderRows();
  return card;
}

function renderInbound() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '입고' }));

  const dateInput = el('input', { type: 'date', value: todayISO() });
  const itemSel = el('select');
  const qtyInput = el('input', { type: 'number', value: '0' });
  const costInput = el('input', { type: 'number', value: '0' });
  const memoInput = el('input', { type: 'text', value: '' });
  const addBtn = el('button', { class: 'btn primary', type: 'button' });
  addBtn.textContent = '추가';

  function fillSelect() {
    itemSel.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '품목 선택';
    ph.disabled = true;
    ph.selected = true;
    itemSel.appendChild(ph);
    const list = sortItemsStable(db.items.filter((x) => x.active && x.cycle !== '쿠팡'));
    list.forEach((it) => {
      const opt = document.createElement('option');
      opt.value = String(it.id);
      opt.textContent = `${it.name} · ${it.base_unit}`;
      itemSel.appendChild(opt);
    });
  }
  fillSelect();

  card.appendChild(el('div', { class: 'row' }, [
    el('label', {}, [document.createTextNode('입고일'), dateInput]),
    el('label', {}, [document.createTextNode('품목'), itemSel]),
    el('label', {}, [document.createTextNode('수량'), qtyInput]),
    el('label', {}, [document.createTextNode('단가'), costInput]),
    el('label', {}, [document.createTextNode('메모'), memoInput]),
    el('div', { class: 'right', style: 'margin-left:auto' }, [addBtn]),
  ]));

  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>입고일</th><th>품목</th><th class="num">수량</th><th class="num">단가</th><th class="num">합계</th><th>메모</th><th>작업</th></tr></thead><tbody></tbody>';
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector('tbody');

  function renderRows() {
    const rows = db.inbound.slice().sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));
    tbody.innerHTML = '';
    if (!rows.length) {
      const tr = el('tr');
      tr.innerHTML = '<td colspan="7"><div class="empty">입고 기록이 없습니다.</div></td>';
      tbody.appendChild(tr);
      return;
    }
    rows.forEach((r) => {
      const it = getItemById(r.item_id);
      const tr = el('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${it ? it.name : '-'}</td>
        <td class="num">${money(r.qty)}</td>
        <td class="num">${toNum(r.unit_cost) ? money(r.unit_cost) : '-'}</td>
        <td class="num">${toNum(r.unit_cost) ? money(toNum(r.qty) * toNum(r.unit_cost)) : '-'}</td>
        <td>${r.type === 'prepaid_transfer' ? '선결제(킵) 출고' : (r.memo || '')}</td>
        <td></td>`;
      const del = el('button', { class: 'btn', type: 'button' });
      del.textContent = '삭제';
      del.onclick = () => {
        db.inbound = db.inbound.filter((x) => x.id !== r.id);
        save();
        renderRows();
      };
      tr.children[6].appendChild(del);
      tbody.appendChild(tr);
    });
  }

  addBtn.onclick = () => {
    if (!itemSel.value) {
      alert('품목을 선택하세요.');
      return;
    }
    const q = toNum(qtyInput.value);
    if (q <= 0) {
      alert('수량은 0보다 커야 합니다.');
      return;
    }
    db.inbound.push({
      id: db.inbound.reduce((m, x) => Math.max(m, toNum(x.id)), 0) + 1,
      date: dateInput.value,
      item_id: toNum(itemSel.value),
      qty: q,
      unit_cost: toNum(costInput.value),
      memo: memoInput.value || '',
    });
    save();
    qtyInput.value = '0';
    costInput.value = '0';
    memoInput.value = '';
    renderRows();
  };

  renderRows();
  return card;
}

function renderCoupang() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '쿠팡 주문 기록' }));
  const dateInput = el('input', { type: 'date', value: todayISO() });
  const savedSel = buildSavedDateSelect(db.coupangRecords, dateInput.value);
  const saveBtn = el('button', { class: 'btn primary', type: 'button' });
  saveBtn.textContent = '주문 저장하기';

  card.appendChild(el('div', { class: 'row' }, [
    el('label', {}, [document.createTextNode('날짜'), dateInput]),
    el('label', {}, [document.createTextNode('저장된 날짜 목록'), savedSel]),
    el('div', { class: 'right', style: 'margin-left:auto' }, [saveBtn]),
  ]));

  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>품목</th><th>주문 체크</th><th>메모</th></tr></thead><tbody></tbody>';
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector('tbody');

  function renderRows() {
    const d = dateInput.value;
    tbody.innerHTML = '';
    const items = getVisibleItemsByCycle('쿠팡');
    items.forEach((it) => {
      const row = db.coupangRecords[d]?.[String(it.id)] || {};
      const check = el('input', { type: 'checkbox' });
      check.checked = !!row.checked;
      const memo = el('input', { type: 'text', value: row.memo || '', style: 'min-width:200px' });
      const tr = el('tr');
      tr.innerHTML = `<td>${it.name}</td><td></td><td></td>`;
      tr.children[1].appendChild(check);
      tr.children[2].appendChild(memo);
      tbody.appendChild(tr);
    });
  }

  saveBtn.onclick = () => {
    const d = dateInput.value;
    if (!db.coupangRecords[d]) db.coupangRecords[d] = {};
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const items = getVisibleItemsByCycle('쿠팡');
    items.forEach((it, idx) => {
      const tr = rows[idx];
      db.coupangRecords[d][String(it.id)] = {
        checked: tr.children[1].querySelector('input').checked,
        memo: tr.children[2].querySelector('input').value || '',
      };
    });
    save();
    alert('저장 완료');
    render();
  };

  savedSel.onchange = () => {
    if (savedSel.value) {
      dateInput.value = savedSel.value;
      renderRows();
    }
  };
  dateInput.onchange = renderRows;
  renderRows();
  card.appendChild(el('div', { class: 'mini', html: '쿠팡은 재고관리 없이 주문 여부와 메모만 기록합니다.' }));
  return card;
}


function renderPrepaid() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '선결제(킵) - 잔량 자동 / 최소기준 없음' }));

  const container = el('div', { class: 'two-col' });

  function makeKeepCard(key) {
    const cfg = KEEP_CONFIG[key];
    const st = db.keep[key] || { tier: cfg.tiers[0].tier, shipped_total: 0, hospital_stock: 0 };

    const tierSel = el('select');
    cfg.tiers.forEach((t) => {
      const o = document.createElement('option');
      o.value = t.tier;
      o.textContent = `${t.tier} (단가 ${money(t.unit_cost)}원/${cfg.unit})`;
      tierSel.appendChild(o);
    });
    tierSel.value = st.tier;

    const hospitalStock = el('input', { type: 'number', value: String(toNum(st.hospital_stock || 0)) });
    const shipQty = el('input', { type: 'number', value: String(cfg.defaultShipQty) });
    const btn = el('button', { class: 'btn primary', type: 'button' });
    btn.textContent = '출고요청';
    const sum = el('div', { class: 'kpi' });

    function refresh() {
      st.tier = tierSel.value;
      const { tier, shipped, remain } = keepRemain(key);
      sum.innerHTML = '';
      sum.appendChild(kpiBox('계약 총량', `${money(tier.total_qty)}${cfg.unit}`));
      sum.appendChild(kpiBox('누적 출고', `${money(shipped)}${cfg.unit}`));
      sum.appendChild(kpiBox('업체 잔량', `${money(remain)}${cfg.unit}`));
      sum.appendChild(kpiBox('단가(스냅샷)', `${money(tier.unit_cost)}원/${cfg.unit}`));
    }

    tierSel.onchange = () => {
      st.tier = tierSel.value;
      save();
      refresh();
    };

    hospitalStock.onchange = () => {
      st.hospital_stock = toNum(hospitalStock.value);
      save();
    };

    btn.onclick = () => {
      const { tier, shipped, remain } = keepRemain(key);
      const q = toNum(shipQty.value);
      if (q <= 0) {
        alert('출고 수량은 0보다 커야 합니다.');
        return;
      }
      if (q > remain) {
        alert('출고 수량이 업체 잔량보다 큽니다.');
        return;
      }
      st.shipped_total = shipped + q;
      st.hospital_stock = toNum(hospitalStock.value);

      const item = db.items.find((x) => x.name === cfg.mapToItemName);
      if (item) {
        db.inbound.push({
          id: db.inbound.reduce((m, x) => Math.max(m, toNum(x.id)), 0) + 1,
          date: todayISO(),
          item_id: item.id,
          qty: q,
          unit_cost: toNum(tier.unit_cost),
          memo: '선결제(킵) 출고',
          type: 'prepaid_transfer',
        });
      }

      save();
      alert('출고요청 완료: 업체잔량 자동 차감 + 입고 자동 생성');
      refresh();
    };

    const box = el('div', { class: 'card', style: 'background:rgba(17,26,44,.45)' });
    box.appendChild(el('div', { html: `<b>${cfg.name}</b>` }));
    box.appendChild(el('div', { class: 'mini', html: '잔량=계약총량-누적출고. 선결제 최소기준/재선결제는 제거.' }));
    box.appendChild(el('div', { class: 'row' }, [
      el('label', {}, [document.createTextNode('계약 티어'), tierSel]),
      el('label', {}, [document.createTextNode('병원 보유(실사)'), hospitalStock]),
      el('label', {}, [document.createTextNode(`출고 수량(${cfg.unit})`), shipQty]),
      el('div', { class: 'right', style: 'margin-left:auto' }, [btn]),
    ]));
    box.appendChild(sum);
    refresh();
    return box;
  }

  container.appendChild(makeKeepCard('sheetmask'));
  container.appendChild(makeKeepCard('modeling'));
  card.appendChild(container);
  card.appendChild(el('div', { class: 'mini', html: "킵은 '업체→병원 이동(입고)'만 자동 기록합니다. 실제 소모는 일일 재고에서 확인합니다." }));
  return card;
}

function renderMonthlyReport() {

  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '월간 보고 (정확 계산 가능 항목만)' }));
  const monthInput = el('input', { type: 'month', value: monthISO() });
  card.appendChild(el('div', { class: 'row' }, [el('label', {}, [document.createTextNode('월 선택'), monthInput]) ]));
  card.appendChild(el('div', { class: 'mini', html: '주간/월간 점검은 실사 스냅샷이라 월 사용량 계산에서 제외합니다. 쿠팡은 주문 기록만 집계하고, 선결제는 출고 건수와 현재 잔량만 표시합니다.' }));

  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>항목</th><th class="num">값</th><th>근거</th></tr></thead><tbody></tbody>';
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector('tbody');

  function row(name, val, note = '') {
    const tr = el('tr');
    tr.innerHTML = `<td>${name}</td><td class="num">${val}</td><td>${note}</td>`;
    return tr;
  }

  function renderRows() {
    const ym = monthInput.value;
    tbody.innerHTML = '';
    const patients = Object.keys(db.patients).filter((d) => d.startsWith(ym)).reduce((a, d) => a + toNum(db.patients[d]), 0);
    const dailySaves = Object.keys(db.dailyRecords).filter((d) => d.startsWith(ym)).length;
    const inboundRows = db.inbound.filter((r) => r.date.startsWith(ym));
    const inboundQty = inboundRows.reduce((a, r) => a + toNum(r.qty), 0);
    const inboundCost = inboundRows.reduce((a, r) => a + (toNum(r.qty) * toNum(r.unit_cost)), 0);
    const coupangChecked = Object.entries(db.coupangRecords)
      .filter(([d]) => d.startsWith(ym))
      .flatMap(([, map]) => Object.values(map || {}))
      .filter((v) => v.checked).length;
    const keepTransfers = inboundRows.filter((r) => r.type === 'prepaid_transfer').length;
    const keepSheetRemain = keepRemain('sheetmask').remain;
    const keepModelRemain = keepRemain('modeling').remain;

    tbody.appendChild(row('월 환자수', money(patients), '일일 재고 화면에서 날짜별 입력한 환자수 합계'));
    tbody.appendChild(row('일일 재고 저장일 수', money(dailySaves), '일일 재고 저장된 날짜 수'));
    tbody.appendChild(row('입고 총수량', money(inboundQty), '선택 월 입고 기록 전체 합계'));
    tbody.appendChild(row('입고 총금액', `${money(inboundCost)}원`, '입고 수량 × 단가 합계'));
    tbody.appendChild(row('쿠팡 주문 체크 수', money(coupangChecked), '쿠팡 화면에서 체크된 주문 건수'));
    tbody.appendChild(row('선결제 출고 건수', money(keepTransfers), '선결제 화면 출고요청으로 생성된 월별 입고 건수'));
    tbody.appendChild(row('(더마소드) 겔시트팩 현재 킵 잔량', money(keepSheetRemain), '계약총량 - 누적출고 기준 현재 잔량'));
    tbody.appendChild(row('(하라셀) 모델링팩 현재 킵 잔량', money(keepModelRemain), '계약총량 - 누적출고 기준 현재 잔량'));

    getVisibleItemsByCycle('일일').forEach((it) => {
      let monthlyUse = 0;
      Object.keys(db.dailyRecords).filter((d) => d.startsWith(ym)).forEach((d) => {
        const stored = db.dailyRecords[d]?.[String(it.id)] || {};
        if (PER_PATIENT_TARGETS.has(it.name)) {
          monthlyUse += toNum(stored.use_qty);
        } else {
          const prev = latestQty(db.dailyRecords, it.id, prevDateISO(d));
          const inbound = sumInbound(it.id, d);
          const close = stored.qty === '' || stored.qty === undefined || stored.qty === null ? 0 : toNum(stored.qty);
          monthlyUse += Math.max(prev + inbound - close, 0);
        }
      });
      const note = PER_PATIENT_TARGETS.has(it.name)
        ? (patients > 0 ? `월 사용량 ÷ 월 환자수 = ${(monthlyUse / patients).toFixed(3)}` : '환자수 0으로 환자대비 계산 불가')
        : '전일재고 + 당일입고 - 퇴근재고 기준 자동 계산';
      tbody.appendChild(row(`${it.name} 월 사용량`, money(monthlyUse), note));
    });

    if (!tbody.children.length) tbody.appendChild(row('데이터 없음', '-', '입력 기록 필요'));
  }

  monthInput.onchange = renderRows;
  renderRows();
  return card;
}

function renderItems() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { html: '품목' }));

  const stateSel = el('select');
  ['전체', '사용중', '숨김', '비활성'].forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    stateSel.appendChild(opt);
  });
  const cycleSel = el('select');
  ['전체', ...CYCLE_OPTIONS].forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    cycleSel.appendChild(opt);
  });

  const addBox = el('div', { class: 'card', style: { background: 'rgba(17,26,44,.45)' } });
  const nameInput = el('input', { type: 'text', value: '' });
  const cycleInput = el('select');
  CYCLE_OPTIONS.forEach((x) => {
    const opt = document.createElement('option');
    opt.value = x;
    opt.textContent = x;
    cycleInput.appendChild(opt);
  });
  const unitInput = el('select');
  UNIT_OPTIONS.forEach((x) => {
    const opt = document.createElement('option');
    opt.value = x;
    opt.textContent = x;
    unitInput.appendChild(opt);
  });
  const noteInput = el('input', { type: 'text', value: '' });
  const addBtn = el('button', { class: 'btn primary', type: 'button' });
  addBtn.textContent = '품목 추가';

  addBox.appendChild(el('div', { class: 'row' }, [
    el('label', {}, [document.createTextNode('품목명'), nameInput]),
    el('label', {}, [document.createTextNode('분류'), cycleInput]),
    el('label', {}, [document.createTextNode('단위'), unitInput]),
    el('label', {}, [document.createTextNode('메모'), noteInput]),
    el('div', { class: 'right', style: 'margin-left:auto' }, [addBtn]),
  ]));
  card.appendChild(addBox);

  card.appendChild(el('div', { class: 'row' }, [
    el('label', {}, [document.createTextNode('상태'), stateSel]),
    el('label', {}, [document.createTextNode('분류'), cycleSel]),
  ]));

  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>품목명</th><th>분류</th><th>단위</th><th>상태</th><th>메모</th><th>작업</th></tr></thead><tbody></tbody>';
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector('tbody');

  function statusText(it) {
    if (!it.active) return '비활성';
    if (it.hidden) return '숨김';
    return '사용중';
  }

  function renderRows() {
    let items = sortItemsStable(db.items);
    if (cycleSel.value !== '전체') items = items.filter((x) => x.cycle === cycleSel.value);
    if (stateSel.value === '사용중') items = items.filter((x) => x.active && !x.hidden);
    if (stateSel.value === '숨김') items = items.filter((x) => x.active && x.hidden);
    if (stateSel.value === '비활성') items = items.filter((x) => !x.active);
    tbody.innerHTML = '';
    if (!items.length) {
      const tr = el('tr');
      tr.innerHTML = '<td colspan="6"><div class="empty">표시할 품목이 없습니다.</div></td>';
      tbody.appendChild(tr);
      return;
    }
    items.forEach((it) => {
      const tr = el('tr');
      tr.innerHTML = `<td>${it.name}</td><td>${it.cycle}</td><td>${it.base_unit}</td><td>${statusText(it)}</td><td>${it.note || ''}</td><td></td>`;
      const hideBtn = el('button', { class: 'btn', type: 'button' });
      hideBtn.textContent = it.hidden ? '숨김해제' : '숨김';
      hideBtn.onclick = () => {
        if (!it.active) return;
        it.hidden = !it.hidden;
        save();
        renderRows();
      };
      const activeBtn = el('button', { class: 'btn', type: 'button' });
      activeBtn.textContent = it.active ? '비활성' : '복구';
      activeBtn.onclick = () => {
        it.active = !it.active;
        if (!it.active) it.hidden = false;
        save();
        renderRows();
      };
      tr.children[5].appendChild(hideBtn);
      tr.children[5].appendChild(activeBtn);
      tbody.appendChild(tr);
    });
  }

  addBtn.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert('품목명을 입력하세요.');
      return;
    }
    if (db.items.some((x) => x.name === name)) {
      alert('동일한 품목명이 이미 있습니다.');
      return;
    }
    const nextId = db.items.reduce((m, x) => Math.max(m, toNum(x.id)), 0) + 1;
    db.items.push(makeItem(nextId, name, cycleInput.value, unitInput.value, { note: noteInput.value || '' }));
    save();
    nameInput.value = '';
    noteInput.value = '';
    renderRows();
  };

  stateSel.onchange = renderRows;
  cycleSel.onchange = renderRows;
  renderRows();
  card.appendChild(el('div', { class: 'mini', html: '숨김: 운영 화면(일일/주간/월간/입고/쿠팡)에서만 제외됩니다. 비활성: 전체 사용 중지 상태이며 언제든 복구 가능합니다.' }));
  return card;
}

$('#btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `derm_inventory_backup_${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

$('#btnImport').onclick = () => {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json';
  inp.onchange = () => {
    const file = inp.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        db = migrate(JSON.parse(String(reader.result || '{}')));
        save();
        alert('가져오기 완료');
        render();
      } catch {
        alert('가져오기 실패: JSON 형식 오류');
      }
    };
    reader.readAsText(file);
  };
  inp.click();
};

$('#btnReset').onclick = () => {
  if (!confirm('정말 초기화할까요? 모든 기록이 삭제됩니다.')) return;
  localStorage.removeItem(STORAGE_KEY);
  db = seed();
  save();
  render();
};

render();
