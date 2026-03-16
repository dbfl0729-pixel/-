const STORAGE_KEY = 'derm_inventory_operational_v27';
const LEGACY_KEYS = [
  'derm_inventory_operational_v27',
  'derm_inventory_operational_v25',
  'derm_inventory_operational_v10',
  'derm_inventory_operational_v7',
];

const money = (n) => new Intl.NumberFormat('ko-KR').format(Math.round(Number(n || 0)));
const qtyFmt = (n) => `${money(n)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthISO = (d = new Date()) => d.toISOString().slice(0, 7);
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const uid = () => Date.now() + Math.floor(Math.random() * 100000);

const TAB_DEFS = [
  { key: 'dashboard', label: '🏠 대시보드' },
  { key: 'inbound', label: '📦 입고' },
  { key: 'keep', label: '📑 선결제' },
  { key: 'daily', label: '📊 일일재고' },
  { key: 'weekly', label: '📋 주간재고' },
  { key: 'price', label: '💰 가격표' },
  { key: 'report', label: '📄 월간보고' },
  { key: 'items', label: '➕ 품목추가' },
];

const PACK_KEYS = ['sheet', 'gel', 'revive', 'modeling'];
const PACK_LABELS = {
  sheet: '(하라셀) 시트팩',
  gel: '(더마소드) 겔시트팩',
  revive: '(더마소드) 리바이브팩',
  modeling: '(하라셀) 모델링팩',
};
const PACK_UNITS = { sheet: '장', gel: '개', revive: '개', modeling: 'kg' };
const PACK_ALERTS = { sheet: 20, gel: 5, revive: 10, modeling: 3 };

const WEEKLY_GROUPS = ['관리실용품', '관리제품', '위생/세탁 소모품'];

const DEFAULT_CATALOG = [
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 일외용해면 60개(1box)', unit: 'box', unit_price: 246000 },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 절단솜 4x6', unit: '개', unit_price: 8500, inventory_name: '(피부미소) 절단솜 4x6' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 거즈 (100p) 30x35', unit: '개', unit_price: 6000, inventory_name: '(피부미소) 거즈 30x35' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 화장솜', unit: '개', unit_price: 0, inventory_name: '(피부미소) 화장솜' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 소타올(흰색) 32호', unit: '개', unit_price: 1700, inventory_name: '(피부미소) 소타올(흰색) 32호' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 유리볼(소-3호)', unit: '개', unit_price: 1000, inventory_name: '(피부미소) 유리볼(소-3호)' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 사각터번 (흰색)', unit: '개', unit_price: 3500, inventory_name: '(피부미소) 사각터번 (흰색)' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 코매도 C형 고리형', unit: '개', unit_price: 5000, inventory_name: '(피부미소) 코매도 C형 고리형' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 팩붓(금형) 일반', unit: '개', unit_price: 1000, inventory_name: '(피부미소) 팩붓(금형) 일반' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 해면볼 일반', unit: '개', unit_price: 3000, inventory_name: '(피부미소) 해면볼 일반' },
  { vendor: '피부미소', category: '관리실용품', name: '(피부미소) 스파출라(소/대)', unit: '개', unit_price: 1000, inventory_name: '(피부미소) 스파출라(소/대)' },
  { vendor: '피부미소', category: '관리실용품', name: '26G 니들', unit: '개', unit_price: 0, inventory_name: '26G 니들' },
  { vendor: '피부미소', category: '관리실용품', name: '면봉', unit: '개', unit_price: 0, inventory_name: '면봉' },

  { vendor: '하라셀', category: '관리제품', name: '(하라셀) 소프트클렌징밀크 200ml', unit: '개', unit_price: 24000, inventory_name: '(하라셀) 클렌징 밀크' },
  { vendor: '하라셀', category: '선결제', name: '(하라셀) 시트팩 선결제 300장', unit: '계약', unit_price: 300000 },
  { vendor: '하라셀', category: '선결제', name: '(하라셀) 시트팩 선결제 500장', unit: '계약', unit_price: 500000 },
  { vendor: '하라셀', category: '선결제', name: '(하라셀) 모델링팩 선결제 100kg', unit: '계약', unit_price: 1000000 },
  { vendor: '하라셀', category: '일일팩', name: '(하라셀) 시트팩', unit: '장', unit_price: 0, inventory_name: '(하라셀) 시트팩' },
  { vendor: '하라셀', category: '일일팩', name: '(하라셀) 모델링팩', unit: 'kg', unit_price: 0, inventory_name: '(하라셀) 모델링팩' },

  { vendor: '히스토랩', category: '관리제품', name: '(히스토랩) 비타민앰플 V앰플 50개', unit: '개', unit_price: 30000, inventory_name: '(히스토랩) 비타민 앰플 V' },
  { vendor: '히스토랩', category: '관리제품', name: '(히스토랩) 비타민앰플 P앰플 50개', unit: '개', unit_price: 35000, inventory_name: '(히스토랩) 비타민 앰플 P' },
  { vendor: '히스토랩', category: '관리제품', name: '(히스토랩) 베라 알로젤 1200ml', unit: '개', unit_price: 54000, inventory_name: '(히스토랩) 알로에 젤', promo: { type: 'tiered_free', rules: [{ min: 5, free: 2 }, { min: 3, free: 1 }] } },
  { vendor: '히스토랩', category: '관리제품', name: '(히스토랩) 알파클렌징폼 1200ml', unit: '개', unit_price: 40000, inventory_name: '(히스토랩) 알파클렌징폼 1200ml' },

  { vendor: '쎄라덤/더마소드', category: '관리제품', name: '(쎄라덤) 쿠컴버 토너 1000ml', unit: '개', unit_price: 46200, inventory_name: '(쎄라덤) 토너', promo: { type: 'tiered_free', rules: [{ min: 3, free: 1 }] } },
  { vendor: '쎄라덤/더마소드', category: '관리제품', name: '아미스테롤 크림 60ml', unit: '개', unit_price: 34000, inventory_name: '아미스테롤 크림 60ml' },
  { vendor: '쎄라덤/더마소드', category: '관리제품', name: '(더마소드) 더마 클렌징겔 300ml', unit: '개', unit_price: 29000, inventory_name: '(더마소드) 클렌징 겔' },
  { vendor: '쎄라덤/더마소드', category: '일일팩', name: '(더마소드) 리바이브팩 1BOX(8ea)', unit: 'box', unit_price: 25000, inventory_name: '(더마소드) 리바이브팩', promo: { type: 'tiered_free', rules: [{ min: 10, free: 3 }, { min: 5, free: 1 }] } },
  { vendor: '쎄라덤/더마소드', category: '관리제품', name: '클렌징겔 샘플 100개', unit: '개', unit_price: 30000 },
  { vendor: '쎄라덤/더마소드', category: '관리제품', name: '아미크림 샘플 100개', unit: '개', unit_price: 40000 },
  { vendor: '쎄라덤/더마소드', category: '관리제품', name: '더마소드 리프팅 하이드로 베일 마스크 1box(5ea)', unit: 'box', unit_price: 21000 },
  { vendor: '쎄라덤/더마소드', category: '일일팩', name: '(더마소드) 겔시트팩', unit: '개', unit_price: 0, inventory_name: '(더마소드) 겔시트팩' },

  { vendor: '스키노바', category: '관리제품', name: 'LDM겔 3개 세트', unit: '세트', unit_price: 49500, inventory_name: 'LDM겔' },
  { vendor: '스키노바', category: '관리제품', name: 'LDM겔 5개 세트', unit: '세트', unit_price: 82500, inventory_name: 'LDM겔' },

  { vendor: '카프리가스', category: '관리제품', name: '카프리가스 5개', unit: '세트', unit_price: 44000, inventory_name: '카프리가스' },

  { vendor: '공통', category: '관리제품', name: '클렌징폼', unit: '개', unit_price: 0, inventory_name: '클렌징폼' },
  { vendor: '공통', category: '관리제품', name: '리무버', unit: '개', unit_price: 0, inventory_name: '리무버' },
  { vendor: '공통', category: '관리제품', name: '알라딘필링', unit: '개', unit_price: 0, inventory_name: '알라딘필링' },
  { vendor: '공통', category: '관리제품', name: '알라딘액티베이터', unit: '개', unit_price: 0, inventory_name: '알라딘액티베이터' },
  { vendor: '공통', category: '관리제품', name: '알라딘진정크림', unit: '개', unit_price: 0, inventory_name: '알라딘진정크림' },
  { vendor: '공통', category: '관리제품', name: '셀퓨전씨 크림', unit: '개', unit_price: 0, inventory_name: '셀퓨전씨 크림' },
  { vendor: '공통', category: '관리제품', name: '셀퓨전씨 로션', unit: '개', unit_price: 0, inventory_name: '셀퓨전씨 로션' },
  { vendor: '공통', category: '관리제품', name: '아토크림', unit: '개', unit_price: 0, inventory_name: '아토크림' },
  { vendor: '공통', category: '관리제품', name: '아토로션', unit: '개', unit_price: 0, inventory_name: '아토로션' },
  { vendor: '공통', category: '관리제품', name: '썬크림', unit: '개', unit_price: 0, inventory_name: '썬크림' },

  { vendor: '공통', category: '위생/세탁 소모품', name: '핸드티슈', unit: '개', unit_price: 0, inventory_name: '핸드티슈' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '각티슈', unit: '개', unit_price: 0, inventory_name: '각티슈' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '손세정제', unit: '개', unit_price: 0, inventory_name: '손세정제' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '칫솔', unit: '개', unit_price: 0, inventory_name: '칫솔' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '가위', unit: '개', unit_price: 0, inventory_name: '가위' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '검정고무줄', unit: '개', unit_price: 0, inventory_name: '검정고무줄' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '세제', unit: '개', unit_price: 0, inventory_name: '세제' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '유연제', unit: '개', unit_price: 0, inventory_name: '유연제' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '먼지망', unit: '개', unit_price: 0, inventory_name: '먼지망' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '세탁클리너', unit: '개', unit_price: 0, inventory_name: '세탁클리너' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '매직폼', unit: '개', unit_price: 0, inventory_name: '매직폼' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '다목적세정제', unit: '개', unit_price: 0, inventory_name: '다목적세정제' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '퐁퐁', unit: '개', unit_price: 0, inventory_name: '퐁퐁' },
  { vendor: '공통', category: '위생/세탁 소모품', name: '거름망', unit: '개', unit_price: 0, inventory_name: '거름망' },
];

const DEFAULT_ITEMS = [
  { name: '(하라셀) 시트팩', scope: 'daily', group: '일일팩', unit: '장', favorite: true },
  { name: '(더마소드) 겔시트팩', scope: 'daily', group: '일일팩', unit: '개', favorite: true },
  { name: '(더마소드) 리바이브팩', scope: 'daily', group: '일일팩', unit: '개', favorite: true },
  { name: '(하라셀) 모델링팩', scope: 'daily', group: '일일팩', unit: 'kg', favorite: true },

  { name: '(피부미소) 절단솜 4x6', scope: 'weekly', group: '관리실용품', unit: '개', favorite: true },
  { name: '(피부미소) 거즈 30x35', scope: 'weekly', group: '관리실용품', unit: '개', favorite: true },
  { name: '(피부미소) 화장솜', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 유리볼(소-3호)', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 코매도 C형 고리형', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 팩붓(금형) 일반', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 해면볼 일반', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 스파출라(소/대)', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '26G 니들', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 소타올(흰색) 32호', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '(피부미소) 사각터번 (흰색)', scope: 'weekly', group: '관리실용품', unit: '개' },
  { name: '면봉', scope: 'weekly', group: '관리실용품', unit: '개' },

  { name: '(하라셀) 클렌징 밀크', scope: 'weekly', group: '관리제품', unit: '개', favorite: true },
  { name: '클렌징폼', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '(더마소드) 클렌징 겔', scope: 'weekly', group: '관리제품', unit: '개', favorite: true },
  { name: '리무버', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '(히스토랩) 비타민 앰플 V', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '(히스토랩) 비타민 앰플 P', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '알라딘필링', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '알라딘액티베이터', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '알라딘진정크림', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: 'LDM겔', scope: 'weekly', group: '관리제품', unit: '개', favorite: true },
  { name: '(쎄라덤) 토너', scope: 'weekly', group: '관리제품', unit: '개', favorite: true },
  { name: '아미스테롤 크림 60ml', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '셀퓨전씨 크림', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '셀퓨전씨 로션', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '아토크림', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '아토로션', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '썬크림', scope: 'weekly', group: '관리제품', unit: '개' },
  { name: '카프리가스', scope: 'weekly', group: '관리제품', unit: '개', favorite: true },

  { name: '핸드티슈', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '각티슈', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '손세정제', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '칫솔', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '가위', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '검정고무줄', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '세제', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '유연제', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '먼지망', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '세탁클리너', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '매직폼', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '다목적세정제', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '퐁퐁', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
  { name: '거름망', scope: 'weekly', group: '위생/세탁 소모품', unit: '개' },
];

function buildDefaultKeepPlans() {
  return [
    {
      key: 'sheetmask', name: '(하라셀) 시트팩', unit: '장', item_name: '(하라셀) 시트팩', low_alert: 20,
      selected_option: '300장', default_ship_qty: 10,
      options: [
        { label: '300장', total_qty: 300, total_price: 300000 },
        { label: '500장', total_qty: 500, total_price: 500000 },
      ],
    },
    {
      key: 'modeling', name: '(하라셀) 모델링팩', unit: 'kg', item_name: '(하라셀) 모델링팩', low_alert: 3,
      selected_option: '100kg', default_ship_qty: 1,
      options: [{ label: '100kg', total_qty: 100, total_price: 1000000 }],
    },
  ];
}

function seed() {
  return {
    version: 27,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: DEFAULT_ITEMS.map((x, idx) => ({ id: idx + 1, active: true, low_stock: '', ...x })),
    catalog: DEFAULT_CATALOG.map((x, idx) => ({ id: idx + 1, favorite: !!DEFAULT_ITEMS.find((it) => it.name === (x.inventory_name || x.name) && it.favorite), ...x })),
    inbound: [],
    dailyRecords: {},
    weeklyRecords: {},
    keepPlans: buildDefaultKeepPlans(),
    keepHistory: [],
  };
}

function load() {
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return null;
}

function migrate(data) {
  const base = seed();
  if (!data) return base;
  // If already v27-like
  if (data.keepPlans && data.catalog && data.items) {
    const merged = { ...base, ...data };
    merged.version = 27;
    merged.items = normalizeItems(data.items || base.items);
    merged.catalog = normalizeCatalog(data.catalog || base.catalog, merged.items);
    merged.keepPlans = normalizeKeepPlans(data.keepPlans || base.keepPlans);
    merged.keepHistory = Array.isArray(data.keepHistory) ? data.keepHistory : [];
    merged.inbound = Array.isArray(data.inbound) ? data.inbound : [];
    merged.dailyRecords = data.dailyRecords || {};
    merged.weeklyRecords = data.weeklyRecords || {};
    ensureDefaults(merged);
    return merged;
  }
  const out = seed();
  // migrate legacy inventories
  const legacyItems = Array.isArray(data.items) ? data.items : [];
  out.items = normalizeItems(legacyItems.length ? legacyItems.map((it, idx) => ({
    id: it.id || idx + 1,
    name: it.name,
    scope: (it.cycle === '일일' ? 'daily' : 'weekly'),
    group: it.cycle === '일일' ? '일일팩' : '관리제품',
    unit: it.base_unit || it.unit || '개',
    favorite: !!it.favorite,
    active: it.active !== false,
    low_stock: it.low_stock || '',
  })) : out.items);
  out.dailyRecords = data.dailyRecords || {};
  out.weeklyRecords = data.weeklyRecords || data.monthlyRecords || {};
  out.inbound = Array.isArray(data.inbound) ? data.inbound.map((r) => ({
    id: r.id || uid(),
    date: r.date || todayISO(),
    vendor: '',
    item_name: legacyItems.find((x) => x.id === r.item_id)?.name || r.item_name || '품목',
    unit: legacyItems.find((x) => x.id === r.item_id)?.base_unit || '개',
    qty_ordered: toNum(r.qty),
    qty_received: toNum(r.qty),
    unit_price: toNum(r.unit_cost),
    total_paid: toNum(r.qty) * toNum(r.unit_cost),
    note: r.memo || '',
    promo_text: '',
    keep_purchase_key: r.type === 'keep_purchase' ? (r.keep_key || '') : '',
  })) : [];
  const legacyKeep = data.keep || {};
  out.keepPlans = buildDefaultKeepPlans();
  if (legacyKeep.sheetmask) {
    const plan = out.keepPlans.find((x) => x.key === 'sheetmask');
    if (plan) {
      plan.selected_option = legacyKeep.sheetmask.tier || '300장';
      const purchasedTotal = inferLegacyKeepPurchased(legacyKeep.sheetmask, plan);
      if (purchasedTotal > 0) out.keepHistory.push({ id: uid(), date: todayISO(), key: 'sheetmask', type: 'purchase', option_label: plan.selected_option, qty: purchasedTotal, cost: purchasedTotal === 500 ? 500000 : 390000, note: '기존 데이터 이관' });
      if (toNum(legacyKeep.sheetmask.shipped_total) > 0) out.keepHistory.push({ id: uid(), date: todayISO(), key: 'sheetmask', type: 'ship', qty: toNum(legacyKeep.sheetmask.shipped_total), cost: 0, option_label: '', note: '기존 데이터 이관' });
    }
  }
  if (legacyKeep.modeling) {
    const plan = out.keepPlans.find((x) => x.key === 'modeling');
    if (plan) {
      const shipped = toNum(legacyKeep.modeling.shipped_total);
      const purchasedBundles = shipped > 100 ? Math.ceil(shipped / 100) : 1;
      if (shipped > 0 || toNum(legacyKeep.modeling.hospital_stock) > 0) {
        for (let i = 0; i < purchasedBundles; i += 1) {
          out.keepHistory.push({ id: uid(), date: todayISO(), key: 'modeling', type: 'purchase', option_label: '100kg', qty: 100, cost: 1000000, note: i === 0 ? '기존 데이터 이관' : '기존 데이터 이관' });
        }
      }
      if (shipped > 0) out.keepHistory.push({ id: uid(), date: todayISO(), key: 'modeling', type: 'ship', qty: shipped, cost: 0, option_label: '', note: '기존 데이터 이관' });
    }
  }
  ensureDefaults(out);
  return out;
}

function inferLegacyKeepPurchased(st, plan) {
  const tier = String(st.tier || '300장');
  const currentOption = plan.options.find((x) => x.label === tier) || plan.options[0];
  const shipped = toNum(st.shipped_total);
  const stock = toNum(st.hospital_stock);
  if (!shipped && !stock) return 0;
  const need = shipped + stock;
  if (need <= currentOption.total_qty) return currentOption.total_qty;
  return Math.ceil(need / currentOption.total_qty) * currentOption.total_qty;
}

function normalizeItems(items) {
  const byName = new Map();
  DEFAULT_ITEMS.forEach((it) => byName.set(it.name, { active: true, low_stock: '', ...it }));
  (items || []).forEach((it, idx) => {
    if (!it.name) return;
    const merged = { id: it.id || idx + 1, active: it.active !== false, low_stock: it.low_stock || '', favorite: !!it.favorite, ...byName.get(it.name), ...it };
    byName.set(it.name, merged);
  });
  return Array.from(byName.values()).map((it, idx) => ({ ...it, id: idx + 1 }));
}
function normalizeCatalog(catalog, items) {
  const map = new Map();
  DEFAULT_CATALOG.forEach((x) => map.set(x.name, { favorite: false, ...x }));
  (catalog || []).forEach((x, idx) => {
    if (!x.name) return;
    const merged = { id: x.id || idx + 1, favorite: false, ...map.get(x.name), ...x };
    map.set(x.name, merged);
  });
  return Array.from(map.values()).map((x, idx) => ({ ...x, id: idx + 1, favorite: !!items.find((it) => it.name === (x.inventory_name || x.name) && it.favorite) || !!x.favorite }));
}
function normalizeKeepPlans(plans) {
  const base = buildDefaultKeepPlans();
  const map = new Map(base.map((x) => [x.key, structuredClone ? structuredClone(x) : JSON.parse(JSON.stringify(x))]));
  (plans || []).forEach((p) => {
    if (!p.key || !p.name) return;
    map.set(p.key, { ...p, low_alert: toNum(p.low_alert), default_ship_qty: toNum(p.default_ship_qty) || 1 });
  });
  return Array.from(map.values());
}
function ensureDefaults(db) {
  db.items = normalizeItems(db.items);
  db.catalog = normalizeCatalog(db.catalog, db.items);
  db.keepPlans = normalizeKeepPlans(db.keepPlans);
  db.dailyRecords = db.dailyRecords || {};
  db.weeklyRecords = db.weeklyRecords || {};
  db.inbound = Array.isArray(db.inbound) ? db.inbound : [];
  db.keepHistory = Array.isArray(db.keepHistory) ? db.keepHistory : [];
}

let db = migrate(load());
let activeTab = 'dashboard';
save();

function save() {
  db.updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const $ = (q) => document.querySelector(q);
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

function renderTabs() {
  const host = $('#tabs');
  host.innerHTML = '';
  TAB_DEFS.forEach((t) => {
    const b = el('button', { class: `tab${activeTab === t.key ? ' active' : ''}`, type: 'button', onclick: () => { activeTab = t.key; render(); } });
    b.textContent = t.label;
    host.appendChild(b);
  });
}
function render() {
  renderTabs();
  const app = $('#app');
  app.innerHTML = '';
  const map = {
    dashboard: renderDashboard,
    inbound: renderInbound,
    keep: renderKeep,
    daily: renderDaily,
    weekly: renderWeekly,
    price: renderPrice,
    report: renderReport,
    items: renderItems,
  };
  app.appendChild(map[activeTab]());
}

function datesOf(map) { return Object.keys(map || {}).sort().reverse(); }
function startOfMonth(month) { return `${month}-01`; }
function endOfMonth(month) { return `${month}-31`; }
function monthInboundRows(month) { return db.inbound.filter((r) => (r.date || '').startsWith(month)); }
function monthKeepPurchases(month) { return db.keepHistory.filter((h) => h.type === 'purchase' && (h.date || '').startsWith(month)); }
function monthKeepShips(month) { return db.keepHistory.filter((h) => h.type === 'ship' && (h.date || '').startsWith(month)); }
function getKeepPlan(key) { return db.keepPlans.find((x) => x.key === key); }
function getKeepStats(key) {
  const plan = getKeepPlan(key);
  const history = db.keepHistory.filter((x) => x.key === key);
  const purchased = history.filter((x) => x.type === 'purchase').reduce((a, x) => a + toNum(x.qty), 0);
  const shipped = history.filter((x) => x.type === 'ship').reduce((a, x) => a + toNum(x.qty), 0);
  return { plan, purchased, shipped, remaining: Math.max(purchased - shipped, 0) };
}
function getCatalogRow(name) { return db.catalog.find((x) => x.name === name); }
function getItemByName(name) { return db.items.find((x) => x.name === name); }
function getWeeklyItems(group) {
  return db.items.filter((x) => x.scope === 'weekly' && x.active !== false && x.group === group)
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || a.name.localeCompare(b.name, 'ko'));
}
function getLatestWeeklyQty(itemName) {
  const dates = datesOf(db.weeklyRecords);
  for (const date of dates) {
    const row = db.weeklyRecords[date]?.[itemName];
    if (row !== undefined && row !== null && row !== '') return toNum(row);
  }
  return 0;
}
function getDailyRow(date) {
  return db.dailyRecords[date] || { sheet_stock: '', gel_stock: '', revive_stock: '', modeling_unopened: '', modeling_users: '', managed_patients: '' };
}
function getPreviousDailyRecord(date) {
  const prevDates = datesOf(db.dailyRecords).filter((d) => d < date).sort();
  return prevDates.length ? db.dailyRecords[prevDates[prevDates.length - 1]] : null;
}
function getPackInboundQty(packName, date) {
  return db.inbound.filter((r) => r.date === date && r.item_name === packName).reduce((a, r) => a + toNum(r.qty_received), 0);
}
function getPackKeepShipQty(planKey, date) {
  return db.keepHistory.filter((h) => h.date === date && h.key === planKey && h.type === 'ship').reduce((a, h) => a + toNum(h.qty), 0);
}
function getDailyUsageForDate(date) {
  const row = getDailyRow(date);
  const prev = getPreviousDailyRecord(date) || {};
  const sheetPrev = prev.sheet_stock === '' || prev.sheet_stock === undefined ? '' : toNum(prev.sheet_stock);
  const gelPrev = prev.gel_stock === '' || prev.gel_stock === undefined ? '' : toNum(prev.gel_stock);
  const revivePrev = prev.revive_stock === '' || prev.revive_stock === undefined ? '' : toNum(prev.revive_stock);
  const modelingPrev = prev.modeling_unopened === '' || prev.modeling_unopened === undefined ? '' : toNum(prev.modeling_unopened);
  const sheetUse = sheetPrev === '' || row.sheet_stock === '' || row.sheet_stock === undefined ? 0 : Math.max(sheetPrev + getPackInboundQty(PACK_LABELS.sheet, date) + getPackKeepShipQty('sheetmask', date) - toNum(row.sheet_stock), 0);
  const gelUse = gelPrev === '' || row.gel_stock === '' || row.gel_stock === undefined ? 0 : Math.max(gelPrev + getPackInboundQty(PACK_LABELS.gel, date) - toNum(row.gel_stock), 0);
  const reviveUse = revivePrev === '' || row.revive_stock === '' || row.revive_stock === undefined ? 0 : Math.max(revivePrev + getPackInboundQty(PACK_LABELS.revive, date) - toNum(row.revive_stock), 0);
  const modelingKgUse = modelingPrev === '' || row.modeling_unopened === '' || row.modeling_unopened === undefined ? 0 : Math.max(modelingPrev + getPackKeepShipQty('modeling', date) + getPackInboundQty(PACK_LABELS.modeling, date) - toNum(row.modeling_unopened), 0);
  return { sheetUse, gelUse, reviveUse, modelingKgUse, modelingUsers: toNum(row.modeling_users) };
}
function getMonthlyPackStats(month) {
  const dates = Object.keys(db.dailyRecords).filter((d) => d.startsWith(month)).sort();
  const stats = { sheet: 0, gel: 0, revive: 0, modelingUsers: 0, modelingKg: 0 };
  dates.forEach((d) => {
    const use = getDailyUsageForDate(d);
    stats.sheet += use.sheetUse;
    stats.gel += use.gelUse;
    stats.revive += use.reviveUse;
    stats.modelingUsers += use.modelingUsers;
    stats.modelingKg += use.modelingKgUse;
  });
  const days = dates.length || 1;
  const totalMix = stats.sheet + stats.gel + stats.revive + stats.modelingUsers;
  return {
    dates,
    days,
    rows: [
      { label: PACK_LABELS.sheet, month: stats.sheet, week: stats.sheet / 4.3, day: stats.sheet / days, ratio: totalMix ? (stats.sheet / totalMix) * 100 : 0 },
      { label: PACK_LABELS.modeling, month: stats.modelingUsers, week: stats.modelingUsers / 4.3, day: stats.modelingUsers / days, ratio: totalMix ? (stats.modelingUsers / totalMix) * 100 : 0, unit: '명' },
      { label: PACK_LABELS.gel, month: stats.gel, week: stats.gel / 4.3, day: stats.gel / days, ratio: totalMix ? (stats.gel / totalMix) * 100 : 0 },
      { label: PACK_LABELS.revive, month: stats.revive, week: stats.revive / 4.3, day: stats.revive / days, ratio: totalMix ? (stats.revive / totalMix) * 100 : 0 },
    ],
    modelingUsers: stats.modelingUsers,
    modelingKg: stats.modelingKg,
  };
}
function getCurrentPackStock() {
  const latestDate = datesOf(db.dailyRecords)[0];
  const row = latestDate ? getDailyRow(latestDate) : {};
  return {
    sheet: toNum(row.sheet_stock), gel: toNum(row.gel_stock), revive: toNum(row.revive_stock), modeling: toNum(row.modeling_unopened), latestDate,
  };
}

function getMonthlyManagedPatients(month) {
  const dates = Object.keys(db.dailyRecords).filter((d) => d.startsWith(month)).sort();
  const total = dates.reduce((a, d) => a + toNum(getDailyRow(d).managed_patients), 0);
  const missingDates = dates.filter((d) => getDailyRow(d).managed_patients === '' || getDailyRow(d).managed_patients === undefined || getDailyRow(d).managed_patients === null);
  return { total, days: dates.length || 1, average: dates.length ? total / dates.length : 0, missingDates };
}

function getMonthDataStatus(month) {
  const dates = Object.keys(db.dailyRecords).filter((d) => d.startsWith(month)).sort();
  const nowMonth = monthISO();
  const [y, m] = month.split('-').map(Number);
  const daysInThisMonth = new Date(y, m, 0).getDate();
  const expectedDays = month === nowMonth ? new Date().getDate() : daysInThisMonth;
  const isPartial = dates.length < expectedDays;
  const label = isPartial ? (dates.length ? '데이터 일부' : '기록 시작 월') : '정상 월 통계';
  return {
    recordDays: dates.length,
    expectedDays,
    isPartial,
    label,
  };
}

function getCurrentStockAlerts() {
  const s = getCurrentPackStock();
  const arr = [];
  if (s.sheet <= PACK_ALERTS.sheet) arr.push({ label: PACK_LABELS.sheet, qty: s.sheet, unit: '장', rule: `${PACK_ALERTS.sheet}장 이하` });
  if (s.modeling <= PACK_ALERTS.modeling) arr.push({ label: PACK_LABELS.modeling, qty: s.modeling, unit: 'kg', rule: `${PACK_ALERTS.modeling}kg 이하` });
  if (s.gel <= PACK_ALERTS.gel) arr.push({ label: PACK_LABELS.gel, qty: s.gel, unit: '개', rule: `${PACK_ALERTS.gel} 이하` });
  if (s.revive <= PACK_ALERTS.revive) arr.push({ label: PACK_LABELS.revive, qty: s.revive, unit: '개', rule: `${PACK_ALERTS.revive} 이하` });
  return arr;
}
function getMonthlyCostSummary(month) {
  const inbound = monthInboundRows(month).reduce((a, x) => a + toNum(x.total_paid), 0);
  const keep = monthKeepPurchases(month).reduce((a, x) => a + toNum(x.cost), 0);
  return { inbound, keep, total: inbound + keep };
}
function applyPromo(row, qtyOrdered) {
  const qty = toNum(qtyOrdered);
  if (!row?.promo || !qty) return { qty_received: qty, promo_text: '' };
  if (row.promo.type === 'tiered_free') {
    const sorted = row.promo.rules.slice().sort((a, b) => b.min - a.min);
    const hit = sorted.find((r) => qty >= r.min);
    if (!hit) return { qty_received: qty, promo_text: '' };
    const freeBundleCount = Math.floor(qty / hit.min) * hit.free;
    return { qty_received: qty + freeBundleCount, promo_text: `${qty} → ${qty + freeBundleCount}` };
  }
  return { qty_received: qty, promo_text: '' };
}
function buildSavedDateSelect(map, currentDate) {
  const sel = el('select');
  sel.appendChild(el('option', { value: '', text: '저장된 날짜' }));
  datesOf(map).forEach((d) => {
    const opt = el('option', { value: d, text: d });
    if (d === currentDate) opt.selected = true;
    sel.appendChild(opt);
  });
  return sel;
}
function setDefaultValue(node, value) { node.value = value === undefined || value === null ? '' : String(value); }
function makeKpi(name, val, sub = '', extraClass = '') {
  const box = el('div', { class: `box${extraClass ? ` ${extraClass}` : ''}` });
  box.appendChild(el('div', { class: 'name', text: name }));
  box.appendChild(el('div', { class: 'val', text: val }));
  if (sub) box.appendChild(el('div', { class: 'sub', text: sub }));
  return box;
}

function renderDashboard() {
  const month = monthISO();
  const cost = getMonthlyCostSummary(month);
  const keepSheet = getKeepStats('sheetmask');
  const keepModel = getKeepStats('modeling');
  const alerts = getCurrentStockAlerts();
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '대시보드' }));

  const kpi = el('div', { class: 'kpi' });
  kpi.appendChild(makeKpi('재고 위험', alerts.length ? `${alerts.length}건` : '정상', alerts.length ? '주문 확인 필요' : '현재 위험 없음'));
  kpi.appendChild(makeKpi('선결제 잔량', `${keepSheet.remaining}장 / ${keepModel.remaining}kg`, '시트팩 / 모델링팩'));
  kpi.appendChild(makeKpi('이번달 비용', `${money(cost.total)}원`, `일반 입고 ${money(cost.inbound)}원 · 선결제 ${money(cost.keep)}원`));
  card.appendChild(kpi);

  const grid = el('div', { class: 'grid-3', style: { marginTop: '16px' } });
  const alertPanel = el('div', { class: 'panel' });
  alertPanel.appendChild(el('h3', { text: '재고 위험 알림' }));
  if (!alerts.length) alertPanel.appendChild(el('div', { class: 'empty', text: '현재 주문 필요한 팩이 없습니다.' }));
  else {
    const wrap = el('div', { class: 'table-wrap' });
    const table = el('table');
    table.innerHTML = '<thead><tr><th>품목</th><th class="num">현재</th><th>기준</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    alerts.forEach((a) => {
      const tr = el('tr');
      tr.innerHTML = `<td>${a.label}</td><td class="num">${qtyFmt(a.qty)}${a.unit}</td><td><span class="badge alert">${a.rule}</span></td>`;
      tbody.appendChild(tr);
    });
    wrap.appendChild(table); alertPanel.appendChild(wrap);
  }

  const keepPanel = el('div', { class: 'panel' });
  keepPanel.appendChild(el('h3', { text: '선결제 잔량' }));
  const keepWrap = el('div', { class: 'table-wrap' });
  const keepTable = el('table');
  keepTable.innerHTML = '<thead><tr><th>품목</th><th class="num">누적 선결제</th><th class="num">누적 출고</th><th class="num">남은 킵</th></tr></thead><tbody></tbody>';
  const kt = keepTable.querySelector('tbody');
  [keepSheet, keepModel].forEach((s) => {
    const tr = el('tr');
    tr.innerHTML = `<td>${s.plan.name}</td><td class="num">${qtyFmt(s.purchased)}${s.plan.unit}</td><td class="num">${qtyFmt(s.shipped)}${s.plan.unit}</td><td class="num">${qtyFmt(s.remaining)}${s.plan.unit}</td>`;
    kt.appendChild(tr);
  });
  keepWrap.appendChild(keepTable); keepPanel.appendChild(keepWrap);

  const costPanel = el('div', { class: 'panel' });
  costPanel.appendChild(el('h3', { text: '이번달 비용 요약' }));
  const costWrap = el('div', { class: 'table-wrap' });
  const cTable = el('table');
  cTable.innerHTML = '<thead><tr><th>항목</th><th class="num">금액</th></tr></thead><tbody></tbody>';
  cTable.querySelector('tbody').innerHTML = `
    <tr><td>일반 입고</td><td class="num">${money(cost.inbound)}원</td></tr>
    <tr><td>선결제 구매</td><td class="num">${money(cost.keep)}원</td></tr>
    <tr><td><b>합계</b></td><td class="num"><b>${money(cost.total)}원</b></td></tr>`;
  costWrap.appendChild(cTable); costPanel.appendChild(costWrap);

  grid.appendChild(alertPanel); grid.appendChild(keepPanel); grid.appendChild(costPanel); card.appendChild(grid);
  return card;
}

function renderInbound() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '입고' }));

  const dateInput = el('input', { type: 'date', value: todayISO() });
  const itemSel = el('select');
  const qtyInput = el('input', { type: 'number', value: '1', min: '1' });
  const priceInput = el('input', { type: 'number', value: '0', min: '0' });
  const receivedInput = el('input', { type: 'number', value: '1', min: '0', readonly: 'readonly' });
  const totalInput = el('input', { type: 'text', value: '0원', readonly: 'readonly' });
  const noteInput = el('input', { type: 'text', value: '' });
  const promoLabel = el('div', { class: 'mini', text: '' });
  const addBtn = el('button', { class: 'btn primary', type: 'button', text: '입고 저장' });

  const catalogOptions = db.catalog.filter((x) => !x.category.includes('선결제')).sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || a.vendor.localeCompare(b.vendor, 'ko') || a.name.localeCompare(b.name, 'ko'));
  itemSel.appendChild(el('option', { value: '', text: '품목 선택' }));
  catalogOptions.forEach((r) => itemSel.appendChild(el('option', { value: r.id, text: `${r.vendor} · ${r.name}` })));

  function refreshPricing() {
    const row = catalogOptions.find((x) => String(x.id) === itemSel.value);
    if (!row) {
      priceInput.value = '0'; receivedInput.value = qtyInput.value || '0'; totalInput.value = '0원'; promoLabel.textContent = '';
      return;
    }
    priceInput.value = String(toNum(row.unit_price));
    const promo = applyPromo(row, qtyInput.value);
    receivedInput.value = String(promo.qty_received);
    totalInput.value = `${money(toNum(qtyInput.value) * toNum(row.unit_price))}원`;
    promoLabel.textContent = promo.promo_text ? `프로모션 적용: ${promo.promo_text}` : (row.promo ? '프로모션 없음' : '');
  }
  itemSel.onchange = refreshPricing;
  qtyInput.oninput = refreshPricing;

  card.appendChild(el('div', { class: 'row top' }, [
    field('입고일', dateInput), field('품목', itemSel), field('주문수량', qtyInput), field('단가', priceInput), field('실입고수량', receivedInput), field('총 결제금액', totalInput), field('메모', noteInput), addBtn,
  ]));
  card.appendChild(promoLabel);

  addBtn.onclick = () => {
    const row = catalogOptions.find((x) => String(x.id) === itemSel.value);
    if (!row) return alert('품목을 선택하세요.');
    const qty = toNum(qtyInput.value);
    if (qty <= 0) return alert('주문수량을 입력하세요.');
    const promo = applyPromo(row, qty);
    db.inbound.push({
      id: uid(), date: dateInput.value, vendor: row.vendor, item_name: row.inventory_name || row.name, display_name: row.name, unit: row.unit, qty_ordered: qty,
      qty_received: promo.qty_received, unit_price: toNum(row.unit_price), total_paid: qty * toNum(row.unit_price), note: noteInput.value || '', promo_text: promo.promo_text,
    });
    save(); render();
  };

  const month = monthISO();
  const rows = monthInboundRows(month).slice().sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));
  const wrap = el('div', { class: 'table-wrap', style: { marginTop: '16px' } });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>입고일</th><th>품목</th><th class="num">주문</th><th class="num">실입고</th><th class="num">단가</th><th class="num">금액</th><th>메모</th><th></th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector('tbody');
  if (!rows.length) tbody.innerHTML = '<tr><td colspan="8"><div class="empty">이번달 입고 기록이 없습니다.</div></td></tr>';
  rows.forEach((r) => {
    const tr = el('tr');
    const promo = r.promo_text ? ` · ${r.promo_text}` : '';
    tr.innerHTML = `<td>${r.date}</td><td>${r.display_name || r.item_name}<div class="mini">${r.vendor}${promo}</div></td><td class="num">${qtyFmt(r.qty_ordered)}</td><td class="num">${qtyFmt(r.qty_received)}</td><td class="num">${money(r.unit_price)}원</td><td class="num">${money(r.total_paid)}원</td><td>${r.note || ''}</td><td></td>`;
    const del = el('button', { class: 'btn', type: 'button', text: '삭제', onclick: () => { db.inbound = db.inbound.filter((x) => x.id !== r.id); save(); render(); } });
    tr.children[7].appendChild(del);
    tbody.appendChild(tr);
  });
  wrap.appendChild(table); card.appendChild(wrap);
  return card;
}

function field(label, node) {
  const f = el('label', { class: 'field' });
  f.appendChild(el('span', { text: label }));
  f.appendChild(node);
  return f;
}


function addKeepPurchaseInbound(plan, opt, note) {
  db.inbound.push({
    id: uid(),
    date: todayISO(),
    vendor: '선결제',
    category: '선결제',
    item_name: plan.item_name,
    qty_ordered: opt.total_qty,
    qty_received: opt.total_qty,
    unit: plan.unit,
    unit_price: opt.total_price,
    total_paid: opt.total_price,
    promo_text: '',
    memo: note || '선결제 구매',
  });
}

function renderKeep() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '선결제' }));
  const keepSummary = el('div', { class: 'panel soft', style: { marginBottom: '14px' } });
  const keepGrid = el('div', { class: 'kpi' });
  const sheetKeep = getKeepStats('sheetmask');
  const modelKeep = getKeepStats('modeling');
  keepGrid.appendChild(makeKpi('(하라셀) 시트팩 킵 잔량', `${qtyFmt(sheetKeep.remaining)}장`));
  keepGrid.appendChild(makeKpi('(하라셀) 모델링팩 킵 잔량', `${qtyFmt(modelKeep.remaining)}kg`));
  keepSummary.appendChild(keepGrid);
  card.appendChild(keepSummary);
  const plans = db.keepPlans.slice().sort((a, b) => (a.key === 'sheetmask' ? -1 : a.key === 'modeling' ? -1 : 1));
  const grid = el('div', { class: 'grid-2' });

  plans.forEach((plan) => {
    const stats = getKeepStats(plan.key);
    const panel = el('div', { class: 'panel soft' });
    panel.appendChild(el('h3', { text: `${plan.name} 선결제` }));

    const optionSel = el('select');
    plan.options.forEach((opt) => optionSel.appendChild(el('option', { value: opt.label, text: `${opt.label} · ${money(opt.total_price)}원` })));
    optionSel.value = plan.selected_option || plan.options[0].label;

    const needInput = el('input', { type: 'number', value: String(plan.default_ship_qty || 1), min: '1', step: String(plan.unit === 'kg' ? 1 : 1) });
    const quickInput = el('input', { type: 'number', value: String(plan.default_ship_qty || 1), min: '1' });
    const shipBtn = el('button', { class: 'btn', type: 'button', text: '킵만 출고' });
    const purchaseBtn = el('button', { class: 'btn light', type: 'button', text: '선결제권만 추가' });
    const processBtn = el('button', { class: 'btn primary', type: 'button', text: '필요 수량 처리' });

    optionSel.onchange = () => { plan.selected_option = optionSel.value; save(); render(); };
    shipBtn.onclick = () => {
      const qty = toNum(quickInput.value);
      if (qty <= 0) return alert('출고 수량을 입력하세요.');
      if (qty > stats.remaining) return alert('남은 킵 수량보다 큽니다.');
      db.keepHistory.push({ id: uid(), date: todayISO(), key: plan.key, type: 'ship', qty, cost: 0, option_label: '', note: '킵 출고' });
      save(); render();
    };
    purchaseBtn.onclick = () => {
      const opt = plan.options.find((x) => x.label === optionSel.value) || plan.options[0];
      db.keepHistory.push({ id: uid(), date: todayISO(), key: plan.key, type: 'purchase', qty: opt.total_qty, cost: opt.total_price, option_label: opt.label, note: '선결제 구매' });
      addKeepPurchaseInbound(plan, opt, '선결제 구매');
      save(); render();
    };
    processBtn.onclick = () => {
      let need = toNum(needInput.value);
      if (need <= 0) return alert('필요 수량을 입력하세요.');
      let remaining = getKeepStats(plan.key).remaining;
      if (remaining >= need) {
        db.keepHistory.push({ id: uid(), date: todayISO(), key: plan.key, type: 'ship', qty: need, cost: 0, option_label: '', note: '필요 수량 처리' });
      } else {
        if (remaining > 0) db.keepHistory.push({ id: uid(), date: todayISO(), key: plan.key, type: 'ship', qty: remaining, cost: 0, option_label: '', note: '필요 수량 처리' });
        need -= remaining;
        let localRemaining = 0;
        while (need > localRemaining) {
          const opt = plan.options.find((x) => x.label === optionSel.value) || plan.options[0];
          db.keepHistory.push({ id: uid(), date: todayISO(), key: plan.key, type: 'purchase', qty: opt.total_qty, cost: opt.total_price, option_label: opt.label, note: '자동 선결제 추가' });
          addKeepPurchaseInbound(plan, opt, '자동 선결제 추가');
          localRemaining += opt.total_qty;
        }
        db.keepHistory.push({ id: uid(), date: todayISO(), key: plan.key, type: 'ship', qty: need, cost: 0, option_label: '', note: '필요 수량 처리' });
      }
      save(); render();
    };

    panel.appendChild(el('div', { class: 'row top' }, [field('선결제 옵션', optionSel), field(`킵만 출고(${plan.unit})`, quickInput), shipBtn]));
    panel.appendChild(el('div', { class: 'row top', style: { marginTop: '10px' } }, [field(`필요 수량 처리(${plan.unit})`, needInput), purchaseBtn, processBtn]));
    const kpi = el('div', { class: 'kpi', style: { marginTop: '14px' } });
    kpi.appendChild(makeKpi('누적 선결제', `${qtyFmt(stats.purchased)}${plan.unit}`));
    kpi.appendChild(makeKpi('누적 출고', `${qtyFmt(stats.shipped)}${plan.unit}`));
    kpi.appendChild(makeKpi('남은 킵 수량', `${qtyFmt(stats.remaining)}${plan.unit}`));
    kpi.appendChild(makeKpi('현재 옵션', (() => { const o = plan.options.find((x) => x.label === optionSel.value) || plan.options[0]; return `${o.label} / ${money(o.total_price)}원`; })(), '', 'compact'));
    panel.appendChild(kpi);
    grid.appendChild(panel);
  });

  card.appendChild(grid);

  const add = el('div', { class: 'panel', style: { marginTop: '16px' } });
  add.appendChild(el('h3', { text: '선결제 품목 추가' }));
  const nameInput = el('input', { type: 'text', placeholder: '품목명' });
  const unitInput = el('input', { type: 'text', value: '개' });
  const qtyInput = el('input', { type: 'number', value: '1', min: '1' });
  const priceInput = el('input', { type: 'number', value: '0', min: '0' });
  const alertInput = el('input', { type: 'number', value: '0', min: '0' });
  const addBtn = el('button', { class: 'btn primary', type: 'button', text: '추가' });
  addBtn.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) return alert('품목명을 입력하세요.');
    const key = `keep_${uid()}`;
    db.keepPlans.push({ key, name, item_name: name, unit: unitInput.value.trim() || '개', low_alert: toNum(alertInput.value), selected_option: '기본', default_ship_qty: 1, options: [{ label: '기본', total_qty: toNum(qtyInput.value) || 1, total_price: toNum(priceInput.value) }] });
    db.catalog.push({ id: uid(), vendor: '선결제', category: '선결제', name: `${name} 선결제`, unit: '계약', unit_price: toNum(priceInput.value) });
    save(); render();
  };
  add.appendChild(el('div', { class: 'row top' }, [field('품목명', nameInput), field('단위', unitInput), field('선결제 수량', qtyInput), field('선결제 금액', priceInput), field('알림 기준', alertInput), addBtn]));
  add.appendChild(el('div', { class: 'mini', text: '기본 품목 외에도 선결제 품목을 추가할 수 있습니다.' }));
  card.appendChild(add);

  return card;
}

function renderDaily() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '일일재고' }));
  const dateInput = el('input', { type: 'date', value: todayISO() });
  let savedSel = buildSavedDateSelect(db.dailyRecords, dateInput.value);
  const row = getDailyRow(dateInput.value);
  const patientInput = el('input', { type: 'number', min: '0', placeholder: '' }); setDefaultValue(patientInput, row.managed_patients);
  const sheetInput = el('input', { type: 'number', min: '0' }); setDefaultValue(sheetInput, row.sheet_stock);
  const gelInput = el('input', { type: 'number', min: '0' }); setDefaultValue(gelInput, row.gel_stock);
  const reviveInput = el('input', { type: 'number', min: '0' }); setDefaultValue(reviveInput, row.revive_stock);
  const modelingInput = el('input', { type: 'number', min: '0' }); setDefaultValue(modelingInput, row.modeling_unopened);
  const modelUsers = el('input', { type: 'number', min: '0' }); setDefaultValue(modelUsers, row.modeling_users);
  const saveBtn = el('button', { class: 'btn primary', type: 'button', text: '저장' });

  function refreshInputs() {
    const r = getDailyRow(dateInput.value);
    setDefaultValue(patientInput, r.managed_patients); setDefaultValue(sheetInput, r.sheet_stock); setDefaultValue(gelInput, r.gel_stock); setDefaultValue(reviveInput, r.revive_stock); setDefaultValue(modelingInput, r.modeling_unopened); setDefaultValue(modelUsers, r.modeling_users);
    const replacement = buildSavedDateSelect(db.dailyRecords, dateInput.value);
    replacement.onchange = savedSel.onchange;
    savedSel.replaceWith(replacement); savedSel = replacement;
  }
  savedSel.onchange = () => { if (savedSel.value) { dateInput.value = savedSel.value; refreshInputs(); } };
  dateInput.onchange = refreshInputs;

  card.appendChild(el('div', { class: 'row top' }, [
    field('날짜', dateInput),
    field('당일 관리환자수', patientInput),
    field('저장된 날짜', savedSel),
    saveBtn,
  ]));
  card.appendChild(el('div', { class: 'grid-2', style: { marginTop: '14px' } }, [
    panelInput('3가지 팩 재고', [field(PACK_LABELS.sheet, sheetInput), field(PACK_LABELS.gel, gelInput), field(PACK_LABELS.revive, reviveInput)]),
    panelInput('모델링팩', [field('미개봉 재고(kg)', modelingInput), field('오늘 사용 인원', modelUsers)]),
  ]));

  saveBtn.onclick = () => {
    if (patientInput.value === '' && !window.confirm('당일 관리환자수가 비어 있습니다. 계속 저장하시겠습니까?')) return;
    db.dailyRecords[dateInput.value] = {
      sheet_stock: sheetInput.value === '' ? '' : toNum(sheetInput.value),
      gel_stock: gelInput.value === '' ? '' : toNum(gelInput.value),
      revive_stock: reviveInput.value === '' ? '' : toNum(reviveInput.value),
      managed_patients: patientInput.value === '' ? '' : toNum(patientInput.value),
      modeling_unopened: modelingInput.value === '' ? '' : toNum(modelingInput.value),
      modeling_users: modelUsers.value === '' ? '' : toNum(modelUsers.value),
    };
    save(); render();
  };

  const month = monthISO();
  const stats = getMonthlyPackStats(month);
  const statsWrap = el('div', { class: 'table-wrap', style: { marginTop: '16px' } });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>팩</th><th class="num">이번달 사용</th><th class="num">주 평균</th><th class="num">일 평균</th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector('tbody');
  stats.rows.forEach((r) => {
    const unit = r.unit || (r.label === PACK_LABELS.sheet ? '장' : r.label === PACK_LABELS.modeling ? '명' : '개');
    const tr = el('tr');
    tr.innerHTML = `<td>${r.label}</td><td class="num">${money(r.month)}${unit}</td><td class="num">${r.week.toFixed(1)}${unit}</td><td class="num">${r.day.toFixed(1)}${unit}</td>`;
    tbody.appendChild(tr);
  });
  statsWrap.appendChild(table);
  card.appendChild(statsWrap);
  return card;
}
function panelInput(title, fields) {
  const p = el('div', { class: 'panel' });
  p.appendChild(el('h3', { text: title }));
  p.appendChild(el('div', { class: 'stack' }, fields));
  return p;
}

function renderWeekly() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '주간재고' }));
  const dateInput = el('input', { type: 'date', value: todayISO() });
  let savedSel = buildSavedDateSelect(db.weeklyRecords, dateInput.value);
  const groupSel = el('select');
  WEEKLY_GROUPS.forEach((g) => groupSel.appendChild(el('option', { value: g, text: g })));
  const searchInput = el('input', { type: 'text', placeholder: '현재 그룹 내 품목 검색' });
  const saveBtn = el('button', { class: 'btn primary', type: 'button', text: '현재 그룹 저장' });

  card.appendChild(el('div', { class: 'row top' }, [field('날짜', dateInput), field('저장된 날짜', savedSel), field('그룹 선택', groupSel), field('검색', searchInput), saveBtn]));
  const container = el('div', { style: { marginTop: '14px' } });
  card.appendChild(container);

  function currentGroupItems() {
    let items = getWeeklyItems(groupSel.value);
    const keyword = searchInput.value.trim();
    if (keyword) items = items.filter((x) => x.name.includes(keyword));
    return items;
  }

  function renderGroup() {
    container.innerHTML = '';
    const group = groupSel.value;
    const items = currentGroupItems();
    const block = el('div', { class: 'panel' });
    block.appendChild(el('div', { class: 'section-title' }, [
      el('h3', { text: group }),
      el('div', { class: 'mini', text: '그룹별로 따로 확인하고 저장합니다.' })
    ]));
    if (!items.length) {
      block.appendChild(el('div', { class: 'empty', text: '해당 그룹 품목이 없습니다.' }));
      container.appendChild(block);
      return;
    }
    const wrap = el('div', { class: 'table-wrap', style: { maxHeight: '520px', overflow: 'auto' } });
    const table = el('table');
    table.innerHTML = '<thead><tr><th>즐겨찾기</th><th>품목</th><th class="num">현재 재고</th><th class="num">최근 재고</th><th>단위</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    items.forEach((item) => {
      const row = db.weeklyRecords[dateInput.value]?.[item.name];
      const qtyInput = el('input', { type: 'number', min: '0', value: row === undefined ? '' : String(row) });
      const star = el('span', { class: `fav${item.favorite ? ' on' : ''}`, text: item.favorite ? '★' : '☆', onclick: () => { item.favorite = !item.favorite; save(); renderGroup(); } });
      const tr = el('tr');
      tr.innerHTML = `<td></td><td>${item.name}</td><td class="num"></td><td class="num">${money(getLatestWeeklyQty(item.name))}</td><td>${item.unit}</td>`;
      tr.children[0].appendChild(star);
      tr.children[2].appendChild(qtyInput);
      tbody.appendChild(tr);
    });
    wrap.appendChild(table);
    block.appendChild(wrap);
    container.appendChild(block);
    saveBtn.textContent = `${group} 저장`;
  }

  searchInput.oninput = renderGroup;
  groupSel.onchange = renderGroup;
  savedSel.onchange = () => { if (savedSel.value) { dateInput.value = savedSel.value; renderGroup(); } };
  dateInput.onchange = renderGroup;

  saveBtn.onclick = () => {
    if (!db.weeklyRecords[dateInput.value]) db.weeklyRecords[dateInput.value] = {};
    container.querySelectorAll('tbody tr').forEach((tr) => {
      const name = tr.children[1].textContent;
      const qty = tr.children[2].querySelector('input').value;
      db.weeklyRecords[dateInput.value][name] = qty === '' ? '' : toNum(qty);
    });
    save();
    render();
  };
  renderGroup();
  return card;
}

function renderPrice() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '가격표' }));
  const month = monthISO();
  const totalCost = getMonthlyCostSummary(month).total;
  const kpi = el('div', { class: 'kpi' });
  kpi.appendChild(makeKpi('이번달 총 비용', `${money(totalCost)}원`));
  kpi.appendChild(makeKpi('시트팩 킵 잔량', `${getKeepStats('sheetmask').remaining}장`));
  kpi.appendChild(makeKpi('모델링 킵 잔량', `${getKeepStats('modeling').remaining}kg`));
  card.appendChild(kpi);

  const groups = {};
  db.catalog.filter((x) => !x.category.includes('선결제')).forEach((row) => {
    const key = `${row.category}`;
    groups[key] ||= [];
    groups[key].push(row);
  });
  Object.entries(groups).forEach(([category, rows]) => {
    const panel = el('div', { class: 'panel', style: { marginTop: '16px' } });
    panel.appendChild(el('h3', { text: category }));
    const wrap = el('div', { class: 'table-wrap' });
    const table = el('table');
    table.innerHTML = '<thead><tr><th>즐겨찾기</th><th>업체</th><th>품목</th><th class="num">단가</th><th>프로모션</th><th class="num">이번달 비용</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    rows.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || a.vendor.localeCompare(b.vendor, 'ko') || a.name.localeCompare(b.name, 'ko')).forEach((r) => {
      const star = el('span', { class: `fav${r.favorite ? ' on' : ''}`, text: r.favorite ? '★' : '☆', onclick: () => {
        r.favorite = !r.favorite;
        const inv = db.items.find((x) => x.name === (r.inventory_name || r.name));
        if (inv) inv.favorite = r.favorite;
        save(); render();
      } });
      const monthly = monthInboundRows(month).filter((x) => x.display_name === r.name || x.item_name === (r.inventory_name || r.name)).reduce((a, x) => a + toNum(x.total_paid), 0);
      const tr = el('tr');
      tr.innerHTML = `<td></td><td>${r.vendor}</td><td>${r.name}</td><td class="num">${r.unit_price ? `${money(r.unit_price)}원` : '-'}</td><td>${promoText(r)}</td><td class="num">${monthly ? `${money(monthly)}원` : '-'}</td>`;
      tr.children[0].appendChild(star);
      tbody.appendChild(tr);
    });
    wrap.appendChild(table); panel.appendChild(wrap); card.appendChild(panel);
  });
  return card;
}
function promoText(r) {
  if (!r.promo) return r.note || '-';
  if (r.promo.type === 'tiered_free') return r.promo.rules.map((x) => `${x.min}+${x.free}`).join(' / ');
  return '-';
}

function renderReport() {
  const card = el('div', { class: 'card report-card' });
  const monthInput = el('input', { type: 'month', value: monthISO() });
  const htmlBtn = el('button', { class: 'btn light no-print', type: 'button', text: '보고서 저장(HTML)' });
  const printBtn = el('button', { class: 'btn primary no-print', type: 'button', text: '인쇄 / PDF 저장' });
  card.appendChild(el('div', { class: 'report-head' }, [el('h2', { text: '월간보고' }), el('div', { class: 'row no-print' }, [field('월 선택', monthInput), htmlBtn, printBtn])]));
  const content = el('div', { id: 'reportContent', class: 'stack' });
  card.appendChild(content);

  function buildReportData(month) {
    const stats = getMonthlyPackStats(month);
    const current = getCurrentPackStock();
    const cost = getMonthlyCostSummary(month);
    const alerts = getCurrentStockAlerts();
    return { stats, cost, keepSheet: getKeepStats('sheetmask'), keepModel: getKeepStats('modeling') };
  }
  function renderReportContent() {
    const month = monthInput.value;
    const data = buildReportData(month);
    const patients = getMonthlyManagedPatients(month);
    content.innerHTML = '';
    content.appendChild(el('div', { class: 'section-title' }, [el('div', { html: `<div style="font-size:22px;font-weight:800">${month} 월간 보고</div>` })]));

    const block0 = el('div', { class: 'report-block' });
    block0.appendChild(el('h3', { text: '관리 환자수' }));
    const t0 = el('div', { class: 'table-wrap' });
    const table0 = el('table');
    table0.innerHTML = '<thead><tr><th>항목</th><th class="num">값</th></tr></thead><tbody></tbody>';
    table0.querySelector('tbody').innerHTML = `
      <tr><td>월 관리 환자수</td><td class="num">${money(patients.total)}명</td></tr>
      <tr><td>일 평균 관리 환자수</td><td class="num">${patients.average.toFixed(1)}명</td></tr>`;
    t0.appendChild(table0); block0.appendChild(t0);
    const monthStatus = getMonthDataStatus(month);
    const blockStatus = el('div', { class: 'report-block' });
    blockStatus.appendChild(el('h3', { text: '통계 기준' }));
    const ts = el('div', { class: 'table-wrap' });
    const tableS = el('table');
    tableS.innerHTML = '<thead><tr><th>항목</th><th class="num">값</th></tr></thead><tbody></tbody>';
    tableS.querySelector('tbody').innerHTML = `
      <tr><td>상태</td><td class="num">${monthStatus.label}</td></tr>
      <tr><td>기록일</td><td class="num">${money(monthStatus.recordDays)}일</td></tr>
      <tr><td>월 관리 환자수</td><td class="num">${money(patients.total)}명</td></tr>
      <tr><td>기록일 기준 평균</td><td class="num">${patients.average.toFixed(1)}명</td></tr>`;
    ts.appendChild(tableS); blockStatus.appendChild(ts);

    const block1 = el('div', { class: 'report-block' });
    block1.appendChild(el('h3', { text: '팩 사용 통계' }));
    const t1 = el('div', { class: 'table-wrap' });
    const table1 = el('table');
    table1.innerHTML = '<thead><tr><th>팩</th><th class="num">월 사용량</th><th class="num">사용 비율</th></tr></thead><tbody></tbody>';
    const tb1 = table1.querySelector('tbody');
    data.stats.rows.forEach((r) => {
      const unit = r.unit || (r.label === PACK_LABELS.sheet ? '장' : '개');
      const tr = el('tr');
      tr.innerHTML = `<td>${r.label}</td><td class="num">${money(r.month)}${unit}</td><td class="num">${r.ratio.toFixed(1)}%</td>`;
      tb1.appendChild(tr);
    });
    t1.appendChild(table1); block1.appendChild(t1);

    const block2 = el('div', { class: 'report-block' });
    block2.appendChild(el('h3', { text: '모델링 사용 통계' }));
    const t2 = el('div', { class: 'table-wrap' });
    const table2 = el('table');
    table2.innerHTML = '<thead><tr><th>항목</th><th class="num">값</th></tr></thead><tbody></tbody>';
    table2.querySelector('tbody').innerHTML = `
      <tr><td>월 사용 인원</td><td class="num">${money(data.stats.modelingUsers)}명</td></tr>
      <tr><td>주 평균 인원</td><td class="num">${(data.stats.modelingUsers / 4.3).toFixed(1)}명</td></tr>
      <tr><td>일 평균 인원</td><td class="num">${(data.stats.modelingUsers / Math.max(data.stats.days,1)).toFixed(1)}명</td></tr>
      <tr><td>월 재고 사용</td><td class="num">${money(data.stats.modelingKg)}kg</td></tr>`;
    t2.appendChild(table2); block2.appendChild(t2);

    const block3 = el('div', { class: 'report-block' });
    block3.appendChild(el('h3', { text: '환자 대비 팩 사용률' }));
    const t3 = el('div', { class: 'table-wrap' });
    const table3 = el('table');
    table3.innerHTML = '<thead><tr><th>팩</th><th class="num">사용수</th><th class="num">관리환자수</th><th class="num">사용률</th></tr></thead><tbody></tbody>';
    const patientTotal = patients.total;
    const rateRows = [
      { label: PACK_LABELS.sheet, value: data.stats.rows.find((x) => x.label === PACK_LABELS.sheet)?.month || 0, unit: '장' },
      { label: PACK_LABELS.gel, value: data.stats.rows.find((x) => x.label === PACK_LABELS.gel)?.month || 0, unit: '개' },
      { label: PACK_LABELS.revive, value: data.stats.rows.find((x) => x.label === PACK_LABELS.revive)?.month || 0, unit: '개' },
      { label: PACK_LABELS.modeling, value: data.stats.modelingUsers || 0, unit: '명' },
    ];
    const tb3 = table3.querySelector('tbody');
    rateRows.forEach((r) => {
      const rate = patientTotal ? (r.value / patientTotal) * 100 : 0;
      const tr = el('tr');
      tr.innerHTML = `<td>${r.label}</td><td class="num">${money(r.value)}${r.unit}</td><td class="num">${money(patientTotal)}명</td><td class="num">${rate.toFixed(1)}%</td>`;
      tb3.appendChild(tr);
    });
    t3.appendChild(table3); block3.appendChild(t3);

    const block4 = el('div', { class: 'report-block' });
    block4.appendChild(el('h3', { text: '이번달 비용 요약' }));
    const t4 = el('div', { class: 'table-wrap' });
    const table4 = el('table');
    table4.innerHTML = '<thead><tr><th>항목</th><th class="num">금액</th></tr></thead><tbody></tbody>';
    table4.querySelector('tbody').innerHTML = `
      <tr><td>일반 입고</td><td class="num">${money(data.cost.inbound)}원</td></tr>
      <tr><td>선결제 구매</td><td class="num">${money(data.cost.keep)}원</td></tr>
      <tr><td><b>합계</b></td><td class="num"><b>${money(data.cost.total)}원</b></td></tr>`;
    t4.appendChild(table4); block4.appendChild(t4);

    if (patients.missingDates.length) {
      const warn = el('div', { class: 'mini', text: `관리환자수 미입력 날짜: ${patients.missingDates.join(', ')}` });
      block0.appendChild(warn);
    }

    content.appendChild(block0); content.appendChild(blockStatus); content.appendChild(block1); content.appendChild(block2); content.appendChild(block3); content.appendChild(block4);
  }
  function buildReportHTML(month) {
    const cloned = content.cloneNode(true);
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${month} 월간보고</title><style>body{font-family:ui-sans-serif,system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:#2f2f38;padding:28px;background:#fff}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #e7e3f1;padding:10px 12px;font-size:14px}th{background:#f6f3fd;text-align:left}.report-block{margin-bottom:18px;border:1px solid #e7e3f1;border-radius:16px;padding:14px}.badge{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px}.alert{background:#fff1f4;color:#b1495e}.ok{background:#eef8f2;color:#3f7d5c}.num{text-align:right}</style></head><body>${cloned.innerHTML}</body></html>`;
  }
  htmlBtn.onclick = () => {
    const month = monthInput.value;
    const blob = new Blob([buildReportHTML(month)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `월간보고_${month.replace('-', '_')}.html`; a.click(); URL.revokeObjectURL(url);
  };
  printBtn.onclick = () => {
    const prevTitle = document.title;
    const fileMonth = monthInput.value ? monthInput.value.replace('-', '_') : monthISO().replace('-', '_');
    document.title = `월간보고_${fileMonth}`;
    window.print();
    setTimeout(() => { document.title = prevTitle; }, 300);
  };
  monthInput.onchange = renderReportContent;
  renderReportContent();
  return card;
}

function renderItems() {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h2', { text: '품목추가' }));
  const nameInput = el('input', { type: 'text' });
  const scopeSel = el('select');
  [['weekly', '주간재고'], ['daily', '일일재고']].forEach(([v, t]) => scopeSel.appendChild(el('option', { value: v, text: t })));
  const groupSel = el('select');
  const unitInput = el('input', { type: 'text', value: '개' });
  const vendorInput = el('input', { type: 'text', value: '직접추가' });
  const priceInput = el('input', { type: 'number', value: '0', min: '0' });
  const addBtn = el('button', { class: 'btn primary', type: 'button', text: '품목 추가' });

  function fillGroups() {
    groupSel.innerHTML = '';
    const groups = scopeSel.value === 'weekly' ? WEEKLY_GROUPS : ['일일팩'];
    groups.forEach((g) => groupSel.appendChild(el('option', { value: g, text: g })));
  }
  fillGroups(); scopeSel.onchange = fillGroups;
  addBtn.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) return alert('품목명을 입력하세요.');
    if (db.items.find((x) => x.name === name)) return alert('이미 있는 품목입니다.');
    db.items.push({ id: uid(), name, scope: scopeSel.value, group: groupSel.value, unit: unitInput.value.trim() || '개', favorite: false, active: true, low_stock: '' });
    db.catalog.push({ id: uid(), vendor: vendorInput.value.trim() || '직접추가', category: groupSel.value, name, unit: unitInput.value.trim() || '개', unit_price: toNum(priceInput.value), inventory_name: name, favorite: false });
    save(); render();
  };
  card.appendChild(el('div', { class: 'row top' }, [field('품목명', nameInput), field('구분', scopeSel), field('그룹', groupSel), field('단위', unitInput), field('업체', vendorInput), field('가격', priceInput), addBtn]));

  const wrap = el('div', { class: 'table-wrap', style: { marginTop: '16px' } });
  const table = el('table');
  table.innerHTML = '<thead><tr><th>즐겨찾기</th><th>품목</th><th>구분</th><th>그룹</th><th>단위</th><th class="num">가격</th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector('tbody');
  db.items.slice().sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || a.scope.localeCompare(b.scope) || a.group.localeCompare(b.group, 'ko') || a.name.localeCompare(b.name, 'ko')).forEach((item) => {
    const cat = db.catalog.find((x) => x.inventory_name === item.name || x.name === item.name);
    const star = el('span', { class: `fav${item.favorite ? ' on' : ''}`, text: item.favorite ? '★' : '☆', onclick: () => {
      item.favorite = !item.favorite;
      if (cat) cat.favorite = item.favorite;
      save(); render();
    } });
    const tr = el('tr');
    tr.innerHTML = `<td></td><td>${item.name}</td><td>${item.scope === 'daily' ? '일일재고' : '주간재고'}</td><td>${item.group}</td><td>${item.unit}</td><td class="num">${cat?.unit_price ? `${money(cat.unit_price)}원` : '-'}</td>`;
    tr.children[0].appendChild(star);
    tbody.appendChild(tr);
  });
  wrap.appendChild(table); card.appendChild(wrap);
  return card;
}

$('#btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `피부팀재고백업_${todayISO()}.json`; a.click(); URL.revokeObjectURL(url);
};
$('#btnImport').onclick = () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json';
  inp.onchange = () => {
    const file = inp.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { db = migrate(JSON.parse(String(reader.result || '{}'))); save(); render(); }
      catch { alert('가져오기 실패'); }
    };
    reader.readAsText(file);
  };
  inp.click();
};
$('#btnReset').onclick = () => {
  if (!confirm('정말 초기화할까요?')) return;
  localStorage.removeItem(STORAGE_KEY);
  db = seed(); save(); render();
};

render();
