// =====================================================================
//  Αρχική (v1.11.0)
//  Διαχειριστές: επόμενη εκδήλωση + Σήμερα · εβδομάδα (Δευ–Κυρ) · Χρειάζονται προσοχή + Ταμείο μήνα · η χρονιά με μια ματιά.
//  Συνεργείο: μόνο οι δικές τους εκδηλώσεις, χωρίς οικονομικά.
// =====================================================================
import { evEnd, fmtRange, isMultiDay, CATEGORIES, needsOffer, L, LANG, vocative, esc, icon, money, fmtDateLong, fmtTime, todayISO, daysBetween, sum, addDays, parseISO, monthShort, DOW_SHORT_EL, DOW_SHORT_EN } from '../core.js';
import { S, isAdmin, isVideoAdmin, allEventViews, profileName, myEventIds, pendingAppointments, staleAppointments, pendingMessages, pendingUsers, unreadCount, absenceWhen } from '../data.js';
import { wfLevel } from './workflow.js';
import { newAppointmentChooser, scheduledAppts, apptFor, apptName } from './appointments.js';
import { sessionRow, sessionActions, sessionTitle } from './sessions.js';
import { meetingRow, meetingActions, meetingTitle } from './meetings.js';
import { calNoteActions, calNoteTitle } from './calnotes.js';
import { absenceActions } from './absences.js';
import { pageHead } from '../layout.js';
import { eventRow } from '../components.js';
import { openIncomeForm, openExpenseForm } from './money.js';
import { pushState } from '../push.js';
import { fillWeather } from '../weather.js';
import { go } from '../layout.js';

const catLabel = (c) => { const o = CATEGORIES.find((x) => x.v === c); return o ? L(o.el, o.en).replace(/\s*\(.*\)$/, '') : ''; };
const MONTH_GEN = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
const MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthOf = (i) => L(MONTH_GEN[i], MONTH_EN[i]);
const mondayOf = (iso) => addDays(iso, -((parseISO(iso).getDay() + 6) % 7));
const hm = (t) => (t ? String(t).slice(0, 5) : '');
const shortName = (id) => (profileName(S.profiles.find((p) => p.id === id) || (id === S.profile?.id ? S.profile : null)) || '').split(' ')[0];
/** Τετράγωνο εικονίδιο με χρώμα (όπως οι γραμμές της εφαρμογής) */
const bub = (ic, color, cls = '') => `<span class="h-bub ${cls}" style="background:${color}">${icon(ic)}</span>`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

let weekOffset = 0; // ‹ › στην εβδομάδα (0 = τρέχουσα)

/** Όλα τα στοιχεία μιας ημέρας (εκδηλώσεις, ραντεβού, sessions, meetings, απουσίες, σημειώσεις) */
function dayItems(day, ctx) {
  const out = [];
  ctx.visible.forEach((v) => {
    if (v.e.event_date <= day && evEnd(v.e) >= day) {
      const multi = isMultiDay(v.e) && v.e.event_date !== day;
      out.push({ k: 'ev', t: multi ? '' : hm(v.e.event_time), cat: v.e.category, text: [catLabel(v.e.category), v.e.church_location].filter(Boolean).join(' · '), sub: v.title, href: `#/event/${v.e.id}`, ic: v.e.coverage === 'video' ? 'video' : 'camera' });
    }
  });
  if (ctx.admin) S.appointments.filter((a) => a.appt_date === day && a.appt_time && a.status === 'scheduled').forEach((a) => out.push({ k: 'appt', t: hm(a.appt_time), text: apptFor(a.category), sub: apptName(a), href: `#/appointment/${a.id}/edit`, ic: 'handshake' }));
  S.sessions.filter((x) => x.day === day && S.events.get(x.event_id)?.status !== 'cancelled' && (ctx.admin || ctx.mine.has(x.event_id))).forEach((x) => out.push({ k: 'sess', t: hm(x.start_time), text: sessionTitle(x), sub: S.events.get(x.event_id) ? '' : '', act: 'sess:' + x.id, ic: 'camera' }));
  S.meetings.filter((m) => m.day === day && (ctx.admin || (m.participants || []).includes(S.profile?.id))).forEach((m) => out.push({ k: 'meet', t: hm(m.start_time), text: meetingTitle(m), sub: L(`${(m.participants || []).length} άτομα`, `${(m.participants || []).length} people`), act: 'meet:' + m.id, ic: 'users' }));
  S.absences.filter((a) => a.day === day).forEach((a) => out.push({ k: 'abs', t: '', text: L(`Απουσία: ${shortName(a.user_id)}`, `Away: ${shortName(a.user_id)}`), sub: absenceWhen([a]), act: 'abs:' + a.id, ic: 'ban' }));
  S.calNotes.filter((n) => n.day === day).forEach((n) => out.push({ k: 'note', t: hm(n.start_time), text: calNoteTitle(n), sub: n.notes || '', act: 'note:' + n.id, ic: 'pin' }));
  return out.sort((a, b) => (a.k === 'abs') - (b.k === 'abs') || (a.t || '99').localeCompare(b.t || '99'));
}

/** Γραμμή στοιχείου μέσα στην κάρτα της ημέρας: εικονίδιο · τι · ποιος · ώρα */
function wkRow(x) {
  const cls = x.k === 'ev' ? `wk-ev cat-${x.cat}` : `wk-${x.k}`;
  const attrs = x.href ? `href="${x.href}"` : `href="#" data-act="${x.act}"`;
  const time = x.t || (x.k === 'abs' ? L('όλη μέρα', 'all day') : '');
  return `<a class="wk-row ${cls}" ${attrs}>${icon(x.ic)}<div class="main-col"><div class="t">${esc(x.text)}</div>${x.sub ? `<div class="s">${esc(x.sub)}</div>` : ''}</div>${time ? `<b>${esc(time)}</b>` : ''}</a>`;
}

/** Η εβδομάδα ως λίστα καρτών ανά ημέρα (3 στήλες στον υπολογιστή, 1 στο κινητό).
 *  Στην τρέχουσα εβδομάδα οι ημέρες που πέρασαν δεν εμφανίζονται. */
function weekList(monday, ctx, today, hidePast) {
  const dows = LANG === 'en' ? DOW_SHORT_EN : DOW_SHORT_EL;
  const out = [];
  let free = []; // συνεχόμενες ελεύθερες ημέρες → μία μικρή γραμμή
  const flush = () => {
    if (!free.length) return;
    const a = free[0], b = free[free.length - 1];
    const lab = (x) => `${dows[x.i]} ${parseISO(x.day).getDate()}`;
    const txt = free.length === 1 ? `${lab(a)}${a.tag}` : `${lab(a)} – ${lab(b)}`;
    out.push(`<div class="wk-card free ${free.length === 1 ? a.st : ''}"><div class="wk-dh">${esc(txt)}</div><span class="wk-free">${esc(free.length === 1 ? L('ελεύθερη', 'free') : L('ελεύθερες', 'free'))}</span></div>`);
    free = [];
  };
  let shown = 0, busy = 0;
  [...Array(7).keys()].forEach((i) => {
    const day = addDays(monday, i);
    if (hidePast && day < today) return;
    shown++;
    const items = dayItems(day, ctx);
    const st = day < today ? 'past' : day === today ? 'today' : day === addDays(today, 1) ? 'tomorrow' : '';
    const tag = st === 'today' ? ` · ${L('σήμερα', 'today')}` : st === 'tomorrow' ? ` · ${L('αύριο', 'tomorrow')}` : '';
    if (!items.length) {
      if (st === 'today') { flush(); free.push({ i, day, st, tag }); flush(); } else free.push({ i, day, st, tag });
      return;
    }
    flush(); busy++;
    out.push(`<div class="wk-card ${st}"><div class="wk-dh">${esc(dows[i])} ${parseISO(day).getDate()}${esc(tag)}</div>${items.map(wkRow).join('')}</div>`);
  });
  if (shown && !busy) return `<div class="wk-list"><div class="wk-card free wk-none">${icon('checkCircle')}<span>${esc(L('Δεν υπάρχει τίποτα προγραμματισμένο αυτή την εβδομάδα.', 'Nothing scheduled this week.'))}</span></div></div>`;
  flush();
  return `<div class="wk-list">${out.join('')}</div>`;
}
/** Η εβδομάδα με ώρες (υπολογιστής): μία στήλη ανά ημέρα, κάθε στοιχείο ένα χρωματιστό
 *  μπλοκ στην ώρα του. Ό,τι δεν έχει ώρα (απουσίες, σημειώσεις χωρίς ώρα, συνέχεια
 *  πολυήμερων) μπαίνει στη γραμμή «όλη μέρα» επάνω. Δεν υπάρχει ώρα λήξης στη βάση,
 *  οπότε η διάρκεια είναι ενδεικτική (εκδήλωση 3 ώρες, τα υπόλοιπα 1 ώρα). */
const DUR = { ev: 180, sess: 120, appt: 60, meet: 60, note: 60 };
const HPX = 42; // ύψος μίας ώρας σε pixels
const toMin = (t) => { const [a, b] = t.split(':').map(Number); return a * 60 + (b || 0); };
function weekHours(monday, ctx, today) {
  const dows = LANG === 'en' ? DOW_SHORT_EN : DOW_SHORT_EL;
  const days = [...Array(7).keys()].map((i) => { const day = addDays(monday, i); return { i, day, items: dayItems(day, ctx) }; });
  // Το πλέγμα ξεκινά στην πρώτη ώρα που έχει κάτι και τελειώνει εκεί που τελειώνει το τελευταίο
  // (τουλάχιστον 3 ώρες). Αν η εβδομάδα δεν έχει τίποτα με ώρα, μένει ένα χαμηλό πλαίσιο.
  let h0 = 24, h1 = 0;
  days.forEach((d) => d.items.forEach((x) => { if (!x.t) return; const m = toMin(x.t); h0 = Math.min(h0, Math.floor(m / 60)); h1 = Math.max(h1, Math.min(24, Math.ceil((m + DUR[x.k]) / 60))); }));
  const emptyWeek = h1 === 0;
  if (emptyWeek) { h0 = 9; h1 = 11; } // χαμηλό πλαίσιο, να μην πιάνει χώρο
  else if (h1 - h0 < 3) { h1 = Math.min(24, h0 + 3); h0 = h1 - 3; }
  const hours = [...Array(h1 - h0).keys()].map((k) => h0 + k);
  const attrs = (x) => (x.href ? `href="${x.href}"` : `href="#" data-act="${x.act}"`);
  const color = (x) => (x.k === 'ev' ? `var(--cat-${x.cat})` : `var(--wh-${x.k})`);
  const tip = (x) => esc([x.t, x.text, x.sub].filter(Boolean).join(' · '));
  const anyAllDay = days.some((d) => d.items.some((x) => !x.t));
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const cols = days.map((d) => {
    const st = d.day < today ? 'past' : d.day === today ? 'today' : '';
    const timed = d.items.filter((x) => x.t).map((x) => ({ x, s: toMin(x.t), e: Math.min(24 * 60, toMin(x.t) + DUR[x.k]) })).sort((a, b) => a.s - b.s);
    // επικαλύψεις: ομάδες που αλληλεπικαλύπτονται, και μέσα σε κάθε ομάδα «λωρίδες» δίπλα-δίπλα
    let group = [], groupEnd = -1;
    const flush = () => { const n = Math.max(...group.map((g) => g.lane)) + 1; group.forEach((g) => { g.n = n; }); group = []; };
    timed.forEach((b) => {
      if (group.length && b.s >= groupEnd) flush();
      const used = new Set(group.filter((g) => g.e > b.s).map((g) => g.lane));
      let lane = 0; while (used.has(lane)) lane++;
      b.lane = lane; group.push(b); groupEnd = Math.max(groupEnd, b.e);
    });
    if (group.length) flush();
    const blocks = timed.map((b) => {
      const top = ((b.s - h0 * 60) / 60) * HPX, hgt = Math.max(24, ((b.e - b.s) / 60) * HPX - 3);
      const cls = b.x.k === 'ev' || b.x.k === 'meet' || b.x.k === 'sess' ? 'solid' : `soft wh-${b.x.k}`;
      return `<a class="wh-blk ${cls}${hgt < 70 ? ' short' : ''}" ${attrs(b.x)} title="${tip(b.x)}" style="--c:${color(b.x)};top:${top}px;height:${hgt}px;left:calc(${(100 / b.n) * b.lane}% + 2px);width:calc(${100 / b.n}% - 4px)">
        <span class="wh-h">${icon(b.x.ic)}${esc(b.x.t)}</span><span class="wh-t">${esc(b.x.text)}</span>${b.x.sub ? `<span class="wh-s">${esc(b.x.sub)}</span>` : ''}</a>`;
    }).join('');
    const nowLine = d.day === today && nowMin >= h0 * 60 && nowMin <= h1 * 60 ? `<div class="wh-now" style="top:${((nowMin - h0 * 60) / 60) * HPX}px"></div>` : '';
    const allDay = d.items.filter((x) => !x.t).map((x) => `<a class="wh-chip ${x.k === 'ev' ? 'solid' : `soft wh-${x.k}`}" ${attrs(x)} title="${tip(x)}" style="--c:${color(x)}">${icon(x.ic)}<span>${esc(x.k === 'ev' ? (x.sub || x.text) : x.text)}</span></a>`).join('');
    return { st, d, allDay, body: `<div class="wh-col ${st}">${hours.map(() => '<div class="wh-cell"></div>').join('')}${blocks}${nowLine}</div>` };
  });
  const head = cols.map(({ st, d }) => `<div class="wh-dh ${st}"><span>${esc(dows[d.i])}</span><b>${parseISO(d.day).getDate()}</b></div>`).join('');
  const allRow = anyAllDay ? `<div class="wh-lab wh-alllab">${esc(L('όλη μέρα', 'all day'))}</div>${cols.map((c) => `<div class="wh-all ${c.st}">${c.allDay}</div>`).join('')}` : '';
  const emptyMsg = emptyWeek && !days.some((d) => d.items.length) ? `<div class="wh-emptymsg"><span class="wh-em">${icon('checkCircle')} ${esc(L('Δεν υπάρχει τίποτα προγραμματισμένο αυτή την εβδομάδα.', 'Nothing scheduled this week.'))}</span></div>` : '';
  return `<div class="wh-wrap ${emptyMsg ? 'is-empty' : ''}">${emptyMsg}<div class="wh-grid"><div></div>${head}${allRow}<div class="wh-hours">${hours.map((x) => `<div class="wh-lab">${String(x).padStart(2, '0')}:00</div>`).join('')}</div>${cols.map((c) => c.body).join('')}</div></div>`;
}
const rangeTxt = (monday) => {
  const a = parseISO(monday), b = parseISO(addDays(monday, 6));
  return a.getMonth() === b.getMonth() ? `${a.getDate()} – ${b.getDate()} ${monthOf(b.getMonth())}` : `${a.getDate()} ${monthOf(a.getMonth())} – ${b.getDate()} ${monthOf(b.getMonth())}`;
};

export function renderHome(root) {
  // νέα είσοδος στην αρχική (όχι ανανέωση της ίδιας σελίδας): πάντα στην τρέχουσα εβδομάδα
  if (!root.querySelector('.home-top')) weekOffset = 0;
  const admin = isAdmin();
  const today = todayISO();
  const h = new Date().getHours();
  const hello = h < 12 ? L('Καλημέρα', 'Good morning') : h < 18 ? L('Καλησπέρα', 'Good afternoon') : L('Καλό βράδυ', 'Good evening');
  const first = vocative(profileName(S.profile));
  const mine = myEventIds();
  const all = allEventViews({ includeCancelled: false });
  const visible = admin ? all : all.filter((v) => mine.has(v.e.id));
  const upcoming = visible.filter((v) => evEnd(v.e) >= today); // και όσες πολυήμερες είναι σε εξέλιξη
  const next = upcoming[0];
  const ctx = { admin, mine, visible };

  // ---------- Σήμερα + σύντομη περίληψη
  const todayList = dayItems(today, ctx);
  const thisMonday = mondayOf(today);
  const weekEvents = visible.filter((v) => v.e.event_date <= addDays(thisMonday, 6) && evEnd(v.e) >= thisMonday).length;
  const nAppt = todayList.filter((x) => x.k === 'appt').length, nMeet = todayList.filter((x) => x.k === 'meet').length, nEv = todayList.filter((x) => x.k === 'ev').length;
  const todayBits = [nEv && plural(nEv, L('εκδήλωση', 'event'), L('εκδηλώσεις', 'events')), nAppt && plural(nAppt, L('ραντεβού', 'appointment'), L('ραντεβού', 'appointments')), nMeet && plural(nMeet, 'meeting', 'meetings')].filter(Boolean);
  const sumLine = `${todayBits.length ? L(`Σήμερα έχετε <b>${todayBits.join('</b> και <b>')}</b>.`, `Today you have <b>${todayBits.join('</b> and <b>')}</b>.`) : L('Σήμερα δεν έχετε κάτι προγραμματισμένο.', 'Nothing scheduled for today.')} ${L(`Αυτή την εβδομάδα: <b>${plural(weekEvents, 'εκδήλωση', 'εκδηλώσεις')}</b>.`, `This week: <b>${plural(weekEvents, 'event', 'events')}</b>.`)}`;

  const actBtns = (cls) => admin ? `<div class="home-actions ${cls}">
      <button class="btn primary" data-act="newevent">${icon('plus')} ${esc(L('Εκδήλωση', 'Event'))}</button>
      <button class="btn h-act" data-act="appt" style="--hc:#8a6a00">${icon('handshake')} ${esc(L('Ραντεβού', 'Appointment'))}</button>
      <button class="btn h-act" data-act="income" style="--hc:var(--green)">${icon('incoming')} ${esc(L('Έσοδο', 'Income'))}</button>
      <button class="btn h-act" data-act="expense" style="--hc:var(--red)">${icon('outgoing')} ${esc(L('Έξοδο', 'Expense'))}</button>
    </div>` : '';
  let html = pageHead(`${hello}, ${first}`, { sub: `${icon('calendar')} ${esc(fmtDateLong(today))}`, actions: actBtns('desk') });
  html += `<div class="home-sum">${sumLine}</div>`;
  html += '<div id="banners"></div>';

  // ---------- Επόμενη εκδήλωση
  let hero = '';
  if (next) {
    const lastDay = addDays(next.e.event_date, 1);
    const group = upcoming.filter((v) => v.e.event_date <= lastDay);
    const d = daysBetween(today, next.e.event_date);
    const countTxt = d <= 0 ? L('σήμερα', 'today') : d === 1 ? L('αύριο', 'tomorrow') : '';
    // «σε 2 ημέρες» (ή «σήμερα» / «αύριο»)
    const count = `<div class="count">${d > 1 ? `<span>${esc(L('σε', 'in'))}</span>` : ''}<b>${d <= 1 ? '' : d}</b><span>${esc(countTxt || L('ημέρες', 'days'))}</span></div>`;
    const big = (v) => `${esc(catLabel(v.e.category))}${v.e.church_location ? ` · ${esc(v.e.church_location)}` : ''}`;
    const meta = (v, showDate) => `<div class="meta"><span>${icon('user')} ${esc(v.title)}</span>${showDate ? `<span>${icon('calendar')} ${esc(isMultiDay(v.e) ? fmtRange(v.e, true) : fmtDateLong(v.e.event_date))}</span>` : ''}<span>${icon('clock')} ${esc(v.e.event_time ? fmtTime(v.e.event_time) : L('ώρα: δεν γνωρίζουμε ακόμη', 'time: not known yet'))}</span></div>`;
    const pills = (v) => {
      const ph = v.crew.filter((c) => c.duty === 'photo').length, vd = v.crew.filter((c) => c.duty === 'video').length;
      const crewTxt = v.crew.length ? [ph && L(`${ph} φωτογράφ${ph === 1 ? 'ος' : 'οι'}`, `${ph} photo`), vd && L(`${vd} βίντεο`, `${vd} video`)].filter(Boolean).join(' · ') || L(`${v.crew.length} στο συνεργείο`, `${v.crew.length} crew`) : L('Χωρίς συνεργείο', 'No crew');
      const bits = [`<span class="hero-pill ${v.crew.length ? 'ok' : 'bad'}">${icon('users')} ${esc(crewTxt)}</span>`];
      if (admin && v.price) bits.push(v.fullyPaid ? `<span class="hero-pill ok">${icon('checkCircle')} ${esc(L('Εξοφλημένη', 'Paid'))}</span>` : `<span class="hero-pill warn">${icon('euro')} ${esc(L('Υπόλοιπο', 'Balance'))} ${esc(money(v.balance, { dec: 0 }))}</span>`);
      return `<div class="hero-pills">${bits.join('')}<span class="hero-open">${esc(L('Άνοιγμα', 'Open'))} ${icon('chevR')}</span></div>`;
    };
    const eyebrow = (n) => `<div class="eyebrow">${icon('events')} ${esc(n > 1 ? (admin ? L(`Επόμενες εκδηλώσεις · ${n}`, `Next events · ${n}`) : L(`Οι επόμενες εκδηλώσεις σου · ${n}`, `Your next events · ${n}`)) : (admin ? L('Επόμενη εκδήλωση', 'Next event') : L('Η επόμενη εκδήλωσή σου', 'Your next event')))}</div>`;
    if (group.length === 1) {
      hero = `<a class="hero-card" href="#/event/${next.e.id}"><div class="hero-top">${eyebrow(1)}${count}</div><h2>${big(next)}</h2>${meta(next, true)}<div class="hero-wx" data-wx="${next.e.id}" hidden></div>${pills(next)}</a>`;
    } else {
      let lastDate = '';
      const items = group.map((v) => {
        const head = v.e.event_date !== lastDate ? `<div class="hero-day">${icon('calendar')} ${esc(fmtDateLong(v.e.event_date))}</div>` : '';
        lastDate = v.e.event_date;
        return `${head}<a class="hero-item" href="#/event/${v.e.id}"><h3>${big(v)}</h3>${meta(v, isMultiDay(v.e))}<div class="hero-wx" data-wx="${v.e.id}" hidden></div>${pills(v)}</a>`;
      }).join('');
      hero = `<div class="hero-card multi"><div class="hero-top">${eyebrow(group.length)}${count}</div><div class="hero-list">${items}</div></div>`;
    }
  } else {
    hero = `<div class="hero-card"><div class="eyebrow">${icon('events')} Image Makers</div><h2>${esc(admin ? L('Δεν υπάρχουν προγραμματισμένες εκδηλώσεις', 'No upcoming events') : L('Δεν σου έχει ανατεθεί ακόμη εκδήλωση', 'No events assigned to you yet'))}</h2></div>`;
  }
  const TODAY_STYLE = { ev: ['var(--accent)', 'rgba(169,111,69,.1)'], appt: ['#e0a800', 'rgba(224,168,0,.16)'], meet: ['var(--purple)', 'rgba(142,91,214,.1)'], sess: ['var(--blue)', 'var(--blue-soft)'], abs: ['var(--red)', 'var(--red-soft)'], note: ['var(--label-2)', 'var(--fill-2)'] };
  const todayRow = (x) => {
    const [c, soft] = TODAY_STYLE[x.k];
    const attrs = x.href ? `href="${x.href}"` : `href="#" data-act="${x.act}"`;
    return `<a class="t-item" ${attrs} style="--soft:${soft}">${bub(x.ic, x.k === 'ev' ? `var(--cat-${x.cat})` : c)}<div class="main-col"><div class="t">${esc(x.text)}</div>${x.sub ? `<div class="s">${esc(x.sub)}</div>` : ''}</div><b class="t-time">${esc(x.t || (x.k === 'abs' ? L('όλη μέρα', 'all day') : ''))}</b></a>`;
  };
  const todayCard = `<div class="today-card"><div class="today-h">${icon('sun')} ${esc(L('Σήμερα', 'Today'))}</div>${todayList.map(todayRow).join('') || `<div class="today-empty">${icon('checkCircle')}<span>${esc(L('Δεν υπάρχει κάτι προγραμματισμένο για σήμερα.', 'Nothing scheduled for today.'))}</span></div>`}</div>`;
  html += `<div class="home-top">${hero}${todayCard}</div>`;

  // ---------- Εβδομάδα (Δευτέρα → Κυριακή) · την Κυριακή και η επόμενη από κάτω
  const monday = addDays(thisMonday, weekOffset * 7);
  const wkTitle = weekOffset === 0 ? L('Αυτή η εβδομάδα', 'This week') : weekOffset === 1 ? L('Επόμενη εβδομάδα', 'Next week') : weekOffset === -1 ? L('Προηγούμενη εβδομάδα', 'Last week') : L('Εβδομάδα', 'Week');
  html += `<div class="h-sec"><div class="h-sec-l">${bub('calendar', 'var(--accent)')}<h2>${esc(wkTitle)}</h2><span class="h-sec-sub">${esc(rangeTxt(monday))}</span></div>
    <div class="h-sec-r">${weekOffset !== 0 ? `<button class="btn small plain" data-wk="0">${esc(L('Σήμερα', 'Today'))}</button>` : ''}<button class="h-round" data-wk="-1" aria-label="${esc(L('Προηγούμενη εβδομάδα', 'Previous week'))}">${icon('chevL')}</button><button class="h-round" data-wk="1" aria-label="${esc(L('Επόμενη εβδομάδα', 'Next week'))}">${icon('chevR')}</button><a href="#/calendar" class="h-link">${esc(L('Ημερολόγιο', 'Calendar'))} ${icon('chevR')}</a></div></div>`;
  html += weekHours(monday, ctx, today) + weekList(monday, ctx, today, weekOffset === 0);
  if (admin) html += `<div class="home-mob-actions"><div class="h-sec"><div class="h-sec-l">${bub('plus', 'var(--accent)')}<h2>${esc(L('Γρήγορες ενέργειες', 'Quick actions'))}</h2></div></div>${actBtns('mob')}</div>`;

  if (admin) {
    // ---------- Χρειάζονται προσοχή
    const todo = [];
    scheduledAppts().filter((a) => a.appt_date === today).forEach((a) => todo.push({ h: `#/appointment/${a.id}/edit`, i: 'handshake', c: '#e0a800', y: true, t: L(`Σήμερα ${hm(a.appt_time)} ${apptFor(a.category).replace('Ραντεβού', 'ραντεβού')} · ${apptName(a)}`, `Today ${hm(a.appt_time)} ${apptFor(a.category).toLowerCase()} · ${apptName(a)}`), s: L('Πατήστε για την παρουσίαση της προσφοράς', 'Tap to present the offer') }));
    const sa = staleAppointments().length; if (sa) todo.push({ h: '#/appointments', i: 'handshake', c: 'var(--orange)', t: L(`${sa} ραντεβού χωρίς απάντηση πάνω από 10 ημέρες`, `${sa} appointments without an answer for 10+ days`), s: L('Ίσως αξίζει ένα τηλέφωνο', 'Maybe worth a call') });
    const pa = pendingAppointments().length - sa; if (pa > 0) todo.push({ h: '#/appointments', i: 'doc', c: 'var(--blue)', t: L(`${pa} προσφορές σε αναμονή απάντησης`, `${pa} offers waiting for an answer`), s: L('Ραντεβού που δεν έχουν κλείσει ακόμη', 'Not confirmed yet') });
    const wl = all.filter((v) => wfLevel(v.e, today).level === 'late').length; if (wl) todo.push({ h: '#/workflow', i: 'flow', c: 'var(--red)', t: L(`${wl} εργασίες με μεγάλη καθυστέρηση`, `${wl} jobs with a long delay`), s: L('Φωτογραφίες που περιμένουν πολύ σε ένα στάδιο', 'Photos stuck in one stage for long') });
    const pm = pendingMessages().length; if (pm) todo.push({ h: '#/outbox', i: 'message', c: 'var(--accent)', t: L(`${pm} μηνύματα προς πελάτες για αποστολή`, `${pm} client messages to send`), s: L('Έτοιμα, θέλουν μόνο ένα πάτημα', 'Ready, just one tap each') });
    // υπενθύμιση αντιγράφου ασφαλείας (το δωρεάν Supabase δεν κρατά αντίγραφα)
    const lb = S.settings.last_backup?.at ? new Date(S.settings.last_backup.at) : null;
    const lbDays = lb ? Math.floor((Date.now() - lb.getTime()) / 864e5) : null;
    if ((S.events.size || S.payments.length || S.appointments.length) && (lbDays === null || lbDays >= 30)) todo.push({ h: '#/settings', i: 'archive', c: 'var(--blue)', t: lbDays === null ? L('Κατεβάστε το πρώτο πλήρες αντίγραφο ασφαλείας', 'Download your first full backup') : L(`Τελευταίο αντίγραφο ασφαλείας πριν από ${lbDays} ημέρες`, `Last backup ${lbDays} days ago`), s: L('Ρυθμίσεις → Αντίγραφα ασφαλείας', 'Settings → Backups') });
    const pu = pendingUsers().length; if (pu) todo.push({ h: '#/team', i: 'shield', c: 'var(--purple)', t: L(`${pu} νέοι λογαριασμοί περιμένουν ρόλο`, `${pu} new accounts need a role`), s: L('Ομάδα → πατήστε πάνω τους', 'Team → tap on them') });
    if (isVideoAdmin()) {
      const sos = all.filter((v) => v.e.coverage !== 'photo' && ['lab', 'ready', 'delivered'].includes(v.e.photo_status) && v.e.editing_status !== 'done').length;
      if (sos) todo.push({ h: '#/sheets/mitsos', i: 'warning', c: 'var(--red)', t: L(`${sos} SOS στο Dimitris`, `${sos} SOS in Dimitris`), s: L('Το album πάει για εκτύπωση', 'The album is going to print') });
    }
    const noCrew = upcoming.filter((v) => daysBetween(today, v.e.event_date) <= 21 && !v.crew.length).length;
    if (noCrew) todo.push({ h: '#/events?filter=nocrew', i: 'users', c: 'var(--orange)', t: L(`${noCrew} εκδηλώσεις χωρίς συνεργείο`, `${noCrew} events without crew`), s: L('Τις επόμενες 3 εβδομάδες', 'In the next 3 weeks') });
    const overdue = all.filter((v) => v.e.event_date < today && v.price && v.balance > 0.009).length;
    if (overdue) todo.push({ h: '#/sheets/payments?unpaid=1', i: 'euro', c: 'var(--red)', t: L(`${overdue} περασμένες εκδηλώσεις με υπόλοιπο`, `${overdue} past events with a balance`), s: L('Πελάτες που χρωστούν ακόμη', 'Clients who still owe') });
    const noOffer = upcoming.filter((v) => !v.e.offer_path && needsOffer(v.e.category)).length;
    if (noOffer) todo.push({ h: '#/sheets/checks', i: 'doc', c: 'var(--label-2)', t: L(`${noOffer} μελλοντικές εκδηλώσεις χωρίς PDF προσφοράς`, `${noOffer} upcoming events without an offer PDF`), s: L('Ανεβάστε την προσφορά στην εκδήλωση', 'Upload the offer to the event') });
    const attn = `<div class="att-card"><div class="h-sec in">${`<div class="h-sec-l">${bub('warning', 'var(--orange)')}<h2>${esc(L('Χρειάζονται προσοχή', 'Needs attention'))}</h2>${todo.length ? `<span class="h-count">${todo.length}</span>` : ''}</div>`}</div>
      ${todo.length ? `<div class="att-list">${todo.map((x) => `<a class="att-row ${x.y ? 'yellow' : ''}" href="${x.h}">${bub(x.i, x.c)}<div class="main-col"><div class="t">${esc(x.t)}</div><div class="s">${esc(x.s)}</div></div>${icon('chevR', 'chev')}</a>`).join('')}</div>`
        : `<div class="today-empty">${icon('checkCircle')}<span>${esc(L('Όλα εντάξει! Δεν υπάρχει κάτι που χρειάζεται προσοχή.', 'All good! Nothing needs attention.'))}</span></div>`}</div>`;

    // ---------- Ταμείο μήνα
    const ym = today.slice(0, 7);
    const inM = sum(S.payments.filter((p) => (p.paid_on || '').startsWith(ym)), (p) => p.amount);
    const outM = sum(S.expenses.filter((x) => (x.paid_on || '').startsWith(ym)), (x) => x.amount);
    const months6 = [...Array(6).keys()].map((k) => { const d = parseISO(today); d.setDate(1); d.setMonth(d.getMonth() - (5 - k)); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; return { key, label: monthShort(d.getMonth()), v: sum(S.payments.filter((p) => (p.paid_on || '').startsWith(key)), (p) => p.amount) }; });
    const mx = Math.max(1, ...months6.map((m) => m.v));
    const net = inM - outM;
    const cash = `<a class="cash-card" href="#/money">
      <div class="cash-h"><span>${bub('wallet', 'var(--green)')}<b>${esc(L(`Ταμείο ${monthOf(parseISO(today).getMonth())}`, `${MONTH_EN[parseISO(today).getMonth()]} cash`))}</b></span>${icon('chevR', 'chev')}</div>
      <div class="cash-io">
        <div><small>${esc(L('Εισπράξεις', 'Income'))}</small><b class="pos">+${esc(money(inM, { dec: 0 }))}</b></div>
        <div><small>${esc(L('Έξοδα', 'Expenses'))}</small><b class="neg">−${esc(money(outM, { dec: 0 }))}</b></div>
      </div>
      <div class="cash-net ${net < 0 ? 'neg' : 'pos'}"><span>${icon('trending')} ${esc(L('Καθαρά αυτόν τον μήνα', 'Net this month'))}</span><b>${net < 0 ? '−' : ''}${esc(money(Math.abs(net), { dec: 0 }))}</b></div>
      <div class="cash-bars">${months6.map((m, i) => `<div title="${esc(`${m.label}: ${money(m.v, { dec: 0 })}`)}"><i style="height:${Math.max(4, Math.round((m.v / mx) * 100))}%" class="${i === 5 ? 'cur' : ''}"></i><span class="${i === 5 ? 'cur' : ''}">${esc(m.label)}</span></div>`).join('')}</div>
    </a>`;
    html += `<div class="home-two">${attn}${cash}</div>`;

    // ---------- Η χρονιά με μια ματιά (όπως η «Σύνοψη» των Φύλλων)
    const y = today.slice(0, 4);
    const yv = all.filter((v) => v.e.event_date.startsWith(y));
    const CAT_IC = { wedding: 'camera', baptism: 'camera', wedding_baptism: 'heart', promo: 'video', other: 'more' };
    const rows = CATEGORIES.map((c) => { const vs = yv.filter((v) => v.e.category === c.v); return { c, n: vs.length, value: sum(vs, (v) => v.price || 0), paid: sum(vs, (v) => v.paid), bal: sum(vs, (v) => Math.max(0, v.balance || 0)) }; });
    const tot = { n: yv.length, value: sum(rows, (r) => r.value), paid: sum(rows, (r) => r.paid), bal: sum(rows, (r) => r.bal) };
    const m0 = (v) => esc(money(v, { dec: 0 }));
    html += `<div class="year-card"><div class="h-sec in"><div class="h-sec-l">${bub('chart', 'var(--blue)')}<h2>${esc(L(`Η χρονιά ${y} με μια ματιά`, `${y} at a glance`))}</h2></div><div class="h-sec-r"><a href="#/sheets/summary" class="h-link">${esc(L('Πλήρης σύνοψη', 'Full summary'))} ${icon('chevR')}</a></div></div>
      <div class="year-wrap"><table class="year-tbl"><thead><tr><th>${esc(L('Κατηγορία', 'Category'))}</th><th>${esc(L('Πλήθος', 'Count'))}</th><th>${esc(L('Αξία πακέτων', 'Package value'))}</th><th>${esc(L('Εισπραχθέντα', 'Collected'))}</th><th>${esc(L('Υπόλοιπο', 'Balance'))}</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td><span class="yc">${bub(CAT_IC[r.c.v] || 'more', `var(--cat-${r.c.v})`, 'sm')}${esc(catLabel(r.c.v))}</span></td><td><b>${r.n}</b></td><td>${m0(r.value)}</td><td>${m0(r.paid)}</td><td class="${r.bal > 0.009 ? 'owe' : 'muted'}">${m0(r.bal)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td>${esc(L('Σύνολο', 'Total'))}</td><td>${tot.n}</td><td>${m0(tot.value)}</td><td>${m0(tot.paid)}</td><td class="${tot.bal > 0.009 ? 'owe' : ''}">${m0(tot.bal)}</td></tr></tfoot></table></div>
      <div class="year-note">${icon('help')} ${esc(L(`Οι αριθμοί αφορούν όλες τις εκδηλώσεις του ${y}, εκτός από τις ακυρωμένες.`, `All ${y} events, except cancelled ones.`))}</div></div>`;
  } else {
    const un = unreadCount();
    if (un) html += `<div class="list mt"><a class="row has-icon" href="#/notifications"><span class="row-icon" style="background:var(--blue)">${icon('bell')}</span><div class="main-col"><div class="t">${esc(L(`${un} νέες ειδοποιήσεις`, `${un} new notifications`))}</div></div>${icon('chevR', 'chev')}</a></div>`;
    // Το συνεργείο κρατά και τη λίστα με τις επόμενες εκδηλώσεις του
    const sess = S.sessions.filter((x) => x.day >= today && S.events.get(x.event_id)?.status !== 'cancelled' && mine.has(x.event_id));
    const list = [...upcoming.slice(0, 20).map((v) => ({ d: v.e.event_date, t: String(v.e.event_time || ''), v })), ...sess.map((x) => ({ d: x.day, t: String(x.start_time || ''), x })), ...S.meetings.filter((m) => m.day >= today && (m.participants || []).includes(S.profile?.id)).map((m) => ({ d: m.day, t: String(m.start_time), m }))]
      .sort((a, b) => a.d.localeCompare(b.d) || a.t.localeCompare(b.t)).slice(0, 24);
    html += `<div class="section-title"><h2>${esc(L('Οι επόμενες εκδηλώσεις μου', 'My upcoming events'))}</h2><a href="#/calendar" class="small">${esc(L('Ημερολόγιο', 'Calendar'))} ${icon('chevR')}</a></div>`;
    html += list.length ? `<div class="list">${list.map((it) => (it.m ? meetingRow(it.m) : it.x ? sessionRow(it.x) : eventRow(it.v, { money: false, crewType: true, typeFirst: true }))).join('')}</div>` : `<div class="card pad muted center">${esc(L('Καμία επερχόμενη εκδήλωση.', 'No upcoming events.'))}</div>`;
  }

  root.innerHTML = html;
  fillWeather(root, S.events, today);
  root.querySelectorAll('[data-meeting]').forEach((b) => b.addEventListener('click', () => meetingActions(S.meetings.find((m) => m.id === b.dataset.meeting))));
  const on = (k, fn) => root.querySelectorAll(`[data-act="${k}"]`).forEach((b) => b.addEventListener('click', fn));
  on('newevent', () => go('#/new-event'));
  on('appt', () => newAppointmentChooser());
  on('income', () => openIncomeForm({}));
  on('expense', () => openExpenseForm({}));
  root.querySelectorAll('[data-wk]').forEach((b) => b.addEventListener('click', () => { const n = Number(b.dataset.wk); weekOffset = n === 0 ? 0 : weekOffset + n; renderHome(root); }));
  // ενέργειες σε στοιχεία χωρίς δική τους σελίδα (meeting, απουσία, session, σημείωση)
  root.querySelectorAll('a[data-act*=":"]').forEach((a) => a.addEventListener('click', (ev) => {
    ev.preventDefault();
    const [k, id] = a.dataset.act.split(':');
    if (k === 'meet') meetingActions(S.meetings.find((m) => m.id === id));
    else if (k === 'abs') absenceActions(S.absences.find((x) => x.id === id));
    else if (k === 'sess') sessionActions(S.sessions.find((x) => x.id === id));
    else if (k === 'note') calNoteActions(S.calNotes.find((x) => x.id === id));
  }));

  // Banners: εγκατάσταση / ειδοποιήσεις
  (async () => {
    const b = root.querySelector('#banners'); if (!b) return;
    const st = await pushState().catch(() => 'unsupported');
    let out = '';
    if (st === 'ios-install') out += `<a class="banner" href="#/help/install">${icon('install')}<div><b>${esc(L('Προσθέστε την εφαρμογή στην οθόνη Αφετηρίας', 'Add the app to your Home Screen'))}</b><span>${esc(L('Στο iPhone οι ειδοποιήσεις λειτουργούν μόνο έτσι. Πατήστε για οδηγίες.', 'On iPhone, notifications only work this way. Tap for instructions.'))}</span></div></a>`;
    else if (st === 'default') out += `<a class="banner" href="#/settings">${icon('bell')}<div><b>${esc(L('Ενεργοποιήστε τις ειδοποιήσεις', 'Turn on notifications'))}</b><span>${esc(L('Για να μαθαίνετε αμέσως αναθέσεις, αλλαγές και πληρωμές.', 'To hear about assignments, changes and payments right away.'))}</span></div></a>`;
    else if (st === 'denied') out += `<a class="banner red" href="#/help/notifications">${icon('bell')}<div><b>${esc(L('Οι ειδοποιήσεις είναι μπλοκαρισμένες', 'Notifications are blocked'))}</b><span>${esc(L('Πατήστε για να δείτε πώς θα τις ξαναενεργοποιήσετε.', 'Tap to see how to turn them back on.'))}</span></div></a>`;
    else if (st === 'server-missing' && admin) out += `<a class="banner" href="#/settings">${icon('sparkles')}<div><b>${esc(L('Ολοκληρώστε τη ρύθμιση ειδοποιήσεων', 'Finish notification setup'))}</b><span>${esc(L('Ένα κλικ στις Ρυθμίσεις → Ειδοποιήσεις push για όλη την ομάδα.', 'One click in Settings → Push for the whole team.'))}</span></div></a>`;
    if (!S.online) out += `<div class="banner red">${icon('warning')}<div><b>${esc(L('Χωρίς σύνδεση', 'Offline'))}</b><span>${esc(L('Βλέπετε τα τελευταία αποθηκευμένα δεδομένα.', 'You are seeing the last saved data.'))}</span></div></div>`;
    b.innerHTML = out;
  })();
}
