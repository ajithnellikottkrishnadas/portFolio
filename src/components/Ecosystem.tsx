import { ecosystemIntro, ecosystemTech } from '../config/profile';
import { useMediaQuery } from '../hooks/useMedia';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import TiltCard from './TiltCard';
import MobileArchitecture from '../mobile3d/MobileArchitecture';
import ArchitectureWeb from './ArchitectureWeb';

/** The architecture section: the web layout on wide screens, the phone layout everywhere else. */
export default function Ecosystem() {
  const wide = useMediaQuery('(min-width: 1024px)');

  return (
    <section id="ecosystem" aria-labelledby="eco-title" className="scroll-mt-24 py-[var(--m-section-y)] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="05 — Architecture Overview" title="Inside the cloud architecture that serves this portfolio" id="eco-title">
            <p>{ecosystemIntro}</p>
          </SectionHeading>
        </Reveal>

        <TiltCard className="mt-10 lg:mt-14" maxTilt={3}>
          <div className="glass relative overflow-hidden rounded-2xl p-[var(--m-card-p)] md:p-10">
            <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative">{wide ? <ArchitectureWeb /> : <MobileArchitecture />}</div>

            <div className="relative mt-10 border-t border-white/10 pt-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Technologies in this area</p>
              <ul className="flex flex-wrap gap-2">
                {ecosystemTech.map((t) => (
                  <li key={t} className="rounded-full border border-violet-400/25 bg-violet-400/[0.08] px-3 py-1 text-xs text-violet-100">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
