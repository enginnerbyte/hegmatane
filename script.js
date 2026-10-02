/* ============================================================
   هگمتانه — Hegmataneh
   script.js — نسخه بهینه‌شده
   ============================================================ */

'use strict';

/* ============================================================
   ۰۱ · CONFIG
   ============================================================ */
const CONFIG = {
  tracks: [
    { id: 1,  title: 'خواب سنگ‌ها',     artist: 'هگمتانه', src: 'audio/track-01.mp3', tags: ['featured', 'new'] },
    { id: 2,  title: 'باد در ستون‌ها',  artist: 'هگمتانه', src: 'audio/track-02.mp3', tags: ['featured'] },
    { id: 3,  title: 'کتیبه‌ی گمشده',   artist: 'هگمتانه', src: 'audio/track-03.mp3', tags: ['new'] },
    { id: 4,  title: 'شب هگمتانه',       artist: 'هگمتانه', src: 'audio/track-04.mp3', tags: ['featured'] },
    { id: 5,  title: 'آواز شیر سنگی',    artist: 'هگمتانه', src: 'audio/track-05.mp3', tags: [] },
    { id: 6,  title: 'راه ابریشم',       artist: 'هگمتانه', src: 'audio/track-06.mp3', tags: ['new'] },
    { id: 7,  title: 'نغمه‌ی ماد',        artist: 'هگمتانه', src: 'audio/track-07.mp3', tags: [] },
    { id: 8,  title: 'خاکستر و طلا',     artist: 'هگمتانه', src: 'audio/track-08.mp3', tags: ['featured'] },
    { id: 9,  title: 'کوچه‌های همدان',   artist: 'هگمتانه', src: 'audio/track-09.mp3', tags: [] },
    { id: 10, title: 'سایه‌ی ارگ',        artist: 'هگمتانه', src: 'audio/track-10.mp3', tags: ['new'] },
    { id: 11, title: 'وداع',             artist: 'هگمتانه', src: 'audio/track-11.mp3', tags: [] },
    { id: 12, title: 'بازگشت',           artist: 'هگمتانه', src: 'audio/track-12.mp3', tags: ['featured'] },
    { id: 13, title: 'Mermaid Waltz',     artist: 'Oscar Pascasio', src: 'audio/track-13.mp3', tags: [] },
    { id: 14, title: 'Mermaid Waltz',     artist: 'Oscar Pascasio', src: 'audio/track-14.mp3', tags: [] },
    { id: 15, title: 'Written On The Sky', artist: 'Max Richter', src: 'audio/track-15.mp3', tags: ['new'] },
    { id: 16, title: 'Watermark',         artist: 'Enya', src: 'audio/track-16.mp3', tags: ['featured'] },
    { id: 17, title: 'Romantic',          artist: 'Alex-Productions', src: 'audio/track-17.mp3', tags: [] },
  ],

  email:    'abolfazlengineer9@gmail.com',
  telegram: 'ENgineerASB',

  keys: {
    theme:     'hegmataneh:theme',
    favorites: 'hegmataneh:favorites',
    volume:    'hegmataneh:volume',
  },
};

/* ============================================================
   ۰۲ · STATE
   ============================================================ */
const State = {
  tracks:      [],
  current:     -1,
  isPlaying:   false,
  shuffle:     false,
  repeat:      'off',
  favorites:   new Set(),
  filter:      'all',
  volume:      0.7,
  muted:       false,
  isDraggingProgress: false,
  isDraggingVolume:   false,
};

/* ============================================================
   ۰۳ · UTILS
   ============================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

function toPersianTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const raw = `${m}:${String(s).padStart(2, '0')}`;
  return raw.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function toPersianDigits(str) {
  return String(str).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function debounce(fn, wait = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlight(text, q) {
  const safe = escapeHTML(text);
  if (!q) return safe;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${esc})`, 'gi');
  return safe.replace(re, '<mark class="hl">$1</mark>');
}

function firstLetter(str) {
  return (str || '؟').trim().charAt(0);
}

/* ============================================================
   ۰۴ · TOASTS
   ============================================================ */
const Toasts = {
  root: null,
  init() { this.root = $('#toasts'); },

  show(msg, type = 'info', duration = 3200) {
    if (!this.root) return;

    const icons = {
      success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
      error:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
      info:    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    };

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__msg">${escapeHTML(msg)}</span>
    `;
    this.root.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));

    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 500);
    }, duration);
  },
};

/* ============================================================
   ۰۵ · PRELOADER  ← بهینه‌سازی: سرعت بارگذاری
   ============================================================ */
function initPreloader() {
  const pre = $('#preloader');
  if (!pre) return;

  /* تأخیر مصنوعی از ۲۴۰۰ به ۴۰۰ میلی‌ثانیه کاهش یافت */
  const minDelay = prefersReducedMotion ? 100 : 4000;

  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    setTimeout(() => {
      pre.classList.add('is-done');
      document.body.classList.remove('no-scroll');
      setTimeout(() => pre.remove(), 900);
    }, minDelay);
  };

  document.body.classList.add('no-scroll');

  /* دیگر منتظر window.load نمی‌مانیم — منتظر DOMContentLoaded می‌مانیم */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hide, { once: true });
  } else {
    hide();
  }

  /* شبکه‌ی اطمینان: حداکثر بعد از ۳ ثانیه، پری‌لودر برداشته می‌شود */
  setTimeout(hide, 5000);
}

/* ============================================================
   ۰۶ · THEME
   ============================================================ */
const Theme = {
  init() {
    const saved = localStorage.getItem(CONFIG.keys.theme);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    document.documentElement.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'));

    $('#themeToggle')?.addEventListener('click', () => this.toggle());
  },

  toggle() {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.classList.add('theme-transition');
    html.setAttribute('data-theme', next);
    localStorage.setItem(CONFIG.keys.theme, next);
    setTimeout(() => html.classList.remove('theme-transition'), 460);
    Toasts.show(next === 'dark' ? 'حالت شبانه روشن شد.' : 'حالت روز روشن شد.', 'info', 2200);
  },
};

/* ============================================================
   ۰۷ · CURSOR
   ============================================================ */
function initCursor() {
  if (isTouchDevice || prefersReducedMotion) return;

  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;
  const lerp = (a, b, t) => a + (b - a) * t;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    document.body.classList.add('cursor-ready');
  }, { passive: true });

  document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));

  (function loop() {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    dot.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  const sel = 'a, button, .track, .chip, .search__result, input, textarea, select, [role="slider"]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(sel)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(sel)) ring.classList.remove('is-hover');
  });
}

/* ============================================================
   ۰۸ · HEADER
   ============================================================ */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const sections = $$('main > section[id]');
  const navLinks = $$('[data-nav]');
  const drawerLinks = $$('[data-drawer-link]');

  const setActive = id => {
    [...navLinks, ...drawerLinks].forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting && setActive(en.target.id));
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(s => io.observe(s));
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + scrollY - 80;
      scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}

/* ============================================================
   ۰۹ · DRAWER
   ============================================================ */
function initDrawer() {
  const burger = $('#hamburger');
  const drawer = $('#drawer');
  const backdrop = $('#drawerBackdrop');
  const closeBtn = $('#drawerClose');
  if (!burger || !drawer) return;

  const open = () => {
    document.body.classList.add('drawer-open', 'no-scroll');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    document.body.classList.remove('drawer-open', 'no-scroll');
    burger.setAttribute('aria-expanded', 'false');
    if (drawer.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    drawer.setAttribute('aria-hidden', 'true');
  };

  burger.addEventListener('click', () => {
    document.body.classList.contains('drawer-open') ? close() : open();
  });
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  $$('[data-drawer-link]').forEach(a => a.addEventListener('click', close));

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) close();
  });
}

/* ============================================================
   ۱۰ · PARTICLES
   ============================================================ */
function initParticles() {
  const canvas = $('#bgParticles');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, particles = [], raf = null;

  const colors = {
    gold:        '255, 202, 97',
    turquoise:   '58, 135, 140',
    pomegranate: '198, 61, 102',
  };

  const spawn = () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.6 + 0.3,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    a: Math.random() * 0.5 + 0.15,
    hue: Math.random() < 0.7 ? 'gold' : (Math.random() < 0.5 ? 'turquoise' : 'pomegranate'),
  });

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(Math.round((W * H) / 24000), 70);
    particles = Array.from({ length: count }, spawn);
  };

  const step = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors[p.hue]}, ${p.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(step);
  };

  const start = () => { if (!raf) step(); };
  const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

  resize();
  start();
  addEventListener('resize', debounce(resize, 200));
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
}

/* ============================================================
   ۱۱ · REVEAL
   ============================================================ */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => io.observe(el));
}

/* ============================================================
   ۱۲ · STATS COUNTER
   ============================================================ */
function initStats() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const animate = el => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target) || prefersReducedMotion) return;
    const duration = 1600;
    const start = performance.now();
    const tick = now => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = toPersianDigits(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { animate(en.target); obs.unobserve(en.target); }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c));
}

/* ============================================================
   ۱۳ · YEAR
   ============================================================ */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = toPersianDigits(new Date().getFullYear());
}

/* ============================================================
   ۱۴ · FAVORITES
   ============================================================ */
const Favorites = {
  init() {
    try {
      const raw = JSON.parse(localStorage.getItem(CONFIG.keys.favorites) || '[]');
      State.favorites = new Set(Array.isArray(raw) ? raw : []);
    } catch { State.favorites = new Set(); }
  },
  has(id) { return State.favorites.has(id); },
  toggle(id) {
    State.favorites.has(id) ? State.favorites.delete(id) : State.favorites.add(id);
    this.save();
    return this.has(id);
  },
  save() {
    localStorage.setItem(CONFIG.keys.favorites, JSON.stringify([...State.favorites]));
  },
};

/* ============================================================
   ۱۵ · PLAYER
   ============================================================ */
const Player = {
  audio: null,

  init() {
    this.audio = $('#audio');
    if (!this.audio) return;

    const savedVol = parseFloat(localStorage.getItem(CONFIG.keys.volume) || '');
    State.volume = isFinite(savedVol) ? clamp(savedVol, 0, 1) : 0.7;
    this.audio.volume = State.volume;
    this.updateVolumeUI();

    this.bindAudio();
    this.bindControls();
    this.bindProgress();
    this.bindVolume();
    this.bindKeyboard();
  },

  bindAudio() {
    const a = this.audio;

    a.addEventListener('loadedmetadata', () => {
      const t = State.tracks[State.current];
      if (!t) return;
      if (isFinite(a.duration)) {
        t.duration = a.duration;
        updatePlayerDuration(a.duration);
        const card = document.querySelector(`.track[data-id="${t.id}"] .track__duration`);
        if (card) card.textContent = toPersianTime(a.duration);
        const q = document.querySelector(`.queue__item[data-index="${State.current}"] .queue__dur`);
        if (q) q.textContent = toPersianTime(a.duration);
      }
    });

    a.addEventListener('timeupdate', () => {
      if (State.isDraggingProgress) return;
      updateProgressUI(a.currentTime, a.duration);
      updateCurrentTime(a.currentTime);
    });

    a.addEventListener('progress', () => {
      if (!a.buffered.length || !a.duration) return;
      const end = a.buffered.end(a.buffered.length - 1);
      const pct = (end / a.duration) * 100;
      const buf = $('#playerBuffer');
      if (buf) buf.style.width = pct + '%';
    });

    a.addEventListener('play', () => {
      State.isPlaying = true;
      syncPlayUI();
      document.body.classList.add('player-active');
      startVisualizer();
    });

    a.addEventListener('pause', () => {
      State.isPlaying = false;
      syncPlayUI();
      stopVisualizer();
    });

    a.addEventListener('ended', () => this.onEnded());

    a.addEventListener('error', () => {
      const t = State.tracks[State.current];
      const name = t ? t.title : 'قطعه';
      console.error('Audio error:', a.error, 'src:', a.src);
      Toasts.show(`خطا در پخش «${name}». مطمئن شو فایل در پوشه‌ی audio موجود است.`, 'error', 5000);
      State.isPlaying = false;
      syncPlayUI();
      stopVisualizer();
    });
  },

  load(index, autoplay = false) {
    if (index < 0 || index >= State.tracks.length) return;
    const track = State.tracks[index];
    if (!track) return;

    State.current = index;
    this.audio.src = track.src;
    this.audio.load();

    updatePlayerMeta(track);
    updatePlayerDuration(track.duration || 0);
    updateCurrentTime(0);
    updateProgressUI(0, track.duration || 0);
    const buf = $('#playerBuffer');
    if (buf) buf.style.width = '0%';

    const like = $('#playerLike');
    if (like) {
      const liked = Favorites.has(track.id);
      like.classList.toggle('is-liked', liked);
      like.setAttribute('aria-pressed', liked ? 'true' : 'false');
    }

    $('#player')?.classList.add('is-visible');

    renderTracks();
    renderQueue();

    if (autoplay) this.play();
  },

  play() {
    if (State.current < 0) {
      if (State.tracks.length) this.load(0, true);
      return;
    }
    const p = this.audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(err => {
        console.warn('Play rejected:', err);
      });
    }
  },

  pause() { this.audio.pause(); },

  toggle() { State.isPlaying ? this.pause() : this.play(); },

  next(auto = false) {
    if (State.current < 0) return this.play();
    let i;
    if (State.shuffle) {
      if (State.tracks.length === 1) i = 0;
      else { do { i = Math.floor(Math.random() * State.tracks.length); } while (i === State.current); }
    } else {
      i = State.current + 1;
      if (i >= State.tracks.length) {
        if (State.repeat === 'all') i = 0;
        else if (auto) { this.pause(); return; }
        else i = 0;
      }
    }
    this.load(i, true);
  },

  prev() {
    if (State.current < 0) return;
    if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
    let i = State.current - 1;
    if (i < 0) i = State.tracks.length - 1;
    this.load(i, true);
  },

  onEnded() {
    if (State.repeat === 'one') {
      this.audio.currentTime = 0;
      this.play();
      return;
    }
    this.next(true);
  },

  seekTo(ratio) {
    if (!isFinite(this.audio.duration)) return;
    this.audio.currentTime = clamp(ratio, 0, 1) * this.audio.duration;
  },

  bindControls() {
    $('#playerPlay')?.addEventListener('click', () => this.toggle());
    $('#playerPrev')?.addEventListener('click', () => this.prev());
    $('#playerNext')?.addEventListener('click', () => this.next());

    const sh = $('#playerShuffle');
    sh?.addEventListener('click', () => {
      State.shuffle = !State.shuffle;
      sh.classList.toggle('is-active', State.shuffle);
      sh.setAttribute('aria-pressed', State.shuffle ? 'true' : 'false');
      Toasts.show(State.shuffle ? 'پخش تصادفی روشن شد.' : 'پخش تصادفی خاموش شد.', 'info', 1800);
    });

    const rp = $('#playerRepeat');
    rp?.addEventListener('click', () => {
      const cycle = { off: 'all', all: 'one', one: 'off' };
      State.repeat = cycle[State.repeat];
      rp.classList.toggle('is-active', State.repeat !== 'off');
      rp.setAttribute('aria-pressed', State.repeat !== 'off' ? 'true' : 'false');
      Toasts.show(
        State.repeat === 'off' ? 'تکرار خاموش.' :
        State.repeat === 'all' ? 'تکرار همه.'    : 'تکرار یک قطعه.',
        'info', 1600
      );
    });

    const like = $('#playerLike');
    like?.addEventListener('click', () => {
      if (State.current < 0) return;
      const t = State.tracks[State.current];
      const liked = Favorites.toggle(t.id);
      like.classList.toggle('is-liked', liked);
      like.setAttribute('aria-pressed', liked ? 'true' : 'false');
      renderTracks();
      if (liked) Toasts.show('به محبوب‌ها اضافه شد.', 'success', 1800);
    });

    const qBtn = $('#playerQueueBtn');
    const q = $('#queue');
    $('#playerQueueBtn')?.addEventListener('click', () => {
      const open = q.classList.toggle('is-open');
      qBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      q.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    $('#queueClose')?.addEventListener('click', () => {
      q.classList.remove('is-open');
      qBtn?.setAttribute('aria-expanded', 'false');
      q?.setAttribute('aria-hidden', 'true');
    });

    $('#playerMute')?.addEventListener('click', () => {
      State.muted = !State.muted;
      this.audio.muted = State.muted;
      this.updateVolumeUI();
    });
  },

  bindProgress() {
    const el = $('#playerProgress');
    if (!el) return;

    const ratio = e => {
      const r = el.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      return clamp((r.right - x) / r.width, 0, 1);
    };

    const update = e => {
      const p = ratio(e);
      if (isFinite(this.audio.duration)) {
        updateProgressUI(p * this.audio.duration, this.audio.duration);
        updateCurrentTime(p * this.audio.duration);
      }
    };

    el.addEventListener('pointerdown', e => {
      State.isDraggingProgress = true;
      el.setPointerCapture?.(e.pointerId);
      update(e);
    });
    el.addEventListener('pointermove', e => { if (State.isDraggingProgress) update(e); });
    el.addEventListener('pointerup', e => {
      if (!State.isDraggingProgress) return;
      State.isDraggingProgress = false;
      this.seekTo(ratio(e));
    });
    el.addEventListener('pointercancel', () => { State.isDraggingProgress = false; });

    el.addEventListener('keydown', e => {
      if (!isFinite(this.audio.duration)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); this.audio.currentTime = clamp(this.audio.currentTime - 5, 0, this.audio.duration); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.audio.currentTime = clamp(this.audio.currentTime + 5, 0, this.audio.duration); }
    });
  },

  bindVolume() {
    const el = $('#playerVolume');
    if (!el) return;

    const ratio = e => {
      const r = el.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      return clamp((r.right - x) / r.width, 0, 1);
    };

    const set = r => {
      State.volume = r;
      State.muted = r === 0;
      this.audio.volume = r;
      this.audio.muted = State.muted;
      this.updateVolumeUI();
      localStorage.setItem(CONFIG.keys.volume, String(r));
    };

    el.addEventListener('pointerdown', e => {
      State.isDraggingVolume = true;
      el.setPointerCapture?.(e.pointerId);
      set(ratio(e));
    });
    el.addEventListener('pointermove', e => { if (State.isDraggingVolume) set(ratio(e)); });
    el.addEventListener('pointerup', () => { State.isDraggingVolume = false; });
    el.addEventListener('pointercancel', () => { State.isDraggingVolume = false; });
  },

  bindKeyboard() {
    addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case ' ': e.preventDefault(); this.toggle(); break;
        case 'ArrowRight':
          if (isFinite(this.audio.duration)) this.audio.currentTime = clamp(this.audio.currentTime - 5, 0, this.audio.duration);
          break;
        case 'ArrowLeft':
          if (isFinite(this.audio.duration)) this.audio.currentTime = clamp(this.audio.currentTime + 5, 0, this.audio.duration);
          break;
        case 'ArrowUp':   e.preventDefault(); this.setVolume(State.volume + 0.05); break;
        case 'ArrowDown': e.preventDefault(); this.setVolume(State.volume - 0.05); break;
        case 'm': case 'M': $('#playerMute')?.click(); break;
        case 'n': case 'N': this.next(); break;
        case 'p': case 'P': this.prev(); break;
      }
    });
  },

  setVolume(v) {
    State.volume = clamp(v, 0, 1);
    this.audio.volume = State.volume;
    this.audio.muted = State.muted = State.volume === 0;
    this.updateVolumeUI();
    localStorage.setItem(CONFIG.keys.volume, String(State.volume));
  },

  updateVolumeUI() {
    const fill = $('#playerVolFill');
    if (fill) fill.style.width = (State.muted ? 0 : State.volume * 100) + '%';

    const btn = $('#playerMute');
    if (!btn) return;

    btn.innerHTML = State.muted
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  },
};

/* ============================================================
   ۱۶ · UI UPDATERS
   ============================================================ */
function updatePlayerMeta(track) {
  const title = $('#playerTitle');
  const artist = $('#playerArtist');
  const art = $('#playerArtImg');
  const fb = $('#playerArtFallback');

  if (title) title.textContent = track.title;
  if (artist) artist.textContent = track.artist;

  if (art && fb) {
    if (track.cover) {
      art.src = track.cover;
      art.hidden = false;
      fb.hidden = true;
    } else {
      art.hidden = true;
      fb.hidden = false;
      fb.textContent = firstLetter(track.title);
    }
  }
  document.title = `${track.title} · هگمتانه`;

  const dl = $('#playerDownload');
  if (dl && track.src) {
    dl.href = track.src;
    dl.setAttribute('download', `${track.title}.mp3`);
  }
}

function updatePlayerDuration(sec) {
  const el = $('#playerDuration');
  if (el) el.textContent = toPersianTime(sec);
}

function updateCurrentTime(sec) {
  const el = $('#playerCurrent');
  if (el) el.textContent = toPersianTime(sec);
}

function updateProgressUI(cur, tot) {
  const pct = tot ? (cur / tot) * 100 : 0;
  const fill = $('#playerFill');
  const thumb = $('#playerThumb');
  const slider = $('#playerProgress');
  if (fill)  fill.style.width = pct + '%';
  if (thumb) thumb.style.right = pct + '%';
  if (slider) slider.setAttribute('aria-valuenow', String(Math.round(pct)));
}

function syncPlayUI() {
  const btn = $('#playerPlay');
  const player = $('#player');
  if (!btn || !player) return;

  const play = btn.querySelector('.icon-play');
  const pause = btn.querySelector('.icon-pause');

  if (State.isPlaying) {
    play?.setAttribute('hidden', '');
    pause?.removeAttribute('hidden');
    btn.setAttribute('aria-label', 'توقف');
    player.classList.add('is-playing');
  } else {
    play?.removeAttribute('hidden');
    pause?.setAttribute('hidden', '');
    btn.setAttribute('aria-label', 'پخش');
    player.classList.remove('is-playing');
  }

  $$('.track').forEach(card => {
    const id = parseInt(card.dataset.id, 10);
    const cur = State.current >= 0 && State.tracks[State.current]?.id === id;
    card.classList.toggle('is-playing', cur && State.isPlaying);
  });
}

/* ============================================================
   ۱۷ · VISUALIZER
   ============================================================ */
let visualizerRAF = null;
let vizPhase = 0;

function startVisualizer() {
  stopVisualizer();

  const loop = () => {
    vizPhase += 0.085;
    const bars = $$('.track.is-playing .track__eq span');

    bars.forEach((b, i) => {
      const w1 = Math.sin(vizPhase + i * 1.35);
      const w2 = Math.sin(vizPhase * 1.7 + i * 0.9) * 0.5;
      const w3 = Math.sin(vizPhase * 2.4 + i * 2.1) * 0.25;
      const v = clamp(0.5 + (w1 + w2 + w3) * 0.5, 0.15, 1);
      b.style.transform = `scaleY(${0.25 + v * 0.95})`;
    });

    visualizerRAF = requestAnimationFrame(loop);
  };
  loop();
}

function stopVisualizer() {
  if (visualizerRAF) { cancelAnimationFrame(visualizerRAF); visualizerRAF = null; }
  $$('.track__eq span').forEach(b => { b.style.transform = ''; });
}

/* ============================================================
   ۱۸ · RENDER TRACKS
   ============================================================ */
function renderTracks() {
  const grid = $('#tracksGrid');
  const empty = $('#tracksEmpty');
  if (!grid) return;

  const list = State.tracks.filter(t => {
    if (State.filter === 'all') return true;
    if (State.filter === 'favorites') return Favorites.has(t.id);
    return t.tags.includes(State.filter);
  });

  if (!list.length) {
    grid.innerHTML = '';
    if (empty) {
      empty.hidden = false;
      empty.querySelector('p').textContent = State.filter === 'favorites'
        ? 'هنوز چیزی را دوست نداشته‌ای. قلب کنار هر آهنگ را بزن.'
        : 'چیزی در این دسته نیست.';
    }
    return;
  }

  if (empty) empty.hidden = true;

  grid.innerHTML = list.map(t => {
    const liked = Favorites.has(t.id);
    const playing = State.current >= 0 && State.tracks[State.current]?.id === t.id;

    return `
      <article class="track ${playing ? 'is-playing' : ''}" data-id="${t.id}" tabindex="0">
        <button class="track__like ${liked ? 'is-liked' : ''}" type="button" aria-label="افزودن به محبوب‌ها" data-like="${t.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </button>

        <a class="track__download" href="${escapeHTML(t.src)}" download="${escapeHTML(t.title)}.mp3" aria-label="دانلود آهنگ" title="دانلود">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <path d="M7 10l5 5 5-5"/>
            <path d="M12 15V3"/>
          </svg>
        </a>

        <div class="track__cover">
          ${t.cover
            ? `<img src="${escapeHTML(t.cover)}" alt="" loading="lazy">`
            : `<span class="track__cover-vinyl" aria-hidden="true">
                 <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                   <defs>
                     <radialGradient id="vShine-${t.id}" cx="32%" cy="26%" r="85%">
                       <stop offset="0%"   stop-color="#4a4258"/>
                       <stop offset="45%"  stop-color="#1e1a2c"/>
                       <stop offset="100%" stop-color="#08060e"/>
                     </radialGradient>
                     <radialGradient id="vLabel-${t.id}" cx="50%" cy="50%" r="50%">
                       <stop offset="0%"   stop-color="#ffd980"/>
                       <stop offset="100%" stop-color="#c69327"/>
                     </radialGradient>
                   </defs>
                   <circle cx="100" cy="100" r="96" fill="url(#vShine-${t.id})"/>
                   <g fill="none" stroke="#ffca61" stroke-width="0.55" opacity="0.18">
                     <circle cx="100" cy="100" r="88"/>
                     <circle cx="100" cy="100" r="80"/>
                     <circle cx="100" cy="100" r="72"/>
                     <circle cx="100" cy="100" r="64"/>
                     <circle cx="100" cy="100" r="56"/>
                     <circle cx="100" cy="100" r="48"/>
                     <circle cx="100" cy="100" r="40"/>
                   </g>
                   <path d="M6 100 Q100 34 194 100" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="28"/>
                   <path d="M30 155 Q100 185 170 155" fill="none" stroke="rgba(255,202,97,0.10)" stroke-width="14"/>
                   <circle cx="100" cy="100" r="30" fill="url(#vLabel-${t.id})"/>
                   <circle cx="100" cy="100" r="26" fill="none" stroke="rgba(13,11,18,0.35)" stroke-width="0.7"/>
                   <g fill="none" stroke="#0d0b12" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
                     <path d="M100 84 L112 91 L112 108 L88 108 L88 91 Z"/>
                     <path d="M94 108 L94 96 M100 108 L100 96 M106 108 L106 96"/>
                     <path d="M92 96 L108 96"/>
                   </g>
                   <circle cx="100" cy="100" r="4.5" fill="#0d0b12"/>
                   <circle cx="100" cy="100" r="3" fill="#000"/>
                 </svg>
               </span>`}
          <button class="track__play" type="button" aria-label="پخش" data-play="${t.id}">
            <svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg class="icon-pause" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          </button>
        </div>

        <div class="track__info">
          <h3 class="track__title">${escapeHTML(t.title)}</h3>
          <p class="track__artist">${escapeHTML(t.artist)}</p>
          <div class="track__meta">
            <div class="track__meta-left">
              <span class="track__eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
              <span class="track__duration">${toPersianTime(t.duration || 0)}</span>
            </div>
            ${t.tags.includes('new') ? '<span class="track__tag">تازه</span>' : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  bindTrackEvents();
}

function bindTrackEvents() {
  $$('.track').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-like]')) return;
      if (e.target.closest('.track__download')) return;
      const id = parseInt(card.dataset.id, 10);
      const idx = State.tracks.findIndex(t => t.id === id);
      if (idx >= 0) Player.load(idx, true);
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  $$('[data-play]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.play, 10);
      const idx = State.tracks.findIndex(t => t.id === id);
      if (idx < 0) return;
      State.current === idx ? Player.toggle() : Player.load(idx, true);
    });
  });

  $$('[data-like]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.like, 10);
      const liked = Favorites.toggle(id);
      btn.classList.toggle('is-liked', liked);
      const pl = $('#playerLike');
      if (pl && State.current >= 0 && State.tracks[State.current]?.id === id) {
        pl.classList.toggle('is-liked', liked);
        pl.setAttribute('aria-pressed', liked ? 'true' : 'false');
      }
      if (liked) Toasts.show('به محبوب‌ها اضافه شد.', 'success', 2200);
      if (State.filter === 'favorites') renderTracks();
    });
  });

  $$('.track__download').forEach(btn => {
    btn.addEventListener('click', e => e.stopPropagation());
  });
}

/* ============================================================
   ۱۹ · FILTERS
   ============================================================ */
function initFilters() {
  const wrap = $('#trackFilters');
  if (!wrap) return;

  wrap.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    $$('.chip', wrap).forEach(c => {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    });
    chip.classList.add('is-active');
    chip.setAttribute('aria-selected', 'true');

    State.filter = chip.dataset.filter || 'all';
    renderTracks();
  });
}

/* ============================================================
   ۲۰ · QUEUE
   ============================================================ */
function renderQueue() {
  const list = $('#queueList');
  if (!list) return;

  if (!State.tracks.length) { list.innerHTML = ''; return; }

  list.innerHTML = State.tracks.map((t, i) => `
    <li class="queue__item ${State.current === i ? 'is-current' : ''}" data-index="${i}" tabindex="0">
      <span class="queue__num">${toPersianDigits(i + 1)}</span>
      <div class="queue__info">
        <div class="queue__name">${escapeHTML(t.title)}</div>
        <div class="queue__artist">${escapeHTML(t.artist)}</div>
      </div>
      <span class="queue__dur">${toPersianTime(t.duration || 0)}</span>
    </li>
  `).join('');

  $$('.queue__item', list).forEach(item => {
    const go = () => {
      const idx = parseInt(item.dataset.index, 10);
      idx === State.current ? Player.toggle() : Player.load(idx, true);
    };
    item.addEventListener('click', go);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
}

/* ============================================================
   ۲۱ · SEARCH
   ============================================================ */
const Search = {
  input: null, panel: null, clear: null, sel: -1,

  init() {
    this.input = $('#searchInput');
    this.panel = $('#searchPanel');
    this.clear = $('#searchClear');
    if (!this.input || !this.panel) return;

    this.input.addEventListener('input', debounce(() => this.run(), 140));
    this.input.addEventListener('focus', () => this.run());
    this.input.addEventListener('keydown', e => this.onKey(e));
    this.clear?.addEventListener('click', () => this.reset());

    document.addEventListener('click', e => {
      if (!e.target.closest('.search')) this.close();
    });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.input.focus();
        this.input.select();
      }
    });
  },

  run() {
    const q = this.input.value.trim();
    this.clear?.classList.toggle('is-visible', q.length > 0);
    if (!q) { this.close(); return; }

    const lq = q.toLowerCase();
    const results = State.tracks.filter(t =>
      t.title.toLowerCase().includes(lq) ||
      t.artist.toLowerCase().includes(lq)
    ).slice(0, 8);

    this.render(results, q);
    this.open();
  },

  render(results, q) {
    if (!results.length) {
      this.panel.innerHTML = `<div class="search__panel-empty">چیزی برای «<strong>${escapeHTML(q)}</strong>» پیدا نشد.</div>`;
      return;
    }

    this.panel.innerHTML = results.map((t, i) => `
      <div class="search__result" data-index="${i}" data-id="${t.id}" role="option">
        <div class="search__result-cover">
          ${t.cover ? `<img src="${escapeHTML(t.cover)}" alt="" loading="lazy">` : escapeHTML(firstLetter(t.title))}
        </div>
        <div class="search__result-info">
          <div class="search__result-title">${highlight(t.title, q)}</div>
          <div class="search__result-meta">${escapeHTML(t.artist)} · ${toPersianTime(t.duration || 0)}</div>
        </div>
        <div class="search__result-play">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    `).join('');

    $$('.search__result', this.panel).forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.id, 10);
        const idx = State.tracks.findIndex(t => t.id === id);
        if (idx >= 0) {
          Player.load(idx, true);
          this.reset();
          this.input.blur();
        }
      });
    });
    this.sel = -1;
  },

  onKey(e) {
    if (e.key === 'Escape') { this.reset(); this.input.blur(); return; }
    const items = $$('.search__result', this.panel);
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.sel = (this.sel + 1) % items.length;
      items.forEach((el, i) => el.classList.toggle('is-selected', i === this.sel));
      items[this.sel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.sel = (this.sel - 1 + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('is-selected', i === this.sel));
      items[this.sel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && this.sel >= 0) {
      e.preventDefault();
      items[this.sel].click();
    }
  },

  open()  { this.panel.classList.add('is-open'); },
  close() { this.panel.classList.remove('is-open'); },

  reset() {
    this.input.value = '';
    this.clear?.classList.remove('is-visible');
    this.panel.innerHTML = '';
    this.close();
    this.sel = -1;
  },
};

/* ============================================================
   ۲۲ · CONTACT FORM
   ============================================================ */
const ContactForm = {
  rules: {
    'cf-name': v => !v.trim() ? 'نام خود را وارد کنید.'
                 : v.trim().length < 2 ? 'نام باید حداقل ۲ حرف باشد.' : '',
    'cf-email': v => !v.trim() ? 'ایمیل خود را وارد کنید.'
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'ایمیل معتبر نیست.' : '',
    'cf-subject': v => !v ? 'موضوع را انتخاب کنید.' : '',
    'cf-message': v => !v.trim() ? 'پیام خود را بنویسید.'
                    : v.trim().length < 10 ? 'پیام باید حداقل ۱۰ حرف باشد.'
                    : v.length > 1000 ? 'پیام بیش از حد طولانی است.' : '',
  },

  init() {
    const form = $('#contactForm');
    if (!form) return;

    Object.keys(this.rules).forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('blur', () => this.validate(id));
      input.addEventListener('input', () => {
        if (input.closest('.field')?.classList.contains('has-error')) this.validate(id);
      });
    });

    const msg = $('#cf-message');
    const cnt = $('#cf-count');
    if (msg && cnt) {
      msg.setAttribute('maxlength', '1000');
      msg.addEventListener('input', () => {
        cnt.textContent = toPersianDigits(msg.value.length);
      });
    }

    form.addEventListener('submit', e => { e.preventDefault(); this.submit(); });
  },

  validate(id) {
    const input = document.getElementById(id);
    const field = input?.closest('.field');
    const rule = this.rules[id];
    if (!input || !field || !rule) return true;

    const err = rule(input.value);
    const errEl = field.querySelector('.field__error');

    if (err) {
      field.classList.add('has-error');
      if (errEl) errEl.textContent = err;
      return false;
    }
    field.classList.remove('has-error');
    if (errEl) errEl.textContent = '';
    return true;
  },

  validateAll() {
    return Object.keys(this.rules).map(id => this.validate(id)).every(Boolean);
  },

  submit() {
    if (!this.validateAll()) {
      $('.field.has-error input, .field.has-error textarea, .field.has-error select')?.focus();
      Toasts.show('لطفاً خطاهای فرم را برطرف کن.', 'error', 2600);
      return;
    }

    const btn = $('#cf-submit');
    const name = $('#cf-name')?.value.trim() || '';
    const email = $('#cf-email')?.value.trim() || '';
    const subject = $('#cf-subject')?.value || '';
    const message = $('#cf-message')?.value.trim() || '';

    btn?.classList.add('is-loading');
    if (btn) btn.disabled = true;

    const mSubject = encodeURIComponent(`[هگمتانه] ${subject} — از طرف ${name}`);
    const mBody = encodeURIComponent(`نام: ${name}\nایمیل: ${email}\nموضوع: ${subject}\n\n${message}`);

    setTimeout(() => {
      btn?.classList.remove('is-loading');
      if (btn) btn.disabled = false;

      window.location.href = `mailto:${CONFIG.email}?subject=${mSubject}&body=${mBody}`;
      Toasts.show('پیام آماده ارسال شد. اگر ایمیل باز نشد، از تلگرام استفاده کن.', 'success', 5200);

      $('#contactForm')?.reset();
      if ($('#cf-count')) $('#cf-count').textContent = '۰';
      $$('.field').forEach(f => {
        f.classList.remove('has-error');
        const e = f.querySelector('.field__error');
        if (e) e.textContent = '';
      });
    }, 700);
  },
};

/* ============================================================
   ۲۳ · CARD TILT
   ============================================================ */
function initCardTilt() {
  if (isTouchDevice || prefersReducedMotion) return;

  document.addEventListener('mousemove', e => {
    $$('.track').forEach(card => {
      const r = card.getBoundingClientRect();
      if (e.clientX < r.left - 40 || e.clientX > r.right + 40 ||
          e.clientY < r.top - 40  || e.clientY > r.bottom + 40) {
        card.style.transform = '';
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '0%');
        return;
      }
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;
      const rx = (0.5 - y) * 6;
      const ry = (x - 0.5) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty('--mx', x * 100 + '%');
      card.style.setProperty('--my', y * 100 + '%');
    });
  });
}

/* ============================================================
   ۲۴ · RIPPLE
   ============================================================ */
function initRipple() {
  if (prefersReducedMotion) return;

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .chip, .player__btn--play');
    if (!btn) return;

    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const x = e.clientX - r.left - size / 2;
    const y = e.clientY - r.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      left:${x}px;top:${y}px;border-radius:50%;
      background:rgba(255,255,255,0.35);pointer-events:none;
      transform:scale(0);animation:rippleGrow 620ms cubic-bezier(0.16,1,0.3,1) forwards;z-index:0;
    `;
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

(function () {
  if (document.getElementById('ripple-kf')) return;
  const s = document.createElement('style');
  s.id = 'ripple-kf';
  s.textContent = '@keyframes rippleGrow{to{transform:scale(1);opacity:0}}';
  document.head.appendChild(s);
})();

/* ============================================================
   ۲۵ · CLICK PARTICLES
   ============================================================ */
function initClickParticles() {
  if (prefersReducedMotion) return;

  const COLORS = ['#ffca61', '#e0a83a', '#3a878c', '#c63d66'];
  const COUNT  = 10;

  document.addEventListener('click', e => {
    if (e.target.closest('input, textarea, select')) return;

    const x = e.clientX;
    const y = e.clientY;

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'click-particle';

      const angle    = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.6;
      const distance = 45 + Math.random() * 70;
      const dx       = Math.cos(angle) * distance;
      const dy       = Math.sin(angle) * distance;
      const size     = 3 + Math.random() * 4;
      const color    = COLORS[Math.floor(Math.random() * COLORS.length)];
      const duration = 700 + Math.random() * 450;
      const delay    = Math.random() * 70;

      p.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        color: ${color};
        --dx: ${dx}px;
        --dy: ${dy}px;
        animation-duration: ${duration}ms;
        animation-delay: ${delay}ms;
      `;

      document.body.appendChild(p);
      setTimeout(() => p.remove(), duration + delay + 100);
    }
  }, { passive: true });
}

/* ============================================================
   ۲۶ · PRELOAD DURATIONS  ← بهینه‌سازی: فقط ۳ آهنگ اول
   ============================================================ */
function preloadDurations() {
  /* فقط ۳ آهنگ اول از قبل خوانده می‌شوند تا سرور خفه نشود */
  State.tracks.slice(0, 3).forEach((track, i) => {
    if (!track.src) return;
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.src = track.src;

    a.addEventListener('loadedmetadata', () => {
      track.duration = a.duration;
      const d = document.querySelector(`.track[data-id="${track.id}"] .track__duration`);
      if (d) d.textContent = toPersianTime(a.duration);
      const q = document.querySelector(`.queue__item[data-index="${i}"] .queue__dur`);
      if (q) q.textContent = toPersianTime(a.duration);
    }, { once: true });

    a.addEventListener('error', () => {
      console.warn(`Could not read duration for ${track.src}`);
    }, { once: true });
  });
}

/* ============================================================
   ۲۷ · BOOT
   ============================================================ */
function boot() {
  initPreloader();
  Theme.init();
  Favorites.init();
  Toasts.init();

  State.tracks = CONFIG.tracks.map(t => ({ ...t, duration: 0, tags: t.tags || [] }));

  renderTracks();
  renderQueue();

  initHeader();
  initDrawer();
  initCursor();
  initParticles();
  initReveal();
  initStats();
  initYear();
  initFilters();
  initCardTilt();
  initRipple();
  initClickParticles();
  Search.init();
  Player.init();
  ContactForm.init();

  Player.updateVolumeUI();
  preloadDurations();

  setTimeout(() => {
    Toasts.show('به هگمتانه خوش آمدی. برای پخش، روی هر قطعه کلیک کن.', 'info', 4200);
  }, 3200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

/* Debug handle */
window.__hegmataneh = { State, Player, Search, Favorites, Toasts, CONFIG };
