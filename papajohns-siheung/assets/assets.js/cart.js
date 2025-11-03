// assets/js/cart.js

// -----------------------------------------------------
// 1. 데이터 정의 (25가지 피자 메뉴 및 크러스트 가격)
// -----------------------------------------------------

// 1.1. 크러스트 옵션 및 사이즈별 추가금액 (고객님 제공 정보 기반)
const CRUST_OPTIONS = [
    // R 사이즈는 변경 불가 (추가금 0원)
    { value: 'original', name: '오리지널', desc: '쫄깃하고 고소한 기본에 충실한 맛', priceL: 0, priceF: 0, priceP: 0, priceR: 0 },
    // 씬(Thin)은 F 사이즈만 무료 변경, 나머지는 추가금 없음
    { value: 'thin', name: '씬 (Thin)', desc: '바삭한 식감. F 사이즈 무료 변경 가능.', priceL: 0, priceF: 0, priceP: 0, priceR: 0 }, 
    
    // 유료 크러스트 (치즈롤, 골드링, 스파이시 갈릭 치즈롤)
    { value: 'cheeseroll', name: '치즈롤', desc: '스트링 치즈의 유혹', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'goldring', name: '골드링', desc: '고구마 무스와 스트링 치즈', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'spicygarliccheeseroll', name: '스파이시 갈릭 치즈롤', desc: '진한 풍미!', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },

    // 크루아상 크러스트 (모든 사이즈 6,000원 추가, 단 R은 불가)
    { value: 'croissant', name: '크루아상', desc: '겹겹이 살아있는 바삭함', priceL: 6000, priceF: 6000, priceP: 6000, priceR: 0 },
];

// 1.2. 1+1 이벤트가 적용되는 피자 ID 목록 (7종)
const EVENT_PIZZA_IDS = ['P05', 'P06', 'P08', 'P09', 'P10', 'P15', 'P16'];
let onePlusOneCart = []; // 1+1 주문을 위한 임시 카트

// 1.3. 25가지 피자 메뉴 데이터 (최신 가격 및 옵션 타입 명시)
const PIZZA_MENU = {
    // 1. 프리미엄 (크루아상 포함 모든 옵션 가능)
    'P01': { name: '바베큐 숏립 크런치', prices: { L: 34500, F: 41900 }, crustType: 'all' },
    'P02': { name: '멜로우 콘크림', prices: { L: 27500, F: 33900, P: 41500 }, crustType: 'all' },
    'P03': { name: '스타라이트 바질', prices: { L: 33500, F: 39900, P: 48500 }, crustType: 'none' }, 
    'P04': { name: '더블 핫 앤 스파이시 멕시칸', prices: { L: 33500, F: 39900 }, crustType: 'spicygarliccheeseroll_only' }, // 스파이시갈릭치즈롤만
    
    // 2. 베스트 & 1+1 (크루아상 포함 모든 옵션 가능)
    'P05': { name: '수퍼 파파스 (BEST / 1+1)', prices: { R: 19900, L: 28500, F: 33900, P: 42500 }, crustType: 'all' },
    'P06': { name: '존스 페이버릿 (BEST / 1+1)', prices: { L: 29500, F: 34900, P: 45500 }, crustType: 'all' },
    'P07': { name: '올미트', prices: { R: 19900, L: 29500, F: 34900, P: 45500 }, crustType: 'all' },
    'P08': { name: '스파이시 치킨랜치 (1+1)', prices: { R: 19900, L: 29500, F: 34900, P: 43500 }, crustType: 'all' },
    'P09': { name: '아이리쉬 포테이토 (1+1)', prices: { R: 18900, L: 27500, F: 32900, P: 40500 }, crustType: 'all' },
    'P10': { name: '치킨 바베큐 (1+1)', prices: { R: 18900, L: 27500, F: 32900, P: 40500 }, crustType: 'all' },

    // 3. SPECIALTY&THIN
    'P11': { name: '크리스피 치즈 페퍼로니 피자', prices: { F: 31900 }, crustType: 'thin_only' }, 
    'P12': { name: '크리스피 치즈 트리플 피자', prices: { F: 33900 }, crustType: 'thin_only' },
    'P13': { name: '햄 머쉬룸 식스 치즈', prices: { L: 28500, F: 33900, P: 42500 }, crustType: 'all' },
    'P14': { name: '위스콘신 치즈 포테이토', prices: { L: 29500, F: 35900, P: 45500 }, crustType: 'no_thin' }, // 씬 제외
    'P15': { name: '더블 치즈버거 (1+1)', prices: { L: 29500, F: 34900, P: 43500 }, crustType: 'all' },
    'P16': { name: '프리미엄 직화불고기 (1+1)', prices: { L: 29500, F: 34900, P: 43500 }, crustType: 'all' },
    'P17': { name: '식스 치즈', prices: { L: 26500, F: 31900, P: 39500 }, crustType: 'all' },
    'P18': { name: '스파이시 이탈리안', prices: { L: 27500, F: 33900, P: 40500 }, crustType: 'all' },
    'P19': { name: '슈림프 알프레도', prices: { F: 34900 }, crustType: 'thin_only' }, 

    // 4. CLASSIC 
    'P20': { name: '마가리타', prices: { R: 16900, L: 23500, F: 28900, P: 36500 }, crustType: 'all' },
    'P21': { name: '페퍼로니', prices: { R: 17900, L: 25500, F: 30900, P: 38500 }, crustType: 'all' },
    'P22': { name: '하와이안', prices: { R: 17900, L: 26500, F: 32900, P: 39500 }, crustType: 'all' },
    'P23': { name: '가든 스페셜', prices: { R: 17900, L: 26500, F: 31900, P: 39500 }, crustType: 'all' },

    // 5. 비건 (R(31cm)은 L로 통일하여 반영)
    'P24': { name: '그린잇 식물성 마가리타', prices: { L: 26500 }, crustType: 'none' },
    'P25': { name: '그린잇 식물성 가든스페셜', prices: { L: 29500 }, crustType: 'none' } 
};


// -----------------------------------------------------
// 2. 핵심 로직 함수들 (이전과 동일하나, 가격 로직 수정)
// -----------------------------------------------------

// 가격 포맷 함수
const formatPrice = (price) => price.toLocaleString('ko-KR');

// 크러스트 추가 금액 계산 함수 (R 사이즈 변경 불가 및 씬 F 무료 로직 포함)
const getCrustExtraPrice = (pizzaId, size, crustValue) => {
    const crust = CRUST_OPTIONS.find(c => c.value === crustValue);
    if (!crust) return 0;
    
    // R 사이즈는 크러스트 변경 불가, 무조건 추가금 0원
    if (size === 'R') return 0;
    
    // 씬 크러스트는 F 사이즈에서만 무료 변경, 그 외에는 0원 (크러스트를 얇게 변경하는 것이므로 추가금 없음)
    if (crustValue === 'thin') {
        return 0;
    }
    
    // 유료 크러스트 (치즈롤, 골드링, 스파이시, 크루아상)
    const sizeCode = size === 'L' ? 'L' : size === 'F' ? 'F' : size === 'P' ? 'P' : null;
    if (sizeCode && crust[`price${sizeCode}`] !== undefined) {
        return crust[`price${sizeCode}`];
    }
    return 0;
};

// 1+1 최종 가격 계산 로직 (비싼 피자 가격 + 크러스트 추가금 합계)
const calculateOnePlusOnePrice = (p1, p2) => {
    const maxBasePrice = Math.max(p1.basePrice, p2.basePrice);
    const totalCrustExtraPrice = p1.crustExtraPrice + p2.crustExtraPrice;
    return maxBasePrice + totalCrustExtraPrice;
};

// 현재 선택된 옵션 기반으로 가격을 업데이트하는 함수
const updatePrice = (pizzaId) => {
    const pizzaData = PIZZA_MENU[pizzaId];
    if (!pizzaData) return;

    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    const priceSpan = document.getElementById(`total-price-${pizzaId}`);
    const crustAddText = document.getElementById(`crust-add-text-${pizzaId}`);
    
    // 필수 요소가 없으면 종료
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
        crustSelect.style.display = 'block';
    }
    
    // 크러스트 추가금 텍스트 업데이트
    if (crustExtraPrice > 0) {
        crustAddText.textContent = `(크러스트 추가금: +${formatPrice(crustExtraPrice)}원)`;
        crustAddText.style.color = '#d9534f'; 
    } else if (selectedCrust === 'thin' && selectedSize === 'F') {
        crustAddText.textContent = `(씬 크러스트 - F 사이즈 무료 변경)`;
        crustAddText.style.color = '#46b8da'; 
    } else if (selectedSize === 'R') {
        crustAddText.textContent = `(R 사이즈는 크러스트 변경 불가)`;
        crustAddText.style.color = '#888';
    } else {
        crustAddText.textContent = '';
    }

    const totalPrice = basePrice + crustExtraPrice;
    priceSpan.textContent = formatPrice(totalPrice);
};


// 사이즈 옵션을 동적으로 생성하는 함수
const populateSizeOptions = (pizzaId, prices) => {
    const select = document.getElementById(`size-${pizzaId}`);
    if (!select) return;

    // 옵션 초기화
    select.innerHTML = ''; 
    
    Object.entries(prices).forEach(([size, price]) => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size} (${size === 'R' ? '23cm' : size === 'L' ? '31cm' : size === 'F' ? '36cm' : '41cm'}) - ${formatPrice(price)}원`;
        select.appendChild(option);
    });
};

// 크러스트 옵션을 동적으로 생성하는 함수
const populateCrustOptions = (pizzaId, crustType) => {
    const select = document.getElementById(`crust-${pizzaId}`);
    if (!select) return;

    // 옵션 초기화
    select.innerHTML = ''; 
    
    // 크러스트 선택이 없는 경우 (P03, P24, P25)
    if (crustType === 'none') {
        // 옵션이 없음을 명시
        const option = document.createElement('option');
        option.value = 'none';
        option.textContent = '크러스트 변경 불가';
        select.appendChild(option);
        return;
    }
    
    // 필터링된 크러스트 목록을 생성
    let availableCrusts = [];

    if (crustType === 'all') {
        // 모든 유효 크러스트 (씬, 치즈롤, 골드링, 스파이시, 크루아상) + 오리지널
        availableCrusts = CRUST_OPTIONS;
    } else if (crustType === 'no_thin') {
        // 씬 제외 (오리지널, 치즈롤, 골드링, 스파이시, 크루아상)
        availableCrusts = CRUST_OPTIONS.filter(c => c.value !== 'thin');
    } else if (crustType === 'spicygarliccheeseroll_only') {
        // 스파이시 갈릭 치즈롤만 + 오리지널
        availableCrusts = CRUST_OPTIONS.filter(c => c.value === 'original' || c.value === 'spicygarliccheeseroll');
    } else if (crustType === 'thin_only') {
        // 씬 크러스트만
        availableCrusts = CRUST_OPTIONS.filter(c => c.value === 'thin');
    } else {
         // 기본적으로 오리지널만 허용 (안전 장치)
         availableCrusts = CRUST_OPTIONS.filter(c => c.value === 'original');
    }


    // 옵션 생성
    availableCrusts.forEach(crust => {
        const option = document.createElement('option');
        option.value = crust.value;
        
        let priceText = '';
        if (crust.value === 'thin') {
             priceText = '(F 사이즈 무료)';
        } else if (crust.value !== 'original') {
            priceText = `(+${formatPrice(crust.priceL)}~${formatPrice(crust.priceP)}원)`;
        } 
        
        option.textContent = `${crust.name} ${priceText}`;
        select.appendChild(option);
    });
    
    // 기본값 설정
    if (crustType === 'thin_only') {
        select.value = 'thin';
    } else {
         select.value = 'original'; 
    }
};


// 1+1 장바구니에 아이템 추가 및 처리
const handleOnePlusOneAdd = (pizzaId, card) => {
    const pizzaData = PIZZA_MENU[pizzaId];
    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    
    // 1. L 사이즈 강제 확인 (1+1은 L 사이즈만 해당)
    if (sizeSelect.value !== 'L') {
        alert('⚠️ 1+1 이벤트는 L 사이즈 피자만 주문 가능합니다. 사이즈를 L로 변경해 주세요.');
        return;
    }
    
    // 2. 크러스트 데이터 추출
    const selectedCrustValue = crustSelect.value;
    const crustOption = CRUST_OPTIONS.find(c => c.value === selectedCrustValue);
    const crustExtraPrice = getCrustExtraPrice(pizzaId, 'L', selectedCrustValue);

    const itemData = {
        id: pizzaId,
        name: pizzaData.name,
        basePrice: pizzaData.prices.L,
        crustValue: selectedCrustValue,
        crustName: crustOption ? crustOption.name.split('(')[0].trim() : '오리지널', // 이름 정리
        crustExtraPrice: crustExtraPrice,
    };

    // 3. 중복 확인
    if (onePlusOneCart.some(p => p.id === itemData.id)) {
        alert('⚠️ 이미 선택된 피자입니다. 다른 피자를 선택해 주세요.');
        return;
    }

    // 4. 카트에 추가 및 처리
    onePlusOneCart.push(itemData);

    const button = card.querySelector('.add-to-bill-btn');

    if (onePlusOneCart.length === 1) {
        alert(`✅ 파파프라이데이 1+1 - 첫 번째 피자 (${itemData.name}) 선택 완료! 이제 두 번째 피자를 선택해 주세요.`);
        button.textContent = '✅ 선택됨 (두 번째 선택 대기)';
        button.disabled = true; // 선택된 피자는 다시 못 누르게
        
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
        
        // 주문 완료 후 카트 및 버튼 초기화
        onePlusOneCart = [];
        document.querySelectorAll('.one-plus-one-btn').forEach(btn => {
            btn.textContent = '🎉 1+1 담기';
            btn.disabled = false; // 버튼 다시 활성화
        });
    }
};


// 메뉴 초기화 함수
const initializeMenu = () => {
    // 1. 모든 피자 카드에 대해 옵션 생성 및 이벤트 리스너 추가
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

        // 2. 가격 업데이트 이벤트 연결
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => { updatePrice(pizzaId); });
        }
        if (crustSelect) {
            crustSelect.addEventListener('change', () => { updatePrice(pizzaId); });
        }

        // 3. 버튼 클릭 이벤트 연결
        if (addButton) {
             if (EVENT_PIZZA_IDS.includes(pizzaId)) {
                // 1+1 이벤트 버튼
                addButton.classList.add('one-plus-one-btn'); // CSS/로직 구분을 위해 클래스 추가
                addButton.textContent = '🎉 1+1 담기';
                addButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleOnePlusOneAdd(pizzaId, card);
                });
            } else {
                // 일반 주문 버튼
                addButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedSize = sizeSelect ? sizeSelect.value : Object.keys(pizzaData.prices)[0];
                    const selectedCrustOption = crustSelect ? crustSelect.options[crustSelect.selectedIndex] : { textContent: '오리지널', value: 'original' };
                    const finalPrice = document.getElementById(`total-price-${pizzaId}`).textContent.replace(/,/g, '');
                    const pizzaName = card.getAttribute('data-name');
                    
                    alert(`
                        🧾 계산서에 추가됨:
                        - 메뉴: ${pizzaName}
                        - 사이즈: ${selectedSize}
                        - 크러스트: ${selectedCrustOption.textContent.split('(')[0].trim()}
                        - 최종 가격: ${finalPrice}원
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