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
  if (!("IntersectionObserver" in window)) return;
  var cur = null;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) cur = e.target; });
    if (!cur) return;
    links.forEach(function (a, i) {
      var on = secs[i] === cur; a.classList.toggle("active", on);
      if (on && a.scrollIntoView && wrap.scrollWidth > wrap.clientWidth) wrap.scrollTo({ left: a.offsetLeft - 80, behavior: "smooth" });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  secs.forEach(function (s) { io.observe(s); });
})();
