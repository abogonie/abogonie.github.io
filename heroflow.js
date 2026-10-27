/* Hero pathway figure: balls follow the pathway and fill the neuron. A schematic, not data. */
(function () {
  var svg = document.getElementById("hf"), layer = document.getElementById("hf-balls");
  if (!svg || !layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var NS = "http://www.w3.org/2000/svg", R = 4.6, G = 300, SPEED = 90, PAIR_EVERY = 0.24, LIFE = 5, FADE = 1.4;
  var C = { arg: "#8b5cf6", gly: "#e0529c", gaa: "#c2622a", cr: "#2f7be0", atp: "#f5c542", crn: "#3ecfb8" };
  var NL = 46, NR = 434, NT = 374, FLOOR = 452;
  function bez(p0, p1, p2, p3, n) { var o = [], i, t, u; for (i = 0; i <= n; i++) { t = i / n; u = 1 - t; o.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]); } return o; }
  function mk(pts) { var L = [0], i; for (i = 1; i < pts.length; i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])); return { p: pts, L: L, len: L[L.length-1] }; }
  function at(path, d) { var i = 1; while (i < path.L.length - 1 && path.L[i] < d) i++; var f = (d - path.L[i-1]) / ((path.L[i] - path.L[i-1]) || 1); return [path.p[i-1][0] + (path.p[i][0] - path.p[i-1][0]) * f, path.p[i-1][1] + (path.p[i][1] - path.p[i-1][1]) * f]; }
  var pa = bez([125, 54], [125, 84], [240, 74], [240, 108], 30).concat([[240, 126]]), pg = bez([355, 54], [355, 84], [240, 74], [240, 108], 30).concat([[240, 126]]);
  var PA = mk(pa), PG = mk(pg), balls = [], sparks = [], clock = 0, nextPair = 0, last = 0, raf = 0, running = false;
  function el(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); layer.appendChild(e); return e; }
  function ball(kind, x, y) { var b = { k: kind, x: x, y: y, vx: 0, vy: 0, d: 0, path: null, inN: false, t: 0, gone: 0, e: el("circle", { r: R, fill: C[kind] }) }; balls.push(b); return b; }
  function kill(b) { if (b.e.parentNode) b.e.parentNode.removeChild(b.e); b.dead = true; }
  function step(dt) {
    var i, j, b, o, dx, dy, dd, ov;
    clock += dt;
    if (clock >= nextPair) { nextPair = clock + PAIR_EVERY; var a = ball("arg", 125, 54), g = ball("gly", 355, 54); a.path = PA; g.path = PG; a.pair = g; g.pair = a; }
    for (i = 0; i < balls.length; i++) {
      b = balls[i]; if (b.dead) continue;
      if (b.path) {
        b.d += SPEED * dt; var q = at(b.path, Math.min(b.d, b.path.len)); b.x = q[0]; b.y = q[1];
        if (b.d >= b.path.len && (b.k === "arg" || b.k === "gly")) { if (!b.pair.dead && b.pair.d >= b.pair.path.len - 0.01 && b.k === "arg") { var n = ball("gaa", 240, 126); n.vy = SPEED; kill(b); kill(b.pair); } else if (b.pair.dead) { kill(b); } }
      } else if (b.k === "gaa" || (b.k === "cr" && !b.free)) {
        b.y += SPEED * dt;
        if (b.k === "gaa" && b.y >= 238) { b.k = "cr"; b.e.setAttribute("fill", C.cr); }
        if (b.k === "cr" && b.y >= 348) { b.free = true; b.x = 240 + (Math.random() * 6 - 3); b.vx = Math.random() * 20 - 10; b.vy = SPEED; }
      } else if (b.free && !b.gone) {
        b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (!b.inN && b.y > NT + R) { b.inN = true; b.t = 0; }
        if (b.inN) {
          b.t += dt;
          if (b.x < NL + R) { b.x = NL + R; b.vx = Math.abs(b.vx) * .3; } if (b.x > NR - R) { b.x = NR - R; b.vx = -Math.abs(b.vx) * .3; }
          if (b.y > FLOOR - R) { b.y = FLOOR - R; b.vy = -Math.abs(b.vy) * .25; b.vx *= .9; if (Math.abs(b.vy) < 8) b.vy = 0; }
          if (b.t > LIFE) { b.gone = 0.0001; b.e.setAttribute("fill", C.crn); var sp = { x: b.x, y: b.y, t: 0, e: el("circle", { r: 3.4, fill: C.atp }), l: el("text", { fill: C.atp, "font-size": 9, "font-weight": 700, "text-anchor": "middle", "font-family": "Inter, system-ui, sans-serif" }) }; sp.l.textContent = "ATP"; sparks.push(sp); }
        }
      }
      if (b.gone) { b.gone += dt; var f = Math.min(1, (b.gone) / FADE); b.e.setAttribute("opacity", (1 - f).toFixed(2)); if (b.gone > FADE) kill(b); }
      if (!b.dead) { b.e.setAttribute("cx", b.x.toFixed(1)); b.e.setAttribute("cy", b.y.toFixed(1)); }
    }
    for (var pass = 0; pass < 2; pass++) for (i = 0; i < balls.length; i++) { b = balls[i]; if (b.dead || !b.inN || b.gone) continue; for (j = i + 1; j < balls.length; j++) { o = balls[j]; if (o.dead || !o.inN || o.gone) continue; dx = o.x - b.x; dy = o.y - b.y; dd = Math.hypot(dx, dy); if (dd < 2 * R && dd > 0.001) { ov = (2 * R - dd) / 2; dx /= dd; dy /= dd; b.x -= dx * ov; b.y -= dy * ov; o.x += dx * ov; o.y += dy * ov; b.vx -= dx * 4; o.vx += dx * 4; if (dy > 0) { b.vy = Math.min(b.vy, 0) * .2; } else { o.vy = Math.min(o.vy, 0) * .2; } } } }
    for (i = sparks.length - 1; i >= 0; i--) { var s = sparks[i]; s.t += dt; var p = Math.min(1, s.t / FADE), yy = s.y - 26 * p; s.e.setAttribute("cx", s.x.toFixed(1)); s.e.setAttribute("cy", yy.toFixed(1)); s.e.setAttribute("opacity", (1 - p).toFixed(2)); s.l.setAttribute("x", s.x.toFixed(1)); s.l.setAttribute("y", (yy - 7).toFixed(1)); s.l.setAttribute("opacity", (1 - p).toFixed(2)); if (p >= 1) { s.e.remove(); s.l.remove(); sparks.splice(i, 1); } }
    balls = balls.filter(function (x) { return !x.dead; });
  }
  function loop(now) { raf = 0; if (!running) { last = 0; return; } var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; step(dt); raf = requestAnimationFrame(loop); }
  function go() { if (!raf && running) raf = requestAnimationFrame(loop); }
  var vis = true; function upd() { running = vis && !document.hidden; go(); }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; upd(); }).observe(svg); else upd();
  document.addEventListener("visibilitychange", upd); upd();
})();
