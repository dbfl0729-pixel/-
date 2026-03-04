
/* 클리닉 통합 앱 (가격표/재고/관리자) - 로컬 저장 기반 */

const KEY = "clinic_suite_v1";

const formatPrice = (n) => new Intl.NumberFormat("ko-KR").format(Number(n||0));
const nowISO = () => new Date().toISOString();

const defaultState = {
  meta: {
    hospitalName: "다채움의원",
    subtitle: "Consult · Price · Inventory",
    updatedAt: nowISO()
  },
  price: {
    programs: [
      {
        id: "lifting",
        name: "리프팅",
        items: [
          {
            id: "u300",
            name: "울쎄라 300샷",
            price: 990000,
            effects: ["탄력", "리프팅", "윤곽"],
            details: "권장: 1회\n주의: 시술 후 일시적 당김/압통 가능",
            components: "울쎄라 300샷"
          },
          {
            id: "shurink",
            name: "슈링크 유니버스",
            price: 150000,
            effects: ["탄력", "붓기 케어"],
            details: "권장: 3~5회\n시술 후 붓기/미열감 가능",
            components: "슈링크 유니버스"
          }
        ]
      },
      {
        id: "booster",
        name: "스킨부스터",
        items: [
          {
            id: "juvelook",
            name: "쥬베룩 1회",
            price: 350000,
            effects: ["콜라겐", "모공", "탄력"],
            details: "권장: 3회\n멍/붓기 가능",
            components: "쥬베룩"
          },
          {
            id: "rejuran",
            name: "리쥬란 1회",
            price: 300000,
            effects: ["피부 재생", "결 개선", "탄력"],
            details: "권장: 3~4회\n붓기/엠보싱 가능",
            components: "리쥬란"
          }
        ]
      }
    ],
    events: [
      {
        id: "event_march",
        name: "3월 이벤트",
        items: [
          {
            id: "evt_toning",
            name: "토닝 5회 패키지",
            price: 790000,
            effects: ["톤 개선", "색소", "광채"],
            details: "기간 한정 이벤트\n세부 구성은 내원 시 안내",
            components: "토닝 5회"
          }
        ]
      }
    ],
    singleLasers: [
      { id: "pico_1", category:"토닝", name:"피코토닝 1회", price:200000, note:"톤/색소" },
      { id: "rev_1", category:"토닝", name:"레블라이트 토닝 1회", price:180000, note:"잡티/톤" },
      { id: "gen_1", category:"혈관/홍조", name:"제네시스 1회", price:220000, note:"홍조/모공" }
    ]
  },
  cart: [],
  discount: { type: "none", value: 0 }, // none | rate | amount
  inventory: {
    items: [
      { id:"u300", name:"울쎄라 팁", category:"소모품", unit:"EA", stock:3, recommended:2, active:true, updatedAt: nowISO() },
      { id:"juvelook", name:"쥬베룩", category:"약제", unit:"Vial", stock:8, recommended:6, active:true, updatedAt: nowISO() }
    ]
  }
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    // shallow merge, then deep defaults for known paths
    const s = structuredClone(defaultState);
    return {
      ...s,
      ...parsed,
      meta: { ...s.meta, ...(parsed.meta||{}), updatedAt: parsed?.meta?.updatedAt || s.meta.updatedAt },
      price: { ...s.price, ...(parsed.price||{}) },
      inventory: { ...s.inventory, ...(parsed.inventory||{}) },
      cart: Array.isArray(parsed.cart) ? parsed.cart : s.cart,
      discount: parsed.discount ? { ...s.discount, ...parsed.discount } : s.discount
    };
  } catch {
    return structuredClone(defaultState);
  }
}
function save() {
  state.meta.updatedAt = nowISO();
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { alert("저장 실패: 저장공간 또는 브라우저 정책을 확인하세요."); }
}

let state = load();

function $(sel) { return document.querySelector(sel); }
function el(tag, props={}, children=[]) {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(props||{})) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return e;
}

function route() {
  const hash = location.hash || "#/price/programs";
  const path = hash.replace(/^#/, "");
  return path.startsWith("/") ? path : "/price/programs";
}

function setActiveNav(path) {
  document.querySelectorAll(".nav-item").forEach(a=>{
    a.classList.toggle("active", a.getAttribute("data-route") === path);
  });
}

function setTitle(t){ $("#pageTitle").textContent = t; }

function cartCount() {
  return state.cart.reduce((sum, it)=>sum + (it.qty||0), 0);
}
function updateCartPill() {
  $("#cartPill").textContent = `장바구니 ${cartCount()}`;
}

function vatVisibleFor(path){
  // 이벤트 섹션 제외
  return path !== "/price/events";
}
function renderVat(path){
  const vat = $("#vatNotice");
  if (!vatVisibleFor(path)) { vat.textContent=""; return; }
  vat.textContent = "VAT 포함 / 현금·카드 동일가";
}

function findPriceItemById(id){
  const all = [
    ...state.price.programs.flatMap(c=>c.items||[]),
    ...state.price.events.flatMap(c=>c.items||[]),
    ...state.price.singleLasers
  ];
  return all.find(x=>x.id===id) || null;
}
function inventoryById(id){
  return (state.inventory.items||[]).find(x=>x.id===id) || null;
}

function addToCart(itemId, qty=1){
  const item = findPriceItemById(itemId);
  if (!item) return alert("품목을 찾지 못했습니다.");
  const existing = state.cart.find(x=>x.id===itemId);
  if (existing) existing.qty += qty;
  else state.cart.push({ id:itemId, name:item.name, price:Number(item.price||0), qty });
  save(); updateCartPill();
}

function removeFromCart(itemId){
  state.cart = state.cart.filter(x=>x.id!==itemId);
  save(); updateCartPill();
}
function setCartQty(itemId, qty){
  const it = state.cart.find(x=>x.id===itemId);
  if (!it) return;
  it.qty = Math.max(1, Number(qty||1));
  save(); updateCartPill();
}
function cartSubtotal(){
  return state.cart.reduce((sum,x)=>sum + Number(x.price||0)*Number(x.qty||0), 0);
}
function discountedTotal(){
  const sub = cartSubtotal();
  const d = state.discount || {type:"none", value:0};
  if (d.type==="rate") return Math.max(0, Math.round(sub * (1 - (Number(d.value||0)/100))));
  if (d.type==="amount") return Math.max(0, sub - Number(d.value||0));
  return sub;
}

/* ---------- UI: Price Cards ---------- */
function priceItemCard(item, {showInventoryLink=false}={}){
  const inv = inventoryById(item.id);
  const stockBadge = inv ? stockBadgeEl(inv) : el("span", {class:"badge"}, ["재고: -"]);
  const header = el("div", {class:"row", style:"align-items:flex-start; justify-content:space-between"});
  const left = el("div", {class:"col", style:"min-width:220px; flex:1"});
  left.appendChild(el("div", {class:"h2"}, [item.name]));
  left.appendChild(el("div", {class:"muted"}, [item.components ? `구성: ${item.components}` : (item.note||"")]));
  const right = el("div", {style:"text-align:right; min-width:140px"});
  right.appendChild(el("div", {class:"h2"}, [`${formatPrice(item.price)}원`]));
  const actions = el("div", {style:"display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; margin-top:8px"});
  actions.appendChild(el("button", {class:"btn btn-primary btn-small", onclick:()=>addToCart(item.id,1)}, ["담기"]));
  if (showInventoryLink) {
    actions.appendChild(el("a", {class:"btn btn-ghost btn-small", href:"#/inventory"}, ["재고 보기"]));
  }
  right.appendChild(actions);

  header.appendChild(left);
  header.appendChild(right);

  const effects = el("div", {class:"effects"});
  (item.effects||[]).slice(0,8).forEach(eff=>effects.appendChild(el("span",{class:"effect"},[eff])));

  const detailsBox = el("div", {class:"details-box"});
  detailsBox.appendChild(el("div", {class:"h2"}, ["Program Details"]));
  detailsBox.appendChild(el("div", {style:"white-space:pre-wrap; line-height:1.55"}, [item.details || ""]));

  const bottomRow = el("div", {class:"row", style:"align-items:center; justify-content:space-between; margin-top:10px"});
  const effCol = el("div", {class:"col", style:"min-width:240px"});
  effCol.appendChild(el("div", {class:"muted", style:"margin-bottom:6px"}, ["Effect"]));
  effCol.appendChild(effects);
  const invCol = el("div", {style:"min-width:170px; text-align:right"});
  invCol.appendChild(stockBadge);

  bottomRow.appendChild(effCol);
  bottomRow.appendChild(invCol);

  const card = el("div", {class:"card"});
  card.appendChild(header);
  card.appendChild(el("div", {class:"hr"}));
  card.appendChild(detailsBox);
  card.appendChild(bottomRow);
  return card;
}

function stockBadgeEl(inv){
  const stock = Number(inv.stock||0);
  const rec = Number(inv.recommended||0);
  let cls = "badge";
  if (stock <= 0) cls += " bad";
  else if (stock < rec) cls += " warn";
  else cls += " good";
  return el("span", {class:cls}, [`재고: ${stock} ${inv.unit||""}`]);
}

/* ---------- Pages ---------- */
function pagePricePrograms(){
  setTitle("가격표 · 프로그램");
  const root = el("div", {}, []);
  root.appendChild(el("div", {class:"row"}, [
    el("div",{class:"col"},[
      el("div",{class:"card"},[
        el("div",{class:"h1"},["프로그램 가격표"]),
        el("div",{class:"muted"},["프로그램별 구성/효과를 한눈에 확인합니다."])
      ])
    ])
  ]));

  (state.price.programs||[]).forEach(cat=>{
    root.appendChild(el("div",{style:"height:12px"}));
    root.appendChild(el("div",{class:"h1"},[cat.name]));
    (cat.items||[]).forEach(item=>{
      root.appendChild(priceItemCard(item, {showInventoryLink:true}));
      root.appendChild(el("div",{style:"height:10px"}));
    });
  });

  return root;
}

function pagePriceEvents(){
  setTitle("가격표 · 이벤트");
  const root = el("div", {}, []);
  root.appendChild(el("div",{class:"card"},[
    el("div",{class:"h1"},["이벤트"]),
    el("div",{class:"muted"},["이 섹션에서는 VAT 안내 문구가 자동으로 숨김 처리됩니다."])
  ]));
  root.appendChild(el("div",{style:"height:12px"}));
  (state.price.events||[]).forEach(cat=>{
    root.appendChild(el("div",{class:"h1"},[cat.name]));
    (cat.items||[]).forEach(item=>{
      root.appendChild(priceItemCard(item, {showInventoryLink:true}));
      root.appendChild(el("div",{style:"height:10px"}));
    });
  });
  return root;
}

function pageSingleLaser(){
  setTitle("단품 레이저 · 표");
  const root = el("div", {}, []);
  const q = el("input", {class:"input", placeholder:"검색 (예: 피코, 제네시스, 홍조, 토닝)"});
  const tableWrap = el("div", {class:"card"});
  const table = el("table", {class:"table"});
  const thead = el("thead", {}, [
    el("tr", {}, [
      el("th", {}, ["카테고리"]),
      el("th", {}, ["시술명"]),
      el("th", {}, ["1회 금액"]),
      el("th", {}, ["비고"]),
      el("th", {}, [""])
    ])
  ]);
  const tbody = el("tbody");
  table.appendChild(thead); table.appendChild(tbody);
  tableWrap.appendChild(el("div", {class:"h1"}, ["단품 레이저 테이블"]));
  tableWrap.appendChild(el("div", {class:"muted"}, ["상담 중 1회 비용을 빠르게 조회합니다."]));
  tableWrap.appendChild(el("div",{style:"height:10px"}));
  tableWrap.appendChild(q);
  tableWrap.appendChild(el("div",{style:"height:10px"}));
  tableWrap.appendChild(table);

  function renderRows(){
    const term = (q.value||"").trim().toLowerCase();
    tbody.innerHTML = "";
    const rows = (state.price.singleLasers||[]).filter(x=>{
      if (!term) return true;
      return [x.category,x.name,x.note].some(v=>(v||"").toLowerCase().includes(term));
    });
    rows.forEach(x=>{
      const inv = inventoryById(x.id);
      tbody.appendChild(el("tr", {}, [
        el("td", {}, [x.category||"-"]),
        el("td", {}, [x.name]),
        el("td", {}, [`${formatPrice(x.price)}원`]),
        el("td", {}, [x.note||""]),
        el("td", {}, [
          el("button", {class:"btn btn-primary btn-small", onclick:()=>addToCart(x.id,1)}, ["담기"])
        ])
      ]));
    });
    if (rows.length===0){
      tbody.appendChild(el("tr", {}, [el("td", {colspan:"5", class:"muted"}, ["검색 결과 없음"])]));
    }
  }
  q.addEventListener("input", renderRows);
  renderRows();

  root.appendChild(tableWrap);
  return root;
}

function pageSearch(){
  setTitle("검색");
  const root = el("div", {}, []);
  const q = el("input", {class:"input", placeholder:"프로그램/이벤트/단품 전체 검색"});
  const result = el("div", {style:"margin-top:12px; display:flex; flex-direction:column; gap:10px"});

  function allItems(){
    return [
      ...state.price.programs.flatMap(c=>c.items||[]).map(x=>({...x, __type:"프로그램"})),
      ...state.price.events.flatMap(c=>c.items||[]).map(x=>({...x, __type:"이벤트"})),
      ...(state.price.singleLasers||[]).map(x=>({...x, effects:[], details:x.note||"", components:x.category||"", __type:"단품"}))
    ];
  }
  function render(){
    const term = (q.value||"").trim().toLowerCase();
    result.innerHTML = "";
    if (!term){
      result.appendChild(el("div",{class:"card"},[
        el("div",{class:"muted"},["검색어를 입력하세요."])
      ]));
      return;
    }
    const items = allItems().filter(x=>{
      const hay = [x.__type, x.name, x.components, x.details, ...(x.effects||[])].join(" ").toLowerCase();
      return hay.includes(term);
    }).slice(0,50);

    if(items.length===0){
      result.appendChild(el("div",{class:"card"},[el("div",{class:"muted"},["검색 결과 없음"])]));
      return;
    }
    items.forEach(it=>{
      const card = el("div",{class:"card"});
      card.appendChild(el("div",{class:"row", style:"align-items:center; justify-content:space-between"},[
        el("div",{class:"col"},[
          el("div",{class:"h2"},[it.name]),
          el("div",{class:"muted"},[`${it.__type} · ${formatPrice(it.price)}원`])
        ]),
        el("div",{},[
          el("button",{class:"btn btn-primary btn-small", onclick:()=>addToCart(it.id,1)},["담기"])
        ])
      ]));
      result.appendChild(card);
    });
  }
  q.addEventListener("input", render);

  root.appendChild(el("div",{class:"card"},[
    el("div",{class:"h1"},["전체 검색"]),
    q,
    el("div",{class:"muted", style:"margin-top:10px"},["팁: 레이저명/효과 키워드로 검색 가능 (예: 모공, 홍조, 토닝)."])
  ]));
  root.appendChild(result);
  return root;
}

function pageCalculator(){
  setTitle("계산기");
  const root = el("div", {}, []);
  const type = el("select", {}, [
    el("option",{value:"none"},["할인 없음"]),
    el("option",{value:"rate"},["할인율(%)"]),
    el("option",{value:"amount"},["할인금액(원)"])
  ]);
  type.value = state.discount.type || "none";
  const value = el("input", {class:"input", type:"number", placeholder:"값 입력", value:String(state.discount.value||0)});
  const summary = el("div", {class:"card", style:"margin-top:12px"});
  const applyBtn = el("button",{class:"btn btn-primary", onclick:()=>{
    state.discount.type = type.value;
    state.discount.value = Number(value.value||0);
    save(); updateCartPill(); renderSummary();
  }},["적용"]);
  const clearBtn = el("button",{class:"btn btn-ghost", onclick:()=>{
    state.discount = {type:"none", value:0};
    type.value="none"; value.value="0";
    save(); updateCartPill(); renderSummary();
  }},["초기화"]);

  function renderSummary(){
    summary.innerHTML="";
    const sub = cartSubtotal();
    const total = discountedTotal();
    summary.appendChild(el("div",{class:"h1"},["계산 결과"]));
    summary.appendChild(el("div",{class:"row"},[
      el("div",{class:"col"},[
        el("div",{class:"muted"},["장바구니 합계"]),
        el("div",{class:"h2"},[`${formatPrice(sub)}원`])
      ]),
      el("div",{class:"col"},[
        el("div",{class:"muted"},["할인 적용 후"]),
        el("div",{class:"h2"},[`${formatPrice(total)}원`])
      ])
    ]));
    if (state.discount.type!=="none"){
      summary.appendChild(el("div",{class:"muted"},[`할인: ${state.discount.type==="rate" ? `${state.discount.value}%` : `${formatPrice(state.discount.value)}원`}`]));
    }
  }

  root.appendChild(el("div",{class:"card"},[
    el("div",{class:"h1"},["할인/총액 계산기"]),
    el("div",{class:"grid"},[
      el("div",{},[el("div",{class:"muted", style:"margin-bottom:6px"},["할인 방식"]), type]),
      el("div",{},[el("div",{class:"muted", style:"margin-bottom:6px"},["값"]), value])
    ]),
    el("div",{style:"display:flex; gap:10px; margin-top:12px; flex-wrap:wrap"},[applyBtn, clearBtn]),
    el("div",{class:"muted", style:"margin-top:10px"},["참고: 계산은 장바구니 합계를 기준으로 합니다."])
  ]));
  root.appendChild(summary);
  renderSummary();
  return root;
}

function pageCart(){
  setTitle("장바구니");
  const root = el("div", {}, []);
  const wrap = el("div",{class:"card"});
  wrap.appendChild(el("div",{class:"h1"},["장바구니"]));
  if (state.cart.length===0){
    wrap.appendChild(el("div",{class:"muted"},["담긴 항목이 없습니다."]));
    root.appendChild(wrap); return root;
  }

  const table = el("table",{class:"table"});
  const tbody = el("tbody");
  table.appendChild(el("thead",{},[
    el("tr",{},[
      el("th",{},["항목"]),
      el("th",{},["단가"]),
      el("th",{},["수량"]),
      el("th",{},["금액"]),
      el("th",{},[""])
    ])
  ]));
  table.appendChild(tbody);

  function renderRows(){
    tbody.innerHTML="";
    state.cart.forEach(it=>{
      const line = Number(it.price||0)*Number(it.qty||0);
      const qty = el("input",{class:"input", type:"number", min:"1", value:String(it.qty||1), style:"max-width:110px"});
      qty.addEventListener("change",()=>{ setCartQty(it.id, qty.value); renderRows(); renderTotals(); });

      tbody.appendChild(el("tr",{},[
        el("td",{},[it.name]),
        el("td",{},[`${formatPrice(it.price)}원`]),
        el("td",{},[qty]),
        el("td",{},[`${formatPrice(line)}원`]),
        el("td",{},[
          el("button",{class:"btn btn-danger btn-small", onclick:()=>{removeFromCart(it.id); renderApp();}},["삭제"])
        ])
      ]));
    });
  }

  const totals = el("div",{class:"card", style:"margin-top:12px"});
  function renderTotals(){
    totals.innerHTML="";
    const sub = cartSubtotal();
    const total = discountedTotal();
    totals.appendChild(el("div",{class:"h1"},["합계"]));
    totals.appendChild(el("div",{class:"row"},[
      el("div",{class:"col"},[
        el("div",{class:"muted"},["소계"]),
        el("div",{class:"h2"},[`${formatPrice(sub)}원`])
      ]),
      el("div",{class:"col"},[
        el("div",{class:"muted"},["할인 적용 후"]),
        el("div",{class:"h2"},[`${formatPrice(total)}원`])
      ])
    ]));
    if (state.discount.type!=="none"){
      totals.appendChild(el("div",{class:"muted"},[`할인 설정: ${state.discount.type==="rate" ? `${state.discount.value}%` : `${formatPrice(state.discount.value)}원`}`]));
      totals.appendChild(el("div",{style:"margin-top:10px"},[
        el("a",{class:"btn btn-ghost btn-small", href:"#/calculator"},["계산기에서 변경"])
      ]));
    } else {
      totals.appendChild(el("div",{style:"margin-top:10px"},[
        el("a",{class:"btn btn-ghost btn-small", href:"#/calculator"},["할인 설정"])
      ]));
    }
  }

  renderRows();
  renderTotals();

  wrap.appendChild(table);
  root.appendChild(wrap);
  root.appendChild(totals);
  return root;
}

function pageInventory(){
  setTitle("재고");
  const root = el("div", {}, []);
  const items = state.inventory.items || [];

  const header = el("div",{class:"card"},[
    el("div",{class:"h1"},["재고 관리"]),
    el("div",{class:"muted"},["저장: 브라우저 로컬(기기별). 필요 시 '데이터 내보내기'로 백업하세요."])
  ]);

  const addCard = el("div",{class:"card", style:"margin-top:12px"});
  addCard.appendChild(el("div",{class:"h2"},["품목 추가/수정"]));

  const id = el("input",{class:"input", placeholder:"연결 ID (가격표 항목과 동일하면 연동됨) 예: u300"});
  const name = el("input",{class:"input", placeholder:"품목명"});
  const category = el("input",{class:"input", placeholder:"카테고리"});
  const unit = el("input",{class:"input", placeholder:"단위 (EA, Vial 등)"});
  const stock = el("input",{class:"input", type:"number", placeholder:"재고 수량"});
  const recommended = el("input",{class:"input", type:"number", placeholder:"권장 재고"});
  const active = el("select",{},[
    el("option",{value:"true"},["활성"]),
    el("option",{value:"false"},["비활성"])
  ]);

  let editId = null;
  function resetForm(){
    editId=null;
    [id,name,category,unit,stock,recommended].forEach(x=>x.value="");
    active.value="true";
  }
  function upsert(){
    const itemId = (id.value||"").trim();
    if(!itemId) return alert("연결 ID를 입력하세요.");
    const payload = {
      id:itemId,
      name:(name.value||"").trim() || itemId,
      category:(category.value||"").trim(),
      unit:(unit.value||"").trim() || "EA",
      stock:Number(stock.value||0),
      recommended:Number(recommended.value||0),
      active: active.value==="true",
      updatedAt: nowISO()
    };
    const idx = state.inventory.items.findIndex(x=>x.id===itemId);
    if(idx>=0) state.inventory.items[idx]=payload;
    else state.inventory.items.unshift(payload);
    save(); renderApp();
  }

  addCard.appendChild(el("div",{class:"grid"},[
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["연결 ID"]), id]),
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["품목명"]), name]),
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["카테고리"]), category]),
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["단위"]), unit]),
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["재고"]), stock]),
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["권장"]), recommended]),
    el("div",{},[el("div",{class:"muted",style:"margin-bottom:6px"},["상태"]), active])
  ]));
  addCard.appendChild(el("div",{style:"display:flex; gap:10px; margin-top:12px; flex-wrap:wrap"},[
    el("button",{class:"btn btn-primary", onclick:upsert},["저장"]),
    el("button",{class:"btn btn-ghost", onclick:resetForm},["초기화"])
  ]));

  const listCard = el("div",{class:"card", style:"margin-top:12px"});
  listCard.appendChild(el("div",{class:"h2"},["목록"]));

  const q = el("input",{class:"input", placeholder:"검색 (품목명/카테고리/ID)"});
  listCard.appendChild(q);
  listCard.appendChild(el("div",{style:"height:10px"}));

  const table = el("table",{class:"table"});
  const tbody = el("tbody");
  table.appendChild(el("thead",{},[
    el("tr",{},[
      el("th",{},["상태"]),
      el("th",{},["ID"]),
      el("th",{},["품목"]),
      el("th",{},["카테고리"]),
      el("th",{},["재고/권장"]),
      el("th",{},["업데이트"]),
      el("th",{},[""])
    ])
  ]));
  table.appendChild(tbody);
  listCard.appendChild(table);

  function renderList(){
    tbody.innerHTML="";
    const term = (q.value||"").trim().toLowerCase();
    const filtered = items.filter(x=>{
      if(!term) return true;
      return [x.id,x.name,x.category].some(v=>(v||"").toLowerCase().includes(term));
    });
    filtered.forEach(x=>{
      const badge = stockBadgeEl(x);
      const status = x.active ? el("span",{class:"badge good"},["활성"]) : el("span",{class:"badge"},["비활성"]);
      tbody.appendChild(el("tr",{},[
        el("td",{},[status]),
        el("td",{},[el("span",{class:"kbd"},[x.id])]),
        el("td",{},[x.name]),
        el("td",{},[x.category||"-"]),
        el("td",{},[badge]),
        el("td",{},[(x.updatedAt||"").slice(0,19).replace("T"," ")]),
        el("td",{},[
          el("div",{style:"display:flex; gap:8px; flex-wrap:wrap"},[
            el("button",{class:"btn btn-ghost btn-small", onclick:()=>{
              id.value=x.id; name.value=x.name; category.value=x.category||""; unit.value=x.unit||"EA";
              stock.value=String(x.stock||0); recommended.value=String(x.recommended||0); active.value=String(!!x.active);
              window.scrollTo({top:0, behavior:"smooth"});
            }},["수정"]),
            el("button",{class:"btn btn-danger btn-small", onclick:()=>{
              if(!confirm("삭제(비활성 권장) 하시겠습니까?")) return;
              // 실제 삭제 대신 비활성 처리
              const idx = state.inventory.items.findIndex(it=>it.id===x.id);
              if(idx>=0){
                state.inventory.items[idx].active=false;
                state.inventory.items[idx].updatedAt=nowISO();
                save(); renderApp();
              }
            }},["비활성"])
          ])
        ])
      ]));
    });
    if(filtered.length===0){
      tbody.appendChild(el("tr",{},[el("td",{colspan:"7", class:"muted"},["검색 결과 없음"])]));
    }
  }
  q.addEventListener("input", renderList);
  renderList();

  root.appendChild(header);
  root.appendChild(addCard);
  root.appendChild(listCard);
  return root;
}

function pageAdmin(){
  setTitle("관리자 페이지");
  const root = el("div", {}, []);
  const card = el("div",{class:"card"});
  card.appendChild(el("div",{class:"h1"},["가격표 데이터 관리"]));
  card.appendChild(el("div",{class:"muted"},[
    "프로그램/이벤트/단품 데이터를 직접 편집합니다. ",
    "중요: 변경 후에는 '데이터 내보내기'로 백업 권장."
  ]));

  const mode = el("select",{},[
    el("option",{value:"programs"},["프로그램"]),
    el("option",{value:"events"},["이벤트"]),
    el("option",{value:"single"},["단품 레이저"])
  ]);
  const area = el("textarea",{class:"input", style:"min-height:260px"});
  const help = el("div",{class:"muted", style:"margin-top:10px"});
  help.textContent = "JSON 형식으로 편집합니다.";

  function refreshEditor(){
    const v = mode.value;
    if(v==="programs") area.value = JSON.stringify(state.price.programs, null, 2);
    if(v==="events") area.value = JSON.stringify(state.price.events, null, 2);
    if(v==="single") area.value = JSON.stringify(state.price.singleLasers, null, 2);
  }
  function applyEditor(){
    try{
      const v = mode.value;
      const data = JSON.parse(area.value || "null");
      if(v==="programs" && Array.isArray(data)) state.price.programs = data;
      else if(v==="events" && Array.isArray(data)) state.price.events = data;
      else if(v==="single" && Array.isArray(data)) state.price.singleLasers = data;
      else return alert("형식 오류: 배열(Array)이어야 합니다.");
      save(); renderApp();
      alert("적용 완료");
    }catch(e){
      alert("JSON 오류: " + e.message);
    }
  }

  mode.addEventListener("change", refreshEditor);
  refreshEditor();

  card.appendChild(el("div",{class:"grid"},[
    el("div",{},[
      el("div",{class:"muted", style:"margin-bottom:6px"},["편집 대상"]),
      mode
    ]),
    el("div",{},[
      el("div",{class:"muted", style:"margin-bottom:6px"},["병원명"]),
      el("input",{class:"input", value: state.meta.hospitalName, onchange:(e)=>{state.meta.hospitalName=e.target.value; $("#brandTitle").textContent=state.meta.hospitalName; save();}})
    ])
  ]));
  card.appendChild(el("div",{style:"height:10px"}));
  card.appendChild(area);
  card.appendChild(el("div",{style:"display:flex; gap:10px; margin-top:12px; flex-wrap:wrap"},[
    el("button",{class:"btn btn-primary", onclick:applyEditor},["적용"]),
    el("button",{class:"btn btn-ghost", onclick:refreshEditor},["되돌리기(현재 저장값 다시 불러오기)"])
  ]));
  card.appendChild(help);

  const tips = el("div",{class:"card", style:"margin-top:12px"});
  tips.appendChild(el("div",{class:"h2"},["필드 규칙"]));
  tips.appendChild(el("div",{style:"line-height:1.6; white-space:pre-wrap"},[
`프로그램/이벤트 아이템 필드
- id: 고유 ID (재고와 연동하려면 재고의 id와 동일하게)
- name: 노출명
- price: 숫자(원)
- effects: ["효과1","효과2"]
- details: Program Details에 표시(줄바꿈 가능)
- components: 구성 요약

단품 레이저 필드
- id, category, name, price, note`
  ]));
  root.appendChild(card);
  root.appendChild(tips);
  return root;
}

/* ---------- Render ---------- */
function renderApp(){
  const path = route();
  setActiveNav(path);
  updateCartPill();
  $("#brandTitle").textContent = state.meta.hospitalName || "클리닉";
  $("#brandSub").textContent = state.meta.subtitle || "";

  const content = $("#content");
  content.innerHTML = "";

  let node = null;
  if (path==="/price/programs") node = pagePricePrograms();
  else if (path==="/price/events") node = pagePriceEvents();
  else if (path==="/single") node = pageSingleLaser();
  else if (path==="/search") node = pageSearch();
  else if (path==="/calculator") node = pageCalculator();
  else if (path==="/cart") node = pageCart();
  else if (path==="/inventory") node = pageInventory();
  else if (path==="/admin") node = pageAdmin();
  else { location.hash = "#/price/programs"; return; }

  content.appendChild(node);
  renderVat(path);
}

window.addEventListener("hashchange", renderApp);

/* ---------- Import / Export ---------- */
function exportData(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url;
  a.download = `clinic-suite-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importData(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(reader.result);
      if(!obj || typeof obj!=="object") throw new Error("형식 오류");
      state = {
        ...structuredClone(defaultState),
        ...obj,
        meta:{...structuredClone(defaultState.meta), ...(obj.meta||{})},
        price:{...structuredClone(defaultState.price), ...(obj.price||{})},
        inventory:{...structuredClone(defaultState.inventory), ...(obj.inventory||{})},
        cart: Array.isArray(obj.cart) ? obj.cart : [],
        discount: obj.discount ? {...structuredClone(defaultState.discount), ...obj.discount} : structuredClone(defaultState.discount)
      };
      save();
      renderApp();
      alert("가져오기 완료");
    }catch(e){
      alert("가져오기 실패: " + e.message);
    }
  };
  reader.readAsText(file);
}

/* ---------- Mobile sidebar ---------- */
$("#menuBtn").addEventListener("click", ()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("click",(e)=>{
  const sb = $("#sidebar");
  if (window.matchMedia("(max-width: 920px)").matches){
    if (!sb.contains(e.target) && !$("#menuBtn").contains(e.target)) sb.classList.remove("open");
  }
});

$("#exportBtn").addEventListener("click", exportData);
$("#importInput").addEventListener("change", (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  importData(f);
  e.target.value="";
});

renderApp();
