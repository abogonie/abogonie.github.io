/* Hero pathway figure: balls follow the pathway and fill the neuron. A schematic, not data. */
(function () {
  var svg = document.getElementById("hf"), layer = document.getElementById("hf-balls");
  if (!svg || !layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var NS = "http://www.w3.org/2000/svg", R = 4.6, G = 300, SPEED = 90, PAIR_EVERY = 0.4, FADE = 1.4;
  var C = { arg: "#8b5cf6", gly: "#e0529c", gaa: "#c2622a", cr: "#2f7be0", atp: "#f5c542", crn: "#3ecfb8" };
  var NT = 374, FLOOR = 592, BT = 524;
  function bez(p0, p1, p2, p3, n) { var o = [], i, t, u; for (i = 0; i <= n; i++) { t = i / n; u = 1 - t; o.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]); } return o; }
  function mk(pts) { var L = [0], i; for (i = 1; i < pts.length; i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])); return { p: pts, L: L, len: L[L.length-1] }; }
  function at(path, d) { var i = 1; while (i < path.L.length - 1 && path.L[i] < d) i++; var f = (d - path.L[i-1]) / ((path.L[i] - path.L[i-1]) || 1); return [path.p[i-1][0] + (path.p[i][0] - path.p[i-1][0]) * f, path.p[i-1][1] + (path.p[i][1] - path.p[i-1][1]) * f]; }
  var pa = bez([125, 54], [125, 84], [240, 74], [240, 108], 30).concat([[240, 126]]), pg = bez([355, 54], [355, 84], [240, 74], [240, 108], 30).concat([[240, 126]]);
  var BX = [85, 188, 292, 395], W = [0.30, 0.26, 0.20, 0.24];
  var E = { a0: [[240, 404]], l: bez([240, 404], [240, 428], [140, 426], [140, 452], 20), r: bez([240, 404], [240, 428], [340, 426], [340, 452], 20),
    ll: bez([140, 452], [140, 476], [85, 474], [85, 512], 20), lr: bez([140, 452], [140, 476], [188, 470], [188, 512], 20), rl: bez([340, 452], [340, 476], [292, 470], [292, 512], 20), rr: bez([340, 452], [340, 476], [395, 474], [395, 512], 20) };
  function route(k) { var side = k < 2 ? "l" : "r", sub = side + (k % 2 ? "r" : "l"), pts = [[240, 374], [240, 404]].concat(E[side].slice(1), E[sub].slice(1), [[BX[k], 524]]), p = mk(pts); p.h1 = 30; p.h2 = mk([[240, 374], [240, 404]].concat(E[side].slice(1))).len; return p; }
  var ROUTES = [0, 1, 2, 3].map(route);
  function pick() { var r = Math.random(), a = 0, k; for (k = 0; k < 4; k++) { a += W[k]; if (r < a) return k; } return 3; }
  function gate(i, dir) { var g = document.getElementById("gate" + i); if (g) { var x = +g.getAttribute("x1"), y = +g.getAttribute("y1"); g.style.transform = "rotate(" + (dir * 32) + "deg)"; g.style.transformOrigin = x + "px " + y + "px"; } }
  var PA = mk(pa), PG = mk(pg), balls = [], sparks = [], clock = 0, nextPair = 0, last = 0, raf = 0, running = false;
  function el(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); layer.appendChild(e); return e; }
  function ball(kind, x, y) { var b = { k: kind, x: x, y: y, vx: 0, vy: 0, d: 0, path: null, inN: false, t: 0, gone: 0, e: el("circle", { r: R, fill: C[kind] }) }; balls.push(b); return b; }
  function kill(b) { if (b.e.parentNode) b.e.parentNode.removeChild(b.e); b.dead = true; }
  function fade(b) { if (!b.gone) b.gone = 0.0001; }
  function atp(b) { sparks.push({ x: b.x, y: b.y, t: 0, e: el("circle", { r: 3.4, fill: C.atp }), l: (function () { var l = el("text", { fill: C.atp, "font-size": 9, "font-weight": 700, "text-anchor": "middle", "font-family": "Inter, system-ui, sans-serif" }); l.textContent = "ATP"; return l; })() }); }
  function ring(b) { sparks.push({ x: b.x, y: b.y, t: 0, ring: true, e: el("circle", { r: R, fill: "none", stroke: "#ff9f5a", "stroke-width": 1.6 }) }); }
  /* what each endpoint does, by seconds after arrival */
  function fate(b, dt) {
    var k = b.bin, t = b.t;
    if (k === 0) { if (t > 1.2 && !b.s1) { b.s1 = 1; b.e.setAttribute("fill", "#9b8cff"); } if (t > 16) fade(b); }
    else if (k === 1) { if (t > 0.15 && !b.s1) { b.s1 = 1; b.e.setAttribute("fill", C.atp); atp(b); } if (t > 3) fade(b); }
    else if (k === 2) { if (t > 1.5 && !b.s1) { b.s1 = 1; ring(b); } if (t > 3 && !b.s2) { b.s2 = 1; ring(b); } if (t > 4.5 && !b.s3) { b.s3 = 1; ring(b); } if (t > 5.4) fade(b); }
    else { if (t > 8 && !b.s1) { b.s1 = 1; b.e.setAttribute("fill", C.crn); fade(b); } }
  }
  function step(dt) {
    var i, j, b, o, dx, dy, dd, ov;
    clock += dt;
    if (clock >= nextPair) { nextPair = clock + PAIR_EVERY; var a = ball("arg", 125, 54), g = ball("gly", 355, 54); a.path = PA; g.path = PG; a.pair = g; g.pair = a; }
    for (i = 0; i < balls.length; i++) {
      b = balls[i]; if (b.dead) continue;
      if (b.path) {
        b.d += SPEED * dt; var q = at(b.path, Math.min(b.d, b.path.len)); b.x = q[0]; b.y = q[1];
        if (b.d >= b.path.len && (b.k === "arg" || b.k === "gly")) { if (!b.pair.dead && b.pair.d >= b.pair.path.len - 0.01 && b.k === "arg") { var n = ball("gaa", 240, 126); kill(b); kill(b.pair); } else if (b.pair.dead) { kill(b); } }
      } else if (b.k === "gaa" || (b.k === "cr" && !b.free)) {
        b.y += SPEED * dt;
        if (b.k === "gaa" && b.y >= 238) { b.k = "cr"; b.e.setAttribute("fill", C.cr); }
        if (b.k === "cr" && b.y >= 348) { b.free = true; b.vy = SPEED; b.x = 240; }
      } else if (b.helix) {
        b.hd += (85 + 0.55 * b.hd) * dt; var hq = at(b.route, Math.min(b.hd, b.route.len)); b.x = hq[0]; b.y = hq[1];
        if (!b.g1 && b.hd >= 28) { b.g1 = 1; gate(0, b.bin < 2 ? -1 : 1); }
        if (!b.g2 && b.hd >= b.route.h2 - 6) { b.g2 = 1; if (b.bin < 2) gate(1, b.bin % 2 ? 1 : -1); else gate(2, b.bin % 2 ? 1 : -1); }
        if (b.hd >= b.route.len) { b.helix = false; b.inN = true; b.t = 0; b.vx = Math.random() * 70 - 35; b.vy = 70; }
      } else if (b.free && !b.gone) {
        if (!b.inN && !b.route) { b.y += SPEED * dt; }
        if (!b.inN && !b.helix && b.y >= NT - 2 && !b.route) { b.bin = pick(); b.route = ROUTES[b.bin]; b.helix = true; b.hd = 0; b.y = NT - 2; continue; }
        if (b.inN) {
          b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt;
          var lo = BX[b.bin] - 40 + R, hi = BX[b.bin] + 40 - R;
          if (b.y > BT) { if (b.x < lo) { b.x = lo; b.vx = Math.abs(b.vx) * .3; } if (b.x > hi) { b.x = hi; b.vx = -Math.abs(b.vx) * .3; } }
          if (b.y > FLOOR - R) { b.y = FLOOR - R; b.vy = -Math.abs(b.vy) * .25; b.vx *= .9; if (Math.abs(b.vy) < 8) b.vy = 0; }
          fate(b, dt);
        }
      }
      if (b.gone) { b.gone += dt; var f = Math.min(1, b.gone / FADE); b.e.setAttribute("opacity", (1 - f).toFixed(2)); if (b.gone > FADE) kill(b); }
      if (!b.dead) { b.e.setAttribute("cx", b.x.toFixed(1)); b.e.setAttribute("cy", b.y.toFixed(1)); }
    }
    for (var pass = 0; pass < 2; pass++) for (i = 0; i < balls.length; i++) { b = balls[i]; if (b.dead || !b.inN || b.gone) continue; for (j = i + 1; j < balls.length; j++) { o = balls[j]; if (o.dead || !o.inN || o.gone || o.bin !== b.bin) continue; dx = o.x - b.x; dy = o.y - b.y; dd = Math.hypot(dx, dy); if (dd < 2 * R && dd > 0.001) { ov = (2 * R - dd) / 2; dx /= dd; dy /= dd; b.x -= dx * ov; b.y -= dy * ov; o.x += dx * ov; o.y += dy * ov; b.vx -= dx * 4; o.vx += dx * 4; if (dy > 0) { b.vy = Math.min(b.vy, 0) * .2; } else { o.vy = Math.min(o.vy, 0) * .2; } } } }
    for (i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i]; s.t += dt;
      if (s.ring) { var rp = Math.min(1, s.t / 0.9); s.e.setAttribute("cx", s.x.toFixed(1)); s.e.setAttribute("cy", s.y.toFixed(1)); s.e.setAttribute("r", (R + 14 * rp).toFixed(1)); s.e.setAttribute("opacity", (1 - rp).toFixed(2)); if (rp >= 1) { s.e.remove(); sparks.splice(i, 1); } continue; }
      var p = Math.min(1, s.t / FADE), yy = s.y - 26 * p; s.e.setAttribute("cx", s.x.toFixed(1)); s.e.setAttribute("cy", yy.toFixed(1)); s.e.setAttribute("opacity", (1 - p).toFixed(2)); s.l.setAttribute("x", s.x.toFixed(1)); s.l.setAttribute("y", (yy - 7).toFixed(1)); s.l.setAttribute("opacity", (1 - p).toFixed(2)); if (p >= 1) { s.e.remove(); s.l.remove(); sparks.splice(i, 1); }
    }
    balls = balls.filter(function (x) { return !x.dead; });
  }
  function loop(now) { raf = 0; if (!running) { last = 0; return; } var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; step(dt); raf = requestAnimationFrame(loop); }
  function go() { if (!raf && running) raf = requestAnimationFrame(loop); }
  var vis = true; function upd() { running = vis && !document.hidden; go(); }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; upd(); }).observe(svg); else upd();
  document.addEventListener("visibilitychange", upd); upd();
})();
