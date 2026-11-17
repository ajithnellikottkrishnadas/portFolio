import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { skillCategories, statusLabels, type SkillStatus } from '../config/profile';
import SectionHeading from './SectionHeading';
import SkillCard from './skills/SkillCard';
import Reveal from './Reveal';

type Filter = 'all' | (typeof skillCategories)[number]['id'];

const legend: SkillStatus[] = ['professional', 'built', 'learning'];
const legendDot: Record<SkillStatus, string> = {
  professional: 'bg-emerald-400',
  built: 'bg-sky-400',
  learning: 'bg-violet-400',
};

export default function Skills() {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => (filter === 'all' ? skillCategories : skillCategories.filter((c) => c.id === filter)),
    [filter],
  );

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...skillCategories.map((c) => ({ id: c.id as Filter, label: c.label })),
  ];

  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="02 — Technical Expertise"
            title="Skills, organised by how I have used them"
            id="skills-title"
          >
            <p>
              Each tag shows whether I have used a technology professionally, built with it in projects or internships,
              or am currently learning it. No proficiency percentages are shown.
            </p>
          </SectionHeading>
        </Reveal>

        <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter skills by category" className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    on ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="skill-filter"
                      className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-sky-500/80 to-violet-500/80"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              );
            })}
          </div>

          <ul className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]" aria-label="Skill status legend">
            {legend.map((s) => (
              <li key={s} className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${legendDot[s]}`} aria-hidden="true" />
                {statusLabels[s]}
              </li>
            ))}
          </ul>
        </div>

        <motion.div layout className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((category) => (
              <SkillCard key={category.id} category={category} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
