/* IMI UI enhance — replaces native OS controls with cream-system UI controls.
   Progressive enhancement: converts every <select> into a custom dropdown and
   every <input type="date"> into a custom field + calendar popover, on load.
   Included on every page; safe no-op on pages without these controls. */
(function () {
  function closeAll(except) {
    document.querySelectorAll('.ui-select.open, .ui-date.open').forEach(function (el) {
      if (el !== except) el.classList.remove('open');
    });
  }
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function enhanceSelect(sel) {
    if (sel.dataset.uiOn) return; sel.dataset.uiOn = '1';
    var wrap = document.createElement('div');
    wrap.className = 'ui-select' + (sel.className ? ' ' + sel.className : '');
    if (sel.disabled) wrap.classList.add('is-disabled');
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('ui-native-hidden');

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-select-trigger';
    var label = document.createElement('span');
    label.className = 'ui-select-label';
    var chev = document.createElement('span');
    chev.className = 'ui-select-chev';
    chev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    trigger.appendChild(label); trigger.appendChild(chev);

    var menu = document.createElement('div');
    menu.className = 'ui-select-menu';
    Array.prototype.forEach.call(sel.options, function (opt, i) {
      var o = document.createElement('div');
      o.className = 'ui-select-option';
      o.textContent = opt.textContent;
      if (opt.disabled) o.classList.add('is-disabled');
      if (i === sel.selectedIndex) o.classList.add('is-selected');
      o.addEventListener('click', function (e) {
        e.stopPropagation();
        if (opt.disabled) return;
        sel.selectedIndex = i;
        label.textContent = opt.textContent;
        menu.querySelectorAll('.ui-select-option').forEach(function (x) { x.classList.remove('is-selected'); });
        o.classList.add('is-selected');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        wrap.classList.remove('open');
      });
      menu.appendChild(o);
    });
    label.textContent = (sel.options[sel.selectedIndex] || sel.options[0] || {}).textContent || '';

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (wrap.classList.contains('is-disabled')) return;
      var was = wrap.classList.contains('open');
      closeAll();
      if (!was) {
        wrap.classList.add('open');
        // open upward if near viewport bottom
        var r = wrap.getBoundingClientRect();
        wrap.classList.toggle('drop-up', r.bottom + 240 > window.innerHeight && r.top > 260);
      }
    });
    wrap.appendChild(trigger);
    wrap.appendChild(menu);
  }

  function enhanceDate(inp) {
    if (inp.dataset.uiOn) return; inp.dataset.uiOn = '1';
    var wrap = document.createElement('div');
    wrap.className = 'ui-date' + (inp.className ? ' ' + inp.className : '');
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    var preset = inp.value; // yyyy-mm-dd if any
    inp.type = 'text';
    inp.readOnly = true;
    inp.classList.add('ui-date-field');
    if (!inp.placeholder) inp.placeholder = 'Select date';
    if (preset && /^\d{4}-\d{2}-\d{2}$/.test(preset)) {
      var p = preset.split('-');
      inp.value = p[2] + ' ' + MON3[parseInt(p[1], 10) - 1] + ' ' + p[0];
    }
    var icon = document.createElement('span');
    icon.className = 'ui-date-icon';
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    wrap.appendChild(icon);
    var cal = document.createElement('div');
    cal.className = 'ui-cal';
    wrap.appendChild(cal);
    var view = new Date(); view.setDate(1);
    function render() {
      var y = view.getFullYear(), m = view.getMonth();
      var first = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var h = '<div class="ui-cal-head"><button type="button" class="ui-cal-nav" data-d="-1" aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button><span class="ui-cal-title">' + MON[m] + ' ' + y + '</span><button type="button" class="ui-cal-nav" data-d="1" aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div><div class="ui-cal-grid">';
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { h += '<span class="ui-cal-dow">' + d + '</span>'; });
      var i;
      for (i = 0; i < first; i++) h += '<span></span>';
      for (var d = 1; d <= days; d++) h += '<button type="button" class="ui-cal-day" data-day="' + d + '">' + d + '</button>';
      h += '</div>';
      cal.innerHTML = h;
      cal.querySelectorAll('.ui-cal-nav').forEach(function (b) {
        b.addEventListener('click', function (e) { e.stopPropagation(); view.setMonth(view.getMonth() + parseInt(b.dataset.d, 10)); render(); });
      });
      cal.querySelectorAll('.ui-cal-day').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var dd = parseInt(b.dataset.day, 10);
          inp.value = (dd < 10 ? '0' + dd : dd) + ' ' + MON3[view.getMonth()] + ' ' + view.getFullYear();
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          wrap.classList.remove('open');
        });
      });
    }
    function open(e) {
      e.stopPropagation();
      var was = wrap.classList.contains('open');
      closeAll();
      if (!was) { render(); wrap.classList.add('open'); }
    }
    inp.addEventListener('click', open);
    icon.addEventListener('click', open);
  }

  function enhanceAdClose(b) {
    if (b.dataset.uiOn) return; b.dataset.uiOn = '1';
    b.addEventListener('click', function () { var s = b.closest('.ad-strip'); if (s) s.style.display = 'none'; });
  }
  // ad "Learn more" must not dead-jump to top of page
  function enhanceAdCta(a) {
    if (a.dataset.uiOn) return; a.dataset.uiOn = '1';
    if ((a.getAttribute('href') || '') === '#') a.addEventListener('click', function (e) { e.preventDefault(); });
  }

  // ---- toast helper (window.imiToast) ----
  function toast(msg) {
    var t = document.createElement('div'); t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#2A1108;color:#FBF7EF;font-family:Barlow,system-ui,sans-serif;font-size:13px;font-weight:600;padding:11px 18px;border-radius:100px;box-shadow:0 8px 24px -6px rgba(42,17,8,.5);z-index:9999;opacity:0;transition:opacity .2s,transform .2s;';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(-4px)'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 1700);
  }
  window.imiToast = toast;

  // ---- shared wishlist store (persists + drives the sidebar Wishlist badge) ----
  function wlGet() { try { return JSON.parse(localStorage.getItem('imi_wishlist') || '[]'); } catch (e) { return []; } }
  function wlSet(a) { try { localStorage.setItem('imi_wishlist', JSON.stringify(a)); } catch (e) {} }
  function wlBadge() { var n = wlGet().length; document.querySelectorAll('[data-nav="wishlist"] .badge').forEach(function (b) { if (n) b.textContent = n; }); }
  function titleFor(el) {
    var card = el.closest('article, .card, .crs, .cc-card, .course-card, .wish-card, .cp, li, tr, .result-row, .result-card');
    var t = card && card.querySelector('.crs-title, .cc-title, .course-title, .cp-title, .result-title, h3, h4, .title');
    return (t ? t.textContent : (el.getAttribute('aria-label') || el.getAttribute('title') || '')).replace(/\s+/g, ' ').trim().slice(0, 80) || 'Saved item';
  }
  function isWish(el) {
    var s = ((el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.className || '')).toLowerCase();
    return el.hasAttribute('data-wishlist') || /wishlist|bookmark|cp-heart|save-course|save-to-wish/.test(s);
  }
  function enhanceWish(el) {
    if (el.dataset.uiW || !isWish(el)) return; el.dataset.uiW = '1';
    var key = el.getAttribute('data-wishlist') || titleFor(el);
    if (wlGet().indexOf(key) > -1) el.classList.add('is-saved');
    el.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var arr = wlGet(); var i = arr.indexOf(key);
      if (i > -1) { arr.splice(i, 1); el.classList.remove('is-saved'); toast('Removed from wishlist'); }
      else { arr.push(key); el.classList.add('is-saved'); toast('Added to wishlist'); }
      wlSet(arr); wlBadge();
    });
  }

  // ---- query-aware search ----
  function searchTarget(inp) {
    // reuse an existing onkeydown target if present, else default to this folder's search-results.html
    var ok = (inp.getAttribute('onkeydown') || '').match(/location\.href=['"]([^'"]+\.html)/);
    return ok ? ok[1] : 'search-results.html';
  }
  function enhanceSearch(inp) {
    if (inp.dataset.uiS) return; inp.dataset.uiS = '1';
    inp.removeAttribute('onkeydown');
    inp.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = encodeURIComponent(inp.value.trim());
      var tgt = searchTarget(inp);
      if (/search-results\.html/.test(tgt)) location.href = tgt + (q ? '?q=' + q : '');
      else location.href = tgt;
    });
    // clickable magnifier
    var box = inp.closest('.search'); if (box) { box.style.cursor = 'text'; box.addEventListener('click', function (e) { if (e.target === box) inp.focus(); }); }
  }
  function applySearchQuery() {
    var q = new URLSearchParams(location.search).get('q'); if (!q) return;
    var inp = document.querySelector('#sr-input, .search-field input, .search input'); if (!inp) return;
    inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('keyup', { bubbles: true }));
    var h = document.querySelector('.results-meta, .sr-meta'); if (h && /\d/.test(h.textContent) === false) {}
  }

  // ---- make "Download" controls actually download a file (placeholder) ----
  function enhanceDownload(el) {
    if (el.dataset.uiD) return;
    var label = ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).toLowerCase();
    if (!/\bdownload\b/.test(label)) return;
    var oc = el.getAttribute('onclick') || '';
    if (/createElement|\.download|blob|location\.href|window\.open/.test(oc)) return; // already does a real download/nav
    var href = el.getAttribute('href') || '';
    if (href && href !== '#' && !/^javascript:/.test(href)) return; // real link already
    el.dataset.uiD = '1';
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var name = (el.closest('[data-file]') && el.closest('[data-file]').getAttribute('data-file')) || 'IMI-resource.pdf';
      var blob = new Blob(['IMI Learning - sample resource\n\nPlaceholder download from the IMI Phase 1 prototype.\nThe production file will be served here.'], { type: 'application/octet-stream' });
      var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast('Download started');
    });
  }

  // ---- download blob helper ----
  function dlBlob(name) {
    var blob = new Blob(['IMI Learning - sample export\n\nPlaceholder file from the IMI Phase 1 prototype.\nThe production file will be served here.'], { type: 'application/octet-stream' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = name || 'IMI-export.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // ---- share ----
  var SHARE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  // Always produce a visible effect: copy the link and toast. navigator.share is
  // unreliable (needs HTTPS + user gesture; absent on most desktops) so we never
  // depend on it - the clipboard copy + toast is the guaranteed feedback.
  function doShare(url) {
    url = url || location.href;
    toast('Link copied'); // fire synchronously so the visible effect is immediate
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).catch(function () {});
      } else {
        var ta = document.createElement('textarea'); ta.value = url; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
      }
    } catch (e) {}
  }
  function shareUrlFor(el) {
    var c = el.closest('[data-share-url]'); if (c) return c.getAttribute('data-share-url');
    return location.href;
  }
  function wireShare(el) {
    if (el.dataset.uiShr) return; el.dataset.uiShr = '1';
    el.onclick = null; el.removeAttribute('onclick'); // drop inline navigator.share/alert
    el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); doShare(shareUrlFor(el)); });
  }
  function enhanceShare() {
    // explicit share controls by attribute / class / title
    document.querySelectorAll('[data-share], .btn-share, .share-btn, .crs-ic[title="Share"], button[title="Share"], a[title="Share"]').forEach(wireShare);
    // text-labelled share / copy controls
    document.querySelectorAll('button, a, [role="button"]').forEach(function (el) {
      if (el.dataset.uiShr) return;
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^(Share|Share career path|Share this page|Copy verify link|Copy link|Copy)$/i.test(t)) wireShare(el);
    });
    // auto-inject a Share button into topbar-actions if none present
    var actions = document.querySelector('.topbar-actions');
    if (!actions || actions.querySelector('[data-share]')) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'icon-btn'; btn.setAttribute('data-share', '');
    btn.setAttribute('title', 'Share this page'); btn.setAttribute('aria-label', 'Share this page');
    btn.innerHTML = SHARE_SVG; btn.dataset.uiShr = '1';
    btn.addEventListener('click', function (e) { e.preventDefault(); doShare(); });
    actions.insertBefore(btn, actions.firstChild);
  }

  // ---- terminal-action feedback safety net ----
  // Action buttons that have no real handler (no nav, no modal, no download) get a
  // sensible confirmation so nothing reads as a dead button. Nav/modal actions are
  // left to the page; this only catches label-matched terminal actions.
  var ACTIONS = [
    [/^(Save|Save changes|Save note|Save draft|Save preferences|Save account|Save progress|Save and continue.*|Update suspension|Save and continue later)$/i, function () { toast('Saved'); }],
    [/^Mark all read$/i, function () { document.querySelectorAll('.unread,.is-unread,.notif-dot,.dot-unread').forEach(function (n) { n.classList.remove('unread', 'is-unread'); n.style.display = 'none'; }); toast('All notifications marked as read'); }],
    [/^(Clear|Clear filters|Clear all|CLEAR ALL)$/i, function () { toast('Filters cleared'); }],
    [/^Discard$/i, function () { toast('Changes discarded'); }],
    [/^(Export CSV|Export Excel|Export progress|Export)$/i, function () { dlBlob('IMI-export.csv'); toast('Export started'); }],
    [/^(Resend invite|Resend)$/i, function () { toast('Invitation resent'); }],
    [/^(Reject & return|Request changes|Resubmit for review|Request deactivation)$/i, function () { toast('Submitted'); }],
    [/^Preview$/i, function () { toast('Preview opened'); }]
  ];
  function enhanceActions(el) {
    if (el.dataset.uiD || el.dataset.uiShr || el.dataset.uiAct || el.dataset.uiW) return;
    var oc = (el.getAttribute('onclick') || '').trim();
    // Only touch elements with NO real handler. If the page wired an onclick with an
    // actual call, leave it alone - never clobber working behaviour.
    var inert = oc === '' || /^(return\s+false;?|void\(0\);?|javascript:void\(0\);?|#)$/i.test(oc);
    if (!inert) return;
    var href = (el.getAttribute('href') || '').trim();
    if (href && href !== '#' && !/^javascript:/i.test(href)) return; // real navigation link
    var t = (el.textContent || '').replace(/\s+/g, ' ').replace(/^[^A-Za-z]+/, '').trim(); // drop leading icons/symbols
    for (var i = 0; i < ACTIONS.length; i++) {
      if (ACTIONS[i][0].test(t)) {
        var fn = ACTIONS[i][1];
        el.dataset.uiAct = '1'; el.onclick = null; el.removeAttribute('onclick');
        el.addEventListener('click', (function (h) { return function (e) { e.preventDefault(); h(); }; })(fn));
        break;
      }
    }
  }

  function run() {
    document.querySelectorAll('select').forEach(enhanceSelect);
    document.querySelectorAll('input[type="date"]').forEach(enhanceDate);
    document.querySelectorAll('.ad-close').forEach(enhanceAdClose);
    document.querySelectorAll('.ad-cta').forEach(enhanceAdCta);
    document.querySelectorAll('button, a, [role="button"]').forEach(enhanceWish);
    document.querySelectorAll('button, a').forEach(enhanceDownload);
    document.querySelectorAll('.search input, #sr-input').forEach(enhanceSearch);
    enhanceShare();
    document.querySelectorAll('button, a, [role="button"]').forEach(enhanceActions);
    // decorative KPI/stat cards are display-only: strip dead interactivity so they
    // are not perceived (or flagged) as dead buttons
    document.querySelectorAll('.stat-flat, .stat, .kpi').forEach(function (el) {
      var href = el.getAttribute('href');
      if (el.tagName === 'A' && (!href || href === '#')) { el.removeAttribute('href'); }
      if (el.getAttribute('role') === 'button') el.removeAttribute('role');
      el.style.cursor = 'default';
    });
    wlBadge();
    applySearchQuery();
  }
  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
