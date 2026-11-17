import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Briefcase, ChevronDown, MapPin } from 'lucide-react';
import { experience, type ExperienceItem } from '../config/profile';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/useMedia';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import TiltCard from './TiltCard';

function TimelineItem({ item, index, defaultOpen }: { item: ExperienceItem; index: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `exp-panel-${item.id}`;
  const buttonId = `exp-button-${item.id}`;
  const side = index % 2 === 0;

  return (
    <li className="relative grid gap-6 md:grid-cols-2 md:gap-12">
      {/* Node on the spine */}
      <span
        aria-hidden="true"
        className="absolute left-4 top-7 z-10 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full border border-sky-300/70 bg-[var(--bg)] md:left-1/2"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8]" />
      </span>

      <div className={`pl-10 md:pl-0 ${side ? 'md:col-start-1 md:pr-12 md:text-right' : 'md:col-start-2 md:pl-12'}`}>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-300/90">{item.period}</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">{item.company}</h3>
        <p className="mt-1 text-base text-[var(--text)]/85">
          {item.role}
          {item.project && <span className="text-[var(--text-muted)]"> · Project: {item.project}</span>}
        </p>
        {item.location && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {item.location}
          </p>
        )}
        <ul className={`mt-4 flex flex-wrap gap-2 ${side ? 'md:justify-end' : ''}`} aria-label={`${item.company} technologies`}>
          {item.tech.map((t) => (
            <li key={t} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-slate-300">
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={`pl-10 md:pl-0 ${side ? 'md:col-start-2 md:pl-12' : 'md:col-start-1 md:row-start-1 md:pr-12'}`}>
        <TiltCard maxTilt={4}>
          <div className="glass rounded-2xl p-5 md:p-6">
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                <Briefcase className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Responsibilities ({item.responsibilities.length})
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {item.responsibilities.map((r) => (
                      <li key={r} className="flex gap-3">
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-sky-400" aria-hidden="true" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TiltCard>
      </div>
    </li>
  );
}

export default function Experience() {
  const spineRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();

  // The spine fills in as the user scrolls through the timeline.
  useLayoutEffect(() => {
    if (!listRef.current || !spineRef.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: listRef.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
        },
      );
    }, listRef);
    return () => ctx.revert(); // also removes the ScrollTrigger created inside the context
  }, [reduced]);

  return (
    <section id="experience" aria-labelledby="exp-title" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="03 — Professional Experience" title="Where I have built and operated systems" id="exp-title" />
        </Reveal>

        <div className="relative mt-16">
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-4 top-0 w-px -translate-x-1/2 bg-white/10 md:left-1/2"
          >
            <span ref={spineRef} className="block h-full w-full bg-gradient-to-b from-sky-400 via-violet-400 to-transparent" />
          </span>
          <ol ref={listRef} className="space-y-14">
            {experience.map((item, i) => (
              <TimelineItem key={item.id} item={item} index={i} defaultOpen={i === 0} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
