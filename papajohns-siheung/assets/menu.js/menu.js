// =================================================================
// 🍕 피자 메뉴 페이지 (menu.html) 로직 파일 - assets/menu.js
// =================================================================

// --- 1. 가격 데이터 정의 (모든 함수가 필요로 하는 데이터) ---
const PIZZA_PRICES = {
    // R: 레귤러(25cm), L: 라지(31cm), F: 패밀리(36cm), P: 파티(41cm)
    'barbeque_shortrib_crunch': { R: 0, L: 34500, F: 41900, P: 0 },
    'mellow_corn_cream': { R: 0, L: 27500, F: 33900, P: 41500 },
    'starlight_basil': { R: 0, L: 33500, F: 39900, P: 48500 },
    'double_hot_spicy_mexican': { R: 0, L: 33500, F: 39900, P: 0 },
    'super_papas': { R: 19900, L: 28500, F: 33900, P: 42500 },
    'johns_favorite': { R: 0, L: 29500, F: 34900, P: 45500 },
    'all_meat': { R: 19900, L: 29500, F: 34900, P: 45500 },
    'spicy_chicken_ranch': { R: 19900, L: 29500, F: 34900, P: 43500 },
    'irish_potato': { R: 18900, L: 27500, F: 32900, P: 40500 },
    'chicken_barbeque': { R: 18900, L: 27500, F: 32900, P: 40500 },
    'crispy_cheese_pepperoni': { R: 0, L: 0, F: 31900, P: 0 },
    'crispy_cheese_triple': { R: 0, L: 0, F: 33900, P: 0 },
    'ham_mushroom_six_cheese': { R: 0, L: 28500, F: 33900, P: 42500 },
    'wisconsin_cheese_potato': { R: 0, L: 29500, F: 35900, P: 45500 },
    'double_cheeseburger': { R: 0, L: 29500, F: 34900, P: 43500 },
    'premium_bulgogi': { R: 0, L: 29500, F: 34900, P: 43500 },
    'six_cheese': { R: 0, L: 26500, F: 31900, P: 39500 },
    'spicy_italian': { R: 0, L: 27500, F: 33900, P: 40500 },
    'shrimp_alfredo': { R: 0, L: 0, F: 34900, P: 0 },
    'margherita': { R: 16900, L: 23500, F: 28900, P: 36500 },
    'pepperoni': { R: 17900, L: 25500, F: 30900, P: 38500 },
    'hawaiian': { R: 17900, L: 26500, F: 32900, P: 39500 },
    'garden_special': { R: 17900, L: 26500, F: 31900, P: 39500 },
    'green_it_margherita': { R: 0, L: 26500, F: 0, P: 0 },
    'green_it_garden_special': { R: 0, L: 29500, F: 0, P: 0 }
};

// **새로 추가된 피자 이름 매핑 객체**
const PIZZA_NAME_MAP = {
    // PIZZA_PRICES의 키와 일치시킴
    'barbeque_shortrib_crunch': '바베큐 숏립 크런치',
    'mellow_corn_cream': '멜로우 콘크림',
    'starlight_basil': '스타라이트 바질',
    'double_hot_spicy_mexican': '더블 핫 앤 스파이시 멕시칸',
    'super_papas': '수퍼 파파스',
    'johns_favorite': '존스 페이버릿',
    'all_meat': '올미트',
    'spicy_chicken_ranch': '스파이시 치킨랜치',
    'irish_potato': '아이리쉬 포테이토',
    'chicken_barbeque': '치킨 바베큐',
    'crispy_cheese_pepperoni': '크리스피 치즈 페퍼로니 피자',
    'crispy_cheese_triple': '크리스피 치즈 트리플 피자',
    'ham_mushroom_six_cheese': '햄 머쉬룸 식스 치즈',
    'wisconsin_cheese_potato': '위스콘신 치즈 포테이토',
    'double_cheeseburger': '더블 치즈버거',
    'premium_bulgogi': '프리미엄 직화불고기',
    'six_cheese': '식스 치즈',
    'spicy_italian': '스파이시 이탈리안',
    'shrimp_alfredo': '슈림프 알프레도',
    'margherita': '마가리타',
    'pepperoni': '페퍼로니',
    'hawaiian': '하와이안',
    'garden_special': '가든 스페셜',
    'green_it_margherita': '그린잇 식물성 마가리타',
    'green_it_garden_special': '그린잇 식물성 가든스페셜'
};

// **수정**: 크러스트 이름은 한글로 매핑하여 저장
const CRUST_NAME_MAP = {
    'original': '오리지널',
    'thin': '씬',
    'cheeseroll': '치즈롤',
    'goldring': '골드링',
    'spicygarlic': '스파이시 갈릭 치즈롤',
    'croissant': '크루아상'
};

// **수정**: 크러스트 가격은 ID(영문)를 키로 사용
const CRUST_PRICES = {
    'original': { R: 0, L: 0, F: 0, P: 0 },
    'thin': { R: 0, L: 0, F: 0, P: 0 }, 
    'cheeseroll': { R: 0, L: 4000, F: 5000, P: 6000 },
    'goldring': { R: 0, L: 4000, F: 5000, P: 6000 },
    'spicygarlic': { R: 0, L: 4000, F: 5000, P: 6000 },
    'croissant': { R: 0, L: 6000, F: 6000, P: 6000 }
};

// --- 2. 유틸리티 함수 ---
function formatPrice(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '₩0';
    return `₩${amount.toLocaleString('ko-KR')}`;
}

// --- 3. 메뉴 옵션 동적 생성 함수 ---
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
        const price = prices[sizeCode];
        if (price > 0) {
             const option = document.createElement('option');
             option.value = sizeCode;
             option.textContent = `${sizeCode} (${formatPrice(price)})`; 
             sizeSelect.appendChild(option);
        }
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
    
    const selectedSize = sizeSelect ? sizeSelect.value : null; 
    const selectedCrustId = crustSelect ? crustSelect.value : 'original';
    const quantity = parseInt(quantityInput.value) || 1;

    let basePrice = 0;
    let crustAddPrice = 0;

    // 1. 기본 가격 계산
    if (selectedSize === '0' || !selectedSize || !PIZZA_PRICES[pizzaId] || !PIZZA_PRICES[pizzaId][selectedSize]) {
        basePrice = 0;
    } else {
        basePrice = PIZZA_PRICES[pizzaId][selectedSize];
    }
    
    // 2. 크러스트 추가 가격 계산 (사이즈 기반)
    if (selectedSize !== '0' && selectedSize && CRUST_PRICES[selectedCrustId] && CRUST_PRICES[selectedCrustId][selectedSize]) {
        crustAddPrice = CRUST_PRICES[selectedCrustId][selectedSize];
    }

    const finalPrice = (basePrice + crustAddPrice) * quantity;
    
    // 3. 가격 표시 및 장바구니 버튼 상태 제어
    const addButton = card.querySelector('.add-to-bill-btn');
    
    if (finalPrice === 0 || selectedSize === '0') {
        totalPriceElement.textContent = '사이즈를 선택하세요';
        if (addButton) addButton.disabled = true;
    } else {
        totalPriceElement.textContent = formatPrice(finalPrice);
        if (addButton) addButton.disabled = false;
    }
};

// --- 5. 장바구니 추가 함수 (로컬 스토리지 저장 로직 통합) ---
window.addToCart = function(pizzaId) {
    const card = document.getElementById(pizzaId);
    const sizeSelect = card.querySelector('.size-select');
    const crustSelect = card.querySelector('.crust-select');
    const quantityInput = card.querySelector('.quantity-input');
    
    const selectedSize = sizeSelect ? sizeSelect.value : null;
    const selectedCrustId = crustSelect ? crustSelect.value : 'original';
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (selectedSize === '0' || !selectedSize) {
        alert('🍕 사이즈를 먼저 선택해주세요!');
        return;
    }
    
    // 최종 가격 다시 계산 (안전성 확보)
    const basePrice = PIZZA_PRICES[pizzaId][selectedSize];
    const crustAddPrice = CRUST_PRICES[selectedCrustId][selectedSize];
    const itemPricePerUnit = basePrice + crustAddPrice; // 단가
    
    // **수정**: PIZZA_NAME_MAP에서 이름을 가져옵니다.
    const pizzaName = PIZZA_NAME_MAP[pizzaId] || pizzaId; 
    
    const item = {
        id: `${pizzaId}-${selectedSize}-${selectedCrustId}`, 
        pizzaId: pizzaId,
        name: pizzaName, // 👈 여기서 수정된 이름을 사용
        size: selectedSize,
        crustId: selectedCrustId,
        crustName: CRUST_NAME_MAP[selectedCrustId],
        price: itemPricePerUnit, // 단가
        quantity: quantity,
        total: itemPricePerUnit * quantity
    };

    // 1. 로컬 스토리지에서 현재 장바구니 데이터 가져오기
    let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

    // 2. 장바구니에 동일한 옵션의 상품이 이미 있는지 확인 (수량 업데이트)
    const existingItemIndex = cart.findIndex(
        i => i.pizzaId === item.pizzaId && i.size === item.size && i.crustId === item.crustId
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
        cart[existingItemIndex].total = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
    } else {
        cart.push(item);
    }

    // 3. 로컬 스토리지에 업데이트된 장바구니 저장
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
    
    // 4. 사용자에게 알림
    alert(`[${item.name} (${item.size}, ${item.crustName})] ${quantity}개를 장바구니에 추가했습니다.`);
    
    // 장바구니 페이지로 이동
    window.location.href = 'cart.html'; 
};


// --- 6. 초기화 (모든 카드에 기능 적용) ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pizza-card').forEach(card => {
        const pizzaId = card.id;
        
        // 1. 사이즈 옵션 동적 생성
        createSizeOptions(pizzaId); 
        
        // 2. 이벤트 리스너 재등록
        card.querySelectorAll('.size-select, .crust-select, .quantity-input').forEach(element => {
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