(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- CSS ----------
const st = document.createElement('style');
st.textContent = `
html{scroll-padding-top:90px}
.rv{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}.rv.in{opacity:1;transform:none}
html.light body{background:#f8fafc!important;color:#0f172a}
html.light [class*="bg-slate-950"]{background-color:#f1f5f9!important}
html.light [class*="bg-slate-900"]{background-color:#fff!important}
html.light [class*="bg-slate-800"]{background-color:#e2e8f0!important}
html.light [class*="bg-slate-700"]{background-color:#cbd5e1!important}
html.light [class*="border-slate-"]{border-color:#cbd5e1!important}
html.light .bg-gradient-to-b{background-image:none!important;background-color:#eef2f7!important}
html.light .text-slate-100,html.light .text-slate-200,html.light .text-slate-300{color:#1e293b!important}
html.light .text-slate-400,html.light .text-slate-500{color:#475569!important}
html.light .text-sky-400,html.light .text-sky-300{color:#0369a1!important}
html.light .text-emerald-400{color:#047857!important}
html.light .text-amber-400{color:#b45309!important}
html.light h3.text-white{color:#0f172a!important}
html.light [class*="bg-sky-950"]{background-color:#e0f2fe!important}
html.light [class*="bg-emerald-950"]{background-color:#d1fae5!important}
html.light [class*="bg-amber-950"]{background-color:#fef3c7!important}
html.light [class*="bg-red-950"]{background-color:#fee2e2!important}
html.light .text-red-300{color:#b91c1c!important}
html.light .terminal-bg .text-slate-300,html.light .terminal-bg .text-slate-400{color:#cbd5e1!important}
html.light #net text{fill:#334155!important}
.caret{animation:bl 1s steps(1) infinite}@keyframes bl{50%{opacity:0}}
`;
document.head.append(st);

// ---------- Helper: floating button ----------
const fab = document.createElement('div');
fab.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
const btn = (icon, label) => { const b = document.createElement('button'); b.setAttribute('aria-label', label); b.className = 'w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-lg flex items-center justify-center'; b.innerHTML = `<i class="fas ${icon}"></i>`; return b; };
const up = btn('fa-arrow-up', 'Back to top'), tb = btn('fa-sun', 'Toggle theme');
up.style.display = 'none'; up.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
fab.append(up, tb); document.body.append(fab);

// ---------- Dark / Light ----------
const setTheme = light => {
  root.classList.toggle('light', light);
  tb.firstChild.className = 'fas ' + (light ? 'fa-moon' : 'fa-sun');
  try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
};
let saved; try { saved = localStorage.getItem('theme'); } catch (e) {}
setTheme(saved === 'light');
tb.onclick = () => setTheme(!root.classList.contains('light'));

// ---------- Mobile hamburger ----------
const h1 = $('header h1'), nav = $('header nav');
const bar = document.createElement('div'); bar.className = 'flex w-full md:w-auto justify-between items-center';
h1.replaceWith(bar); bar.append(h1);
const hb = document.createElement('button'); hb.setAttribute('aria-label', 'Menu'); hb.className = 'md:hidden text-sky-400 text-xl px-2'; hb.innerHTML = '<i class="fas fa-bars"></i>';
bar.append(hb); nav.classList.add('hidden', 'md:flex');
hb.onclick = () => { const closed = nav.classList.toggle('hidden'); hb.firstChild.className = 'fas ' + (closed ? 'fa-bars' : 'fa-times'); };
nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.add('hidden'); hb.firstChild.className = 'fas fa-bars'; } });

// ---------- Progress bar + scroll-spy + back-to-top ----------
const pb = document.createElement('div'); pb.className = 'fixed top-0 left-0 h-1 bg-sky-500 z-[60]'; pb.style.width = '0'; document.body.append(pb);
const links = $$('header nav a'), secs = links.map(a => $(a.getAttribute('href')));
const onScroll = () => {
  const y = scrollY, h = root.scrollHeight - innerHeight;
  pb.style.width = (h > 0 ? y / h * 100 : 0) + '%'; up.style.display = y > 400 ? 'flex' : 'none';
  let cur = -1, best = -1e9;
  secs.forEach((s, i) => { if (!s) return; const t = s.getBoundingClientRect().top; if (t <= 140 && t > best) { best = t; cur = i; } });
  if (h > 0 && y >= h - 4) cur = links.length - 1;
  links.forEach((a, i) => ['text-sky-400', 'border-b', 'border-sky-400'].forEach(c => a.classList.toggle(c, i === cur)));
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ---------- Scroll reveal ----------
if (!reduce) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .06 });
  $$('main section').forEach(s => { s.classList.add('rv'); io.observe(s); });
}

// ---------- Typing animation ----------
const ty = document.createElement('p'); ty.className = 'font-mono text-sky-400 text-sm sm:text-lg mb-3 h-7';
$('h2').after(ty);
const W = ['Computer Vision Researcher', 'Deep Learning · Person Re-ID', 'Robotics & AI Engineer'];
if (reduce) ty.textContent = W.join(' | ');
else { let w = 0, c = 0, d = 1;
  const tick = () => {
    const s = W[w]; c += d; ty.textContent = s.slice(0, c) + '▌';
    let delay = d > 0 ? 70 : 35;
    if (d > 0 && c === s.length) { d = -1; delay = 1500; }
    else if (d < 0 && c === 0) { d = 1; w = (w + 1) % W.length; delay = 400; }
    setTimeout(tick, delay);
  }; tick(); }

// ---------- Particle network (hero background) ----------
if (!reduce) {
  const hero = $('body > section'); hero.classList.add('relative', 'overflow-hidden');
  const inner = $(':scope > div', hero); inner.classList.add('relative', 'z-10');
  const cv = document.createElement('canvas'); cv.className = 'absolute inset-0 w-full h-full pointer-events-none'; hero.prepend(cv);
  const g = cv.getContext('2d'); let Wd, Ht, pts = [], run = true;
  const size = () => {
    const r = hero.getBoundingClientRect(), dpr = devicePixelRatio || 1; Wd = r.width; Ht = r.height;
    cv.width = Wd * dpr; cv.height = Ht * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = Array.from({ length: Math.min(90, Math.round(Wd * Ht / 16000)) }, () => ({ x: Math.random() * Wd, y: Math.random() * Ht, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 }));
  };
  const draw = () => {
    if (!run) return; g.clearRect(0, 0, Wd, Ht);
    const col = root.classList.contains('light') ? '3,105,161' : '56,189,248';
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > Wd) p.vx *= -1; if (p.y < 0 || p.y > Ht) p.vy *= -1;
      g.fillStyle = `rgba(${col},.7)`; g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 6.3); g.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, dd = dx * dx + dy * dy;
        if (dd < 12100) { g.strokeStyle = `rgba(${col},${.25 * (1 - dd / 12100)})`; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); }
      }
    });
    requestAnimationFrame(draw);
  };
  size(); draw(); addEventListener('resize', size);
  new IntersectionObserver(e => { const v = e[0].isIntersecting; if (v && !run) { run = true; draw(); } else if (!v) run = false; }).observe(hero);
}
})();
