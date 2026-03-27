/* ===================================
   Custom Cursor — Dot + Ring + Magnetic
   =================================== */

const CustomCursor = {
  dot: null,
  ring: null,
  isTouch: false,

  init() {
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (this.isTouch || window.innerWidth <= 900) return;

    this.dot = document.getElementById('cursorDot');
    this.ring = document.getElementById('cursorRing');
    if (!this.dot || !this.ring) return;

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      if (!this.dot.classList.contains('active')) {
        this.dot.classList.add('active');
        this.ring.classList.add('active');
      }

      // Dot follows instantly
      gsap.set(this.dot, { x: e.clientX, y: e.clientY });

      // Ring follows with smooth lag
      gsap.to(this.ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    // Hide when mouse leaves
    document.addEventListener('mouseleave', () => {
      this.dot.classList.remove('active');
      this.ring.classList.remove('active');
    });
    document.addEventListener('mouseenter', () => {
      this.dot.classList.add('active');
      this.ring.classList.add('active');
    });

    // Hover states on interactive elements
    document.querySelectorAll('[data-hover], a, button').forEach(el => {
      el.addEventListener('mouseenter', () => this.ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.ring.classList.remove('hover'));
    });

    // Text cursor on inputs/textareas
    document.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.ring.classList.add('text');
        this.ring.classList.remove('hover');
      });
      el.addEventListener('mouseleave', () => {
        this.ring.classList.remove('text');
      });
    });

    // Magnetic pull
    this.initMagnetic();
  },

  initMagnetic() {
    // Strong magnetic pull (30%) — buttons, tags, interactive elements
    const strongEls = document.querySelectorAll(
      '.contact__submit, .form-tag, .testimonials__dot, .hero__scroll'
    );

    strongEls.forEach(el => {
      this.applyMagnetic(el, 0.3);
    });

    // Medium magnetic pull (20%) — nav links, social links, orbital indicators
    const mediumEls = document.querySelectorAll(
      '.nav__link, .contact__social-link, .orbital__indicator, .mobile-menu__link'
    );

    mediumEls.forEach(el => {
      this.applyMagnetic(el, 0.2);
    });

    // Subtle magnetic pull (12%) — headings, labels, all text with [data-magnetic]
    const subtleEls = document.querySelectorAll(
      '.hero__logo-letter, .hero__tagline, .hero__subtitle, .section-label, .about__label, ' +
      '.manifesto__text, .contact__heading, .service-item__name, .plan-card__name, ' +
      '.plans__title, .plans__rhythm-title, .portfolio__header, .process__phase-title, ' +
      '.contact__detail-value, .footer__text, [data-magnetic]'
    );

    subtleEls.forEach(el => {
      this.applyMagnetic(el, 0.12);
    });
  },

  applyMagnetic(el, strength) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  }
};
