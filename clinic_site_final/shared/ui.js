(function(){
  function qs(sel){ return document.querySelector(sel); }
  const btn = qs('[data-ui="menu"]');
  const sidebar = qs('.sidebar');
  const overlay = qs('.overlay');
  if(btn && sidebar && overlay){
    btn.addEventListener('click', function(){
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', function(){
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
  // VAT banner: default ON unless body has data-vat="off"
  const vat = document.body.getAttribute('data-vat');
  if(vat !== 'off'){
    const host = qs('[data-ui="vat-host"]') || qs('.main');
    if(host){
      const el = document.createElement('div');
      el.className = 'vat';
      el.textContent = 'VAT 포함 / 현금·카드 동일가';
      host.appendChild(el);
    }
  }
})();
