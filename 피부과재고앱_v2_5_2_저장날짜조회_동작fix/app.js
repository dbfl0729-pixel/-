
/* 피부과 재고관리 (심플 v2.5) - 저장/날짜조회/숨김/추가(스크롤선택) */
const STORAGE_KEY = "derm_inventory_simple_v2_5";
const money = (n) => new Intl.NumberFormat("ko-KR").format(Math.round(Number(n||0)));
const todayISO = () => new Date().toISOString().slice(0,10);
const monthISO = (d=new Date()) => d.toISOString().slice(0,7);
const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

const UNITS = ["개","장","kg","g","박스","팩","통","병","세트","기타"];

const SEED_ITEMS = [
  // A 6
  { name:"수분팩", category:"일일 관리", grade:"A", unit:"장" },
  { name:"진정팩", category:"일일 관리", grade:"A", unit:"장" },
  { name:"겔시트팩", category:"일일 관리", grade:"A", unit:"장" },
  { name:"거즈팩", category:"일일 관리", grade:"A", unit:"장" },
  { name:"모델링팩", category:"일일 관리", grade:"A", unit:"kg" },
  { name:"해면", category:"일일 관리", grade:"A", unit:"개" },

  // B 18
  { name:"멸균 거즈", category:"주간 점검", grade:"B", unit:"개" },
  { name:"글러브", category:"주간 점검", grade:"B", unit:"박스" },
  { name:"클렌징 밀크", category:"주간 점검", grade:"B", unit:"통" },
  { name:"클렌징 젤", category:"주간 점검", grade:"B", unit:"통" },
  { name:"토너", category:"주간 점검", grade:"B", unit:"통" },
  { name:"아토베리어 크림", category:"주간 점검", grade:"B", unit:"통" },
  { name:"셀퓨전씨 로션", category:"주간 점검", grade:"B", unit:"통" },
  { name:"셀퓨전씨 크림", category:"주간 점검", grade:"B", unit:"통" },
  { name:"더마소드재생 크림", category:"주간 점검", grade:"B", unit:"통" },
  { name:"선크림", category:"주간 점검", grade:"B", unit:"통" },
  { name:"알로에 젤", category:"주간 점검", grade:"B", unit:"통" },
  { name:"진정 젤", category:"주간 점검", grade:"B", unit:"통" },
  { name:"초음파 겔", category:"주간 점검", grade:"B", unit:"통" },
  { name:"스킨솜", category:"주간 점검", grade:"B", unit:"팩" },
  { name:"거즈", category:"주간 점검", grade:"B", unit:"팩" },
  { name:"GA20", category:"주간 점검", grade:"B", unit:"병" },
  { name:"GA30", category:"주간 점검", grade:"B", unit:"병" },
  { name:"중화제", category:"주간 점검", grade:"B", unit:"병" },

  // C 12
  { name:"팩붓", category:"월간 점검", grade:"C", unit:"개" },
  { name:"스파출라", category:"월간 점검", grade:"C", unit:"개" },
  { name:"코메도 압출기", category:"월간 점검", grade:"C", unit:"개" },
  { name:"유리볼", category:"월간 점검", grade:"C", unit:"개" },
  { name:"카프리가스", category:"월간 점검", grade:"C", unit:"통" },
  { name:"니들 26G", category:"월간 점검", grade:"C", unit:"박스" },
  { name:"면봉", category:"월간 점검", grade:"C", unit:"통" },
  { name:"비타민 앰플 P", category:"월간 점검", grade:"C", unit:"병" },
  { name:"비타민 앰플 V", category:"월간 점검", grade:"C", unit:"병" },
  { name:"2B Aladdin Peeling Powder", category:"월간 점검", grade:"C", unit:"통" },
  { name:"2B Bio Peeling Preparation Pro", category:"월간 점검", grade:"C", unit:"통" },
  { name:"2B Bio Aladdin Peel(수딩 마스크)", category:"월간 점검", grade:"C", unit:"통" },

  // D 12 (쿠팡 주문 목록만)
  { name:"세제", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"섬유유연제", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"퐁퐁", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"아이깨끗해", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"세탁청소가루", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"칫솔", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"매직스펀지", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"수세미", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"세탁망", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"고무줄", category:"쿠팡/청소", grade:"D", unit:"개" },
  { name:"파우더룸용 티슈", category:"쿠팡/청소", grade:"D", unit:"팩" },
  { name:"웨건용 티슈", category:"쿠팡/청소", grade:"D", unit:"팩" },
];

const PATIENT_ITEMS = ["수분팩","진정팩","겔시트팩","거즈팩","모델링팩"]; // 5개만

// 선결제(킵) - 기존 컨셉 유지 (겔시트팩/모델링팩)
const KEEP_CONFIG = {
  sheetmask: {
    name: "겔시트팩(선결제)",
    unit: "장",
    defaultShipQty: 10,
    tiers: [
      { tier: "300장", total_qty: 300, unit_cost: 1300 },
      { tier: "500장", total_qty: 500, unit_cost: 1000 },
    ],
    mapToItemName: "겔시트팩",
  },
  modeling: {
    name: "모델링팩(선결제)",
    unit: "kg",
    defaultShipQty: 1,
    tiers: [{ tier:"100kg", total_qty:100, unit_cost:10000 }],
    mapToItemName: "모델링팩",
  }
};

const load = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
const save = (db) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

const seed = () => {
  const items = SEED_ITEMS.map((it, idx) => ({
    id: idx + 1,
    name: it.name,
    category: it.category,
    grade: it.grade,
    unit: it.unit,
    recommended: 0,
    active: true,
    hidden: false,     // "숨김": 운영 화면에서만 제외
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  return {
    version: "2.5",
    items,
    // records
    dailyA: {},           // {date:{itemId:{close_stock, direct_use, memo}}}
    weeklyB: {},          // {date:{itemId:{stock,memo}}}
    monthlyC: {},         // {date:{itemId:{stock,memo}}}
    inbound: [],          // {id,date,itemId,qty,unit_cost,memo,voided}
    patients: {},         // {date:{count:number}}
    keep: {
      sheetmask: { tier:"300장", prepaid_total:300, unit_cost:1300, shipped_out:0 },
      modeling: { tier:"100kg", prepaid_total:100, unit_cost:10000, shipped_out:0 },
    },
    ordersD: {},          // {date:{itemId:true}} 체크 형태 (주문일 표시)
  };
};

let db = load() || seed();
save(db);

// UI helpers
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));
const el = (tag, attrs={}, children=[]) => {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) e.appendChild(c);
  return e;
};

const byId = (id) => db.items.find(x => x.id === id);
const findItemByName = (name) => db.items.find(x => x.name === name);

const TABS = [
  { key:"dashboard", label:"대시보드" },
  { key:"dailyA",    label:"일일(A)" },
  { key:"weeklyB",   label:"주간(B)" },
  { key:"monthlyC",  label:"월간(C)" },
  { key:"inbound",   label:"입고" },
  { key:"keep",      label:"선결제(킵)" },
  { key:"patients",  label:"환자대비" },
  { key:"ordersD",   label:"쿠팡(D)" },
  { key:"items",     label:"품목" },
];

let activeTab = "dashboard";

function renderTabs() {
  const host = $("#tabs");
  host.innerHTML = "";
  for (const t of TABS) {
    const b = el("button", { class: "tab" + (activeTab === t.key ? " active" : ""), type:"button" });
    b.textContent = t.label;
    b.addEventListener("click", () => { activeTab = t.key; render(); });
    host.appendChild(b);
  }
}

// ---------- Date helpers ----------
function listDates(obj) {
  return Object.keys(obj||{}).sort();
}
function lastSavedDate(obj) {
  const d = listDates(obj);
  return d.length ? d[d.length-1] : "";
}

// ---------- Data logic ----------
function sumInboundByDate(dateISO, itemId) {
  return db.inbound
    .filter(x => !x.voided && x.date === dateISO && x.itemId === itemId)
    .reduce((s,x)=>s+toNum(x.qty),0);
}
function latestStockBefore(dateISO, itemId) {
  // latest close_stock for A, latest weekly stock for B, latest monthly stock for C
  // Uses all records; "현재재고" 기준으로 UI에 필요할 때 활용
  const dA = listDates(db.dailyA);
  let best = null;
  for (const d of dA) {
    if (d <= dateISO) {
      const row = db.dailyA?.[d]?.[itemId];
      if (row && row.close_stock !== "" && row.close_stock != null) best = {date:d, val:toNum(row.close_stock)};
    }
  }
  const dB = listDates(db.weeklyB);
  for (const d of dB) {
    if (d <= dateISO) {
      const row = db.weeklyB?.[d]?.[itemId];
      if (row && row.stock !== "" && row.stock != null) best = {date:d, val:toNum(row.stock)};
    }
  }
  const dC = listDates(db.monthlyC);
  for (const d of dC) {
    if (d <= dateISO) {
      const row = db.monthlyC?.[d]?.[itemId];
      if (row && row.stock !== "" && row.stock != null) best = {date:d, val:toNum(row.stock)};
    }
  }
  return best ? best.val : 0;
}

function calcAUsage(dateISO, itemId) {
  const prevDate = prevDay(dateISO);
  const prevClose = db.dailyA?.[prevDate]?.[itemId]?.close_stock;
  const prev = (prevClose === "" || prevClose == null) ? "" : toNum(prevClose);
  const inbound = sumInboundByDate(dateISO, itemId);
  const close = db.dailyA?.[dateISO]?.[itemId]?.close_stock;
  const closeVal = (close === "" || close == null) ? "" : toNum(close);
  if (prev === "" || closeVal === "") return { prev, inbound, close: closeVal, calcUse:"" };
  const calcUse = prev + inbound - closeVal;
  return { prev, inbound, close: closeVal, calcUse };
}

function prevDay(d) {
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() - 1);
  return dt.toISOString().slice(0,10);
}

function refreshSavedSelect(selectEl, savedDates) {
  // keep placeholder at top
  selectEl.innerHTML = "";
  const opt0 = el("option", { value:"" }); opt0.textContent = "저장된 날짜 선택";
  selectEl.appendChild(opt0);
  const dates = (savedDates||[]).slice().reverse();
  for (const d of dates) {
    const o = el("option", { value:d }); o.textContent = d;
    selectEl.appendChild(o);
  }
}



// ---------- Components ----------
function card(title, inner) {
  const c = el("div", { class:"card" });
  c.appendChild(el("h2", { html: title }));
  c.appendChild(inner);
  return c;
}

function makeDatePickerWithSavedList(currentDate, savedDates, onChange) {
  const dateInput = el("input", { type:"date", value: currentDate });
  const sel = el("select");
  const dates = savedDates.slice().reverse();
  const opt0 = el("option", { value:"" }); opt0.textContent = "저장된 날짜 선택";
  sel.appendChild(opt0);
  for (const d of dates) {
    const o = el("option", { value:d }); o.textContent = d;
    sel.appendChild(o);
  }
  sel.addEventListener("change", () => {
    if (!sel.value) return;
    dateInput.value = sel.value;
    onChange(sel.value);
    sel.value = "";
  });
  dateInput.addEventListener("change", () => onChange(dateInput.value));
  return { dateInput, savedSelect: sel };
}

function itemSelect({ includeInactive=false, includeHidden=false, onlyGrades=null } = {}) {
  const s = el("select");
  const groups = { A:[], B:[], C:[], D:[] };
  for (const it of db.items) {
    if (!includeInactive && !it.active) continue;
    if (!includeHidden && it.hidden) continue;
    if (onlyGrades && !onlyGrades.includes(it.grade)) continue;
    groups[it.grade].push(it);
  }
  const gradeLabel = {A:"A(일일)",B:"B(주간)",C:"C(월간)",D:"D(쿠팡)"};
  for (const g of ["A","B","C","D"]) {
    if (!groups[g].length) continue;
    groups[g].sort((a,b)=>a.name.localeCompare(b.name));
    const og = document.createElement("optgroup");
    og.label = gradeLabel[g];
    for (const it of groups[g]) {
      const o = document.createElement("option");
      o.value = String(it.id);
      o.textContent = it.name;
      og.appendChild(o);
    }
    s.appendChild(og);
  }
  return s;
}

// ---------- Screens ----------
function renderDashboard() {
  const host = el("div");
  const date = todayISO();

  // KPI: today patients and A usage per patient (5 items)
  const patientCount = toNum(db.patients?.[date]?.count || 0);
  const kpi = el("div", { class:"kpi" });

  kpi.appendChild(el("div", { class:"box" , html: `<div class="name">오늘 환자수</div><div class="val">${patientCount ? money(patientCount) : "-"}</div>` }));
  const aRows = [];
  for (const name of PATIENT_ITEMS) {
    const it = findItemByName(name);
    if (!it) continue;
    const { calcUse } = calcAUsage(date, it.id);
    const u = (calcUse===""? "" : toNum(calcUse));
    const per = (patientCount>0 && calcUse!=="") ? (u / patientCount) : "";
    aRows.push({name, u: calcUse===""? "" : u, per});
  }
  const top = aRows
    .filter(x => x.u !== "")
    .sort((a,b)=>b.u - a.u)
    .slice(0,3);

  kpi.appendChild(el("div", { class:"box", html:`<div class="name">A 사용량 TOP3(오늘)</div><div class="val">${top.length ? top.map(x=>`${x.name} ${money(x.u)}`).join("<br>") : "-"}</div>` }));
  const warn = aRows.filter(x => x.per !== "" && x.per >= 1.2); // 임시 기준
  kpi.appendChild(el("div", { class:"box", html:`<div class="name">이상 사용(환자당 ≥1.2)</div><div class="val">${warn.length ? warn.map(x=>`${x.name} ${(x.per).toFixed(2)}`).join("<br>") : "-"}</div>` }));
  kpi.appendChild(el("div", { class:"box", html:`<div class="name">저장된 일일(A) 날짜</div><div class="val">${listDates(db.dailyA).length ? listDates(db.dailyA).slice(-3).join("<br>") : "-"}</div>` }));

  host.appendChild(card("원장 보고 요약(오늘 기준)", kpi));
  host.appendChild(el("div", { class:"mini", html:"대시보드는 입력이 아니라 요약/경고용입니다." }));
  return host;
}

function renderDailyA() {
  const host = el("div");
  const saved = listDates(db.dailyA);
  const initialDate = saved.includes(todayISO()) ? todayISO() : (lastSavedDate(db.dailyA) || todayISO());

  const wrap = el("div");
  const { dateInput, savedSelect } = makeDatePickerWithSavedList(initialDate, saved, (d)=>draw(d));
  const savedBadge = el("span", { class:"chip", html:"미저장" });

  const btnSave = el("button", { class:"btn primary", type:"button" , text:"전체 저장" });
  const btnClear = el("button", { class:"btn", type:"button" , text:"오늘 입력 비우기" });

  const topRow = el("div",{class:"row"},[
    el("label",{},[document.createTextNode("날짜"), dateInput]),
    el("label",{},[document.createTextNode("저장된 날짜"), savedSelect]),
    el("div",{style:"display:flex;gap:8px;align-items:center;margin-left:auto"},[savedBadge, btnClear, btnSave]),
  ]);
  wrap.appendChild(topRow);

  const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead>
    <tr>
      <th>품목</th>
      <th>단위</th>
      <th class="num">전일 실재고</th>
      <th class="num">오늘 입고</th>
      <th class="num">퇴근 실재고(입력)</th>
      <th class="num">직접 사용량(선택)</th>
      <th class="num">계산 사용량</th>
      <th class="num">오차</th>
      <th>검증</th>
      <th>메모</th>
    </tr>
  </thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  const bottom = el("div",{class:"mini", html:"규칙: 계산사용량 = 전일 + 입고 - 퇴근. 직접사용량을 입력하면 오차(계산-직접)를 표시합니다. 음수 사용량은 저장 차단."});
  wrap.appendChild(bottom);

  function draw(dateISO) {
    const items = db.items.filter(x=>x.grade==="A" && x.active && !x.hidden).sort((a,b)=>a.name.localeCompare(b.name));
    const rec = db.dailyA?.[dateISO];
    savedBadge.className = "chip" + (rec ? " ok" : "");
    savedBadge.textContent = rec ? "저장됨" : "미저장";

    tbody.innerHTML = "";
    for (const it of items) {
      const row = db.dailyA?.[dateISO]?.[it.id] || {};
      const close = (row.close_stock ?? "");
      const direct = (row.direct_use ?? "");
      const memo = (row.memo ?? "");

      const { prev, inbound, calcUse } = calcAUsage(dateISO, it.id);
      const prevDisp = (prev === "" ? "-" : money(prev));
      const inDisp = inbound ? money(inbound) : "0";

      const closeInp = el("input",{type:"number", value: close===""? "" : String(close)});
      const directInp = el("input",{type:"number", value: direct===""? "" : String(direct)});
      const memoInp = el("input",{type:"text", value: memo, style:"min-width:220px"});
      const statusTd = el("td");
      const errTd = el("td",{class:"num"});
      const calcTd = el("td",{class:"num"});
      const badgeTd = el("td");

      function refreshComputed() {
        // read current inputs into temp
        const closeVal = closeInp.value === "" ? "" : toNum(closeInp.value);
        const directVal = directInp.value === "" ? "" : toNum(directInp.value);

        // compute
        const prevClose = db.dailyA?.[prevDay(dateISO)]?.[it.id]?.close_stock;
        const prevVal = (prevClose === "" || prevClose == null) ? "" : toNum(prevClose);
        const inb = sumInboundByDate(dateISO, it.id);

        let calc = "";
        let negative = false;
        if (prevVal !== "" && closeVal !== "") {
          calc = prevVal + inb - closeVal;
          if (calc < 0) negative = true;
        }

        calcTd.textContent = (calc === "" ? "-" : money(calc));
        let err = "";
        if (calc !== "" && directVal !== "") err = calc - directVal;
        errTd.textContent = (err === "" ? "-" : money(err));

        // badge
        badgeTd.innerHTML = "";
        let ok = true;
        let label = "정상";
        if (negative) { ok = false; label = "입고누락/재고오류"; }
        else if (err !== "" && err !== 0) { ok = false; label = "불일치"; }
        const chip = el("span",{class:"chip "+(ok?"ok":"bad"), text: label});
        badgeTd.appendChild(chip);

        // row highlight
        tr.style.background = (!ok ? "rgba(255,107,107,.08)" : "");
      }

      const tr = el("tr");
      tr.appendChild(el("td",{text:it.name}));
      tr.appendChild(el("td",{text:it.unit}));
      tr.appendChild(el("td",{class:"num", text: prevDisp}));
      tr.appendChild(el("td",{class:"num", text: inDisp}));
      const tdClose = el("td",{class:"num"}); tdClose.appendChild(closeInp); tr.appendChild(tdClose);
      const tdDirect = el("td",{class:"num"}); tdDirect.appendChild(directInp); tr.appendChild(tdDirect);
      tr.appendChild(calcTd);
      tr.appendChild(errTd);
      tr.appendChild(badgeTd);
      const tdMemo = el("td"); tdMemo.appendChild(memoInp); tr.appendChild(tdMemo);

      closeInp.addEventListener("input", refreshComputed);
      directInp.addEventListener("input", refreshComputed);

      tbody.appendChild(tr);
      refreshComputed();
    }
  }

  btnClear.addEventListener("click", ()=>{
    const d = dateInput.value;
    if (!confirm(`${d} 입력값을 비웁니다. (저장된 데이터도 지워집니다)`)) return;
    delete db.dailyA[d];
    save(db);
    refreshSavedSelect(savedSelect, listDates(db.patients));
    draw(d);
  });

  btnSave.addEventListener("click", ()=>{
    const d = dateInput.value;
    const items = db.items.filter(x=>x.grade==="A" && x.active && !x.hidden).sort((a,b)=>a.name.localeCompare(b.name));
    if (!db.dailyA[d]) db.dailyA[d] = {};
    // validate negative usage
    for (let i=0;i<items.length;i++){
      const it = items[i];
      const tr = tbody.children[i];
      const closeInp = tr.querySelectorAll("input")[0];
      const closeVal = closeInp.value === "" ? "" : toNum(closeInp.value);
      const prevClose = db.dailyA?.[prevDay(d)]?.[it.id]?.close_stock;
      const prevVal = (prevClose === "" || prevClose == null) ? "" : toNum(prevClose);
      const inb = sumInboundByDate(d, it.id);
      if (prevVal !== "" && closeVal !== "") {
        const calc = prevVal + inb - closeVal;
        if (calc < 0) { alert(`저장 불가: ${it.name} 계산 사용량이 음수입니다.\n(전일+입고 < 퇴근재고)`); return; }
      }
    }
    for (let i=0;i<items.length;i++){
      const it = items[i];
      const tr = tbody.children[i];
      const inputs = tr.querySelectorAll("input");
      const closeInp = inputs[0], directInp = inputs[1], memoInp = inputs[2];
      db.dailyA[d][it.id] = {
        close_stock: closeInp.value==="" ? "" : toNum(closeInp.value),
        direct_use: directInp.value==="" ? "" : toNum(directInp.value),
        memo: memoInp.value || "",
        saved_at: new Date().toISOString(),
      };
    }
    save(db);
    refreshSavedSelect(savedSelect, listDates(db.patients));
    draw(d);
    alert("저장 완료");
  });

  draw(initialDate);

  host.appendChild(card("일일 관리(A) — 퇴근 실재고 + 직접 사용량(선택)", wrap));
  return host;
}

function renderCheck(gradeKey, title, storeKey) {
  const host = el("div");
  const savedObj = db[storeKey] || {};
  const saved = listDates(savedObj);
  const initialDate = saved.includes(todayISO()) ? todayISO() : (lastSavedDate(savedObj) || todayISO());

  const wrap = el("div");
  const { dateInput, savedSelect } = makeDatePickerWithSavedList(initialDate, saved, (d)=>draw(d));
  const savedBadge = el("span", { class:"chip", html:"미저장" });
  const btnSave = el("button", { class:"btn primary", type:"button" , text:"저장" });

  wrap.appendChild(el("div",{class:"row"},[
    el("label",{},[document.createTextNode("점검일"), dateInput]),
    el("label",{},[document.createTextNode("저장된 날짜"), savedSelect]),
    el("div",{style:"display:flex;gap:8px;align-items:center;margin-left:auto"},[savedBadge, btnSave]),
  ]));

  const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead>
    <tr>
      <th>품목</th>
      <th>단위</th>
      <th class="num">권장</th>
      <th class="num">현재 재고(입력)</th>
      <th class="num">부족</th>
      <th>상태</th>
      <th>메모</th>
    </tr>
  </thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  function draw(dateISO) {
    const items = db.items.filter(x=>x.grade===gradeKey && x.active && !x.hidden).sort((a,b)=>a.name.localeCompare(b.name));
    const rec = savedObj?.[dateISO];
    savedBadge.className = "chip" + (rec ? " ok" : "");
    savedBadge.textContent = rec ? "저장됨" : "미저장";

    tbody.innerHTML="";
    for (const it of items) {
      const row = savedObj?.[dateISO]?.[it.id] || {};
      const stock = (row.stock ?? "");
      const memo = (row.memo ?? "");
      const stockInp = el("input",{type:"number", value: stock===""? "" : String(stock)});
      const memoInp = el("input",{type:"text", value:memo, style:"min-width:220px"});
      const recVal = toNum(it.recommended||0);
      const shortageTd = el("td",{class:"num"});
      const statusTd = el("td");

      function refresh() {
        const cur = stockInp.value===""? "" : toNum(stockInp.value);
        const shortage = (cur==="" || recVal===0) ? "" : Math.max(recVal-cur,0);
        shortageTd.textContent = shortage==="" ? "-" : money(shortage);

        statusTd.innerHTML="";
        let ok = true; let label="정상";
        if (recVal===0) { label="권장 없음"; ok=true; }
        else if (cur!=="" && cur < recVal) { label="권장 미달"; ok=false; }
        const chip = el("span",{class:"chip "+(ok?"ok":"bad"), text:label});
        statusTd.appendChild(chip);
        tr.style.background = (!ok ? "rgba(255,107,107,.08)" : "");
      }

      const tr = el("tr");
      tr.appendChild(el("td",{text:it.name}));
      tr.appendChild(el("td",{text:it.unit}));
      tr.appendChild(el("td",{class:"num", text: recVal?money(recVal):"-"}));
      const tdStock=el("td",{class:"num"}); tdStock.appendChild(stockInp); tr.appendChild(tdStock);
      tr.appendChild(shortageTd);
      tr.appendChild(statusTd);
      const tdMemo=el("td"); tdMemo.appendChild(memoInp); tr.appendChild(tdMemo);

      stockInp.addEventListener("input", refresh);
      tbody.appendChild(tr);
      refresh();
    }
  }

  btnSave.addEventListener("click", ()=>{
    const d=dateInput.value;
    const items = db.items.filter(x=>x.grade===gradeKey && x.active && !x.hidden).sort((a,b)=>a.name.localeCompare(b.name));
    if (!savedObj[d]) savedObj[d] = {};
    for (let i=0;i<items.length;i++){
      const it=items[i];
      const tr=tbody.children[i];
      const inputs = tr.querySelectorAll("input");
      const stockInp=inputs[0], memoInp=inputs[1];
      savedObj[d][it.id] = { stock: stockInp.value===""?"":toNum(stockInp.value), memo: memoInp.value||"", saved_at:new Date().toISOString() };
    }
    db[storeKey]=savedObj;
    save(db);
    refreshSavedSelect(savedSelect, listDates(db.patients));
    draw(d);
    alert("저장 완료");
  });

  draw(initialDate);
  host.appendChild(card(title, wrap));
  return host;
}

function renderInbound() {
  const host = el("div");
  const wrap = el("div");

  const dateInp = el("input", { type:"date", value: todayISO() });
  const itemSel = itemSelect({ includeInactive:false, includeHidden:true, onlyGrades:["A","B","C"] }); // D는 입고 대상 아님(쿠팡은 주문)
  const qtyInp = el("input", { type:"number", value:"" });
  const costInp = el("input", { type:"number", value:"" });
  const memoInp = el("input", { type:"text", value:"", style:"min-width:220px" });
  const btnAdd = el("button", { class:"btn primary", type:"button", text:"추가" });

  wrap.appendChild(el("div",{class:"row"},[
    el("label",{},[document.createTextNode("입고일"), dateInp]),
    el("label",{},[document.createTextNode("품목(스크롤 선택)"), itemSel]),
    el("label",{},[document.createTextNode("수량"), qtyInp]),
    el("label",{},[document.createTextNode("단가(선택)"), costInp]),
    el("label",{},[document.createTextNode("메모"), memoInp]),
    el("div",{style:"margin-left:auto"},[btnAdd]),
  ]));

  const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead>
    <tr>
      <th>일자</th><th>품목</th><th class="num">수량</th><th class="num">단가</th><th class="num">합계</th><th>상태</th><th>작업</th>
    </tr>
  </thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  function draw() {
    tbody.innerHTML="";
    const rows = db.inbound.slice().sort((a,b)=>(a.date.localeCompare(b.date))|| (a.id-b.id));
    for (const r of rows) {
      const it = byId(r.itemId);
      const sum = (toNum(r.qty) * toNum(r.unit_cost||0));
      const tr = el("tr");
      tr.appendChild(el("td",{text:r.date}));
      tr.appendChild(el("td",{text: it ? it.name : "(삭제된 품목)"}));
      tr.appendChild(el("td",{class:"num", text: money(r.qty)}));
      tr.appendChild(el("td",{class:"num", text: r.unit_cost ? money(r.unit_cost) : "-"}));
      tr.appendChild(el("td",{class:"num", text: r.unit_cost ? money(sum) : "-"}));
      tr.appendChild(el("td",{html: r.voided ? `<span class="chip">VOID</span>` : `<span class="chip ok">정상</span>`}));
      const tdAct = el("td");
      const btnVoid = el("button",{class:"btn",type:"button"}); btnVoid.textContent = r.voided ? "복구" : "취소";
      btnVoid.addEventListener("click", ()=>{
        r.voided = !r.voided;
        r.updated_at = new Date().toISOString();
        save(db); draw();
      });
      tdAct.appendChild(btnVoid);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    }
  }

  btnAdd.addEventListener("click", ()=>{
    const date = dateInp.value || todayISO();
    const itemId = toNum(itemSel.value);
    const qty = toNum(qtyInp.value);
    if (!itemId) { alert("품목을 선택하세요."); return; }
    if (!qty || qty <= 0) { alert("수량을 입력하세요."); return; }
    const unit_cost = costInp.value==="" ? "" : toNum(costInp.value);
    db.inbound.push({
      id: Date.now(),
      date,
      itemId,
      qty,
      unit_cost,
      memo: memoInp.value||"",
      voided:false,
      created_at:new Date().toISOString(),
      updated_at:new Date().toISOString(),
    });
    save(db);
    qtyInp.value=""; costInp.value=""; memoInp.value="";
    draw();
  });

  draw();
  host.appendChild(card("입고(Inbound) — 품목은 스크롤로 선택", wrap));
  host.appendChild(el("div",{class:"mini", html:"삭제 대신 취소(VOID)로 남깁니다. (월보고/사용량 해석이 흔들리지 않도록)"}));
  return host;
}

function renderPatients() {
  const host = el("div");
  const saved = listDates(db.patients);
  const initialDate = saved.includes(todayISO()) ? todayISO() : (lastSavedDate(db.patients) || todayISO());

  const wrap = el("div");
  const { dateInput, savedSelect } = makeDatePickerWithSavedList(initialDate, saved, (d)=>draw(d));
  const savedBadge = el("span",{class:"chip", text:"미저장"});
  const btnSave = el("button",{class:"btn primary",type:"button",text:"저장"});
  const patientInput = el("input",{type:"number"});
  wrap.appendChild(el("div",{class:"row"},[
    el("label",{},[document.createTextNode("날짜"), dateInput]),
    el("label",{},[document.createTextNode("저장된 날짜"), savedSelect]),
    el("label",{},[document.createTextNode("환자수"), patientInput]),
    el("div",{style:"margin-left:auto;display:flex;gap:8px;align-items:center"},[savedBadge, btnSave]),
  ]));
const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead><tr>
    <th>품목</th><th class="num">오늘 사용량(계산)</th><th class="num">환자수</th><th class="num">환자당 사용</th><th>상태</th>
  </tr></thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  function draw(d) {
    const rec = db.patients?.[d];
    savedBadge.className = "chip" + (rec ? " ok" : "");
    savedBadge.textContent = rec ? "저장됨" : "미저장";
    patientInput.value = rec?.count ?? "";

    const patientCount = toNum(rec?.count || 0);
    tbody.innerHTML="";
    for (const name of PATIENT_ITEMS) {
      const it = findItemByName(name);
      if (!it) continue;
      const { calcUse } = calcAUsage(d, it.id);
      const u = (calcUse===""? "" : toNum(calcUse));
      const per = (patientCount>0 && calcUse!=="") ? (u / patientCount) : "";
      const tr = el("tr");
      tr.appendChild(el("td",{text:name}));
      tr.appendChild(el("td",{class:"num", text: calcUse===""? "-" : money(u)}));
      tr.appendChild(el("td",{class:"num", text: patientCount? money(patientCount):"-"}));
      tr.appendChild(el("td",{class:"num", text: per===""? "-" : per.toFixed(2)}));
      const warn = (per!=="" && per>=1.2);
      tr.appendChild(el("td",{html: warn? `<span class="chip bad">이상</span>` : `<span class="chip ok">정상</span>`}));
      tr.style.background = warn ? "rgba(255,107,107,.08)" : "";
      tbody.appendChild(tr);
    }
  }

  btnSave.addEventListener("click", ()=>{
    const d = dateInput.value;
    const c = patientInput.value==="" ? "" : toNum(patientInput.value);
    if (c === "" || c <= 0) { alert("환자수를 입력하세요."); return; }
    db.patients[d] = { count:c, saved_at:new Date().toISOString() };
    save(db);
    refreshSavedSelect(savedSelect, listDates(db.patients));
    draw(d);
    alert("저장 완료");
  });

  draw(initialDate);
  host.appendChild(card("환자 대비 사용량(5개 품목)", wrap));
  host.appendChild(el("div",{class:"mini", html:"환자수는 날짜별로 저장됩니다. 사용량은 일일(A) 기록에서 자동 계산됩니다."}));
  return host;
}

function renderKeep() {
  const host = el("div");
  const wrap = el("div");

  const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead><tr>
    <th>품목</th><th>티어</th><th class="num">선결제 총량</th><th class="num">단가</th>
    <th class="num">누적 출고</th><th class="num">잔량</th><th class="num">출고(입력)</th><th>작업</th>
  </tr></thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  function draw() {
    tbody.innerHTML="";
    for (const key of Object.keys(KEEP_CONFIG)) {
      const cfg = KEEP_CONFIG[key];
      const k = db.keep[key];
      const remaining = toNum(k.prepaid_total) - toNum(k.shipped_out);
      const shipInp = el("input",{type:"number", value:""});
      const btnShip = el("button",{class:"btn primary",type:"button"}); btnShip.textContent="출고 반영";
      btnShip.addEventListener("click", ()=>{
        const q = toNum(shipInp.value);
        if (!q || q<=0) { alert("출고 수량을 입력하세요."); return; }
        if (q > remaining) { alert("출고 수량이 잔량보다 큽니다."); return; }
        k.shipped_out = toNum(k.shipped_out) + q;
        save(db);
        shipInp.value="";
        draw();
      });

      const tr = el("tr");
      tr.appendChild(el("td",{text:cfg.name}));
      tr.appendChild(el("td",{text:k.tier}));
      tr.appendChild(el("td",{class:"num",text:money(k.prepaid_total)}));
      tr.appendChild(el("td",{class:"num",text:money(k.unit_cost)}));
      tr.appendChild(el("td",{class:"num",text:money(k.shipped_out)}));
      tr.appendChild(el("td",{class:"num",text:money(remaining)}));
      const tdInp=el("td",{class:"num"}); tdInp.appendChild(shipInp); tr.appendChild(tdInp);
      const tdAct=el("td"); tdAct.appendChild(btnShip); tr.appendChild(tdAct);
      tbody.appendChild(tr);
    }
  }
  draw();
  host.appendChild(card("선결제(킵) — 잔량은 출고 누적으로 자동 계산", wrap));
  host.appendChild(el("div",{class:"mini", html:"선결제 잔량을 매번 입력하지 않습니다. '출고 반영'만 누적하면 잔량이 자동으로 계산됩니다."}));
  return host;
}

function renderOrdersD() {
  const host = el("div");
  const saved = listDates(db.ordersD);
  const initialDate = saved.includes(todayISO()) ? todayISO() : (todayISO());

  const wrap = el("div");
  const { dateInput, savedSelect } = makeDatePickerWithSavedList(initialDate, saved, (d)=>draw(d));
  const btnSave = el("button",{class:"btn primary",type:"button",text:"저장"});
  wrap.appendChild(el("div",{class:"row"},[
    el("label",{},[document.createTextNode("주문일"), dateInput]),
    el("label",{},[document.createTextNode("저장된 날짜"), savedSelect]),
    el("div",{style:"margin-left:auto"},[btnSave]),
  ]));

  const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead><tr><th>품목</th><th>체크</th><th>메모</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  function draw(d){
    const items = db.items.filter(x=>x.grade==="D" && x.active && !x.hidden).sort((a,b)=>a.name.localeCompare(b.name));
    tbody.innerHTML="";
    for (const it of items) {
      const checked = !!db.ordersD?.[d]?.[it.id]?.checked;
      const memo = db.ordersD?.[d]?.[it.id]?.memo || "";
      const chk = el("input",{type:"checkbox"});
      chk.checked = checked;
      const memoInp = el("input",{type:"text", value:memo, style:"min-width:260px"});
      const tr = el("tr");
      tr.appendChild(el("td",{text:it.name}));
      const tdChk = el("td"); tdChk.appendChild(chk); tr.appendChild(tdChk);
      const tdMemo = el("td"); tdMemo.appendChild(memoInp); tr.appendChild(tdMemo);
      tbody.appendChild(tr);
    }
  }

  btnSave.addEventListener("click", ()=>{
    const d=dateInput.value;
    const items = db.items.filter(x=>x.grade==="D" && x.active && !x.hidden).sort((a,b)=>a.name.localeCompare(b.name));
    if (!db.ordersD[d]) db.ordersD[d] = {};
    for (let i=0;i<items.length;i++){
      const it=items[i];
      const tr=tbody.children[i];
      const chk = tr.querySelector("input[type=checkbox]");
      const memoInp = tr.querySelector("input[type=text]");
      db.ordersD[d][it.id] = { checked: !!chk.checked, memo: memoInp.value||"" };
    }
    save(db);
    refreshSavedSelect(savedSelect, listDates(db.ordersD));
    alert("저장 완료");
  });

  draw(initialDate);
  host.appendChild(card("쿠팡(D) — 재고관리 X, 주문한 날만 체크", wrap));
  host.appendChild(el("div",{class:"mini", html:"파우더/청소 소모품은 재고 수량을 관리하지 않고, 주문일 기록만 남깁니다."}));
  return host;
}

function renderItems() {
  const host = el("div");
  const wrap = el("div");

  const gradeSel = el("select");
  ["전체","A","B","C","D"].forEach(v=>{ const o=document.createElement("option"); o.value=v; o.textContent=(v==="전체"?"전체":"등급 "+v); gradeSel.appendChild(o); });
  const statusSel = el("select");
  [["all","전체"],["active","Active"],["inactive","Inactive"]].forEach(([v,t])=>{ const o=document.createElement("option"); o.value=v; o.textContent=t; statusSel.appendChild(o); });
  const hideSel = el("select");
  [["all","전체"],["shown","표시"],["hidden","숨김"]].forEach(([v,t])=>{ const o=document.createElement("option"); o.value=v; o.textContent=t; hideSel.appendChild(o); });

  const btnAdd = el("button",{class:"btn primary",type:"button",text:"품목 추가"});
  wrap.appendChild(el("div",{class:"row"},[
    el("label",{},[document.createTextNode("등급"), gradeSel]),
    el("label",{},[document.createTextNode("활성"), statusSel]),
    el("label",{},[document.createTextNode("숨김"), hideSel]),
    el("div",{style:"margin-left:auto"},[btnAdd]),
  ]));

  const tableWrap = el("div",{class:"table-wrap"});
  const table = el("table");
  table.innerHTML = `<thead><tr>
    <th>품목명</th><th>카테고리</th><th>등급</th><th>단위</th>
    <th class="num">권장</th><th>Active</th><th>숨김</th><th>작업</th>
  </tr></thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);

  function draw() {
    let items = db.items.slice();
    if (gradeSel.value!=="전체") items = items.filter(x=>x.grade===gradeSel.value);
    if (statusSel.value==="active") items = items.filter(x=>x.active);
    if (statusSel.value==="inactive") items = items.filter(x=>!x.active);
    if (hideSel.value==="shown") items = items.filter(x=>!x.hidden);
    if (hideSel.value==="hidden") items = items.filter(x=>x.hidden);
    items.sort((a,b)=>a.grade.localeCompare(b.grade) || (a.category||"").localeCompare(b.category||"") || a.name.localeCompare(b.name));

    tbody.innerHTML="";
    for (const it of items) {
      const tr = el("tr");
      tr.appendChild(el("td",{text:it.name}));
      tr.appendChild(el("td",{text:it.category}));
      tr.appendChild(el("td",{html:`<span class="chip">${it.grade}</span>`}));
      tr.appendChild(el("td",{text:it.unit}));
      tr.appendChild(el("td",{class:"num",text: it.recommended? money(it.recommended):"-"}));
      tr.appendChild(el("td",{html: it.active? `<span class="chip ok">Active</span>`:`<span class="chip">Inactive</span>`}));
      tr.appendChild(el("td",{html: it.hidden? `<span class="chip">숨김</span>`:`<span class="chip ok">표시</span>`}));

      const tdAct = el("td");
      const btnEdit = el("button",{class:"btn",type:"button"}); btnEdit.textContent="수정";
      const btnToggleActive = el("button",{class:"btn",type:"button"}); btnToggleActive.textContent = it.active? "비활성":"복구";
      const btnToggleHide = el("button",{class:"btn",type:"button"}); btnToggleHide.textContent = it.hidden? "표시":"숨김";

      btnEdit.addEventListener("click", ()=>openItemModal(it));
      btnToggleActive.addEventListener("click", ()=>{ it.active=!it.active; it.updated_at=new Date().toISOString(); save(db); draw(); });
      btnToggleHide.addEventListener("click", ()=>{ it.hidden=!it.hidden; it.updated_at=new Date().toISOString(); save(db); draw(); });

      tdAct.appendChild(btnEdit); tdAct.appendChild(btnToggleActive); tdAct.appendChild(btnToggleHide);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    }
  }

  function openItemModal(it=null) {
    const isNew = !it;
    const overlay = el("div",{style:"position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:14px"});
    const box = el("div",{style:"width:min(720px,100%);background:rgba(12,20,38,.98);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px"});
    box.appendChild(el("div",{style:"display:flex;justify-content:space-between;align-items:center;gap:10px"},[
      el("div",{html:`<b>${isNew?"품목 추가":"품목 수정"}</b><div class="mini">이름은 직접 입력(신규일 때 1회). 나머지는 스크롤 선택.</div>`}),
      (()=>{ const b=el("button",{class:"btn",type:"button",text:"닫기"}); b.onclick=()=>overlay.remove(); return b; })()
    ]));

    const nameInp = el("input",{type:"text",value: it?it.name:"", style:"min-width:240px"});
    const catInp = el("input",{type:"text",value: it?it.category:"", style:"min-width:240px"});
    const gradeSel = el("select");
    ["A","B","C","D"].forEach(g=>{ const o=document.createElement("option"); o.value=g; o.textContent=g; gradeSel.appendChild(o); });
    gradeSel.value = it?it.grade:"B";

    const unitSel = el("select");
    UNITS.forEach(u=>{ const o=document.createElement("option"); o.value=u; o.textContent=u; unitSel.appendChild(o); });
    unitSel.value = it?it.unit:"개";

    const recInp = el("input",{type:"number",value: it?String(it.recommended||0):"0"});
    const activeChk = el("input",{type:"checkbox"}); activeChk.checked = it? !!it.active : true;
    const hiddenChk = el("input",{type:"checkbox"}); hiddenChk.checked = it? !!it.hidden : false;

    const form = el("div",{class:"row"},[
      el("label",{},[document.createTextNode("품목명(필수)"), nameInp]),
      el("label",{},[document.createTextNode("카테고리"), catInp]),
      el("label",{},[document.createTextNode("등급(스크롤)"), gradeSel]),
      el("label",{},[document.createTextNode("단위(스크롤)"), unitSel]),
      el("label",{},[document.createTextNode("권장재고"), recInp]),
      el("label",{},[document.createTextNode("Active"), activeChk]),
      el("label",{},[document.createTextNode("숨김"), hiddenChk]),
    ]);
    box.appendChild(form);

    const btnSave2 = el("button",{class:"btn primary",type:"button",text:"저장"});
    btnSave2.onclick=()=>{
      const name = (nameInp.value||"").trim();
      if (!name) { alert("품목명은 필수입니다."); return; }
      const cat = (catInp.value||"").trim() || (gradeSel.value==="A"?"일일 관리": gradeSel.value==="B"?"주간 점검": gradeSel.value==="C"?"월간 점검":"쿠팡/청소");
      const rec = toNum(recInp.value);
      if (isNew) {
        const id = Math.max(...db.items.map(x=>x.id))+1;
        db.items.push({
          id, name, category:cat, grade:gradeSel.value, unit:unitSel.value,
          recommended: rec, active: !!activeChk.checked, hidden: !!hiddenChk.checked,
          created_at:new Date().toISOString(), updated_at:new Date().toISOString(),
        });
      } else {
        it.name = name;
        it.category = cat;
        it.grade = gradeSel.value;
        it.unit = unitSel.value;
        it.recommended = rec;
        it.active = !!activeChk.checked;
        it.hidden = !!hiddenChk.checked;
        it.updated_at = new Date().toISOString();
      }
      save(db); draw(); overlay.remove();
    };
    box.appendChild(el("div",{style:"margin-top:12px;display:flex;justify-content:flex-end"},[btnSave2]));
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  btnAdd.addEventListener("click", ()=>openItemModal(null));
  gradeSel.addEventListener("change", draw);
  statusSel.addEventListener("change", draw);
  hideSel.addEventListener("change", draw);

  draw();
  host.appendChild(card("품목 관리 — 삭제 금지(비활성/숨김만)", wrap));
  host.appendChild(el("div",{class:"mini", html:"숨김: 운영 화면(일일/주간/월간/입고/쿠팡)에서만 숨깁니다. 비활성: 데이터는 유지하되 사용하지 않음."}));
  return host;
}

// ---------- Backup / reset ----------
function wireTopButtons() {
  const btnExport = $("#btnExport");
  const btnImport = $("#btnImport");
  const btnReset = $("#btnReset");

  btnExport?.addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(db,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url;
    a.download = `derm_inventory_backup_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnImport?.addEventListener("click", ()=>{
    const inp = document.createElement("input");
    inp.type="file";
    inp.accept="application/json";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      const text = await f.text();
      try {
        const next = JSON.parse(text);
        if (!next || !next.items) throw new Error("invalid");
        db = next;
        save(db);
        render();
        alert("가져오기 완료");
      } catch {
        alert("가져오기 실패: JSON 형식 확인 필요");
      }
    };
    inp.click();
  });

  btnReset?.addEventListener("click", ()=>{
    if (!confirm("초기화하면 모든 기록이 삭제됩니다. 진행?")) return;
    db = seed();
    save(db);
    render();
  });
}

// ---------- Main render ----------
function render() {
  renderTabs();
  const app = $("#app");
  app.innerHTML = "";
  if (activeTab === "dashboard") app.appendChild(renderDashboard());
  else if (activeTab === "dailyA") app.appendChild(renderDailyA());
  else if (activeTab === "weeklyB") app.appendChild(renderCheck("B","주간 점검(B) — 현재 재고 입력", "weeklyB"));
  else if (activeTab === "monthlyC") app.appendChild(renderCheck("C","월간 점검(C) — 현재 재고 입력", "monthlyC"));
  else if (activeTab === "inbound") app.appendChild(renderInbound());
  else if (activeTab === "keep") app.appendChild(renderKeep());
  else if (activeTab === "patients") app.appendChild(renderPatients());
  else if (activeTab === "ordersD") app.appendChild(renderOrdersD());
  else if (activeTab === "items") app.appendChild(renderItems());
}

wireTopButtons();
render();
