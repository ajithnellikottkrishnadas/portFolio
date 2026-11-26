import { lazy } from 'react';
import { learningRoadmap } from '../config/profile';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import Lazy3D from './3d/Lazy3D';
import MobileGoalsRing from '../mobile3d/MobileGoalsRing';

const OrbitScene = lazy(() => import('./goals/OrbitScene'));

/** Static stand-in for the orbit on mobile and reduced-motion devices. */
function StaticOrbit() {
  return (
    <div className="relative mx-auto h-full w-full max-w-sm" aria-hidden="true">
      <div className="absolute inset-[18%] rounded-full border border-sky-400/30" />
      <div className="absolute inset-[6%] rounded-full border border-violet-400/25" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-400/40 to-violet-500/40 blur-[2px]" />
    </div>
  );
}

/**
 * Learning roadmap. Progress is shown as an animated "in progress" indicator rather than a
 * percentage, because no completion figures have been supplied and none are invented here.
 */
export default function Goals() {
  return (
    <section id="goals" aria-labelledby="goals-title" className="scroll-mt-24 py-[var(--m-section-y)] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="07 — Career Goals" title="Always learning. Always building." id="goals-title">
              <p>
                I am continuously expanding my knowledge in cloud infrastructure and modern DevOps engineering. I aim to
                contribute to engineering teams that build reliable, scalable, secure, and highly available technology
                platforms.
              </p>
            </SectionHeading>
            <div data-desktop-3d>
              <Lazy3D className="mt-10 h-[var(--m-orbit-h)] md:h-[340px]" fallback={<StaticOrbit />}>
                <OrbitScene />
              </Lazy3D>
            </div>
            <div className="mt-10">
              <MobileGoalsRing />
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">Current learning focus</h3>
            <ol className="relative space-y-3">
              {learningRoadmap.map((item, i) => {
                const active = item.stage === 'Active';
                return (
                  <li key={item.id} className="glass relative overflow-hidden rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-500">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-sm text-[var(--text)]">{item.label}</span>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                          active
                            ? 'border-violet-400/35 text-violet-200'
                            : 'border-white/10 text-[var(--text-muted)]'
                        }`}
                      >
                        {item.stage}
                      </span>
                    </div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
                      {active && (
                        <div className="roadmap-shimmer h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-violet-400" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-slate-500">
              Bars show that the topic is in active study. They do not represent completion percentages.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
