import { GraduationCap, Award, BadgeCheck, CircleDashed } from 'lucide-react';
import { completedCourses, education, futureCertifications } from '../config/profile';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import TiltCard from './TiltCard';

export default function Education() {
  return (
    <section id="education" aria-labelledby="edu-title" className="scroll-mt-24 py-[var(--m-section-y)] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="06 — Education & Certifications" title="Education and completed training" id="edu-title" />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14">
          <Reveal>
            <TiltCard className="h-full" maxTilt={5}>
              <article className="glass h-full rounded-2xl p-[var(--m-card-p)] lg:p-7">
                <GraduationCap className="h-8 w-8 text-sky-300" aria-hidden="true" strokeWidth={1.6} />
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-sky-300/90">{education.period}</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">{education.degree}</h3>
                <p className="mt-2 text-[var(--text)]/85">{education.institution}</p>
                <p className="text-sm text-[var(--text-muted)]">{education.university}</p>
                <p className="mt-5 inline-flex rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-slate-300">
                  {education.grade}
                </p>
              </article>
            </TiltCard>
          </Reveal>

          <Reveal>
            <div className="flex h-full flex-col gap-6">
              {completedCourses.map((c) => (
                <TiltCard key={c.title} className="h-full" maxTilt={5}>
                  <article className="glass h-full rounded-2xl p-[var(--m-card-p)] lg:p-7">
                    <Award className="h-8 w-8 text-violet-300" aria-hidden="true" strokeWidth={1.6} />
                    <h3 className="mt-5 text-xl font-semibold text-[var(--text)]">{c.title}</h3>
                    <p className="mt-2 text-[var(--text)]/85">{c.provider}</p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      {c.status} · {c.date}
                    </p>
                  </article>
                </TiltCard>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-8">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">Future certifications</h3>
          <ul className="grid gap-4 md:grid-cols-2">
            {futureCertifications.map((c) => (
              <li
                key={c.title}
                className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 p-5 text-[var(--text-muted)]"
              >
                <CircleDashed className="h-6 w-6 flex-none text-slate-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]/80">{c.title}</p>
                  <p className="text-xs">{c.target}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Only earned certifications are listed above the placeholders.</p>
        </Reveal>
      </div>
    </section>
  );
}
