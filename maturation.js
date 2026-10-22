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
  var ANG = [-160, -110, -50, 10, 70, 130];
  function neuron(m) {
    var cx = 120, cy = 100, out = "";
    ANG.forEach(function (a, i) {
      var r = a * Math.PI / 180, L = 6 + m * 62 * (0.85 + 0.15 * ((i % 3) / 2));
      var sx = cx + Math.cos(r) * 11, sy = cy + Math.sin(r) * 11;
      var ex = cx + Math.cos(r) * (11 + L), ey = cy + Math.sin(r) * (11 + L);
      var bend = (i % 2 ? 1 : -1) * L * 0.15;
      var mx = (sx + ex) / 2 - Math.sin(r) * bend, my = (sy + ey) / 2 + Math.cos(r) * bend;
      out += "M" + f(sx) + " " + f(sy) + " Q" + f(mx) + " " + f(my) + " " + f(ex) + " " + f(ey);
      if (m > 0.3) {
        var t = 0.55, u = 1 - t;
        var bx = u * u * sx + 2 * u * t * mx + t * t * ex, by = u * u * sy + 2 * u * t * my + t * t * ey;
        var bl = L * 0.4 * Math.min(1, (m - 0.3) / 0.4), s = i % 2 ? 1 : -1;
        out += "M" + f(bx) + " " + f(by) + " L" + f(bx + Math.cos(r + 0.7 * s) * bl) + " " + f(by + Math.sin(r + 0.7 * s) * bl);
      }
      if (m > 0.65) {
        var fl = L * 0.2 * Math.min(1, (m - 0.65) / 0.3);
        [-0.5, 0.5].forEach(function (o) {
          out += "M" + f(ex) + " " + f(ey) + " L" + f(ex + Math.cos(r + o) * fl) + " " + f(ey + Math.sin(r + o) * fl);
        });
      }
    });
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
