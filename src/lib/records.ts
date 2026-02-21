function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadOne<T>(key: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; }
  catch { return def; }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function todayISO() {
  return new Date().toISOString();
}

export function todayStr() {
  return new Date().toDateString();
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  ageYears?: number;
  heightCm?: number;
  weightKg?: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: string;
  theme: string;
  onboarded: boolean;
  aiModel: string;
}

const PROFILE_KEY = 'va_profile';
const DEFAULT_PROFILE: UserProfile = {
  name: '',
  gender: 'other',
  fitnessLevel: 'beginner',
  primaryGoal: 'stay healthy',
  theme: 'midnight',
  onboarded: false,
  aiModel: 'lfm2-350m-q4_k_m', 
};

export const ProfileStore = {
  get: (): UserProfile => loadOne<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE),
  save: (p: UserProfile): void => localStorage.setItem(PROFILE_KEY, JSON.stringify(p)),
};

export interface WorkoutEntry {
  id: string;
  date: string;
  type: string;
  durationMin: number;
  caloriesBurned?: number;
  notes: string;
}

const WK_KEY = 'va_workouts';
export const WorkoutStore = {
  getAll: (): WorkoutEntry[] => load<WorkoutEntry>(WK_KEY).sort((a, b) => b.date.localeCompare(a.date)),
  add: (entry: Omit<WorkoutEntry, 'id' | 'date'>): WorkoutEntry => {
    const all = load<WorkoutEntry>(WK_KEY);
    const e: WorkoutEntry = { ...entry, id: uid(), date: todayISO() };
    save(WK_KEY, [e, ...all]); return e;
  },
  delete: (id: string): void => save(WK_KEY, load<WorkoutEntry>(WK_KEY).filter(e => e.id !== id)),
  thisWeek: (): WorkoutEntry[] => {
    const cutoff = Date.now() - 7 * 86400_000;
    return load<WorkoutEntry>(WK_KEY).filter(e => new Date(e.date).getTime() > cutoff);
  },
};

export interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string;
  calories?: number;
  protein?: number;
  notes: string;
}

const MEAL_KEY = 'va_meals';
export const MealStore = {
  getAll: (): MealEntry[] => load<MealEntry>(MEAL_KEY).sort((a, b) => b.date.localeCompare(a.date)),
  add: (entry: Omit<MealEntry, 'id' | 'date'>): MealEntry => {
    const all = load<MealEntry>(MEAL_KEY);
    const e: MealEntry = { ...entry, id: uid(), date: todayISO() };
    save(MEAL_KEY, [e, ...all]); return e;
  },
  delete: (id: string): void => save(MEAL_KEY, load<MealEntry>(MEAL_KEY).filter(e => e.id !== id)),
  todayCalories: (): number => {
    const ts = todayStr();
    return load<MealEntry>(MEAL_KEY).filter(e => new Date(e.date).toDateString() === ts).reduce((s, e) => s + (e.calories || 0), 0);
  },
};

export interface BodyMetric {
  id: string;
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  restingHR?: number;
  notes: string;
}

const METRIC_KEY = 'va_metrics';
export const MetricStore = {
  getAll: (): BodyMetric[] => load<BodyMetric>(METRIC_KEY).sort((a, b) => b.date.localeCompare(a.date)),
  add: (entry: Omit<BodyMetric, 'id' | 'date'>): BodyMetric => {
    const all = load<BodyMetric>(METRIC_KEY);
    const e: BodyMetric = { ...entry, id: uid(), date: todayISO() };
    save(METRIC_KEY, [e, ...all]); return e;
  },
  delete: (id: string): void => save(METRIC_KEY, load<BodyMetric>(METRIC_KEY).filter(e => e.id !== id)),
  latest: (): BodyMetric | null => {
    const all = load<BodyMetric>(METRIC_KEY);
    return all[0] ?? null;
  },
};

export interface DailyLog {
  id: string;
  date: string;
  waterMl: number;
  steps: number;
  sleepHours: number;
  mood: 1 | 2 | 3 | 4 | 5;
  moodNote: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

const DAILY_KEY = 'va_daily';
export const DailyStore = {
  getAll: (): DailyLog[] => load<DailyLog>(DAILY_KEY).sort((a, b) => b.date.localeCompare(a.date)),
  getToday: (): DailyLog | null => {
    const today = new Date().toISOString().slice(0, 10);
    return load<DailyLog>(DAILY_KEY).find(d => d.date === today) ?? null;
  },
  upsertToday: (partial: Partial<Omit<DailyLog, 'id' | 'date'>>): DailyLog => {
    const today = new Date().toISOString().slice(0, 10);
    const all = load<DailyLog>(DAILY_KEY);
    const idx = all.findIndex(d => d.date === today);
    const def: DailyLog = { id: uid(), date: today, waterMl: 0, steps: 0, sleepHours: 0, mood: 3, moodNote: '', energyLevel: 3 };
    
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...partial };
      save(DAILY_KEY, all);
      return all[idx];
    } else {
      const e = { ...def, ...partial };
      save(DAILY_KEY, [e, ...all]);
      return e;
    }
  },
  last7: (): DailyLog[] => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return load<DailyLog>(DAILY_KEY).filter(d => new Date(d.date) >= cutoff);
  },
};

export interface GoalEntry {
  id: string;
  createdAt: string;
  title: string;
  category: string;
  target: number;
  unit: string;
  current: number;
  completed: boolean;
}

const GOAL_KEY = 'va_goals';
export const GoalStore = {
  getAll: (): GoalEntry[] => load<GoalEntry>(GOAL_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  add: (entry: Omit<GoalEntry, 'id' | 'createdAt'>): GoalEntry => {
    const all = load<GoalEntry>(GOAL_KEY);
    const e: GoalEntry = { ...entry, id: uid(), createdAt: todayISO() };
    save(GOAL_KEY, [e, ...all]); return e;
  },
  update: (id: string, partial: Partial<GoalEntry>): void => {
    save(GOAL_KEY, load<GoalEntry>(GOAL_KEY).map(e => e.id === id ? { ...e, ...partial } : e));
  },
  delete: (id: string): void => save(GOAL_KEY, load<GoalEntry>(GOAL_KEY).filter(e => e.id !== id)),
};

export interface PhotoEntry {
  id: string;
  date: string;
  dataUrl: string;
  caption: string;
  category: 'progress' | 'meal' | 'workout' | 'other';
}

const PHOTO_KEY = 'va_photos';
export const PhotoStore = {
  getAll: (): PhotoEntry[] => load<PhotoEntry>(PHOTO_KEY).sort((a, b) => b.date.localeCompare(a.date)),
  add: (entry: Omit<PhotoEntry, 'id' | 'date'>): PhotoEntry => {
    const all = load<PhotoEntry>(PHOTO_KEY);
    const e: PhotoEntry = { ...entry, id: uid(), date: todayISO() };
    save(PHOTO_KEY, [e, ...all]); return e;
  },
  delete: (id: string): void => save(PHOTO_KEY, load<PhotoEntry>(PHOTO_KEY).filter(e => e.id !== id)),
};

export interface PeriodEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes: string;
}

const PERIOD_KEY = 'va_periods';
export const PeriodStore = {
  getAll: (): PeriodEntry[] => load<PeriodEntry>(PERIOD_KEY).sort((a, b) => b.startDate.localeCompare(a.startDate)),
  add: (entry: Omit<PeriodEntry, 'id'>): PeriodEntry => {
    const all = load<PeriodEntry>(PERIOD_KEY);
    const e: PeriodEntry = { ...entry, id: uid() };
    save(PERIOD_KEY, [e, ...all]); return e;
  },
  update: (id: string, partial: Partial<PeriodEntry>): void => {
    save(PERIOD_KEY, load<PeriodEntry>(PERIOD_KEY).map(e => e.id === id ? { ...e, ...partial } : e));
  },
  delete: (id: string): void => save(PERIOD_KEY, load<PeriodEntry>(PERIOD_KEY).filter(e => e.id !== id)),
  lastPeriod: (): PeriodEntry | null => load<PeriodEntry>(PERIOD_KEY)[0] ?? null,
  avgCycle: (): number => {
    const all = load<PeriodEntry>(PERIOD_KEY);
    if (all.length < 2) return 28;
    const diffs: number[] = [];
    for (let i = 0; i < all.length - 1; i++) {
      const a = new Date(all[i].startDate).getTime();
      const b = new Date(all[i + 1].startDate).getTime();
      diffs.push(Math.abs(a - b) / 86400_000);
    }
    return Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
  },
};

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

const CHAT_KEY = 'va_chat';
export const ChatStore = {
  get: (limit = 50): ChatMsg[] => {
    const all = load<ChatMsg>(CHAT_KEY);
    return all.slice(-limit);
  },
  add: (msg: Omit<ChatMsg, 'id'>): void => {
    const all = load<ChatMsg>(CHAT_KEY);
    all.push({ ...msg, id: uid() });
    if (all.length > 100) all.splice(0, all.length - 100);
    save(CHAT_KEY, all);
  },
  clear: (): void => save(CHAT_KEY, []),
};

export function buildAppContext(): string {
  const profile = ProfileStore.get();
  const today = DailyStore.getToday();
  const recentWorkouts = WorkoutStore.thisWeek();
  const goals = GoalStore.getAll().slice(0, 5);
  const metrics = MetricStore.latest();
  
  let cycleInfo = '';
  if (profile.gender === 'female') {
    const lastP = PeriodStore.lastPeriod();
    if (lastP) {
      const daysSince = Math.floor((Date.now() - new Date(lastP.startDate).getTime()) / 86400_000);
      const avg = PeriodStore.avgCycle();
      let phase = 'Follicular';
      if (daysSince <= 5) phase = 'Menstruating';
      else if (daysSince >= avg - 15 && daysSince <= avg - 13) phase = 'Ovulating';
      else if (daysSince > avg - 13) phase = 'Luteal';
      cycleInfo = `Cycle Phase: Day ${daysSince} (${phase})`;
    }
  }

  const parts = [];
  parts.push(`Name: ${profile.name || 'User'}`);
  parts.push(`Gender: ${profile.gender}`);
  parts.push(`Fitness Level: ${profile.fitnessLevel}`);
  
  if (profile.ageYears) parts.push(`Age: ${profile.ageYears}`);
  if (profile.primaryGoal) parts.push(`Primary Goal: ${profile.primaryGoal}`);
  if (metrics?.weightKg) parts.push(`Current Weight: ${metrics.weightKg}kg`);
  if (cycleInfo) parts.push(cycleInfo);

  let todayStats = [];
  if (today?.waterMl && today.waterMl > 0) todayStats.push(`${today.waterMl}ml water`);
  if (today?.steps && today.steps > 0) todayStats.push(`${today.steps} steps`);
  if (today?.sleepHours && today.sleepHours > 0) todayStats.push(`${today.sleepHours}h sleep`);
  
  if (todayStats.length > 0) {
    parts.push(`Logged Today: ${todayStats.join(', ')}`);
  } else {
    parts.push(`Logged Today: Nothing logged yet.`);
  }

  parts.push(`Workouts last 7 days: ${recentWorkouts.length}`);

  const activeGoals = goals.filter(g => !g.completed);
  if (activeGoals.length > 0) {
    parts.push(`Active Goals: ${activeGoals.map(g => g.title).join(', ')}`);
  }

  return parts.join(' | ');
}