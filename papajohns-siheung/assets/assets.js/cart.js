// assets/js/cart.js

// 1+1 이벤트가 적용되는 피자 ID 목록 (총 7종)
const EVENT_PIZZA_IDS = ['P05', 'P06', 'P08', 'P09', 'P10', 'P15', 'P16'];

// 크러스트 정보 (가격은 L/F/P 사이즈 기준 추가금)
// *주의: R 사이즈는 추가금이 없는 것으로 처리합니다.
const CRUST_OPTIONS = [
    { value: 'original', name: '오리지널 크러스트 (추가금 없음)', desc: '쫄깃하고 고소한 기본 맛', priceL: 0, priceF: 0, priceP: 0 },
    { value: 'thin', name: '씬 (Thin) (F 사이즈 무료 변경)', desc: '바삭한 식감', priceL: 0, priceF: 0, priceP: 0 },
    { value: 'cheeseroll', name: '치즈롤 (추가금 발생)', desc: '스트링 치즈의 유혹', priceL: 4000, priceF: 5000, priceP: 6000 },
    { value: 'goldring', name: '골드링 (추가금 발생)', desc: '고구마 무스와 스트링 치즈', priceL: 4000, priceF: 5000, priceP: 6000 },
    { value: 'spicygarliccheeseroll', name: '스파이시 갈릭 치즈롤 (추가금 발생)', desc: '강렬한 매콤함과 치즈롤', priceL: 4000, priceF: 5000, priceP: 6000 },
    { value: 'croissant', name: '크루아상 (추가금 발생)', desc: '바삭하고 풍부한 크루아상 크러스트', priceL: 4000, priceF: 5000, priceP: 6000 },
];

// **********************************************
// 25가지 피자 메뉴 (사용자 제공 데이터 기준)
// **********************************************
const PIZZA_MENU = [
    // NEW & PREMIUM
    { 
        id: 'P01', name: '바베큐 숏립 크런치', category: 'NEW_PREMIUM', 
        desc: '한 판 가득 소갈비, 오리지널 아메리칸 BBQ! 치즈와 바삭한 식감까지 더한 리얼 고기 피자', 
        prices: { L: 34500, F: 41900 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P02', name: '멜로우 콘크림', category: 'NEW_PREMIUM', 
        desc: '부드러운 옥수수크림과 콘&파인애플을 더한 달콤한 피자', 
        prices: { L: 27500, F: 33900, P: 41500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P03', name: '스타라이트 바질', category: 'NEW_PREMIUM', 
        desc: '입안 가득 바질의 향긋함과 고소한 치즈의 풍미가 느껴지는 오직 스타라이트 바질만의 특별한 별모양 프리미엄 피자', 
        prices: { L: 33500, F: 39900, P: 48500 },
        crustOptions: ['original'] // 크러스트 선택 없음 -> original 고정
    },
    { 
        id: 'P04', name: '더블 핫 앤 스파이시 멕시칸', category: 'SPECIALTY', 
        desc: '새로운 맛의 스파이시 갈릭 치즈롤과 할라페뇨의 만남으로 강렬한 매콤함이 가득한 피자', 
        prices: { L: 33500, F: 39900 },
        crustOptions: ['spicygarliccheeseroll'] // 스파이시갈릭치즈롤만 선택 가능
    },

    // BEST SELLER (1+1 행사 피자 포함)
    { 
        id: 'P05', name: '수퍼 파파스(best)', category: 'BEST', 
        desc: '신선한 토마토 소스 위에 각종 고기와 채소가 듬뿍 토핑된 파파존스의 베스트 피자', 
        prices: { R: 19900, L: 28500, F: 33900, P: 42500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },
    { 
        id: 'P06', name: '존스 페이버릿(best)', category: 'BEST', 
        desc: '이탈리안 소시지, 페퍼로니와 6종의 치즈가 만들어 내는 진한 풍미의 파파존스 베스트 셀러 피자', 
        prices: { L: 29500, F: 34900, P: 45500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },
    { 
        id: 'P07', name: '올미트', category: 'BEST', 
        desc: '페퍼로니, 햄, 이탈리안 소시지, 비프토핑까지 파파존스의 엄선된 고기토핑으로 꽉 채운 환상의 미트 피자', 
        prices: { R: 19900, L: 29500, F: 34900, P: 45500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P08', name: '스파이시 치킨랜치', category: 'BEST', 
        desc: '은은한 향과 맛의 랜치 소스, 그릴드 치킨, 상큼한 토마토와 할라페뇨가 토핑의 피자', 
        prices: { R: 19900, L: 29500, F: 34900, P: 43500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },
    { 
        id: 'P09', name: '아이리쉬 포테이토', category: 'BEST', 
        desc: '진한 갈릭 소스와 담백한 포테이토 청크의 조화로 누구에게나 사랑 받는 베스트 셀러 피자', 
        prices: { R: 18900, L: 27500, F: 32900, P: 40500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },
    { 
        id: 'P10', name: '치킨 바베큐', category: 'BEST', 
        desc: '새콤달콤한 타바스코 BBQ 소스와 두툼한 그릴드 치킨이 어우러져 파파존스만의 특별한 맛을 내는 치킨 피자', 
        prices: { R: 18900, L: 27500, F: 32900, P: 40500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },

    // SPECIALTY & THIN
    { 
        id: 'P11', name: '크리스피 치즈 페퍼로니 피자', category: 'THIN_EXCL', 
        desc: '파마산+로마노 치즈가 더해져 더욱 바삭함과 치즈의 고소한 풍미를 느낄 수 있는 TH전용 피자', 
        prices: { F: 31900 }, 
        crustOptions: ['thin'] // 씬 크러스트 고정
    },
    { 
        id: 'P12', name: '크리스피 치즈 트리플 피자', category: 'THIN_EXCL', 
        desc: '바삭한 식감의 투치즈 크러스트 엣지와 6가지 치즈가 조화를 이루는 TH전용 피자', 
        prices: { F: 33900 },
        crustOptions: ['thin'] // 씬 크러스트 고정
    },
    { 
        id: 'P13', name: '햄 머쉬룸 식스 치즈', category: 'SPECIALTY', 
        desc: '알프레도 소스, 양송이 버섯, 햄이 6가지 치즈와 조화를 이루는 피자', 
        prices: { L: 28500, F: 33900, P: 42500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P14', name: '위스콘신 치즈 포테이토', category: 'SPECIALTY', 
        desc: '진한 맥앤치즈 소스에 6가지 치즈, 햄, 베이컨, 페퍼로니, 포테이토 청크의 조화', 
        prices: { L: 29500, F: 35900, P: 45500 },
        crustOptions: ['cheeseroll', 'goldring', 'spicygarliccheeseroll', 'croissant'] // 오리지널/씬 불가
    },
    { 
        id: 'P15', name: '더블 치즈버거', category: 'SPECIALTY', 
        desc: '제스티 버거 소스위에 비프와 상큼한 토마토, 피클이 어우진 풍부한 맛을 즐길 수 있는 피자', 
        prices: { L: 29500, F: 34900, P: 43500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },
    { 
        id: 'P16', name: '프리미엄 직화불고기', category: 'SPECIALTY', 
        desc: '정통 직화 불고기, 신선한 채소 토핑으로 누구나 좋아할수 있는 파파존스의 스테디 셀러 피자', 
        prices: { L: 29500, F: 34900, P: 43500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value) // 1+1 행사 피자
    },
    { 
        id: 'P17', name: '식스 치즈', category: 'SPECIALTY', 
        desc: '6종의 치즈 맛을 풍부하게 느낄 수 있는 정통 치즈피자', 
        prices: { L: 26500, F: 31900, P: 39500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P18', name: '스파이시 이탈리안', category: 'SPECIALTY', 
        desc: '듬뿍 들어간 이탈리안 소시지와 크러쉬드 레드페퍼의 매운맛이 어우러진 뛰어난 맛과 향의 피자', 
        prices: { L: 27500, F: 33900, P: 40500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P19', name: '슈림프 알프레도', category: 'THIN_EXCL', 
        desc: '얇고 바삭한 씬도우 위에 부드러운 알프레도 소스와 탱탱한 새우가 만들어내는 풍부한 맛이 특징인 피자', 
        prices: { F: 34900 },
        crustOptions: ['thin'] // 씬 크러스트 고정
    },

    // CLASSIC & VEGAN
    { 
        id: 'P20', name: '마가리타', category: 'CLASSIC', 
        desc: '파파존스 특유의 진한 토마토 소스와 최상급 모짜렐라 치즈가 토핑된 치즈피자', 
        prices: { R: 16900, L: 23500, F: 28900, P: 36500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P21', name: '페퍼로니', category: 'CLASSIC', 
        desc: '쫄깃쫄깃 짭조름한 페퍼로니와 고소한 치즈가 토핑된 피자', 
        prices: { R: 17900, L: 25500, F: 30900, P: 38500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P22', name: '하와이안', category: 'CLASSIC', 
        desc: '새콤달콤한 파인애플과 햄, 쫀득한 모짜렐라 치즈 토핑으로 상큼한 맛이 특징인 피자', 
        prices: { R: 17900, L: 26500, F: 32900, P: 39500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P23', name: '가든 스페셜', category: 'CLASSIC', 
        desc: '양송이, 청피망, 올리브, 양파, 토마토등의 신선한채소가 토핑된 피자', 
        prices: { R: 17900, L: 26500, F: 31900, P: 39500 },
        crustOptions: CRUST_OPTIONS.map(c => c.value)
    },
    { 
        id: 'P24', name: '그린잇 식물성 마가리타', category: 'VEGAN', 
        desc: '전통있는 SHEESE사의 비건치즈와 신선한 토마토 소스의 만남으로 깔끔한 풍미', 
        prices: { L: 26500 },
        crustOptions: ['original'] // 크러스트 선택 없음 -> original 고정
    },
    { 
        id: 'P25', name: '그린잇 식물성 가든스페셜', category: 'VEGAN', 
        desc: '전통있는 SHEESE사의 비건치즈와 신선한 채소가 어우러진 처음 맛보는 웰빙 채식 피자', 
        prices: { L: 29500 },
        crustOptions: ['original'] // 크러스트 선택 없음 -> original 고정
    },
];

// **********************************************
// [중요] 계산 로직 (이하 코드는 이전과 동일)
// **********************************************
const formatPrice = (price) => price.toLocaleString();
const isFriday = () => new Date().getDay() === 5; // 금요일(5) 체크

// ... (이하 updatePrice, calculateOnePlusOnePrice 등 기존 함수들은 그대로 유지)