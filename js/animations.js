/* ===================================
   GSAP Animations
   =================================== */

const Animations = {
  prefersReducedMotion: false,
  ready: false,

  splitText(el) {
    // Walk through child nodes preserving HTML elements like <em>, <span>, <br>
    const fragment = document.createDocumentFragment();
    const wrapWord = (text) => {
      text.split(' ').filter(w => w).forEach((word, i, arr) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        const inner = document.createElement('span');
        inner.className = 'word__inner';
        inner.textContent = word;
        wordSpan.appendChild(inner);
        fragment.appendChild(wordSpan);
        if (i < arr.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });
    };

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text.trim()) {
          // Preserve leading/trailing spaces
          if (text.startsWith(' ')) fragment.appendChild(document.createTextNode(' '));
          wrapWord(text.trim());
          if (text.endsWith(' ')) fragment.appendChild(document.createTextNode(' '));
        }
      } else if (node.nodeName === 'BR') {
        fragment.appendChild(document.createElement('br'));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Wrap contents of element (em, span, etc.) preserving the tag
        const wrapper = node.cloneNode(false);
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        const inner = document.createElement('span');
        inner.className = 'word__inner';
        wrapper.textContent = node.textContent;
        inner.appendChild(wrapper);
        wordSpan.appendChild(inner);
        fragment.appendChild(wordSpan);
      }
    };

    Array.from(el.childNodes).forEach(processNode);
    el.innerHTML = '';
    el.appendChild(fragment);
    return el.querySelectorAll('.word__inner');
  },

  init() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);

    if (this.prefersReducedMotion) {
      this.showAllImmediately();
      return;
    }

    // Listen for preloader done — may have already fired
    window.addEventListener('preloaderDone', () => this.start());

    // If body already lost loading class, preloader already done
    if (!document.body.classList.contains('loading')) {
      this.start();
    }
  },

  start() {
    if (this.ready) return;
    this.ready = true;
    this.heroEntrance();
    this.scrollAnimations();
    this.serviceAccordion();
    this.testimonialCarousel();
    this.portfolioTilt();
    this.tagRipple();
    this.navCharStagger();
    this.orbitalEntrance();
    this.orbitalParallax();
    this.textSplitReveals();
    this.parallaxLayers();

    // Recalculate trigger positions after preloader is gone
    setTimeout(() => ScrollTrigger.refresh(), 100);
  },

  showAllImmediately() {
    gsap.set('.hero__logo-letter, .hero__logo-moon, .hero__subtitle, .hero__tagline, .hero__scroll', { opacity: 1, y: 0 });
    gsap.set('.about__text', { opacity: 1, y: 0 });
    gsap.set('.process__phase', { opacity: 1, y: 0 });
    gsap.set('.orbital__ring, .orbital__indicator', { opacity: 1, scale: 1 });
    gsap.set('.word__inner', { y: 0 });
    this.testimonialCarousel();
  },

  heroEntrance() {
    const tl = gsap.timeline({ delay: 0.2 });

    // Letters stagger in + moon appears simultaneously
    tl.to('.hero__logo-letter', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out'
    }, 0);

    tl.to('.hero__logo-moon', {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    }, 0.1);

    // Moon phases entrance — shadow sweeps to reveal real moon image
    const heroShadow = document.getElementById('heroMoonShadow');
    if (heroShadow) {
      gsap.set(heroShadow, { x: '0%' });

      // Phases run in parallel with letters
      tl.to(heroShadow, { x: '-25%', duration: 0.2, ease: 'power1.inOut' }, 0.2);
      tl.to(heroShadow, { x: '-50%', duration: 0.2, ease: 'power1.inOut' }, '>');
      tl.to(heroShadow, { x: '-75%', duration: 0.2, ease: 'power1.inOut' }, '>');
      tl.to(heroShadow, { x: '-100%', duration: 0.25, ease: 'power2.out' }, '>');
    }

    // Subtitle fades in
    tl.to('.hero__subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, 1.0);

    // Tagline fades in after letters are done
    tl.to('.hero__tagline', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, 1.3);

    // Scroll indicator
    tl.to('.hero__scroll', {
      opacity: 0.6,
      duration: 0.8,
      ease: 'power2.out'
    }, 1.4);
  },

  scrollAnimations() {
    // On desktop with OrbitalNav, panel content animations are handled by OrbitalNav
    if (window.innerWidth > 900 && typeof OrbitalNav !== 'undefined') return;

    // About section text reveal
    gsap.utils.toArray('.about__text').forEach((text, i) => {
      gsap.to(text, {
        scrollTrigger: {
          trigger: text,
          start: 'top 85%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // About highlight — handled by textSplitReveals()

    // Service items stagger
    gsap.utils.toArray('.service-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Plans foundation block
    gsap.from('.plans__foundation', {
      scrollTrigger: {
        trigger: '.plans__foundation',
        start: 'top 85%',
        once: true
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Service cards inside foundation
    gsap.utils.toArray('.plans__service-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          once: true
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.06,
        ease: 'power3.out'
      });
    });

    // Plan cards stagger
    gsap.utils.toArray('.plan-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.12,
        ease: 'power3.out'
      });
    });

    // Individual service tags
    gsap.from('.plans__individual', {
      scrollTrigger: {
        trigger: '.plans__individual',
        start: 'top 88%',
        once: true
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    // Portfolio cards
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      const direction = i % 2 === 0 ? -40 : 40;
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        },
        x: direction,
        opacity: 0,
        duration: 0.8,
        delay: (i % 2) * 0.15,
        ease: 'power3.out'
      });
    });

    // Contact section — info column
    gsap.from('.contact__info', {
      scrollTrigger: {
        trigger: '.contact__info',
        start: 'top 85%',
        once: true
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Contact section — glass form card
    gsap.from('.contact__form-wrap', {
      scrollTrigger: {
        trigger: '.contact__form-wrap',
        start: 'top 88%',
        once: true
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      delay: 0.15,
      ease: 'power3.out'
    });

    // Manifesto reveal — handled by textSplitReveals()

    // Process teaser entrance
    const processTeaser = document.querySelector('.process-teaser__inner');
    if (processTeaser) {
      gsap.to(processTeaser, {
        scrollTrigger: {
          trigger: processTeaser,
          start: 'top 85%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
      gsap.utils.toArray('.process-teaser__moon').forEach((moon, i) => {
        gsap.from(moon, {
          scrollTrigger: {
            trigger: processTeaser,
            start: 'top 85%',
            once: true
          },
          opacity: 0,
          scale: 0.6,
          duration: 0.5,
          delay: 0.3 + i * 0.1,
          ease: 'back.out(2)'
        });
      });
    }

    // Testimonials entrance
    const activeTestimonial = document.querySelector('.testimonial.active');
    if (activeTestimonial) {
      gsap.from(activeTestimonial, {
        scrollTrigger: {
          trigger: '.testimonials',
          start: 'top 80%',
          once: true
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  },

  testimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.testimonials__dot');
    if (!testimonials.length || !dots.length) return;

    let current = 0;
    let autoplayTimer = null;

    const show = (index) => {
      testimonials.forEach(t => {
        t.classList.remove('active');
        gsap.set(t, { opacity: 0, visibility: 'hidden' });
      });
      dots.forEach(d => d.classList.remove('active'));

      testimonials[index].classList.add('active');
      dots[index].classList.add('active');
      gsap.to(testimonials[index], {
        opacity: 1,
        visibility: 'visible',
        duration: 0.6,
        ease: 'power2.out'
      });
      current = index;
    };

    // Initialize first
    show(0);

    // Dot clicks
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        if (idx === current) return;
        show(idx);
        resetAutoplay();
      });
    });

    // Autoplay
    const startAutoplay = () => {
      autoplayTimer = setInterval(() => {
        show((current + 1) % testimonials.length);
      }, 5000);
    };

    const resetAutoplay = () => {
      clearInterval(autoplayTimer);
      startAutoplay();
    };

    startAutoplay();
  },

  serviceAccordion() {
    const items = document.querySelectorAll('.service-item');

    items.forEach(item => {
      const header = item.querySelector('.service-item__header');
      const content = item.querySelector('.service-item__content');
      const toggle = item.querySelector('.service-item__toggle');
      const number = item.querySelector('.service-item__number');
      const description = item.querySelector('.service-item__description');
      const tags = item.querySelectorAll('.service-item__tag');

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others — reset tags
        items.forEach(other => {
          if (other !== item && other.classList.contains('active')) {
            other.classList.remove('active');
            gsap.to(other.querySelector('.service-item__content'), {
              height: 0,
              duration: 0.4,
              ease: 'power2.inOut'
            });
            // Reset tags in closed item
            gsap.set(other.querySelectorAll('.service-item__tag'), {
              opacity: 0, y: 8
            });
          }
        });

        if (isActive) {
          item.classList.remove('active');
          gsap.to(content, {
            height: 0,
            duration: 0.4,
            ease: 'power2.inOut'
          });
          // Reset tags
          gsap.to(tags, { opacity: 0, y: 8, duration: 0.2 });
        } else {
          item.classList.add('active');
          gsap.to(content, {
            height: 'auto',
            duration: 0.5,
            ease: 'power2.inOut'
          });

          // Description slides in
          if (description) {
            gsap.fromTo(description,
              { opacity: 0, x: -15 },
              { opacity: 1, x: 0, duration: 0.5, delay: 0.15, ease: 'power3.out' }
            );
          }

          // Tags stagger in
          if (tags.length) {
            gsap.fromTo(tags,
              { opacity: 0, y: 8 },
              {
                opacity: 1, y: 0,
                duration: 0.35,
                stagger: 0.06,
                delay: 0.3,
                ease: 'power3.out'
              }
            );
          }

          // Number pulse gold with glow
          if (number) {
            gsap.fromTo(number,
              { color: '#B8A272', textShadow: '0 0 12px rgba(184,162,114,0.5)' },
              { color: '#B8A272', textShadow: '0 0 0px rgba(184,162,114,0)', duration: 1.2, ease: 'power2.out' }
            );
          }
          // Toggle bounce
          if (toggle) {
            gsap.from(toggle, { scale: 1.3, rotation: 90, duration: 0.5, ease: 'back.out(3)' });
          }
        }
      });
    });
  },

  portfolioTilt() {
    if (this.prefersReducedMotion || window.innerWidth <= 900) return;

    document.querySelectorAll('.project-card').forEach(card => {
      const bg = card.querySelector('.project-card__bg');
      const info = card.querySelector('.project-card__info');
      const shine = card.querySelector('.project-card__shine');

      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.02,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;

        // Card tilt — increased intensity
        gsap.to(card, {
          rotateY: x * 15,
          rotateX: -y * 15,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        // Image counter-parallax — moves opposite for depth
        if (bg) {
          gsap.to(bg, {
            x: -x * 20,
            y: -y * 20,
            scale: 1.08,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        // Info panel floats above
        if (info) {
          gsap.to(info, {
            x: x * 18,
            y: y * 14,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        // Shine follows cursor
        if (shine) {
          shine.style.setProperty('--shine-x', px + '%');
          shine.style.setProperty('--shine-y', py + '%');
        }

        // Dynamic shadow based on tilt direction
        const shadowX = x * -25;
        const shadowY = y * -25;
        gsap.to(card, {
          boxShadow: `${shadowX}px ${shadowY + 20}px 50px rgba(0,0,0,0.45), ${shadowX * 0.5}px ${shadowY * 0.5 + 10}px 20px rgba(0,0,0,0.3), 0 0 15px rgba(184,162,114,0.04)`,
          duration: 0.3,
          overwrite: false
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0, scale: 1,
          boxShadow: 'var(--shadow-surface-1)',
          duration: 0.7,
          ease: 'elastic.out(1, 0.5)'
        });
        if (bg) {
          gsap.to(bg, {
            x: 0, y: 0, scale: 1,
            duration: 0.6, ease: 'power3.out'
          });
        }
        if (info) {
          gsap.to(info, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
        }
      });
    });
  },

  tagRipple() {
    document.querySelectorAll('.form-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        // Create ripple
        const ripple = document.createElement('span');
        ripple.className = 'tag-ripple';
        const rect = tag.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        tag.appendChild(ripple);

        gsap.fromTo(ripple,
          { scale: 0, opacity: 0.4 },
          { scale: 4, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ripple.remove() }
        );

        // Spring bounce
        gsap.fromTo(tag, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  },

  parallaxLayers() {
    if (this.prefersReducedMotion) return;
    // Skip on desktop with OrbitalNav (content is in panels, not scrollable window)
    if (window.innerWidth > 900 && typeof OrbitalNav !== 'undefined') return;

    // Section labels float up slightly on scroll
    gsap.utils.toArray('.section-label, .about__label').forEach(label => {
      gsap.to(label, {
        scrollTrigger: {
          trigger: label,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -20,
        ease: 'none'
      });
    });

    // Portfolio cards alternate parallax
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: i % 2 === 0 ? -20 : -40,
        ease: 'none'
      });
    });
  },

  textSplitReveals() {
    // On desktop with OrbitalNav, panel content is handled by panel animations
    // Only split the text (for structure) but skip ScrollTrigger animations
    const isOrbitalNav = window.innerWidth > 900 && typeof OrbitalNav !== 'undefined';

    // Split and reveal manifesto text
    const manifesto = document.querySelector('.manifesto__text');
    if (manifesto) {
      const words = this.splitText(manifesto);
      if (!isOrbitalNav) {
        gsap.to(words, {
          scrollTrigger: { trigger: manifesto, start: 'top 80%', once: true },
          y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out'
        });
      }
    }

    // Split and reveal about highlight
    const highlight = document.querySelector('.about__highlight');
    if (highlight) {
      const words = this.splitText(highlight);
      if (!isOrbitalNav) {
        gsap.to(words, {
          scrollTrigger: { trigger: highlight, start: 'top 85%', once: true },
          y: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out'
        });
      }
    }

    // Split and reveal contact heading
    const contactHeading = document.querySelector('.contact__heading');
    if (contactHeading) {
      const words = this.splitText(contactHeading);
      if (!isOrbitalNav) {
        gsap.to(words, {
          scrollTrigger: { trigger: contactHeading, start: 'top 85%', once: true },
          y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out'
        });
      }
    }
  },

  orbitalEntrance() {
    const rings = document.querySelectorAll('.orbital__ring');
    const indicators = document.querySelectorAll('.orbital__indicator');
    if (!rings.length) return;

    const tl = gsap.timeline({ delay: 1.6 });

    // Rings fade + scale in with stagger
    rings.forEach((ring, i) => {
      tl.to(ring, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, i * 0.15);
    });

    // Indicators appear after rings
    indicators.forEach((ind, i) => {
      tl.to(ind, {
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(2)'
      }, 0.6 + i * 0.12);
    });

  },

  orbitalParallax() {
    if (this.prefersReducedMotion || window.innerWidth <= 900) return;

    const orbital = document.getElementById('orbital');
    if (!orbital) return;

    const rings = orbital.querySelectorAll('.orbital__ring');
    const indicators = orbital.querySelectorAll('.orbital__indicator');
    const shine = orbital.querySelector('.orbital__shine');
    const hero = document.getElementById('hero');

    // Depth config per ring (inner → outer)
    const depthMap = [
      { z: 40,  shift: 4  },  // ring-0
      { z: 25,  shift: 6  },  // ring-1
      { z: 10,  shift: 10 },  // ring-2
      { z: -5,  shift: 14 },  // ring-3
      { z: -20, shift: 18 },  // ring-4
      { z: -40, shift: 22 },  // ring-5
    ];

    let isInsideHero = false;

    // Show shine on hero enter
    if (hero) {
      hero.addEventListener('mouseenter', () => {
        isInsideHero = true;
        if (shine) gsap.to(shine, { opacity: 1, duration: 0.5 });
      });

      hero.addEventListener('mouseleave', () => {
        isInsideHero = false;
        // Elastic bounce back to neutral
        gsap.to(orbital, {
          rotateX: 0,
          rotateY: 0,
          duration: 1.5,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
        rings.forEach((ring) => {
          gsap.to(ring, {
            x: 0, y: 0,
            duration: 1.5,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto'
          });
        });
        indicators.forEach((ind) => {
          gsap.to(ind, {
            x: 0, y: 0,
            duration: 1.5,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto'
          });
        });
        if (shine) gsap.to(shine, { opacity: 0, duration: 0.6 });
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (!isInsideHero) return;
      // Skip parallax when orbital is in mini state
      if (typeof OrbitalNav !== 'undefined' && OrbitalNav.state !== 'hub') return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;   // -1 to 1
      const dy = (e.clientY - cy) / cy;

      // 1. Tilt the entire orbital system
      gsap.to(orbital, {
        rotateX: -dy * 12,
        rotateY: dx * 12,
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // 2. Parallax shift per ring (outer rings move more)
      rings.forEach((ring, i) => {
        const cfg = depthMap[i] || depthMap[depthMap.length - 1];
        gsap.to(ring, {
          x: dx * -cfg.shift,
          y: dy * -cfg.shift,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      // 3. Indicators float above with extra shift
      indicators.forEach((ind, i) => {
        gsap.to(ind, {
          x: dx * -(8 + i * 4),
          y: dy * -(8 + i * 4),
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      // 4. Shine follows cursor
      if (shine) {
        const px = ((e.clientX / window.innerWidth) * 100).toFixed(1);
        const py = ((e.clientY / window.innerHeight) * 100).toFixed(1);
        shine.style.setProperty('--shine-x', px + '%');
        shine.style.setProperty('--shine-y', py + '%');
      }
    });
  },

  navCharStagger() {
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      const text = link.textContent;
      link.textContent = '';
      link.setAttribute('aria-label', text);

      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'nav__char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.transition = 'transform 0.3s var(--ease-out)';
        link.appendChild(span);
      });

      link.addEventListener('mouseenter', () => {
        const chars = link.querySelectorAll('.nav__char');
        chars.forEach((c, i) => {
          gsap.to(c, {
            y: -3,
            duration: 0.25,
            delay: i * 0.03,
            ease: 'power2.out'
          });
          gsap.to(c, {
            y: 0,
            duration: 0.35,
            delay: i * 0.03 + 0.25,
            ease: 'power2.inOut'
          });
        });
      });
    });
  }
};
