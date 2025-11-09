// ====================================================================
// Menu.js: 장바구니(Cart), 피자 옵션, 할인 계산 통합 관리 (최종 통합본)
// ====================================================================

// 전역 변수 설정 (실제 가격 데이터를 정의합니다.)
const PIZZA_PRICES = {
    '바베큐 숏립 크런치': { 'L': 34500, 'F': 41900 },
    '멜로우 콘크림': { 'L': 27500, 'F': 33900, 'P': 41500 },
    '스타라이트 바질': { 'L': 33500, 'F': 39900, 'P': 48500 },
    '더블 핫 앤 스파이시 멕시칸': { 'L': 33500, 'F': 39900 },
    '수퍼 파파스': { 'R': 19900, 'L': 28500, 'F': 33900, 'P': 42500 },
    '존스 페이버릿': { 'L': 29500, 'F': 34900, 'P': 45500 },
    '올미트': { 'R': 19900, 'L': 29500, 'F': 34900, 'P': 45500 },
    '스파이시 치킨랜치': { 'R': 19900, 'L': 29500, 'F': 34900, 'P': 43500 },
    '아이리쉬 포테이토': { 'R': 18900, 'L': 27500, 'F': 32900, 'P': 40500 },
    '치킨 바베큐': { 'R': 18900, 'L': 27500, 'F': 32900, 'P': 40500 },
    '크리스피 치즈 페퍼로니': { 'F': 31900 }, // THIN 전용
    '크리스피 치즈 트리플': { 'F': 33900 },   // THIN 전용
    '햄 머쉬룸 식스 치즈': { 'L': 28500, 'F': 33900, 'P': 42500 },
    '위스콘신 치즈 포테이토': { 'L': 29500, 'F': 35900, 'P': 45500 },
    '더블 치즈버거': { 'L': 29500, 'F': 34900, 'P': 43500 },
    '프리미엄 직화불고기': { 'L': 29500, 'F': 34900, 'P': 43500 },
    '식스 치즈': { 'L': 26500, 'F': 31900, 'P': 39500 },
    '스파이시 이탈리안': { 'L': 27500, 'F': 33900, 'P': 40500 },
    '슈림프 알프레도': { 'F': 34900 },       // THIN 전용
    '마가리타': { 'R': 16900, 'L': 23500, 'F': 28900, 'P': 36500 },
    '페퍼로니': { 'R': 17900, 'L': 25500, 'F': 30900, 'P': 38500 },
    '하와이안': { 'R': 17900, 'L': 26500, 'F': 32900, 'P': 39500 },
    '가든 스페셜': { 'R': 17900, 'L': 26500, 'F': 31900, 'P': 39500 },
    '그린잇 식물성 마가리타': { 'L': 26500 }, // 비건 전용
    '그린잇 식물성 가든스페셜': { 'L': 29500 }, // 비건 전용
};

// 크러스트 추가금액 정보 (사이즈별)
const CRUST_PRICES = {
    '오리지널': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    '씬 (THIN)': { 'R': 0, 'L': 0, 'F': 0, 'P': null }, // P 사이즈 불가
    '치즈롤': { 'R': null, 'L': 4000, 'F': 5000, 'P': 6000 },
    '골드링': { 'R': null, 'L': 4000, 'F': 5000, 'P': 6000 },
    '스파이시 갈릭 치즈롤': { 'R': null, 'L': 4000, 'F': 5000, 'P': 6000 },
    '크루아상': { 'R': null, 'L': 6000, 'F': 6000, 'P': 6000 }
};

// 사이즈 코드별 이름 정보 (HTML과 통일)
const SIZE_DETAILS = {
    'R': { name: '레귤러' },
    'L': { name: '라지' },
    'F': { name: '패밀리' },
    'P': { name: '파티' }
};

// ... (addToCart, saveCart, renderCart 등 기존 menu.js 함수들)

// 금액을 쉼표 형식으로 변환하는 함수
function formatPrice(price) {
    if (typeof price !== 'number') return '0';
    return price.toLocaleString('ko-KR');
}

// 선택된 옵션에 따라 총 가격을 업데이트하는 함수
function updatePizzaPrice(pizzaId) {
    const card = document.getElementById(`pizza-${pizzaId}`);
    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    const totalPriceSpan = document.getElementById(`total-price-${pizzaId}`);
    const crustAddText = document.getElementById(`crust-add-text-${pizzaId}`);
    
    if (!sizeSelect || !totalPriceSpan) return; 

    const selectedOptionValue = sizeSelect.value;
    const parts = selectedOptionValue.split('-');
    
    // selectedSize: 'L', basePrice: 28500
    const selectedSize = parts[0].trim().replace(/\(.*\)/, ''); 
    const basePriceText = parts[1] ? parts[1].replace(/[^0-9]/g, '').trim() : '0';
    const basePrice = parseInt(basePriceText) || 0;
    
    // 크러스트 선택이 불가능한 경우 처리 ('스타라이트 바질', '그린잇' 등)
    const selectedCrustOption = crustSelect ? crustSelect.options[crustSelect.selectedIndex] : { textContent: '오리지널', value: 'original' };
    const selectedCrustName = selectedCrustOption.textContent.split('(')[0].trim();
    const selectedCrustValue = selectedCrustOption.value;
    
    let crustAddPrice = 0;
    let crustLimitMessage = '';
    let isCrustValid = true;
    
    if (crustAddText) crustAddText.textContent = ''; 

    // 크러스트 선택바가 있는 경우에만 유효성 및 추가금 계산
    if (crustSelect) {
        // 레귤러 사이즈 크러스트 제한 (씬 제외)
        if (selectedSize === 'R' && selectedCrustValue !== 'original' && selectedCrustValue !== 'thin') {
            isCrustValid = false;
            crustLimitMessage = '* 레귤러 사이즈는 씬을 제외한 특수 크러스트 변경이 불가합니다.';
        } 
        // 씬 크러스트 파티(P) 사이즈 제한
        else if (selectedCrustValue === 'thin' && selectedSize === 'P') {
            isCrustValid = false;
            crustLimitMessage = '* 씬(THIN) 크러스트는 파티(P) 사이즈에 적용 불가합니다.';
        } 
        // 크러스트 추가금 계산
        else if (selectedCrustValue !== 'original' && selectedCrustValue !== 'thin') {
             crustAddPrice = CRUST_PRICES[selectedCrustName] ? CRUST_PRICES[selectedCrustName][selectedSize] || 0 : 0;
        } else if (selectedCrustValue === 'thin') {
            // 씬은 L/F 사이즈에서 무료
            crustAddPrice = 0;
            if (selectedSize !== 'R') {
                crustAddText.textContent = `(씬 크러스트는 ${selectedSize} 사이즈 무료 변경입니다.)`;
            }
        }
    } else {
        // 크러스트 선택바가 없는 메뉴 (THIN 전용, 비건 전용, 별모양 등)
        isCrustValid = true; 
    }

    // 최종 금액 계산 및 메시지 업데이트
    let totalPrice = basePrice;
    
    if (isCrustValid) {
        totalPrice = basePrice + crustAddPrice;
        if (crustAddPrice > 0 && crustAddText) {
            crustAddText.textContent = `(크러스트 추가금: +${formatPrice(crustAddPrice)}원)`;
        }
    } else if (crustAddText) {
         if (crustLimitMessage) crustAddText.textContent = crustLimitMessage;
    }
    
    totalPriceSpan.textContent = formatPrice(totalPrice);
}

// 피자 장바구니 추가 처리
function handleAddPizzaToCart(pizzaId) {
    const card = document.getElementById(`pizza-${pizzaId}`);
    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    const totalPriceSpan = document.getElementById(`total-price-${pizzaId}`);

    const pizzaName = card.getAttribute('data-name');
    
    const selectedSizeValue = sizeSelect ? sizeSelect.value : card.querySelector('.size-select option')?.value;
    const selectedCrustOption = crustSelect ? crustSelect.options[crustSelect.selectedIndex] : { textContent: '오리지널', value: 'original' };
    
    const finalPriceText = totalPriceSpan.textContent.replace(/[^0-9]/g, '');
    const finalPrice = parseInt(finalPriceText) || 0;

    const sizeParts = selectedSizeValue.split('-');
    const sizeCode = sizeParts[0].trim();
    const basePrice = PIZZA_PRICES[pizzaName]?.[sizeCode] || 0;
    
    const crustName = selectedCrustOption.textContent.split('(')[0].trim();
    const crustValue = selectedCrustOption.value;
    
    let crustPrice = 0;
    if (crustValue !== 'original' && crustValue !== 'thin') {
        crustPrice = CRUST_PRICES[crustName] ? CRUST_PRICES[crustName][sizeCode] || 0 : 0;
    }
    
    // 유효성 재확인 (여기서는 alert만 띄우고 실제 장바구니 추가 로직은 진행)
    const crustAddText = document.getElementById(`crust-add-text-${pizzaId}`);
    if (crustAddText && crustAddText.textContent.includes('불가합니다')) {
        alert(`선택한 옵션이 해당 피자에 적용 불가합니다: ${crustAddText.textContent}`);
        return;
    }

    const pizzaItem = {
        type: 'pizza',
        name: pizzaName,
        price: basePrice, // 기본 피자 가격 (크러스트 추가금 제외)
        crustPrice: crustPrice, // 추가된 크러스트 가격
        size: sizeCode,
        crust: crustName,
        quantity: 1
    };

    addToCart(pizzaItem);
    alert(`${pizzaName} (${SIZE_DETAILS[sizeCode].name}, ${crustName}) 1개를 장바구니에 담았습니다.`);
}

// 피자 카드별 이벤트 리스너 연결
function attachPizzaListeners() {
    const pizzaCards = document.querySelectorAll('.pizza-card');

    pizzaCards.forEach(card => {
        const pizzaId = card.id.split('-')[1];
        const sizeSelect = document.getElementById(`size-${pizzaId}`);
        const crustSelect = document.getElementById(`crust-${pizzaId}`);
        const addButton = card.querySelector('.add-to-bill-btn');
        
        // 사이즈 선택 옵션 설정 (데이터 속성 기반)
        const availableSizes = JSON.parse(card.getAttribute('data-available-sizes'));
        const prices = JSON.parse(card.getAttribute('data-prices'));
        
        if (sizeSelect) {
            sizeSelect.innerHTML = '';
            availableSizes.forEach(sizeCode => {
                const price = prices[sizeCode];
                const formattedPrice = formatPrice(price);
                const option = document.createElement('option');
                
                // 최종 UX 반영: 선택바 옵션 -> 라지(L) - 28,500원
                option.value = `${sizeCode} - ${formattedPrice}원`;
                option.textContent = `${SIZE_DETAILS[sizeCode].name}(${sizeCode}) - ${formattedPrice}원`;
                
                sizeSelect.appendChild(option);
            });
        }

        // 이벤트 리스너 등록
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => { updatePizzaPrice(pizzaId); });
        }
        if (crustSelect) {
            crustSelect.addEventListener('change', () => { updatePizzaPrice(pizzaId); });
        }

        if (addButton) {
            // 버튼 클릭 시 장바구니 로직 호출
            addButton.addEventListener('click', () => {
                handleAddPizzaToCart(pizzaId);
            });
        }

        // 초기 가격 설정
        updatePizzaPrice(pizzaId);
    });
}

// -------------------- 5. DOMContentLoaded: 페이지 진입점 --------------------

document.addEventListener('DOMContentLoaded', () => {

    // 피자 페이지 로직 (pizza.html) 활성화
    if (document.querySelector('.pizza-card')) {
        attachPizzaListeners(); 
    }

    // 사이드/음료 페이지 로직 (sides.html, drinks_sauces.html)
    if (document.querySelector('.menu-item') && document.querySelector('.add-to-cart-btn')) {
        attachSideMenuListeners(); 
    }

    // 계산서 페이지 로직 (bill.html)
    if (document.getElementById('cart-list')) {
        renderCart(); 
        calculateFinalTotal();
        // 기타 bill.html 관련 리스너 연결
    }
});