/* Local payment options, shown only to visitors in the matching country.
 *
 * Everyone sees the card options (Stripe). A visitor in a country listed in METHODS also
 * sees that country's own option above them; nobody else does. Until a country is added
 * to METHODS this file shows nothing and asks nothing.
 *
 * The country comes from /cdn-cgi/trace, which Cloudflare serves on almawarith.com itself
 * (no other service is contacted). Only the two-letter country code is read; it is kept
 * for the browser session and never sent anywhere. If the country cannot be read, the
 * visitor sees the card options only.
 *
 * To add a method, add its country code to METHODS. Two kinds are supported:
 *
 *   KE: { name: 'M-Pesa', kind: 'till',
 *         intro: 'Send your contribution from your phone with M-Pesa.',
 *         number: '000000', numberLabel: 'Till number', payee: 'Name shown on the Till',
 *         steps: ['Open M-Pesa and choose Lipa na M-Pesa.', 'Choose Buy Goods and Services.',
 *                 'Enter the Till number {number}.', 'Enter the amount and your M-Pesa PIN.'] },
 *
 *   IN: { name: 'UPI', kind: 'link',
 *         intro: 'Pay in rupees from PhonePe, Google Pay, Paytm or any other UPI app.',
 *         url: 'https://...', button: 'Pay with UPI' },
 *
 * When the first method goes live, also add a line to the Privacy page saying that the
 * page reads the visitor's country to choose which payment options to show.
 *
 * Testing (never on almawarith.com): ?paydemo=KE or ?paydemo=IN shows a sample block. */
(function () {
  'use strict';

  var METHODS = {
    // No local payment accounts exist yet.
  };

  var COUNTRY_NAMES = { KE: 'Kenya', IN: 'India', PK: 'Pakistan', EG: 'Egypt', NG: 'Nigeria', ZA: 'South Africa' };

  var SAMPLES = {
    KE: { name: 'M-Pesa', kind: 'till', sample: true,
      intro: 'Send your contribution from your phone with M-Pesa.',
      number: '123456', numberLabel: 'Till number', payee: 'Sample name on the Till',
      steps: ['Open M-Pesa and choose Lipa na M-Pesa.', 'Choose Buy Goods and Services.',
        'Enter the Till number {number}.', 'Enter the amount and your M-Pesa PIN.'] },
    IN: { name: 'UPI', kind: 'link', sample: true,
      intro: 'Pay in rupees from PhonePe, Google Pay, Paytm or any other UPI app.',
      url: 'https://example.com/', button: 'Pay with UPI' }
  };

  var PRODUCTION = /(^|\.)almawarith\.com$/.test(location.hostname);
  var KEY = 'mawarith:country';

  function sample() {
    if (PRODUCTION) return null;
    try {
      var c = (new URLSearchParams(location.search).get('paydemo') || '').toUpperCase();
      return SAMPLES[c] ? { country: c, method: SAMPLES[c] } : null;
    } catch (e) { return null; }
  }

  function readCountry() {
    try { var saved = sessionStorage.getItem(KEY); if (/^[A-Z]{2}$/.test(saved || '')) return Promise.resolve(saved); } catch (e) { /* storage unavailable */ }
    return fetch('/cdn-cgi/trace', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (t) {
        var m = /^loc=([A-Z]{2})$/m.exec(t);
        if (!m) return null;
        try { sessionStorage.setItem(KEY, m[1]); } catch (e) { /* storage unavailable */ }
        return m[1];
      })
      .catch(function () { return null; });
  }

  function track(name, data) {
    try { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); } catch (e) { /* analytics must never break the page */ }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var styled = false;
  function addStyles() {
    if (styled) return; styled = true;
    var css = '' +
      '.local-pay{border:1px solid var(--gold-light,#E0BE73);background:var(--parchment,#FBF8F1);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.25rem;text-align:left;color:var(--ink,#14201D)}' +
      '.local-pay-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.35rem .9rem;margin-bottom:.45rem}' +
      '.local-pay-title{font-weight:700;font-size:1.05rem;color:var(--teal-deep,#0B4A3F)}' +
      '.local-pay-where{font-size:.74rem;letter-spacing:.03em;color:var(--gold-text,#7F5B12);font-weight:600}' +
      '.local-pay-intro{font-size:.92rem;line-height:1.6;color:var(--ink-soft,#46534F);margin:0 0 .75rem}' +
      '.local-pay-steps{margin:0 0 .8rem;padding-left:1.3rem;font-size:.92rem;line-height:1.7}' +
      '.local-pay-steps li::marker{color:var(--gold,#C79A3E);font-weight:600}' +
      '.local-pay-number{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem .9rem;border:1px dashed var(--border,#E7DDC8);border-radius:10px;background:#fff;padding:.6rem .8rem}' +
      '.local-pay-number-l{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft,#46534F);display:block}' +
      '.local-pay-number-v{font-size:1.5rem;font-weight:700;letter-spacing:.06em;color:var(--teal-deep,#0B4A3F);font-variant-numeric:tabular-nums}' +
      '.local-pay-copy,.local-pay-btn{font:inherit;font-weight:600;border-radius:999px;cursor:pointer;min-height:44px;padding:.5rem 1.1rem;text-decoration:none;display:inline-flex;align-items:center}' +
      '.local-pay-copy{margin-left:auto;border:1px solid var(--border,#E7DDC8);background:var(--parchment,#FBF8F1);color:var(--teal-deep,#0B4A3F);font-size:.85rem}' +
      '.local-pay-btn{border:0;background:var(--teal-deep,#0B4A3F);color:#fff;font-size:.95rem}' +
      '.local-pay-copy:focus-visible,.local-pay-btn:focus-visible{outline:2px solid var(--gold,#C79A3E);outline-offset:3px}' +
      '.local-pay-payee,.local-pay-foot{font-size:.8rem;color:var(--ink-soft,#46534F);margin:.6rem 0 0;line-height:1.5}' +
      '.local-pay-sample{font-size:.74rem;font-weight:700;color:#8a2c0d;margin:0 0 .5rem}';
    var s = el('style'); s.textContent = css; document.head.appendChild(s);
  }

  function build(country, m) {
    var box = el('section', 'local-pay');
    box.setAttribute('aria-label', 'Pay with ' + m.name);
    if (m.sample) box.appendChild(el('p', 'local-pay-sample', 'Sample only: this block is not on the live site.'));
    var head = el('div', 'local-pay-head');
    head.appendChild(el('div', 'local-pay-title', 'Pay with ' + m.name));
    head.appendChild(el('div', 'local-pay-where', 'Shown to visitors in ' + (COUNTRY_NAMES[country] || country)));
    box.appendChild(head);
    if (m.intro) box.appendChild(el('p', 'local-pay-intro', m.intro));

    if (m.kind === 'till') {
      if (m.steps && m.steps.length) {
        var ol = el('ol', 'local-pay-steps');
        m.steps.forEach(function (s) { ol.appendChild(el('li', null, s.replace('{number}', m.number))); });
        box.appendChild(ol);
      }
      var row = el('div', 'local-pay-number');
      var label = el('div');
      label.appendChild(el('span', 'local-pay-number-l', m.numberLabel || 'Number'));
      label.appendChild(el('span', 'local-pay-number-v', m.number));
      row.appendChild(label);
      var copy = el('button', 'local-pay-copy', 'Copy number');
      copy.type = 'button';
      copy.addEventListener('click', function () {
        track('local-pay-click', { country: country, method: m.name });
        var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy number'; }, 2000); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(String(m.number)).then(done, function () { /* the number stays on screen to type by hand */ });
      });
      row.appendChild(copy);
      box.appendChild(row);
      if (m.payee) box.appendChild(el('p', 'local-pay-payee', 'The name you will see before you confirm: ' + m.payee + '.'));
    } else if (m.kind === 'link') {
      var a = el('a', 'local-pay-btn', (m.button || 'Pay with ' + m.name) + ' →');
      a.href = m.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.addEventListener('click', function () { track('local-pay-click', { country: country, method: m.name }); });
      box.appendChild(a);
    }
    box.appendChild(el('p', 'local-pay-foot', 'Prefer a card? The card options are just below.'));
    return box;
  }

  function start(country, m) {
    addStyles();
    var counted = false;
    var fill = function () {
      var slots = document.querySelectorAll('[data-local-pay]');
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].childNodes.length) continue;
        slots[i].appendChild(build(country, m));
        if (!counted) { counted = true; track('local-pay-shown', { country: country, method: m.name }); }
      }
    };
    fill();
    // The calculator draws its donation sections later, and again after each step change.
    new MutationObserver(fill).observe(document.body, { childList: true, subtree: true });
  }

  var demo = sample();
  if (demo) { start(demo.country, demo.method); return; }
  if (!Object.keys(METHODS).length) return; // nothing to offer anywhere: do not even ask for the country
  readCountry().then(function (c) { if (c && METHODS[c]) start(c, METHODS[c]); });
})();
