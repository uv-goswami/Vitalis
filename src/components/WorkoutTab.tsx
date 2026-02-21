import { useState } from 'react';
import { WorkoutStore, WorkoutEntry } from '../lib/records';

const WORKOUT_TYPES = ['Running', 'Cycling', 'Swimming', 'Weight Training', 'Yoga', 'HIIT', 'Walking', 'Pilates', 'CrossFit', 'Boxing', 'Other'];

function useToast() {
  const [m, setM] = useState('');
  const [s, setS] = useState(false);
  const t = (msg: string) => { setM(msg); setS(true); setTimeout(() => setS(false), 2200); };
  return { m, s, t };
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="del-btn" onClick={onClick}>
      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}

export function WorkoutTab() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(WorkoutStore.getAll());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'Running', durationMin: 30, caloriesBurned: 0, notes: '' });
  
  const { m: toastMsg, s: toastShow, t: toast } = useToast();
  const wk = WorkoutStore.thisWeek();
  const wkMins = wk.reduce((s, w) => s + w.durationMin, 0);
  const wkCals = wk.reduce((s, w) => s + (w.caloriesBurned || 0), 0);

  const add = () => {
    WorkoutStore.add(form);
    setWorkouts(WorkoutStore.getAll());
    setShowAdd(false);
    setForm({ type: 'Running', durationMin: 30, caloriesBurned: 0, notes: '' });
    toast('Workout logged');
  };

  return (
    <div className="tab-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Workouts</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>Log Workout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[['Sessions', wk.length, 'this week', 'si-accent'], ['Minutes', wkMins, 'active', 'si-green'], ['Calories', wkCals, 'burned', 'si-orange']].map(([l, v, s, c]) => (
          <div key={l as string} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 4 }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span style={{ fontWeight: 600, fontSize: 14 }}>Weekly goal</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: wk.length >= 5 ? 'var(--success)' : 'var(--text2)' }}>{wk.length} / 5</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar pb-green" style={{ width: `${Math.min(wk.length / 5, 1) * 100}%` }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
          {wk.length >= 5 ? 'Weekly workout goal achieved!' : `${5 - wk.length} more session${5 - wk.length !== 1 ? 's' : ''} to reach your goal`}
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><svg viewBox="0 0 24 24" style={{ stroke: 'var(--text3)', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' }}><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h18M3 14.5h18" /></svg></div>
          <h3>No workouts yet</h3><p>Log your first workout to start tracking.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>Log Workout</button>
        </div>
      ) : (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>History</div>
          {workouts.map(w => (
            <div key={w.id} className="list-item">
              <div className="li-icon">
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'var(--text2)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}>
                  <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h18M3 14.5h18" />
                </svg>
              </div>
              <div className="li-body">
                <div className="li-title">{w.type}</div>
                <div className="li-sub">{w.durationMin}min{w.caloriesBurned ? ` · ${w.caloriesBurned} kcal` : ''}{w.notes ? ` · ${w.notes}` : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div className="li-right">{new Date(w.date).toLocaleDateString()}</div>
                <DelBtn onClick={() => { WorkoutStore.delete(w.id); setWorkouts(WorkoutStore.getAll()); }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <>
          <div className="sheet-bg" onClick={() => setShowAdd(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Log Workout</div>
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Type</label>
                <div className="chip-grid">
                  {WORKOUT_TYPES.map(t => (
                    <div key={t} className={`chip${form.type === t ? ' sel' : ''}`} onClick={() => setForm(f => ({ ...f, type: t }))}>{t}</div>
                  ))}
                </div>
              </div>
              <div className="form-grid form-grid-2">
                <div className="input-group">
                  <label className="input-label">Duration (min)</label>
                  <input className="input-field" type="number" min={1} value={form.durationMin} onChange={e => setForm(f => ({ ...f, durationMin: +e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Calories (optional)</label>
                  <input className="input-field" type="number" min={0} placeholder="0" value={form.caloriesBurned || ''} onChange={e => setForm(f => ({ ...f, caloriesBurned: +e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Notes</label>
                <textarea className="textarea-field" style={{ minHeight: 60 }} placeholder="How did it feel?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={add}>Save Workout</button>
            </div>
          </div>
        </>
      )}
      
      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}