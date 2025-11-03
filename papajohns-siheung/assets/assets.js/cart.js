// assets/js/cart.js

// -----------------------------------------------------
// 1. 데이터 정의 (25가지 피자 메뉴 및 크러스트 가격)
// -----------------------------------------------------

// 1.1. 크러스트 옵션 및 사이즈별 추가금액 (R 사이즈 변경 불가)
const CRUST_OPTIONS = [
    { value: 'original', name: '오리지널', desc: '쫄깃하고 고소한 기본에 충실한 맛', priceL: 0, priceF: 0, priceP: 0, priceR: 0 },
    { value: 'thin', name: '씬 (Thin)', desc: '바삭한 식감. F 사이즈 무료 변경 가능.', priceL: 0, priceF: 0, priceP: 0, priceR: 0 }, 
    
    // 유료 크러스트 (R 사이즈 제외)
    { value: 'cheeseroll', name: '치즈롤', desc: '스트링 치즈의 유혹', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'goldring', name: '골드링', desc: '고구마 무스와 스트링 치즈', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'spicygarliccheeseroll', name: '스파이시 갈릭 치즈롤', desc: '진한 풍미!', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },

    // 크루아상 크러스트 (R 사이즈 제외, 모든 사이즈 6,000원 추가)
    { value: 'croissant', name: '크루아상', desc: '겹겹이 살아있는 바삭함 버터의 풍미로 완성 된 도우', priceL: 6000, priceF: 6000, priceP: 6000, priceR: 0 },
];

// 1.2. 1+1 이벤트가 적용되는 피자 ID 목록 (7종)
const EVENT_PIZZA_IDS = ['P05', 'P06', 'P08', 'P09', 'P10', 'P15', 'P16'];
let onePlusOneCart = []; // 1+1 주문을 위한 임시 카트

// 1.3. 25가지 피자 메뉴 데이터 (최신 가격 및 옵션 타입 명시)
const PIZZA_MENU = {
    // Premium
    'P01': { name: '바베큐 숏립 크런치', prices: { L: 34500, F: 41900 }, crustType: 'all' },
    'P02': { name: '멜로우 콘크림', prices: { L: 27500, F: 33900, P: 41500 }, crustType: 'all' },
    'P03': { name: '스타라이트 바질', prices: { L: 33500, F: 39900, P: 48500 }, crustType: 'none', desc: '크러스트 변경 불가' }, 
    'P04': { name: '더블 핫 앤 스파이시 멕시칸', prices: { L: 33500, F: 39900 }, crustType: 'spicygarliccheeseroll_only' },
    
    // Best & 1+1
    'P05': { name: '수퍼 파파스 (BEST / 1+1)', prices: { R: 19900, L: 28500, F: 33900, P: 42500 }, crustType: 'all' },
    'P06': { name: '존스 페이버릿 (BEST / 1+1)', prices: { L: 29500, F: 34900, P: 45500 }, crustType: 'all' },
    'P07': { name: '올미트', prices: { R: 19900, L: 29500, F: 34900, P: 45500 }, crustType: 'all' },
    'P08': { name: '스파이시 치킨랜치 (1+1)', prices: { R: 19900, L: 29500, F: 34900, P: 43500 }, crustType: 'all' },
    'P09': { name: '아이리쉬 포테이토 (1+1)', prices: { R: 18900, L: 27500, F: 32900, P: 40500 }, crustType: 'all' },
    'P10': { name: '치킨 바베큐 (1+1)', prices: { R: 18900, L: 27500, F: 32900, P: 40500 }, crustType: 'all' },

    // Specialty & Thin
    'P11': { name: '크리스피 치즈 페퍼로니 피자', prices: { F: 31900 }, crustType: 'thin_only', desc: '씬(Thin) 크러스트 전용' }, 
    'P12': { name: '크리스피 치즈 트리플 피자', prices: { F: 33900 }, crustType: 'thin_only', desc: '씬(Thin) 크러스트 전용' },
    'P13': { name: '햄 머쉬룸 식스 치즈', prices: { L: 28500, F: 33900, P: 42500 }, crustType: 'all' },
    'P14': { name: '위스콘신 치즈 포테이토', prices: { L: 29500, F: 35900, P: 45500 }, crustType: 'no_thin' }, // 씬 제외
    'P15': { name: '더블 치즈버거 (1+1)', prices: { L: 29500, F: 34900, P: 43500 }, crustType: 'all' },
    'P16': { name: '프리미엄 직화불고기 (1+1)', prices: { L: 29500, F: 34900, P: 43500 }, crustType: 'all' },
    'P17': { name: '식스 치즈', prices: { L: 26500, F: 31900, P: 39500 }, crustType: 'all' },
    'P18': { name: '스파이시 이탈리안', prices: { L: 27500, F: 33900, P: 40500 }, crustType: 'all' },
    'P19': { name: '슈림프 알프레도', prices: { F: 34900 }, crustType: 'thin_only', desc: '씬(Thin) 크러스트 전용' }, 

    // Classic 
    'P20': { name: '마가리타', prices: { R: 16900, L: 23500, F: 28900, P: 36500 }, crustType: 'all' },
    'P21': { name: '페퍼로니', prices: { R: 17900, L: 25500, F: 30900, P: 38500 }, crustType: 'all' },
    'P22': { name: '하와이안', prices: { R: 17900, L: 26500, F: 32900, P: 39500 }, crustType: 'all' },
    'P23': { name: '가든 스페셜', prices: { R: 17900, L: 26500, F: 31900, P: 39500 }, crustType: 'all' },

    // Vegan (L 사이즈 통일)
    'P24': { name: '그린잇 식물성 마가리타', prices: { L: 26500 }, crustType: 'none', desc: '크러스트 변경 불가' },
    'P25': { name: '그린잇 식물성 가든스페셜', prices: { L: 29500 }, crustType: 'none', desc: '크러스트 변경 불가' } 
};


// -----------------------------------------------------
// 2. 핵심 로직 함수들 
// -----------------------------------------------------

/** 가격 포맷 함수 */
const formatPrice = (price) => price.toLocaleString('ko-KR');

/** 크러스트 추가 금액 계산 함수 */
const getCrustExtraPrice = (pizzaId, size, crustValue) => {
    const crust = CRUST_OPTIONS.find(c => c.value === crustValue);
    if (!crust) return 0;
    
    // R 사이즈는 크러스트 변경 불가, 무조건 추가금 0원
    if (size === 'R') return 0;
    
    // 씬 크러스트는 F 사이즈 무료 변경 외에는 추가금 0원 (기본 도우와 동일)
    if (crustValue === 'thin') {
        return 0;
    }
    
    // 유료 크러스트 추가금 계산
    const sizeCode = size === 'L' ? 'L' : size === 'F' ? 'F' : size === 'P' ? 'P' : null;
    if (sizeCode && crust[`price${sizeCode}`] !== undefined) {
        return crust[`price${sizeCode}`];
    }
    return 0;
};

/** 1+1 최종 가격 계산 로직 (비싼 피자 가격 + 크러스트 추가금 합계) */
const calculateOnePlusOnePrice = (p1, p2) => {
    const maxBasePrice = Math.max(p1.basePrice, p2.basePrice);
    const totalCrustExtraPrice = p1.crustExtraPrice + p2.crustExtraPrice;
    return maxBasePrice + totalCrustExtraPrice;
};

/** 1+1 버튼 상태를 업데이트하는 함수 */
const updateOnePlusOneStatus = () => {
    const allOnePlusOneButtons = document.querySelectorAll('.one-plus-one-btn');

    allOnePlusOneButtons.forEach(btn => {
        const currentPizzaId = btn.getAttribute('data-pizza-id');
        const isSelected = onePlusOneCart.some(p => p.id === currentPizzaId);
        
        if (onePlusOneCart.length === 2) {
            // 2개 모두 선택 완료 시, 모든 버튼 비활성화
            btn.textContent = '✅ 1+1 주문 완료!';
            btn.disabled = true;
        } else if (isSelected) {
            // 현재 피자가 선택되었을 경우
            const selectedItem = onePlusOneCart.find(p => p.id === currentPizzaId);
            btn.textContent = `✅ 선택됨 (${onePlusOneCart.indexOf(selectedItem) + 1}번째)`;
            btn.disabled = true;
        } else {
            // 아직 선택되지 않았거나 1개만 선택된 경우
            btn.textContent = '🎉 1+1 담기';
            btn.disabled = false;
        }
    });

    // 1+1 주문 완료 후 10초 뒤 버튼 상태 초기화 (옵션 재선택 가능하도록)
    if (onePlusOneCart.length === 2) {
        setTimeout(() => {
            onePlusOneCart = [];
            allOnePlusOneButtons.forEach(btn => {
                btn.textContent = '🎉 1+1 담기';
                btn.disabled = false;
            });
        }, 10000); // 10초 후 자동 초기화
    }
};


/** 현재 선택된 옵션 기반으로 가격을 업데이트하는 함수 */
const updatePrice = (pizzaId) => {
    const pizzaData = PIZZA_MENU[pizzaId];
    if (!pizzaData) return;

    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    const priceSpan = document.getElementById(`total-price-${pizzaId}`);
    const crustAddText = document.getElementById(`crust-add-text-${pizzaId}`);
    
    if (!sizeSelect || !crustSelect || !priceSpan || !crustAddText) return;

    const selectedSize = sizeSelect.value;
    const selectedCrust = crustSelect.value;

    const basePrice = pizzaData.prices[selectedSize] || 0;
    let crustExtraPrice = getCrustExtraPrice(pizzaId, selectedSize, selectedCrust);
    
    // 크러스트 선택 불가 피자에 대한 처리
    if (pizzaData.crustType === 'none') {
        crustSelect.style.display = 'none';
        crustAddText.textContent = '(크러스트 변경 불가)';
        crustAddText.style.color = '#555';
    } else {
        // 크러스트 select box의 disabled 상태 업데이트 (R 사이즈일 경우)
        if (selectedSize === 'R') {
             crustSelect.value = 'original'; // R이면 오리지널로 강제 선택
             crustSelect.disabled = true;
        } else {
             crustSelect.disabled = false;
        }
        crustSelect.style.display = 'block';
    }
    
    // 크러스트 추가금 텍스트 업데이트
    if (crustExtraPrice > 0) {
        crustAddText.textContent = `(추가금: +${formatPrice(crustExtraPrice)}원)`;
        crustAddText.style.color = '#d9534f'; 
    } else if (selectedCrust === 'thin' && selectedSize === 'F') {
        crustAddText.textContent = `(F 사이즈 무료 변경)`;
        crustAddText.style.color = '#4a6c4c'; // 메인 컬러 사용
    } else if (selectedSize === 'R') {
        crustAddText.textContent = `(R 사이즈는 크러스트 변경 불가)`;
        crustAddText.style.color = '#888';
    } else {
        crustAddText.textContent = '';
    }

    const totalPrice = basePrice + crustExtraPrice;
    priceSpan.textContent = formatPrice(totalPrice);
};


/** 사이즈 옵션을 동적으로 생성하는 함수 */
const populateSizeOptions = (pizzaId, prices) => {
    const select = document.getElementById(`size-${pizzaId}`);
    if (!select) return;

    select.innerHTML = ''; 
    
    // 사이즈 코드 순서 정의: R, L, F, P
    const sizeOrder = ['R', 'L', 'F', 'P']; 
    
    sizeOrder.forEach(size => {
        if (prices[size]) {
            const sizeMap = { R: '23cm', L: '31cm', F: '36cm', P: '41cm' };
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size} (${sizeMap[size]}) - ${formatPrice(prices[size])}원`;
            select.appendChild(option);
        }
    });
};

/** 크러스트 옵션을 동적으로 생성하는 함수 */
const populateCrustOptions = (pizzaId, crustType) => {
    const select = document.getElementById(`crust-${pizzaId}`);
    if (!select) return;

    select.innerHTML = ''; 
    
    // 크러스트 선택이 없는 경우 (P03, P24, P25)
    if (crustType === 'none') {
        select.innerHTML = '<option value="none">크러스트 변경 불가</option>';
        select.disabled = true; // 비활성화
        return;
    }
    
    let availableCrusts = [];
    const crustOrder = ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'];
    
    // 피자 타입별 필터링
    if (crustType === 'all') {
        availableCrusts = CRUST_OPTIONS;
    } else if (crustType === 'no_thin') {
        availableCrusts = CRUST_OPTIONS.filter(c => c.value !== 'thin');
    } else if (crustType === 'spicygarliccheeseroll_only') {
        availableCrusts = CRUST_OPTIONS.filter(c => c.value === 'original' || c.value === 'spicygarliccheeseroll');
    } else if (crustType === 'thin_only') {
        availableCrusts = CRUST_OPTIONS.filter(c => c.value === 'original' || c.value === 'thin');
    }

    // 옵션 생성 (크러스트 순서 정렬)
    availableCrusts
        .sort((a, b) => crustOrder.indexOf(a.value) - crustOrder.indexOf(b.value))
        .forEach(crust => {
        const option = document.createElement('option');
        option.value = crust.value;
        
        let priceText = '';
        if (crust.value === 'thin') {
             priceText = '(F 사이즈 무료)';
        } else if (crust.value === 'croissant') {
             priceText = '(+6,000원)';
        } else if (crust.value !== 'original') {
            priceText = `(+${formatPrice(crust.priceL)}~${formatPrice(crust.priceP)}원)`;
        } 
        
        option.textContent = `${crust.name} ${priceText}`;
        select.appendChild(option);
    });
    
    // 기본값은 항상 오리지널
    select.value = 'original'; 
    select.disabled = false;
};


/**
 * 피자 메뉴 데이터를 기반으로 HTML 카드 문자열을 생성합니다.
 */
const createPizzaCardHTML = (pizzaId, data) => {
    const isEvent = EVENT_PIZZA_IDS.includes(pizzaId);
    const eventBadge = isEvent ? '<span class="event-badge">1+1</span>' : '';
    const initialPrice = formatPrice(Object.values(data.prices)[0] || 0); // 첫 번째 사이즈 가격
    const pizzaDesc = data.desc || '파파존스의 프리미엄 토핑과 신선한 도우로 만든 맛있는 피자입니다.';

    return `
        <div class="pizza-card menu-item" data-id="${pizzaId}" data-name="${data.name}">
            <div class="pizza-card-header">
                <h3>${pizzaId}. ${data.name} ${eventBadge}</h3>
            </div>
            <img src="images/${pizzaId}.jpg" alt="${data.name} 이미지">
            
            <div class="pizza-card-body">
                <p>${pizzaDesc}</p>
            </div>
            
            <div class="pizza-options">
                <div class="option-group">
                    <label for="size-${pizzaId}">사이즈 선택:</label>
                    <select id="size-${pizzaId}" class="size-select" data-pizza-id="${pizzaId}"></select>
                </div>
                <div class="option-group">
                    <label for="crust-${pizzaId}">크러스트 선택:</label>
                    <select id="crust-${pizzaId}" class="crust-select" data-pizza-id="${pizzaId}"></select>
                    <p id="crust-add-text-${pizzaId}" class="crust-add-text"></p>
                </div>
            </div>

            <div class="price-area">
                <div class="current-price">총 금액: <span id="total-price-${pizzaId}">${initialPrice}</span>원</div>
                <button class="add-to-bill-btn ${isEvent ? 'one-plus-one-btn' : ''}" data-pizza-id="${pizzaId}">${isEvent ? '🎉 1+1 담기' : '🧾 계산서에 담기'}</button>
            </div>
        </div>
    `;
};


/** 1+1 장바구니에 아이템 추가 및 처리 */
const handleOnePlusOneAdd = (pizzaId, card) => {
    const pizzaData = PIZZA_MENU[pizzaId];
    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    
    // 1. L 사이즈 강제 확인 (1+1은 L 사이즈만 해당)
    if (sizeSelect.value !== 'L') {
        alert('⚠️ 1+1 이벤트는 L 사이즈 피자만 주문 가능합니다. 사이즈를 L로 변경해 주세요.');
        return;
    }
    
    // 2. 데이터 추출
    const selectedCrustValue = crustSelect.value;
    const crustOption = CRUST_OPTIONS.find(c => c.value === selectedCrustValue);
    const crustExtraPrice = getCrustExtraPrice(pizzaId, 'L', selectedCrustValue);

    const itemData = {
        id: pizzaId,
        name: pizzaData.name,
        size: 'L',
        basePrice: pizzaData.prices.L,
        crustValue: selectedCrustValue,
        crustName: crustOption ? crustOption.name.split('(')[0].trim() : '오리지널',
        crustExtraPrice: crustExtraPrice,
    };

    // 3. 중복 확인
    if (onePlusOneCart.some(p => p.id === itemData.id)) {
        alert('⚠️ 이미 선택된 피자입니다. 다른 피자를 선택해 주세요.');
        return;
    }

    // 4. 카트에 추가 및 상태 업데이트
    onePlusOneCart.push(itemData);
    updateOnePlusOneStatus(); // 버튼 상태 업데이트

    if (onePlusOneCart.length === 1) {
        alert(`✅ 파파프라이데이 1+1 - 첫 번째 피자 (${itemData.name}) 선택 완료! 이제 두 번째 피자를 선택해 주세요.`);
        
    } else if (onePlusOneCart.length === 2) {
        // 최종 계산
        const [p1, p2] = onePlusOneCart;
        const finalPrice = calculateOnePlusOnePrice(p1, p2);
        const maxBasePrice = Math.max(p1.basePrice, p2.basePrice);
        const totalCrustExtraPrice = p1.crustExtraPrice + p2.crustExtraPrice;
        
        alert(`
            🎉 파파프라이데이 1+1 주문 완료 (포장 전용, 배달 불가)

            🍕 첫 번째 피자: ${p1.name} (L / ${p1.crustName} +${formatPrice(p1.crustExtraPrice)}원)
            🍕 두 번째 피자: ${p2.name} (L / ${p2.crustName} +${formatPrice(p2.crustExtraPrice)}원)
            
            💰 계산 기준:
            - 비싼 피자 가격: ${formatPrice(maxBasePrice)}원
            - 크러스트 추가금 합계: ${formatPrice(totalCrustExtraPrice)}원
            
            💵 최종 1+1 가격: ${formatPrice(finalPrice)}원 
        `);
    }
};


// -----------------------------------------------------
// 3. 메뉴 초기화 함수 
// -----------------------------------------------------

const initializeMenu = () => {
    const container = document.getElementById('pizza-list-container');
    
    if (!container) {
        console.error("오류: ID 'pizza-list-container'를 찾을 수 없습니다.");
        return;
    }
    
    let htmlContent = '';
    
    // 1. 25가지 피자 카드 HTML을 생성합니다.
    Object.entries(PIZZA_MENU).forEach(([pizzaId, pizzaData]) => {
        // 카테고리 제목을 중간에 넣기 위한 임시 로직
        // 이 부분을 더 정교하게 만들려면 PIZZA_MENU를 카테고리별로 분리해야 합니다.
        // if (pizzaId === 'P01') htmlContent += '<h3 class="category-title">1. 프리미엄</h3>';
        // if (pizzaId === 'P05') htmlContent += '<h3 class="category-title" id="one-plus-one-pizzas">2. 베스트 & 1+1</h3>';
        // if (pizzaId === 'P11') htmlContent += '<h3 class="category-title">3. SPECIALTY & THIN</h3>';
        // if (pizzaId === 'P20') htmlContent += '<h3 class="category-title">4. CLASSIC</h3>';
        // if (pizzaId === 'P24') htmlContent += '<h3 class="category-title">5. 비건</h3>';

        htmlContent += createPizzaCardHTML(pizzaId, pizzaData);
    });
    
    // 2. HTML 컨테이너에 삽입합니다.
    container.innerHTML = htmlContent;

    // 3. 옵션 생성 및 이벤트 리스너 연결
    document.querySelectorAll('.pizza-card.menu-item').forEach(card => {
        const pizzaId = card.getAttribute('data-id');
        const pizzaData = PIZZA_MENU[pizzaId];

        if (!pizzaData) return; 

        // 사이즈/크러스트 옵션 생성
        populateSizeOptions(pizzaId, pizzaData.prices);
        populateCrustOptions(pizzaId, pizzaData.crustType);
        
        const sizeSelect = document.getElementById(`size-${pizzaId}`);
        const crustSelect = document.getElementById(`crust-${pizzaId}`);
        const addButton = card.querySelector('.add-to-bill-btn');

        // 가격 업데이트 이벤트 연결
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => { updatePrice(pizzaId); });
        }
        if (crustSelect) {
            crustSelect.addEventListener('change', () => { updatePrice(pizzaId); });
        }

        // 버튼 클릭 이벤트 연결
        if (addButton) {
            if (EVENT_PIZZA_IDS.includes(pizzaId)) {
                // 1+1 이벤트 버튼 로직 연결
                addButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleOnePlusOneAdd(pizzaId, card);
                });
            } else {
                // 일반 주문 버튼 로직 연결
                addButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedSize = sizeSelect ? sizeSelect.value : Object.keys(pizzaData.prices)[0];
                    const selectedCrustOption = crustSelect ? crustSelect.options[crustSelect.selectedIndex] : { textContent: '오리지널', value: 'original' };
                    const finalPrice = document.getElementById(`total-price-${pizzaId}`).textContent.replace(/,/g, '');
                    const pizzaName = pizzaData.name;
                    
                    alert(`
                        🧾 계산서에 추가됨:
                        - 메뉴: ${pizzaName}
                        - 사이즈: ${selectedSize}
                        - 크러스트: ${selectedCrustOption.textContent.split('(')[0].trim()}
                        - 최종 가격: ${finalPrice}원
                        
                        (⚠️ 실제 계산서 페이지로의 데이터 전송 로직이 필요합니다.)
                    `);
                });
            }
        }

        // 4. 초기 가격 설정
        updatePrice(pizzaId);
    });
};

// DOM 로드 후 메뉴 초기화 함수 실행
document.addEventListener('DOMContentLoaded', initializeMenu);