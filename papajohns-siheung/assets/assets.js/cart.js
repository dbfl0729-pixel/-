// assets/js/cart.js

// -----------------------------------------------------
// 1. 데이터 정의 (고객님이 제공해주신 최신 정보 반영)
// -----------------------------------------------------

// 1.1. 크러스트 옵션 및 사이즈별 추가금액
// R 사이즈는 변경 불가 (추가금 0원, JS 로직에서 옵션 제거 처리)
// 씬(Thin)은 F 사이즈 무료 변경 외에는 모두 추가금 0원 (기본 도우와 동일)
const CRUST_OPTIONS = [
    { value: 'original', name: '오리지널', desc: '쫄깃하고 고소한 기본에 충실한 맛', priceL: 0, priceF: 0, priceP: 0, priceR: 0 },
    { value: 'thin', name: '씬 (Thin)', desc: '바삭한 식감. F 사이즈 무료 변경 가능.', priceL: 0, priceF: 0, priceP: 0, priceR: 0 },
    { value: 'cheeseroll', name: '치즈롤', desc: '짭조름한 체다치즈가 뿌려진 크러스트 속 스트링 치즈의 유혹', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'goldring', name: '골드링', desc: '달콤한 고구마 무스와 스트링 치즈의 환상적인 만남', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'spicygarliccheeseroll', name: '스파이시 갈릭 치즈롤', desc: '풍부한 갈릭 향과 투 블렌드 치즈, 레드페퍼를 사용한 진한 풍미!', priceL: 4000, priceF: 5000, priceP: 6000, priceR: 0 },
    { value: 'croissant', name: '크루아상', desc: '겹겹이 살아있는 바삭함 버터풍미로 완성', priceL: 6000, priceF: 6000, priceP: 6000, priceR: 0 },
];

// 1.2. 1+1 이벤트 대상 피자 ID 목록 (7종)
const EVENT_PIZZA_IDS = ['P05', 'P06', 'P08', 'P09', 'P10', 'P15', 'P16'];

// 1.3. 전체 피자 메뉴 (25종)
const PIZZA_MENU = [
    { id: 'P01', name: '바베큐 숏립 크런치', category: 'Premium', desc: '한 판 가득 소갈비, 오리지널 아메리칸 BBQ! 치즈와 바삭한 식감까지 더한 리얼 고기 피자', toppings: '바베큐 소스, 소갈비살, 3블랜드 치즈, 감자후레이크, 양파', prices: { L: 34500, F: 41900 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P02', name: '멜로우 콘크림', category: 'Premium', desc: '부드러운 옥수수크림과 콘&파인애플을 더한 달콤한 피자', toppings: '갈릭 랜치 소스, 파인애플, 콘, 양파, 체다 치즈, 포테이토', prices: { L: 27500, F: 33900, P: 41500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P03', name: '스타라이트 바질', category: 'Premium', desc: '입안 가득 바질의 향긋함과 고소한 치즈의 풍미가 느껴지는 특별한 별모양 피자', toppings: '베이컨, 양송이버섯, 치즈, 햄, 토마토, 바질마요 소스, 갈릭 소스, 스트링 치즈', prices: { L: 33500, F: 39900, P: 48500 }, event: false, availableCrusts: ['original'] }, // 크러스트 선택 없음 -> 오리지널 기본
    { id: 'P04', name: '더블 핫 앤 스파이시 멕시칸', category: 'Premium', desc: '새로운 맛의 스파이시 갈릭 치즈롤과 할라페뇨의 만남으로 강렬한 매콤함', toppings: '토마토 소스, 비프, 피망, 양파, 토마토, 블랙올리브, 할라페뇨, 모짜렐라 치즈', prices: { L: 33500, F: 39900 }, event: false, availableCrusts: ['original', 'spicygarliccheeseroll'] }, // 스파이시갈릭치즈롤 선택가능 -> 오리지널 포함
    { id: 'P05', name: '수퍼 파파스 (BEST)', category: 'BEST', desc: '신선한 토마토 소스 위에 각종 고기와 채소가 듬뿍 토핑된 파파존스의 베스트 피자', toppings: '토마토 소스, 모짜렐라 치즈, 이탈리안 소시지, 양파, 청피망, 양송이, 블랙 올리브, 햄, 페퍼로니', prices: { R: 19900, L: 28500, F: 33900, P: 42500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P06', name: '존스 페이버릿 (BEST)', category: 'BEST', desc: '이탈리안 소시지, 페퍼로니와 6종의 치즈가 만들어 내는 진한 풍미의 베스트 셀러', toppings: '토마토 소스, 6종 치즈, 이탈리안 소시지, 페퍼로니, 이탈리안 허브', prices: { L: 29500, F: 34900, P: 45500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P07', name: '올미트', category: 'Signature', desc: '페퍼로니, 햄, 이탈리안 소시지, 비프토핑까지 꽉 채운 환상의 미트 피자', toppings: '토마토 소스, 모짜렐라 치즈, 이탈리안 소시지, 베이컨, 비프, 햄, 페퍼로니', prices: { R: 19900, L: 29500, F: 34900, P: 45500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P08', name: '스파이시 치킨랜치', category: 'Signature', desc: '랜치 소스, 그릴드 치킨, 상큼한 토마토와 할라페뇨가 토핑된 피자', toppings: '갈릭 랜치 소스, 모짜렐라 치즈, 그릴드 치킨, 베이컨, 토마토, 할라페뇨', prices: { R: 19900, L: 29500, F: 34900, P: 43500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P09', name: '아이리쉬 포테이토', category: 'Signature', desc: '진한 갈릭 소스와 담백한 포테이토 청크의 조화로 사랑 받는 베스트 셀러', toppings: '토마토 소스, 모짜렐라 치즈, 포테이토, 베이컨, 양송이, 콘, 양파, 갈릭 소스', prices: { R: 18900, L: 27500, F: 32900, P: 40500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P10', name: '치킨 바베큐', category: 'Signature', desc: '새콤달콤한 타바스코 BBQ 소스와 두툼한 그릴드 치킨이 어우러진 특별한 맛', toppings: '토마토 소스, 모짜렐라 치즈, 그릴드 치킨, 베이컨, 양파, 타바스코 BBQ 소스', prices: { R: 18900, L: 27500, F: 32900, P: 40500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P11', name: '크리스피 치즈 페퍼로니 피자', category: 'Specialty/THIN', desc: '씬도우 바닥에 파마산+로마노 치즈가 더해져 더욱 바삭함과 고소한 풍미', toppings: '2블랜드 치즈(파마산, 로마노), 토마토 소스, 모짜렐라 치즈, 페퍼로니', prices: { F: 31900 }, event: false, availableCrusts: ['original'] }, // TH전용 -> 오리지널 기본
    { id: 'P12', name: '크리스피 치즈 트리플 피자', category: 'Specialty/THIN', desc: '바삭한 식감의 투치즈 크러스트 엣지에 알프레도 소스, 6가지 치즈의 조화', toppings: '2블랜드 치즈, 토마토 소스, 알프레도 소스, 모짜렐라 치즈, 스트링 치즈, 이탈리안 허브 시즈닝', prices: { F: 33900 }, event: false, availableCrusts: ['original'] }, // TH전용 -> 오리지널 기본
    { id: 'P13', name: '햄 머쉬룸 식스 치즈', category: 'Specialty', desc: '부드럽고 진한 알프레도 소스, 양송이 버섯, 햄이 6가지 치즈와 조화', toppings: '알프레도소스, 양송이버섯, 양파, 햄, 치즈, 2블랜드 치즈, 3블랜드 치즈, 후추', prices: { L: 28500, F: 33900, P: 42500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P14', name: '위스콘신 치즈 포테이토', category: 'Specialty', desc: '맥앤치즈 베이스 소스에 6가지 치즈, 햄, 베이컨, 페퍼로니, 포테이토의 깊은 맛', toppings: '맥앤치즈 소스, 5종 치즈, 베이컨, 햄, 페퍼로니, 포테이토, 토마토', prices: { L: 29500, F: 35900, P: 45500 }, event: false, availableCrusts: ['original', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] }, // 씬 제외
    { id: 'P15', name: '더블 치즈버거', category: 'Specialty', desc: '제스티 버거 소스위에 비프와 상큼한 토마토, 피클이 어우진 풍부한 맛', toppings: '제스티 버거 소스, 모짜렐라 치즈, 비프, 토마토, 피클', prices: { L: 29500, F: 34900, P: 43500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P16', name: '프리미엄 직화불고기', category: 'Specialty', desc: '정통 직화 불고기, 신선한 채소 토핑으로 누구나 좋아할수 있는 스테디 셀러', toppings: '불고기 소스, 모짜렐라 치즈, 표고, 청피망, 양파, 불고기', prices: { L: 29500, F: 34900, P: 43500 }, event: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P17', name: '식스 치즈', category: 'Specialty', desc: '모짜렐라, 로마노, 파마산, 아시아고, 폰티나, 프로볼로네 6종의 치즈 맛을 풍부하게 느낄 수 있는 정통 치즈피자', toppings: '토마토 소스, 6종 치즈, 이탈리안 허브', prices: { L: 26500, F: 31900, P: 39500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P18', name: '스파이시 이탈리안', category: 'Specialty', desc: '이탈리안 소시지의 두툼한 식감과 크러쉬드 레드페퍼의 매운맛이 어우러진 피자', toppings: '토마토 소스, 모짜렐라 치즈, 이탈리안 소시지, 페퍼로니, 크러쉬드 레드페퍼', prices: { L: 27500, F: 33900, P: 40500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P19', name: '슈림프 알프레도', category: 'Specialty/THIN', desc: '얇고 바삭한 씬도우 위에 부드러운 알프레도 소스와 탱탱한 새우가 만들어내는 풍부한 맛', toppings: '알프레도 소스, 모짜렐라 치즈, 새우, 토마토, 피클, 그릴드 치킨, 양송이', prices: { F: 34900 }, event: false, availableCrusts: ['original'] }, // TH전용 -> 오리지널 기본
    { id: 'P20', name: '마가리타', category: 'Classic', desc: '파파존스 특유의 진한 토마토 소스와 최상급 모짜렐라 치즈가 토핑된 치즈피자', toppings: '토마토 소스, 모짜렐라 치즈', prices: { R: 16900, L: 23500, F: 28900, P: 36500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P21', name: '페퍼로니', category: 'Classic', desc: '쫄깃쫄깃 짭조름한 페퍼로니와 고소한 치즈가 토핑된 피자', toppings: '토마토 소스, 모짜렐라 치즈, 페퍼로니', prices: { R: 17900, L: 25500, F: 30900, P: 38500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P22', name: '하와이안', category: 'Classic', desc: '새콤달콤한 파인애플과 햄, 쫀득한 모짜렐라 치즈 토핑으로 상큼한 맛', toppings: '토마토 소스, 모짜렐라 치즈, 파인애플, 햄', prices: { R: 17900, L: 26500, F: 32900, P: 39500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P23', name: '가든 스페셜', category: 'Classic', desc: '양송이, 청피망, 올리브, 양파, 토마토등의 신선한채소가 토핑된 피자', toppings: '토마토 소스, 모짜렐라 치즈, 양송이, 청피망, 양파, 블랙 올리브, 토마토', prices: { R: 17900, L: 26500, F: 31900, P: 39500 }, event: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    { id: 'P24', name: '그린잇 식물성 마가리타', category: 'Vegan/Greenit', desc: '전통있는 SHEESE사의 비건치즈와 신선한 토마토 소스의 만남으로 깔끔한 풍미', toppings: '비건치즈, 토마토 소스', prices: { L: 26500 }, event: false, availableCrusts: ['original'] }, // 크러스트 선택 없음 -> 오리지널 기본
    { id: 'P25', name: '그린잇 식물성 가든스페셜', category: 'Vegan/Greenit', desc: '전통있는 SHEESE사의 비건치즈와 신선한 채소가 어우러진 처음 맛보는 웰빙 채식 피자', toppings: '토마토 소스, 비건 치즈, 양송이, 청피망, 양파, 블랙 올리브, 토마토', prices: { L: 29500 }, event: false, availableCrusts: ['original'] }, // 크러스트 선택 없음 -> 오리지널 기본
];


// -----------------------------------------------------
// 2. 유틸리티 함수
// -----------------------------------------------------

/** 가격 포맷 (1000단위 콤마) */
const formatPrice = (price) => price.toLocaleString('ko-KR');

/** 현재 요일이 금요일인지 확인 (파파스데이 이벤트 체크) */
const isFriday = () => {
    // 실제 환경에서는 new Date().getDay()가 사용됨 (0: 일, 5: 금)
    // 테스트를 위해 임의로 금요일로 설정 가능
    // return true; // 테스트용: 항상 금요일로 설정
    return new Date().getDay() === 5; // 5가 금요일
};


// -----------------------------------------------------
// 3. 가격 계산 로직
// -----------------------------------------------------

/**
 * 일반 주문 시 최종 가격을 계산합니다.
 * @param {string} pizzaId 피자 ID
 * @param {string} size 선택된 사이즈 코드 ('R', 'L', 'F', 'P')
 * @param {string} crustValue 선택된 크러스트 값 ('original', 'cheeseroll', 등)
 * @returns {{ totalPrice: number, crustExtraPrice: number, basePrice: number, crustName: string }}
 */
const calculatePrice = (pizzaId, size, crustValue) => {
    const pizza = PIZZA_MENU.find(p => p.id === pizzaId);
    if (!pizza) return { totalPrice: 0, crustExtraPrice: 0, basePrice: 0, crustName: '' };

    const basePrice = pizza.prices[size] || 0;

    let crustExtraPrice = 0;
    let crustName = '오리지널';
    const crustOption = CRUST_OPTIONS.find(c => c.value === crustValue);

    if (crustOption) {
        // 1. 크러스트 기본 추가금 적용
        if (size === 'R') {
            // R 사이즈는 크러스트 변경 불가
            crustExtraPrice = 0;
            crustName = '오리지널';
        } else {
            // 사이즈에 맞는 크러스트 추가금 적용
            crustExtraPrice = crustOption[`price${size}`] || 0;
            crustName = crustOption.name.split('(')[0].trim();
        }
    }

    const totalPrice = basePrice + crustExtraPrice;

    return { totalPrice, crustExtraPrice, basePrice, crustName };
};


/**
 * 1+1 (파파스데이) 행사 가격을 계산합니다. (L 사이즈 고정)
 * @param {object} p1 첫 번째 피자 데이터 ({id, name, basePrice, crustValue, crustName, crustExtraPrice})
 * @param {object} p2 두 번째 피자 데이터
 * @returns {number} 최종 1+1 가격
 */
const calculateOnePlusOnePrice = (p1, p2) => {
    // 1+1 행사 규칙: 두 피자 중 더 비싼 피자의 L 사이즈 기본 가격 + 두 피자의 크러스트 추가금 합계
    const maxBasePrice = Math.max(p1.basePrice, p2.basePrice);
    const totalCrustExtraPrice = p1.crustExtraPrice + p2.crustExtraPrice;
    
    return maxBasePrice + totalCrustExtraPrice;
};


// -----------------------------------------------------
// 4. HTML 동적 생성 및 이벤트 핸들링
// -----------------------------------------------------

/** 메뉴 목록을 HTML에 렌더링 */
const renderMenu = () => {
    const menuList = document.getElementById('pizza-menu-list');
    if (!menuList) return;

    PIZZA_MENU.forEach(pizza => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.setAttribute('data-id', pizza.id);
        card.setAttribute('data-name', pizza.name);
        card.setAttribute('data-event', pizza.event);

        // 사이즈 옵션 생성
        const sizeOptionsHtml = Object.keys(pizza.prices).map(sizeCode => 
            `<option value="${sizeCode}">${sizeCode} (${formatPrice(pizza.prices[sizeCode])}원)</option>`
        ).join('');
        
        // 크러스트 옵션 생성
        let crustOptionsHtml = '';
        if (pizza.availableCrusts.length > 1) { // 오리지널만 있거나 크러스트 선택 없음으로 처리된 경우 제외
             crustOptionsHtml = CRUST_OPTIONS
                .filter(c => pizza.availableCrusts.includes(c.value)) // 메뉴별 선택 가능한 크러스트 필터링
                .map(crust => {
                    const extraPrice = crust[`price${Object.keys(pizza.prices)[0]}`] || 0; // 초기 선택된 사이즈의 추가금 (표시용)
                    return `<option value="${crust.value}" data-desc="${crust.desc}">
                                ${crust.name.split('(')[0].trim()} (${extraPrice > 0 ? '+' + formatPrice(extraPrice) + '원' : '추가금 없음'})
                            </option>`;
                }).join('');
        } else {
            crustOptionsHtml = `<option value="original">오리지널 (변경 불가)</option>`;
        }
       
        // HTML 템플릿
        card.innerHTML = `
            <div class="menu-header">
                <h3>${pizza.name}</h3>
                ${pizza.event ? '<span class="event-badge">1+1 행사</span>' : ''}
            </div>
            <p class="menu-desc">${pizza.desc}</p>
            <p class="menu-toppings"><strong>기본토핑:</strong> ${pizza.toppings}</p>

            <div class="options-group">
                <label for="size-${pizza.id}">사이즈 및 기본 가격</label>
                <select id="size-${pizza.id}" class="size-select">
                    ${sizeOptionsHtml}
                </select>
            </div>
            
            <div class="options-group">
                <label for="crust-${pizza.id}">크러스트 옵션</label>
                <select id="crust-${pizza.id}" class="crust-select" ${pizza.availableCrusts.length <= 1 ? 'disabled' : ''}>
                    ${crustOptionsHtml}
                </select>
                <p class="crust-desc" id="crust-desc-${pizza.id}">
                    ${CRUST_OPTIONS.find(c => c.value === (pizza.availableCrusts[0] || 'original')).desc}
                </p>
            </div>
            
            <div class="price-area">
                <div class="current-price" id="total-price-${pizza.id}">0원 <small>(+0원)</small></div>
                <div class="price-breakdown" id="price-breakdown-${pizza.id}"></div>
                <button class="add-to-cart-btn" data-id="${pizza.id}">장바구니에 추가</button>
            </div>
        `;

        menuList.appendChild(card);
    });

    // 5. 이벤트 리스너 등록
    document.querySelectorAll('.menu-item').forEach(card => {
        const pizzaId = card.getAttribute('data-id');
        const isEventPizza = card.getAttribute('data-event') === 'true';

        const sizeSelect = document.getElementById(`size-${pizzaId}`);
        const crustSelect = document.getElementById(`crust-${pizzaId}`);
        const totalPriceEl = document.getElementById(`total-price-${pizzaId}`);
        const breakdownEl = document.getElementById(`price-breakdown-${pizzaId}`);
        const descEl = document.getElementById(`crust-desc-${pizzaId}`);
        const addButton = card.querySelector('.add-to-cart-btn');

        /** 가격 업데이트 및 UI 반영 함수 */
        const updatePrice = () => {
            const selectedSize = sizeSelect ? sizeSelect.value : (Object.keys(PIZZA_MENU.find(p => p.id === pizzaId).prices)[0] || 'L');
            const selectedCrustValue = crustSelect ? crustSelect.value : 'original';
            const { totalPrice, crustExtraPrice, basePrice, crustName } = calculatePrice(pizzaId, selectedSize, selectedCrustValue);

            // 1. 크러스트 옵션 설명 업데이트
            if (descEl) {
                 const selectedOption = CRUST_OPTIONS.find(c => c.value === selectedCrustValue);
                 descEl.textContent = selectedOption ? selectedOption.desc : '';
            }
            
            // 2. R 사이즈 크러스트 변경 불가 처리
            if (sizeSelect && crustSelect) {
                const isRSize = selectedSize === 'R';
                const isCrustAvailable = PIZZA_MENU.find(p => p.id === pizzaId).availableCrusts.length > 1;

                if (isRSize || !isCrustAvailable) {
                    crustSelect.value = 'original'; // R사이즈는 오리지널로 강제
                    crustSelect.disabled = true;
                    // R사이즈 크러스트 추가금은 0원임을 명확히 표시
                    breakdownEl.innerHTML = `
                        <p>기본 가격 (${selectedSize}): ${formatPrice(basePrice)}원</p>
                        ${isRSize ? '<p style="color: red;">R 사이즈는 크러스트 변경 불가</p>' : ''}
                        <strong>총 가격: ${formatPrice(totalPrice)}원</strong>
                    `;
                } else {
                    crustSelect.disabled = false;
                    const crustOption = CRUST_OPTIONS.find(c => c.value === selectedCrustValue);
                    const crustExtraPriceDisplay = crustOption[`price${selectedSize}`] || 0;
                     breakdownEl.innerHTML = `
                        <p>기본 가격 (${selectedSize}): ${formatPrice(basePrice)}원</p>
                        <p>+ 크러스트 추가금 (${crustName}): +${formatPrice(crustExtraPriceDisplay)}원</p>
                        <strong>총 가격: ${formatPrice(totalPrice)}원</strong>
                    `;
                }
            }


            // 3. 최종 가격 표시
            totalPriceEl.innerHTML = `${formatPrice(totalPrice)}원 <small>(${crustName} +${formatPrice(crustExtraPrice)}원)</small>`;

            // 4. 장바구니 버튼에 데이터 저장 (1+1 처리용)
            addButton.setAttribute('data-baseprice', basePrice);
            addButton.setAttribute('data-crustvalue', selectedCrustValue);
            addButton.setAttribute('data-crustname', crustName);
            addButton.setAttribute('data-crustextraprice', crustExtraPrice);
            addButton.setAttribute('data-size', selectedSize);
        };
        
        // 이벤트 리스너: 사이즈 또는 크러스트 변경 시 가격 업데이트
        if (sizeSelect) sizeSelect.addEventListener('change', updatePrice);
        if (crustSelect) crustSelect.addEventListener('change', updatePrice);

        // 장바구니 추가 버튼 클릭 이벤트 (1+1 처리 포함)
        if (addButton) {
            addButton.addEventListener('click', () => {
                const basePrice = parseInt(addButton.getAttribute('data-baseprice'));
                const crustExtraPrice = parseInt(addButton.getAttribute('data-crustextraprice'));
                
                // 장바구니 데이터 객체 구성
                const itemData = {
                    id: pizzaId,
                    name: card.getAttribute('data-name'),
                    size: addButton.getAttribute('data-size'),
                    crustValue: addButton.getAttribute('data-crustvalue'),
                    crustName: addButton.getAttribute('data-crustname'),
                    basePrice: basePrice,
                    crustExtraPrice: crustExtraPrice,
                    totalPrice: basePrice + crustExtraPrice,
                    isEventTarget: isEventPizza
                };
                
                // 1+1 (파파스데이) 처리
                if (isFriday() && isEventPizza) {
                    handleOnePlusOneOrder(itemData);
                } else {
                    alert(`
                        🛒 장바구니에 추가됨:
                        - 메뉴: ${itemData.name} (${itemData.size} / ${itemData.crustName})
                        - 최종 가격: ${formatPrice(itemData.totalPrice)}원
                        (⚠️ 1+1 이벤트는 금요일, 대상 피자에만 적용됩니다.)
                    `);
                    // 실제 장바구니 로직 호출 (생략)
                }
            });
        }

        // 초기 가격 설정
        updatePrice();
    });
};


// -----------------------------------------------------
// 5. 1+1 (파파스데이) 주문 처리 로직
// -----------------------------------------------------

// 1+1 임시 카트 (L 사이즈 고정)
let onePlusOneCart = [];

/**
 * 1+1 피자 선택 및 최종 계산을 처리합니다.
 * @param {object} itemData 선택된 피자 정보
 */
const handleOnePlusOneOrder = (itemData) => {
    
    // 1+1은 L사이즈만 가능
    if (itemData.size !== 'L') {
        alert('⚠️ 파파스데이 1+1 이벤트는 L 사이즈 피자만 주문 가능합니다. 사이즈를 L로 변경해 주세요.');
        return;
    }

    // 1+1 카트에 추가
    onePlusOneCart.push(itemData);

    if (onePlusOneCart.length === 1) {
        // 첫 번째 피자 선택 완료
        alert(`✅ 파파스데이 1+1 - 첫 번째 피자 (${itemData.name}) 선택 완료! 이제 두 번째 피자를 선택해 주세요.`);
        
    } else if (onePlusOneCart.length === 2) {
        // 두 번째 피자 선택 완료, 최종 계산
        const [p1, p2] = onePlusOneCart;
        const finalPrice = calculateOnePlusOnePrice(p1, p2);
        
        // 계산 근거
        const maxBasePrice = Math.max(p1.basePrice, p2.basePrice);
        const totalCrustExtraPrice = p1.crustExtraPrice + p2.crustExtraPrice;

        alert(`
            🎉 파파스데이 1+1 주문 완료 (포장 전용, 배달 불가)

            🍕 첫 번째 피자: ${p1.name} (L / ${p1.crustName} +${formatPrice(p1.crustExtraPrice)}원)
            🍕 두 번째 피자: ${p2.name} (L / ${p2.crustName} +${formatPrice(p2.crustExtraPrice)}원)
            
            ------------------------------------------------
            💰 계산 기준:
            - 비싼 피자 가격 (L): ${formatPrice(maxBasePrice)}원
            - 크러스트 추가금 합계: +${formatPrice(totalCrustExtraPrice)}원
            
            💵 최종 1+1 가격: ${formatPrice(finalPrice)}원
            (일반가 대비 큰 할인 혜택이 적용되었습니다!)
        `);
        
        // 주문 완료 후 카트 초기화
        onePlusOneCart = [];
        // 실제 장바구니/결제 로직 호출 (생략)
    }
};