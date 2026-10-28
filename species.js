(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var f = function (n) { return n.toFixed(1); };
  var $ = function (id) { return document.getElementById(id); };
  if (!$("facets")) return;

/* ---------- species charts (values read from BrainRNAseq.org figures) ---------- */
  var CELLS = ["Neuron", "Astro", "Oligo", "Endo"];
  var CELL_FULL = ["Neuron", "Astrocyte", "Oligodendrocyte", "Endothelial"];
  var FP = [
    { g: "GATM", sub: "AGAT, step 1", max: 120, ticks: [0, 30, 60, 90, 120], h: [6.8, 74.1, 37.4, 2.93], m: [10.4, 42, 112, 61.3] },
    { g: "GAMT", sub: "step 2", max: 300, ticks: [0, 100, 200, 300], h: [0.147, 0.323, 0.301, 0.412], m: [4.23, 9.0, 264, 8.39] },
    { g: "SLC6A8", sub: "creatine transporter", max: 50, ticks: [0, 10, 20, 30, 40, 50], h: [1.26, 3.85, 3.12, 0.845], m: [17.0, 14.0, 44.3, 6.61] }
  ];
  var FD = [
    { g: "GATM", d: "AGAT, step 1", v: [1.53, 0.57, 2.99] },
    { g: "GAMT", d: "step 2", v: [28.7, 27.8, 878] },
    { g: "SLC6A8", d: "transporter", v: [13.5, 3.64, 14.2] }
  ];
  function mk(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function vlabel(v) { return v < 1 ? "<1" : v >= 10 ? String(Math.round(v)) : v.toFixed(1); }
  function topBar(svg, x, top, base, w, cls, tip) {
    var h = base - top, el;
    if (h <= 1.2) { el = mk("rect", { x: x, y: base - 1.2, width: w, height: 1.2, class: cls }, svg); }
    else {
      var r = Math.min(4, h / 2, w / 2);
      el = mk("path", { d: "M" + x + " " + base + " V" + f(top + r) + " Q" + x + " " + f(top) + " " + f(x + r) + " " + f(top) + " H" + f(x + w - r) + " Q" + f(x + w) + " " + f(top) + " " + f(x + w) + " " + f(top + r) + " V" + base + " Z", class: cls }, svg);
    }
    mk("title", {}, el, tip);
  }
  var facets = $("facets");
  FP.forEach(function (d) {
    var fig = document.createElement("figure");
    var h3 = document.createElement("h3");
    h3.innerHTML = '<span class="gene">' + d.g + "</span><small>" + d.sub + "</small>";
    fig.appendChild(h3);
    var svg = mk("svg", { viewBox: "0 0 340 240", role: "img", "aria-label": d.g + " mean FPKM in human and mouse neurons, astrocytes, oligodendrocytes and endothelial cells" });
    fig.appendChild(svg);
    var x0 = 38, x1 = 334, y0 = 22, y1 = 204, ph = y1 - y0;
    var ys = function (v) { return y1 - v / d.max * ph; };
    d.ticks.forEach(function (t) {
      mk("line", { x1: x0, x2: x1, y1: f(ys(t)), y2: f(ys(t)), class: t === 0 ? "ax" : "gl" }, svg);
      mk("text", { x: x0 - 6, y: f(ys(t) + 3.5), "text-anchor": "end", class: "ct" }, svg, String(t));
    });
    var gw = (x1 - x0) / 4, bw = 24;
    CELLS.forEach(function (c, i) {
      var start = x0 + i * gw + (gw - (2 * bw + 2)) / 2;
      [["h", d.h[i], "Human"], ["m", d.m[i], "Mouse"]].forEach(function (b, j) {
        var x = start + j * (bw + 2), top = ys(b[1]);
        topBar(svg, x, top, y1, bw, b[0] + "bar", d.g + ", " + CELL_FULL[i] + ", " + b[2] + ": about " + (b[1] < 1 ? "under 1" : b[1]) + " FPKM");
        mk("text", { x: f(x + bw / 2), y: f(Math.min(top, y1 - 1.2) - 4), "text-anchor": "middle", class: "vl" }, svg, vlabel(b[1]));
      });
      mk("text", { x: f(x0 + i * gw + gw / 2), y: y1 + 18, "text-anchor": "middle", class: "ct" }, svg, c);
    });
    facets.appendChild(fig);
  });

  (function foldChart() {
    var svg = $("fold");
    var X0 = 150, W = 470, LO = -0.4, SPAN = 3.4;
    var xs = function (v) { return X0 + (Math.log10(v) - LO) / SPAN * W; };
    var base = xs(1), y = 14, rows = [];
    FD.forEach(function (g) {
      rows.push({ head: g, y: y }); y += 24;
      g.v.forEach(function (v, i) { rows.push({ g: g.g, cell: CELL_FULL[i], v: v, cy: y + 12 }); y += 28; });
      y += 10;
    });
    var bottom = y;
    [0.5, 1, 10, 100, 1000].forEach(function (t) {
      mk("line", { x1: f(xs(t)), x2: f(xs(t)), y1: 8, y2: bottom, class: t === 1 ? "ax" : "gl" }, svg);
      mk("text", { x: f(xs(t)), y: bottom + 16, "text-anchor": "middle", class: "ct" }, svg, (t === 1000 ? "1,000" : t) + "×");
    });
    mk("text", { x: f(X0 + W / 2), y: bottom + 38, "text-anchor": "middle", class: "ct" }, svg, "Mouse ÷ human mean FPKM (log scale; 1× = equal)");
    rows.forEach(function (r) {
      if (r.head) {
        var t = mk("text", { x: 6, y: r.y + 14, class: "fgene" }, svg);
        t.appendChild(document.createTextNode(r.head.g));
        mk("tspan", { dx: 8 }, t, r.head.d);
        t.firstChild.parentNode.firstChild.nodeValue = r.head.g;
        return;
      }
      mk("text", { x: 138, y: f(r.cy + 4), "text-anchor": "end", class: "ct" }, svg, r.cell);
      var xv = xs(r.v), up = r.v > 1, h = 16, top = r.cy - h / 2, rad = 4;
      var x = up ? base : xv, w = Math.abs(xv - base);
      var d = up
        ? "M" + f(x) + " " + f(top) + " H" + f(x + w - rad) + " Q" + f(x + w) + " " + f(top) + " " + f(x + w) + " " + f(top + rad) + " V" + f(top + h - rad) + " Q" + f(x + w) + " " + f(top + h) + " " + f(x + w - rad) + " " + f(top + h) + " H" + f(x) + " Z"
        : "M" + f(x + w) + " " + f(top) + " H" + f(x + rad) + " Q" + f(x) + " " + f(top) + " " + f(x) + " " + f(top + rad) + " V" + f(top + h - rad) + " Q" + f(x) + " " + f(top + h) + " " + f(x + rad) + " " + f(top + h) + " H" + f(x + w) + " Z";
      var b = mk("path", { d: d, class: "fbar" }, svg);
      mk("title", {}, b, r.g + ", " + r.cell + ": about " + r.v + "-fold (mouse ÷ human)");
      var lbl = "≈" + (r.v >= 100 ? r.v : r.v >= 10 ? Math.round(r.v) : r.v) + "×";
      mk("text", { x: f(up ? xv + 6 : base + 6), y: f(r.cy + 4), "text-anchor": "start", class: "vl", style: "font-size:11px" }, svg, lbl);
    });
    svg.setAttribute("viewBox", "0 0 690 " + (bottom + 50));
  })();

  (function table() {
    var t = $("tbl");
    var html = "<thead><tr><th>Gene</th><th>Cell type</th><th>Human (FPKM)</th><th>Mouse (FPKM)</th><th>Fold (mouse ÷ human)</th></tr></thead><tbody>";
    FP.forEach(function (d, gi) {
      CELLS.forEach(function (c, i) {
        var fold = i < 3 ? "≈" + FD[gi].v[i] + "×" : "n/a";
        html += "<tr><td>" + d.g + "</td><td>" + CELL_FULL[i] + "</td><td>≈" + (d.h[i] < 1 ? "&lt;1" : d.h[i]) + "</td><td>≈" + d.m[i] + "</td><td>" + fold + "</td></tr>";
      });
    });
    t.innerHTML = html + "</tbody>";
  })();

  })();
