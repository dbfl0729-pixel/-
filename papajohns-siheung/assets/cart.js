// --- 1. 상수 및 유틸리티 함수 ---
const CART_KEY = 'papa_menu_cart';
const ORDER_TYPE_KEY = 'order_type';
const DISCOUNT_TYPE_KEY = 'selected_discount_type';
const DISCOUNT_VALUE_KEY = 'selected_discount_value';
const PHONE_NUMBER = '0313136995'; // 전화번호

// 금요일 1+1 이벤트 대상 메뉴 (시뮬레이션 데이터)
const BOGO_MENU_IDS = ['pizza_classic', 'pizza_gourmet', 'pizza_special'];
function formatPrice(amount) {
    return `₩${amount.toLocaleString('ko-KR')}`;
}

// 현재 요일 확인 (0:일 ~ 6:토)
function isFriday() {
    const today = new Date();
    // 5가 금요일 (Friday)
    return today.getDay() === 5;
    // 테스트를 위해 강제 금요일로 설정하려면: // return true;
}

function showAlert(message, bgColorClass) {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `fixed bottom-5 right-5 z-50 p-4 ${bgColorClass} text-white rounded-xl shadow-2xl transition-opacity duration-300 opacity-0`;
        alertBox.style.display = 'block';
        setTimeout(() => alertBox.style.opacity = '1', 10);
        setTimeout(() => {
            alertBox.style.opacity = '0';
            setTimeout(() => alertBox.style.display = 'none', 300);
        }, 3500);
    }
}

// --- 2. Local Storage 관리 함수 ---
function getCart() {
    try {
        const cartString = localStorage.getItem(CART_KEY);
        if (!cartString) {
            const initialCart = [
                { id: 'pizza_classic', name: '클래식 피자', price: 20000, quantity: 1, crust: '치즈 크러스트', crustPrice: 4000 },
                { id: 'pizza_gourmet', name: '고메 피자', price: 28000, quantity: 2, crust: '오리지널', crustPrice: 0 },
                { id: 'side_cola', name: '콜라 1.25L', price: 3000, quantity: 1, crust: null, crustPrice: 0 },
                { id: 'pizza_special', name: '스페셜 피자', price: 25000, quantity: 1, crust: '골드 엣지', crustPrice: 5000 },
            ];
            saveCart(initialCart);
            return initialCart;
        }
        return JSON.parse(cartString);
    } catch (e) {
        console.error("장바구니 로드 오류:", e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("장바구니 저장 오류:", e);
    }
}

function getOrderType() {
    return localStorage.getItem(ORDER_TYPE_KEY) || 'delivery';
}

function saveOrderType(type) {
    localStorage.setItem(ORDER_TYPE_KEY, type);
}

function saveSelectedDiscount(type, value) {
    localStorage.setItem(DISCOUNT_TYPE_KEY, type);
    localStorage.setItem(DISCOUNT_VALUE_KEY, value);
}

function getSelectedDiscount() {
    return {
        type: localStorage.getItem(DISCOUNT_TYPE_KEY) || 'none',
        value: localStorage.getItem(DISCOUNT_VALUE_KEY) || '0'
    };
}

// --- 3. 할인 입력 로직 ---
window.showDiscountTab = function(tabId) {
    if (isFriday() && calculateBOGODiscount(getCart()).discount > 0) {
         showAlert('1+1 이벤트 적용 중에는 타 할인을 선택할 수 없습니다.', 'bg-red-500');
         return;
    }

    const tabs = document.querySelectorAll('.discount-tab');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.add('hidden'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.querySelector(`.tab-button[onclick*='${tabId}']`).classList.add('active');
    saveSelectedDiscount('none', '0');
    calculateTotal();
}

window.applyCouponCode = function() {
    const code = document.getElementById('coupon-code').value.trim();
    const messageElement = document.getElementById('coupon-message');
    messageElement.textContent = '';
    let discountRate = 0;

    if (isFriday() && calculateBOGODiscount(getCart()).discount > 0) {
         messageElement.textContent = '1+1 이벤트 적용 중에는 쿠폰을 사용할 수 없습니다.';
         messageElement.classList.remove('text-green-500');
         messageElement.classList.add('text-red-500');
         saveSelectedDiscount('none', '0');
         calculateTotal();
         return;
    }

    if (code === 'VIP30') {
        discountRate = 0.30;
        messageElement.textContent = `VIP 30% 할인 쿠폰이 적용되었습니다.`;
        messageElement.classList.remove('text-red-500');
        messageElement.classList.add('text-green-500');
    } else if (code === 'WELCOME10') {
        discountRate = 0.10;
        messageElement.textContent = `WELCOME 10% 할인 쿠폰이 적용되었습니다.`;
        messageElement.classList.remove('text-red-500');
        messageElement.classList.add('text-green-500');
    } else if (code.length > 0) {
        messageElement.textContent = '유효하지 않거나 만료된 쿠폰 코드입니다.';
        messageElement.classList.remove('text-green-500', 'text-red-500');
        messageElement.classList.add('text-red-500');
    } else {
         messageElement.textContent = '쿠폰 코드를 입력해 주세요.';
    }

    if (discountRate > 0) {
        saveSelectedDiscount('coupon', discountRate.toString());
        calculateTotal();
    } else {
        saveSelectedDiscount('none', '0');
        calculateTotal();
    }
}

window.applyCardDiscount = function() {
    const cardNumber = document.getElementById('card-number').value.trim();
    const messageElement = document.getElementById('card-message');
    messageElement.textContent = '';
    let discountRate = 0;

    if (isFriday() && calculateBOGODiscount(getCart()).discount > 0) {
         messageElement.textContent = '1+1 이벤트 적용 중에는 카드 할인을 사용할 수 없습니다.';
         messageElement.classList.remove('text-green-500');
         messageElement.classList.add('text-red-500');
         saveSelectedDiscount('none', '0');
         calculateTotal();
         return;
    }

    if (cardNumber.length === 16 && cardNumber.startsWith('9999')) {
        discountRate = 0.30;
        messageElement.textContent = `카드사 D 제휴 30% 할인이 적용되었습니다.`;
        messageElement.classList.remove('text-red-500');
        messageElement.classList.add('text-green-500');
    } else if (cardNumber.length === 16 && cardNumber.startsWith('1111')) {
        discountRate = 0.15;
        messageElement.textContent = `카드사 E 제휴 15% 할인이 적용되었습니다.`;
        messageElement.classList.remove('text-red-500');
        messageElement.classList.add('text-green-500');
    } else if (cardNumber.length > 0) {
        messageElement.textContent = '유효하지 않은 카드 번호이거나 제휴 카드가 아닙니다.';
        messageElement.classList.remove('text-green-500', 'text-red-500');
        messageElement.classList.add('text-red-500');
    } else {
         messageElement.textContent = '카드 번호를 입력해 주세요.';
    }

    if (discountRate > 0) {
        saveSelectedDiscount('card', discountRate.toString());
        calculateTotal();
    } else {
        saveSelectedDiscount('none', '0');
        calculateTotal();
    }
}


// --- 4. 가격 계산 로직 (할인 및 행사 적용 핵심 로직) ---

function calculateBOGODiscount(cart) {
    let totalBOGODiscount = 0;
    const bogoItems = [];

    // 1. 1+1 대상 피자만 추출 및 평탄화 (크러스트 금액 제외한 본품 가격 기준)
    cart.forEach(item => {
        if (BOGO_MENU_IDS.includes(item.id) && item.quantity > 0) {
            for (let i = 0; i < item.quantity; i++) {
                // 고유 인덱스를 포함하여 나중에 어떤 피자가 무료인지 식별
                bogoItems.push({
                    cartIndex: cart.findIndex(c => c.id === item.id && c.quantity === item.quantity),
                    itemIndex: cart.indexOf(item),
                    unitIndex: i,
                    id: item.id,
                    price: item.price, // 피자 본품 가격
                    crustPrice: item.crustPrice,
                    isFree: false // 기본값
                });
            }
        }
    });
    const numPizzas = bogoItems.length;

    if (numPizzas < 2) {
        return { discount: 0, detail: '', applied: false, appliedItems: [] };
    }

    // 2. 피자 가격을 기준으로 내림차순 정렬 (비싼 피자가 앞으로)
    bogoItems.sort((a, b) => b.price - a.price);

    // 3. 1+1 계산: 비싼 것부터 순서대로 묶음 (2개 묶음마다 싼 피자 가격을 할인)
    const numFreePizzas = Math.floor(numPizzas / 2);
    for (let i = 0; i < numFreePizzas; i++) {
        // 할인 대상은 항상 현재 묶음에서 가격이 싼 피자 (정렬된 배열의 뒤쪽)
        const freePizzaIndex = numPizzas - 1 - i;
        totalBOGODiscount += bogoItems[freePizzaIndex].price;
        bogoItems[freePizzaIndex].isFree = true; // 🎯 무료 피자에 플래그 설정
    }

    let detail = `1+1 이벤트 적용: 총 ${numPizzas}개 중 ${numFreePizzas}개 무료. (비싼 피자 ${numPizzas - numFreePizzas}개 가격 결제)`;
    
    // 🎯 무료로 처리된 피자 목록을 반환하여 renderCart에서 사용
    return { 
        discount: totalBOGODiscount, 
        detail: detail, 
        applied: true, 
        appliedItems: bogoItems // 정렬 및 isFree 플래그가 설정된 목록
    };
}

window.calculateTotal = function() {
    const cart = getCart();
    let subtotal = 0; 
    let pizzaOnlySubtotal = 0; 
    
    let discountAmount = 0;
    let discountDetail = '';
    let bogoApplied = false;

    const bogoResult = calculateBOGODiscount(cart);
    if (isFriday() && bogoResult.applied) {
        bogoApplied = true;
    }

    // 주문 방식 UI 제어
    const orderTypeSelect = document.getElementById('order-type');
    const orderTypeOverride = document.getElementById('bogo-order-override');
    if (bogoApplied) {
        // 1+1 적용 시 '방문 포장'으로 강제 고정
        orderTypeSelect.value = 'pickup';
        orderTypeSelect.disabled = true;
        orderTypeOverride.classList.remove('hidden');
        saveOrderType('pickup'); 
    } else {
        orderTypeSelect.disabled = false;
        orderTypeOverride.classList.add('hidden');
    }


    // 1. 상품 금액 (Subtotal) 및 크러스트 금액 분리 계산
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity + (item.crustPrice * item.quantity);
        subtotal += itemTotal;
        
        // 통신사/쿠폰 할인은 피자 본품 금액에서만 적용 (크러스트 제외)
        if (item.id.startsWith('pizza')) {
           pizzaOnlySubtotal += item.price * item.quantity;
        }
    });
    if (subtotal === 0) {
        updateSummaryUI(0, 0, 0, 0, '');
        return;
    }
    
    // 2. **금요일 1+1 이벤트** 적용 확인 및 할인액 설정
    if (bogoApplied) {
        // 1+1 할인액은 피자 본품 가격 중 싼 가격의 합계
        discountAmount = bogoResult.discount;
        discountDetail = bogoResult.detail;
    }
    
    // UI에 금요일 알림 표시/숨김
    document.getElementById('today-is-friday-alert').classList.toggle('hidden', !isFriday());
    document.getElementById('discount-section').classList.toggle('opacity-30', bogoApplied);
    document.getElementById('discount-section').classList.toggle('pointer-events-none', bogoApplied);
    document.getElementById('bogo-override-message').classList.toggle('hidden', !bogoApplied);


    // 3. 타 할인 적용 로직 (1+1이 적용되지 않았을 경우에만)
    if (!bogoApplied) {
        const orderType = getOrderType();
        const selectedDiscount = getSelectedDiscount();
        let finalDiscountRate = 0;
        let discountSource = '할인 미적용';

        // 3-1. 방문 포장 할인 (30%) - 주문 방식에 따른 할인 (최우선)
        if (orderType === 'pickup') {
            const pickupDiscountRate = 0.30;
            finalDiscountRate = pickupDiscountRate;
            discountSource = `[방문 포장] ${finalDiscountRate * 100}% 할인`;
        } 
        // 3-2. 배달 주문 시 (선택된) 쿠폰/카드/통신사 할인 적용
        else if (orderType === 'delivery' && selectedDiscount.type !== 'none') {
            const rate = parseFloat(selectedDiscount.value);
            if (!isNaN(rate) && rate > 0 && rate <= 0.5) { 
                finalDiscountRate = rate;
                const typeName = selectedDiscount.type === 'telecom' ? '통신사' : selectedDiscount.type === 'coupon' ? '쿠폰 코드' : '제휴 카드';
                discountSource = `[${typeName}] ${finalDiscountRate * 100}% 할인`;
            }
        }
        
        // 할인 계산 기준 금액 설정
        // 방문포장 할인은 subtotal (크러스트 포함) 기준. 타 할인은 pizzaOnlySubtotal (크러스트 제외) 기준.
        let baseForDiscount = orderType === 'pickup' ? subtotal : pizzaOnlySubtotal;
        
        if (finalDiscountRate > 0) {
            discountAmount = Math.round(baseForDiscount * finalDiscountRate);
            discountDetail = `${discountSource} 적용: ${formatPrice(baseForDiscount)}의 ${finalDiscountRate * 100}% (${formatPrice(discountAmount)})`;
        } else if (orderType === 'delivery' && selectedDiscount.type !== 'none') {
             discountDetail = `할인 미적용.`;
        }
    }


    // 4. 배달 요금 (Fee) 계산
    let fee = 0;
    // 1+1 적용 시 포장 고정이므로 배달 요금 0원
    if (!bogoApplied && getOrderType() === 'delivery') {
        fee = 3000;
    }

    // 5. 최종 금액 계산
    const totalAmount = Math.max(0, subtotal - discountAmount + fee);
    
    // 6. UI 업데이트
    updateSummaryUI(subtotal, discountAmount, fee, totalAmount, totalAmount > 0 ? discountDetail : '');
}

// --- 5. UI 렌더링 함수 ---

function renderCart() {
    const container = document.getElementById('cart-items-list');
    const cart = getCart();
    container.innerHTML = '';
    
    const bogoResult = calculateBOGODiscount(cart);
    const isBOGOApplied = isFriday() && bogoResult.applied;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center py-8 text-gray-500">장바구니가 비어 있습니다. 메뉴를 담아주세요!</p>';
    } else {
        
        // 장바구니 아이템별 렌더링
        cart.forEach((item, index) => {
            let itemPrice = item.price;
            let itemCrustPrice = item.crustPrice;
            let totalItemCost = (itemPrice * item.quantity) + (itemCrustPrice * item.quantity);
            let discountTag = '';
            
            // 🎯 1+1 할인 태그 및 가격 계산 (UI 표시용)
            if (isBOGOApplied && BOGO_MENU_IDS.includes(item.id)) {
                
                // 해당 장바구니 항목 내에서 무료 피자 개수 계산
                let freeCountInItem = 0;
                if (bogoResult.appliedItems) {
                    freeCountInItem = bogoResult.appliedItems.filter(p => 
                        // itemIndex를 사용하여 해당 장바구니 항목의 피자인지 식별
                        p.itemIndex === index && p.isFree
                    ).length;
                }
                
                // 할인 가격 계산
                const paidCount = item.quantity - freeCountInItem;
                const paidPrice = (itemPrice * paidCount) + (itemCrustPrice * item.quantity); // 크러스트는 모두 결제
                
                if (freeCountInItem > 0) {
                    discountTag = `<span class="text-[var(--bogo-color)] font-bold text-xs ml-2">[1+1 무료 ${freeCountInItem}개]</span>`;
                    totalItemCost = paidPrice; // UI에 보여줄 최종 가격
                }
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center border-b last:border-b-0 py-3';

            // 옵션 표시 (크러스트)
            const optionText = item.crust ?
                `<span class="text-sm font-medium text-gray-500 block mt-1">크러스트: ${item.crust} (+${formatPrice(item.crustPrice)})</span>` : '';
            
            itemElement.innerHTML = `
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-900 flex items-center">${item.name} ${discountTag}</p>
                    ${optionText}
                    <p class="text-sm text-gray-500">${formatPrice(item.price)} x ${item.quantity}</p>
                </div>
                
                <div class="flex items-center space-x-2 mr-4">
                    <button onclick="updateQuantity(${index}, -1)" class="w-7 h-7 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition">-</button>
                    <span class="font-semibold w-4 text-center">${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)" class="w-7 h-7 bg-[var(--primary-color)] text-white rounded-full hover:bg-green-700 transition">+</button>
                </div>

                <span class="font-bold text-lg w-24 text-right">
                    ${isBOGOApplied && BOGO_MENU_IDS.includes(item.id) && item.quantity > 0 && (item.quantity > (item.quantity - freeCountInItem)) ? `<del class="text-gray-400 text-sm block">${formatPrice((item.price * item.quantity) + (item.crustPrice * item.quantity))}</del>` : ''}
                    ${formatPrice(totalItemCost)}
                </span>
      
                <button onclick="removeItem(${index})" class="ml-4 text-gray-400 hover:text-red-500 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            `;
            container.appendChild(itemElement);
        });
    }

    calculateTotal(); 
}

function updateSummaryUI(subtotal, discountAmount, fee, totalAmount, discountDetail) {
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('discount-amount').textContent = `- ${formatPrice(discountAmount)}`;
    document.getElementById('total-amount').textContent = formatPrice(totalAmount);
    
    // 🎯 주문하기 버튼 텍스트 변경 (결제 단계로의 이동을 암시)
    document.getElementById('checkout-button').textContent = `결제하기 (${formatPrice(totalAmount)})`;

    const deliveryFeeDisplay = document.getElementById('delivery-fee');
    if (fee > 0) {
        deliveryFeeDisplay.textContent = formatPrice(fee);
        deliveryFeeDisplay.classList.remove('text-gray-400');
    } else {
        deliveryFeeDisplay.textContent = '무료 (포장)';
        deliveryFeeDisplay.classList.add('text-gray-400');
    }

    const discountDetailElement = document.getElementById('discount-detail');
    if (discountDetail && discountAmount > 0) {
        discountDetailElement.textContent = discountDetail;
        discountDetailElement.classList.remove('hidden');
    } else {
        discountDetailElement.classList.add('hidden');
    }
}

// 🎯 메뉴 페이지로 돌아가기 (추가된 기능)
window.goToMenu = function() {
    window.location.href = 'menu.html'; 
}

// --- 6. 초기화 함수 및 아이템 관리 ---
document.addEventListener('DOMContentLoaded', function() {
    const orderTypeSelect = document.getElementById('order-type');
    if (orderTypeSelect) {
        orderTypeSelect.value = getOrderType();
    }

    const selectedDiscount = getSelectedDiscount();
    const telecomSelect = document.getElementById('telecom-select');
    if (telecomSelect && selectedDiscount.type === 'telecom') {
        telecomSelect.value = selectedDiscount.value;
    }
    
    renderCart();
    showDiscountTab('telecom');
});

window.updateQuantity = function(index, change) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
            showAlert('최소 수량은 1개입니다. 삭제하려면 휴지통 아이콘을 눌러주세요.', 'bg-red-500');
        }
        saveCart(cart);
        renderCart();
    }
}

window.removeItem = function(index) {
    // 🎯 커스텀 확인 모달을 호출하도록 변경
    showConfirmModal(index);
}

// ----------------------------------------------------
// [추가] 팝업에서 "확인" 버튼 클릭 시 실행될 최종 삭제 함수
// ----------------------------------------------------
window.confirmRemove = function(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    showAlert('메뉴가 장바구니에서 삭제되었습니다.', 'bg-red-500');
    hideConfirmModal(); // 모달 닫기 함수 호출
}