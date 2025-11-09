// =================================================================
// 🍕 피자 메뉴 페이지 (menu.html) 로직 파일 - assets/menu.js
// =================================================================

// --- 1. 가격 데이터 정의 (모든 함수가 필요로 하는 데이터) ---
const PIZZA_PRICES = {
    // 1. 프리미엄 (Premium) - L, F, P 사이즈 중심
    'bbq_shortrib_crunch': { L: 34500, F: 41900 },
    'mellow_corn_cream': { L: 27500, F: 33900, P: 41500 },
    'starlight_basil': { L: 33500, F: 39900, P: 48500 },
    'double_hot_spicy_mexican': { L: 33500, F: 39900 },

    // 2. 베스트/스페셜 (BEST/Special) - R, L, F, P 사이즈
    'super_papas': { R: 19900, L: 28500, F: 33900, P: 42500 }, // BEST No.1
    'irish_potato': { R: 19900, L: 27500, F: 32900, P: 41500 },
    'johns_favorite': { L: 29500, F: 34900, P: 45500 },
    'all_in_one_box': { L: 33500, F: 39900, P: 48500 },
    'chicken_super_papas': { L: 28500, F: 33900, P: 42500 },
    'spicy_chicken_ranch': { R: 19900, L: 27500, F: 32900, P: 41500 },
    'double_cheeseburger': { L: 29500, F: 34900, P: 45500 },
    'hot_spicy_mexican': { L: 29500, F: 34900 },
    'melting_cheese': { L: 28500, F: 33900, P: 42500 },
    'maepgoma': { L: 27500, F: 32900, P: 41500 },
    'black_edition': { L: 34500, F: 41900, P: 51500 },
    'chili_bacon': { R: 19900, L: 27500, F: 32900, P: 41500 },

    // 3. 클래식 (Classic) - R, L, F, P 사이즈
    'margherita': { R: 17900, L: 25500, F: 30900, P: 38500 },
    'pepperoni': { R: 17900, L: 24500, F: 29900, P: 37500 },
    'hawaiian': { R: 17900, L: 25500, F: 30900, P: 38500 },
    'six_cheese': { R: 18900, L: 26500, F: 31900, P: 39500 },
    'garden_special': { R: 17900, L: 25500, F: 30900, P: 38500 },
    'hot_chicken_bbq': { R: 19900, L: 27500, F: 32900, P: 41500 },
    'all_meats': { R: 19900, L: 27500, F: 32900, P: 41500 },
    'hamburger_bulgogi': { L: 27500, F: 32900, P: 41500 },

    // 4. 비건 (Vegan) - 고정 사이즈
    'vegan_garden_special': { L: 29500 } // 사이즈/크러스트 변경 불가
};

const CRUST_PRICES = {
    'original': 0,
    'thin': 0,
    'cheese_roll': 4000,
    'gold_ring': 5000
};

  // 금요일 1+1 이벤트 대상 메뉴 ID (L사이즈만 가능)
const BOGO_MENU_IDS = [
    'super_papas', 'irish_potato', 'johns_favorite', 'spicy_chicken_ranch', 
    'margherita', 'pepperoni', 'hawaiian', 'six_cheese', 'garden_special', 
    'hot_chicken_bbq', 'all_meats', 'chili_bacon'
];

// --- 2. 유틸리티 함수 (다른 함수들이 호출하므로 먼저 정의) ---
// ... (이하 동일)
