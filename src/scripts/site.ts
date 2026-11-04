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
