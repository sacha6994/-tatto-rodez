/* ============================================================
   REDMOON TATTOO — animations.js
   IntersectionObserver, stagger, counters, tilt, magnetic,
   text reveal, view transitions, glitch
   GPU-only: transform + opacity
   ============================================================ */
(function () {
  'use strict';

  // === REDUCED MOTION CHECK ===
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // === 1. TEXT REVEAL CINEMATIC ===
  function initTextReveal() {
    const titles = document.querySelectorAll('.section-title, .contact-title');
    titles.forEach(function (title) {
      if (title.closest('.hero')) return; // skip hero (has its own animation)
      if (title.dataset.textRevealed) return;
      title.dataset.textRevealed = '1';

      const text = title.innerHTML;
      // Split by words, preserve HTML tags
      const words = text.split(/(\s+)/);
      title.innerHTML = '';

      words.forEach(function (word) {
        if (/^\s+$/.test(word)) {
          title.appendChild(document.createTextNode(word));
          return;
        }
        var wrapper = document.createElement('span');
        wrapper.className = 'text-reveal-word';
        var inner = document.createElement('span');
        inner.innerHTML = word;
        wrapper.appendChild(inner);
        title.appendChild(wrapper);
      });
    });

    // Observer for triggering reveal
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var words = entry.target.querySelectorAll('.text-reveal-word');
        words.forEach(function (w, i) {
          setTimeout(function () {
            w.classList.add('revealed');
          }, i * 60);
        });
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    titles.forEach(function (t) {
      revealObs.observe(t);
    });
  }

  // === 2. VIEW TRANSITIONS API (Gallery Filters) ===
  function initViewTransitions() {
    var galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    // Tag the grid for view-transition
    galleryGrid.style.viewTransitionName = 'gallery-grid';

    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // If View Transitions API is available, wrap the filter change
        if ('startViewTransition' in document) {
          e.stopImmediatePropagation();
          document.startViewTransition(function () {
            // Re-dispatch click to trigger the existing filter logic
            triggerFilter(btn);
          });
        }
        // else: normal click, existing handler fires
      }, { capture: true }); // capture phase to run before existing handler
    });

    function triggerFilter(btn) {
      // Replicate the existing filter logic
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var text = btn.textContent.trim();
      var filter = (text === 'Tout') ? 'all' : text;
      var allItems = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
      var btnMore = document.getElementById('btnLoadMoreGallery');
      var pageSize = 9;

      allItems.forEach(function (el) {
        var cat = el.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          el.classList.remove('gallery-hidden');
        } else {
          el.classList.add('gallery-hidden');
        }
      });

      // Apply initial page limit
      var visible = allItems.filter(function (el) {
        return !el.classList.contains('gallery-hidden');
      });
      visible.forEach(function (el, i) {
        if (i >= pageSize) el.classList.add('gallery-hidden');
      });

      if (btnMore) {
        btnMore.style.display = (visible.length > pageSize) ? 'inline-block' : 'none';
      }
    }
  }

  // === 3. MAGNETIC BUTTONS (desktop only) ===
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

  // === 4. CARD TILT 3D (desktop only) ===
  function initCardTilt() {
    if (isTouch) return;

    var cards = document.querySelectorAll('.gallery-item');
    cards.forEach(function (card) {
      card.classList.add('tilt-active');

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateY = (x - 0.5) * 8; // ±4deg
        var rotateX = (0.5 - y) * 8; // ±4deg
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // === 5. STAGGER REVEAL CASCADE ===
  function initStaggerReveal() {
    var grids = [
      { sel: '.specs-grid', children: '.spec-card' },
      { sel: '.gallery-grid', children: '.gallery-item' },
      { sel: '.testimonial-cards', children: '.testimonial-card' },
      { sel: '.process-timeline', children: '.process-step-content, .process-step-visual, .process-step-number' }
    ];

    grids.forEach(function (g) {
      var container = document.querySelector(g.sel);
      if (!container) return;

      var children = container.querySelectorAll(g.children);
      children.forEach(function (child) {
        child.classList.add('stagger-child');
      });

      var staggerObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var items = entry.target.querySelectorAll('.stagger-child');
          items.forEach(function (item, i) {
            var delay = i * 80;
            item.style.transitionDelay = delay + 'ms';
            // Use rAF to batch DOM reads
            requestAnimationFrame(function () {
              item.classList.add('stagger-visible');
            });
          });

          staggerObs.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

      staggerObs.observe(container);
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
          // Ease-out cubic
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
    // Only init counters & nav tracking — skip animations
    initCounters();
    initNavTracking();
    return;
  }

  initTextReveal();
  initViewTransitions();
  initMagneticButtons();
  initCardTilt();
  initStaggerReveal();
  initCounters();
  initNavTracking();

})();
