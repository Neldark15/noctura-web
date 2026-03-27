/* ===================================
   Interactive Moon — Cursor Shadow & Phase Animation

   The shadow slides HORIZONTALLY across the moon like
   a real lunar terminator line. Cursor X position relative
   to the moon determines the phase:
   - Cursor far left  → shadow covers right side (waning crescent)
   - Cursor centered   → full moon (shadow hidden)
   - Cursor far right  → shadow covers left side (waxing crescent)
   =================================== */

const Moon = {
  heroWrap: null,
  heroShadow: null,
  navShadow: null,
  isTouch: false,
  trackingActive: false,

  init() {
    this.heroWrap = document.getElementById('heroMoonWrap');
    this.heroShadow = document.getElementById('heroMoonShadow');
    this.navShadow = document.getElementById('navMoonShadow');
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Set shadow to "full moon" (off-screen left)
    if (this.heroShadow) {
      gsap.set(this.heroShadow, { x: '-100%' });
    }
    if (this.navShadow) {
      gsap.set(this.navShadow, { x: '-100%' });
    }

    // Delay tracking so entrance animation finishes
    setTimeout(() => {
      this.trackingActive = true;
      this.bindCursorTracking();
    }, 1500);
  },

  bindCursorTracking() {
    if (this.isTouch) return;

    window.addEventListener('mousemove', (e) => {
      if (!this.heroWrap || !this.heroShadow || !this.trackingActive) return;

      const rect = this.heroWrap.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Only use horizontal distance for phase calculation
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Proximity factor: 1 = on the moon, 0 = far away
      const maxRange = 600;
      const proximity = 1 - Math.min(distance / maxRange, 1);

      // When cursor is very close to the moon: full moon (shadow hidden)
      // When cursor is far: shadow slides in from the opposite side of cursor

      // Determine which side the shadow comes from (opposite of cursor)
      // dx > 0 = cursor is right → light from right → shadow on left → translateX negative (already left)
      // dx < 0 = cursor is left → light from left → shadow on right → translateX positive

      // Shadow position: -100% = hidden left, 0% = covers moon, +100% = hidden right
      // "Full moon" = shadow at -100% or +100% (hidden on either side)

      if (proximity > 0.85) {
        // Very close to moon: full moon
        gsap.to(this.heroShadow, {
          x: dx > 0 ? '-100%' : '100%',
          duration: 1.8,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        // Shadow slides in from opposite side of cursor
        // The further the cursor, the more the shadow covers
        const coverage = (1 - proximity) * 0.75; // 0 to 0.75 (subtler max)
        let shadowX;

        if (dx >= 0) {
          // Cursor is right → light from right → shadow enters from left
          shadowX = -100 + (coverage * 100);
        } else {
          // Cursor is left → light from left → shadow enters from right
          shadowX = 100 - (coverage * 100);
        }

        gsap.to(this.heroShadow, {
          x: shadowX + '%',
          duration: 1.8,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }

      // Nav moon follows same logic but subtler
      if (this.navShadow) {
        const navDx = e.clientX - window.innerWidth / 2;
        const navCoverage = Math.min(Math.abs(navDx) / 800, 0.5);
        const navShadowX = navDx >= 0
          ? -100 + (navCoverage * 100)
          : 100 - (navCoverage * 100);

        gsap.to(this.navShadow, {
          x: navShadowX + '%',
          duration: 1.8,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  },

  // Moon phases animation for preloader
  animatePhases(callback) {
    const shadow = document.getElementById('preloaderShadow');
    const moonImg = document.getElementById('preloaderMoonImg');
    const label = document.querySelector('.preloader__phase-label');

    if (!shadow || !moonImg) {
      if (callback) callback();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
      }
    });

    // Fade in moon image
    tl.to(moonImg, { opacity: 1, duration: 0.4, ease: 'power2.out' });

    // Fade in label
    tl.to(label, { opacity: 0.6, duration: 0.3, ease: 'power2.out' }, 0.2);

    // Phase animation: shadow slides right to left to reveal moon
    // Starts at 0% (covering), ends at -100% (hidden = full moon)
    tl.to(shadow, { x: '-25%', duration: 0.3, ease: 'power1.inOut' }, 0.5);
    tl.to(shadow, { x: '-50%', duration: 0.3, ease: 'power1.inOut' }, '>');
    tl.to(shadow, { x: '-75%', duration: 0.3, ease: 'power1.inOut' }, '>');
    tl.to(shadow, { x: '-100%', duration: 0.35, ease: 'power2.out' }, '>');

    // Hold on full moon
    tl.to({}, { duration: 0.3 });
  }
};
