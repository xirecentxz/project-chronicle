// ── THEME ────────────────────────────────────────────────────────────
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

// ── CLOCK ────────────────────────────────────────────────────────────
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

  // Normalize demo URL so links point to the projects/ folder.
  // - Preserve absolute URLs (http/https)
  // - Convert leading-root paths like "/janken-game/" into "./projects/janken-game/"
  let demoBase = '#';
  if (p.demoUrl) {
    const url = String(p.demoUrl);
    if (/^https?:\/\//i.test(url)) {
      demoBase = url;
    } else {
      // remove leading/trailing slashes
      let clean = url.replace(/^\/+|\/+$/g, '');
      if (clean !== '') {
        if (!clean.startsWith('projects/')) clean = 'projects/' + clean;
        demoBase = './' + clean + '/';
      }
    }
  }
  const githubUrl = p.githubUrl || '#';

  const links = `
    ${p.demoUrl ? `<a href="${demoBase}" class="card-link" target="_blank" rel="noopener noreferrer" title="Live Demo" aria-label="Live demo: ${p.name}">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 [...]"></path></svg>
    </a>` : ''}
    ${p.githubUrl && p.githubUrl !== '#' ? `<a href="${githubUrl}" class="card-link" target="_blank" rel="noopener noreferrer" title="Source Code" aria-label="Source code: ${p.name}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.57[...]"></path></svg>
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

// ── RENDER ───────────────────────────────────────────────────────────
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

// ── SEARCH ───────────────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', function() {
  currentSearch = this.value.trim();
  render();
});

// ── FILTER ───────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ── SORT ────────────────────────────────────────────────────────────
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
