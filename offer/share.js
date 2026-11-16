/* =====================================================================
   Image Makers · Προσωπικό link προσφοράς (?t=...)
   Η σελίδα πελάτη ανοίγει συμπληρωμένη με όσα επιλέχθηκαν στο μαγαζί.
   Ο πελάτης αλλάζει επιλογές· η τιμή ξεκινά από τη συμφωνημένη και αλλάζει
   μόνο κατά τη διαφορά των αλλαγών. Με «Αποστολή» ενημερώνεται το ίδιο ραντεβού.
   Χωρίς ?t= δεν κάνει τίποτα (η σελίδα δουλεύει όπως πάντα).
   ===================================================================== */
(function () {
  var token = new URLSearchParams(location.search).get('t');
  if (!token || !window.IMClient) return;

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var money = function (v) { return Math.round(v).toLocaleString('el-GR') + '€'; };
  var fmtD = function (v) { var p = String(v).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(v); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ίδια ονόματα με τους Οδηγούς προσφοράς της εφαρμογής
  var INC = { droneChurch: 'Drone εκκλησίας', photoNextDay: 'Φωτογράφηση next day', videoNextDay: 'Video next day', droneNextDay: 'Drone next day' };
  var ADD = { preWeddingVideoDrone: 'Pre-wedding photo & video', secondCrew: '2ο συνεργείο', slideshow: 'Slide show για τη δεξίωση', guestBook: 'Ευχολόγιο', platinumAlbum: 'Album Platinum series', platinumCase: 'Platinum album case', woodenUsbCase: 'Wooden USB case', video4k: 'Παράδοση video σε 4K' };
  var ADD_B = { preBaptismGuestbook: 'Φωτογράφηση πριν & ψηφιακό album ευχολόγιο', churchDrone: 'Drone στην εκκλησία', platinumAlbum: 'Album Platinum series', platinumCase: 'Platinum album case', woodenUsbCase: 'Wooden USB case', video4k: 'Παράδοση video σε 4K' };
  var isBaptismPage = !$('.included-option');

  var S = window.IMShare = { ready: false, token: token, successText: 'Οι αλλαγές σας στάλθηκαν με επιτυχία! Η ομάδα της Image Makers θα επικοινωνήσει μαζί σας για τις λεπτομέρειες.' };
  var submitBtn = $('#submitOffer'), resetBtn = $('#resetChoices');
  if (submitBtn) submitBtn.style.visibility = 'hidden';

  function banner(html, tone) {
    var old = $('#shareBanner'); if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'shareBanner';
    d.setAttribute('role', 'status');
    d.style.cssText = 'position:relative;z-index:5;margin:0 auto;max-width:1180px;padding:16px 22px;border-radius:18px;font:500 15px/1.5 Inter,system-ui,sans-serif;'
      + (tone === 'warn' ? 'background:#fff4e5;color:#7a4b00;border:1px solid #f3d29b' : 'background:#eef6f0;color:#1f4d2e;border:1px solid #cfe5d6');
    d.innerHTML = html;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'padding:18px 18px 0';
    wrap.appendChild(d);
    var main = $('main'); main.parentNode.insertBefore(wrap, main);
  }

  function setQty(id, v) {
    var i = $('#' + id); if (!i) return;
    v = Math.max(Number(i.dataset.min) || 0, Number(v) || 0);
    if (v > Number(i.dataset.max)) i.dataset.max = String(v); // π.χ. 5 μικρά album από το μαγαζί
    i.value = v;
    var o = $('#' + id + 'Output'); if (o) o.textContent = String(v);
  }
  function setPrints(v) { if (!v) return; $$('input[name="prints"]').forEach(function (r) { r.checked = r.value === v; }); }

  // επιλογές: από τον πελάτη (κλειδιά) ή από την προσφορά του μαγαζιού (ονόματα)
  function applyChoices(d) {
    var c = d.client, o = d.offer || {};
    if (isBaptismPage) {
      $$('.upgrade-option').forEach(function (i) { i.checked = c ? String((c.upgrades || {})[i.dataset.key]) === '1' : (o.adds || []).indexOf(ADD_B[i.dataset.key]) >= 0; });
      setQty('smallAlbums', c ? c.smallAlbums : (o.smallAlbums || 0));
    } else {
      $$('.included-option').forEach(function (i) { i.checked = c ? String((c.include || {})[i.dataset.key]) !== '0' : (o.removes || []).indexOf(INC[i.dataset.key]) < 0; });
      $$('.upgrade-option').forEach(function (i) { i.checked = c ? String((c.upgrades || {})[i.dataset.key]) === '1' : (o.adds || []).indexOf(ADD[i.dataset.key]) >= 0; });
      var albums = c ? c.smallAlbums : (o.smallAlbumCount != null ? o.smallAlbumCount : 3 - (Number(o.removeAlbums) || 0));
      setQty('smallAlbums', albums == null ? 3 : albums);
      setQty('extraHours', (c || o).extraHours || 0);
    }
    setQty('largeSpreads', (c || o).largeSpreads || 0);
    setQty('smallSpreads', (c || o).smallSpreads || 0);
    setPrints((c || o).prints);
  }

  function fillDetails(d) {
    var set = function (id, v) { var i = $('#' + id); if (i && v != null && v !== '') { i.value = String(v); } };
    set('partner1', d.name1); set('partner2', d.name2); set('phone1', d.phone); set('email', d.email);
    set('weddingDate', d.event_date); set('church', d.church); set('churchTime', (d.church_time || '').slice(0, 5));
    set('reception', d.reception); set('receptionTime', (d.reception_time || '').slice(0, 5));
    // τα στοιχεία είναι ήδη καταχωρημένα στο ραντεβού: εδώ αλλάζουν μόνο οι επιλογές του πακέτου
    $$('#weddingDetails input').forEach(function (i) { if (i.id !== 'privacyConsent') { i.disabled = true; i.required = false; } });
    // οι ώρες δεν συμπληρώνονται από τον πελάτη σε αυτή τη σελίδα
    ['churchTime', 'receptionTime'].forEach(function (id) { var i = $('#' + id); var f = i && i.closest('.field'); if (f) f.style.display = 'none'; });
    // η διαθεσιμότητα έχει ήδη συζητηθεί στο ραντεβού
    var lede = $('#details .section-lede'); if (lede) lede.textContent = 'Τα στοιχεία αυτά θα σταλούν μαζί με τις επιλογές του πακέτου, ώστε να επικοινωνήσουμε μαζί σας για τις λεπτομέρειες.';
    var note = $('.final-note'); if (note) note.textContent = 'Με την αποστολή, οι αλλαγές σας περνούν στην προσφορά σας και η ομάδα της Image Makers θα επικοινωνήσει μαζί σας για τις λεπτομέρειες.';
  }

  function lockAll() {
    $$('.included-option, .upgrade-option, input[name="prints"]').forEach(function (i) { i.disabled = true; });
    $$('.stepper button').forEach(function (b) { b.disabled = true; });
    if (submitBtn) submitBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  }

  S.adjust = function (state) {
    var delta = state.total - S.baseCatalog;
    state.total = S.agreed + delta;
    state.rows = [{ label: 'Η προσφορά σας από την παρουσίαση', value: S.agreed, kind: 'base' }]
      .concat(delta ? [{ label: 'Οι αλλαγές που κάνατε', value: delta, kind: delta > 0 ? 'plus' : 'minus' }] : []);
    return state;
  };
  S.request = function (body) {
    return { path: '/rest/v1/rpc/offer_update_by_token', payload: { p_token: token, p_selections: body.selections, p_total: body.client_total } };
  };
  S.errorText = function (m) {
    if (/locked/.test(m)) return 'Η κράτησή σας έχει ήδη προχωρήσει, οπότε οι αλλαγές γίνονται πλέον μόνο τηλεφωνικά. Καλέστε μας στο 2410 550361.';
    if (/too_fast/.test(m)) return 'Οι αλλαγές σας μόλις στάλθηκαν. Περιμένετε λίγα δευτερόλεπτα και δοκιμάστε ξανά.';
    if (/too_many/.test(m)) return 'Έχετε στείλει πολλές αλλαγές. Για οτιδήποτε άλλο καλέστε μας στο 2410 550361.';
    if (/link_invalid/.test(m)) return 'Ο σύνδεσμος δεν είναι πλέον ενεργός. Ζητήστε μας νέο στο 2410 550361.';
    return null;
  };

  var cfg = window.IM_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return;
  var headers = { 'Content-Type': 'application/json', apikey: cfg.SUPABASE_ANON_KEY };
  if (!/^sb_/.test(cfg.SUPABASE_ANON_KEY)) headers.Authorization = 'Bearer ' + cfg.SUPABASE_ANON_KEY;

  fetch(cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/offer_by_token', { method: 'POST', headers: headers, body: JSON.stringify({ p_token: token }) })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (d) {
      if (!d) {
        banner('<b>Ο σύνδεσμος δεν είναι πλέον ενεργός.</b> Μπορείτε να δείτε το βασικό πακέτο παρακάτω· για τη δική σας προσφορά ζητήστε μας νέο σύνδεσμο στο <b>2410 550361</b>.', 'warn');
        if (submitBtn) submitBtn.style.display = 'none';
        return;
      }
      fillDetails(d);
      applyChoices(d);
      S.initial = d;
      S.agreed = Number(d.total) || 0;
      S.baseCatalog = window.IMClient.calculateBase().total;
      S.ready = true;
      window.IMClient.update();
      var names = [d.name1, d.name2].filter(Boolean).join(' & ');
      var heroP = $('.hero-copy p'); if (heroP) heroP.textContent = 'Αυτή είναι η προσφορά που διαμορφώσαμε μαζί στο στούντιο. Μπορείτε να τη διαφοροποιήσετε ή να τη διαμορφώσετε εκ νέου και να πατήσετε ξανά «Αποστολή».';
      var hp = $('.hero-price strong'); if (hp) hp.textContent = money(S.agreed);
      var hs = $('.hero-price span'); if (hs) hs.textContent = 'η προσφορά σας · με Φ.Π.Α.';
      if (d.locked) {
        lockAll();
        banner('<b>' + esc(names) + '</b>, η κράτησή σας έχει προχωρήσει. Εδώ βλέπετε τις επιλογές σας· για οποιαδήποτε αλλαγή καλέστε μας στο <b>2410 550361</b>.', 'warn');
      } else {
        banner('<b>Καλώς ήρθατε, ' + esc(names) + '!</b> Εδώ είναι η προσφορά από το ραντεβού μας' + (d.appt_date ? ' στις <b>' + esc(fmtD(d.appt_date)) + '</b>' : '') + '. Μπορείτε να τη διαμορφώσετε εκ νέου και να πατήσετε «Αποστολή στην Image Makers».');
        if (submitBtn) { submitBtn.style.visibility = ''; }
        // επαναφορά = οι επιλογές του μαγαζιού (όχι το βασικό πακέτο)
        if (resetBtn) resetBtn.addEventListener('click', function (e) {
          e.stopImmediatePropagation();
          applyChoices(S.initial); window.IMClient.update();
        }, true);
        // μετά από αποστολή, κάθε νέα αλλαγή επιτρέπει νέα αποστολή
        document.addEventListener('change', function () { window.IMClient.allowResend(); });
        $$('.stepper button').forEach(function (b) { b.addEventListener('click', function () { window.IMClient.allowResend(); }); });
      }
    })
    .catch(function () {
      banner('Δεν φορτώθηκε η προσφορά σας. Ελέγξτε τη σύνδεσή σας και ανανεώστε τη σελίδα.', 'warn');
      if (submitBtn) submitBtn.style.display = 'none';
    });
})();
