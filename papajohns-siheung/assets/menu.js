// ====================================================================
// Menu.js: 장바구니(Cart), 피자 옵션, 할인 계산 통합 관리 (최종 통합본)
// ====================================================================

// 전역 변수 설정 (실제 가격 데이터를 정의합니다.)
const PIZZA_PRICES = {
    '수퍼 파파스': { 'L': 27900, 'F': 35900 },
    '존스 페이버릿': { 'L': 28900, 'F': 36900 },
    '아이리쉬 포테이토': { 'L': 27900, 'F': 35900 },
    // TODO: 나머지 피자 가격 데이터 추가 필요
};

const CRUST_PRICES = {
    '오리지널': { 'L': 0, 'F': 0 },
    '씬': { 'L': 0, 'F': 0 },
    '골드링': { 'L': 6000, 'F': 8000 },
    '치즈롤': { 'L': 6000, 'F': 8000 },
    // TODO: 나머지 크러스트 가격 데이터 추가 필요
};

// -------------------- 1. 장바구니 데이터 관리 --------------------

let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

function saveCart() {
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
}

function addToCart(item) {
    let existingItem = cart.find(i => 
        i.name === item.name &&
        (item.type === 'side' || (i.size === item.size && i.crust === item.crust))
    );

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        item.id = Date.now();
        cart.push(item);
    }

    saveCart();
    // bill.html 페이지에서만 렌더링 및 총액 계산 수행
    if (document.getElementById('cart-list')) {
        renderCart();
        calculateFinalTotal();
    }
}

// -------------------- 2. bill.html 렌더링 및 기능 (생략, 이전과 동일) --------------------

function renderCart() {
    const cartList = document.getElementById('cart-list');
    if (!cartList) return;

    // ... (이전 renderCart 함수 내용과 동일) ...
    cartList.innerHTML = '';
    let hasPizza = false;
    // 장바구니 렌더링 로직 (생략)
    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        
        // 가격 계산: 기본 가격 + 크러스트 가격
        const itemPrice = item.price + (item.crustPrice || 0);
        const itemTotal = itemPrice * item.quantity;
        
        let optionText = '';
        if (item.type === 'pizza') {
            hasPizza = true;
            optionText = `(${item.size}, ${item.crust})`;
        }

        li.innerHTML = `
            <div class="item-details">
                <strong>${item.name}</strong>
                <p class="item-options">${optionText}</p>
            </div>
            <span class="item-price">${itemTotal.toLocaleString()}원</span>
            <div class="item-actions">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">삭제</button>
            </div>
        `;
        cartList.appendChild(li);
    });
    
    document.getElementById('promo-notice').style.display = hasPizza ? 'block' : 'none';
    calculateFinalTotal();
}

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

function deleteItem(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCart();
    renderCart();
}

function calculateFinalTotal() {
    const finalPriceElement = document.getElementById('final-total-price');
    const detailElement = document.getElementById('discount-detail');
    if (!finalPriceElement || !detailElement) return;

    // ... (이전 calculateFinalTotal 함수 내용과 동일) ...
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = (item.price + (item.crustPrice || 0)) * item.quantity;
        subtotal += itemTotal;
    });

    let discount = 0;
    const deliveryFee = 3000;
    let isPickup = document.getElementById('pickup')?.checked;
    
    // 포장 30% 할인 (예시)
    if (isPickup) {
        discount = subtotal * 0.3;
    } 
    // TODO: 제휴 할인, 쿠폰, 1+1 할인 로직 추가 필요

    let finalTotal = subtotal - discount + (isPickup ? 0 : deliveryFee);
    
    finalPriceElement.textContent = Math.max(0, finalTotal).toLocaleString() + '원';
    detailElement.innerHTML = `상품 금액: ${subtotal.toLocaleString()}원, 할인: ${discount.toLocaleString()}원, 배달비: ${isPickup ? '0원 (포장)' : deliveryFee.toLocaleString() + '원 (배달)'}`;
}

function attachBillListeners() {
    document.querySelectorAll('input[name="order-type"]').forEach(radio => {
        radio.addEventListener('change', calculateFinalTotal);
    });
    document.getElementById('affiliated-discount')?.addEventListener('change', calculateFinalTotal);
}

// -------------------- 3. 사이드 메뉴 기능 (생략, 이전과 동일) --------------------

function attachSideMenuListeners() {
    const sideButtons = document.querySelectorAll('.add-to-cart-btn');
    
    sideButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const menuCard = event.target.closest('.menu-item'); 
            
            if (menuCard) {
                const name = menuCard.dataset.menuName;
                const priceText = menuCard.querySelector('.price').textContent;
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

// -------------------- 4. 피자 옵션 선택 기능 (활성화) --------------------

function attachPizzaListeners() {
    // 모든 피자 카드에 클릭 리스너 연결
    document.querySelectorAll('.pizza-card').forEach(card => {
        card.addEventListener('click', (event) => {
            // "담기" 버튼을 제외한 카드 클릭 시 팝업 띄우기
            if (!event.target.classList.contains('add-to-cart-btn')) {
                const pizzaName = card.dataset.pizzaName;
                showPizzaOptions(pizzaName);
            }
        });
    });

    // 팝업 닫기 버튼
    document.getElementById('close-popup')?.addEventListener('click', hidePizzaOptions);
    
    // 팝업 내 옵션 변경 이벤트 리스너 (가격 업데이트)
    // input[name="pizza-size"] 또는 input[name="pizza-crust"] 변경 시
    document.getElementById('pizza-options')?.addEventListener('change', updatePizzaPrice);

    // 장바구니 추가 버튼
    document.getElementById('add-pizza-to-cart')?.addEventListener('click', handleAddPizzaToCart);
}

// 팝업 표시
function showPizzaOptions(pizzaName) {
    const popup = document.getElementById('pizza-popup');
    document.getElementById('popup-pizza-name').textContent = pizzaName;
    
    // 팝업을 띄울 때마다 기본 옵션(L, 오리지널)을 체크 상태로 만듭니다.
    document.querySelector('input[name="pizza-size"][value="L"]').checked = true;
    document.querySelector('input[name="pizza-crust"][value="오리지널"]').checked = true;
    
    popup.style.display = 'flex'; // 팝업 표시

    // 팝업 초기 가격 설정
    updatePizzaPrice();
}

// 팝업 숨기기
function hidePizzaOptions() {
    document.getElementById('pizza-popup').style.display = 'none';
}

// 팝업 내 가격 업데이트 로직
function updatePizzaPrice() {
    const pizzaName = document.getElementById('popup-pizza-name').textContent;
    const size = document.querySelector('input[name="pizza-size"]:checked')?.value;
    const crust = document.querySelector('input[name="pizza-crust"]:checked')?.value;
    const priceDisplay = document.getElementById('selected-pizza-price');

    if (!size || !crust) {
        priceDisplay.textContent = '옵션을 선택해주세요.';
        return;
    }

    // 기본 피자 가격 + 크러스트 가격 계산
    const basePrice = PIZZA_PRICES[pizzaName]?.[size] || 0;
    const crustPrice = CRUST_PRICES[crust]?.[size] || 0;
    const finalPrice = basePrice + crustPrice;

    priceDisplay.textContent = `총 가격: ${finalPrice.toLocaleString()}원`;
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

    const basePrice = PIZZA_PRICES[pizzaName]?.[size] || 0;
    const crustPrice = CRUST_PRICES[crust]?.[size] || 0;

    const pizzaItem = {
        type: 'pizza',
        name: pizzaName,
        price: basePrice, // 기본 피자 가격
        crustPrice: crustPrice, // 추가된 크러스트 가격
        size: size,
        crust: crust,
        quantity: 1
    };

    addToCart(pizzaItem);
    hidePizzaOptions();
    alert(`${pizzaName} (${size}, ${crust}) 1개를 장바구니에 담았습니다.`);
}

// -------------------- 5. DOMContentLoaded: 페이지 진입점 --------------------

document.addEventListener('DOMContentLoaded', () => {

    // ⭐️ 피자 페이지 로직 (pizza.html) 활성화
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
        attachBillListeners();
    }
});