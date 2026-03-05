const STORAGE_KEY = "derm_inventory_v2";

const $ = (id) => document.getElementById(id);
const fmt = (n) => (Number(n) || 0).toLocaleString("ko-KR");
const money = (n) => (Number(n) || 0).toLocaleString("ko-KR") + "원";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function parseDay(s) {
  // "YYYY-MM-DD" -> number (YYYYMMDD)
  if (!s) return 0;
  return Number(s.replaceAll("-", ""));
}

function inMonth(dateStr, ym) {
  return (dateStr || "").startsWith(ym + "-");
}

function startOfMonth(ym) {
  return ym + "-01";
}

function prevMonth(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() - 1);
  return monthStr(d);
}

function daysBetween(a, b) {
  // a,b: YYYY-MM-DD
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.floor((db - da) / (1000 * 60 * 60 * 24));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function save(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function defaultItems() {
  // 48개 기본 품목
  const A = [
    { name: "수분팩", category: "팩", grade: "A", baseUnit: "장", orderUnit: "박스", orderPack: 1 },
    { name: "진정팩", category: "팩", grade: "A", baseUnit: "장", orderUnit: "박스", orderPack: 1 },
    { name: "겔시트팩", category: "팩", grade: "A", baseUnit: "장", orderUnit: "박스", orderPack: 1 },
    { name: "거즈팩", category: "팩", grade: "A", baseUnit: "장", orderUnit: "박스", orderPack: 1 },
    { name: "모델링팩", category: "팩", grade: "A", baseUnit: "g", orderUnit: "통", orderPack: 1 },
    { name: "해면", category: "소모품", grade: "A", baseUnit: "개", orderUnit: "묶음", orderPack: 1 },
  ];

  const B = [
    { name: "멸균 거즈", category: "위생/소모품", grade: "B", baseUnit: "장", orderUnit: "박스", orderPack: 1 },
    { name: "장갑", category: "위생/소모품", grade: "B", baseUnit: "장", orderUnit: "박스", orderPack: 1 },
    { name: "클렌징 밀크", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "클렌징 젤", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "토너", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "아토 크림", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "셀퓨전씨 로션", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "셀퓨전씨 크림", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "재생 크림", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "선크림", category: "기초", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "알로에 젤", category: "겔/약제", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "진정 젤", category: "겔/약제", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "초음파 겔", category: "겔/약제", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "스킨솜", category: "위생/소모품", grade: "B", baseUnit: "장", orderUnit: "팩", orderPack: 1 },
    { name: "거즈", category: "위생/소모품", grade: "B", baseUnit: "장", orderUnit: "팩", orderPack: 1 },
    { name: "GA20", category: "약제", grade: "B", baseUnit: "개", orderUnit: "박스", orderPack: 1 },
    { name: "GA30", category: "약제", grade: "B", baseUnit: "개", orderUnit: "박스", orderPack: 1 },
    { name: "중화제", category: "약제", grade: "B", baseUnit: "개", orderUnit: "개", orderPack: 1 },
  ];

  const C = [
    { name: "팩붓", category: "도구", grade: "C", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "스파출라", category: "도구", grade: "C", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "코메도 압출기", category: "도구", grade: "C", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "유리볼", category: "도구", grade: "C", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "카프리가스", category: "기기/가스", grade: "C", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "니들 26G", category: "위생/소모품", grade: "C", baseUnit: "개", orderUnit: "박스", orderPack: 1 },
    { name: "면봉", category: "위생/소모품", grade: "C", baseUnit: "개", orderUnit: "팩", orderPack: 1 },
    { name: "비타민 앰플 P", category: "앰플/약제", grade: "C", baseUnit: "개", orderUnit: "박스", orderPack: 1 },
    { name: "비타민 앰플 V", category: "앰플/약제", grade: "C", baseUnit: "개", orderUnit: "박스", orderPack: 1 },
    { name: "2B Aladdin Peeling Powder", category: "2B", grade: "C", baseUnit: "개", orderUnit: "세트", orderPack: 1 },
    { name: "2B Bio Peeling Preparation Pro", category: "2B", grade: "C", baseUnit: "개", orderUnit: "세트", orderPack: 1 },
    { name: "2B Bio Aladdin Peel(수딩 마스크)", category: "2B", grade: "C", baseUnit: "개", orderUnit: "세트", orderPack: 1 },
  ];

  const D = [
    { name: "세제", category: "청소", grade: "D", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "섬유유연제", category: "청소", grade: "D", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "퐁퐁", category: "청소", grade: "D", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "아이깨끗해", category: "청소", grade: "D", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "세탁청소가루", category: "청소", grade: "D", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "칫솔", category: "청소", grade: "D", baseUnit: "개", orderUnit: "개", orderPack: 1 },
    { name: "매직스펀지", category: "청소", grade: "D", baseUnit: "개", orderUnit: "묶음", orderPack: 1 },
    { name: "수세미", category: "청소", grade: "D", baseUnit: "개", orderUnit: "묶음", orderPack: 1 },
    { name: "세탁망", category: "청소", grade: "D", baseUnit: "개", orderUnit: "묶음", orderPack: 1 },
    { name: "고무줄", category: "청소", grade: "D", baseUnit: "개", orderUnit: "묶음", orderPack: 1 },
    { name: "파우더룸 휴지", category: "청소", grade: "D", baseUnit: "롤", orderUnit: "팩", orderPack: 1 },
    { name: "웨건 휴지", category: "청소", grade: "D", baseUnit: "롤", orderUnit: "팩", orderPack: 1 },
  ];

  const all = [...A, ...B, ...C, ...D];
  return all.map((x) => ({
    id: uid(),
    name: x.name,
    category: x.category,
    grade: x.grade,
    baseUnit: x.baseUnit || "",
    orderUnit: x.orderUnit || "",
    orderPack: Number(x.orderPack) || 1,
    recommended: 0,
    safety: 0,
    active: true,
  }));
}

function initDb() {
  const existing = load();
  if (existing && existing.items) return existing;

  const db = {
    version: 2,
    createdAt: Date.now(),
    items: defaultItems(),
    inbound: [],
    outbound: [],
    records: { daily: [], weekly: [], monthly: [] },
    adjustments: [] // 품목 화면에서 수동 재고 입력(필수 아님)
  };

  save(db);
  return db;
}

let db = initDb();

// 구버전 데이터 마이그레이션(기존 사용자 데이터 보호)
if (!Array.isArray(db.outbound)) db.outbound = [];


/* ---------- 공통 계산 ---------- */

function findItem(id) {
  return db.items.find((x) => x.id === id);
}

function allRecords() {
  return [...db.records.daily, ...db.records.weekly, ...db.records.monthly, ...db.adjustments];
}

function latestRecordForItem(itemId) {
  const recs = allRecords().filter((r) => r.itemId === itemId);
  if (recs.length === 0) return null;
  recs.sort((a, b) => parseDay(b.date) - parseDay(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  return recs[0];
}

function currentStock(itemId) {
  const r = latestRecordForItem(itemId);
  return r ? Number(r.stock) || 0 : 0;
}

function sumInboundBetween(itemId, fromExclusive, toInclusive) {
  const fromN = fromExclusive ? parseDay(fromExclusive) : 0;
  const toN = parseDay(toInclusive);
  return db.inbound
    .filter((x) => x.itemId === itemId)
    .filter((x) => {
      const dn = parseDay(x.date);
      return dn > fromN && dn <= toN;
    })
    .reduce((acc, x) => acc + (Number(x.qty) || 0), 0);
}

function sumInboundOnDate(itemId, dateStr) {
  const target = parseDay(dateStr);
  return (db.inbound || [])
    .filter((x) => x.itemId === itemId)
    .filter((x) => parseDay(x.date) === target)
    .reduce((acc, x) => acc + (Number(x.qty) || 0), 0);
}

function lastInboundUnitCostBefore(itemId, onOrBefore) {
  const target = parseDay(onOrBefore);
  const list = db.inbound
    .filter((x) => x.itemId === itemId)
    .filter((x) => parseDay(x.date) <= target)
    .sort((a, b) => parseDay(b.date) - parseDay(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  return list[0] ? Number(list[0].unitCost) || 0 : 0;
}

function calcUsageCostErr(itemId, date, newStock) {
  const prev = allRecords()
    .filter((r) => r.itemId === itemId)
    .filter((r) => parseDay(r.date) < parseDay(date))
    .sort((a, b) => parseDay(b.date) - parseDay(a.date) || (b.createdAt || 0) - (a.createdAt || 0))[0] || null;

  const prevDate = prev ? prev.date : null;
  const prevStock = prev ? Number(prev.stock) || 0 : 0;
  const inboundQty = sumInboundBetween(itemId, prevDate, date);
  const expected = prevStock + inboundQty;

  let usage = expected - newStock;
  let err = 0;
  if (usage < 0) {
    err = -usage; // 예상보다 재고가 늘어난 경우(입고 누락/오입력 가능)
    usage = 0;
  }
  const unitCostSnapshot = lastInboundUnitCostBefore(itemId, date);
  const cost = usage * unitCostSnapshot;

  return { usage, cost, unitCostSnapshot, err, expected, inboundQty, prevStock, prevDate };
}

function prevStockBeforeDate(itemId, dateStr) {
  const prev = allRecords()
    .filter((r) => r.itemId === itemId)
    .filter((r) => parseDay(r.date) < parseDay(dateStr))
    .sort((a, b) => parseDay(b.date) - parseDay(a.date) || (b.createdAt || 0) - (a.createdAt || 0))[0] || null;
  return prev ? Number(prev.stock) || 0 : 0;
}

function needOrder(item) {
  const cur = currentStock(item.id);
  const safety = Number(item.safety) || 0;
  return cur < safety;
}

function pillFor(item) {
  const cur = currentStock(item.id);
  const safety = Number(item.safety) || 0;
  const reco = Number(item.recommended) || 0;
  if (cur < safety) return { cls: "danger", label: "안전 이하" };
  if (cur < reco) return { cls: "warn", label: "권장 이하" };
  return { cls: "ok", label: "정상" };
}

/* ---------- 네비게이션 ---------- */

const pages = ["dashboard","items","daily","inbound","outbound","weekly","monthly","orders","report"];

function showPage(p) {
  for (const k of pages) {
    const sec = $("page-" + k);
    if (!sec) continue;
    sec.classList.toggle("hidden", k !== p);
  }
  document.querySelectorAll("#nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.page === p);
  });
  if (p === "dashboard") renderDashboard();
  if (p === "items") renderItems();
  if (p === "daily") { refreshItemSelects(); renderDaily(); }
  if (p === "inbound") { refreshItemSelects(); renderInbound(); }
  if (p === "outbound") { refreshItemSelects(); renderOutbound(); }
  if (p === "weekly") { refreshItemSelects(); renderWeekly(); }
  if (p === "monthly") { refreshItemSelects(); renderMonthly(); }
  if (p === "orders") renderOrders();
  if (p === "report") renderReport();
}

$("nav").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (!btn) return;
  showPage(btn.dataset.page);
});

/* ---------- 선택 목록 ---------- */

function refreshItemSelects() {
  const byGrade = (grade) => db.items.filter((x) => x.active && x.grade === grade).sort((a,b)=>a.name.localeCompare(b.name));

  const fill = (sel, list) => {
    sel.innerHTML = "";
    for (const it of list) {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = `${it.name} (${it.category})`;
      sel.appendChild(opt);
    }
  };

  fill($("d-item"), byGrade("A"));
  fill($("w-item"), byGrade("B"));
  fill($("m-item"), byGrade("C"));
  // 입고는 전체 Active
  fill($("in-item"), db.items.filter((x) => x.active).sort((a,b)=>a.name.localeCompare(b.name)));
  // 출고는 전체 Active
  const outSel = $("out-item");
  if (outSel) fill(outSel, db.items.filter((x) => x.active).sort((a,b)=>a.name.localeCompare(b.name)));
}

/* ---------- 1) Dashboard ---------- */

function monthAgg(ym) {
  const recs = [...db.records.daily, ...db.records.weekly, ...db.records.monthly].filter((r) => inMonth(r.date, ym));
  const cost = recs.reduce((acc, r) => acc + (Number(r.cost) || 0), 0);
  const byItem = new Map();
  for (const r of recs) {
    const v = byItem.get(r.itemId) || 0;
    byItem.set(r.itemId, v + (Number(r.cost) || 0));
  }
  return { cost, byItem };
}


function avgUsageLast7Days(itemId, refDateStr = todayStr()) {
  const ref = new Date(refDateStr + "T00:00:00");
  const from = new Date(ref); from.setDate(from.getDate() - 6); // 7일
  const fromStr = from.toISOString().slice(0,10);

  // 출고(사용) 기록이 있으면 출고 기반 사용량 우선
  const outTotal = (db.outbound || [])
    .filter((r) => r.itemId === itemId)
    .filter((r) => r.date >= fromStr && r.date <= refDateStr)
    .reduce((acc, r) => acc + (Number(r.qty) || 0), 0);

  if (outTotal > 0) return outTotal / 7;

  // 출고가 없으면 기존 방식(재고 차이로 추정된 usage) 사용
  const recs = [...db.records.daily, ...db.records.weekly, ...db.records.monthly]
    .filter((r) => r.itemId === itemId)
    .filter((r) => r.date >= fromStr && r.date <= refDateStr);

  const totalUsage = recs.reduce((acc, r) => acc + (Number(r.usage) || 0), 0);
  return totalUsage / 7;
}

function renderDashboard() {
  const ym = monthStr();
  const pm = prevMonth(ym);

  const cur = monthAgg(ym);
  const prev = monthAgg(pm);

  $("dash-month-cost").textContent = money(cur.cost);
  $("dash-month-range").textContent = `${startOfMonth(ym)} ~ ${todayStr()}`;

  if (prev.cost === 0 && cur.cost === 0) $("dash-mom").textContent = "-";
  else if (prev.cost === 0) $("dash-mom").textContent = "∞";
  else $("dash-mom").textContent = `${Math.round(((cur.cost - prev.cost) / prev.cost) * 100)}%`;

  // top3
  const top = [...cur.byItem.entries()]
    .map(([itemId, v]) => ({ itemId, v, name: findItem(itemId)?.name || "알 수 없음" }))
    .sort((a,b)=>b.v-a.v)
    .slice(0,3);

  $("dash-top3").textContent = top.length ? top.map((x)=>`${x.name} ${money(x.v)}`).join(" · ") : "-";

  // low stock
  const low = db.items
    .filter((x) => x.active)
    .map((x) => ({ item: x, cur: currentStock(x.id), safety: Number(x.safety)||0 }))
    .filter((x) => x.safety > 0 && x.cur < x.safety)
    .sort((a,b)=> (a.cur/a.safety) - (b.cur/b.safety));

  const lowT = $("dash-low-tbody");
  lowT.innerHTML = "";
  for (const row of low.slice(0, 30)) {
    const p = pillFor(row.item);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.item.name)}</td>
      <td>${row.item.grade}</td>
      <td class="right">${fmt(row.cur)}</td>
      <td class="right">${fmt(row.safety)}</td>
      <td><span class="pill ${p.cls}">${p.label}</span></td>
    `;
    lowT.appendChild(tr);
  }
  if (low.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="muted">안전 재고 이하 품목 없음</td>`;
    lowT.appendChild(tr);
  }

  // depletion <=10 days (avg 7 days)
  const dep = db.items
    .filter((x) => x.active)
    .map((x) => {
      const cur = currentStock(x.id);
      const avg7 = avgUsageLast7Days(x.id);
      const days = avg7 > 0 ? cur / avg7 : Infinity;
      return { item: x, cur, avg7, days };
    })
    .filter((x) => Number.isFinite(x.days) && x.days <= 10)
    .sort((a,b)=>a.days-b.days);

  const depT = $("dash-deplete-tbody");
  depT.innerHTML = "";
  for (const row of dep.slice(0, 30)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.item.name)}</td>
      <td>${row.item.grade}</td>
      <td class="right">${fmt(row.cur)}</td>
      <td class="right">${fmt(row.avg7.toFixed(2))}</td>
      <td class="right"><span class="dangerText">${row.days.toFixed(1)}</span></td>
    `;
    depT.appendChild(tr);
  }
  if (dep.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="muted">소진 예상 10일 이내 품목 없음(최근 7일 사용량 기준)</td>`;
    depT.appendChild(tr);
  }
}

/* ---------- 2) Items ---------- */

let editingItemId = null;

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function clearItemInputs() {
  $("it-name").value = "";
  $("it-category").value = "";
  $("it-grade").value = "A";
  $("it-base-unit").value = "";
  $("it-order-unit").value = "";
  $("it-order-pack").value = "";
  $("it-reco").value = "";
  $("it-safety").value = "";
  editingItemId = null;
  $("it-save-btn").textContent = "추가";
}

function startEditItem(id) {
  const it = findItem(id);
  if (!it) return;
  editingItemId = id;
  $("it-name").value = it.name;
  $("it-category").value = it.category;
  $("it-grade").value = it.grade;
  $("it-base-unit").value = it.baseUnit || "";
  $("it-order-unit").value = it.orderUnit || "";
  $("it-order-pack").value = Number(it.orderPack) || 1;
  $("it-reco").value = Number(it.recommended) || 0;
  $("it-safety").value = Number(it.safety) || 0;
  $("it-save-btn").textContent = "저장";
}

function upsertItemFromInputs() {
  const name = $("it-name").value.trim();
  if (!name) return alert("품목명을 입력하세요.");
  const category = $("it-category").value.trim();
  const grade = $("it-grade").value;
  const baseUnit = $("it-base-unit").value.trim();
  const orderUnit = $("it-order-unit").value.trim();
  const orderPack = Number($("it-order-pack").value) || 1;
  const recommended = Number($("it-reco").value) || 0;
  const safety = Number($("it-safety").value) || 0;

  if (editingItemId) {
    const idx = db.items.findIndex((x) => x.id === editingItemId);
    if (idx >= 0) {
      db.items[idx] = { ...db.items[idx], name, category, grade, baseUnit, orderUnit, orderPack, recommended, safety };
    }
  } else {
    db.items.unshift({
      id: uid(),
      name, category, grade, baseUnit, orderUnit, orderPack,
      recommended, safety,
      active: true,
    });
  }

  save(db);
  clearItemInputs();
  refreshItemSelects();
  renderItems();
}

function toggleActiveItem(id) {
  const it = findItem(id);
  if (!it) return;
  it.active = !it.active;
  save(db);
  refreshItemSelects();
  renderItems();
}


function adjustStock(itemId) {
  const it = findItem(itemId);
  if (!it) return;
  const cur = currentStock(itemId);
  const v = prompt(`"${it.name}" 현재 재고 입력(실재고 기준). 현재값: ${cur}`, String(cur));
  if (v === null) return;
  const stock = Number(v);
  if (!Number.isFinite(stock) || stock < 0) return alert("재고는 0 이상의 숫자만 가능합니다.");

  const reason = prompt(`"${it.name}" 재고 조정 사유(필수):`, "");
  if (reason === null) return;
  if (!reason.trim()) return alert("사유를 입력해야 합니다.");

  db.adjustments.unshift({
    id: uid(),
    itemId,
    date: todayStr(),
    stock,
    prevStock: cur,
    reason: reason.trim(),
    type: "adjust",
    createdAt: Date.now(),
  });
  save(db);
  renderItems();
  renderDashboard();
}

function renderItems() {
  const gradeF = $("it-filter-grade").value;
  const activeF = $("it-filter-active").value;
  // 탭 상태 동기화
  const map = {active:"it-tab-active", inactive:"it-tab-inactive", all:"it-tab-all"};
  for (const k of Object.keys(map)){
    const el = document.getElementById(map[k]);
    if (el) el.classList.toggle("on", k===activeF);
  }
  const orderF = $("it-filter-order").value;

  const list = db.items
    .filter((x) => gradeF === "all" ? true : x.grade === gradeF)
    .filter((x) => activeF === "all" ? true : (activeF === "active" ? x.active : !x.active))
    .map((x) => {
      const cur = currentStock(x.id);
      const need = needOrder(x);
      return { ...x, cur, need };
    })
    .filter((x) => orderF === "all" ? true : x.need)
    .sort((a,b)=> (a.active===b.active?0:(a.active?-1:1)) || a.grade.localeCompare(b.grade) || a.name.localeCompare(b.name));

  const tbody = $("it-tbody");
  tbody.innerHTML = "";

  for (const it of list) {
    const p = pillFor(it);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.category || "")}</td>
      <td class="nowrap">${it.grade}</td>
      <td>${escapeHtml(it.baseUnit || "")}</td>
      <td>${escapeHtml(it.orderUnit || "")} ${it.orderPack ? `(${fmt(it.orderPack)})` : ""}</td>
      <td class="right">${fmt(it.recommended)}</td>
      <td class="right">${fmt(it.safety)}</td>
      <td class="right">${fmt(it.cur)}</td>
      <td class="nowrap">${it.need ? `<span class="pill danger">필요</span>` : `<span class="pill ok">아님</span>`}</td>
      <td class="nowrap">${it.active ? `<span class="pill ok">Active</span>` : `<span class="pill warn">Inactive</span>`}</td>
      <td class="actions">
        <button data-act="stock" data-id="${it.id}">재고입력</button>
        <button data-act="edit" data-id="${it.id}">수정</button>
        <button data-act="toggle" data-id="${it.id}">${it.active ? "비활성" : "복구"}</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="11" class="muted">표시할 품목이 없습니다.</td>`;
    tbody.appendChild(tr);
  }
}

$("it-save-btn").addEventListener("click", upsertItemFromInputs);
$("it-cancel-btn").addEventListener("click", clearItemInputs);

function setItemsActiveTab(val){
  const sel = $("it-filter-active");
  sel.value = val;
  // visual
  const map = {active:"it-tab-active", inactive:"it-tab-inactive", all:"it-tab-all"};
  for (const k of Object.keys(map)){
    const el = document.getElementById(map[k]);
    if (el) el.classList.toggle("on", k===val);
  }
  renderItems();
}

$("it-filter-grade").addEventListener("change", renderItems);
$("it-filter-active").addEventListener("change", renderItems);
$("it-filter-order").addEventListener("change", renderItems);

// 상태 탭 (Active / Inactive / 전체)
const tabActive = document.getElementById("it-tab-active");
const tabInactive = document.getElementById("it-tab-inactive");
const tabAll = document.getElementById("it-tab-all");
if (tabActive) tabActive.addEventListener("click", () => setItemsActiveTab("active"));
if (tabInactive) tabInactive.addEventListener("click", () => setItemsActiveTab("inactive"));
if (tabAll) tabAll.addEventListener("click", () => setItemsActiveTab("all"));

$("it-tbody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  if (act === "edit") startEditItem(id);
  if (act === "toggle") toggleActiveItem(id);
  if (act === "stock") adjustStock(id);
});

/* ---------- 3) Daily (B) ---------- */

function ensureDailyDraft(dateStr) {
  if (!db.drafts) db.drafts = { daily: null };
  const cur = db.drafts.daily;
  if (!cur || cur.date !== dateStr) {
    db.drafts.daily = { date: dateStr, autoInbound: true, rows: {} };
  }
  if (typeof db.drafts.daily.autoInbound !== "boolean") db.drafts.daily.autoInbound = true;
  if (!db.drafts.daily.rows) db.drafts.daily.rows = {};
}

function setDraftValue(dateStr, itemId, patch) {
  ensureDailyDraft(dateStr);
  const r = db.drafts.daily.rows[itemId] || {};
  db.drafts.daily.rows[itemId] = { ...r, ...patch };
  save(db);
}

function getDraftValue(dateStr, itemId) {
  ensureDailyDraft(dateStr);
  return db.drafts.daily.rows[itemId] || {};
}

function renderDailyGrid() {
  const date = $("d-date").value || todayStr();
  $("d-date").value = date;

  ensureDailyDraft(date);

  const autoInboundEl = $("d-auto-inbound");
  if (autoInboundEl) autoInboundEl.checked = !!db.drafts.daily.autoInbound;

  const items = db.items
    .filter((x) => x.active && x.grade === "A")
    .sort((a, b) => a.name.localeCompare(b.name));

  const tbody = $("d-grid-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const it of items) {
    const prevStock = prevStockBeforeDate(it.id, date);
    const inToday = sumInboundOnDate(it.id, date);
    const draft = getDraftValue(date, it.id);

    const closing = Number.isFinite(Number(draft.closing)) ? Number(draft.closing) : 0;
    const staffUse = Number.isFinite(Number(draft.staffUse)) ? Number(draft.staffUse) : 0;

    const autoUse = (prevStock + (db.drafts.daily.autoInbound ? inToday : 0)) - closing;
    const err = autoUse - staffUse;

    const unitCostSnapshot = lastInboundUnitCostBefore(it.id, date);
    const cost = staffUse * unitCostSnapshot;

    const errCls = err === 0 ? "okText" : "dangerText";
    const autoUseCls = autoUse >= 0 ? "okText" : "dangerText";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.category || "")}</td>
      <td class="right">${fmt(prevStock)}</td>
      <td class="right">
        <input data-field="closing" data-item="${it.id}" type="number" inputmode="numeric" value="${closing}" style="width:120px;text-align:right" />
      </td>
      <td class="right">
        <input data-field="staffUse" data-item="${it.id}" type="number" inputmode="numeric" value="${staffUse}" style="width:140px;text-align:right" />
      </td>
      <td class="right"><span class="${autoUseCls}">${autoUse >= 0 ? fmt(autoUse) : `-${fmt(Math.abs(autoUse))}`}</span></td>
      <td class="right"><span class="${errCls}">${err === 0 ? "0" : (err > 0 ? `+${fmt(err)}` : `-${fmt(Math.abs(err))}`)}</span></td>
      <td class="right">${money(cost)}</td>
    `;
    tbody.appendChild(tr);
  }

  if (items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8" class="muted">A등급(일일) Active 품목이 없습니다.</td>`;
    tbody.appendChild(tr);
  }
}

function renderDailyHistory() {
  const list = (db.records.daily || [])
    .slice()
    .sort((a,b)=> parseDay(b.date)-parseDay(a.date) || (b.createdAt||0)-(a.createdAt||0));

  const tbody = $("d-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const r of list) {
    const it = findItem(r.itemId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="nowrap">${r.date}</td>
      <td>${escapeHtml(it?.name || "알 수 없음")}</td>
      <td class="right">${fmt(r.stock)}</td>
      <td class="right">${fmt(r.staffUse ?? r.usage)}</td>
      <td class="right">${fmt(r.autoUse ?? 0)}</td>
      <td class="right">${r.err ? `<span class="dangerText">${r.err > 0 ? `+${fmt(r.err)}` : `-${fmt(Math.abs(r.err))}`}</span>` : "0"}</td>
      <td class="right">${money(r.cost)}</td>
      <td>${escapeHtml(r.memo || "")}</td>
      <td class="actions"><button data-act="del" data-id="${r.id}">삭제</button></td>
    `;
    tbody.appendChild(tr);
  }

  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" class="muted">기록 없음</td>`;
    tbody.appendChild(tr);
  }
}

function renderDaily() {
  renderDailyGrid();
  renderDailyHistory();
}

const dGridTbody = $("d-grid-tbody");
if (dGridTbody) dGridTbody.addEventListener("input", (e) => {
  const inp = e.target.closest("input[data-field][data-item]");
  if (!inp) return;
  const field = inp.dataset.field;
  const itemId = inp.dataset.item;
  const date = $("d-date").value || todayStr();
  const v = Number(inp.value);
  if (!Number.isFinite(v) || v < 0) return;
  setDraftValue(date, itemId, { [field]: v });
  renderDailyGrid();
});

const dDateEl = $("d-date");
if (dDateEl) dDateEl.addEventListener("change", () => {
  const date = $("d-date").value || todayStr();
  ensureDailyDraft(date);
  save(db);
  renderDaily();
});

const dAuto = $("d-auto-inbound");
if (dAuto) dAuto.addEventListener("change", () => {
  const date = $("d-date").value || todayStr();
  ensureDailyDraft(date);
  db.drafts.daily.autoInbound = !!dAuto.checked;
  save(db);
  renderDailyGrid();
});

const dFinalize = $("d-finalize-btn");
if (dFinalize) dFinalize.addEventListener("click", () => {
  const date = $("d-date").value || todayStr();
  ensureDailyDraft(date);

  const items = db.items.filter((x) => x.active && x.grade === "A");
  if (items.length === 0) return alert("저장할 A등급 품목이 없습니다.");

  for (const it of items) {
    const d = getDraftValue(date, it.id);
    const closing = Number(d.closing);
    const staffUse = Number(d.staffUse);
    if (!Number.isFinite(closing) || closing < 0) return alert(`"${it.name}" 퇴근 실재고(마감) 값을 확인하세요.`);
    if (!Number.isFinite(staffUse) || staffUse < 0) return alert(`"${it.name}" 당일 사용(직원 입력) 값을 확인하세요.`);
  }

  db.records.daily = (db.records.daily || []).filter((r) => r.date !== date);

  for (const it of items) {
    const prevStock = prevStockBeforeDate(it.id, date);
    const inToday = sumInboundOnDate(it.id, date);

    const d = getDraftValue(date, it.id);
    const stock = Number(d.closing);
    const staffUse = Number(d.staffUse);

    const autoUse = (prevStock + (db.drafts.daily.autoInbound ? inToday : 0)) - stock;
    const err = autoUse - staffUse;

    const unitCostSnapshot = lastInboundUnitCostBefore(it.id, date);
    const cost = staffUse * unitCostSnapshot;

    db.records.daily.unshift({
      id: uid(),
      date,
      itemId: it.id,
      stock,
      usage: staffUse,
      staffUse,
      autoUse,
      err,
      cost,
      unitCostSnapshot,
      memo: "",
      createdAt: Date.now(),
    });
  }

  save(db);
  renderDaily();
  renderItems();
  renderDashboard();
  renderReport();
  alert("일일 마감 저장 완료");
});

const dHistTbody = $("d-tbody");
if (dHistTbody) dHistTbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  if (btn.dataset.act === "del") {
    if (!confirm("해당 일일 기록을 삭제할까요?")) return;
    deleteRecord("daily", btn.dataset.id);
    save(db);
    renderDaily();
    renderItems();
    renderDashboard();
    renderReport();
  }
});

/* ---------- 4) Inbound ---------- */



function renderInbound() {
  $("in-date").value = $("in-date").value || todayStr();

  const list = db.inbound
    .slice()
    .sort((a,b)=> parseDay(b.date)-parseDay(a.date) || (b.createdAt||0)-(a.createdAt||0));

  const tbody = $("in-tbody");
  tbody.innerHTML = "";
  for (const r of list) {
    const it = findItem(r.itemId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="nowrap">${r.date}</td>
      <td>${escapeHtml(it?.name || "알 수 없음")}</td>
      <td class="right">${fmt(r.qty)}</td>
      <td class="right">${money(r.unitCost)}</td>
      <td class="right">${money((Number(r.qty)||0)*(Number(r.unitCost)||0))}</td>
      <td>${escapeHtml(r.memo || "")}</td>
      <td class="actions">
        <button data-act="del" data-id="${r.id}">삭제</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="muted">입고 기록 없음</td>`;
    tbody.appendChild(tr);
  }
}

$("in-save-btn").addEventListener("click", () => {
  const date = $("in-date").value;
  const itemId = $("in-item").value;
  const qty = Number($("in-qty").value);
  const unitCost = Number($("in-unit-cost").value);
  const memo = $("in-memo").value.trim();

  if (!date) return alert("날짜를 선택하세요.");
  if (!itemId) return alert("품목을 선택하세요.");
  if (!Number.isFinite(qty) || qty <= 0) return alert("입고 수량은 1 이상의 숫자만 가능합니다.");
  if (!Number.isFinite(unitCost) || unitCost < 0) return alert("입고 단가는 0 이상의 숫자만 가능합니다.");

  db.inbound.unshift({
    id: uid(),
    date,
    itemId,
    qty,
    unitCost,
    memo,
    createdAt: Date.now(),
  });

  save(db);
  $("in-qty").value = "";
  $("in-unit-cost").value = "";
  $("in-memo").value = "";
  renderInbound();
  renderDashboard();
});

$("in-tbody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  if (btn.dataset.act === "del") {
    if (!confirm("해당 입고 기록을 삭제할까요?")) return;
    db.inbound = db.inbound.filter((x) => x.id !== btn.dataset.id);
    save(db);
    renderInbound();
    renderDashboard();
  }

/* ---------- 4.5) Outbound (사용) ---------- */

function renderOutbound() {
  const outDate = $("out-date");
  if (outDate) outDate.value = outDate.value || todayStr();

  const list = (db.outbound || [])
    .slice()
    .sort((a,b)=> parseDay(b.date)-parseDay(a.date) || (b.createdAt||0)-(a.createdAt||0));

  const tbody = $("out-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  for (const r of list) {
    const it = findItem(r.itemId);
    const amt = (Number(r.qty)||0) * (Number(r.unitCostSnapshot)||0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="nowrap">${r.date}</td>
      <td>${escapeHtml(it?.name || "알 수 없음")}</td>
      <td class="right">${fmt(r.qty)}</td>
      <td class="right">${money(r.unitCostSnapshot)}</td>
      <td class="right">${money(amt)}</td>
      <td>${escapeHtml(r.memo || "")}</td>
      <td class="actions"><button data-act="del" data-id="${r.id}">삭제</button></td>
    `;
    tbody.appendChild(tr);
  }
  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="muted">출고 기록 없음</td>`;
    tbody.appendChild(tr);
  }
}

const outSaveBtn = $("out-save-btn");
if (outSaveBtn) outSaveBtn.addEventListener("click", () => {
  const date = $("out-date")?.value;
  const itemId = $("out-item")?.value;
  const qty = Number($("out-qty")?.value);
  const memo = ($("out-memo")?.value || "").trim();

  if (!date) return alert("날짜를 선택하세요.");
  if (!itemId) return alert("품목을 선택하세요.");
  if (!Number.isFinite(qty) || qty <= 0) return alert("사용 수량은 1 이상의 숫자만 가능합니다.");

  // 단가 스냅샷: 마지막 입고 단가(기존 단가 방식 유지)
  const unitCostSnapshot = lastInboundUnitCostBefore(itemId, date);

  db.outbound.unshift({
    id: uid(),
    date,
    itemId,
    qty,
    unitCostSnapshot,
    memo,
    createdAt: Date.now(),
  });

  save(db);
  if ($("out-qty")) $("out-qty").value = "";
  if ($("out-memo")) $("out-memo").value = "";
  renderOutbound();
  renderDashboard();
  renderReport();
});

const outTbody = $("out-tbody");
if (outTbody) outTbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  if (btn.dataset.act === "del") {
    if (!confirm("해당 출고 기록을 삭제할까요?")) return;
    db.outbound = (db.outbound || []).filter((x) => x.id !== btn.dataset.id);
    save(db);
    renderOutbound();
    renderDashboard();
    renderReport();
  }
});


});

/* ---------- 5) Weekly (B) ---------- */

function renderWeekly() {
  $("w-date").value = $("w-date").value || todayStr();

  const list = db.records.weekly
    .slice()
    .sort((a,b)=> parseDay(b.date)-parseDay(a.date) || (b.createdAt||0)-(a.createdAt||0));

  const tbody = $("w-tbody");
  tbody.innerHTML = "";
  for (const r of list) {
    const it = findItem(r.itemId);
    const reco = Number(it?.recommended) || 0;
    const shortage = Math.max(reco - (Number(r.stock)||0), 0);
    const lackReco = shortage > 0;
    const need = (Number(r.stock)||0) < (Number(it?.safety)||0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="nowrap">${r.date}</td>
      <td>${escapeHtml(it?.name || "알 수 없음")}</td>
      <td class="right">${fmt(r.stock)}</td>
      <td class="right">${fmt(shortage)}</td>
      <td class="nowrap">${lackReco ? `<span class="pill warn">부족</span>` : `<span class="pill ok">정상</span>`}</td>
      <td class="nowrap">${need ? `<span class="pill danger">필요</span>` : `<span class="pill ok">아님</span>`}</td>
      <td class="actions"><button data-act="del" data-id="${r.id}">삭제</button></td>
    `;
    tbody.appendChild(tr);
  }
  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="muted">기록 없음</td>`;
    tbody.appendChild(tr);
  }
}

$("w-save-btn").addEventListener("click", () => {
  const date = $("w-date").value;
  const itemId = $("w-item").value;
  const stock = Number($("w-stock").value);

  if (!date) return alert("날짜를 선택하세요.");
  if (!itemId) return alert("품목을 선택하세요.");
  if (!Number.isFinite(stock) || stock < 0) return alert("재고는 0 이상의 숫자만 가능합니다.");

  const { usage, cost, unitCostSnapshot, err } = calcUsageCostErr(itemId, date, stock);

  db.records.weekly.unshift({
    id: uid(),
    date,
    itemId,
    stock,
    usage,
    cost,
    unitCostSnapshot,
    err,
    createdAt: Date.now(),
  });

  save(db);
  $("w-stock").value = "";
  renderWeekly();
  renderItems();
  renderDashboard();
});

$("w-tbody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  if (btn.dataset.act === "del") {
    if (!confirm("해당 주간 점검 기록을 삭제할까요?")) return;
    deleteRecord("weekly", btn.dataset.id);
    renderWeekly();
    renderItems();
    renderDashboard();
  }
});

/* ---------- 6) Monthly (C) ---------- */

function renderMonthly() {
  $("m-date").value = $("m-date").value || todayStr();

  const list = db.records.monthly
    .slice()
    .sort((a,b)=> parseDay(b.date)-parseDay(a.date) || (b.createdAt||0)-(a.createdAt||0));

  const tbody = $("m-tbody");
  tbody.innerHTML = "";
  for (const r of list) {
    const it = findItem(r.itemId);
    const reco = Number(it?.recommended) || 0;
    const shortage = Math.max(reco - (Number(r.stock)||0), 0);
    const need = (Number(r.stock)||0) < (Number(it?.safety)||0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="nowrap">${r.date}</td>
      <td>${escapeHtml(it?.name || "알 수 없음")}</td>
      <td class="right">${fmt(r.stock)}</td>
      <td class="right">${fmt(shortage)}</td>
      <td class="nowrap">${need ? `<span class="pill danger">필요</span>` : `<span class="pill ok">아님</span>`}</td>
      <td class="actions"><button data-act="del" data-id="${r.id}">삭제</button></td>
    `;
    tbody.appendChild(tr);
  }
  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" class="muted">기록 없음</td>`;
    tbody.appendChild(tr);
  }
}

$("m-save-btn").addEventListener("click", () => {
  const date = $("m-date").value;
  const itemId = $("m-item").value;
  const stock = Number($("m-stock").value);

  if (!date) return alert("날짜를 선택하세요.");
  if (!itemId) return alert("품목을 선택하세요.");
  if (!Number.isFinite(stock) || stock < 0) return alert("재고는 0 이상의 숫자만 가능합니다.");

  const { usage, cost, unitCostSnapshot, err } = calcUsageCostErr(itemId, date, stock);

  db.records.monthly.unshift({
    id: uid(),
    date,
    itemId,
    stock,
    usage,
    cost,
    unitCostSnapshot,
    err,
    createdAt: Date.now(),
  });

  save(db);
  $("m-stock").value = "";
  renderMonthly();
  renderItems();
  renderDashboard();
});

$("m-tbody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  if (btn.dataset.act === "del") {
    if (!confirm("해당 월간 점검 기록을 삭제할까요?")) return;
    deleteRecord("monthly", btn.dataset.id);
    renderMonthly();
    renderItems();
    renderDashboard();
  }
});

/* ---------- 7) Orders ---------- */

function renderOrders() {
  const gradeF = $("o-grade").value;
  const activeF = $("o-active").value;

  const list = db.items
    .filter((x) => gradeF === "all" ? true : x.grade === gradeF)
    .filter((x) => activeF === "all" ? true : x.active)
    .map((x) => {
      const cur = currentStock(x.id);
      const safety = Number(x.safety)||0;
      const reco = Number(x.recommended)||0;
      const recommendQty = Math.max(reco - cur, 0);
      const pack = Number(x.orderPack)||1;
      const boxes = pack > 0 ? Math.ceil(recommendQty / pack) : 0;
      const need = cur < safety;
      return { item: x, cur, safety, reco, recommendQty, boxes, need };
    })
    .sort((a,b)=> (b.need - a.need) || (a.item.grade.localeCompare(b.item.grade)) || (a.item.name.localeCompare(b.item.name)));

  const tbody = $("o-tbody");
  tbody.innerHTML = "";
  for (const r of list) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.item.name)}</td>
      <td>${r.item.grade}</td>
      <td class="right">${fmt(r.cur)}</td>
      <td class="right">${fmt(r.safety)}</td>
      <td class="right">${fmt(r.reco)}</td>
      <td class="right">${fmt(r.recommendQty)}</td>
      <td class="right">${fmt(r.boxes)}</td>
      <td>${r.need ? `<span class="pill danger">발주 필요</span>` : `<span class="pill ok">정상</span>`}</td>
    `;
    tbody.appendChild(tr);
  }
  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8" class="muted">표시할 항목 없음</td>`;
    tbody.appendChild(tr);
  }
}

$("o-refresh-btn").addEventListener("click", renderOrders);
$("o-grade").addEventListener("change", renderOrders);
$("o-active").addEventListener("change", renderOrders);

/* ---------- 8) Report ---------- */


function reportAgg(ym) {
  const byItem = new Map();

  const recs = [...db.records.daily, ...db.records.weekly, ...db.records.monthly].filter((r)=>inMonth(r.date, ym));
  for (const r of recs) {
    const cur = byItem.get(r.itemId) || { usage: 0, cost: 0 };
    cur.usage += Number(r.usage) || 0;
    cur.cost += Number(r.cost) || 0;
    byItem.set(r.itemId, cur);
  }

  // 출고(사용) 기록을 월 사용량/비용에 포함(재고 방식은 유지)
  const outs = (db.outbound || []).filter((r)=>inMonth(r.date, ym));
  for (const r of outs) {
    const cur = byItem.get(r.itemId) || { usage: 0, cost: 0 };
    cur.usage += Number(r.qty) || 0;
    cur.cost += (Number(r.qty)||0) * (Number(r.unitCostSnapshot)||0);
    byItem.set(r.itemId, cur);
  }

  return byItem;
}

function renderReport() {
  const ym = $("r-month").value || monthStr();
  $("r-month").value = ym;

  const pm = prevMonth(ym);
  const cur = reportAgg(ym);
  const prev = reportAgg(pm);

  const rows = db.items
    .filter((x)=>x.active)
    .map((it)=> {
      const c = cur.get(it.id) || { usage: 0, cost: 0 };
      const p = prev.get(it.id) || { usage: 0, cost: 0 };
      const diff = c.usage - p.usage;
      const curStock = currentStock(it.id);
      const avg7 = avgUsageLast7Days(it.id);
      const days = avg7 > 0 ? (curStock / avg7) : Infinity;
      return { it, usage: c.usage, cost: c.cost, diff, curStock, days };
    })
    .sort((a,b)=> b.cost - a.cost);

  const tbody = $("r-tbody");
  tbody.innerHTML = "";

  for (const r of rows) {
    const diffTxt = r.diff === 0 ? "0" : (r.diff > 0 ? `+${fmt(r.diff)}` : `-${fmt(Math.abs(r.diff))}`);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.it.name)}</td>
      <td>${r.it.grade}</td>
      <td class="right">${fmt(r.usage)}</td>
      <td class="right">${money(r.cost)}</td>
      <td class="right">${diffTxt}</td>
      <td class="right">${fmt(r.curStock)}</td>
      <td class="right">${Number.isFinite(r.days) ? r.days.toFixed(1) : "-"}</td>
    `;
    tbody.appendChild(tr);
  }
  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="muted">데이터 없음</td>`;
    tbody.appendChild(tr);
  }
}

$("r-refresh-btn").addEventListener("click", renderReport);

/* ---------- 백업/복원/초기화 ---------- */

function exportBackup() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `재고백업_${todayStr().replaceAll("-","")}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

async function importBackup(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const obj = JSON.parse(text);
    if (!obj || !Array.isArray(obj.items)) throw new Error("invalid");
    db = obj;
    save(db);
    refreshItemSelects();
    renderDashboard();
    alert("백업 가져오기 완료");
  } catch {
    alert("가져오기 실패: 백업 파일(JSON) 형식을 확인하세요.");
  } finally {
    $("importFile").value = "";
  }
}

$("exportBtn").addEventListener("click", exportBackup);
$("importFile").addEventListener("change", (e) => importBackup(e.target.files[0]));

$("resetBtn").addEventListener("click", () => {
  if (!confirm("정말 초기화할까요? 모든 데이터가 사라집니다.")) return;
  localStorage.removeItem(STORAGE_KEY);
  db = initDb();
  refreshItemSelects();
  clearItemInputs();
  $("d-stock").value = "";
  $("w-stock").value = "";
  $("m-stock").value = "";
  $("in-qty").value = "";
  $("in-unit-cost").value = "";
  $("in-memo").value = "";
  if ($("out-qty")) $("out-qty").value = "";
  if ($("out-memo")) $("out-memo").value = "";
  showPage("dashboard");
});

/* ---------- 초기 렌더 ---------- */

(function boot() {
  // 기본 날짜 세팅
  $("d-date").value = todayStr();
  $("in-date").value = todayStr();
  if ($("out-date")) $("out-date").value = todayStr();
  $("w-date").value = todayStr();
  $("m-date").value = todayStr();
  $("r-month").value = monthStr();

  refreshItemSelects();
  renderDashboard();
  // 첫 화면은 홈
})();