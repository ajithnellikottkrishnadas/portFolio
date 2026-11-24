import { useEffect } from 'react';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import './mobile3d.css';

/**
 * Phones only: a touch press tilts the project card toward the finger, and release springs it back.
 * One listener at the document level, so no project component needs to change.
 * Passive listeners only, so scrolling is never blocked.
 */
const CARD_SELECTOR = '#projects article';
const MAX_TILT_X = 10;
const MAX_TILT_Y = 12;

export default function MobileTouchPress() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!isMobile || reduced) return;
    let active: HTMLElement | null = null;

    const aim = (el: HTMLElement, x: number, y: number) => {
      const r = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (x - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (y - r.top) / r.height));
      el.style.setProperty('--m3d-rx', `${(0.5 - py) * MAX_TILT_X * 2}deg`);
      el.style.setProperty('--m3d-ry', `${(px - 0.5) * MAX_TILT_Y * 2}deg`);
    };

    const release = () => {
      if (!active) return;
      const el = active;
      active = null;
      el.classList.remove('m3d-press');
      el.style.removeProperty('--m3d-rx');
      el.style.removeProperty('--m3d-ry');
    };

    const onStart = (e: TouchEvent) => {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>(CARD_SELECTOR) : null;
      if (!target) return;
      const t = e.touches[0];
      active = target;
      target.classList.add('m3d-press');
      aim(target, t.clientX, t.clientY);
    };

    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const t = e.touches[0];
      aim(active, t.clientX, t.clientY);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', release, { passive: true });
    document.addEventListener('touchcancel', release, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', release);
      document.removeEventListener('touchcancel', release);
      release();
    };
  }, [isMobile, reduced]);

  return null;
}
