// =========================
// Storage
// =========================
const KEY = "consult_app_v2";
const uid = ()=> (Date.now().toString(36) + Math.random().toString(36).slice(2,8));
const money = (n)=> new Intl.NumberFormat('ko-KR').format(Math.max(0, Math.round(n||0)));
const clamp = (n,a,b)=> Math.max(a, Math.min(b, n));
const nowISO = ()=> new Date().toISOString();
const fmtKST = (iso)=>{
  try{
    const d = new Date(iso);
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit'
    }).format(d);
  }catch(e){ return iso; }
};

const defaultState = () => ({
  clinicName: "다채움의원",
  editMode: false,
  activeCategoryId: null,
  categories: [
    {id: uid(), name:"리프팅", order:0},
    {id: uid(), name:"스킨부스터", order:1},
    {id: uid(), name:"레이저", order:2},
  ],
  items: [],
  cart: [],
  discount: { mode:"preset", rate:10, customFinal:"" }, // preset|customRate|customPrice
  consultations: []
});

function seedItems(s){
  const [c1,c2,c3]=s.categories;
  s.items.push(
    {id:uid(), categoryId:c1.id, name:"울세라 300샷", price:990000, effect:"탄력 리프팅", details:"얼굴/턱선 탄력 개선", order:0},
    {id:uid(), categoryId:c1.id, name:"슈링크 유니버스", price:150000, effect:"가성비 탄력", details:"가벼운 탄력 관리", order:1},
    {id:uid(), categoryId:c2.id, name:"쥬베룩 1회", price:350000, effect:"콜라겐 재생", details:"피부결/탄력 보강", order:0},
    {id:uid(), categoryId:c3.id, name:"토닝 1회", price:99000, effect:"톤/잡티 관리", details:"색소/톤 개선", order:0}
  );
  s.activeCategoryId = c1.id;
}

function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw){
      const s = defaultState();
      seedItems(s);
      saveState(s);
      return s;
    }
    const s = JSON.parse(raw);
    if(!Array.isArray(s.consultations)) s.consultations = [];
    return s;
  }catch(e){
    const s = defaultState();
    seedItems(s);
    saveState(s);
    return s;
  }
}
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
let state = loadState();

// =========================
// DOM
// =========================
const $ = (id)=> document.getElementById(id);

const clinicNameText = $("clinicNameText");
const editClinicBtn = $("editClinicBtn");
const editSwitch = $("editSwitch");
const addCatBtn = $("addCatBtn");
const catList = $("catList");

const activeCatTitle = $("activeCatTitle");
const addItemBtn = $("addItemBtn");
const itemGrid = $("itemGrid");
const emptyState = $("emptyState");

const tabCart = $("tabCart");
const tabHistory = $("tabHistory");
const viewCart = $("viewCart");
const viewHistory = $("viewHistory");

const cartList = $("cartList");
const clearCartBtn = $("clearCartBtn");
const totalSumText = $("totalSumText");
const discountAmountText = $("discountAmountText");
const actualRateText = $("actualRateText");
const finalPriceText = $("finalPriceText");
const confirmBtn = $("confirmBtn");

const historyList = $("historyList");
const historyEmpty = $("historyEmpty");
const exportBtn = $("exportBtn");
const wipeHistoryBtn = $("wipeHistoryBtn");

const rateButtons = Array.from(document.querySelectorAll(".chipbtn[data-rate]"));
const customRateBtn = $("customRateBtn");
const customRateRow = $("customRateRow");
const customRateInput = $("customRateInput");
const customPriceBtn = $("customPriceBtn");
const customPriceRow = $("customPriceRow");
const customPriceInput = $("customPriceInput");

// =========================
// Helpers
// =========================
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g, m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function getActiveCategory(){
  const cats = state.categories.slice().sort((a,b)=>a.order-b.order);
  return cats.find(c=>c.id===state.activeCategoryId) || null;
}
function getItemsByActive(){
  return state.items
    .filter(it=>it.categoryId===state.activeCategoryId)
    .slice().sort((a,b)=>(a.order||0)-(b.order||0));
}

function recalc(){
  const total = state.cart.reduce((a,c)=>a+(Number(c.price)||0),0);
  let final = total;
  let discAmt = 0;
  let discRate = 0;
  const mode = state.discount.mode;

  if(total>0){
    if(mode==="preset" || mode==="customRate"){
      const r = clamp(Number(state.discount.rate)||0, 0, 100);
      discAmt = total * (r/100);
      final = total - discAmt;
      discRate = r;
    }else if(mode==="customPrice"){
      const raw = Number(state.discount.customFinal);
      const bounded = Number.isFinite(raw) ? clamp(raw, 0, total) : 0;
      final = bounded;
      discAmt = total - final;
      discRate = (discAmt/total)*100;
    }
  }
  return {total, final, discAmt, discRate};
}

function setDiscountMode(mode){
  state.discount.mode = mode;
  if(mode==="customRate"){
    state.discount.rate = clamp(Number(state.discount.rate)||0, 0, 100);
  }
  if(mode==="customPrice"){
    const {final} = recalc();
    state.discount.customFinal = String(Math.round(final||0));
  }
  saveState(state);
  renderCartOnly();
}

function switchTab(which){
  const isCart = (which==="cart");
  tabCart.classList.toggle("active", isCart);
  tabHistory.classList.toggle("active", !isCart);
  viewCart.classList.toggle("hide", !isCart);
  viewHistory.classList.toggle("hide", isCart);
  if(!isCart) renderHistory();
}

// =========================
// 상담 기록 저장
// =========================
function saveConsultation(){
  const {total, final, discAmt, discRate} = recalc();
  if(total<=0) return;

  const memo = prompt("상담 메모 (선택)\n예: 피부 상태/희망/주의사항/프로그램 제안 등") || "";

  const record = {
    id: uid(),
    createdAt: nowISO(),
    clinicName: state.clinicName,
    items: state.cart.map(i=>({
      name: i.name,
      price: Number(i.price)||0,
      categoryId: i.categoryId
    })),
    totalPrice: total,
    discountAmount: discAmt,
    discountRate: (total>0 ? discRate : 0),
    finalPrice: final,
    memo: memo.trim()
  };

  state.consultations.unshift(record);
  state.cart = [];
  saveState(state);

  alert("상담 내역이 저장되었습니다.");
  render();
  switchTab("history");
}

// =========================
// Render
// =========================
function render(){
  clinicNameText.textContent = state.clinicName;
  editSwitch.classList.toggle("on", !!state.editMode);
  editSwitch.setAttribute("aria-checked", state.editMode ? "true" : "false");
  addCatBtn.disabled = !state.editMode;
  addItemBtn.disabled = !state.editMode || !state.activeCategoryId;

  const cats = state.categories.slice().sort((a,b)=>a.order-b.order);
  if(!state.activeCategoryId && cats[0]) state.activeCategoryId = cats[0].id;

  catList.innerHTML = "";
  cats.forEach(cat=>{
    const wrap = document.createElement("div");
    wrap.className = "cat " + (cat.id===state.activeCategoryId ? "active" : "");
    wrap.onclick = ()=>{ state.activeCategoryId = cat.id; saveState(state); render(); };

    const left = document.createElement("div");
    left.className = "grow";

    const name = document.createElement(state.editMode ? "input" : "div");
    name.className = state.editMode ? "field" : "cat-name";
    if(state.editMode){
      name.value = cat.name;
      name.oninput = (e)=>{ cat.name = e.target.value; saveState(state); };
    }else{
      name.textContent = cat.name;
    }
    left.appendChild(name);

    const right = document.createElement("div");
    right.className = "row";

    const del = document.createElement("button");
    del.className = "iconbtn danger" + (state.editMode ? "" : " hide");
    del.title = "카테고리 삭제";
    del.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>
      </svg>`;
    del.onclick = (ev)=>{
      ev.stopPropagation();
      if(!confirm("카테고리와 포함된 모든 시술이 삭제됩니다. 계속하시겠습니까?")) return;

      state.items = state.items.filter(it=>it.categoryId!==cat.id);
      state.cart = state.cart.filter(ci=>ci.categoryId!==cat.id);
      state.categories = state.categories.filter(c=>c.id!==cat.id);

      const nextCats = state.categories.slice().sort((a,b)=>a.order-b.order);
      state.activeCategoryId = nextCats[0]?.id || null;

      saveState(state);
      render();
    };

    right.appendChild(del);
    wrap.appendChild(left);
    wrap.appendChild(right);
    catList.appendChild(wrap);
  });

  const ac = getActiveCategory();
  activeCatTitle.textContent = ac ? ac.name : "카테고리를 선택하세요";

  const its = getItemsByActive();
  itemGrid.innerHTML = "";
  emptyState.classList.toggle("hide", !!state.activeCategoryId && its.length>0);

  if(state.activeCategoryId && its.length===0){
    emptyState.textContent = state.editMode ? "시술 항목이 없습니다. 상단 '시술 추가'로 추가하세요." : "시술 항목이 없습니다.";
    emptyState.classList.remove("hide");
  }
  if(!state.activeCategoryId){
    emptyState.textContent = "왼쪽에서 카테고리를 선택하세요.";
    emptyState.classList.remove("hide");
  }

  its.forEach(it=>{
    const box = document.createElement("div");
    box.className = "item";

    const head = document.createElement("div");
    head.className = "item-head";

    const left = document.createElement("div");
    left.className = "grow";

    const h = document.createElement(state.editMode ? "input" : "div");
    h.className = state.editMode ? "field" : "item-title";
    if(state.editMode){
      h.value = it.name;
      h.oninput = (e)=>{ it.name = e.target.value; saveState(state); };
    }else{
      h.textContent = it.name;
    }
    left.appendChild(h);

    const meta = document.createElement("div");
    meta.className = "meta";
    if(state.editMode){
      meta.innerHTML = "";
      const lab = document.createElement("span");
      lab.textContent = "가격";
      const price = document.createElement("input");
      price.className = "field right mono";
      price.type = "number";
      price.min = "0";
      price.step = "1";
      price.value = Number(it.price)||0;
      price.oninput = (e)=>{ it.price = Math.max(0, Number(e.target.value)||0); saveState(state); renderCartOnly(); };
      meta.appendChild(lab);
      meta.appendChild(price);
    }else{
      meta.innerHTML = `<span>가격</span><b class="mono">₩ ${money(it.price)}</b>`;
    }
    left.appendChild(meta);

    const kv = document.createElement("div");
    kv.className = "kv";

    const efL = document.createElement("label");
    efL.textContent = "Effect";
    const ef = document.createElement(state.editMode ? "textarea" : "div");
    ef.className = state.editMode ? "field textarea" : "hint";
    if(state.editMode){
      ef.value = it.effect || "";
      ef.oninput = (e)=>{ it.effect = e.target.value; saveState(state); };
    }else{
      ef.textContent = it.effect || "";
    }

    const deL = document.createElement("label");
    deL.textContent = "Details";
    const de = document.createElement(state.editMode ? "textarea" : "div");
    de.className = state.editMode ? "field textarea" : "hint";
    if(state.editMode){
      de.value = it.details || "";
      de.oninput = (e)=>{ it.details = e.target.value; saveState(state); };
    }else{
      de.textContent = it.details || "";
    }

    kv.appendChild(efL); kv.appendChild(ef);
    kv.appendChild(deL); kv.appendChild(de);
    left.appendChild(kv);

    const right = document.createElement("div");
    right.style.display = "grid";
    right.style.gap = "8px";
    right.style.minWidth = "130px";
    right.style.justifyItems = "end";

    if(!state.editMode){
      const add = document.createElement("button");
      add.className = "btn primary";
      add.textContent = "담기";
      add.onclick = ()=>{
        state.cart.push({ cartId: uid(), ...it }); // snapshot
        saveState(state);
        renderCartOnly();
      };
      right.appendChild(add);
    }else{
      const del = document.createElement("button");
      del.className = "btn danger";
      del.textContent = "삭제";
      del.onclick = ()=>{
        if(!confirm("이 항목을 삭제하시겠습니까?")) return;
        state.items = state.items.filter(x=>x.id!==it.id);
        state.cart = state.cart.filter(c=>c.id!==it.id);
        saveState(state);
        render();
      };
      right.appendChild(del);
    }

    head.appendChild(left);
    head.appendChild(right);
    box.appendChild(head);
    itemGrid.appendChild(box);
  });

  renderCartOnly();
}

function renderCartOnly(){
  cartList.innerHTML = "";
  state.cart.forEach(c=>{
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="grow">
        <b>${escapeHtml(c.name)}</b>
        <small class="mono">₩ ${money(c.price)}</small>
      </div>
      <button class="iconbtn" title="제거">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18"/><path d="M6 6l12 12"/>
        </svg>
      </button>
    `;
    row.querySelector("button").onclick = ()=>{
      state.cart = state.cart.filter(x=>x.cartId!==c.cartId);
      saveState(state);
      renderCartOnly();
    };
    cartList.appendChild(row);
  });

  const mode = state.discount.mode;
  customRateRow.classList.toggle("hide", mode!=="customRate");
  customPriceRow.classList.toggle("hide", mode!=="customPrice");

  rateButtons.forEach(btn=>{
    const r = Number(btn.dataset.rate);
    const active = (mode==="preset" && Number(state.discount.rate)===r);
    btn.classList.toggle("active", active);
    btn.onclick = ()=>{
      state.discount.mode = "preset";
      state.discount.rate = r;
      saveState(state);
      renderCartOnly();
    };
  });

  customRateBtn.classList.toggle("active", mode==="customRate");
  customRateBtn.onclick = ()=>{ state.discount.mode="customRate"; saveState(state); renderCartOnly(); };

  customPriceBtn.classList.toggle("active", mode==="customPrice");
  customPriceBtn.onclick = ()=>{ setDiscountMode("customPrice"); };

  customRateInput.value = String(clamp(Number(state.discount.rate)||0, 0, 100));
  customRateInput.oninput = (e)=>{
    const v = clamp(Number(e.target.value)||0, 0, 100);
    state.discount.rate = v;
    state.discount.mode = "customRate";
    saveState(state);
    renderCartOnly();
  };

  customPriceInput.value = String(state.discount.customFinal || "");
  customPriceInput.oninput = (e)=>{
    state.discount.customFinal = e.target.value;
    state.discount.mode = "customPrice";
    saveState(state);
    renderCartOnly();
  };

  const {total, final, discAmt, discRate} = recalc();
  totalSumText.textContent = "₩ " + money(total);
  discountAmountText.textContent = "- ₩ " + money(discAmt);
  actualRateText.textContent = (total>0 ? discRate.toFixed(1) : "0.0") + "%";
  finalPriceText.textContent = "₩ " + money(final);

  confirmBtn.disabled = (total<=0);
}

function renderHistory(){
  const list = state.consultations || [];
  historyList.innerHTML = "";
  historyEmpty.classList.toggle("hide", list.length>0);
  if(list.length===0) return;

  list.forEach((r, idx)=>{
    const wrap = document.createElement("div");
    wrap.className = "item";

    const itemLines = (r.items||[]).slice(0, 12).map(it=>{
      return `
        <div class="row between">
          <span style="font-weight:950">${escapeHtml(it.name)}</span>
          <span class="mono">₩ ${money(it.price)}</span>
        </div>
      `;
    }).join("");

    const more = (r.items||[]).length > 12 ? `<div class="hint tiny">+ ${(r.items||[]).length-12}개 더</div>` : "";

    wrap.innerHTML = `
      <div class="row between">
        <div class="grow">
          <div style="font-weight:1000">${escapeHtml(r.clinicName || state.clinicName)}</div>
          <div class="hint tiny">${fmtKST(r.createdAt)}</div>
        </div>
        <div class="row">
          <button class="btn small" data-act="copy">복사</button>
          <button class="btn small danger" data-act="del">삭제</button>
        </div>
      </div>

      <div style="margin-top:10px; display:grid; gap:6px; font-weight:900">
        <div class="row between"><span class="hint">총합</span><span class="mono">₩ ${money(r.totalPrice)}</span></div>
        <div class="row between"><span class="hint">할인</span><span class="mono" style="color:#ef4444">- ₩ ${money(r.discountAmount)}</span></div>
        <div class="row between"><span class="hint">최종가</span><span class="mono" style="color:#16a34a">₩ ${money(r.finalPrice)}</span></div>
        <div class="row between"><span class="hint">할인율</span><span class="pill">${Number(r.discountRate||0).toFixed(1)}%</span></div>
        ${r.memo ? `<div class="hint" style="white-space:pre-wrap;">메모: ${escapeHtml(r.memo)}</div>` : `<div class="hint tiny">메모: (없음)</div>`}
      </div>

      <div style="margin-top:10px; border-top:1px solid var(--line); padding-top:10px; display:grid; gap:6px">
        ${itemLines}
        ${more}
      </div>
    `;

    const copyBtn = wrap.querySelector('[data-act="copy"]');
    const delBtn = wrap.querySelector('[data-act="del"]');

    copyBtn.onclick = async ()=>{
      const text = consultationToText(r);
      try{
        await navigator.clipboard.writeText(text);
        alert("복사되었습니다.");
      }catch(e){
        prompt("아래 내용을 길게 눌러 복사하세요.", text);
      }
    };

    delBtn.onclick = ()=>{
      if(!confirm("이 상담 기록을 삭제하시겠습니까?")) return;
      state.consultations.splice(idx, 1);
      saveState(state);
      renderHistory();
    };

    historyList.appendChild(wrap);
  });
}

function consultationToText(r){
  const lines = [];
  lines.push(`상담 기록 (${fmtKST(r.createdAt)})`);
  lines.push(`병원: ${r.clinicName || state.clinicName}`);
  lines.push("");
  lines.push("[시술]");
  (r.items||[]).forEach(it=>{
    lines.push(`- ${it.name} / ${money(it.price)}원`);
  });
  lines.push("");
  lines.push(`총합: ${money(r.totalPrice)}원`);
  lines.push(`할인: ${money(r.discountAmount)}원 (${Number(r.discountRate||0).toFixed(1)}%)`);
  lines.push(`최종가: ${money(r.finalPrice)}원`);
  lines.push("");
  lines.push(`메모: ${r.memo || "(없음)"}`);
  return lines.join("\n");
}

// =========================
// Events
// =========================
tabCart.onclick = ()=> switchTab("cart");
tabHistory.onclick = ()=> switchTab("history");

editSwitch.onclick = ()=>{
  state.editMode = !state.editMode;
  saveState(state);
  render();
};

editClinicBtn.onclick = ()=>{
  const next = prompt("병원명(가격표 제목)을 입력하세요.", state.clinicName);
  if(next===null) return;
  state.clinicName = (next || "").trim() || "다채움의원";
  saveState(state);
  render();
};

addCatBtn.onclick = ()=>{
  if(!state.editMode) return;
  const name = prompt("카테고리 이름", "새 카테고리");
  if(name===null) return;
  const order = state.categories.length ? Math.max(...state.categories.map(c=>c.order||0))+1 : 0;
  const id = uid();
  state.categories.push({id, name: (name||"새 카테고리").trim() || "새 카테고리", order});
  state.activeCategoryId = id;
  saveState(state);
  render();
};

addItemBtn.onclick = ()=>{
  if(!state.editMode || !state.activeCategoryId) return;
  const name = prompt("시술명", "새 시술 항목");
  if(name===null) return;
  const price = Number(prompt("가격(원)", "100000")) || 0;
  const catItems = state.items.filter(i=>i.categoryId===state.activeCategoryId);
  const order = catItems.length ? Math.max(...catItems.map(i=>i.order||0))+1 : 0;
  state.items.push({
    id: uid(),
    categoryId: state.activeCategoryId,
    name: (name||"새 시술 항목").trim() || "새 시술 항목",
    price: Math.max(0, price),
    effect: "시술의 주요 효과를 입력하세요.",
    details: "시술에 대한 상세 설명 및 추천 대상을 입력하세요.",
    order
  });
  saveState(state);
  render();
};

clearCartBtn.onclick = ()=>{
  state.cart = [];
  saveState(state);
  renderCartOnly();
};

confirmBtn.onclick = saveConsultation;

exportBtn.onclick = ()=>{
  const list = state.consultations || [];
  if(list.length===0){ alert("내보낼 기록이 없습니다."); return; }
  const text = list.map(consultationToText).join("\n\n-------------------------\n\n");
  prompt("아래 내용을 길게 눌러 복사하세요.", text);
};

wipeHistoryBtn.onclick = ()=>{
  if(!confirm("상담 기록을 전부 삭제하시겠습니까? (복구 불가)")) return;
  state.consultations = [];
  saveState(state);
  renderHistory();
};

// init heal
(function heal(){
  const cats = state.categories.slice().sort((a,b)=>a.order-b.order);
  if(!state.activeCategoryId && cats[0]) state.activeCategoryId = cats[0].id;
  saveState(state);
})();

switchTab("cart");
render();