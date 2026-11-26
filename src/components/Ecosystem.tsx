import { lazy } from 'react';
import { Activity, ArrowDown, ArrowRight, Box, GitBranch, Globe, HardDrive, Network, Route, Server, User, type LucideIcon } from 'lucide-react';
import {
  ecosystemIntro,
  ecosystemMonitor,
  ecosystemReleasePath,
  ecosystemReleaseTitle,
  ecosystemRequestPath,
  ecosystemTech,
  type EcosystemStep,
} from '../config/profile';
import { use3DEnabled } from '../hooks/useMedia';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import TiltCard from './TiltCard';
import MobileEcosystemStack from '../mobile3d/MobileEcosystemStack';
import Lazy3D from './3d/Lazy3D';

// The 3D diagram (three.js + R3F + drei) is split out and only fetched on capable desktops.
const FlowScene = lazy(() => import('./ecosystem/FlowScene'));

const icons: Record<string, LucideIcon> = {
  visitor: User,
  dns: Globe,
  alb: Route,
  subnets: Network,
  ecs: Server,
  gha: GitBranch,
  ecr: HardDrive,
  deploy: Server,
  monitor: Activity,
};

function StepBox({ step, tone }: { step: EcosystemStep; tone: 'sky' | 'violet' | 'emerald' | 'slate' }) {
  const Icon = icons[step.id] ?? Box;
  const toneClass = {
    sky: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
    violet: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
    emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    slate: 'border-slate-400/25 bg-slate-400/10 text-slate-200',
  }[tone];
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#070c1d]/85 p-4">
      <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl border ${toneClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text)]">{step.label}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)]">{step.tech}</p>
      </div>
    </div>
  );
}

/** Protocol or port label on the arrow between two boxes. */
function Arrow({ label, horizontal = false }: { label: string; horizontal?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-wide text-sky-300/90 ${
        horizontal ? 'py-0 md:px-2' : 'py-1.5'
      }`}
    >
      {horizontal ? (
        <ArrowRight className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
      )}
      <span>{label}</span>
    </div>
  );
}

/**
 * Static architecture diagram. This is the visible version on mobile, touch, reduced-motion
 * and no-WebGL devices, and it stays fully readable without any 3D. Stacks in one column.
 */
function StaticDiagram() {
  const [visitor, dns, alb, subnets, ecs] = ecosystemRequestPath;
  return (
    <div className="relative">
      <div className="flex flex-col gap-0" aria-label="Visitor request path" role="list">
        <div role="listitem">
          <StepBox step={visitor} tone="sky" />
        </div>
        <div role="listitem" className="flex flex-col">
          <Arrow label={dns.arrow ?? ''} />
          <StepBox step={dns} tone="sky" />
        </div>

        {/* VPC boundary: load balancer, private subnets and the container. */}
        <div
          role="listitem"
          className="relative mt-1 rounded-2xl border border-dashed border-violet-400/50 bg-violet-400/[0.03] p-4 md:p-5"
        >
          <p className="absolute -top-2.5 left-5 bg-[#070c1d] px-2 font-mono text-[11px] uppercase tracking-[0.2em] text-violet-200">
            VPC
          </p>
          <div className="flex flex-col">
            <Arrow label={alb.arrow ?? ''} />
            <StepBox step={alb} tone="sky" />
          </div>
          <div className="flex flex-col">
            <Arrow label={subnets.arrow ?? ''} />
            <div className="rounded-xl border border-violet-400/25 bg-[#070c1d]/85 p-4">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-200">
                  <Network className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{subnets.label}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{subnets.tech}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {['Private subnet · AZ 1', 'Private subnet · AZ 2'].map((row) => (
                  <div key={row} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-slate-300">
                    {row}
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <StepBox step={ecs} tone="violet" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CloudWatch: supporting label, linked to the container with a dotted line. */}
      <div className="mt-4 flex items-center gap-3 md:justify-end">
        <span aria-hidden="true" className="hidden h-px w-10 border-t border-dotted border-slate-400/70 md:block" />
        <div className="inline-flex items-center gap-3 rounded-xl border border-dotted border-slate-400/50 bg-[#070c1d]/85 px-4 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-slate-400/25 bg-slate-400/10 text-slate-200">
            <Activity className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--text)]">{ecosystemMonitor.label}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{ecosystemMonitor.tech}</p>
          </div>
        </div>
      </div>

      {/* Release path: separate row, different colour. */}
      <div className="mt-10 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.03] p-4 md:p-5">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-300">{ecosystemReleaseTitle}</p>
        <div className="flex flex-col gap-0 md:flex-row md:items-stretch" role="list" aria-label="Release path">
          {ecosystemReleasePath.map((step, i) => (
            <div key={step.id} role="listitem" className="flex flex-col md:flex-1 md:flex-row md:items-center">
              {i > 0 && <Arrow label={step.arrow ?? ''} horizontal />}
              <div className="flex-1">
                <StepBox step={step} tone="emerald" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Screen-reader equivalent of the 3D diagram. Hidden visually because the canvas is aria-hidden. */
function SrSummary() {
  return (
    <ol className="sr-only">
      {ecosystemRequestPath.map((s) => (
        <li key={s.id}>
          {s.label}: {s.tech}
        </li>
      ))}
      {ecosystemReleasePath.map((s) => (
        <li key={s.id}>
          Release: {s.label}: {s.tech}
        </li>
      ))}
      <li>
        {ecosystemMonitor.label}: {ecosystemMonitor.tech}
      </li>
    </ol>
  );
}

export default function Ecosystem() {
  const use3D = use3DEnabled();

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
            <div className="relative" data-desktop-3d>
              {use3D ? (
                <>
                  <SrSummary />
                  <Lazy3D className="relative min-h-[480px]" fallback={<StaticDiagram />}>
                    <FlowScene />
                  </Lazy3D>
                </>
              ) : (
                <StaticDiagram />
              )}
            </div>

            <MobileEcosystemStack />

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
