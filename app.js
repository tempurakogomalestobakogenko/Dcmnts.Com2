/**
 * ════════════════════════════════════════════════════════════
 *  ANJAN DIGITAL VAULT X PRO — js/app.js (Frontend)
 *  Author : Anjan Dhar
 *  Version: 2.0.0
 *  Desc   : Fetches auth & documents from Express backend.
 *           All document images served via ImgBB URLs from API.
 * ════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIG — set your Railway backend URL here
───────────────────────────────────────────────────────────── */
const API_BASE = 'dcmnts-backend-production.up.railway.app'; // 🔁 Replace with your Railway backend URL

/* ─────────────────────────────────────────────────────────────
   SOUND ENGINE (Web Audio API — zero external files)
───────────────────────────────────────────────────────────── */
const SFX = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function tone({ freq = 440, type = 'sine', gain = 0.4, start = 0, dur = 0.15, ramp = true } = {}) {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + start);
    g.gain.setValueAtTime(gain, ac.currentTime + start);
    if (ramp) g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + dur + 0.02);
  }
  return {
    click()    { tone({ freq: 880, type: 'square', gain: 0.18, dur: 0.06 }); tone({ freq: 1200, type: 'square', gain: 0.08, start: 0.04, dur: 0.05 }); },
    denied()   { tone({ freq: 180, type: 'sawtooth', gain: 0.35, dur: 0.18 }); tone({ freq: 140, type: 'sawtooth', gain: 0.3, start: 0.16, dur: 0.22 }); tone({ freq: 100, type: 'sawtooth', gain: 0.25, start: 0.35, dur: 0.25 }); },
    unlock()   { [0, 0.12, 0.24, 0.36].forEach((t, i) => { tone({ freq: [440,554,659,880][i], type: 'sine', gain: 0.3, start: t, dur: 0.22 }); }); },
    scanBeep() { tone({ freq: 600, type: 'sine', gain: 0.15, dur: 0.08 }); tone({ freq: 900, type: 'sine', gain: 0.12, start: 0.1, dur: 0.08 }); tone({ freq: 1200, type: 'sine', gain: 0.10, start: 0.2, dur: 0.08 }); },
    granted()  { tone({ freq: 660, type: 'sine', gain: 0.35, dur: 0.18 }); tone({ freq: 880, type: 'sine', gain: 0.35, start: 0.2, dur: 0.18 }); tone({ freq: 1320, type: 'sine', gain: 0.30, start: 0.4, dur: 0.30 }); },
    download() { tone({ freq: 740, type: 'sine', gain: 0.22, dur: 0.10 }); tone({ freq: 1047, type: 'sine', gain: 0.18, start: 0.1, dur: 0.12 }); },
    lock()     { tone({ freq: 520, type: 'square', gain: 0.22, dur: 0.08 }); tone({ freq: 320, type: 'square', gain: 0.28, start: 0.09, dur: 0.14 }); tone({ freq: 180, type: 'square', gain: 0.20, start: 0.22, dur: 0.12 }); },
  };
})();

const CAT_ICONS = { identity: '🪪', financial: '💳', education: '🎓' };

/* ─────────────────────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function Particle() { this.reset(); }
  Particle.prototype.reset = function() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.5 + 0.3; this.a = Math.random() * 0.6 + 0.1;
    this.color = Math.random() > 0.5 ? `rgba(0,240,255,${this.a})` : `rgba(160,32,240,${this.a * 0.7})`;
  };
  Particle.prototype.update = function() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };
  const COUNT = Math.min(120, Math.floor(W * H / 12000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  function connect() {
    const DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,240,255,${(1 - d / DIST) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); });
    connect();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─────────────────────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────────────────────── */
const LOADING_MESSAGES = [
  'INITIALIZING VAULT SYSTEM...',
  'CONNECTING TO SECURE SERVER...',
  'LOADING ENCRYPTION MODULES...',
  'VERIFYING SECURE CHANNEL...',
  'BUILDING DOCUMENT INDEX...',
  'VAULT READY.',
];

(function runLoadingScreen() {
  const bar = document.getElementById('loadingBar');
  const status = document.getElementById('loadingStatus');
  let pct = 0, mIdx = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct > 100) pct = 100;
    bar.style.width = pct + '%';
    const newIdx = Math.floor((pct / 100) * (LOADING_MESSAGES.length - 1));
    if (newIdx !== mIdx) { mIdx = newIdx; status.textContent = LOADING_MESSAGES[mIdx]; }
    if (pct >= 100) {
      clearInterval(interval);
      status.textContent = LOADING_MESSAGES[LOADING_MESSAGES.length - 1];
      setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('loginScreen').classList.remove('hidden');
        loadProfileAvatar();
      }, 500);
    }
  }, 120);
})();

/* ─────────────────────────────────────────────────────────────
   PROFILE AVATAR — load from API before login shows
───────────────────────────────────────────────────────────── */
async function loadProfileAvatar() {
  try {
    const res = await fetch(`${API_BASE}/api/profile`);
    const profile = await res.json();
    if (profile.avatarUrl) {
      document.getElementById('loginAvatar').src = profile.avatarUrl;
    }
  } catch (_) {
    // silently fallback to initials
  }
}

/* ─────────────────────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────────────────────── */
const passwordInput = document.getElementById('passwordInput');
const unlockBtn     = document.getElementById('unlockBtn');
const accessDenied  = document.getElementById('accessDenied');
const eyeBtn        = document.getElementById('eyeBtn');
const passwordWrap  = document.getElementById('passwordWrap');

eyeBtn.addEventListener('click', () => {
  SFX.click();
  const isText = passwordInput.type === 'text';
  passwordInput.type = isText ? 'password' : 'text';
  eyeBtn.textContent = isText ? '👁' : '🙈';
});

passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptUnlock(); });
unlockBtn.addEventListener('click', attemptUnlock);

async function attemptUnlock() {
  const val = passwordInput.value.trim();
  if (!val) return;

  unlockBtn.disabled = true;
  unlockBtn.textContent = 'VERIFYING...';

  try {
    const res = await fetch(`${API_BASE}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: val }),
    });
    const data = await res.json();

    if (data.success) {
      SFX.unlock();
      document.getElementById('loginScreen').classList.add('hidden');
      showFingerprintScreen();
    } else {
      SFX.denied();
      accessDenied.classList.add('visible');
      passwordWrap.classList.add('shake');
      passwordInput.value = '';
      passwordInput.style.borderColor = 'var(--red)';
      setTimeout(() => { passwordWrap.classList.remove('shake'); passwordInput.style.borderColor = ''; }, 600);
      setTimeout(() => { accessDenied.classList.remove('visible'); }, 3000);
    }
  } catch (err) {
    // fallback: if backend unreachable, show error
    accessDenied.textContent = '⛔ SERVER UNREACHABLE — CHECK API URL';
    accessDenied.classList.add('visible');
    SFX.denied();
    setTimeout(() => {
      accessDenied.textContent = '⛔ ACCESS DENIED — INVALID CREDENTIALS';
      accessDenied.classList.remove('visible');
    }, 4000);
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.innerHTML = '<span class="btn-icon">🔓</span> UNLOCK VAULT';
  }
}

/* ─────────────────────────────────────────────────────────────
   FINGERPRINT SCREEN
───────────────────────────────────────────────────────────── */
function showFingerprintScreen() {
  const fpScreen = document.getElementById('fingerprintScreen');
  const fpBar    = document.getElementById('fpBar');
  const fpStatus = document.getElementById('fpStatus');
  const fpSub    = document.getElementById('fpSub');
  fpScreen.classList.remove('hidden');

  const steps = [
    [0,   'SCANNING BIOMETRICS...',   'Place finger on sensor'],
    [30,  'READING FINGERPRINT...',   'Processing biometric data'],
    [55,  'MATCHING IDENTITY...',     'Comparing with vault profile'],
    [78,  'IDENTITY VERIFIED ✓',      'Welcome, Anjan Dhar'],
    [100, 'ACCESS GRANTED ✓',         'Opening secure vault...'],
  ];
  let s = 0;
  const interval = setInterval(() => {
    if (s >= steps.length) {
      clearInterval(interval);
      setTimeout(() => { fpScreen.classList.add('hidden'); enterDashboard(); }, 600);
      return;
    }
    const [pct, msg, sub] = steps[s];
    fpBar.style.width = pct + '%';
    fpStatus.textContent = msg;
    fpSub.textContent    = sub;
    if (s < steps.length - 1) SFX.scanBeep(); else SFX.granted();
    s++;
  }, 700);
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────────── */
async function enterDashboard() {
  document.getElementById('dashboard').classList.remove('hidden');
  initClock();
  initBattery();
  initNetwork();
  await loadProfileData();
  await loadDocuments('all');
  bindFilterPills();
}

document.getElementById('lockVaultBtn').addEventListener('click', () => {
  SFX.lock();
  document.getElementById('dashboard').classList.add('hidden');
  passwordInput.value = '';
  accessDenied.classList.remove('visible');
  document.getElementById('loginScreen').classList.remove('hidden');
});

/* ─────────────────────────────────────────────────────────────
   LOAD PROFILE FROM API
───────────────────────────────────────────────────────────── */
async function loadProfileData() {
  try {
    const res     = await fetch(`${API_BASE}/api/profile`);
    const profile = await res.json();

    // Avatar
    if (profile.avatarUrl) {
      document.getElementById('profileImg').src = profile.avatarUrl;
    }

    // Name & subtitle
    if (profile.name)     { document.getElementById('profileName').textContent = profile.name; document.getElementById('heroName').textContent = profile.name.split(' ')[0]; }
    if (profile.subtitle) document.getElementById('profileSub').textContent = profile.subtitle;

    // Badges
    if (profile.familyId || profile.dob || profile.location) {
      document.getElementById('profileBadges').innerHTML = `
        ${profile.familyId ? `<span class="badge">🆔 Family ID: ${profile.familyId}</span>` : ''}
        ${profile.dob      ? `<span class="badge">📅 DOB: ${profile.dob}</span>` : ''}
        ${profile.location ? `<span class="badge">🏛️ ${profile.location}</span>` : ''}
      `;
    }
  } catch (_) {
    // silently use defaults already in HTML
  }
}

/* ─────────────────────────────────────────────────────────────
   LOAD DOCUMENTS FROM API
───────────────────────────────────────────────────────────── */
async function loadDocuments(filter) {
  const grid = document.getElementById('docsGrid');
  const apiErr = document.getElementById('apiError');
  apiErr.classList.add('hidden');

  // Show skeleton loaders
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const sk = document.createElement('div');
    sk.className = 'doc-card-skeleton';
    grid.appendChild(sk);
  }

  try {
    const url = filter === 'all'
      ? `${API_BASE}/api/documents`
      : `${API_BASE}/api/documents?category=${filter}`;

    const res  = await fetch(url);
    const data = await res.json();

    grid.innerHTML = '';
    data.documents.forEach((doc, i) => {
      grid.appendChild(buildCard(doc, i));
    });

    document.getElementById('visibleCount').textContent = data.documents.length + ' FILES';
    document.getElementById('totalDocs').textContent = data.total || data.documents.length;
    document.getElementById('totalCats').textContent = (data.categories || []).length;
  } catch (err) {
    grid.innerHTML = '';
    apiErr.classList.remove('hidden');
    console.error('API fetch error:', err);
  }
}

/* ─────────────────────────────────────────────────────────────
   BUILD DOCUMENT CARD
───────────────────────────────────────────────────────────── */
function buildCard(doc, idx) {
  const card = document.createElement('div');
  card.className = 'doc-card';
  card.style.animationDelay = (idx * 0.1) + 's';

  /* Preview — image from ImgBB URL */
  let previewHTML;
  if (doc.type === 'image' && doc.imageUrl) {
    previewHTML = `
      <div class="card-preview">
        <img
          src="${doc.imageUrl}"
          alt="${doc.title}"
          loading="lazy"
          onerror="this.parentElement.innerHTML='<div class=\\'card-preview-placeholder\\'><div class=\\'pdf-icon-big\\'>🖼️</div><span class=\\'pdf-label\\'>${doc.title.toUpperCase()}</span></div>'"
        />
      </div>`;
  } else {
    previewHTML = `
      <div class="card-preview">
        <div class="card-preview-placeholder">
          <div class="pdf-icon-big">📄</div>
          <span class="pdf-label">PDF DOCUMENT</span>
        </div>
      </div>`;
  }

  const catClass = `cat-${doc.category}`;
  const catIcon  = CAT_ICONS[doc.category] || '📁';

  card.innerHTML = `
    ${previewHTML}
    <div class="card-body">
      <span class="card-cat ${catClass}">${catIcon} ${doc.category.toUpperCase()}</span>
      <h3 class="card-title"><span class="card-doc-icon">${doc.icon}</span> ${doc.title}</h3>
      <div class="card-actions">
        <button class="card-btn btn-view">👁 VIEW</button>
        <button class="card-btn btn-dl">⬇ DOWNLOAD</button>
      </div>
    </div>`;

  card.querySelector('.btn-view').addEventListener('click', () => {
    SFX.click();
    openModal(doc.imageUrl || '', doc.title, doc.type);
  });

  card.querySelector('.btn-dl').addEventListener('click', () => {
    SFX.download();
    if (doc.imageUrl) downloadFile(doc.imageUrl, `${doc.id}.jpg`);
  });

  return card;
}

/* ─────────────────────────────────────────────────────────────
   FILTER PILLS
───────────────────────────────────────────────────────────── */
function bindFilterPills() {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      SFX.click();
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      loadDocuments(pill.dataset.cat);
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   CLOCK + DATE
───────────────────────────────────────────────────────────── */
function initClock() {
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('heroClock').textContent = `${hh}:${mm}:${ss}`;
    const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const mons = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    document.getElementById('heroDate').textContent =
      `${days[now.getDay()]}, ${String(now.getDate()).padStart(2,'0')} ${mons[now.getMonth()]} ${now.getFullYear()}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────────────────────────
   BATTERY
───────────────────────────────────────────────────────────── */
async function initBattery() {
  if (!navigator.getBattery) { document.getElementById('batLabel').textContent = 'N/A'; return; }
  try {
    const bat = await navigator.getBattery();
    function updateBat() {
      const pct = Math.round(bat.level * 100);
      document.getElementById('batLabel').textContent = pct + '%';
      document.getElementById('batIcon').textContent = bat.charging ? '⚡' : pct <= 20 ? '🪫' : '🔋';
    }
    updateBat();
    bat.addEventListener('levelchange', updateBat);
    bat.addEventListener('chargingchange', updateBat);
  } catch (_) { document.getElementById('batLabel').textContent = '--'; }
}

/* ─────────────────────────────────────────────────────────────
   NETWORK
───────────────────────────────────────────────────────────── */
function initNetwork() {
  const dot = document.getElementById('netDot'), label = document.getElementById('netLabel');
  function update() { const o = navigator.onLine; label.textContent = o ? 'ONLINE' : 'OFFLINE'; dot.classList.toggle('offline', !o); }
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

/* ─────────────────────────────────────────────────────────────
   MODAL VIEWER
───────────────────────────────────────────────────────────── */
const modal      = document.getElementById('docModal');
const modalBody  = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const modalDlBtn = document.getElementById('modalDlBtn');
let _currentPath = '', _currentFile = '';

function openModal(url, title, type) {
  _currentPath = url;
  _currentFile = url.split('/').pop() || 'document';
  modalTitle.textContent = title.toUpperCase();
  modalBody.innerHTML = '';

  if (!url) {
    modalBody.innerHTML = `<p style="color:var(--text-dim);font-family:var(--font-mono);font-size:.75rem;padding:24px;text-align:center;">⚠ No URL set for this document yet.</p>`;
  } else if (type === 'image') {
    const img = document.createElement('img');
    img.src = url; img.alt = title;
    img.onerror = () => { modalBody.innerHTML = `<p style="color:var(--text-dim);font-family:var(--font-mono);font-size:.75rem;padding:24px;text-align:center;">⚠ Image could not be loaded.</p>`; };
    modalBody.appendChild(img);
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = url; iframe.title = title;
    modalBody.appendChild(iframe);
  }

  modalDlBtn.onclick = () => { SFX.download(); downloadFile(_currentPath, _currentFile); };
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('hidden');
  modalBody.innerHTML = '';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', () => { SFX.click(); closeModal(); });
modal.addEventListener('click', e => { if (e.target === modal) { SFX.click(); closeModal(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ─────────────────────────────────────────────────────────────
   DOWNLOAD HELPER
───────────────────────────────────────────────────────────── */
function downloadFile(url, filename) {
  if (!url || url.includes('PLACEHOLDER')) {
    alert('⚠ Image URL not set yet for this document.');
    return;
  }
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
