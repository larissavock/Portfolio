/* Bewegung & Smooth Scroll für alle Seiten
   - Lenis: weiches, "schwebendes" Scrollen
   - [data-split]: Überschriften Wort für Wort aus einer Maske einblenden
   - [data-reveal]: Elemente beim Reinscrollen einblenden
   - [data-speed]: Parallax relativ zum eigenen Abschnitt */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('motion');

  /* ---------- Smooth Scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis){
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    window.lenis = lenis;
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    // Anker-Links (#…) ebenfalls weich ansteuern
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var id = a.getAttribute('href');
        if (id.length > 1 && document.querySelector(id)){
          e.preventDefault();
          lenis.scrollTo(id, { offset: -70 });
        }
      });
    });
  }

  /* ---------- Überschriften in Wörter zerlegen ---------- */
  var wordIndex;
  function splitNode(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(child){
      if (child.nodeType === 3){
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if (!p) return;
          if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(' ')); return; }
          var outer = document.createElement('span');
          outer.className = 'w';
          var inner = document.createElement('span');
          inner.className = 'wi';
          inner.style.setProperty('--i', wordIndex++);
          inner.textContent = p;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.parentNode.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== 'BR'){
        splitNode(child);
      }
    });
  }
  document.querySelectorAll('[data-split]').forEach(function(el){
    wordIndex = 0;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    splitNode(el);
    el.querySelectorAll('.w').forEach(function(w){ w.setAttribute('aria-hidden', 'true'); });
  });

  /* ---------- Einblenden beim Scrollen ---------- */
  var targets = document.querySelectorAll('[data-split], [data-reveal]');
  if (reduce || !('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function(el){ io.observe(el); });
  }

  /* ---------- Parallax ---------- */
  var para = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  if (!reduce && para.length){
    var items = para.map(function(el){
      return { el: el, speed: parseFloat(el.dataset.speed) || 0, fade: el.hasAttribute('data-fade'),
               host: el.closest('section') || el.parentElement };
    });
    var update = function(){
      var vh = window.innerHeight;
      items.forEach(function(it){
        var r = it.host.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        var y = -r.top * it.speed;
        it.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        if (it.fade){
          var o = 1 - Math.min(Math.max(-r.top / (vh * 0.6), 0), 1);
          it.el.style.opacity = o.toFixed(3);
        }
      });
    };
    if (lenis){ lenis.on('scroll', update); }
    else { window.addEventListener('scroll', update, { passive: true }); }
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Seitenwechsel: sanft ausblenden ---------- */
  if (!reduce){
    document.addEventListener('click', function(e){
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href') || '';
      if (!/\.html(#.*)?$/.test(href) || href.indexOf('://') !== -1) return;
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(function(){ window.location.href = href; }, 380);
    });
    window.addEventListener('pageshow', function(){ root.classList.remove('is-leaving'); });
  }
})();
