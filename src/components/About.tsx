import { Cloud, Network, Workflow, Code2, type LucideIcon } from 'lucide-react';
import { aboutCards, aboutParagraphs } from '../config/profile';
import SectionHeading from './SectionHeading';
import TiltCard from './TiltCard';
import Reveal from './Reveal';

const icons: Record<string, LucideIcon> = {
  cloud: Cloud,
  linux: Network,
  devops: Workflow,
  fullstack: Code2,
};

const accents: Record<string, string> = {
  cloud: 'from-sky-400/30 to-blue-600/10',
  linux: 'from-cyan-400/30 to-teal-600/10',
  devops: 'from-violet-400/30 to-indigo-600/10',
  fullstack: 'from-fuchsia-400/25 to-violet-600/10',
};

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-24 py-[var(--m-section-y)] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="01 — About" title="Engineering the cloud. Building the future." id="about-title" />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
            {aboutParagraphs.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal stagger className="mt-12 lg:mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aboutCards.map((card) => {
            const Icon = icons[card.key];
            return (
              <TiltCard key={card.key} className="h-full" maxTilt={10}>
                <article className="glass h-full rounded-2xl p-[var(--m-card-p)] lg:p-6">
                  <div className="relative mb-6 h-20 w-20 [transform-style:preserve-3d]" aria-hidden="true">
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accents[card.key]} border border-white/10 [transform:rotateX(55deg)_rotateZ(-30deg)_translateZ(6px)] shadow-[0_18px_30px_-12px_rgba(56,189,248,0.4)]`}
                    />
                    <div className="absolute inset-0 grid place-items-center [transform:translateZ(22px)]">
                      <Icon className="h-8 w-8 text-sky-200" strokeWidth={1.6} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{card.text}</p>
                </article>
              </TiltCard>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
