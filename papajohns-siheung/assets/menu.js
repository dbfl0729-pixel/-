// ====================================================================
// menu.js: 피자 메뉴판 동적 기능 및 장바구니(Cart) 관리 스크립트
// ====================================================================

// -------------------- 0. 전역 설정 및 가격 데이터 --------------------

// 크러스트별 사이즈별 추가 금액 정의 (HTML input value와 키가 일치해야 함)
const CRUST_PRICE_ADDITIONS = {
    // 1. 기본 크러스트
    '오리지널': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    '씬': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    
    // 2. 일반적인 추가금 스케일
    '치즈롤': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    '골드링': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    
    // 3. 신규 규정 반영 (HTML value와 정확히 일치)
    '스파이시 치즈갈릭롤': { 'R': 4000, 'L': 4000, 'F': 4000, 'P': 4000 }, // 모든 사이즈 4,000원 추가
    '크루아상': { 'R': 6000, 'L': 6000, 'F': 6000, 'P': 6000 },              // 모든 사이즈 6,000원 추가
    '씬+골드링': { 'R': 0, 'L': 0, 'F': 5000, 'P': 0 }                       // F만 5,000원 추가
};

// 장바구니 데이터
let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

// 가격 포맷팅 헬퍼 함수
function formatPrice(price) {
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

// -------------------- 2. 피자 옵션 팝업 관련 함수 --------------------

function hidePizzaOptions() {
    document.getElementById('pizza-popup').style.display = 'none'; 
    document.body.style.overflow = ''; 
}

function showPizzaOptions(pizzaCard) {
    const pizzaName = pizzaCard.querySelector('.pizza-card-header h3').textContent.split(' - ')[0].trim();
    const pizzaId = pizzaCard.id.split('-')[1];
    
    // ⚠️ 에러 방지를 위해 속성이 없으면 빈 배열로 초기화
    const availableSizesJson = (pizzaCard.dataset.availableSizes || '[]').replace(/'/g, '"'); 
    const availableSizes = JSON.parse(availableSizesJson); 

    const popupElement = document.getElementById('pizza-popup');
    const sizeOptionGroup = popupElement.querySelector('#pizza-options > .option-group:first-of-type');
    const popupContent = popupElement.querySelector('.pizza-popup-content');
    
    document.getElementById('popup-pizza-name').textContent = pizzaName;
    popupContent.dataset.currentPizzaId = pizzaId;

    // ⭐️ 중요 수정: 옵션 그룹을 초기화하고 제목을 다시 넣어줍니다. ⭐️
    sizeOptionGroup.innerHTML = '<h3>사이즈 선택</h3>'; 
    
    const sizeMap = { 
        'R': '레귤러 (R)', 'L': '라지 (L)', 'F': '패밀리 (F)', 'P': '파티 (P)' 
    };
    
    if (availableSizes.length === 0) {
        // ⭐️ 옵션이 없을 때 명확한 안내 메시지를 추가합니다. ⭐️
        sizeOptionGroup.innerHTML += '<p style="color: var(--color-accent); margin-top: 10px; font-weight: bold;">⚠️ 선택 가능한 옵션이 없습니다. (카드 데이터 확인 필요)</p>';
    } else {
        availableSizes.forEach((sizeCode, index) => {
            const sizeText = sizeMap[sizeCode] || sizeCode;
            const label = document.createElement('label');
            
            label.innerHTML = `<input type="radio" id="size-${sizeCode}" name="pizza-size" value="${sizeCode}"> ${sizeText}`;
            
            if (index === 0) {
                label.querySelector('input').checked = true;
            }

            sizeOptionGroup.appendChild(label);
        });
    }

    // ✅ 수정 완료: 문법 오류 수정 및 'change'를 'click'으로 변경
    sizeOptionGroup.querySelectorAll('input[name="pizza-size"]').forEach(input => {
        input.addEventListener('click', updatePrice);
    });
    
    document.querySelectorAll('input[name="pizza-crust"]').forEach(input => {
        input.checked = (input.value === '오리지널');
    });

    popupElement.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
    updatePrice();
}

function attachPizzaListeners() {
    const pizzaButtons = document.querySelectorAll('.pizza-card .add-to-bill-btn');

    pizzaButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const pizzaCard = event.target.closest('.pizza-card');
            
            if (pizzaCard && !pizzaCard.querySelector('.crust-note-small')) {
                 showPizzaOptions(pizzaCard); 
            }
        });
    });

    document.getElementById('close-popup')?.addEventListener('click', hidePizzaOptions);
    document.getElementById('pizza-popup')?.addEventListener('click', (event) => {
        if (event.target.id === 'pizza-popup') {
            hidePizzaOptions();
        }
    });

    document.getElementById('add-pizza-to-cart')?.addEventListener('click', handleAddPizzaToCart);

    // ✅ 수정 완료: 문법 오류 수정 및 'change'를 'click'으로 변경
    document.querySelectorAll('input[name="pizza-crust"]').forEach(input => {
        input.addEventListener('click', updatePrice);
    });
}

// -------------------- 3. 가격 업데이트 및 장바구니 추가 로직 --------------------

function updatePrice() {
    const popupContent = document.querySelector('.pizza-popup-content');
    const pizzaId = popupContent?.dataset.currentPizzaId;
    
    if (!pizzaId) return;

    const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
    if (!pizzaCard) return;

const selectedSizeElement = document.querySelector('input[name="pizza-size"]:checked');
const selectedCrustElement = document.querySelector('input[name="pizza-crust"]:checked');

if (!selectedSizeElement || !selectedCrustElement) return; 

    const sizeCode = selectedSizeElement.value;
    let crustValue = selectedCrustElement.value;
    
    const pricesJson = pizzaCard.dataset.prices.replace(/'/g, '"');
const prices = JSON.parse(pricesJson);
const basePrice = prices[sizeCode] || 0;

    const crustAddPrice = CRUST_PRICE_ADDITIONS[crustValue]?.[sizeCode] || 0;
    
    const finalPrice = basePrice + crustAddPrice;
    
    const priceDisplay = document.getElementById('selected-pizza-price');
    if (priceDisplay) {
        priceDisplay.textContent = `총 금액: ${formatPrice(finalPrice)}원`;
    }
}

function handleAddPizzaToCart() {
    const pizzaName = document.getElementById('popup-pizza-name').textContent;
    const size = document.querySelector('input[name="pizza-size"]:checked')?.value;
    const crust = document.querySelector('input[name="pizza-crust"]:checked')?.value;

    if (!size || !crust) {
        alert('사이즈와 크러스트를 모두 선택해야 합니다.');
        return;
    }
    
    // ⭐️ 씬+골드링 사이즈 제한 유효성 검사
    if (crust === '씬+골드링' && size !== 'F') {
        alert('죄송합니다. 씬+골드링 크러스트는 패밀리 사이즈(F)로만 주문 가능합니다.');
        return; 
    }
    
    const popupContent = document.querySelector('.pizza-popup-content');
    const pizzaId = popupContent?.dataset.currentPizzaId;
    const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
    
    if (!pizzaCard) return;

    const pricesJson = pizzaCard.dataset.prices.replace(/'/g, '"');
    const prices = JSON.parse(pricesJson);
    const basePrice = prices[size] || 0;
    
    const crustAddPrice = CRUST_PRICE_ADDITIONS[crust]?.[size] || 0;
    const finalPrice = basePrice + crustAddPrice;

    const pizzaItem = {
        type: 'pizza',
        name: pizzaName,
        price: basePrice, 
        crustPrice: crustAddPrice,
        size: size,
        crust: crust,
        quantity: 1,
        totalPrice: finalPrice
    };

    addToCart(pizzaItem);
    hidePizzaOptions();
    alert(`🍕 ${pizzaName} (${size}, ${crust}) 1개를 장바구니에 담았습니다.`);
}

// -------------------- 4. DOMContentLoaded: 페이지 진입점 (필수) --------------------

document.addEventListener('DOMContentLoaded', () => {
    // 페이지가 로드되면 피자 메뉴의 이벤트 리스너를 연결합니다.
    if (document.querySelector('.pizza-card')) {
        attachPizzaListeners(); 
    }
    
    console.log("Papa John's Pizza Menu Initialized.");
});