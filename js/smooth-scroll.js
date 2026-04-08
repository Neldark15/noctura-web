/* ===================================
   Smooth Scroll — Lenis Integration
   =================================== */

const SmoothScroll = {
  lenis: null,

  init() {
    // Disable on mobile or reduced motion
    const isMobile = window.innerWidth <= 600;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReduced) return;

    if (typeof Lenis === 'undefined') return;

    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.lenis = new Lenis({
      duration: isSafari ? 0.8 : 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: isSafari ? 1.0 : 1.5,
      touchMultiplier: isSafari ? 1.2 : 1.5,
      syncTouch: false
    });

    // Expose globally for navigation.js
    window.lenis = this.lenis;

    // Connect Lenis to GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  },

  pause() {
    if (this.lenis) this.lenis.stop();
  },

  resume() {
    if (this.lenis) this.lenis.start();
  }
};
