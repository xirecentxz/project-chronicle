// ===== PAGE LOADER =====
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 1400);
});

// ===== LIVE DATE =====
(function setLiveDate() {
  const el = document.getElementById('live-date');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('id-ID', opts);
})();

// ===== DARK MODE =====
(function initDarkMode() {
  const toggle = document.getElementById('darkToggle');
  const html = document.documentElement;
  const icon = toggle.querySelector('.dark-toggle__icon');

  // Load saved pref
  const saved = localStorage.getItem('jrTheme') || 'light';
  html.setAttribute('data-theme', saved);
  icon.textContent = saved === 'dark' ? '☀️' : '🌙';

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('jrTheme', next);
    icon.textContent = next === 'dark' ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
})();

// ===== SEARCH BAR TOGGLE =====
(function initSearch() {
  const toggleBtn = document.getElementById('searchToggle');
  const closeBtn = document.getElementById('closeSearch');
  const bar = document.getElementById('searchBar');
  const input = document.getElementById('searchInput');

  function openSearch() {
    bar.hidden = false;
    input.focus();
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeSearch() {
    bar.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    bar.hidden ? openSearch() : closeSearch();
  });

  closeBtn.addEventListener('click', closeSearch);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bar.hidden) closeSearch();
  });

  // Prevent empty search submit
  bar.querySelector('.search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      console.log('Search:', query);
      // Would redirect to search results page
    }
  });
})();

// ===== HAMBURGER MENU =====
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('navLinks');

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    nav.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Handle dropdown on mobile
  nav.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = link.closest('.has-dropdown');
        parent.classList.toggle('open');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.main-nav')) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('open'));
    }
  });
})();

// ===== CATEGORY PILL TOGGLE =====
document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// ===== HERO SLIDER =====
(function initSlider() {
  const track = document.getElementById('sliderTrack');
  const slides = track.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');

  if (!slides.length) return;

  let current = 0;
  let autoInterval;
  const total = slides.length;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider-dot');

  function updateSlider() {
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    updateSlider();
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    autoInterval = setInterval(next, 5000);
  }

  function resetAuto() {
    clearInterval(autoInterval);
    startAuto();
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  });

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', startAuto);

  // Init
  updateSlider();
  startAuto();
})();

// ===== SCROLL REVEAL =====
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');

  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(item => observer.observe(item));
})();

// ===== BACK TO TOP =====
(function initBackToTop() {
  const btn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 400;
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ===== STICKY HEADER SHADOW =====
(function initStickyHeader() {
  const nav = document.querySelector('.main-nav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(0,0,0,.15)'
      : '0 1px 3px rgba(0,0,0,.08)';
  }, { passive: true });
})();

// ===== NEWSLETTER FORM VALIDATION =====
(function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailInput = document.getElementById('emailInput');
  const emailError = document.getElementById('emailError');

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  // Real-time validation
  emailInput.addEventListener('input', () => {
    const valid = validateEmail(emailInput.value);
    emailInput.classList.toggle('error', !valid && emailInput.value.length > 0);
    emailError.hidden = valid || emailInput.value.length === 0;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = emailInput.value.trim();

    if (!val) {
      emailError.textContent = 'Email tidak boleh kosong.';
      emailError.hidden = false;
      emailInput.classList.add('error');
      emailInput.focus();
      return;
    }

    if (!validateEmail(val)) {
      emailError.textContent = 'Masukkan alamat email yang valid.';
      emailError.hidden = false;
      emailInput.classList.add('error');
      emailInput.focus();
      return;
    }

    // Success state
    emailInput.classList.remove('error');
    emailError.hidden = true;
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Berhasil Daftar!';
    btn.style.background = 'rgba(255,255,255,1)';
    btn.style.color = '#16a34a';
    btn.disabled = true;
    emailInput.disabled = true;
    emailInput.value = '';
    emailInput.placeholder = 'Kamu sudah terdaftar!';

    // Reset after 4s
    setTimeout(() => {
      btn.textContent = 'Daftar Sekarang';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      emailInput.disabled = false;
      emailInput.placeholder = 'Masukkan email kamu';
    }, 4000);
  });
})();
