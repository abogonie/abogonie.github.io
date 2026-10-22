/* Creatine pathway as moving particles. In "Deficiency" mode the particles stop at the missing step and pile up where the pathway is blocked. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
  var SCENES = {
    agat: { blocked: 1, pile: 0, cap: 150, lvl: { 2: "lo", 4: "lo", 6: "lo" },
      def: "Without AGAT the pathway stops at its first step. Very little guanidinoacetate is made, so creatine is low." },
    gamt: { blocked: 3, pile: 2, cap: 150, lvl: { 2: "hi", 4: "lo", 6: "lo" },
      def: "Without GAMT, guanidinoacetate cannot be turned into creatine. It piles up while creatine runs low." },
    slc: { blocked: 5, pile: 4, cap: 150, crn: true, lvl: { 4: "hi", 6: "lo" },
      def: "Without the transporter, creatine is made but cannot enter neurons. It builds up outside the cell, and more of it is converted to creatinine. Guanidinoacetate stays normal." }
  };
  var HEALTHY = "In a healthy cell the pathway runs end to end: arginine and glycine become guanidinoacetate, then creatine, which neurons take up.";
  var LVL = { hi: "High", lo: "Low" };

  function init(host) {
    var sc = SCENES[host.getAttribute("data-scene")]; if (!sc) return;
    var strip = host.querySelector(".strip");
    var nodes = Array.prototype.filter.call(strip.children, function (c) { return !c.classList.contains("flow"); });
    var cv = document.createElement("canvas"); cv.className = "defic-cv"; cv.setAttribute("aria-hidden", "true"); host.insertBefore(cv, host.firstChild);
    var ctx = cv.getContext("2d");
    var ctl = document.createElement("div"); ctl.className = "defic-ctl";
    var seg = document.createElement("div"); seg.className = "seg"; seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "Pathway state");
    var bH = document.createElement("button"), bD = document.createElement("button");
    bH.type = bD.type = "button"; bH.textContent = "Healthy"; bD.textContent = "With deficiency";
    seg.appendChild(bH); seg.appendChild(bD);
    var legend = document.createElement("div"); legend.className = "keyline";
    legend.innerHTML = '<span><i style="--c:var(--muted)"></i>Arginine + glycine</span><span><i style="--c:var(--warn)"></i>Guanidinoacetate</span><span><i style="--c:var(--accent)"></i>Creatine</span>' + (sc.crn ? '<span><i style="--c:var(--fold)"></i>Creatinine</span>' : "");
    var cap = document.createElement("p"); cap.className = "callnote defic-cap"; cap.setAttribute("aria-live", "polite");
    ctl.appendChild(seg); ctl.appendChild(legend); ctl.appendChild(cap); host.appendChild(ctl);
    var badges = {};
    Object.keys(sc.lvl).forEach(function (k) { var b = document.createElement("span"); b.className = "lvl " + sc.lvl[k]; b.textContent = LVL[sc.lvl[k]]; nodes[k].appendChild(b); badges[k] = b; });

    var deficient = true, parts = [], pileN = 0, pileList = [], acc = 0, tConv = 0, W = 0, H = 0, dpr = 1, C = [], vertical = false, visible = true, last = 0, raf = 0;
    var col = {};
    function colors() { col = { sub: css("--muted") || "#667", gaa: css("--warn") || "#c60", cr: css("--accent") || "#25c", crn: css("--fold") || "#0a8" }; }
    function layout() {
      var r = host.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vertical = getComputedStyle(strip).flexDirection === "column";
      C = nodes.map(function (n) { var b = n.getBoundingClientRect(); return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2, w: b.width, h: b.height, top: b.top - r.top, right: b.right - r.left }; });
      colors();
    }
    function slot(i) {
      var c = C[sc.pile], a = i * 2.39996, rr = (vertical ? 4.6 : 6.4) * Math.sqrt(i + 1);
      var cx = vertical ? C[sc.pile].right + 78 : c.x, cy = vertical ? c.y : c.top - 98;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    }
    function reset() {
      parts = []; pileN = 0; pileList = []; acc = 0; tConv = 0;
      nodes.forEach(function (n, i) { if (i % 2) { n.classList.toggle("blocked", deficient && i === sc.blocked); } });
      Object.keys(badges).forEach(function (k) { badges[k].style.display = deficient ? "" : "none"; });
      cap.textContent = deficient ? sc.def : HEALTHY;
      bH.setAttribute("aria-pressed", String(!deficient)); bD.setAttribute("aria-pressed", String(deficient));
    }
    function typeAt(k) { return k < 2 ? "sub" : k < 4 ? "gaa" : "cr"; }
    function step(dt) {
      acc += dt;
      if (acc > (deficient ? 0.1 : 0.2)) { acc = 0; parts.push({ k: 0, t: 0, type: "sub", st: "move", a: 1, j: Math.random() * 6.28 }); }
      parts.forEach(function (p) {
        if (p.st === "move") {
          p.t += dt * 0.8;
          if (p.t >= 1) {
            p.k += 1; p.t = 0;
            if (p.k % 2 === 1 && deficient && p.k === sc.blocked) {
              if (pileN < sc.cap) { p.st = "pile"; p.sx = C[p.k - 1].x; p.sy = C[p.k - 1].y; p.k = sc.pile; p.i = pileN++; pileList.push(p); p.t = 0; p.g = 0; } else { p.st = "fade"; p.k = sc.pile; }
            } else if (p.k === 6) { p.st = "fade"; }
            else if (p.k % 2 === 0) { p.type = typeAt(p.k); }
          }
        } else if (p.st === "pile") { p.g = (p.g || 0) + dt * 1.3; }
        else if (p.st === "fade") { p.a -= dt * 1.6; }
      });
      if (sc.crn && deficient && pileList.length > 6) {
        tConv += dt; if (tConv > 0.8) { tConv = 0; var q = pileList[Math.floor(Math.random() * pileList.length)]; if (q.type === "cr") q.type = "crn"; }
      }
      parts = parts.filter(function (p) { return p.a > 0; });
    }
    function pos(p) {
      if (p.st === "pile") { var s = slot(p.i), g = Math.min(1, p.g || 0), e = 1 - Math.pow(1 - g, 3); return [p.sx + (s[0] - p.sx) * e, p.sy + (s[1] - p.sy) * e]; }
      var a = C[p.k], b = C[Math.min(6, p.k + 1)];
      if (p.st === "fade") return [a.x, a.y];
      return [a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t];
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        var q = pos(p), j = p.st === "pile" ? Math.sin(now / 520 + p.j) * 1.3 : 0;
        ctx.globalAlpha = Math.max(0, p.a) * (p.st === "pile" ? 0.92 : 0.95);
        ctx.fillStyle = col[p.type]; ctx.beginPath(); ctx.arc(q[0] + j, q[1] + (p.st === "pile" ? Math.cos(now / 610 + p.j) * 1.3 : 0), p.st === "pile" ? 5.2 : 4, 0, 6.2832); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    function frame(now) {
      raf = 0; if (!visible || document.hidden) { last = 0; return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; step(dt); draw(now); raf = requestAnimationFrame(frame);
    }
    function start() { if (reduce) return; if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function staticRender() { reset(); for (var i = 0; i < 700; i++) step(1 / 30); draw(0); }
    function set(d) { deficient = d; reset(); if (reduce) staticRender(); }
    bH.addEventListener("click", function () { set(false); });
    bD.addEventListener("click", function () { set(true); });
    window.addEventListener("resize", function () { layout(); if (reduce) staticRender(); });
    new MutationObserver(function () { colors(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(host);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    layout(); reset(); if (reduce) staticRender(); else start();
    setTimeout(function () { layout(); if (reduce) staticRender(); }, 600);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".defic"), init);
})();
