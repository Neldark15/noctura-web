/* ===================================
   Preloader
   =================================== */

const Loader = {
  preloader: null,

  init() {
    this.preloader = document.getElementById('preloader');

    // Run moon phases animation, then hide
    Moon.animatePhases(() => this.hide());

    // Safety timeout
    setTimeout(() => {
      if (this.preloader && this.preloader.style.display !== 'none') {
        this.hide();
      }
    }, 5000);
  },

  hide() {
    if (!this.preloader || this.preloader.style.display === 'none') return;

    gsap.to(this.preloader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        this.preloader.style.display = 'none';
        document.body.classList.remove('loading');
        window.dispatchEvent(new CustomEvent('preloaderDone'));
      }
    });
  }
};
