/**
 * ⚡ PERFORMANCE MODE DETECTOR
 * Low-end device চিনে heavy effects (blur/animation/shadow) বন্ধ করে দেয়।
 */
export type PerfMode = 'lite' | 'full';

export const detectPerfMode = (): PerfMode => {
  const nav = navigator as any;
  const cores = nav.hardwareConcurrency || 8;
  const mem = nav.deviceMemory || 8;           // GB
  const saveData = nav.connection?.saveData === true;
  const slow2g3g = /(^|\b)2g|3g\b/.test(nav.connection?.effectiveType || '');

  if (saveData || slow2g3g) return 'lite';
  if (cores <= 4 || mem <= 4) return 'lite';   // low-end phone
  return 'full';
};

export const applyPerfMode = (): PerfMode => {
  const mode = detectPerfMode();
  document.documentElement.setAttribute('data-perf', mode);
  console.log(`[Perf] mode = ${mode}`);
  return mode;
};