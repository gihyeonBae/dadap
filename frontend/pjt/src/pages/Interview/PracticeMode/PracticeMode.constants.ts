export { VOICE_PRESETS } from '../RealMode/RealMode.constants';

// Tailwind class constants (의미 있는 조합 추출)
export const PRIMARY_BUTTON = 'group flex items-center gap-3 px-10 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
export const RECORDING_BADGE = 'absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-blue-500/50 z-10 animate-pulse';
export const VOICE_DROPDOWN = 'absolute top-full right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-5 z-50 flex flex-col gap-5';
export const TIMER_BADGE = 'w-12 h-12 rounded-2xl flex items-center justify-center border bg-zinc-800 border-zinc-700 text-zinc-500';

// Behaviour constants
export const MODEL_URL = '/models';
export const AUDIO_THROTTLE_MS = 100;
export const DETECTION_INTERVAL_MS = 100;