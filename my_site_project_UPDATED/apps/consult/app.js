// 상담/가격표 앱 v2
// - localStorage 기반(환자용 기기 유지)
// - 편집 모드에서 카테고리/시술 수정 후 끄면 자동 저장
// - 왼쪽 사이드바에서 카테고리 이동 + 펼침/접힘 상태 기억
// - 단품 레이저 카테고리는 표(Table)로 빠른 검색

const KEY = "consult_price_app_v2";

const fmt = (n) => new Intl.NumberFormat("ko-KR").format(Number(n || 0));

const DEFAULT_VAT_NOTICE = "VAT 포함 / 현금·카드 동일가";

const defaultState = {
  clinicName: "다채움의원",
  subtitle: "Premium Consultation",

  // UI states
  activeCatId: null,
  isEditMode: false,
  isSidebarOpen: true,
  openCats: {},

  // pricing
  categories: [
    {
      id: "event",
      name: "이벤트",
      isEvent: true,
      view: "cards",
      items: [
        {
          id: "ev_sample",
          name: "(예시) 이벤트 패키지",
          price: 0,
          effect: "기간 한정 구성",
          details: "구성/횟수/조건을 여기 적어두세요.",
          note: ""
        }
      ]
    },
    {
      id: "lifting",
      name: "리프팅",
      view: "cards",
      items: [
        {
          id: "u300",
          name: "울쎄라 300샷",
          price: 990000,
          effect: "탄력·리프팅 / 윤곽 개선",
          details: "샷 수, 부위, 추가 구성(리프팅/스킨부스터 등)을 명확히 기입",
          note: ""
        }
      ]
    },
    {
      id: "booster",
      name: "스킨부스터",
      view: "cards",
      items: [
        {
          id: "juvelook",
          name: "쥬베룩 1회",
          price: 350000,
          effect: "콜라겐 재생 / 탄성 개선",
          details: "용량, 부위, 필요 시 마취/관리 포함 여부",
          note: ""
        }
      ]
    },
    {
      id: "laser_program",
      name: "레이저 프로그램",
      view: "cards",
      items: [
        {
          id: "pico_prog",
          name: "피코 토닝 프로그램",
          price: 0,
          effect: "색소·톤 / 맑기 개선",
          details: "예) 피코토닝 4회 + 532 스팟 1회 + LDM 2회\n(구성/횟수/간격을 상담용으로 크게)",
          note: ""
        }
      ]
    },
    {
      id: "laser_single",
      name: "단품 레이저",
      view: "table",
      items: [
        { id: "pico_1", name: "피코토닝 1회", price: 200000, effect: "톤/색소", details: "", note: "" },
        { id: "rev_1", name: "레블라이트 토닝 1회", price: 180000, effect: "기미/잡티", details: "", note: "" }
      ]
    }
  ],

  // cart & discount
  cart: [],
  discountRate: 0, // %

  // 상담 기록
  history: []
};

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    const s = { ...structuredClone(defaultState), ...parsed };
    // 구조가 깨졌을 때 대비
    if (!Array.isArray(s.categories)) s.categories = structuredClone(defaultState.categories);
    if (!Array.isArray(s.cart)) s.cart = [];
    if (!Array.isArray(s.history)) s.history = [];
    if (!s.activeCatId) s.activeCatId = s.categories?.[0]?.id ?? null;
    if (!s.openCats || typeof s.openCats !== "object") s.openCats = {};
    if (typeof s.isSidebarOpen !== "boolean") s.isSidebarOpen = true;
    if (typeof s.isEditMode !== "boolean") s.isEditMode = false;
    return s;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    alert("저장 실패(로컬 저장소). 기기 저장 공간/브라우저 설정을 확인하세요.");
  }
}

let state = loadState();

// ---------- DOM helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function uid(prefix = "id") {
  return (crypto.randomUUID?.() ?? `${prefix}_${Date.now()}_${Math.random()}`).replaceAll("-", "");
}

// ---------- state selectors ----------
function getActiveCategory() {
  return state.categories.find((c) => c.id === state.activeCatId) || state.categories[0] || null;
}

function findItem(itemId) {
  for (const c of state.categories) {
    const it = c.items?.find((x) => x.id === itemId);
    if (it) return { cat: c, item: it };
  }
  return null;
}

// ---------- Sidebar ----------
function applySidebarOpen() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("collapsed", !state.isSidebarOpen);
}

function renderSidebar() {
  const catList = $("#catList");
  if (!catList) return;
  catList.innerHTML = "";

  for (const cat of state.categories) {
    const isActive = cat.id === state.activeCatId;
    const isOpen = state.openCats[cat.id] ?? true;
    const row = document.createElement("div");
    row.className = "cat" + (isActive ? " active" : "");

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.flexDirection = "column";
    left.style.gap = "4px";

    const name = document.createElement("div");
    name.className = "cat-name";
    name.textContent = cat.name;
    left.appendChild(name);

    const meta = document.createElement("div");
    meta.className = "hint tiny";
    meta.textContent = `${cat.items?.length ?? 0}개`;
    left.appendChild(meta);

    const right = document.createElement("div");
    right.className = "row";
    right.style.gap = "6px";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "iconbtn";
    toggleBtn.title = "펼치기/접기";
    toggleBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    `;
    toggleBtn.style.transform = isOpen ? "rotate(0deg)" : "rotate(-90deg)";
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.openCats[cat.id] = !(state.openCats[cat.id] ?? true);
      saveState();
      renderSidebar();
    });
    right.appendChild(toggleBtn);

    if (state.isEditMode) {
      const renameBtn = document.createElement("button");
      renameBtn.className = "iconbtn";
      renameBtn.title = "카테고리 이름 수정";
      renameBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        </svg>
      `;
      renameBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const next = prompt("카테고리명", cat.name);
        if (next === null) return;
        cat.name = next.trim() || cat.name;
        saveState();
        render();
      });
      right.appendChild(renameBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "iconbtn danger";
      delBtn.title = "카테고리 삭제";
      delBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
        </svg>
      `;
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm(`카테고리 삭제: ${cat.name}\n(해당 카테고리의 시술도 함께 삭제됩니다)`)) return;
        state.categories = state.categories.filter((c) => c.id !== cat.id);
        if (state.activeCatId === cat.id) state.activeCatId = state.categories[0]?.id ?? null;
        saveState();
        render();
      });
      right.appendChild(delBtn);
    }

    row.appendChild(left);
    row.appendChild(right);

    row.addEventListener("click", () => {
      state.activeCatId = cat.id;
      saveState();
      renderMain();
      renderSidebar();
    });

    catList.appendChild(row);

    // expanded quick-nav items
    if (isOpen && (cat.items?.length ?? 0) > 0) {
      const sub = document.createElement("div");
      sub.style.margin = "6px 0 12px 8px";
      sub.style.paddingLeft = "10px";
      sub.style.borderLeft = "2px solid #eef2ff";
      sub.style.display = "grid";
      sub.style.gap = "6px";
      for (const it of cat.items) {
        const a = document.createElement("button");
        a.type = "button";
        a.className = "btn small";
        a.style.textAlign = "left";
        a.style.justifyContent = "flex-start";
        a.textContent = it.name;
        a.addEventListener("click", (e) => {
          e.stopPropagation();
          state.activeCatId = cat.id;
          saveState();
          renderMain();
          renderSidebar();
          // cards: scroll to item card; table: focus search
          setTimeout(() => {
            if (cat.view === "table") {
              $("#singleSearch")?.focus();
              return;
            }
            const node = document.getElementById(`item_${it.id}`);
            node?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        });
        sub.appendChild(a);
      }
      catList.appendChild(sub);
    }
  }
}

// ---------- Main rendering ----------
function renderVatNotice(cat) {
  const box = $("#vatNotice");
  if (!box) return;
  if (!cat || cat.isEvent) {
    box.classList.add("hide");
    box.textContent = "";
    return;
  }
  box.classList.remove("hide");
  box.textContent = DEFAULT_VAT_NOTICE;
}

function renderMain() {
  const active = getActiveCategory();
  const title = $("#activeCatTitle");
  if (title) title.textContent = active ? active.name : "카테고리를 선택하세요";

  renderVatNotice(active);

  const grid = $("#itemGrid");
  const empty = $("#emptyState");
  const tableWrap = $("#singleTableWrap");

  if (!active || !grid || !empty || !tableWrap) return;

  const isEmpty = (active.items?.length ?? 0) === 0;
  empty.classList.toggle("hide", !isEmpty);

  // view switch
  if (active.view === "table") {
    grid.classList.add("hide");
    tableWrap.classList.remove("hide");
    renderSingleTable(active);
  } else {
    tableWrap.classList.add("hide");
    grid.classList.remove("hide");
    renderCards(active);
  }
}

function renderCards(cat) {
  const grid = $("#itemGrid");
  if (!grid) return;
  grid.innerHTML = "";

  for (const it of cat.items || []) {
    const card = document.createElement("div");
    card.className = "item";
    card.id = `item_${it.id}`;

    const head = document.createElement("div");
    head.className = "item-head";
    head.innerHTML = `
      <div>
        <div class="item-title">${escapeHtml(it.name)}</div>
        <div class="meta">
          <span><b>₩ ${fmt(it.price)}</b></span>
        </div>
      </div>
      <div class="row">
        <button class="btn small" data-add>카트 담기</button>
      </div>
    `;
    card.appendChild(head);

    const effectBox = document.createElement("div");
    effectBox.className = "effect-box";
    effectBox.innerHTML = `
      <div class="label">EFFECT</div>
      <div class="text">${escapeHtml(it.effect || "")}</div>
    `;
    card.appendChild(effectBox);

    const detailsBox = document.createElement("div");
    detailsBox.className = "details-box";
    detailsBox.innerHTML = `
      <div class="label">PROGRAM DETAILS</div>
      <div class="text">${escapeHtml(it.details || "")}</div>
    `;
    card.appendChild(detailsBox);

    if (it.note) {
      const note = document.createElement("div");
      note.className = "hint";
      note.style.marginTop = "10px";
      note.style.whiteSpace = "pre-wrap";
      note.textContent = it.note;
      card.appendChild(note);
    }

    // edit controls
    if (state.isEditMode) {
      const editor = document.createElement("div");
      editor.className = "kv";
      editor.innerHTML = `
        <div>
          <label>시술명</label>
          <input class="field" data-k="name" value="${escapeHtml(it.name)}" />
        </div>
        <div>
          <label>1회 가격</label>
          <input class="field right" data-k="price" type="number" inputmode="numeric" value="${Number(it.price || 0)}" />
        </div>
        <div>
          <label>효과 요약 (Effect)</label>
          <textarea class="field textarea" data-k="effect">${escapeHtml(it.effect || "")}</textarea>
        </div>
        <div>
          <label>Program Details (구성/횟수/조합)</label>
          <textarea class="field textarea" data-k="details">${escapeHtml(it.details || "")}</textarea>
        </div>
        <div>
          <label>비고(선택)</label>
          <textarea class="field textarea" data-k="note">${escapeHtml(it.note || "")}</textarea>
        </div>
        <div class="row" style="justify-content:space-between">
          <button class="btn danger small" data-del>시술 삭제</button>
          <span class="hint tiny">수정 후 편집 모드를 끄면 자동 저장됩니다.</span>
        </div>
      `;

      editor.querySelectorAll("input,textarea").forEach((inp) => {
        inp.addEventListener("input", () => {
          const k = inp.getAttribute("data-k");
          if (!k) return;
          if (k === "price") it.price = Number(inp.value || 0);
          else it[k] = inp.value;
        });
      });
      editor.querySelector("[data-del]")?.addEventListener("click", () => {
        if (!confirm(`시술 삭제: ${it.name}`)) return;
        cat.items = (cat.items || []).filter((x) => x.id !== it.id);
        saveState();
        render();
      });
      card.appendChild(editor);
    }

    card.querySelector("[data-add]")?.addEventListener("click", () => addToCart(it.id));
    grid.appendChild(card);
  }
}

function renderSingleTable(cat) {
  const body = $("#singleTableBody");
  const q = $("#singleSearch");
  if (!body || !q) return;

  const renderRows = () => {
    const keyword = q.value.trim().toLowerCase();
    body.innerHTML = "";

    const items = (cat.items || []).filter((it) => {
      if (!keyword) return true;
      const hay = `${it.name} ${it.effect} ${it.details} ${it.note}`.toLowerCase();
      return hay.includes(keyword);
    });

    for (const it of items) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(it.name)}${it.details ? `<span class="sub">${escapeHtml(it.details)}</span>` : ""}</td>
        <td>${escapeHtml(it.effect || "")}</td>
        <td class="right">₩ ${fmt(it.price)}</td>
        <td class="right"><button class="btn small" type="button">담기</button></td>
      `;
      tr.querySelector("button")?.addEventListener("click", () => addToCart(it.id));
      body.appendChild(tr);
    }

    // 편집 모드: 표 아래에 간단 편집 UI
    if (state.isEditMode) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="4">
          <div class="panel" style="margin:0">
            <h3>단품 레이저 편집</h3>
            <div class="row" style="flex-wrap:wrap">
              <input class="field" id="singleNewName" placeholder="시술명" style="flex:2; min-width:180px" />
              <input class="field right" id="singleNewPrice" type="number" placeholder="가격" style="flex:1; min-width:120px" />
              <input class="field" id="singleNewEffect" placeholder="효과 요약" style="flex:2; min-width:180px" />
              <button class="btn" id="singleAddBtn" type="button">추가</button>
            </div>
            <div class="hint tiny" style="margin-top:8px">수정/삭제는 각 항목을 눌러서 진행합니다.</div>
          </div>
        </td>
      `;
      body.appendChild(tr);

      tr.querySelector("#singleAddBtn")?.addEventListener("click", () => {
        const name = tr.querySelector("#singleNewName")?.value?.trim();
        const price = Number(tr.querySelector("#singleNewPrice")?.value || 0);
        const effect = tr.querySelector("#singleNewEffect")?.value?.trim();
        if (!name) return;
        cat.items.push({ id: uid("single"), name, price, effect: effect || "", details: "", note: "" });
        saveState();
        renderMain();
      });

      // row click edit
      $$(`#singleTableBody tr`).forEach((rowEl, idx) => {
        const item = items[idx];
        if (!item) return;
        rowEl.style.cursor = "pointer";
        rowEl.addEventListener("click", (e) => {
          if (e.target?.tagName === "BUTTON") return;
          const nextName = prompt("시술명", item.name);
          if (nextName === null) return;
          const nextPriceRaw = prompt("가격(숫자)", String(item.price || 0));
          if (nextPriceRaw === null) return;
          const nextEffect = prompt("효과 요약", item.effect || "") ?? item.effect;
          item.name = nextName.trim() || item.name;
          item.price = Number(nextPriceRaw || 0);
          item.effect = (nextEffect || "").trim();

          const del = confirm("삭제하려면 확인을 누르고, 수정만 유지하려면 취소를 누르세요.\n(확인 = 삭제)");
          if (del) cat.items = cat.items.filter((x) => x.id !== item.id);
          saveState();
          renderMain();
        });
      });
    }
  };

  q.oninput = renderRows;
  renderRows();
}

// ---------- Cart ----------
function addToCart(itemId) {
  const found = findItem(itemId);
  if (!found) return;
  const row = state.cart.find((r) => r.itemId === itemId);
  if (row) {
    row.qty = Math.min(99, Number(row.qty || 1) + 1);
  } else {
    state.cart.push({
      id: uid("cart"),
      itemId,
      qty: 1,
      nameSnapshot: found.item.name,
      priceSnapshot: Number(found.item.price || 0)
    });
  }
  saveState();
  renderCart();
}

function cartSubtotal() {
  return state.cart.reduce((s, r) => s + Number(r.priceSnapshot || 0) * Number(r.qty || 1), 0);
}

function discountAmount(subtotal) {
  const rate = Number(state.discountRate || 0);
  return Math.floor(subtotal * (rate / 100));
}

function renderCart() {
  const list = $("#cartList");
  if (!list) return;
  list.innerHTML = "";

  // 할인 버튼 active 표시
  $$(".chipbtn[data-rate]").forEach((b) => {
    b.classList.toggle("active", Number(b.getAttribute("data-rate")) === Number(state.discountRate || 0));
  });

  for (const r of state.cart) {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <b>${escapeHtml(r.nameSnapshot)}</b>
        <small>₩ ${fmt(r.priceSnapshot)} · 수량 ${Number(r.qty || 1)}</small>
      </div>
      <div class="row">
        <button class="btn small" data-minus>-</button>
        <button class="btn small" data-plus>+</button>
        <button class="btn danger small" data-del>삭제</button>
      </div>
    `;

    div.querySelector("[data-minus]")?.addEventListener("click", () => {
      r.qty = Math.max(1, Number(r.qty || 1) - 1);
      saveState();
      renderCart();
    });
    div.querySelector("[data-plus]")?.addEventListener("click", () => {
      r.qty = Math.min(99, Number(r.qty || 1) + 1);
      saveState();
      renderCart();
    });
    div.querySelector("[data-del]")?.addEventListener("click", () => {
      state.cart = state.cart.filter((x) => x.id !== r.id);
      saveState();
      renderCart();
    });

    list.appendChild(div);
  }

  const subtotal = cartSubtotal();
  const disc = discountAmount(subtotal);
  const total = Math.max(0, subtotal - disc);

  $("#totalSumText") && ($("#totalSumText").textContent = `₩ ${fmt(subtotal)}`);
  $("#discountAmountText") && ($("#discountAmountText").textContent = `- ₩ ${fmt(disc)}`);
  $("#finalPriceText") && ($("#finalPriceText").textContent = `₩ ${fmt(total)}`);

  const actualRate = subtotal > 0 ? (disc / subtotal) * 100 : 0;
  $("#actualRateText") && ($("#actualRateText").textContent = `${actualRate.toFixed(1)}%`);
}

function setRate(rate) {
  state.discountRate = Math.max(0, Math.min(100, Number(rate || 0)));
  saveState();
  // chip active update
  $$(".chipbtn").forEach((b) => {
    const r = b.getAttribute("data-rate");
    b.classList.toggle("active", r && Number(r) === Number(state.discountRate));
  });
  renderCart();
}

function bindDiscountUI() {
  $$(".chipbtn[data-rate]").forEach((b) => {
    b.addEventListener("click", () => setRate(Number(b.getAttribute("data-rate"))));
  });

  const customRateBtn = $("#customRateBtn");
  const customRateRow = $("#customRateRow");
  const customRateInput = $("#customRateInput");
  if (customRateBtn && customRateRow && customRateInput) {
    customRateBtn.addEventListener("click", () => {
      customRateRow.classList.toggle("hide");
      customRateInput.focus();
    });
    customRateInput.addEventListener("input", () => setRate(Number(customRateInput.value || 0)));
  }

  const customPriceBtn = $("#customPriceBtn");
  const customPriceRow = $("#customPriceRow");
  const customPriceInput = $("#customPriceInput");
  if (customPriceBtn && customPriceRow && customPriceInput) {
    customPriceBtn.addEventListener("click", () => {
      customPriceRow.classList.toggle("hide");
      customPriceInput.focus();
    });
    customPriceInput.addEventListener("input", () => {
      const final = Number(customPriceInput.value || 0);
      const subtotal = cartSubtotal();
      if (subtotal <= 0) {
        setRate(0);
        return;
      }
      const disc = Math.max(0, Math.min(subtotal, subtotal - final));
      const rate = (disc / subtotal) * 100;
      setRate(Number(rate.toFixed(1)));
    });
  }
}

function bindCartTabs() {
  const tabCart = $("#tabCart");
  const tabHistory = $("#tabHistory");
  const viewCart = $("#viewCart");
  const viewHistory = $("#viewHistory");
  if (!tabCart || !tabHistory || !viewCart || !viewHistory) return;

  tabCart.addEventListener("click", () => {
    tabCart.classList.add("active");
    tabHistory.classList.remove("active");
    viewCart.classList.remove("hide");
    viewHistory.classList.add("hide");
  });
  tabHistory.addEventListener("click", () => {
    tabHistory.classList.add("active");
    tabCart.classList.remove("active");
    viewHistory.classList.remove("hide");
    viewCart.classList.add("hide");
    renderHistory();
  });
}

function bindConfirm() {
  const btn = $("#confirmBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (state.cart.length === 0) {
      alert("선택된 시술이 없습니다.");
      return;
    }
    const subtotal = cartSubtotal();
    const disc = discountAmount(subtotal);
    const total = Math.max(0, subtotal - disc);
    const stamp = new Date();
    state.history.unshift({
      id: uid("hist"),
      ts: stamp.toISOString(),
      items: structuredClone(state.cart),
      discountRate: Number(state.discountRate || 0),
      subtotal,
      discountAmount: disc,
      total
    });
    // 카트 비우기
    state.cart = [];
    saveState();
    render();
    alert("상담 기록 저장 완료");
  });
}

function bindClearCart() {
  const btn = $("#clearCartBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!confirm("카트를 초기화할까요?")) return;
    state.cart = [];
    saveState();
    renderCart();
  });
}

// ---------- History ----------
function renderHistory() {
  const list = $("#historyList");
  const empty = $("#historyEmpty");
  if (!list || !empty) return;

  list.innerHTML = "";
  empty.classList.toggle("hide", state.history.length > 0);

  for (const h of state.history) {
    const box = document.createElement("div");
    box.className = "item";
    const d = new Date(h.ts);
    const when = isNaN(d.getTime()) ? h.ts : d.toLocaleString("ko-KR");
    box.innerHTML = `
      <div class="item-head">
        <div>
          <div class="item-title">상담 기록</div>
          <div class="meta"><span><b>${escapeHtml(when)}</b></span><span class="pill">할인 ${Number(h.discountRate || 0)}%</span></div>
        </div>
        <button class="btn danger small" data-del>삭제</button>
      </div>
      <div class="details-box" style="margin-top:12px">
        <div class="label">ITEMS</div>
        <div class="text">${escapeHtml(h.items.map((r) => `- ${r.nameSnapshot} x${r.qty} (₩ ${fmt(r.priceSnapshot)})`).join("\n"))}</div>
      </div>
      <div class="final" style="margin-top:12px">
        <span>최종</span>
        <b>₩ ${fmt(h.total)}</b>
      </div>
      <div class="hint tiny" style="margin-top:8px">총합 ₩ ${fmt(h.subtotal)} / 할인 -₩ ${fmt(h.discountAmount)}</div>
    `;
    box.querySelector("[data-del]")?.addEventListener("click", () => {
      if (!confirm("이 기록을 삭제할까요?")) return;
      state.history = state.history.filter((x) => x.id !== h.id);
      saveState();
      renderHistory();
    });
    list.appendChild(box);
  }
}

function bindHistoryTools() {
  const exportBtn = $("#exportBtn");
  const wipeBtn = $("#wipeHistoryBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (state.history.length === 0) return alert("기록이 없습니다.");
      const h = state.history[0];
      const d = new Date(h.ts);
      const when = isNaN(d.getTime()) ? h.ts : d.toLocaleString("ko-KR");
      const text = [
        `상담 기록 (${when})`,
        "", 
        ...h.items.map((r) => `- ${r.nameSnapshot} x${r.qty} (₩ ${fmt(r.priceSnapshot)})`),
        "",
        `총합: ₩ ${fmt(h.subtotal)}`,
        `할인(${Number(h.discountRate || 0)}%): -₩ ${fmt(h.discountAmount)}`,
        `최종: ₩ ${fmt(h.total)}`
      ].join("\n");
      prompt("아래 텍스트를 복사하세요", text);
    });
  }
  if (wipeBtn) {
    wipeBtn.addEventListener("click", () => {
      if (!confirm("기록을 전부 삭제할까요?")) return;
      state.history = [];
      saveState();
      renderHistory();
    });
  }
}

// ---------- Edit mode ----------
function setEditMode(on) {
  state.isEditMode = Boolean(on);
  saveState();
  const sw = $("#editSwitch");
  if (sw) {
    sw.classList.toggle("on", state.isEditMode);
    sw.setAttribute("aria-checked", String(state.isEditMode));
  }
  render();
}

function bindEditSwitch() {
  const sw = $("#editSwitch");
  if (!sw) return;
  sw.addEventListener("click", () => setEditMode(!state.isEditMode));
}

function bindAddCategory() {
  const btn = $("#addCatBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!state.isEditMode) return alert("편집 모드를 켜주세요.");
    const name = prompt("새 카테고리명");
    if (!name) return;
    const id = uid("cat");
    state.categories.push({ id, name: name.trim(), view: "cards", items: [] });
    state.activeCatId = id;
    state.openCats[id] = true;
    saveState();
    render();
  });
}

function bindAddItem() {
  const btn = $("#addItemBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!state.isEditMode) return alert("편집 모드를 켜주세요.");
    const cat = getActiveCategory();
    if (!cat) return;
    if (cat.view === "table") {
      $("#singleSearch")?.focus();
      return;
    }
    const name = prompt("시술명");
    if (!name) return;
    const price = Number(prompt("가격(숫자)", "0") || 0);
    const effect = prompt("효과 요약(Effect)", "") || "";
    const details = prompt("Program Details(구성/횟수/조합)", "") || "";
    cat.items.push({ id: uid("item"), name: name.trim(), price, effect, details, note: "" });
    saveState();
    renderMain();
    renderSidebar();
  });
}

function bindClinicEdit() {
  const btn = $("#editClinicBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const name = prompt("병원명", state.clinicName);
    if (name !== null) state.clinicName = name.trim() || state.clinicName;
    const sub = prompt("서브타이틀", state.subtitle);
    if (sub !== null) state.subtitle = sub.trim() || state.subtitle;
    saveState();
    renderHeader();
  });
}

function renderHeader() {
  const name = $("#clinicNameText");
  const p = document.querySelector(".sidebar .topbar .title p");
  if (name) name.textContent = state.clinicName;
  if (p) p.textContent = state.subtitle;
}

function bindSidebarToggle() {
  const btn = $("#sidebarToggleBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    state.isSidebarOpen = !state.isSidebarOpen;
    saveState();
    applySidebarOpen();
  });
}

// ---------- init / render ----------
function render() {
  if (!state.activeCatId) state.activeCatId = state.categories?.[0]?.id ?? null;
  renderHeader();
  applySidebarOpen();
  const sw = $("#editSwitch");
  if (sw) {
    sw.classList.toggle("on", state.isEditMode);
    sw.setAttribute("aria-checked", String(state.isEditMode));
  }
  renderSidebar();
  renderMain();
  renderCart();
}

function init() {
  // 기본 openCats 초기값
  for (const c of state.categories) {
    if (state.openCats[c.id] === undefined) state.openCats[c.id] = true;
  }
  if (!state.activeCatId) state.activeCatId = state.categories?.[0]?.id ?? null;

  bindEditSwitch();
  bindAddCategory();
  bindAddItem();
  bindClinicEdit();
  bindSidebarToggle();
  bindDiscountUI();
  bindClearCart();
  bindConfirm();
  bindCartTabs();
  bindHistoryTools();

  render();

  // 편집 모드 OFF 시에만 저장을 한 번 더 보장
  window.addEventListener("beforeunload", () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  });
}

init();
