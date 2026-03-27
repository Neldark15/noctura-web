/* ===================================
   NOCTURA — Main Entry Point
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll first (needs to be ready before ScrollTrigger)
  SmoothScroll.init();

  // Initialize all modules
  Loader.init();
  Navigation.init();
  CustomCursor.init();
  Animations.init();

  // Initialize interactive moon + orbital nav after preloader
  window.addEventListener('preloaderDone', () => {
    Moon.init();
    // Delay OrbitalNav init until orbital entrance completes (~3s)
    setTimeout(() => OrbitalNav.init(), 3200);
  });

  // --- Tag Selectors (services & budget) ---
  const initTagGroup = (containerId, inputId, multiSelect) => {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    if (!container || !input) return;

    container.querySelectorAll('.form-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (multiSelect) {
          tag.classList.toggle('selected');
        } else {
          container.querySelectorAll('.form-tag').forEach(t => t.classList.remove('selected'));
          tag.classList.add('selected');
        }
        // Update hidden input
        const selected = container.querySelectorAll('.form-tag.selected');
        input.value = Array.from(selected).map(t => t.dataset.value).join(', ');
      });
    });
  };

  initTagGroup('serviceTags', 'servicesInput', true);

  // --- Form Submission ---
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Future: integrate with backend or email service
      const btn = form.querySelector('.contact__submit');
      const btnText = btn.querySelector('.contact__submit-text');
      const btnIcon = btn.querySelector('.contact__submit-icon');

      btn.classList.add('success');
      btnText.textContent = 'Mensaje enviado';
      btnIcon.textContent = '✓';

      setTimeout(() => {
        btn.classList.remove('success');
        btnText.textContent = 'Enviar mensaje';
        btnIcon.innerHTML = '&rarr;';
        form.reset();
        // Reset tags
        form.querySelectorAll('.form-tag.selected').forEach(t => t.classList.remove('selected'));
        document.getElementById('servicesInput').value = '';
      }, 3000);
    });
  }
});
