/* =====================================================================
   NAAR: app
   Welcome intro, AR/EN switching, menu + filters, item sheet, cart,
   3-step checkout (cart → details → confirm), WhatsApp hand-off,
   and the motion layer (GSAP + CSS). Plain script, no build step.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.NAAR_CONFIG;
  var MENU = window.NAAR_MENU;
  var I18N = window.NAAR_I18N;
  if (!CFG || !MENU || !I18N) return;

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  var mqDesktop = matchMedia('(min-width: 1024px)');
  var motionOK = function () { return !mqReduce.matches && !root.classList.contains('motion-paused'); };
  var hasGSAP = function () { return typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined'; };

  /* ------------------------------------------------------------ storage */
  var store = {
    get: function (k, fallback) { try { var v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    raw: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setRaw: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  /* -------------------------------------------------------------- state */
  var lang = root.lang === 'en' ? 'en' : 'ar';
  var ITEMS = new Map(MENU.items.map(function (it) { return [it.id, it]; }));
  var CATS = new Map(MENU.categories.map(function (c) { return [c.id, c]; }));
  var cart = sanitizeCart(store.get('naar.cart', []));
  var filter = 'all';
  var query = '';
  var step = 1;
  var lastOrder = null;
  var dish = { state: null };

  /* --------------------------------------------------------------- i18n */
  function t(key, vars) {
    var v = I18N[lang] && I18N[lang][key];
    if (v == null) v = I18N.ar[key];
    if (v == null) return key;
    if (typeof v === 'object') {
      var n = vars && typeof vars.n === 'number' ? vars.n : 0;
      var form = new Intl.PluralRules(lang).select(n);
      if (n === 0 && v.zero) form = 'zero';
      v = v[form] || v.other;
    }
    if (vars) v = v.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return v;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rich(s) { return esc(s).replace(/\[([^\]]+)\]/g, '<span class="hl">$1</span>'); }
  function L(o) { return o ? (o[lang] || o.ar || '') : ''; }

  var nfCache = {};
  function fmt(n) {
    var loc = CFG.locale[lang];
    if (!nfCache[loc]) nfCache[loc] = new Intl.NumberFormat(loc);
    return nfCache[loc].format(n);
  }
  function money(n) { return fmt(n) + ' ' + CFG.currency[lang]; }
  function moneyHTML(n) { return '<span class="money"><bdi>' + fmt(n) + '</bdi><span class="cur">' + esc(CFG.currency[lang]) + '</span></span>'; }

  function translateDOM() {
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-rich]').forEach(function (el) { el.innerHTML = rich(t(el.getAttribute('data-i18n-rich'))); });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
      });
    });
    document.title = t('meta.title');
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', t('meta.desc'));
  }

  function setLang(next, opts) {
    opts = opts || {};
    next = next === 'en' ? 'en' : 'ar';
    var run = function () {
      lang = next;
      root.lang = next;
      root.dir = next === 'ar' ? 'rtl' : 'ltr';
      store.setRaw('naar.lang', next);
      translateDOM();
      renderAll();
    };
    if (opts.animate && document.startViewTransition && motionOK()) {
      if (opts.origin) {
        root.style.setProperty('--vt-x', opts.origin.x + 'px');
        root.style.setProperty('--vt-y', opts.origin.y + 'px');
      }
      var vt = document.startViewTransition(run);
      vt.finished.then(function () { motion.rebuild(); }, function () { motion.rebuild(); });
    } else {
      run();
      if (opts.rebuild !== false) motion.rebuild();
    }
  }

  /* -------------------------------------------------------- menu logic */
  function defaultOpts(item) {
    var o = {};
    (item.options || []).forEach(function (setId) {
      var set = MENU.optionSets[setId];
      if (!set) return;
      if (set.type === 'single') {
        var d = set.choices.filter(function (c) { return c.default; })[0] || set.choices[0];
        o[setId] = d.id;
      } else {
        o[setId] = [];
      }
    });
    return o;
  }
  function choicesOf(item, opts) {
    var out = [];
    (item.options || []).forEach(function (setId) {
      var set = MENU.optionSets[setId];
      var val = opts[setId];
      if (!set || val == null) return;
      [].concat(val).forEach(function (id) {
        var c = set.choices.filter(function (x) { return x.id === id; })[0];
        if (c) out.push(c);
      });
    });
    return out;
  }
  function unitPrice(item, opts) {
    return Math.max(0, choicesOf(item, opts).reduce(function (p, c) { return p + (c.delta || 0); }, item.price));
  }
  function optsLabel(item, opts) {
    // Leave out free default picks ("Regular", "Mild") unless the set says the kitchen always needs it.
    var names = [];
    (item.options || []).forEach(function (setId) {
      var set = MENU.optionSets[setId];
      var val = opts[setId];
      if (!set || val == null) return;
      [].concat(val).forEach(function (id) {
        var c = set.choices.filter(function (x) { return x.id === id; })[0];
        if (!c) return;
        if (c.default && !c.delta && !set.alwaysShow) return;
        names.push(L(c.name));
      });
    });
    return names.join(' · ');
  }
  function lineKey(id, opts, note) {
    var norm = Object.keys(opts || {}).sort().map(function (k) { return k + '=' + [].concat(opts[k]).slice().sort().join('+'); }).join('&');
    return id + '|' + norm + '|' + String(note || '').trim();
  }
  function sanitizeCart(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (l) { return l && ITEMS.has(l.id) && l.qty > 0; }).map(function (l) {
      var opts = l.opts && typeof l.opts === 'object' ? l.opts : defaultOpts(ITEMS.get(l.id));
      return { key: lineKey(l.id, opts, l.note), id: l.id, opts: opts, qty: Math.min(50, Math.max(1, l.qty | 0)), note: String(l.note || '') };
    });
  }
  function count() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (s, l) { return s + unitPrice(ITEMS.get(l.id), l.opts) * l.qty; }, 0); }
  function orderType() { var r = $('input[name="type"]:checked'); return r ? r.value : 'delivery'; }
  function deliveryFee(sub, type) {
    if (type === 'pickup' || sub === 0) return 0;
    return sub >= CFG.freeDeliveryFrom ? 0 : CFG.deliveryFee;
  }
  function normText(s) {
    return String(s).toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
  }
  var HAY = new Map(MENU.items.map(function (i) {
    return [i.id, normText([i.name.ar, i.name.en, i.desc.ar, i.desc.en, L(CATS.get(i.cat).name)].join(' '))];
  }));

  /* ---------------------------------------------------------- time/hours */
  function tzNow() {
    var d = new Date();
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: CFG.timeZone, hourCycle: 'h23', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(d);
      var get = function (type) { var p = parts.filter(function (x) { return x.type === type; })[0]; return p ? p.value : ''; };
      return { wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), h: (+get('hour')) % 24, m: +get('minute'), s: +get('second') };
    } catch (e) {
      return { wd: d.getDay(), h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
    }
  }
  function toMin(s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function fmtTime(s) {
    var p = s.split(':');
    return new Intl.DateTimeFormat(CFG.locale[lang], { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(Date.UTC(2024, 0, 1, +p[0], +p[1]));
  }
  function dayName(d) {
    return new Intl.DateTimeFormat(CFG.locale[lang], { weekday: 'long', timeZone: 'UTC' }).format(Date.UTC(2024, 0, 7 + d));
  }
  function hoursWindow(d) {
    var v = CFG.hours[d];
    if (!v) return null;
    var a = toMin(v[0]), b = toMin(v[1]);
    if (b <= a) b += 1440;
    return { a: a, b: b, open: v[0], close: v[1] };
  }
  function hoursStatus() {
    var n = tzNow(), now = n.h * 60 + n.m;
    var y = hoursWindow((n.wd + 6) % 7), td = hoursWindow(n.wd);
    if (y && now + 1440 < y.b) return { open: true, close: y.close };
    if (td && now >= td.a && now < td.b) return { open: true, close: td.close };
    if (td && now < td.a) return { open: false, today: true, at: td.open };
    for (var i = 1; i <= 7; i++) {
      var d = (n.wd + i) % 7, w = hoursWindow(d);
      if (w) return { open: false, day: d, at: w.open };
    }
    return { open: false };
  }

  /* ------------------------------------------------------------- render */
  var TAG_ICONS = { best: 'i-flame', hot: 'i-chili', new: 'i-spark', veg: 'i-leaf' };
  function tagHTML(tag) {
    return '<span class="tag tag--' + tag + '"><svg class="icon" aria-hidden="true"><use href="#' + TAG_ICONS[tag] + '"/></svg>' + esc(t('tag.' + tag)) + '</span>';
  }
  function sizeHint(item) {
    var setId = (item.options || []).filter(function (id) { return /Size$/.test(id); })[0];
    if (!setId) return '';
    var set = MENU.optionSets[setId];
    var d = set.choices.filter(function (c) { return c.default; })[0] || set.choices[0];
    return L(d.name) + (d.meta ? ' · ' + L(d.meta) : '');
  }
  function plusIcon() { return '<svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg>'; }

  function renderAll() {
    renderBands();
    renderFilters();
    renderMenu();
    renderBest();
    renderOffers();
    renderVisit();
    renderStatus();
    renderFacts();
    renderFooter();
    renderCart();
    if (lastOrder && step === 3) renderConfirm(lastOrder);
    if (dish.state && $('#dish-dialog').open) renderDish();
  }

  function renderBands() {
    var a = ['pz-pepperoni', 'sw-zinger', 'sw-shawarma', 'sn-loaded-fries', 'sn-wings', 'sw-double', 'pz-margherita', 'sn-mozzarella']
      .map(function (id) { return L(ITEMS.get(id).name); });
    var b = MENU.categories.map(function (c) { return L(c.name); });
    b = b.concat([t('hero.l1').replace('.', ''), t('hero.l2').replace('.', ''), L(CFG.brand)]);
    var make = function (words) {
      var half = '';
      for (var r = 0; r < 3; r++) {
        half += words.map(function (w) {
          return '<span class="band__item">' + esc(w) + '<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#i-spark"/></svg></span>';
        }).join('');
      }
      return half + half;
    };
    $('[data-band="a"]').innerHTML = make(a);
    $('[data-band="b"]').innerHTML = make(b);
  }

  function renderFilters() {
    var wrap = $('#menu-filters');
    var ink = $('.filters__ink', wrap);
    wrap.innerHTML = '';
    wrap.appendChild(ink);
    [{ id: 'all', icon: 'i-spark' }].concat(MENU.categories).forEach(function (c) {
      var n = c.id === 'all' ? MENU.items.length : MENU.items.filter(function (i) { return i.cat === c.id; }).length;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'filter';
      b.setAttribute('data-filter', c.id);
      b.setAttribute('aria-pressed', String(filter === c.id));
      b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#' + c.icon + '"/></svg><span>' +
        esc(c.id === 'all' ? t('menu.all') : L(c.name)) + '</span><span class="filter__count">' + fmt(n) + '</span>';
      wrap.appendChild(b);
    });
    requestAnimationFrame(moveInk);
  }
  function moveInk() {
    var wrap = $('#menu-filters');
    var active = $('.filter[aria-pressed="true"]', wrap);
    if (!active) return;
    wrap.style.setProperty('--ink-x', active.offsetLeft + 'px');
    wrap.style.setProperty('--ink-w', active.offsetWidth + 'px');
  }

  function cardHTML(item) {
    var name = L(item.name);
    var hint = sizeHint(item);
    var tags = item.tags || [];
    return '<article class="food-card" data-id="' + item.id + '" data-cat="' + item.cat + '">' +
      '<div class="food-card__tilt">' +
        '<button class="food-card__media" type="button" data-open="' + item.id + '" tabindex="-1" aria-hidden="true">' +
          '<img src="assets/img/' + item.img + '.webp" alt="" width="800" height="600" loading="lazy" decoding="async">' +
          '<span class="food-card__tags">' + tags.map(tagHTML).join('') + '</span>' +
        '</button>' +
        '<div class="food-card__body">' +
          '<h3 class="food-card__name"><button class="food-card__title" type="button" data-open="' + item.id + '" aria-label="' + esc(t('menu.details', { name: name })) + '">' + esc(name) + '</button>' +
            (tags.length ? '<span class="sr-only"> (' + esc(tags.map(function (g) { return t('tag.' + g); }).join('، ')) + ')</span>' : '') + '</h3>' +
          '<p class="food-card__desc">' + esc(L(item.desc)) + '</p>' +
          '<div class="food-card__foot">' +
            '<p class="price"><span class="price__now">' + moneyHTML(item.price) + '</span>' +
              (item.was ? '<s class="price__was">' + moneyHTML(item.was) + '</s>' : (hint ? '<span class="price__meta">' + esc(hint) + '</span>' : '')) +
            '</p>' +
            '<button class="add-btn" type="button" data-add="' + item.id + '" aria-label="' + esc(t('menu.add', { name: name })) + '">' + plusIcon() + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }
  function renderMenu() {
    $('#menu-grid').innerHTML = MENU.items.map(cardHTML).join('');
    applyFilter(false);
  }
  function matches(item) {
    if (query) {
      var hay = HAY.get(item.id);
      return query.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    }
    return filter === 'all' || item.cat === filter;
  }
  function applyFilter(animate) {
    var cards = $$('.food-card');
    var apply = function () {
      var n = 0;
      cards.forEach(function (c) {
        var ok = matches(ITEMS.get(c.getAttribute('data-id')));
        c.hidden = !ok;
        if (ok) n++;
      });
      $('#menu-empty').hidden = n > 0;
      $('#menu-count').textContent = t('menu.count', { n: n });
    };
    if (animate && window.Flip && hasGSAP() && motionOK()) {
      var state = Flip.getState(cards);
      apply();
      Flip.from(state, {
        duration: 0.6, ease: 'expo.inOut', stagger: 0.015, absolute: true, scale: false,
        onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out', clearProps: 'transform,opacity' }); },
        onLeave: function (els) { return gsap.to(els, { opacity: 0, scale: 0.86, duration: 0.3, ease: 'power2.in' }); },
        onComplete: function () { ScrollTrigger.refresh(); }
      });
    } else {
      apply();
    }
  }

  function renderBest() {
    var list = MENU.items.filter(function (i) { return (i.tags || []).indexOf('best') !== -1; });
    $('#best-track').innerHTML = list.map(function (item) {
      var name = L(item.name);
      return '<li class="best-card" data-id="' + item.id + '">' +
        '<button class="best-card__open" type="button" data-open="' + item.id + '" aria-label="' + esc(t('menu.details', { name: name })) + '">' +
          '<img class="best-card__img" src="assets/img/' + item.img + '.webp" alt="" width="800" height="600" loading="lazy" decoding="async">' +
          '<span class="best-card__shade"></span>' +
          '<span class="best-card__body"><span class="best-card__cat">' + esc(L(CATS.get(item.cat).name)) + '</span>' +
          '<span class="best-card__name">' + esc(name) + '</span></span>' +
        '</button>' +
        '<div class="best-card__foot"><span class="best-card__price">' + moneyHTML(item.price) + '</span>' +
          '<button class="add-btn" type="button" data-add="' + item.id + '" aria-label="' + esc(t('menu.add', { name: name })) + '">' + plusIcon() + '</button>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  function countdownHTML() {
    return '<div class="countdown" role="timer" aria-label="' + esc(t('offers.endsIn')) + '">' +
      '<span class="countdown__label">' + esc(t('offers.endsIn')) + '</span>' +
      ['h', 'm', 's'].map(function (u) {
        return '<span class="countdown__unit"><span class="countdown__num" data-cd="' + u + '">00</span><span class="countdown__lbl">' + esc(t('offers.' + u)) + '</span></span>';
      }).join('') +
    '</div>';
  }
  function renderOffers() {
    var deals = MENU.items.filter(function (i) { return i.cat === 'deals'; });
    var hero = deals.filter(function (d) { return d.dealOfDay; })[0] || deals[0];
    var card = function (d, big) {
      return '<article class="deal ' + (big ? 'deal--hero' : 'deal--small') + '" data-id="' + d.id + '">' +
        '<div class="deal__media"><img src="assets/img/' + d.img + '.webp" alt="" width="900" height="675" loading="lazy" decoding="async">' +
          (d.was ? '<span class="deal__save">' + esc(t('offers.save', { amount: money(d.was - d.price) })) + '</span>' : '') + '</div>' +
        '<div class="deal__body">' +
          (big ? '<p class="deal__chip"><svg class="icon" aria-hidden="true"><use href="#i-flame"/></svg>' + esc(t('offers.chip')) + '</p>' : '') +
          '<h3 class="deal__name">' + esc(L(d.name)) + '</h3>' +
          '<p class="deal__desc">' + esc(L(d.desc)) + '</p>' +
          '<p class="deal__price"><span class="price__now">' + moneyHTML(d.price) + '</span>' + (d.was ? '<s class="price__was">' + moneyHTML(d.was) + '</s>' : '') + '</p>' +
          (big ? countdownHTML() : '') +
          '<div class="deal__actions"><button class="btn btn--cheese" type="button" data-add="' + d.id + '">' + plusIcon() + '<span>' + esc(t('offers.add')) + '</span></button></div>' +
        '</div>' +
      '</article>';
    };
    $('#offers-grid').innerHTML = card(hero, true) + deals.filter(function (d) { return d !== hero; }).map(function (d) { return card(d, false); }).join('');
    tickCountdown(true);
  }
  function tickCountdown(force) {
    var n = tzNow();
    var left = 86400 - (n.h * 3600 + n.m * 60 + n.s);
    var vals = { h: Math.floor(left / 3600), m: Math.floor((left % 3600) / 60), s: left % 60 };
    $$('[data-cd]').forEach(function (el) {
      var v = String(vals[el.getAttribute('data-cd')]).padStart(2, '0');
      if (el.textContent === v) return;
      el.textContent = v;
      if (!force && motionOK()) {
        el.classList.remove('is-tick');
        void el.offsetWidth;
        el.classList.add('is-tick');
      }
    });
  }

  function renderStatus() {
    var st = hoursStatus();
    [$('#hero-status'), $('#visit-status')].forEach(function (el, idx) {
      if (!el) return;
      el.classList.toggle('is-closed', !st.open);
      $('.status-pill__text', el).textContent = st.open ? t('hero.open') : t('hero.closed');
      var meta = '';
      if (st.open) meta = idx === 0 ? t('hero.delivery', { m: fmt(CFG.deliveryMinutes) }) : t('visit.openUntil', { time: fmtTime(st.close) });
      else if (st.at) meta = st.today ? t('hero.opensToday', { time: fmtTime(st.at) }) : t('hero.opensOn', { day: dayName(st.day), time: fmtTime(st.at) });
      $('.status-pill__meta', el).textContent = meta;
    });
  }

  function waURL(text) {
    var num = String(CFG.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + num + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function renderVisit() {
    var today = tzNow().wd;
    var order = lang === 'ar' ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0];
    $('#hours-list').innerHTML = order.map(function (d) {
      var v = CFG.hours[d];
      return '<li class="' + (d === today ? 'is-today' : '') + '"><span class="hours__day" data-today="' + esc(t('visit.today')) + '">' + esc(dayName(d)) + '</span>' +
        '<span class="hours__time">' + (v ? '<bdi>' + esc(fmtTime(v[0])) + ' – ' + esc(fmtTime(v[1])) + '</bdi>' : esc(t('visit.closedDay'))) + '</span></li>';
    }).join('');
    $('#visit-address').textContent = L(CFG.address);
    var maps = $('#maps-link');
    maps.hidden = !CFG.mapsUrl;
    if (CFG.mapsUrl) maps.href = CFG.mapsUrl;
    $('#phone-text').textContent = CFG.phone;
    $('#wa-link').href = waURL('');
    $('#delivery-info').innerHTML = [
      t('visit.fee', { amount: money(CFG.deliveryFee) }),
      t('visit.freeFrom', { amount: money(CFG.freeDeliveryFrom) }),
      t('visit.time', { m: fmt(CFG.deliveryMinutes) })
    ].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
  }
  function renderFacts() {
    $('#fact-items').textContent = fmt(MENU.items.length);
    $('#fact-minutes').textContent = fmt(CFG.deliveryMinutes);
    var pep = ITEMS.get('pz-pepperoni');
    if (pep) $('#hero-price').textContent = fmt(pep.price);
    $('#hero-cur').textContent = CFG.currency[lang];
  }
  var SOCIAL = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook' };
  function renderFooter() {
    $('#footer-rights').textContent = t('footer.rights', { year: new Date().getFullYear() });
    $('#footer-social').innerHTML = Object.keys(SOCIAL).filter(function (k) { return CFG.social && CFG.social[k]; }).map(function (k) {
      return '<a href="' + esc(CFG.social[k]) + '" target="_blank" rel="noopener" aria-label="' + SOCIAL[k] + '"><svg class="icon" aria-hidden="true"><use href="#i-' + k + '"/></svg></a>';
    }).join('');
  }

  /* --------------------------------------------------------------- cart */
  function saveCart() { store.set('naar.cart', cart); }
  function lineHTML(l) {
    var item = ITEMS.get(l.id);
    var name = L(item.name);
    var label = optsLabel(item, l.opts);
    var extra = [label, l.note ? '“' + l.note + '”' : ''].filter(Boolean).join(' · ');
    var k = esc(l.key);
    return '<li class="cart-line" data-key="' + k + '">' +
      '<img class="cart-line__img" src="assets/img/' + item.img + '.webp" alt="" width="64" height="64" loading="lazy">' +
      '<div class="cart-line__info">' +
        '<p class="cart-line__name">' + esc(name) + '</p>' +
        (extra ? '<p class="cart-line__opts">' + esc(extra) + '</p>' : '') +
        '<div class="cart-line__row">' +
          '<div class="qty qty--sm" role="group" aria-label="' + esc(t('dish.qty')) + '">' +
            '<button class="qty__btn" type="button" data-line-dec="' + k + '" aria-label="' + esc(t('cart.dec', { name: name })) + '"><svg class="icon" aria-hidden="true"><use href="#i-minus"/></svg></button>' +
            '<span class="qty__value">' + fmt(l.qty) + '</span>' +
            '<button class="qty__btn" type="button" data-line-inc="' + k + '" aria-label="' + esc(t('cart.inc', { name: name })) + '"' + (l.qty >= 50 ? ' disabled' : '') + '>' + plusIcon() + '</button>' +
          '</div>' +
          '<span class="cart-line__price">' + moneyHTML(unitPrice(item, l.opts) * l.qty) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="cart-line__side">' +
        '<button class="cart-line__remove" type="button" data-line-remove="' + k + '" aria-label="' + esc(t('cart.remove', { name: name })) + '"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button>' +
        ((item.options || []).length ? '<button class="cart-line__edit" type="button" data-line-edit="' + k + '" aria-label="' + esc(t('cart.editLabel', { name: name })) + '">' + esc(t('cart.edit')) + '</button>' : '') +
      '</div>' +
    '</li>';
  }
  function renderCart(opts) {
    opts = opts || {};
    var n = count(), sub = subtotal();
    var btn = $('#cart-btn');
    btn.classList.toggle('has-items', n > 0);
    $('#cart-count').textContent = fmt(n);
    btn.setAttribute('aria-label', t('cart.open', { n: n }));
    $('#cart-bar').hidden = n === 0;
    document.body.classList.toggle('has-cart-bar', n > 0);
    $('#cart-bar-count').textContent = fmt(n);
    $('#cart-bar-total').innerHTML = moneyHTML(sub);

    $('#cart-empty').hidden = n > 0;
    $('#free-bar').hidden = n === 0;
    $('#cart-clear').hidden = n === 0;
    $('#cart-lines').innerHTML = cart.map(lineHTML).join('');
    if (opts.newKey) {
      var el = $('.cart-line[data-key="' + CSS.escape(opts.newKey) + '"]');
      if (el && motionOK()) el.classList.add('is-new');
    }
    var left = Math.max(0, CFG.freeDeliveryFrom - sub);
    $('#free-bar').classList.toggle('is-done', left === 0);
    $('#free-text').textContent = left === 0 ? t('cart.freeDone') : t('cart.freeLeft', { amount: money(left) });
    $('#free-fill').style.setProperty('--fill', Math.min(100, (sub / CFG.freeDeliveryFrom) * 100).toFixed(1) + '%');
    renderTotals();
    renderStepUI();
    saveCart();
  }
  function renderTotals() {
    var sub = subtotal(), del = deliveryFee(sub, orderType());
    $('#t-sub').innerHTML = moneyHTML(sub);
    $('#t-del').innerHTML = del === 0 ? esc(t('cart.free')) : moneyHTML(del);
    $('#t-total').innerHTML = moneyHTML(sub + del);
  }
  function renderStepUI() {
    $$('.step-panel').forEach(function (p) { p.hidden = +p.getAttribute('data-panel') !== step; });
    $$('.stepper__item').forEach(function (li) {
      var s = +li.getAttribute('data-step');
      li.classList.toggle('is-active', s === step);
      li.classList.toggle('is-done', s < step);
      if (s === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    var n = count(), sub = subtotal();
    var belowMin = sub > 0 && sub < CFG.minOrder;
    var minNote = $('#min-note');
    minNote.hidden = !(step === 1 && belowMin);
    minNote.textContent = t('cart.min', { amount: money(CFG.minOrder) });
    $('#totals').hidden = n === 0 || step === 3; // the receipt shows the totals on step 3
    var endpoint = !!CFG.orderEndpoint;
    $('#btn-back').hidden = step === 1;
    $('#btn-next').hidden = step === 3;
    $('#btn-next-label').textContent = step === 1 ? t('cart.continue') : t('form.review');
    $('#btn-next').disabled = step === 1 && (n === 0 || belowMin);
    $('#btn-wa').hidden = !(step === 3 && !endpoint);
    $('#btn-place').hidden = !(step === 3 && endpoint);
    $('#sub-actions').hidden = step !== 3;
    $('#drawer-foot').hidden = n === 0 && step === 1;
  }
  function goStep(s) {
    step = s;
    renderStepUI();
    var panel = $('.step-panel[data-panel="' + s + '"]');
    if (motionOK()) {
      panel.classList.remove('is-entering');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    }
    $('#drawer-body').scrollTop = 0;
    var focusEl = s === 3 ? $('#confirm-title') : panel;
    focusEl.focus({ preventScroll: true });
  }

  function bump(el) {
    if (!el || !motionOK()) return;
    var target = el.closest('.cart-btn, .cart-bar__btn') || el;
    target.classList.remove('is-bumping');
    void target.offsetWidth;
    target.classList.add('is-bumping');
  }
  function cartTarget() {
    var header = $('#site-header');
    if (!mqDesktop.matches && !$('#cart-bar').hidden) return $('#cart-bar-count');
    header.classList.remove('is-hidden');
    return $('#cart-btn');
  }
  function flyToCart(from) {
    if (!from || !motionOK() || !from.rect || !from.rect.width) return;
    var target = cartTarget();
    if (!target) return;
    var a = from.rect, b = target.getBoundingClientRect();
    var size = Math.max(56, Math.min(120, a.width * 0.45));
    var sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    var dx = b.left + b.width / 2 - sx, dy = b.top + b.height / 2 - sy;
    var outer = document.createElement('div');
    outer.className = 'fly';
    outer.style.cssText = 'left:' + (sx - size / 2) + 'px;top:' + (sy - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
    var img = document.createElement('img');
    img.className = 'fly__img';
    img.src = from.src;
    img.alt = '';
    outer.appendChild(img);
    document.body.appendChild(outer);
    var dur = 850;
    var lift = Math.min(170, Math.abs(dy) * 0.35 + 70);
    outer.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + dx + 'px)' }], { duration: dur, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
    var anim = img.animate([
      { transform: 'translateY(0) scale(.55) rotate(0deg)', opacity: 0 },
      { transform: 'translateY(' + (-lift) + 'px) scale(1) rotate(-140deg)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(' + dy + 'px) scale(.2) rotate(-360deg)', opacity: 0.9 }
    ], { duration: dur, easing: 'cubic-bezier(.33,0,.67,1)', fill: 'forwards' });
    anim.finished.then(function () { outer.remove(); bump(target); }, function () { outer.remove(); });
  }
  function markAdded(btn) {
    if (!btn || !btn.classList.contains('add-btn')) return;
    var use = $('use', btn);
    btn.classList.add('is-added');
    if (use) use.setAttribute('href', '#i-check');
    clearTimeout(btn._t);
    btn._t = setTimeout(function () {
      btn.classList.remove('is-added');
      if (use) use.setAttribute('href', '#i-plus');
    }, 1300);
  }
  function sourceOf(el) {
    var host = el && el.closest('.food-card, .best-card, .deal, .hero__visual');
    var img = host && $('img', host);
    return img ? { rect: img.getBoundingClientRect(), src: img.currentSrc || img.src } : null;
  }
  function addToCart(id, opts, qty, note, fly) {
    var item = ITEMS.get(id);
    if (!item) return;
    var key = lineKey(id, opts, note);
    var existing = cart.filter(function (l) { return l.key === key; })[0];
    if (existing) existing.qty = Math.min(50, existing.qty + qty);
    else cart.push({ key: key, id: id, opts: opts, qty: qty, note: note || '' });
    if (step === 3) { step = 1; lastOrder = null; }
    renderCart({ newKey: key });
    if (fly) flyToCart(fly); else bump($('#cart-btn'));
    if (!fly || !motionOK()) bump(cartTarget());
    toast(t('toast.added', { name: L(item.name) }), {
      action: t('toast.undo'),
      onAction: function () {
        var l = cart.filter(function (x) { return x.key === key; })[0];
        if (!l) return;
        l.qty -= qty;
        if (l.qty <= 0) cart = cart.filter(function (x) { return x !== l; });
        renderCart();
      }
    });
    if (navigator.vibrate && !mqFine.matches) { try { navigator.vibrate(12); } catch (e) { /* unsupported */ } }
  }
  function changeQty(key, d, kind) {
    var l = cart.filter(function (x) { return x.key === key; })[0];
    if (!l) return;
    l.qty = Math.min(50, l.qty + d);
    if (l.qty <= 0) { removeLine(key); return; }
    renderCart();
    var b = $('[data-line-' + kind + '="' + CSS.escape(key) + '"]');
    if (b) b.focus();
  }
  function removeLine(key) {
    var idx = -1;
    cart.forEach(function (x, i) { if (x.key === key) idx = i; });
    if (idx < 0) return;
    var removed = cart.splice(idx, 1)[0];
    renderCart();
    var lines = $$('.cart-line');
    var next = lines[idx] || lines[idx - 1];
    if (next) $('.cart-line__remove', next).focus();
    else $('#cart-browse').focus();
    drawerSay(t('toast.removed', { name: L(ITEMS.get(removed.id).name) }));
  }
  function drawerSay(msg) {
    var r = $('#drawer-live');
    if (!r) return;
    r.textContent = '';
    setTimeout(function () { r.textContent = msg; }, 50);
  }

  /* ------------------------------------------------------------ dialogs */
  var openers = new WeakMap();
  function panelFrom(dlg) {
    var small = innerWidth < 640;
    if (dlg.id === 'cart-dialog') return small ? 'translateY(100%)' : 'translateX(' + (lang === 'ar' ? '-100%' : '100%') + ')';
    return small ? 'translateY(100%)' : 'translateY(40px) scale(.96)';
  }
  function openDialog(dlg, opener) {
    if (dlg.open) return;
    openers.set(dlg, opener || document.activeElement);
    dlg.showModal();
    root.classList.add('is-locked');
    var panel = $('.panel-anim', dlg);
    if (motionOK() && panel && panel.animate) {
      panel.animate([{ transform: panelFrom(dlg), opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
      try { dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, pseudoElement: '::backdrop' }); } catch (e) { /* no pseudo support */ }
    }
  }
  function closeDialog(dlg) {
    if (!dlg.open || dlg._closing) return Promise.resolve();
    dlg._closing = true;
    var panel = $('.panel-anim', dlg);
    var done = function () {
      dlg.close();
      dlg._closing = false;
      if (!$$('dialog[open]').length) root.classList.remove('is-locked');
      var op = openers.get(dlg);
      if (op && document.contains(op) && op.focus) op.focus({ preventScroll: true });
    };
    if (motionOK() && panel && panel.animate) {
      var a = panel.animate([{ transform: 'none', opacity: 1 }, { transform: panelFrom(dlg), opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' });
      var bd = null;
      try { bd = dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, pseudoElement: '::backdrop', fill: 'forwards' }); } catch (e) { /* no pseudo support */ }
      return a.finished.then(function () { done(); a.cancel(); if (bd) bd.cancel(); }, function () { done(); });
    }
    done();
    return Promise.resolve();
  }
  function initDialogs() {
    $$('dialog.dialog').forEach(function (dlg) {
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(dlg); });
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) closeDialog(dlg);
        if (e.target.closest('[data-close]')) closeDialog(dlg);
      });
    });
  }

  /* --------------------------------------------------------- item sheet */
  function openDish(id, opener, editKey) {
    var item = ITEMS.get(id);
    if (!item) return;
    var line = editKey ? cart.filter(function (l) { return l.key === editKey; })[0] : null;
    dish.state = {
      item: item,
      opts: line ? JSON.parse(JSON.stringify(line.opts)) : defaultOpts(item),
      qty: line ? line.qty : 1,
      note: line ? line.note : '',
      editKey: line ? line.key : null
    };
    renderDish();
    openDialog($('#dish-dialog'), opener);
  }
  function optSetHTML(setId, val) {
    var set = MENU.optionSets[setId];
    var single = set.type === 'single';
    var name = 'o-' + setId;
    return '<fieldset class="opt" data-set="' + setId + '">' +
      '<legend class="opt__legend"><span>' + esc(L(set.name)) + '</span><span class="opt__hint">' + esc(single ? t('dish.pickOne') : t('dish.optional')) + '</span></legend>' +
      '<div class="opt__choices">' + set.choices.map(function (c) {
        var id = name + '-' + c.id;
        var checked = single ? val === c.id : (val || []).indexOf(c.id) !== -1;
        return '<input class="opt__input" type="' + (single ? 'radio' : 'checkbox') + '" name="' + name + '" id="' + id + '" value="' + c.id + '"' + (checked ? ' checked' : '') + '>' +
          '<label class="opt__chip" for="' + id + '"><svg class="icon opt__check" aria-hidden="true"><use href="#i-check"/></svg>' +
          '<span class="opt__name">' + esc(L(c.name)) + '</span>' +
          (c.meta ? '<span class="opt__meta">' + esc(L(c.meta)) + '</span>' : '') +
          (c.delta ? '<span class="opt__delta" dir="ltr">' + (c.delta > 0 ? '+' : '−') + fmt(Math.abs(c.delta)) + '</span>' : '') +
          '</label>';
      }).join('') + '</div>' +
    '</fieldset>';
  }
  function renderDish() {
    var s = dish.state;
    var img = $('#dish-img');
    img.src = 'assets/img/' + s.item.img + '.webp';
    img.alt = L(s.item.name);
    $('#dish-tags').innerHTML = (s.item.tags || []).map(tagHTML).join('');
    $('#dish-title').textContent = L(s.item.name);
    $('#dish-desc').textContent = L(s.item.desc);
    $('#dish-options').innerHTML = (s.item.options || []).map(function (id) { return optSetHTML(id, s.opts[id]); }).join('');
    $('#dish-note').value = s.note;
    $('#dish-add-label').textContent = s.editKey ? t('dish.update') : t('dish.add');
    updateDishPrice(false);
  }
  function updateDishPrice(animate) {
    var s = dish.state;
    $('#dish-qty').textContent = fmt(s.qty);
    $('#dish-form [data-qty="-1"]').disabled = s.qty <= 1;
    $('#dish-form [data-qty="1"]').disabled = s.qty >= 50;
    var price = $('#dish-price');
    price.innerHTML = moneyHTML(unitPrice(s.item, s.opts) * s.qty);
    if (animate && motionOK() && price.animate) price.animate([{ transform: 'scale(1.2)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  }
  function initDish() {
    var form = $('#dish-form');
    $('#dish-options').addEventListener('change', function (e) {
      var fs = e.target.closest('.opt');
      if (!fs || !dish.state) return;
      var setId = fs.getAttribute('data-set');
      var set = MENU.optionSets[setId];
      if (set.type === 'single') dish.state.opts[setId] = e.target.value;
      else dish.state.opts[setId] = $$('input[name="o-' + setId + '"]:checked', fs).map(function (i) { return i.value; });
      updateDishPrice(true);
    });
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-qty]');
      if (!b || !dish.state) return;
      dish.state.qty = Math.max(1, Math.min(50, dish.state.qty + (+b.getAttribute('data-qty'))));
      updateDishPrice(true);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = dish.state;
      if (!s) return;
      s.note = $('#dish-note').value.trim().slice(0, 140);
      var img = $('#dish-img');
      var fly = { rect: img.getBoundingClientRect(), src: img.currentSrc || img.src };
      closeDialog($('#dish-dialog')).then(function () {
        if (s.editKey) {
          var idx = -1;
          cart.forEach(function (x, i) { if (x.key === s.editKey) idx = i; });
          var newKey = lineKey(s.item.id, s.opts, s.note);
          var twin = cart.filter(function (x) { return x.key === newKey && x.key !== s.editKey; })[0];
          if (twin) { twin.qty = Math.min(50, twin.qty + s.qty); if (idx > -1) cart.splice(idx, 1); }
          else if (idx > -1) cart[idx] = { key: newKey, id: s.item.id, opts: s.opts, qty: s.qty, note: s.note };
          renderCart({ newKey: newKey });
          drawerSay(t('toast.updated', { name: L(s.item.name) }));
          var editBtn = $('[data-line-edit="' + CSS.escape(newKey) + '"]');
          if (editBtn) editBtn.focus();
        } else {
          addToCart(s.item.id, s.opts, s.qty, s.note, fly);
        }
        dish.state = null;
      });
    });
  }

  /* ------------------------------------------------------------ checkout */
  function formValues() {
    var pay = $('input[name="payment"]:checked');
    return {
      name: $('#f-name').value.trim(),
      phone: $('#f-phone').value.trim(),
      address: $('#f-address').value.trim(),
      notes: $('#f-notes').value.trim(),
      type: orderType(),
      payment: pay ? pay.value : 'cash'
    };
  }
  function saveDraft() {
    var v = formValues();
    store.set('naar.customer', { name: v.name, phone: v.phone, address: v.address, type: v.type, payment: v.payment });
  }
  function loadDraft() {
    var d = store.get('naar.customer', null);
    if (!d) return;
    $('#f-name').value = d.name || '';
    $('#f-phone').value = d.phone || '';
    $('#f-address').value = d.address || '';
    if (d.type === 'pickup') $('#f-type-pickup').checked = true;
    if (d.payment === 'card') $('#f-pay-card').checked = true;
    $('#address-field').hidden = d.type === 'pickup';
  }
  var FIELD_RULES = {
    'f-name': function (v) { return v.name.length < 2 ? t('form.errName') : ''; },
    'f-phone': function (v) { return v.phone.replace(/\D/g, '').length < 9 ? t('form.errPhone') : ''; },
    'f-address': function (v) { return v.type === 'delivery' && v.address.length < 6 ? t('form.errAddress') : ''; }
  };
  function setFieldError(id, msg) {
    var input = $('#' + id), err = $('#' + id + '-err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.hidden = !msg;
    err.textContent = msg || '';
  }
  function validate() {
    var v = formValues();
    var errs = [];
    Object.keys(FIELD_RULES).forEach(function (id) {
      var msg = FIELD_RULES[id](v);
      setFieldError(id, msg);
      if (msg) errs.push({ id: id, msg: msg });
    });
    var sum = $('#error-summary');
    if (errs.length) {
      $('#error-list').innerHTML = errs.map(function (e) { return '<li><a href="#' + e.id + '" data-focus="' + e.id + '">' + esc(e.msg) + '</a></li>'; }).join('');
      sum.hidden = false;
      sum.focus();
      return false;
    }
    sum.hidden = true;
    return true;
  }
  function buildOrder() {
    var f = formValues();
    var sub = subtotal(), del = deliveryFee(sub, f.type);
    return {
      no: 'N' + String(Date.now()).slice(-5),
      at: new Date(),
      customer: f,
      sub: sub, del: del, total: sub + del,
      lines: cart.map(function (l) {
        var item = ITEMS.get(l.id);
        var unit = unitPrice(item, l.opts);
        return { id: l.id, name: L(item.name), opts: optsLabel(item, l.opts), note: l.note, qty: l.qty, unit: unit, total: unit * l.qty };
      })
    };
  }
  function orderText(o) {
    var out = [];
    out.push(t('order.header', { brand: L(CFG.brand) }));
    out.push(t('order.no') + ': ' + o.no);
    out.push('');
    out.push(t('order.items') + ':');
    o.lines.forEach(function (l) {
      out.push('• ' + l.qty + ' × ' + l.name + ' — ' + money(l.total));
      if (l.opts) out.push('   ' + l.opts);
      if (l.note) out.push('   “' + l.note + '”');
    });
    out.push('');
    out.push(t('cart.subtotal') + ': ' + money(o.sub));
    if (o.customer.type === 'delivery') out.push(t('cart.delivery') + ': ' + (o.del ? money(o.del) : t('cart.free')));
    out.push(t('cart.total') + ': ' + money(o.total));
    out.push('');
    out.push(t('order.name') + ': ' + o.customer.name);
    out.push(t('order.phone') + ': ' + o.customer.phone);
    out.push(t('order.type') + ': ' + (o.customer.type === 'delivery' ? t('form.delivery') : t('form.pickup')));
    if (o.customer.type === 'delivery') out.push(t('order.address') + ': ' + o.customer.address);
    out.push(t('order.payment') + ': ' + (o.customer.payment === 'card' ? t('form.card') : t('form.cash')));
    if (o.customer.notes) out.push(t('order.notes') + ': ' + o.customer.notes);
    return out.join('\n');
  }
  function renderConfirm(o) {
    var dt = new Intl.DateTimeFormat(CFG.locale[lang], { dateStyle: 'medium', timeStyle: 'short' }).format(o.at);
    var c = o.customer;
    var kv = function (k, v, ltr) { return '<dt>' + esc(t(k)) + '</dt><dd>' + (ltr ? '<bdi>' + esc(v) + '</bdi>' : esc(v)) + '</dd>'; };
    $('#ticket').innerHTML =
      '<p class="ticket__brand"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#logo-flame"/></svg><span>' + esc(L(CFG.brand)) + '</span></p>' +
      '<p class="ticket__meta"><span class="ticket__no">' + esc(t('confirm.no')) + ' <bdi>' + esc(o.no) + '</bdi></span><span>' + esc(dt) + '</span></p>' +
      '<hr>' +
      o.lines.map(function (l) {
        var extra = [l.opts, l.note].filter(Boolean).join(' · ');
        return '<div class="ticket__line"><span class="ticket__qty">' + fmt(l.qty) + '×</span><span>' + esc(l.name) + '</span><span>' + moneyHTML(l.total) + '</span>' +
          (extra ? '<span class="ticket__opts">' + esc(extra) + '</span>' : '') + '</div>';
      }).join('') +
      '<hr>' +
      '<div class="ticket__sum"><span>' + esc(t('cart.subtotal')) + '</span><span>' + moneyHTML(o.sub) + '</span></div>' +
      (c.type === 'delivery' ? '<div class="ticket__sum"><span>' + esc(t('cart.delivery')) + '</span><span>' + (o.del ? moneyHTML(o.del) : esc(t('cart.free'))) + '</span></div>' : '') +
      '<div class="ticket__sum ticket__sum--grand"><span>' + esc(t('cart.total')) + '</span><span>' + moneyHTML(o.total) + '</span></div>' +
      '<hr>' +
      '<dl class="ticket__kv">' +
        kv('order.name', c.name) +
        kv('order.phone', c.phone, true) +
        kv('order.type', c.type === 'delivery' ? t('form.delivery') : t('form.pickup')) +
        (c.type === 'delivery' ? kv('order.address', c.address) : '') +
        kv('order.payment', c.payment === 'card' ? t('form.card') : t('form.cash')) +
        (c.notes ? kv('order.notes', c.notes) : '') +
      '</dl>';
    var text = orderText(o);
    var ta = $('#order-text');
    ta.value = text;
    ta.hidden = true;
    $('#btn-wa').href = waURL(text);
    $('#confirm-note').textContent = CFG.orderEndpoint ? '' : t('confirm.note');
    $('#confirm-note').hidden = !!CFG.orderEndpoint;
    $('#confirm-after').hidden = true;
    $('#confirm-status').hidden = true;
  }
  function nextStep() {
    if (step === 1) {
      if (count() && subtotal() >= CFG.minOrder) goStep(2);
    } else if (step === 2) {
      if (validate()) {
        lastOrder = buildOrder();
        renderConfirm(lastOrder);
        goStep(3);
      }
    }
  }
  function resetOrder() {
    cart = [];
    lastOrder = null;
    $('#f-notes').value = '';
    step = 1;
    renderCart();
  }
  function initCheckout() {
    var form = $('#checkout-form');
    form.addEventListener('submit', function (e) { e.preventDefault(); nextStep(); });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'type') {
        $('#address-field').hidden = e.target.value === 'pickup';
        if (e.target.value === 'pickup') setFieldError('f-address', '');
        renderTotals();
      }
      saveDraft();
    });
    form.addEventListener('input', function (e) {
      saveDraft();
      var id = e.target.id;
      if (FIELD_RULES[id] && e.target.getAttribute('aria-invalid') === 'true') setFieldError(id, FIELD_RULES[id](formValues()));
    });
    $('#error-list').addEventListener('click', function (e) {
      var a = e.target.closest('[data-focus]');
      if (!a) return;
      e.preventDefault();
      $('#' + a.getAttribute('data-focus')).focus();
    });
    $('#btn-next').addEventListener('click', nextStep);
    $('#btn-back').addEventListener('click', function () { goStep(Math.max(1, step - 1)); });
    $('#btn-wa').addEventListener('click', function () {
      setTimeout(function () {
        var after = $('#confirm-after');
        after.textContent = t('confirm.after', { phone: CFG.phone });
        after.hidden = false;
      }, 600);
    });
    $('#btn-copy').addEventListener('click', function () {
      var text = $('#order-text').value;
      var label = $('#btn-copy-label');
      var fallback = function () {
        var ta = $('#order-text');
        ta.hidden = false;
        ta.focus();
        ta.select();
        drawerSay(t('confirm.copyFail'));
      };
      if (!navigator.clipboard || !navigator.clipboard.writeText) { fallback(); return; }
      navigator.clipboard.writeText(text).then(function () {
        label.textContent = t('confirm.copied');
        drawerSay(t('confirm.copied'));
        setTimeout(function () { label.textContent = t('confirm.copy'); }, 1800);
      }, fallback);
    });
    $('#btn-place').addEventListener('click', function () {
      var btn = $('#btn-place'), status = $('#confirm-status');
      btn.disabled = true;
      $('#btn-place-label').textContent = t('confirm.sending');
      fetch(CFG.orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, lastOrder, { lang: lang, text: orderText(lastOrder) }))
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        status.textContent = t('confirm.sent');
        status.className = 'confirm__status is-ok';
        status.hidden = false;
        btn.hidden = true;
        cart = [];
        saveCart();
        renderCart();
        $('#sub-actions').hidden = false;
      }).catch(function () {
        status.textContent = t('confirm.fail');
        status.className = 'confirm__status is-err';
        status.hidden = false;
        $('#btn-wa').hidden = false;
      }).then(function () {
        btn.disabled = false;
        $('#btn-place-label').textContent = t('confirm.place');
      });
    });
    $('#btn-new').addEventListener('click', function () {
      resetOrder();
      closeDialog($('#cart-dialog')).then(function () {
        var m = $('#menu');
        if (m) m.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto' });
      });
    });
    $('#clear-ask').addEventListener('click', function () { $('#clear-ask').hidden = true; $('#clear-confirm').hidden = false; $('#clear-no').focus(); });
    $('#clear-no').addEventListener('click', function () { $('#clear-confirm').hidden = true; $('#clear-ask').hidden = false; $('#clear-ask').focus(); });
    $('#clear-yes').addEventListener('click', function () {
      cart = [];
      renderCart();
      $('#clear-confirm').hidden = true;
      $('#clear-ask').hidden = false;
      $('#cart-browse').focus();
    });
    $('#cart-browse').addEventListener('click', function () {
      closeDialog($('#cart-dialog')).then(function () {
        $('#menu').scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto' });
      });
    });
    $('#cart-dialog').addEventListener('click', function (e) {
      var inc = e.target.closest('[data-line-inc]'), dec = e.target.closest('[data-line-dec]');
      var rm = e.target.closest('[data-line-remove]'), ed = e.target.closest('[data-line-edit]');
      if (inc) changeQty(inc.getAttribute('data-line-inc'), 1, 'inc');
      else if (dec) changeQty(dec.getAttribute('data-line-dec'), -1, 'dec');
      else if (rm) removeLine(rm.getAttribute('data-line-remove'));
      else if (ed) {
        var l = cart.filter(function (x) { return x.key === ed.getAttribute('data-line-edit'); })[0];
        if (l) openDish(l.id, ed, l.key);
      }
    });
    [$('#cart-btn'), $('#cart-bar-btn')].forEach(function (b) {
      b.addEventListener('click', function () {
        if (step === 3 && !lastOrder) step = 1;
        renderStepUI();
        openDialog($('#cart-dialog'), b);
      });
    });
  }

  /* -------------------------------------------------------------- toasts */
  function toast(msg, opts) {
    opts = opts || {};
    var box = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="toast__icon" aria-hidden="true"><svg class="icon"><use href="#i-check"/></svg></span><span class="toast__msg"></span>';
    $('.toast__msg', el).textContent = msg;
    var timer;
    var dismiss = function () {
      clearTimeout(timer);
      if (!el.isConnected) return;
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 320);
    };
    if (opts.action) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'toast__action';
      b.textContent = opts.action;
      b.addEventListener('click', function () { if (opts.onAction) opts.onAction(); dismiss(); });
      el.appendChild(b);
    }
    while (box.children.length >= 2) box.firstElementChild.remove();
    box.appendChild(el);
    timer = setTimeout(dismiss, opts.duration || 4200);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 1800); });
    el.addEventListener('focusin', function () { clearTimeout(timer); });
  }

  /* -------------------------------------------------------- page chrome */
  function initHeader() {
    var header = $('#site-header');
    var bar = $('.scroll-progress span');
    var lastY = window.scrollY, ticking = false;
    var update = function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      var navOpen = !$('#mobile-nav').hidden;
      // Only phones/tablets hide the header on scroll: they have the bottom cart bar instead.
      if (!mqDesktop.matches && y > 560 && y > lastY + 6 && !navOpen && !header.contains(document.activeElement)) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 560) header.classList.remove('is-hidden');
      lastY = y;
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
      ticking = false;
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
    update();
  }
  function setOutsideInert(on, except) {
    [$('#main'), $('.site-footer'), $('#cart-bar'), $('.skip-link')].forEach(function (el) {
      if (el && el !== except) el.inert = on;
    });
  }
  function initMobileNav() {
    var btn = $('#burger'), nav = $('#mobile-nav');
    var open = function () {
      nav.hidden = false;
      nav.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', t('a11y.closeMenu'));
      root.classList.add('is-locked');
      setOutsideInert(true);
      $('a', nav).focus();
    };
    var close = function (focusBtn) {
      if (nav.hidden) return;
      nav.classList.remove('is-open');
      nav.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', t('a11y.openMenu'));
      root.classList.remove('is-locked');
      setOutsideInert(false);
      if (focusBtn !== false) btn.focus();
    };
    btn.addEventListener('click', function () { if (btn.getAttribute('aria-expanded') === 'true') close(); else open(); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    mqDesktop.addEventListener('change', function () { if (mqDesktop.matches) close(false); });
  }
  function initNavSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.primary-nav a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['menu', 'offers', 'story', 'visit'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
  function initInView() {
    if (!('IntersectionObserver' in window)) { root.classList.add('no-io'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-inview'); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    $$('.section-head').forEach(function (el) { io.observe(el); });
  }
  function initCounter() {
    var el = $('#oven-temp');
    if (!el || !motionOK() || !('IntersectionObserver' in window)) return;
    var target = +el.textContent || 400;
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      var t0 = performance.now(), dur = 1700;
      el.textContent = '0';
      var tick = function (now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { rootMargin: '0px 0px 10% 0px' });
    io.observe(el);
  }
  function initEmbers() {
    if (!motionOK()) return;
    $$('.embers[data-embers]').forEach(function (box) {
      var n = +box.getAttribute('data-embers');
      if (innerWidth < 640) n = Math.round(n * 0.55);
      var rise = box.closest('.intro') ? '100vh' : Math.max(500, box.offsetHeight + 40) + 'px';
      var frag = document.createDocumentFragment();
      for (var i = 0; i < n; i++) {
        var s = document.createElement('span');
        s.className = 'ember';
        s.style.cssText = '--x:' + (Math.random() * 100).toFixed(2) + '%;--size:' + (3 + Math.random() * 6).toFixed(1) + 'px;--dur:' + (5 + Math.random() * 7).toFixed(2) +
          's;--delay:' + (-Math.random() * 10).toFixed(2) + 's;--drift:' + ((Math.random() - 0.5) * 160).toFixed(0) + 'px;--rise:' + rise + ';--o:' + (0.5 + Math.random() * 0.5).toFixed(2);
        frag.appendChild(s);
      }
      box.appendChild(frag);
    });
  }
  function initTilt() {
    if (!mqFine.matches || !motionOK()) return;
    var grid = $('#menu-grid');
    var cur = null, raf = 0, px = 0, py = 0;
    var reset = function (c) { var el = c.firstElementChild; el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); };
    grid.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.food-card');
      if (!card) return;
      if (cur && cur !== card) reset(cur);
      cur = card; px = e.clientX; py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (!cur) return;
        var r = cur.getBoundingClientRect();
        var x = (px - r.left) / r.width - 0.5, y = (py - r.top) / r.height - 0.5;
        cur.firstElementChild.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
        cur.firstElementChild.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
      });
    });
    grid.addEventListener('pointerout', function (e) {
      var from = e.target.closest('.food-card');
      var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.food-card') : null;
      if (from && from !== to) { reset(from); if (cur === from) cur = null; }
    });
  }
  function initMenuEvents() {
    $('#menu-filters').addEventListener('click', function (e) {
      var b = e.target.closest('.filter');
      if (!b) return;
      filter = b.getAttribute('data-filter');
      if (query) { query = ''; $('#menu-search').value = ''; }
      $$('.filter').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      moveInk();
      applyFilter(true);
    });
    var timer;
    $('#menu-search').addEventListener('input', function (e) {
      clearTimeout(timer);
      var v = e.target.value;
      timer = setTimeout(function () {
        query = normText(v.trim());
        if (query && filter !== 'all') {
          filter = 'all';
          $$('.filter').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-filter') === 'all')); });
          moveInk();
        }
        applyFilter(true);
      }, 180);
    });
    addEventListener('resize', function () { requestAnimationFrame(moveInk); });
    document.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) {
        var item = ITEMS.get(add.getAttribute('data-add'));
        if (!item) return;
        addToCart(item.id, defaultOpts(item), 1, '', sourceOf(add));
        markAdded(add);
        return;
      }
      var open = e.target.closest('[data-open]');
      if (open) openDish(open.getAttribute('data-open'), open.closest('.food-card') ? $('.food-card__title', open.closest('.food-card')) : open);
    });
    $('#copy-phone').addEventListener('click', function () {
      var done = function () { toast(t('confirm.copied')); };
      var select = function () {
        var r = document.createRange();
        r.selectNodeContents($('#phone-text'));
        var s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CFG.phone).then(done, select);
      else select();
    });
    $('#lang-btn').addEventListener('click', function (e) {
      var r = e.currentTarget.getBoundingClientRect();
      setLang(lang === 'ar' ? 'en' : 'ar', { animate: true, origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
    });
  }

  /* -------------------------------------------------------------- motion */
  function reveal(selector, vars) {
    var els = gsap.utils.toArray(selector).filter(function (el) {
      return el.offsetParent !== null && el.getBoundingClientRect().top > innerHeight * 0.92;
    });
    if (!els.length) return;
    var stagger = vars.stagger || 0.08;
    var from = Object.assign({}, vars);
    delete from.stagger;
    gsap.set(els, Object.assign({ opacity: 0, transition: 'none' }, from));
    ScrollTrigger.batch(els, {
      start: 'top 92%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.95, ease: 'expo.out', stagger: stagger, overwrite: true, clearProps: 'transform,opacity,transition' });
      }
    });
  }
  var motion = {
    ctx: null,
    build: function () {
      if (!hasGSAP() || !motionOK()) return;
      gsap.registerPlugin(ScrollTrigger);
      if (window.Flip) gsap.registerPlugin(Flip);
      var sign = lang === 'ar' ? -1 : 1;
      this.ctx = gsap.context(function () {
        var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 };
        gsap.to('.hero__visual', { yPercent: 14, ease: 'none', scrollTrigger: heroST });
        gsap.to('.hero__scroll-spin', { rotate: 150 * sign, ease: 'none', scrollTrigger: Object.assign({}, heroST, { scrub: 1 }) });
        gsap.to('.hero__ghost', { xPercent: 12 * sign, ease: 'none', scrollTrigger: heroST });

        var skewTo = gsap.quickTo('.band__skew', 'skewX', { duration: 0.5, ease: 'power3' });
        var calm;
        ScrollTrigger.create({
          trigger: '.bands', start: 'top bottom', end: 'bottom top',
          onUpdate: function (self) {
            skewTo(gsap.utils.clamp(-14, 14, self.getVelocity() / -240));
            clearTimeout(calm);
            calm = setTimeout(function () { skewTo(0); }, 140);
          }
        });

        if (mqDesktop.matches && $('#best').dataset.pin === 'true') {
          var best = $('#best'), track = $('#best-track'), vp = $('#best-viewport');
          var dist = function () {
            var cs = getComputedStyle(vp);
            return Math.max(0, track.scrollWidth - (vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
          };
          if (dist() > 40) {
            best.classList.add('is-pinned');
            vp.scrollLeft = 0;
            gsap.to(track, {
              x: function () { return -dist() * sign; }, ease: 'none',
              scrollTrigger: { trigger: best, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
            });
          }
        }

        reveal('.section-head', { y: 46 });
        reveal('.search, .filters-scroll, .best__hint', { y: 30 });
        reveal('.food-card', { y: 56, stagger: 0.06 });
        reveal('.best-card', { y: 70, stagger: 0.08 });
        reveal('.deal', { y: 70, rotate: 1.5 * sign, stagger: 0.1 });
        reveal('.how__step', { y: 80, rotate: -2 * sign, stagger: 0.12 });
        reveal('.story__media', { y: 60, scale: 0.95 });
        reveal('.story__text', { y: 30 });
        reveal('.promises li', { x: -50 * sign, stagger: 0.1 });
        reveal('.visit-card', { y: 70, stagger: 0.1 });

        gsap.fromTo('.how__path', { clipPath: 'inset(0% 100% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: '.how__steps', start: 'top 85%', end: 'top 35%', scrub: 1 }
        });
        gsap.fromTo('.story__media img', { yPercent: -7 }, {
          yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: '.story__media', start: 'top bottom', end: 'bottom top', scrub: true }
        });
        gsap.from('.footer__word', {
          yPercent: 35, scale: 0.9, opacity: 0.25, ease: 'none',
          scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'top 45%', scrub: 1 }
        });
      });
      ScrollTrigger.refresh();
    },
    rebuild: function () {
      if (!hasGSAP()) return;
      if (this.ctx) { this.ctx.revert(); this.ctx = null; }
      $('#best').classList.remove('is-pinned');
      if (this.started) this.build();
    },
    start: function () { this.started = true; this.build(); }
  };

  function heroIn() {
    if (!motionOK() || !hasGSAP()) return;
    var sign = lang === 'ar' ? -1 : 1;
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hero__word', { yPercent: 118, rotate: 5 * sign, duration: 1.25, stagger: 0.12 }, 0)
      .from('#hero-status', { y: -18, opacity: 0, duration: 0.7 }, 0.1)
      .from(['.hero__lead', '.hero__ctas', '.hero__facts'], { y: 30, opacity: 0, duration: 0.95, stagger: 0.1 }, 0.35)
      .from('.hero__pizza-wrap', { scale: 0.3, rotate: -220 * sign, opacity: 0, duration: 1.7 }, 0.05)
      .from(['.hero__badge', '.hero__sticker-wrap'], { scale: 0, rotate: -70 * sign, duration: 1, stagger: 0.12, ease: 'back.out(1.9)' }, 0.7)
      .from('.float', { scale: 0, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(2.2)' }, 0.85)
      .from('.steam', { opacity: 0, duration: 1 }, 1.2);
  }

  /* --------------------------------------------------------------- intro */
  function playIntroIn() {
    return new Promise(function (resolve) {
      if (!motionOK() || !hasGSAP()) { resolve(); return; }
      gsap.set('.intro__content', { autoAlpha: 0 });
      var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1200); })]).then(function () {
        gsap.set('.intro__btn', { transition: 'none' });
        gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: resolve })
          .set('.intro__content', { autoAlpha: 1 })
          .from('.intro__sun', { yPercent: 45, rotate: -120, duration: 1.7 }, 0)
          .from('.intro__flame-wrap', { scale: 0, rotate: -40, duration: 1, ease: 'back.out(2.2)' }, 0.15)
          .from('.intro__word', { yPercent: 50, scale: 1.35, opacity: 0, filter: 'blur(14px)', duration: 1.15 }, 0.25)
          .from('.intro__latin', { letterSpacing: '1.6em', opacity: 0, duration: 1.15 }, 0.4)
          .from('.intro__welcome > *, .intro__back > *', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.6)
          .from('.intro__tag > *', { y: 16, opacity: 0, duration: 0.6, stagger: 0.06 }, 0.75)
          .from('.intro__btn', { y: 30, opacity: 0, scale: 0.9, duration: 0.85, stagger: 0.1, ease: 'back.out(1.8)', clearProps: 'transform,opacity,transition' }, 0.85)
          .from('.intro__skip', { opacity: 0, duration: 0.6 }, 1);
      });
    });
  }
  function initIntro(onDone) {
    var intro = $('#intro');
    var hashTarget = location.hash.length > 1 && /^#[\w-]+$/.test(location.hash) ? document.querySelector(location.hash) : null;
    if (root.classList.contains('intro-failsafe') || hashTarget) {
      intro.classList.add('is-gone');
      onDone();
      return;
    }
    var short = root.classList.contains('intro-short');
    intro.classList.toggle('is-short', short);
    var outside = [$('#site-header'), $('#main'), $('.site-footer'), $('#cart-bar'), $('.skip-link'), $('#mobile-nav')];
    outside.forEach(function (el) { if (el) el.inert = true; });
    root.classList.add('is-locked');
    var finished = false;
    var finish = function (chosen, originEl) {
      if (finished) return;
      finished = true;
      store.setRaw('naar.seen', '1');
      if (chosen && chosen !== lang) setLang(chosen, { rebuild: false });
      else store.setRaw('naar.lang', lang);
      var r = originEl ? originEl.getBoundingClientRect() : null;
      var cx = r ? r.left + r.width / 2 : innerWidth / 2;
      var cy = r ? r.top + r.height / 2 : innerHeight / 2;
      var released = false;
      var release = function () {
        if (released) return;
        released = true;
        outside.forEach(function (el) { if (el) el.inert = false; });
        root.classList.remove('is-locked');
        onDone();
        var target = $('#main');
        if (target) target.focus({ preventScroll: true });
      };
      var end = function () { intro.classList.add('is-gone'); release(); };
      if (motionOK() && hasGSAP()) {
        gsap.timeline({ onComplete: end })
          .to('.intro__content > *', { y: -28, opacity: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 0)
          .to('.intro__sun', { scale: 1.7, duration: 0.9, ease: 'expo.in' }, 0)
          .fromTo(intro, { clipPath: 'circle(150% at ' + cx + 'px ' + cy + 'px)' }, { clipPath: 'circle(0% at ' + cx + 'px ' + cy + 'px)', duration: 0.95, ease: 'expo.inOut' }, 0.15)
          .call(release, null, 0.55);
      } else if (motionOK() && intro.animate) {
        intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished.then(end, end);
      } else {
        end();
      }
    };
    intro.addEventListener('click', function (e) {
      var b = e.target.closest('.intro__btn');
      if (b) finish(b.getAttribute('data-lang'), b);
    });
    $('#intro-skip').addEventListener('click', function (e) { finish(null, e.currentTarget); });
    intro.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(null, null); });
    var first = short ? $('#intro-skip') : $('.intro__btn[data-lang="' + lang + '"]', intro);
    if (first) first.focus({ preventScroll: true });
    playIntroIn().then(function () {
      if (short) setTimeout(function () { finish(null, null); }, motionOK() ? 700 : 1500);
    });
  }

  /* ---------------------------------------------------------------- boot */
  function init() {
    loadDraft();
    translateDOM();
    renderAll();
    initEmbers();
    initHeader();
    initMobileNav();
    initDialogs();
    initDish();
    initCheckout();
    initMenuEvents();
    initInView();
    initTilt();
    initCounter();
    initNavSpy();
    setInterval(function () { tickCountdown(false); }, 1000);
    setInterval(renderStatus, 60000);
    mqDesktop.addEventListener('change', function () { motion.rebuild(); });
    mqReduce.addEventListener('change', function () { motion.rebuild(); });
    document.addEventListener('naar:motion', function () { motion.rebuild(); });
    window.__naarReady = true;
    initIntro(function () {
      heroIn();
      motion.start();
    });
    addEventListener('load', function () { if (hasGSAP()) ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInk(); if (hasGSAP()) ScrollTrigger.refresh(); });
  }
  init();
})();
