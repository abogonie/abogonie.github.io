/* AAV delivery of GAMT into a neuron. A schematic of the generic AAV life cycle, drawn from published mechanisms. Not to scale, not data. */
(function () {
  var host = document.getElementById("aav"); if (!host) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var el = function (n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var P = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var E = function (x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  var lerp = function (a, b, u) { return a + (b - a) * u; };
  var bez = function (a, c, b, u) { var v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; };
  var T_END = 29;
  var STAGES = [
    { n: "Binding", a: 0, b: 3, s: "Capsid attachment. AAV capsids (T = 1 icosahedra built from 60 VP subunits) attach to cell-surface glycans and to the essential AAV receptor AAVR (KIAA0319L) on the neuronal membrane [1,2].", l: "The viral shell docks on the neuron like a key finding its lock." },
    { n: "Endocytosis", a: 3, b: 5.5, s: "Internalization. The bound capsid is taken up in a clathrin-coated pit and pinched off as an endocytic vesicle [3].", l: "The cell swallows the particle inside a small bubble." },
    { n: "Transport", a: 5.5, b: 10, s: "Endosomal trafficking. The vesicle matures from early to late endosome as its pH falls, and moves along microtubules toward the nucleus [3].", l: "The bubble rides a cellular railway toward the control center." },
    { n: "Escape", a: 10, b: 12, s: "Endosomal escape. Acidification exposes the VP1 unique region, whose phospholipase A2 domain supports release of the capsid into the cytosol [5].", l: "The shell slips out of its bubble before it can be broken down." },
    { n: "Nuclear entry", a: 12, b: 16.5, s: "Nuclear entry. The capsid crosses the nuclear pore complex. Ubiquitinated capsids can instead be routed to the proteasome and lost [4].", l: "It has to reach the nucleus without being scrapped on the way." },
    { n: "Uncoating", a: 16.5, b: 21, s: "Uncoating and second-strand synthesis. The capsid opens and releases a single-stranded genome flanked by inverted terminal repeats (ITRs). Second-strand synthesis, a rate-limiting step, converts it to a double-stranded episome [6].", l: "The delivered instructions are copied into a form the cell can read." },
    { n: "Transcription", a: 21, b: 24, s: "Transcription. A promoter drives the GAMT cDNA, followed by a polyadenylation signal. RNA polymerase II makes GAMT mRNA, which leaves the nucleus through nuclear pores.", l: "The cell makes working copies of the GAMT recipe." },
    { n: "Creatine synthesis", a: 24, b: 29, s: "Translation and function. Ribosomes translate GAMT mRNA. GAMT methylates guanidinoacetate (GAA) using S-adenosylmethionine (SAM) to form creatine. AAV-mediated GAMT expression restored creatine and lowered GAA in a Gamt-deficient mouse model [8].", l: "Neurons start making the missing creatine, and the toxic GAA falls." }
  ];
  var svgHost = document.getElementById("aavSvg"), chipsHost = document.getElementById("aavChips"), story = document.getElementById("aavStory"), playBtn = document.getElementById("aavPlay");
  var svg = el("svg", { viewBox: "0 0 960 540", role: "img", "aria-label": "Schematic of an AAV capsid binding a neuron, entering by endocytosis, trafficking to the nucleus, releasing a GAMT expression cassette, and producing GAMT enzyme that converts guanidinoacetate to creatine." }, svgHost);
  var defs = el("defs", {}, svg);
  var clip = el("clipPath", { id: "aavClip" }, defs); el("rect", { x: 0, y: 0, width: 960, height: 540, rx: 20 }, clip);
  var root = el("g", { "clip-path": "url(#aavClip)" }, svg);
  var S = function (fill, stroke, w) { return "fill:" + fill + ";stroke:" + (stroke || "none") + ";stroke-width:" + (w || 1.5); };
  var ACC = "var(--accent)", WARN = "var(--warn)", MUT = "var(--muted)", LINE = "var(--line)", FG = "var(--fg)", SURF = "var(--surface)", VIO = "#7a5af8", TEAL = "var(--fold)";
  var tx = function (x, y, s, o) { o = o || {}; var t = el("text", { x: x, y: y, "text-anchor": o.a || "start", style: "font:" + (o.w || 600) + " " + (o.s || 12) + "px 'Open Sans',Arial,sans-serif;fill:" + (o.c || MUT) }, o.p || root); t.textContent = s; return t; };

  /* background and cell */
  el("rect", { x: 0, y: 0, width: 960, height: 540, style: "fill:color-mix(in srgb," + ACC + " 4%," + SURF + ")" }, root);
  for (var i = 0; i < 26; i++) el("circle", { cx: (i * 71) % 320 + 8, cy: (i * 137) % 520 + 10, r: 1.6, style: "fill:" + LINE }, root);
  el("path", { d: "M330 -10 C 300 150 362 390 328 550 L 980 550 L 980 -10 Z", style: "fill:color-mix(in srgb," + ACC + " 7%," + SURF + ");stroke:" + ACC + ";stroke-width:3" }, root);
  el("path", { d: "M338 -10 C 308 150 370 390 336 550", style: "fill:none;stroke:" + ACC + ";stroke-width:1;opacity:.35" }, root);
  /* ER */
  [[470, 330], [480, 360], [490, 390]].forEach(function (p, i) { el("path", { d: "M" + (p[0] - 90) + " " + p[1] + " q 20 -16 40 0 t 40 0 t 40 0 t 40 0", style: "fill:none;stroke:" + MUT + ";stroke-width:2;opacity:.35" }, root); });
  /* nucleus */
  el("circle", { cx: 705, cy: 270, r: 156, style: "fill:color-mix(in srgb," + VIO + " 6%," + SURF + ");stroke:" + MUT + ";stroke-width:2.5" }, root);
  el("circle", { cx: 705, cy: 270, r: 148, style: "fill:none;stroke:" + MUT + ";stroke-width:1;opacity:.5" }, root);
  [[551, 270], [556, 322], [568, 215]].forEach(function (p) { el("rect", { x: p[0] - 5, y: p[1] - 13, width: 10, height: 26, rx: 3, style: "fill:" + SURF + ";stroke:" + MUT + ";stroke-width:1.5" }, root); });
  /* receptors */
  var REC = [165, 205, 245, 300, 120];
  REC.forEach(function (y) { var g = el("g", {}, root); el("path", { d: "M334 " + y + " L316 " + (y - 0) + " M316 " + y + " l-8 -9 M316 " + y + " l-8 9", style: "fill:none;stroke:" + ACC + ";stroke-width:2.2;stroke-linecap:round" }, g); });
  /* microtubule */
  var MT = { a: [348, 205], c: [450, 208], b: [545, 262] };
  var mtp = el("path", { d: "M" + MT.a[0] + " " + MT.a[1] + " Q" + MT.c[0] + " " + MT.c[1] + " " + MT.b[0] + " " + MT.b[1], style: "fill:none;stroke:" + MUT + ";stroke-width:5;stroke-dasharray:2 5;stroke-linecap:round;opacity:.55" }, root);

  function capsid(r, parent) {
    var g = el("g", {}, parent), o = [], n = [];
    for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k - Math.PI / 6; o.push([Math.cos(a) * r, Math.sin(a) * r]); n.push([Math.cos(a + Math.PI / 6) * r * .52, Math.sin(a + Math.PI / 6) * r * .52]); }
    var pts = function (arr) { return arr.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); };
    el("polygon", { points: pts(o), style: "fill:color-mix(in srgb," + ACC + " 22%," + SURF + ");stroke:" + ACC + ";stroke-width:1.6;stroke-linejoin:round" }, g);
    el("polygon", { points: pts(n), style: "fill:color-mix(in srgb," + ACC + " 38%," + SURF + ");stroke:" + ACC + ";stroke-width:1.2;stroke-linejoin:round" }, g);
    for (var j = 0; j < 6; j++) { el("line", { x1: o[j][0], y1: o[j][1], x2: n[j][0], y2: n[j][1], style: "stroke:" + ACC + ";stroke-width:1" }, g); el("line", { x1: n[j][0], y1: n[j][1], x2: o[(j + 5) % 6][0], y2: o[(j + 5) % 6][1], style: "stroke:" + ACC + ";stroke-width:1" }, g); }
    el("circle", { cx: 0, cy: 0, r: r * .12, style: "fill:" + ACC }, g);
    return g;
  }

  /* extracellular decoration and labels */
  tx(24, 30, "Extracellular space", { w: 700, s: 12 }); tx(346, 30, "Neuron (cytosol)", { w: 700, s: 12 }); tx(588, 100, "Nucleus", { w: 700, s: 12, c: VIO });
  var lbl = {};
  lbl.rec = tx(236, 276, "AAVR (KIAA0319L)", { c: ACC, a: "end" });
  lbl.pit = tx(240, 175, "clathrin-coated pit", { c: MUT, a: "end" });
  lbl.mt = tx(396, 168, "microtubule + dynein", { c: MUT });
  lbl.endo = tx(396, 316, "", { c: WARN });
  lbl.vp1 = tx(420, 132, "VP1u PLA2 domain", { c: WARN });
  lbl.npc = tx(470, 236, "nuclear pore", { c: MUT, a: "end" }); lbl.npc.setAttribute("x", 548); lbl.npc.setAttribute("y", 196);
  lbl.itr = tx(705, 212, "ITR · promoter · GAMT cDNA · polyA · ITR", { c: MUT, a: "middle", s: 11 });
  lbl.ss = tx(705, 328, "single-stranded genome", { c: MUT, a: "middle", s: 11 });
  lbl.ds = tx(705, 338, "double-stranded episome", { c: MUT, a: "middle", s: 11 });
  lbl.mrna = tx(590, 372, "GAMT mRNA", { c: ACC });
  lbl.rib = tx(372, 428, "ribosomes", { c: MUT });
  lbl.rxn = tx(470, 520, "GAA + SAM  →  creatine + SAH", { c: FG, a: "middle", s: 12, w: 700 });

  /* capsids */
  var gA = el("g", {}, root), gB = el("g", {}, root), gC = el("g", {}, root), gD = el("g", {}, root);
  capsid(17, gA); capsid(15, gB); capsid(15, gC); capsid(13, gD);
  /* vesicle and coat */
  var ves = el("circle", { r: 27, style: "fill:none;stroke:" + ACC + ";stroke-width:2.5" }, root);
  var coat = el("circle", { r: 31, style: "fill:none;stroke:" + MUT + ";stroke-width:3;stroke-dasharray:3 4" }, root);
  var spike = el("g", {}, root); [0, 1, 2].forEach(function (k) { el("path", { d: "M0 0 l" + (11 + k * 2) + " " + (-8 + k * 8), style: "fill:none;stroke:" + WARN + ";stroke-width:2;stroke-linecap:round" }, spike); el("circle", { cx: 11 + k * 2, cy: -8 + k * 8, r: 2.6, style: "fill:" + WARN }, spike); });
  /* shell facets */
  var facets = [], gF = el("g", {}, root);
  for (var f = 0; f < 6; f++) { var a1 = Math.PI / 3 * f - Math.PI / 6, a2 = a1 + Math.PI / 3; facets.push(el("polygon", { points: "0,0 " + (Math.cos(a1) * 17).toFixed(1) + "," + (Math.sin(a1) * 17).toFixed(1) + " " + (Math.cos(a2) * 17).toFixed(1) + "," + (Math.sin(a2) * 17).toFixed(1), style: "fill:color-mix(in srgb," + ACC + " 28%," + SURF + ");stroke:" + ACC + ";stroke-width:1.2" }, gF)); }
  /* linear genome */
  var gL = el("g", {}, root);
  var segs = [["ITR", 30, MUT], ["promoter", 48, TEAL], ["GAMT", 56, VIO], ["pA", 28, MUT], ["ITR", 30, MUT]], sx = 0;
  var LW = segs.reduce(function (s, q) { return s + q[1] + 2; }, 0);
  segs.forEach(function (q) { el("rect", { x: sx - LW / 2, y: -9, width: q[1], height: 18, rx: 5, style: "fill:" + q[2] + ";opacity:.9" }, gL); if (q[0] !== "ITR") { var t = el("text", { x: sx - LW / 2 + q[1] / 2, y: 4, "text-anchor": "middle", style: "font:700 9.5px 'Open Sans',Arial;fill:#fff" }, gL); t.textContent = q[0]; } sx += q[1] + 2; });
  /* episome ring */
  var gR = el("g", {}, root), RR = 40, circ = 2 * Math.PI * RR;
  [["promoter", .28, TEAL], ["GAMT", .38, VIO], ["pA", .12, MUT], ["ITR", .22, "var(--line)"]].reduce(function (off, q) {
    el("circle", { r: RR, cx: 0, cy: 0, transform: "rotate(-90)", style: "fill:none;stroke:" + q[2] + ";stroke-width:13;stroke-dasharray:" + (circ * q[1] - 2) + " " + circ + ";stroke-dashoffset:" + (-off * circ) }, gR); return off + q[1];
  }, 0);
  el("circle", { r: 26, style: "fill:" + SURF + ";opacity:.0" }, gR);
  var polym = el("g", {}, gR); el("circle", { cx: 30, cy: -34, r: 8, style: "fill:" + WARN }, polym); var pt = el("text", { x: 30, y: -31, "text-anchor": "middle", style: "font:700 8px 'Open Sans',Arial;fill:#fff" }, polym); pt.textContent = "Pol II";
  /* mRNA */
  var mr = []; for (var m = 0; m < 3; m++) { var g = el("g", {}, root); el("path", { d: "M-12 0 q4 -7 8 0 t8 0 t8 0 t8 0", style: "fill:none;stroke:" + ACC + ";stroke-width:2.4;stroke-linecap:round" }, g); el("circle", { cx: -12, cy: 0, r: 3, style: "fill:" + ACC }, g); mr.push(g); }
  /* ribosomes */
  var rib = el("g", {}, root); [[392, 400], [412, 392], [432, 402], [404, 414], [424, 418], [446, 410]].forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: 7, style: "fill:color-mix(in srgb," + MUT + " 55%," + SURF + ");stroke:" + MUT + ";stroke-width:1" }, rib); el("circle", { cx: p[0] + 4, cy: p[1] - 5, r: 4.5, style: "fill:color-mix(in srgb," + MUT + " 40%," + SURF + ");stroke:" + MUT + ";stroke-width:1" }, rib); });
  /* GAMT enzymes */
  var ENZ = [[446, 462], [372, 352], [500, 400], [420, 300], [510, 330], [358, 392]], enz = ENZ.map(function (p) { var g = el("g", {}, root); el("path", { d: "M-11 -3 q0 -10 11 -10 q11 0 11 10 q4 3 0 9 q-4 8 -11 8 q-7 0 -11 -8 q-4 -6 0 -9 z", style: "fill:" + VIO + ";stroke:" + SURF + ";stroke-width:1.5" }, g); el("path", { d: "M-5 2 q5 4 10 0", style: "fill:none;stroke:" + SURF + ";stroke-width:1.5;stroke-linecap:round;opacity:.8" }, g); return g; });
  /* substrate and product dots */
  var dots = []; for (var d = 0; d < 7; d++) dots.push(el("circle", { r: 5, style: "fill:" + WARN }, root));
  /* meters */
  var mt0 = 24, my0 = 392; el("rect", { x: mt0 - 8, y: my0 - 22, width: 214, height: 120, rx: 12, style: "fill:" + SURF + ";stroke:" + LINE + ";opacity:.96" }, root);
  var bars = [["GAMT enzyme", VIO], ["Creatine", ACC], ["GAA (toxic)", WARN]].map(function (q, i) {
    var y = my0 + i * 34; tx(mt0 + 4, y - 4, q[0], { s: 11 }); el("rect", { x: mt0 + 4, y: y, width: 190, height: 9, rx: 4.5, style: "fill:" + LINE }, root); return el("rect", { x: mt0 + 4, y: y, width: 0, height: 9, rx: 4.5, style: "fill:" + q[1] }, root);
  });
  tx(mt0 + 4, my0 - 8 - 12 + 2, "", {});
  tx(936, 528, "Schematic, not to scale", { a: "end", s: 11, w: 500 });
  /* wobble */
  var W = function (t, k) { return [Math.sin(t * 2.1 + k) * 3.5, Math.cos(t * 1.7 + k * 1.3) * 3.5]; };
  var place = function (g, x, y, s, o) { g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + (s == null ? 1 : s) + ")"); g.style.opacity = o == null ? 1 : o; };
  var show = function (e, o) { e.style.opacity = o; };

  function render(t) {
    var A, w, u, pos, v;
    /* capsid A path */
    var tA = t < 3 ? (u = E(P(t, 0, 3)), w = W(t, 1), [lerp(70, 316, u) + w[0] * (1 - u), lerp(110, 205, u) + w[1] * (1 - u)])
      : t < 5.5 ? [lerp(316, 372, E(P(t, 3, 5.5))), 205]
      : t < 10 ? bez([372, 205], [450, 208], [545 - 18, 258], E(P(t, 5.5, 10)))
      : t < 12 ? [lerp(527, 538, E(P(t, 10, 12))), lerp(256, 262, E(P(t, 10, 12)))]
      : t < 14.2 ? [lerp(538, 566, E(P(t, 12, 14.2))), lerp(262, 270, E(P(t, 12, 14.2)))]
      : [lerp(566, 705, E(P(t, 14.2, 16.5))), 270];
    var shellOpen = P(t, 16.5, 18.5);
    place(gA, tA[0], tA[1], 1 - shellOpen * 0, t > 16.5 ? 0 : 1);
    /* decorative capsids */
    var b1 = E(P(t, 0, 3.2)), b2 = E(P(t, 0, 4.2)), b3 = E(P(t, 0, 5));
    w = W(t, 3); place(gB, lerp(120, 316, b1) + w[0] * (1 - b1), lerp(330, 300, b1) + w[1] * (1 - b1), 1, 1);
    w = W(t, 5); place(gC, lerp(40, 316, b2) + w[0] * (1 - b2), lerp(60, 120, b2) + w[1] * (1 - b2), 1, t < 24 ? 1 : 1);
    w = W(t, 7); place(gD, lerp(30, 206, b3) + w[0] * (1 - b3 * .6), lerp(250, 245, b3) + w[1] * (1 - b3 * .6), 1, 1);
    if (t > 26) { place(gB, 316, 300, 1, 1); }
    /* vesicle */
    var vOn = t >= 3 && t < 12, vis = t < 3 ? 0 : t < 10.2 ? 1 : 1 - P(t, 10.2, 12);
    ves.setAttribute("cx", tA[0]); ves.setAttribute("cy", tA[1]); ves.style.opacity = vOn ? vis : 0;
    var acid = P(t, 5.5, 10); ves.style.fill = "color-mix(in srgb," + WARN + " " + Math.round(acid * 26) + "%,transparent)"; ves.style.stroke = acid > .45 ? WARN : ACC;
    ves.setAttribute("r", t > 10.2 ? 27 + (t - 10.2) * 9 : 27); ves.style.strokeDasharray = t > 10.2 ? "5 6" : "none";
    coat.setAttribute("cx", tA[0]); coat.setAttribute("cy", tA[1]); coat.style.opacity = t >= 3 && t < 5.5 ? 1 : 0;
    place(spike, tA[0] + 10, tA[1] - 4, 1, t >= 10 && t < 12.6 ? 1 : 0);
    /* shell facets and genome */
    gF.style.opacity = t > 16.5 && t < 20 ? 1 - P(t, 18.4, 20) : 0;
    facets.forEach(function (f, k) { var a = Math.PI / 3 * k, o = shellOpen * 34; f.setAttribute("transform", "translate(" + (705 + Math.cos(a) * o).toFixed(1) + " " + (270 + Math.sin(a) * o).toFixed(1) + ") rotate(" + (shellOpen * (k % 2 ? 40 : -40)).toFixed(1) + ")"); });
    var linOp = P(t, 17.4, 18.6) * (1 - P(t, 19.2, 20.6));
    place(gL, 705, 270, 1, linOp);
    var ringOp = P(t, 19.6, 21);
    place(gR, 705, 270, .85 + ringOp * .15, ringOp); gR.style.transformOrigin = "center";
    polym.style.opacity = t > 21 ? 1 : 0;
    /* mRNA */
    mr.forEach(function (g, k) {
      if (t < 21.6) { g.style.opacity = 0; return; }
      var uu = ((t - 21.6 + k * 1.1) % 3.3) / 3.3, p2 = uu < .4 ? bez([705, 270], [630, 300], [558, 322], uu / .4) : bez([558, 322], [500, 345], [430, 392], (uu - .4) / .6);
      place(g, p2[0], p2[1], 1, uu < .06 ? uu / .06 : uu > .94 ? (1 - uu) / .06 : 1);
    });
    rib.style.opacity = P(t, 22, 24);
    /* enzymes */
    enz.forEach(function (g, k) { var s = E(P(t, 23.8 + k * .55, 24.8 + k * .55)); place(g, ENZ[k][0], ENZ[k][1] + Math.sin(t * 1.5 + k) * 1.5, s, s); });
    /* substrate / product */
    dots.forEach(function (c, k) {
      var on = t > 24.8; if (!on) { c.style.opacity = 0; return; }
      var uu = ((t - 24.8) * .16 + k / dots.length) % 1, x = lerp(352, 560, uu), y = 480 + Math.sin(uu * 9 + k) * 5 - uu * 20 * 0;
      var conv = uu > .46; y = conv ? lerp(462, 440 - k * 3, (uu - .46) / .54) + Math.sin(uu * 8 + k) * 3 : 478 + Math.sin(uu * 9 + k) * 4;
      c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.style.fill = conv ? ACC : WARN; c.style.opacity = uu < .05 ? uu / .05 : uu > .95 ? (1 - uu) / .05 : 1;
    });
    /* meters */
    var g1 = P(t, 24, 29), g2 = P(t, 25.4, 29);
    bars[0].setAttribute("width", (190 * E(g1)).toFixed(1));
    bars[1].setAttribute("width", (190 * (.08 + .88 * E(g2))).toFixed(1));
    bars[2].setAttribute("width", (190 * (1 - .62 * E(g2))).toFixed(1));
    /* labels */
    var fade = function (e, a, b) { e.style.opacity = t >= a && t <= b ? 1 : 0; e.style.transition = "opacity .4s"; };
    fade(lbl.rec, 0.4, 3.4); fade(lbl.pit, 3, 5.6); fade(lbl.mt, 6, 10); fade(lbl.vp1, 10, 12.4); fade(lbl.npc, 12, 15);
    fade(lbl.itr, 17.6, 19.4); fade(lbl.ss, 17.6, 19.4); fade(lbl.ds, 20, 22.6); fade(lbl.mrna, 22, 25); fade(lbl.rib, 24, 29); fade(lbl.rxn, 25, 29);
    lbl.itr.setAttribute("y", 200); lbl.ss.setAttribute("y", 336); lbl.ds.setAttribute("y", 338);
    lbl.endo.textContent = t < 8 ? "early endosome, pH ~6" : "late endosome, pH ~5"; fade(lbl.endo, 6, 10);
    lbl.endo.setAttribute("x", tA[0] - 40); lbl.endo.setAttribute("y", tA[1] + 52);
  }

  /* controls */
  var cur = 0, chips = STAGES.map(function (s, i) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.innerHTML = "<i>" + (i + 1) + "</i>" + s.n; b.addEventListener("click", function () { t = s.a + .01; if (!playing) render(t); setStage(t); }); chipsHost.appendChild(b); return b; });
  function setStage(tt) {
    var i = 0; STAGES.forEach(function (s, k) { if (tt >= s.a) i = k; });
    if (i === cur && story.dataset.ok) return; cur = i; story.dataset.ok = 1;
    chips.forEach(function (c, k) { c.classList.toggle("on", k === i); c.setAttribute("aria-current", k === i ? "step" : "false"); });
    var s = STAGES[i], html = "<b>" + (i + 1) + ". " + s.s.split(". ")[0] + ".</b> " + s.s.split(". ").slice(1).join(". ") + " <em>In plain terms: " + s.l.charAt(0).toLowerCase() + s.l.slice(1) + "</em>";
    story.innerHTML = html.replace(/\[([\d,]+)\]/g, function (m, n) { return "<sup>" + n.split(",").map(function (x) { return '<a href="#ref' + x + '">' + x + "</a>"; }).join(", ") + "</sup>"; });
  }
  var t = reduce ? 28.5 : 0, playing = !reduce, last = 0, raf = 0, visible = true;
  function frame(now) {
    raf = 0; if (!playing || !visible || document.hidden) { last = 0; return; }
    var dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; t += dt; if (t > T_END + 1.5) t = 0;
    render(Math.min(t, T_END)); setStage(Math.min(t, T_END)); raf = requestAnimationFrame(frame);
  }
  function go() { if (playing && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
  playBtn.textContent = reduce ? "Replay" : "Pause"; playBtn.setAttribute("aria-pressed", "false");
  playBtn.addEventListener("click", function () {
    if (reduce) { t = 0; playing = true; playBtn.textContent = "Pause"; go(); return; }
    playing = !playing; playBtn.textContent = playing ? "Pause" : "Play"; if (playing) go();
  });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) go(); }, { threshold: .1 }).observe(host);
  render(t); setStage(t); go();
})();
