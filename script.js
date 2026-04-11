/**
 * Phoenix Technical Solution — script.js  v3
 * Navbar · Mobile menu · Hero slider · Smooth scroll
 * Reveal animations · FAQ accordion · Testimonial slider
 * Contact form · Mobile carousel hints · Touch enhancements
 */

/* ── 1. NAVBAR ──────────────────────────────────────────────── */
const navbar      = document.getElementById('navbar');
const allNavLinks = document.querySelectorAll('.nav-link');
const allSections = document.querySelectorAll('section[id]');

function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 64);
}
function updateActiveLink() {
  const mid = window.scrollY + window.innerHeight * 0.35;
  let cur = '';
  allSections.forEach(sec => { if (sec.offsetTop <= mid) cur = sec.id; });
  allNavLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${cur}` ? '#6d1fa0' : '';
  });
}
window.addEventListener('scroll', () => { updateNavbar(); updateActiveLink(); }, { passive: true });
updateNavbar();


/* ── 2. MOBILE MENU ─────────────────────────────────────────── */
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu   = document.getElementById('mobile-menu');

hamburgerBtn.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden', open);
  hamburgerBtn.classList.toggle('open', !open);
  hamburgerBtn.setAttribute('aria-expanded', String(!open));
  // Prevent body scroll when menu is open on mobile
  document.body.style.overflow = open ? '' : 'hidden';
});

// Close menu on any mobile link click
document.querySelectorAll('.mob-link, #mobile-menu a').forEach(el => {
  el.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside tap (mobile)
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ── 3. SMOOTH SCROLL ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - (navbar?.offsetHeight || 64);
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});


/* ── 4. HERO IMAGE SLIDER ───────────────────────────────────── */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots   = document.querySelectorAll('.hero-dot');
let heroIndex    = 0;
let heroTimer;

function goHeroSlide(idx) {
  heroSlides[heroIndex].classList.remove('active');
  heroDots[heroIndex].classList.remove('active');
  heroIndex = (idx + heroSlides.length) % heroSlides.length;
  heroSlides[heroIndex].classList.add('active');
  heroDots[heroIndex].classList.add('active');
}

function startHeroAuto() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goHeroSlide(heroIndex + 1), 5000);
}

document.getElementById('slider-prev')
  ?.addEventListener('click', () => { goHeroSlide(heroIndex - 1); startHeroAuto(); });
document.getElementById('slider-next')
  ?.addEventListener('click', () => { goHeroSlide(heroIndex + 1); startHeroAuto(); });
heroDots.forEach((dot, i) => dot.addEventListener('click', () => { goHeroSlide(i); startHeroAuto(); }));

// Pause on hover (desktop)
const heroSliderEl = document.getElementById('hero-slider');
heroSliderEl?.addEventListener('mouseenter', () => clearInterval(heroTimer));
heroSliderEl?.addEventListener('mouseleave', () => startHeroAuto());

// Touch / swipe support
let touchStartX = 0, touchStartY = 0;
heroSliderEl?.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
heroSliderEl?.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
  // Only treat as horizontal swipe if horizontal dominates
  if (Math.abs(dx) > 45 && Math.abs(dx) > dy) {
    goHeroSlide(dx > 0 ? heroIndex + 1 : heroIndex - 1);
    startHeroAuto();
  }
}, { passive: true });

startHeroAuto();


/* ── 5. REVEAL ANIMATIONS ───────────────────────────────────── */
// Reduce threshold on mobile — trigger earlier
const isMobile = () => window.innerWidth < 769;

const revealIO = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealIO.unobserve(e.target); }
  }),
  { threshold: isMobile() ? 0.05 : 0.10, rootMargin: isMobile() ? '0px 0px -16px 0px' : '0px 0px -36px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));


/* ── 6. FAQ ACCORDION ───────────────────────────────────────── */
document.querySelectorAll('[data-faq]').forEach(item => {
  const btn = item.querySelector('.faq-question');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('[data-faq].open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});


/* ── 7. TESTIMONIAL SLIDER ──────────────────────────────────── */
const testiTrack  = document.getElementById('testimonial-track');
const testiDots   = document.querySelectorAll('.testi-dot');
const testiSlides = document.querySelectorAll('.testimonial-slide');
let testiIdx = 0, testiTimer;

function goTestiSlide(idx) {
  testiIdx = (idx + testiSlides.length) % testiSlides.length;
  testiTrack.style.transform = `translateX(-${testiIdx * 100}%)`;
  testiDots.forEach((d, i) => d.classList.toggle('active', i === testiIdx));
}
function startTestiAuto() {
  clearInterval(testiTimer);
  testiTimer = setInterval(() => goTestiSlide(testiIdx + 1), 5500);
}

document.getElementById('testi-prev')?.addEventListener('click', () => { goTestiSlide(testiIdx - 1); startTestiAuto(); });
document.getElementById('testi-next')?.addEventListener('click', () => { goTestiSlide(testiIdx + 1); startTestiAuto(); });
testiDots.forEach((dot, i) => dot.addEventListener('click', () => { goTestiSlide(i); startTestiAuto(); }));

// Touch swipe for testimonial slider on mobile
let tTouchX = 0;
testiTrack?.addEventListener('touchstart', e => { tTouchX = e.touches[0].clientX; }, { passive: true });
testiTrack?.addEventListener('touchend', e => {
  const dx = tTouchX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 45) { goTestiSlide(dx > 0 ? testiIdx + 1 : testiIdx - 1); startTestiAuto(); }
}, { passive: true });

startTestiAuto();


/* ── 8. MOBILE — Carousel Swipe Hints ──────────────────────── */
/**
 * On mobile, inject a subtle "← swipe →" hint below horizontal carousels.
 * Hints are dismissed after the first scroll interaction on that carousel.
 */
function addCarouselHints() {
  if (!isMobile()) return;

  const carouselGrids = document.querySelectorAll(
    '#services .grid, #process .grid, #industries .grid, ' +
    '#showcase .grid.grid-cols-1.md\\:grid-cols-3, ' +
    '#showcase .grid.grid-cols-2.md\\:grid-cols-4, ' +
    '#showcase .grid.grid-cols-1.sm\\:grid-cols-3'
  );

  carouselGrids.forEach(grid => {
    const hint = document.createElement('div');
    hint.className = 'carousel-hint';
    hint.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 8h10M3 8l3-3M3 8l3 3"/>
      </svg>
      <span>Swipe to explore</span>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M13 8H3M13 8l-3-3M13 8l-3 3"/>
      </svg>
    `;
    grid.after(hint);

    // Hide hint after first scroll on this grid
    grid.addEventListener('scroll', () => {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity .4s';
      setTimeout(() => hint.remove(), 400);
    }, { once: true, passive: true });
  });
}

// Run after DOM settles
window.addEventListener('load', addCarouselHints);


/* ── 9. CONTACT FORM ────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('form-submit-btn');
const btnLabel    = document.getElementById('btn-label');
const btnIcon     = document.getElementById('btn-icon');
const btnSpin     = document.getElementById('btn-spin');
const formMsg     = document.getElementById('form-msg');

function setLoading(on) {
  submitBtn.disabled = on;
  btnLabel.textContent = on ? 'Sending…' : 'Request Consultation';
  btnIcon?.classList.toggle('hidden', on);
  btnSpin?.classList.toggle('hidden', !on);
}

function showMsg(type, text) {
  formMsg.className = 'mt-4 p-4 rounded-xl text-sm text-center font-medium border';
  formMsg.classList.add(
    type === 'success'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200'
  );
  formMsg.textContent = text;
  formMsg.classList.remove('hidden');
  formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validate() {
  const name  = document.getElementById('cf-name');
  const email = document.getElementById('cf-email');
  const msg   = document.getElementById('cf-message');
  [name, email, msg].forEach(el => el.classList.remove('err'));
  const errs = [];
  if (!name.value.trim() || name.value.trim().length < 2) { name.classList.add('err'); errs.push('name'); }
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('err'); errs.push('email'); }
  if (!msg.value.trim() || msg.value.trim().length < 10) { msg.classList.add('err'); errs.push('message'); }
  return errs;
}

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    formMsg.classList.add('hidden');
    const errors = validate();
    if (errors.length) { showMsg('error', 'Please fill in all required fields correctly.'); return; }
    setLoading(true);
    try {
      // Replace with your actual API endpoint (Google Apps Script, Formspree, etc.)
      await new Promise(res => setTimeout(res, 2000));
      showMsg('success', '✓ Thank you! Your inquiry has been received. Mr. Shinde will contact you within 24 hours.');
      contactForm.reset();
    } catch {
      showMsg('error', 'Something went wrong. Please call us directly: 94232 39466');
    } finally {
      setLoading(false);
    }
  });
  contactForm.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('err'));
  });
}
