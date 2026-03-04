(function(){
  const btns = Array.from(document.querySelectorAll('.navbtn'));
  const frameConsult = document.getElementById('frame-consult');
  const frameInventory = document.getElementById('frame-inventory');

  function setRoute(route){
    const r = (route === 'inventory') ? 'inventory' : 'consult';
    location.hash = '#/' + r;
  }

  function applyRoute(){
    const hash = (location.hash || '').replace(/^#\/?/, '');
    const route = (hash === 'inventory') ? 'inventory' : 'consult';

    btns.forEach(b => b.classList.toggle('active', b.dataset.route === route));
    frameConsult.classList.toggle('active', route === 'consult');
    frameInventory.classList.toggle('active', route === 'inventory');
  }

  btns.forEach(b => b.addEventListener('click', () => setRoute(b.dataset.route)));

  window.addEventListener('hashchange', applyRoute);
  if(!location.hash) location.hash = '#/consult';
  applyRoute();
})();