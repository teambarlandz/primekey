/**
 * Primekey Homes Admin — Custom JavaScript
 * Animations, count-up, tooltips, and UX enhancements
 */

(function () {
  'use strict';

  // ── Staggered Fade-In for KPI Cards ──────────────────────────────────────
  function initKpiAnimations() {
    const kpiCards = document.querySelectorAll('.kpi-card');
    if (!kpiCards.length) return;

    kpiCards.forEach(function (card, index) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.animationDelay = (index * 60) + 'ms';

      setTimeout(function () {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50 + (index * 60));
    });
  }

  // ── Number Count-Up Animation ────────────────────────────────────────────
  function initCountUp() {
    var metrics = document.querySelectorAll('.kpi-card__metric');
    if (!metrics.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (isNaN(target) || target === 0) return;

          var duration = 800;
          var start = 0;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current = Math.floor(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target.toLocaleString();
            }
          }

          el.textContent = '0';
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    metrics.forEach(function (m) { observer.observe(m); });
  }

  // ── Tooltip on Badge Hover ───────────────────────────────────────────────
  function initBadgeTooltips() {
    var badges = document.querySelectorAll('td span, .badge, [class*="badge-"]');
    badges.forEach(function (badge) {
      if (badge.getAttribute('title')) return;
      var text = badge.textContent.trim();
      if (text && text.length > 0 && text.length < 50) {
        badge.setAttribute('title', text);
        badge.style.cursor = 'help';
      }
    });
  }

  // ── Auto-Dismiss Django Messages ─────────────────────────────────────────
  function initAutoDismissMessages() {
    var messages = document.querySelectorAll('.messagelist .message, .messagelist li');
    messages.forEach(function (msg) {
      setTimeout(function () {
        msg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-8px)';
        setTimeout(function () {
          msg.remove();
        }, 400);
      }, 5000);
    });
  }

  // ── Keyboard Shortcut: Ctrl+S to Save ───────────────────────────────────
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        var submitBtn = document.querySelector(
          'input[type="submit"][name="_save"], ' +
          'input[type="submit"][name="_continue"], ' +
          '.submit-row input[type="submit"]'
        );
        if (submitBtn) submitBtn.click();
      }
    });
  }

  // ── Smooth Scroll ────────────────────────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Enhance Table Rows with Hover State ──────────────────────────────────
  function initTableEnhancements() {
    var rows = document.querySelectorAll('table tbody tr');
    rows.forEach(function (row) {
      row.style.transition = 'background-color 0.15s ease';
    });
  }

  // ── Add Material Icon Support ────────────────────────────────────────────
  function initMaterialIcons() {
    // Ensure Material Symbols font is loaded
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Material+Symbols"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
      document.head.appendChild(link);
    }
  }

  // ── Initialize ───────────────────────────────────────────────────────────
  function init() {
    initMaterialIcons();
    initKpiAnimations();
    initCountUp();
    initBadgeTooltips();
    initAutoDismissMessages();
    initKeyboardShortcuts();
    initSmoothScroll();
    initTableEnhancements();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
