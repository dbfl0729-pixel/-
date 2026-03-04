
// 상담/가격표 앱 (로컬 저장, 외부 라이브러리 없음)
// 요구사항 반영: 단품 레이저 표, Effect/Details 분리, VAT 안내 자동화(이벤트 제외),
// 사이드바/카테고리 펼침 상태 기억, 편집 모드 자동 저장(localStorage)

const KEY_DATA_V1 = "consult_price_app_v1";
const KEY_DATA = "consult_price_app_v2";
const KEY_UI = "consult_price_app_ui_v2";

const formatPrice = (n) => new Intl.NumberFormat("ko-KR").format(Number(n || 0));

const uid = () => (crypto.randomUUID?.() || String(Date.now()) + "_" + Math.random().toString(16).slice(2));

const defaultData = {
  hospitalName: "다채움의원",
  subtitle: "Premium Consultation",
  categories: [
    {
      id: "event",
      name: "이벤트",
      layout: "cards", // cards | laserTable
      isEvent: true,
      items: [
        { id: "ev1", name: "봄 이벤트 패키지", price: 590000, effect: "대표 이벤트 혜택", details: "구성/횟수/기간 등 이벤트 안내를 입력하세요." }
      ]
    },
    {
      id: "lifting",
      name: "리프팅",
      layout: "cards",
      isEvent: false,
      items: [
        { id: "u300", name: "울쎄라 300샷", price: 990000, effect: "탄력 리프팅", details: "권장 대상/횟수/주의사항 등을 입력하세요." },
        { id: "shurink", name: "슈링크 유니버스", price: 150000, effect: "가성비 탄력", details: "권장 대상/횟수/주의사항 등을 입력하세요." }
      ]
    },
    {
      id: "booster",
      name: "스킨부스터",
      layout: "cards",
      isEvent: false,
      items: [
        { id: "juvelook", name: "쥬베룩 1회", price: 350000, effect: "자가 콜라겐 재생", details: "권장 주기/병행 시술 등을 입력하세요." },
        { id: "rejuran", name: "리쥬란 1회", price: 300000, effect: "피부 재생", details: "권장 주기/병행 시술 등을 입력하세요." }
      ]
    },
    {
      id: "program_laser",
      name: "레이저 프로그램",
      layout: "cards",
      isEvent: false,
      items: [
        { id: "pico_prog", name: "피코토닝 프로그램", price: 200000, effect: "톤/색소", details: "프로그램(횟수/조합)을 입력하세요." }
      ]
    },
    {
      id: "laser_single",
      name: "단품 레이저",
      layout: "laserTable",
      isEvent: false,
      items: [
        { id: "pico1", name: "피코토닝 1회", price: 200000, effect: "톤 개선/색소 완화", details: "1회 단가 상담용 설명을 입력하세요." }
      ]
    }
  ],
  cart: [],
  discountMode: "none", // none | preset | customRate | customPrice
  discountRate: 0,
  customFinalPrice: ""
};

const defaultUI = {
  activeCategoryId: "event",
  isSidebarOpen: true,
  catOpen: {} // { [catId]: boolean }  (사이드바에서 카테고리 펼침/접힘)
};

function safeParse(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

function migrateFromV1() {
  const raw = localStorage.getItem(KEY_DATA_V1);
  if (!raw) return null;
  const v1 = safeParse(raw, null);
  if (!v1 || !Array.isArray(v1.categories)) return null;

  const migrated = structuredClone(defaultData);

  // 병원명/부제
  if (typeof v1.hospitalName === "string") migrated.hospitalName = v1.hospitalName;
  if (typeof v1.subtitle === "string") migrated.subtitle = v1.subtitle;

  // 카테고리/아이템: v1 info -> effect, details는 빈값
  migrated.categories = v1.categories.map((c, idx) => ({
    id: c.id || ("cat_" + idx),
    name: c.name || "카테고리",
    layout: (c.id === "laser_single" ? "laserTable" : "cards"),
    isEvent: (c.id === "event"),
    items: (c.items || []).map((it, jdx) => ({
      id: it.id || ("it_" + idx + "_" + jdx),
      name: it.name || "시술",
      price: Number(it.price || 0),
      effect: (it.effect || it.info || ""),
      details: (it.details || "")
    }))
  }));

  // 단품 레이저 카테고리 없으면 추가(마지막)
  if (!migrated.categories.some(c => c.id === "laser_single")) {
    migrated.categories.push(structuredClone(defaultData.categories.find(c => c.id === "laser_single")));
  }
  return migrated;
}

function loadData() {
  const raw = localStorage.getItem(KEY_DATA);
  if (raw) {
    const d = safeParse(raw, null);
    if (d && Array.isArray(d.categories)) return { ...structuredClone(defaultData), ...d };
  }
  const mig = migrateFromV1();
  if (mig) {
    localStorage.setItem(KEY_DATA, JSON.stringify(mig));
    return mig;
  }
  return structuredClone(defaultData);
}

function loadUI() {
  const raw = localStorage.getItem(KEY_UI);
  const ui = raw ? safeParse(raw, null) : null;
  if (ui) return { ...structuredClone(defaultUI), ...ui };
  return structuredClone(defaultUI);
}

function saveData() {
  try { localStorage.setItem(KEY_DATA, JSON.stringify(state)); } catch { alert("저장 실패"); }
}
function saveUI() {
  try { localStorage.setItem(KEY_UI, JSON.stringify(uiState)); } catch {}
}

let state = loadData();
let uiState = loadUI();
let isEditMode = false;

function $(id) { return document.getElementById(id); }

function render() {
  renderSidebar();
  renderMain();
  renderCart();
  saveUI();
}

function renderSidebar() {
  const clinicNameText = $("clinicNameText");
  if (clinicNameText) clinicNameText.textContent = state.hospitalName;

  const catList = $("catList");
  if (!catList) return;
  catList.innerHTML = "";

  state.categories.forEach((cat) => {
    const row = document.createElement("div");
    row.className = "catrow" + (uiState.activeCategoryId === cat.id ? " active" : "");
    const left = document.createElement("div");
    left.style.fontWeight = "900";
    left.style.fontSize = "15px";
    left.style.flex = "1";
    left.textContent = cat.name;

    const chev = document.createElement("div");
    chev.className = "chev";
    chev.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    `;
    const isOpen = uiState.catOpen[cat.id] ?? true;

    chev.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
    chev.style.transition = "transform .15s ease";

    row.appendChild(left);
    row.appendChild(chev);

    // 클릭: 활성 카테고리 선택
    row.addEventListener("click", () => {
      uiState.activeCategoryId = cat.id;
      // 기본: 펼친 상태 유지
      render();
    });

    // 펼침/접힘 토글 (카테고리+시술 네비) - chevron 클릭
    chev.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      uiState.catOpen[cat.id] = !(uiState.catOpen[cat.id] ?? true);
      renderSidebar();
      saveUI();
      // 활성 카테고리는 유지, 본문은 그대로
    });
      e.stopPropagation();
      uiState.catOpen[cat.id] = !(uiState.catOpen[cat.id] ?? true);
      render();
    });

    catList.appendChild(row);

    // Sub items (어떤 시술로든 즉시 이동)
    if (isOpen) {
      const sub = document.createElement("div");
      sub.className = "sublist";
      cat.items.forEach((it) => {
        const a = document.createElement("div");
        a.className = "sublink";
        a.textContent = it.name;
        a.addEventListener("click", (e) => {
          e.stopPropagation();
          uiState.activeCategoryId = cat.id;
          renderMain();
          // 렌더 후 스크롤
          setTimeout(() => {
            const el = document.getElementById("item-" + it.id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        });
        sub.appendChild(a);
      });
      catList.appendChild(sub);
    }
  });

  // Sidebar open/close apply
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.toggle("closed", !uiState.isSidebarOpen);
  }
}

function renderMain() {
  const activeCat = state.categories.find(c => c.id === uiState.activeCategoryId) || state.categories[0];
  uiState.activeCategoryId = activeCat?.id;

  const title = $("activeCatTitle");
  if (title) title.textContent = activeCat ? activeCat.name : "카테고리를 선택하세요";

  const grid = $("itemGrid");
  const empty = $("emptyState");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  if (!activeCat) {
    empty.classList.remove("hide");
    return;
  }

  // VAT Notice
  const vat = $("vatNotice");
  if (vat) {
    const show = !activeCat.isEvent;
    vat.classList.toggle("hide", !show);
  }

  empty.classList.add("hide");

  if (activeCat.layout === "laserTable") {
    grid.className = "grid"; // reset
    const tableWrap = document.createElement("div");
    tableWrap.className = "panel";
    tableWrap.style.overflow = "auto";
    tableWrap.style.borderRadius = "16px";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.innerHTML = `
      <thead>
        <tr style="background:#0f172a; color:#fff; font-size:13px">
          <th style="padding:14px 12px; text-align:left; width:26%">시술명</th>
          <th style="padding:14px 12px; text-align:left; width:22%">Effect</th>
          <th style="padding:14px 12px; text-align:left;">Program Details</th>
          <th style="padding:14px 12px; text-align:right; width:160px">금액 (VAT 포함)</th>
          <th style="padding:14px 12px; text-align:center; width:92px">선택</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");

    activeCat.items.forEach((it) => {
      const tr = document.createElement("tr");
      tr.id = "item-" + it.id;
      tr.style.borderBottom = "1px solid #e2e8f0";
      tr.innerHTML = `
        <td style="padding:14px 12px; vertical-align:top">
          ${isEditMode ? `<input data-k="name" class="inp" style="width:100%; font-weight:950" value="${escapeHtml(it.name)}" />`
                      : `<div style="font-weight:950; font-size:15px">${escapeHtml(it.name)}</div>`}
          ${isEditMode ? `<div style="margin-top:8px"><button class="btn small danger" data-act="del">삭제</button></div>` : ``}
        </td>
        <td style="padding:14px 12px; vertical-align:top">
          ${isEditMode ? `<textarea data-k="effect" class="inp" rows="2" style="width:100%">${escapeHtml(it.effect||"")}</textarea>`
                      : `<div style="font-weight:800; color:#1e3a8a">${escapeHtml(it.effect||"")}</div>`}
        </td>
        <td style="padding:14px 12px; vertical-align:top">
          ${isEditMode ? `<textarea data-k="details" class="inp" rows="3" style="width:100%">${escapeHtml(it.details||"")}</textarea>`
                      : `<div style="color:#475569; line-height:1.5">${escapeHtml(it.details||"")}</div>`}
        </td>
        <td style="padding:14px 12px; vertical-align:top; text-align:right">
          ${isEditMode ? `<input data-k="price" class="inp" type="number" style="width:140px; text-align:right; font-weight:950" value="${Number(it.price||0)}" />`
                      : `<div style="font-weight:950; font-size:16px">₩ ${formatPrice(it.price)}</div>`}
        </td>
        <td style="padding:14px 12px; vertical-align:middle; text-align:center">
          <button class="btn small" data-act="add">담기</button>
        </td>
      `;
      tr.querySelector('[data-act="add"]').addEventListener("click", () => addToCart(it.id));
      if (isEditMode) {
        tr.querySelector('[data-act="del"]').addEventListener("click", () => deleteItem(activeCat.id, it.id));
        tr.querySelectorAll(".inp").forEach((input) => {
          input.addEventListener("blur", () => {
            const k = input.getAttribute("data-k");
            let v = input.value;
            if (k === "price") v = Number(v || 0);
            updateItem(activeCat.id, it.id, { [k]: v });
          });
        });
      }
      tbody.appendChild(tr);
    });

    tableWrap.appendChild(table);
    grid.appendChild(tableWrap);
    return;
  }

  // Cards layout
  activeCat.items.forEach((it) => {
    const card = document.createElement("div");
    card.className = "item";
    card.id = "item-" + it.id;

    const top = document.createElement("div");
    top.className = "row between";
    const nameEl = document.createElement(isEditMode ? "input" : "h3");
    if (isEditMode) {
      nameEl.className = "inp";
      nameEl.value = it.name;
      nameEl.addEventListener("blur", () => updateItem(activeCat.id, it.id, { name: nameEl.value }));
    } else {
      nameEl.textContent = it.name;
    }

    const priceWrap = document.createElement("div");
    if (isEditMode) {
      const priceInp = document.createElement("input");
      priceInp.type = "number";
      priceInp.className = "inp";
      priceInp.style.width = "140px";
      priceInp.style.textAlign = "right";
      priceInp.value = Number(it.price || 0);
      priceInp.addEventListener("blur", () => updateItem(activeCat.id, it.id, { price: Number(priceInp.value || 0) }));
      priceWrap.appendChild(priceInp);
    } else {
      priceWrap.innerHTML = `<div style="font-weight:950; font-size:18px">₩ ${formatPrice(it.price)}</div>`;
    }

    top.appendChild(nameEl);
    top.appendChild(priceWrap);

    // Effect
    const effectBox = document.createElement("div");
    effectBox.className = "effectBox";
    if (isEditMode) {
      const t = document.createElement("textarea");
      t.className = "inp";
      t.rows = 2;
      t.style.width = "100%";
      t.value = it.effect || "";
      t.addEventListener("blur", () => updateItem(activeCat.id, it.id, { effect: t.value }));
      effectBox.innerHTML = `<div class="detailsLabel">Effect</div>`;
      effectBox.appendChild(t);
    } else {
      effectBox.innerHTML = `<div class="detailsLabel">Effect</div><div>${escapeHtml(it.effect || "")}</div>`;
    }

    // Program Details (넓은 박스)
    const details = document.createElement("div");
    details.className = "detailsBox";
    const label = document.createElement("div");
    label.className = "detailsLabel";
    label.textContent = "Program Details";
    details.appendChild(label);
    if (isEditMode) {
      const t = document.createElement("textarea");
      t.className = "inp";
      t.rows = 4;
      t.style.width = "100%";
      t.value = it.details || "";
      t.addEventListener("blur", () => updateItem(activeCat.id, it.id, { details: t.value }));
      details.appendChild(t);
    } else {
      const p = document.createElement("div");
      p.style.fontSize = "15px";
      p.style.lineHeight = "1.55";
      p.style.color = "#334155";
      p.textContent = it.details || "";
      details.appendChild(p);
    }

    const bottom = document.createElement("div");
    bottom.className = "row between";
    bottom.style.marginTop = "12px";

    if (isEditMode) {
      const delBtn = document.createElement("button");
      delBtn.className = "btn small danger";
      delBtn.textContent = "삭제";
      delBtn.addEventListener("click", () => deleteItem(activeCat.id, it.id));
      bottom.appendChild(delBtn);
    } else {
      bottom.appendChild(document.createElement("div"));
    }

    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "패키지에 담기";
    addBtn.addEventListener("click", () => addToCart(it.id));
    bottom.appendChild(addBtn);

    card.appendChild(top);
    card.appendChild(effectBox);
    card.appendChild(details);
    card.appendChild(bottom);

    grid.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// -------------------- Data mutations --------------------
function updateCategory(catId, patch) {
  const c = state.categories.find(x => x.id === catId);
  if (!c) return;
  Object.assign(c, patch);
  saveData();
  render();
}
function addCategory() {
  const id = "cat_" + uid();
  state.categories.push({ id, name: "새 카테고리", layout: "cards", isEvent: false, items: [] });
  uiState.activeCategoryId = id;
  uiState.catOpen[id] = true;
  saveData();
  render();
}
function deleteCategory(catId) {
  if (!confirm("카테고리를 삭제하시겠습니까? (포함 항목도 함께 삭제됩니다)")) return;
  state.categories = state.categories.filter(c => c.id !== catId);
  if (!state.categories.length) state.categories = structuredClone(defaultData.categories);
  uiState.activeCategoryId = state.categories[0].id;
  saveData();
  render();
}
function addItem(catId) {
  const c = state.categories.find(x => x.id === catId);
  if (!c) return;
  c.items.push({ id: "it_" + uid(), name: "새 시술", price: 100000, effect: "효과 요약", details: "프로그램 상세(횟수/조합 등)" });
  saveData();
  renderMain();
  renderSidebar();
}
function updateItem(catId, itemId, patch) {
  const c = state.categories.find(x => x.id === catId);
  const it = c?.items.find(x => x.id === itemId);
  if (!it) return;
  Object.assign(it, patch);
  saveData();
  // 편집 중 blur 저장만 하므로, 전체 re-render는 최소화
  renderSidebar();
  renderCart();
}
function deleteItem(catId, itemId) {
  if (!confirm("이 항목을 삭제하시겠습니까?")) return;
  const c = state.categories.find(x => x.id === catId);
  if (!c) return;
  c.items = c.items.filter(x => x.id !== itemId);
  saveData();
  render();
}

// -------------------- Cart & discount --------------------
function addToCart(itemId) {
  const found = findItem(itemId);
  if (!found) return;
  state.cart.push({
    id: uid(),
    itemId,
    qty: 1,
    priceSnapshot: Number(found.item.price || 0),
    nameSnapshot: found.item.name,
    catSnapshot: found.category.name
  });
  saveData();
  renderCart();
}

function findItem(itemId) {
  for (const c of state.categories) {
    const it = c.items.find(x => x.id === itemId);
    if (it) return { category: c, item: it };
  }
  return null;
}

function removeCartRow(rowId) {
  state.cart = state.cart.filter(r => r.id !== rowId);
  saveData();
  renderCart();
}

function setCartQty(rowId, qty) {
  const q = Math.max(1, Number(qty || 1));
  const row = state.cart.find(r => r.id === rowId);
  if (!row) return;
  row.qty = q;
  saveData();
  renderCart();
}

function clearCart() {
  if (!confirm("카트를 초기화하시겠습니까?")) return;
  state.cart = [];
  state.discountMode = "none";
  state.discountRate = 0;
  state.customFinalPrice = "";
  saveData();
  renderCart();
}

function computeTotals() {
  const totalSum = state.cart.reduce((acc, r) => acc + (Number(r.priceSnapshot || 0) * Number(r.qty || 1)), 0);

  let finalPrice = totalSum;
  let discountAmount = 0;
  let actualRate = 0;

  if (totalSum > 0) {
    if (state.discountMode === "preset" || state.discountMode === "customRate") {
      discountAmount = totalSum * (Number(state.discountRate || 0) / 100);
      finalPrice = totalSum - discountAmount;
      actualRate = Number(state.discountRate || 0);
    } else if (state.discountMode === "customPrice") {
      finalPrice = Number(state.customFinalPrice || 0);
      discountAmount = totalSum - finalPrice;
      actualRate = (discountAmount / totalSum) * 100;
    }
  }
  return { totalSum, finalPrice, discountAmount, actualRate };
}

function renderCart() {
  // cart list
  const cartList = $("cartList");
  if (!cartList) return;
  cartList.innerHTML = "";

  if (!state.cart.length) {
    cartList.innerHTML = `<div class="hint">선택된 시술이 없습니다.</div>`;
  } else {
    state.cart.forEach((r) => {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div class="grow">
          <div style="font-size:12px; color:#94a3b8; font-weight:800">${escapeHtml(r.catSnapshot || "")}</div>
          <div style="font-weight:950">${escapeHtml(r.nameSnapshot || "")}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center">
          <input class="inp" type="number" min="1" value="${Number(r.qty || 1)}" style="width:70px; text-align:right" />
          <div style="min-width:92px; text-align:right; font-weight:950">₩ ${formatPrice((Number(r.priceSnapshot || 0) * Number(r.qty || 1)))}</div>
          <button class="iconbtn danger" title="삭제" aria-label="삭제">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      `;
      row.querySelector('input').addEventListener("change", (e) => setCartQty(r.id, e.target.value));
      row.querySelector('button').addEventListener("click", () => removeCartRow(r.id));
      cartList.appendChild(row);
    });
  }

  // totals
  const { totalSum, finalPrice, discountAmount, actualRate } = computeTotals();
  if ($("totalSumText")) $("totalSumText").textContent = `₩ ${formatPrice(totalSum)}`;
  if ($("finalPriceText")) $("finalPriceText").textContent = `₩ ${formatPrice(finalPrice)}`;
  if ($("discountAmountText")) $("discountAmountText").textContent = `- ₩ ${formatPrice(discountAmount)}`;
  if ($("actualRateText")) $("actualRateText").textContent = `${isFinite(actualRate) ? actualRate.toFixed(1) : "0.0"}%`;

  // discount controls (존재하는 경우만 바인딩)
  const customRateRow = $("customRateRow");
  const customPriceRow = $("customPriceRow");
  if (customRateRow) customRateRow.classList.toggle("hide", state.discountMode !== "customRate");
  if (customPriceRow) customPriceRow.classList.toggle("hide", state.discountMode !== "customPrice");

  const customRateInput = $("customRateInput");
  if (customRateInput) {
    customRateInput.value = Number(state.discountRate || 0);
  }
  const customPriceInput = $("customPriceInput");
  if (customPriceInput) {
    customPriceInput.value = state.customFinalPrice ?? "";
  }
}

// -------------------- History (기존 HTML 유지) --------------------
// 기존 템플릿에 맞춰 간단 구현: 확정 시 snapshot 저장
const KEY_HISTORY = "consult_price_history_v2";
function loadHistory(){ return safeParse(localStorage.getItem(KEY_HISTORY)||"[]", []); }
function saveHistory(h){ localStorage.setItem(KEY_HISTORY, JSON.stringify(h)); }

function renderHistory(){
  const list = $("historyList");
  const empty = $("historyEmpty");
  if(!list || !empty) return;
  const h = loadHistory();
  list.innerHTML = "";
  empty.classList.toggle("hide", h.length>0);

  h.slice().reverse().forEach((rec)=>{
    const box = document.createElement("div");
    box.className = "panel";
    box.innerHTML = `
      <div class="row between">
        <div>
          <div style="font-weight:950">${escapeHtml(rec.title)}</div>
          <div class="hint tiny">${escapeHtml(rec.date)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:950">₩ ${formatPrice(rec.finalPrice)}</div>
          <div class="hint tiny">총 ₩ ${formatPrice(rec.totalSum)} / 할인 ₩ ${formatPrice(rec.discountAmount)}</div>
        </div>
      </div>
    `;
    list.appendChild(box);
  });
}

function confirmConsult(){
  const { totalSum, finalPrice, discountAmount } = computeTotals();
  if (totalSum <= 0) return alert("카트에 시술을 먼저 담아주세요.");
  const h = loadHistory();
  h.push({
    id: uid(),
    date: new Date().toLocaleString("ko-KR"),
    title: (state.hospitalName || "상담") + " 상담 기록",
    totalSum, finalPrice, discountAmount,
    cart: state.cart
  });
  saveHistory(h);
  alert("상담 내역이 저장되었습니다.");
  renderHistory();
}

// -------------------- UI wiring --------------------
function applySidebarToggle() {
  uiState.isSidebarOpen = !uiState.isSidebarOpen;
  saveUI();
  renderSidebar();
}

function setEditMode(next) {
  isEditMode = !!next;
  const sw = $("editSwitch");
  if (sw) sw.setAttribute("aria-checked", String(isEditMode));
  // 편집 버튼 텍스트
  const btn = $("editModeBtn");
  if (btn) btn.textContent = isEditMode ? "편집 종료 (자동 저장됨)" : "가격/프로그램 편집";
  render();
}

function bind() {
  // sidebar toggle button (main)
  const sb = $("sidebarToggleBtn");
  if (sb) sb.addEventListener("click", applySidebarToggle);

  // edit mode toggle: switch + bottom button 둘 다 지원
  const editBtn = $("editModeBtn");
  if (editBtn) editBtn.addEventListener("click", () => setEditMode(!isEditMode));
  const editSwitch = $("editSwitch");
  if (editSwitch) editSwitch.addEventListener("click", () => setEditMode(!isEditMode));

  // clinic name edit
  const editClinicBtn = $("editClinicBtn");
  if (editClinicBtn) {
    editClinicBtn.addEventListener("click", () => {
      if (!isEditMode) return alert("편집 모드에서만 수정 가능합니다.");
      const name = prompt("병원명을 입력하세요", state.hospitalName || "");
      if (name !== null) { state.hospitalName = name; saveData(); renderSidebar(); }
    });
  }

  // add category/item
  const addCatBtn = $("addCatBtn");
  if (addCatBtn) addCatBtn.addEventListener("click", () => {
    if (!isEditMode) return alert("편집 모드에서만 추가 가능합니다.");
    addCategory();
  });

  const addItemBtn = $("addItemBtn");
  if (addItemBtn) addItemBtn.addEventListener("click", () => {
    if (!isEditMode) return alert("편집 모드에서만 추가 가능합니다.");
    addItem(uiState.activeCategoryId);
  });

  // clear cart
  const clearCartBtn = $("clearCartBtn");
  if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);

  // discount buttons (있으면 연결)
  const preset10 = document.querySelector('[data-discount="10"]');
  const preset15 = document.querySelector('[data-discount="15"]');
  const preset20 = document.querySelector('[data-discount="20"]');
  [preset10, preset15, preset20].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      state.discountMode = "preset";
      state.discountRate = Number(btn.getAttribute("data-discount"));
      state.customFinalPrice = "";
      saveData(); renderCart();
    });
  });

  const customRateBtn = $("customRateBtn");
  if (customRateBtn) customRateBtn.addEventListener("click", () => {
    state.discountMode = "customRate";
    state.customFinalPrice = "";
    saveData(); renderCart();
  });
  const customRateInput = $("customRateInput");
  if (customRateInput) customRateInput.addEventListener("change", (e) => {
    state.discountRate = Number(e.target.value || 0);
    saveData(); renderCart();
  });

  const customPriceBtn = $("customPriceBtn");
  if (customPriceBtn) customPriceBtn.addEventListener("click", () => {
    // 현재 최종가를 기본값으로
    const { finalPrice } = computeTotals();
    state.discountMode = "customPrice";
    state.customFinalPrice = String(Math.max(0, Math.round(finalPrice)));
    saveData(); renderCart();
  });
  const customPriceInput = $("customPriceInput");
  if (customPriceInput) customPriceInput.addEventListener("change", (e) => {
    state.customFinalPrice = e.target.value;
    saveData(); renderCart();
  });

  // confirm
  const confirmBtn = $("confirmBtn");
  if (confirmBtn) confirmBtn.addEventListener("click", confirmConsult);

  // tabs
  const tabCart = $("tabCart");
  const tabHistory = $("tabHistory");
  const viewCart = $("viewCart");
  const viewHistory = $("viewHistory");
  if (tabCart && tabHistory && viewCart && viewHistory) {
    tabCart.addEventListener("click", () => {
      tabCart.classList.add("active"); tabHistory.classList.remove("active");
      viewCart.classList.remove("hide"); viewHistory.classList.add("hide");
    });
    tabHistory.addEventListener("click", () => {
      tabHistory.classList.add("active"); tabCart.classList.remove("active");
      viewHistory.classList.remove("hide"); viewCart.classList.add("hide");
      renderHistory();
    });
  }

  // history wipe
  const wipe = $("wipeHistoryBtn");
  if (wipe) wipe.addEventListener("click", () => {
    if (!confirm("모든 상담 기록을 삭제하시겠습니까?")) return;
    saveHistory([]);
    renderHistory();
  });
}

bind();
setEditMode(false);
render();
renderHistory();
