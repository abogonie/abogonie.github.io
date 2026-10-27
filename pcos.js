/* PCOS page illustrations. Both are conceptual drawings, not data. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = function (n, d) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d; };
  var vis = function (el, fn) { if (reduce || !("IntersectionObserver" in window)) { fn(); return; } var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: 0.3 }); io.observe(el); };

  /* ---------- diverse cohort: one dot per ~150 people measured, six ancestry groups (All of Us) ---------- */
  var cv = document.getElementById("cohort");
  if (cv) (function () {
    var UNIT = 150;
    var G = [
      { n: "European", a: "eur", cases: 2919, ctrl: 162063, c: "--mouse" },
      { n: "Admixed American", a: "amr", cases: 988, ctrl: 59559, c: "--warn" },
      { n: "African", a: "afr", cases: 618, ctrl: 49523, c: "--accent" },
      { n: "East Asian", a: "eas", cases: 124, ctrl: 9069, c: "#c2185b" },
      { n: "South Asian", a: "sas", cases: 96, ctrl: 2701, c: "#7e57c2" },
      { n: "Middle Eastern", a: "mid", cases: 23, ctrl: 975, c: "#2e9e47" }
    ];
    var TC = 0; G.forEach(function (g) { g.tot = g.cases + g.ctrl; g.k = Math.max(2, Math.round(g.tot / UNIT)); g.rings = Math.max(1, Math.round(g.k * g.cases / g.tot)); TC += g.cases; });
    var rotY = 0.6, rotX = -0.25, vY = 0.25, vX = 0, drag = null, Rs = 120, ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, dots = [], t0 = 0, started = false, sepT = 0, sepC = 0, lastNow = 0, btn = null, raf = 0, visible = true, col = [], fg = "#111", rd = 3, geo = [];
    var f1 = function (n) { return n.toLocaleString("en-US"); };
    function colors() { col = G.map(function (g) { return g.c.charAt(0) === "#" ? g.c : css(g.c, "#2563eb"); }); fg = css("--fg", "#111"); }
    function layout() {
      var m = W < 680, sq = G.map(function (g) { return Math.sqrt(g.k); }), c, cy, out = [];
      if (!m) {
        var gap = 28, sum = 0; sq.forEach(function (q) { sum += q; });
        c = Math.min(5.4, (W - 24 - gap * 5) / (2 * sum)); var x = (W - (2 * c * sum + gap * 5)) / 2; cy = H / 2;
        G.forEach(function (g, i) { var r = c * sq[i]; out.push([x + r, cy, r]); x += 2 * r + gap; });
      } else {
        c = Math.min(3.6, W * 0.3 / sq[0]); var r0 = c * sq[0], r1 = c * sq[1], r2 = c * sq[2], r3 = c * sq[3], r4 = c * sq[4], r5 = c * sq[5], y = 14 + r0;
        out.push([W / 2, y, r0]); y += r0 + 26 + Math.max(r1, r2);
        out.push([W * 0.28, y, r1]); out.push([W * 0.72, y, r2]); y += Math.max(r1, r2) + 26 + Math.max(r3, 22);
        var xs = [W * 0.22, W * 0.5, W * 0.78]; out.push([xs[0], y, r3]); out.push([xs[1], y, r4]); out.push([xs[2], y, r5]);
      }
      rd = Math.max(1.8, Math.min(3.6, c * 0.68)); return out;
    }
    function build() {
      W = cv.clientWidth; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.style.height = W < 680 ? "560px" : "400px"; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); colors();
      geo = layout(); dots = []; Rs = Math.max(70, Math.min(H * 0.4, W * 0.3));
      G.forEach(function (g, gi) {
        var C = geo[gi];
        for (var i = 0; i < g.k; i++) {
          var a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * C[2], u = Math.random() * 2 - 1, a2 = Math.random() * 6.283, q = Math.sqrt(1 - u * u), sh = 0.8 + 0.2 * Math.cbrt(Math.random());
          dots.push({ g: gi, x3: q * Math.cos(a2) * sh, y3: u * sh, z3: q * Math.sin(a2) * sh, bx: 0, by: 0, dz: 0, tx: C[0] + Math.cos(a) * d, ty: C[1] + Math.sin(a) * d, x: Math.random() * W, y: Math.random() * H, ph: Math.random() * 6.283, case_: i < g.rings });
        }
      });
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H); var k = started ? Math.min(1, (now - t0) / 1600) : 0, g = 1 - Math.pow(1 - k, 3), dtt = lastNow ? Math.min(.05, (now - lastNow) / 1000) : 0; lastNow = now; sepC += (sepT - sepC) * Math.min(1, dtt * 2.4); if (Math.abs(sepT - sepC) < .002) sepC = sepT; var e = sepC * sepC * (3 - 2 * sepC);
      if (!drag && !reduce) { rotY += vY * dtt; rotX += vX * dtt; vX *= Math.pow(0.12, dtt); vY += (0.25 - vY) * Math.min(1, dtt * 0.8); rotX *= Math.pow(0.7, dtt); }
      var cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX), cx0 = W / 2, cy0 = H / 2;
      var se = (1 - e) * g;
      if (se > 0.01) {
        ctx.save(); ctx.fillStyle = fg; ctx.strokeStyle = fg;
        ctx.globalAlpha = 0.07 * se; ctx.beginPath(); ctx.ellipse(cx0, cy0 + Rs * 1.16, Rs * 0.8, Rs * 0.09, 0, 0, 6.283); ctx.fill();
        var gr = ctx.createRadialGradient(cx0 - Rs * 0.35, cy0 - Rs * 0.4, Rs * 0.1, cx0, cy0, Rs * 1.05); gr.addColorStop(0, "rgba(255,255,255,0.0)"); gr.addColorStop(1, "rgba(120,140,170,0.16)");
        ctx.globalAlpha = se; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx0, cy0, Rs * 1.04, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 0.22 * se; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx0, cy0, Rs * 1.04, 0, 6.283); ctx.stroke();
        ctx.lineWidth = 0.8; ctx.lineCap = "round";
        for (var gi2 = 0; gi2 < 11; gi2++) {
          var mer = gi2 < 6, ang = mer ? gi2 * Math.PI / 6 : (gi2 - 6 + 1) / 6 * Math.PI - Math.PI / 2, px = 0, py = 0, has = false;
          for (var st = 0; st <= 48; st++) {
            var th = st / 48 * 6.283, X, Y, Z;
            if (mer) { X = Math.cos(th) * Math.cos(ang); Z = Math.cos(th) * Math.sin(ang); Y = Math.sin(th); } else { X = Math.cos(th) * Math.cos(ang); Z = Math.sin(th) * Math.cos(ang); Y = Math.sin(ang); }
            var a1 = X * cY + Z * sY, b1 = -X * sY + Z * cY, c1 = Y * cX - b1 * sX, d1 = Y * sX + b1 * cX, s1 = 1 + 0.22 * d1, qx = cx0 + a1 * Rs * s1 * 1.0, qy = cy0 + c1 * Rs * s1 * 1.0;
            if (has) { ctx.globalAlpha = (d1 > 0 ? 0.16 : 0.05) * se; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke(); }
            px = qx; py = qy; has = true;
          }
        }
        ctx.restore();
      }
      dots.forEach(function (d) {
        var x1 = d.x3 * cY + d.z3 * sY, z1 = -d.x3 * sY + d.z3 * cY, y1 = d.y3 * cX - z1 * sX, z2 = d.y3 * sX + z1 * cX, sc = 1 + 0.22 * z2;
        d.bx = cx0 + x1 * Rs * sc; d.by = cy0 + y1 * Rs * sc; d.dz = z2;
      });
      if (e < 0.5) dots.sort(function (p, q) { return p.dz - q.dz; });
      dots.forEach(function (d) {
        var gx = d.x + (d.bx - d.x) * g, gy = d.y + (d.by - d.y) * g, x = gx + (d.tx - gx) * e, y = gy + (d.ty - gy) * e;
        if (e > 0.5) { x += Math.sin(now / 1300 + d.ph) * 1.6; y += Math.cos(now / 1500 + d.ph) * 1.6; }
        var dep = (1 - e) * d.dz * g, rr = rd * (1 + 0.3 * dep);
        ctx.fillStyle = col[d.g]; ctx.globalAlpha = Math.max(0.18, 0.8 + 0.2 * dep - (dep < 0 ? 0.3 * -dep : 0)); ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill();
        if (dep > 0.25) { ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.35 * dep; ctx.beginPath(); ctx.arc(x - rr * 0.3, y - rr * 0.3, rr * 0.38, 0, 6.283); ctx.fill(); }
        if (d.case_ && k > 0.6) { var p = (Math.sin(now / 700 + d.ph) + 1) / 2, far = dep < -0.2 ? 0.35 : 1; ctx.strokeStyle = fg; ctx.lineWidth = 1.4; ctx.globalAlpha = far * (e > 0.9 ? 0.3 + 0.55 * p : 0.85); ctx.beginPath(); ctx.arc(x, y, rr + 2 + (e > 0.9 ? 3 * p : 0.8), 0, 6.283); ctx.stroke(); }
      });
      ctx.globalAlpha = 1; ctx.fillStyle = fg; ctx.font = "600 12px 'Open Sans', Arial, sans-serif"; ctx.textAlign = "center";
      G.forEach(function (gg, i) { ctx.globalAlpha = Math.max(0, e * 1.4 - .4); var C = geo[i]; ctx.fillText(gg.a.toUpperCase(), C[0], C[1] + C[2] + 18); });
      ctx.globalAlpha = Math.max(0, 1 - e * 3) * 0.7; ctx.font = "400 12px 'Open Sans', Arial, sans-serif"; ctx.fillText("Drag to rotate · rings = women with PCOS", W / 2, H - 10); ctx.globalAlpha = 1;
    }
    function loop(now) { raf = 0; if (!visible || document.hidden) { lastNow = 0; return; } draw(now); raf = requestAnimationFrame(loop); }
    function go() { if (!reduce && !raf) raf = requestAnimationFrame(loop); }
    cv.style.touchAction = "pan-y"; cv.style.cursor = "grab"; cv.setAttribute("tabindex", "0");
    cv.addEventListener("pointerdown", function (ev) { if (sepC > 0.5) return; drag = { x: ev.clientX, y: ev.clientY, t: performance.now(), touch: ev.pointerType === "touch" }; try { cv.setPointerCapture(ev.pointerId); } catch (x) {} cv.style.cursor = "grabbing"; });
    cv.addEventListener("pointermove", function (ev) { if (!drag) return; var dx = ev.clientX - drag.x, dy = drag.touch ? 0 : ev.clientY - drag.y, now = performance.now(), dt = Math.max(0.008, (now - drag.t) / 1000); rotY += dx * 0.011; rotX = Math.max(-1.3, Math.min(1.3, rotX - dy * 0.011)); vY = dx * 0.011 / dt; vX = -dy * 0.011 / dt; vY = Math.max(-6, Math.min(6, vY)); drag.x = ev.clientX; drag.y = ev.clientY; drag.t = now; if (reduce) draw(0); });
    var endDrag = function () { drag = null; cv.style.cursor = "grab"; }; cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);
    cv.addEventListener("keydown", function (ev) { if (ev.key === "ArrowLeft") { rotY -= 0.2; } else if (ev.key === "ArrowRight") { rotY += 0.2; } else if (ev.key === "ArrowUp") { rotX = Math.min(1.3, rotX + 0.2); } else if (ev.key === "ArrowDown") { rotX = Math.max(-1.3, rotX - 0.2); } else return; ev.preventDefault(); if (reduce) draw(0); });
    var key = document.createElement("ul"); key.className = "cohort-key";
    G.forEach(function (g, i) { var li = document.createElement("li"); li.innerHTML = '<i></i><span><b>' + g.n + ' (' + g.a + ')</b><br>' + f1(g.cases) + ' cases · ' + f1(g.ctrl) + ' controls · ' + (100 * g.cases / TC).toFixed(1) + '% of cases</span>'; li.firstChild.style.background = g.c.charAt(0) === "#" ? g.c : "var(" + g.c + ")"; key.appendChild(li); });
    (function () { var li = document.createElement("li"); li.innerHTML = '<i class="ring"></i><span><b>Ringed dot = a woman with PCOS</b><br>' + f1(TC) + ' cases in total, spread through every group above. The rest are controls.</span>'; key.appendChild(li); })();
    build();
    btn = document.createElement("button"); btn.type = "button"; btn.className = "btn"; btn.textContent = "Separate by ancestry"; btn.setAttribute("aria-pressed", "false");
    cv.parentNode.appendChild(btn); cv.parentNode.appendChild(key);
    btn.addEventListener("click", function () { sepT = sepT ? 0 : 1; btn.textContent = sepT ? "Overlap groups" : "Separate by ancestry"; btn.setAttribute("aria-pressed", String(!!sepT)); if (reduce) { sepC = sepT; draw(0); } else go(); });
    if (reduce) { started = true; t0 = -9999; draw(0); } else { draw(0); }
    vis(cv, function () { started = true; t0 = performance.now(); go(); });
    var rb = function () { if (cv.clientWidth !== W) { build(); if (reduce) draw(0); } };
    if ("ResizeObserver" in window) new ResizeObserver(rb).observe(cv); else window.addEventListener("resize", rb);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) go(); }).observe(cv);
    new MutationObserver(function () { colors(); if (reduce) draw(0); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  })();

  /* ---------- polygenic score idea: cases shift to slightly higher scores ---------- */
  var host = document.getElementById("pgs");
  if (host) (function () {
    var NS = "http://www.w3.org/2000/svg", W = 520, H = 230, X0 = 20, X1 = 500, BASE = 180, AMP = 140;
    var sx = function (z) { return X0 + (z + 3.6) / 7.2 * (X1 - X0); };
    var curve = function (mu) { var d = ""; for (var z = -3.6; z <= 3.601; z += 0.1) d += (d ? "L" : "M") + sx(z).toFixed(1) + " " + (BASE - AMP * Math.exp(-Math.pow(z - mu, 2) / 2)).toFixed(1); return d; };
    var el = function (n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); (p || host).appendChild(e); return e; };
    host.setAttribute("viewBox", "0 0 " + W + " " + H);
    el("line", { x1: X0, x2: X1, y1: BASE, y2: BASE, stroke: "var(--line)", "stroke-width": 2 });
    var cFill = el("path", { fill: "var(--muted)", opacity: 0.18 }), cLine = el("path", { fill: "none", stroke: "var(--muted)", "stroke-width": 2.5 });
    var aFill = el("path", { fill: "var(--accent)", opacity: 0.2 }), aLine = el("path", { fill: "none", stroke: "var(--accent)", "stroke-width": 2.5 });
    var m1 = el("line", { y1: 28, y2: BASE, stroke: "var(--muted)", "stroke-dasharray": "4 4", opacity: 0.6 }), m2 = el("line", { y1: 28, y2: BASE, stroke: "var(--accent)", "stroke-dasharray": "4 4", opacity: 0.8 });
    var T = function (x, y, s, fill, anchor) { var t = el("text", { x: x, y: y, fill: fill, "font-size": 13, "font-weight": 600, "text-anchor": anchor || "middle", "font-family": "Open Sans, Arial, sans-serif" }); t.textContent = s; return t; };
    T(X0, 206, "Fewer risk variants", "var(--muted)", "start"); T(X1, 206, "More risk variants", "var(--muted)", "end"); T(W / 2, 224, "Polygenic score", "var(--muted)");
    T(sx(-1.6), 52, "Women without PCOS", "var(--muted)"); var lc = T(sx(1.9), 52, "Women with PCOS", "var(--accent)");
    function set(shift) {
      var base = curve(0), cas = curve(shift);
      cLine.setAttribute("d", base); cFill.setAttribute("d", base + "L" + sx(3.6) + " " + BASE + "L" + sx(-3.6) + " " + BASE + "Z");
      aLine.setAttribute("d", cas); aFill.setAttribute("d", cas + "L" + sx(3.6) + " " + BASE + "L" + sx(-3.6) + " " + BASE + "Z");
      m1.setAttribute("x1", sx(0)); m1.setAttribute("x2", sx(0)); m2.setAttribute("x1", sx(shift)); m2.setAttribute("x2", sx(shift)); lc.setAttribute("x", sx(1.9 + shift * 0.6));
    }
    set(reduce ? 0.5 : 0);
    vis(host, function () { if (reduce) return; var t0 = performance.now(); (function s(now) { var k = Math.min(1, (now - t0) / 1800), e = 1 - Math.pow(1 - k, 3); set(0.5 * e); if (k < 1) requestAnimationFrame(s); })(t0); });
    var rp = document.getElementById("pgsReplay");
    if (rp) rp.addEventListener("click", function () { if (reduce) return; var t0 = performance.now(); (function s(now) { var k = Math.min(1, (now - t0) / 1800), e = 1 - Math.pow(1 - k, 3); set(0.5 * e); if (k < 1) requestAnimationFrame(s); })(t0); });
  })();
})();
