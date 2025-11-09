// menu.js (피자 페이지 HTML 구조에 맞춘 최종 통합 버전)

let cart = JSON.parse(localStorage.getItem('papaJohnsCart')) || [];
let currentCoupon = null; // 적용된 할인 코드 (퍼센트 할인)

// 크러스트 사이즈별 추가금액 정보 (HTML에서 가져옴)
const CRUST_ADD_PRICES = {
    'L': { 'cheeseroll': 4000, 'goldring': 4000, 'spicygarlic': 4000, 'croissant': 6000 },
    'F': { 'cheeseroll': 5000, 'goldring': 5000, 'spicygarlic': 5000, 'croissant': 6000 },
    'P': { 'cheeseroll': 6000, 'goldring': 6000, 'spicygarlic': 6000, 'croissant': 6000 },
    // R 사이즈와 씬(THIN)은 기본적으로 추가금 없음
};

// 사이즈 코드별 이름 정보 (HTML에서 가져옴)
const SIZE_DETAILS = {
    'R': { name: '레귤러' }, 'L': { name: '라지' },
    'F': { name: '패밀리' }, 'P': { name: '파티' }
};

// --- 장바구니 핵심 기능 ---

/**
 * 장바구니에 항목을 추가합니다. (피자 상세 옵션을 고려)
 * @param {string} name - 피자 이름
 * @param {number} finalPrice - 크러스트 추가금까지 반영된 최종 가격
 * @param {string} optionDetail - 사이즈 및 크러스트 옵션 설명
 */
function addToCart(name, finalPrice, optionDetail) {
    const key = `${name}-${optionDetail}`;

    if (finalPrice <= 0) {
        alert(`[${name}]의 가격 정보를 확인할 수 없어 추가할 수 없습니다.`);
        return;
    }

    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            key: key,
            name: name,
            price: finalPrice,
            priceText: optionDetail, // 장바구니 렌더링을 위해 상세 옵션을 priceText로 사용
            quantity: 1,
            // 피자 메뉴판에서 추가하는 항목은 모두 피자이므로 isPizza: true
            isPizza: true 
        });
    }

    saveCart();
    alert(`[${name}] (${optionDetail})이(가) 장바구니에 추가되었습니다.`);
}

function saveCart() {
    localStorage.setItem('papaJohnsCart', JSON.stringify(cart));
}

// 이 함수는 bill.html에서 사용됨
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

// 이 함수는 bill.html에서 사용됨
function removeItem(index) {
    if (confirm(`[${cart[index].name}]을(를) 장바구니에서 삭제하시겠습니까?`)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}


// --- 피자 메뉴판 가격 동적 계산 로직 (HTML에서 이관) ---

// 금액을 쉼표 형식으로 변환하는 함수
function formatPrice(price) {
    return price.toLocaleString('ko-KR');
}

/**
 * 선택된 옵션에 따라 총 가격을 업데이트하고 UI에 반영하는 함수
 * @param {string} pizzaId - 피자 ID (예: '1')
 */
function updatePrice(pizzaId) {
    const card = document.getElementById(`pizza-${pizzaId}`);
    const sizeSelect = document.getElementById(`size-${pizzaId}`);
    const crustSelect = document.getElementById(`crust-${pizzaId}`);
    const totalPriceSpan = document.getElementById(`total-price-${pizzaId}`);
    const crustAddText = document.getElementById(`crust-add-text-${pizzaId}`);
    
    if (!sizeSelect || !totalPriceSpan) return; 

    // 1. 기본 가격 및 사이즈 추출
    const selectedOptionValue = sizeSelect.value;
    const parts = selectedOptionValue.split('-');
    
    // selectedSize: 'L', basePrice: 28500
    const selectedSize = parts[0].trim().replace(/\(.*\)/, ''); 
    const basePriceText = parts[1] ? parts[1].replace(/,/g, '').replace('원', '').trim() : '0';
    let basePrice = parseInt(basePriceText) || 0;
    
    const selectedCrust = crustSelect ? crustSelect.value : 'original'; 
    
    let crustAddPrice = 0;
    let crustLimitMessage = '';
    let isCrustValid = true;
    
    if (crustAddText) crustAddText.textContent = ''; 

    // 2. 크러스트 유효성 및 추가금 계산
    if (crustSelect) {
        if (selectedSize === 'R') {
            if (selectedCrust !== 'original') {
                isCrustValid = false;
                crustLimitMessage = '* 레귤러 사이즈는 크러스트 변경이 불가합니다.';
            }
        } else if (selectedCrust === 'original') {
            crustAddPrice = 0;
        } else if (selectedCrust === 'thin') {
            if (selectedSize === 'P') {
                isCrustValid = false;
                crustLimitMessage = '* 씬(THIN) 크러스트는 파티(P) 사이즈에 적용 불가합니다.';
            } else {
                crustAddPrice = 0;
                crustAddText.textContent = `(씬 크러스트는 ${selectedSize} 사이즈 무료 변경입니다.)`;
            }
        } else {
            // 치즈롤, 골드링, 스파이시 갈릭, 크루아상
            crustAddPrice = CRUST_ADD_PRICES[selectedSize] ? CRUST_ADD_PRICES[selectedSize][selectedCrust] || 0 : 0;
        }
    }

    // 3. 최종 금액 계산 및 메시지 업데이트
    let totalPrice = basePrice;
    
    if (isCrustValid) {
        totalPrice = basePrice + crustAddPrice;
        if (crustAddPrice > 0 && crustAddText) {
            crustAddText.textContent = `(크러스트 추가금: +${formatPrice(crustAddPrice)}원)`;
        }
    } else if (crustAddText) {
         if (crustLimitMessage) crustAddText.textContent = crustLimitMessage;
    }
    
    totalPriceSpan.textContent = formatPrice(totalPrice);
}


// --- 할인 및 계산 로직 (이전 최종 menu.js에서 이관) ---

/**
 * 장바구니 항목의 기본 합계 금액을 계산 (할인/배달비 미포함)
 * @returns {object} baseTotal, onePlusOneDiscount, isFriday
 */
function calculateSubtotal() {
    let subtotal = 0;
    let pizzaPrices = []; 

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
    const isFriday = today.getDay() === 5; 
    let onePlusOneDiscount = 0;

    if (isFriday && pizzaPrices.length >= 2) {
        pizzaPrices.sort((a, b) => b - a);
        
        for (let i = 1; i < pizzaPrices.length; i += 2) {
            onePlusOneDiscount += pizzaPrices[i];
        }
    }
    
    return { 
        baseTotal: subtotal, 
        onePlusOneDiscount: onePlusOneDiscount,
        isFriday: isFriday
    };
}


/**
 * 최종 금액 계산 및 화면 업데이트 (bill.html에서 사용)
 */
function calculateFinalTotal() {
    // bill.html 페이지가 아닌 경우 실행하지 않음
    if (!document.getElementById('final-total-price')) return;

    const { baseTotal, onePlusOneDiscount, isFriday } = calculateSubtotal();
    let total = baseTotal;
    let totalDiscount = 0; 

    // 1. 1+1 할인 적용
    total -= onePlusOneDiscount;
    totalDiscount += onePlusOneDiscount;
    // bill.html에 promo-notice 요소가 있다고 가정
    const promoNotice = document.getElementById('promo-notice');
    if (promoNotice) promoNotice.style.display = isFriday && onePlusOneDiscount > 0 ? 'block' : 'none';

    // 2. 주문 방식 (배달/포장)
    const isPickup = document.getElementById('pickup') ? document.getElementById('pickup').checked : false;
    const deliveryFee = 3000;
    let pickupDiscount = 0;

    if (isPickup) {
        // 포장 30% 할인 적용
        pickupDiscount = Math.round(total * 0.3);
        total -= pickupDiscount;
        totalDiscount += pickupDiscount;
    } else {
        total += deliveryFee;
    }

    // 3. 제휴 할인 (1+1, 포장 할인과 중복 불가)
    let affiliateDiscount = 0;
    const affiliatedDiscountElement = document.getElementById('affiliated-discount');
    const selectedDiscount = affiliatedDiscountElement ? affiliatedDiscountElement.value : '';
    const discountMatch = selectedDiscount.match(/(\d+)%/);

    if (onePlusOneDiscount === 0 && !isPickup && discountMatch) { // 포장 할인과도 중복 불가 조건 추가
        const discountRate = parseInt(discountMatch[1], 10) / 100;
        affiliateDiscount = Math.round(total * discountRate);
        total -= affiliateDiscount;
        totalDiscount += affiliateDiscount;
    }

    // 4. 할인 코드 (20250923 = 20% 할인)
    let couponDiscount = 0;
    if (currentCoupon === '20250923') {
        couponDiscount = Math.round(total * 0.20);
        total -= couponDiscount;
        totalDiscount += couponDiscount;
    }


    // --- 최종 출력 ---
    document.getElementById('final-total-price').textContent = Math.max(0, total).toLocaleString() + '원';
    document.getElementById('discount-detail').textContent = `총 할인액: ${totalDiscount.toLocaleString()}원 ${!isPickup ? `+ 배달비 ${deliveryFee.toLocaleString()}원` : ''}`;
    
    // 총 금액 요약을 위해 baseTotal도 업데이트
    document.getElementById('base-total-price').textContent = baseTotal.toLocaleString() + '원';
}

/**
 * 계산서 페이지에서 장바구니 목록을 렌더링
 */
function renderCart() {
    const cartList = document.getElementById('cart-list');
    
    if (!cartList) return; 

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
        
        // item.priceText에 옵션 정보가 담겨 있음
        const displayName = item.name;
        const optionDisplay = item.priceText.replace(' - ', ' / ');


        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="item-details">
                <div class="name">${displayName} <span class="price-unit">(${optionDisplay})</span></div>
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
 * 할인 코드 적용 (bill.html에서 사용)
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
    calculateFinalTotal(); 
}


// --- 페이지 로드 및 이벤트 리스너 설정 ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 피자 메뉴 페이지 로직 (pizza.html에서 이관)
    if (document.getElementById('pizza-1')) { // 피자 메뉴 페이지임을 확인
        const pizzaCards = document.querySelectorAll('.pizza-card');

        pizzaCards.forEach(card => {
            const pizzaId = card.id.split('-')[1];
            const sizeSelect = document.getElementById(`size-${pizzaId}`);
            const crustSelect = document.getElementById(`crust-${pizzaId}`);
            const addButton = card.querySelector('.add-to-bill-btn');
            
            // 사이즈 선택 옵션 설정 (HTML data 속성 기반)
            const availableSizes = JSON.parse(card.getAttribute('data-available-sizes'));
            const prices = JSON.parse(card.getAttribute('data-prices'));
            
            if (sizeSelect) {
                sizeSelect.innerHTML = '';
                availableSizes.forEach(sizeCode => {
                    const price = prices[sizeCode];
                    const formattedPrice = formatPrice(price);
                    const option = document.createElement('option');
                    
                    // 옵션 값: 'L - 28,500원' (파싱에 용이하도록 구성)
                    option.value = `${sizeCode} - ${formattedPrice}원`;
                    option.textContent = `${SIZE_DETAILS[sizeCode].name}(${sizeCode}) - ${formattedPrice}원`;
                    
                    sizeSelect.appendChild(option);
                });
            }

            // 이벤트 리스너 등록
            if (sizeSelect) {
                sizeSelect.addEventListener('change', () => { updatePrice(pizzaId); });
            }
            if (crustSelect) {
                crustSelect.addEventListener('change', () => { updatePrice(pizzaId); });
            }

            if (addButton) {
                addButton.addEventListener('click', () => {
                    const selectedSizeValue = sizeSelect ? sizeSelect.value : (availableSizes.length > 0 ? `${availableSizes[0]} - ${formatPrice(prices[availableSizes[0]])}원` : 'L - 0원');
                    const selectedSizeCode = selectedSizeValue.split('-')[0].trim();
                    const selectedCrustOption = crustSelect ? crustSelect.options[crustSelect.selectedIndex] : { textContent: '오리지널', value: 'original' };
                    
                    // 가격 계산
                    const finalPriceText = document.getElementById(`total-price-${pizzaId}`).textContent.replace(/,/g, '');
                    const finalPrice = parseInt(finalPriceText) || 0;
                    
                    const pizzaName = card.getAttribute('data-name');
                    
                    // 장바구니에 넣을 옵션 디테일 텍스트 생성
                    const crustText = selectedCrustOption.textContent.split('(')[0].trim();
                    const optionDetail = `${SIZE_DETAILS[selectedSizeCode].name}(${selectedSizeCode}) - ${crustText}`;

                    // 장바구니 추가 로직 실행
                    addToCart(pizzaName, finalPrice, optionDetail);
                });
            }

            // 초기 가격 설정
            updatePrice(pizzaId);
        });
    }


    // 2. 계산서 페이지 로직 (bill.html에서 사용)
    if (document.getElementById('cart-list')) {
        renderCart();
        
        // 주문 방식, 제휴 할인 변경 시 최종 금액 재계산
        document.querySelectorAll('input[name="order-type"]').forEach(radio => {
            radio.addEventListener('change', calculateFinalTotal);
        });
        const affiliatedDiscountElement = document.getElementById('affiliated-discount');
        if (affiliatedDiscountElement) {
            affiliatedDiscountElement.addEventListener('change', calculateFinalTotal);
        }
        
        // 할인 코드 버튼에 이벤트 리스너 연결
        const couponButton = document.querySelector('.apply-coupon-btn');
        if(couponButton) {
            couponButton.addEventListener('click', applyCoupon);
        }
    }


    // 3. 사이드/음료 페이지 로직 (이전에 구현했던 메뉴 추가 로직이 사이드/음료 HTML에 있다면 활성화)
    // 현재 pizza.html만 제공되어 해당 로직은 제외합니다. 사이드/음료 메뉴는 수동으로 addToCart를 호출해야 합니다.
});

// 주문하기 버튼 기능 (간단 알림, bill.html에서 사용)
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
    
    if (document.getElementById('cart-list')) {
        renderCart();
    }
}