/* Entrance motion for the static pages, driven by anime.js (v3, global `anime`).
 *
 * - Hero: the heading rises word by word, then the lead, buttons and visual follow.
 * - Everything else fades up the first time it scrolls into view, staggered
 *   across siblings so grids of cards arrive as a group.
 * - Stat figures count up when they appear.
 *
 * Nothing here is required for the page to work: with no JavaScript, no anime,
 * or a "reduce motion" preference, content simply renders as it always did.
 */
(function () {
  var A = window.anime;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!A || reduce) return;

  var EASE = 'easeOutCubic';

  /* Wrap each word of the text nodes in a span, leaving child elements (such as
   * the Arabic honorific) intact so their markup and language tags survive. */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (!n.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span');
        s.className = 'mw';
        s.textContent = part;
        frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    var targets = [];
    Array.prototype.forEach.call(el.childNodes, function (c) {
      if (c.nodeType !== 1) return;
      if (c.classList.contains('mw')) targets.push(c);
      else targets.push.apply(targets, c.classList.contains('honorific') ? [c] : Array.prototype.slice.call(c.querySelectorAll('.mw')));
    });
    return targets;
  }

  /* ── Hero ───────────────────────────────────────────────────────────── */
  var hero = document.querySelector('.hero');
  if (hero) {
    var h1 = hero.querySelector('h1');
    var words = h1 ? splitWords(h1) : [];
    var rest = Array.prototype.filter.call(
      hero.querySelectorAll('.eyebrow, .lead, .hero-cta, .tagline, .hero-visual, .stats, .muted'),
      function (el) { return !h1 || !h1.contains(el); });
    var eyebrow = rest.filter(function (el) { return el.classList.contains('eyebrow'); });
    var after = rest.filter(function (el) { return !el.classList.contains('eyebrow'); });

    words.forEach(function (w) { w.style.display = 'inline-block'; w.style.opacity = '0'; });
    rest.forEach(function (el) { el.style.opacity = '0'; });

    var tl = A.timeline({ easing: EASE });
    if (eyebrow.length) tl.add({ targets: eyebrow, opacity: [0, 1], translateY: [8, 0], duration: 500 });
    if (words.length) tl.add({ targets: words, opacity: [0, 1], translateY: [18, 0], duration: 650, delay: A.stagger(45) }, eyebrow.length ? '-=250' : 0);
    if (after.length) tl.add({ targets: after, opacity: [0, 1], translateY: [14, 0], duration: 600, delay: A.stagger(110) }, '-=350');
  }

  /* ── Medallion: the rings turn slowly, the centre disc and its text stay still ── */
  var gold = document.querySelector('.hero-visual .med-gold');
  var teal = document.querySelector('.hero-visual .med-teal');
  [gold, teal].forEach(function (g) { if (g) { g.style.transformOrigin = '160px 160px'; g.style.transformBox = 'view-box'; } });
  if (gold) A({ targets: gold, rotate: 360, duration: 90000, easing: 'linear', loop: true });
  if (teal) A({ targets: teal, rotate: -360, duration: 60000, easing: 'linear', loop: true });

  /* ── Scroll reveal ─────────────────────────────────────────────────── */
  var SELECTOR = [
    '.section-head', '.section > .container > .lead', '.section > .container > p',
    '.card', '.support-tile', '.feature-card', '.tier-card', '.expert-card', '.step', '.js-step', '.stat',
    '.faq details', '.gloss', '.cta-band', '.callout', '.ayah', '.form',
    '.prose > h2', '.prose > h3', '.prose > p', '.prose > ul', '.prose > ol', '.prose > blockquote',
    '.journey-roadmap', '.journey-bidhn', '.algebra-card', '.founder-card', '.board-card', '.table-wrap'
  ].join(',');

  var items = Array.prototype.filter.call(document.querySelectorAll(SELECTOR), function (el) {
    if (hero && hero.contains(el)) return false;
    if (el.closest('.site-nav, .site-footer')) return false;
    // keep the outermost match only, so a card inside a revealed block is not animated twice
    var p = el.parentElement;
    while (p) { if (p.matches && p.matches(SELECTOR) && !(hero && hero.contains(p))) return false; p = p.parentElement; }
    return true;
  });

  if ('IntersectionObserver' in window && items.length) {
    items.forEach(function (el) {
      // already on screen at load: leave it alone so the page never looks empty
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0 && !hero) return;
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0 && hero && r.top < hero.getBoundingClientRect().bottom + 40) return;
      el.style.opacity = '0';
      el.setAttribute('data-reveal', '');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        if (!el.hasAttribute('data-reveal')) return;
        // stagger by position among sibling reveals, so a grid arrives as a wave
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-reveal'); });
        var idx = Math.max(0, sibs.indexOf(el));
        A({ targets: el, opacity: [0, 1], translateY: [18, 0], duration: 620, delay: Math.min(idx, 7) * 80, easing: EASE,
            complete: function () { el.removeAttribute('data-reveal'); el.style.transform = ''; } });
        countUp(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { if (el.hasAttribute('data-reveal')) io.observe(el); });
  }

  /* ── Figures count up (e.g. "4", "12+", "1,400") ───────────────────── */
  function countUp(scope) {
    var nums = scope.matches('.stat') ? scope.querySelectorAll('.num') : scope.querySelectorAll('.stat .num, .af-num');
    Array.prototype.forEach.call(nums, function (el) {
      var m = /^(\d[\d,]*)(\+?)$/.exec(el.textContent.trim());
      if (!m) return;
      var target = parseInt(m[1].replace(/,/g, ''), 10), suffix = m[2];
      var obj = { v: 0 };
      A({ targets: obj, v: target, round: 1, duration: 1100, easing: 'easeOutExpo',
          update: function () { el.textContent = obj.v.toLocaleString() + suffix; } });
    });
  }
})();
