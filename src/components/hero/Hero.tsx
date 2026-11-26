import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Download, Mail, ArrowRight, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../icons';
import { profile } from '../../config/profile';
import { use3DEnabled, usePrefersReducedMotion } from '../../hooks/useMedia';
import { gsap } from '../../lib/gsap';
import { anchorClick } from '../SmoothScroll';
import MagneticButton from '../MagneticButton';
import HeroFallback from './HeroFallback';
import { useResumeDownload } from '../../hooks/useResumeDownload';
import ErrorBoundary from '../ErrorBoundary';
import MobileHeroCards from '../../mobile3d/MobileHeroCards';

// The 3D bundle (three.js + R3F + drei) is split out and only fetched on capable desktops.
const HeroScene = lazy(() => import('./HeroScene'));

export default function Hero() {
  const enable3D = use3DEnabled();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const { download, status } = useResumeDownload(profile.resumePath);
  const [mounted3D, setMounted3D] = useState(false);

  useEffect(() => {
    if (enable3D) setMounted3D(true);
  }, [enable3D]);

  // Intro sequence: text lines rise in, then the visual fades up.
  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('[data-hero="eyebrow"]', { y: 16, opacity: 0, duration: 0.7 })
        .from('[data-hero="name"] span', { yPercent: 110, opacity: 0, duration: 1, stagger: 0.08 }, '-=0.4')
        .from('[data-hero="copy"]', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('[data-hero="actions"] > *', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
        .from('[data-hero="visual"]', { opacity: 0, scale: 0.96, duration: 1.4, ease: 'power2.out' }, 0.2);
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  const nameParts = profile.name.toUpperCase().split(' ');

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] supports-[height:100dvh]:min-h-[100dvh] items-center overflow-hidden pt-24 pb-12 md:pt-28 md:pb-16"
    >
      <div className="grid-bg absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),rgba(139,92,246,0.08)_45%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 md:gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8">
        <div className="relative z-10">
          <p data-hero="eyebrow" className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs text-[var(--text-muted)]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-medium text-emerald-300">{profile.availability}</span>
            <span className="text-slate-500">·</span>
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{profile.location}</span>
          </p>

          <h1 id="hero-title" className="text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="block overflow-hidden" data-hero="name">
              {nameParts.map((part) => (
                <span key={part} className="mr-3 inline-block text-gradient last:mr-0">
                  {part}
                </span>
              ))}
            </span>
          </h1>

          <p className="mt-6 font-mono text-sm tracking-wide text-sky-300/90 sm:text-base" data-hero="copy">
            {profile.title}
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text)]/90 sm:text-lg">{profile.intro}</p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">{profile.detail}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3" data-hero="actions">
            <MagneticButton href="#projects" onClick={anchorClick('projects')} icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Explore My Work
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              onClick={download}
              ariaLabel="Download resume (PDF)"
              icon={<Download className="h-4 w-4" aria-hidden="true" />}
            >
              Download Resume
            </MagneticButton>
            <MagneticButton variant="ghost" href="#contact" onClick={anchorClick('contact')} icon={<Mail className="h-4 w-4" aria-hidden="true" />}>
              Let&apos;s Connect
            </MagneticButton>
          </div>

          <p role="status" aria-live="polite" className="mt-4 min-h-[1.25rem] text-sm text-amber-300/90">
            {status}
          </p>

          <div className="mt-6 flex items-center gap-4 text-[var(--text-muted)]">
            {profile.linkedin ? (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm hover:text-sky-300">
                <LinkedinIcon className="h-4 w-4" aria-hidden="true" /> LinkedIn
              </a>
            ) : null}
            {profile.github ? (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm hover:text-sky-300">
                <GithubIcon className="h-4 w-4" aria-hidden="true" /> GitHub
              </a>
            ) : null}
          </div>
        </div>

        {/* Phones only: layered CSS 3D cards (renders nothing on desktop). */}
        <MobileHeroCards />
        {/* Desktop: the scene bleeds to the right edge of the viewport and fades in from the left, so no box edge is visible. */}
        <div
          data-hero="visual"
          data-desktop-3d
          className="relative h-[var(--m-visual-h)] w-full sm:h-[520px] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[50%] lg:h-auto lg:w-auto lg:[mask-image:linear-gradient(to_right,transparent,#000_16%)]"
        >
          {mounted3D ? (
            <ErrorBoundary fallback={<HeroFallback />}>
              <Suspense fallback={<HeroFallback />}>
                <div className="absolute inset-0">
                  <HeroScene />
                </div>
              </Suspense>
            </ErrorBoundary>
          ) : (
            <HeroFallback />
          )}
          <p className="sr-only">
            Decorative illustration of a cloud request path: user, DNS, load balancer, application, containers, database and storage.
          </p>
        </div>
      </div>
    </section>
  );
}
