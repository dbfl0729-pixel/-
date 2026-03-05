
const STORAGE_KEY = "derm_inventory_simple_v2";
const money = (n) => new Intl.NumberFormat("ko-KR").format(Math.round(Number(n||0)));
const todayISO = () => new Date().toISOString().slice(0,10);
const monthISO = (d=new Date()) => d.toISOString().slice(0,7);
const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

const SEED_ITEMS = [
  // A
  { name:"수분팩", category:"일 관리", grade:"A", unit:"장" },
  { name:"진정팩", category:"일 관리", grade:"A", unit:"장" },
  { name:"겔시트팩", category:"일 관리", grade:"A", unit:"장" },
  { name:"거즈팩", category:"일 관리", grade:"A", unit:"장" },
  { name:"모델링팩", category:"일 관리", grade:"A", unit:"kg" },
  { name:"해면", category:"일 관리", grade:"A", unit:"개" },

  // B (샘플로 일부만; 필요 시 품목 화면에서 추가/수정)
  { name:"멸균 거즈", category:"간 점검", grade:"B", unit:"개" },
  { name:"장갑", category:"간 점검", grade:"B", unit:"박스" },
  { name:"클렌징 밀크", category:"간 점검", grade:"B", unit:"개" },
  { name:"클렌징 젤", category:"간 점검", grade:"B", unit:"개" },
  { name:"토너", category:"간 점검", grade:"B", unit:"개" },
  { name:"아토 크림", category:"간 점검", grade:"B", unit:"개" },
  { name:"셀퓨전씨 로션", category:"간 점검", grade:"B", unit:"개" },
  { name:"셀퓨전씨 크림", category:"간 점검", grade:"B", unit:"개" },
  { name:"재생 크림", category:"간 점검", grade:"B", unit:"개" },
  { name:"선크림", category:"간 점검", grade:"B", unit:"개" },
  { name:"알로에 젤", category:"간 점검", grade:"B", unit:"개" },
  { name:"진정젤", category:"간 점검", grade:"B", unit:"개" },
  { name:"초음파 겔", category:"간 점검", grade:"B", unit:"개" },
  { name:"스킨솜", category:"간 점검", grade:"B", unit:"개" },
  { name:"거즈", category:"간 점검", grade:"B", unit:"개" },
  { name:"GA20", category:"간 점검", grade:"B", unit:"개" },
  { name:"GA30", category:"간 점검", grade:"B", unit:"개" },
  { name:"중화제", category:"간 점검", grade:"B", unit:"개" },
];

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
  const now = new Date().toISOString();
  const items = SEED_ITEMS.map((it, i) => ({
    id: i+1,
    name: it.name,
    category: it.category,
    grade: it.grade,
    base_unit: it.unit,
    active: true,
    base_cost: 0,
  }));
  return {
    version: 2,
    created_at: now,
    updated_at: now,
    items,
    inbound: [],     // {id,date,item_id,qty,unit_cost,memo,type}
    dailyA: {},      // {date:{item_id:{close_qty, manual_use, memo}}}
    patients: {},    // {date:count}
    keep: {
      sheetmask: { tier:"300장", shipped_total:0, hospital_stock:0 },
      modeling:  { tier:"100kg", shipped_total:0, hospital_stock:0 },
    }
  };
};

let db = load() || seed();
save(db);

const $ = (q) => document.querySelector(q);
const el = (tag, attrs={}, children=[]) => {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)){
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) e.appendChild(c);
  return e;
};

const TABS = [
  { key:"dashboard", label:"대시보드" },
  { key:"patients",  label:"환자수" },
  { key:"dailyA",    label:"일일(A)" },
  { key:"inbound",   label:"입고" },
  { key:"keep",      label:"선결제(킵)" },
  { key:"monthly",   label:"월 리포트" },
  { key:"items",     label:"품목" },
];

let activeTab = "dashboard";

const getItemById = (id) => db.items.find(x => x.id === id);
const activeItems = () => db.items.filter(x => x.active);

const prevDateISO = (date) => {
  const d = new Date(date+"T00:00:00");
  d.setDate(d.getDate()-1);
  return d.toISOString().slice(0,10);
};

const sumInboundByDateForItem = (date, item_id) => db.inbound
  .filter(r => r.date === date && r.item_id === item_id)
  .reduce((a,r)=> a + toNum(r.qty), 0);

const latestCloseQty = (date, item_id) => {
  const dates = Object.keys(db.dailyA).filter(d => d <= date).sort();
  for (let i=dates.length-1;i>=0;i--){
    const d = dates[i];
    const row = db.dailyA[d]?.[String(item_id)];
    if (row && row.close_qty !== undefined && row.close_qty !== null && row.close_qty !== "") return toNum(row.close_qty);
  }
  return 0;
};

const latestUnitCost = (item_id) => {
  const costs = db.inbound
    .filter(r => r.item_id === item_id && toNum(r.unit_cost) > 0)
    .sort((a,b)=> (a.date+a.id) < (b.date+b.id) ? -1 : 1);
  return costs.length ? toNum(costs[costs.length-1].unit_cost) : 0;
};

const computeDailyRow = (date, item_id) => {
  const prev = latestCloseQty(prevDateISO(date), item_id);
  const inbound = sumInboundByDateForItem(date, item_id);
  const close = toNum(db.dailyA?.[date]?.[String(item_id)]?.close_qty ?? "");
  const use = (prev + inbound - close);
  const manual = db.dailyA?.[date]?.[String(item_id)]?.manual_use;
  const hasManual = manual !== undefined && manual !== null && String(manual) !== "";
  const manualUse = hasManual ? toNum(manual) : null;
  const diff = hasManual ? (use - manualUse) : null;
  const unit_cost = latestUnitCost(item_id);
  const cost = use * unit_cost;
  return { prev, inbound, close, use, manualUse, diff, unit_cost, cost };
};

const keepRemain = (key) => {
  const cfg = KEEP_CONFIG[key];
  const st = db.keep?.[key] || { tier: cfg.tiers[0].tier, shipped_total: 0 };
  const tier = cfg.tiers.find(x => x.tier === st.tier) || cfg.tiers[0];
  const shipped = toNum(st.shipped_total);
  const remain = Math.max(toNum(tier.total_qty) - shipped, 0);
  return { tier, shipped, remain };
};

const renderTabs = () => {
  const host = $("#tabs");
  host.innerHTML = "";
  for (const t of TABS){
    const b = el("button", { class:"tab"+(activeTab===t.key?" active":""), type:"button", onclick:()=>{ activeTab=t.key; render(); }});
    b.textContent = t.label;
    host.appendChild(b);
  }
};

const render = () => {
  renderTabs();
  const app = $("#app");
  app.innerHTML = "";
  if (activeTab==="dashboard") app.appendChild(renderDashboard());
  if (activeTab==="patients") app.appendChild(renderPatients());
  if (activeTab==="dailyA") app.appendChild(renderDailyA());
  if (activeTab==="inbound") app.appendChild(renderInbound());
  if (activeTab==="keep") app.appendChild(renderKeep());
  if (activeTab==="monthly") app.appendChild(renderMonthly());
  if (activeTab==="items") app.appendChild(renderItems());
};

function kpiBox(name, val){
  const b = el("div", { class:"box" });
  b.appendChild(el("div", { class:"name", html:name }));
  b.appendChild(el("div", { class:"val", html:val }));
  return b;
}

const renderDashboard = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"대시보드" }));

  const ym = monthISO(new Date());
  const aItems = db.items.filter(x=>x.grade==="A" && x.active);
  const days = Object.keys(db.dailyA).filter(d=>d.startsWith(ym));
  let totalUse=0, totalCost=0;

  for (const d of days){
    for (const it of aItems){
      const r = computeDailyRow(d, it.id);
      totalUse += toNum(r.use);
      totalCost += toNum(r.cost);
    }
  }

  const monthPatients = Object.keys(db.patients).filter(d=>d.startsWith(ym)).reduce((a,d)=>a+toNum(db.patients[d]),0);
  const perPatient = monthPatients>0 ? (totalUse/monthPatients) : 0;

  const k1 = keepRemain("sheetmask");
  const k2 = keepRemain("modeling");

  const kpi = el("div", { class:"kpi" });
  kpi.appendChild(kpiBox("이번달 환자수(합)", monthPatients?money(monthPatients):"데이터 없음"));
  kpi.appendChild(kpiBox("이번달 A등급 사용량(합)", money(totalUse)));
  kpi.appendChild(kpiBox("환자당 사용량(이번달)", monthPatients?perPatient.toFixed(2):"데이터 없음"));
  kpi.appendChild(kpiBox("이번달 A등급 소모비용(합)", `${money(totalCost)}원`));
  kpi.appendChild(kpiBox("킵 잔량(겔시트팩)", `${money(k1.remain)}장`));
  kpi.appendChild(kpiBox("킵 잔량(모델링)", `${money(k2.remain)}kg`));
  card.appendChild(kpi);

  card.appendChild(el("div", { class:"mini", html:"대시보드는 (환자수 + 일일(A) + 입고/킵 출고) 입력이 있어야 값이 나옵니다." }));
  return card;
};

const renderPatients = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"환자수 입력" }));

  const dateInput = el("input", { type:"date", value: todayISO() });
  const cntInput  = el("input", { type:"number", value: String(toNum(db.patients[todayISO()]||0)) });
  const btnSave   = el("button", { class:"btn primary", type:"button" });
  btnSave.textContent="저장";

  card.appendChild(el("div", { class:"row" }, [
    el("label", {}, [document.createTextNode("날짜"), dateInput]),
    el("label", {}, [document.createTextNode("환자수"), cntInput]),
    el("div", { class:"right", style:"margin-left:auto" }, [btnSave]),
  ]));

  const wrap = el("div", { class:"table-wrap" });
  const table = el("table");
  table.innerHTML = `<thead><tr><th>날짜</th><th class="num">환자수</th><th>작업</th></tr></thead><tbody></tbody>`;
  wrap.appendChild(table);
  card.appendChild(wrap);

  const tbody = table.querySelector("tbody");
  const renderRows = () => {
    tbody.innerHTML="";
    const dates = Object.keys(db.patients).sort().reverse();
    if (!dates.length){
      const tr = el("tr"); tr.innerHTML = `<td colspan="3"><div class="empty">환자수 기록이 없습니다.</div></td>`;
      tbody.appendChild(tr); return;
    }
    for (const d of dates){
      const tr = el("tr");
      tr.innerHTML = `<td>${d}</td><td class="num">${money(db.patients[d])}</td><td></td>`;
      const del = el("button", { class:"btn", type:"button" }); del.textContent="삭제";
      del.onclick = () => {
        if (!confirm("이 날짜의 환자수 기록을 삭제할까요?")) return;
        delete db.patients[d]; db.updated_at=new Date().toISOString(); save(db); renderRows();
      };
      tr.children[2].appendChild(del);
      tbody.appendChild(tr);
    }
  };

  dateInput.onchange = () => { const d=dateInput.value; cntInput.value=String(toNum(db.patients[d]||0)); };
  btnSave.onclick = () => {
    const d=dateInput.value; const c=toNum(cntInput.value);
    if (c<0){ alert("환자수는 0 이상이어야 합니다."); return; }
    db.patients[d]=c; db.updated_at=new Date().toISOString(); save(db); alert("저장 완료"); renderRows();
  };

  renderRows();
  card.appendChild(el("div", { class:"mini", html:"환자수는 '환자 대비 사용량' 계산의 분모입니다." }));
  return card;
};

const renderDailyA = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"일일(A) 퇴근 실재고" }));

  const dateInput = el("input", { type:"date", value: todayISO() });
  const btnSave = el("button", { class:"btn primary", type:"button" }); btnSave.textContent="전체 저장";
  card.appendChild(el("div", { class:"row" }, [
    el("label", {}, [document.createTextNode("날짜"), dateInput]),
    el("div", { class:"right", style:"margin-left:auto" }, [btnSave]),
  ]));

  const wrap = el("div", { class:"table-wrap" });
  const table = el("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>품목</th><th>단위</th>
        <th class="num">전일 실재고</th>
        <th class="num">오늘 입고</th>
        <th class="num">퇴근 실재고(입력)</th>
        <th class="num">오늘 사용량(자동)</th>
        <th class="num">당일 사용량(선택)</th>
        <th class="num">오차</th>
        <th>검증</th>
        <th class="num">단가(최근)</th>
        <th class="num">소모비용</th>
        <th>메모</th>
      </tr>
    </thead>
    <tbody></tbody>`;
  wrap.appendChild(table);
  card.appendChild(wrap);

  const tbody = table.querySelector("tbody");
  const items = () => db.items.filter(it=>it.grade==="A" && it.active);

  const renderRows = () => {
    const d = dateInput.value;
    tbody.innerHTML="";
    for (const it of items()){
      const r = computeDailyRow(d, it.id);

      const closeInput = el("input", { type:"number", value: (db.dailyA?.[d]?.[String(it.id)]?.close_qty ?? "") });
      const manualInput = el("input", { type:"number", value: (db.dailyA?.[d]?.[String(it.id)]?.manual_use ?? "") });
      const memoInput = el("input", { type:"text", value: (db.dailyA?.[d]?.[String(it.id)]?.memo ?? ""), style:"min-width:180px" });

      const badge = (r.diff===null) ? `<span class="chip">미검증</span>` : (r.diff===0 ? `<span class="chip ok">정상</span>` : `<span class="chip bad">불일치</span>`);
      const tr = el("tr");
      tr.innerHTML = `
        <td>${it.name}</td>
        <td>${it.base_unit}</td>
        <td class="num">${money(r.prev)}</td>
        <td class="num">${money(r.inbound)}</td>
        <td></td>
        <td class="num">${money(r.use)}</td>
        <td></td>
        <td class="num">${r.diff===null?"-":money(r.diff)}</td>
        <td>${badge}</td>
        <td class="num">${r.unit_cost?money(r.unit_cost):"-"}</td>
        <td class="num">${r.unit_cost?money(r.cost):"-"}</td>
        <td></td>
      `;
      tr.children[4].appendChild(closeInput);
      tr.children[6].appendChild(manualInput);
      tr.children[11].appendChild(memoInput);

      // validation hint
      const prev = latestCloseQty(prevDateISO(d), it.id);
      const inb = sumInboundByDateForItem(d, it.id);
      const closeNum = toNum(closeInput.value);
      closeInput.style.borderColor = (closeInput.value!=="" && closeNum > (prev+inb)) ? "rgba(255,107,107,.6)" : "rgba(255,255,255,.08)";

      closeInput.oninput = () => renderRows();
      manualInput.oninput = () => renderRows();
      tbody.appendChild(tr);
    }
  };

  btnSave.onclick = () => {
    const d = dateInput.value;
    if (!db.dailyA[d]) db.dailyA[d] = {};
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const list = items();
    for (let i=0;i<rows.length;i++){
      const tr = rows[i];
      const it = list[i];
      const closeVal = tr.children[4].querySelector("input").value;
      const manualVal = tr.children[6].querySelector("input").value;
      const memoVal = tr.children[11].querySelector("input").value;

      const prev = latestCloseQty(prevDateISO(d), it.id);
      const inb = sumInboundByDateForItem(d, it.id);
      const closeNum = toNum(closeVal);
      if (closeVal !== "" && closeNum > (prev+inb)){
        alert(`저장 불가: ${it.name} 퇴근 실재고가 (전일+입고)보다 큽니다.`);
        return;
      }
      db.dailyA[d][String(it.id)] = {
        close_qty: closeVal==="" ? "" : closeNum,
        manual_use: manualVal==="" ? "" : toNum(manualVal),
        memo: memoVal || ""
      };
    }
    db.updated_at=new Date().toISOString(); save(db); alert("저장 완료"); renderRows();
  };

  dateInput.onchange = renderRows;
  renderRows();
  card.appendChild(el("div", { class:"mini", html:"규칙: 퇴근 실재고가 (전일+입고)보다 크면 저장 차단됩니다." }));
  return card;
};

const renderInbound = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"입고" }));

  const date = el("input", { type:"date", value: todayISO() });
  const itemSel = el("select");
  const qty = el("input", { type:"number", value:"0" });
  const unitCost = el("input", { type:"number", value:"0" });
  const memo = el("input", { type:"text", value:"" });
  const add = el("button", { class:"btn primary", type:"button" }); add.textContent="추가";

  const fillSelect = () => {
    const items = activeItems().slice().sort((a,b)=> (a.category||"").localeCompare(b.category||"") || (a.name||"").localeCompare(b.name||""));
    const groups = new Map();
    for (const it of items){
      const key = it.category || "기타";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(it);
    }
    itemSel.innerHTML = "";
    const ph = document.createElement("option");
    ph.value=""; ph.textContent="품목 선택"; ph.disabled=true; ph.selected=true;
    itemSel.appendChild(ph);
    for (const [cat, arr] of groups.entries()){
      const og = document.createElement("optgroup"); og.label = cat;
      for (const it of arr){
        const opt = document.createElement("option");
        opt.value = String(it.id);
        opt.textContent = it.name;
        og.appendChild(opt);
      }
      itemSel.appendChild(og);
    }
  };
  fillSelect();

  card.appendChild(el("div", { class:"row" }, [
    el("label", {}, [document.createTextNode("입고일"), date]),
    el("label", {}, [document.createTextNode("품목"), itemSel]),
    el("label", {}, [document.createTextNode("수량"), qty]),
    el("label", {}, [document.createTextNode("단가(선택)"), unitCost]),
    el("label", {}, [document.createTextNode("메모"), memo]),
    el("div", { class:"right", style:"margin-left:auto" }, [add]),
  ]));

  const wrap = el("div", { class:"table-wrap" });
  const table = el("table");
  table.innerHTML = `<thead><tr>
      <th>입고일</th><th>품목</th>
      <th class="num">수량</th><th class="num">단가</th><th class="num">합계</th>
      <th>유형</th><th>메모</th><th>작업</th>
    </tr></thead><tbody></tbody>`;
  wrap.appendChild(table);
  card.appendChild(wrap);

  const tbody = table.querySelector("tbody");

  const renderRows = () => {
    tbody.innerHTML="";
    const rows = db.inbound.slice().sort((a,b)=> (a.date+a.id) < (b.date+b.id) ? 1 : -1);
    if (!rows.length){
      const tr = el("tr"); tr.innerHTML = `<td colspan="8"><div class="empty">입고 기록이 없습니다.</div></td>`;
      tbody.appendChild(tr); return;
    }
    for (const r of rows){
      const it = getItemById(r.item_id);
      const sum = toNum(r.qty) * toNum(r.unit_cost||0);
      const tr = el("tr");
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${it?it.name:"-"}</td>
        <td class="num">${money(r.qty)}</td>
        <td class="num">${toNum(r.unit_cost)?money(r.unit_cost):"-"}</td>
        <td class="num">${toNum(r.unit_cost)?money(sum):"-"}</td>
        <td>${r.type==="prepaid_transfer"?`<span class="chip">킵 출고</span>`:`<span class="chip">일반</span>`}</td>
        <td>${r.memo||""}</td>
        <td></td>
      `;
      const del = el("button", { class:"btn", type:"button" }); del.textContent="삭제";
      del.onclick = () => {
        if (!confirm("이 입고 기록을 삭제할까요? (월 리포트/계산이 바뀔 수 있음)")) return;
        db.inbound = db.inbound.filter(x=>x.id!==r.id);
        db.updated_at=new Date().toISOString(); save(db); renderRows();
      };
      tr.children[7].appendChild(del);
      tbody.appendChild(tr);
    }
  };

  add.onclick = () => {
    const item_id = Number(itemSel.value);
    if (!item_id){ alert("품목을 선택하세요."); return; }
    const q = toNum(qty.value);
    if (q<=0){ alert("수량은 0보다 커야 합니다."); return; }
    db.inbound.push({
      id: (db.inbound.reduce((m,x)=>Math.max(m,x.id||0),0)+1),
      date: date.value,
      item_id,
      qty: q,
      unit_cost: toNum(unitCost.value),
      memo: memo.value||"",
      type: "normal",
    });
    db.updated_at=new Date().toISOString(); save(db);
    qty.value="0"; unitCost.value="0"; memo.value="";
    renderRows();
  };

  renderRows();
  card.appendChild(el("div", { class:"mini", html:"킵 출고는 선결제 화면에서 '입고'로 자동 생성됩니다." }));
  return card;
};

const renderKeep = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"선결제(킵) - 잔량 자동 / 최소기준 없음" }));

  const container = el("div", { class:"two-col" });

  const makeKeepCard = (key) => {
    const cfg = KEEP_CONFIG[key];
    const st = db.keep[key];

    const tierSel = el("select");
    cfg.tiers.forEach(t=>{
      const o = document.createElement("option");
      o.value=t.tier;
      o.textContent = `${t.tier} (단가 ${money(t.unit_cost)}원/${cfg.unit})`;
      tierSel.appendChild(o);
    });
    tierSel.value = st.tier;

    const hospitalStock = el("input", { type:"number", value:String(toNum(st.hospital_stock||0)) });
    const shipQty = el("input", { type:"number", value:String(cfg.defaultShipQty) });
    const btn = el("button", { class:"btn primary", type:"button" }); btn.textContent="출고요청";
    const sum = el("div", { class:"kpi" });

    const refresh = () => {
      st.tier = tierSel.value;
      const { tier, shipped, remain } = keepRemain(key);
      sum.innerHTML="";
      sum.appendChild(kpiBox("계약 총량", `${money(tier.total_qty)}${cfg.unit}`));
      sum.appendChild(kpiBox("누적 출고", `${money(shipped)}${cfg.unit}`));
      sum.appendChild(kpiBox("업체 잔량", `${money(remain)}${cfg.unit}`));
      sum.appendChild(kpiBox("단가(스냅샷)", `${money(tier.unit_cost)}원/${cfg.unit}`));
    };

    tierSel.onchange = () => { db.updated_at=new Date().toISOString(); save(db); refresh(); };
    hospitalStock.onchange = () => { st.hospital_stock = toNum(hospitalStock.value); db.updated_at=new Date().toISOString(); save(db); };

    btn.onclick = () => {
      const { tier, shipped, remain } = keepRemain(key);
      const q = toNum(shipQty.value);
      if (q<=0){ alert("출고 수량은 0보다 커야 합니다."); return; }
      if (q>remain){ alert("출고 수량이 업체 잔량보다 큽니다."); return; }
      st.shipped_total = shipped + q;
      st.hospital_stock = toNum(hospitalStock.value);

      // 자동 입고 생성(킵 출고 -> 병원 입고)
      const item = db.items.find(x=>x.name===cfg.mapToItemName);
      if (item){
        db.inbound.push({
          id: (db.inbound.reduce((m,x)=>Math.max(m,x.id||0),0)+1),
          date: todayISO(),
          item_id: item.id,
          qty: q,
          unit_cost: toNum(tier.unit_cost),
          memo: "선결제(킵) 출고",
          type: "prepaid_transfer",
        });
      }

      db.updated_at=new Date().toISOString(); save(db);
      alert("출고요청 완료: 업체잔량 자동 차감 + 입고 자동 생성");
      refresh();
    };

    const box = el("div", { class:"card" });
    box.style.background="rgba(17,26,44,.45)";
    box.appendChild(el("div", { html:`<b>${cfg.name}</b>` }));
    box.appendChild(el("div", { class:"mini", html:"잔량=계약총량-누적출고. 선결제 최소기준/재선결제는 제거." }));
    box.appendChild(el("div", { class:"row" }, [
      el("label", {}, [document.createTextNode("계약 티어"), tierSel]),
      el("label", {}, [document.createTextNode("병원 보유(실사)"), hospitalStock]),
      el("label", {}, [document.createTextNode(`출고 수량(${cfg.unit})`), shipQty]),
      el("div", { class:"right", style:"margin-left:auto" }, [btn]),
    ]));
    box.appendChild(sum);
    refresh();
    return box;
  };

  container.appendChild(makeKeepCard("sheetmask"));
  container.appendChild(makeKeepCard("modeling"));
  card.appendChild(container);

  card.appendChild(el("div", { class:"mini", html:"킵은 '업체→병원 이동(입고)'만 자동 기록합니다. 실제 소모는 일일(A) 실재고에서 확인합니다." }));
  return card;
};

const renderMonthly = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"월 리포트 (환자 대비 사용량)" }));

  const ymSel = el("input", { type:"month", value: monthISO(new Date()) });
  card.appendChild(el("div", { class:"row" }, [
    el("label", {}, [document.createTextNode("월 선택"), ymSel]),
  ]));

  const wrap = el("div", { class:"table-wrap" });
  const table = el("table");
  table.innerHTML = `<thead><tr>
      <th>품목</th><th>단위</th>
      <th class="num">월 사용량</th><th class="num">월 소모비용</th>
      <th class="num">월 환자수</th><th class="num">환자당 사용량</th>
      <th class="num">단가(최근)</th>
    </tr></thead><tbody></tbody>`;
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector("tbody");

  const renderRows = () => {
    const ym = ymSel.value;
    const days = Object.keys(db.dailyA).filter(d=>d.startsWith(ym));
    const aItems = db.items.filter(x=>x.grade==="A" && x.active);
    const monthPatients = Object.keys(db.patients).filter(d=>d.startsWith(ym)).reduce((a,d)=>a+toNum(db.patients[d]),0);

    tbody.innerHTML="";
    if (!days.length && monthPatients===0){
      const tr = el("tr"); tr.innerHTML = `<td colspan="7"><div class="empty">선택한 월의 기록이 없습니다. (환자수/일일(A) 기록 필요)</div></td>`;
      tbody.appendChild(tr); return;
    }

    let totalUse=0, totalCost=0;
    for (const it of aItems){
      let u=0,c=0;
      for (const d of days){
        const r = computeDailyRow(d, it.id);
        u += toNum(r.use);
        c += toNum(r.cost);
      }
      totalUse += u; totalCost += c;
      const unitCost = latestUnitCost(it.id);
      const per = monthPatients>0 ? (u/monthPatients) : 0;

      const tr = el("tr");
      tr.innerHTML = `
        <td>${it.name}</td>
        <td>${it.base_unit}</td>
        <td class="num">${money(u)}</td>
        <td class="num">${money(c)}원</td>
        <td class="num">${monthPatients?money(monthPatients):"-"}</td>
        <td class="num">${monthPatients?per.toFixed(3):"-"}</td>
        <td class="num">${unitCost?money(unitCost):"-"}</td>`;
      tbody.appendChild(tr);
    }

    const perTotal = monthPatients>0 ? (totalUse/monthPatients) : 0;
    const trT = el("tr");
    trT.innerHTML = `
      <td><span class="chip ok">합계</span></td><td>-</td>
      <td class="num"><b>${money(totalUse)}</b></td>
      <td class="num"><b>${money(totalCost)}원</b></td>
      <td class="num"><b>${monthPatients?money(monthPatients):"-"}</b></td>
      <td class="num"><b>${monthPatients?perTotal.toFixed(3):"-"}</b></td>
      <td class="num">-</td>`;
    tbody.appendChild(trT);
  };

  ymSel.onchange = renderRows;
  renderRows();
  card.appendChild(el("div", { class:"mini", html:"원장 대응: '환자당 사용량'이 올라가면 과다사용/누락/소모품 증가를 근거로 설명 가능." }));
  return card;
};

const renderItems = () => {
  const card = el("div", { class:"card" });
  card.appendChild(el("h2", { html:"품목(추가/수정/비활성)" }));

  const statusSel = el("select");
  [{v:"active",t:"Active"},{v:"inactive",t:"Inactive"},{v:"all",t:"전체"}].forEach(x=>{
    const o=document.createElement("option"); o.value=x.v; o.textContent=x.t; statusSel.appendChild(o);
  });
  statusSel.value="active";

  const gradeSel = el("select");
  ["전체","A","B","C","D"].forEach(v=>{
    const o=document.createElement("option"); o.value=v; o.textContent=(v==="전체"?"등급 전체":v); gradeSel.appendChild(o);
  });

  const addBtn = el("button", { class:"btn primary", type:"button" }); addBtn.textContent="품목 추가";
  card.appendChild(el("div", { class:"row" }, [
    el("label", {}, [document.createTextNode("상태"), statusSel]),
    el("label", {}, [document.createTextNode("등급"), gradeSel]),
    el("div", { class:"right", style:"margin-left:auto" }, [addBtn]),
  ]));

  const wrap = el("div", { class:"table-wrap" });
  const table = el("table");
  table.innerHTML = `<thead><tr>
      <th>품목명</th><th>카테고리</th><th>등급</th><th>단위</th>
      <th class="num">기본원가</th><th>상태</th><th>작업</th>
    </tr></thead><tbody></tbody>`;
  wrap.appendChild(table);
  card.appendChild(wrap);
  const tbody = table.querySelector("tbody");

  const openPrompt = (item=null) => {
    const name = prompt("품목명", item?.name || "");
    if (!name) return;
    const category = prompt("카테고리", item?.category || "기타") || "기타";
    const grade = prompt("관리등급(A/B/C/D)", item?.grade || "B") || "B";
    const unit = prompt("기본 사용 단위", item?.base_unit || "개") || "개";
    const cost = prompt("기본 원가(숫자)", String(item?.base_cost ?? 0)) || "0";
    if (item){
      item.name=name; item.category=category; item.grade=grade; item.base_unit=unit; item.base_cost=toNum(cost);
    } else {
      const id = db.items.reduce((m,x)=>Math.max(m,x.id),0)+1;
      db.items.push({ id, name, category, grade, base_unit:unit, active:true, base_cost:toNum(cost) });
    }
    db.updated_at=new Date().toISOString(); save(db); renderRows();
  };

  addBtn.onclick = () => openPrompt(null);

  const renderRows = () => {
    let items = db.items.slice();
    if (statusSel.value==="active") items = items.filter(x=>x.active);
    if (statusSel.value==="inactive") items = items.filter(x=>!x.active);
    if (gradeSel.value!=="전체") items = items.filter(x=>x.grade===gradeSel.value);
    items.sort((a,b)=> (a.category||"").localeCompare(b.category||"") || (a.name||"").localeCompare(b.name||""));

    tbody.innerHTML="";
    if (!items.length){
      const tr = el("tr"); tr.innerHTML = `<td colspan="7"><div class="empty">표시할 품목이 없습니다.</div></td>`;
      tbody.appendChild(tr); return;
    }
    for (const it of items){
      const tr = el("tr");
      tr.innerHTML = `
        <td>${it.name}</td>
        <td>${it.category||""}</td>
        <td><span class="chip">${it.grade}</span></td>
        <td>${it.base_unit}</td>
        <td class="num">${it.base_cost?money(it.base_cost):"-"}</td>
        <td>${it.active?`<span class="chip ok">Active</span>`:`<span class="chip">Inactive</span>`}</td>
        <td></td>`;
      const edit = el("button", { class:"btn", type:"button" }); edit.textContent="수정"; edit.onclick=()=>openPrompt(it);
      const tog = el("button", { class:"btn", type:"button" }); tog.textContent = it.active?"비활성":"복구";
      tog.onclick = ()=>{ it.active=!it.active; db.updated_at=new Date().toISOString(); save(db); renderRows(); };
      tr.children[6].appendChild(edit);
      tr.children[6].appendChild(tog);
      tbody.appendChild(tr);
    }
  };

  statusSel.onchange = renderRows;
  gradeSel.onchange = renderRows;
  renderRows();

  card.appendChild(el("div", { class:"mini", html:"삭제 없음. 사용하지 않는 품목은 Inactive로 전환." }));
  return card;
};

// Backup / Import / Reset
$("#btnExport").onclick = () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `derm_inventory_backup_${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
$("#btnImport").onclick = () => {
  const inp = document.createElement("input");
  inp.type="file"; inp.accept="application/json";
  inp.onchange = () => {
    const file = inp.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try{
        const next = JSON.parse(String(r.result||"{}"));
        if (!next || !next.items || !next.inbound) throw new Error("invalid");
        db = next; save(db); alert("가져오기 완료"); render();
      }catch{ alert("가져오기 실패: JSON 형식 오류"); }
    };
    r.readAsText(file);
  };
  inp.click();
};
$("#btnReset").onclick = () => {
  if (!confirm("정말 초기화할까요? (모든 기록 삭제)")) return;
  localStorage.removeItem(STORAGE_KEY);
  db = seed(); save(db); alert("초기화 완료"); render();
};

render();
