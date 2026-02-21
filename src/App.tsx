import { useState, useEffect } from 'react';
import { ProfileStore, UserProfile } from './lib/records';
import { DashboardTab } from './components/DashboardTab';
import { CoachTab } from './components/CoachTab';
import { HealthTab } from './components/HealthTab';
import { WorkoutTab } from './components/WorkoutTab';
import { NutritionTab } from './components/NutritionTab';
import { PhotoTab } from './components/PhotoTab';
import { ProfileTab } from './components/ProfileTab';

type Tab = 'home' | 'coach' | 'health' | 'workout' | 'nutrition' | 'photo' | 'profile';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(() => ProfileStore.get());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [onboardStep, setOnboardStep] = useState(1);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  const saveOnboard = () => {
    const final = { ...tempProfile, onboarded: true };
    ProfileStore.save(final);
    setProfile(final);
  };

  if (!profile.onboarded) {
    return (
      <div className="app" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="onboard-hero">
            <div className="onboard-logo">
              <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <div className="onboard-title">Welcome to Vitalis</div>
            <div className="onboard-sub">Your 100% private, offline AI health coach.</div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            {onboardStep === 1 && (
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">What should I call you?</label>
                  <input className="input-field" autoFocus value={tempProfile.name} onChange={e => setTempProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <button className="btn btn-primary" disabled={!tempProfile.name.trim()} onClick={() => setOnboardStep(2)}>Next</button>
              </div>
            )}

            {onboardStep === 2 && (
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Biological Sex</label>
                  <select className="select-field" value={tempProfile.gender} onChange={e => setTempProfile(p => ({ ...p, gender: e.target.value as any }))}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Primary Goal</label>
                  <input className="input-field" placeholder="e.g. Lose weight, build muscle" value={tempProfile.primaryGoal} onChange={e => setTempProfile(p => ({ ...p, primaryGoal: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setOnboardStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={saveOnboard}>Start Tracking</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
          <div className="header-wordmark">Vitalis</div>
        </div>
        <div className="header-actions">
          <div className="header-chip live"><div className="dot dot-green" />Offline AI</div>
          <button className="header-logo" style={{ background: 'var(--card2)', border: '1px solid var(--border)' }} onClick={() => setActiveTab('profile')}>
            {profile.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </header>

      {}
      <main className="app-body">
        <div style={{ display: activeTab === 'home' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <DashboardTab onNav={setActiveTab} />
        </div>
        <div style={{ display: activeTab === 'coach' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <CoachTab />
        </div>
        <div style={{ display: activeTab === 'health' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <HealthTab profile={profile} />
        </div>
        <div style={{ display: activeTab === 'workout' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <WorkoutTab />
        </div>
        <div style={{ display: activeTab === 'nutrition' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <NutritionTab />
        </div>
        <div style={{ display: activeTab === 'photo' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <PhotoTab />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <ProfileTab profile={profile} onUpdate={(p) => setProfile(p)} />
        </div>
      </main>

      {}
      <nav className="app-nav">
        <button className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <div className="nav-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg></div>
          Home
        </button>
        <button className={`nav-btn ${activeTab === 'coach' ? 'active' : ''}`} onClick={() => setActiveTab('coach')}>
          <div className="nav-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
          Coach
        </button>
        <button className={`nav-btn ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
          <div className="nav-icon"><svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg></div>
          Health
        </button>
        <button className={`nav-btn ${activeTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveTab('workout')}>
          <div className="nav-icon"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
          Workout
        </button>
        <button className={`nav-btn ${activeTab === 'nutrition' ? 'active' : ''}`} onClick={() => setActiveTab('nutrition')}>
          <div className="nav-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
          Diet
        </button>
      </nav>
    </div>
  );
}