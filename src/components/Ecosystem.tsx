import { Activity, Box, Database, Globe, HardDrive, Route, AppWindow, User, type LucideIcon } from 'lucide-react';
import { ecosystemDisclaimer, ecosystemNodes, ecosystemTech } from '../config/profile';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import TiltCard from './TiltCard';

const icons: Record<string, LucideIcon> = {
  user: User,
  dns: Globe,
  lb: Route,
  app: AppWindow,
  containers: Box,
  database: Database,
  storage: HardDrive,
  monitoring: Activity,
};

export default function Ecosystem() {
  return (
    <section id="ecosystem" aria-labelledby="eco-title" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="05 — Technology Ecosystem" title="How a request moves through modern cloud architecture" id="eco-title">
            <p>{ecosystemDisclaimer}</p>
          </SectionHeading>
        </Reveal>

        <TiltCard className="mt-14" maxTilt={3}>
          <div className="glass relative overflow-hidden rounded-2xl p-6 md:p-10">
            <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
            {/* Vertical on small screens, horizontal flow from md up. */}
            <ol className="relative flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-between" aria-label="Request flow">
              {ecosystemNodes.map((node, i) => {
                const Icon = icons[node.id];
                const last = i === ecosystemNodes.length - 1;
                return (
                  <li key={node.id} className="flex flex-col items-stretch lg:flex-1 lg:basis-0 lg:items-center">
                    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#070c1d]/80 p-4 lg:w-full lg:flex-col lg:gap-3 lg:p-4 lg:text-center">
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-sky-400/25 bg-sky-400/10 lg:h-12 lg:w-12">
                        <Icon className="h-5 w-5 text-sky-200" aria-hidden="true" strokeWidth={1.7} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{node.label}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)]">{node.tech}</p>
                      </div>
                    </div>
                    {!last && (
                      <span aria-hidden="true" className="flow-connector ml-[1.6rem] my-1 h-6 w-px lg:ml-0 lg:my-0 lg:h-px lg:w-full lg:mt-6" />
                    )}
                  </li>
                );
              })}
            </ol>

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
