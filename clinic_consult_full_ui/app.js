/* =========================
   데이터 (여기만 수정하면 됨)
========================= */
const VAT_NOTICE = 'VAT 포함 / 현금·카드 동일가';

const programSections = [
  {
    key: 'lifting',
    title: '리프팅',
    isEvent: false,
    programs: [
      { id:'ulthera-300', name:'울쎄라 300샷', price:990000, effects:['탄력','리프팅','처짐 개선'], details:'울쎄라 300샷 1회. 개인 피부 상태/부위에 따라 샷 수 및 범위가 달라질 수 있습니다.' },
      { id:'shurink', name:'슈링크 유니버스', price:150000, effects:['탄력','리프팅'], details:'가성비 탄력 관리. 부위 및 라인에 따라 시술 범위가 달라질 수 있습니다.' }
    ]
  },
  {
    key: 'toning',
    title: '토닝/색소',
    isEvent: false,
    programs: [
      { id:'pico-toning', name:'피코 토닝', price:220000, effects:['잡티','톤 개선','칙칙함'], details:'색소 상태에 따라 레이저 조합/횟수가 달라질 수 있습니다.' }
    ]
  },
  {
    key: 'event',
    title: '이벤트',
    isEvent: true,
    programs: [
      { id:'event-sample', name:'이벤트 패키지', price:490000, effects:['기간 한정','프로모션'], details:'이벤트 구성은 기간/재고/원장 판단에 따라 변동될 수 있습니다.' }
    ]
  }
];

const singleLaserItems = [
  { id:'rev-lite-1', name:'레블라이트 토닝 1회', price:150000, note:'기본 토닝' },
  { id:'pico-532-1', name:'피코 532 1회', price:190000, note:'표재 색소' },
  { id:'alex-755-1', name:'알렉스 755 1회', price:220000, note:'진한 색소' }
];


/* =========================
   유틸
========================= */
const fmt = (n)=> new Intl.NumberFormat('ko-KR').format(Number(n||0));
const qs = (s,el=document)=> el.querySelector(s);
const qsa = (s,el=document)=> Array.from(el.querySelectorAll(s));

function loadLS(key, fallback){
  try{ const v = JSON.parse(localStorage.getItem(key)||''); return (v===null||v===undefined||v==='')?fallback:v; }catch(_){ return fallback; }
}
function saveLS(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(_){}
}
function logAction(label){
  actionLog.unshift({ts:Date.now(), label});
  if(actionLog.length>30) actionLog = actionLog.slice(0,30);
  renderActionLog();
}

const toast = (msg)=>{
  const t = qs('#toast'); qs('#toastText').textContent = msg;
  t.style.display='flex';
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(()=>{t.style.display='none'}, 1200);
};

/* =========================
   상태
========================= */
let view = 'price';            // price | single | admin
let activeSectionKey = 'lifting';
let selectedItem = null;       // {type:'program'|'single', ...}
let cart = [];                 // {id,name,price,qty}

// calculator / discount log
let adjValue = 0;              // current adjustment applied to cart sum (negative=discount)
let discountLog = [];          // {ts:number,label:string,amount:number,base:number}
let actionLog = [];            // {ts:number,label:string}
let favorites = loadLS('favorites', []); // array of ids
let recentConsults = loadLS('recentConsults', []); // array of snapshots
let __lastAdjInput = '0';

/* =========================
   렌더
========================= */
function setView(next){
  view = next;
  qsa('#nav button').forEach(b=>{
    b.classList.toggle('active', b.dataset.view===next);
  });
  selectedItem = null;
  renderActionLog();
renderAll();

}


function renderFavorites(){
  const box = qs('#favList');
  if(!box) return;
  if(!favorites.length){
    box.innerHTML = `<div class="muted" style="padding:8px 0">없음</div>`;
    return;
  }
  const all = [...programSections.flatMap(s=>s.programs.map(p=>({...p, _type:'program', _isEvent:s.isEvent}))), ...singleLaserItems.map(it=>({...it, _type:'single'}))];
  const items = favorites.map(id=>all.find(x=>x.id===id)).filter(Boolean);
  box.innerHTML = '';
  items.forEach(it=>{
    const btn = document.createElement('button');
    btn.className = 'favBtn';
    btn.innerHTML = `<span>${escapeHtml(it.name)}</span><span class="muted">${fmt(it.price)}원</span>`;
    btn.onclick = ()=>{
      // switch view accordingly and select
      if(it._type==='single'){ setView('single'); selectedItem = {type:'single', ...it}; }
      else {
        setView('price');
        // find section containing it
        const sec = programSections.find(s=>s.programs.some(p=>p.id===it.id));
        if(sec) activeSectionKey = sec.key;
        selectedItem = {type:'program', section:activeSectionKey, ...it, isEvent: (sec?sec.isEvent:false)};
      }
      renderActionLog();
renderAll();

    };
    box.appendChild(btn);
  });
}

function renderRecent(){
  const box = qs('#recentList');
  if(!box) return;
  if(!recentConsults.length){
    box.innerHTML = `<div class="muted" style="padding:8px 0">없음</div>`;
    return;
  }
  box.innerHTML = '';
  recentConsults.slice(0,8).forEach((c, idx)=>{
    const dt = new Date(c.ts);
    const label = `${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const btn = document.createElement('button');
    btn.className='favBtn';
    btn.innerHTML = `<span>${label}</span><span class="muted">${fmt(c.total)}원</span>`;
    btn.onclick = ()=> loadConsult(idx);
    box.appendChild(btn);
  });
}

function loadConsult(index){
  const c = recentConsults[index];
  if(!c) return;
  cart = c.cart || [];
  adjValue = c.adjValue || 0;
  discountLog = c.discountLog || [];
  qs('#adjInput').value = String(adjValue);
  logAction('최근 상담 불러오기');
  renderActionLog();
renderAll();

  toast('불러옴');
}

function toggleFavorite(id){
  if(favorites.includes(id)) favorites = favorites.filter(x=>x!==id);
  else favorites.unshift(id);
  favorites = Array.from(new Set(favorites)).slice(0,30);
  saveLS('favorites', favorites);
  renderFavorites();
  toast(favorites.includes(id) ? '즐겨찾기 추가' : '즐겨찾기 해제');
}


function renderAll(){
  renderHeader();
  renderFavorites();
  renderRecent();
  renderLeft();
  renderDetail();
  logAction('수량 변경');
  renderCart();
}

function renderHeader(){
  const title = qs('#panelTitle');
  const sub = qs('#panelSub');
  if(view==='price'){ title.textContent='가격표'; sub.textContent='프로그램 / 이벤트'; }
  if(view==='single'){ title.textContent='단품 레이저'; sub.textContent='1회 단가 빠른 조회'; }
  if(view==='admin'){ title.textContent='관리자'; sub.textContent='더미 페이지(확장 가능)'; }
}

function renderLeft(){
  const left = qs('#leftBody');
  left.innerHTML = '';

  const keyword = qs('#searchInput').value.trim().toLowerCase();

  if(view==='price'){
    // section tabs
    const tabs = document.createElement('div');
    tabs.className='tags';
    programSections.forEach(sec=>{
      const btn = document.createElement('button');
      btn.className='btn';
      btn.style.padding='8px 10px';
      btn.textContent = sec.title + (sec.isEvent ? ' (이벤트)' : '');
      btn.onclick = ()=>{ activeSectionKey = sec.key; renderLeft(); renderDetail(); };
      if(sec.key===activeSectionKey){ btn.classList.add('primary'); }
      tabs.appendChild(btn);
    });
    left.appendChild(tabs);

    const sec = programSections.find(s=>s.key===activeSectionKey) || programSections[0];
    const list = document.createElement('div');
    list.className='cards';
    list.style.marginTop='12px';

    const filtered = sec.programs.filter(p=>{
      if(!keyword) return true;
      const blob = (p.name+' '+(p.effects||[]).join(' ')+' '+(p.details||'')).toLowerCase();
      return blob.includes(keyword);
    });

    filtered.forEach(p=>{
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `
        <div class="cardRow">
          <div class="cardTitle">${escapeHtml(p.name)}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="smallBtn" data-act="fav" title="즐겨찾기">☆</button>
            <div class="price">${fmt(p.price)}원</div>
          </div>
        </div>
        <div class="tags">${(p.effects||[]).map(e=>`<span class="tag">${escapeHtml(e)}</span>`).join('')}</div>
        <div class="cardRow">
          <div class="muted">Effect 요약</div>
          <div style="display:flex;gap:8px">
            <button class="smallBtn" data-act="detail">상세</button>
            <button class="smallBtn" data-act="add">추가</button>
          </div>
        </div>
      `;
      card.querySelector('[data-act="fav"]').onclick = ()=>{ toggleFavorite(p.id); };
      card.querySelector('[data-act="detail"]').onclick = ()=>{
        selectedItem = { type:'program', section:sec.key, ...p, isEvent: sec.isEvent };
        renderDetail();
      };
      card.querySelector('[data-act="add"]').onclick = ()=>{
        addToCart(p.id, p.name, p.price);
      };
      list.appendChild(card);
    });

    left.appendChild(list);

    // VAT notice (이벤트 제외)
    if(!sec.isEvent){
      const notice = document.createElement('div');
      notice.className='notice';
      notice.innerHTML = `<div class="dot"></div><div><b>${VAT_NOTICE}</b></div>`;
      left.appendChild(notice);
    } else {
      const notice = document.createElement('div');
      notice.className='notice';
      notice.innerHTML = `<div class="dot" style="background:var(--warn)"></div><div><b>이벤트는 VAT 문구 자동 제외</b></div>`;
      left.appendChild(notice);
    }
    return;
  }

  if(view==='single'){
    const cols = [
      ['name','시술명'],
      ['price','1회 비용'],
      ['note','비고'],
      ['act','']
    ];
    const table = document.createElement('table');
    table.className='table';
    table.innerHTML = `
      <thead>
        <tr>${cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    const filtered = singleLaserItems.filter(it=>{
      if(!keyword) return true;
      return (it.name+' '+(it.note||'')).toLowerCase().includes(keyword);
    });

    filtered.forEach(it=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${escapeHtml(it.name)}</b></td>
        <td>${fmt(it.price)}원</td>
        <td class="muted">${escapeHtml(it.note||'')}</td>
        <td>
          <button class="smallBtn" data-act="fav" title="즐겨찾기">☆</button>
          <button class="smallBtn" data-act="detail">상세</button>
          <button class="smallBtn" data-act="add">추가</button>
        </td>
      `;
      tr.querySelector('[data-act="fav"]').onclick = ()=> toggleFavorite(it.id);
      tr.querySelector('[data-act="detail"]').onclick = ()=>{
        selectedItem = { type:'single', ...it };
        renderDetail();
      };
      tr.querySelector('[data-act="add"]').onclick = ()=> addToCart(it.id, it.name, it.price);
      tbody.appendChild(tr);
    });

    left.appendChild(table);

    const notice = document.createElement('div');
    notice.className='notice';
    notice.innerHTML = `<div class="dot"></div><div><b>${VAT_NOTICE}</b></div>`;
    left.appendChild(notice);
    return;
  }
  if(view==='admin'){
    const box = document.createElement('div');
    box.className='kpi';
    box.innerHTML = `
      <div class="muted">관리자(더미)</div>
      <div class="big" style="margin-top:6px">연동 예정 기능</div>
      <ul style="margin:10px 0 0; color:var(--text); line-height:1.7">
        <li>가격표/프로그램 데이터 편집</li>
                <li>VAT 문구 자동 규칙 관리(이벤트 제외)</li>
        <li>프로그램 구성(구성요소) 연결</li>
      </ul>
      <div class="notice"><div class="dot"></div><div><b>${VAT_NOTICE}</b> (이 페이지는 규칙 예시)</div></div>
    `;
    left.appendChild(box);
    return;
  }
}

function renderDetail(){
  const d = qs('#detailBody');
  if(!selectedItem){
    d.innerHTML = `<div class="muted">왼쪽에서 프로그램/단품을 선택하면 상세가 표시됩니다.</div>`;
    return;
  }

  if(selectedItem.type==='program'){
    d.innerHTML = `
      <div class="card" style="background:rgba(15,19,32,.35)">
        <div class="cardRow">
          <div class="cardTitle">${escapeHtml(selectedItem.name)}</div>
          <div class="price">${fmt(selectedItem.price)}원</div>
        </div>
        <div class="muted">Effect</div>
        <div class="tags">${(selectedItem.effects||[]).map(e=>`<span class="tag">${escapeHtml(e)}</span>`).join('')}</div>
        <hr class="sep"/>
        <div class="muted">Program Details</div>
        <div style="line-height:1.7">${escapeHtml(selectedItem.details||'')}</div>
        ${selectedItem.isEvent ? '' : `<div class="notice"><div class="dot"></div><div><b>${VAT_NOTICE}</b></div></div>`}
        <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
          <button class="btn primary" id="detailAdd">장바구니 추가</button>
          <button class="btn" id="detailFav">즐겨찾기</button>
          <button class="btn" id="detailCopy">상세 복사</button>
        </div>
      </div>
    `;
    qs('#detailAdd').onclick = ()=> addToCart(selectedItem.id, selectedItem.name, selectedItem.price);
    qs('#detailFav').onclick = ()=> toggleFavorite(selectedItem.id);
    qs('#detailCopy').onclick = ()=>{
      const txt = `[${selectedItem.name}]\n가격: ${fmt(selectedItem.price)}원\nEffect: ${(selectedItem.effects||[]).join(', ')}\n상세: ${selectedItem.details||''}`;
      navigator.clipboard?.writeText(txt).then(()=>toast('상세 복사됨')).catch(()=>toast('복사 실패'));
    };
    return;
  }

  if(selectedItem.type==='single'){
    d.innerHTML = `
      <div class="card" style="background:rgba(15,19,32,.35)">
        <div class="cardRow">
          <div class="cardTitle">${escapeHtml(selectedItem.name)}</div>
          <div class="price">${fmt(selectedItem.price)}원</div>
        </div>
        <div class="muted">비고</div>
        <div style="line-height:1.7">${escapeHtml(selectedItem.note||'')}</div>
        <div class="notice"><div class="dot"></div><div><b>${VAT_NOTICE}</b></div></div>
        <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
          <button class="btn primary" id="detailAdd">장바구니 추가</button>
          <button class="btn" id="detailFav">즐겨찾기</button>
          <button class="btn" id="detailCopy">상세 복사</button>
        </div>
      </div>
    `;
    qs('#detailAdd').onclick = ()=> addToCart(selectedItem.id, selectedItem.name, selectedItem.price);
    qs('#detailFav').onclick = ()=> toggleFavorite(selectedItem.id);
    qs('#detailCopy').onclick = ()=>{
      const txt = `[${selectedItem.name}]\n가격: ${fmt(selectedItem.price)}원\n비고: ${selectedItem.note||''}`;
      navigator.clipboard?.writeText(txt).then(()=>toast('상세 복사됨')).catch(()=>toast('복사 실패'));
    };
    return;
  }
}

function renderCart(){
  qs('#cartCount').textContent = cart.reduce((a,c)=>a+(c.qty||0),0);
  const list = qs('#cartList');
  list.innerHTML = '';
  if(cart.length===0){
    list.innerHTML = `<div class="muted" style="padding:10px 0">비어있습니다. 항목을 추가하세요.</div>`;
  } else {
    const table = document.createElement('table');
    table.className='table';
    table.innerHTML = `
      <thead><tr><th>항목</th><th>수량</th><th>금액</th><th></th></tr></thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    cart.forEach(item=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${escapeHtml(item.name)}</b></td>
        <td>
          <button class="smallBtn" data-act="dec">-</button>
          <span style="display:inline-block;min-width:26px;text-align:center">${item.qty}</span>
          <button class="smallBtn" data-act="inc">+</button>
        </td>
        <td>${fmt(item.price*item.qty)}원</td>
        <td><button class="smallBtn" data-act="del">삭제</button></td>
      `;
      tr.querySelector('[data-act="dec"]').onclick = ()=> setQty(item.id, item.qty-1);
      tr.querySelector('[data-act="inc"]').onclick = ()=> setQty(item.id, item.qty+1);
      tr.querySelector('[data-act="del"]').onclick = ()=> removeFromCart(item.id);
      tbody.appendChild(tr);
    });
    list.appendChild(table);
  }
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  qs('#cartTotal').textContent = fmt(total);
  qs('#calcCartSum').textContent = fmt(total);

  // cart drawer summary (linked with calculator)
  const adjEl = qs('#cartAdj');
  const payEl = qs('#cartPay');
  if(adjEl) adjEl.textContent = fmt(adjValue);
  if(payEl) payEl.textContent = fmt(total + adjValue);

  updateFinal();
}

/* =========================
   Cart actions
========================= */
function addToCart(id,name,price){
  const found = cart.find(x=>x.id===id);
  if(found) found.qty += 1;
  else cart.push({id,name,price,qty:1});
  logAction('장바구니 추가: '+name);
  toast('장바구니 추가');
  renderCart();
}
function setQty(id,qty){
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty = Math.max(0, qty|0);
  if(it.qty===0) cart = cart.filter(x=>x.id!==id);
  logAction('삭제');
  renderCart();
}
function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  renderCart();
}
function clearCart(){
  cart = [];
  logAction('장바구니 비우기');
  renderCart();
  toast('비움');
}

/* =========================
   Calculator
========================= */
function updateFinal(){
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  // keep adjValue synced with input
  const adj = Number((qs('#adjInput').value||'0').replace(/,/g,'').trim() || 0);
  if(Number.isFinite(adj)) adjValue = Math.trunc(adj);
  qs('#finalAmount').textContent = fmt(total + adjValue);
  const adjEl = qs('#cartAdj');
  const payEl = qs('#cartPay');
  if(adjEl) adjEl.textContent = fmt(adjValue);
  if(payEl) payEl.textContent = fmt(total + adjValue);
  renderDiscountLog();
}

function logDiscount(label, amount, base){
  logAction(label + ' ' + ((amount>=0)?'+':'') + fmt(amount) + '원');
  discountLog.unshift({ ts: Date.now(), label, amount: Math.trunc(amount||0), base: Math.trunc(base||0) });
  if(discountLog.length>12) discountLog = discountLog.slice(0,12);
}


function renderActionLog(){
  const box = qs('#actionLog');
  if(!box) return;
  if(!actionLog.length){
    box.innerHTML = `<div class="muted">로그 없음</div>`;
    return;
  }
  const rows = actionLog.slice(0,10).map(r=>{
    const dt = new Date(r.ts);
    const hh = String(dt.getHours()).padStart(2,'0');
    const mm = String(dt.getMinutes()).padStart(2,'0');
    return `<tr><td class="muted">${hh}:${mm}</td><td>${escapeHtml(r.label)}</td></tr>`;
  }).join('');
  box.innerHTML = `<table class="table" style="margin-top:6px"><thead><tr><th>시간</th><th>내용</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderDiscountLog(){
  const box = qs('#discountLog');
  if(!box) return;
  if(discountLog.length===0){
    box.innerHTML = `<div class="muted">기록 없음</div>`;
    return;
  }
  const rows = discountLog.slice(0,6).map(r=>{
    const dt = new Date(r.ts);
    const hh = String(dt.getHours()).padStart(2,'0');
    const mm = String(dt.getMinutes()).padStart(2,'0');
    const sign = r.amount>=0?'+':'';
    return `
      <tr>
        <td class="muted">${hh}:${mm}</td>
        <td><b>${escapeHtml(r.label)}</b></td>
        <td style="text-align:right">${sign}${fmt(r.amount)}원</td>
      </tr>
    `;
  }).join('');
  box.innerHTML = `
    <table class="table" style="margin-top:6px">
      <thead><tr><th>시간</th><th>항목</th><th style="text-align:right">금액</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* =========================
   Drawer / Modal
========================= */
function openCart(){
  qs('#drawerBackdrop').style.display = 'block';
  qs('#cartDrawer').style.display = 'flex';
  qs('#cartDrawer').setAttribute('aria-hidden','false');
}
function closeCart(){
  qs('#drawerBackdrop').style.display = 'none';
  qs('#cartDrawer').style.display = 'none';
  qs('#cartDrawer').setAttribute('aria-hidden','true');
}
function openCalc(){
  qs('#modalBackdrop').style.display = 'grid';
  qs('#adjAmount')?.focus();
  __lastAdjInput = (qs('#adjInput').value||'0').trim();
  updateFinal();
}
function closeCalc(){
  qs('#modalBackdrop').style.display = 'none';
}

/* =========================
   견적 복사
========================= */
function buildQuoteText(){
  const lines = [];
  lines.push('상담 견적');
  lines.push('----------------');
  cart.forEach(it=>{
    lines.push(`${it.name} x${it.qty} = ${fmt(it.price*it.qty)}원`);
  });
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  lines.push('----------------');
  lines.push(`합계: ${fmt(total)}원`);
  if(adjValue!==0) lines.push(`할인/추가: ${adjValue>=0?'+':''}${fmt(adjValue)}원`);
  lines.push(`결제 금액: ${fmt(total + adjValue)}원`);
  if(discountLog.length){
    lines.push('----------------');
    lines.push('할인 기록(최근)');
    discountLog.slice(0,3).forEach(r=>{
      const sign = r.amount>=0?'+':'';
      lines.push(`- ${r.label}: ${sign}${fmt(r.amount)}원`);
    });
  }
  // VAT notice: 이벤트 제외 규칙은 '가격표 섹션'에만 적용.
  lines.push(VAT_NOTICE);
  return lines.join('\n');
}

/* =========================
   이벤트 바인딩
========================= */
qsa('#nav button').forEach(b=> b.onclick = ()=> setView(b.dataset.view));

qs('#cartBtn').onclick = openCart;
qs('#closeCart').onclick = closeCart;
qs('#drawerBackdrop').onclick = closeCart;

qs('#calcBtn').onclick = openCalc;
qs('#closeCalc').onclick = closeCalc;
qs('#modalBackdrop').onclick = (e)=>{ if(e.target.id==='modalBackdrop') closeCalc(); };

qs('#clearCart').onclick = clearCart;
qs('#copyQuote').onclick = ()=>{
  const txt = buildQuoteText();
  navigator.clipboard?.writeText(txt).then(()=>toast('견적 복사됨')).catch(()=>toast('복사 실패'));
};


qs('#saveConsult').onclick = ()=>{
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  const snapshot = { ts: Date.now(), cart: JSON.parse(JSON.stringify(cart)), adjValue, total: total + adjValue, discountLog: JSON.parse(JSON.stringify(discountLog)) };
  recentConsults.unshift(snapshot);
  recentConsults = recentConsults.slice(0,30);
  saveLS('recentConsults', recentConsults);
  renderRecent();
  toast('상담 저장됨');
  logAction('상담 저장');
};

qs('#pdfQuote').onclick = ()=>{
  // fill print template then invoke print
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  const pay = total + adjValue;
  const dt = new Date();
  const meta = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
  qs('#printMeta').textContent = meta;
  const t = qs('#printTable');
  const rows = ['<tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">항목</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">수량</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">금액</th></tr>']
    .concat(cart.map(it=>`<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(it.name)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${it.qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmt(it.price*it.qty)}원</td></tr>`))
    .join('');
  t.innerHTML = rows;
  qs('#printSubtotal').textContent = fmt(total);
  qs('#printAdj').textContent = fmt(adjValue);
  qs('#printTotal').textContent = fmt(pay);
  logAction('PDF 출력');
  window.print();
};


qs('#adjInput').addEventListener('input', updateFinal);

/* 계산기 빠른 입력 */
function parseMoney(v){
  return Number(String(v||'').replace(/,/g,'').trim() || 0);
}
function setAdj(val){
  const n = Math.trunc(Number(val||0));
  qs('#adjInput').value = String(n);
  updateFinal();
}
function cartSum(){
  return cart.reduce((a,c)=>a+(c.price*c.qty),0);
}
qs('#adjPlusBtn').onclick = ()=>{
  const amt = Math.abs(parseMoney(qs('#adjAmount').value));
  if(!amt) return;
  logDiscount('금액 추가', amt, cartSum());
  setAdj(amt);
};
qs('#adjMinusBtn').onclick = ()=>{
  const amt = Math.abs(parseMoney(qs('#adjAmount').value));
  if(!amt) return;
  logDiscount('금액 할인', -amt, cartSum());
  setAdj(-amt);
};
qs('#disc10').onclick = ()=>{
  const total = cartSum();
  const v = -Math.round(total * 0.10);
  logDiscount('10% 할인', v, total);
  setAdj(v);
};
qs('#disc15').onclick = ()=>{
  const total = cartSum();
  const v = -Math.round(total * 0.15);
  logDiscount('15% 할인', v, total);
  setAdj(v);
};
qs('#disc20').onclick = ()=>{
  const total = cartSum();
  const v = -Math.round(total * 0.20);
  logDiscount('20% 할인', v, total);
  setAdj(v);
};

// manual input logging (enter / blur)
qs('#adjInput').addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    const now = (qs('#adjInput').value||'0').trim();
    if(now!==__lastAdjInput){
      logDiscount('직접 입력', parseMoney(now), cartSum());
      __lastAdjInput = now;
    }
    updateFinal();
  }
});
qs('#adjInput').addEventListener('blur', ()=>{
  const now = (qs('#adjInput').value||'0').trim();
  if(now!==__lastAdjInput){
    logDiscount('직접 입력', parseMoney(now), cartSum());
    __lastAdjInput = now;
  }
  updateFinal();
});

qs('#clearActionLog').onclick = ()=>{ actionLog = []; renderActionLog(); toast('로그 초기화'); };

qs('#clearDiscountLog').onclick = ()=>{
  discountLog = [];
  renderDiscountLog();
  toast('기록 초기화');
};

qs('#searchInput').addEventListener('input', ()=>{ renderLeft(); });

/* 단축키 */
document.addEventListener('keydown', (e)=>{
  if(e.key==='/'){
    e.preventDefault();
    qs('#searchInput').focus();
  }
  if(e.key==='k' || e.key==='K'){
    openCart();
  }
  if(e.key==='c' || e.key==='C'){
    openCalc();
  }
  if(e.key==='Escape'){
    closeCalc();
    closeCart();
  }
});

/* XSS minimal */
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, (m)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}

/* 초기 렌더 */
renderActionLog();
renderAll();
