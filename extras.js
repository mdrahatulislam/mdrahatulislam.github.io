(() => {
// ===== Analytics: যেকোনো একটির কোড বসান (খালি থাকলে কিছুই লোড হবে না) =====
// GoatCounter: goatcounter.com-এ ফ্রি অ্যাকাউন্ট খুলে কোড লিখুন (yourcode.goatcounter.com হলে 'yourcode')
// Plausible: ডোমেইন লিখুন, যেমন 'rahatulislam.dev'
const ANALYTICS = { goatcounter: '', plausible: '' };

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const load = s => new Promise(r => { const e = document.createElement('script'); e.src = s; e.onload = r; e.onerror = r; document.head.append(e); });

// ---------- CSS ----------
const st = document.createElement('style');
st.textContent = `
.awx{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
.awx-track{display:flex;width:max-content;animation:mq 40s linear infinite;padding:6px 0}.awx:hover .awx-track{animation-play-state:paused}@keyframes mq{to{transform:translateX(-50%)}}
.bdg{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:14px;margin-right:14px;position:relative;overflow:hidden;white-space:nowrap;border:1px solid;transition:transform .25s}
.bdg:hover{transform:scale(1.06)}
.bdg.gold{background:linear-gradient(135deg,#78350f,#b45309);border-color:#fbbf24;color:#fef3c7}
.bdg.green{background:linear-gradient(135deg,#064e3b,#047857);border-color:#34d399;color:#d1fae5}
.bdg b{display:block;font-size:13px}.bdg small{font-size:11px;opacity:.85}
.bdg::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.35) 50%,transparent 65%);transform:translateX(-120%);animation:sh 4s infinite}
@keyframes sh{0%{transform:translateX(-120%)}40%,100%{transform:translateX(120%)}}
.bi{font-size:22px;animation:bob 2.5s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-3px) rotate(-8deg)}}
.kw{position:absolute;font:600 11px monospace;color:#7dd3fc;opacity:0;transition:opacity .35s;pointer-events:none;animation:kf 3s ease-in-out infinite}
.card-k:hover .kw{opacity:.6}.card-k:hover i{animation:sp .8s ease}@keyframes kf{50%{transform:translateY(-8px)}}@keyframes sp{to{transform:rotate(360deg) scale(1.25)}}
html.light .kw{color:#0369a1}
.sea{fill:#0b1220}.land{fill:#1e293b;stroke:#0f172a;stroke-width:.4}
html.light .sea{fill:#e0f2fe}html.light .land{fill:#cbd5e1;stroke:#f8fafc}
.arc{fill:none;stroke:#94a3b8;stroke-width:1.2;stroke-dasharray:4 4;animation:dsh 1.5s linear infinite}@keyframes dsh{to{stroke-dashoffset:-16}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pl 2s ease-out infinite}@keyframes pl{from{transform:scale(1);opacity:.8}to{transform:scale(3.2);opacity:0}}
`;
document.head.append(st);

// ---------- 1. Awards badges (marquee) ----------
const aw = $('#awards');
if (aw) {
  const B = [['🏆', 'Best Paper Award', 'ICIET 2026', 'gold'], ['🏆', 'Best Paper Award', 'AIIoT 2024', 'gold'], ['🥇', 'Gold Award', 'Semarak Int. J. Applied Psychology · 2025', 'gold'],
    ['🎓', 'MEXT Scholarship', 'Japanese Government · 2022', 'green'], ['🎓', 'KUMA Scholarship', 'Kyushu Institute of Technology · 2024', 'green'], ['⭐', 'Sarafat Chowdhuri Merit Scholarship', 'Canadian University of Bangladesh · 2019', 'green']];
  const h = B.map(([i, t, s, k]) => `<div class="bdg ${k}"><span class="bi">${i}</span><div><b>${t}</b><small>${s}</small></div></div>`).join('');
  const strip = document.createElement('div'); strip.className = 'awx';
  strip.innerHTML = `<div class="awx-track">${h}${h}</div>`;
  aw.parentElement.before(strip);
}

// ---------- 2. Research interests: hover keywords ----------
const K = [['Computer Vision', ['YOLO', 'ViT', 'Re-ID', 'Tracking', 'OpenCV']], ['Data Science', ['Pandas', 'SQL', 'EDA', 'Python']], ['Large Language', ['Transformers', 'Prompting', 'Fine-tuning', 'RAG']],
  ['Machine Learning', ['XGBoost', 'Random Forest', 'AdaBoost', 'XAI']], ['Data Analysis', ['Power BI', 'Tableau', 'SQL', 'Statistics']], ['Robotics', ['Arduino', 'STM32', 'Jetson', 'Sensors']]];
$$('#about .grid > div').forEach(card => {
  const kw = (K.find(([k]) => card.textContent.includes(k)) || [])[1]; if (!kw) return;
  card.classList.add('card-k', 'relative', 'overflow-hidden');
  const w = document.createElement('div'); w.className = 'relative z-10 flex items-center gap-2';
  while (card.firstChild) w.append(card.firstChild);
  const layer = document.createElement('div'); layer.className = 'absolute inset-0 z-0';
  layer.innerHTML = kw.map((t, i) => `<span class="kw" style="left:${6 + (i * 37) % 70}%;top:${8 + (i * 29) % 70}%;animation-delay:${i * .4}s">${t}</span>`).join('');
  card.append(w, layer);
});

// ---------- 3. Analytics ----------
if (ANALYTICS.goatcounter) { const s = document.createElement('script'); s.async = true; s.src = '//gc.zgo.at/count.js'; s.dataset.goatcounter = `https://${ANALYTICS.goatcounter}.goatcounter.com/count`; document.head.append(s); }
else if (ANALYTICS.plausible) { const s = document.createElement('script'); s.defer = true; s.src = 'https://plausible.io/js/script.js'; s.dataset.domain = ANALYTICS.plausible; document.head.append(s); }

// ---------- 4. Interactive world map ----------
// id = ISO numeric কোড। নতুন দেশ যোগ করতে এখানে একটি লাইন লিখুন।
const MAP = [
  { id: '050', n: 'Bangladesh', role: 'Home country', c: '#34d399', ll: [90.4, 23.7] },
  { id: '392', n: 'Japan', role: 'Present residence', c: '#38bdf8', ll: [130.8, 33.9] },
  { id: '840', n: 'USA', role: 'Visited', c: '#fbbf24', ll: [-98, 39] }
];
const sec = $$('section h3').find(h => h.textContent.includes('Visited Countries'))?.parentElement;
const ready = (f, n = 0) => window.d3 ? f() : n < 60 && setTimeout(() => ready(f, n + 1), 250);
if (sec) ready(async () => {
  await load('https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js');
  let w; try { w = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')).json(); } catch (e) { return; }
  if (!window.topojson || !w) return;
  const wrap = document.createElement('div'); wrap.className = 'mt-6';
  wrap.innerHTML = `<svg viewBox="0 0 800 400" class="w-full rounded-xl border border-slate-800"></svg>
    <div class="flex flex-wrap gap-4 mt-3 text-xs font-mono text-slate-400">${MAP.map(m => `<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${m.c};margin-right:6px"></span>${m.n} · ${m.role}</span>`).join('')}</div>`;
  sec.append(wrap);
  const svg = d3.select(wrap.querySelector('svg')), proj = d3.geoNaturalEarth1().fitSize([800, 400], { type: 'Sphere' }), path = d3.geoPath(proj);
  svg.append('path').attr('class', 'sea').attr('d', path({ type: 'Sphere' }));
  const find = d => MAP.find(m => m.id === String(d.id).padStart(3, '0'));
  svg.append('g').selectAll('path').data(topojson.feature(w, w.objects.countries).features).join('path').attr('class', 'land').attr('d', path)
    .style('fill', d => find(d)?.c).style('fill-opacity', d => find(d) ? .85 : null).append('title').text(d => find(d) ? `${find(d).n} · ${find(d).role}` : '');
  const [home, jp, us] = MAP;
  [[jp, home], [jp, us]].forEach(([a, b]) => svg.append('path').attr('class', 'arc').attr('d', path({ type: 'LineString', coordinates: [a.ll, b.ll] })));
  MAP.forEach(m => { const [x, y] = proj(m.ll), g = svg.append('g');
    g.append('circle').attr('class', 'pulse').attr('cx', x).attr('cy', y).attr('r', 4).attr('fill', m.c);
    g.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).attr('fill', m.c).attr('stroke', '#fff').attr('stroke-width', 1).append('title').text(`${m.n} · ${m.role}`); });
});
})();
