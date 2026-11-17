import { useEffect, useState } from 'react';

/** Subscribes to a CSS media query. Safe on the server and in older browsers. */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return fallback;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Whether a real WebGL2 context can be created in this browser. */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Decides whether the full 3D hero should mount.
 * Mobile, reduced-motion users, touch-first devices, low-memory devices and
 * browsers without WebGL get a lightweight static fallback instead.
 */
export function use3DEnabled(): boolean {
  const isDesktop = useMediaQuery('(min-width: 900px) and (pointer: fine)');
  const reduced = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  const lowMemory =
    typeof navigator !== 'undefined' &&
    'deviceMemory' in navigator &&
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4;

  return isDesktop && !reduced && webgl && !lowMemory;
}
