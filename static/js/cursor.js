/* ============================================================
   REDMOON TATTOO — cursor.js
   Ink quill cursor with smooth lerp interpolation
   Desktop only — zero impact on touch devices
   ============================================================ */
(function () {
  'use strict';

  // Bail on touch / reduced motion
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Create cursor container
  var cursor = document.createElement('div');
  cursor.className = 'custom-cursor-quill';
  cursor.innerHTML =
    '<svg class="quill-svg" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M28 2C28 2 26 4 22 8C18 12 14 16 11 19C9 21 7.5 22.5 6.5 23.5C5.5 24.5 5 25.5 4.5 26.5C4 27.5 3.8 28.2 3.5 29C3.3 29.5 3 30 3 30C3 30 3.5 29.8 4 29.5C4.8 29 5.5 28.5 6 28C6.5 27.5 7 27 7.5 26.5" stroke="#f5f0e8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M28 2C28 2 29 3 28.5 4.5C28 6 26 8 22 12" stroke="#f5f0e8" stroke-width="1" stroke-linecap="round" opacity="0.6"/>' +
      '<path d="M11 19L9 21L7 23" stroke="#f5f0e8" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>' +
      '<line x1="28" y1="2" x2="30" y2="1" stroke="#f5f0e8" stroke-width="0.6" stroke-linecap="round" opacity="0.3"/>' +
    '</svg>' +
    '<div class="quill-ink-drop"></div>';
  document.body.appendChild(cursor);

  // Activate custom cursor (hide default arrow)
  document.body.classList.add('custom-cursor-active');

  // State
  var mouseX = -100, mouseY = -100;
  var curX = -100, curY = -100;
  var visible = false;

  function lerp(a, b, f) {
    return a + (b - a) * f;
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      cursor.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', function () {
    visible = false;
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    visible = true;
    cursor.style.opacity = '1';
  });

  // Interactive element detection
  var clickableSel = 'a, button, .filter-btn, .nav-cta, .hero-cta, .btn-primary, .btn-secondary, .btn-load-more, .cookie-accept, .spec-card, .testimonial-card, .footer-social a, .moon, .gallery-item';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(clickableSel)) {
      cursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(clickableSel)) {
      cursor.classList.remove('hovering');
    }
  });

  // Animation loop — lerp 0.12 for organic feel
  function animate() {
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);

    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

})();
