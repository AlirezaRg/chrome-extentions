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

// ── Globe canvas ───────────────────────────────────────────
const gc = document.getElementById('globeCanvas');
const gx = gc.getContext('2d');
const R = 130;
let globeAngle = 0;

const latLines = [-60,-40,-20,0,20,40,60];
const lngLines = Array.from({length: 12}, (_,i) => i * 30);

function drawGlobe() {
  gx.clearRect(0, 0, 320, 320);
  const cx = 160, cy = 160;

  // Base sphere gradient
  const grad = gx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, R);
  grad.addColorStop(0, 'rgba(0,180,255,0.18)');
  grad.addColorStop(0.5, 'rgba(10,10,60,0.7)');
  grad.addColorStop(1, 'rgba(4,4,26,0.9)');
  gx.beginPath();
  gx.arc(cx, cy, R, 0, Math.PI * 2);
  gx.fillStyle = grad;
  gx.fill();

  gx.save();
  gx.beginPath();
  gx.arc(cx, cy, R, 0, Math.PI * 2);
  gx.clip();

  // Latitude lines
  gx.strokeStyle = 'rgba(0,212,255,0.15)';
  gx.lineWidth = 0.8;
  latLines.forEach(lat => {
    const y0 = cy + R * Math.sin(lat * Math.PI / 180);
    const rx = R * Math.cos(lat * Math.PI / 180);
    if (rx > 0) {
      gx.beginPath();
      gx.ellipse(cx, y0, rx, rx * 0.25, 0, 0, Math.PI * 2);
      gx.stroke();
    }
  });

  // Longitude lines
  lngLines.forEach(lng => {
    const angle = (lng + globeAngle) * Math.PI / 180;
    const x1 = cx + R * Math.sin(angle);
    const x2 = cx - R * Math.sin(angle);
    const cp1x = cx + R * 1.3 * Math.sin(angle);
    const cp2x = cx - R * 1.3 * Math.sin(angle);
    gx.beginPath();
    gx.moveTo(x1, cy - R);
    gx.bezierCurveTo(cp1x, cy - R * 0.3, cp1x, cy + R * 0.3, x1, cy + R);
    const opacity = 0.05 + 0.2 * (0.5 + 0.5 * Math.cos(angle));
    gx.strokeStyle = `rgba(0,212,255,${opacity})`;
    gx.lineWidth = 0.8;
    gx.stroke();

    // mirrored
    gx.beginPath();
    gx.moveTo(x2, cy - R);
    gx.bezierCurveTo(cp2x, cy - R * 0.3, cp2x, cy + R * 0.3, x2, cy + R);
    const opacity2 = 0.05 + 0.2 * (0.5 + 0.5 * Math.cos(angle + Math.PI));
    gx.strokeStyle = `rgba(0,212,255,${opacity2})`;
    gx.stroke();
  });

  // Hotspot dots
  const spots = [
    {lat:35,lng:51},{lat:48,lng:2},{lat:51,lng:0},{lat:40,lng:-74},
    {lat:1,lng:103},{lat:35,lng:139},{lat:-34,lng:151},{lat:55,lng:37},
  ];
  spots.forEach(({lat,lng}) => {
    const a = (lng + globeAngle) * Math.PI / 180;
    const cosLat = Math.cos(lat * Math.PI / 180);
    const sinLon = Math.sin(a);
    if (sinLon > -0.2) {
      const px = cx + R * cosLat * sinLon;
      const py = cy - R * Math.sin(lat * Math.PI / 180);
      const alpha = Math.max(0, sinLon);
      gx.beginPath();
      gx.arc(px, py, 3, 0, Math.PI * 2);
      gx.fillStyle = `rgba(0,212,255,${alpha})`;
      gx.fill();
      gx.beginPath();
      gx.arc(px, py, 6, 0, Math.PI * 2);
      gx.strokeStyle = `rgba(0,212,255,${alpha * 0.4})`;
      gx.lineWidth = 1;
      gx.stroke();
    }
  });

  gx.restore();

  // Rim glow
  const rimGrad = gx.createRadialGradient(cx, cy, R - 8, cx, cy, R + 2);
  rimGrad.addColorStop(0, 'transparent');
  rimGrad.addColorStop(0.7, 'rgba(0,212,255,0.08)');
  rimGrad.addColorStop(1, 'rgba(0,212,255,0.25)');
  gx.beginPath();
  gx.arc(cx, cy, R, 0, Math.PI * 2);
  gx.strokeStyle = rimGrad;
  gx.lineWidth = 4;
  gx.stroke();

  // Highlight shine
  const shine = gx.createRadialGradient(cx - 50, cy - 50, 0, cx - 50, cy - 50, 80);
  shine.addColorStop(0, 'rgba(255,255,255,0.07)');
  shine.addColorStop(1, 'transparent');
  gx.beginPath();
  gx.arc(cx, cy, R, 0, Math.PI * 2);
  gx.fillStyle = shine;
  gx.fill();

  globeAngle += 0.12;
  requestAnimationFrame(drawGlobe);
}
drawGlobe();

// ── City background canvas ─────────────────────────────────
const bg = document.getElementById('bgCanvas');
const bx = bg.getContext('2d');

function resizeBg() {
  bg.width = window.innerWidth;
  bg.height = window.innerHeight;
  drawBg();
}

function drawBg() {
  const w = bg.width, h = bg.height;
  // Deep space gradient
  const sky = bx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#020215');
  sky.addColorStop(0.4, '#04041a');
  sky.addColorStop(0.7, '#060620');
  sky.addColorStop(1, '#010110');
  bx.fillStyle = sky;
  bx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.7;
    const r = Math.random() * 1.2;
    const alpha = Math.random() * 0.8 + 0.2;
    bx.beginPath();
    bx.arc(x, y, r, 0, Math.PI * 2);
    bx.fillStyle = `rgba(255,255,255,${alpha})`;
    bx.fill();
  }

  // City silhouette - far buildings
  bx.fillStyle = '#040414';
  drawBuildings(bx, w, h, 0.72, 0.85, 30, 15, 80);

  // City silhouette - near buildings
  bx.fillStyle = '#020210';
  drawBuildings(bx, w, h, 0.78, 0.95, 20, 20, 120);

  // Neon reflections on water
  const waterY = h * 0.88;
  const waterGrad = bx.createLinearGradient(0, waterY, 0, h);
  waterGrad.addColorStop(0, 'rgba(0,50,80,0.4)');
  waterGrad.addColorStop(0.3, 'rgba(10,0,40,0.6)');
  waterGrad.addColorStop(1, '#010108');
  bx.fillStyle = waterGrad;
  bx.fillRect(0, waterY, w, h - waterY);

  // Neon glow lines on water
  for (let i = 0; i < 6; i++) {
    const x = w * (0.1 + i * 0.15);
    const wg = bx.createLinearGradient(x - 40, waterY, x + 40, h);
    const colors = ['rgba(0,212,255,', 'rgba(123,47,255,', 'rgba(255,47,255,'];
    const c = colors[i % colors.length];
    wg.addColorStop(0, c + '0.3)');
    wg.addColorStop(0.5, c + '0.1)');
    wg.addColorStop(1, c + '0)');
    bx.fillStyle = wg;
    bx.fillRect(x - 40 + i * 5, waterY, 80, h - waterY);
  }

  // Billboard glow panels
  const panels = [
    {x:0.08,y:0.55,w:80,h:50,c:'rgba(123,47,255,0.6)'},
    {x:0.88,y:0.5,w:70,h:60,c:'rgba(0,212,255,0.5)'},
    {x:0.93,y:0.62,w:50,h:40,c:'rgba(255,47,255,0.4)'},
  ];
  panels.forEach(p => {
    const px = w * p.x, py = h * p.y;
    const pg = bx.createRadialGradient(px, py, 0, px, py, p.w);
    pg.addColorStop(0, p.c);
    pg.addColorStop(1, 'transparent');
    bx.fillStyle = pg;
    bx.fillRect(px - p.w, py - p.h / 2, p.w * 2, p.h);
  });
}

function drawBuildings(ctx, w, h, baseY, maxY, count, minW, maxW) {
  const base = h * baseY;
  const bottom = h * maxY;
  for (let i = 0; i < count; i++) {
    const bw = minW + Math.random() * (maxW - minW);
    const bx2 = (w / count) * i + Math.random() * (w / count / 2);
    const bh = (bottom - base) * (0.3 + Math.random() * 0.7);
    ctx.fillRect(bx2, base - bh, bw, bh + (bottom - base));

    // Window lights (subtle)
    const wRows = Math.floor(bh / 14);
    const wCols = Math.floor(bw / 10);
    for (let r = 0; r < wRows; r++) {
      for (let c = 0; c < wCols; c++) {
        if (Math.random() > 0.75) {
          const colors = ['rgba(0,150,220,0.25)','rgba(80,30,200,0.2)','rgba(200,160,30,0.18)'];
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(bx2 + c * 10 + 2, base - bh + r * 14 + 3, 3, 5);
        }
      }
    }
  }
}

resizeBg();
window.addEventListener('resize', resizeBg);

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
