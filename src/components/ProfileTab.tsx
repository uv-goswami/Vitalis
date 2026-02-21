import { useState } from 'react';
import { ProfileStore, UserProfile } from '../lib/records';
import { switchAIModel } from '../hooks/useModelLoader';

interface Props {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
}

function useToast() {
  const [m, setM] = useState('');
  const [s, setS] = useState(false);
  const t = (msg: string) => { setM(msg); setS(true); setTimeout(() => setS(false), 2200); };
  return { m, s, t };
}

export function ProfileTab({ profile, onUpdate }: Props) {
  const [form, setForm] = useState<UserProfile>(profile);
  const { m: toastMsg, s: toastShow, t: toast } = useToast();

  const save = () => {
    ProfileStore.save(form);
    onUpdate(form);
    toast('Profile saved');
  };

  const exportData = () => {
    const data = {
      profile: localStorage.getItem('va_profile'),
      daily: localStorage.getItem('va_daily'),
      workouts: localStorage.getItem('va_workouts'),
      meals: localStorage.getItem('va_meals'),
      periods: localStorage.getItem('va_periods'),
      goals: localStorage.getItem('va_goals'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitalis-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported');
  };

  return (
    <div className="tab-scroll">
      <div className="profile-hero">
        <div className="profile-av">{form.name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="profile-name">{form.name || 'User'}</div>
        <div className="profile-meta">Offline AI Health Coach</div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Personal Details</div>
        <div className="form-grid">
          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          
          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">Biological Sex</label>
              <select className="select-field" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Age (years)</label>
              <input className="input-field" type="number" value={form.ageYears || ''} onChange={e => setForm(f => ({ ...f, ageYears: +e.target.value }))} />
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">Height (cm)</label>
              <input className="input-field" type="number" value={form.heightCm || ''} onChange={e => setForm(f => ({ ...f, heightCm: +e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Weight (kg)</label>
              <input className="input-field" type="number" value={form.weightKg || ''} onChange={e => setForm(f => ({ ...f, weightKg: +e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Fitness & Goals</div>
        <div className="form-grid">
          <div className="input-group">
            <label className="input-label">Current Fitness Level</label>
            <div className="seg-ctrl">
              {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                <div key={l} className={`seg-opt${form.fitnessLevel === l ? ' active' : ''}`} onClick={() => setForm(f => ({ ...f, fitnessLevel: l }))}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </div>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Primary Goal</label>
            <input className="input-field" placeholder="e.g. Lose weight, build muscle" value={form.primaryGoal} onChange={e => setForm(f => ({ ...f, primaryGoal: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={save}>Save Profile</button>
        </div>
      </div>

      {}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>AI Model Settings</div>
        <div className="input-group">
          <label className="input-label">Select Coach Engine</label>
          <select 
            className="select-field" 
            value={form.aiModel || 'lfm2-350m-q4_k_m'} 
            onChange={e => {
              const val = e.target.value;
              setForm(f => ({ ...f, aiModel: val }));
              ProfileStore.save({ ...form, aiModel: val });
              onUpdate({ ...form, aiModel: val });
              switchAIModel(val);
              toast('AI Model changed');
            }}
          >
            <option value="lfm2-350m-q4_k_m">Liquid 350M (Faster, Original)</option>
            <option value="qwen2.5-0.5b-instruct-q4_k_m">Qwen 0.5B (Smarter, Expert)</option>
          </select>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            Switching models will require a one-time download for the new model.
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Data & Privacy</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
          Your data never leaves this device. The AI runs locally in your browser.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportData}>Export Data</button>
          <button className="btn btn-danger" onClick={() => {
            if (window.confirm('Delete ALL data? This cannot be undone.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}>Clear All Data</button>
        </div>
      </div>

      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}