import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/useMedia';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'li';
  /** Stagger direct children instead of animating the wrapper itself. */
  stagger?: boolean;
}

/** Fades and rises content into view on scroll. Content is visible by default if motion is off. */
export default function Reveal({ children, className = '', delay = 0, y = 28, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const targets = stagger ? Array.from(el.children) : [el];
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
    }, el);
    // Recalculate positions after fonts/images settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, [reduced, delay, y, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
