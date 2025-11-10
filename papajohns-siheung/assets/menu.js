// ====================================================================
// menu.js: 피자 메뉴판 동적 기능 및 장바구니(Cart) 관리 스크립트
// ====================================================================

// -------------------- 0. 전역 설정 및 가격 데이터 --------------------

// 크러스트별 사이즈별 추가 금액 정의 (HTML input value와 키가 일치해야 함)
const CRUST_PRICE_ADDITIONS = {
    // HTML input[name="pizza-crust"] value와 일치하는 키 사용
    '오리지널': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    '씬': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    
    // 일반적인 추가금 스케일
    '치즈롤': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    '골드링': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    // 필요하다면 다른 크러스트 옵션도 추가
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

// 아이템을 장바구니에 추가 (피자 전용 로직)
function addToCart(item) {
    // 동일한 피자 옵션이 있는지 확인
    let existingItem = cart.find(i => 
        i.type === 'pizza' &&
        i.name === item.name &&
        i.size === item.size && 
        i.crust === item.crust
    );

    if (existingItem) {
        existingItem.quantity += 1; // 수량만 증가
    } else {
        item.id = Date.now(); // 고유 ID 부여
        cart.push(item);
    }

    saveCart();
    // 장바구니 화면 업데이트 로직이 필요한 경우 여기에 추가 (예: renderCart())
}

// -------------------- 2. 피자 옵션 팝업 관련 함수 --------------------

// 팝업 닫기 함수
function hidePizzaOptions() {
    document.getElementById('pizza-popup').style.display = 'none'; // 팝업 숨기기
    document.body.style.overflow = ''; // 뒷 배경 스크롤 허용
}

/**
 * 선택된 피자 카드의 정보를 바탕으로 팝업 내 사이즈 옵션을 동적으로 생성합니다.
 * @param {HTMLElement} pizzaCard 현재 클릭된 피자 카드 요소
 */
function showPizzaOptions(pizzaCard) {
    // 1. 피자 데이터 가져오기
    const pizzaName = pizzaCard.querySelector('.pizza-card-header h3').textContent.split(' - ')[0].trim();
    const pizzaId = pizzaCard.id.split('-')[1];
    
    // data-available-sizes (예: '["L","F"]')를 읽어와 JSON 파싱
    const availableSizesJson = pizzaCard.dataset.availableSizes.replace(/'/g, '"');
    const availableSizes = JSON.parse(availableSizesJson); 

    // 2. 팝업 요소 참조 및 데이터 설정
    const popupElement = document.getElementById('pizza-popup');
    // 팝업 내 '사이즈 선택' 옵션 그룹
    const sizeOptionGroup = popupElement.querySelector('#pizza-options > .option-group:first-of-type'); 
    const popupContent = popupElement.querySelector('.pizza-popup-content');
    
    document.getElementById('popup-pizza-name').textContent = pizzaName;
    popupContent.dataset.currentPizzaId = pizzaId; // 현재 피자 ID를 팝업에 저장 (가격 계산용)

    // 3. 사이즈 옵션 동적 생성 (⭐️ 사이즈 옵션 문제 해결 핵심 로직)
    sizeOptionGroup.innerHTML = ''; // 기존 옵션 모두 제거 (필수)
    
    // 사이즈 코드와 한글 이름 매핑
    const sizeMap = { 
        'R': '레귤러 (R)', 
        'L': '라지 (L)', 
        'F': '패밀리 (F)',
        'P': '파티 (P)' 
    };

    availableSizes.forEach((sizeCode, index) => {
        const sizeText = sizeMap[sizeCode] || sizeCode;
        const label = document.createElement('label');
        
        // 라디오 버튼 HTML 생성
        label.innerHTML = `<input type="radio" id="size-${sizeCode}" name="pizza-size" value="${sizeCode}"> ${sizeText}`;
        
        // 첫 번째 사이즈를 기본 선택 (checked)으로 설정
        if (index === 0) {
            label.querySelector('input').checked = true;
        }

        sizeOptionGroup.appendChild(label);
    });

    // 4. 이벤트 리스너 재연결 및 팝업 표시
    // ⭐️ 동적으로 생성된 라디오 버튼에 change 이벤트 리스너를 다시 연결
    sizeOptionGroup.querySelectorAll('input[name="pizza-size"]').forEach(input => {
        input.addEventListener('change', updatePrice);
    });
    
    popupElement.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
    updatePrice(); // 초기 가격 설정 및 표시
}

// 이벤트 리스너 연결 함수
function attachPizzaListeners() {
    // 팝업 열기 리스너: 모든 피자 카드의 버튼에 연결
    const pizzaButtons = document.querySelectorAll('.pizza-card .add-to-bill-btn');

    pizzaButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const pizzaCard = event.target.closest('.pizza-card');
            
            // 고정 옵션 피자(crust-note-small 클래스가 있는 경우)는 팝업을 띄우지 않습니다.
            if (pizzaCard && !pizzaCard.querySelector('.crust-note-small')) {
                 showPizzaOptions(pizzaCard); 
            }
        });
    });

    // 팝업 닫기 리스너 (공통)
    document.getElementById('close-popup')?.addEventListener('click', hidePizzaOptions);
    document.getElementById('pizza-popup')?.addEventListener('click', (event) => {
        if (event.target.id === 'pizza-popup') {
            hidePizzaOptions();
        }
    });

    // 최종 장바구니 담기 버튼 리스너 (공통)
    document.getElementById('add-pizza-to-cart')?.addEventListener('click', handleAddPizzaToCart);

    // 옵션 변경 시 가격 업데이트 리스너 (크러스트: HTML에 고정되어 있는 요소)
    document.querySelectorAll('input[name="pizza-crust"]').forEach(input => {
        input.addEventListener('change', updatePrice);
    });
}

// -------------------- 3. 가격 업데이트 및 장바구니 추가 로직 --------------------

// 가격 업데이트 함수 (현재 선택된 사이즈/크러스트에 따라 가격을 계산하여 표시)
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
    const crustValue = selectedCrustElement.value;
    
    // 1. 기본 피자 가격 가져오기 (HTML data-prices 사용)
    // data-prices='{"L": 27900, "F": 35900}' 형태를 가정
    const pricesJson = pizzaCard.dataset.prices.replace(/'/g, '"');
    const prices = JSON.parse(pricesJson);
    const basePrice = prices[sizeCode] || 0;

    // 2. 크러스트 추가 금액 가져오기
    const crustAddPrice = CRUST_PRICE_ADDITIONS[crustValue]?.[sizeCode] || 0;
    
    // 3. 최종 가격 계산
    const finalPrice = basePrice + crustAddPrice;
    
    // 4. 가격 표시 업데이트
    const priceDisplay = document.getElementById('selected-pizza-price');
    if (priceDisplay) {
        priceDisplay.textContent = `총 금액: ${formatPrice(finalPrice)}원`;
    }
}

// 피자 장바구니 추가 처리
function handleAddPizzaToCart() {
    const pizzaName = document.getElementById('popup-pizza-name').textContent;
    const size = document.querySelector('input[name="pizza-size"]:checked')?.value;
    const crust = document.querySelector('input[name="pizza-crust"]:checked')?.value;

    if (!size || !crust) {
        alert('사이즈와 크러스트를 모두 선택해야 합니다.');
        return;
    }
    
    const popupContent = document.querySelector('.pizza-popup-content');
    const pizzaId = popupContent?.dataset.currentPizzaId;
    const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
    
    if (!pizzaCard) return;

    // 최종 가격 다시 계산 (updatePrice 로직과 동일)
    const pricesJson = pizzaCard.dataset.prices.replace(/'/g, '"');
    const prices = JSON.parse(pricesJson);
    const basePrice = prices[size] || 0;
    
    const crustAddPrice = CRUST_PRICE_ADDITIONS[crust]?.[size] || 0;
    const finalPrice = basePrice + crustAddPrice;

    const pizzaItem = {
        type: 'pizza',
        name: pizzaName,
        price: basePrice, // 기본 피자 가격 (할인/추가금 계산을 위해 분리 저장)
        crustPrice: crustAddPrice, // 추가된 크러스트 가격
        size: size,
        crust: crust,
        quantity: 1,
        totalPrice: finalPrice // 단품 최종 가격
    };

    addToCart(pizzaItem);
    hidePizzaOptions();
    alert(`🍕 ${pizzaName} (${size}, ${crust}) 1개를 장바구니에 담았습니다.`);
}

// -------------------- 4. DOMContentLoaded: 페이지 진입점 --------------------

document.addEventListener('DOMContentLoaded', () => {

    // ⭐️ 피자 페이지 로직 (pizza.html) 활성화
    if (document.querySelector('.pizza-card')) {
        // initializePizzaCard(); // 필요한 경우 초기화 함수 호출
        attachPizzaListeners(); 
    }
    
    // ... 사이드 메뉴, 계산서 페이지 관련 로직 ... 
    console.log("Papa John's Pizza Menu Initialized.");
});

// ... 기타 함수 (예: attachSideMenuListeners, renderCart, calculateFinalTotal 등) ...