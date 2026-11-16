// =====================================================================
//  «Άλλο» και «Task» στο ημερολόγιο
//  Άλλο: ελεύθερη καταχώρηση (τίτλος · προαιρετικά ώρα, τοποθεσία, σημειώσεις)
//  Task: ό,τι και το «Άλλο» + για ποιο άτομο είναι + «Ολοκληρώθηκε»
// =====================================================================
import { L, esc, icon, sheet, toast, toastErr, busy, confirmBox, actionSheet, infoBox, todayISO, fmtDate, fmtDateLong, fmtTime, normTime, timeInputAttrs } from '../core.js';
import { S, isAdmin, saveCalNote, deleteCalNote, setTaskDone, profileById } from '../data.js';

const isTask = (n) => n?.kind === 'task';
const personName = (id) => { const p = profileById(id); return p ? (p.full_name || p.username || '') : ''; };
export const taskFor = (n) => (isTask(n) && n.assignee_id ? personName(n.assignee_id) : '');
export const calNoteEmoji = (n) => (isTask(n) ? (n.done_at ? '✅' : '📋') : '📌');
export const calNoteTitle = (n) => [n.title, isTask(n) && taskFor(n) ? L(`για ${taskFor(n)}`, `for ${taskFor(n)}`) : '', n.location].filter(Boolean).join(' · ');
export const calNoteTip = (n) => [isTask(n) ? (n.done_at ? L('Task · ολοκληρώθηκε', 'Task · done') : 'Task') : '', n.title, isTask(n) && taskFor(n) ? L(`για ${taskFor(n)}`, `for ${taskFor(n)}`) : '', n.start_time ? fmtTime(n.start_time) : '', n.location, n.notes].filter(Boolean).join(' · ');

/** Τα μέλη της ομάδας που μπορούν να πάρουν task (ενεργά, με ρόλο) */
function teamOptions(selected) {
  const people = (S.profiles || []).filter((p) => p.active && p.role).sort((a, b) => (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '', 'el'));
  return `<option value="">${esc(L('— Επιλέξτε άτομο —', '— Choose a person —'))}</option>` + people.map((p) => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.full_name || p.username)}</option>`).join('');
}

export function openCalNoteSheet({ day = '', note = null, kind = 'note' } = {}) {
  if (!isAdmin()) return;
  const task = note ? isTask(note) : kind === 'task';
  const f = note ? { ...note, start_time: note.start_time ? String(note.start_time).slice(0, 5) : '' }
    : { day: day || todayISO(), start_time: '', title: '', location: '', notes: '', team_visible: true, kind: task ? 'task' : 'note', assignee_id: '' };
  const body = document.createElement('div');
  body.innerHTML = `<div class="form">
    <div class="field"><label>${esc(L('Τίτλος', 'Title'))} <span class="req">*</span></label><input class="input" name="title" maxlength="200" value="${esc(f.title)}" placeholder="${esc(task ? L('π.χ. Παραλαβή album από το τυπογραφείο', 'e.g. Pick up album from the printer') : L('π.χ. Συνάντηση ομάδας, Παραλαβή άλμπουμ', 'e.g. Team meeting, Album pickup'))}"></div>
    <div class="form-grid">
      <div class="field"><label>${esc(task ? L('Για πότε', 'When') : L('Ημερομηνία', 'Date'))}${task ? ' <span class="req">*</span>' : ''}</label><input class="input" type="date" name="day" value="${esc(f.day)}"></div>
      <div class="field"><label>${esc(L('Ώρα (προαιρετικά)', 'Time (optional)'))}</label><input class="input" name="start_time" ${timeInputAttrs} value="${esc(f.start_time)}" placeholder="${esc(L('π.χ. 10:00', 'e.g. 10:00'))}"></div>
    </div>
    <div class="field"><label>${esc(L('Τοποθεσία (προαιρετικά)', 'Location (optional)'))}</label><input class="input" name="location" maxlength="300" value="${esc(f.location || '')}"></div>
    <div class="field"><label>${esc(L('Σημειώσεις (προαιρετικά)', 'Notes (optional)'))}</label><textarea class="textarea" name="notes" style="min-height:70px">${esc(f.notes || '')}</textarea></div>
    ${task ? `<div class="field"><label>${esc(L('Για ποιο άτομο', 'For whom'))} <span class="req">*</span></label><select class="select" name="assignee_id">${teamOptions(f.assignee_id)}</select><div class="help">${esc(L('Το άτομο ειδοποιείται και βλέπει πάντα το task του, ακόμη κι αν είναι «μόνο διαχειριστές».', 'The person is notified and always sees their task, even if it is “admins only”.'))}</div></div>` : ''}
    <label class="check-row"><span class="switch"><input type="checkbox" name="team_visible" ${f.team_visible !== false ? 'checked' : ''}><span></span></span><span>${esc(L('Να το βλέπει όλη η ομάδα (αλλιώς μόνο οι διαχειριστές)', 'Visible to the whole team (otherwise admins only)'))}</span></label>
  </div>`;
  body.querySelectorAll('[name]').forEach((i) => i.addEventListener(i.type === 'checkbox' ? 'change' : (i.tagName === 'SELECT' ? 'change' : 'input'), () => { f[i.name] = i.type === 'checkbox' ? i.checked : i.value; i.classList.remove('invalid'); }));
  const title = note ? L('Επεξεργασία', 'Edit') : (task ? '📋 Task' : `📌 ${L('Άλλο', 'Other')}`);
  const s = sheet({ title, body, right: `<button class="btn plain" data-save><b>${esc(L('Αποθήκευση', 'Save'))}</b></button>` });
  s.root.querySelector('[data-save]').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    if (!String(f.title || '').trim()) { body.querySelector('[name=title]').classList.add('invalid'); return toastErr(L('Γράψτε τίτλο', 'Enter a title')); }
    if (task && !f.day) { body.querySelector('[name=day]').classList.add('invalid'); return toastErr(L('Διαλέξτε για πότε είναι', 'Choose when it is')); }
    if (task && !f.assignee_id) { body.querySelector('[name=assignee_id]').classList.add('invalid'); return toastErr(L('Διαλέξτε για ποιο άτομο είναι', 'Choose who it is for')); }
    if (!f.day) f.day = todayISO();
    let t = null;
    if (String(f.start_time || '').trim()) { t = normTime(f.start_time); if (!t) { body.querySelector('[name=start_time]').classList.add('invalid'); return toastErr(L('Γράψτε την ώρα ως ΩΩ:ΛΛ', 'Enter the time as HH:MM')); } }
    busy(btn, true);
    try {
      await saveCalNote({ id: note?.id, day: f.day, start_time: t, title: f.title, location: f.location, notes: f.notes, team_visible: f.team_visible !== false, kind: task ? 'task' : 'note', assignee_id: task ? f.assignee_id : null });
      toast(note ? L('Οι αλλαγές αποθηκεύτηκαν', 'Changes saved') : (task ? L('Το task προστέθηκε', 'Task added') : L('Προστέθηκε στο ημερολόγιο', 'Added to the calendar')),
        { body: `${f.title.trim()} · ${fmtDate(f.day)}${t ? ' ' + t : ''}${task ? ' · ' + L(`για ${personName(f.assignee_id)}`, `for ${personName(f.assignee_id)}`) : ''}` });
      s.close();
    } catch (e) { console.error(e); busy(btn, false); }
  });
}

export async function calNoteActions(n) {
  if (!n) return;
  const task = isTask(n);
  const head = `${calNoteEmoji(n)} ${n.title} · ${fmtDateLong(n.day)}${n.start_time ? ' · ' + fmtTime(n.start_time) : ''}`;
  const info = [task && taskFor(n) ? L(`Για: ${taskFor(n)}`, `For: ${taskFor(n)}`) : '', task && n.done_at ? L(`✓ Ολοκληρώθηκε ${fmtDate(n.done_at)}${n.done_by ? ' · ' + personName(n.done_by) : ''}`, `✓ Done ${fmtDate(n.done_at)}`) : '', n.location, n.notes].filter(Boolean);
  const mineTask = task && n.assignee_id && n.assignee_id === S.profile?.id;
  if (!isAdmin() && !mineTask) { infoBox(head, info.join('\n')); return; }
  const actions = [];
  if (task) actions.push(n.done_at ? { label: L('Δεν έχει ολοκληρωθεί', 'Mark as not done'), value: 'undone', icon: 'refresh' } : { label: L('Ολοκληρώθηκε ✓', 'Mark as done ✓'), value: 'done', icon: 'checkCircle' });
  if (isAdmin()) actions.push({ label: L('Επεξεργασία', 'Edit'), value: 'edit', icon: 'edit' }, { label: L('Διαγραφή', 'Delete'), value: 'del', icon: 'trash', destructive: true });
  const r = await actionSheet({ title: [head, ...info].join(' · '), actions });
  if (r === 'done' || r === 'undone') {
    try { await setTaskDone(n.id, r === 'done'); toast(r === 'done' ? L('Το task ολοκληρώθηκε', 'Task done') : L('Το task άνοιξε ξανά', 'Task reopened')); } catch (e) { console.error(e); }
  }
  if (r === 'edit') openCalNoteSheet({ note: n });
  if (r === 'del') {
    if (!await confirmBox(L('Διαγραφή;', 'Delete?'), head, { ok: L('Διαγραφή', 'Delete'), destructive: true })) return;
    try { await deleteCalNote(n.id); toast(L('Διαγράφηκε', 'Deleted')); } catch (e) { console.error(e); }
  }
}
void icon;
