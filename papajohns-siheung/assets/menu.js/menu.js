// =================================================================
// 🍕 피자 메뉴 페이지 (menu.html) 로직 파일 - assets/menu.js
// =================================================================

// --- 1. 가격 데이터 정의 (모든 함수가 필요로 하는 데이터) ---
const PIZZA_PRICES = {
    // 1. 프리미엄 (Premium)
    'barbeque_shortrib_crunch': { R: 0, L: 34500, F: 41900, P: 0 }, // F는 36cm
    'mellow_corn_cream': { R: 0, L: 27500, F: 33900, P: 41500 },
    'starlight_basil': { R: 0, L: 33500, F: 39900, P: 48500 }, // 크러스트 선택 없음
    'double_hot_spicy_mexican': { R: 0, L: 33500, F: 39900, P: 0 }, // P 사이즈 가격 없음

    // 2. 베스트 (BEST) - 1+1 행사 메뉴 포함
    'super_papas': { R: 19900, L: 28500, F: 33900, P: 42500 }, // 1+1 행사
    'johns_favorite': { R: 0, L: 29500, F: 34900, P: 45500 }, // R 사이즈 가격 없음, 1+1 행사
    'all_meat': { R: 19900, L: 29500, F: 34900, P: 45500 },
    'spicy_chicken_ranch': { R: 19900, L: 29500, F: 34900, P: 43500 }, // 1+1 행사
    'irish_potato': { R: 18900, L: 27500, F: 32900, P: 40500 }, // 1+1 행사
    'chicken_barbeque': { R: 18900, L: 27500, F: 32900, P: 40500 }, // 1+1 행사
    
    // 3. 스페셜티 & 씬 (SPECIALTY&THIN)
    'crispy_cheese_pepperoni': { R: 0, L: 0, F: 31900, P: 0 }, // TH 전용 (F 사이즈만)
    'crispy_cheese_triple': { R: 0, L: 0, F: 33900, P: 0 }, // TH 전용 (F 사이즈만)
    'ham_mushroom_six_cheese': { R: 0, L: 28500, F: 33900, P: 42500 }, // R 사이즈 가격 없음
    'wisconsin_cheese_potato': { R: 0, L: 29500, F: 35900, P: 45500 }, // R 사이즈 가격 없음
    'double_cheeseburger': { R: 0, L: 29500, F: 34900, P: 43500 }, // R 사이즈 가격 없음, 1+1 행사
    'premium_bulgogi': { R: 0, L: 29500, F: 34900, P: 43500 }, // R 사이즈 가격 없음, 1+1 행사
    'six_cheese': { R: 0, L: 26500, F: 31900, P: 39500 }, // R 사이즈 가격 없음
    'spicy_italian': { R: 0, L: 27500, F: 33900, P: 40500 }, // R 사이즈 가격 없음
    'shrimp_alfredo': { R: 0, L: 0, F: 34900, P: 0 }, // TH 전용 (F 사이즈만)

    // 4. 클래식 (CLASSIC)
    'margherita': { R: 16900, L: 23500, F: 28900, P: 36500 },
    'pepperoni': { R: 17900, L: 25500, F: 30900, P: 38500 },
    'hawaiian': { R: 17900, L: 26500, F: 32900, P: 39500 },
    'garden_special': { R: 17900, L: 26500, F: 31900, P: 39500 },

    // 5. 그린잇 (VEGAN) - R(31cm)을 L로 가정
    'green_it_margherita': { R: 0, L: 26500, F: 0, P: 0 }, // 크러스트 변경 불가
    'green_it_garden_special': { R: 0, L: 29500, F: 0, P: 0 } // 크러스트 변경 불가
};

const CRUST_PRICES = {
    // 0원인 크러스트
    'original': { R: 0, L: 0, F: 0, P: 0 },
    // 씬은 F 사이즈만 가능하며 무료 변경이므로 0원
    '씬': { R: 0, L: 0, F: 0, P: 0 }, 
    
    // 치즈롤, 골드링, 스파이시 갈릭 치즈롤
    '치즈롤': { R: 0, L: 4000, F: 5000, P: 6000 },
    '골드링': { R: 0, L: 4000, F: 5000, P: 6000 },
    '스파이시갈릭치즈롤': { R: 0, L: 4000, F: 5000, P: 6000 },
    
    // 크루아상 크러스트 (모든 사이즈 6,000원 추가, R 불가)
    '크루아상': { R: 0, L: 6000, F: 6000, P: 6000 }
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
    window.location.href = 'cart.html'; // 
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