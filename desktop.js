/* Desktop-Look: Uhr und verschiebbare Fenster/Icons (Startseite & Kontakt) */
(function(){
  /* Uhr (Zürcher Zeit) */
  var clock = document.getElementById('dtClock');
  var fmtDay = new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short' });
  var fmtTime = new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit' });
  function tick(){
    var now = new Date();
    clock.textContent = fmtDay.format(now).replace(/\./g, '').replace(',', '') + ' · ' + fmtTime.format(now);
  }
  tick(); setInterval(tick, 10000);


  /* Fenster & Icons verschieben wie auf einem Desktop */
  var desktop = document.getElementById('desktop');
  var z = 10;
  var canDrag = window.matchMedia('(min-width: 900px) and (pointer: fine)');
  document.querySelectorAll('[data-drag]').forEach(function(el){
    var handle = el.querySelector('[data-handle]') || el;
    var sx, sy, ox = 0, oy = 0, moved = false, active = false;
    handle.addEventListener('pointerdown', function(e){
      if (!canDrag.matches || e.button !== 0) return;
      active = true; moved = false;
      sx = e.clientX - ox; sy = e.clientY - oy;
      el.style.zIndex = ++z;
      el.classList.add('is-focus');
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', function(e){
      if (!active) return;
      var nx = e.clientX - sx, ny = e.clientY - sy;
      if (!moved && Math.abs(nx - ox) + Math.abs(ny - oy) < 4) return;
      moved = true;
      el.classList.add('is-dragging');
      // im sichtbaren Bereich halten
      var r = el.getBoundingClientRect(), d = desktop.getBoundingClientRect();
      var baseL = r.left - ox, baseT = r.top - oy;
      nx = Math.min(Math.max(nx, d.left + 8 - baseL), d.right - 8 - r.width - baseL);
      ny = Math.min(Math.max(ny, d.top + 70 - baseT), d.bottom - 100 - r.height - baseT);
      ox = nx; oy = ny;
      el.style.translate = ox + 'px ' + oy + 'px';
    });
    el.addEventListener('dragstart', function(e){ e.preventDefault(); });
    function end(){ active = false; el.classList.remove('is-dragging'); }
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    // Nach dem Ziehen keinen Link öffnen
    el.addEventListener('click', function(e){
      if (moved){ e.preventDefault(); e.stopPropagation(); moved = false; }
    });
  });
  document.addEventListener('pointerdown', function(e){
    document.querySelectorAll('.is-focus').forEach(function(f){ if (!f.contains(e.target)) f.classList.remove('is-focus'); });
  });
})();
