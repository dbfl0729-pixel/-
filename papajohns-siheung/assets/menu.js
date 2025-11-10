// ====================================================================
// menu.js: 피자 메뉴판 동적 기능 및 장바구니(Cart) 관리 스크립트 (팝업 모델)
// ====================================================================

// -------------------- 0. 전역 설정 및 가격 데이터 --------------------

// 크러스트별 사이즈별 추가 금액 정의 (HTML value와 키가 일치해야 함)
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
    // 이 옵션은 해당 피자 카드에만 존재하므로, 장바구니에 담을 때만 사용될 수 있음
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

// -------------------- 2. 피자 옵션 팝업(모달) 관련 함수 --------------------

// 팝업 숨기기
function hidePizzaOptions() {
    document.getElementById('pizza-popup').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 선택된 사이즈와 크러스트에 따라 최종 가격을 업데이트하는 핵심 로직
function updatePrice() {
    const popupContent = document.querySelector('.pizza-popup-content');
    const pizzaId = popupContent?.dataset.currentPizzaId;
    const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
    
    if (!pizzaCard) return;

    // 현재 선택된 옵션 값 가져오기
    const selectedSizeInput = popupContent.querySelector('input[name="pizza-size"]:checked');
    const selectedCrustInput = popupContent.querySelector('input[name="pizza-crust"]:checked');
    
    const sizeCode = selectedSizeInput?.value;
    const crustName = selectedCrustInput?.value; // CRUST_PRICE_ADDITIONS 키와 일치

    const totalPriceSpan = popupContent.querySelector('#popup-total-price');
    const crustAddText = popupContent.querySelector('#popup-crust-add-text');

    // 1. 기본 가격 파싱
    const pricesJson = (pizzaCard.dataset.prices || '{}').replace(/'/g, '"');
    const prices = JSON.parse(pricesJson);
    const basePrice = prices[sizeCode] || 0;
    
    // 2. 크러스트 추가 금액 계산
    let crustAddPrice = 0;
    if (crustName) {
        const crustAdditions = CRUST_PRICE_ADDITIONS[crustName] || {};
        crustAddPrice = crustAdditions[sizeCode] || 0;
    }

    const finalPrice = basePrice + crustAddPrice;

    // 3. UI 업데이트
    if (crustAddText) {
         if (crustAddPrice > 0) {
            crustAddText.textContent = `(+ ${formatPrice(crustAddPrice)}원 추가)`;
        } else {
            crustAddText.textContent = '';
        }
    }
    totalPriceSpan.textContent = formatPrice(finalPrice);
}


// 팝업 열기 및 옵션 동적 생성
function showPizzaOptions(pizzaCard) {
    const pizzaName = pizzaCard.dataset.name;
    const pizzaId = pizzaCard.id.split('-')[1];
    
    // 피자 카드 data 속성 가져오기
    const availableSizesJson = (pizzaCard.dataset.availableSizes || '[]').replace(/'/g, '"'); 
    const availableSizes = JSON.parse(availableSizesJson);
    const pricesJson = (pizzaCard.dataset.prices || '{}').replace(/'/g, '"');
    const prices = JSON.parse(pricesJson);

    // 팝업 요소 정의
    const popupElement = document.getElementById('pizza-popup');
    const sizeOptionGroup = popupElement.querySelector('#size-options-group');
    const crustOptionGroup = popupElement.querySelector('#crust-options-group');
    const crustOptionWrapper = popupElement.querySelector('#crust-options-wrapper');
    const popupContent = popupElement.querySelector('.pizza-popup-content');
    
    document.getElementById('popup-pizza-name').textContent = pizzaName;
    popupContent.dataset.currentPizzaId = pizzaId;

    // ------------------ 사이즈 옵션 생성 ------------------
    sizeOptionGroup.innerHTML = ''; // 초기화
    const sizeMap = { 'R': '레귤러 (R)', 'L': '라지 (L)', 'F': '패밀리 (F)', 'P': '파티 (P)' };
    
    if (availableSizes.length === 0) {
        // 옵션이 없을 때 (예: 씬 크러스트 전용 피자 또는 특수 모양 피자)
        sizeOptionGroup.innerHTML = '<p style="color: #d9534f; margin-top: 10px; font-weight: bold;">⚠️ 해당 피자는 사이즈 선택 옵션이 없습니다.</p>';
    } else {
        availableSizes.forEach((sizeCode, index) => {
            const price = prices[sizeCode] || 0;
            const sizeText = sizeMap[sizeCode] || sizeCode;
            const label = document.createElement('label');
            
            // 라디오 버튼 생성 및 가격 정보 포함
            label.innerHTML = `<input type="radio" id="size-radio-${sizeCode}" name="pizza-size" value="${sizeCode}"> ${sizeText} - ${formatPrice(price)}원`;
            
            if (index === 0) {
                // 첫 번째 옵션을 기본으로 선택
                label.querySelector('input').checked = true;
            }
            sizeOptionGroup.appendChild(label);
        });
        
        // 사이즈 변경 시 가격 업데이트 이벤트 리스너 연결
        sizeOptionGroup.querySelectorAll('input[name="pizza-size"]').forEach(input => {
            input.addEventListener('change', updatePrice);
        });
    }

    // ------------------ 크러스트 옵션 생성 ------------------
    crustOptionGroup.innerHTML = ''; // 초기화
    
    // 특수 피자 크러스트 숨김/제거 처리
    const isSpecialCrust = (pizzaId == 3 || pizzaId == 12 || pizzaId == 19 || pizzaId == 24 || pizzaId == 25);
    
    if (isSpecialCrust) {
        // 스타라이트 바질, 더블 치즈 디럭스 등 크러스트 변경 불가 피자
        crustOptionWrapper.style.display = 'none';
    } else {
        crustOptionWrapper.style.display = 'block';
        
        const crustOptions = {
            '오리지널': '오리지널 (기본)',
            '씬': '씬 (THIN) (기본)',
            '치즈롤': '치즈롤 (+추가금)',
            '골드링': '골드링 (+추가금)',
            '스파이시 치즈갈릭롤': '스파이시 갈릭 치즈롤 (+추가금)',
            '크루아상': '크루아상 (+추가금)'
        };
        
        // '더블 핫 앤 스파이시 멕시칸'은 씬 크러스트 제외
        if (pizzaId == 4) {
            delete crustOptions['씬'];
        }

        Object.keys(crustOptions).forEach((crustKey, index) => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="radio" id="crust-radio-${crustKey}" name="pizza-crust" value="${crustKey}"> ${crustOptions[crustKey]}`;
            
            // 오리지널을 기본으로 선택
            if (crustKey === '오리지널') {
                label.querySelector('input').checked = true;
            }
            crustOptionGroup.appendChild(label);
        });
        
        // 크러스트 변경 시 가격 업데이트 이벤트 리스너 연결
        crustOptionGroup.querySelectorAll('input[name="pizza-crust"]').forEach(input => {
            input.addEventListener('change', updatePrice);
        });
    }


    // 팝업 표시 및 초기 가격 설정
    popupElement.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updatePrice(); // 초기 가격 업데이트
}

// "계산서에 담기" 버튼 클릭 리스너
function attachBillListeners() {
    const pizzaButtons = document.querySelectorAll('.pizza-card .add-to-bill-btn');
    
    pizzaButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const pizzaId = event.currentTarget.dataset.pizzaId;
            const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
            
            showPizzaOptions(pizzaCard); // 팝업 열기
        });
    });
    
    // 팝업 닫기 버튼 리스너
    document.getElementById('close-popup').addEventListener('click', hidePizzaOptions);
}

// 팝업 내의 "장바구니에 담기" 버튼 로직
function attachPopupCartListener() {
    const cartButton = document.getElementById('popup-add-to-cart');
    const sizeMap = { 'R': '레귤러', 'L': '라지', 'F': '패밀리', 'P': '파티' };
    
    cartButton.addEventListener('click', () => {
        const popupContent = document.querySelector('.pizza-popup-content');
        const pizzaId = popupContent?.dataset.currentPizzaId;
        const pizzaCard = document.getElementById(`pizza-${pizzaId}`);
        
        if (!pizzaCard) return;
        
        const pizzaName = pizzaCard.dataset.name;

        // 선택된 옵션 값 가져오기
        const selectedSizeInput = popupContent.querySelector('input[name="pizza-size"]:checked');
        const selectedCrustInput = popupContent.querySelector('input[name="pizza-crust"]:checked');

        let size = selectedSizeInput?.value;
        let crust = selectedCrustInput?.value;
        
        const isSpecialCrust = (pizzaId == 3 || pizzaId == 12 || pizzaId == 19 || pizzaId == 24 || pizzaId == 25);
        
        // 1. 유효성 검사 및 특수 피자 처리 (팝업에서 크러스트 선택이 없는 경우)
        if (!size && !isSpecialCrust) {
            alert('사이즈를 선택해야 합니다.');
            return;
        }

        // 특수 피자는 옵션을 강제 설정
        if (pizzaName === '스타라이트 바질') { size = 'L'; crust = '특수 크러스트'; }
        else if (pizzaName === '더블 치즈 디럭스' || pizzaName === '슈림프 알프레도') { size = 'F'; crust = '씬'; }
        else if (pizzaName.includes('그린잇')) { size = 'L'; crust = '비건 전용'; }

        // 일반 피자 유효성 검사 (크러스트가 선택 가능한 피자)
        if (!isSpecialCrust && !crust) {
            alert('크러스트를 선택해야 합니다.');
            return;
        }

        // 씬+골드링 사이즈 제한 유효성 검사 (F 사이즈만 가능)
        if (crust === '씬+골드링' && size !== 'F') {
            alert('죄송합니다. 씬+골드링 크러스트는 패밀리 사이즈(F)로만 주문 가능합니다.');
            return; 
        }

        // 2. 가격 최종 확정
        const totalPriceSpan = popupContent.querySelector('#popup-total-price');
        const finalPriceText = totalPriceSpan.textContent.replace(/,/g, '');
        const finalPrice = parseInt(finalPriceText, 10);
        
        const pricesJson = (pizzaCard.dataset.prices || '{}').replace(/'/g, '"');
        const prices = JSON.parse(pricesJson);
        const basePrice = prices[size] || 0;
        const crustAddPrice = finalPrice - basePrice;

        // 3. 장바구니에 담기
        const pizzaItem = { type: 'pizza', name: pizzaName, price: basePrice, crustPrice: crustAddPrice, size: size, crust: crust, quantity: 1, totalPrice: finalPrice };
        addToCart(pizzaItem);
        
        hidePizzaOptions();
        alert(`🍕 ${pizzaName} (${sizeMap[size] || size}, ${crust || '기본'}) 1개를 장바구니에 담았습니다.`);
    });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 인라인 <select>는 팝업 방식으로 대체되므로,
    // 오직 '계산서에 담기' 버튼 클릭 시 팝업을 띄우는 리스너만 연결합니다.
    attachBillListeners();
    attachPopupCartListener();
});