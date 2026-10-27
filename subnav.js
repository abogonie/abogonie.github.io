/* In-page navigation: a sticky row of section links with a scroll-spy highlight. */
(function () {
  var secs = Array.prototype.slice.call(document.querySelectorAll("main > section[data-nav]"));
  var header = document.querySelector(".nav");
  if (!header) return;
  var setH = function () { document.documentElement.style.setProperty("--nav-h", header.offsetHeight + "px"); };
  setH(); window.addEventListener("resize", setH);
  if (secs.length < 3) return;
  var nav = document.createElement("nav"); nav.className = "subnav"; nav.setAttribute("aria-label", "On this page");
  var wrap = document.createElement("div"); wrap.className = "wrap";
  wrap.innerHTML = '<span class="on-page">On this page</span>';
  var links = secs.map(function (s) {
    var a = document.createElement("a"); a.href = "#" + s.id; a.textContent = s.getAttribute("data-nav"); wrap.appendChild(a); return a;
  });
  nav.appendChild(wrap); header.insertAdjacentElement("afterend", nav);
  setH();
  var cur = -2, tick = 0;
  function spy() {
    tick = 0;
    var line = window.innerHeight * 0.3, idx = 0, i;
    for (i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top <= line) idx = i;
    if (secs[0].getBoundingClientRect().top > line) idx = -1;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = secs.length - 1;
    if (idx === cur) return; cur = idx;
    links.forEach(function (a, k) {
      var on = k === idx; a.classList.toggle("active", on);
      if (on && wrap.scrollWidth > wrap.clientWidth) wrap.scrollTo({ left: a.offsetLeft - 80, behavior: "smooth" });
    });
  }
  var req = function () { if (!tick) tick = requestAnimationFrame(spy); };
  window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); window.addEventListener("hashchange", req);
  links.forEach(function (a, k) { a.addEventListener("click", function () { cur = k; links.forEach(function (b, j) { b.classList.toggle("active", j === k); }); }); });
  spy();
})();
