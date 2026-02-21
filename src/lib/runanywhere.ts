import {
  RunAnywhere,
  SDKEnvironment,
  ModelManager,
  ModelCategory,
  LLMFramework,
  type CompactModelDef,
} from '@runanywhere/web';
import { LlamaCPP } from '@runanywhere/web-llamacpp';
import { ONNX } from '@runanywhere/web-onnx';
import type { AccelerationMode } from '@runanywhere/web';

const MODELS: CompactModelDef[] = [
  {
    id: 'lfm2-350m-q4_k_m',
    name: 'Vitalis Coach (LFM2 350M)',
    repo: 'LiquidAI/LFM2-350M-GGUF',
    files: ['LFM2-350M-Q4_K_M.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 250_000_000,
  },
  {
    id: 'qwen2.5-0.5b-instruct-q4_k_m',
    name: 'Vitalis Expert (Qwen 0.5B)',
    repo: 'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
    files: ['qwen2.5-0.5b-instruct-q4_k_m.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 400_000_000,
  }
];

let _initPromise: Promise<void> | null = null;
let _accel: AccelerationMode | null = null;

export async function initSDK(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    await RunAnywhere.initialize({
      environment: SDKEnvironment.Development,
      apiKey: import.meta.env.VITE_RUNANYWHERE_KEY, 
      debug: false,
    });

    await LlamaCPP.register();
    await ONNX.register();
    RunAnywhere.registerModels(MODELS);
  })();

  return _initPromise;
}

export const getAccel = () => _accel;
export { ModelManager, ModelCategory };