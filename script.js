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

// Map section IDs → which nav href should be active
const sectionToHref = {
  hero:         null,
  about:        '#about',
  services:     '#services',
  'gas-system': '#services',
  'why-us':     '#services',
  process:      '#process',
  industries:   '#industries',
  showcase:     'services.html',
  testimonials: null,
  faq:          '#faq',
  contact:      '#contact',
};

function updateActiveLink() {
  const mid = window.scrollY + window.innerHeight * 0.38;
  let cur = '';
  allSections.forEach(sec => { if (sec.offsetTop <= mid) cur = sec.id; });

  const activeHref = sectionToHref[cur] || (cur ? `#${cur}` : null);

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('nav-link-active', !!activeHref && href === activeHref);
    // Clear old inline style if any
    link.style.color = '';
  });

  document.querySelectorAll('.mob-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('mob-link-active', !!activeHref && href === activeHref);
  });
}

let activeLinkTimeout;
window.addEventListener('scroll', () => {
  updateNavbar();
  if (!activeLinkTimeout) {
    activeLinkTimeout = setTimeout(() => {
      updateActiveLink();
      activeLinkTimeout = null;
    }, 120);
  }
}, { passive: true });
updateNavbar();
updateActiveLink();


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

  // Re-trigger CSS fade-in animation for the new slide's content on mobile
  if (window.innerWidth < 769) {
    const content = heroSlides[heroIndex].querySelector('.slide-content');
    if (content) {
      content.style.animation = 'none';
      // Force reflow to restart animation
      void content.offsetWidth;
      content.style.animation = '';
    }
  }
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


/* ── 9. UNIVERSAL SERVICE & PRODUCT CARD POPUP SYSTEM ──────── */
const PhoenixPopupSystem = {
  overlay: null,
  modal: null,
  activeCard: null,

  config: {
    get phoneNumber() { return (window.PHOENIX_CONFIG && window.PHOENIX_CONFIG.phone) || '+919423239466'; },
    get whatsappNumber() { return (window.PHOENIX_CONFIG && window.PHOENIX_CONFIG.whatsapp) || '919423239466'; },
    get email() { return (window.PHOENIX_CONFIG && window.PHOENIX_CONFIG.email) || 'phoenixtechnical.solution4411@gmail.com'; },
  },

  init() {
    // 1. Create and inject modal markup if not already present
    if (!document.getElementById('universal-card-popup')) {
      const overlayMarkup = `
        <div id="universal-card-popup" class="popup-overlay" aria-hidden="true" role="dialog">
          <div class="popup-modal">
            <button class="popup-close" id="popup-close-btn" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="popup-left">
              <img src="" alt="" id="popup-img" class="popup-img" />
              <div class="popup-img-overlay"></div>
            </div>
            <div class="popup-right">
              <div>
                <h3 id="popup-title" class="popup-title"></h3>
                <p id="popup-desc" class="popup-desc"></p>
                <h4 class="popup-features-title">Core Specifications & Features</h4>
                <ul id="popup-features-list" class="popup-features-list"></ul>
                <div class="popup-meta-box">
                  <div class="popup-meta-title">Support Level</div>
                  <div id="popup-support-val" class="popup-meta-value"></div>
                  <div class="popup-meta-title mt-2">Availability / Pricing</div>
                  <div id="popup-pricing-val" class="popup-meta-value"></div>
                </div>
              </div>
              <div class="popup-actions">
                <button id="popup-btn-enquire" class="popup-btn-enquire">Enquire Now</button>
                <a id="popup-btn-call" href="tel:+919423239466" class="popup-btn-call">Call Now</a>
                <a id="popup-btn-wa" href="" target="_blank" class="popup-btn-wa">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.488 1.977 14.03 1.953 11.4 1.951c-5.437 0-9.861 4.371-9.865 9.8a9.736 9.736 0 0 0 1.528 5.158l-.999 3.649 3.75-.983c1.547.886 3.197 1.348 4.792 1.348zm8.795-6.52c-.287-.143-1.696-.828-1.958-.922-.262-.095-.452-.143-.642.143-.19.287-.736.923-.902 1.114-.167.19-.333.215-.62.072-.287-.143-1.21-.447-2.306-1.425-.853-.761-1.428-1.701-1.595-1.988-.167-.287-.018-.442.126-.583.129-.127.287-.333.43-.5.143-.167.19-.287.286-.477.095-.19.048-.358-.024-.5-.071-.143-.642-1.528-.88-2.099-.23-.553-.465-.477-.642-.486-.165-.008-.356-.01-.547-.01s-.5.071-.762.357c-.262.287-1 1.002-1 2.443 0 1.442 1.049 2.836 1.192 3.028.143.19 2.062 3.111 4.996 4.385.698.303 1.243.484 1.668.618.701.222 1.34.191 1.845.116.563-.084 1.696-.683 1.934-1.344.238-.661.238-1.229.167-1.344-.072-.116-.262-.165-.549-.308z"/>
                  </svg>
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', overlayMarkup);
    }

    this.overlay = document.getElementById('universal-card-popup');
    this.modal   = this.overlay.querySelector('.popup-modal');

    // 2. Bind static events
    const closeBtn = document.getElementById('popup-close-btn');
    closeBtn.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.close();
      }
    });

    // 3. Bind card trigger click (via event delegation)
    document.body.addEventListener('click', e => {
      const card = e.target.closest('.interactive-card');
      if (card) {
        e.preventDefault();
        this.open(card);
      }
    });

    // 4. Bind dynamic enquire CTA action
    const enquireBtn = document.getElementById('popup-btn-enquire');
    enquireBtn.addEventListener('click', () => this.handleEnquiry());
  },

  open(card) {
    this.activeCard = card;

    // Pull data attributes
    const title       = card.getAttribute('data-title') || '';
    const description = card.getAttribute('data-description') || '';
    const image       = card.getAttribute('data-image') || '';
    const featuresStr = card.getAttribute('data-features') || '';
    const support     = card.getAttribute('data-support') || 'Standard Technical Support';
    const pricing     = card.getAttribute('data-pricing') || 'Available on Request';

    // Update popup contents
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-desc').textContent  = description;
    
    const imgEl = document.getElementById('popup-img');
    imgEl.src = image;
    imgEl.alt = title;

    // Populate features list
    const listEl = document.getElementById('popup-features-list');
    listEl.innerHTML = '';
    
    if (featuresStr) {
      const features = featuresStr.split(';');
      features.forEach(feat => {
        if (feat.trim()) {
          const li = document.createElement('li');
          li.textContent = feat.trim();
          listEl.appendChild(li);
        }
      });
    }

    // Populate support & pricing values
    document.getElementById('popup-support-val').textContent = support;
    document.getElementById('popup-pricing-val').textContent = pricing;

    // Update CTA link targets
    document.getElementById('popup-btn-call').href = `tel:${this.config.phoneNumber}`;
    
    const waText = encodeURIComponent(`Hello Phoenix Technical Solution, I am interested in learning more about your "${title}". Please share specs and pricing details.`);
    document.getElementById('popup-btn-wa').href = `https://wa.me/${this.config.whatsappNumber}?text=${waText}`;

    // Math: set transform origin to the clicked card center
    const rect = card.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    this.modal.style.transformOrigin = `${x}px ${y}px`;

    // Show overlay with zoom animation
    this.overlay.classList.add('active');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent scroll

    // Focus state (a11y)
    setTimeout(() => {
      document.getElementById('popup-close-btn').focus();
    }, 50);
  },

  close() {
    this.overlay.classList.remove('active');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // unlock scroll

    // Restore focus to active card trigger (a11y)
    if (this.activeCard) {
      this.activeCard.focus();
    }
  },

  handleEnquiry() {
    if (!this.activeCard) return;

    const title    = this.activeCard.getAttribute('data-title') || '';
    const category = this.activeCard.getAttribute('data-category') || 'Other';

    // 1. Close Modal
    this.close();

    // 2. Scroll to contact form
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      const navbarEl = document.getElementById('navbar');
      const offset = contactSec.getBoundingClientRect().top + window.scrollY - (navbarEl?.offsetHeight || 64);
      
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });

      // 3. Select corresponding subject option
      const serviceSelect = document.querySelector('#industrial-contact-form [name="service"]');
      if (serviceSelect) {
        let optionFound = false;
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].value === category) {
            serviceSelect.selectedIndex = i;
            optionFound = true;
            break;
          }
        }
        if (!optionFound && serviceSelect.options.length) {
          serviceSelect.selectedIndex = 0;
        }
      }

      const messageTextarea = document.querySelector('#industrial-contact-form [name="message"]');
      if (messageTextarea) {
        messageTextarea.value = `Hi Phoenix Technical Solution, I would like to enquire about your "${title}". Please share technical specifications and pricing details.`;
        
        // Auto-expand textarea if necessary
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = messageTextarea.scrollHeight + 'px';
        
        setTimeout(() => {
          messageTextarea.focus();
          // Move cursor to end of text
          const len = messageTextarea.value.length;
          messageTextarea.setSelectionRange(len, len);
        }, 800); // Wait for smooth scroll to finish
      }
    }
  }
};

// Initialize Popup System on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  PhoenixPopupSystem.init();
});
