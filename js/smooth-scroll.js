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

    this.lenis = new Lenis({
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.8
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
