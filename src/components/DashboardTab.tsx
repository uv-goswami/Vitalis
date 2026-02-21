import { useState, useEffect } from 'react';
import { DailyStore, WorkoutStore, GoalStore, ProfileStore, DailyLog, GoalEntry } from '../lib/records';
import { getInstantTip } from '../lib/format';

type Tab = 'home' | 'coach' | 'health' | 'workout' | 'nutrition' | 'profile';

interface Props {
  onNav: (t: Tab) => void;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function dateStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const MOODS = ['😞', '😟', '😐', '😊', '😄'];

export function DashboardTab({ onNav }: Props) {
  const [daily, setDaily] = useState<DailyLog | null>(DailyStore.getToday());
  const [goals, setGoals] = useState<GoalEntry[]>(GoalStore.getAll());
  const [weekWk, setWeekWk] = useState(WorkoutStore.thisWeek());
  const [tip, setTip] = useState('');
  const profile = ProfileStore.get();

  const refresh = () => {
    const d = DailyStore.getToday();
    setDaily(d);
    setTip(getInstantTip({ waterMl: d?.waterMl, steps: d?.steps, sleepHours: d?.sleepHours, mood: d?.mood }));
    setGoals(GoalStore.getAll());
    setWeekWk(WorkoutStore.thisWeek());
  };

  useEffect(() => {
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const water = daily?.waterMl || 0;
  const steps = daily?.steps || 0;
  const sleep = daily?.sleepHours || 0;
  const mood = daily?.mood || 3;

  const waterPct = Math.min(water / 2000, 1);
  const stepsPct = Math.min(steps / 10000, 1);
  const sleepPct = Math.min(sleep / 8, 1);
  const score = Math.round(((waterPct + stepsPct + sleepPct) / 3) * 100);

  const completedGoals = goals.filter(g => g.completed).length;
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
  });

  const workoutDates = new Set(weekWk.map(w => new Date(w.date).toDateString()));

  const CheckSvg = () => <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, stroke: 'white', fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}><polyline points="20 6 9 17 4 12" /></svg>;

  return (
    <div className="tab-scroll">
      <div>
        <div className="dash-greeting-date">{dateStr()}</div>
        <div className="dash-greeting" style={{ fontSize: 24, fontWeight: 700 }}>{greeting()}, {profile.name || 'there'} {MOODS[mood - 1]}</div>
      </div>

      {tip && (
        <div className="insight-card" onClick={() => onNav('coach')} style={{ cursor: 'pointer', width: '100%' }}>
          <div className="insight-dot-wrap">
            <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: 'var(--accent2)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          {}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="insight-label">VitalAI Insight</div>
            <div className="insight-text">{tip}</div>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="card stat-card" onClick={() => onNav('health')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Water</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 3, color: '#38bdf8' }}>{(water / 1000).toFixed(1)}L</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>of 2L goal</div>
            </div>
            <div className="stat-icon-wrap si-blue">
              <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>
            </div>
          </div>
          <div className="progress-track"><div className="progress-bar pb-blue" style={{ width: `${waterPct * 100}%` }} /></div>
        </div>

        <div className="card stat-card" onClick={() => onNav('health')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Steps</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 3, color: '#34d399' }}>{steps.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>of 10k goal</div>
            </div>
            <div className="stat-icon-wrap si-green">
              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
          </div>
          <div className="progress-track"><div className="progress-bar pb-green" style={{ width: `${stepsPct * 100}%` }} /></div>
        </div>

        <div className="card stat-card" onClick={() => onNav('health')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sleep</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 3, color: '#a78bfa' }}>{sleep}h</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>of 8h goal</div>
            </div>
            <div className="stat-icon-wrap si-purple">
              <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            </div>
          </div>
          <div className="progress-track"><div className="progress-bar pb-purple" style={{ width: `${sleepPct * 100}%` }} /></div>
        </div>

        <div className="card stat-card" onClick={() => onNav('workout')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workouts</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 3, color: '#fb923c' }}>{weekWk.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>this week</div>
            </div>
            <div className="stat-icon-wrap si-orange">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
          </div>
          <div className="progress-track"><div className="progress-bar pb-warn" style={{ width: `${Math.min(weekWk.length / 5, 1) * 100}%` }} /></div>
        </div>
      </div>

      <div className="card score-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today's Score</div>
            <div className="score-num">{score}</div>
            <div className="score-tag">
              {score >= 80 ? 'Outstanding performance' : score >= 50 ? 'Good progress today' : 'Keep building momentum'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goals</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{completedGoals}/{goals.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>completed</div>
          </div>
        </div>
        <div className="score-track">
          <div className="score-fill" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-label">Weekly Activity</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{weekWk.length} / 5 sessions</span>
        </div>
        <div className="week-row">
          {days7.map((d, i) => {
            const lbl = d.toLocaleDateString('en-US', { weekday: 'narrow' });
            const isToday = d.toDateString() === new Date().toDateString();
            const done = workoutDates.has(d.toDateString());

            return (
              <div key={i} className="week-cell">
                <div className="week-lbl" style={isToday ? { color: 'var(--accent)' } : {}}>{lbl}</div>
                <div className={`week-dot ${done ? 'done' : isToday ? 'active' : ''}`}>
                  {done ? <CheckSvg /> : isToday ? <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-label" style={{ marginBottom: 12 }}>Quick Log</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => onNav('health')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>
            Log Water
          </button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => onNav('health')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            Log Steps
          </button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => onNav('workout')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h18M3 14.5h18" /></svg>
            Log Workout
          </button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => onNav('nutrition')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
            Log Meal
          </button>
        </div>
      </div>
    </div>
  );
}