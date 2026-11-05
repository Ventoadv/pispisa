/* ==========================================================
   Pispisa L'Ottico · Interazioni e animazioni (GSAP + ScrollTrigger + Lenis)
   In Elementor: caricare GSAP/ScrollTrigger/Lenis da CDN (Elementor > Codice personalizzato)
   e incollare questo file; le classi "pp-*" sui widget agganciano le animazioni.
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var root = document.documentElement;
  var header = document.querySelector('.pp-header');

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    }
  }

  function scrollToTarget(target) {
    var offset = -(header ? header.offsetHeight - 1 : 0);
    if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.4 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---------- Header sticky: sfondo + hide on scroll down / show on scroll up ---------- */
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle('is-scrolled', y > 40);
    if (!document.body.classList.contains('is-menu-open')) {
      if (y > 400 && y > lastY + 1) header.classList.add('is-hidden');
      else if (y < lastY - 1 || y <= 400) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu off-canvas ---------- */
  var burger = document.querySelector('.pp-burger');
  var menu = document.getElementById('pp-menu');
  var menuTl = null;
  if (hasGSAP && menu) {
    menuTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .to('.pp-menu__bg', { clipPath: 'circle(150% at 48px 42px)', duration: 1 })
      .from('.pp-menu__nav a', { yPercent: 120, opacity: 0, stagger: .06, duration: .8, ease: 'expo.out' }, '-=.45')
      .from('.pp-menu__aside > *', { y: 30, opacity: 0, stagger: .06, duration: .6, ease: 'power3.out' }, '-=.6');
  }
  function setMenu(open) {
    if (!menu) return;
    document.body.classList.toggle('is-menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) { menu.classList.add('is-open'); header.classList.remove('is-hidden'); if (lenis) lenis.stop(); }
    else if (lenis) lenis.start();
    if (menuTl) {
      if (open) menuTl.timeScale(1).play();
      else menuTl.timeScale(1.6).reverse().eventCallback('onReverseComplete', function () { menu.classList.remove('is-open'); });
    } else {
      menu.querySelector('.pp-menu__bg').style.clipPath = open ? 'circle(150% at 48px 42px)' : '';
      if (!open) menu.classList.remove('is-open');
    }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('is-menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('is-menu-open')) setMenu(false); });

  /* ---------- Ancore interne ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var wasOpen = document.body.classList.contains('is-menu-open');
      if (wasOpen) setMenu(false);
      setTimeout(function () { scrollToTarget(target); }, wasOpen ? 450 : 0);
    });
  });

  /* ---------- FAQ: apertura/chiusura animata (un solo elemento aperto) ---------- */
  var faqItems = document.querySelectorAll('.pp-faq__item');
  faqItems.forEach(function (item) {
    var summary = item.querySelector('summary');
    var answer = item.querySelector('.pp-faq__answer');
    summary.addEventListener('click', function (e) {
      if (!hasGSAP || reduceMotion) return;
      e.preventDefault();
      if (item.open) {
        gsap.to(answer, { height: 0, opacity: 0, duration: .45, ease: 'power3.inOut', onComplete: function () { item.open = false; gsap.set(answer, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
      } else {
        faqItems.forEach(function (other) { if (other !== item && other.open) other.querySelector('summary').click(); });
        item.open = true;
        gsap.fromTo(answer, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .55, ease: 'power3.out', onComplete: function () { ScrollTrigger.refresh(); } });
      }
    });
  });

  if (!hasGSAP || reduceMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Split testo in parole ---------- */
  function splitWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
    return el.querySelectorAll('.w > span');
  }

  /* ---------- HERO: intro ---------- */
  var heroWords = splitWords(document.querySelector('.pp-hero__title'));
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: .15 });
  intro
    .from(header, { yPercent: -100, opacity: 0, duration: 1, clearProps: 'transform,opacity' })
    .from('.pp-hero__eyebrow', { y: 20, opacity: 0, duration: .8 }, '-=.6')
    .from(heroWords, { yPercent: 110, duration: 1.2, stagger: .07, onComplete: function () { document.querySelector('.pp-hero__title').classList.add('is-revealed'); } }, '-=.6')
    .from('.pp-hero__subtitle, .pp-hero__ctas, .pp-hero__facts', { y: 30, opacity: 0, duration: 1, stagger: .1 }, '-=.9')
    .from('.pp-hero__img', { scale: .6, rotate: -12, opacity: 0, duration: 1.6, ease: 'expo.out' }, .3)
    .from('.pp-hero__img img', { scale: 1.5, duration: 2, ease: 'expo.out' }, .3)
    .from('.pp-hero__ring', { rotate: -90, scale: .5, opacity: 0, duration: 1.8 }, .5)
    .from('.pp-hero__badge', { x: -40, opacity: 0, duration: 1 }, '-=1.2');

  /* Contatori */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', obj = { v: 0 };
    gsap.to(obj, { v: end, duration: 2, ease: 'power2.out', delay: 1, onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; } });
  });

  /* HERO: parallax in uscita */
  gsap.to('.pp-hero__img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.pp-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.pp-hero__img img', { scale: 1 }, { scale: 1.15, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.pp-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.pp-hero__ring', { rotate: 50, yPercent: -20, ease: 'none', scrollTrigger: { trigger: '.pp-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.pp-hero__content', { yPercent: -10, opacity: .3, ease: 'none', scrollTrigger: { trigger: '.pp-hero', start: 'center center', end: 'bottom top', scrub: true } });

  /* Header: riflesso del vetro che segue il puntatore */
  var pill = document.querySelector('.pp-header__inner');
  if (pill && window.matchMedia('(hover: hover)').matches) {
    var mxFrame = null;
    var mxState = { v: 30 };
    var setMx = function () { pill.style.setProperty('--mx', mxState.v + '%'); };
    pill.addEventListener('pointermove', function (e) {
      if (mxFrame) return;
      var cx = e.clientX;
      mxFrame = requestAnimationFrame(function () {
        mxFrame = null;
        var r = pill.getBoundingClientRect();
        gsap.killTweensOf(mxState);
        mxState.v = (cx - r.left) / r.width * 100;
        setMx();
      });
    });
    pill.addEventListener('pointerleave', function () {
      if (mxFrame) { cancelAnimationFrame(mxFrame); mxFrame = null; }
      gsap.to(mxState, { v: 30, duration: .8, ease: 'power2.out', overwrite: true, onUpdate: setMx });
    });
  }

  /* Marquee: velocità legata allo scroll */
  var marquee = document.querySelector('.pp-marquee__track');
  if (marquee) {
    marquee.style.animation = 'none';
    var loop = gsap.to(marquee, { xPercent: -50, ease: 'none', duration: 38, repeat: -1, force3D: true });
    ScrollTrigger.create({
      trigger: '.pp-marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var target = 1 + Math.min(Math.abs(self.getVelocity()) / 500, 2.5);
        gsap.to(loop, { timeScale: target, duration: .4, ease: 'power2.out', overwrite: true,
          onComplete: function () { gsap.to(loop, { timeScale: 1, duration: 1.4, ease: 'power2.out', overwrite: true }); } });
      }
    });
  }

  /* ---------- Reveal generici ---------- */
  gsap.utils.toArray('.pp-eyebrow:not(.pp-hero__eyebrow), .pp-h2, .pp-section-head__lead, .pp-about__text, .pp-services__head-right p, .pp-faq__intro p, .pp-faq__intro .pp-btn, .pp-about__content > .pp-btn').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Split + reveal citazioni nelle interruzioni ---------- */
  document.querySelectorAll('.pp-break__quote.pp-split').forEach(function (q) {
    var words = splitWords(q);
    gsap.from(words, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .05, onComplete: function () { q.classList.add('is-revealed'); }, scrollTrigger: { trigger: q, start: 'top 82%' } });
  });

  /* ---------- Parallax sfondi delle interruzioni ---------- */
  gsap.utils.toArray('.pp-break').forEach(function (sec) {
    var bg = sec.querySelector('.pp-break__bg');
    gsap.fromTo(bg, { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(sec.querySelectorAll('.pp-break__side > *, .pp-break__content > div > p:not(.pp-split)'), { y: 30, opacity: 0, duration: 1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 70%' } });
  });

  /* ---------- SERVIZI: carosello a scroll orizzontale (pin) solo desktop con mouse ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 1025px) and (hover: hover)', function () {
    var section = document.querySelector('.pp-services');
    var track = document.querySelector('.pp-services__track');
    var bar = document.querySelector('.pp-services__progress span');
    var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var tween = gsap.to(track, {
      x: function () { return -distance(); }, ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: function () { return '+=' + distance(); },
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); }
      }
    });
    /* leggero effetto "parallax" interno delle immagini durante lo scorrimento */
    gsap.utils.toArray('.pp-card__img img').forEach(function (img) {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.pp-card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
    return function () { gsap.set(track, { clearProps: 'x' }); };
  });
  mm.add('(max-width: 1024px), (hover: none)', function () {
    var vp = document.querySelector('.pp-services__viewport');
    var bar = document.querySelector('.pp-services__progress span');
    var upd = function () { var max = vp.scrollWidth - vp.clientWidth; gsap.set(bar, { scaleX: max > 0 ? vp.scrollLeft / max : 0 }); };
    vp.addEventListener('scroll', upd, { passive: true }); upd();
    return function () { vp.removeEventListener('scroll', upd); };
  });
  gsap.from('.pp-card', { y: 80, opacity: 0, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.pp-services__viewport', start: 'top 85%' } });

  /* ---------- CHI SIAMO ---------- */
  gsap.from('.pp-about__img', { scale: .75, rotate: 10, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.pp-about', start: 'top 70%' } });
  gsap.fromTo('.pp-about__img img', { yPercent: -8, scale: 1.2 }, { yPercent: 8, scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.pp-about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.pp-about__stamp', { scale: 0, rotate: -120, duration: 1.4, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.pp-about', start: 'top 55%' } });
  var tl = document.querySelector('.pp-timeline');
  if (tl) {
    gsap.fromTo(tl, { '--progress': 0 }, { '--progress': 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 85%', end: 'top 45%', scrub: true } });
    gsap.from(tl.children, { y: 30, opacity: 0, duration: .9, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: tl, start: 'top 85%' } });
  }

  /* ---------- PUNTI VENDITA ---------- */
  gsap.from('.pp-store', { y: 90, opacity: 0, duration: 1.2, stagger: .14, ease: 'expo.out', scrollTrigger: { trigger: '.pp-stores__grid', start: 'top 82%' } });
  gsap.from('.pp-store__img', { scale: .5, rotate: -15, duration: 1.4, stagger: .14, ease: 'expo.out', scrollTrigger: { trigger: '.pp-stores__grid', start: 'top 82%' } });

  /* ---------- FAQ ---------- */
  gsap.from('.pp-faq__item', { y: 30, opacity: 0, duration: .9, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.pp-faq__list', start: 'top 85%' } });

  /* ---------- CTA contatti ---------- */
  gsap.from('.pp-contact__box', { y: 80, scale: .96, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.pp-contact', start: 'top 85%' } });
  gsap.to('.pp-contact__icon', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.pp-contact', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Footer ---------- */
  gsap.from('.pp-footer__cols > div', { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.pp-footer', start: 'top 85%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
