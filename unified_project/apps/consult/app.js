// 상담/가격표 앱 (로컬 저장, 외부 라이브러리 없음)
const KEY = "consult_price_app_v1";

const formatPrice = (n) => new Intl.NumberFormat("ko-KR").format(Number(n||0));

const defaultData = {
  hospitalName: "다채움의원",
  subtitle: "Premium Consultation",
  categories: [
    { id: "lifting", name: "리프팅", items: [
      { id: "u300", name: "울쎄라 300샷", price: 990000, info: "탄력 리프팅" },
      { id: "shurink", name: "슈링크 유니버스", price: 150000, info: "가성비 탄력" }
    ]},
    { id: "booster", name: "스킨부스터", items: [
      { id: "juvelook", name: "쥬베룩 1회", price: 350000, info: "자가 콜라겐 재생" },
      { id: "rejuran", name: "리쥬란 1회", price: 300000, info: "피부 재생" }
    ]},
    { id: "laser", name: "레이저", items: [
      { id: "pico", name: "피코토닝 1회", price: 200000, info: "톤/색소" }
    ]}
  ],
  cart: [],
  discountType: "none", // none | rate | amount
  discountValue: 0
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultData);
    const d = JSON.parse(raw);
    return { ...structuredClone(defaultData), ...d };
  } catch {
    return structuredClone(defaultData);
  }
}
function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { alert("저장 실패"); }
}

let state = load();

function $(sel) { return document.querySelector(sel); }
function el(tag, props={}, children=[]) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const c of children) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return e;
}

function findItemById(itemId) {
  for (const c of state.categories) {
    const it = c.items.find(x => x.id === itemId);
    if (it) return { category: c, item: it };
  }
  return null;
}

function addToCart(itemId) {
  const found = findItemById(itemId);
  if (!found) return;
  state.cart.push({ id: crypto.randomUUID?.() || String(Date.now()) + Math.random(), itemId, qty: 1, priceSnapshot: found.item.price, nameSnapshot: found.item.name });
  save(state);
  render();
}

function removeCartRow(rowId) {
  state.cart = state.cart.filter(r => r.id !== rowId);
  save(state);
  render();
}

function setCartQty(rowId, qty) {
  const q = Math.max(1, Number(qty||1));
  const row = state.cart.find(r => r.id === rowId);
  if (!row) return;
  row.qty = q;
  save(state);
  renderTotalsOnly();
}

function cartSubtotal() {
  return state.cart.reduce((s, r) => s + (Number(r.priceSnapshot)||0) * (Number(r.qty)||1), 0);
}

function discountAmount(subtotal) {
  const v = Number(state.discountValue||0);
  if (state.discountType === "rate") return Math.floor(subtotal * (v/100));
  if (state.discountType === "amount") return Math.min(subtotal, v);
  return 0;
}

function renderHeader() {
  const titleEl = $("#hospitalName");
  const subEl = $("#subtitle");
  if (titleEl) titleEl.textContent = state.hospitalName;
  if (subEl) subEl.textContent = state.subtitle;
}

function renderTabs() {
  const tabs = $("#categoryTabs");
  if (!tabs) return;
  tabs.innerHTML = "";
  state.categories.forEach((c, idx) => {
    const b = el("button", { className: "tab" + (idx===0 ? " active":"") , type:"button" }, [c.name]);
    b.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      renderItems(c.id);
    });
    tabs.appendChild(b);
  });
}

function renderItems(categoryId) {
  const wrap = $("#itemsTableBody");
  if (!wrap) return;
  const cat = state.categories.find(c => c.id === categoryId) || state.categories[0];
  wrap.innerHTML = "";
  cat.items.forEach(it => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="name">
        <div class="itemName">${it.name}</div>
        <div class="itemInfo">${it.info||""}</div>
      </td>
      <td class="price">${formatPrice(it.price)}원</td>
      <td class="actions"><button class="btn" type="button">추가</button></td>
    `;
    tr.querySelector("button").addEventListener("click", () => addToCart(it.id));
    wrap.appendChild(tr);
  });
}

function renderCart() {
  const body = $("#cartBody");
  if (!body) return;
  body.innerHTML = "";
  state.cart.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="name">${r.nameSnapshot}</td>
      <td class="price">${formatPrice(r.priceSnapshot)}원</td>
      <td class="qty"><input inputmode="numeric" value="${r.qty}" /></td>
      <td class="sum">${formatPrice(r.priceSnapshot * r.qty)}원</td>
      <td class="actions"><button class="btn danger" type="button">삭제</button></td>
    `;
    tr.querySelector("input").addEventListener("input", (e) => setCartQty(r.id, e.target.value));
    tr.querySelector("button").addEventListener("click", () => removeCartRow(r.id));
    body.appendChild(tr);
  });
}

function renderTotalsOnly() {
  const subtotal = cartSubtotal();
  const disc = discountAmount(subtotal);
  const total = Math.max(0, subtotal - disc);
  const subEl = $("#subtotal");
  const discEl = $("#discount");
  const totEl = $("#total");
  if (subEl) subEl.textContent = formatPrice(subtotal) + "원";
  if (discEl) discEl.textContent = "-" + formatPrice(disc) + "원";
  if (totEl) totEl.textContent = formatPrice(total) + "원";
}

function bindDiscount() {
  const typeSel = $("#discountType");
  const valInp = $("#discountValue");
  if (!typeSel || !valInp) return;
  typeSel.value = state.discountType;
  valInp.value = state.discountValue;

  typeSel.addEventListener("change", () => {
    state.discountType = typeSel.value;
    save(state);
    renderTotalsOnly();
  });
  valInp.addEventListener("input", () => {
    state.discountValue = Number(valInp.value||0);
    save(state);
    renderTotalsOnly();
  });
}

function bindHeaderEdit() {
  const hn = $("#hospitalName");
  const st = $("#subtitle");
  if (hn) {
    hn.contentEditable = "true";
    hn.addEventListener("blur", () => { state.hospitalName = hn.textContent.trim() || defaultData.hospitalName; save(state); });
  }
  if (st) {
    st.contentEditable = "true";
    st.addEventListener("blur", () => { state.subtitle = st.textContent.trim() || defaultData.subtitle; save(state); });
  }
}

function bindAddItemEditor() {
  const form = $("#addItemForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const catId = $("#newItemCategory").value;
    const name = $("#newItemName").value.trim();
    const price = Number($("#newItemPrice").value||0);
    const info = $("#newItemInfo").value.trim();
    if (!name) return;
    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;
    cat.items.push({ id: (crypto.randomUUID?.() || String(Date.now())+Math.random()), name, price, info });
    save(state);
    render();
    form.reset();
  });
}

function renderCategorySelect() {
  const sel = $("#newItemCategory");
  if (!sel) return;
  sel.innerHTML = "";
  state.categories.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = c.name;
    sel.appendChild(o);
  });
}

function bindClearCart() {
  const btn = $("#clearCart");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!confirm("카트를 비울까요?")) return;
    state.cart = [];
    save(state);
    render();
  });
}

function injectMinimalUIIfMissing() {
  // If the uploaded HTML doesn't have expected ids, create a simple layout.
  if ($("#categoryTabs") && $("#itemsTableBody") && $("#cartBody")) return;

  document.body.innerHTML = `
    <div class="wrap">
      <header class="topbar">
        <div>
          <div id="hospitalName" class="title"></div>
          <div id="subtitle" class="subtitle"></div>
        </div>
        <div class="top-actions">
          <a class="link" href="../../index.html">홈</a>
          <a class="link" href="../inventory/index.html">재고앱</a>
        </div>
      </header>

      <section class="panel">
        <div id="categoryTabs" class="tabs"></div>
        <table class="table">
          <thead><tr><th>항목</th><th>가격</th><th></th></tr></thead>
          <tbody id="itemsTableBody"></tbody>
        </table>
      </section>

      <section class="panel">
        <div class="row between">
          <h3 style="margin:0;">선택 항목</h3>
          <button id="clearCart" class="btn danger" type="button">전체삭제</button>
        </div>
        <table class="table">
          <thead><tr><th>항목</th><th>단가</th><th>수량</th><th>합계</th><th></th></tr></thead>
          <tbody id="cartBody"></tbody>
        </table>

        <div class="row totals">
          <div class="row">
            <label>할인</label>
            <select id="discountType">
              <option value="none">없음</option>
              <option value="rate">%</option>
              <option value="amount">원</option>
            </select>
            <input id="discountValue" inputmode="numeric" value="0" />
          </div>

          <div class="sumline"><span>소계</span><strong id="subtotal"></strong></div>
          <div class="sumline"><span>할인</span><strong id="discount"></strong></div>
          <div class="sumline total"><span>총액</span><strong id="total"></strong></div>
        </div>
      </section>

      <section class="panel">
        <h3 style="margin:0 0 10px;">항목 추가</h3>
        <form id="addItemForm" class="form">
          <select id="newItemCategory"></select>
          <input id="newItemName" placeholder="항목명" />
          <input id="newItemPrice" inputmode="numeric" placeholder="가격" />
          <input id="newItemInfo" placeholder="설명(선택)" />
          <button class="btn" type="submit">추가</button>
        </form>
        <div class="hint">제목/부제는 클릭해서 수정 후 다른 곳을 탭하면 저장됩니다.</div>
      </section>
    </div>
  `;

  // Minimal CSS if existing styles.css is not loaded
  if (!document.querySelector('link[rel="stylesheet"]')) {
    const style = document.createElement("style");
    style.textContent = `
      body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;background:#f6f7fb;color:#0f172a}
      .wrap{max-width:980px;margin:0 auto;padding:16px}
      .topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
      .title{font-weight:800;font-size:18px}
      .subtitle{font-size:12px;color:#64748b;margin-top:4px}
      .top-actions{display:flex;gap:8px}
      .link{border:1px solid #e6e8f0;border-radius:10px;padding:8px 10px;text-decoration:none;color:#111;background:#fff}
      .panel{background:#fff;border:1px solid #e6e8f0;border-radius:14px;padding:14px;margin-top:12px}
      .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
      .tab{border:1px solid #e6e8f0;background:#fff;border-radius:999px;padding:8px 12px}
      .tab.active{border-color:#111827}
      .table{width:100%;border-collapse:collapse}
      th,td{border-bottom:1px solid #e6e8f0;padding:10px;vertical-align:top}
      th{font-size:12px;color:#64748b;text-align:left}
      .btn{border:1px solid #111827;background:#111827;color:#fff;border-radius:10px;padding:8px 10px}
      .btn.danger{border-color:#ef4444;background:#ef4444}
      .row{display:flex;gap:10px;align-items:center}
      .between{justify-content:space-between}
      .totals{display:grid;gap:8px;margin-top:10px}
      .sumline{display:flex;justify-content:space-between}
      .sumline.total{font-size:16px}
      input,select{border:1px solid #e6e8f0;border-radius:10px;padding:8px 10px}
      .form{display:grid;grid-template-columns:1fr 2fr 1fr 2fr auto;gap:8px}
      @media(max-width:720px){ .form{grid-template-columns:1fr 1fr; } }
      .hint{margin-top:10px;color:#64748b;font-size:12px}
      .itemInfo{color:#64748b;font-size:12px;margin-top:4px}
      .price{white-space:nowrap;text-align:right}
      .actions{white-space:nowrap;text-align:right}
    `;
    document.head.appendChild(style);
  }
}

function render() {
  injectMinimalUIIfMissing();
  renderHeader();
  renderCategorySelect();
  renderTabs();
  renderItems(state.categories[0]?.id);
  renderCart();
  bindDiscount();
  bindHeaderEdit();
  bindAddItemEditor();
  bindClearCart();
  renderTotalsOnly();
}

document.addEventListener("DOMContentLoaded", render);
