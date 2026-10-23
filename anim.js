(() => {
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;

// ---------- CSS ----------
const st = document.createElement('style');
let d = ''; for (let i = 1; i <= 12; i++) d += `#plist>div:nth-child(${i}){animation-delay:${i * 50}ms}`;
st.textContent = `
.rv2{opacity:0;transform:translateY(22px) scale(.98);transition:opacity .6s ease,transform .6s ease}.rv2.in2{opacity:1;transform:none}
#plist>div{animation:up .5s ease both}@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}${d}
main .grid>div,main .space-y-4>div,main .space-y-6>div{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
main .grid>div:hover,main .space-y-4>div:hover{transform:translateY(-3px);box-shadow:0 10px 25px -10px rgba(56,189,248,.35);border-color:rgba(56,189,248,.5)}
.name-grad{background:linear-gradient(90deg,#38bdf8,#a78bfa,#34d399,#38bdf8);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:gs 8s linear infinite}
@keyframes gs{to{background-position:300% 0}}
.float{animation:fl 5s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-8px)}}
header{transition:box-shadow .3s}header.scrolled{box-shadow:0 6px 20px -8px rgba(0,0,0,.5)}
`;
document.head.append(st);

// ---------- Name gradient + floating photo ----------
const name = $('h2'); if (name) name.classList.add('name-grad');
const ph = $('img[alt="Md. Rahatul Islam"]'); if (ph) ph.parentElement.classList.add('float');

// ---------- Header shadow ----------
const hd = $('header'); addEventListener('scroll', () => hd.classList.toggle('scrolled', scrollY > 20), { passive: true });

// ---------- Staggered reveal of inner items ----------
const sel = 'main .grid>div, main .space-y-4>div, main .space-y-6>div, main .space-y-3>div, main .border-l-2>div, main li';
const items = $$(sel).filter(el => !el.closest('#plist, #terminal, .cite') && !el.closest('.pub-btn') && !el.matches('.rv'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; const el = e.target; io.unobserve(el);
  requestAnimationFrame(() => el.classList.add('in2'));
  setTimeout(() => { el.classList.remove('rv2', 'in2'); el.style.transitionDelay = ''; }, 900 + parseInt(el.style.transitionDelay || 0));
}), { threshold: .05 });
const idx = new Map();
items.forEach(el => { const p = el.parentElement, i = idx.get(p) || 0; idx.set(p, i + 1); el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms'; el.classList.add('rv2'); io.observe(el); });

// ---------- Count-up numbers (hero metrics) ----------
$$('.grid-cols-3 > div > span').forEach(s => {
  const to = parseInt(s.textContent); if (!/^\d+$/.test(s.textContent.trim())) return;
  s.textContent = '0';
  new IntersectionObserver((es, ob) => { if (!es[0].isIntersecting) return; ob.disconnect(); const t0 = performance.now();
    const f = t => { const p = Math.min((t - t0) / 1200, 1); s.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f);
  }).observe(s);
});

// ---------- Site-wide particle background ----------
const cv = document.createElement('canvas');
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:.55';
document.body.prepend(cv);
const g = cv.getContext('2d'); let W, H, pts = [];
const size = () => { const r = devicePixelRatio || 1; W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; g.setTransform(r, 0, 0, r, 0, 0);
  pts = Array.from({ length: Math.min(70, Math.round(W * H / 22000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 })); };
const draw = () => {
  g.clearRect(0, 0, W, H); const col = root.classList.contains('light') ? '3,105,161' : '56,189,248';
  pts.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
    g.fillStyle = `rgba(${col},.6)`; g.beginPath(); g.arc(p.x, p.y, 1.5, 0, 6.3); g.fill();
    for (let j = i + 1; j < pts.length; j++) { const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, dd = dx * dx + dy * dy;
      if (dd < 14400) { g.strokeStyle = `rgba(${col},${.22 * (1 - dd / 14400)})`; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); } }
  });
  requestAnimationFrame(draw);
};
size(); draw(); addEventListener('resize', size);

// ---------- Mouse glow (desktop only) ----------
if (matchMedia('(pointer:fine)').matches) {
  const gl = document.createElement('div');
  gl.style.cssText = 'position:fixed;left:0;top:0;width:420px;height:420px;border-radius:50%;pointer-events:none;z-index:40;background:radial-gradient(circle,rgba(56,189,248,.10),transparent 65%);transform:translate(-999px,-999px)';
  document.body.append(gl); let mx = 0, my = 0, q = false;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (!q) { q = true; requestAnimationFrame(() => { gl.style.transform = `translate(${mx - 210}px,${my - 210}px)`; q = false; }); } });
}
})();
