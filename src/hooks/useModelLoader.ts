import { useState, useEffect, useCallback } from 'react';
import { ModelCategory, EventBus } from '@runanywhere/web';
import { initSDK, ModelManager } from '../lib/runanywhere';
import { ProfileStore } from '../lib/records';

export type LoaderState = 'idle' | 'downloading' | 'loading' | 'ready' | 'error';

export interface ModelLoaderHook {
  state: LoaderState;
  progress: number | null;
  error: string | null;
  ensure: () => Promise<boolean>;
  modelId: string;
}

let _globalState: LoaderState = 'idle';
let _globalProgress = 0;
let _loadPromise: Promise<boolean> | null = null;
let _activeModelId = ProfileStore.get().aiModel || 'lfm2-350m-q4_k_m';
const _listeners = new Set<() => void>();

function notify() { _listeners.forEach(fn => fn()); }

function setGlobal(s: LoaderState, p = _globalProgress) {
  _globalState = s;
  _globalProgress = p;
  notify();
}

// Triggers the UI to reset and load the new model when switched
export async function switchAIModel(newModelId: string) {
  if (_activeModelId === newModelId) return;
  _activeModelId = newModelId;
  setGlobal('idle', 0);
  _loadPromise = null;
}

async function doLoad(onProgress?: (p: number) => void): Promise<boolean> {
  if (_globalState === 'ready') return true;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      await initSDK();
      const targetId = _activeModelId; // capture the currently selected model
      
      const models = ModelManager.getModels().filter(m => m.id === targetId);
      if (models.length === 0) {
        throw new Error(`Model ${targetId} not registered in SDK`);
      }
      const model = models[0];

      if (model.status !== 'downloaded' && model.status !== 'loaded') {
        setGlobal('downloading', 0);
        
        const unsub = EventBus.shared.on('model.downloadProgress', (evt: any) => {
          if (evt.modelId === targetId) {
            const p = evt.progress ?? 0;
            setGlobal('downloading', p);
            onProgress?.(p);
          }
        });

        await ModelManager.downloadModel(targetId);
        unsub();
      }
      
      setGlobal('loading', 1);
      onProgress?.(1);
      
      const ok = await ModelManager.loadModel(targetId);
      if (!ok) throw new Error('Engine failed to load model into memory');
      
      setGlobal('ready', 1);
      _loadPromise = null;
      return true;
    } catch (e) {
      console.error('[useModelLoader] load failed:', e);
      setGlobal('error', 0);
      _loadPromise = null;
      throw e;
    }
  })();
  return _loadPromise;
}

export function useModelLoader(_category?: ModelCategory): ModelLoaderHook {
  const [, rerender] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => rerender(n => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  useEffect(() => {
    if (_globalState !== 'idle') return;
    let alive = true;
    initSDK().then(() => {
      if (!alive || _globalState !== 'idle') return;
      try {
        const models = ModelManager.getModels().filter(m => m.id === _activeModelId);
        if (models.length > 0 && (models[0].status === 'downloaded' || models[0].status === 'loaded')) {
          doLoad().catch(() => {});
        }
      } catch { }
    }).catch(() => {});
    return () => { alive = false; };
  }, [_activeModelId]);

  const ensure = useCallback(async (): Promise<boolean> => {
    if (_globalState === 'ready') return true;
    try {
      return await doLoad();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  return {
    state: _globalState,
    progress: _globalProgress,
    error,
    ensure,
    modelId: _activeModelId
  };
}