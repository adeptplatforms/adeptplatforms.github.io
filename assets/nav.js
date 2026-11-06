// adept public site: the phone menu. Shared by every page.
(function () {
  document.documentElement.classList.add('js');
  var top = document.getElementById('top');
  if (!top) return;
  var btn = top.querySelector('.menu-btn');
  btn.addEventListener('click', function () {
    var open = top.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  top.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { top.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
  });
})();
