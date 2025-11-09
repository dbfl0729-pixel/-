// ====================================================================
// Menu.js: 장바구니(Cart), 피자 옵션, 할인 계산 통합 관리
// ====================================================================

// 전역 변수 설정 (데이터는 실제 API나 DB에서 가져와야 하지만, 예시를 위해 하드코딩)
// (실제 프로젝트에서는 모든 피자, 크러스트, 사이드 가격 데이터가 여기에 포함되어야 합니다.)
const pizzaPrices = { /* ... 피자 가격 데이터 ... */ }; 
const crustPrices = { /* ... 크러스트 가격 데이터 ... */ }; 


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
    if (document.getElementById('cart-list')) {
        renderCart();
        calculateFinalTotal();
    }
}

// -------------------- 2. bill.html 렌더링 및 기능 --------------------

function renderCart() {
    const cartList = document.getElementById('cart-list');
    if (!cartList) return;

    cartList.innerHTML = '';

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

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('item-info');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('item-name');
        nameSpan.textContent = item.name;
        infoDiv.appendChild(nameSpan);
        
        if (item.type === 'pizza') {
            hasPizza = true;
            const optionsP = document.createElement('p');
            optionsP.classList.add('item-options');
            optionsP.textContent = `${item.size} / ${item.crust} (+${(item.crustPrice || 0).toLocaleString()}원)`;
            infoDiv.appendChild(optionsP);
        }

        li.appendChild(infoDiv);

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

        // ⭐️ 가격 표시 로직 (수정 완료)
        const itemPriceSpan = document.createElement('span');
        itemPriceSpan.classList.add('item-price');
        
        const basePrice = item.price + (item.crustPrice || 0);
        const totalPrice = basePrice * item.quantity;

        itemPriceSpan.textContent = totalPrice.toLocaleString() + '원';
        
        actionsDiv.appendChild(minusBtn);
        actionsDiv.appendChild(quantitySpan);
        actionsDiv.appendChild(plusBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(actionsDiv);
        li.appendChild(itemPriceSpan);

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


// -------------------- 3. 사이드 메뉴 기능 추가 (사이드/음료 공통 사용 가능) --------------------

function attachSideMenuListeners() {
    const sideButtons = document.querySelectorAll('.add-to-cart-btn');
    
    sideButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const menuCard = event.target.closest('.menu-item'); // ⭐️ .menu-item으로 변경
            
            if (menuCard) {
                const name = menuCard.dataset.menuName;
                const priceText = menuCard.querySelector('.price').textContent;
                
                // 가격 텍스트에서 콤마(,)와 '원'을 제거하고 숫자로 변환
                const price = parseInt(priceText.replace(/[^0-9]/g, ''));

                const item = {
                    type: 'side', // 또는 'drink'
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


// -------------------- 4. DOMContentLoaded: 페이지 진입점 --------------------

document.addEventListener('DOMContentLoaded', () => {

    // 피자 페이지 로직 (pizza.html)
    if (document.querySelector('.pizza-card')) {
        // attachPizzaListeners(); // 피자 카드별 이벤트 리스너 연결
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