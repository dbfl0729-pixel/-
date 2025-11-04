<script>
    // 크러스트 사이즈별 추가금액 정보 (이전과 동일)
    const CRUST_ADD_PRICES = {
        'L': { 'cheeseroll': 4000, 'goldring': 4000, 'spicygarlic': 4000, 'croissant': 6000 },
        'F': { 'cheeseroll': 5000, 'goldring': 5000, 'spicygarlic': 5000, 'croissant': 6000 },
        'P': { 'cheeseroll': 6000, 'goldring': 6000, 'spicygarlic': 6000, 'croissant': 6000 },
    };

    // 사이즈 코드별 이름 정보 (이전과 동일)
    const SIZE_DETAILS = {
        'R': { name: '레귤러' },
        'L': { name: '라지' },
        'F': { name: '패밀리' },
        'P': { name: '파티' }
    };

    // 금액을 쉼표 형식으로 변환하는 함수 (이전과 동일)
    function formatPrice(price) {
        return price.toLocaleString('ko-KR');
    }

    // 선택된 옵션에 따라 총 가격을 업데이트하는 함수 (이전과 동일)
    function updatePrice(pizzaId) {
        const card = document.getElementById(`pizza-${pizzaId}`);
        const sizeSelect = document.getElementById(`size-${pizzaId}`);
        const crustSelect = document.getElementById(`crust-${pizzaId}`);
        const totalPriceSpan = document.getElementById(`total-price-${pizzaId}`);
        const crustAddText = document.getElementById(`crust-add-text-${pizzaId}`);
        
        if (!sizeSelect || !totalPriceSpan) return;

        const selectedOptionValue = sizeSelect.value;

        if (selectedOptionValue === '0' || selectedOptionValue === '사이즈를 선택하세요') {
            totalPriceSpan.textContent = '0';
            if (crustAddText) crustAddText.textContent = '';
            return;
        }

        const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
        const selectedSizeCode = selectedSizeOption.getAttribute('data-size-code');
        
        const basePrice = parseInt(selectedOptionValue) || 0; 
        const selectedCrust = crustSelect ? crustSelect.value : 'original'; 
        
        let crustAddPrice = 0;
        let crustLimitMessage = '';
        let isCrustValid = true;
        
        if (crustAddText) crustAddText.textContent = ''; 

        // 크러스트 추가금 계산 로직 (이전과 동일)
        if (crustSelect && selectedSizeCode) { 
            if (selectedCrust === 'thin') {
                if (selectedSizeCode === 'P') {
                    isCrustValid = false;
                    crustLimitMessage = '* 씬(THIN) 크러스트는 파티(P) 사이즈에 적용 불가하며, 오리지널로 계산됩니다.';
                    crustAddPrice = 0; 
                } else {
                    crustAddPrice = 0;
                    crustAddText.textContent = `(씬 크러스트는 ${selectedSizeOption.textContent.split('(')[0].trim()} 사이즈 무료 변경입니다.)`;
                }
            } 
            else if (['cheeseroll', 'goldring', 'spicygarlic', 'croissant'].includes(selectedCrust)) {
                if (selectedSizeCode === 'R') {
                    isCrustValid = false;
                    crustLimitMessage = '* 레귤러(R) 사이즈는 크러스트 변경이 불가하며, 오리지널로 계산됩니다.';
                    crustAddPrice = 0;
                } else {
                    crustAddPrice = CRUST_ADD_PRICES[selectedSizeCode] ? CRUST_ADD_PRICES[selectedSizeCode][selectedCrust] || 0 : 0;
                }
            } else { 
                crustAddPrice = 0;
            }

            if (!isCrustValid && crustLimitMessage) {
                crustAddText.textContent = crustLimitMessage;
            } else if (crustAddPrice > 0 && crustAddText) {
                crustAddText.textContent = `(크러스트 추가금: +${formatPrice(crustAddPrice)}원)`;
            }

        } 

        const totalPrice = basePrice + crustAddPrice;
        totalPriceSpan.textContent = formatPrice(totalPrice);
    }
    
    /**
     * 장바구니/계산서 로직
     * 선택된 피자 정보를 localStorage에 저장하고 계산서 페이지로 이동합니다.
     */
    function addToCart(pizzaId) {
        const card = document.getElementById(`pizza-${pizzaId}`);
        const sizeSelect = document.getElementById(`size-${pizzaId}`);
        const crustSelect = document.getElementById(`crust-${pizzaId}`);
        const totalPriceSpan = document.getElementById(`total-price-${pizzaId}`);
        
        const pizzaName = card.getAttribute('data-name');
        
        const sizeOption = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex] : null;

        // 필수 선택 검증: 사이즈 선택
        if (!sizeOption || sizeOption.value === '0') {
            alert('🍕 사이즈를 먼저 선택해주세요!');
            return;
        }

        const sizeCode = sizeOption.getAttribute('data-size-code');
        const selectedCrustOption = crustSelect ? crustSelect.options[crustSelect.selectedIndex] : null;

        // 최종 금액 가져오기 (쉼표 제거)
        const finalPrice = parseInt(totalPriceSpan.textContent.replace(/,/g, ''));
        const basePrice = parseInt(sizeOption.value);
        
        // 크러스트 추가금 계산
        let crustAddPrice = 0;
        if (selectedCrustOption && selectedCrustOption.value !== 'original' && sizeCode && sizeCode !== 'R' && sizeCode !== 'P') {
            crustAddPrice = CRUST_ADD_PRICES[sizeCode] ? CRUST_ADD_PRICES[sizeCode][selectedCrustOption.value] || 0 : 0;
        } else if (selectedCrustOption && selectedCrustOption.value === 'croissant') {
             // 크루아상은 사이즈별 가격이 고정되어있으므로 별도 처리 필요
             if (sizeCode === 'L' || sizeCode === 'F' || sizeCode === 'P') crustAddPrice = 6000;
        }
        
        // 저장할 항목 객체
        const item = {
            id: `p-${pizzaId}-${Date.now()}`, // 고유 ID
            type: 'pizza',
            name: pizzaName,
            size: sizeOption.textContent.split('-')[0].trim(), // "라지(L)"
            crust: selectedCrustOption ? selectedCrustOption.textContent.split('(')[0].trim() : '오리지널',
            basePrice: basePrice,
            crustAdd: finalPrice - basePrice, // 계산된 크러스트 추가금
            finalPrice: finalPrice,
            quantity: 1
        };

        // localStorage에서 현재 장바구니 항목을 가져오거나, 없으면 빈 배열로 초기화
        let cart = JSON.parse(localStorage.getItem('orderCart')) || [];
        
        // 장바구니에 새 항목 추가
        cart.push(item);
        
        // localStorage에 업데이트된 장바구니 저장
        localStorage.setItem('orderCart', JSON.stringify(cart));

        alert(`✅ ${item.name} (${item.size}, ${item.crust})가 계산서에 담겼습니다!`);

        // 계산서 페이지로 이동
        window.location.href = 'bill.html'; 
    }

    // 초기 로드 및 이벤트 리스너 설정
    document.addEventListener('DOMContentLoaded', () => {
        const pizzaCards = document.querySelectorAll('.pizza-card');

        pizzaCards.forEach(card => {
            const pizzaId = card.id.split('-')[1];
            const sizeSelect = document.getElementById(`size-${pizzaId}`);
            const crustSelect = document.getElementById(`crust-${pizzaId}`);
            const addButton = card.querySelector('.add-to-bill-btn');
            
            const availableSizes = JSON.parse(card.getAttribute('data-available-sizes'));
            const prices = JSON.parse(card.getAttribute('data-prices'));
            
            // 1. 사이즈 옵션 생성 및 가격/사이즈 코드 설정 (이전과 동일)
            if (sizeSelect && availableSizes && prices) {
                if (sizeSelect.options.length <= 1) { 
                    sizeSelect.innerHTML = ''; 
                    
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '0'; 
                    defaultOption.textContent = '사이즈를 선택하세요';
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    defaultOption.setAttribute('data-size-code', '');
                    sizeSelect.appendChild(defaultOption);

                    availableSizes.forEach(sizeCode => {
                        const price = prices[sizeCode];
                        const formattedPrice = formatPrice(price);
                        const option = document.createElement('option');
                        
                        option.value = price; 
                        option.textContent = `${SIZE_DETAILS[sizeCode].name}(${sizeCode}) - ${formattedPrice}원`;
                        option.setAttribute('data-size-code', sizeCode); 
                        
                        sizeSelect.appendChild(option);
                    });
                }
            }

            // 이벤트 리스너 등록 (가격 업데이트)
            if (sizeSelect) {
                sizeSelect.addEventListener('change', () => { updatePrice(pizzaId); }); 
            }
            if (crustSelect) {
                crustSelect.addEventListener('change', () => { updatePrice(pizzaId); });
            }

            // 🎯 2. 장바구니 버튼에 `addToCart` 함수 연결 (수정된 부분)
            if (addButton) {
                // 기존의 익명 함수를 제거하고, 명시적으로 `addToCart` 호출
                addButton.addEventListener('click', () => {
                    addToCart(pizzaId);
                });
            }

            // 3. 초기 가격 설정
            if (!sizeSelect || sizeSelect.options.length <= 2) { 
                updatePrice(pizzaId);
            }
        });
    });
</script>