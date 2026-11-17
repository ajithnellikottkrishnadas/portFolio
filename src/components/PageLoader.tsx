import { useEffect, useState } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/useMedia';

/** Short branded intro shown while the page's first paint settles. */
export default function PageLoader() {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('[data-loader-bar]');
    const wrap = document.querySelector<HTMLElement>('[data-loader]');
    if (!wrap || !bar) return;

    const finish = () => {
      document.documentElement.classList.add('loaded');
      setDone(true);
    };

    if (reduced) {
      finish();
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
      .to(wrap, { yPercent: -100, duration: 0.8, ease: 'power4.inOut', delay: 0.1 });

    // Safety net: never trap the user behind the loader.
    const failSafe = window.setTimeout(finish, 2600);
    return () => {
      tl.kill();
      window.clearTimeout(failSafe);
    };
  }, [reduced]);

  if (done) return null;

  return (
    <div
      data-loader
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[var(--bg)]"
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-sky-300/80">Initialising</p>
      <div className="h-px w-56 overflow-hidden bg-white/10">
        <div data-loader-bar className="h-full origin-left bg-gradient-to-r from-sky-400 to-violet-500" />
      </div>
    </div>
  );
}
