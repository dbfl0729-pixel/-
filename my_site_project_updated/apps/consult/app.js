// 상담/가격표 앱 (로컬 저장, 외부 라이브러리 없음)
const KEY = "consult_price_app_v2";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const uid = () => (crypto.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2)));
const formatPrice = (n) => "₩ " + new Intl.NumberFormat("ko-KR").format(Number(n || 0));

const DEFAULT = {
  hospitalName: "다채움의원",
  subtitle: "Premium Consultation",

  // categories:
  // type: "cards" | "single_table"
  // isEvent: true이면 VAT 안내문 숨김
  categories: [
    {
      id: "event",
      name: "이벤트",
      type: "cards",
      isEvent: true,
      items: [
        {
          id: "evt_toning",
          name: "이벤트 토닝 패키지",
          price: 0,
          effect: ["톤 개선", "잡티 완화"],
          details: "구성/가격은 이벤트 공지에 따릅니다."
        }
      ]
    },
    {
      id: "lifting",
      name: "리프팅",
      type: "cards",
      isEvent: false,
      items: [
        { id: "u300", name: "울쎄라 300샷", price: 990000, effect: ["탄력", "리프팅"], details: "샷수/레이어 구성은 상담 후 결정" },
        { id: "shurink", name: "슈링크 유니버스", price: 150000, effect: ["탄력", "윤곽"], details: "" }
      ]
    },
    {
      id: "booster",
      name: "스킨부스터",
      type: "cards",
      isEvent: false,
      items: [
        { id: "juvelook", name: "쥬베룩 1회", price: 350000, effect: ["콜라겐 재생", "피부결"], details: "" },
        { id: "rejuran", name: "리쥬란 1회", price: 300000, effect: ["피부 재생", "탄력"], details: "" }
      ]
    },
    {
      id: "single_laser",
      name: "단품 레이저",
      type: "single_table",
      isEvent: false,
      items: [
        { id: "pico_toning", name: "피코토닝 1회", price: 200000, effect: ["톤/색소"], details: "" }
      ]
    }
  ],

  cart: [], // {id,rowId,itemId,qty,priceSnapshot,nameSnapshot}
  discountRate: 0, // %
  customFinalPrice: null, // number | null
  history: [], // {id, ts, items:[{name,qty,unitPrice,sum}], subtotal, discountAmount, rate, final}

  ui: {
    isSidebarOpen: true,
    // sidebar category open/close (navigation tree)
    catOpen: {},
    // last scroll target (category id)
    activeCatId: null
  },

  editMode: false
};

function deepClone(x) { return JSON.parse(JSON.stringify(x)); }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return deepClone(DEFAULT);
    const saved = JSON.parse(raw);

    // Migrate basic shape safely
    const st = { ...deepClone(DEFAULT), ...saved };
    st.ui = { ...deepClone(DEFAULT.ui), ...(saved.ui || {}) };
    st.categories = Array.isArray(saved.categories) ? saved.categories : deepClone(DEFAULT.categories);
    st.cart = Array.isArray(saved.cart) ? saved.cart : [];
    st.history = Array.isArray(saved.history) ? saved.history : [];
    st.discountRate = Number(saved.discountRate || 0);
    st.customFinalPrice = (saved.customFinalPrice === null || saved.customFinalPrice === undefined) ? null : Number(saved.customFinalPrice || 0);
    st.editMode = !!saved.editMode;

    // Ensure catOpen defaults
    st.categories.forEach(c => {
      if (st.ui.catOpen[c.id] === undefined) st.ui.catOpen[c.id] = true;
    });
    return st;
  } catch {
    return deepClone(DEFAULT);
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

let state = load();

/* ---------- Data helpers ---------- */

function findItem(itemId) {
  for (const c of state.categories) {
    const it = (c.items || []).find(x => x.id === itemId);
    if (it) return { category: c, item: it };
  }
  return null;
}

function cartSubtotal() {
  return state.cart.reduce((s, r) => s + (Number(r.priceSnapshot || 0) * Number(r.qty || 1)), 0);
}

function discountAmount(subtotal) {
  if (state.customFinalPrice !== null && !Number.isNaN(Number(state.customFinalPrice))) {
    return Math.max(0, subtotal - Number(state.customFinalPrice || 0));
  }
  const r = Math.max(0, Number(state.discountRate || 0));
  return Math.floor(subtotal * (r / 100));
}

function calcFinal(subtotal) {
  const disc = discountAmount(subtotal);
  return Math.max(0, subtotal - disc);
}

function actualRate(subtotal) {
  if (subtotal <= 0) return 0;
  const disc = discountAmount(subtotal);
  return (disc / subtotal) * 100;
}

/* ---------- UI actions ---------- */

function toggleEditMode(next) {
  state.editMode = (typeof next === "boolean") ? next : !state.editMode;
  // sync switch UI
  const sw = $("#editSwitch");
  if (sw) sw.setAttribute("aria-checked", state.editMode ? "true" : "false");
  save();
  render();
}

function toggleSidebar() {
  state.ui.isSidebarOpen = !state.ui.isSidebarOpen;
  save();
  applySidebarState();
}

function applySidebarState() {
  const sb = $(".sidebar");
  if (!sb) return;
  sb.classList.toggle("closed", !state.ui.isSidebarOpen);
}

function setRate(rate) {
  state.discountRate = Math.max(0, Number(rate || 0));
  state.customFinalPrice = null;
  save();
  renderCartTotals();
  syncDiscountUI();
}

function setCustomFinalPrice(val) {
  const v = val === "" ? null : Number(val);
  state.customFinalPrice = (v === null || Number.isNaN(v)) ? null : Math.max(0, v);
  save();
  renderCartTotals();
  syncDiscountUI();
}

/* ---------- Render: Sidebar navigation ---------- */

function renderSidebar() {
  const clinicNameText = $("#clinicNameText");
  if (clinicNameText) clinicNameText.textContent = state.hospitalName;

  // subtitle text in sidebar topbar: it's the <p> right under clinicNameText
  const subtitleP = clinicNameText?.parentElement?.querySelector("p");
  if (subtitleP) subtitleP.textContent = state.subtitle;

  applySidebarState();

  const list = $("#catList");
  if (!list) return;
  list.innerHTML = "";

  state.categories.forEach((cat) => {
    if (state.ui.catOpen[cat.id] === undefined) state.ui.catOpen[cat.id] = true;

    const header = document.createElement("div");
    header.className = "cat";

    const left = document.createElement("button");
    left.type = "button";
    left.className = "catbtn";
    left.innerHTML = `
      <span class="chev ${state.ui.catOpen[cat.id] ? "open" : ""}">▾</span>
      <span class="catname">${escapeHtml(cat.name)}</span>
      <span class="count">${(cat.items||[]).length}</span>
    `;
    left.addEventListener("click", () => {
      // toggle open
      state.ui.catOpen[cat.id] = !state.ui.catOpen[cat.id];
      save();
      renderSidebar();
    });

    const right = document.createElement("div");
    right.className = "cat-actions";

    const goBtn = document.createElement("button");
    goBtn.type = "button";
    goBtn.className = "btn small ghost";
    goBtn.textContent = "이동";
    goBtn.addEventListener("click", () => scrollToId(`cat-${cat.id}`));
    right.appendChild(goBtn);

    if (state.editMode) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn small";
      editBtn.textContent = "수정";
      editBtn.addEventListener("click", () => editCategory(cat.id));
      right.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn small danger";
      delBtn.textContent = "삭제";
      delBtn.addEventListener("click", () => deleteCategory(cat.id));
      right.appendChild(delBtn);
    }

    header.appendChild(left);
    header.appendChild(right);
    list.appendChild(header);

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "cat-items " + (state.ui.catOpen[cat.id] ? "" : "hide");

    (cat.items || []).forEach((it) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "itemlink";
      b.innerHTML = `<span>${escapeHtml(it.name)}</span><span class="muted">${formatPrice(it.price)}</span>`;
      b.addEventListener("click", () => {
        state.ui.activeCatId = cat.id;
        save();
        scrollToId(`item-${it.id}`);
      });
      itemsWrap.appendChild(b);
    });

    list.appendChild(itemsWrap);
  });

  // sidebar controls visibility
  const addCatBtn = $("#addCatBtn");
  if (addCatBtn) addCatBtn.style.display = state.editMode ? "" : "none";
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* ---------- Render: Main price list ---------- */

function renderMain() {
  const title = $("#activeCatTitle");
  if (title) title.textContent = "가격표";

  const grid = $("#itemGrid");
  const empty = $("#emptyState");
  if (!grid) return;
  grid.innerHTML = "";

  if (empty) empty.classList.add("hide");

  state.categories.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "section-block";
    section.id = `cat-${cat.id}`;

    const head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = `
      <div>
        <div class="section-title">${escapeHtml(cat.name)}</div>
        <div class="section-sub">카테고리별 시술을 선택해 카트에 담으세요.</div>
      </div>
      <div class="row">
        ${state.editMode ? `<button class="btn small" data-add="${cat.id}">시술 추가</button>` : ""}
      </div>
    `;
    section.appendChild(head);

    const body = document.createElement("div");
    body.className = (cat.type === "single_table") ? "section-table" : "grid-3";

    if (cat.type === "single_table") {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width:50%">시술</th>
            <th style="width:20%">1회</th>
            <th style="width:30%"></th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tb = table.querySelector("tbody");
      (cat.items || []).forEach((it) => {
        const tr = document.createElement("tr");
        tr.id = `item-${it.id}`;
        tr.innerHTML = `
          <td>
            <div style="font-weight:950">${escapeHtml(it.name)}</div>
            ${renderInlineEffect(it)}
          </td>
          <td style="white-space:nowrap; font-weight:950">${formatPrice(it.price)}</td>
          <td style="text-align:right">
            <button class="btn small primary" type="button">담기</button>
            ${state.editMode ? `<button class="btn small" data-edit="${it.id}" type="button">수정</button>
                                <button class="btn small danger" data-del="${it.id}" type="button">삭제</button>` : ""}
          </td>
        `;
        tr.querySelector(".primary").addEventListener("click", () => addToCart(it.id));
        tb.appendChild(tr);
      });
      body.appendChild(table);
    } else {
      (cat.items || []).forEach((it) => {
        const card = document.createElement("div");
        card.className = "item";
        card.id = `item-${it.id}`;
        card.innerHTML = `
          <div class="itemTop">
            <div class="itemName">${escapeHtml(it.name)}</div>
            <div class="itemPrice mono">${formatPrice(it.price)}</div>
          </div>

          ${renderEffectBox(it)}
          ${renderDetailsBox(it)}

          <div class="row" style="margin-top:12px; gap:8px">
            <button class="btn primary" type="button" data-add="${it.id}" style="flex:1">카트에 담기</button>
            ${state.editMode ? `
              <button class="btn" type="button" data-edit="${it.id}">수정</button>
              <button class="btn danger" type="button" data-del="${it.id}">삭제</button>
            ` : ""}
          </div>
        `;
        body.appendChild(card);
      });
    }

    section.appendChild(body);

    // VAT notice at bottom of each category section except event
    if (!cat.isEvent) {
      const vat = document.createElement("div");
      vat.className = "vat";
      vat.innerHTML = `VAT 포함 / 현금·카드 동일가 <span class="sub">결제 안내: 카드·현금 동일가로 안내드립니다.</span>`;
      section.appendChild(vat);
    }

    grid.appendChild(section);
  });

  // bind add/edit/delete inside main
  grid.querySelectorAll("[data-add]").forEach((b) => {
    const catId = b.getAttribute("data-add");
    // if catId corresponds to category add button
    if (state.categories.some(c => c.id === catId)) {
      b.addEventListener("click", () => addItem(catId));
    }
  });
  grid.querySelectorAll("[data-add]").forEach((b) => {
    const itemId = b.getAttribute("data-add");
    if (findItem(itemId)) b.addEventListener("click", () => addToCart(itemId));
  });
  grid.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editItem(b.getAttribute("data-edit"))));
  grid.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deleteItem(b.getAttribute("data-del"))));
}

function renderInlineEffect(it) {
  const eff = Array.isArray(it.effect) ? it.effect : (it.effect ? [String(it.effect)] : []);
  if (!eff.length) return "";
  return `<div class="hint" style="margin-top:6px">${escapeHtml(eff.join(" · "))}</div>`;
}

function renderEffectBox(it) {
  const eff = Array.isArray(it.effect) ? it.effect : (it.effect ? [String(it.effect)] : []);
  if (!eff.length) return "";
  const lis = eff.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  return `
    <div class="effectBox">
      <div class="label">Effect</div>
      <ul>${lis}</ul>
    </div>
  `;
}

function renderDetailsBox(it) {
  const t = String(it.details || "").trim();
  if (!t) return "";
  return `
    <div class="detailsBox">
      <div class="label">Program Details</div>
      <div class="text">${escapeHtml(t)}</div>
    </div>
  `;
}

/* ---------- Cart ---------- */

function addToCart(itemId) {
  const found = findItem(itemId);
  if (!found) return;
  const row = state.cart.find(r => r.itemId === itemId);
  if (row) {
    row.qty += 1;
  } else {
    state.cart.push({
      id: uid(),
      itemId,
      qty: 1,
      priceSnapshot: Number(found.item.price || 0),
      nameSnapshot: String(found.item.name || "")
    });
  }
  save();
  renderCart();
  renderCartTotals();
}

function removeFromCart(rowId) {
  state.cart = state.cart.filter(r => r.id !== rowId);
  save();
  renderCart();
  renderCartTotals();
}

function setQty(rowId, qty) {
  const r = state.cart.find(x => x.id === rowId);
  if (!r) return;
  r.qty = Math.max(1, Number(qty || 1));
  save();
  renderCart();
  renderCartTotals();
}

function clearCart() {
  if (!confirm("카트를 초기화할까요?")) return;
  state.cart = [];
  state.discountRate = 0;
  state.customFinalPrice = null;
  save();
  renderCart();
  renderCartTotals();
  syncDiscountUI();
}

function renderCart() {
  const list = $("#cartList");
  if (!list) return;
  list.innerHTML = "";

  if (!state.cart.length) {
    list.innerHTML = `<div class="item empty">선택된 시술이 없습니다.</div>`;
    return;
  }

  state.cart.forEach((r) => {
    const row = document.createElement("div");
    row.className = "cartRow";
    row.innerHTML = `
      <div class="grow">
        <div style="font-weight:950">${escapeHtml(r.nameSnapshot)}</div>
        <div class="hint tiny mono">${formatPrice(r.priceSnapshot)} × ${r.qty} = ${formatPrice(r.priceSnapshot * r.qty)}</div>
      </div>
      <div class="row" style="gap:6px">
        <button class="chipbtn" type="button" data-dec>-</button>
        <input class="field right mono" type="number" min="1" step="1" value="${r.qty}" style="width:72px" />
        <button class="chipbtn" type="button" data-inc>+</button>
        <button class="chipbtn danger" type="button" data-del>삭제</button>
      </div>
    `;
    row.querySelector("[data-dec]").addEventListener("click", () => setQty(r.id, r.qty - 1));
    row.querySelector("[data-inc]").addEventListener("click", () => setQty(r.id, r.qty + 1));
    row.querySelector("input").addEventListener("input", (e) => setQty(r.id, e.target.value));
    row.querySelector("[data-del]").addEventListener("click", () => removeFromCart(r.id));
    list.appendChild(row);
  });
}

function renderCartTotals() {
  const subtotal = cartSubtotal();
  const disc = discountAmount(subtotal);
  const final = calcFinal(subtotal);

  const totalSumText = $("#totalSumText");
  const discountAmountText = $("#discountAmountText");
  const finalPriceText = $("#finalPriceText");
  const actualRateText = $("#actualRateText");

  if (totalSumText) totalSumText.textContent = formatPrice(subtotal);
  if (discountAmountText) discountAmountText.textContent = "- " + formatPrice(disc);
  if (finalPriceText) finalPriceText.textContent = formatPrice(final);
  if (actualRateText) actualRateText.textContent = actualRate(subtotal).toFixed(1) + "%";
}

function syncDiscountUI() {
  const customRateRow = $("#customRateRow");
  const customRateInput = $("#customRateInput");
  const customPriceRow = $("#customPriceRow");
  const customPriceInput = $("#customPriceInput");

  if (customRateInput) customRateInput.value = state.discountRate || 0;
  if (customPriceInput) customPriceInput.value = (state.customFinalPrice === null) ? "" : state.customFinalPrice;

  // when custom final price is on, show row
  if (customPriceRow) customPriceRow.classList.toggle("hide", state.customFinalPrice === null);
  if (customRateRow) customRateRow.classList.toggle("hide", false);
}

/* ---------- History ---------- */

function addHistoryRecord() {
  if (!state.cart.length) return alert("카트가 비어 있습니다.");

  const subtotal = cartSubtotal();
  const disc = discountAmount(subtotal);
  const final = calcFinal(subtotal);
  const rec = {
    id: uid(),
    ts: Date.now(),
    items: state.cart.map(r => ({
      name: r.nameSnapshot,
      qty: r.qty,
      unitPrice: r.priceSnapshot,
      sum: r.priceSnapshot * r.qty
    })),
    subtotal,
    discountAmount: disc,
    rate: actualRate(subtotal),
    final
  };
  state.history.unshift(rec);
  // optional: keep last 50
  state.history = state.history.slice(0, 50);

  // reset cart after confirm
  state.cart = [];
  state.discountRate = 0;
  state.customFinalPrice = null;

  save();
  renderCart();
  renderCartTotals();
  renderHistory();
  syncDiscountUI();
  alert("상담 내역이 저장되었습니다.");
}

function renderHistory() {
  const list = $("#historyList");
  const empty = $("#historyEmpty");
  if (!list) return;
  list.innerHTML = "";

  if (!state.history.length) {
    if (empty) empty.classList.remove("hide");
    return;
  }
  if (empty) empty.classList.add("hide");

  state.history.forEach((h) => {
    const d = new Date(h.ts);
    const when = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

    const box = document.createElement("div");
    box.className = "panel";
    const itemsText = h.items.map(x => `• ${x.name} ×${x.qty} = ${formatPrice(x.sum)}`).join("\n");
    box.innerHTML = `
      <div class="row between">
        <div>
          <div style="font-weight:950">상담 기록</div>
          <div class="hint tiny mono">${when}</div>
        </div>
        <div class="pill mono">${formatPrice(h.final)}</div>
      </div>
      <div class="detailsBox" style="margin-top:10px">
        <div class="label">선택 내역</div>
        <div class="text mono">${escapeHtml(itemsText)}</div>
      </div>
      <div class="summary" style="margin-top:10px">
        <div class="row between"><span class="hint">총합</span><span class="mono">${formatPrice(h.subtotal)}</span></div>
        <div class="row between"><span class="hint">할인</span><span class="danger-text mono">- ${formatPrice(h.discountAmount)}</span></div>
        <div class="row between"><span class="hint">실제 할인율</span><span class="pill mono">${Number(h.rate||0).toFixed(1)}%</span></div>
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn small" data-copy="${h.id}">텍스트 복사</button>
        <button class="btn small danger" data-del="${h.id}" style="margin-left:auto;">삭제</button>
      </div>
    `;
    box.querySelector("[data-copy]").addEventListener("click", () => copyHistoryText(h.id));
    box.querySelector("[data-del]").addEventListener("click", () => deleteHistory(h.id));
    list.appendChild(box);
  });
}

function copyHistoryText(id) {
  const h = state.history.find(x => x.id === id);
  if (!h) return;
  const d = new Date(h.ts);
  const when = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

  const lines = [];
  lines.push(`[상담 기록] ${when}`);
  h.items.forEach(x => lines.push(`- ${x.name} ×${x.qty} = ${new Intl.NumberFormat("ko-KR").format(x.sum)}원`));
  lines.push(`총합: ${new Intl.NumberFormat("ko-KR").format(h.subtotal)}원`);
  lines.push(`할인: -${new Intl.NumberFormat("ko-KR").format(h.discountAmount)}원 (${Number(h.rate||0).toFixed(1)}%)`);
  lines.push(`최종: ${new Intl.NumberFormat("ko-KR").format(h.final)}원`);

  const text = lines.join("\n");
  navigator.clipboard?.writeText(text).then(() => alert("복사되었습니다.")).catch(() => {
    prompt("아래 텍스트를 복사하세요.", text);
  });
}

function deleteHistory(id) {
  if (!confirm("이 기록을 삭제할까요?")) return;
  state.history = state.history.filter(x => x.id !== id);
  save();
  renderHistory();
}

function wipeHistory() {
  if (!confirm("기록을 전체 삭제할까요?")) return;
  state.history = [];
  save();
  renderHistory();
}

/* ---------- Edit: Categories / Items ---------- */

function addCategory() {
  const name = prompt("카테고리 이름", "새 카테고리");
  if (!name) return;
  const type = confirm("단품 레이저(표) 카테고리로 만들까요?\n확인=표(Table), 취소=카드") ? "single_table" : "cards";
  const isEvent = confirm("이 카테고리를 '이벤트'로 지정할까요?\n이벤트로 지정하면 VAT 안내문이 숨겨집니다.") ? true : false;

  const id = uid();
  state.categories.push({ id, name: name.trim(), type, isEvent, items: [] });
  state.ui.catOpen[id] = true;
  save();
  render();
}

function editCategory(catId) {
  const cat = state.categories.find(c => c.id === catId);
  if (!cat) return;
  const name = prompt("카테고리 이름", cat.name);
  if (!name) return;

  const type = confirm("표(Table) 카테고리로 설정할까요?\n확인=표(Table), 취소=카드") ? "single_table" : "cards";
  const isEvent = confirm("이벤트로 지정할까요?\n이벤트면 VAT 안내문이 숨겨집니다.") ? true : false;

  cat.name = name.trim();
  cat.type = type;
  cat.isEvent = isEvent;
  save();
  render();
}

function deleteCategory(catId) {
  const cat = state.categories.find(c => c.id === catId);
  if (!cat) return;
  if (!confirm(`"${cat.name}" 카테고리를 삭제할까요?\n(포함된 시술도 함께 삭제됩니다.)`)) return;
  state.categories = state.categories.filter(c => c.id !== catId);
  delete state.ui.catOpen[catId];
  save();
  render();
}

function addItem(catId) {
  const cat = state.categories.find(c => c.id === catId);
  if (!cat) return;

  const name = prompt("시술명", "");
  if (!name) return;

  const price = Number(prompt("가격(원)", "0") || 0);
  const effect = prompt("Effect (쉼표로 구분, 예: 톤 개선, 색소 완화)", "") || "";
  const details = prompt("Program Details (구성/횟수/조합 등)", "") || "";

  cat.items.push({
    id: uid(),
    name: name.trim(),
    price: Math.max(0, Number.isNaN(price) ? 0 : price),
    effect: effect.split(",").map(s => s.trim()).filter(Boolean),
    details
  });
  save();
  render();
}

function editItem(itemId) {
  const found = findItem(itemId);
  if (!found) return;
  const it = found.item;

  const name = prompt("시술명", it.name);
  if (!name) return;

  const price = Number(prompt("가격(원)", String(it.price ?? 0)) || 0);
  const effect = prompt("Effect (쉼표로 구분)", Array.isArray(it.effect) ? it.effect.join(", ") : (it.effect || "")) || "";
  const details = prompt("Program Details", String(it.details || "")) || "";

  it.name = name.trim();
  it.price = Math.max(0, Number.isNaN(price) ? 0 : price);
  it.effect = effect.split(",").map(s => s.trim()).filter(Boolean);
  it.details = details;
  save();
  render();
}

function deleteItem(itemId) {
  const found = findItem(itemId);
  if (!found) return;
  if (!confirm(`"${found.item.name}" 을(를) 삭제할까요?`)) return;
  found.category.items = (found.category.items || []).filter(x => x.id !== itemId);
  // remove from cart rows too
  state.cart = state.cart.filter(r => r.itemId !== itemId);
  save();
  render();
}

/* ---------- Scrolling ---------- */

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Bindings ---------- */

function bindStaticUI() {
  // edit switch
  const sw = $("#editSwitch");
  if (sw) {
    sw.addEventListener("click", () => toggleEditMode());
  }

  // edit mode button (requested)
  const editModeBtn = $("#editModeBtn");
  if (editModeBtn) {
    editModeBtn.addEventListener("click", () => toggleEditMode());
  }

  // sidebar toggle button
  const sidebarToggleBtn = $("#sidebarToggleBtn");
  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener("click", toggleSidebar);

  // clinic name edit
  const editClinicBtn = $("#editClinicBtn");
  if (editClinicBtn) {
    editClinicBtn.addEventListener("click", () => {
      if (!state.editMode) {
        alert("편집 모드를 켠 뒤 수정하세요.");
        return;
      }
      const hn = prompt("병원명", state.hospitalName) ?? state.hospitalName;
      const sub = prompt("부제", state.subtitle) ?? state.subtitle;
      state.hospitalName = (hn || DEFAULT.hospitalName).trim();
      state.subtitle = (sub || DEFAULT.subtitle).trim();
      save();
      renderSidebar();
    });
  }

  // add category
  const addCatBtn = $("#addCatBtn");
  if (addCatBtn) addCatBtn.addEventListener("click", () => {
    if (!state.editMode) return;
    addCategory();
  });

  // add item button (adds to first category by default)
  const addItemBtn = $("#addItemBtn");
  if (addItemBtn) addItemBtn.addEventListener("click", () => {
    if (!state.editMode) return alert("편집 모드를 켜세요.");
    const catNames = state.categories.map((c, i) => `${i+1}. ${c.name}`).join("\n");
    const pick = Number(prompt(`어느 카테고리에 추가할까요?\n${catNames}`, "1") || 1);
    const idx = Math.min(state.categories.length-1, Math.max(0, pick-1));
    addItem(state.categories[idx].id);
  });

  // cart clear
  const clearCartBtn = $("#clearCartBtn");
  if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);

  // discount chips
  $$(".chipbtn[data-rate]").forEach((b) => {
    b.addEventListener("click", () => setRate(b.getAttribute("data-rate")));
  });

  const customRateBtn = $("#customRateBtn");
  const customRateRow = $("#customRateRow");
  if (customRateBtn && customRateRow) {
    customRateBtn.addEventListener("click", () => {
      customRateRow.classList.toggle("hide");
    });
  }
  const customRateInput = $("#customRateInput");
  if (customRateInput) {
    customRateInput.addEventListener("input", (e) => setRate(e.target.value));
  }

  const customPriceBtn = $("#customPriceBtn");
  const customPriceRow = $("#customPriceRow");
  if (customPriceBtn && customPriceRow) {
    customPriceBtn.addEventListener("click", () => {
      customPriceRow.classList.toggle("hide");
      if (customPriceRow.classList.contains("hide")) {
        setCustomFinalPrice("");
      }
    });
  }
  const customPriceInput = $("#customPriceInput");
  if (customPriceInput) {
    customPriceInput.addEventListener("input", (e) => setCustomFinalPrice(e.target.value));
  }

  // confirm
  const confirmBtn = $("#confirmBtn");
  if (confirmBtn) confirmBtn.addEventListener("click", addHistoryRecord);

  // cart/history tabs
  const tabCart = $("#tabCart");
  const tabHistory = $("#tabHistory");
  const viewCart = $("#viewCart");
  const viewHistory = $("#viewHistory");
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

  // export / wipe history
  const exportBtn = $("#exportBtn");
  if (exportBtn) exportBtn.addEventListener("click", () => {
    if (!state.history.length) return alert("기록이 없습니다.");
    // export latest record
    copyHistoryText(state.history[0].id);
  });
  const wipeHistoryBtn = $("#wipeHistoryBtn");
  if (wipeHistoryBtn) wipeHistoryBtn.addEventListener("click", wipeHistory);
}

/* ---------- Main render ---------- */

function render() {
  // sync edit switch
  const sw = $("#editSwitch");
  if (sw) sw.setAttribute("aria-checked", state.editMode ? "true" : "false");

  // sync edit button text
  const editModeBtn = $("#editModeBtn");
  if (editModeBtn) editModeBtn.textContent = state.editMode ? "편집 종료 (자동 저장)" : "가격/프로그램 편집";

  renderSidebar();
  renderMain();
  renderCart();
  renderCartTotals();
  syncDiscountUI();
}

/* ---------- Boot ---------- */

document.addEventListener("DOMContentLoaded", () => {
  bindStaticUI();
  render();
});
