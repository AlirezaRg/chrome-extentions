// ── Floating particles ──────────────────────────────────────
const particlesEl = document.getElementById('particles');
function spawnParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 4 + 1;
  const left = Math.random() * 100;
  const duration = Math.random() * 8 + 6;
  const delay = Math.random() * 5;
  const colors = ['rgba(0,212,255,0.5)','rgba(123,47,255,0.4)','rgba(255,47,255,0.3)'];
  p.style.cssText = `
    width:${size}px; height:${size}px; left:${left}%;
    background:${colors[Math.floor(Math.random()*colors.length)]};
    animation-duration:${duration}s; animation-delay:${delay}s;
  `;
  particlesEl.appendChild(p);
  setTimeout(() => p.remove(), (duration + delay) * 1000);
}
for (let i = 0; i < 25; i++) spawnParticle();
setInterval(spawnParticle, 900);

// ── Venom zone: Links popup (mouth) ────────────────────────
const linksPopup = document.getElementById('linksPopup');
const searchPopup = document.getElementById('searchPopup');

function positionPopup(popup, zone) {
  const zr = zone.getBoundingClientRect();
  const pw = popup.offsetWidth || 340;
  let left = zr.left + zr.width / 2 - pw / 2;
  let top  = zr.bottom + 14;
  if (left + pw > window.innerWidth - 16) left = window.innerWidth - pw - 16;
  if (left < 16) left = 16;
  if (top + 420 > window.innerHeight) top = zr.top - 430;
  popup.style.left = left + 'px';
  popup.style.top  = top + 'px';
  popup.style.transform = '';
}

document.getElementById('zoneMouth').addEventListener('click', e => {
  searchPopup.classList.remove('open');
  const isOpen = linksPopup.classList.toggle('open');
  if (isOpen) { positionPopup(linksPopup, e.currentTarget); renderLinks(); }
});
document.getElementById('closeLinks').addEventListener('click', () => linksPopup.classList.remove('open'));

document.getElementById('zoneLeftEye').addEventListener('click', e => {
  linksPopup.classList.remove('open');
  const isOpen = searchPopup.classList.toggle('open');
  if (isOpen) setTimeout(() => document.getElementById('venomSearchInput').focus(), 50);
});
document.getElementById('closeSearch').addEventListener('click', () => searchPopup.classList.remove('open'));

document.addEventListener('click', e => {
  if (!linksPopup.contains(e.target) && e.target.id !== 'zoneMouth' && !e.target.closest('#zoneMouth'))
    linksPopup.classList.remove('open');
  if (!searchPopup.contains(e.target) && e.target.id !== 'zoneLeftEye' && !e.target.closest('#zoneLeftEye'))
    searchPopup.classList.remove('open');
});

// ── Saved links ─────────────────────────────────────────────
function getLinks() { return JSON.parse(localStorage.getItem('venom_links') || '[]'); }
function saveLinks(l) { localStorage.setItem('venom_links', JSON.stringify(l)); }
function getFavicon(url) {
  try { return `https://www.google.com/s2/favicons?sz=32&domain=${new URL(url).hostname}`; }
  catch { return ''; }
}

function renderLinks() {
  const body = document.getElementById('linksBody');
  const links = getLinks();
  if (!links.length) {
    body.innerHTML = '<div style="padding:20px;color:var(--text-dim);font-size:12px;text-align:center">هیچ لینکی ذخیره نشده<br><small>پایین اضافه کن</small></div>';
    return;
  }
  body.innerHTML = links.map((l, i) => `
    <div class="link-item" data-idx="${i}">
      <img class="link-favicon" src="${getFavicon(l.url)}" onerror="this.style.display='none'">
      <div style="flex:1;overflow:hidden">
        <div class="link-name">${l.name}</div>
        <div class="link-url">${l.url}</div>
      </div>
      <button class="link-del" data-idx="${i}">✕</button>
    </div>
  `).join('');

  body.querySelectorAll('.link-item').forEach(el => {
    el.addEventListener('click', ev => {
      if (ev.target.classList.contains('link-del')) return;
      window.open(links[+el.dataset.idx].url, '_blank');
    });
  });
  body.querySelectorAll('.link-del').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const l = getLinks(); l.splice(+btn.dataset.idx, 1);
      saveLinks(l); renderLinks();
    });
  });
}

document.getElementById('saveLink').addEventListener('click', () => {
  const name = document.getElementById('newLinkName').value.trim();
  const url  = document.getElementById('newLinkUrl').value.trim();
  if (!name || !url) return;
  const links = getLinks();
  links.push({ name, url: url.startsWith('http') ? url : 'https://' + url });
  saveLinks(links);
  document.getElementById('newLinkName').value = '';
  document.getElementById('newLinkUrl').value  = '';
  renderLinks();
});

['newLinkName','newLinkUrl'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('saveLink').click();
  });
});

// ── Venom search (eye) ──────────────────────────────────────
let activeEngine = 'google';
document.querySelectorAll('.eng-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.eng-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeEngine = btn.dataset.engine;
    document.getElementById('venomSearchInput').focus();
  });
});

function venomSearch() {
  const q = document.getElementById('venomSearchInput').value.trim();
  if (!q) return;
  const engines = {
    google:  `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    github:  `https://github.com/search?q=${encodeURIComponent(q)}`,
  };
  window.location.href = engines[activeEngine];
}

document.getElementById('venomSearchBtn').addEventListener('click', venomSearch);
document.getElementById('venomSearchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') venomSearch();
  if (e.key === 'Escape') searchPopup.classList.remove('open');
});
