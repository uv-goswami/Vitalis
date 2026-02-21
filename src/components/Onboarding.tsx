import { useState } from 'react';
import { ProfileStore, UserProfile } from '../lib/records';
import { THEMES, applyTheme } from '../lib/themes';

interface Props { onComplete: () => void; }

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<UserProfile>>({
    gender: 'other', fitnessLevel: 'beginner', primaryGoal: 'Stay healthy', theme: 'midnight',
  });
  const set = (k: keyof UserProfile, v: any) => setData(d => ({ ...d, [k]: v }));

  const next = () => {
    if (step < 3) setStep(s => s+1);
    else {
      ProfileStore.save({ ...data, onboarded: true } as UserProfile);
      applyTheme(data.theme || 'midnight');
      onComplete();
    }
  };

  const isStep0Valid = !!(data.name?.trim());

  return (
    <div style={{height:'100dvh',display:'flex',flexDirection:'column',overflow:'hidden',background:'var(--bg)'}}>
      {/* Progress */}
      <div className="step-dots">
        {[0,1,2,3].map(i => (
          <div key={i} className={`step-dot${i===step?' active':''}`} style={{width: i===step ? 24 : 8}}/>
        ))}
      </div>

      <div className="tab-scroll" style={{justifyContent: step===0||step===3 ? 'center' : undefined}}>

        {step === 0 && (
          <div style={{maxWidth:380,margin:'0 auto',width:'100%',display:'flex',flexDirection:'column',gap:20}}>
            <div className="onboard-hero">
              <div className="onboard-logo">
                <svg viewBox="0 0 24 24" style={{width:36,height:36,stroke:'white',fill:'none',strokeWidth:1.5,strokeLinecap:'round'}}>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="onboard-title">Welcome to VitalAI</div>
              <div className="onboard-sub">Your fully private health coach. All data stays on your device — no cloud, no accounts, no tracking.</div>
            </div>
            <div className="card">
              <div className="form-grid" style={{gap:12}}>
                <div className="input-group">
                  <label className="input-label">Your name</label>
                  <input className="input-field" placeholder="Enter your name" value={data.name||''} onChange={e => set('name', e.target.value)} autoFocus/>
                </div>
                <div className="input-group">
                  <label className="input-label">Biological sex (for health tracking)</label>
                  <div className="seg-ctrl">
                    {(['male','female','other'] as const).map(g => (
                      <div key={g} className={`seg-opt${data.gender===g?' active':''}`} onClick={() => set('gender', g)}>
                        {g==='male' ? 'Male' : g==='female' ? 'Female' : 'Other'}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-grid form-grid-2">
                  <div className="input-group">
                    <label className="input-label">Age</label>
                    <input className="input-field" type="number" placeholder="25" min={10} max={120} value={data.ageYears||''} onChange={e => set('ageYears', +e.target.value)}/>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Weight (kg)</label>
                    <input className="input-field" type="number" placeholder="70" value={data.weightKg||''} onChange={e => set('weightKg', +e.target.value)}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{maxWidth:380,margin:'0 auto',width:'100%',display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <div style={{fontSize:22,fontWeight:700,letterSpacing:'-0.4px'}}>Your fitness profile</div>
              <div style={{fontSize:14,color:'var(--text2)',marginTop:4}}>Helps personalize your AI coach responses.</div>
            </div>
            <div className="card">
              <div className="form-grid" style={{gap:12}}>
                <div className="input-group">
                  <label className="input-label">Fitness level</label>
                  <div className="seg-ctrl">
                    {(['beginner','intermediate','advanced'] as const).map(l => (
                      <div key={l} className={`seg-opt${data.fitnessLevel===l?' active':''}`} onClick={() => set('fitnessLevel', l)}>
                        {l.charAt(0).toUpperCase()+l.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Primary goal</label>
                  <select className="select-field" value={data.primaryGoal} onChange={e => set('primaryGoal', e.target.value)}>
                    {['Stay healthy','Lose weight','Build muscle','Improve endurance','Reduce stress','Better sleep','Athletic performance'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-grid form-grid-2">
                  <div className="input-group">
                    <label className="input-label">Height (cm)</label>
                    <input className="input-field" type="number" placeholder="170" value={data.heightCm||''} onChange={e => set('heightCm', +e.target.value)}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{maxWidth:380,margin:'0 auto',width:'100%',display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <div style={{fontSize:22,fontWeight:700,letterSpacing:'-0.4px'}}>Choose your theme</div>
              <div style={{fontSize:14,color:'var(--text2)',marginTop:4}}>You can change this anytime in your profile.</div>
            </div>
            <div>
              {THEMES.map(t => (
                <div key={t.id} className={`theme-opt${data.theme===t.id?' active':''}`}
                  onClick={() => { set('theme', t.id); applyTheme(t.id); }}>
                  <div className="theme-swatch" style={{background: t.vars['--grad'] || t.vars['--accent']}}/>
                  <span className="theme-name">{t.name}</span>
                  {data.theme===t.id && (
                    <div className="theme-check">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{maxWidth:380,margin:'0 auto',width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:20,textAlign:'center'}}>
            <div style={{width:72,height:72,borderRadius:20,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px'}}>You're all set{data.name ? `, ${data.name}` : ''}.</div>
              <div style={{fontSize:14,color:'var(--text2)',marginTop:8,lineHeight:1.6}}>Your AI coach is ready. Everything runs privately on your device — no internet required after the first model download.</div>
            </div>
            <div className="card" style={{width:'100%',textAlign:'left'}}>
              {[
                ['100% private', 'All data stored locally on your device only'],
                ['Works offline', 'AI model runs without any internet connection'],
                ['Personalized insights', 'Coach adapts to your logged activity'],
                ['Full health tracking', 'Water, sleep, mood, workouts, nutrition'],
              ].map(([title, sub]) => (
                <div key={title} className="list-item">
                  <div className="li-icon">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="li-body">
                    <div className="li-title">{title}</div>
                    <div className="li-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{padding:'12px 16px',paddingBottom:'calc(12px + env(safe-area-inset-bottom))',flexShrink:0}}>
        <button
          className="btn btn-primary"
          style={{width:'100%',justifyContent:'center',padding:14,fontSize:16}}
          onClick={next}
          disabled={step===0 && !isStep0Valid}
        >
          {step === 3 ? 'Start my journey' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
