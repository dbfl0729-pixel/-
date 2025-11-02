// assets/js/cart.js

// 1+1 이벤트가 적용되는 피자 ID 목록 (7종)
// (실제 데이터는 고객님의 25개 메뉴에 맞춰 수정되어야 합니다.)
const EVENT_PIZZA_IDS = ['P01', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08']; 
const MENU_DATA = {
    'P01': { name: '슈퍼 파파스', priceL: 28500, priceF: 34900, isEvent: true, topping: '페퍼로니, 햄, 버섯, 양파, 피망, 올리브' },
    'P02': { name: '존스 페이버릿', priceL: 30500, priceF: 36900, isEvent: false, topping: '페퍼로니, 이탈리안 소시지, 6가지 치즈' },
    'P03': { name: '아이리쉬 포테이토', priceL: 27500, priceF: 32900, isEvent: true, topping: '포테이토, 베이컨, 옥수수 콘' },
    // ... 나머지 22개 메뉴 데이터 추가
};

let currentSelectedItem = null; // 현재 상세 옵션 창에서 선택된 피자

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('option-modal');
    const closeBtn = document.querySelector('.close-btn');
    const menuList = document.getElementById('pizza-menu-list');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    // 장바구니 데이터를 저장할 배열 (임시)
    let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

    // ----------------------------------------------------
    // 1. 상세 보기 버튼 클릭 시 모달(팝업) 열기
    // ----------------------------------------------------
    menuList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detail')) {
            const pizzaId = e.target.getAttribute('data-id');
            currentSelectedItem = MENU_DATA[pizzaId];
            
            // 모달 내용 업데이트
            document.getElementById('modal-title').textContent = currentSelectedItem.name;
            document.getElementById('modal-info').textContent = currentSelectedItem.name + ' 피자는 ' + (currentSelectedItem.isEvent ? '금요일 1+1 이벤트 대상입니다.' : '일반 메뉴입니다.');
            document.getElementById('modal-topping').textContent = '주요 토핑: ' + currentSelectedItem.topping;
            
            // 가격 옵션 업데이트
            const sizeSelect = document.getElementById('size-select');
            sizeSelect.querySelector('option[value="L"]').setAttribute('data-price', currentSelectedItem.priceL);
            sizeSelect.querySelector('option[value="F"]').setAttribute('data-price', currentSelectedItem.priceF);

            // 파티(P) 사이즈 가격이 없으므로 F 사이즈 가격을 기본으로 설정 (필요 시 수정)
            sizeSelect.querySelector('option[value="P"]').setAttribute('data-price', currentSelectedItem.priceF + 5000); 

            // 초기 선택 및 경고 메시지 업데이트
            sizeSelect.value = 'L'; // 기본 L 사이즈 선택
            document.getElementById('crust-select').value = 'original'; // 기본 오리지널 크러스트
            updatePrice();
            
            modal.style.display = 'block';
        }
    });

    // ----------------------------------------------------
    // 2. 가격 계산 로직 (사이즈/크러스트 변경 시)
    // ----------------------------------------------------
    document.getElementById('size-select').addEventListener('change', updatePrice);
    document.getElementById('crust-select').addEventListener('change', updatePrice);

    function updatePrice() {
        if (!currentSelectedItem) return;

        const sizeSelect = document.getElementById('size-select');
        const crustSelect = document.getElementById('crust-select');
        
        const selectedSize = sizeSelect.value;
        const basePrice = parseInt(sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price'));
        const crustPrice = parseInt(crustSelect.options[crustSelect.selectedIndex].getAttribute('data-price'));
        
        let finalPrice = basePrice + crustPrice;

        // 1+1 이벤트 제한 조건 표시
        const warningText = document.getElementById('size-warning');
        if (currentSelectedItem.isEvent) {
            if (selectedSize !== 'L') {
                warningText.textContent = "⚠️ 1+1 이벤트는 L 사이즈만 가능합니다.";
            } else {
                warningText.textContent = "1+1 이벤트 가능 (L 사이즈)";
            }
        } else {
            warningText.textContent = "";
        }

        // 최종 금액 표시
        document.getElementById('final-price-display').textContent = finalPrice.toLocaleString() + '원';
    }


    // ----------------------------------------------------
    // 3. 장바구니 담기 버튼 로직 (1+1 조건 포함)
    // ----------------------------------------------------
    addToCartBtn.addEventListener('click', () => {
        const sizeSelect = document.getElementById('size-select');
        const crustSelect = document.getElementById('crust-select');
        const selectedSize = sizeSelect.value;
        const isEvent = currentSelectedItem.isEvent;

        // 1+1 이벤트 제한 검사 (L 사이즈만 가능)
        if (isEvent && selectedSize !== 'L') {
            alert('1+1 이벤트 대상 피자는 L 사이즈만 주문 가능합니다.');
            return; 
        }

        const item = {
            id: currentSelectedItem.id,
            name: currentSelectedItem.name,
            size: selectedSize,
            crust: crustSelect.options[crustSelect.selectedIndex].text,
            price: parseInt(document.getElementById('final-price-display').textContent.replace(/[^0-9]/g, '')), // 최종 금액
            basePrice: parseInt(sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price')),
            isEvent: isEvent,
            isBOGO: false // Buy One Get One (1+1) 적용 여부, 초기에는 false
        };

        cart.push(item);
        localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
        
        modal.style.display = 'none';
        alert(`${item.name} (${item.size})가 장바구니에 담겼습니다.`);
        // 장바구니 페이지로 이동하거나, 장바구니 아이콘 업데이트
    });


    // ----------------------------------------------------
    // 4. 모달 닫기
    // ----------------------------------------------------
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
    
    // ----------------------------------------------------
    // 5. [추후 작업] cart.html에서 1+1 자동 계산 로직
    // ----------------------------------------------------
    // cart.html 페이지에서 장바구니 항목을 보여줄 때 아래 로직을 사용합니다.
    /*
    function calculateFinalCartPrice(cartItems) {
        // 1. 이벤트 대상인 L 사이즈 피자만 필터링
        const eventPizzas = cartItems.filter(item => item.isEvent && item.size === 'L' && !item.isBOGO);
        
        // 2. 비싼 순으로 정렬 (내림차순)
        eventPizzas.sort((a, b) => b.price - a.price);

        let freeCount = 0;
        let totalFreeDiscount = 0;
        
        // 3. 2개당 1개 무료 계산
        for (let i = 0; i < eventPizzas.length; i++) {
            if (i % 2 === 1) { // 1번째, 3번째, 5번째 (0부터 시작하므로 인덱스 1, 3, 5...)
                // 더 저렴한 피자(현재 인덱스)를 무료 처리
                totalFreeDiscount += eventPizzas[i].price;
                eventPizzas[i].isBOGO = true; // 무료 처리 플래그
                freeCount++;
            }
        }
        
        // 4. 전체 금액 계산
        let totalPaidPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
        
        // 최종 결제 금액 (총 가격 - 무료 할인 금액)
        const finalPayment = totalPaidPrice - totalFreeDiscount;
        
        return { 
            finalPayment: finalPayment, 
            totalDiscount: totalFreeDiscount, 
            freeItems: freeCount 
        };
    }
    */
});