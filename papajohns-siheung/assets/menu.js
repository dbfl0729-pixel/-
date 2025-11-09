// menu.js (최종 - 할인, 계산 로직, 아코디언 기능 포함)

let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];
let currentCoupon = null; // 적용된 할인 코드 (퍼센트 할인)

// --- 기본 장바구니 기능 ---

function parsePrice(priceText) {
    if (!priceText) return 0;
    
    // 피자 메뉴처럼 L: F: P: 사이즈 정보가 있는 경우, L 사이즈 가격을 추출
    const lSizeMatch = priceText.match(/L:\s*([\d,]+)/);
    if (lSizeMatch) {
        return parseInt(lSizeMatch[1].replace(/,/g, ''), 10);
    }
    
    // R 사이즈로 표기된 경우 (비건 피자 등)
    const rSizeMatch = priceText.match(/R\(31cm\)\s*([\d,]+)/) || priceText.match(/R:\s*([\d,]+)/);
    if (rSizeMatch) {
         return parseInt(rSizeMatch[1].replace(/,/g, ''), 10);
    }

    // 단일 가격 (사이드, 음료, 소스, TH전용 F)
    const singlePriceMatch = priceText.match(/([\d,]+)/);
    if (singlePriceMatch) {
        return parseInt(singlePriceMatch[0].replace(/,/g, ''), 10);
    }

    return 0;
}

function addToCart(name, priceText) {
    const price = parsePrice(priceText);
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
            price: price,
            priceText: priceText,
            quantity: 1,
            isPizza: name.includes('피자') || name.includes('파파스') || name.includes('페이버릿') // 1+1 로직을 위해 추가
        });
    }

    saveCart();
    alert(`[${name.replace(/\s*\(\w\)/, '')}]이(가) 장바구니에 추가되었습니다.`);
}

function saveCart() {
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
}

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

function removeItem(index) {
    if (confirm(`[${cart[index].name.replace(/\s*\(\w\)/, '')}]을(를) 장바구니에서 삭제하시겠습니까?`)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}

// --- 할인 및 계산 로직 (추가됨) ---

/**
 * 장바구니 항목의 기본 합계 금액을 계산 (할인/배달비 미포함)
 * @returns {number} 총 기본 금액
 */
function calculateSubtotal() {
    let subtotal = 0;
    let pizzaPrices = []; // 1+1 로직을 위한 피자 가격 리스트

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        if (item.isPizza && item.quantity > 0) {
            for (let i = 0; i < item.quantity; i++) {
                pizzaPrices.push(item.price);
            }
        }
    });

    // 1+1 할인 적용 (금요일 행사)
    const today = new Date();
    // 0:일, 1:월, 2:화, 3:수, 4:목, 5:금, 6:토
    const isFriday = today.getDay() === 5; 
    let onePlusOneDiscount = 0;
    let pizzaSubtotal = pizzaPrices.reduce((sum, price) => sum + price, 0);

    if (isFriday && pizzaPrices.length >= 2) {
        // 가격이 비싼 피자부터 정렬
        pizzaPrices.sort((a, b) => b - a);
        
        // 1+1은 짝수번째 피자(두 번째, 네 번째 등)의 가격을 할인
        for (let i = 1; i < pizzaPrices.length; i += 2) {
            onePlusOneDiscount += pizzaPrices[i];
        }
    }
    
    // 1+1 할인 금액은 피자가 아닌 메뉴에는 적용되지 않으므로, subtotal에서 차감합니다.
    return { 
        baseTotal: subtotal, 
        onePlusOneDiscount: onePlusOneDiscount,
        isFriday: isFriday
    };
}


/**
 * 최종 금액 계산 및 화면 업데이트
 */
function calculateFinalTotal() {
    const { baseTotal, onePlusOneDiscount, isFriday } = calculateSubtotal();
    let total = baseTotal;
    let totalDiscount = 0; // 적용된 총 할인 금액 (포장, 제휴, 쿠폰)

    // 1. 1+1 할인 적용
    total -= onePlusOneDiscount;
    totalDiscount += onePlusOneDiscount;
    document.getElementById('promo-notice').style.display = isFriday && onePlusOneDiscount > 0 ? 'block' : 'none';

    // 2. 주문 방식 (배달/포장)
    const isPickup = document.getElementById('pickup').checked;
    const deliveryFee = 3000;
    let pickupDiscount = 0;

    if (isPickup) {
        // 포장 30% 할인 적용
        pickupDiscount = Math.round(total * 0.3);
        total -= pickupDiscount;
        totalDiscount += pickupDiscount;
    } else {
        // 배달비 적용
        total += deliveryFee;
    }

    // 3. 제휴 할인 (1+1, 포장 할인과 중복 불가)
    let affiliateDiscount = 0;
    const selectedDiscount = document.getElementById('affiliated-discount').value;
    const discountMatch = selectedDiscount.match(/(\d+)%/);

    // 1+1 할인이 적용된 경우, 다른 제휴 할인은 적용 불가 (사용자 요구사항)
    if (onePlusOneDiscount === 0 && discountMatch) {
        const discountRate = parseInt(discountMatch[1], 10) / 100;
        affiliateDiscount = Math.round(total * discountRate);
        total -= affiliateDiscount;
        totalDiscount += affiliateDiscount;
    }

    // 4. 할인 코드 (20250923 = 20% 할인)
    let couponDiscount = 0;
    if (currentCoupon === '20250923') {
        // 할인 코드 적용 (다른 할인과 중복 적용 불가 조건이 없으므로 최종 금액에 적용)
        couponDiscount = Math.round(total * 0.20);
        total -= couponDiscount;
        totalDiscount += couponDiscount;
    }


    // --- 최종 출력 ---
    const detail = `(1+1 할인: ${onePlusOneDiscount.toLocaleString()}원, 포장 할인: ${pickupDiscount.toLocaleString()}원, 제휴 할인: ${affiliateDiscount.toLocaleString()}원, 할인 코드: ${couponDiscount.toLocaleString()}원, 배달비: ${isPickup ? '0원' : deliveryFee.toLocaleString() + '원'})`;
    
    document.getElementById('final-total-price').textContent = Math.max(0, total).toLocaleString() + '원';
    document.getElementById('discount-detail').textContent = `총 할인액: ${totalDiscount.toLocaleString()}원 ${isPickup ? '' : `+ 배달비 ${deliveryFee.toLocaleString()}원`}`;
    
    // 총 금액 요약을 위해 baseTotal도 업데이트합니다.
    document.getElementById('base-total-price').textContent = baseTotal.toLocaleString() + '원';
}

/**
 * 계산서 페이지에서 장바구니 목록을 렌더링
 */
function renderCart() {
    const cartList = document.getElementById('cart-list');
    
    if (!cartList) return; // 계산서 페이지가 아니면 종료

    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = '<li style="text-align: center; color: #888; padding: 30px;">장바구니가 비어있습니다. 메뉴를 담아주세요.</li>';
        document.getElementById('final-total-price').textContent = '0원';
        document.getElementById('discount-detail').textContent = '';
        return;
    }

    let subTotalNoDiscount = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subTotalNoDiscount += itemTotal;
        
        // 피자 이름에서 L사이즈 정보를 제거하고 표시 (계산서 보기 좋게)
        const displayName = item.name.replace(/\s*\(\w\)/, '');
        const unitPriceDisplay = item.price.toLocaleString();


        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="item-details">
                <div class="name">${displayName}</div>
                <div class="price-unit">${unitPriceDisplay}원 (단가)</div>
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
    
    // 장바구니 목록 하단에 기본 합계 금액 표시
    const subtotalLi = document.createElement('li');
    subtotalLi.innerHTML = `
        <div class="item-details"><div class="name">상품 합계</div></div>
        <div class="item-total" id="base-total-price" style="font-size: 1.2em;">${subTotalNoDiscount.toLocaleString()}원</div>
    `;
    cartList.appendChild(subtotalLi);

    calculateFinalTotal(); // 최종 금액 계산 및 표시
}

/**
 * 할인 코드 적용
 */
function applyCoupon() {
    const codeInput = document.getElementById('coupon-code').value.trim();
    if (codeInput === '20250923') {
        currentCoupon = codeInput;
        alert("할인 코드 [20250923] (20% 할인)이 적용되었습니다.");
    } else if (codeInput === '') {
        currentCoupon = null;
        alert("할인 코드를 해제했습니다.");
    } else {
        currentCoupon = null;
        alert("유효하지 않은 할인 코드입니다.");
    }
    calculateFinalTotal(); // 할인 적용 후 총 금액 재계산
}


/**
 * 페이지 로드 시 실행 함수
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 메뉴 카드에 이벤트 리스너 추가 (메뉴 페이지)
    document.querySelectorAll('[data-menu-name]').forEach(element => {
        const name = element.dataset.menuName;
        const priceText = element.dataset.menuPrice;
        
        const button = element.querySelector('.add-to-cart-btn');
        if (button) {
            button.onclick = () => addToCart(name, priceText);
        }
    });

    // 2. 계산서 페이지에서 카트 렌더링 및 이벤트 리스너 추가
    if (document.getElementById('cart-list')) {
        renderCart();
        
        // 주문 방식, 제휴 할인 변경 시 최종 금액 재계산
        document.querySelectorAll('input[name="order-type"]').forEach(radio => {
            radio.addEventListener('change', calculateFinalTotal);
        });
        document.getElementById('affiliated-discount').addEventListener('change', calculateFinalTotal);
    }
});

// 주문하기 버튼 기능 (간단 알림)
function completeOrder() {
    if (cart.length === 0) {
        alert("장바구니가 비어있습니다. 메뉴를 담아주세요!");
        return;
    }
    const finalPrice = document.getElementById('final-total-price').textContent;
    alert(`총 ${finalPrice}으로 주문이 접수되었습니다!\n(이것은 시뮬레이션입니다. 실제 주문은 불가합니다.)`);
    
    // 주문 완료 후 장바구니 초기화
    cart = [];
    saveCart();
    // 페이지 리로드 또는 카트 초기화 후 렌더링
    if (document.getElementById('cart-list')) {
        renderCart();
    } else {
        alert("장바구니가 비어있습니다. 메뉴를 담아주세요!");
    }
}

// --- 크러스트 안내 디자인 개선을 위한 아코디언 기능 (추가됨) ---
/**
 * 아코디언(접었다 펴는) 기능을 토글합니다.
 * @param {string} id - 콘텐츠 영역의 ID (예: 'crust-guide', 'event-guide')
 */
function toggleAccordion(id) {
    const content = document.getElementById(id + '-content');
    const icon = document.getElementById(id + '-icon');
    
    if (content.style.display === "block") {
        content.style.display = "none";
        icon.textContent = "+";
    } else {
        // 다른 모든 아코디언 닫기
        document.querySelectorAll('.accordion-content').forEach(item => {
            if (item.id !== id + '-content') {
                item.style.display = 'none';
                document.getElementById(item.id.replace('-content', '-icon')).textContent = '+';
            }
        });
        
        // 현재 아코디언 열기
        content.style.display = "block";
        icon.textContent = "−";
    }
}