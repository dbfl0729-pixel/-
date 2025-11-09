// 장바구니 데이터를 로컬 스토리지에서 불러오거나 초기화
let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];

/**
 * 가격 문자열에서 L 사이즈 가격을 추출하여 정수로 변환
 * @param {string} priceText - 메뉴 가격 문자열 (예: "L: 28,500원 / F: 33,900원" 또는 "8,900원")
 * @returns {number} 추출된 L 사이즈 또는 단일 가격 (정수)
 */
function parsePrice(priceText) {
    if (!priceText) return 0;

    // 1. 피자 메뉴처럼 L: F: P: 사이즈 정보가 있는 경우, L 사이즈 가격을 추출
    const lSizeMatch = priceText.match(/L:\s*([\d,]+)/);
    if (lSizeMatch) {
        return parseInt(lSizeMatch[1].replace(/,/g, ''), 10);
    }
    
    // 2. 피자가 아닌 메뉴 중 R(31cm)과 같이 L이 아닌 사이즈로 표기된 경우 (그린잇 비건 피자 등)
    const rSizeMatch = priceText.match(/R:\s*([\d,]+)/);
    if (rSizeMatch) {
         return parseInt(rSizeMatch[1].replace(/,/g, ''), 10);
    }

    // 3. 단일 가격 (사이드, 음료, 소스) 또는 TH전용 F 사이즈 가격인 경우
    const singlePriceMatch = priceText.match(/([\d,]+)/);
    if (singlePriceMatch) {
        return parseInt(singlePriceMatch[0].replace(/,/g, ''), 10);
    }

    return 0;
}

/**
 * 장바구니에 메뉴 추가
 * @param {string} name - 메뉴 이름
 * @param {string} priceText - 메뉴 가격 문자열 (L 사이즈 또는 단일 가격 파싱용)
 */
function addToCart(name, priceText) {
    // 가격 문자열에서 정수 가격을 추출
    const price = parsePrice(priceText);
    
    // 고유 키 (이름 + 가격) 생성. 가격 문자열을 키에 포함하여 사이즈/옵션이 다른 경우를 구분
    const key = `${name}-${priceText}`; 

    if (price === 0) {
        alert(`[${name}]의 가격 정보를 읽을 수 없어 추가할 수 없습니다.`);
        return;
    }

    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            key: key,
            name: name,
            price: price, // 실제 계산에 사용될 정수 가격
            priceText: priceText, // 정보 표시에 사용될 원본 가격 텍스트 (피자 사이즈 정보 포함)
            quantity: 1
        });
    }

    saveCart();
    alert(`[${name}]이(가) 장바구니에 추가되었습니다.`);
}

/**
 * 장바구니 데이터를 로컬 스토리지에 저장
 */
function saveCart() {
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
}

/**
 * 계산서 페이지에서 장바구니 목록을 렌더링
 */
function renderCart() {
    const cartList = document.getElementById('cart-list');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartList || !totalPriceElement) return;

    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = '<li style="text-align: center; color: #888; padding: 30px;">장바구니가 비어있습니다. 메뉴를 담아주세요.</li>';
        totalPriceElement.textContent = '0원';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // 피자 이름에서 L사이즈 정보를 제거하고 표시
        const displayName = item.name.replace(/\s*\(\w\)/, '');
        // 가격 텍스트에서 사이즈 정보 (L: F: 등)를 제거하고 단일 가격만 표시
        const unitPriceDisplay = item.price.toLocaleString();


        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="item-details">
                <div class="name">${displayName}</div>
                <div class="price-unit">${unitPriceDisplay}원 (x ${item.quantity})</div>
            </div>
            <div class="quantity-control">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="removeItem(${index})" style="margin-left: 10px; background-color: #ddd; color: #333;">삭제</button>
            </div>
            <div class="item-total">${itemTotal.toLocaleString()}원</div>
        `;
        cartList.appendChild(listItem);
    });

    totalPriceElement.textContent = total.toLocaleString() + '원';
}

/**
 * 장바구니 수량 업데이트
 */
function updateQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        
        if (cart[index].quantity <= 0) {
            removeItem(index);
        } else {
            saveCart();
            renderCart();
        }
    }
}

/**
 * 장바구니에서 특정 아이템 제거
 */
function removeItem(index) {
    if (confirm(`[${cart[index].name.replace(/\s*\(\w\)/, '')}]을(를) 장바구니에서 삭제하시겠습니까?`)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}

/**
 * 페이지 로드 시 실행 함수
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 메뉴 카드에 이벤트 리스너 추가
    document.querySelectorAll('[data-menu-name]').forEach(element => {
        const name = element.dataset.menuName;
        const priceText = element.dataset.menuPrice;
        
        const button = element.querySelector('.add-to-cart-btn');
        if (button) {
            // 버튼 클릭 시 addToCart 함수를 호출하여 장바구니에 추가
            button.onclick = () => addToCart(name, priceText);
        }
    });

    // 2. 계산서 페이지에서 카트 렌더링
    if (document.getElementById('cart-list')) {
        renderCart();
    }
});

// 주문하기 버튼 기능 (간단 알림)
function completeOrder() {
    if (cart.length === 0) {
        alert("장바구니가 비어있습니다. 메뉴를 담아주세요!");
        return;
    }
    alert(`총 ${document.getElementById('total-price').textContent}으로 주문이 접수되었습니다!\n(이것은 시뮬레이션입니다. 실제 주문은 불가합니다.)`);
    
    // 주문 완료 후 장바구니 초기화
    cart = [];
    saveCart();
    renderCart();
}