import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/useMedia';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]';

/**
 * Desktop-only cursor: a small dot plus a trailing ring that grows over interactive elements.
 * Hidden on touch devices (via CSS) and when reduced motion is requested.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    const xDot = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3' });
    const yDot = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3' });
    const xRing = gsap.quickTo(r, 'x', { duration: 0.5, ease: 'power3' });
    const yRing = gsap.quickTo(r, 'y', { duration: 0.5, ease: 'power3' });

    // Start hidden: the cursor only appears once the pointer has actually moved.
    gsap.set([d, r], { opacity: 0 });
    let revealed = false;

    const onMove = (e: MouseEvent) => {
      if (!revealed) {
        revealed = true;
        gsap.to(d, { opacity: 1, duration: 0.3 });
        gsap.to(r, { opacity: 0.55, duration: 0.3 });
        // Snap to the first position so the ring does not fly in from the corner.
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
      }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const hot = !!target?.closest(INTERACTIVE);
      gsap.to(r, { scale: hot ? 2.2 : 1, opacity: hot ? 0.9 : 0.55, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.documentElement.classList.add('has-custom-cursor');
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [reduced]);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="custom-cursor pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/60 opacity-55 mix-blend-screen"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="custom-cursor pointer-events-none fixed left-0 top-0 z-[91] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300"
      />
    </>
  );
}
