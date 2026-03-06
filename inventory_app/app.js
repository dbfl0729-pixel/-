/* 병원 재고·발주·원가·보고 (v3)
   고정 원칙:
   - 실재고 기준, 원가 기준
   - 비용은 기록 시점 단가(unit_cost_snapshot) 저장 후 잠금
   - 현재 재고=가장 최근 기록된 실재고
   - 품목 삭제 금지: Active/Inactive만
*/
(() => {
  const LS_KEY = "derm_inv_v3_db";
  const fmt = new Intl.NumberFormat("ko-KR");
  const money = (n) => fmt.format(Math.round(Number(n||0)));

  const fillItemSelect = (selectEl, { includeInactive=false, onlyPrepaid=false } = {}) => {
    if (!selectEl) return;
    const items = db.items
      .filter(it => includeInactive ? true : !!it.active)
      .filter(it => onlyPrepaid ? !!it.prepaid : true)
      .slice()
      .sort((a,b)=> (a.category||"").localeCompare(b.category||"") || (a.name||"").localeCompare(b.name||""));
    const groups = new Map();
    for (const it of items){
      const key = it.category || "기타";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(it);
    }
    selectEl.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "품목 선택";
    placeholder.disabled = true;
    placeholder.selected = true;
    selectEl.appendChild(placeholder);
    for (const [cat, arr] of groups.entries()){
      const og = document.createElement("optgroup");
      og.label = cat;
      for (const it of arr){
        const opt = document.createElement("option");
        opt.value = String(it.id);
        opt.textContent = it.name;
        og.appendChild(opt);
      }
      selectEl.appendChild(og);
    }
  };

  const bindPrepaidFilters = () => {
    const btnAlert = $("#prepaid-show-alert-only");
    const btnAll = $("#prepaid-show-all");
    if (btnAlert) btnAlert.onclick = () => { uiState.prepaidOnlyAlert = true; renderPrepaid(); };
    if (btnAll) btnAll.onclick = () => { uiState.prepaidOnlyAlert = false; renderPrepaid(); };
  };

  const isPrepaidAlert = (rec) => {
    const hs = Number((rec||{}).hospital_stock || 0);
    const safe = Number((rec||{}).hospital_safe || 0);
    const vb = Number((rec||{}).vendor_balance || 0);
    const vmin = Number((rec||{}).vendor_min || 0);
    return (hs <= safe) || (vb <= vmin);
  };

  const num = (n) => (n === null || n === undefined || n === "" ? "" : fmt.format(Number(n)));
  const todayStr = () => new Date().toISOString().slice(0,10);
  const ymd = (d) => (typeof d === "string" ? d : new Date(d).toISOString().slice(0,10));
  const isOffday = (date) => {
    if (!db.offdays) db.offdays = {};
    return !!db.offdays[date];
  };
  const setOffday = (date, note="") => {
    if (!db.offdays) db.offdays = {};
    db.offdays[date] = { note, marked_at: new Date().toISOString() };
  };
  const clearOffday = (date) => {
    if (!db.offdays) db.offdays = {};
    delete db.offdays[date];
  };

  const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

  // ------- Seed Items (user provided lists) -------
  const seedItems = () => {
    const A = ["수분팩","진정팩","겔시트팩","거즈팩","모델링팩","해면"];
    const B = ["멸균 거즈","장갑","클렌징 밀크","클렌징 젤","토너","아토 크림","셀퓨전씨 로션","셀퓨전씨 크림","재생 크림","선크림","알로에 젤","진정 젤","초음파 겔","스킨솜","거즈","GA20","GA30","중화제"];
    const C = ["팩붓","스파출라","코메도","유리볼","카프리가스","니들 26G","장갑(월간)","면봉","비타민 앰플 P","비타민 앰플 V","2B Aladdin Peeling Powder","2B Bio Peeling Preparation Pro","2B Bio Aladdin Peel(수딩 마스크)"];
    const D = ["세제","섬유유연제","퐁퐁","아이깨끗해","세탁청소가루","칫솔","매직스펀지","수세미","세탁망","고무줄","파우더룸 휴지","웨건 휴지"];

    const make = (name, cat, grade) => ({
      id: uid(),
      name,
      category: cat,
      grade, // A/B/C/D
      base_unit: "개",
      order_unit: "박스",
      recommended_stock: 0,
      safety_mode: "A", // A: 최소재고 기반, B: 권장재고 기반(옵션)
      min_stock: 0,
      safe_stock: 0,
      box_qty: 1,
      lead_time_days: 0,
      base_cost: 0, // 기본 원가(선택)
      prepaid_enabled: false,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const items = [];
    A.forEach(n=>items.push(make(n, "일일 관리", "A")));
    B.forEach(n=>items.push(make(n, "주간 점검", "B")));
    C.forEach(n=>items.push(make(n, "월간 점검", "C")));
    D.forEach(n=>items.push(make(n, "파우더/청소", "D")));
    return items;
  };

  // ------- DB -------
  const emptyDB = () => ({
    version: 4,
    items: seedItems(),
    inbound: [],        // {id, date, item_id, qty, unit_cost, memo, status:'OK'|'VOID', created_at, updated_at}
    dailyA: {},         // key: date => { item_id: {closing_stock, manual_usage, note, unit_cost_snapshot, saved_at} }
    checks: [],         // {id, date, grade:'B'|'C', item_id, current_stock, memo, created_at, updated_at}
    prepaid: {},        // item_id => {hospital_stock, hospital_safe, vendor_balance, vendor_min, memo, updated_at}
    offdays: {},        // date => {note, marked_at}
    patients_month: {}, // 'YYYY-MM' => number
    patients_day: {},   // 'YYYY-MM-DD' => number
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return emptyDB();
      const db = JSON.parse(raw);
      if (!db.items || !Array.isArray(db.items)) return emptyDB();
      return db;
    } catch {
      return emptyDB();
    }
  };
  const save = () => localStorage.setItem(LS_KEY, JSON.stringify(db));
  let db = load();
  const uiState = { prepaidOnlyAlert: false };

  // ------- Helpers: item lookup, stocks, cost snapshot -------
  const byId = (id) => db.items.find(x=>x.id===id);
  const activeItems = () => db.items.filter(x=>x.active);
  const isActive = (it) => it && !!it.active;

  const inboundSum = (date, item_id) => {
    return db.inbound
      .filter(r => r.status !== "VOID" && r.item_id === item_id && r.date === date)
      .reduce((a,r)=>a + Number(r.qty||0), 0);
  };

  // last known closing stock (from dailyA for A-grade, from checks for B/C/D or prepaid/hospital_stock)
  // rule: current stock = most recent recorded "real stock" for that item across records.
  const lastRealStock = (item_id, upToDate) => {
    // dailyA (closing_stock)
    let best = null; // {date, stock}
    for (const [d, map] of Object.entries(db.dailyA || {})) {
      if (upToDate && d > upToDate) continue;
      const row = map[item_id];
      if (row && row.closing_stock !== "" && row.closing_stock !== null && row.closing_stock !== undefined) {
        if (!best || d > best.date) best = {date:d, stock:Number(row.closing_stock||0)};
      }
    }
    // checks (current_stock)
    db.checks.forEach(r=>{
      if (r.item_id !== item_id) return;
      if (upToDate && r.date > upToDate) return;
      const st = Number(r.current_stock||0);
      if (!best || r.date > best.date) best = {date:r.date, stock:st};
    });
    // prepaid hospital_stock as stock signal
    const pr = db.prepaid[item_id];
    if (pr && pr.hospital_stock !== "" && pr.hospital_stock !== null && pr.hospital_stock !== undefined) {
      const d = pr.updated_at ? pr.updated_at.slice(0,10) : "0000-00-00";
      // use updated_at date as a candidate; not overriding a newer explicit stock record
      if (!best || d > best.date) best = {date:d, stock:Number(pr.hospital_stock||0)};
    }
    return best ? best.stock : 0;
  };

  const prevDay = (date) => {
    const dt = new Date(date + "T00:00:00");
    dt.setDate(dt.getDate() - 1);
    return dt.toISOString().slice(0,10);
  };

  // Cost snapshot priority: item.base_cost > latest inbound unit_cost (non-VOID) > 0
  const costCandidate = (item_id, upToDate) => {
    const it = byId(item_id);
    if (it && Number(it.base_cost||0) > 0) return Number(it.base_cost||0);
    // latest inbound <= date
    let best = null;
    db.inbound.forEach(r=>{
      if (r.status === "VOID") return;
      if (r.item_id !== item_id) return;
      if (upToDate && r.date > upToDate) return;
      const c = Number(r.unit_cost||0);
      if (!(c > 0)) return;
      if (!best || r.date > best.date) best = {date:r.date, cost:c};
    });
    return best ? best.cost : 0;
  };

  // 7-day avg usage from dailyA computed usage (A-grade only)
  const avgUsage7 = (item_id, endDate) => {
    const end = new Date(endDate + "T00:00:00");
    let sum = 0, cnt = 0;
    for (let i=0;i<7;i++){
      const d = new Date(end);
      d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      const rec = (db.dailyA[key]||{})[item_id];
      if (!rec) continue;
      const usage = computeDailyUsage(item_id, key, rec);
      if (usage !== null) { sum += usage; cnt += 1; }
    }
    return cnt ? sum/cnt : 0;
  };

  // ------- Badges -------
  const badge = (type, text) => {
    const cls = type === "good" ? "pill good" :
                type === "bad" ? "pill bad" :
                type === "warn" ? "pill warn" :
                type === "info" ? "pill info" : "pill";
    return `<span class="${cls}">${text}</span>`;
  };

  // Status badge spec fixed (5 types)
  const statusBadges = ({mismatch, needOrder, belowRecommended, nearDeplete, needPrepay}) => {
    const out = [];
    if (mismatch) out.push(badge("bad","불일치"));
    if (needOrder) out.push(badge("warn","발주 필요"));
    if (belowRecommended) out.push(badge("warn","권장 미달"));
    if (nearDeplete) out.push(badge("warn","소진 임박"));
    if (needPrepay) out.push(badge("bad","재선결제 필요"));
    return out.join(" ");
  };

  // ------- Modal -------
  const $ = (sel) => document.querySelector(sel);
  const modal = {
    open(title, bodyHTML, footHTML){
      $("#modal-title").textContent = title;
      $("#modal-body").innerHTML = bodyHTML || "";
      $("#modal-foot").innerHTML = footHTML || "";
      const bd = $("#modal-backdrop");
      bd.style.display = "flex";
      bd.setAttribute("aria-hidden","false");
    },
    close(){
      const bd = $("#modal-backdrop");
      bd.style.display = "none";
      bd.setAttribute("aria-hidden","true");
      $("#modal-body").innerHTML = "";
      $("#modal-foot").innerHTML = "";
    }
  };
  $("#modal-close").addEventListener("click", ()=>modal.close());
  $("#modal-backdrop").addEventListener("click", (e)=>{ if (e.target.id==="modal-backdrop") modal.close(); });

  // ------- Navigation / Screen meta -------
  const screens = {
    dashboard: {title:"대시보드", desc:"이번 달 재료비 요약과 위험 신호를 한 화면에 표시합니다."},
    daily: {title:"일일관리(A)", desc:"퇴근 시 A등급 품목을 한 번에 입력하고 사용량·비용·불일치를 즉시 확인합니다."},
    inbound: {title:"입고(Inbound)", desc:"입고 기록을 추가/수정/취소(VOID)하고 일일관리 계산에 자동 반영합니다."},
    check: {title:"주간/월간 점검", desc:"B/C 품목의 현재재고를 입력하고 부족수량·발주 필요를 즉시 산출합니다."},
    prepaid: {title:"선결제(킵)", desc:"병원 보유 재고와 업체 보관 잔량을 분리해 출고/재선결제 경고를 관리합니다."},
    items: {title:"품목관리", desc:"ItemMaster(추가/수정/비활성)로 모든 자동 계산의 기준을 관리합니다."},
  };
  let activeScreen = "dashboard";

  const setScreen = (name) => {
    activeScreen = name;
    document.querySelectorAll("#nav button").forEach(b=>{
      b.classList.toggle("active", b.dataset.screen===name);
    });
    for (const k of Object.keys(screens)){
      const sec = document.getElementById("screen-"+k);
      if (!sec) continue;
      sec.classList.toggle("hidden", k!==name);
    }
    $("#screen-title").textContent = screens[name].title;
    $("#screen-desc").textContent = screens[name].desc;
    $("#screen-actions").innerHTML = "";
    render();
  };

  document.getElementById("nav").addEventListener("click",(e)=>{
    const btn = e.target.closest("button[data-screen]");
    if (!btn) return;
    setScreen(btn.dataset.screen);
  });

  // ------- Backup / Import / Reset -------
  document.getElementById("btn-export").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(db, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `derm_inventory_backup_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("btn-import").addEventListener("click", ()=>$("#file-import").click());
  document.getElementById("file-import").addEventListener("change", async (e)=>{
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const txt = await f.text();
    try{
      const next = JSON.parse(txt);
      if (!next || !next.items) throw new Error("invalid");
      db = next;
      save();
      render();
      alert("가져오기 완료");
    }catch{
      alert("가져오기 실패: JSON 형식 또는 데이터 구조를 확인하세요.");
    }finally{
      e.target.value = "";
    }
  });
  document.getElementById("btn-reset").addEventListener("click", ()=>{
    if (!confirm("초기 48개 품목을 다시 생성합니다. 기존 데이터는 유지되며, 동일 이름 품목이 중복될 수 있습니다. 계속할까요?")) return;
    const existingNames = new Set(db.items.map(x=>x.name));
    const add = seedItems().filter(x=>!existingNames.has(x.name));
    db.items.push(...add);
    save();
    render();
  });

  // ------- Daily (A) computations -------
  const getDailyRec = (date) => {
    if (!db.dailyA) db.dailyA = {};
    if (!db.dailyA[date]) db.dailyA[date] = {};
    return db.dailyA[date];
  };

  // Returns computed usage for A-grade item on date, based on rule:
  // usage = prev_real + inbound - closing_real
  // manual_usage: optional user input for cross-check; mismatch only if manual_usage set
  const computeDailyUsage = (item_id, date, recRow) => {
    const it = byId(item_id);
    if (!it) return null;
    const prev = lastRealStock(item_id, prevDay(date));
    const inb = inboundSum(date, item_id);
    const closing = Number(recRow?.closing_stock ?? "");
    if (recRow == null) return null;
    if (recRow.closing_stock === "" || recRow.closing_stock === null || recRow.closing_stock === undefined) return null;
    return (prev + inb - closing);
  };

  const dailyRowView = (it, date, recRow) => {
    const prev = lastRealStock(it.id, prevDay(date));
    const inb = inboundSum(date, it.id);
    const closing = recRow?.closing_stock ?? "";
    const manual = recRow?.manual_usage ?? "";
    const unitCost = recRow?.unit_cost_snapshot ?? 0;

    const usage = (closing === "" ? null : (prev + inb - Number(closing||0)));
    const manualNum = (manual === "" ? null : Number(manual||0));
    const err = (usage === null || manualNum === null) ? null : (manualNum - usage);

    const mismatch = (err !== null && err !== 0);
    const invalidNeg = (usage !== null && usage < 0);
    const cost = (usage === null ? 0 : (usage * Number(unitCost||0)));

    const badges = statusBadges({ mismatch, needOrder:false, belowRecommended:false, nearDeplete:false, needPrepay:false });

    return {
      prev, inb, closing, usage, manual, err, mismatch, invalidNeg, unitCost, cost, badges
    };
  };

  // ------- Renderers -------
  const el = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  const renderDashboard = () => {
    const host = $("#screen-dashboard");
    host.innerHTML = "";

    const now = new Date();
    const ym = now.toISOString().slice(0,7);

    // 최근 7일 일일관리(A) 기록 누락 vs 휴무 구분
    const recent = [];
    const end = new Date(todayStr() + "T00:00:00");
    for (let i=0;i<7;i++){
      const d = new Date(end);
      d.setDate(d.getDate()-i);
      const ds = d.toISOString().slice(0,10);
      const off = isOffday(ds);
      const dayMap = (db.dailyA||{})[ds] || {};
      const hasSaved = Object.values(dayMap).some(r=>r && r.saved_at);
      recent.push({ds, off, hasSaved});
    }
    const missingDays = recent.filter(x=>!x.off && !x.hasSaved).map(x=>x.ds).sort();
    const offDays = recent.filter(x=>x.off).map(x=>x.ds).sort();

    const abnormalItems = db.items.filter(it=>it.grade==="A" && it.active).filter(it=>{
      const last7 = avgUsage7(it.id, todayStr());
      const prevAvg = monthAvgPerDayA(ymPrev, it.id);
      return prevAvg>0 && last7 > prevAvg*1.5;
    });

    const nearDepleteItems = db.items.filter(it=>it.grade==="A" && it.active).map(it=>{
      const stock = lastRealStock(it.id, todayStr());
      const a7 = avgUsage7(it.id, todayStr());
      const days = a7>0 ? (stock/a7) : null;
      return {it, stock, days};
    }).filter(x=>x.days!==null && x.days<=10).sort((a,b)=>a.days-b.days).slice(0,5);

    // Monthly total cost: sum daily A cost in current month
    let total = 0;
    const itemCost = new Map(); // item_id -> cost
    for (const [d, map] of Object.entries(db.dailyA||{})){
      if (!d.startsWith(ym)) continue;
      for (const [item_id, rec] of Object.entries(map||{})){
        const it = byId(item_id);
        if (!it) continue;
        const usage = computeDailyUsage(item_id, d, rec);
        if (usage === null) continue;
        const c = Number(rec.unit_cost_snapshot||0) * usage;
        total += c;
        itemCost.set(item_id, (itemCost.get(item_id)||0) + c);
      }
    }

    // Previous month total
    const prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const ymPrev = prevMonth.toISOString().slice(0,7);

    // 사용량(단위) 요약: A등급 기록 기반
    const usageTotals = monthUsageMapA(ym); // Map
    const usageTop = Array.from(usageTotals.entries())
      .map(([item_id, u])=>({it: byId(item_id), u:Number(u||0), item_id}))
      .filter(x=>x.it)
      .sort((a,b)=>b.u-a.u)
      .slice(0,5);

    
    let totalPrev = 0;
    for (const [d, map] of Object.entries(db.dailyA||{})){
      if (!d.startsWith(ymPrev)) continue;
      for (const [item_id, rec] of Object.entries(map||{})){
        const usage = computeDailyUsage(item_id, d, rec);
        if (usage === null) continue;
        totalPrev += Number(rec.unit_cost_snapshot||0) * usage;
      }
    }
    const deltaPct = (totalPrev > 0) ? ((total - totalPrev)/totalPrev*100) : null;

    // Top 3 cost items
    const top3 = Array.from(itemCost.entries())
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(([id,c])=>({name: (byId(id)?.name||"(알수없음)"), cost:c}));

    // Safety below list (active only)
    const belowSafe = activeItems()
      .map(it=>{
        const cur = lastRealStock(it.id, todayStr());
        const safe = Number(it.safe_stock||0);
        return {it, cur, safe, ok: (safe<=0 ? true : cur>safe)};
      })
      .filter(x=> Number(x.safe||0)>0 && x.cur <= x.safe)
      .sort((a,b)=>(a.cur-a.safe)-(b.cur-b.safe))
      .slice(0,20);

    // Deplete <= 10 days: use 7d avg usage if available
    const deplete10 = activeItems()
      .map(it=>{
        const cur = lastRealStock(it.id, todayStr());
        const avg = avgUsage7(it.id, todayStr());
        const days = (avg>0) ? (cur/avg) : null;
        return {it, cur, avg, days};
      })
      .filter(x=> x.days !== null && x.days <= 10)
      .sort((a,b)=>a.days-b.days)
      .slice(0,20);

    const card1 = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>이번 달 총 재료비</strong>
            <div class="sub">기준: 저장된 일일관리(A) 소모비용 합계</div>
          </div>
          <div>${badge("info", ym)}</div>
        </div>
        <div class="card-b">
          <div class="mini">
            <div class="kpi">
              <div class="k">이번 달</div>
              <div class="v">${money(total)}</div>
              <div class="d">${deltaPct===null ? "전월 데이터 없음" : `전월 대비 ${deltaPct>=0?"+":""}${deltaPct.toFixed(1)}%`}</div>
            </div>
            <div class="kpi">
              <div class="k">전월</div>
              <div class="v">${money(totalPrev)}</div>
              <div class="d">비교 기준월: ${ymPrev}</div>
            </div>
            <div class="kpi">
              <div class="k">데이터 주의</div>
              <div class="v">A기준</div>
              <div class="d">B/C/D 사용량은 점검 입력만으로 비용 산출되지 않습니다.</div>
            </div>
          </div>
        </div>
      </div>
    `);

    const card2 = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>비용 상위 3개 품목</strong>
            <div class="sub">이번 달 누적 소모비용 기준</div>
          </div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>품목명</th>
                  <th class="num">누적 비용</th>
                </tr>
              </thead>
              <tbody>
                ${top3.length ? top3.map((x,i)=>`
                  <tr>
                    <td>${i+1}</td>
                    <td>${x.name}</td>
                    <td class="num">${money(x.cost)}</td>
                  </tr>
                `).join("") : `<tr><td colspan="3" class="muted">이번 달 데이터가 없습니다.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);

    const card3 = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>안전 재고 이하 품목</strong>
            <div class="sub">현재 재고(최근 실재고) ≤ 안전재고</div>
          </div>
          <div>${belowSafe.length ? badge("warn", `${belowSafe.length}개`) : badge("good","0개")}</div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>등급</th>
                  <th class="num">현재 재고</th>
                  <th class="num">안전 재고</th>
                </tr>
              </thead>
              <tbody>
                ${belowSafe.length ? belowSafe.map(x=>`
                  <tr class="row-warn">
                    <td>${x.it.name}</td>
                    <td>${x.it.grade}</td>
                    <td class="num">${num(x.cur)}</td>
                    <td class="num">${num(x.safe)}</td>
                  </tr>
                `).join("") : `<tr><td colspan="4" class="muted">안전재고 기준으로 위험 품목이 없습니다.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);

    const card4 = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>소진 예상 10일 이내</strong>
            <div class="sub">최근 7일 평균 사용량(일일관리 A기록 기반)으로 추정</div>
          </div>
          <div>${deplete10.length ? badge("warn", `${deplete10.length}개`) : badge("good","0개")}</div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>등급</th>
                  <th class="num">현재</th>
                  <th class="num">7일평균/일</th>
                  <th class="num">잔여일(추정)</th>
                </tr>
              </thead>
              <tbody>
                ${deplete10.length ? deplete10.map(x=>`
                  <tr class="row-warn">
                    <td>${x.it.name}</td>
                    <td>${x.it.grade}</td>
                    <td class="num">${num(x.cur)}</td>
                    <td class="num">${x.avg? x.avg.toFixed(2) : ""}</td>
                    <td class="num">${x.days.toFixed(1)}</td>
                  </tr>
                `).join("") : `<tr><td colspan="5" class="muted">추정 가능한 소진 임박 품목이 없습니다.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);

    host.appendChild(card1);

    const card0 = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>최근 7일 입력 상태</strong>
            <div class="sub">휴무는 누락으로 집계하지 않습니다.</div>
          </div>
          <div class="mini">
            ${missingDays.length ? badge("warn", `미기록 ${missingDays.length}일`) : badge("good","미기록 0일")}
            ${offDays.length ? badge("info", `휴무 ${offDays.length}일`) : ""}
          </div>
        </div>
        <div class="card-b">
          <div class="hint">
            미기록 날짜: ${missingDays.length ? missingDays.join(", ") : "없음"}
            <br/>휴무 날짜: ${offDays.length ? offDays.join(", ") : "없음"}
          </div>
        </div>
      </div>
    `);

    host.appendChild(card0);

    const cardU = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>이번 달 사용량 요약(A등급)</strong>
            <div class="sub">원장 질문(왜 빨리 쓰냐)에 바로 답하기 위한 요약</div>
          </div>
          <div class="mini">
            ${abnormalItems.length ? badge("bad", `이상 사용 ${abnormalItems.length}`) : badge("good","이상 사용 0")}
            ${nearDepleteItems.length ? badge("warn", `소진임박 ${nearDepleteItems.length}`) : ""}
          </div>
        </div>
        <div class="card-b">
          <div class="grid2">
            <div>
              <div class="hint" style="margin-bottom:6px">TOP 사용(상위5)</div>
              <table class="table compact">
                <thead><tr><th>품목</th><th class="num">사용량</th></tr></thead>
                <tbody>
                  ${usageTop.length ? usageTop.map(r=>`<tr><td>${escapeHtml(r.it.name)}</td><td class=\"num\">${fmtQty(r.u)}</td></tr>`).join("") : `<tr><td colspan=\"2\" class=\"hint\">데이터 없음</td></tr>`}
                </tbody>
              </table>
            </div>
            <div>
              <div class="hint" style="margin-bottom:6px">소진 임박(≤10일)</div>
              <table class="table compact">
                <thead><tr><th>품목</th><th class="num">예상(일)</th></tr></thead>
                <tbody>
                  ${nearDepleteItems.length ? nearDepleteItems.map(r=>`<tr><td>${escapeHtml(r.it.name)}</td><td class=\"num\">${Math.ceil(r.days)}</td></tr>`).join("") : `<tr><td colspan=\"2\" class=\"hint\">없음</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
          <div class="hint" style="margin-top:10px">자세한 분석: 상단 메뉴의 ‘사용량 분석’ / ‘월 보고’</div>
        </div>
      </div>
    `);

    host.appendChild(cardU);
    host.appendChild(card2);
    host.appendChild(card3);
    host.appendChild(card4);
  };

  const renderDaily = () => {
    const host = $("#screen-daily");
    host.innerHTML = "";

    const date = state.dailyDate || todayStr();
    const dailyMap = getDailyRec(date);

    const off = isOffday(date);

    const dailyItems = db.items.filter(it => it.grade==="A" && it.active);

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>일일관리 (A등급)</strong>
            <div class="sub">전일 실재고 + 오늘 입고 - 퇴근 실재고 = 오늘 사용량</div>
          </div>
          <div class="filters">
            <div class="field">
              <label>날짜</label>
              <input id="daily-date" type="date" value="${date}" />
            </div>
            <button class="btn" id="daily-apply-inbound">입고 자동 반영</button>
            <button class="btn" id="daily-offday-toggle"></button>
            <button class="btn" id="daily-check-saved">저장 확인</button>
          </div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>카테고리</th>
                  <th class="num">전일 실재고</th>
                  <th class="num">오늘 입고</th>
                  <th class="num">오늘 퇴근 실재고</th>
                  <th class="num">오늘 사용량</th>
                  <th class="num">당일 사용량(선택)</th>
                  <th class="num">오차</th>
                  <th>검증</th>
                  <th>단가(잠금)</th>
                  <th class="num">당일 소모비용</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody id="daily-body"></tbody>
            </table>
          </div>
          <div class="sticky-bar">
            <div class="sum">
              <span>오늘 총 소모비용 <b id="daily-sum-cost">0</b></span>
              <span>불일치 <b id="daily-mismatch">0</b></span>
            </div>
            <div>
              <button class="btn primary" id="daily-save">전체 저장</button>
            </div>
          </div>
          <div class="hint" style="margin-top:10px">
            검증 규칙: (1) 퇴근 실재고 입력 시 즉시 계산 (2) 음수 사용량(퇴근&gt;전일+입고)은 저장 차단 (3) 당일 사용량 입력 시 오차≠0이면 불일치 뱃지 및 행 강조.
          </div>
        </div>
      </div>
    `);

    host.appendChild(card);

    const itemInput = $("#inbound-item-select");
    fillItemSelect(itemInput, { includeInactive:false });

    // 휴무 UI
    const offBtn = $("#daily-offday-toggle");
    const offBanner = $("#daily-offday-banner");
    const setOffUI = () => {
      const isOff = isOffday(date);
      if (offBtn) offBtn.textContent = isOff ? "휴무 해제" : "휴무일(마감 없음)";
      if (offBanner) offBanner.innerHTML = isOff
        ? `현재 날짜는 <b>휴무</b>로 표시되어 있습니다. (미기록으로 집계하지 않음)`
        : "";
    };
    setOffUI();

    // 휴무 토글 바인딩
    const offToggleBtn = $("#daily-offday-toggle");
    if (offToggleBtn){
      offToggleBtn.addEventListener("click", ()=>{
        const isOff = isOffday(date);
        if (!isOff){
          setOffday(date, "휴무");
        } else {
          clearOffday(date);
        }
        save();
        setOffUI();
        // 대시보드/다른 화면 집계는 화면 이동 시 자동 반영됨
      });
    }

    const tbody = $("#daily-body");
    const rows = [];

    dailyItems.forEach(it=>{
      const rec = dailyMap[it.id] || (dailyMap[it.id] = {closing_stock:"", manual_usage:"", note:"", unit_cost_snapshot: costCandidate(it.id, date), saved_at:null});
      // Ensure cost snapshot exists; do not overwrite if already saved
      if (!(Number(rec.unit_cost_snapshot||0) > 0)) rec.unit_cost_snapshot = costCandidate(it.id, date);

      const view = dailyRowView(it, date, rec);
      const trClass = view.invalidNeg ? "row-bad" : (view.mismatch ? "row-warn" : "");
      const verify = view.invalidNeg ? badge("bad","저장 불가") : (view.mismatch ? badge("bad","불일치") : badge("good","정상"));
      const costText = (Number(view.unitCost||0) > 0) ? `${money(view.unitCost)} /단위` : "단가 없음";
      const costPill = badge("info","단가 잠금됨");

      const tr = el(`
        <tr class="${trClass}">
          <td>${it.name}</td>
          <td class="muted">${it.category}</td>
          <td class="num">${num(view.prev)}</td>
          <td class="num">${num(view.inb)}</td>
          <td class="num">
            <input class="cell-input" inputmode="numeric" pattern="[0-9]*" data-daily="closing" data-id="${it.id}" value="${view.closing!==""? view.closing : ""}" placeholder="입력" />
          </td>
          <td class="num" data-daily-out="usage" data-id="${it.id}">${view.usage===null? "" : num(view.usage)}</td>
          <td class="num">
            <input class="cell-input" inputmode="numeric" pattern="[0-9]*" data-daily="manual" data-id="${it.id}" value="${view.manual!==""? view.manual : ""}" placeholder="선택" />
          </td>
          <td class="num" data-daily-out="err" data-id="${it.id}">${view.err===null? "" : num(view.err)}</td>
          <td data-daily-out="verify" data-id="${it.id}">${verify}</td>
          <td>
            <div class="mini" style="gap:6px">
              <span class="pill info">${costText}</span>
              ${costPill}
            </div>
          </td>
          <td class="num" data-daily-out="cost" data-id="${it.id}">${money(view.cost)}</td>
          <td>
            <button class="cell-btn" data-daily="memo" data-id="${it.id}">메모</button>
          </td>
        </tr>
      `);
      tbody.appendChild(tr);
      rows.push({it, rec});
    });

    const recompute = () => {
      let sumCost = 0;
      let mismatchCnt = 0;
      let hasInvalid = false;

      dailyItems.forEach(it=>{
        const rec = dailyMap[it.id];
        const view = dailyRowView(it, date, rec);

        // outputs
        const usageTd = document.querySelector(`[data-daily-out="usage"][data-id="${it.id}"]`);
        const errTd = document.querySelector(`[data-daily-out="err"][data-id="${it.id}"]`);
        const verifyTd = document.querySelector(`[data-daily-out="verify"][data-id="${it.id}"]`);
        const costTd = document.querySelector(`[data-daily-out="cost"][data-id="${it.id}"]`);

        if (usageTd) usageTd.textContent = (view.usage===null ? "" : num(view.usage));
        if (errTd) errTd.textContent = (view.err===null ? "" : num(view.err));
        if (costTd) costTd.textContent = money(view.cost);

        let verify = "";
        if (view.invalidNeg) { verify = badge("bad","저장 불가"); hasInvalid = true; }
        else if (view.mismatch) { verify = badge("bad","불일치"); mismatchCnt += 1; }
        else verify = badge("good","정상");
        if (verifyTd) verifyTd.innerHTML = verify;

        // row class
        const tr = verifyTd?.closest("tr");
        if (tr){
          tr.classList.toggle("row-bad", view.invalidNeg);
          tr.classList.toggle("row-warn", !view.invalidNeg && view.mismatch);
        }

        sumCost += Number(view.cost||0);
      });

      $("#daily-sum-cost").textContent = money(sumCost);
      $("#daily-mismatch").textContent = String(mismatchCnt);
      $("#daily-save").disabled = hasInvalid;
    };

    tbody.addEventListener("input", (e)=>{
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      const id = t.dataset.id;
      if (!id) return;
      const kind = t.dataset.daily;
      if (!kind) return;
      const rec = dailyMap[id];

      const v = t.value.trim();
      const nv = v === "" ? "" : Number(v);
      if (kind === "closing") rec.closing_stock = (v==="" ? "" : nv);
      if (kind === "manual") rec.manual_usage = (v==="" ? "" : nv);

      // cost snapshot should already be set; keep locked
      if (rec.unit_cost_snapshot === undefined || rec.unit_cost_snapshot === null) rec.unit_cost_snapshot = costCandidate(id, date);

      recompute();
      save();
    });

    tbody.addEventListener("click",(e)=>{
      const btn = e.target.closest("button[data-daily='memo']");
      if (!btn) return;
      const id = btn.dataset.id;
      const rec = dailyMap[id];
      modal.open("메모", `
        <div class="field">
          <label>메모</label>
          <input id="daily-memo-input" value="${(rec.note||"").replaceAll('"','&quot;')}" placeholder="메모(선택)" />
        </div>
        <div class="hint" style="margin-top:10px">메모는 기록에 저장됩니다.</div>
      `, `
        <button class="btn primary" id="daily-memo-save">저장</button>
      `);
      $("#daily-memo-save").addEventListener("click", ()=>{
        rec.note = $("#daily-memo-input").value || "";
        save();
        modal.close();
      }, {once:true});
    });

    $("#daily-date").addEventListener("change",(e)=>{
      state.dailyDate = e.target.value;
      renderDaily();
    });

    $("#daily-apply-inbound").addEventListener("click", ()=>{
      // inbound is already auto reflected by computation; this button is for user confidence
      alert("입고 기록이 오늘 계산에 자동 반영됩니다.");
    });

    $("#daily-check-saved").addEventListener("click", ()=>{
      const saved = Object.values(getDailyRec(date)).some(r=>r && r.saved_at);
      alert(saved ? "해당 날짜에 저장된 기록이 있습니다." : "해당 날짜는 아직 '전체 저장'이 눌리지 않았습니다(입력은 자동 저장 중).");
    });

    $("#daily-save").addEventListener("click", ()=>{
      // validate negatives
      for (const it of dailyItems){
        const rec = dailyMap[it.id];
        const view = dailyRowView(it, date, rec);
        if (view.invalidNeg){
          alert(`저장 차단: ${it.name} 사용량이 음수입니다. (퇴근 재고 > 전일+입고)\n입고 누락 또는 재고 입력 오류를 확인하세요.`);
          return;
        }
      }
      // lock snapshots and mark saved_at
      for (const it of dailyItems){
        const rec = dailyMap[it.id];
        if (rec.unit_cost_snapshot === null || rec.unit_cost_snapshot === undefined) rec.unit_cost_snapshot = costCandidate(it.id, date);
        rec.saved_at = new Date().toISOString();
      }
      save();
      alert("저장 완료");
      renderDashboard(); // summary updates
    });

    recompute();
  };

  const renderInbound = () => {
    const host = $("#screen-inbound");
    host.innerHTML = "";

    const date = state.inboundDate || todayStr();

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>입고 기록</strong>
            <div class="sub">권장: 삭제 대신 취소(VOID)로 남기기 (월 보고 변동 방지)</div>
          </div>
          <div class="filters">
            <div class="field">
              <label>입고일</label>
              <input id="in-date" type="date" value="${date}" />
            </div>
            <div class="field" style="min-width:220px">
              <label>품목(검색)</label>
              <input id="in-item" list="item-list" placeholder="품목명 검색" />
              <datalist id="item-list">
                ${db.items.filter(x=>x.active).map(x=>`<option value="${x.name}"></option>`).join("")}
              </datalist>
            </div>
            <div class="field">
              <label>수량</label>
              <input id="in-qty" inputmode="numeric" placeholder="0" />
            </div>
            <div class="field">
              <label>입고단가(선택)</label>
              <input id="in-cost" inputmode="numeric" placeholder="0" />
            </div>
            <div class="field" style="min-width:220px">
              <label>메모(선택)</label>
              <input id="in-memo" placeholder="메모" />
            </div>
            <button class="btn primary" id="in-add">추가</button>
          </div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>입고일</th>
                  <th>품목명</th>
                  <th class="num">수량</th>
                  <th class="num">단가</th>
                  <th class="num">합계</th>
                  <th>상태</th>
                  <th>메모</th>
                  <th>수정</th>
                  <th>취소(VOID)</th>
                </tr>
              </thead>
              <tbody id="in-body"></tbody>
            </table>
          </div>
          <div class="hint" style="margin-top:10px">
            필수 규칙: 입고 기록은 수량 합산과 단가 후보에 영향을 주므로, 취소/수정 시 이력이 남도록 updated_at을 갱신합니다.
          </div>
        </div>
      </div>
    `);
    host.appendChild(card);

    const itemInput = $("#inbound-item-select");
    fillItemSelect(itemInput, { includeInactive:false });

    const renderTable = () => {
      const tb = $("#in-body");
      tb.innerHTML = "";
      const rows = db.inbound
        .slice()
        .sort((a,b)=> (b.date+a.created_at).localeCompare(a.date+b.created_at));
      if (!rows.length){
        tb.appendChild(el(`<tr><td colspan="9" class="muted">입고 기록이 없습니다.</td></tr>`));
        return;
      }
      rows.forEach(r=>{
        const it = byId(r.item_id);
        const sum = Number(r.qty||0) * Number(r.unit_cost||0);
        const st = r.status === "VOID" ? badge("bad","VOID") : badge("good","OK");
        const tr = el(`
          <tr class="${r.status==="VOID" ? "row-bad":""}">
            <td>${r.date}</td>
            <td>${it ? it.name : "(알수없음)"}</td>
            <td class="num">${num(r.qty)}</td>
            <td class="num">${r.unit_cost? money(r.unit_cost): ""}</td>
            <td class="num">${r.unit_cost? money(sum): ""}</td>
            <td>${st}</td>
            <td class="muted">${(r.memo||"")}</td>
            <td><button class="cell-btn" data-act="edit" data-id="${r.id}" ${r.status==="VOID"?"disabled":""}>수정</button></td>
            <td><button class="cell-btn" data-act="void" data-id="${r.id}" ${r.status==="VOID"?"disabled":""}>취소</button></td>
          </tr>
        `);
        tb.appendChild(tr);
      });
    };

    $("#in-date").addEventListener("change",(e)=>{ state.inboundDate = e.target.value; });

    $("#in-add").addEventListener("click", ()=>{
      const name = $("#in-item").value.trim();
      const it = db.items.find(x=>x.active && x.name===name);
      if (!it) { alert("품목을 정확히 선택하세요."); return; }
      const qty = Number($("#in-qty").value||0);
      if (!(qty>0)) { alert("수량은 1 이상이어야 합니다."); return; }
      const unit_cost = Number($("#in-cost").value||0);
      const memo = $("#in-memo").value||"";

      db.inbound.push({
        id: uid(),
        date: $("#in-date").value || todayStr(),
        item_id: it.id,
        qty,
        unit_cost: unit_cost>0 ? unit_cost : 0,
        memo,
        status: "OK",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      save();
      $("#in-qty").value = "";
      $("#in-cost").value = "";
      $("#in-memo").value = "";
      renderTable();
      alert("추가 완료");
    });

    $("#in-body").addEventListener("click",(e)=>{
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      const id = b.dataset.id;
      const r = db.inbound.find(x=>x.id===id);
      if (!r) return;

      if (b.dataset.act === "void"){
        if (!confirm("해당 입고 기록을 취소(VOID) 처리합니다. 계속할까요?")) return;
        r.status = "VOID";
        r.updated_at = new Date().toISOString();
        save();
        renderTable();
        return;
      }
      if (b.dataset.act === "edit"){
        const it = byId(r.item_id);
        modal.open("입고 수정", `
          <div class="form-grid">
            <div class="field"><label>입고일</label><input id="m-date" type="date" value="${r.date}"></div>
            <div class="field"><label>품목명(고정)</label><input value="${it?it.name:""}" disabled></div>
            <div class="field"><label>수량</label><input id="m-qty" inputmode="numeric" value="${r.qty}"></div>
            <div class="field"><label>단가</label><input id="m-cost" inputmode="numeric" value="${r.unit_cost||0}"></div>
            <div class="field" style="grid-column:1 / -1"><label>메모</label><input id="m-memo" value="${(r.memo||"").replaceAll('"','&quot;')}"></div>
          </div>
          <div class="hint" style="margin-top:10px">수정 시 updated_at만 갱신되며, 취소(VOID) 이력은 별도 기록되지 않습니다(개인용 최소구현).</div>
        `, `
          <button class="btn primary" id="m-save">저장</button>
        `);
        $("#m-save").addEventListener("click", ()=>{
          const qty = Number($("#m-qty").value||0);
          if (!(qty>0)) { alert("수량은 1 이상"); return; }
          const cost = Number($("#m-cost").value||0);
          r.date = $("#m-date").value || r.date;
          r.qty = qty;
          r.unit_cost = cost>0 ? cost : 0;
          r.memo = $("#m-memo").value || "";
          r.updated_at = new Date().toISOString();
          save();
          modal.close();
          renderTable();
        }, {once:true});
      }
    });

    renderTable();
  };

  const renderCheck = () => {
    const host = $("#screen-check");
    host.innerHTML = "";

    const date = state.checkDate || todayStr();
    const grade = state.checkGrade || "B";
    const onlyShort = !!state.checkOnlyShort;

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>주간/월간 점검 (B/C)</strong>
            <div class="sub">현재 재고 입력 → 부족 수량/주문 필요 즉시 산출</div>
          </div>
          <div class="filters">
            <div class="field">
              <label>점검일</label>
              <input id="ck-date" type="date" value="${date}" />
            </div>
            <div class="field">
              <label>등급</label>
              <select id="ck-grade">
                <option value="B" ${grade==="B"?"selected":""}>B(주간)</option>
                <option value="C" ${grade==="C"?"selected":""}>C(월간)</option>
              </select>
            </div>
            <div class="seg" role="tablist" aria-label="필터">
              <button type="button" id="ck-tab-all" class="${!onlyShort?"on":""}">전체</button>
              <button type="button" id="ck-tab-short" class="${onlyShort?"on":""}">부족만</button>
            </div>
            <button class="btn" id="ck-to-reco">부족 품목 발주추천으로 보내기</button>
          </div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>카테고리</th>
                  <th class="num">권장재고</th>
                  <th class="num">현재 재고(입력)</th>
                  <th class="num">부족 수량</th>
                  <th>주문 필요</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody id="ck-body"></tbody>
            </table>
          </div>
          <div class="hint" style="margin-top:10px">
            검증 규칙: 현재 재고는 0 이상 숫자만 허용. 부족 수량=max(권장-현재,0). 주문 필요=현재&lt;권장.
          </div>
        </div>
      </div>
    `);
    host.appendChild(card);

    const itemInput = $("#inbound-item-select");
    fillItemSelect(itemInput, { includeInactive:false });

    const items = db.items.filter(it => it.active && it.grade===grade);
    const tb = $("#ck-body");

    const upsertCheckRow = (item_id, current_stock, memo) => {
      const existing = db.checks.find(x=>x.date===date && x.grade===grade && x.item_id===item_id);
      if (existing){
        existing.current_stock = current_stock;
        existing.memo = memo || "";
        existing.updated_at = new Date().toISOString();
      } else {
        db.checks.push({
          id: uid(),
          date, grade, item_id,
          current_stock,
          memo: memo || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    };

    const getCheckVal = (item_id) => {
      const existing = db.checks.find(x=>x.date===date && x.grade===grade && x.item_id===item_id);
      return existing ? existing : {current_stock:"", memo:""};
    };

    const renderTable = () => {
      tb.innerHTML = "";
      let rows = items.map(it=>{
        const rec = getCheckVal(it.id);
        const cur = rec.current_stock;
        const recm = Number(it.recommended_stock||0);
        const curNum = (cur===""? null : Number(cur||0));
        const short = (curNum===null ? null : Math.max(recm - curNum, 0));
        const need = (curNum===null ? false : curNum < recm);
        return {it, rec, recm, cur, short, need};
      });

      if (onlyShort) rows = rows.filter(r=>r.need);

      if (!rows.length){
        tb.appendChild(el(`<tr><td colspan="7" class="muted">표시할 품목이 없습니다.</td></tr>`));
        return;
      }

      rows.forEach(r=>{
        const tr = el(`
          <tr class="${r.need ? "row-warn":""}">
            <td>${r.it.name}</td>
            <td class="muted">${r.it.category}</td>
            <td class="num">${num(r.recm)}</td>
            <td class="num">
              <input class="cell-input" inputmode="numeric" data-ck="cur" data-id="${r.it.id}" value="${r.cur!==""? r.cur:""}" placeholder="입력" />
            </td>
            <td class="num" data-ck-out="short" data-id="${r.it.id}">${r.short===null? "" : num(r.short)}</td>
            <td data-ck-out="need" data-id="${r.it.id}">${r.cur===""? "" : (r.need? badge("warn","권장 미달"): badge("good","정상"))}</td>
            <td><button class="cell-btn" data-ck="memo" data-id="${r.it.id}">메모</button></td>
          </tr>
        `);
        tb.appendChild(tr);
      });
    };

    tb.addEventListener("input",(e)=>{
      const inp = e.target;
      if (!(inp instanceof HTMLInputElement)) return;
      if (inp.dataset.ck !== "cur") return;
      const id = inp.dataset.id;
      const v = inp.value.trim();
      if (v !== "" && Number(v) < 0){
        inp.value = "";
        alert("현재 재고는 0 이상이어야 합니다.");
        return;
      }
      upsertCheckRow(id, v==="" ? "" : Number(v), (getCheckVal(id).memo||""));
      save();
      renderTable();
    });

    tb.addEventListener("click",(e)=>{
      const btn = e.target.closest("button[data-ck='memo']");
      if (!btn) return;
      const id = btn.dataset.id;
      const rec = getCheckVal(id);
      modal.open("메모", `
        <div class="field"><label>메모</label><input id="ck-memo" value="${(rec.memo||"").replaceAll('"','&quot;')}" /></div>
      `, `<button class="btn primary" id="ck-memo-save">저장</button>`);
      $("#ck-memo-save").addEventListener("click", ()=>{
        const cur = getCheckVal(id).current_stock;
        upsertCheckRow(id, cur, $("#ck-memo").value||"");
        save();
        modal.close();
        renderTable();
      }, {once:true});
    });

    $("#ck-date").addEventListener("change",(e)=>{ state.checkDate = e.target.value; renderCheck(); });
    $("#ck-grade").addEventListener("change",(e)=>{ state.checkGrade = e.target.value; renderCheck(); });

    $("#ck-tab-all").addEventListener("click", ()=>{ state.checkOnlyShort = false; renderCheck(); });
    $("#ck-tab-short").addEventListener("click", ()=>{ state.checkOnlyShort = true; renderCheck(); });

    $("#ck-to-reco").addEventListener("click", ()=>{
      // This app doesn't have a separate purchase screen; we show an on-screen summary modal.
      const recmRows = items.map(it=>{
        const rec = getCheckVal(it.id);
        if (rec.current_stock === "") return null;
        const cur = Number(rec.current_stock||0);
        const recm = Number(it.recommended_stock||0);
        const short = Math.max(recm - cur, 0);
        if (short <= 0) return null;
        const boxQty = Number(it.box_qty||1);
        const box = boxQty>0 ? Math.ceil(short/boxQty) : 0;
        return {name: it.name, cur, recm, short, box};
      }).filter(Boolean);

      modal.open("발주 추천(점검 기반)", `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>품목명</th>
                <th class="num">현재</th>
                <th class="num">권장</th>
                <th class="num">추천 발주 수량</th>
                <th class="num">발주 박스 수</th>
              </tr>
            </thead>
            <tbody>
              ${recmRows.length ? recmRows.map(r=>`
                <tr class="row-warn">
                  <td>${r.name}</td>
                  <td class="num">${num(r.cur)}</td>
                  <td class="num">${num(r.recm)}</td>
                  <td class="num">${num(r.short)}</td>
                  <td class="num">${num(r.box)}</td>
                </tr>
              `).join("") : `<tr><td colspan="5" class="muted">부족 품목이 없습니다.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="hint" style="margin-top:10px">발주 박스 수=ceil(추천수량/박스당 수량). 박스당 수량은 품목관리에서 설정하세요.</div>
      `, `<button class="btn" id="ck-close">닫기</button>`);
      $("#ck-close").addEventListener("click", ()=>modal.close(), {once:true});
    });

    renderTable();
  };

  
  const renderPrepaid = () => {
    const host = $("#screen-prepaid");
    host.innerHTML = "";

    // --- Keep(선결제) 전용: 고정 2품목 (겔시트팩, 모델링팩) ---
    if (!db.keep) db.keep = {};
    if (!db.keepTransfers) db.keepTransfers = [];

    const ensureKeep = () => {
      // 시트팩 = 겔시트팩 기준 (10장 단위 출고)
      if (!db.keep.sheetpack) db.keep.sheetpack = { tier: "300", memo: "" };
      // 모델링 = 모델링팩 기준 (1kg 단위 출고)
      if (!db.keep.modeling) db.keep.modeling = { memo: "" };
    };
    ensureKeep();

    const SHEET_TIERS = {
      "300": { contract_qty: 300, unit_cost: 1300 }, // 원/장
      "500": { contract_qty: 500, unit_cost: 1000 }, // 원/장
    };
    const MODELING = { contract_qty: 100, unit_cost: 10000 }; // 1,000,000 / 100kg = 10,000원/kg

    const findItemIdByName = (name) => {
      const it = db.items.find(x => (x.name||"") === name);
      return it ? it.id : null;
    };

    const sheetItemId = findItemIdByName("겔시트팩");
    const modelingItemId = findItemIdByName("모델링팩");

    const sumTransfers = (key) => {
      return db.keepTransfers
        .filter(r => r.key === key && r.status !== "VOID")
        .reduce((s,r)=> s + Number(r.qty||0), 0);
    };

    const vendorBalance = (key, contractQty) => {
      return Math.max(contractQty - sumTransfers(key), 0);
    };

    const lastStockToday = (itemId) => {
      if (!itemId) return 0;
      return lastRealStock(itemId, todayStr());
    };

    const safeStock = (itemId) => {
      const it = itemId ? byId(itemId) : null;
      if (!it) return 0;
      return Number(it.safe_stock || 0);
    };

    const isWarn = (hospital, safe) => (Number(hospital||0) <= Number(safe||0));

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>선결제(킵)</strong>
            <div class="sub">고정 2품목(시트팩/모델링) · 잔량은 “계약총량 - 누적출고”로 자동 계산</div>
          </div>
          <div class="filters">
            <button class="btn" id="pp-only-warn">경고만 보기</button>
            <button class="btn" id="pp-show-all">전체 보기</button>
          </div>
        </div>
        <div class="card-b">
          <div id="pp-warnbar" class="hint" style="margin-bottom:10px"></div>
          <div id="pp-cards"></div>
          <div class="hint" style="margin-top:10px">
            규칙: “업체잔량”은 수동 입력하지 않습니다. 출고요청을 누르면 업체잔량이 자동 차감되고, 입고(Inbound)에 “선결제 출고”로 기록됩니다.
          </div>
        </div>
      </div>
    `);
    host.appendChild(card);

    // buttons state
    const btnWarn = $("#pp-only-warn");
    const btnAll = $("#pp-show-all");
    const applyBtnState = () => {
      if (state.ppWarnOnly){
        btnWarn.classList.add("active");
        btnAll.classList.remove("active");
      }else{
        btnAll.classList.add("active");
        btnWarn.classList.remove("active");
      }
    };
    btnWarn.onclick = () => { state.ppWarnOnly = true; renderPrepaid(); };
    btnAll.onclick = () => { state.ppWarnOnly = false; renderPrepaid(); };
    applyBtnState();

    const wrap = $("#pp-cards");

    const renderOne = (cfg) => {
      wrap.appendChild(el(cfg.html));
      cfg.bind();
    };

    // ----- SHEETPACK -----
    const sheetTier = db.keep.sheetpack.tier || "300";
    const tierInfo = SHEET_TIERS[sheetTier] || SHEET_TIERS["300"];
    const sheetContract = tierInfo.contract_qty;
    const sheetUnitCost = tierInfo.unit_cost;

    const sheetVendor = vendorBalance("sheetpack", sheetContract);
    const sheetHospital = lastStockToday(sheetItemId);
    const sheetSafe = safeStock(sheetItemId);
    const sheetWarn = isWarn(sheetHospital, sheetSafe);

    // ----- MODELING -----
    const mContract = MODELING.contract_qty;
    const mUnitCost = MODELING.unit_cost;

    const mVendor = vendorBalance("modeling", mContract);
    const mHospital = lastStockToday(modelingItemId);
    const mSafe = safeStock(modelingItemId);
    const mWarn = isWarn(mHospital, mSafe);

    const totalAll = 2;
    const warnCount = (sheetWarn?1:0) + (mWarn?1:0);
    $("#pp-warnbar").textContent = `표시: ${state.ppWarnOnly ? "경고만" : "전체"} · 경고 ${warnCount} / 전체 ${totalAll}`;

    const shouldShowSheet = !state.ppWarnOnly || sheetWarn;
    const shouldShowModeling = !state.ppWarnOnly || mWarn;

    const addTransfer = ({key, itemId, qty, unit_cost, label}) => {
      const contractQty = (key==="sheetpack") ? (SHEET_TIERS[db.keep.sheetpack.tier||"300"]?.contract_qty || 300) : MODELING.contract_qty;
      const vbal = vendorBalance(key, contractQty);
      if (!(qty>0)) { alert("출고 수량은 1 이상이어야 합니다."); return; }
      if (qty > vbal) { alert(`업체잔량이 부족합니다. (잔량 ${vbal})`); return; }

      // 1) keep transfer 기록
      db.keepTransfers.push({
        id: uid(),
        date: todayStr(),
        key,
        qty,
        memo: "",
        status: "OK",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // 2) inbound 자동 생성 (선결제 출고)
      if (itemId){
        db.inbound.push({
          id: uid(),
          date: todayStr(),
          item_id: itemId,
          qty,
          unit_cost: Number(unit_cost||0),
          memo: `선결제 출고(${label})`,
          status: "OK",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      save();
      renderPrepaid();
    };

    if (shouldShowSheet){
      renderOne({
        html: `
          <div class="card" style="margin-top:12px">
            <div class="card-h">
              <div>
                <strong>시트팩(겔시트팩)</strong>
                <div class="sub">출고 단위: 10장 · 계약 티어에 따라 단가 자동 적용</div>
              </div>
              ${sheetWarn ? `<span class="badge warn">출고 필요</span>` : `<span class="badge ok">정상</span>`}
            </div>
            <div class="card-b">
              <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; gap:10px">
                <div class="field">
                  <div class="label">계약 티어</div>
                  <select id="kp-sheet-tier" class="input">
                    <option value="300">300장 (1,300원/장)</option>
                    <option value="500">500장 (1,000원/장)</option>
                  </select>
                </div>
                <div class="field">
                  <div class="label">업체 잔량(자동)</div>
                  <input class="input num" value="${sheetVendor}" disabled />
                </div>
                <div class="field">
                  <div class="label">병원 보유(최근 실재고)</div>
                  <input class="input num" value="${sheetHospital}" disabled />
                </div>
              </div>

              <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:10px">
                <div class="field">
                  <div class="label">병원 안전재고(ItemMaster)</div>
                  <input class="input num" value="${sheetSafe}" disabled />
                </div>
                <div class="field">
                  <div class="label">계약 총량</div>
                  <input class="input num" value="${sheetContract}" disabled />
                </div>
                <div class="field">
                  <div class="label">단가(스냅샷)</div>
                  <input class="input num" value="${sheetUnitCost}" disabled />
                </div>
              </div>

              <div class="grid" style="grid-template-columns: 1fr auto auto; gap:10px; margin-top:12px; align-items:end">
                <div class="field">
                  <div class="label">출고요청 수량(장)</div>
                  <input id="kp-sheet-qty" class="input num" type="number" min="1" step="1" value="10" />
                </div>
                <button class="btn" id="kp-sheet-out">출고요청</button>
                <div class="hint">누르면 업체잔량 -수량, 입고에 자동 반영</div>
              </div>
            </div>
          </div>
        `,
        bind: () => {
          const sel = $("#kp-sheet-tier");
          sel.value = sheetTier;
          sel.onchange = () => {
            db.keep.sheetpack.tier = sel.value;
            save();
            renderPrepaid();
          };
          $("#kp-sheet-out").onclick = () => {
            const qty = Number($("#kp-sheet-qty").value||0);
            addTransfer({key:"sheetpack", itemId: sheetItemId, qty, unit_cost: sheetUnitCost, label:"시트팩"});
          };
        }
      });
    }

    if (shouldShowModeling){
      renderOne({
        html: `
          <div class="card" style="margin-top:12px">
            <div class="card-h">
              <div>
                <strong>모델링(모델링팩)</strong>
                <div class="sub">출고 단위: 1kg · 단가 10,000원/kg (100kg=1,000,000원)</div>
              </div>
              ${mWarn ? `<span class="badge warn">출고 필요</span>` : `<span class="badge ok">정상</span>`}
            </div>
            <div class="card-b">
              <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; gap:10px">
                <div class="field">
                  <div class="label">업체 잔량(자동)</div>
                  <input class="input num" value="${mVendor}" disabled />
                </div>
                <div class="field">
                  <div class="label">병원 보유(최근 실재고)</div>
                  <input class="input num" value="${mHospital}" disabled />
                </div>
                <div class="field">
                  <div class="label">병원 안전재고(ItemMaster)</div>
                  <input class="input num" value="${mSafe}" disabled />
                </div>
              </div>

              <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:10px">
                <div class="field">
                  <div class="label">계약 총량(kg)</div>
                  <input class="input num" value="${mContract}" disabled />
                </div>
                <div class="field">
                  <div class="label">단가(원/kg)</div>
                  <input class="input num" value="${mUnitCost}" disabled />
                </div>
                <div class="field">
                  <div class="label">누적 출고(kg)</div>
                  <input class="input num" value="${sumTransfers("modeling")}" disabled />
                </div>
              </div>

              <div class="grid" style="grid-template-columns: 1fr auto auto; gap:10px; margin-top:12px; align-items:end">
                <div class="field">
                  <div class="label">출고요청 수량(kg)</div>
                  <input id="kp-model-qty" class="input num" type="number" min="1" step="1" value="1" />
                </div>
                <button class="btn" id="kp-model-out">출고요청</button>
                <div class="hint">누르면 업체잔량 -수량, 입고에 자동 반영</div>
              </div>
            </div>
          </div>
        `,
        bind: () => {
          $("#kp-model-out").onclick = () => {
            const qty = Number($("#kp-model-qty").value||0);
            addTransfer({key:"modeling", itemId: modelingItemId, qty, unit_cost: mUnitCost, label:"모델링"});
          };
        }
      });
    }

    // If warn-only and none shown, show hint
    if (state.ppWarnOnly && !shouldShowSheet && !shouldShowModeling){
      wrap.appendChild(el(`
        <div class="card" style="margin-top:12px">
          <div class="card-h"><strong>경고 품목 없음</strong></div>
          <div class="card-b">현재 병원 보유 재고가 안전재고 이상입니다.</div>
        </div>
      `));
    }
  };


  const renderItems = () => {
    const host = $("#screen-items");
    host.innerHTML = "";

    const activeFilter = state.itemsActiveFilter || "active"; // active/inactive/all
    const gradeFilter = state.itemsGradeFilter || "all";
    const orderOnly = !!state.itemsOrderOnly;

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>품목관리 (ItemMaster)</strong>
            <div class="sub">삭제 금지: Active/Inactive로만 관리 · 모든 자동계산의 기준</div>
          </div>
          <div class="filters">
            <div class="seg" role="tablist" aria-label="Active/Inactivate">
              <button type="button" id="it-tab-active" class="${activeFilter==="active"?"on":""}">Active</button>
              <button type="button" id="it-tab-inactive" class="${activeFilter==="inactive"?"on":""}">Inactive</button>
              <button type="button" id="it-tab-all" class="${activeFilter==="all"?"on":""}">전체</button>
            </div>
            <div class="field">
              <label>등급</label>
              <select id="it-grade">
                <option value="all" ${gradeFilter==="all"?"selected":""}>전체</option>
                <option value="A" ${gradeFilter==="A"?"selected":""}>A</option>
                <option value="B" ${gradeFilter==="B"?"selected":""}>B</option>
                <option value="C" ${gradeFilter==="C"?"selected":""}>C</option>
                <option value="D" ${gradeFilter==="D"?"selected":""}>D</option>
              </select>
            </div>
            <div class="field">
              <label>발주 필요만</label>
              <select id="it-orderonly">
                <option value="0" ${!orderOnly?"selected":""}>전체</option>
                <option value="1" ${orderOnly?"selected":""}>발주 필요</option>
              </select>
            </div>
            <button class="btn primary" id="it-add">품목 추가</button>
          </div>
        </div>
        <div class="card-b">
          <div id="daily-offday-banner" class="hint" style="margin-bottom:10px"></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>상태</th>
                  <th>품목명</th>
                  <th>카테고리</th>
                  <th>등급</th>
                  <th class="num">기본 원가</th>
                  <th>발주단위</th>
                  <th class="num">박스당 수량</th>
                  <th class="num">리드타임</th>
                  <th class="num">권장재고</th>
                  <th class="num">안전재고</th>
                  <th>선결제</th>
                  <th class="num">현재 재고(최근)</th>
                  <th>상태 뱃지</th>
                  <th>수정</th>
                  <th>비활성/복구</th>
                </tr>
              </thead>
              <tbody id="it-body"></tbody>
            </table>
          </div>
          <div class="hint" style="margin-top:10px">
            검증 규칙: 품목명/등급/단위는 필수. 수치 필드는 0 이상. “현재 재고”는 가장 최근 기록된 실재고(일일/점검/선결제)에서 자동 산출.
          </div>
        </div>
      </div>
    `);
    host.appendChild(card);

    const itemInput = $("#inbound-item-select");
    fillItemSelect(itemInput, { includeInactive:false });

    const renderTable = () => {
      const tb = $("#it-body");
      tb.innerHTML = "";

      let list = db.items.slice();

      if (activeFilter !== "all"){
        list = list.filter(it => activeFilter==="active" ? it.active : !it.active);
      }
      if (gradeFilter !== "all"){
        list = list.filter(it => it.grade===gradeFilter);
      }

      // compute statuses
      list = list.map(it=>{
        const cur = lastRealStock(it.id, todayStr());
        const safe = Number(it.safe_stock||0);
        const recm = Number(it.recommended_stock||0);
        const needOrder = (safe>0 && cur <= safe);
        const belowRecommended = (it.grade==="B" || it.grade==="C") ? (recm>0 && cur < recm) : false;
        const avg = avgUsage7(it.id, todayStr());
        const days = (avg>0) ? (cur/avg) : null;
        const nearDeplete = (days !== null && days <= 10);

        const pre = db.prepaid[it.id];
        const needPrepay = (it.prepaid_enabled && pre && pre.vendor_balance!=="" && pre.vendor_min!=="") ? (Number(pre.vendor_balance||0) <= Number(pre.vendor_min||0)) : false;

        const badges = statusBadges({mismatch:false, needOrder, belowRecommended, nearDeplete, needPrepay});
        return {it, cur, badges, needOrder};
      });

      if (orderOnly) list = list.filter(x=>x.needOrder);

      if (!list.length){
        tb.appendChild(el(`<tr><td colspan="15" class="muted">표시할 품목이 없습니다.</td></tr>`));
        return;
      }

      list.forEach(({it, cur, badges})=>{
        const tr = el(`
          <tr class="${it.active ? "" : "row-bad"}">
            <td>${it.active ? badge("good","Active") : badge("bad","Inactive")}</td>
            <td>${it.name}</td>
            <td class="muted">${it.category}</td>
            <td>${it.grade}</td>
            <td class="num">${it.base_cost? money(it.base_cost): ""}</td>
            <td class="muted">${it.order_unit||""}</td>
            <td class="num">${num(it.box_qty||0)}</td>
            <td class="num">${it.lead_time_days? `${num(it.lead_time_days)}일` : ""}</td>
            <td class="num">${num(it.recommended_stock||0)}</td>
            <td class="num">${num(it.safe_stock||0)}</td>
            <td>${it.prepaid_enabled ? badge("info","킵") : ""}</td>
            <td class="num">${num(cur)}</td>
            <td>${badges}</td>
            <td><button class="cell-btn" data-act="edit" data-id="${it.id}">수정</button></td>
            <td><button class="cell-btn" data-act="toggle" data-id="${it.id}">${it.active ? "비활성" : "복구"}</button></td>
          </tr>
        `);
        tb.appendChild(tr);
      });
    };

    // tab handlers
    $("#it-tab-active").addEventListener("click", ()=>{ state.itemsActiveFilter="active"; renderItems(); });
    $("#it-tab-inactive").addEventListener("click", ()=>{ state.itemsActiveFilter="inactive"; renderItems(); });
    $("#it-tab-all").addEventListener("click", ()=>{ state.itemsActiveFilter="all"; renderItems(); });

    $("#it-grade").addEventListener("change",(e)=>{ state.itemsGradeFilter = e.target.value; renderItems(); });
    $("#it-orderonly").addEventListener("change",(e)=>{ state.itemsOrderOnly = (e.target.value==="1"); renderItems(); });

    $("#it-add").addEventListener("click", ()=>{
      openItemModal(null);
    });

    $("#it-body").addEventListener("click",(e)=>{
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const id = btn.dataset.id;
      const it = byId(id);
      if (!it) return;

      if (btn.dataset.act === "toggle"){
        it.active = !it.active;
        it.updated_at = new Date().toISOString();
        save();
        renderItems();
        return;
      }
      if (btn.dataset.act === "edit"){
        openItemModal(it);
        return;
      }
    });

    const openItemModal = (it) => {
      const isNew = !it;
      const data = it ? {...it} : {
        id: uid(),
        name:"",
        category:"",
        grade:"A",
        base_unit:"개",
        order_unit:"박스",
        recommended_stock:0,
        safe_stock:0,
        box_qty:1,
        lead_time_days:0,
        base_cost:0,
        prepaid_enabled:false,
        active:true,
      };

      modal.open(isNew ? "품목 추가" : "품목 수정", `
        <div class="form-grid">
          <div class="field"><label>품목명*</label><input id="im-name" value="${(data.name||"").replaceAll('"','&quot;')}" placeholder="예: 수분팩"></div>
          <div class="field"><label>카테고리*</label><input id="im-cat" value="${(data.category||"").replaceAll('"','&quot;')}" placeholder="예: 일일 관리"></div>

          <div class="field"><label>관리등급*</label>
            <select id="im-grade">
              <option value="A" ${data.grade==="A"?"selected":""}>A(일일)</option>
              <option value="B" ${data.grade==="B"?"selected":""}>B(주간)</option>
              <option value="C" ${data.grade==="C"?"selected":""}>C(월간)</option>
              <option value="D" ${data.grade==="D"?"selected":""}>D(파우더/청소)</option>
            </select>
          </div>
          <div class="field"><label>기본 단위*</label><input id="im-unit" value="${(data.base_unit||"").replaceAll('"','&quot;')}" placeholder="개/장/통"></div>

          <div class="field"><label>기본 원가(선택)</label><input id="im-cost" inputmode="numeric" value="${Number(data.base_cost||0)}"></div>
          <div class="field"><label>발주단위</label><input id="im-ordunit" value="${(data.order_unit||"").replaceAll('"','&quot;')}"></div>

          <div class="field"><label>박스당 수량</label><input id="im-box" inputmode="numeric" value="${Number(data.box_qty||1)}"></div>
          <div class="field"><label>리드타임(일)</label><input id="im-lead" inputmode="numeric" value="${Number(data.lead_time_days||0)}"></div>

          <div class="field"><label>권장재고</label><input id="im-rec" inputmode="numeric" value="${Number(data.recommended_stock||0)}"></div>
          <div class="field"><label>안전재고</label><input id="im-safe" inputmode="numeric" value="${Number(data.safe_stock||0)}"></div>

          <div class="field" style="grid-column:1 / -1">
            <label>선결제 여부</label>
            <select id="im-prepay">
              <option value="0" ${!data.prepaid_enabled?"selected":""}>아니오</option>
              <option value="1" ${data.prepaid_enabled?"selected":""}>예</option>
            </select>
          </div>
        </div>
        <div class="hint" style="margin-top:10px">
          필수값: 품목명/카테고리/등급/기본단위. 수치 필드는 0 이상. 삭제는 불가하며 비활성으로만 관리됩니다.
        </div>
      `, `
        <button class="btn" id="im-cancel">취소</button>
        <button class="btn primary" id="im-save">저장</button>
      `);

      $("#im-cancel").addEventListener("click", ()=>modal.close(), {once:true});
      $("#im-save").addEventListener("click", ()=>{
        const name = $("#im-name").value.trim();
        const cat = $("#im-cat").value.trim();
        const grade = $("#im-grade").value;
        const unit = $("#im-unit").value.trim();
        if (!name || !cat || !grade || !unit){
          alert("필수값(품목명/카테고리/등급/기본단위)을 입력하세요.");
          return;
        }
        const cost = Number($("#im-cost").value||0);
        const rec = Number($("#im-rec").value||0);
        const safe = Number($("#im-safe").value||0);
        const box = Number($("#im-box").value||1);
        const lead = Number($("#im-lead").value||0);

        const next = {
          ...data,
          name, category:cat, grade,
          base_unit:unit,
          base_cost: cost>0 ? cost : 0,
          order_unit: $("#im-ordunit").value.trim() || "박스",
          box_qty: box>0 ? box : 1,
          lead_time_days: lead>=0 ? lead : 0,
          recommended_stock: rec>=0 ? rec : 0,
          safe_stock: safe>=0 ? safe : 0,
          prepaid_enabled: $("#im-prepay").value==="1",
          updated_at: new Date().toISOString(),
        };

        // unique name check (soft)
        const dup = db.items.find(x=>x.id!==next.id && x.name===next.name);
        if (dup && !confirm("같은 이름의 품목이 이미 존재합니다. 그대로 저장할까요?")){
          return;
        }

        if (isNew){
          next.created_at = new Date().toISOString();
          db.items.push(next);
        } else {
          const idx = db.items.findIndex(x=>x.id===next.id);
          db.items[idx] = next;
        }
        save();
        modal.close();
        renderItems();
      }, {once:true});
    };

    renderTable();
  };

  // ------- Minimal global state -------
  const state = {
    dailyDate: todayStr(),
    inboundDate: todayStr(),
    checkDate: todayStr(),
    checkGrade: "B",
    checkOnlyShort: false,
    ppWarnOnly: false,
    usageYM: todayStr().slice(0,7),
    reportYM: todayStr().slice(0,7),
    itemsActiveFilter: "active",
    itemsGradeFilter: "all",
    itemsOrderOnly: false,
  };


  // ------- Patients (for usage per patient) -------
  const getPatientsMonth = (ym) => {
    if (!db.patients_month) db.patients_month = {};
    const v = db.patients_month[ym];
    return v == null || v === "" ? 0 : Number(v);
  };
  const setPatientsMonth = (ym, n) => {
    if (!db.patients_month) db.patients_month = {};
    db.patients_month[ym] = Number(n || 0);
  };
  const getPatientsDay = (date) => {
    if (!db.patients_day) db.patients_day = {};
    const v = db.patients_day[date];
    return v == null || v === "" ? 0 : Number(v);
  };
  const setPatientsDay = (date, n) => {
    if (!db.patients_day) db.patients_day = {};
    db.patients_day[date] = Number(n || 0);
  };

  // ------- Month helpers -------
  const prevMonthKey = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(Date.UTC(y, m-1, 1));
    d.setUTCMonth(d.getUTCMonth()-1);
    return d.toISOString().slice(0,7);
  };
  const monthDates = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    const start = new Date(Date.UTC(y, m-1, 1));
    const end = new Date(Date.UTC(y, m, 0)); // last day
    const out = [];
    for (let d=new Date(start); d<=end; d.setUTCDate(d.getUTCDate()+1)){
      out.push(d.toISOString().slice(0,10));
    }
    return out;
  };
  const monthUsageMapA = (ym) => {
    const totals = new Map(); // item_id -> total usage
    for (const d of monthDates(ym)){
      const map = (db.dailyA||{})[d] || {};
      for (const [item_id, rec] of Object.entries(map)){
        const usage = computeDailyUsage(item_id, d, rec);
        if (usage === null) continue;
        totals.set(item_id, (totals.get(item_id)||0) + Number(usage||0));
      }
    }
    return totals;
  };
  const monthUsageTotalA = (ym, item_id) => {
    const map = monthUsageMapA(ym);
    return Number(map.get(String(item_id)) || 0);
  };
  const monthAvgPerDayA = (ym, item_id) => {
    // average based on days that have records (not calendar days)
    let sum=0, days=0;
    for (const d of monthDates(ym)){
      const rec = ((db.dailyA||{})[d]||{})[item_id];
      if (!rec) continue;
      const usage = computeDailyUsage(item_id, d, rec);
      if (usage === null) continue;
      sum += Number(usage||0);
      days += 1;
    }
    return days ? sum/days : 0;
  };

  // ------- Usage Analysis Screen -------
  const renderUsage = () => {
    const host = $("#screen-usage");
    host.innerHTML = "";

    const ymDefault = todayStr().slice(0,7);
    const ym = state.usageYM || ymDefault;
    const prevYM = prevMonthKey(ym);

    const patients = getPatientsMonth(ym);
    const prevPatients = getPatientsMonth(prevYM);

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>환자 수 대비 사용량</strong>
            <div class="sub">A등급(일일관리) 기록 기반. 월 환자 수를 입력하면 환자당 사용량이 계산됩니다.</div>
          </div>
        </div>
        <div class="card-b">
          <div class="filters">
            <label>월 <input type="month" id="usage-ym" value="${ym}"></label>
            <label>월 환자 수 <input type="number" id="usage-patients" min="0" step="1" value="${patients}"></label>
            <button class="btn primary" id="usage-save">저장</button>
            <span class="hint">지난달(${prevYM}) 환자수: ${prevPatients || "-"}</span>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>카테고리</th>
                  <th class="num">이번달 사용량</th>
                  <th class="num">환자 수</th>
                  <th class="num">환자당 사용량</th>
                  <th class="num">지난달 환자당</th>
                  <th class="num">증감</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody id="usage-body"></tbody>
            </table>
          </div>

          <div class="hint" style="margin-top:10px">
            이상 사용량 감지 기준: 최근 7일 평균 &gt; 지난달 평균 × 1.5
          </div>
        </div>
      </div>
    `);
    host.appendChild(card);

    const itemInput = $("#inbound-item-select");
    fillItemSelect(itemInput, { includeInactive:false });

    $("#usage-save").addEventListener("click", ()=>{
      const ym2 = $("#usage-ym").value || ymDefault;
      const p = Number($("#usage-patients").value || 0);
      setPatientsMonth(ym2, p);
      state.usageYM = ym2;
      save();
      render();
    });
    $("#usage-ym").addEventListener("change", ()=>{
      state.usageYM = $("#usage-ym").value;
      save();
      render();
    });

    const body = $("#usage-body");
    const totals = monthUsageMapA(ym);
    const items = db.items.filter(it=>it.grade==="A" && it.active);
    const pNow = getPatientsMonth(ym);
    const pPrev = getPatientsMonth(prevYM);

    const rows = items.map(it=>{
      const uNow = Number(totals.get(String(it.id))||0);
      const uPrev = monthUsageTotalA(prevYM, it.id);
      const perNow = pNow ? uNow/pNow : 0;
      const perPrev = pPrev ? uPrev/pPrev : 0;
      const diff = (pNow && pPrev) ? (perNow - perPrev) : null;

      const last7 = avgUsage7(it.id, todayStr());
      const prevAvg = monthAvgPerDayA(prevYM, it.id);
      const abnormal = prevAvg>0 && last7 > prevAvg*1.5;

      const status = [];
      if (abnormal) status.push(badge("bad","이상 사용"));
      if (diff !== null && diff > 0) status.push(badge("warn","환자당 증가"));
      if (!pNow) status.push(badge("info","환자수 미입력"));
      return {it, uNow, pNow, perNow, perPrev, diff, status: status.join(" ")};
    }).sort((a,b)=> (b.uNow - a.uNow));

    body.innerHTML = rows.map(r=>`
      <tr>
        <td>${escapeHtml(r.it.name)}</td>
        <td>${escapeHtml(r.it.category||"-")}</td>
        <td class="num">${fmtQty(r.uNow)}</td>
        <td class="num">${r.pNow ? fmtQty(r.pNow) : "-"}</td>
        <td class="num">${r.pNow ? (Math.round(r.perNow*100)/100).toFixed(2) : "-"}</td>
        <td class="num">${(getPatientsMonth(prevYM) && r.perPrev) ? (Math.round(r.perPrev*100)/100).toFixed(2) : "-"}</td>
        <td class="num">${r.diff===null ? "-" : (Math.round(r.diff*100)/100).toFixed(2)}</td>
        <td>${r.status || "-"}</td>
      </tr>
    `).join("");
  };

  // ------- Monthly Report (Owner) -------
  const renderReport = () => {
    const host = $("#screen-report");
    host.innerHTML = "";

    const ymDefault = todayStr().slice(0,7);
    const ym = state.reportYM || ymDefault;
    const prevYM = prevMonthKey(ym);

    const totalsNow = monthUsageMapA(ym);
    const totalsPrev = monthUsageMapA(prevYM);

    const items = db.items.filter(it=>it.grade==="A" && it.active);
    const pNow = getPatientsMonth(ym);

    const rows = items.map(it=>{
      const uNow = Number(totalsNow.get(String(it.id))||0);
      const uPrev = Number(totalsPrev.get(String(it.id))||0);
      const inc = (uPrev>0) ? ((uNow-uPrev)/uPrev) : null;
      const stock = lastRealStock(it.id, todayStr());
      const avg7 = avgUsage7(it.id, todayStr());
      const deplete = avg7>0 ? (stock/avg7) : null;
      const abnormal = (monthAvgPerDayA(prevYM, it.id)>0) && (avg7 > monthAvgPerDayA(prevYM, it.id)*1.5);

      const badges = statusBadges({
        mismatch:false,
        needOrder:false,
        belowRecommended:false,
        nearDeplete: (deplete!==null && deplete<=10),
        needPrepay:false
      });
      const extra = abnormal ? badge("bad","이상 사용") : "";
      return {it,uNow,uPrev,inc,stock,avg7,deplete,badges:(badges||"") + (extra?(" "+extra):"")};
    }).sort((a,b)=> b.uNow - a.uNow);

    const top5 = rows.slice(0,5);
    const abnormalList = rows.filter(r=> (r.badges||"").includes("이상 사용")).slice(0,5);
    const near = rows.filter(r=> r.deplete!==null && r.deplete<=10).sort((a,b)=>a.deplete-b.deplete).slice(0,5);

    const card = el(`
      <div class="card">
        <div class="card-h">
          <div>
            <strong>월 보고(원장용)</strong>
            <div class="sub">A등급 기록 기반. TOP 사용, 증가율, 소진 임박, 이상 사용량을 요약합니다.</div>
          </div>
        </div>
        <div class="card-b">
          <div class="filters">
            <label>월 <input type="month" id="report-ym" value="${ym}"></label>
            <span class="hint">환자수(${ym}): ${pNow || "미입력"}</span>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="card">
              <div class="card-h"><strong>이번달 TOP 사용(상위5)</strong></div>
              <div class="card-b">
                <table class="table compact">
                  <thead><tr><th>품목</th><th class="num">사용량</th></tr></thead>
                  <tbody>
                    ${top5.map(r=>`<tr><td>${escapeHtml(r.it.name)}</td><td class="num">${fmtQty(r.uNow)}</td></tr>`).join("") || `<tr><td colspan="2" class="hint">데이터 없음</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card">
              <div class="card-h"><strong>이상 사용량(최근7일 급증)</strong></div>
              <div class="card-b">
                <table class="table compact">
                  <thead><tr><th>품목</th><th class="num">최근7일 평균</th><th>상태</th></tr></thead>
                  <tbody>
                    ${abnormalList.map(r=>`<tr><td>${escapeHtml(r.it.name)}</td><td class="num">${(Math.round(r.avg7*100)/100).toFixed(2)}</td><td>${badge("bad","이상 사용")}</td></tr>`).join("") || `<tr><td colspan="3" class="hint">없음</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card">
              <div class="card-h"><strong>소진 임박(≤10일)</strong></div>
              <div class="card-b">
                <table class="table compact">
                  <thead><tr><th>품목</th><th class="num">예상(일)</th><th class="num">현재재고</th></tr></thead>
                  <tbody>
                    ${near.map(r=>`<tr><td>${escapeHtml(r.it.name)}</td><td class="num">${Math.ceil(r.deplete)}</td><td class="num">${fmtQty(r.stock)}</td></tr>`).join("") || `<tr><td colspan="3" class="hint">없음</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="table-wrap" style="margin-top:12px">
            <table class="table">
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>카테고리</th>
                  <th class="num">현재재고</th>
                  <th class="num">이번달 사용</th>
                  <th class="num">지난달 사용</th>
                  <th class="num">증가율</th>
                  <th class="num">최근7일 평균</th>
                  <th class="num">소진예상(일)</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody id="report-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    `);
    host.appendChild(card);

    const itemInput = $("#inbound-item-select");
    fillItemSelect(itemInput, { includeInactive:false });

    $("#report-ym").addEventListener("change", ()=>{
      state.reportYM = $("#report-ym").value;
      save();
      render();
    });

    $("#report-body").innerHTML = rows.map(r=>`
      <tr>
        <td>${escapeHtml(r.it.name)}</td>
        <td>${escapeHtml(r.it.category||"-")}</td>
        <td class="num">${fmtQty(r.stock)}</td>
        <td class="num">${fmtQty(r.uNow)}</td>
        <td class="num">${fmtQty(r.uPrev)}</td>
        <td class="num">${r.inc===null ? "-" : Math.round(r.inc*100)+"%"}</td>
        <td class="num">${(Math.round(r.avg7*100)/100).toFixed(2)}</td>
        <td class="num">${r.deplete===null ? "-" : Math.ceil(r.deplete)}</td>
        <td>${r.badges || "-"}</td>
      </tr>
    `).join("");
  };


  const render = () => {
    if (activeScreen === "dashboard") renderDashboard();
    if (activeScreen === "daily") renderDaily();
    if (activeScreen === "inbound") renderInbound();
    if (activeScreen === "check") renderCheck();
    if (activeScreen === "prepaid") renderPrepaid();
    if (activeScreen === "items") renderItems();
    if (activeScreen === "usage") renderUsage();
    if (activeScreen === "report") renderReport();
  };

  // First paint
  render();

})();