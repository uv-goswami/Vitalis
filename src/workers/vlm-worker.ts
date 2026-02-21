/**
 * VLM Web Worker — RunAnywhere SDK
 *
 * This worker runs the VLM (Vision-Language Model) inference off the main
 * thread so the camera preview and UI stay responsive.
 *
 * IMPORTANT: The ?worker&url import in runanywhere.ts gives the main thread
 * a URL string pointing to THIS compiled worker chunk. Vite bundles this file
 * separately. Inside the worker, startVLMWorkerRuntime() locates the WASM
 * file relative to the worker script's own URL (import.meta.url), so it
 * works correctly without any extra URL passing.
 */
import { startVLMWorkerRuntime } from '@runanywhere/web-llamacpp';

startVLMWorkerRuntime();
