import { motion } from 'motion/react';
import { statusLabels, type SkillCategory, type SkillStatus } from '../../config/profile';
import TiltCard from '../TiltCard';

const statusStyles: Record<SkillStatus, string> = {
  professional: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  built: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  learning: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
};

const statusDot: Record<SkillStatus, string> = {
  professional: 'bg-emerald-400',
  built: 'bg-sky-400',
  learning: 'bg-violet-400',
};

export default function SkillCard({ category }: { category: SkillCategory }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className="h-full"
    >
      <TiltCard className="h-full" maxTilt={6}>
        <article className="glass flex h-full flex-col rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--text)]">{category.label}</h3>
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]"
              style={{ backgroundColor: category.accent, color: category.accent }}
              aria-hidden="true"
            />
          </div>
          <ul className="flex flex-wrap gap-2" aria-label={`${category.label} skills`}>
            {category.skills.map((skill) => (
              <li
                key={skill.name}
                title={statusLabels[skill.status]}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-transform duration-300 hover:-translate-y-0.5 ${statusStyles[skill.status]}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot[skill.status]}`} aria-hidden="true" />
                <span>{skill.name}</span>
                <span className="visually-hidden">({statusLabels[skill.status]})</span>
              </li>
            ))}
          </ul>
        </article>
      </TiltCard>
    </motion.div>
  );
}
