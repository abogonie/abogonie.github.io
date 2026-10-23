(function () {
  var root = document.documentElement;
  /* theme toggle */
  var save = function (v) { try { localStorage.setItem("theme", v); } catch (e) {} };
  document.getElementById("theme").addEventListener("click", function () {
    var explicit = root.getAttribute("data-theme");
    var dark = explicit ? explicit === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next); save(next);
  });
  window.addEventListener("storage", function (e) { if (e.key === "theme" && e.newValue) root.setAttribute("data-theme", e.newValue); });

  /* card spotlight */
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

})();
