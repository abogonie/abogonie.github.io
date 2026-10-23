/* Quiet background of drifting nodes and signals behind the Home headline. */
(function () {
  var cv = document.querySelector("canvas.neuro"); if (!cv) return;
  var host = cv.parentElement, ctx = cv.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1, nodes = [], pulses = [], raf = 0, last = 0, visible = true, accent = "#1d5bd8";
  function colors() { accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || accent; }
  function init() {
    var r = host.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(W < 640 ? 1.5 : 2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(18, Math.min(60, Math.round(W * H / 14000)));
    nodes = []; for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8, r: 1.6 + Math.random() * 1.8 });
    pulses = []; colors();
  }
  function edges() {
    var out = [], D = 170;
    for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
      var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < D) out.push([i, j, 1 - d / D]);
    }
    return out;
  }
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(function (n) { n.x += n.vx * dt; n.y += n.vy * dt; if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1; });
    var E = edges();
    ctx.lineWidth = 1; ctx.strokeStyle = accent;
    E.forEach(function (e) { ctx.globalAlpha = e[2] * 0.22; ctx.beginPath(); ctx.moveTo(nodes[e[0]].x, nodes[e[0]].y); ctx.lineTo(nodes[e[1]].x, nodes[e[1]].y); ctx.stroke(); });
    ctx.fillStyle = accent; ctx.globalAlpha = 0.35;
    nodes.forEach(function (n) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.fill(); });
    if (!reduce && E.length && Math.random() < dt * 1.4 && pulses.length < 6) { var e = E[Math.floor(Math.random() * E.length)]; pulses.push({ a: e[0], b: e[1], t: 0 }); }
    pulses.forEach(function (p) {
      p.t += dt * 0.7; var A = nodes[p.a], B = nodes[p.b], x = A.x + (B.x - A.x) * p.t, y = A.y + (B.y - A.y) * p.t;
      ctx.globalAlpha = Math.sin(Math.min(1, p.t) * Math.PI) * 0.9; ctx.beginPath(); ctx.arc(x, y, 3, 0, 6.2832); ctx.fill();
    });
    pulses = pulses.filter(function (p) { return p.t < 1; });
    ctx.globalAlpha = 1;
  }
  function frame(now) { raf = 0; if (!visible || document.hidden) { last = 0; return; } var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now; draw(dt); raf = requestAnimationFrame(frame); }
  function start() { if (!reduce && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
  init(); draw(0); start();
  window.addEventListener("resize", function () { init(); draw(0); });
  new MutationObserver(function () { colors(); if (reduce) draw(0); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
})();
