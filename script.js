// ── Clock ──────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${h}:${m}`;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('date-display').textContent =
    `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// ── Search ─────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
document.querySelector('.search-btn').addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
function doSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  const url = q.startsWith('http') ? q : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  window.location.href = url;
}



// ── Floating particles ──────────────────────────────────────
const particlesEl = document.getElementById('particles');
function spawnParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 4 + 1;
  const left = Math.random() * 100;
  const duration = Math.random() * 8 + 6;
  const delay = Math.random() * 5;
  const colors = ['rgba(0,212,255,0.6)','rgba(123,47,255,0.5)','rgba(255,47,255,0.4)'];
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${left}%;
    background:${colors[Math.floor(Math.random()*colors.length)]};
    box-shadow: 0 0 ${size*3}px currentColor;
    animation-duration:${duration}s;
    animation-delay:${delay}s;
  `;
  particlesEl.appendChild(p);
  setTimeout(() => p.remove(), (duration + delay) * 1000);
}
for (let i = 0; i < 30; i++) spawnParticle();
setInterval(spawnParticle, 800);

// ── Tasks ───────────────────────────────────────────────────
function loadTasks() {
  const saved = JSON.parse(localStorage.getItem('rasco_tasks') || '[]');
  if (saved.length) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    saved.forEach((t, i) => renderTask(t.text, t.done, i));
  }
}

function saveTasks() {
  const items = [...document.querySelectorAll('.task-item')];
  const tasks = items.map(el => ({
    text: el.querySelector('span').textContent,
    done: el.querySelector('.task-check').classList.contains('checked')
  }));
  localStorage.setItem('rasco_tasks', JSON.stringify(tasks));
}

function renderTask(text, done = false) {
  const list = document.getElementById('taskList');
  const div = document.createElement('div');
  div.className = 'task-item' + (done ? ' active' : '');
  div.innerHTML = `<div class="task-check ${done ? 'checked' : ''}"></div><span>${text}</span>`;
  div.querySelector('.task-check').addEventListener('click', () => {
    const chk = div.querySelector('.task-check');
    chk.classList.toggle('checked');
    div.classList.toggle('active');
    saveTasks();
  });
  list.appendChild(div);
}

document.getElementById('newTask').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = e.target.value.trim();
    if (val) { renderTask(val); saveTasks(); e.target.value = ''; }
  }
});

// Init task clicks for existing items
document.querySelectorAll('.task-item .task-check').forEach(chk => {
  chk.addEventListener('click', () => {
    chk.classList.toggle('checked');
    chk.parentElement.classList.toggle('active');
    saveTasks();
  });
});

loadTasks();

// ── System stats (simulated) ────────────────────────────────
const cpuHistory = Array(30).fill(0);

function updateStats() {
  const cpu = 15 + Math.random() * 60;
  const mem = 38 + Math.random() * 25;
  const net = 5 + Math.random() * 30;

  document.getElementById('cpuFill').style.width = cpu + '%';
  document.getElementById('memFill').style.width = mem + '%';
  document.getElementById('netFill').style.width = net + '%';
  document.getElementById('cpuVal').textContent = Math.round(cpu) + '%';
  document.getElementById('memVal').textContent = Math.round(mem) + '%';
  document.getElementById('netVal').textContent = Math.round(net) + '%';

  cpuHistory.push(cpu);
  cpuHistory.shift();
  drawCpuChart();
}

function drawCpuChart() {
  const canvas = document.getElementById('cpuChart');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(0,212,255,0.4)');
  grad.addColorStop(1, 'rgba(0,212,255,0)');

  ctx.beginPath();
  cpuHistory.forEach((v, i) => {
    const x = (i / (cpuHistory.length - 1)) * w;
    const y = h - (v / 100) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  cpuHistory.forEach((v, i) => {
    const x = (i / (cpuHistory.length - 1)) * w;
    const y = h - (v / 100) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = 'rgba(0,212,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

updateStats();
setInterval(updateStats, 2000);

// ── Weather (Open-Meteo, no key needed) ────────────────────
async function loadWeather() {
  try {
    const geoRes = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=Tehran&count=1&language=en&format=json');
    const geoData = await geoRes.json();
    if (!geoData.results?.length) return;
    const {latitude, longitude, name} = geoData.results[0];

    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&temperature_unit=celsius`);
    const wData = await wRes.json();
    const temp = Math.round(wData.current.temperature_2m);
    const code = wData.current.weathercode;

    document.getElementById('weatherTemp').textContent = temp + '°C';
    document.getElementById('weatherLoc').textContent = name;
    document.getElementById('weatherDesc').textContent = weatherDesc(code);
    document.querySelector('.weather-icon').textContent = weatherIcon(code);
  } catch(e) {
    // silently fail — keep placeholder
  }
}

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

function weatherDesc(code) {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  return 'Thunderstorm';
}

loadWeather();

// ── Venom zone: Links popup (mouth) ────────────────────────
const linksPopup = document.getElementById('linksPopup');
const searchPopup = document.getElementById('searchPopup');

function positionPopup(popup, zone) {
  const zr = zone.getBoundingClientRect();
  const pw = popup.offsetWidth || 320;
  let left = zr.left + zr.width / 2 - pw / 2;
  let top  = zr.bottom + 12;
  if (left + pw > window.innerWidth - 16) left = window.innerWidth - pw - 16;
  if (left < 16) left = 16;
  if (top + 400 > window.innerHeight) top = zr.top - 420;
  popup.style.left = left + 'px';
  popup.style.top  = top + 'px';
  popup.style.transform = '';
}

document.getElementById('zoneMouth').addEventListener('click', e => {
  searchPopup.classList.remove('open');
  const isOpen = linksPopup.classList.toggle('open');
  if (isOpen) {
    positionPopup(linksPopup, e.currentTarget);
    renderLinks();
  }
});
document.getElementById('closeLinks').addEventListener('click', () => linksPopup.classList.remove('open'));

document.getElementById('zoneLeftEye').addEventListener('click', e => {
  linksPopup.classList.remove('open');
  const isOpen = searchPopup.classList.toggle('open');
  if (isOpen) {
    setTimeout(() => document.getElementById('venomSearchInput').focus(), 50);
  }
});
document.getElementById('closeSearch').addEventListener('click', () => searchPopup.classList.remove('open'));

// close on outside click
document.addEventListener('click', e => {
  if (!linksPopup.contains(e.target) && e.target.id !== 'zoneMouth')
    linksPopup.classList.remove('open');
  if (!searchPopup.contains(e.target) && e.target.id !== 'zoneLeftEye')
    searchPopup.classList.remove('open');
});

// ── Saved links storage ─────────────────────────────────────
function getLinks() {
  return JSON.parse(localStorage.getItem('venom_links') || '[]');
}
function saveLinks(links) {
  localStorage.setItem('venom_links', JSON.stringify(links));
}

function getFavicon(url) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
  } catch { return ''; }
}

function renderLinks() {
  const body = document.getElementById('linksBody');
  const links = getLinks();
  if (!links.length) {
    body.innerHTML = '<div style="padding:16px;color:var(--text-dim);font-size:12px;text-align:center">هیچ لینکی ذخیره نشده<br><small>پایین اضافه کن</small></div>';
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
      const idx = +el.dataset.idx;
      window.open(links[idx].url, '_blank');
    });
  });
  body.querySelectorAll('.link-del').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const links2 = getLinks();
      links2.splice(+btn.dataset.idx, 1);
      saveLinks(links2);
      renderLinks();
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

// enter key in link inputs
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
  window.location.href = engines[activeEngine] || engines.google;
}

document.getElementById('venomSearchBtn').addEventListener('click', venomSearch);
document.getElementById('venomSearchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') venomSearch();
  if (e.key === 'Escape') searchPopup.classList.remove('open');
});

// ── Add link modal ──────────────────────────────────────────
const modal = document.getElementById('addModal');
document.getElementById('addLink').addEventListener('click', () => modal.classList.add('open'));
document.getElementById('cancelAdd').addEventListener('click', () => modal.classList.remove('open'));
document.getElementById('confirmAdd').addEventListener('click', () => {
  const name = document.getElementById('linkName').value.trim();
  const url = document.getElementById('linkUrl').value.trim();
  if (name && url) {
    addCustomLink(name, url);
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    modal.classList.remove('open');
  }
});

function addCustomLink(name, url) {
  const links = document.querySelector('.quick-links');
  const addBtn = document.getElementById('addLink');
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.className = 'quick-link';
  const letter = name[0].toUpperCase();
  a.innerHTML = `
    <div class="ql-icon" style="color:var(--blue)">
      <span style="font-size:18px;font-weight:700">${letter}</span>
    </div>
    <span>${name}</span>
  `;
  links.insertBefore(a, addBtn);
}
