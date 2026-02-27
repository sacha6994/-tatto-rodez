/* ============================================================
   REDMOON TATTOO — scroll-effects.js
   Parallax hero + scroll progress fallback
   GPU-only: transform + opacity
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // === 1. SCROLL PROGRESS INDICATOR (fallback for non scroll-timeline browsers) ===
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    // If CSS scroll-driven animation is supported, CSS handles it — skip JS
    if (CSS.supports && CSS.supports('animation-timeline', 'scroll()')) return;

    // JS fallback via rAF
    var ticking = false;

    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    // Initial
    updateProgress();
  }

  // === 2. PARALLAX HERO ===
  function initParallax() {
    if (isTouch) return; // disabled on mobile

    var heroBg = document.querySelector('.hero-bg');
    var smokeLyr = document.querySelector('.smoke-layer');
    var heroSection = document.querySelector('.hero');
    if (!heroBg || !heroSection) return;

    heroBg.classList.add('parallax-active');
    var ticking = false;

    function updateParallax() {
      var scrollY = window.pageYOffset;
      var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

      // Only compute when hero is in view
      if (scrollY < heroBottom) {
        var offset = scrollY * 0.25; // parallax factor
        var clamped = Math.max(-40, Math.min(40, offset));
        heroBg.style.transform = 'translateY(' + clamped + 'px)';

        if (smokeLyr) {
          var smokeOffset = scrollY * 0.1;
          smokeLyr.style.transform = 'translateX(' + (-20 + smokeOffset * 0.3) + 'px) scale(' + (1 + smokeOffset * 0.0005) + ')';
        }
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // === INIT ===
  if (!prefersReduced) {
    initScrollProgress();
    initParallax();
  } else {
    // Still init the scroll bar for accessibility (visual indicator)
    initScrollProgress();
  }

})();
