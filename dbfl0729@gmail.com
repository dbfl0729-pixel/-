<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>파파존스 은행점</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script defer src="assets/js/checker.js?v=dbg111"></script>
</head><body>
<header>
  <nav class="nav">
    <a href="index.html">홈</a>
    <a href="pizza.html">피자</a>
    <a href="side.html">사이드</a>
    <a href="drink.html">음료/소스</a>
    <a href="crust.html">크러스트 추가</a>
    <a href="discount.html">제휴/할인</a>
    <a class="call-btn" href="tel:031-313-6995">📞 031-313-6995</a>
  </nav>
</header>

<section class="container hero">
  <div>
    <h1><span style="color:#E63946">파파존스</span> 은행점</h1>
    <p class="note">전화 주문·배달 가능. 파파존스 전용 앱 주문도 가능합니다.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-red" href="pizza.html">🍕 피자 메뉴</a>
      <a class="btn btn-green" href="side.html">🍗 사이드</a>
      <a class="btn btn-green" href="drink.html">🥤 음료/소스</a>
      <a class="btn" style="border:1px solid #d1efe7" href="crust.html">🧀 크러스트 추가금</a>
      <a class="btn" style="border:1px solid #d1efe7" href="discount.html">💳 제휴/할인</a>
      <a class="btn btn-red" href="tel:031-313-6995">📞 전화주문</a>
    </div>
  </div>
  <div style="background:#fff;border:1px solid #eaecef;padding:16px;border-radius:14px">
    <h3 class="menu-title">주문 안내</h3>
    <p class="note">상단 전화 버튼으로 즉시 연결되며, 파파존스 앱에서도 주문이 가능합니다.</p>
  </div>
</section>

<footer>
  <div>파파존스 은행점 · 전화 <a href="tel:031-313-6995">031-313-6995</a></div>
  <div class="addr">📍 경기 시흥시 은행로 86 1층 106호 파파존스피자</div>
  <div class="addr">🕐 운영시간: 매일 11:00 - 23:00</div>
  <div class="addr">📦 전화 주문·배달 가능 · 📱 파파존스 전용 앱 주문 가능</div>
</footer>    <script>
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('img').forEach(el => {
                // 이미지가 'images/pizza/' 경로를 포함하는지 확인
                if (el.src && el.src.includes('images/pizza/')) {
                    let newSrc = el.src;
                    
                    // .jpeg를 .jpg.jpeg로, .webp를 .webp.jpeg로 변환하여 경로 보정
                    newSrc = newSrc.replace(/\.jpeg(?!\.)/i, '.jpg.jpeg');
                    newSrc = newSrc.replace(/\.webp(?!\.)/i, '.webp.jpeg');
                    
                    // 변경된 경로를 적용
                    if (newSrc !== el.src) {
                        el.setAttribute('src', newSrc);
                    }
                }
            });
        });
    </script>
</body>
</html>
</body></html>
