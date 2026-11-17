import { useRef, type MouseEvent, type ReactNode, type CSSProperties } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMedia';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  style?: CSSProperties;
}

/**
 * CSS 3D tilt that follows the pointer. Also exposes --mx/--my for the edge glow.
 * Falls back to a flat card for touch devices and reduced-motion users.
 */
export default function TiltCard({ children, className = '', maxTilt = 8, style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced || window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(px - 0.5) * maxTilt * 2}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * maxTilt * 2}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  // Outer wrapper is free for entrance animations (GSAP transforms); the inner
  // element owns the pointer-driven 3D rotation so the two never fight.
  return (
    <div className={`h-full ${className}`} style={style}>
      <div
        ref={ref}
        className="tilt-card edge-glow h-full rounded-2xl"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="tilt-inner h-full">{children}</div>
      </div>
    </div>
  );
}
