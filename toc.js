// Sadržaj u bočnom stupcu: označi odjeljak koji se upravo čita (bez kolačića i praćenja)
(function () {
  var links = document.querySelectorAll('.toc a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var visible = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
    var current = null;
    Object.keys(map).forEach(function (id) { if (!current && visible[id]) current = id; });
    if (!current) return;
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    map[current].setAttribute('aria-current', 'true');
  }, { rootMargin: '0px 0px -60% 0px' });
  Object.keys(map).forEach(function (id) {
    var h = document.getElementById(id);
    if (h) io.observe(h);
  });
})();
