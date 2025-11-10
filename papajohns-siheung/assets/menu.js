// ====================================================================
// menu.js: 피자 메뉴판 동적 기능 및 장바구니(Cart) 관리 스크립트
// ====================================================================

// -------------------- 0. 전역 설정 및 가격 데이터 --------------------

// 크러스트별 사이즈별 추가 금액 정의 (HTML의 data-add 값을 기반으로 일반적인 크러스트 가격 스케일을 적용)
const CRUST_PRICE_ADDITIONS = {
    // 오리지널, 씬은 추가금 없음
    'original': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    'thin': { 'R': 0, 'L': 0, 'F': 0, 'P': 0 },
    
    // L: 4,000원, F: 6,000원, P: 8,000원 (일반적인 크러스트 옵션 가격 스케일)
    'cheeseroll': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    'goldring': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    'spicygarlic': { 'R': 3000, 'L': 4000, 'F': 6000, 'P': 8000 },
    
    // 크루아상 (L: 6,000원, F: 8,000원, P: 10,000원 - 가장 비싼 옵션 스케일)
    'croissant': { 'R': 4000, 'L': 6000, 'F': 8000, 'P': 10000 },
};

// 장바구니 데이터 (Local Storage에 저장될 예정)
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
    // 동일한 이름, 사이즈, 크러스트의 피자가 있는지 확인
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
}


// -------------------- 2. 피자 카드 동적 기능 초기화 --------------------

/**
 * 피자 카드별 동적 요소 (사이즈 선택 옵션, 가격 계산 리스너)를 초기화합니다.
 * @param {HTMLElement} card - 개별 피자 카드 DOM 요소
 */
function initializePizzaCard(card) {
    const pizzaId = card.id.split('-')[1];
    const pizzaName = card.dataset.name;
    const priceData = JSON.parse(card.dataset.prices);
    const availableSizes = JSON.parse(card.dataset.availableSizes);
    
    const sizeSelect = card.querySelector('.size-select');
    const crustSelect = card.querySelector('.crust-select');
    const totalPriceSpan = card.querySelector(`#total-price-${pizzaId}`);
    const crustAddText = card.querySelector(`#crust-add-text-${pizzaId}`);
    const addToBillBtn = card.querySelector('.add-to-bill-btn');
    
    // 2-1. 사이즈 선택 드롭다운 채우기
    if (sizeSelect && availableSizes.length > 0) {
        sizeSelect.innerHTML = ''; // 기존 옵션 제거
        availableSizes.forEach(sizeCode => {
            // R: 레귤러, L: 라지, F: 패밀리, P: 파티
            const sizeMap = { 'R': '레귤러(R)', 'L': '라지(L)', 'F': '패밀리(F)', 'P': '파티(P)' };
            const basePrice = priceData[sizeCode];
            const option = document.createElement('option');
            
            option.value = sizeCode;
            option.textContent = `${sizeMap[sizeCode]} - ${formatPrice(basePrice)}원`;
            sizeSelect.appendChild(option);
        });
        
        // 기본값으로 첫 번째 사이즈를 선택
        sizeSelect.value = availableSizes[0];
    }
    
    // 2-2. 가격 계산 및 업데이트 함수
    const updatePrice = () => {
        if (!sizeSelect) return;
        
        const selectedSizeCode = sizeSelect.value;
        const basePrice = priceData[selectedSizeCode] || 0;
        let crustAddition = 0;
        let selectedCrustName = '오리지널'; // 기본값

        if (crustSelect) {
            const selectedCrustValue = crustSelect.value;
            const crustOption = crustSelect.options[crustSelect.selectedIndex];
            
            // 크러스트 추가금 계산
            crustAddition = CRUST_PRICE_ADDITIONS[selectedCrustValue]?.[selectedSizeCode] || 0;
            selectedCrustName = crustOption.textContent.split('(')[0].trim();
            
            // 크러스트 추가금 표시 업데이트
            if (crustAddText) {
                if (crustAddition > 0) {
                    crustAddText.textContent = `(${selectedCrustName} 크러스트 추가금: ${formatPrice(crustAddition)}원)`;
                } else {
                    crustAddText.textContent = '';
                }
            }
            
        } else {
             // 크러스트 선택이 없는 피자 (예: 별모양, 비건 피자)는 추가금이 0이고 기본값 표시 영역을 비웁니다.
            if (crustAddText) {
                crustAddText.textContent = '';
            }
        }
        
        const finalPrice = basePrice + crustAddition;
        
        if (totalPriceSpan) {
            totalPriceSpan.textContent = formatPrice(finalPrice);
        }
        
        // 버튼에 현재 선택된 옵션 데이터 저장 (장바구니 로직을 위해)
        addToBillBtn.dataset.size = selectedSizeCode;
        addToBillBtn.dataset.crust = selectedCrustName;
        addToBillBtn.dataset.finalPrice = finalPrice;
    };

    // 2-3. 이벤트 리스너 연결
    
    // 사이즈 선택 변경 시 가격 업데이트
    if (sizeSelect) {
        sizeSelect.addEventListener('change', updatePrice);
    }
    
    // 크러스트 선택 변경 시 가격 업데이트
    if (crustSelect) {
        crustSelect.addEventListener('change', updatePrice);
    }

    // 장바구니 버튼 클릭 이벤트
    addToBillBtn.addEventListener('click', (event) => {
        const btn = event.currentTarget;
        const sizeCode = btn.dataset.size;
        const crustName = btn.dataset.crust;
        const price = parseInt(btn.dataset.finalPrice);

        if (price === 0) {
            alert('사이즈를 선택해주세요.');
            return;
        }

        const sizeMap = { 'R': 'R', 'L': 'L', 'F': 'F', 'P': 'P' };
        
        const item = {
            type: 'pizza',
            name: pizzaName,
            price: price, // 최종 가격
            size: sizeMap[sizeCode],
            crust: crustName,
            quantity: 1
        };

        addToCart(item);
        alert(`✅ ${pizzaName} (${sizeMap[sizeCode]}, ${crustName}) 1개를 계산서에 담았습니다!`);
        
        // 계산서 페이지로 이동 (선택 사항)
        // window.location.href = 'bill.html'; 
    });

    // 2-4. 초기 가격 설정
    // * 특수 피자(THIN 전용, 비건, 별모양)는 sizeSelect가 커스텀 되어 있으므로, priceData를 다시 읽지 않고
    //   HTML에 명시된 total-price 값을 초기값으로 사용하고 동적 리스너를 건너뜁니다.

    if (pizzaName.includes('THIN 전용') || pizzaName.includes('별모양') || pizzaName.includes('VEGAN')) {
        // 특수 피자는 사이즈 및 크러스트 변경이 불가하므로, 초기 가격만 설정
        // 이 피자들은 HTML에서 이미 옵션이 설정되어 있고 가격도 명시되어 있음
        const initialPrice = parseInt(totalPriceSpan.textContent.replace(/[^0-9]/g, ''));
        addToBillBtn.dataset.size = availableSizes[0];
        addToBillBtn.dataset.crust = '고정 크러스트'; // 임의의 값
        addToBillBtn.dataset.finalPrice = initialPrice;
        
    } else {
        // 일반 피자는 동적으로 가격을 계산하여 초기화
        updatePrice(); 
    }
}


// -------------------- 3. DOMContentLoaded: 페이지 진입점 --------------------

document.addEventListener('DOMContentLoaded', () => {

    // 모든 피자 카드에 대한 초기화 로직 실행
    const pizzaCards = document.querySelectorAll('.pizza-card');
    pizzaCards.forEach(initializePizzaCard);

    console.log("Papa John's Pizza Menu Initialized.");
    
    // 참고: 'bill.html'에서 장바구니를 렌더링하는 'renderCart()' 함수는 
    // 이 파일의 addToCart 함수를 사용합니다.
});