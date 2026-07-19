document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Contact form
  // TODO (eier): Når skjemaet er koblet til Formspree (eller lignende), fjern
  // denne "fake submit"-logikken og la skjemaet poste direkte til tjenesten.
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      status.textContent = 'Takk for din melding! Vi tar kontakt så snart som mulig.';
      form.reset();
    });
  }
});
