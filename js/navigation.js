/* ===================================
   Navigation
   =================================== */

const Navigation = {
  nav: null,
  hamburger: null,
  mobileMenu: null,
  scrollProgress: null,
  scrollThreshold: 80,

  init() {
    this.nav = document.getElementById('nav');
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.scrollProgress = document.getElementById('scrollProgress');

    this.bindScroll();
    this.bindHamburger();
    this.bindSmoothScroll();
  },

  bindScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Nav glass effect
          if (window.scrollY > this.scrollThreshold) {
            this.nav.classList.add('scrolled');
          } else {
            this.nav.classList.remove('scrolled');
          }

          // Scroll progress bar
          if (this.scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
            this.scrollProgress.style.transform = 'scaleX(' + progress + ')';
          }

          ticking = false;
        });
        ticking = true;
      }
    });
  },

  bindHamburger() {
    this.hamburger.addEventListener('click', () => {
      this.hamburger.classList.toggle('active');
      this.mobileMenu.classList.toggle('active');

      if (this.mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close mobile menu on link click
    const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-menu__link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.hamburger.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  },

  bindSmoothScroll() {
    const allLinks = document.querySelectorAll('a[href^="#"]');
    allLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        // Route through OrbitalNav if available and link has data-panel
        const panel = link.dataset.panel;
        if (panel && typeof OrbitalNav !== 'undefined' && window.innerWidth > 900) {
          e.preventDefault();
          OrbitalNav.openPanel(panel);
          return;
        }

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          if (window.lenis) {
            window.lenis.scrollTo(target);
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
};
