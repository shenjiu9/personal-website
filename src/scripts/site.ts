// Site-wide progressive enhancement. Kept tiny on purpose.
const doc = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal — fade + 24px rise, once.
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
);
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

// Nav: thin bar after scrolling.
const nav = document.querySelector<HTMLElement>('[data-nav]');
const onScroll = () => nav?.classList.toggle('is-scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu.
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const setMenu = (open: boolean) => {
  if (!toggle || !menu) return;
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? toggle.dataset.close! : toggle.dataset.open!;
  doc.style.overflow = open ? 'hidden' : '';
};
toggle?.addEventListener('click', () => setMenu(menu?.hidden ?? false));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

// Copy email.
document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach((btn) => {
  const label = btn.querySelector('span') ?? btn;
  const original = label.textContent;
  let timer: number | undefined;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.copyEmail!;
    try {
      await navigator.clipboard.writeText(email);
      label.textContent = btn.dataset.copied ?? 'Copied';
      clearTimeout(timer);
      timer = window.setTimeout(() => (label.textContent = original), 1500);
    } catch {
      location.href = `mailto:${email}`;
    }
  });
});

// Remember the chosen language (never auto-redirect).
document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((a) =>
  a.addEventListener('click', () => {
    try { localStorage.setItem('lang', a.dataset.langSwitch!); } catch {}
  }),
);

// Hero/case videos: pause button.
document.querySelectorAll<HTMLButtonElement>('[data-video-toggle]').forEach((btn) => {
  const video = btn.parentElement?.querySelector('video');
  if (!video) return;
  if (reduced) video.pause();
  const sync = () => {
    btn.textContent = video.paused ? btn.dataset.play! : btn.dataset.pause!;
  };
  btn.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
});

// Light smooth scrolling on fine pointers only.
if (!reduced && matchMedia('(pointer: fine)').matches) {
  import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1, anchors: true });
    const raf = (t: number) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  });
}

const fine = matchMedia('(pointer: fine)').matches;

// Hero: upgrade to the WebGL composition on capable desktops, after the page is idle.
const glHost = document.querySelector<HTMLElement>('[data-hero-gl]');
if (glHost && fine && !reduced && innerWidth >= 1024) {
  const canWebGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 600));
  if (canWebGL) idle(() => import('./hero-gl').then((m) => m.initHeroGL(glHost)).catch(() => {}));
}

// Hero composition: layers drift with the pointer by their data-depth.
const art = document.querySelector<HTMLElement>('[data-parallax]');
if (art && fine && !reduced) {
  const layers = [...art.querySelectorAll<SVGGElement>('[data-depth]')];
  let raf = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => {
    tx = e.clientX / innerWidth - 0.5;
    ty = e.clientY / innerHeight - 0.5;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      for (const l of layers) {
        const d = Number(l.dataset.depth) * 28;
        l.style.transform = `translate(${-tx * d}px, ${-ty * d}px)`;
      }
    });
  });
}

// Section labels "decode" once as they appear.
const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·—';
const scramble = (el: HTMLElement) => {
  const final = el.textContent ?? '';
  if (reduced || !final) return;
  const chars = [...final];
  let frame = 0;
  const total = 14;
  const tick = () => {
    el.textContent = chars
      .map((c, i) => (c === ' ' || frame / total > i / chars.length + 0.2 ? c : glyphs[(Math.random() * glyphs.length) | 0]))
      .join('');
    if (++frame <= total) setTimeout(tick, 32);
    else el.textContent = final;
  };
  tick();
};
const sio = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { scramble(e.target as HTMLElement); sio.unobserve(e.target); }
}, { threshold: 0.6 });
document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => sio.observe(el));

// "View case" pill trails the pointer over work images.
const label = document.querySelector<HTMLElement>('[data-cursor-label]');
if (label && fine) {
  let raf = 0, x = 0, y = 0;
  const place = () => { label.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`; raf = 0; };
  document.querySelectorAll<HTMLElement>('[data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => label.classList.add('is-on'));
    el.addEventListener('pointerleave', () => label.classList.remove('is-on'));
    el.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); });
  });
}

// Footer local clock (Beijing time).
const clock = document.querySelector<HTMLElement>('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' });
  const tickClock = () => (clock.textContent = fmt.format(new Date()));
  tickClock();
  setInterval(tickClock, 30_000);
}
