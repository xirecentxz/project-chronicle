// ── THEME ───────────────────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('chronicle-theme') || 'dark';
setTheme(savedTheme);

function setTheme(t) {
  root.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('chronicle-theme', t);
}
themeToggle.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ── CLOCK ───────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('live-time').textContent =
    now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  document.getElementById('live-date').textContent =
    `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// ── COUNTER ANIMATION ───────────────────────────────────────────────────
function animateCounter(el, target, duration = 1000) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── CARD BUILDER ────────────────────────────────────────────────────────
function techClass(t) {
  return 'tech-' + t.toLowerCase().replace(/[^a-z]/g,'');
}

function buildCard(p) {
  const techBadges = p.tech.map(t => `
    <span class="tech-badge ${techClass(t)}" tabindex="0" aria-label="${t}: ${techDesc[t] || t}">
      ${t}
      <span class="tech-tooltip" role="tooltip">${techDesc[t] || t}</span>
    </span>`).join('');

  // Ganti URL demo dengan relative path (sesuaikan jika perlu base URL)
  const demoBase = p.demoUrl || '#';
  const githubUrl = p.githubUrl || '#';

  const links = `
    ${p.demoUrl ? `<a href="${demoBase}" class="card-link" target="_blank" rel="noopener noreferrer" title="Live Demo" aria-label="Live demo: ${p.name}">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    </a>` : ''}
    ${p.githubUrl && p.githubUrl !== '#' ? `<a href="${githubUrl}" class="card-link" target="_blank" rel="noopener noreferrer" title="Source Code" aria-label="Source code: ${p.name}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
    </a>` : ''}`;

  const d = new Date(p.date);
  const dateStr = d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });

  return `
    <article class="project-card" data-category="${p.category}" data-name="${p.name.toLowerCase()}" data-tech="${p.tech.join(' ').toLowerCase()}" data-date="${p.date}">
      <div class="card-top">
        <h3 class="project-name">${p.name}</h3>
        <div class="card-links">${links}</div>
      </div>
      <p class="project-desc">${p.description}</p>
      <div class="tech-list" aria-label="Teknologi yang digunakan">${techBadges}</div>
      <div class="card-date">📅 ${dateStr}</div>
    </article>`;
}

// ── RENDER ──────────────────────────────────────────────────────────────
const categories = ['original','games','tracing','webapps','tutorial'];
let currentFilter = 'all';
let currentSort = 'newest';
let currentSearch = '';

function getSorted(arr) {
  const copy = [...arr];
  if (currentSort === 'newest') return copy.sort((a,b) => b.date.localeCompare(a.date));
  if (currentSort === 'az') return copy.sort((a,b) => a.name.localeCompare(b.name));
  if (currentSort === 'za') return copy.sort((a,b) => b.name.localeCompare(a.name));
  return copy;
}

function render() {
  const q = currentSearch.toLowerCase();
  const filtered = getSorted(projects).filter(p => {
    const matchCat = currentFilter === 'all' || p.category === currentFilter;
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.tech.join(' ').toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  let shown = 0;
  categories.forEach(cat => {
    const grid = document.getElementById('grid-' + cat);
    const section = grid.closest('.category-section');
    const catItems = filtered.filter(p => p.category === cat);
    grid.innerHTML = catItems.map(buildCard).join('');
    document.getElementById('cnt-' + cat).textContent = catItems.length;
    section.setAttribute('data-hidden', catItems.length === 0 ? 'true' : 'false');
    shown += catItems.length;
  });

  document.getElementById('count-shown').textContent = shown;
  document.getElementById('count-total').textContent = projects.length;

  // Tampilkan pesan jika tidak ada hasil
  const allGrids = document.querySelectorAll('.project-grid');
  if (shown === 0) {
    const firstGrid = document.getElementById('grid-original');
    firstGrid.innerHTML = `<div class="no-results show" role="status"><span style="font-size:32px">🔍</span><p>Tidak ada proyek yang cocok dengan pencarian "<strong>${currentSearch}</strong>"</p></div>`;
    document.querySelector('[data-category="original"]').setAttribute('data-hidden','false');
  }
}

// Inisialisasi tampilan
render();
const total = projects.length;
animateCounter(document.getElementById('counter-total'), total);
document.getElementById('project-badge').textContent = `🎯 ${total}+ Projects`;
document.getElementById('footer-total').textContent = total;

// ── SEARCH ──────────────────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', function() {
  currentSearch = this.value.trim();
  render();
});

// ── FILTER ──────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ── SORT ────────────────────────────────────────────────────────────────
document.getElementById('sort-select').addEventListener('change', function() {
  currentSort = this.value;
  render();
});

// ── BACK TO TOP ─────────────────────────────────────────────────────────
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  btt.classList.toggle('show', window.scrollY > 300);
});
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── STAGGER ANIMATION ─────────────────────────────────────────────────
function applyStagger() {
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.animationDelay = (i % 8) * 0.05 + 's';
  });
}
const observer = new MutationObserver(applyStagger);
document.querySelectorAll('.project-grid').forEach(g => observer.observe(g, { childList: true }));
applyStagger();
