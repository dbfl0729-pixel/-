// ====================================================================
// Menu.js: 장바구니(Cart), 피자 옵션, 할인 계산 통합 관리
// ====================================================================

// 전역 변수 설정 (데이터는 실제 API나 DB에서 가져와야 하지만, 예시를 위해 하드코딩)
const pizzaPrices = {
    '수퍼 파파스': { 'R': 27500, 'L': 34500, 'F': 41900 },
    '아이리쉬 포테이토': { 'R': 27500, 'L': 34500, 'F': 41900 },
    // ... 실제 피자 메뉴 가격 데이터를 여기에 모두 포함해야 합니다.
};
const crustPrices = {
    '오리지널 도우': { 'L': 0, 'F': 0 },
    '골드 링': { 'L': 5000, 'F': 6000 },
    // ... 실제 크러스트 가격 데이터를 여기에 모두 포함해야 합니다.
};


// -------------------- 1. 장바구니 데이터 관리 --------------------

// 장바구니 데이터 로드 (localStorage 사용)
let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

// 장바구니 데이터 저장
function saveCart() {
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
}

// 장바구니에 아이템 추가
function addToCart(item) {
    // 장바구니에 이미 담겨있는지 확인 (사이드 메뉴는 이름으로, 피자는 이름+옵션으로)
    let existingItem = cart.find(i => 
        i.name === item.name &&
        (item.type === 'side' || (i.size === item.size && i.crust === item.crust))
    );

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        item.id = Date.now(); // 고유 ID 부여
        cart.push(item);
    }

    saveCart();
    // bill.html 페이지인 경우 즉시 업데이트
    if (document.getElementById('cart-list')) {
        renderCart();
        calculateFinalTotal();
    }
}

// -------------------- 2. bill.html 렌더링 및 기능 --------------------

/**
 * 장바구니 목록을 화면에 렌더링합니다. (가격 표시 포함 수정)
 */
function renderCart() {
    const cartList = document.getElementById('cart-list');
    if (!cartList) return;

    cartList.innerHTML = ''; // 기존 목록 초기화

    if (cart.length === 0) {
        cartList.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">장바구니가 비어 있습니다.</li>';
        document.getElementById('promo-notice').style.display = 'none';
        return;
    }

    let hasPizza = false;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('cart-item');
        li.dataset.itemId = item.id;

        // 아이템 정보
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('item-info');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('item-name');
        nameSpan.textContent = item.name;
        infoDiv.appendChild(nameSpan);
        
        // 옵션 표시 (피자만)
        if (item.type === 'pizza') {
            hasPizza = true;
            const optionsP = document.createElement('p');
            optionsP.classList.add('item-options');
            optionsP.textContent = `${item.size} / ${item.crust} (+${item.crustPrice.toLocaleString()}원)`;
            infoDiv.appendChild(optionsP);
        }

        li.appendChild(infoDiv);

        // 수량 및 삭제 버튼
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('item-actions');

        const minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.onclick = () => updateQuantity(item.id, -1);
        
        const quantitySpan = document.createElement('span');
        quantitySpan.classList.add('item-quantity');
        quantitySpan.textContent = item.quantity;

        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.onclick = () => updateQuantity(item.id, 1);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => deleteItem(item.id);

        // 가격 표시 (⭐️ 가격 표시 로직 추가)
        const itemPriceSpan = document.createElement('span');
        itemPriceSpan.classList.add('item-price');
        
        // 피자는 본 가격 + 크러스트 가격 * 수량
        const basePrice = item.price + (item.crustPrice || 0);
        const totalPrice = basePrice * item.quantity;

        itemPriceSpan.textContent = totalPrice.toLocaleString() + '원';
        
        // 요소 조립
        actionsDiv.appendChild(minusBtn);
        actionsDiv.appendChild(quantitySpan);
        actionsDiv.appendChild(plusBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(actionsDiv);
        li.appendChild(itemPriceSpan); // 가격을 actionsDiv 옆에 배치

        cartList.appendChild(li);
    });
    
    // 1+1 행사 안내 표시 여부
    document.getElementById('promo-notice').style.display = hasPizza ? 'block' : 'none';
    
    calculateFinalTotal();
}


// 수량 변경
function updateQuantity(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) {
            deleteItem(itemId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

// 아이템 삭제
function deleteItem(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCart();
    renderCart();
}

// 최종 금액 계산 함수 (할인, 배달비 적용)
function calculateFinalTotal() {
    // (이전에 제공된 calculateFinalTotal 함수 코드가 여기에 포함되어야 합니다.
    //  예시가 너무 길어지므로 생략하며, 이 함수는 renderCart() 끝에 호출됩니다.)
    // ...
    
    const finalPriceElement = document.getElementById('final-total-price');
    const detailElement = document.getElementById('discount-detail');
    if (!finalPriceElement || !detailElement) return;

    // 임시 로직: 실제 계산 로직은 여기에 구현 필요
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = (item.price + (item.crustPrice || 0)) * item.quantity;
        subtotal += itemTotal;
    });

    let discount = 0;
    const deliveryFee = 3000; // 기본 배달비
    let isPickup = document.getElementById('pickup')?.checked;
    
    if (isPickup) {
        discount = subtotal * 0.3; // 포장 30% 할인
    }

    let finalTotal = subtotal - discount + (isPickup ? 0 : deliveryFee);
    
    finalPriceElement.textContent = Math.max(0, finalTotal).toLocaleString() + '원';
    detailElement.innerHTML = `상품 금액: ${subtotal.toLocaleString()}원, 할인: ${discount.toLocaleString()}원, 배달비: ${isPickup ? '0원 (포장)' : deliveryFee.toLocaleString() + '원 (배달)'}`;

    // ... 실제 제휴 할인, 쿠폰, 1+1 로직은 여기에 구현되어야 함 ...
}

function attachBillListeners() {
    // 주문 방식(배달/포장) 변경 시 최종 금액 재계산
    document.querySelectorAll('input[name="order-type"]').forEach(radio => {
        radio.addEventListener('change', calculateFinalTotal);
    });

    // 제휴 할인 변경 시 최종 금액 재계산
    document.getElementById('affiliated-discount')?.addEventListener('change', calculateFinalTotal);
}


// -------------------- 3. 사이드 메뉴 기능 추가 --------------------

/**
 * sides.html 페이지의 '담기' 버튼에 이벤트 리스너를 붙입니다.
 */
function attachSideMenuListeners() {
    const sideButtons = document.querySelectorAll('.add-to-cart-btn');
    
    sideButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const menuCard = event.target.closest('.menu-card');
            
            if (menuCard) {
                const name = menuCard.dataset.menuName;
                const priceText = menuCard.dataset.menuPrice;
                
                // 가격 텍스트에서 콤마(,)와 '원'을 제거하고 숫자로 변환
                const price = parseInt(priceText.replace(/[^0-9]/g, ''));

                const item = {
                    type: 'side',
                    name: name,
                    price: price,
                    quantity: 1,
                    options: []
                };

                addToCart(item);

                alert(`${name} 1개를 장바구니에 담았습니다.`);
            }
        });
    });
}


// -------------------- 4. 피자 메뉴 기능 (가정) --------------------
// (pizza.html에서 피자 옵션 선택 후 addToCart를 호출하는 함수들이 여기에 포함되어야 합니다.)
// 예시: function attachPizzaListeners() { ... }
// 예시: function updatePizzaPrice(card) { ... }


// -------------------- 5. DOMContentLoaded: 페이지 진입점 --------------------

document.addEventListener('DOMContentLoaded', () => {

    // 피자 페이지 로직 (pizza.html)
    if (document.querySelector('.pizza-card')) {
        // attachPizzaListeners(); // 피자 카드별 이벤트 리스너 연결
    }

    // 사이드/음료 페이지 로직 (sides.html, drinks_sauces.html 등)
    // .menu-card와 .add-to-cart-btn이 모두 존재하면 사이드 메뉴로 간주
    if (document.querySelector('.menu-card') && document.querySelector('.add-to-cart-btn')) {
        attachSideMenuListeners(); 
    }

    // 계산서 페이지 로직 (bill.html)
    if (document.getElementById('cart-list')) {
        renderCart();
        attachBillListeners(); 
        // calculateFinalTotal()은 renderCart() 내부에서 호출됨
    }
});