/* ===================================
   Orbital Navigation — SPA State Machine
   =================================== */

const OrbitalNav = {
  state: 'hub',       // 'hub' | 'panel' | 'transitioning'
  activePanel: null,
  viewport: null,
  scrollEl: null,
  orbital: null,
  heroContent: null,
  closeBtn: null,
  indicators: null,
  navLinks: null,
  panelLenis: null,
  _panelRaf: null,
  animatedPanels: {},  // track which panels have been animated

  init() {
    // Skip on mobile (orbital hidden at ≤900px)
    if (window.innerWidth <= 900) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.viewport = document.getElementById('panelViewport');
    this.scrollEl = document.getElementById('panelScroll');
    this.orbital = document.getElementById('orbital');
    this.heroContent = document.querySelector('.hero__content');
    this.closeBtn = document.getElementById('panelClose');
    this.indicators = this.orbital.querySelectorAll('.orbital__indicator');
    this.navLinks = document.querySelectorAll('.nav__link[data-panel]');

    if (!this.viewport || !this.orbital) return;

    this.bindIndicators();
    this.bindOrbitalReturn();
    this.bindNavLinks();
    this.bindKeyboard();
    this.bindCloseBtn();
    this.checkHash();

    // Prevent window scroll in hub state on desktop
    this.preventHubScroll();
  },

  preventHubScroll() {
    // In hub state, prevent scrolling past the hero
    document.addEventListener('wheel', (e) => {
      if (this.state === 'hub') {
        e.preventDefault();
      }
    }, { passive: false });
  },

  bindIndicators() {
    this.indicators.forEach(ind => {
      const panel = ind.dataset.panel;
      if (!panel) return; // skip proceso.html (no data-panel)

      ind.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.state === 'transitioning') return;
        this.openPanel(panel);
      });
    });
  },

  bindOrbitalReturn() {
    this.orbital.addEventListener('click', (e) => {
      if (this.state !== 'panel') return;
      if (e.target.closest('.orbital__indicator')) return;
      this.closePanel();
    });
  },

  bindCloseBtn() {
    if (!this.closeBtn) return;
    this.closeBtn.addEventListener('click', () => {
      if (this.state === 'panel') this.closePanel();
    });
  },

  bindNavLinks() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const panel = link.dataset.panel;
        if (!panel) return;
        e.preventDefault();
        if (this.state === 'transitioning') return;

        if (this.state === 'panel' && this.activePanel === panel) return;
        this.openPanel(panel);
      });
    });
  },

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state === 'panel') {
        this.closePanel();
      }
    });
  },

  checkHash() {
    const hash = window.location.hash.replace('#', '');
    const panelMap = { about: 'esencia', services: 'servicios', portfolio: 'trabajo', contact: 'contacto' };
    const panel = panelMap[hash] || hash;
    const validPanels = ['esencia', 'servicios', 'trabajo', 'contacto'];
    if (validPanels.includes(panel)) {
      // Auto-open after orbital entrance completes
      setTimeout(() => this.openPanel(panel), 3500);
    }
  },

  // ─── Open Panel ───
  openPanel(panelId) {
    if (this.state === 'panel' && this.activePanel !== panelId) {
      this.switchPanel(panelId);
      return;
    }
    if (this.state !== 'hub') return;

    this.state = 'transitioning';
    this.activePanel = panelId;
    document.body.classList.add('panel-open');
    this.updateNavActive(panelId);
    this.activatePanelContent(panelId);

    // Pause window-level Lenis
    if (window.lenis) window.lenis.stop();

    const tl = gsap.timeline({
      onComplete: () => {
        this.state = 'panel';
        this.initPanelScroll();
        this.triggerPanelAnimations(panelId);
        history.replaceState(null, '', '#' + panelId);
      }
    });

    // 1. Fade hero content
    tl.to(this.heroContent, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        this.heroContent.classList.add('is-hidden');
      }
    }, 0);

    // 2. Shrink orbital + move left
    tl.to(this.orbital, {
      scale: 0.25,
      left: '12.5vw',
      duration: 0.8,
      ease: 'power3.inOut',
      onStart: () => {
        // Fade indicators and dots
        gsap.to(this.orbital.querySelectorAll('.orbital__indicator, .orbital__dot, .orbital__shine'), {
          opacity: 0,
          duration: 0.3,
          stagger: 0.02
        });
      },
      onComplete: () => {
        this.orbital.classList.add('orbital--mini');
      }
    }, 0.15);

    // 3. Slide in panel viewport
    tl.fromTo(this.viewport,
      { x: '105%', opacity: 0 },
      {
        x: '0%',
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        onStart: () => {
          this.viewport.classList.add('active');
          this.viewport.setAttribute('aria-hidden', 'false');
        }
      }, 0.5);

    // 4. Show close button
    if (this.closeBtn) {
      tl.to(this.closeBtn, {
        opacity: 1,
        duration: 0.4,
        onStart: () => this.closeBtn.classList.add('visible')
      }, 0.9);
    }
  },

  // ─── Close Panel ───
  closePanel() {
    if (this.state !== 'panel') return;
    this.state = 'transitioning';

    this.destroyPanelScroll();

    const tl = gsap.timeline({
      onComplete: () => {
        this.state = 'hub';
        this.activePanel = null;
        document.body.classList.remove('panel-open');
        this.deactivateAllPanels();
        this.updateNavActive(null);
        history.replaceState(null, '', window.location.pathname);
        // Resume window Lenis
        if (window.lenis) window.lenis.start();
      }
    });

    // 1. Hide close button
    if (this.closeBtn) {
      tl.to(this.closeBtn, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => this.closeBtn.classList.remove('visible')
      }, 0);
    }

    // 2. Slide out panel
    tl.to(this.viewport, {
      x: '105%',
      opacity: 0,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        this.viewport.classList.remove('active');
        this.viewport.setAttribute('aria-hidden', 'true');
      }
    }, 0.1);

    // 3. Expand orbital back to center
    tl.to(this.orbital, {
      scale: 1,
      left: '50%',
      duration: 0.9,
      ease: 'power3.inOut',
      onStart: () => {
        this.orbital.classList.remove('orbital--mini');
      }
    }, 0.3);

    // 4. Fade indicators and dots back in
    tl.to(this.orbital.querySelectorAll('.orbital__indicator'), {
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(2)'
    }, 0.8);

    tl.to(this.orbital.querySelectorAll('.orbital__dot'), {
      opacity: 0.3,
      duration: 0.4,
      stagger: 0.05
    }, 0.8);

    // 5. Fade hero content back
    tl.to(this.heroContent, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
      onStart: () => {
        this.heroContent.classList.remove('is-hidden');
      }
    }, 0.7);
  },

  // ─── Switch Panel (while one is open) ───
  switchPanel(panelId) {
    if (this.state === 'transitioning') return;
    this.state = 'transitioning';

    this.destroyPanelScroll();
    this.updateNavActive(panelId);

    const tl = gsap.timeline();

    // Cross-fade
    tl.to(this.scrollEl, {
      opacity: 0,
      x: -30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.deactivateAllPanels();
        this.activatePanelContent(panelId);
        this.activePanel = panelId;
        this.scrollEl.scrollTop = 0;
        history.replaceState(null, '', '#' + panelId);
      }
    });

    tl.to(this.scrollEl, {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        this.state = 'panel';
        this.initPanelScroll();
        this.triggerPanelAnimations(panelId);
      }
    });
  },

  // ─── Panel Content ───
  activatePanelContent(panelId) {
    this.deactivateAllPanels();
    const panel = document.querySelector('.panel[data-panel="' + panelId + '"]');
    if (panel) panel.classList.add('active');
  },

  deactivateAllPanels() {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  },

  // ─── Nav Active State ───
  updateNavActive(panelId) {
    document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('nav--active'));
    if (panelId) {
      document.querySelectorAll('.nav__link[data-panel="' + panelId + '"]').forEach(l => {
        l.classList.add('nav--active');
      });
    }
  },

  // ─── Panel Scroll (Lenis) ───
  initPanelScroll() {
    if (typeof Lenis === 'undefined') return;

    this.panelLenis = new Lenis({
      wrapper: this.scrollEl,
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.8
    });

    this._panelRaf = (time) => {
      this.panelLenis.raf(time * 1000);
    };
    gsap.ticker.add(this._panelRaf);
  },

  destroyPanelScroll() {
    if (this.panelLenis) {
      this.panelLenis.destroy();
      this.panelLenis = null;
    }
    if (this._panelRaf) {
      gsap.ticker.remove(this._panelRaf);
      this._panelRaf = null;
    }
  },

  // ─── Panel Entrance Animations ───
  triggerPanelAnimations(panelId) {
    // Only animate each panel once
    if (this.animatedPanels[panelId]) return;
    this.animatedPanels[panelId] = true;

    const panel = document.querySelector('.panel[data-panel="' + panelId + '"]');
    if (!panel) return;

    const delay = 0.15;

    switch (panelId) {
      case 'esencia':
        this._animateEsencia(panel, delay);
        break;
      case 'servicios':
        this._animateServicios(panel, delay);
        break;
      case 'trabajo':
        this._animateTrabajo(panel, delay);
        break;
      case 'contacto':
        this._animateContacto(panel, delay);
        break;
    }
  },

  _animateEsencia(panel, delay) {
    const texts = panel.querySelectorAll('.about__text');
    gsap.fromTo(texts, { opacity: 0, y: 25 }, {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay,
      ease: 'power3.out'
    });

    const highlight = panel.querySelector('.about__highlight');
    if (highlight) {
      // Check if already split by textSplitReveals
      let words = highlight.querySelectorAll('.word__inner');
      if (!words.length && Animations.splitText) {
        words = Animations.splitText(highlight);
      }
      if (words.length) {
        gsap.fromTo(words, { y: '100%' }, {
          y: 0, duration: 0.5, stagger: 0.03, delay: delay + 0.4,
          ease: 'power3.out'
        });
      }
    }

    const manifesto = panel.querySelector('.manifesto__text');
    if (manifesto) {
      let words = manifesto.querySelectorAll('.word__inner');
      if (!words.length && Animations.splitText) {
        words = Animations.splitText(manifesto);
      }
      if (words.length) {
        gsap.fromTo(words, { y: '100%' }, {
          y: 0, duration: 0.6, stagger: 0.04, delay: delay + 0.6,
          ease: 'power3.out'
        });
      }
    }
  },

  _animateServicios(panel, delay) {
    const items = panel.querySelectorAll('.service-item');
    gsap.fromTo(items, { x: -30, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay,
      ease: 'power3.out'
    });

    const foundation = panel.querySelector('.plans__foundation');
    if (foundation) {
      gsap.fromTo(foundation, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, delay: delay + 0.4,
        ease: 'power3.out'
      });
    }

    const planCards = panel.querySelectorAll('.plan-card');
    gsap.fromTo(planCards, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.12, delay: delay + 0.6,
      ease: 'power3.out'
    });
  },

  _animateTrabajo(panel, delay) {
    const cards = panel.querySelectorAll('.project-card');
    cards.forEach((card, i) => {
      const dir = i % 2 === 0 ? -40 : 40;
      gsap.fromTo(card, { x: dir, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8, delay: delay + (i % 2) * 0.15,
        ease: 'power3.out'
      });
    });

    const testimonial = panel.querySelector('.testimonial.active');
    if (testimonial) {
      gsap.fromTo(testimonial, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, delay: delay + 0.5,
        ease: 'power3.out'
      });
    }
  },

  _animateContacto(panel, delay) {
    const info = panel.querySelector('.contact__info');
    if (info) {
      gsap.fromTo(info, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, delay,
        ease: 'power3.out'
      });
    }

    const form = panel.querySelector('.contact__form-wrap');
    if (form) {
      gsap.fromTo(form, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, delay: delay + 0.15,
        ease: 'power3.out'
      });
    }

    const heading = panel.querySelector('.contact__heading');
    if (heading) {
      let words = heading.querySelectorAll('.word__inner');
      if (!words.length && Animations.splitText) {
        words = Animations.splitText(heading);
      }
      if (words.length) {
        gsap.fromTo(words, { y: '100%' }, {
          y: 0, duration: 0.5, stagger: 0.04, delay: delay + 0.3,
          ease: 'power3.out'
        });
      }
    }
  }
};
