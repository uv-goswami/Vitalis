export interface Theme {
  id: string;
  name: string;
  emoji: string;
  swatchColor: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', swatchColor: '#6366f1',
    vars: {
      '--bg':'#080c14','--bg2':'#0c1120','--bg3':'#101828',
      '--card':'#111827','--card2':'#182030','--border':'#1e2d45',
      '--accent':'#6366f1','--accent2':'#818cf8','--accent3':'#22d3ee',
      '--text':'#f1f5f9','--text2':'#94a3b8','--text3':'#475569',
      '--success':'#10b981','--warn':'#f59e0b','--danger':'#ef4444',
      '--grad':'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
    },
  },
  {
    id: 'aurora', name: 'Aurora', emoji: '🌌', swatchColor: '#00d4a3',
    vars: {
      '--bg':'#030711','--bg2':'#050e1a','--bg3':'#081525',
      '--card':'#081525','--card2':'#0d1f35','--border':'#143050',
      '--accent':'#00d4a3','--accent2':'#0ea5e9','--accent3':'#a855f7',
      '--text':'#e0f8ff','--text2':'#7ecfef','--text3':'#4a8a9f',
      '--success':'#00d4a3','--warn':'#fbbf24','--danger':'#f87171',
      '--grad':'linear-gradient(135deg,#00d4a3 0%,#0ea5e9 100%)',
    },
  },
  {
    id: 'ember', name: 'Ember', emoji: '🔥', swatchColor: '#f97316',
    vars: {
      '--bg':'#0f0500','--bg2':'#1a0a00','--bg3':'#1f1000',
      '--card':'#1f1000','--card2':'#2e1800','--border':'#4a2800',
      '--accent':'#f97316','--accent2':'#fb923c','--accent3':'#fbbf24',
      '--text':'#fff8f0','--text2':'#d9a070','--text3':'#8a5030',
      '--success':'#22c55e','--warn':'#fbbf24','--danger':'#ef4444',
      '--grad':'linear-gradient(135deg,#f97316 0%,#ef4444 100%)',
    },
  },
  {
    id: 'blossom', name: 'Blossom', emoji: '🌸', swatchColor: '#e879f9',
    vars: {
      '--bg':'#0f0810','--bg2':'#1a0f1e','--bg3':'#1f1025',
      '--card':'#1f1025','--card2':'#2d1540','--border':'#4a205a',
      '--accent':'#e879f9','--accent2':'#d946ef','--accent3':'#f472b6',
      '--text':'#fdf0ff','--text2':'#c084fc','--text3':'#7c3aed',
      '--success':'#34d399','--warn':'#fbbf24','--danger':'#f87171',
      '--grad':'linear-gradient(135deg,#e879f9 0%,#a855f7 100%)',
    },
  },
  {
    id: 'daylight', name: 'Daylight', emoji: '☀️', swatchColor: '#6366f1',
    vars: {
      '--bg':'#f8fafc','--bg2':'#f1f5f9','--bg3':'#e2e8f0',
      '--card':'#ffffff','--card2':'#f8fafc','--border':'#e2e8f0',
      '--accent':'#6366f1','--accent2':'#818cf8','--accent3':'#0ea5e9',
      '--text':'#0f172a','--text2':'#475569','--text3':'#94a3b8',
      '--success':'#059669','--warn':'#d97706','--danger':'#dc2626',
      '--grad':'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
    },
  },
];

export function applyTheme(id: string) {
  const theme = THEMES.find(t => t.id === id) || THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
