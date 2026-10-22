/* Population-genetics charts. Every number below is taken from the manuscript tables (All of Us CDR v9 + gnomAD v4). */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var fmt = function (n) { return n.toLocaleString("en-US"); };

  /* ---------- data ---------- */
  var GAMT_VARIANTS = [
    { n: "c.327G>A", p: "p.(Lys109=)", k: "Splice region, synonymous", c: "c-splice", v: 27.2, carriers: 220 },
    { n: "c.299_311dup", p: "p.(Arg105GlyfsTer26)", k: "Frameshift", c: "c-trunc", v: 8.4, carriers: 68 },
    { n: "c.522G>A", p: "p.(Trp174Ter)", k: "Nonsense", c: "c-trunc", v: 6.9, carriers: 56 },
    { n: "c.59G>C", p: "p.(Trp20Ser)", k: "Missense", c: "c-mis", v: 4.6, carriers: 37 },
    { n: "c.24del", p: "p.(Ile9SerfsTer33)", k: "Frameshift", c: "c-trunc", v: 4.6, carriers: 37 },
    { n: "c.403G>A", p: "p.(Asp135Asn)", k: "Missense", c: "c-mis", v: 4.6, carriers: 37 },
    { n: "c.133T>A", p: "p.(Trp45Arg)", k: "Missense", c: "c-mis", v: 4.3, carriers: 35 },
    { n: "c.491G>A", p: "p.(Gly164Asp)", k: "Missense", c: "c-mis", v: 3.3, carriers: 27 },
    { n: "c.224C>T", p: "p.(Ala75Val)", k: "Missense", c: "c-mis", v: 3.2, carriers: 26 },
    { n: "c.491del", p: "p.(Gly164AlafsTer14)", k: "Frameshift", c: "c-trunc", v: 2.5, carriers: 20 },
    { n: "73 rarer variants", p: "", k: "fewer than 20 carriers each, pooled", c: "c-pool", v: 30.3, carriers: null }
  ];
  /* GAMT carrier frequency by genetic ancestry (1 in N), All of Us, Table 3 */
  var ANC = {
    "Confirmed": { note: "Confirmed pathogenic variants only: carrier frequency is highest in European-ancestry participants and lower in every other group.",
      rows: [["All participants", 722, "672–776", 742, 1], ["European", 555, "509–605", 513], ["African", 937, "771–1,138", 101], ["Admixed American", 1083, "881–1,331", 90], ["Other groups combined", 1549, "1,129–2,126", 38]] },
    "+ Likely": { note: "Adding likely pathogenic variants raises the count of qualifying alleles by 7% in European and by 9% to 24% in the other groups.",
      rows: [["All participants", 663, "619–710", 808, 1], ["European", 521, "479–566", 547], ["African", 816, "680–978", 116], ["Admixed American", 994, "816–1,212", 98], ["Other groups combined", 1253, "942–1,665", 47]] },
    "+ In silico": { note: "Adding in silico pathogenic variants raises alleles by 41% in European participants and by 67% to 119% in the others, narrowing the gap between groups.",
      rows: [["All participants", 430, "407–455", 1245, 1], ["European", 369, "344–395", 773], ["African", 462, "403–529", 205], ["Admixed American", 594, "510–692", 164], ["Other groups combined", 572, "472–693", 103]] }
  };
  /* Carrier frequency (1 in N) by cohort; value plotted as carriers per 100,000 */
  var AGAT = {
    "Confirmed": { note: "Confirmed pathogenic variants. In All of Us this predicts one affected US birth about every 470 years.", rows: [["All of Us", 20601, "14,060–30,187", 26], ["gnomAD v4", 23735, "16,986–33,165", 34], ["Combined", 22377, "17,386–28,800", 60, 1]] },
    "+ Likely": { note: "Adding likely pathogenic variants (predicted loss of function). In All of Us this predicts one affected US birth about every 73 years.", rows: [["All of Us", 8116, "6,380–10,324", 66], ["gnomAD v4", 8151, "6,696–9,922", 99], ["Combined", 8137, "6,986–9,477", 165, 1]] },
    "+ In silico": { note: "Adding in silico pathogenic variants (predicted damaging by computer tools). In All of Us this predicts one affected US birth about every 35 years.", rows: [["All of Us", 5638, "4,613–6,892", 95], ["gnomAD v4", 5933, "5,017–7,018", 136], ["Combined", 5812, "5,109–6,611", 231, 1]] }
  };
  var SLC = {
    "Confirmed": { note: "Fewer than 20 heterozygous females in All of Us carried a confirmed pathogenic variant, so the exact count and frequency cannot be reported. The combined estimate is a range.",
      rows: [["All of Us", null, "fewer than 20 carriers", null], ["gnomAD v4", 66780, "35,134–126,929", 9], ["Combined (range)", [92577, 33063], "masked count 1–19", "10–28", 1]] },
    "+ Likely": { note: "Adding likely pathogenic variants (predicted loss of function). 22 heterozygous females in All of Us.",
      rows: [["All of Us", 14761, "9,749–22,351", 22], ["gnomAD v4", 13393, "9,978–17,978", 44], ["Combined", 13849, "10,887–17,617", 66, 1]] },
    "+ In silico": { note: "Adding in silico pathogenic variants (predicted damaging by computer tools). 51 heterozygous females in All of Us.",
      rows: [["All of Us", 6368, "4,844–8,371", 51], ["gnomAD v4", 8712, "6,885–11,025", 69], ["Combined", 7716, "6,453–9,225", 120, 1]] }
  };
  /* Predicted affected US births per year, combined cohorts (Table 1, 2; Figure 3) */
  var BIRTHS = {
    "Confirmed": { g: [3.2, 3.0, 3.4], c: [10, null, null, 27], ratio: "3 to 8.5 : 1", note: "Confirmed pathogenic variants: roughly 3 to 8.5 times as many boys with creatine transporter deficiency as children with GAMT deficiency." },
    "+ Likely": { g: [3.5, 3.3, 3.8], c: [65, 51, 83], ratio: "18 : 1", note: "With likely pathogenic variants added: about 18 affected male births for every GAMT birth." },
    "+ In silico": { g: [6.4, 6.0, 6.9], c: [117, 97, 139], ratio: "18 : 1", note: "With in silico pathogenic variants added as well: still about 18 to 1." }
  };
  /* Serum creatinine, % difference vs non-carriers (Table 5) */
  var CREAT = [
    { g: "GATM (AGAT)", rows: [["+ Likely", 34, -9.6, -15.6, -3.2, "0.004"], ["+ In silico", 47, -7.2, -12.2, -1.9, "0.008"]] },
    { g: "GAMT", rows: [["Confirmed", 382, 0.6, -1.2, 2.4, "0.52"], ["+ Likely", 419, 0.7, -1.0, 2.5, "0.40"], ["+ In silico", 634, 0.3, -1.1, 1.8, "0.68"]] },
    { g: "SLC6A8, females", rows: [["+ In silico", 28, -4.1, -11.1, 3.4, "0.27"]] }
  ];

  /* ---------- helpers ---------- */
  function seg(host, names, onPick) {
    var wrap = el("div", "seg"); wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", "How strictly variants are classified");
    var btns = names.map(function (n, i) {
      var b = el("button", "", n); b.type = "button"; b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () { btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); onPick(n); });
      wrap.appendChild(b); return b;
    });
    host.appendChild(wrap); return wrap;
  }
  function prow(o) {
    var r = el("div", "prow" + (o.total ? " total" : "") + (o.cls ? " " + o.cls : ""));
    r.innerHTML = '<div class="lab">' + o.lab + (o.sub ? "<small>" + o.sub + "</small>" : "") + '</div><div class="track"><div class="fill"></div></div><div class="val">' + o.val + (o.vsub ? "<small>" + o.vsub + "</small>" : "") + "</div>";
    r._set = function (pct, ext) {
      var fl = r.querySelector(".fill"); fl.style.width = pct + "%";
      var x = r.querySelector(".fill.ext"); if (x) x.remove();
      if (ext != null) { var e = el("div", "fill ext"); e.style.left = pct + "%"; e.style.width = "0%"; r.querySelector(".track").appendChild(e); requestAnimationFrame(function () { requestAnimationFrame(function () { e.style.width = ext + "%"; }); }); }
    };
    return r;
  }
  function whenVisible(node, fn) {
    if (reduce || !("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } }); }, { threshold: 0.25 });
    io.observe(node);
  }

  /* ---------- GAMT recurrent variants (Figure 2) ---------- */
  function gamtVariants(host) {
    var rows = el("div", "rows"), list = [];
    GAMT_VARIANTS.forEach(function (d) {
      var r = prow({ lab: "<b>" + d.n + "</b>" + (d.p ? " " + d.p : ""), sub: d.k + (d.carriers ? " · " + d.carriers + " carriers" : ""), val: d.v.toFixed(1) + "%", cls: d.c });
      rows.appendChild(r); list.push([r, d.v]);
    });
    host.appendChild(rows);
    host.appendChild(el("div", "keyline", '<span><i style="--c:var(--warn)"></i>Truncating</span><span><i style="--c:var(--accent)"></i>Missense</span><span><i style="--c:var(--fold)"></i>Splice region (synonymous)</span><span><i style="--c:var(--muted)"></i>Pooled rare variants</span>'));
    whenVisible(host, function () { list.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1] / 35 * 100); }, reduce ? 0 : i * 70); }); });
  }

  /* ---------- tier-toggle bar charts ---------- */
  function tierBars(host, DATA, perUnit, maxv) {
    var names = Object.keys(DATA), note = el("p", "callnote"), rows = el("div", "rows"), cur = names[0], built = {}, visible = false;
    function render(name) {
      cur = name; var d = DATA[name]; rows.innerHTML = ""; note.textContent = d.note; var rs = [];
      d.rows.forEach(function (r) {
        var lab = r[0], n = r[1], ci = r[2], cnt = r[3], tot = r[4];
        var o = { lab: lab, total: !!tot };
        if (n == null) { o.val = "suppressed"; o.vsub = ci; o.cls = "c-pool"; var pr = prow(o); rows.appendChild(pr); rs.push([pr, 0]); return; }
        if (Array.isArray(n)) { o.val = "1 in " + fmt(n[0]) + " to " + fmt(n[1]); o.vsub = ci; var p2 = prow(o); rows.appendChild(p2); rs.push([p2, perUnit / n[0] / maxv * 100, (perUnit / n[1] - perUnit / n[0]) / maxv * 100]); return; }
        o.val = "1 in " + fmt(n); o.vsub = "95% CI " + ci + (cnt ? " · " + (typeof cnt === "number" ? fmt(cnt) + " alleles" : cnt + " carriers") : "");
        var p = prow(o); rows.appendChild(p); rs.push([p, perUnit / n / maxv * 100]);
      });
      if (visible) rs.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1], x[2]); }, reduce ? 0 : i * 90); });
      built.rs = rs;
    }
    seg(host, names, render); host.appendChild(note); host.appendChild(rows);
    render(cur);
    whenVisible(host, function () { visible = true; built.rs.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1], x[2]); }, reduce ? 0 : i * 90); }); });
  }
  function ancestry(host) {
    var names = Object.keys(ANC), note = el("p", "callnote"), rows = el("div", "rows"), rs = [], visible = false;
    function render(name) {
      var d = ANC[name]; note.textContent = d.note; rows.innerHTML = ""; rs = [];
      d.rows.forEach(function (r) {
        var p = prow({ lab: r[0], total: !!r[4], val: "1 in " + fmt(r[1]), vsub: "95% CI " + r[2] + " · " + fmt(r[3]) + " alleles", cls: r[4] ? "c-pool" : "c-gamt" });
        rows.appendChild(p); rs.push([p, 1000 / r[1] / 3 * 100]);
      });
      if (visible) rs.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1]); }, reduce ? 0 : i * 90); });
    }
    seg(host, names, render); host.appendChild(note); host.appendChild(rows);
    host.appendChild(el("p", "fine", "Bar length is carrier frequency (carriers per 1,000 participants). Ancestry groups are computed genetic ancestry, not self-reported race or ethnicity. African, admixed American and the other groups are compared with European participants."));
    render(names[0]);
    whenVisible(host, function () { visible = true; rs.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1]); }, reduce ? 0 : i * 90); }); });
  }

  /* ---------- births: GAMT vs CTD (Figure 3) ---------- */
  function births(host) {
    var names = Object.keys(BIRTHS), note = el("p", "callnote"), ratio = el("div", "stat"), rows = el("div", "rows"), visible = false, MAX = 150, rs = [];
    ratio.innerHTML = '<span class="label">Predicted ratio, CTD : GAMT</span><span class="num" id="ratioNum"></span>';
    function render(name) {
      var d = BIRTHS[name]; note.textContent = d.note; ratio.querySelector(".num").textContent = d.ratio; rows.innerHTML = ""; rs = [];
      var g = prow({ lab: "GAMT deficiency", sub: "children per year", val: d.g[0].toFixed(1), vsub: "95% CI " + d.g[1] + "–" + d.g[2], cls: "c-gamt" });
      var cc = d.c, cv = cc[1] == null ? "10–27" : String(cc[0]);
      var c = prow({ lab: "Creatine transporter deficiency", sub: "boys per year", val: cv, vsub: cc[1] == null ? "range; exact count masked" : "95% CI " + cc[1] + "–" + cc[2], cls: "c-ctd" });
      rows.appendChild(g); rows.appendChild(c);
      [[g, d.g], [c, cc]].forEach(function (p, idx) {
        var v = p[1][0], tr = p[0].querySelector(".track");
        if (idx === 1 && p[1][1] == null) { rs.push([p[0], 10 / MAX * 100, (27 - 10) / MAX * 100]); }
        else {
          rs.push([p[0], v / MAX * 100]);
          var ci = el("div", "ci"); ci.style.left = p[1][1] / MAX * 100 + "%"; ci.style.width = (p[1][2] - p[1][1]) / MAX * 100 + "%"; tr.appendChild(ci);
        }
      });
      if (visible) rs.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1], x[2]); }, reduce ? 0 : i * 140); });
    }
    seg(host, names, render);
    var top = el("div", "two"); var left = el("div", ""); left.style.display = "grid"; left.style.gap = "16px"; left.appendChild(note); left.appendChild(ratio);
    host.appendChild(left); host.appendChild(rows);
    host.appendChild(el("p", "fine", "Combined All of Us and gnomAD v4 cohorts, about 3.6 million US births per year, half male. GAMT deficiency is estimated as q² × births and CTD as female carrier frequency × male births. CTD estimates do not include de novo variants."));
    render(names[0]);
    whenVisible(host, function () { visible = true; rs.forEach(function (x, i) { setTimeout(function () { x[0]._set(x[1], x[2]); }, reduce ? 0 : i * 140); }); });
  }

  /* ---------- serum creatinine forest plot ---------- */
  function forest(host) {
    var MIN = -20, MAX = 6, pos = function (v) { return (v - MIN) / (MAX - MIN) * 100; };
    var ax = el("div", "faxis"); ax.appendChild(el("span")); var a = el("div", "ax");
    [-20, -15, -10, -5, 0, 5].forEach(function (t) { var s = el("span", "", (t > 0 ? "+" : "") + t + "%"); s.style.left = pos(t) + "%"; a.appendChild(s); });
    ax.appendChild(a); ax.appendChild(el("span"));
    var box = el("div", "rows"); box.style.gap = "10px";
    CREAT.forEach(function (grp) {
      box.appendChild(el("div", "fgroup", grp.g));
      grp.rows.forEach(function (r) {
        var sig = parseFloat(r[5]) < 0.05, row = el("div", "frow");
        row.style.setProperty("--c", sig ? "var(--accent)" : "var(--muted)");
        row.innerHTML = '<div class="lab">' + r[0] + "<small>" + fmt(r[1]) + ' carriers</small></div><div class="fplot"><div class="zero" style="left:' + pos(0) + '%"></div><div class="bar" style="left:' + pos(r[3]) + "%;width:" + (pos(r[4]) - pos(r[3])) + "%;--ox:" + ((r[2] - r[3]) / (r[4] - r[3]) * 100) + '%"></div><div class="dot" style="left:' + pos(r[2]) + '%"></div></div><div class="val">' + (r[2] > 0 ? "+" : "−") + Math.abs(r[2]).toFixed(1) + "%<small>" + r[3].toFixed(1).replace("-", "−") + " to " + (r[4] > 0 ? "" : "") + r[4].toFixed(1).replace("-", "−") + " · p = " + r[5] + "</small></div>";
        box.appendChild(row);
      });
    });
    host.appendChild(ax); host.appendChild(box);
    host.appendChild(el("p", "fine", "Difference in serum creatinine versus non-carriers, from linear regression of log-transformed creatinine adjusted for age, age squared, sex at birth (GATM and GAMT) and 10 genetic principal components, in 270,383 participants without chronic kidney disease. Bars are 95% confidence intervals; blue marks p < 0.05."));
    if (reduce || !("IntersectionObserver" in window)) host.classList.add("inview"); else whenVisible(host, function () { host.classList.add("inview"); });
  }

  /* ---------- count-up numbers ---------- */
  function counts() {
    $$("[data-count]").forEach(function (n) {
      var to = +n.getAttribute("data-count");
      var run = function () {
        if (reduce) { n.textContent = fmt(to); return; }
        var t0 = performance.now(), D = 1100;
        (function step(t) { var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); n.textContent = fmt(Math.round(to * e)); if (k < 1) requestAnimationFrame(step); })(t0);
      };
      n.textContent = reduce ? fmt(to) : "0"; whenVisible(n, run);
    });
  }

  var MAP = { "gamt-variants": gamtVariants, "gamt-ancestry": ancestry, "births": births, "forest": forest,
    "agat-tiers": function (h) { tierBars(h, AGAT, 100000, 20); }, "slc-tiers": function (h) { tierBars(h, SLC, 100000, 20); } };
  $$("[data-chart]").forEach(function (h) { var f = MAP[h.getAttribute("data-chart")]; if (f) f(h); });
  counts();
})();
