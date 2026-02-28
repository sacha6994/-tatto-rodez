/* ============================================================
   REDMOON TATTOO — cursor.js
   Ink quill cursor with smooth lerp interpolation
   Desktop only — zero impact on touch devices
   ============================================================ */
(function () {
  'use strict';

  var cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var mouseX = 0, mouseY = 0;
  var curX = 0, curY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hover detection on interactive elements
  var interactables = document.querySelectorAll('a, button, [role="button"], .gallery-item, .process-step-content, .spec-card, .testimonial-card, .moon');
  interactables.forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hovering'); });
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

})();
