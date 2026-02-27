/* ============================================================
   REDMOON TATTOO — cursor.js
   Smooth custom cursor with lerp interpolation
   Works ON TOP of the ambient cursor-glow (never hides it)
   Desktop only — zero impact on touch devices
   ============================================================ */
(function () {
  'use strict';

  // Bail on touch / reduced motion
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Create cursor elements
  var dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'custom-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // Activate custom cursor (hide default arrow only)
  document.body.classList.add('custom-cursor-active');

  // NOTE: We do NOT hide the #cursorGlow — it's the ambient red halo
  // that gives the site its atmosphere. The dot+ring overlay on top.

  // State
  var mouseX = -100, mouseY = -100;
  var dotX = -100, dotY = -100;
  var ringX = -100, ringY = -100;
  var visible = false;

  function lerp(a, b, f) {
    return a + (b - a) * f;
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', function () {
    visible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    visible = true;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  // Interactive element detection
  var clickableSel = 'a, button, .filter-btn, .nav-cta, .hero-cta, .btn-primary, .btn-secondary, .btn-load-more, .cookie-accept, .spec-card, .testimonial-card, .footer-social a, .moon';
  var gallerySel = '.gallery-item';

  document.addEventListener('mouseover', function (e) {
    var gal = e.target.closest(gallerySel);
    var clickable = e.target.closest(clickableSel);

    if (gal) {
      dot.classList.add('gallery-hover');
      ring.classList.add('gallery-hover');
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    } else if (clickable) {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
      dot.classList.remove('gallery-hover');
      ring.classList.remove('gallery-hover');
    }
  });

  document.addEventListener('mouseout', function (e) {
    var gal = e.target.closest(gallerySel);
    var clickable = e.target.closest(clickableSel);
    if (gal || clickable) {
      dot.classList.remove('hovering', 'gallery-hover');
      ring.classList.remove('hovering', 'gallery-hover');
    }
  });

  // Animation loop — lerp for smooth follow
  function animate() {
    dotX = lerp(dotX, mouseX, 0.35);
    dotY = lerp(dotY, mouseY, 0.35);
    ringX = lerp(ringX, mouseX, 0.15);
    ringY = lerp(ringY, mouseY, 0.15);

    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

})();
