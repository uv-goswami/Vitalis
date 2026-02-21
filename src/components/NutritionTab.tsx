import { useState } from 'react';
import { MealStore, MealEntry } from '../lib/records';

function useToast() {
  const [m, setM] = useState('');
  const [s, setS] = useState(false);
  const t = (msg: string) => { setM(msg); setS(true); setTimeout(() => setS(false), 2200); };
  return { m, s, t };
}

export function NutritionTab() {
  const [meals, setMeals] = useState<MealEntry[]>(MealStore.getAll());
  const [showAdd, setShowAdd] = useState(false);
  
  // FIXED: Explicitly typed the meal type union so TS allows state changes
  const [form, setForm] = useState({ 
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack', 
    foods: '', 
    calories: 0, 
    protein: 0, 
    notes: '' 
  });
  
  const { m: toastMsg, s: toastShow, t: toast } = useToast();
  const today = new Date().toDateString();
  const todayMeals = meals.filter(m => new Date(m.date).toDateString() === today);
  
  const todayCals = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProt = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
  
  const GOAL_C = 2000, GOAL_P = 120;
  const mealTypeColors: Record<string, string> = { breakfast: '#fb923c', lunch: '#34d399', dinner: '#818cf8', snack: '#38bdf8' };

  const add = () => {
    if (!form.foods.trim()) { toast('Please enter what you ate'); return; }
    MealStore.add(form);
    setMeals(MealStore.getAll());
    setShowAdd(false);
    setForm({ mealType: 'breakfast', foods: '', calories: 0, protein: 0, notes: '' });
    toast('Meal logged');
  };

  return (
    <div className="tab-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Nutrition</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>Log Meal</button>
      </div>

      <div className="card score-card" style={{ background: 'var(--grad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Calories Today</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>{todayCals}</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>of {GOAL_C} kcal goal</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Protein</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>{todayProt}<span style={{ fontSize: 18, fontWeight: 500 }}>g</span></div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>of {GOAL_P}g goal</div>
          </div>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(todayCals / GOAL_C, 1) * 100}%`, background: 'rgba(255,255,255,0.85)', borderRadius: 100, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          {GOAL_C - todayCals > 0 ? `${GOAL_C - todayCals} kcal remaining` : `${todayCals - GOAL_C} kcal over goal`}
        </div>
      </div>

      {todayMeals.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Today</div>
          {todayMeals.map(m => (
            <div key={m.id} className="list-item">
              <div className="li-icon" style={{ background: `${mealTypeColors[m.mealType]}15`, borderColor: `${mealTypeColors[m.mealType]}30` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: mealTypeColors[m.mealType] }} />
              </div>
              <div className="li-body">
                <div className="li-title">{m.foods}</div>
                <div className="li-sub">{m.mealType.charAt(0).toUpperCase() + m.mealType.slice(1)}{m.calories ? ` · ${m.calories} kcal` : ''}{m.protein ? ` · ${m.protein}g protein` : ''}</div>
              </div>
              <button className="del-btn" onClick={() => { MealStore.delete(m.id); setMeals(MealStore.getAll()); }}>
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {meals.length === 0 && (
        <div className="empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" style={{ stroke: 'var(--text3)', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' }}>
              <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <h3>No meals logged</h3><p>Track your nutrition to get personalized advice.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>Log First Meal</button>
        </div>
      )}

      {showAdd && (
        <>
          <div className="sheet-bg" onClick={() => setShowAdd(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Log Meal</div>
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Meal type</label>
                <div className="seg-ctrl">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(t => (
                    <div key={t} className={`seg-opt${form.mealType === t ? ' active' : ''}`} style={{ fontSize: 12 }} onClick={() => setForm(f => ({ ...f, mealType: t }))}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">What did you eat?</label>
                <textarea className="textarea-field" style={{ minHeight: 64 }} placeholder="Oatmeal, banana, coffee…" value={form.foods} onChange={e => setForm(f => ({ ...f, foods: e.target.value }))} />
              </div>
              <div className="form-grid form-grid-2">
                <div className="input-group">
                  <label className="input-label">Calories (kcal)</label>
                  <input className="input-field" type="number" min={0} placeholder="0" value={form.calories || ''} onChange={e => setForm(f => ({ ...f, calories: +e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Protein (g)</label>
                  <input className="input-field" type="number" min={0} placeholder="0" value={form.protein || ''} onChange={e => setForm(f => ({ ...f, protein: +e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={add}>Save Meal</button>
            </div>
          </div>
        </>
      )}

      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}