import { useState, useRef } from 'react';
import { PhotoStore, PhotoEntry } from '../lib/records';

function useToast() {
  const [m, setM] = useState('');
  const [s, setS] = useState(false);
  const t = (msg: string) => { setM(msg); setS(true); setTimeout(() => setS(false), 2200); };
  return { m, s, t };
}

const CAT_LABELS: Record<PhotoEntry['category'], string> = { progress: 'Progress', meal: 'Meal', workout: 'Workout', other: 'Other' };

export function PhotoTab() {
  const [photos, setPhotos] = useState<PhotoEntry[]>(PhotoStore.getAll());
  const [selected, setSelected] = useState<PhotoEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PhotoEntry['category']>('progress');
  const [filter, setFilter] = useState<'all' | PhotoEntry['category']>('all');
  
  const fileRef = useRef<HTMLInputElement>(null);
  const { m: toastMsg, s: toastShow, t: toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) toast('Large image — may use significant storage');
    const reader = new FileReader();
    
    reader.onload = ev => { 
      setPreview(ev.target?.result as string); 
      setShowAdd(true); 
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const save = () => {
    if (!preview) return;
    PhotoStore.add({ dataUrl: preview, caption, category });
    setPhotos(PhotoStore.getAll());
    setPreview(null); 
    setCaption(''); 
    setCategory('progress'); 
    setShowAdd(false);
    toast('Photo saved');
  };

  const filtered = filter === 'all' ? photos : photos.filter(p => p.category === filter);

  return (
    <div className="tab-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Photos</div>
        <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()}>Add Photo</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      
      <div style={{ fontSize: 13, color: 'var(--text3)' }}>Progress photos, meals, and workouts — stored privately on your device.</div>
      
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '1px 0' }} className="hide-scroll">
        {(['all', 'progress', 'meal', 'workout', 'other'] as const).map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : CAT_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" style={{ stroke: 'var(--text3)', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3>No photos yet</h3>
          <p>Add progress photos, meal pics, or workout shots.</p>
          <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()}>Add First Photo</button>
        </div>
      ) : (
        <div className="photo-grid">
          {filtered.map(p => (
            <div key={p.id} className="photo-thumb" onClick={() => setSelected(p)}>
              <img src={p.dataUrl} alt={p.caption} loading="lazy" />
              <div className="photo-overlay">
                <span className="photo-caption-text">{p.caption || CAT_LABELS[p.category]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <>
          <div className="sheet-bg" onClick={() => { setShowAdd(false); setPreview(null); }} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Save Photo</div>
            {preview && <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 12, marginBottom: 16, maxHeight: 260, objectFit: 'cover' }} />}
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Category</label>
                <div className="seg-ctrl">
                  {(['progress', 'meal', 'workout', 'other'] as const).map(c => (
                    <div key={c} className={`seg-opt${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{CAT_LABELS[c]}</div>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Caption</label>
                <input className="input-field" placeholder="Optional caption…" value={caption} onChange={e => setCaption(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowAdd(false); setPreview(null); }}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={save}>Save Photo</button>
              </div>
            </div>
          </div>
        </>
      )}

      {selected && (
        <>
          <div className="sheet-bg" onClick={() => setSelected(null)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <img src={selected.dataUrl} alt={selected.caption} style={{ width: '100%', borderRadius: 12, marginBottom: 14, maxHeight: 320, objectFit: 'cover' }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{selected.caption || 'No caption'}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
              {CAT_LABELS[selected.category]} · {new Date(selected.date).toLocaleString()}
            </div>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
              PhotoStore.delete(selected.id);
              setPhotos(PhotoStore.getAll());
              setSelected(null);
              toast('Deleted');
            }}>
              Delete Photo
            </button>
          </div>
        </>
      )}

      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}