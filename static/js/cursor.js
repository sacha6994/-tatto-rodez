/* ============================================================
   REDMOON TATTOO — cursor.js
   Plume style graphique : mouvement au déplacement, rotation selon la vitesse
   Desktop only — zero impact on touch devices
   ============================================================ */
(function () {
  'use strict';

  var cursor = document.getElementById('custom-cursor');
  var svg = cursor ? cursor.querySelector('#feather-svg') : null;
  if (!cursor || !svg) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var mouseX = 0, mouseY = 0;
  var curX = 0, curY = 0;
  var velX = 0, velY = 0;
  var prevX = 0, prevY = 0;
  var angle = 0;
  var targetAngle = 0;

  document.addEventListener('mousemove', function (e) {
    prevX = mouseX;
    prevY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    velX = mouseX - prevX;
    velY = mouseY - prevY;
    var speed = Math.sqrt(velX * velX + velY * velY);
    if (speed > 0.5) {
      targetAngle = Math.atan2(velY, velX) * (180 / Math.PI) - 45;
      targetAngle = Math.max(-25, Math.min(25, targetAngle));
    }
  });

  // Hover detection on interactive elements
  var interactables = document.querySelectorAll('a, button, [role="button"], .gallery-item, .process-step-content, .spec-card, .testimonial-card, .moon');
  interactables.forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hovering'); });
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.14;
    curY += (mouseY - curY) * 0.14;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';
    angle += (targetAngle - angle) * 0.12;
    targetAngle *= 0.92;
    var scale = cursor.classList.contains('hovering') ? ' scale(1.15)' : '';
    svg.style.transform = 'rotate(' + angle + 'deg)' + scale;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

})();
