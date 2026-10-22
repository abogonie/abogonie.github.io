(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var f = function (n) { return n.toFixed(1); };
  var $ = function (id) { return document.getElementById(id); };
  if (!$("mat")) return;

/* ---------- neuron maturation schematic ---------- */
  var sig = function (x) { return 1 / (1 + Math.exp(-x)); };
  var mTyp = function (d) { return sig((d - 4.5) / 1.4); };
  var mKO = function (d) { return sig((d - 8) / 1.5); };
  /* A pyramidal-style neuron: one long apical dendrite, basal dendrites that branch and grow spines, and a single thin axon with a collateral and terminal branches. */
  var DEND = [{ a: -90, L: 58 }, { a: -148, L: 40 }, { a: -32, L: 40 }, { a: 172, L: 32 }, { a: 8, L: 32 }];
  function seg(sx, sy, ang, len, bend) {
    var ex = sx + Math.cos(ang) * len, ey = sy + Math.sin(ang) * len;
    var mx = (sx + ex) / 2 - Math.sin(ang) * bend, my = (sy + ey) / 2 + Math.cos(ang) * bend;
    return { d: "M" + f(sx) + " " + f(sy) + " Q" + f(mx) + " " + f(my) + " " + f(ex) + " " + f(ey), ex: ex, ey: ey,
      at: function (t) { var u = 1 - t; return [u * u * sx + 2 * u * t * mx + t * t * ex, u * u * sy + 2 * u * t * my + t * t * ey]; } };
  }
  function neuron(m) {
    var cx = 120, cy = 100, out = "";
    DEND.forEach(function (D, i) {
      var r = D.a * Math.PI / 180, L = 5 + m * D.L, sg = i % 2 ? 1 : -1;
      var s0 = seg(cx + Math.cos(r) * 11, cy + Math.sin(r) * 11, r, L, sg * L * 0.1);
      out += s0.d;
      if (m > 0.25) {
        var p = s0.at(0.55), g = Math.min(1, (m - 0.25) / 0.4), bl = L * 0.55 * g;
        [-0.6, 0.55].forEach(function (o, k) {
          var s1 = seg(p[0], p[1], r + o, bl, (k ? 1 : -1) * bl * 0.08); out += s1.d;
          if (m > 0.6) { var g2 = Math.min(1, (m - 0.6) / 0.3), tl = bl * 0.45 * g2; [-0.5, 0.5].forEach(function (o2) { out += "M" + f(s1.ex) + " " + f(s1.ey) + " L" + f(s1.ex + Math.cos(r + o + o2) * tl) + " " + f(s1.ey + Math.sin(r + o + o2) * tl); }); }
        });
      }
      if (m > 0.75) {
        var sp = Math.min(1, (m - 0.75) / 0.2) * 3.2;
        [0.35, 0.5, 0.65, 0.8].forEach(function (t, k) {
          var q = s0.at(t), side = k % 2 ? 1.2 : -1.2;
          out += "M" + f(q[0]) + " " + f(q[1]) + " l" + f(Math.cos(r + side) * sp) + " " + f(Math.sin(r + side) * sp);
        });
      }
    });
    /* axon: thin, long, leaves the soma opposite the apical dendrite */
    var AL = 6 + m * 80, ar = 90 * Math.PI / 180;
    var ax = seg(cx, cy + 11, ar, AL, 6 * Math.min(1, m * 2));
    out += ax.d;
    if (m > 0.5) {
      var q = ax.at(0.6), cl = AL * 0.3 * Math.min(1, (m - 0.5) / 0.3);
      out += "M" + f(q[0]) + " " + f(q[1]) + " L" + f(q[0] + Math.cos(ar - 0.9) * cl) + " " + f(q[1] + Math.sin(ar - 0.9) * cl);
    }
    if (m > 0.8) {
      var tl2 = 9 * Math.min(1, (m - 0.8) / 0.2);
      [-0.7, 0, 0.7].forEach(function (o) { out += "M" + f(ax.ex) + " " + f(ax.ey) + " L" + f(ax.ex + Math.cos(ar + o) * tl2) + " " + f(ax.ey + Math.sin(ar + o) * tl2); });
    }
    return out;
  }
  function curve(fn) {
    var d = "";
    for (var k = 0; k <= 48; k++) {
      var x = k / 4;
      d += (k ? "L" : "M") + f(30 + x / 12 * 195) + " " + f(170 - fn(x) * 150);
    }
    return d;
  }
  $("cTyp").setAttribute("d", curve(mTyp));
  $("cKO").setAttribute("d", curve(mKO));
  var day = $("day"), play = $("play");
  function matUpdate() {
    var d = Number(day.value);
    $("pTyp").setAttribute("d", neuron(mTyp(d)));
    $("pKO").setAttribute("d", neuron(mKO(d)));
    $("dayOut").textContent = d.toFixed(1);
    var x = f(30 + d / 12 * 195), mk = $("mk");
    mk.setAttribute("x1", x); mk.setAttribute("x2", x);
    $("matStory").textContent =
      d < 2.5 ? "Both cultures start with short neurites. The difference has not shown yet."
      : d < 10 ? "Typical neurons are already extending and branching. Neurons without GAMT are behind."
      : "Late in the culture, typical neurons are densely branched while neurons without GAMT are still behind.";
  }
  day.addEventListener("input", matUpdate);
  var playing = false;
  function stop() { playing = false; play.textContent = "Play"; }
  if (reduce) { play.hidden = true; }
  play.addEventListener("click", function () {
    if (playing) { stop(); return; }
    playing = true; play.textContent = "Pause";
    var from = Number(day.value) >= 11.9 ? 0 : Number(day.value), start = performance.now();
    (function step(now) {
      if (!playing) return;
      var v = from + (now - start) / 700;
      if (v >= 12) { day.value = 12; matUpdate(); stop(); return; }
      day.value = v; matUpdate(); requestAnimationFrame(step);
    })(start);
  });
  matUpdate();

  })();
