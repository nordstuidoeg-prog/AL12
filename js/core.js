/* ============================================================
   AquaLayer™ — core.js
   Nav/footer injection · Settled nav · Mobile hamburger
   Scroll reveals · Gloss pass · Waterline draw
   Accordion · Before/after drag reveal · Reduced-motion
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Reduced-motion detection ─────────────────────── */

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) document.documentElement.setAttribute('data-motion', 'reduced');

  /* ── 2. Root prefix — works on file:// and any HTTP host ─
     Pages in services/ are one level deeper than root pages.
     R = '' for root pages, '../' for services/ subpages.    */

  const inServicesDir = /\/services\//.test(
    window.location.pathname.replace(/\\/g, '/')
  );
  const R = inServicesDir ? '../' : '';

  /* ── 3. Nav HTML ─────────────────────────────────────── */

  const NAV_HTML = `
<nav id="site-nav" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="${R}index.html" class="nav-wordmark" aria-label="AquaLayer home">AquaLayer<sup>™</sup></a>
    <button class="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-overlay">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" role="list">
      <li><a href="${R}services.html" data-nav="services">Services</a></li>
      <li><a href="${R}gallery.html"  data-nav="gallery">Gallery</a></li>
      <li><a href="${R}about.html"    data-nav="about">About</a></li>
      <li><a href="${R}faq.html"      data-nav="faq">FAQ</a></li>
    </ul>
    <a href="${R}contact.html" class="btn-primary nav-cta">Book an inspection</a>
  </div>
</nav>
<div id="nav-overlay" class="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
  <button class="nav-overlay-close" aria-label="Close menu">&#x2715;</button>
  <a href="${R}services.html" data-nav="services">Services</a>
  <a href="${R}gallery.html"  data-nav="gallery">Gallery</a>
  <a href="${R}about.html"    data-nav="about">About</a>
  <a href="${R}faq.html"      data-nav="faq">FAQ</a>
  <a href="${R}contact.html" class="btn-primary">Book an inspection</a>
</div>`;

  /* ── 4. Footer HTML ──────────────────────────────────── */

  const FOOTER_HTML = `
<footer class="site-footer">
  <hr class="waterline waterline--footer">
  <div class="footer-inner">
    <div class="footer-top">
      <span class="footer-wordmark">AquaLayer<sup>™</sup></span>
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="${R}services.html">Services</a>
        <a href="${R}gallery.html">Gallery</a>
        <a href="${R}about.html">About</a>
        <a href="${R}faq.html">FAQ</a>
      </nav>
      <div class="footer-social">
        <a href="https://wa.me/201055990055" class="footer-social-link" aria-label="WhatsApp" rel="noopener noreferrer" target="_blank">WhatsApp</a>
        <a href="https://instagram.com/aqualayereg" class="footer-social-link" aria-label="Instagram" rel="noopener noreferrer" target="_blank">Instagram</a>
      </div>
    </div>
    <div class="footer-bottom">
      <a href="mailto:hello@aqualayereg.com">hello@aqualayereg.com</a>
      <a href="tel:+201055990055">+20 1055 9900 55</a>
      <p class="footer-copy">&copy; AquaLayer&#8482;. Built for Saltwater Luxury.</p>
    </div>
  </div>
</footer>`;

  /* ── 5. Inject nav + footer ──────────────────────────── */

  function inject() {
    const navMount    = document.getElementById('nav-mount');
    const footerMount = document.getElementById('footer-mount');

    if (navMount)    navMount.innerHTML    = NAV_HTML;
    if (footerMount) footerMount.innerHTML = FOOTER_HTML;

    setActiveLink();
    initHamburger();
    initSettledNav();
    initWaterlines();
    initScrollReveals();
    initGlossPass();
    initAccordions();
    initDragReveals();
  }

  /* ── 5. Active nav link ──────────────────────────────── */

  function setActiveLink() {
    const path = window.location.pathname;

    // Determine which nav key is active
    let active = '';
    if (path === '/' || path.endsWith('/index.html')) active = '';
    else if (path.includes('/services'))  active = 'services';
    else if (path.includes('/gallery'))   active = 'gallery';
    else if (path.includes('/about'))     active = 'about';
    else if (path.includes('/faq'))       active = 'faq';
    else if (path.includes('/contact'))   active = 'contact';

    if (!active) return;

    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === active) link.classList.add('is-active');
    });
  }

  /* ── 6. Settled nav (scroll) ─────────────────────────── */

  function initSettledNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--settled', window.scrollY > 80);
    }, { passive: true });
  }

  /* ── 7. Mobile hamburger ─────────────────────────────── */

  function initHamburger() {
    const btn     = document.querySelector('.nav-hamburger');
    const overlay = document.getElementById('nav-overlay');
    const closeBtn = document.querySelector('.nav-overlay-close');
    if (!btn || !overlay) return;

    function open() {
      overlay.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Close on overlay link click
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  /* ── 8. Waterline draw on scroll-into-view ───────────── */

  function initWaterlines() {
    const lines = document.querySelectorAll('.waterline:not(.hero-waterline):not(.waterline--footer)');
    if (!lines.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    lines.forEach(line => observer.observe(line));

    // Footer waterline triggers sooner
    const footerLine = document.querySelector('.waterline--footer');
    if (footerLine) {
      const fo = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      fo.observe(footerLine);
    }
  }

  /* ── 9. Scroll reveals (.js-reveal) ─────────────────── */

  function initScrollReveals() {
    const els = document.querySelectorAll('.js-reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => observer.observe(el));
  }

  /* ── 10. Gloss pass (.js-gloss) ─────────────────────── */

  function initGlossPass() {
    const els = document.querySelectorAll('.js-gloss');
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gloss-fired');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    els.forEach(el => observer.observe(el));
  }

  /* ── 11. Accordion ───────────────────────────────────── */

  function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item   = trigger.closest('.accordion-item');
        const body   = item.querySelector('.accordion-body');
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Close all siblings in the same group
        const group = item.closest('.accordion-group');
        if (group) {
          group.querySelectorAll('.accordion-item').forEach(sibling => {
            if (sibling !== item) {
              sibling.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
              sibling.querySelector('.accordion-body').removeAttribute('open');
              sibling.classList.remove('is-open');
            }
          });
        }

        // Toggle this item
        const next = !isOpen;
        trigger.setAttribute('aria-expanded', String(next));
        item.classList.toggle('is-open', next);
        if (next) {
          body.setAttribute('open', '');
        } else {
          body.removeAttribute('open');
        }
      });
    });
  }

  /* ── 12. Before/after drag reveal ───────────────────── */

  function initDragReveals() {
    document.querySelectorAll('.reveal-slider').forEach(slider => {
      const handle = slider.querySelector('.reveal-handle');
      if (!handle) return;

      let dragging = false;

      function updateSplit(clientX) {
        const rect = slider.getBoundingClientRect();
        const pct  = Math.min(Math.max(
          ((clientX - rect.left) / rect.width) * 100, 5
        ), 95);
        slider.style.setProperty('--split', pct + '%');
      }

      handle.addEventListener('pointerdown', e => {
        dragging = true;
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      slider.addEventListener('pointermove', e => {
        if (!dragging) return;
        updateSplit(e.clientX);
      });

      slider.addEventListener('pointerup',     () => { dragging = false; });
      slider.addEventListener('pointercancel', () => { dragging = false; });

      // Tap anywhere on slider to reposition (mobile UX)
      slider.addEventListener('click', e => {
        if (e.target === handle || handle.contains(e.target)) return;
        updateSplit(e.clientX);
      });
    });
  }

  /* ── Boot ────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
