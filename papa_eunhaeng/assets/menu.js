
// ====================================================================
// menu.js (업데이트): 기존 기능 유지 + 1+1 플래그 전파 + 크러스트/사이즈 가격 산출 정리
// ====================================================================

// 크러스트별 추가요금 표 (HTML 라벨과 동일 이름 사용)
const CRUST_PRICE_ADDITIONS = {
  '오리지널': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
  '씬 (THIN)': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
  '씬': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 }, // 일부 페이지 호환
  '치즈롤 (+4,000)': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
  '골드링 (+4,000)': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
  '스파이시 갈릭 치즈롤 (+4,000)': { 'R': 4000, 'L': 4000, 'F': 4000, 'P': 4000 },
  '크루아상 (+6,000)': { 'R': 6000, 'L': 6000, 'F': 6000, 'P': 6000 }
};

function formatPrice(price){ return (isNaN(price)?0:price).toLocaleString('ko-KR'); }

// ---- 장바구니 저장소 ----
let cart = JSON.parse(localStorage.getItem('papaJohnsCart') || '[]');
function saveCart(){ localStorage.setItem('papaJohnsCart', JSON.stringify(cart)); }

// ---- 공통: 카드에서 데이터 읽기 ----
function parseCard(pizzaCard){
  const name = pizzaCard?.dataset?.name || pizzaCard?.querySelector('.pizza-card-header h3')?.childNodes?.[0]?.textContent?.trim() || '피자';
  const prices = JSON.parse((pizzaCard?.dataset?.prices || '{}').replace(/'/g,'"'));
  const sizes = JSON.parse((pizzaCard?.dataset?.availableSizes || '[]').replace(/'/g,'"'));
  const badgeText = pizzaCard?.querySelector('.badge')?.textContent || '';
  const eligibleOnePlusOne = /1\+1/.test(badgeText) || pizzaCard?.dataset?.oneplusone === 'true';
  return { name, prices, sizes, eligibleOnePlusOne };
}

// ---- 카드 내부 즉시 계산 영역(선택 박스 있는 카드용) ----
function attachInlineCalculators(){
  document.querySelectorAll('.pizza-card').forEach(card=>{
    const id = card.id?.split('-')[1];
    const totalEl = document.getElementById(`total-price-${id}`);
    const sizeSel = document.getElementById(`size-${id}`);
    const crustSel = document.getElementById(`crust-${id}`);
    const addBtn = card.querySelector('.add-to-bill-btn');
    const crustAddText = document.getElementById(`crust-add-text-${id}`);

    // 사이즈 옵션 채우기
    try {
      const sizes = JSON.parse((card.dataset.availableSizes || '[]').replace(/'/g,'"'));
      const prices = JSON.parse((card.dataset.prices || '{}').replace(/'/g,'"'));
      if(sizeSel && sizes.length){
        sizeSel.innerHTML = sizes.map((s,idx)=>{
          return `<option value="${s}" ${idx===0?'selected':''}>${s}</option>`;
        }).join('');
      }
      function recalc(){
        const s = sizeSel ? sizeSel.value : sizes[0];
        const base = prices[s] || 0;
        let add = 0;
        if(crustSel){
          const h = CRUST_PRICE_ADDITIONS[crustSel.options[crustSel.selectedIndex].text] || CRUST_PRICE_ADDITIONS[crustSel.value] || {};
          add = h[s] || 0;
          if(crustAddText) crustAddText.textContent = add>0 ? `(+ ${formatPrice(add)}원 추가)` : '';
        }
        if(totalEl) totalEl.textContent = formatPrice(base + add);
        return base + add;
      }
      sizeSel?.addEventListener('change', recalc);
      crustSel?.addEventListener('change', recalc);
      recalc();

      // 담기
      addBtn?.addEventListener('click', ()=>{
        const meta = parseCard(card);
        const chosenSize = sizeSel ? sizeSel.value : (meta.sizes[0]||'L');
        const chosenCrustLabel = crustSel ? crustSel.options[crustSel.selectedIndex].text : '';
        const crustAdd = (CRUST_PRICE_ADDITIONS[chosenCrustLabel] || {})[chosenSize] || 0;
        const unit = (meta.prices[chosenSize]||0) + crustAdd;
        const item = {
          type:'pizza',
          name: meta.name,
          size: chosenSize,
          crust: chosenCrustLabel.replace(/ \(.*\)$/,''),
          unitPrice: unit,
          quantity: 1,
          eligibleOnePlusOne: !!meta.eligibleOnePlusOne
        };
        // 같은 옵션 합치기
        const same = cart.find(i=> i.type==='pizza' && i.name===item.name && i.size===item.size && i.crust===item.crust);
        if(same) same.quantity += 1; else cart.push(item);
        saveCart();
        // 다른 탭 계산서 실시간 반영
        try{ window.dispatchEvent(new StorageEvent('storage', {key:'papaJohnsCart'})); }catch(e){}
        alert('계산서에 담았습니다.');
      });
    } catch(e){ /* 무시 */ }
  });
}

// ---- 사이드·음료 담기 버튼(다른 페이지 구조 호환) ----
function attachGenericAddButtons(){
  document.querySelectorAll('.menu-item,.menu-card').forEach(el=>{
    const btn = el.querySelector('.add-to-cart-btn, .add-to-bill-btn');
    const title = el.querySelector('h3,h4')?.textContent?.trim();
    const priceText = el.querySelector('.price, .price-tag span')?.textContent || el.dataset.menuPrice;
    if(btn && title && priceText){
      const unit = parseInt(String(priceText).replace(/[^0-9]/g,''),10) || 0;
      btn.addEventListener('click', ()=>{
        const item = { type:'side', name:title, unitPrice:unit, quantity:1 };
        const same = cart.find(i=> i.type==='side' && i.name===item.name && i.unitPrice===unit);
        if(same) same.quantity += 1; else cart.push(item);
        saveCart();
        try{ window.dispatchEvent(new StorageEvent('storage', {key:'papaJohnsCart'})); }catch(e){}
        alert('계산서에 담았습니다.');
      });
    }
  });
}

// ---- 초기화 ----
document.addEventListener('DOMContentLoaded', ()=>{
  attachInlineCalculators();
  attachGenericAddButtons();
});
