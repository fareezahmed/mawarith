/* Shared site chrome behaviour: mobile nav toggle + current year. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) links.classList.remove('open');
    });
  }
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // Deep links such as calculator.html#donate-section point at content the
  // calculator renders after mount, so the target is absent on first paint.
  // Poll briefly, then scroll once it exists.
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    var tries = 0;
    var seek = setInterval(function () {
      var el = document.getElementById(id);
      if (el) {
        clearInterval(seek);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (++tries > 40) {
        clearInterval(seek);
      }
    }, 100);
  }
})();
