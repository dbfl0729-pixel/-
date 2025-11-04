// 피자 가격 데이터 (예시, 실제 데이터로 대체하세요)
const PIZZA_PRICES = {
    'pizza_classic': { R: 25900, L: 30900 },
    'pizza_gourmet': { R: 29900, L: 35900 },
    // ... 다른 피자 ID와 가격을 여기에 추가 ...// 
    // --- 🎯 메뉴 옵션 동적 생성 함수 ---
function createSizeOptions(pizzaId) {
    const card = document.getElementById(pizzaId);
    if (!card) return;

    const prices = PIZZA_PRICES[pizzaId];
    if (!prices) return; // 가격 정보가 없으면 종료

    const sizeSelect = card.querySelector('.size-select');
    if (!sizeSelect) return;

    // 기존 옵션 제거
    sizeSelect.innerHTML = '';

    // "사이즈를 선택하세요" 옵션 추가 (기본값)
    const defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = '사이즈를 선택하세요';
    sizeSelect.appendChild(defaultOption);

    // 실제 사이즈 옵션 추가
    Object.keys(prices).forEach(sizeCode => {
        const option = document.createElement('option');
        const price = prices[sizeCode];
        
        option.value = sizeCode;
        // 🎯 사이즈 + 가격 텍스트 생성
        option.textContent = `${sizeCode} (${formatPrice(price)})`; 
        option.setAttribute('data-price', price); // 나중에 필요할 수도 있는 가격 정보 저장

        sizeSelect.appendChild(option);
    });
}

const CRUST_PRICES = {
    'original': 0,
    'gold': 3000,
    '치즈롤': 4000
};

// --- 유틸리티 함수 (menu.js에 필요) ---
function formatPrice(amount) {
    return `₩${amount.toLocaleString('ko-KR')}`;
}

// --- 가격 계산 함수 ---
window.updatePrice = function(pizzaId) {
    const card = document.getElementById(pizzaId);
    if (!card) return;

    const sizeSelect = card.querySelector('.size-select');
    const crustSelect = card.querySelector('.crust-select');
    const quantityInput = card.querySelector('.quantity-input');
    const totalPriceElement = document.getElementById(`total-price-${pizzaId}`);
    
    // 기본 가격 (사이즈 기반)
    let basePrice = 0;
    const selectedSize = sizeSelect ? sizeSelect.value : 'L'; // 사이즈 선택이 없으면 L로 가정
    if (PIZZA_PRICES[pizzaId] && PIZZA_PRICES[pizzaId][selectedSize]) {
        basePrice = PIZZA_PRICES[pizzaId][selectedSize];
    } else if (sizeSelect && sizeSelect.value !== '0' && PIZZA_PRICES[pizzaId]) {
        // 단일 사이즈 메뉴의 경우 (첫 번째 옵션 가격)
        const firstSize = Object.keys(PIZZA_PRICES[pizzaId])[0];
        basePrice = PIZZA_PRICES[pizzaId][firstSize];
    }
    
    // 크러스트 가격
    const selectedCrust = crustSelect ? crustSelect.value : 'original';
    const crustPrice = CRUST_PRICES[selectedCrust] || 0;

    // 수량
    const quantity = parseInt(quantityInput.value) || 1;

    const finalPrice = (basePrice + crustPrice) * quantity;
    
    totalPriceElement.textContent = formatPrice(finalPrice);
    card.setAttribute('data-price', finalPrice);
};


// --- 장바구니 추가 함수 ---
window.addToCart = function(pizzaId) {
    const card = document.getElementById(pizzaId);
    // ... (여기에 장바구니에 항목을 실제로 추가하는 로직이 들어가야 합니다.)
    // 현재는 alert만 뜨고 있으므로, 실제 LocalStorage에 저장하는 로직을 추가해야 합니다.
    
    // 이전에 menu.htm에 있던 alert 로직은 임시로 유지
    const sizeSelect = card.querySelector('.size-select');
    const crustSelect = card.querySelector('.crust-select');
    const sizeOption = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex] : null;
    
    if (sizeOption && sizeOption.value === '0') {
        alert('🍕 사이즈를 먼저 선택해주세요!');
        return;
    }

    const pizzaName = card.getAttribute('data-name');
    const finalPrice = document.getElementById(`total-price-${pizzaId}`).textContent.replace(/₩|,/g, '');
    
    // LocalStorage에 저장하는 로직이 필요 (cart.js와 연결됨)
    // 이 로직은 `cart.js` 파일의 `saveCart` 함수와 통신해야 합니다.
    
    // alert(`🧾 계산서에 추가됨: ${pizzaName} - ${formatPrice(parseInt(finalPrice))}원`);
    // alert 대신 실제 LocalStorage 저장 로직이 들어가야 최종적으로 작동합니다.
    
    // 임시: alert 후 cart.html로 이동하여 사용자에게 확인 요청
    alert(`${pizzaName} ${formatPrice(parseInt(finalPrice))}을(를) 장바구니에 추가했습니다. 장바구니로 이동합니다.`);
    window.location.href = 'cart.html';
};


// --- 초기화 ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pizza-card').forEach(card => {
        const pizzaId = card.id;
        
        // 🎯 [수정된 부분] 사이즈 옵션 동적 생성 함수 호출
        createSizeOptions(pizzaId); 
        
        // 이벤트 리스너 재등록 (기존 로직)
        card.querySelectorAll('select, input[type="number"]').forEach(element => {
            element.addEventListener('change', () => updatePrice(pizzaId));
            element.addEventListener('input', () => updatePrice(pizzaId));
        });

        // 🎯 1. 초기 가격 설정
        updatePrice(pizzaId);

        // 🎯 2. '장바구니 담기' 버튼 리스너 (기존 로직 대체)
        const addButton = card.querySelector('.add-to-bill-btn');
        if (addButton) {
             addButton.addEventListener('click', () => addToCart(pizzaId));
        }
    });
});