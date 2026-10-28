/* Hero pathway figure. A schematic, not data: balls follow the creatine pathway with its co-products and end in three fates in brain cells. */
(function () {
  var svg = document.getElementById("hf"), layer = document.getElementById("hf-balls");
  if (!svg || !layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var NS = "http://www.w3.org/2000/svg", R = 4.6, G = 300, SPEED = 90, PAIR_EVERY = 0.5, FADE = 1.4;
  var C = { arg: "#8b5cf6", gly: "#e0529c", gaa: "#c2622a", cr: "#2f7be0", atp: "#f5c542", crn: "#3ecfb8", orn: "#9ccc3c", sam: "#e9d5ff", sah: "#94a3b8" };
  var Y_AGAT = 136, Y_GAMT = 264, Y_CR = 332, Y_SLC = 378, Y_HUB = 432, BT = 552, FLOOR = 622, HALF = 52, BX = [95, 240, 385], W = [0.36, 0.34, 0.30], P_CRN = 0.07;
  function bez(p0, p1, p2, p3, n) { var o = [], i, t, u; for (i = 0; i <= n; i++) { t = i / n; u = 1 - t; o.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]); } return o; }
  function mk(pts) { var L = [0], i; for (i = 1; i < pts.length; i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])); return { p: pts, L: L, len: L[L.length-1] }; }
  function at(path, d) { var i = 1; while (i < path.L.length - 1 && path.L[i] < d) i++; var f = (d - path.L[i-1]) / ((path.L[i] - path.L[i-1]) || 1); return [path.p[i-1][0] + (path.p[i][0] - path.p[i-1][0]) * f, path.p[i-1][1] + (path.p[i][1] - path.p[i-1][1]) * f]; }
  var PA = mk(bez([125, 40], [125, 104], [240, 86], [240, 138], 60)), PG = mk(bez([355, 40], [355, 104], [240, 86], [240, 138], 60));
  [PA, PG].forEach(function (p) { var i = 0; while (p.p[i][1] < 54) i++; p.off = p.L[i]; });
  var ROUTES = [bez([240, Y_HUB], [240, 468], [95, 470], [95, 546], 24), [[240, Y_HUB], [240, 546]], bez([240, Y_HUB], [240, 468], [385, 470], [385, 546], 24)].map(function (r) { return mk([[240, Y_SLC + 14], [240, Y_HUB]].concat(r.slice(1))); });
  var balls = [], sparks = [], clock = 0, nextPair = 0, last = 0, raf = 0, running = false;
  function el(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); layer.appendChild(e); return e; }
  function ball(kind, x, y) { var b = { k: kind, x: x, y: y, vx: 0, vy: 0, d: 0, path: null, inN: false, t: 0, gone: 0, e: el("circle", { r: R, fill: C[kind] }) }; balls.push(b); return b; }
  function kill(b) { if (b.e.parentNode) b.e.parentNode.removeChild(b.e); b.dead = true; }
  function fade(b, s) { if (!b.gone) { b.gone = 0.0001; b.fs = s || FADE; } }
  function pick() { var r = Math.random(), a = 0, k; for (k = 0; k < 3; k++) { a += W[k]; if (r < a) return k; } return 2; }
  function gate(dir) { var g = document.getElementById("gate0"); if (g) { g.style.transform = "rotate(" + (dir * 34) + "deg)"; g.style.transformOrigin = "240px " + Y_HUB + "px"; } }
  function atp(b) { var l = el("text", { fill: C.atp, "font-size": 9, "font-weight": 700, "text-anchor": "middle", "font-family": "Inter, system-ui, sans-serif" }); l.textContent = "ATP"; sparks.push({ x: b.x, y: b.y, t: 0, e: el("circle", { r: 3.4, fill: C.atp }), l: l }); }
  function ring(b) { sparks.push({ x: b.x, y: b.y, t: 0, ring: true, e: el("circle", { r: R, fill: "none", stroke: "#ff9f5a", "stroke-width": 1.6 }) }); }
  /* co-product that leaves sideways from a reaction, hidden behind the enzyme until it clears it */
  function leave(kind, x, y, to) { var b = ball(kind, x, y); b.side = true; b.vx = SPEED; b.stop = to; return b; }
  function fate(b) {
    var k = b.bin, t = b.t;
    if (k === 0) { if (t > 1.2 && !b.s1) { b.s1 = 1; b.e.setAttribute("fill", "#9b8cff"); } if (t > 16) fade(b); }
    else if (k === 1) { if (t > 0.15 && !b.s1) { b.s1 = 1; b.e.setAttribute("fill", C.atp); atp(b); } if (t > 3) fade(b); }
    else { if (t > 1.5 && !b.s1) { b.s1 = 1; ring(b); } if (t > 3 && !b.s2) { b.s2 = 1; ring(b); } if (t > 4.5 && !b.s3) { b.s3 = 1; ring(b); } if (t > 5.4) fade(b); }
  }
  function step(dt) {
    var i, j, b, o, dx, dy, dd, ov;
    clock += dt;
    if (clock >= nextPair) { nextPair = clock + PAIR_EVERY; var a = ball("arg", 125, 54), g = ball("gly", 355, 54); a.path = PA; g.path = PG; a.d = PA.off; g.d = PG.off; a.pair = g; g.pair = a; }
    for (i = 0; i < balls.length; i++) {
      b = balls[i]; if (b.dead) continue;
      if (b.side) {
        b.x += b.vx * dt;
        if (b.x >= b.stop) { b.vx = 0; fade(b, 0.7); }
        if (b.sam && b.x >= 240) { kill(b); leave("sah", 240, Y_GAMT, 366); continue; }
      } else if (b.path) {
        b.d += SPEED * dt; var q = at(b.path, Math.min(b.d, b.path.len)); b.x = q[0]; b.y = q[1];
        if (b.d >= b.path.len && (b.k === "arg" || b.k === "gly")) {
          if (!b.pair.dead && b.pair.d >= b.pair.path.len - 0.01 && b.k === "arg") { ball("gaa", 240, Y_AGAT); leave("orn", 240, Y_AGAT, 366); var s = leave("sam", 108, Y_GAMT, 9999); s.sam = true; s.vx = (240 - 108) / ((Y_GAMT - Y_AGAT) / SPEED); kill(b); kill(b.pair); } else if (b.pair.dead) { kill(b); }
        }
      } else if (b.k === "gaa" || (b.k === "cr" && !b.free)) {
        b.y += SPEED * dt;
        if (b.k === "gaa" && b.y >= Y_GAMT) { b.k = "cr"; b.e.setAttribute("fill", C.cr); }
        if (b.k === "cr" && !b.chk && b.y >= Y_CR) { b.chk = 1; if (Math.random() < P_CRN) { b.k = "crn"; b.e.setAttribute("fill", C.crn); b.side = true; b.vx = SPEED * 0.8; b.stop = 404; continue; } }
        if (b.k === "cr" && b.y >= Y_SLC) { b.free = true; b.x = 240; }
      } else if (b.helix) {
        b.hd += (85 + 0.55 * b.hd) * dt; var hq = at(b.route, Math.min(b.hd, b.route.len)); b.x = hq[0]; b.y = hq[1];
        if (!b.g1 && b.y >= Y_HUB - 30) { b.g1 = 1; gate(b.bin - 1); }
        if (b.hd >= b.route.len) { b.helix = false; b.inN = true; b.t = 0; b.vx = Math.random() * 70 - 35; b.vy = 70; }
      } else if (b.free && !b.gone) {
        if (!b.inN && !b.route) { b.y += SPEED * dt; if (b.y >= Y_SLC + 14) { b.bin = pick(); b.route = ROUTES[b.bin]; b.helix = true; b.hd = 0; continue; } }
        if (b.inN) {
          b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt;
          var lo = BX[b.bin] - HALF + R, hi = BX[b.bin] + HALF - R;
          if (b.y > BT) { if (b.x < lo) { b.x = lo; b.vx = Math.abs(b.vx) * .3; } if (b.x > hi) { b.x = hi; b.vx = -Math.abs(b.vx) * .3; } }
          if (b.y > FLOOR - R) { b.y = FLOOR - R; b.vy = -Math.abs(b.vy) * .25; b.vx *= .9; if (Math.abs(b.vy) < 8) b.vy = 0; }
          fate(b);
        }
      }
      if (b.gone) { b.gone += dt; var f = Math.min(1, b.gone / (b.fs || FADE)); b.e.setAttribute("opacity", (1 - f).toFixed(2)); if (b.gone > (b.fs || FADE)) kill(b); }
      if (!b.dead) { b.e.setAttribute("cx", b.x.toFixed(1)); b.e.setAttribute("cy", b.y.toFixed(1)); }
    }
    for (var pass = 0; pass < 2; pass++) for (i = 0; i < balls.length; i++) { b = balls[i]; if (b.dead || !b.inN || b.gone) continue; for (j = i + 1; j < balls.length; j++) { o = balls[j]; if (o.dead || !o.inN || o.gone || o.bin !== b.bin) continue; dx = o.x - b.x; dy = o.y - b.y; dd = Math.hypot(dx, dy); if (dd < 2 * R && dd > 0.001) { ov = (2 * R - dd) / 2; dx /= dd; dy /= dd; b.x -= dx * ov; b.y -= dy * ov; o.x += dx * ov; o.y += dy * ov; b.vx -= dx * 4; o.vx += dx * 4; if (dy > 0) { b.vy = Math.min(b.vy, 0) * .2; } else { o.vy = Math.min(o.vy, 0) * .2; } } } }
    for (i = sparks.length - 1; i >= 0; i--) {
      var sp = sparks[i]; sp.t += dt;
      if (sp.ring) { var rp = Math.min(1, sp.t / 0.9); sp.e.setAttribute("cx", sp.x.toFixed(1)); sp.e.setAttribute("cy", sp.y.toFixed(1)); sp.e.setAttribute("r", (R + 14 * rp).toFixed(1)); sp.e.setAttribute("opacity", (1 - rp).toFixed(2)); if (rp >= 1) { sp.e.remove(); sparks.splice(i, 1); } continue; }
      var p = Math.min(1, sp.t / FADE), yy = sp.y - 26 * p; sp.e.setAttribute("cx", sp.x.toFixed(1)); sp.e.setAttribute("cy", yy.toFixed(1)); sp.e.setAttribute("opacity", (1 - p).toFixed(2)); sp.l.setAttribute("x", sp.x.toFixed(1)); sp.l.setAttribute("y", (yy - 7).toFixed(1)); sp.l.setAttribute("opacity", (1 - p).toFixed(2)); if (p >= 1) { sp.e.remove(); sp.l.remove(); sparks.splice(i, 1); }
    }
    balls = balls.filter(function (x) { return !x.dead; });
  }
  function loop(now) { raf = 0; if (!running) { last = 0; return; } var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; step(dt); raf = requestAnimationFrame(loop); }
  function go() { if (!raf && running) raf = requestAnimationFrame(loop); }
  var vis = true; function upd() { running = vis && !document.hidden; go(); }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; upd(); }).observe(svg); else upd();
  document.addEventListener("visibilitychange", upd); upd();
})();
