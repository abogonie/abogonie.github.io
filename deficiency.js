/* Creatine pathway as moving particles. In "Deficiency" mode the particles stop at the missing step and pile up where the pathway is blocked. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
  var SCENES = {
    agat: { blocked: 1, pile: 0, cap: 150, lvl: { 2: "lo", 4: "lo", 6: "lo" },
      def: "Without AGAT the pathway stops at its first step. Arginine and glycine bounce off the block and pile up, very little guanidinoacetate is made, and creatine is low." },
    gamt: { blocked: 3, pile: 2, cap: 150, lvl: { 2: "hi", 4: "lo", 6: "lo" },
      def: "Without GAMT, guanidinoacetate cannot be turned into creatine. It bounces off the block and piles up while creatine runs low." },
    slc: { blocked: 5, pile: 4, cap: 150, crn: true, lvl: { 4: "hi", 6: "lo" },
      def: "Without the transporter, creatine is made but cannot enter neurons. It bounces off the transporter and builds up outside the cell, and more of it is converted to creatinine. Guanidinoacetate stays normal." }
  };
  var HEALTHY = "In a healthy cell the pathway runs end to end: arginine and glycine become guanidinoacetate, then creatine, which neurons take up.";
  var LVL = { hi: "High", lo: "Low" };

  function init(host) {
    var sc = SCENES[host.getAttribute("data-scene")]; if (!sc) return;
    var strip = host.querySelector(".strip");
    var nodes = Array.prototype.filter.call(strip.children, function (c) { return !c.classList.contains("flow"); });
    var cv = document.createElement("canvas"); cv.className = "defic-cv"; cv.setAttribute("aria-hidden", "true"); host.insertBefore(cv, host.firstChild);
    var ctx = cv.getContext("2d");
    var mon = document.createElement("button"); mon.type = "button"; mon.className = "mon"; mon.title = "Click to vacuum now"; mon.setAttribute("aria-label", "Green monster with a vacuum. Click to vacuum up the pile now.");
    mon.innerHTML = '<svg viewBox="0 0 120 128" aria-hidden="true"><g class="mon-body"><ellipse cx="38" cy="22" rx="7" ry="9" fill="#4fae5b"/><ellipse cx="82" cy="22" rx="7" ry="9" fill="#4fae5b"/><ellipse cx="60" cy="116" rx="12" ry="6" fill="#3f9a4b"/><ellipse cx="86" cy="116" rx="10" ry="5" fill="#3f9a4b"/><path d="M60 24c-22 0-34 18-34 42v34c0 14 10 20 34 20s34-6 34-20V66c0-24-12-42-34-42z" fill="#62c36d" stroke="#3f9a4b" stroke-width="2"/><g class="mon-eyes"><circle cx="48" cy="50" r="9" fill="#fff"/><circle cx="72" cy="50" r="9" fill="#fff"/><circle cx="46" cy="51" r="4.2" fill="#1b2a22"/><circle cx="70" cy="51" r="4.2" fill="#1b2a22"/></g><path class="mon-smile" d="M49 66q11 9 22 0" fill="none" stroke="#1b2a22" stroke-width="2.6" stroke-linecap="round"/><ellipse class="mon-o" cx="60" cy="69" rx="6" ry="7" fill="#1b2a22"/><rect x="30" y="82" width="60" height="32" rx="8" fill="#fff" stroke="#c9d1dd"/><text x="60" y="97" text-anchor="middle" font-size="13" font-weight="800" font-family="Open Sans, Arial, sans-serif" fill="#1b2230">I <tspan fill="#e0405a">\u2665</tspan></text><text x="60" y="109" text-anchor="middle" font-size="10.5" font-weight="700" font-family="Open Sans, Arial, sans-serif" fill="#1b2230">protein</text></g><g class="mon-arm"><path d="M34 96L22 82" stroke="#62c36d" stroke-width="9" stroke-linecap="round"/><path d="M24 76L4 62V102L24 90Z" fill="#8a93a6" stroke="#5d6577" stroke-width="2" stroke-linejoin="round"/><ellipse cx="4" cy="82" rx="3.5" ry="20" fill="#3d4352"/></g></svg>';
    var ctl = document.createElement("div"); ctl.className = "defic-ctl";
    var seg = document.createElement("div"); seg.className = "seg"; seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "Pathway state");
    var bH = document.createElement("button"), bD = document.createElement("button");
    bH.type = bD.type = "button"; bH.textContent = "Healthy"; bD.textContent = "With deficiency";
    seg.appendChild(bH); seg.appendChild(bD);
    var legend = document.createElement("div"); legend.className = "keyline";
    legend.innerHTML = '<span><i style="--c:var(--muted)"></i>Arginine + glycine</span><span><i style="--c:var(--warn)"></i>Guanidinoacetate</span><span><i style="--c:var(--accent)"></i>Creatine</span>' + (sc.crn ? '<span><i style="--c:var(--fold)"></i>Creatinine</span>' : "");
    var cap = document.createElement("p"); cap.className = "callnote defic-cap"; cap.setAttribute("aria-live", "polite");
    ctl.appendChild(seg); ctl.appendChild(legend); ctl.appendChild(cap); host.appendChild(ctl); host.appendChild(mon);
    var badges = {};
    Object.keys(sc.lvl).forEach(function (k) { var b = document.createElement("span"); b.className = "lvl " + sc.lvl[k]; b.textContent = LVL[sc.lvl[k]]; nodes[k].appendChild(b); badges[k] = b; });

    var GEO = null, geoKey = "", GR = 420, RB = 5, vacuuming = false, phase = 0, ph = 0, vacT = 0, NZ = [0, 0], deficient = true, parts = [], pileN = 0, pileList = [], acc = 0, tConv = 0, W = 0, H = 0, dpr = 1, C = [], vertical = false, visible = true, last = 0, raf = 0;
    var col = {};
    function colors() { col = { sub: css("--muted") || "#667", gaa: css("--warn") || "#c60", cr: css("--accent") || "#25c", crn: css("--fold") || "#0a8" }; }
    function layout() {
      var r = host.getBoundingClientRect(), sc2 = host.offsetWidth ? r.width / host.offsetWidth : 1; W = host.offsetWidth; H = host.offsetHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vertical = getComputedStyle(strip).flexDirection === "column";
      C = nodes.map(function (n) { var b = n.getBoundingClientRect(); return { x: (b.left - r.left + b.width / 2) / sc2, y: (b.top - r.top + b.height / 2) / sc2, w: b.width / sc2, h: b.height / sc2, top: (b.top - r.top) / sc2, right: (b.right - r.left) / sc2 }; });
      colors(); placeMon();
    }
    function placeMon() {
      var c = C[sc.pile], e = C[sc.blocked], w = vertical ? 78 : 104, h = w * 128 / 120, k = w / 120, left, top, g = {};
      if (vertical) {
        g.Bl = c.right + 8; g.Br = W - 4; g.Ff = e.top - 2; g.near = g.Bl;
      } else {
        var bw = Math.min(172, Math.max(c.w, 152)); g.Bl = c.x - bw / 2; g.Br = c.x + bw / 2; g.Ff = c.top - 2; g.near = g.Br;
      }
      var per = Math.max(4, Math.floor((g.Br - g.Bl - 6) / (RB * 2))), rows = Math.ceil(sc.cap / per);
      g.Hb = Math.min(190, rows * RB * 1.8 + 34); g.Wt = g.Ff - g.Hb; GEO = g;
      if (vertical) { left = g.Br - w; top = g.Ff + 8; } else { left = Math.min(g.Br + 8, W - w - 4); top = g.Ff - g.Hb * 0.45 - 82 * k; }
      mon.style.cssText = "left:" + left.toFixed(1) + "px;top:" + top.toFixed(1) + "px;width:" + w + "px;height:" + h.toFixed(1) + "px";
      NZ = [left + 3 * k, top + 82 * k];
      var key = [g.Bl, g.Br, g.Ff].map(Math.round).join(",");
      if (key !== geoKey) { geoKey = key; parts = parts.filter(function (p) { return p.st !== "ball" && p.st !== "suck"; }); pileN = 0; pileList = []; }
    }
    function launch(p, q) {
      var g = GEO, xl = q[0], yl = q[1], h = 14 + Math.random() * 40, apexY = g.Wt - h;
      if (yl - apexY < 24) apexY = yl - 24;
      var vy0 = -Math.sqrt(2 * GR * (yl - apexY)), ta = -vy0 / GR, w = Math.sqrt(2 * Math.max(1, h - 8) / GR), tc = ta + w * (Math.random() * 1.6 - 0.8);
      p.st = "ball"; p.x = xl; p.y = yl; p.px = xl; p.vy = vy0; p.vx = (g.near - xl) / tc; p.i = pileN++; pileList.push(p);
    }
    function physics(dt) {
      var g = GEO, balls = (pileList = pileList.filter(function (p) { return p.a > 0; })), n = balls.length, S = 3, ds = dt / S, r = RB, s, i, j, b, o;
      for (s = 0; s < S; s++) {
        for (i = 0; i < n; i++) {
          b = balls[i]; b.px = b.x; b.vy += GR * ds; b.x += b.vx * ds; b.y += b.vy * ds;
          [g.Bl, g.Br].forEach(function (wx) { if (b.y > g.Wt && Math.abs(b.x - wx) < r) { var side = b.px >= wx ? 1 : -1; b.x = wx + side * r; b.vx = -b.vx * 0.3; if (side * b.vx < 0) b.vx = side * Math.abs(b.vx); } });
          if (b.x > g.Bl - r && b.x < g.Br + r && b.y > g.Ff - r && b.y < g.Ff + r * 2) { b.y = g.Ff - r; if (b.vy > 40) b.vy = -b.vy * 0.28; else b.vy = 0; b.vx *= Math.max(0, 1 - 5 * ds); }
          if (b.y > H + 60) b.a = 0;
        }
        for (var it = 0; it < 3; it++) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
          b = balls[i]; o = balls[j]; var dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy, m = 2 * r;
          if (d2 < m * m && d2 > 1e-6) {
            var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = (m - d) * 0.5;
            b.x -= nx * ov; b.y -= ny * ov; o.x += nx * ov; o.y += ny * ov;
            var vn = (o.vx - b.vx) * nx + (o.vy - b.vy) * ny;
            if (vn < 0) { var jn = -(1 + (vn < -60 ? 0.25 : 0)) * vn * 0.5; b.vx -= jn * nx; b.vy -= jn * ny; o.vx += jn * nx; o.vy += jn * ny; }
            b.vx *= 0.9985; o.vx *= 0.9985;
          }
        }
      }
    }
    function startVac() {
      if (vacuuming || !pileList.length) return; vacuuming = true; phase = 2; vacT = 0;
      pileList.sort(function (a, b) { var A = pos(a), B = pos(b); return Math.hypot(A[0] - NZ[0], A[1] - NZ[1]) - Math.hypot(B[0] - NZ[0], B[1] - NZ[1]); });
      pileList.forEach(function (p, i) { var s = pos(p); p.fx = s[0]; p.fy = s[1]; p.st = "suck"; p.u = -(i / pileList.length) * 2.6 - 0.2; });
      pileList = []; pileN = 0; mon.classList.add("on");
    }
    function callVac() { if (phase || !pileList.length || reduce) return; phase = 1; ph = 0; mon.classList.add("here"); }
    mon.addEventListener("click", callVac);
    function reset() {
      parts = []; pileN = 0; pileList = []; acc = 0; tConv = 0; vacuuming = false; phase = 0; ph = 0; vacT = 0; mon.classList.remove("on"); mon.classList.toggle("here", reduce); mon.style.display = deficient ? "" : "none";
      nodes.forEach(function (n, i) { if (i % 2) { n.classList.toggle("blocked", deficient && i === sc.blocked); } });
      Object.keys(badges).forEach(function (k) { badges[k].style.display = deficient ? "" : "none"; });
      cap.textContent = deficient ? sc.def : HEALTHY;
      bH.setAttribute("aria-pressed", String(!deficient)); bD.setAttribute("aria-pressed", String(deficient));
    }
    function typeAt(k) { return k < 2 ? "sub" : k < 4 ? "gaa" : "cr"; }
    function step(dt) {
      var run = phase === 0; if (run) acc += dt;
      if (acc > (deficient ? 0.22 : 0.5)) { acc = 0; if (!(reduce && deficient && pileN >= sc.cap)) parts.push({ k: 0, t: 0, type: "sub", st: "move", a: 1, j: Math.random() * 6.28, ln: (Math.random() - 0.5) * 2, w2: Math.random() * 6.28 }); }
      parts.forEach(function (p) {
        if (p.st === "move") {
          if (!run) return;
          p.t += dt * 0.36;
          if (deficient && p.k === sc.pile && GEO) {
            var q0 = pos(p), E = C[sc.blocked];
            if (vertical ? q0[1] + 4.5 >= E.top : q0[0] + 4.5 >= E.x - E.w / 2) { launch(p, q0); return; }
          }
          if (p.t >= 1) {
            p.k += 1; p.t = 0;
            if (p.k === 6) { p.st = "fade"; }
            else if (p.k % 2 === 0) { p.type = typeAt(p.k); }
          }
        } else if (p.st === "suck") { p.u += dt / 1.1; if (p.u >= 1) p.a = 0; }
        else if (p.st === "fade") { p.a -= dt * 1.6; }
      });
      if (GEO && phase < 2) physics(dt);
      if (sc.crn && deficient && !vacuuming && pileList.length > 6) {
        tConv += dt; if (tConv > 0.8) { tConv = 0; var q = pileList[Math.floor(Math.random() * pileList.length)]; if (q.type === "cr") q.type = "crn"; }
      }
      parts = parts.filter(function (p) { return p.a > 0; });
      if (deficient && !reduce) {
        if (phase === 0) { if (pileN >= sc.cap) callVac(); }
        else if (phase === 1) { ph += dt; if (ph > 1.0) startVac(); }
        else if (phase === 2) { if (!parts.some(function (p) { return p.st === "suck"; })) { vacuuming = false; mon.classList.remove("on"); phase = 3; ph = 0; } }
        else if (phase === 3) { ph += dt; if (ph > 0.9) { phase = 0; mon.classList.remove("here"); } }
      }
    }
    function pos(p) {
      if (p.st === "ball") return [p.x, p.y];
      if (p.st === "suck") {
        if (p.u <= 0) return [p.fx, p.fy];
        var e2 = p.u * p.u, dx = NZ[0] - p.fx, dy = NZ[1] - p.fy, L = Math.hypot(dx, dy) || 1, bend = Math.sin(Math.PI * e2) * 22 * (p.ln || 1);
        return [p.fx + dx * e2 - dy / L * bend, p.fy + dy * e2 + dx / L * bend];
      }
      var a = C[p.k], b = C[Math.min(6, p.k + 1)];
      if (p.st === "fade") return [a.x, a.y];
      var ux = b.x - a.x, uy = b.y - a.y, L2 = Math.hypot(ux, uy) || 1, off = (p.ln * 20 * Math.sin(Math.PI * p.t) + Math.sin(p.t * 7 + p.w2) * 4 * Math.sin(Math.PI * p.t));
      return [a.x + ux * p.t - uy / L2 * off, a.y + uy * p.t + ux / L2 * off];
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      if (deficient && GEO) {
        var g = GEO; ctx.save(); ctx.globalAlpha = phase >= 2 ? 0.12 : 0.6; ctx.strokeStyle = col.sub; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(g.Bl, g.Wt); ctx.lineTo(g.Bl, g.Ff + 1); ctx.lineTo(g.Br, g.Ff + 1); ctx.lineTo(g.Br, g.Wt); ctx.stroke(); ctx.restore();
      }
      parts.forEach(function (p) {
        var q = pos(p), j = 0;
        ctx.globalAlpha = Math.max(0, p.a) * 0.95;
        ctx.fillStyle = col[p.type]; ctx.beginPath(); ctx.arc(q[0] + j, q[1], p.st === "suck" ? Math.max(1.5, RB * (1 - Math.max(0, p.u) * 0.7)) : p.st === "ball" ? RB : 4.4, 0, 6.2832); ctx.fill();
      });
      if (vacuuming) { ctx.strokeStyle = col.sub; ctx.lineWidth = 1.6; ctx.lineCap = "round"; for (var k = 0; k < 7; k++) { var tt = (now / 700 + k / 7) % 1, ang = Math.PI + (k - 3) * 0.16, rr = 14 + (1 - tt) * 46; ctx.globalAlpha = 0.5 * tt; ctx.beginPath(); ctx.moveTo(NZ[0] + Math.cos(ang) * rr, NZ[1] + Math.sin(ang) * rr); ctx.lineTo(NZ[0] + Math.cos(ang) * (rr - 8), NZ[1] + Math.sin(ang) * (rr - 8)); ctx.stroke(); } }
      ctx.globalAlpha = 1;
    }
    function frame(now) {
      raf = 0; if (!visible || document.hidden) { last = 0; return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; step(dt); draw(now); raf = requestAnimationFrame(frame);
    }
    function start() { if (reduce) return; if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function staticRender() { reset(); for (var i = 0; i < 1500; i++) step(1 / 30); draw(0); }
    function set(d) { deficient = d; reset(); if (reduce) staticRender(); }
    bH.addEventListener("click", function () { set(false); });
    bD.addEventListener("click", function () { set(true); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { layout(); if (reduce) staticRender(); }).observe(host); else window.addEventListener("resize", function () { layout(); if (reduce) staticRender(); });
    new MutationObserver(function () { colors(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(host);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    layout(); reset(); if (reduce) staticRender(); else start();
    setTimeout(function () { layout(); if (reduce) staticRender(); }, 600);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".defic"), init);
})();
