// =================================================================
// 🍕 피자 메뉴 페이지 (menu.html) 로직 파일 - assets/menu.js
// =================================================================

// --- 1. 가격 데이터 정의 (모든 함수가 필요로 하는 데이터) ---
const PIZZA_PRICES = {
    'pizza_classic': { R: 25900, L: 30900 }, 
    'pizza_gourmet': { R: 29900, L: 35900 },
    'pizza_hawaiian': { R: 24000, L: 29000 },
    // ... 다른 피자 ID와 가격을 여기에 추가 ...
};

const CRUST_PRICES = {
    'original': 0,
    'gold': 3000,
    '치즈롤': 4000
};

// --- 2. 유틸리티 함수 (다른 함수들이 호출하므로 먼저 정의) ---
function formatPrice(amount) {
    return `₩${amount.toLocaleString('ko-KR')}`;
}


// --- 3. 🎯 메뉴 옵션 동적 생성 함수 (사이즈+가격 표시 담당) ---
function createSizeOptions(pizzaId) {
    const card = document.getElementById(pizzaId);
    if (!card) return;

    const prices = PIZZA_PRICES[pizzaId];
    if (!prices) return;

    const sizeSelect = card.querySelector('.size-select');
    if (!sizeSelect) return;

    sizeSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = '사이즈를 선택하세요';
    sizeSelect.appendChild(defaultOption);

    Object.keys(prices).forEach(sizeCode => {
        const option = document.createElement('option');
        const price = prices[sizeCode];
        
        option.value = sizeCode;
        option.textContent = `${sizeCode} (${formatPrice(price)})`; 
        
        sizeSelect.appendChild(option);
    });
}


// --- 4. 가격 계산 함수 (핵심 로직) ---
window.updatePrice = function(pizzaId) {
    const card = document.getElementById(pizzaId);
    if (!card) return;

    const sizeSelect = card.querySelector('.size-select');
    const crustSelect = card.querySelector('.crust-select');
    const quantityInput = card.querySelector('.quantity-input');
    const totalPriceElement = document.getElementById(`total-price-${pizzaId}`);
    
    // 기본 가격 (사이즈 기반)
    let basePrice = 0;
    const selectedSize = sizeSelect ? sizeSelect.value : null; 
    
    // 🎯 사이즈 미선택(0)이거나 값이 없으면 0원으로 처리
    if (selectedSize === '0' || !selectedSize) {
        basePrice = 0;
    } 
    else if (PIZZA_PRICES[pizzaId] && PIZZA_PRICES[pizzaId][selectedSize]) {
        basePrice = PIZZA_PRICES[pizzaId][selectedSize];
    } 
    // (단일 사이즈 메뉴를 위한 예외 로직은 현재 복잡성을 줄이기 위해 생략합니다. 
    // 위 두 조건문으로 대부분의 사이즈 선택 메뉴는 처리 가능합니다.)
    
    // 크러스트 가격
    const selectedCrust = crustSelect ? crustSelect.value : 'original';
    const crustPrice = CRUST_PRICES[selectedCrust] || 0;

    // 수량
    const quantity = parseInt(quantityInput.value) || 1;

    const finalPrice = (basePrice + crustPrice) * quantity;
    
    // 🎯 가격 표시 및 장바구니 버튼 상태 제어
    const addButton = card.querySelector('.add-to-bill-btn');
    
    if (finalPrice === 0 && selectedSize === '0') {
        totalPriceElement.textContent = '사이즈를 선택하세요';
        if (addButton) addButton.disabled = true; // 버튼 비활성화
    } else {
        totalPriceElement.textContent = formatPrice(finalPrice);
        card.setAttribute('data-price', finalPrice);
        if (addButton) addButton.disabled = false; // 버튼 활성화
    }
};


// --- 5. 장바구니 추가 함수 ---
window.addToCart = function(pizzaId) {
    const card = document.getElementById(pizzaId);
    const sizeSelect = card.querySelector('.size-select');
    
    if (sizeSelect && sizeSelect.value === '0') {
        alert('🍕 사이즈를 먼저 선택해주세요!');
        return;
    }

    const pizzaName = card.getAttribute('data-name');
    const finalPriceText = document.getElementById(`total-price-${pizzaId}`).textContent;
    
    alert(`${pizzaName} ${finalPriceText}을(를) 장바구니에 추가했습니다. 장바구니로 이동합니다.`);
    window.location.href = 'cart.html';
};


// --- 6. 초기화 (모든 카드에 기능 적용) ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pizza-card').forEach(card => {
        const pizzaId = card.id;
        
        // 1. 사이즈 옵션 동적 생성
        createSizeOptions(pizzaId); 
        
        // 2. 이벤트 리스너 재등록
        card.querySelectorAll('select, input[type="number"]').forEach(element => {
            element.addEventListener('change', () => updatePrice(pizzaId));
            element.addEventListener('input', () => updatePrice(pizzaId));
        });

        // 3. 초기 가격 설정
        updatePrice(pizzaId);

        // 4. '장바구니 담기' 버튼 리스너
        const addButton = card.querySelector('.add-to-bill-btn');
        if (addButton) {
             addButton.addEventListener('click', () => addToCart(pizzaId));
        }
    });
});