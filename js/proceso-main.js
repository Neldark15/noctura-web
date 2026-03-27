/* ===================================
   Proceso Page — Entry Point
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize shared modules
  SmoothScroll.init();
  Navigation.init();
  CustomCursor.init();

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // === Simplified Preloader ===
  const preloader = document.getElementById('procesoPreloader');
  const preloaderText = preloader ? preloader.querySelector('.proceso-preloader__text') : null;

  if (preloader && preloaderText) {
    // Fade in text
    gsap.to(preloaderText, {
      opacity: 1,
      duration: 0.6,
      delay: 0.2,
      ease: 'power2.out'
    });

    // Fade out preloader
    gsap.to(preloader, {
      opacity: 0,
      duration: 0.6,
      delay: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        preloader.style.display = 'none';
        document.body.classList.remove('loading');
        window.dispatchEvent(new Event('preloaderDone'));
        startPage();
      }
    });
  } else {
    document.body.classList.remove('loading');
    startPage();
  }

  function startPage() {
    // Initialize 3D scene
    NeuralScene.init();

    // Hero text entrance
    heroEntrance();

    // Neural scene entrance
    if (NeuralScene.isWebGL) {
      NeuralScene.entrance();
    }

    // Setup scroll-triggered phase activation
    setupScrollPhases();

    // Setup phase dot navigation
    setupPhaseDots();

    // Journey section animations
    journeyAnimations();

    // Apply magnetic to page elements
    if (typeof CustomCursor !== 'undefined' && CustomCursor.applyMagnetic) {
      document.querySelectorAll('.phase-dot').forEach(dot => {
        CustomCursor.applyMagnetic(dot, 0.3);
      });
    }

    // Recalculate ScrollTrigger
    setTimeout(() => ScrollTrigger.refresh(), 200);
  }

  function heroEntrance() {
    const title = document.querySelector('.proceso-hero__title');
    const subtitle = document.querySelector('.proceso-hero__subtitle');

    if (title) {
      gsap.to(title, {
        opacity: 1, y: 0,
        duration: 0.8, delay: 0.3,
        ease: 'power3.out'
      });
    }

    if (subtitle) {
      gsap.to(subtitle, {
        opacity: 1, y: 0,
        duration: 0.6, delay: 0.6,
        ease: 'power3.out'
      });
    }
  }

  function setupScrollPhases() {
    const sceneEl = document.getElementById('procesoScene');
    if (!sceneEl || window.innerWidth <= 900) return;

    ScrollTrigger.create({
      trigger: sceneEl,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const phase = Math.min(Math.floor(progress * 4), 3);
        if (phase !== NeuralScene.activeNode && phase >= 0) {
          NeuralScene.activateNode(phase);
        }
      }
    });
  }

  function setupPhaseDots() {
    document.querySelectorAll('.phase-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const phase = parseInt(dot.dataset.phase);
        NeuralScene.activateNode(phase);
      });
    });
  }

  function journeyAnimations() {
    gsap.utils.toArray('.journey-phase').forEach((phase, i) => {
      gsap.to(phase, {
        scrollTrigger: {
          trigger: phase,
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
  }
});
