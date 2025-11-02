// assets/js/cart.js

// 1+1 이벤트가 적용되는 피자 ID 목록 (7종)
const EVENT_PIZZA_IDS = ['P05', 'P06', 'P08', 'P09', 'P10', 'P15', 'P16'];

// 크러스트 정보 (가격은 L/F/P 순서)
const CRUST_OPTIONS = [
    { value: 'original', name: '오리지널 크러스트 (추가금 없음)', desc: '쫄깃하고 고소한 기본에 충실한 맛', priceL: 0, priceF: 0, priceP: 0 },
    { value: 'thin', name: '씬 (Thin) (F 사이즈 무료 변경)', desc: '바삭한 식감, 풍부한 토핑을 더욱 맛보고 싶다면!', priceL: 0, priceF: 0, priceP: 0 },
    { value: 'cheeseroll', name: '치즈롤 (추가금 발생)', desc: '짭조름한 체다치즈가 뿌려진 크러스트 속 스트링 치즈의 유혹', priceL: 4000, priceF: 5000, priceP: 6000 },
    { value: 'goldring', name: '골드링 (추가금 발생)', desc: '달콤한 고구마 무스와 스트링 치즈의 환상적인 만남', priceL: 4000, priceF: 5000, priceP: 6000 },
    { value: 'spicygarliccheeseroll', name: '스파이시 갈릭 치즈롤 (추가금 발생)', desc: '풍부한 갈릭 향과 투 블랜드 치즈, 레드페퍼를 사용한 진한 풍미', priceL: 4000, priceF: 5000, priceP: 6000 },
    { value: 'croissant', name: '크루아상 (P 사이즈만 추가금 발생)', desc: '겹겹이 살아있는 바삭함 버터풍미로 완성된 도우 끝까지 완벽한 맛', priceL: 0, priceF: 0, priceP: 6000 }
];

// 피자 전체 메뉴 데이터 (25종) - 고객님께서 제공해주신 정보 기반
const MENU_DATA = {
    'P01': { img: 'IMG_7782.jpeg', name: '바베큐 숏립 크런치', priceR: null, priceL: 34500, priceF: 41900, priceP: null, topping: '한 판 가득 소갈비, 오리지널 아메리칸 BBQ! 치즈와 바삭한 식감까지 더한 리얼 고기 피자. 기본토핑: 바베큐 소스, 소갈비살, 3블랜드 치즈, 감자후레이크, 양파', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P02': { img: 'IMG_7783.jpeg', name: '멜로우 콘크림', priceR: null, priceL: 27500, priceF: 33900, priceP: 41500, topping: '부드러운 옥수수크림과 콘&파인애플을 더한 달콤한 피자. 기본토핑: 갈릭 랜치 소스, 파인애플, 콘, 양파, 체다 치즈, 포테이토', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P03': { img: 'IMG_7784.jpeg', name: '스타라이트 바질', priceR: null, priceL: 33500, priceF: 39900, priceP: 48500, topping: '입안 가득 바질의 향긋함과 고소한 치즈의 풍미가 느껴지는 특별한 별모양 피자. 기본토핑: 베이컨, 양송이, 치즈, 햄, 토마토, 바질마요 소스, 갈릭 소스, 스트링 치즈', isEvent: false, availableCrusts: ['original'] },
    'P04': { img: 'IMG_7785.jpeg', name: '더블 핫 앤 스파이시 멕시칸', priceR: null, priceL: 33500, priceF: 39900, priceP: null, topping: '스파이시 갈릭 치즈롤과 할라페뇨의 강렬한 매콤함. 기본토핑: 토마토 소스, 비프, 피망, 양파, 토마토, 블랙올리브, 할라페뇨, 모짜렐라 치즈', isEvent: false, availableCrusts: ['original', 'spicygarliccheeseroll'] }, 
    'P05': { img: 'IMG_7786.jpeg', name: '수퍼 파파스', priceR: 19900, priceL: 28500, priceF: 33900, priceP: 42500, topping: '신선한 토마토 소스 위에 각종 고기와 채소가 듬뿍 토핑된 베스트 피자. 기본토핑: 토마토 소스, 이탈리안 소시지, 양파, 청피망, 양송이, 블랙 올리브, 햄, 페퍼로니', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P06': { img: 'IMG_7787.jpeg', name: '존스 페이버릿', priceR: null, priceL: 29500, priceF: 34900, priceP: 45500, topping: '이탈리안 소시지, 페퍼로니와 6종의 치즈가 만들어 내는 진한 풍미의 베스트 셀러. 기본토핑: 6종 치즈, 이탈리안 소시지, 페퍼로니, 이탈리안 허브', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P07': { img: 'IMG_7895.jpeg', name: '올미트', priceR: 19900, priceL: 29500, priceF: 34900, priceP: 45500, topping: '페퍼로니, 햄, 이탈리안 소시지, 비프토핑까지 파파존스의 엄선된 고기토핑으로 꽉 채운 피자. 기본토핑: 이탈리안 소시지, 베이컨, 비프, 햄, 페퍼로니', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P08': { img: 'IMG_7789.jpeg', name: '스파이시 치킨랜치', priceR: 19900, priceL: 29500, priceF: 34900, priceP: 43500, topping: '은은한 향과 맛의 랜치 소스, 그릴드 치킨, 상큼한 토마토와 할라페뇨가 토핑. 기본토핑: 갈릭 랜치 소스, 그릴드 치킨, 베이컨, 토마토, 할라페뇨', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P09': { img: 'IMG_7790.jpeg', name: '아이리쉬 포테이토', priceR: 18900, priceL: 27500, priceF: 32900, priceP: 40500, topping: '진한 갈릭 소스와 담백한 포테이토 청크의 조화로 사랑 받는 베스트 셀러. 기본토핑: 토마토 소스, 포테이토, 베이컨, 양송이, 콘, 양파, 갈릭 소스', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P10': { img: 'IMG_7791.jpeg', name: '치킨 바베큐', priceR: 18900, priceL: 27500, priceF: 32900, priceP: 40500, topping: '새콤달콤한 타바스코 BBQ 소스와 두툼한 그릴드 치킨이 어우러진 특별한 맛. 기본토핑: 토마토 소스, 그릴드 치킨, 베이컨, 양파, 타바스코 BBQ 소스', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },

    'P11': { img: 'IMG_7798.jpeg', name: '크리스피 치즈 페퍼로니 피자', priceR: null, priceL: null, priceF: 31900, priceP: null, topping: '얇은 씬도우 바닥에 파마산+로마노 치즈가 더해져 더욱 바삭함. 기본토핑: 2블랜드 치즈, 토마토 소스, 모짜렐라 치즈, 페퍼로니', isEvent: false, availableCrusts: ['thin'] }, // TH전용
    'P12': { img: 'IMG_7799.jpeg', name: '크리스피 치즈 트리플 피자', priceR: null, priceL: null, priceF: 33900, priceP: null, topping: '바삭한 투치즈 크러스트 엣지에 알프레도 소스, 양송이, 햄이 6가지 치즈와 조화. 기본토핑: 2블랜드 치즈, 알프레도 소스, 모짜렐라 치즈, 스트링 치즈, 이탈리안 허브 시즈닝', isEvent: false, availableCrusts: ['thin'] }, // TH전용
    'P13': { img: 'IMG_7800.jpeg', name: '햄 머쉬룸 식스 치즈', priceR: null, priceL: 28500, priceF: 33900, priceP: 42500, topping: '알프레도 소스, 양송이 버섯, 햄이 6가지 치즈와 조화. 기본토핑: 알프레도소스, 양송이버섯, 양파, 햄, 치즈, 2블랜드 치즈, 3블랜드 치즈, 후추', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P14': { img: 'IMG_7801.jpeg', name: '위스콘신 치즈 포테이토', priceR: null, priceL: 29500, priceF: 35900, priceP: 45500, topping: '진한 맥앤치즈 베이스 소스에 6가지 치즈와 풍부한 토핑. 기본토핑: 맥앤치즈 소스, 베이컨, 햄, 페퍼로니, 포테이토, 3블랜드 치즈, 2블랜드 치즈', isEvent: false, availableCrusts: ['original', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] }, 
    'P15': { img: 'IMG_78152.jpeg', name: '더블 치즈버거', priceR: null, priceL: 29500, priceF: 34900, priceP: 43500, topping: '제스티 버거 소스위에 비프와 상큼한 토마토, 피클이 어우진 풍부한 맛. 기본토핑: 제스티 버거 소스, 비프, 토마토, 피클', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P16': { img: 'IMG_8153.jpeg', name: '프리미엄 직화불고기', priceR: null, priceL: 29500, priceF: 34900, priceP: 43500, topping: '정통 직화 불고기, 신선한 채소 토핑으로 누구나 좋아할수 있는 스테디 셀러. 기본토핑: 불고기 소스, 표고, 청피망, 양파, 불고기', isEvent: true, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P17': { img: 'IMG_7803.jpeg', name: '식스 치즈', priceR: null, priceL: 26500, priceF: 31900, priceP: 39500, topping: '모짜렐라, 로마노, 파마산, 아시아고, 폰티나, 프로볼로네 6종의 치즈 맛을 풍부하게 느낄 수 있는 정통 치즈피자. 기본토핑: 6종 치즈', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P18': { img: 'IMG_7802.jpeg', name: '스파이시 이탈리안', priceR: null, priceL: 27500, priceF: 33900, priceP: 40500, topping: '이탈리안 소시지의 두툼한 식감과 크러쉬드 레드페퍼의 매운맛. 기본토핑: 이탈리안 소시지, 페퍼로니, 크러쉬드 레드페퍼', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P19': { img: 'IMG_78150.jpeg', name: '슈림프 알프레도', priceR: null, priceL: null, priceF: 34900, priceP: null, topping: '얇고 바삭한 씬도우 위에 부드러운 알프레도 소스와 탱탱한 새우. 기본토핑: 알프레도 소스, 새우, 토마토, 피클, 그릴드 치킨, 양송이', isEvent: false, availableCrusts: ['thin'] }, // TH전용

    'P20': { img: 'IMG_7792.jpeg', name: '마가리타', priceR: 16900, priceL: 23500, priceF: 28900, priceP: 36500, topping: '파파존스 특유의 진한 토마토 소스와 최상급 모짜렐라 치즈. 기본토핑: 토마토 소스, 모짜렐라 치즈', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P21': { img: 'IMG_7793.jpeg', name: '페퍼로니', priceR: 17900, priceL: 25500, priceF: 30900, priceP: 38500, topping: '쫄깃쫄깃 짭조름한 페퍼로니와 고소한 치즈. 기본토핑: 토마토 소스, 페퍼로니', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P22': { img: 'IMG_7794.jpeg', name: '하와이안', priceR: 17900, priceL: 26500, priceF: 32900, priceP: 39500, topping: '새콤달콤한 파인애플과 햄, 쫀득한 모짜렐라 치즈. 기본토핑: 토마토 소스, 파인애플, 햄', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P23': { img: 'IMG_7795.jpeg', name: '가든 스페셜', priceR: 17900, priceL: 26500, priceF: 31900, priceP: 39500, topping: '양송이, 청피망, 올리브, 양파, 토마토등의 신선한채소. 기본토핑: 토마토 소스, 양송이, 청피망, 양파, 블랙 올리브, 토마토', isEvent: false, availableCrusts: ['original', 'thin', 'cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] },
    'P24': { img: 'IMG_8152.jpeg', name: '그린잇 식물성 마가리타', priceR: null, priceL: 26500, priceF: null, priceP: null, topping: '전통있는 SHEESE사의 비건치즈와 신선한 토마토 소스의 깔끔한 풍미. 기본토핑: 비건치즈, 토마토 소스', isEvent: false, availableCrusts: ['original'] },
    'P25': { img: 'IMG_8152.jpeg', name: '그린잇 식물성 가든스페셜', priceR: null, priceL: 29500, priceF: null, priceP: null, topping: '비건치즈와 신선한 채소가 어우러진 웰빙 채식 피자. 기본토핑: 토마토 소스, 비건 치즈, 양송이, 청피망, 양파, 블랙 올리브, 토마토', isEvent: false, availableCrusts: ['original'] }
};

let currentSelectedItem = null; 

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('option-modal');
    const closeBtn = document.querySelector('.close-btn');
    const menuList = document.getElementById('pizza-menu-list');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];


    // ----------------------------------------------------
    // 1. 메뉴 리스트 동적 생성 (HTML에 메뉴 항목을 자동으로 그려주는 기능)
    // ----------------------------------------------------
    function renderMenuList() {
        menuList.innerHTML = '';
        Object.keys(MENU_DATA).forEach(id => {
            const item = MENU_DATA[id];
            
            // 가격 문자열 생성
            const priceParts = [];
            if (item.priceR) priceParts.push(`R: ${item.priceR.toLocaleString()}원`);
            if (item.priceL) priceParts.push(`L: ${item.priceL.toLocaleString()}원`);
            if (item.priceF) priceParts.push(`F: ${item.priceF.toLocaleString()}원`);
            if (item.priceP) priceParts.push(`P: ${item.priceP.toLocaleString()}원`);
            const priceString = priceParts.join(' / ');

            const isEvent = EVENT_PIZZA_IDS.includes(id);

            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');
            menuItem.setAttribute('data-id', id);

            menuItem.innerHTML = `
                <img src="assets/images/pizza/${item.img}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h4 class="item-title">${item.name}</h4>
                    <p class="item-description">${item.topping.split('. ')[0]}</p>
                    <p class="item-price">가격: ${priceString}</p>
                    <p class="event-tag ${isEvent ? '' : 'no-event'}">${isEvent ? '금요일 1+1 가능 ⭐️' : '일반 메뉴'}</p>
                </div>
                <button class="btn btn-detail" data-id="${id}">상세 보기 & 선택</button>
            `;
            menuList.appendChild(menuItem);
        });
    }

    renderMenuList();


    // ----------------------------------------------------
    // 2. 상세 보기 버튼 클릭 시 모달(팝업) 열기
    // ----------------------------------------------------
    menuList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detail')) {
            const pizzaId = e.target.getAttribute('data-id');
            currentSelectedItem = MENU_DATA[pizzaId];
            
            document.getElementById('modal-title').textContent = currentSelectedItem.name;
            document.getElementById('modal-info').textContent = currentSelectedItem.name + ' 피자는 ' + (currentSelectedItem.isEvent ? '금요일 1+1 이벤트 대상입니다.' : '일반 메뉴입니다.');
            document.getElementById('modal-topping').textContent = '주요 토핑: ' + currentSelectedItem.topping;
            
            // 사이즈 옵션 업데이트
            const sizeSelect = document.getElementById('size-select');
            sizeSelect.innerHTML = '';
            
            ['R', 'L', 'F', 'P'].forEach(size => {
                const priceKey = `price${size}`;
                const price = currentSelectedItem[priceKey];
                if (price) {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = `${size} 사이즈 (${price.toLocaleString()}원)`;
                    option.setAttribute('data-price', price);
                    sizeSelect.appendChild(option);
                }
            });
            sizeSelect.value = currentSelectedItem.priceL ? 'L' : sizeSelect.options[0].value; 

            // 크러스트 옵션 업데이트
            const crustSelect = document.getElementById('crust-select');
            crustSelect.innerHTML = '';
            
            CRUST_OPTIONS.forEach(crust => {
                if (currentSelectedItem.availableCrusts.includes(crust.value)) {
                    const option = document.createElement('option');
                    option.value = crust.value;
                    option.textContent = crust.name;
                    crustSelect.appendChild(option);
                }
            });
            crustSelect.value = 'original'; 
            
            updatePrice();
            modal.style.display = 'block';
        }
    });

    // ----------------------------------------------------
    // 3. 가격 계산 로직 (사이즈/크러스트 변경 시)
    // ----------------------------------------------------
    document.getElementById('size-select').addEventListener('change', updatePrice);
    document.getElementById('crust-select').addEventListener('change', updatePrice);

    function updatePrice() {
        if (!currentSelectedItem) return;

        const sizeSelect = document.getElementById('size-select');
        const crustSelect = document.getElementById('crust-select');
        
        const selectedSize = sizeSelect.value;
        const basePrice = parseInt(sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price'));
        const selectedCrustValue = crustSelect.value;
        
        const crustOption = CRUST_OPTIONS.find(c => c.value === selectedCrustValue);
        let crustAddPrice = 0;

        // 크러스트 추가금 계산
        if (crustOption && (crustOption.priceL > 0 || crustOption.value === 'croissant')) {
            if (selectedSize === 'L') crustAddPrice = crustOption.priceL;
            else if (selectedSize === 'F') crustAddPrice = crustOption.priceF;
            else if (selectedSize === 'P') crustAddPrice = crustOption.priceP;
        }

        // 씬 크러스트 무료 변경 로직
        if (selectedCrustValue === 'thin' && selectedSize !== 'F' && selectedSize !== 'R') {
             // L, P 사이즈에서는 씬 불가 (가격은 0원 유지)
        }

        // 레귤러 사이즈는 크러스트 변경 불가
        if (selectedSize === 'R' && selectedCrustValue !== 'original') {
            crustSelect.value = 'original';
            crustAddPrice = 0;
            alert('레귤러 사이즈는 크러스트 변경이 불가능합니다. 오리지널 크러스트로 설정됩니다.');
        }

        let finalPrice = basePrice + crustAddPrice;

        // 1+1 이벤트 제한 조건 표시 및 버튼 비활성화
        const warningText = document.getElementById('size-warning');
        if (currentSelectedItem.isEvent) {
    if (selectedSize !== 'L') {
        // 이 부분은 L사이즈 제한 조건을 명확히 전달하기 위해 유지합니다.
        warningText.textContent = "⚠️ 1+1 이벤트는 L 사이즈만 가능합니다. L 사이즈로 선택하세요."; 
        document.getElementById('add-to-cart-btn').disabled = true;
        document.getElementById('add-to-cart-btn').textContent = "L 사이즈로 변경해야 주문 가능";
    } else {
        // 이 부분도 이벤트 적용 가능 상태를 명확히 표시하기 위해 유지합니다.
        warningText.textContent = "1+1 이벤트 적용 가능 (L 사이즈)"; 
        document.getElementById('add-to-cart-btn').disabled = false;
        document.getElementById('add-to-cart-btn').textContent = "장바구니에 담기";
    }
}
        } else {
            warningText.textContent = "";
            document.getElementById('add-to-cart-btn').disabled = false;
            document.getElementById('add-to-cart-btn').textContent = "장바구니에 담기";
        }


        // 최종 금액 표시
        document.getElementById('final-price-display').textContent = finalPrice.toLocaleString() + '원 (크러스트 추가금: ' + crustAddPrice.toLocaleString() + '원)';
    }


    // ----------------------------------------------------
    // 4. 장바구니 담기 버튼 로직
    // ----------------------------------------------------
    addToCartBtn.addEventListener('click', () => {
        const sizeSelect = document.getElementById('size-select');
        const crustSelect = document.getElementById('crust-select');
        const selectedSize = sizeSelect.value;
        const isEvent = currentSelectedItem.isEvent;

        if (isEvent && selectedSize !== 'L') {
            alert('1+1 이벤트 대상 피자는 L 사이즈만 주문 가능합니다.');
            return; 
        }

        const crustName = crustSelect.options[crustSelect.selectedIndex].text;
        const itemPrice = parseInt(document.getElementById('final-price-display').textContent.split('(')[0].replace(/[^0-9]/g, ''));
        
        const item = {
            id: currentSelectedItem.id,
            name: currentSelectedItem.name,
            size: selectedSize,
            crust: crustName,
            price: itemPrice, 
            isEvent: isEvent,
            isBOGO: false 
        };

        cart.push(item);
        localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
        
        modal.style.display = 'none';
        alert(`${item.name} (${item.size}, ${item.crust})가 장바구니에 담겼습니다. 이 아이템은 ${isEvent ? '1+1 이벤트 대상으로 처리됩니다.' : '일반 주문으로 처리됩니다.'}`);
    });


    // ----------------------------------------------------
    // 5. 모달 닫기
    // ----------------------------------------------------
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
});