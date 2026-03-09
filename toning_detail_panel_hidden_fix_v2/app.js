/* =========================
   데이터 (여기만 수정하면 됨)
========================= */
const VAT_NOTICE = 'VAT 포함 / 현금·카드 동일가';

// 리프팅: 원장별 가격 스위치
const liftingDoctors = [
  { key:'director', label:'대표원장' },
  { key:'vice', label:'부원장' },
];

// 리프팅: 효과 기준 카테고리(사용자 지정)
const liftingCategories = [
  { key:'elastic', label:'탄력 리프팅', hint:'올리지오' },
  { key:'strong', label:'강한 리프팅', hint:'울쎄라' },
  { key:'contour', label:'윤곽 리프팅', hint:'세르프' },
  { key:'premium', label:'프리미엄 리프팅', hint:'패키지' },
];

const programSections = [
  {
    key: 'toning',
    title: '색소 / 토닝',
    isEvent: false,
    programs: [
      {
        id:'special-toning-1',
        name:'스페셜 토닝 1',
        price:1320000,
        effects:['색소','톤 개선','피부결'],
        details:'구성\n- 스타룩스 1540 + LED 재생레이저 + 수분진정팩 (1회)\n- 레블라이트 + 비타민관리 + 모델링팩 + 수분진정팩 (5회)\n- 피코토닝 + 비타민관리 + 모델링팩 + 수분진정팩 (5회)'
      },
      {
        id:'special-toning-2',
        name:'스페셜 토닝 2',
        price:1430000,
        effects:['색소','톤 개선','피부결'],
        details:'구성\n- 맥스지·알렉스 + LED 재생레이저 + 수분진정팩 (2회)\n- 레블라이트 + 비타민관리 + 모델링팩 + 수분진정팩 (4회)\n- 피코토닝 + 비타민관리 + 모델링팩 + 수분진정팩 (4회)'
      },
      {
        id:'special-toning-3',
        name:'스페셜 토닝 3',
        price:1650000,
        effects:['색소','톤 개선','피부결'],
        details:'구성\n- 스타룩스 1540 + LED 재생레이저 + 수분진정팩 (1회)\n- 맥스지·알렉스 + LED 재생레이저 + 수분진정팩 (2회)\n- 레블라이트 + 비타민관리 + 모델링팩 + 수분진정팩 (4회)\n- 피코토닝 + 비타민관리 + 모델링팩 + 수분진정팩 (4회)\n- 얼굴 전체 CO2 병변 제거 (2회)'
      },
      {
        id:'special-toning-4',
        name:'스페셜 토닝 4',
        price:1650000,
        effects:['색소','톤 개선','피부결'],
        details:'구성\n- 맥스지·PICO 1064 + LED 재생레이저 + 수분진정팩 (2회)\n- 레블라이트 + 비타민관리 + 모델링팩 + 수분진정팩 (4회)\n- 피코토닝 + 비타민관리 + 모델링팩 + 수분진정팩 (4회)\n- 얼굴 전체 CO2 병변 제거 (2회)\n\n옵션(현장 추가/변경)\n- 비타민관리 → LDM관리 변경 +55,000원\n- 알러지 케어(원장님 진료 후 가능) +55,000원\n- 진정관리 혹은 비타민관리 추가 +55,000원'
      },
      {
        id:'dual-toning-ldm',
        name:'듀얼 토닝 프로그램',
        price:1980000,
        effects:['색소','진정','장벽'],
        details:'구성\n- 맥스지·알렉스 + LED 재생레이저 + 수분진정팩 (1회)\n- 레블라이트 + 제네시스토닝 + LDM관리 + 하이드로겔팩 (5회)\n- 피코토닝 + LDM관리 + 하이드로겔팩 (5회)'
      },
      {
        id:'triple-toning-ldm',
        name:'트리플 토닝 프로그램',
        price:1650000,
        effects:['색소','진정','장벽'],
        details:'구성\n- 스타룩스 1540 + LED 재생레이저 + 수분진정팩 (1회)\n- 맥스지·알렉스 + LED 재생레이저 + 수분진정팩 (5회)\n- 레블라이트 + 제네시스토닝 + LDM관리 + 하이드로겔팩 (5회)\n- 피코토닝 + 이래비티 + LDM관리 + 하이드로겔팩 (5회)\n- 얼굴 전체 CO2 병변 제거 (2회)'
      }
    ]
  },
  {
    key: 'redness',
    title: '홍조',
    isEvent: false,
    programs: [
      {
        id:'redness-ldm',
        name:'홍조 LDM 프로그램',
        price:1540000,
        effects:['홍조','진정','장벽'],
        details:'구성\n- 제네시스토닝 + LDM관리 + 진정거즈팩 (5회)\n- LDM관리 + 진정거즈팩 (5회)'
      },
      { id:'vascular-ldm-5', name:'맞춤혈관 LDM 프로그램 (5회)', price:990000, effects:['홍조','혈관','진정'], details:'맞춤혈관레이저 + LDM관리 + 진정거즈팩 (5회)' },
      { id:'vascular-ldm-10', name:'맞춤혈관 LDM 프로그램 (10회)', price:1870000, effects:['홍조','혈관','진정'], details:'맞춤혈관레이저 + LDM관리 + 진정거즈팩 (10회)' },
      { id:'ldm-1', name:'LDM 1회', price:165000, effects:['진정','장벽','붓기'], details:'LDM 단독 관리 1회.' },
      { id:'ldm-10', name:'LDM 10회', price:1100000, effects:['진정','장벽','붓기'], details:'LDM 단독 관리 10회 패키지.' },
      { id:'toning-ldm', name:'토닝 LDM 프로그램', price:1540000, effects:['색소','진정','장벽'], details:'구성\n- 레블라이트 + LDM관리 + LED 재생레이저 + 수분진정팩 (5회)\n- 피코토닝 + LDM관리 + LED 재생레이저 + 수분진정팩 (5회)' }
    ]
  },
  {
    key: 'acne',
    title: '여드름/자국',
    isEvent: false,
    programs: [
      { id:'acne-4w', name:'여드름 4주 프로그램', price:385000, effects:['여드름','염증 진정','피지'], details:'구성\n- 압출 + LED 재생레이저 + 콤스 스케일링 + 진정 모델링팩 (2회)\n- 압출 + 크라이오 관리 + 진정 모델링팩 (2회)\n\n내원\n- 주 1회 × 4주 (피부 상태에 따라 조정 가능)' },
      { id:'acne-6w', name:'여드름 6주 프로그램', price:770000, effects:['여드름','염증 진정','피지'], details:'구성\n- 압출 + LED 재생레이저 + 콤스 스케일링 + 카프리 레이저 + 모델링팩 (3회)\n- 압출 + 크라이오 관리 + 진정 모델링팩 (3회)\n\n내원\n- 주 1회 × 6주 (피부 상태에 따라 조정 가능)' },
      { id:'acne-8w', name:'여드름 8주 프로그램', price:990000, effects:['맞춤치료','염증 관리','피지'], details:'여드름 맞춤치료(당일 진료 후 레이저/관리 구성)\n내원: 주 1회 × 8주 (피부 상태에 따라 조정 가능)' },
      { id:'scar-erase-8w', name:'자국지우기 프로그램', price:990000, effects:['여드름 자국','색소','피부결'], details:'구성\n- 압출 + LED 재생레이저 + 자국레이저 + 콤스 스케일링 + 모델링팩 (4회)\n- 압출 + LED 재생레이저 + 피코 MLA + 모델링팩 (4회)\n\n내원\n- 주 1회 × 8주 (피부 상태에 따라 조정 가능)\n\n옵션(현장 추가)\n- 코 블랙헤드 관리 1회 +55,000원\n- 알러지 케어(원장님진료 후 가능) +55,000원\n- 진정관리(+추가) +55,000원' }
    ]
  },
  {
    key: 'skintexture',
    title: '피부결 (모공 / 흉터)',
    isEvent: false,
    programs: [
      {
        id:'scar-pico-regen',
        name:'피코프락셀+재생',
        price:330000,
        displayPriceText:'330,000원',
        effects:['흉터','모공','피부결'],
        variantType:'fullOnly',
        variants:{ full:[ {label:'1회', price:330000}, {label:'3회', price:770000}, {label:'5회', price:1100000} ] },
        details:'전체 시술만 가능'
      },
      {
        id:'scar-pico-cross-regen',
        name:'피코프락셀+CROSS+재생',
        price:385000,
        displayPriceText:'385,000원~',
        effects:['여드름흉터','모공','피부결'],
        variantType:'cheekFull',
        variants:{ cheek:[ {label:'1회', price:385000}, {label:'3회', price:990000}, {label:'5회', price:1540000} ], full:[ {label:'1회', price:440000}, {label:'3회', price:1210000}, {label:'5회', price:1870000} ] },
        extraOptions:[ {id:'nose-glabella', label:'코+미간', price:110000}, {id:'temple', label:'관자놀이', price:110000} ],
        details:'부위/횟수에 따라 금액이 상이합니다.'
      },
      {
        id:'scar-pico-cross-subcision',
        name:'피코프락셀+CROSS+서브시전',
        price:550000,
        displayPriceText:'550,000원~',
        effects:['깊은흉터','함몰흉터'],
        variantType:'cheekFull',
        variants:{ cheek:[ {label:'1회', price:550000}, {label:'3회', price:1540000}, {label:'5회', price:2200000} ], full:[ {label:'1회', price:880000}, {label:'3회', price:2200000}, {label:'5회', price:3300000} ] },
        extraOptions:[ {id:'nose-glabella', label:'코+미간', price:110000}, {id:'temple', label:'관자놀이', price:110000} ],
        details:'부위/횟수에 따라 금액이 상이합니다.'
      }
    ]
  },
  {
    key: 'lifting',
    title: '리프팅',
    isEvent: false,
    programs: [
      { id:'oligio-600', cat:'elastic', name:'올리지오 600샷', prices:{ director:1100000, vice:990000 }, effects:['탄력','타이트닝','결 개선'], details:'올리지오 600샷 1회. 피부 상태/부위에 따라 시술 범위가 달라질 수 있습니다.' },
      { id:'ulthera-200', cat:'strong', name:'울쎄라 200샷', prices:{ director:880000, vice:770000 }, effects:['리프팅','탄력','처짐 개선'], details:'울쎄라 200샷 1회. 개인 피부 상태/부위에 따라 샷 수 및 범위가 달라질 수 있습니다.' },
      { id:'ulthera-300', cat:'strong', name:'울쎄라 300샷', prices:{ director:1275000, vice:1080000 }, effects:['리프팅','탄력','처짐 개선'], details:'울쎄라 300샷 1회. 개인 피부 상태/부위에 따라 샷 수 및 범위가 달라질 수 있습니다.' },
      { id:'ulthera-400', cat:'strong', name:'울쎄라 400샷', prices:{ director:1650000, vice:1430000 }, effects:['리프팅','탄력','윤곽'], details:'울쎄라 400샷 1회. 개인 피부 상태/부위에 따라 샷 수 및 범위가 달라질 수 있습니다.' },
      { id:'ulthera-600', cat:'strong', name:'울쎄라 600샷', prices:{ director:2310000, vice:1980000 }, effects:['리프팅','탄력','윤곽'], details:'울쎄라 600샷 1회. 개인 피부 상태/부위에 따라 샷 수 및 범위가 달라질 수 있습니다.' },
      { id:'xurf-600', cat:'contour', name:'세르프 600샷', prices:{ director:1980000, vice:1760000 }, effects:['윤곽','타이트닝','탄력'], details:'세르프 600샷 1회. 피부 상태/부위에 따라 시술 범위가 달라질 수 있습니다.' },
      { id:'ulthera200-xurf600', cat:'premium', name:'울쎄라200 + 세르프600', prices:{ director:2530000, vice:2310000 }, effects:['프리미엄','탄력','윤곽'], details:'울쎄라(200샷) + 세르프(600샷) 1회 패키지.' },
      { id:'ulthera300-xurf600', cat:'premium', name:'울쎄라300 + 세르프600', prices:{ director:2870000, vice:2530000 }, effects:['프리미엄','탄력','윤곽'], details:'울쎄라(300샷) + 세르프(600샷) 1회 패키지.' },
      { id:'ulthera400-xurf600', cat:'premium', name:'울쎄라400 + 세르프600', prices:{ director:3190000, vice:2750000 }, effects:['프리미엄','탄력','윤곽'], details:'울쎄라(400샷) + 세르프(600샷) 1회 패키지.' },
      { id:'ulthera600-xurf600', cat:'premium', name:'울쎄라600 + 세르프600', prices:{ director:3740000, vice:3190000 }, effects:['프리미엄','탄력','윤곽'], details:'울쎄라(600샷) + 세르프(600샷) 1회 패키지.' },
      { id:'oligio600-xurf600', cat:'premium', name:'올리지오600 + 세르프600', prices:{ director:2530000, vice:1650000 }, effects:['프리미엄','탄력','윤곽'], details:'올리지오(600샷) + 세르프(600샷) 1회 패키지.' }
    ]
  },
  {
    key: 'skinbooster',
    title: '스킨부스터',
    isEvent: false,
    programs: [
      { id:'re20-1', name:'Re20 1회 맛보기 (리투오 5cc + 재생레이저)', price:660000, effects:['탄력','보습','재생'], details:'Re20 Skinbooster. 리투오 5cc + 재생레이저 1회.' },
      { id:'re20-3', name:'Re20 3회 패키지 (리투오 5cc + 재생레이저)', price:1600000, effects:['탄력','보습','재생'], details:'Re20 Skinbooster. 리투오 5cc + 재생레이저 3회.' },
      { id:'re20-lifting-3', name:'Re20 리프팅 병행 고객 전용 (리투오 5cc + 재생레이저 3회)', price:1500000, effects:['탄력','보습','재생'], details:'리프팅 병행 고객 전용(울쎄라·올리지오·세르프 리프팅 시술 후 1년 간 적용).' },
      { id:'revive-1', name:'REVIVE 1회 맛보기 (리바이브 2cc + 재생레이저)', price:660000, effects:['보습','광채','장벽'], details:'REVIVE Skinbooster. 리바이브 2cc + 재생레이저 1회.' },
      { id:'revive-3', name:'REVIVE 3회 패키지 (리바이브 2cc + 재생레이저)', price:1600000, effects:['보습','광채','장벽'], details:'REVIVE Skinbooster. 리바이브 2cc + 재생레이저 3회.' },
      { id:'revive-lifting-3', name:'REVIVE 리프팅 병행 고객 전용 (리바이브 2cc + 재생레이저 3회)', price:1500000, effects:['보습','광채','장벽'], details:'리프팅 병행 고객 전용(울쎄라·올리지오·세르프 리프팅 시술 후 1년 간 적용).' }
    ]
  },
  {
    key: 'melasma_spot', title: '흑자 제거', isEvent: false,
    programs: [
      { id:'spot-0-1', name:'흑자 제거 (1cm 이하)', price:330000, effects:['흑자','색소'], details:'구성: 피코 532 1회 + 레블라이트 4회 (총 5회)\n할인: 2개 10% / 3개 20% / 4개 30%\n1년 내 동일 부위 재발 시 50% 할인(의료진 판단 기준)' },
      { id:'spot-1-2', name:'흑자 제거 (1~2cm)', price:440000, effects:['흑자','색소'], details:'구성: 피코 532 1회 + 레블라이트 4회 (총 5회)\n할인: 2개 10% / 3개 20% / 4개 30%\n1년 내 동일 부위 재발 시 50% 할인(의료진 판단 기준)' },
      { id:'spot-2-3', name:'흑자 제거 (2~3cm)', price:550000, effects:['흑자','색소'], details:'구성: 피코 532 1회 + 레블라이트 4회 (총 5회)\n할인: 2개 10% / 3개 20% / 4개 30%\n1년 내 동일 부위 재발 시 50% 할인(의료진 판단 기준)' },
      { id:'spot-3-4', name:'흑자 제거 (3~4cm)', price:660000, effects:['흑자','색소'], details:'구성: 피코 532 1회 + 레블라이트 4회 (총 5회)\n할인: 2개 10% / 3개 20% / 4개 30%\n1년 내 동일 부위 재발 시 50% 할인(의료진 판단 기준)' }
    ]
  },
  {
    key: 'tattoo', title: '문신 제거', isEvent: false,
    programs: [ { id:'tattoo-remove', name:'문신 제거', price:220000, effects:['문신','제거'], details:'눈썹/아이라인/타투/레터링 상담 후 범위별 안내' } ]
  },
  {
    key: 'hair', title: '제모', isEvent: false,
    programs: [ { id:'hair-remove', name:'제모 프로그램', price:33000, effects:['제모'], details:'부위별 1회/5회 가격은 상담 시 범위에 따라 안내됩니다.' } ]
  },
  {
    key: 'injectable', title: '보톡스 / 필러', isEvent: false,
    programs: [ { id:'botox-filler', name:'보톡스 / 필러', price:55000, effects:['보톡스','필러'], details:'주름보톡스/사각턱/종아리/승모근/스킨보톡스/필러/땀주사 가격은 부위별 안내됩니다.' } ]
  }
];

const singleLaserItems = [
  { id:'rev-lite-1', name:'레블라이트 토닝 1회', price:150000, note:'기본 토닝' },
  { id:'pico-532-1', name:'피코 532 1회', price:190000, note:'표재 색소' },
  { id:'alex-755-1', name:'알렉스 755 1회', price:220000, note:'진한 색소' }
];


/* =========================
   유틸
========================= */
const fmt = (n)=> new Intl.NumberFormat('ko-KR').format(Number(n||0));
const qs = (s,el=document)=> el.querySelector(s);
const qsa = (s,el=document)=> Array.from(el.querySelectorAll(s));

function isLiftingProgram(p){
  return !!(p && p.prices && typeof p.prices === 'object');
}
function getDoctorLabel(key){
  return (liftingDoctors.find(d=>d.key===key)?.label) || '';
}
function getProgramPrice(p, doctorKey){
  if(!p) return 0;
  if(isLiftingProgram(p)){
    const k = doctorKey || liftingDoctors[0]?.key;
    return Number(p.prices?.[k] || 0);
  }
  return Number(p.price || 0);
}
function getCartName(p, doctorKey){
  if(!p) return '';
  if(isLiftingProgram(p)){
    const label = getDoctorLabel(doctorKey);
    return `${p.name} (${label})`;
  }
  return p.name;
}
function getCartId(p, doctorKey){
  if(!p) return '';
  if(isLiftingProgram(p)){
    return `${p.id}__${doctorKey||liftingDoctors[0]?.key}`;
  }
  return p.id;
}


function hasVariantPricing(p){
  return !!(p && p.variants && typeof p.variants === 'object');
}
function getProgramPriceText(p, doctorKey){
  if(!p) return '0원';
  if(hasVariantPricing(p)) return p.displayPriceText || `${fmt(p.price||0)}원`;
  return `${fmt(getProgramPrice(p, doctorKey))}원`;
}
function renderVariantPriceGroups(p){
  const groupTitle = (k)=> k==='cheek' ? '양볼' : (k==='full' ? '풀페이스' : '전체 시술');
  const groups = [];
  if(p.variants.full && p.variantType==='fullOnly'){
    groups.push(['전체 시술', p.variants.full]);
  } else {
    if(p.variants.cheek) groups.push(['양볼', p.variants.cheek]);
    if(p.variants.full) groups.push(['풀페이스', p.variants.full]);
  }
  const boxes = groups.map(([label, arr])=>{
    const rows = arr.map(v=>`<div class="cardRow" style="margin-top:8px"><div class="tag" style="font-size:14px;color:var(--text)">${escapeHtml(v.label)} ${fmt(v.price)}원</div><button class="smallBtn variantAddBtn" data-area="${label}" data-label="${escapeHtml(v.label)}" data-price="${v.price}">추가</button></div>`).join('');
    return `<div class="card" style="background:rgba(15,19,32,.28);padding:12px;margin-top:10px"><div class="cardTitle" style="font-size:16px">${label}</div>${rows}${label==='양볼' && (p.extraOptions||[]).length ? `<div class="muted" style="margin-top:10px">추가 부위 (5회 선택 시 적용)</div><div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">${p.extraOptions.map(opt=>`<label style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="scarExtraChk" data-extra-id="${opt.id}" data-price="${opt.price}"> <span class="muted" style="font-size:14px">${escapeHtml(opt.label)} (+${fmt(opt.price)}원)</span></label>`).join('')}</div>`:''}</div>`;
  }).join('');
  const guide = p.variantType==='fullOnly'
    ? '횟수에 따라 금액이 상이합니다.\n부분 시술은 진행하지 않습니다.'
    : '부위/횟수에 따라 금액이 상이합니다.\n양볼 부분 시술 시 코+미간/관자놀이 추가는 5회 기준 각 110,000원 추가됩니다.';
  return boxes + `<div class="muted" style="margin-top:10px;line-height:1.6;white-space:pre-line">${guide}</div>`;
}
function loadLS(key, fallback){
  try{ const v = JSON.parse(localStorage.getItem(key)||''); return (v===null||v===undefined||v==='')?fallback:v; }catch(_){ return fallback; }
}
function saveLS(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(_){}
}
function logAction(label){
  actionLog.unshift({ts:Date.now(), label});
  if(actionLog.length>30) actionLog = actionLog.slice(0,30);
  renderActionLog();
}

const toast = (msg)=>{
  const t = qs('#toast'); qs('#toastText').textContent = msg;
  t.style.display='flex';
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(()=>{t.style.display='none'}, 1200);
};

/* =========================
   상태
========================= */
let view = 'price';            // price | single | admin
let activeSectionKey = 'toning';
let activeLiftingDoctor = liftingDoctors[0].key; // director | vice
let activeLiftingCat = liftingCategories[0].key; // elastic | strong | contour | premium
let selectedItem = null;       // {type:'program'|'single', ...}
let cart = [];                 // {id,name,price,qty}

// calculator / discount log
let adjValue = 0;              // current adjustment applied to cart sum (negative=discount)
let discountLog = [];          // {ts:number,label:string,amount:number,base:number}
let actionLog = [];            // {ts:number,label:string}
let favorites = loadLS('favorites', []); // array of ids
let recentConsults = loadLS('recentConsults', []); // array of snapshots
let __lastAdjInput = '0';

const TONING_POPUP_IDS = new Set([
  'special-toning-1',
  'special-toning-2',
  'special-toning-3',
  'special-toning-4',
  'dual-toning-ldm',
  'triple-toning-ldm'
]);

const TONING_AFTERCARE = [
  '간혹 시술 후 딱지가 생길 수 있으나 자연스럽게 탈각되오니 손으로 떼지 않도록 주의해주시기 바랍니다.',
  '시술 후 건조함이 동반될 수 있으므로 보습제를 사용해주시고, 외출 시 선크림을 바르는 것이 좋습니다.',
  '시술 당일 세안, 화장은 가능하지만 스크럽제 사용은 자제해 주시길 바랍니다.'
];

const TONING_POPUP_DATA = {
  'special-toning-1': {
    popupTitle:'스페셜 토닝 1 상세 정보',
    heroTitle:'스페셜 토닝 1',
    cards:[
      { title:'스타룩스 1540 + LED재생', count:'1회', desc:'피부 재생과 피부 구조 개선을 유도하는 비절제 프락셔널 레이저', art:'starlux' },
      { title:'레블라이트 + 미백관리', count:'5회', desc:'열과 빛 에너지로 색소를 서서히 분해해 점점 옅어지게 하는 토닝 레이저', art:'revlite' },
      { title:'피코토닝 + 미백관리', count:'5회', desc:'강한 빛 에너지로 색소를 더 미세하게 쪼개 제거를 돕는 피코 레이저', art:'pico' }
    ]
  },
  'special-toning-2': {
    popupTitle:'스페셜 토닝 2 상세 정보',
    heroTitle:'스페셜 토닝 2',
    cards:[
      { title:'맥스지&알렉스 + LED재생', count:'2회', desc:'혈관과 색소를 동시에 타깃하여 홍조와 잡티를 함께 개선하는 복합 레이저', art:'maxg' },
      { title:'레블라이트 + 미백관리', count:'4회', desc:'열과 빛 에너지로 색소를 서서히 분해해 점점 옅어지게 하는 토닝 레이저', art:'revlite' },
      { title:'피코토닝 + 미백관리', count:'4회', desc:'강한 빛 에너지로 색소를 더 미세하게 쪼개 제거를 돕는 피코 레이저', art:'pico' }
    ]
  },
  'special-toning-3': {
    popupTitle:'스페셜 토닝 3 상세 정보',
    heroTitle:'스페셜 토닝 3',
    cards:[
      { title:'스타룩스 1540 + LED재생', count:'1회', desc:'피부 재생과 피부 구조 개선을 유도하는 비절제 프락셔널 레이저', art:'starlux' },
      { title:'맥스지&알렉스 + LED재생', count:'2회', desc:'혈관과 색소를 동시에 타깃하여 홍조와 잡티를 함께 개선하는 복합 레이저', art:'maxg' },
      { title:'레블라이트 + 미백관리', count:'4회', desc:'열과 빛 에너지로 색소를 서서히 분해해 점점 옅어지게 하는 토닝 레이저', art:'revlite' },
      { title:'피코토닝 + 미백관리', count:'4회', desc:'강한 빛 에너지로 색소를 더 미세하게 쪼개 제거를 돕는 피코 레이저', art:'pico' },
      { title:'얼굴 전체 CO2 제거', count:'2회', desc:'** 시술 후 일주일간 재생 테이프 교체 **', art:'co2' }
    ]
  },
  'special-toning-4': {
    popupTitle:'스페셜 토닝 4 상세 정보',
    heroTitle:'스페셜 토닝 4',
    cards:[
      { title:'맥스지· PICO 1064 + LED재생', count:'2회', desc:'표면 색소와 깊은 색소를 동시에 정리해 피부톤을 균일하게 개선하는 레이저', art:'mix1064' },
      { title:'레블라이트 + 미백관리', count:'4회', desc:'열과 빛 에너지로 색소를 서서히 분해해 점점 옅어지게 하는 토닝 레이저', art:'revlite' },
      { title:'피코토닝 + 미백관리', count:'4회', desc:'강한 빛 에너지로 색소를 더 미세하게 쪼개 제거를 돕는 피코 레이저', art:'pico' },
      { title:'얼굴 전체 CO2 제거', count:'2회', desc:'** 시술 후 일주일간 재생 테이프 교체 **', art:'co2' }
    ]
  },
  'dual-toning-ldm': {
    popupTitle:'듀얼 토닝 상세 정보',
    heroTitle:'듀얼 토닝',
    cards:[
      { title:'맥스지&알렉스 + LED재생', count:'1회', desc:'혈관과 색소를 동시에 타깃하여 홍조와 잡티를 함께 개선하는 복합 레이저', art:'maxg' },
      { title:'레블라이트 + 제네시스 + LDM 트리플', count:'5회', desc:'색소를 잘게 분해하고 피부톤을 정돈하며 피부 회복을 돕는 복합 관리', art:'revlite' },
      { title:'피코토닝 + LDM 트리플', count:'5회', desc:'색소를 미세하게 분해하고 피부 회복 환경을 안정시키는 색소 관리', art:'pico' }
    ]
  },
  'triple-toning-ldm': {
    popupTitle:'트리플 토닝 상세 정보',
    heroTitle:'트리플 토닝',
    cards:[
      { title:'스타룩스 1540 + LED재생', count:'1회', desc:'피부 재생과 피부 구조 개선을 유도하는 비절제 프락셔널 레이저', art:'starlux' },
      { title:'맥스지&알렉스 + LED재생', count:'2회', desc:'혈관과 색소를 동시에 타깃하여 홍조와 잡티를 함께 개선하는 복합 레이저', art:'maxg' },
      { title:'레블라이트 + 제네시스 + LDM 트리플', count:'5회', desc:'색소를 잘게 분해하고 피부톤을 정돈하며 피부 회복을 돕는 복합 관리', art:'revlite' },
      { title:'피코토닝 + 이래비티 + LDM 트리플', count:'5회', desc:'색소를 미세하게 분해하고 피부결을 정돈하며 피부 회복을 돕는 복합 관리', art:'pico' },
      { title:'얼굴 전체 CO2 제거', count:'2회', desc:'** 시술 후 일주일간 재생 테이프 교체 **', art:'co2' }
    ]
  }
};

let toningPopupProgramId = null;

function shouldOpenToningPopup(program, sectionKey){
  return sectionKey === 'toning' && !!program && TONING_POPUP_IDS.has(program.id);
}

function renderToningArt(kind){
  const svgMap = {
    starlux: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" fill="#f5ecd5"/>
      <rect y="58" width="160" height="18" fill="#d7bf95"/><rect y="52" width="160" height="6" fill="#8f7047"/>
      <rect x="60" y="6" width="40" height="20" rx="4" fill="#d3d2cf" stroke="#8b8986"/>
      <rect x="54" y="24" width="52" height="10" rx="4" fill="#bbb7b3" stroke="#7c7772"/>
      <g stroke="#d46a53" stroke-width="4" stroke-linecap="round">
        <line x1="64" y1="34" x2="64" y2="72"/><line x1="76" y1="34" x2="76" y2="76"/>
        <line x1="88" y1="34" x2="88" y2="76"/><line x1="100" y1="34" x2="100" y2="72"/>
      </g>
      <g fill="none" stroke="#e3a292" stroke-width="3" stroke-linecap="round">
        <line x1="64" y1="72" x2="64" y2="84"/><line x1="76" y1="76" x2="76" y2="88"/>
        <line x1="88" y1="76" x2="88" y2="88"/><line x1="100" y1="72" x2="100" y2="84"/>
      </g>
    </svg>`,
    maxg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" fill="#f6ecd5"/>
      <rect y="58" width="160" height="18" fill="#d3b38d"/><rect y="52" width="160" height="6" fill="#866746"/>
      <g fill="#b89255" opacity=".9"><ellipse cx="34" cy="58" rx="9" ry="6"/><ellipse cx="50" cy="64" rx="10" ry="7"/><ellipse cx="65" cy="55" rx="9" ry="6"/><ellipse cx="80" cy="61" rx="8" ry="5"/></g>
      <g stroke="#bf7d78" stroke-width="2" fill="none"><path d="M20 76c8-14 12-16 20 0"/><path d="M42 78c8-18 16-18 24 0"/><path d="M72 80c6-13 12-15 18 0"/><path d="M98 77c8-17 16-17 24 0"/></g>
      <path d="M78 0h24c9 0 16 7 16 16v16H62V16c0-9 7-16 16-16z" fill="#d8b96f"/>
      <path d="M62 32h56L126 52H54z" fill="#f3e2a8" opacity=".75"/>
    </svg>`,
    revlite: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" fill="#f7edd8"/>
      <rect y="58" width="160" height="18" fill="#d9c29b"/><rect y="52" width="160" height="6" fill="#8d724c"/>
      <g fill="#a58a4b"><ellipse cx="42" cy="56" rx="10" ry="7"/><ellipse cx="62" cy="64" rx="9" ry="6"/><ellipse cx="78" cy="57" rx="8" ry="6"/></g>
      <g stroke="#b56f69" stroke-width="2" fill="none"><path d="M20 76c5-12 10-16 16 0"/><path d="M40 80c8-18 18-17 26 0"/><path d="M74 79c8-14 14-15 18 0"/></g>
      <rect x="86" y="12" width="18" height="34" rx="4" fill="#9c9795" stroke="#5f5c5b"/>
      <path d="M90 46h10l-4 16h-2z" fill="#8f867d" stroke="#5f5c5b"/>
      <path d="M93 48c-6 10-13 15-24 18" stroke="#8b6b3a" stroke-width="2.5" fill="none"/>
      <path d="M126 38v34" stroke="#111" stroke-width="2.2"/>
      <path d="M122 68l4 6 4-6" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    pico: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" fill="#f7edd9"/>
      <rect y="58" width="160" height="18" fill="#dbc49e"/><rect y="52" width="160" height="6" fill="#8c704c"/>
      <g stroke="#b26d69" stroke-width="2" fill="none"><path d="M22 78c6-14 10-15 16 0"/><path d="M42 80c7-16 14-16 22 0"/><path d="M70 79c7-16 16-15 22 0"/><path d="M102 77c7-15 14-15 20 0"/></g>
      <g fill="#a78a4d"><ellipse cx="42" cy="58" rx="9" ry="6"/><ellipse cx="58" cy="63" rx="9" ry="6"/><ellipse cx="73" cy="57" rx="8" ry="5"/></g>
      <rect x="96" y="10" width="18" height="26" rx="4" fill="#b98b69" stroke="#7a5a44"/>
      <path d="M99 36h12l-4 14h-4z" fill="#a57758" stroke="#7a5a44"/>
      <g stroke="#b4685c" stroke-width="2.5" stroke-linecap="round">
        <line x1="105" y1="48" x2="86" y2="70"/><line x1="105" y1="48" x2="114" y2="69"/>
        <line x1="105" y1="48" x2="95" y2="75"/><line x1="105" y1="48" x2="120" y2="56"/>
      </g>
      <g fill="#9d8041"><circle cx="86" cy="68" r="3"/><circle cx="80" cy="72" r="2.6"/><circle cx="92" cy="74" r="2.8"/><circle cx="98" cy="67" r="2.2"/><circle cx="74" cy="69" r="2.4"/></g>
    </svg>`,
    co2: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" fill="#f8efda"/>
      <rect y="58" width="160" height="18" fill="#dbc29a"/><rect y="52" width="160" height="6" fill="#8c704d"/>
      <circle cx="72" cy="54" r="16" fill="none" stroke="#ca825f" stroke-width="4"/>
      <circle cx="72" cy="54" r="7" fill="#e0a07a"/>
      <g stroke="#ca825f" stroke-width="2.5" fill="none">
        <path d="M72 34v-8"/><path d="M72 74v8"/><path d="M52 54h-8"/><path d="M92 54h8"/>
      </g>
      <path d="M110 20l18-18" stroke="#766b5e" stroke-width="4" stroke-linecap="round"/>
      <path d="M100 30l18-18" stroke="#766b5e" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    mix1064: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="96" fill="#f7ecd7"/>
      <rect y="58" width="160" height="18" fill="#d8c09a"/><rect y="52" width="160" height="6" fill="#8d714d"/>
      <g stroke="#b56f69" stroke-width="2" fill="none"><path d="M20 78c6-12 10-14 16 0"/><path d="M42 80c7-16 15-16 22 0"/><path d="M74 79c7-15 15-15 22 0"/><path d="M102 77c7-14 14-14 20 0"/></g>
      <path d="M24 16h32v16H24z" fill="#d2ccc9" stroke="#87817d"/>
      <path d="M24 32h32L50 52H30z" fill="#d2ccc9" stroke="#87817d"/>
      <path d="M22 52l18-20 18 20" fill="url(#g1)" opacity=".85"/>
      <rect x="108" y="16" width="18" height="28" rx="4" fill="#b98b69" stroke="#7a5a44"/>
      <path d="M111 44h12l-4 14h-4z" fill="#a57758" stroke="#7a5a44"/>
      <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#66d0ff"/><stop offset=".4" stop-color="#ffe35f"/><stop offset="1" stop-color="#ff7a56"/></linearGradient></defs>
      <circle cx="103" cy="61" r="8" fill="#9a7d42"/><circle cx="97" cy="67" r="6" fill="#8f6c34"/>
    </svg>`
  };
  return svgMap[kind] || svgMap.pico;
}


function renderToningPopup(program){
  const popup = qs('#toningPopup');
  const body = qs('#toningPopupBody');
  const title = qs('#toningPopupTitle');
  if(!popup || !body || !title || !program) return;

  const data = TONING_POPUP_DATA[program.id] || {
    popupTitle: `${program.name} 상세 정보`,
    heroTitle: program.name,
    cards: String(program.details || '').split('\n').filter(Boolean).map((line, idx)=>({
      title: line.replace(/^-\s*/, ''),
      count: '',
      desc: '',
      art: ['starlux','maxg','revlite','pico','co2'][idx % 5]
    }))
  };

  toningPopupProgramId = program.id;
  title.textContent = data.popupTitle;

  body.innerHTML = `
    <div class="toningHero">
      <div>
        <div class="toningHeroTitle">${escapeHtml(data.heroTitle)}</div>
        <div class="toningHeroPrice">${fmt(getProgramPrice(program, activeLiftingDoctor))}<span class="won">원</span></div>
      </div>
      <div class="toningVat">${VAT_NOTICE.replace('·', ', ')}</div>
    </div>

    <div class="toningCards">
      ${(data.cards || []).map(card => `
        <div class="toningCard">
          <div>
            <div class="toningCardTitle">${escapeHtml(card.title)}${card.count ? ` <span class="toningCardCount">${escapeHtml(card.count)}</span>` : ''}</div>
            ${card.desc ? `<div class="toningCardDesc">${escapeHtml(card.desc)}</div>` : ''}
          </div>
          <div class="toningCardArt">${renderToningArt(card.art)}</div>
        </div>
      `).join('')}
    </div>

    <div class="toningAftercare">
      <div class="toningAftercareTitle">● 시술후 관리</div>
      <ul>
        ${TONING_AFTERCARE.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `;

  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
  document.body.classList.add('toning-popup-open');
  const favBtn = qs('#toningPopupFav');
  if(favBtn){
    favBtn.textContent = favorites.includes(program.id) ? '★' : '☆';
  }
}

function closeToningPopup(){
  const popup = qs('#toningPopup');
  if(!popup) return;
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('toning-popup-open');
  toningPopupProgramId = null;
}



function isToningSectionActive(){
  return view === 'price' && activeSectionKey === 'toning';
}

function syncDetailPanelVisibility(){
  const grid = qs('.grid');
  const detailPanel = qs('.detailPanel');
  if(!grid || !detailPanel) return;

  if(isToningSectionActive()){
    grid.classList.add('toning-detail-hidden');
    detailPanel.style.display = 'none';
    selectedItem = null;
    closeToningPopup();
    const d = qs('#detailBody');
    if(d) d.innerHTML = `<div class="muted">왼쪽에서 프로그램/단품을 선택하면 상세가 표시됩니다.</div>`;
    return;
  }

  grid.classList.remove('toning-detail-hidden');
  detailPanel.style.display = '';
}

/* =========================
   렌더
========================= */
function setView(next){
  view = next;
  qsa('#nav button').forEach(b=>{
    b.classList.toggle('active', b.dataset.view===next);
  });
  selectedItem = null;
  closeToningPopup();
  renderActionLog();
renderAll();
  syncDetailPanelVisibility();
initSidebarSwipe();

}


function renderFavorites(){
  const box = qs('#favList');
  if(!box) return;
  if(!favorites.length){
    box.innerHTML = `<div class="muted" style="padding:8px 0">없음</div>`;
    return;
  }
  const all = [...programSections.flatMap(s=>s.programs.map(p=>({...p, _type:'program', _isEvent:s.isEvent}))), ...singleLaserItems.map(it=>({...it, _type:'single'}))];
  const items = favorites.map(id=>all.find(x=>x.id===id)).filter(Boolean);
  box.innerHTML = '';
  items.forEach(it=>{
    const btn = document.createElement('button');
    btn.className = 'favBtn';
    const priceForFav = (it._type==='program') ? getProgramPrice(it, activeLiftingDoctor) : Number(it.price||0);
    btn.innerHTML = `<span>${escapeHtml(it.name)}</span><span class="muted">${fmt(priceForFav)}원</span>`;
    btn.onclick = ()=>{
      // switch view accordingly and select
      if(it._type==='single'){ setView('single'); selectedItem = {type:'single', ...it}; }
      else {
        setView('price');
        // find section containing it
        const sec = programSections.find(s=>s.programs.some(p=>p.id===it.id));
        if(sec) activeSectionKey = sec.key;
        selectedItem = {type:'program', section:activeSectionKey, ...it, isEvent: (sec?sec.isEvent:false)};
      }
      renderActionLog();
renderAll();
if(it._type==='program' && shouldOpenToningPopup(it, activeSectionKey)){
  renderToningPopup({ type:'program', section:activeSectionKey, ...it, isEvent:(programSections.find(s=>s.programs.some(p=>p.id===it.id))||{}).isEvent });
}
initSidebarSwipe();

    };
    box.appendChild(btn);
  });
}

function renderRecent(){
  const box = qs('#recentList');
  if(!box) return;
  if(!recentConsults.length){
    box.innerHTML = `<div class="muted" style="padding:8px 0">없음</div>`;
    return;
  }
  box.innerHTML = '';
  recentConsults.slice(0,8).forEach((c, idx)=>{
    const dt = new Date(c.ts);
    const label = `${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const btn = document.createElement('button');
    btn.className='favBtn';
    btn.innerHTML = `<span>${label}</span><span class="muted">${fmt(c.total)}원</span>`;
    btn.onclick = ()=> loadConsult(idx);
    box.appendChild(btn);
  });
}

function loadConsult(index){
  const c = recentConsults[index];
  if(!c) return;
  cart = c.cart || [];
  adjValue = c.adjValue || 0;
  discountLog = c.discountLog || [];
  qs('#adjInput').value = String(adjValue);
  logAction('최근 상담 불러오기');
  renderActionLog();
renderAll();
  syncDetailPanelVisibility();
initSidebarSwipe();

  toast('불러옴');
}

function toggleFavorite(id){
  if(favorites.includes(id)) favorites = favorites.filter(x=>x!==id);
  else favorites.unshift(id);
  favorites = Array.from(new Set(favorites)).slice(0,30);
  saveLS('favorites', favorites);
  renderFavorites();
  toast(favorites.includes(id) ? '즐겨찾기 추가' : '즐겨찾기 해제');
}


function renderAll(){
  renderHeader();
  renderFavorites();
  renderRecent();
  renderLeft();
  syncDetailPanelVisibility();
  renderDetail();
  syncDetailPanelVisibility();
  renderCart();
  renderBottomBar();
}

function renderHeader(){
  const title = qs('#panelTitle');
  const sub = qs('#panelSub');
  if(view==='price'){ title.textContent='가격표'; sub.textContent='프로그램 / 이벤트'; }
  if(view==='single'){ title.textContent='단품 레이저'; sub.textContent='1회 단가 빠른 조회'; }
  if(view==='admin'){ title.textContent='관리자'; sub.textContent='더미 페이지(확장 가능)'; }
}

function renderBottomBar(){
  const bar = qs('#bottomBar');
  if(!bar) return;
  bar.style.display = 'none';
}

function renderLeft(){
  const left = qs('#leftBody');
  left.innerHTML = '';

  const keyword = qs('#searchInput').value.trim().toLowerCase();

  if(view==='price'){
    // section tabs
    const tabs = document.createElement('div');
    tabs.className='categoryTabs';
    programSections.forEach(sec=>{
      const btn = document.createElement('button');
      btn.className='btn categoryTabBtn';
      btn.style.padding='8px 10px';
      btn.textContent = sec.title + (sec.isEvent ? ' (이벤트)' : '');
      btn.onclick = ()=>{ activeSectionKey = sec.key; selectedItem = null; renderLeft(); syncDetailPanelVisibility(); renderDetail(); };
      if(sec.key===activeSectionKey){ btn.classList.add('primary'); }
      tabs.appendChild(btn);
    });
    left.appendChild(tabs);

    const sec = programSections.find(s=>s.key===activeSectionKey) || programSections[0];

    // 리프팅 전용: 원장/카테고리 선택(디자인 틀 유지: 동일 버튼 스타일)
    if(sec.key==='lifting'){
      // 섹션 탭(프로그램/이벤트)과 시각적으로 분리
      const sep1 = document.createElement('hr');
      sep1.className = 'sep';
      sep1.style.marginTop = '12px';
      left.appendChild(sep1);

      const docLabel = document.createElement('div');
      docLabel.className = 'muted';
      docLabel.textContent = '원장 선택';
      left.appendChild(docLabel);

      const docRow = document.createElement('div');
      docRow.className = 'optionTabs';
      docRow.style.marginTop = '8px';
      liftingDoctors.forEach(dk=>{
        const b = document.createElement('button');
        b.className = 'btn optionTabBtn';
        b.style.padding='8px 10px';
        b.textContent = dk.label;
        if(dk.key===activeLiftingDoctor) b.classList.add('primary');
        b.onclick = ()=>{ activeLiftingDoctor = dk.key; renderLeft(); syncDetailPanelVisibility(); renderDetail(); };
        docRow.appendChild(b);
      });
      left.appendChild(docRow);

      const sep2 = document.createElement('hr');
      sep2.className = 'sep';
      left.appendChild(sep2);

      const catLabel = document.createElement('div');
      catLabel.className = 'muted';
      catLabel.textContent = '리프팅 카테고리';
      left.appendChild(catLabel);

      const catRow = document.createElement('div');
      catRow.className = 'optionTabs';
      catRow.style.marginTop = '8px';
      liftingCategories.forEach(ca=>{
        const b = document.createElement('button');
        b.className = 'btn optionTabBtn';
        b.style.padding='8px 10px';
        b.textContent = ca.label;
        if(ca.key===activeLiftingCat) b.classList.add('primary');
        b.onclick = ()=>{ activeLiftingCat = ca.key; selectedItem = null; renderLeft(); syncDetailPanelVisibility(); renderDetail(); };
        catRow.appendChild(b);
      });
      left.appendChild(catRow);

      const hint = document.createElement('div');
      hint.className = 'muted';
      hint.style.marginTop = '10px';
      const h = liftingCategories.find(x=>x.key===activeLiftingCat);
      hint.textContent = h ? `${h.label} > ${h.hint}` : '';
      left.appendChild(hint);
    }
    const list = document.createElement('div');
    list.className='cards';
    list.style.marginTop='12px';

    const filtered = sec.programs.filter(p=>{
      if(sec.key==='lifting'){
        if(p.cat && p.cat !== activeLiftingCat) return false;
      }
      if(!keyword) return true;
      const blob = (p.name+' '+(p.effects||[]).join(' ')+' '+(p.details||'')).toLowerCase();
      return blob.includes(keyword);
    });

    filtered.forEach(p=>{
      const card = document.createElement('div');
      card.className='card';
      const displayPrice = getProgramPrice(p, activeLiftingDoctor);
      const displayPriceText = getProgramPriceText(p, activeLiftingDoctor);
      card.innerHTML = `
        <div class="cardRow">
          <div class="cardTitle">${escapeHtml(p.name)}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="smallBtn" data-act="fav" title="즐겨찾기">☆</button>
            <div class="price">${displayPriceText}</div>
          </div>
        </div>
        <div class="tags">${(p.effects||[]).map(e=>`<span class="tag">${escapeHtml(e)}</span>`).join('')}</div>
        <div class="cardRow">
          <div class="muted">Effect 요약</div>
          <div style="display:flex;gap:8px">
            <button class="smallBtn" data-act="detail">상세</button>
            <button class="smallBtn" data-act="add">추가</button>
          </div>
        </div>
      `;
      card.querySelector('[data-act="fav"]').onclick = ()=>{ toggleFavorite(p.id); };
      card.querySelector('[data-act="detail"]').onclick = ()=>{
        if(shouldOpenToningPopup(p, sec.key)){
          closeToningPopup();
          renderToningPopup({ type:'program', section:sec.key, ...p, isEvent: sec.isEvent });
          return;
        }
        closeToningPopup();
        selectedItem = { type:'program', section:sec.key, ...p, isEvent: sec.isEvent };
        renderDetail();
      };
      card.querySelector('[data-act="add"]').onclick = ()=>{
        addToCart(getCartId(p, activeLiftingDoctor), getCartName(p, activeLiftingDoctor), displayPrice);
      };
      list.appendChild(card);
    });

    left.appendChild(list);

    // VAT notice (이벤트 제외)
    if(!sec.isEvent){
      const notice = document.createElement('div');
      notice.className='notice';
      notice.innerHTML = `<div class="dot"></div><div><b>${VAT_NOTICE}</b></div>`;
      left.appendChild(notice);
    } else {
      const notice = document.createElement('div');
      notice.className='notice';
      notice.innerHTML = `<div class="dot" style="background:var(--warn)"></div><div><b>이벤트는 VAT 문구 자동 제외</b></div>`;
      left.appendChild(notice);
    }
    return;
  }

  if(view==='single'){
    const cols = [
      ['name','시술명'],
      ['price','1회 비용'],
      ['note','비고'],
      ['act','']
    ];
    const table = document.createElement('table');
    table.className='table';
    table.innerHTML = `
      <thead>
        <tr>${cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    const filtered = singleLaserItems.filter(it=>{
      if(!keyword) return true;
      return (it.name+' '+(it.note||'')).toLowerCase().includes(keyword);
    });

    filtered.forEach(it=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${escapeHtml(it.name)}</b></td>
        <td>${fmt(it.price)}원</td>
        <td class="muted">${escapeHtml(it.note||'')}</td>
        <td>
          <button class="smallBtn" data-act="fav" title="즐겨찾기">☆</button>
          <button class="smallBtn" data-act="detail">상세</button>
          <button class="smallBtn" data-act="add">추가</button>
        </td>
      `;
      tr.querySelector('[data-act="fav"]').onclick = ()=> toggleFavorite(it.id);
      tr.querySelector('[data-act="detail"]').onclick = ()=>{
        closeToningPopup();
        selectedItem = { type:'single', ...it };
        renderDetail();
      };
      tr.querySelector('[data-act="add"]').onclick = ()=> addToCart(it.id, it.name, it.price);
      tbody.appendChild(tr);
    });

    left.appendChild(table);

    const notice = document.createElement('div');
    notice.className='notice';
    notice.innerHTML = `<div class="dot"></div><div><b>${VAT_NOTICE}</b></div>`;
    left.appendChild(notice);
    return;
  }
  if(view==='admin'){
    const box = document.createElement('div');
    box.className='kpi';
    box.innerHTML = `
      <div class="muted">관리자(더미)</div>
      <div class="big" style="margin-top:6px">연동 예정 기능</div>
      <ul style="margin:10px 0 0; color:var(--text); line-height:1.7">
        <li>가격표/프로그램 데이터 편집</li>
                <li>VAT 문구 자동 규칙 관리(이벤트 제외)</li>
        <li>프로그램 구성(구성요소) 연결</li>
      </ul>
      <div class="notice"><div class="dot"></div><div><b>${VAT_NOTICE}</b> (이 페이지는 규칙 예시)</div></div>
    `;
    left.appendChild(box);
    return;
  }
}

function findProgramByNameIncludes(q){
  const needle = String(q||'').toLowerCase();
  for(const sec of programSections){
    for(const p of (sec.programs||[])){
      if(String(p.name||'').toLowerCase().includes(needle)) return {sec, p};
    }
  }
  return null;
}

function getRecommendations(base){
  // very light heuristic: 추천 3개까지만
  const name = String(base?.name||'').toLowerCase();
  const eff = (base?.effects||[]).map(x=>String(x).toLowerCase());

  const wants = [];
  const push = (k)=>{ if(k && !wants.includes(k)) wants.push(k); };

  if(name.includes('토닝') || eff.some(e=>e.includes('토닝')||e.includes('색소'))){
    push('ldm');
    push('re20');
    push('revive');
  }
  if(name.includes('홍조') || eff.some(e=>e.includes('홍조')||e.includes('혈관'))){
    push('ldm');
    push('맞춤혈관');
  }
  if(name.includes('여드름') || eff.some(e=>e.includes('여드름')||e.includes('염증'))){
    push('ldm');
    push('revive');
  }
  if(wants.length===0){
    push('ldm');
  }

  const recs = [];
  const seen = new Set([base?.id]);
  for(const k of wants){
    const hit = findProgramByNameIncludes(k);
    if(hit && !seen.has(hit.p.id)) {
      recs.push({ id: hit.p.id, name: hit.p.name, price: getProgramPrice(hit.p, activeLiftingDoctor), sectionKey: hit.sec.key });
      seen.add(hit.p.id);
    }
    if(recs.length>=3) break;
  }
  return recs;
}

function renderDetail(){
  const d = qs('#detailBody');
  if(isToningSectionActive()){
    if(d) d.innerHTML = `<div class="muted">왼쪽에서 프로그램/단품을 선택하면 상세가 표시됩니다.</div>`;
    return;
  }
  if(!selectedItem){
    d.innerHTML = `<div class="muted">왼쪽에서 프로그램/단품을 선택하면 상세가 표시됩니다.</div>`;
    return;
  }

  if(selectedItem.type==='program'){
    const isLift = (selectedItem.section==='lifting') && isLiftingProgram(selectedItem);
    const livePrice = getProgramPrice(selectedItem, activeLiftingDoctor);
    const doctorLabel = isLift ? getDoctorLabel(activeLiftingDoctor) : '';
    const cartId = getCartId(selectedItem, activeLiftingDoctor);
    const cartName = getCartName(selectedItem, activeLiftingDoctor);
    const priceText = getProgramPriceText(selectedItem, activeLiftingDoctor);

    d.innerHTML = `
      <div class="card" style="background:rgba(15,19,32,.35)">
        <div class="cardRow">
          <div class="cardTitle">${escapeHtml(selectedItem.name)}</div>
          <div class="price">${priceText}</div>
        </div>
        ${isLift ? `<div class="muted" style="margin-top:-4px">선택 원장: <b>${escapeHtml(doctorLabel)}</b></div>` : ''}
        <div class="muted">Effect</div>
        <div class="tags">${(selectedItem.effects||[]).map(e=>`<span class="tag">${escapeHtml(e)}</span>`).join('')}</div>
        <hr class="sep"/>
        <div class="muted">Program Details</div>
        ${hasVariantPricing(selectedItem)
          ? `<div style="line-height:1.7">${renderVariantPriceGroups(selectedItem)}</div>`
          : `<div style="line-height:1.7">${escapeHtml(selectedItem.details||'')}</div>`}
        ${selectedItem.isEvent ? '' : `<div class="notice microNotice"><div class="dot"></div><div><b>${VAT_NOTICE}</b></div></div>`}
        <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
          ${hasVariantPricing(selectedItem) ? '' : `<button class="btn primary" id="detailAdd">장바구니 추가</button>`}
          <button class="btn" id="detailFav">즐겨찾기</button>
          <button class="btn" id="detailCopy">상세 복사</button>
        </div>
      </div>
    `;
    if(!hasVariantPricing(selectedItem) && qs('#detailAdd')){
      qs('#detailAdd').onclick = ()=> addToCart(cartId, cartName, livePrice);
    }
    d.querySelectorAll('.variantAddBtn').forEach(btn=>{
      btn.onclick = ()=>{
        const area = btn.dataset.area;
        const label = btn.dataset.label;
        const price = Number(btn.dataset.price||0);
        addToCart(`${selectedItem.id}__${area}__${label}`, `${selectedItem.name} (${area} ${label})`, price);
        if(area==='양볼' && label==='5회'){
          d.querySelectorAll('.scarExtraChk').forEach(chk=>{
            if(chk.checked){
              const nm = chk.parentElement.innerText.trim().replace(/\s+/g,' ');
              addToCart(`${selectedItem.id}__${area}__${label}__${chk.dataset.extraId}`, `${selectedItem.name} (${area} ${label} ${nm})`, Number(chk.dataset.price||0));
            }
          });
        }
      };
    });
    qs('#detailFav').onclick = ()=> toggleFavorite(selectedItem.id);
    qs('#detailCopy').onclick = ()=>{
      const txt = `[${selectedItem.name}]\n가격: ${priceText}\nEffect: ${(selectedItem.effects||[]).join(', ')}\n상세: ${selectedItem.details||''}`;
      navigator.clipboard?.writeText(txt).then(()=>toast('상세 복사됨')).catch(()=>toast('복사 실패'));
    };
    return;
  }

  if(selectedItem.type==='single'){
    d.innerHTML = `
      <div class="card" style="background:rgba(15,19,32,.35)">
        <div class="cardRow">
          <div class="cardTitle">${escapeHtml(selectedItem.name)}</div>
          <div class="price">${fmt(selectedItem.price)}원</div>
        </div>
        <div class="muted">비고</div>
        <div style="line-height:1.7">${escapeHtml(selectedItem.note||'')}</div>
        <div class="notice microNotice"><div class="dot"></div><div><b>${VAT_NOTICE}</b></div></div>
        <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
          <button class="btn primary" id="detailAdd">장바구니 추가</button>
          <button class="btn" id="detailFav">즐겨찾기</button>
          <button class="btn" id="detailCopy">상세 복사</button>
        </div>
      </div>
    `;
    qs('#detailAdd').onclick = ()=> addToCart(selectedItem.id, selectedItem.name, selectedItem.price);
    d.querySelectorAll('[data-act="recadd"]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = Number(btn.getAttribute('data-id'));
        for(const sec of programSections){
          const p = (sec.programs||[]).find(x=>x.id===id);
          if(p){ addToCart(p.id, p.name, p.price); break; }
        }
      };
    });

    qs('#detailFav').onclick = ()=> toggleFavorite(selectedItem.id);
    qs('#detailCopy').onclick = ()=>{
      const txt = `[${selectedItem.name}]\n가격: ${fmt(selectedItem.price)}원\n비고: ${selectedItem.note||''}`;
      navigator.clipboard?.writeText(txt).then(()=>toast('상세 복사됨')).catch(()=>toast('복사 실패'));
    };
    return;
  }
}

function renderCart(){
  qs('#cartCount').textContent = cart.reduce((a,c)=>a+(c.qty||0),0);
  const list = qs('#cartList');
  list.innerHTML = '';
  if(cart.length===0){
    list.innerHTML = `<div class="muted" style="padding:10px 0">비어있습니다. 항목을 추가하세요.</div>`;
  } else {
    const table = document.createElement('table');
    table.className='table';
    table.innerHTML = `
      <thead><tr><th>항목</th><th>수량</th><th>금액</th><th></th></tr></thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    cart.forEach(item=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${escapeHtml(item.name)}</b></td>
        <td>
          <button class="smallBtn" data-act="dec">-</button>
          <span style="display:inline-block;min-width:26px;text-align:center">${item.qty}</span>
          <button class="smallBtn" data-act="inc">+</button>
        </td>
        <td>${fmt(item.price*item.qty)}원</td>
        <td><button class="smallBtn" data-act="del">삭제</button></td>
      `;
      tr.querySelector('[data-act="dec"]').onclick = ()=> setQty(item.id, item.qty-1);
      tr.querySelector('[data-act="inc"]').onclick = ()=> setQty(item.id, item.qty+1);
      tr.querySelector('[data-act="del"]').onclick = ()=> removeFromCart(item.id);
      tbody.appendChild(tr);
    });
    list.appendChild(table);
  }
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  qs('#cartTotal').textContent = fmt(total);
  qs('#calcCartSum').textContent = fmt(total);

  // cart drawer summary (linked with calculator)
  const adjEl = qs('#cartAdj');
  const payEl = qs('#cartPay');
  if(adjEl) adjEl.textContent = fmt(adjValue);
  if(payEl) payEl.textContent = fmt(total + adjValue);

  updateFinal();
}

/* =========================
   Cart actions
========================= */
function addToCart(id,name,price){
  const found = cart.find(x=>x.id===id);
  if(found) found.qty += 1;
  else cart.push({id,name,price,qty:1});
  logAction('장바구니 추가: '+name);
  toast('장바구니 추가');
  renderCart();
  renderBottomBar();
}
function setQty(id,qty){
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty = Math.max(0, qty|0);
  if(it.qty===0) cart = cart.filter(x=>x.id!==id);
  logAction('삭제');
  renderCart();
  renderBottomBar();
}
function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  renderCart();
  renderBottomBar();
}
function clearCart(){
  cart = [];
  logAction('장바구니 비우기');
  renderCart();
  renderBottomBar();
  toast('비움');
}

/* =========================
   Calculator
========================= */
function updateFinal(){
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  // keep adjValue synced with input
  const adj = Number((qs('#adjInput').value||'0').replace(/,/g,'').trim() || 0);
  if(Number.isFinite(adj)) adjValue = Math.trunc(adj);
  qs('#finalAmount').textContent = fmt(total + adjValue);
  const adjEl = qs('#cartAdj');
  const payEl = qs('#cartPay');
  if(adjEl) adjEl.textContent = fmt(adjValue);
  if(payEl) payEl.textContent = fmt(total + adjValue);
  renderDiscountLog();
  renderBottomBar();
}

function logDiscount(label, amount, base){
  logAction(label + ' ' + ((amount>=0)?'+':'') + fmt(amount) + '원');
  discountLog.unshift({ ts: Date.now(), label, amount: Math.trunc(amount||0), base: Math.trunc(base||0) });
  if(discountLog.length>12) discountLog = discountLog.slice(0,12);
}


function renderActionLog(){
  const box = qs('#actionLog');
  if(!box) return;
  if(!actionLog.length){
    box.innerHTML = `<div class="muted">로그 없음</div>`;
    return;
  }
  const rows = actionLog.slice(0,10).map(r=>{
    const dt = new Date(r.ts);
    const hh = String(dt.getHours()).padStart(2,'0');
    const mm = String(dt.getMinutes()).padStart(2,'0');
    return `<tr><td class="muted">${hh}:${mm}</td><td>${escapeHtml(r.label)}</td></tr>`;
  }).join('');
  box.innerHTML = `<table class="table" style="margin-top:6px"><thead><tr><th>시간</th><th>내용</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderDiscountLog(){
  const box = qs('#discountLog');
  if(!box) return;
  if(discountLog.length===0){
    box.innerHTML = `<div class="muted">기록 없음</div>`;
    return;
  }
  const rows = discountLog.slice(0,6).map(r=>{
    const dt = new Date(r.ts);
    const hh = String(dt.getHours()).padStart(2,'0');
    const mm = String(dt.getMinutes()).padStart(2,'0');
    const sign = r.amount>=0?'+':'';
    return `
      <tr>
        <td class="muted">${hh}:${mm}</td>
        <td><b>${escapeHtml(r.label)}</b></td>
        <td style="text-align:right">${sign}${fmt(r.amount)}원</td>
      </tr>
    `;
  }).join('');
  box.innerHTML = `
    <table class="table" style="margin-top:6px">
      <thead><tr><th>시간</th><th>항목</th><th style="text-align:right">금액</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* =========================
   Drawer / Modal
========================= */
function openCart(){
  qs('#drawerBackdrop').style.display = 'block';
  qs('#cartDrawer').style.display = 'flex';
  qs('#cartDrawer').setAttribute('aria-hidden','false');
}
function closeCart(){
  qs('#drawerBackdrop').style.display = 'none';
  qs('#cartDrawer').style.display = 'none';
  qs('#cartDrawer').setAttribute('aria-hidden','true');
}
function openCalc(){
  qs('#modalBackdrop').style.display = 'grid';
  qs('#adjAmount')?.focus();
  __lastAdjInput = (qs('#adjInput').value||'0').trim();
  updateFinal();
}
function closeCalc(){
  qs('#modalBackdrop').style.display = 'none';
}

/* =========================
   견적 복사
========================= */
function buildQuoteText(){
  const lines = [];
  lines.push('상담 견적');
  lines.push('----------------');
  cart.forEach(it=>{
    lines.push(`${it.name} x${it.qty} = ${fmt(it.price*it.qty)}원`);
  });
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  lines.push('----------------');
  lines.push(`합계: ${fmt(total)}원`);
  if(adjValue!==0) lines.push(`할인/추가: ${adjValue>=0?'+':''}${fmt(adjValue)}원`);
  lines.push(`결제 금액: ${fmt(total + adjValue)}원`);
  if(discountLog.length){
    lines.push('----------------');
    lines.push('할인 기록(최근)');
    discountLog.slice(0,3).forEach(r=>{
      const sign = r.amount>=0?'+':'';
      lines.push(`- ${r.label}: ${sign}${fmt(r.amount)}원`);
    });
  }
  // VAT notice: 이벤트 제외 규칙은 '가격표 섹션'에만 적용.
  lines.push(VAT_NOTICE);
  return lines.join('\n');
}

/* =========================
   이벤트 바인딩
========================= */
qsa('#nav button').forEach(b=> b.onclick = ()=> setView(b.dataset.view));

qs('#cartBtn').onclick = openCart;

// Bottom bar shortcuts
const bbCartBtn = qs('#bbCart');
if (bbCartBtn) bbCartBtn.onclick = openCart;
const bbCalcBtn = qs('#bbCalc');
if (bbCalcBtn) bbCalcBtn.onclick = openCalc;

qs('#closeCart').onclick = closeCart;
qs('#drawerBackdrop').onclick = closeCart;

qs('#calcBtn').onclick = openCalc;
qs('#closeCalc').onclick = closeCalc;
qs('#modalBackdrop').onclick = (e)=>{ if(e.target.id==='modalBackdrop') closeCalc(); };

qs('#clearCart').onclick = clearCart;
qs('#copyQuote').onclick = ()=>{
  const txt = buildQuoteText();
  navigator.clipboard?.writeText(txt).then(()=>toast('견적 복사됨')).catch(()=>toast('복사 실패'));
};


qs('#saveConsult').onclick = ()=>{
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  const snapshot = { ts: Date.now(), cart: JSON.parse(JSON.stringify(cart)), adjValue, total: total + adjValue, discountLog: JSON.parse(JSON.stringify(discountLog)) };
  recentConsults.unshift(snapshot);
  recentConsults = recentConsults.slice(0,30);
  saveLS('recentConsults', recentConsults);
  renderRecent();
  toast('상담 저장됨');
  logAction('상담 저장');
};

function fillPrintArea(){
  const total = cart.reduce((a,c)=>a+(c.price*c.qty),0);
  const pay = total + adjValue;
  const dt = new Date();
  const meta = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;

  qs('#printMeta').textContent = meta;
  qs('#printSubtotal').textContent = fmt(total);
  qs('#printAdj').textContent = fmt(adjValue);
  qs('#printTotal').textContent = fmt(pay);

  qs('#printTable').innerHTML = ['<tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:10px 8px">항목</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:10px 8px">수량</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:10px 8px">금액</th></tr>']
    .concat(cart.map(it=>`<tr><td style="padding:10px 8px;border-bottom:1px solid #eee">${escapeHtml(it.name)}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${it.qty}</td><td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(it.price*it.qty)}원</td></tr>`))
    .join('');
}

qs('#pdfQuote').onclick = ()=>{
  if(!cart.length){ toast('장바구니가 비어 있습니다'); return; }
  fillPrintArea();
  logAction('PDF 출력');
  try{
    window.print();
    toast('PDF 인쇄창을 엽니다');
  }catch(_){
    toast('PDF 창 실행 실패');
  }
};


qs('#adjInput').addEventListener('input', updateFinal);

/* 계산기 빠른 입력 */
function parseMoney(v){
  return Number(String(v||'').replace(/,/g,'').trim() || 0);
}
function setAdj(val){
  const n = Math.trunc(Number(val||0));
  qs('#adjInput').value = String(n);
  updateFinal();
}
function cartSum(){
  return cart.reduce((a,c)=>a+(c.price*c.qty),0);
}
qs('#adjPlusBtn').onclick = ()=>{
  const amt = Math.abs(parseMoney(qs('#adjAmount').value));
  if(!amt) return;
  logDiscount('금액 추가', amt, cartSum());
  setAdj(amt);
};
qs('#adjMinusBtn').onclick = ()=>{
  const amt = Math.abs(parseMoney(qs('#adjAmount').value));
  if(!amt) return;
  logDiscount('금액 할인', -amt, cartSum());
  setAdj(-amt);
};
qs('#disc10').onclick = ()=>{
  const total = cartSum();
  const v = -Math.round(total * 0.10);
  logDiscount('10% 할인', v, total);
  setAdj(v);
};
qs('#disc15').onclick = ()=>{
  const total = cartSum();
  const v = -Math.round(total * 0.15);
  logDiscount('15% 할인', v, total);
  setAdj(v);
};
qs('#disc20').onclick = ()=>{
  const total = cartSum();
  const v = -Math.round(total * 0.20);
  logDiscount('20% 할인', v, total);
  setAdj(v);
};

// manual input logging (enter / blur)
qs('#adjInput').addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    const now = (qs('#adjInput').value||'0').trim();
    if(now!==__lastAdjInput){
      logDiscount('직접 입력', parseMoney(now), cartSum());
      __lastAdjInput = now;
    }
    updateFinal();
  }
});
qs('#adjInput').addEventListener('blur', ()=>{
  const now = (qs('#adjInput').value||'0').trim();
  if(now!==__lastAdjInput){
    logDiscount('직접 입력', parseMoney(now), cartSum());
    __lastAdjInput = now;
  }
  updateFinal();
});

qs('#clearActionLog').onclick = ()=>{ actionLog = []; renderActionLog(); toast('로그 초기화'); };

qs('#clearDiscountLog').onclick = ()=>{
  discountLog = [];
  renderDiscountLog();
  toast('기록 초기화');
};

qs('#searchInput').addEventListener('input', ()=>{ renderLeft(); });
const __bottomCartBtn = qs('#bottomCartBtn'); if(__bottomCartBtn) __bottomCartBtn.onclick = ()=> openCart();
const __bottomCalcBtn = qs('#bottomCalcBtn'); if(__bottomCalcBtn) __bottomCalcBtn.onclick = ()=> openCalc();

/* 단축키 */
document.addEventListener('keydown', (e)=>{
  if(e.key==='/'){
    e.preventDefault();
    qs('#searchInput').focus();
  }
  if(e.key==='k' || e.key==='K'){
    openCart();
  }
  if(e.key==='c' || e.key==='C'){
    openCalc();
  }
  if(e.key==='Escape'){
    closeCalc();
    closeCart();
    closeToningPopup();
  }
});

/* XSS minimal */
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, (m)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}


/* =========================
   사이드바 토글(☰ 핸들)
   - 스와이프/드래그 제거: 잔상/오작동 방지
   - 닫기: 사이드바 상단 ☰ 버튼
   - 열기: 좌측 고정 ☰ 핸들 버튼
========================= */
function setSidebarCollapsed(collapsed){
  const layout = document.querySelector('.layout');
  if(!layout) return;
  layout.classList.toggle('sidebar-collapsed', !!collapsed);
}

function isSidebarCollapsed(){
  const layout = document.querySelector('.layout');
  return layout ? layout.classList.contains('sidebar-collapsed') : false;
}

function initSidebarSwipe(){ initSidebarToggle(); }

function initSidebarToggle(){
  const handleBtn = document.querySelector('#sidebarHandle');
  const closeBtn  = document.querySelector('#sidebarClose');

  if(handleBtn){
    handleBtn.addEventListener('click', ()=> setSidebarCollapsed(false));
  }
  if(closeBtn){
    closeBtn.addEventListener('click', ()=> setSidebarCollapsed(true));
  }
}



const toningBackBtn = qs('#toningBackBtn');
const toningPopupFavBtn = qs('#toningPopupFav');
const toningReserveBtn = qs('#toningReserveBtn');

if(toningBackBtn){
  toningBackBtn.addEventListener('click', closeToningPopup);
}
if(toningPopupFavBtn){
  toningPopupFavBtn.addEventListener('click', ()=>{
    if(!toningPopupProgramId) return;
    toggleFavorite(toningPopupProgramId);
    toningPopupFavBtn.textContent = favorites.includes(toningPopupProgramId) ? '★' : '☆';
  });
}
if(toningReserveBtn){
  toningReserveBtn.addEventListener('click', ()=>{
    toast('예약하기 버튼 준비중');
  });
}


/* 초기 렌더 */
renderActionLog();
renderAll();
initSidebarToggle();
