(() => {
const ME = 'Md. Rahatul Islam', P = window.PUBS.sort((a, b) => b.y - a.y);
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load = s => new Promise(r => { const e = document.createElement('script'); e.src = s; e.onload = r; e.onerror = r; document.head.append(e); });

// ---- Country flags & citations state ----
const CC = window.COUNTRY || {}, CCOL = { JP: '#f87171', BD: '#34d399', IN: '#fb923c' };
const CNm = c => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(c); } catch (e) { return c; } };
const flagC = c => c ? `<img src="https://flagcdn.com/16x12/${c.toLowerCase()}.png" alt="${c}" title="${CNm(c)}" class="inline w-4 h-3 mr-1 rounded-sm" style="vertical-align:-1px">` : '';
const flag = a => flagC(CC[a]);
const CITES = {}; let totalC = null, lastN = 0;
const setCount = () => { const e = document.getElementById('pcount'); if (e) e.textContent = `Showing ${lastN} of ${window.PUBS.length}` + (totalC != null ? ` · Total citations: ${totalC}` : ''); };
function paintCites() { document.querySelectorAll('[data-cc]').forEach(s => { const v = CITES[window.PUBS[s.dataset.cc].url]; s.textContent = v == null ? '' : `★ Cited by ${v}`; }); }

// ---- Right-click / copy block বন্ধ (পুরনো listener-এর আগেই থামানো হচ্ছে) ----
window.addEventListener('contextmenu', e => e.stopImmediatePropagation(), true);
window.addEventListener('keydown', e => { if (e.ctrlKey || e.key === 'F12') e.stopImmediatePropagation(); }, true);
const st = document.createElement('style');
st.textContent = 'body{user-select:text!important;-webkit-user-select:text!important}.matrix{background:#001a00!important}.matrix *{color:#0f6!important}';
document.head.append(st);

// ---- Live metrics ----
const cnt = t => P.filter(p => p.t === t).length, awards = P.filter(p => p.award).length;
const m = document.querySelectorAll('.grid-cols-3 > div');
if (m[0]) m[0].firstElementChild.textContent = P.length;
if (m[2]) { m[2].firstElementChild.textContent = awards; m[2].lastChild.textContent = ' Paper Awards'; }

// ---- Cite helpers ----
const nm = a => { const t = a.split(' '); return t.length > 1 ? [t.pop(), t.join(' ')] : [a, '']; };
const bib = p => {
  const k = (nm(p.au[0])[0] + p.y + p.title.split(' ')[0]).replace(/[^A-Za-z0-9]/g, '');
  const conf = p.t === 'conference';
  return `@${conf ? 'inproceedings' : 'article'}{${k},\n  author = {${p.au.map(a => { const [l, f] = nm(a); return f ? l + ', ' + f : l; }).join(' and ')}},\n  title = {${p.title.replace(/\.$/, '')}},\n  ${conf ? 'booktitle' : 'journal'} = {${p.v}},\n  year = {${p.y}},\n  url = {${p.url}}\n}`;
};
const apa = p => {
  const a = p.au.map(x => { const [l, f] = nm(x); return f ? l + ', ' + f.split(' ').map(w => w[0] + '.').join(' ') : l; });
  const s = a.length > 1 ? a.slice(0, -1).join(', ') + ', & ' + a.at(-1) : a[0];
  return `${s} (${p.y}). ${p.title} ${p.v}. ${p.url}`;
};
const copy = t => navigator.clipboard ? navigator.clipboard.writeText(t) : (() => { const x = document.createElement('textarea'); x.value = t; document.body.append(x); x.select(); document.execCommand('copy'); x.remove(); })();

// ---- Publications section ----
const sec = $('#publications'), years = [...new Set(P.map(p => p.y))];
const inCls = 'bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500';
sec.innerHTML = `
<h3 class="text-xl sm:text-2xl font-bold flex items-center gap-3 mb-6"><i class="fas fa-book-open text-sky-400"></i> Research Publications (Total: ${P.length})</h3>
<div class="grid md:grid-cols-2 gap-4 mb-6">
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-xs font-mono text-slate-400 mb-2">Publications per year</div><canvas id="pubChart" height="170"></canvas></div>
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-xs font-mono text-slate-400 mb-2">Co-author network · by affiliation country (drag nodes)</div><svg id="net" class="w-full" viewBox="0 0 460 360"></svg></div>
</div>
<div class="flex flex-wrap gap-2 mb-3 text-xs font-mono items-center">
  <input id="pq" placeholder="Search: YOLO, ViT, Re-ID, author…" class="${inCls} flex-1 min-w-[180px]">
  <select id="py" class="${inCls}"><option value="">All years</option>${years.map(y => `<option>${y}</option>`).join('')}</select>
  ${[['all','All'],['journal','Journals'],['conference','Conferences'],['award','Awards']].map(([f, l]) => `<button data-f="${f}" class="pub-btn px-3 py-1.5 rounded-lg ${f === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">${l}</button>`).join('')}
</div>
<div id="pcount" class="text-xs font-mono text-slate-500 mb-3"></div>
<div id="plist" class="space-y-4 text-sm text-slate-300"></div>`;

const F = { q: '', y: '', f: 'all' };
const badge = p => p.t === 'journal' ? ['bg-sky-950 text-sky-400 border-sky-800', 'Journal' + (p.q ? ` (${p.q})` : '')] : p.t === 'other' ? ['bg-amber-950 text-amber-400 border-amber-800', 'Others'] : ['bg-slate-800 text-slate-300 border-slate-700', 'Conference'];
function render() {
  const toks = F.q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = P.filter(p => {
    const h = (p.title + ' ' + p.au.join(' ') + ' ' + p.v + ' ' + p.y + ' ' + (p.kw || '') + ' ' + (p.award || '')).toLowerCase();
    return toks.every(t => h.includes(t)) && (!F.y || p.y == F.y) && (F.f === 'all' || (F.f === 'award' ? p.award : p.t === F.f));
  });
  lastN = list.length; setCount();
  $('#plist').innerHTML = list.map((p, i) => {
    const b = badge(p), au = p.au.map(a => a === ME ? `<b><u><i>${a}</i></u></b>` : esc(a)).join(', ');
    return `<div class="bg-slate-900 border border-slate-800 p-4 rounded-xl overflow-hidden">
    <span class="text-xs font-mono ${b[0]} px-2 py-0.5 rounded border">${i + 1}. ${b[1]} · ${p.y}</span>${p.award ? ` <span class="text-xs font-mono text-emerald-400 ml-1">🏆 ${esc(p.award)}</span>` : ''}
    <p class="mt-2 break-words">${au}. <a href="${p.url}" target="_blank" rel="noopener" class="text-sky-400 hover:underline">“${esc(p.title)}”</a><br><i>${esc(p.v)}</i></p>
    <div class="mt-2 flex gap-4 text-xs font-mono"><button data-cite="${P.indexOf(p)}" class="text-sky-400 hover:underline">❝ Cite</button><a href="${p.url}" target="_blank" rel="noopener" class="text-slate-400 hover:text-sky-400">Open ↗</a><span data-cc="${P.indexOf(p)}" class="text-amber-400"></span></div>
    <div class="cite hidden mt-3 space-y-2"></div></div>`;
  }).join('') || '<p class="text-slate-500 font-mono">No results.</p>';
  paintCites();
}
$('#pq').oninput = e => { F.q = e.target.value; render(); };
$('#py').onchange = e => { F.y = e.target.value; render(); };
sec.querySelectorAll('.pub-btn').forEach(b => b.onclick = () => {
  F.f = b.dataset.f;
  sec.querySelectorAll('.pub-btn').forEach(x => x.className = 'pub-btn px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700');
  b.className = 'pub-btn px-3 py-1.5 rounded-lg bg-sky-600 text-white'; render();
});
$('#plist').onclick = e => {
  const c = e.target.dataset.cite, cp = e.target.dataset.copy;
  if (cp !== undefined) { copy(e.target.parentElement.querySelector('pre').textContent); e.target.textContent = 'Copied ✓'; setTimeout(() => e.target.textContent = 'Copy', 1200); return; }
  if (c === undefined) return;
  const box = e.target.closest('div.bg-slate-900').querySelector('.cite'), p = P[c];
  if (!box.classList.toggle('hidden')) box.innerHTML = [['BibTeX', bib(p)], ['APA', apa(p)]].map(([l, t]) =>
    `<div class="bg-slate-950 border border-slate-800 rounded-lg p-3"><div class="flex justify-between text-xs font-mono mb-1"><span class="text-emerald-400">${l}</span><button data-copy class="text-sky-400 hover:underline">Copy</button></div><pre class="whitespace-pre-wrap break-all text-xs text-slate-300"></pre></div>`).join('');
  if (!box.classList.contains('hidden')) box.querySelectorAll('pre').forEach((pr, i) => pr.textContent = i ? apa(p) : bib(p));
};
render();

// ---- Country legend ----
const byC = {}; [...new Set(P.flatMap(p => p.au))].forEach(a => { const k = CC[a] || '??'; byC[k] = (byC[k] || 0) + 1; });
const lg = document.createElement('div'); lg.className = 'flex flex-wrap gap-3 mt-2 text-xs font-mono text-slate-400';
lg.innerHTML = Object.entries(byC).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<span>${k === '??' ? '🏳️ Unspecified' : flagC(k) + CNm(k)} (${n})</span>`).join('');
$('#net').after(lg);

// ---- Automatic citation counts (OpenAlex, cached 24h) ----
const words = t => new Set(t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2));
const sim = (a, b) => { const A = words(a), B = words(b); let i = 0; A.forEach(w => B.has(w) && i++); return i / Math.max(1, Math.min(A.size, B.size)); };
const jget = async u => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } };
const getC = async p => {
  if (p.cites != null) return p.cites;               // manual value from data.js wins
  const T = p.title.replace(/[“”".]/g, ''), m = p.url.match(/(10\.\d{4,9}\/[^\s?#]+)/); let best = null;
  const take = v => { if (typeof v === 'number') best = Math.max(best ?? 0, v); };
  if (m) {
    take((await jget(`https://api.openalex.org/works/doi:${m[1]}?select=cited_by_count`))?.cited_by_count);
    take((await jget(`https://api.crossref.org/works/${m[1]}`))?.message?.['is-referenced-by-count']);
  }
  if (best == null) {                                // no DOI in URL (e.g. IEEE): search by title
    const o = await jget(`https://api.openalex.org/works?search=${encodeURIComponent(T)}&per-page=3&select=title,cited_by_count`);
    take(o?.results?.find(w => w.title && sim(w.title, T) >= .8)?.cited_by_count);
    const c = await jget(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(T)}&rows=3&select=title,is-referenced-by-count`);
    take(c?.message?.items?.find(i => i.title?.[0] && sim(i.title[0], T) >= .8)?.['is-referenced-by-count']);
  }
  return best;
};
const updChart = (n = 0) => {
  const ch = window.Chart && Chart.getChart($('#pubChart'));
  if (!ch) { if (n < 40) setTimeout(() => updChart(n + 1), 500); return; }
  if (totalC == null) return;
  const data = ch.data.labels.map(y => P.filter(p => p.y == y).reduce((s, p) => s + (CITES[p.url] || 0), 0));
  const ex = ch.data.datasets.find(d => d.label === 'Citations (by paper year)');
  if (ex) ex.data = data;
  else { ch.data.datasets.push({ type: 'line', label: 'Citations (by paper year)', data, yAxisID: 'y1', borderColor: '#34d399', backgroundColor: '#34d399', tension: .3 });
    ch.options.scales.y1 = { position: 'right', grid: { drawOnChartArea: false }, ticks: { precision: 0 }, title: { display: true, text: 'Citations' } }; }
  ch.update();
};
(async () => {
  let c; try { c = JSON.parse(localStorage.getItem('pubcites2')); } catch (e) {}
  if (c && Date.now() - c.t < (c.full ? 864e5 : 36e5)) Object.assign(CITES, c.d);
  else {
    for (let i = 0; i < P.length; i += 5) await Promise.all(P.slice(i, i + 5).map(async p => { const v = await getC(p); if (v != null) CITES[p.url] = v; }));
    try { localStorage.setItem('pubcites2', JSON.stringify({ t: Date.now(), d: CITES, full: P.every(p => CITES[p.url] != null) })); } catch (e) {}
  }
  P.forEach(p => { if (p.cites != null) CITES[p.url] = p.cites; });
  const v = Object.values(CITES); totalC = v.length ? v.reduce((a, b) => a + b, 0) : null;
  paintCites(); setCount();
})();

// ---- Chart + network (libraries load lazily) ----
Promise.all([load('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'), load('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js')]).then(() => {
  if (window.Chart) {
    Chart.defaults.color = '#94a3b8'; Chart.defaults.borderColor = '#1e293b';
    const ys = [...years].sort(), ds = (t, l, c) => ({ label: l, backgroundColor: c, data: ys.map(y => P.filter(p => p.y === y && p.t === t).length) });
    new Chart($('#pubChart'), { type: 'bar', data: { labels: ys, datasets: [ds('journal', 'Journal', '#a78bfa'), ds('conference', 'Conference', '#2dd4bf'), ds('other', 'Other', '#fb7185')] },
      options: { scales: { x: { stacked: true }, y: { stacked: true, ticks: { stepSize: 1 } } } } });
  }
  if (window.d3) {
    const c = {}, l = {};
    P.forEach(p => { p.au.forEach(a => c[a] = (c[a] || 0) + 1); p.au.forEach((a, i) => p.au.slice(i + 1).forEach(b => { const k = [a, b].sort().join('|'); l[k] = (l[k] || 0) + 1; })); });
    const nodes = Object.keys(c).map(id => ({ id, n: c[id] })), ids = new Set(nodes.map(n => n.id));
    const links = Object.entries(l).map(([k, v]) => ({ source: k.split('|')[0], target: k.split('|')[1], v })).filter(x => ids.has(x.source) && ids.has(x.target));
    const svg = d3.select('#net');
    const ln = svg.append('g').selectAll('line').data(links).join('line').attr('stroke', '#334155').attr('stroke-width', d => Math.min(1 + d.v / 2, 4));
    const g = svg.append('g').selectAll('g').data(nodes).join('g').style('cursor', 'grab');
    g.append('circle').attr('r', d => 4 + 2.5 * Math.sqrt(d.n)).attr('fill', d => d.id === ME ? '#38bdf8' : '#64748b').append('title').text(d => `${d.id}: ${d.n} papers` + (window.INST && window.INST[d.id] ? ` · ${window.INST[d.id]}` : CC[d.id] ? ` · ${CNm(CC[d.id])}` : ''));
    g.append('text').text(d => d.id === ME ? 'Me' : nm(d.id)[0]).attr('font-size', 7).attr('fill', '#cbd5e1').attr('dy', -9).attr('text-anchor', 'middle');
    g.select('circle').attr('stroke', d => CCOL[CC[d.id]] || '#475569').attr('stroke-width', 2);
    g.filter(d => CC[d.id]).append('image').attr('href', d => `https://flagcdn.com/16x12/${CC[d.id].toLowerCase()}.png`).attr('width', 12).attr('height', 9).attr('x', -6).attr('y', d => 6 + 2.5 * Math.sqrt(d.n));
    const sim = d3.forceSimulation(nodes).force('link', d3.forceLink(links).id(d => d.id).distance(55)).force('charge', d3.forceManyBody().strength(-110)).force('center', d3.forceCenter(230, 180)).force('x', d3.forceX(230).strength(.05)).force('y', d3.forceY(180).strength(.05))
      .on('tick', () => { nodes.forEach(d => { d.x = Math.max(15, Math.min(445, d.x)); d.y = Math.max(15, Math.min(345, d.y)); });
        ln.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y); g.attr('transform', d => `translate(${d.x},${d.y})`); });
    g.call(d3.drag().on('start', (e, d) => { sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; }).on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; }).on('end', (e, d) => { sim.alphaTarget(0); d.fx = d.fy = null; }));
  }
});

// ---- Terminal ----
const out = $('#terminal-output'), inp = $('#terminal-input'), hist = []; let hi = 0;
inp.removeAttribute('onkeypress');
const CMDS = ['help', 'bio', 'interests', 'skills', 'education', 'metrics', 'publications', 'awards', 'contact', 'whoami', 'theme', 'open', 'cat', 'neofetch', 'ls', 'sudo', 'clear'];
const LINKS = { github: 'https://www.github.com/mdrahatulislam', linkedin: 'https://www.linkedin.com/in/md-rahatul-islam/', orcid: 'https://orcid.org/0000-0002-5745-4439', scholar: 'https://scholar.google.com/', scopus: 'https://www.scopus.com/authid/detail.uri?authorId=57850590500' };
const say = (cmd, text) => { const a = document.createElement('p'); a.className = 'text-green-400 mt-2'; a.textContent = '$ ' + cmd; const b = document.createElement('pre'); b.className = 'text-slate-300 whitespace-pre-wrap'; b.textContent = text; out.append(a, b); out.scrollTop = out.scrollHeight; };
const T = {
  help: () => 'Commands: ' + CMDS.join(', ') + '\nTry: open github | cat cv | theme matrix | sudo hire-me',
  bio: () => 'Ph.D. researcher at Kyushu Institute of Technology: Computer Vision, Deep Learning, Robotics. MEXT scholar.',
  interests: () => 'Computer Vision, Data Science, LLM, Machine Learning, Data Analysis, Robotics.',
  skills: () => 'Languages: Python, C++, MATLAB\nFrameworks: TensorFlow, PyTorch, Keras, Scikit-Learn\nCV: OpenCV, YOLO, ViT, CNN, MoViNet\nHardware: Arduino, STM32, Jetson, Proteus',
  education: () => '2024-now  Ph.D.  Kyushu Institute of Technology\n2022-24   M.Sc.  Kyushu Institute of Technology\n2017-20   B.Sc.  Canadian University of Bangladesh',
  metrics: () => `Total: ${P.length} (${cnt('journal')} journals, ${cnt('conference')} conferences, ${cnt('other')} other) | Awards: ${awards} | Citations: ${totalC != null ? totalC : 'n/a'}`,
  publications: () => `Latest: ${P[0].title}\n${P[0].v}`,
  awards: () => 'KUMA Scholarship 2024, MEXT Scholarship 2022, Best Paper Awards (ICIET 2026, AIIoT 2024), Gold Award 2025.',
  contact: () => 'Email: mdrahatulislam.cub@gmail.com | Kitakyushu, Fukuoka, Japan',
  whoami: () => 'rahatul: researcher, engineer, robotics enthusiast.',
  ls: () => 'about/  skills/  publications/  projects/  news/  contact/  cv.pdf',
  neofetch: () => '  ┌───────────┐   rahatul@kyutech\n  │  (•‿•)    │   ───────────────\n  │  AI / CV  │   OS: Researcher 3.0\n  └───────────┘   Uptime: ' + (new Date().getFullYear() - 2017) + '+ years in robotics\n                  Shell: Python, C++\n                  Papers: ' + P.length,
  theme: a => { const on = a[0] === 'matrix' ? true : a[0] === 'default' ? false : !out.classList.contains('matrix'); out.classList.toggle('matrix', on); return 'Theme: ' + (on ? 'matrix' : 'default'); },
  open: a => LINKS[a[0]] ? (window.open(LINKS[a[0]], '_blank', 'noopener'), 'Opening ' + a[0] + '…') : 'Usage: open ' + Object.keys(LINKS).join('|'),
  cat: a => a[0] === 'cv' ? (window.open('cv.pdf', '_blank'), 'Opening cv.pdf…') : 'Usage: cat cv',
  sudo: a => a[0] === 'hire-me' ? '[sudo] password for recruiter: ********\nAccess granted ✔\nCompiling offer letter… 100%\nSend it to mdrahatulislam.cub@gmail.com 😄' : 'Nice try. Only "sudo hire-me" is allowed.'
};
function run(raw) {
  const [cmd, ...args] = raw.trim().split(/\s+/), k = cmd.toLowerCase();
  if (!k) return;
  hist.push(raw); hi = hist.length;
  if (k === 'clear') { out.innerHTML = ''; return; }
  say(raw, T[k] ? T[k](args.map(x => x.toLowerCase())) : `Command not found: '${cmd}'. Type 'help'.`);
}
window.runCommand = run;
window.handleTerminalInput = () => {};
inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') { run(inp.value); inp.value = ''; }
  else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) inp.value = hist[--hi]; }
  else if (e.key === 'ArrowDown') { e.preventDefault(); inp.value = hi < hist.length - 1 ? hist[++hi] : (hi = hist.length, ''); }
  else if (e.key === 'Tab') {
    e.preventDefault(); const v = inp.value.toLowerCase(), mt = CMDS.filter(c => c.startsWith(v));
    if (mt.length === 1) inp.value = mt[0]; else if (mt.length > 1) say(v, mt.join('  '));
  }
});
})();
