/* ============================================================
   REDMOON TATTOO — animations.js
   WORKS WITH the existing .reveal system (never replaces it)
   - Text reveal: enhances titles AFTER .reveal makes them visible
   - Stagger: adds transition-delay to existing .reveal elements
   - Counters, nav, tilt, magnetic: independent systems
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // === 1. TEXT REVEAL CINEMATIC ===
  // Splits section titles into word-spans for staggered reveal.
  // The title keeps its .reveal class (existing IO handles opacity).
  // Once the title is visible, a MutationObserver triggers the word animation.
  function initTextReveal() {
    var titles = document.querySelectorAll('.section-title, .contact-title');

    titles.forEach(function (title) {
      if (title.closest('.hero')) return;
      if (title.dataset.textSplit) return;
      title.dataset.textSplit = '1';

      // Save original HTML
      var html = title.innerHTML;
      // Split by whitespace, keep tags
      var words = html.split(/(\s+)/);
      title.innerHTML = '';

      words.forEach(function (word) {
        if (/^\s+$/.test(word)) {
          title.appendChild(document.createTextNode(' '));
          return;
        }
        var wrapper = document.createElement('span');
        wrapper.className = 'text-reveal-word';
        var inner = document.createElement('span');
        inner.innerHTML = word;
        wrapper.appendChild(inner);
        title.appendChild(wrapper);
      });

      // When the existing .reveal system adds .visible, trigger word animation
      function checkVisible() {
        if (title.classList.contains('visible')) {
          var wordSpans = title.querySelectorAll('.text-reveal-word');
          wordSpans.forEach(function (w, i) {
            setTimeout(function () {
              w.classList.add('revealed');
            }, i * 60);
          });
          return true;
        }
        return false;
      }

      // Check immediately (might already be visible)
      if (checkVisible()) return;

      // Otherwise watch for .visible class being added
      var mo = new MutationObserver(function () {
        if (checkVisible()) {
          mo.disconnect();
        }
      });
      mo.observe(title, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // === 2. VIEW TRANSITIONS API (Gallery Filters) ===
  function initViewTransitions() {
    if (!('startViewTransition' in document)) return;

    var galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    // Tag the grid for CSS view-transition-name
    galleryGrid.style.viewTransitionName = 'gallery-grid';

    // Wrap each filter button click in a View Transition
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      var origClick = null;

      btn.addEventListener('click', function (e) {
        // Prevent the original handler, wrap in view transition
        e.preventDefault();
        e.stopPropagation();

        document.startViewTransition(function () {
          // Manually trigger the filter logic
          document.querySelectorAll('.filter-btn').forEach(function (b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');

          var text = btn.textContent.trim();
          var filter = (text === 'Tout') ? 'all' : text;
          var allItems = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
          var btnMore = document.getElementById('btnLoadMoreGallery');

          allItems.forEach(function (el) {
            var cat = el.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              el.classList.remove('gallery-hidden');
            } else {
              el.classList.add('gallery-hidden');
            }
          });

          // Page limit
          var visible = allItems.filter(function (el) {
            return !el.classList.contains('gallery-hidden');
          });
          visible.forEach(function (el, i) {
            if (i >= 9) el.classList.add('gallery-hidden');
          });

          if (btnMore) {
            btnMore.style.display = (visible.length > 9) ? 'inline-block' : 'none';
          }
        });
      }, true); // capture phase — runs before the CMS handler
    });
  }

  // === 3. STAGGER REVEAL (enhances existing .reveal) ===
  // Does NOT add new classes. Just sets transition-delay on .reveal items
  // so they cascade when the existing IO triggers .visible.
  function initStaggerReveal() {
    var grids = [
      { sel: '.specs-grid', children: '.spec-card' },
      { sel: '.gallery-grid', children: '.gallery-item' },
      { sel: '.testimonial-cards', children: '.testimonial-card' }
    ];

    grids.forEach(function (g) {
      var container = document.querySelector(g.sel);
      if (!container) return;

      var children = container.querySelectorAll(g.children);
      children.forEach(function (child, i) {
        // Only enhance elements that use .reveal
        if (child.classList.contains('reveal')) {
          // Override the fixed delay classes with progressive delay
          child.style.transitionDelay = (i * 80) + 'ms';
        }
      });
    });
  }

  // === 4. MAGNETIC BUTTONS (desktop only) ===
  function initMagneticButtons() {
    if (isTouch) return;

    var targets = document.querySelectorAll('.hero-cta, .nav-cta, .btn-primary');
    targets.forEach(function (btn) {
      btn.classList.add('magnetic-target');

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var radius = 80;

        if (dist < radius) {
          var pull = (1 - dist / radius) * 0.3;
          btn.style.transform = 'translate(' + (dx * pull) + 'px,' + (dy * pull) + 'px)';
        }
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  // === 5. CARD TILT 3D (desktop only) ===
  function initCardTilt() {
    if (isTouch) return;

    var cards = document.querySelectorAll('.gallery-item');
    cards.forEach(function (card) {
      card.classList.add('tilt-active');

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateY = (x - 0.5) * 8;
        var rotateX = (0.5 - y) * 8;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // === 6. COUNTER ANIMATION ===
  function initCounters() {
    var statItems = document.querySelectorAll('.stat-item h3');
    if (!statItems.length) return;
    var animated = false;

    function parseStatValue(text) {
      text = text.trim();
      var hasPlus = text.indexOf('+') !== -1;
      var hasK = text.toUpperCase().indexOf('K') !== -1;
      var num = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return null;
      return { num: num, hasPlus: hasPlus, hasK: hasK };
    }

    function formatStat(current, info) {
      var val;
      if (info.hasK) {
        val = current.toFixed(current >= 10 ? 0 : 1) + 'K';
      } else {
        val = Math.round(current).toString();
      }
      if (info.hasPlus) val += '+';
      return val;
    }

    function animateCounters() {
      if (animated) return;
      animated = true;

      statItems.forEach(function (el) {
        var info = parseStatValue(el.textContent);
        if (!info) return;
        var duration = 1500;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = formatStat(info.num * eased, info);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    var statsRow = document.querySelector('.stats-row');
    if (statsRow) {
      var statsObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          animateCounters();
          statsObs.disconnect();
        }
      }, { threshold: 0.5 });
      statsObs.observe(statsRow);
    }
  }

  // === 7. NAV ACTIVE SECTION TRACKING ===
  function initNavTracking() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

    sections.forEach(function (s) { navObs.observe(s); });
  }

  // === INIT ===
  if (prefersReduced) {
    initCounters();
    initNavTracking();
    return;
  }

  initTextReveal();
  initViewTransitions();
  initStaggerReveal();
  initMagneticButtons();
  initCardTilt();
  initCounters();
  initNavTracking();

})();
