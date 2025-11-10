// ====================================================================
// menu.js: 피자 메뉴판 동적 기능 및 장바구니(Cart) 관리 스크립트
// (빈 <select> 문제 해결 및 인라인 옵션 기능 구현)
// ====================================================================

// -------------------- 0. 전역 설정 및 가격 데이터 --------------------

// 크러스트별 사이즈별 추가 금액 정의 (HTML option value와 키가 일치해야 함)
const CRUST_PRICE_ADDITIONS = {
    // 1. 기본 크러스트
    '오리지널': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    '씬': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    
    // 2. 일반적인 추가금 스케일
    '치즈롤': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    '골드링': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    
    // 3. 신규 규정 반영
    '스파이시 치즈갈릭롤': { 'R': 4000, 'L': 4000, 'F': 4000, 'P': 4000 },
    '크루아상': { 'R': 6000, 'L': 6000, 'F': 6000, 'P': 6000 },
    '씬+골드링': { 'R': 0, 'L': 0, 'F': 5000, 'P': 0 }
};

// 장바구니 데이터
let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

// 가격 포맷팅 헬퍼 함수
function formatPrice(price) {
    // 숫자가 아닌 경우 0으로 처리하여 오류 방지
    if (isNaN(price)) return '0';
    return price.toLocaleString('ko-KR');
}

// -------------------- 1. 장바구니 데이터 관리 함수 --------------------

function saveCart() {
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
}

function addToCart(item) {
    let existingItem = cart.find(i => 
        i.type === 'pizza' &&
        i.name === item.name &&
        i.size === item.size && 
        i.crust === item.crust
    );

    if (existingItem) {
        existingItem.quantity += 1; 
    } else {
        item.id = Date.now(); 
        cart.push(item);
    }

    saveCart();
}


// -------------------- 2. 인라인 옵션 기능 구현 --------------------

// 크러스트/사이즈 드롭다운 값이 변경될 때 총 금액을 업데이트
function updateInlinePrice(pizzaId) {
    const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
    if (!pizzaCard) return;
    
    const sizeSelect = pizzaCard.querySelector(`#size-${pizzaId}`);
    const crustSelect = pizzaCard.querySelector(`#crust-${pizzaId}`);
    const crustAddText = pizzaCard.querySelector(`#crust-add-text-${pizzaId}`);
    const totalPriceSpan = pizzaCard.querySelector(`#total-price-${pizzaId}`);
    
    const sizeCode = sizeSelect?.value;
    const crustValue = crustSelect?.value; 

    // 사이즈 선택이 없는 경우 (특수 피자)는 계산 불필요
    if (!sizeCode) return; 

    // 1. 기본 가격 파싱
    const pricesJson = (pizzaCard.dataset.prices || '{}').replace(/'/g, '"');
    const prices = JSON.parse(pricesJson);
    const basePrice = prices[sizeCode] || 0;
    
    // 2. 크러스트 추가 금액 계산을 위한 이름 매핑 (HTML option value -> CRUST_PRICE_ADDITIONS Key)
    let crustName = '';
    if (crustValue === 'cheeseroll') crustName = '치즈롤';
    else if (crustValue === 'goldring') crustName = '골드링';
    else if (crustValue === 'spicygarlic') crustName = '스파이시 치즈갈릭롤'; 
    else if (crustValue === 'croissant') crustName = '크루아상';
    else if (crustValue === 'original') crustName = '오리지널';
    else if (crustValue === 'thin') crustName = '씬';

    const crustAdditions = CRUST_PRICE_ADDITIONS[crustName] || {};
    let crustAddPrice = crustAdditions[sizeCode] || 0;
    
    // 크러스트 드롭다운이 없거나 선택이 불가능한 경우 (예: 스타라이트 바질)
    if (!crustSelect || !crustValue) {
        crustAddPrice = 0;
    }

    const finalPrice = basePrice + crustAddPrice;

    // 3. 크러스트 추가 금액 안내 업데이트
    if (crustAddText) {
         if (crustAddPrice > 0) {
            crustAddText.textContent = `(+ ${formatPrice(crustAddPrice)}원 추가)`;
        } else {
            crustAddText.textContent = '';
        }
    }

    // 4. 최종 가격 업데이트
    totalPriceSpan.textContent = formatPrice(finalPrice);
}

// 빈 사이즈 <select>를 동적으로 채우는 초기화 함수
function initializeInlineOptions() {
    const pizzaCards = document.querySelectorAll('.pizza-card');
    const sizeMap = { 'R': '레귤러 (R)', 'L': '라지 (L)', 'F': '패밀리 (F)', 'P': '파티 (P)' };

    pizzaCards.forEach(card => {
        const pizzaId = card.id.split('-')[1];
        const sizeSelect = card.querySelector(`#size-${pizzaId}`);
        const crustSelect = card.querySelector(`#crust-${pizzaId}`);

        // 1. 이미 옵션이 있거나 select가 없는 특수 피자는 초기 가격 설정 후 스킵
        if (!sizeSelect || sizeSelect.options.length > 0) {
             // 특수 피자의 초기 총 금액 '0'을 하드코딩된 가격으로 업데이트
             const totalPriceSpan = card.querySelector(`#total-price-${pizzaId}`);
             if (totalPriceSpan.textContent.replace(/,/g, '') === '0' || totalPriceSpan.textContent === '') {
                 const firstOption = sizeSelect?.options[0]?.textContent;
                 if (firstOption) {
                    const priceMatch = firstOption.match(/(\d{1,3}(,\d{3})*)원/);
                    if (priceMatch) {
                        totalPriceSpan.textContent = priceMatch[1];
                    }
                 }
             }
            return;
        }

        const availableSizesJson = (card.dataset.availableSizes || '[]').replace(/'/g, '"');
        const availableSizes = JSON.parse(availableSizesJson);
        const pricesJson = (card.dataset.prices || '{}').replace(/'/g, '"');
        const prices = JSON.parse(pricesJson);

        let hasDefaultSelected = false;
        availableSizes.forEach(sizeCode => {
            const price = prices[sizeCode] || 0;
            const sizeText = sizeMap[sizeCode] || sizeCode;
            const option = document.createElement('option');
            
            option.value = sizeCode; 
            option.textContent = `${sizeText} - ${formatPrice(price)}원`;
            
            sizeSelect.appendChild(option);

            if (!hasDefaultSelected) {
                sizeSelect.value = sizeCode;
                hasDefaultSelected = true;
            }
        });
        
        // 2. 가격 업데이트 및 이벤트 리스너 연결
        if (hasDefaultSelected) {
            updateInlinePrice(pizzaId);
        }
        
        // 3. 이벤트 리스너 연결
        sizeSelect.addEventListener('change', () => {
            updateInlinePrice(pizzaId);
        });
        
        crustSelect?.addEventListener('change', () => {
            updateInlinePrice(pizzaId);
        });
    });
}

// "계산서에 담기" 버튼 클릭 리스너
function attachBillListeners() {
    const pizzaButtons = document.querySelectorAll('.pizza-card .add-to-bill-btn');
    const sizeMap = { 'R': '레귤러', 'L': '라지', 'F': '패밀리', 'P': '파티' };
    
    pizzaButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const pizzaId = event.currentTarget.dataset.pizzaId;
            const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
            const pizzaName = pizzaCard.dataset.name;
            const sizeSelect = pizzaCard.querySelector(`#size-${pizzaId}`);
            const crustSelect = pizzaCard.querySelector(`#crust-${pizzaId}`);
            const totalPriceSpan = pizzaCard.querySelector(`#total-price-${pizzaId}`);
            
            let size = sizeSelect?.value;
            let crustValue = crustSelect?.value;
            let crustName = '';
            
            // 1. 특수 피자 처리 (옵션이 없거나 단일 옵션인 경우)
            if (!sizeSelect || sizeSelect.options.length === 0) {
                 // **사이즈 및 크러스트 정보를 하드코딩된 값 또는 data 속성으로 처리**
                 // 스타라이트 바질은 data-available-sizes에 있는 첫번째 사이즈를 선택
                 if (pizzaName === '스타라이트 바질') {
                     const availableSizesJson = (pizzaCard.dataset.availableSizes || '[]').replace(/'/g, '"');
                     size = JSON.parse(availableSizesJson)[0];
                     crustName = '특수 크러스트';
                 }
                 // 더블 치즈 디럭스, 그린잇 피자 (하드코딩된 단일 사이즈/크러스트)
                 else if (pizzaName === '더블 치즈 디럭스') { size = 'F'; crustName = '씬'; }
                 else if (pizzaName.includes('그린잇')) { size = 'L'; crustName = '오리지널/비건 전용'; } 
            }
            
            // 2. 일반 피자 유효성 검사 및 이름 매핑
            if (!size) { alert('사이즈를 선택해야 합니다.'); return; }
            
            // 크러스트가 있는 경우에만 유효성 검사
            if (crustSelect && !crustValue) { alert('크러스트를 선택해야 합니다.'); return; }
            
            if (crustValue === 'cheeseroll') crustName = '치즈롤';
            else if (crustValue === 'goldring') crustName = '골드링';
            else if (crustValue === 'spicygarlic') crustName = '스파이시 치즈갈릭롤'; 
            else if (crustValue === 'croissant') crustName = '크루아상';
            else if (crustValue === 'original') crustName = '오리지널';
            else if (crustValue === 'thin') crustName = '씬';

            // 3. 가격 최종 확정
            const finalPriceText = totalPriceSpan.textContent.replace(/,/g, '');
            const finalPrice = parseInt(finalPriceText, 10);
            
            const pricesJson = (pizzaCard.dataset.prices || '{}').replace(/'/g, '"');
            const prices = JSON.parse(pricesJson);
            const basePrice = prices[size] || 0;
            const crustAddPrice = finalPrice - basePrice;

            // 4. 장바구니에 담기
            const pizzaItem = { type: 'pizza', name: pizzaName, price: basePrice, crustPrice: crustAddPrice, size: size, crust: crustName, quantity: 1, totalPrice: finalPrice };
            addToCart(pizzaItem);
            alert(`🍕 ${pizzaName} (${sizeMap[size] || size}, ${crustName || '기본'}) 1개를 장바구니에 담았습니다.`);
        });
    });
}


// 페이지 로드 시 실행: 빈 <select>를 채우고 이벤트 리스너 연결
document.addEventListener('DOMContentLoaded', () => {
    initializeInlineOptions(); 
    attachBillListeners();
});