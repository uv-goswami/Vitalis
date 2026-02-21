import { useState } from 'react';
import { DailyStore, GoalStore, PeriodStore, UserProfile, GoalEntry, PeriodEntry } from '../lib/records';
import { validateHealthInput } from '../lib/format';

interface Props {
  profile: UserProfile;
}

const MOODS = [
  { val: 1, face: '😞', lbl: 'Awful' },
  { val: 2, face: '😟', lbl: 'Low' },
  { val: 3, face: '😐', lbl: 'Okay' },
  { val: 4, face: '😊', lbl: 'Good' },
  { val: 5, face: '😄', lbl: 'Great' }
];

const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Back pain', 'Nausea', 'Insomnia', 'Tender breasts', 'Acne'];

function useToast() {
  const [m, setM] = useState('');
  const [show, setShow] = useState(false);
  const toast = (msg: string) => { setM(msg); setShow(true); setTimeout(() => setShow(false), 2200); };
  return { m, show, toast };
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="del-btn" onClick={onClick}>
      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>
    </button>
  );
}

export function HealthTab({ profile }: Props) {
  const [daily, setDaily] = useState(() => DailyStore.getToday() || { waterMl: 0, steps: 0, sleepHours: 0, mood: 3 as 1|2|3|4|5, moodNote: '', energyLevel: 3 as 1|2|3|4|5 });
  const [goals, setGoals] = useState<GoalEntry[]>(GoalStore.getAll());
  const [periods, setPeriods] = useState<PeriodEntry[]>(PeriodStore.getAll());
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddPeriod, setShowAddPeriod] = useState(false);

  // FIXED: Explicitly defined union types instead of `as const`
  const [newGoal, setNewGoal] = useState({ title: '', category: 'fitness', target: 1, unit: '', current: 0 });
  const [newPeriod, setNewPeriod] = useState({ 
    startDate: new Date().toISOString().slice(0, 10), 
    flow: 'medium' as 'light' | 'medium' | 'heavy', 
    symptoms: [] as string[], 
    notes: '' 
  });

  const { m: toastMsg, show: toastShow, toast } = useToast();
  const isFemale = profile.gender === 'female';

  const updateDaily = (partial: any) => {
    const updated = { ...daily, ...partial } as any;
    setDaily(updated);
    DailyStore.upsertToday(partial);
    toast('Saved');
  };

  const addWater = (ml: number) => {
    const next = (daily.waterMl || 0) + ml;
    const err = validateHealthInput('water', next);
    if (err) { toast(err); return; }
    updateDaily({ waterMl: next });
  };

  const lastPeriod = PeriodStore.lastPeriod();
  const avgCycle = PeriodStore.avgCycle();
  const daysAgo = lastPeriod ? Math.floor((Date.now() - new Date(lastPeriod.startDate).getTime()) / 86400_000) : null;
  const nextDate = lastPeriod ? new Date(new Date(lastPeriod.startDate).getTime() + avgCycle * 86400_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  const calendarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 7 + i); 
    return d;
  });

  const CheckIcon = () => <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: 'white', fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}><polyline points="20 6 9 17 4 12" /></svg>;

  return (
    <div className="tab-scroll">
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Today's Health</div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="stat-icon-wrap si-blue" style={{ width: 30, height: 30 }}>
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Water Intake</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#38bdf8' }}>{(daily.waterMl / 1000).toFixed(1)}L</span>
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-bar pb-blue" style={{ width: `${Math.min(daily.waterMl / 2000, 1) * 100}%` }} />
        </div>
        <div className="water-btns">
          {[150, 250, 350, 500].map(ml => (
            <button key={ml} className="water-btn" onClick={() => addWater(ml)}>+{ml}ml</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="input-field" type="number" placeholder="Custom (ml)"
            style={{ flex: 1 }} min={0}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const v = +(e.currentTarget.value);
                if (v > 0) { addWater(v); e.currentTarget.value = ''; }
              }
            }} />
          <button className="btn btn-secondary btn-sm" onClick={() => updateDaily({ waterMl: 0 })}>Reset</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="stat-icon-wrap si-green" style={{ width: 30, height: 30 }}>
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Steps</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#34d399' }}>{daily.steps.toLocaleString()}</span>
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-bar pb-green" style={{ width: `${Math.min(daily.steps / 10000, 1) * 100}%` }} />
        </div>
        <div className="stepper">
          <button className="step-btn" onClick={() => updateDaily({ steps: Math.max(0, daily.steps - 500) })}>−</button>
          <input className="input-field stepper-val" type="number" value={daily.steps}
            style={{ textAlign: 'center', fontSize: 18, fontWeight: 700 }}
            onChange={e => {
              const v = +e.target.value;
              if (!validateHealthInput('steps', v) && v >= 0) updateDaily({ steps: v });
            }} />
          <button className="step-btn" onClick={() => updateDaily({ steps: daily.steps + 500 })}>+</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="stat-icon-wrap si-purple" style={{ width: 30, height: 30 }}>
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Sleep</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa' }}>{daily.sleepHours}h</span>
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-bar pb-purple" style={{ width: `${Math.min(daily.sleepHours / 8, 1) * 100}%` }} />
        </div>
        <div className="stepper">
          <button className="step-btn" onClick={() => updateDaily({ sleepHours: Math.max(0, daily.sleepHours - 0.5) })}>−</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{daily.sleepHours}h</div>
          <button className="step-btn" onClick={() => updateDaily({ sleepHours: Math.min(24, daily.sleepHours + 0.5) })}>+</button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>How are you feeling today?</div>
        <div className="mood-row">
          {MOODS.map(m => (
            <button key={m.val} className={`mood-btn${daily.mood === m.val ? ' sel' : ''}`} onClick={() => updateDaily({ mood: m.val as any })}>
              <span className="mood-face">{m.face}</span>
              <span className="mood-lbl">{m.lbl}</span>
            </button>
          ))}
        </div>
        <input className="input-field" style={{ marginTop: 10 }} placeholder="Add a note (optional)"
          value={daily.moodNote} onChange={e => setDaily(d => ({ ...d, moodNote: e.target.value }))}
          onBlur={() => updateDaily({ moodNote: daily.moodNote })} />
      </div>

      {isFemale && (
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Cycle Tracker</span>
            <button className="btn btn-secondary btn-xs" onClick={() => setShowAddPeriod(true)}>Log period</button>
          </div>

          {lastPeriod ? (
            <>
              <div className="cycle-stats" style={{ marginBottom: 16 }}>
                <div className="cycle-stat">
                  <div className="cycle-num" style={{ color: 'var(--danger)' }}>{daysAgo}</div>
                  <div className="cycle-lbl">Day of Cycle</div>
                </div>
                <div className="cycle-stat">
                  <div className="cycle-num" style={{ color: 'var(--accent)' }}>{avgCycle}</div>
                  <div className="cycle-lbl">Avg cycle</div>
                </div>
                <div className="cycle-stat">
                  <div className="cycle-num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{nextDate}</div>
                  <div className="cycle-lbl">Next est.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }} className="hide-scroll">
                {calendarDays.map((d, i) => {
                  const ms = d.getTime();
                  const isToday = d.toDateString() === new Date().toDateString();
                  let isPeriod = false;
                  let isOvulation = false;

                  if (lastPeriod) {
                    const startMs = new Date(lastPeriod.startDate).getTime();
                    const diffDays = Math.floor((ms - startMs) / 86400_000);
                    if (diffDays >= 0 && diffDays <= 4) isPeriod = true;
                    if (diffDays === avgCycle - 14) isOvulation = true;
                  }

                  let bg = 'var(--card2)';
                  let color = 'var(--text)';
                  if (isPeriod) { bg = 'rgba(239,68,68,0.2)'; color = 'var(--danger)'; }
                  if (isOvulation) { bg = 'rgba(16,185,129,0.2)'; color = 'var(--success)'; }

                  return (
                    <div key={i} style={{
                      minWidth: 45, padding: '8px 4px', borderRadius: 12, background: bg, color: color,
                      border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{d.getDate()}</div>
                      {isOvulation && <div style={{ fontSize: 9, marginTop: 2, fontWeight: 700 }}>Ovul</div>}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 12 }}>
                {periods.slice(0, 3).map(p => (
                  <div key={p.id} className="list-item">
                    <div className="li-icon">
                      <svg viewBox="0 0 24 24" style={{ stroke: 'var(--accent2)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" />
                      </svg>
                    </div>
                    <div className="li-body">
                      <div className="li-title">{new Date(p.startDate).toLocaleDateString()} · {p.flow} flow</div>
                      {p.symptoms.length > 0 && <div className="li-sub">{p.symptoms.join(', ')}</div>}
                    </div>
                    <DelBtn onClick={() => {
                      PeriodStore.delete(p.id);
                      setPeriods(PeriodStore.getAll());
                    }} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: '20px 0' }}>
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 2, strokeLinecap: 'round' }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" /></svg>
              </div>
              <p>Log your first period to start cycle tracking</p>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span style={{ fontWeight: 600, fontSize: 14 }}>Weekly Goals</span>
          <button className="btn btn-secondary btn-xs" onClick={() => setShowAddGoal(true)}>Add goal</button>
        </div>
        {goals.length === 0 ? (
          <div className="empty" style={{ padding: '16px 0' }}>
            <div className="empty-icon"><svg viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 2, strokeLinecap: 'round' }}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg></div>
            <p>No goals yet. Add a weekly goal to track your progress.</p>
          </div>
        ) : goals.map(g => (
          <div key={g.id} className="goal-item">
            <div className="goal-row">
              <div className={`goal-check${g.completed ? ' done' : ''}`} onClick={() => { GoalStore.update(g.id, { completed: !g.completed }); setGoals(GoalStore.getAll()); }}>
                {g.completed && <CheckIcon />}
              </div>
              <div style={{ flex: 1 }}>
                <div className={`goal-title${g.completed ? ' done' : ''}`}>{g.title}</div>
                <div className="goal-meta">{g.current}/{g.target} {g.unit}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button className="step-btn" style={{ width: 28, height: 28, borderRadius: 7, fontSize: 14 }} onClick={() => {
                  GoalStore.update(g.id, { current: Math.max(0, g.current - 1) });
                  setGoals(GoalStore.getAll());
                }}>−</button>
                <button className="step-btn" style={{ width: 28, height: 28, borderRadius: 7, fontSize: 14 }} onClick={() => {
                  GoalStore.update(g.id, { current: Math.min(g.current + 1, g.target), completed: g.current + 1 >= g.target });
                  setGoals(GoalStore.getAll());
                }}>+</button>
                <DelBtn onClick={() => {
                  GoalStore.delete(g.id);
                  setGoals(GoalStore.getAll());
                }} />
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-bar pb-green" style={{ width: `${Math.min(g.current / g.target, 1) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {showAddGoal && (
        <><div className="sheet-bg" onClick={() => setShowAddGoal(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Add Weekly Goal</div>
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="input-group"><label className="input-label">Goal</label><input className="input-field" placeholder="e.g. Workout 5 times" value={newGoal.title} onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))} /></div>
              <div className="form-grid form-grid-2">
                <div className="input-group"><label className="input-label">Target</label><input className="input-field" type="number" min={1} value={newGoal.target} onChange={e => setNewGoal(g => ({ ...g, target: +e.target.value }))} /></div>
                <div className="input-group"><label className="input-label">Unit</label><input className="input-field" placeholder="sessions, km…" value={newGoal.unit} onChange={e => setNewGoal(g => ({ ...g, unit: e.target.value }))} /></div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                if (!newGoal.title.trim()) return;
                GoalStore.add({ ...newGoal, completed: false }); setGoals(GoalStore.getAll()); setShowAddGoal(false); setNewGoal({ title: '', category: 'fitness', target: 1, unit: '', current: 0 }); toast('Goal added');
              }}>
                Add Goal
              </button>
            </div>
          </div></>
      )}

      {showAddPeriod && (
        <><div className="sheet-bg" onClick={() => setShowAddPeriod(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Log Period</div>
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="input-group"><label className="input-label">Start Date</label><input className="input-field" type="date" value={newPeriod.startDate} onChange={e => setNewPeriod(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="input-group"><label className="input-label">Flow</label>
                <div className="seg-ctrl">{(['light', 'medium', 'heavy'] as const).map(f => <div key={f} className={`seg-opt${newPeriod.flow === f ? ' active' : ''}`} onClick={() => setNewPeriod(p => ({ ...p, flow: f }))}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>)}</div>
              </div>
              <div className="input-group"><label className="input-label">Symptoms</label>
                <div className="chip-grid">{SYMPTOMS.map(s => <div key={s} className={`chip${newPeriod.symptoms.includes(s) ? ' sel' : ''}`} onClick={() => setNewPeriod(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }))}>{s}</div>)}</div>
              </div>
              <div className="input-group"><label className="input-label">Notes</label><textarea className="textarea-field" placeholder="Any notes…" value={newPeriod.notes} onChange={e => setNewPeriod(p => ({ ...p, notes: e.target.value }))} /></div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                PeriodStore.add(newPeriod);
                setPeriods(PeriodStore.getAll()); setShowAddPeriod(false); toast('Period logged');
              }}>Save</button>
            </div>
          </div></>
      )}

      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}