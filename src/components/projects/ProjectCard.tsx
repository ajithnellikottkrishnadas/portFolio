import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ChevronDown, ImageOff } from 'lucide-react';
import { GithubIcon } from '../icons';
import type { ProjectItem } from '../../config/profile';
import TiltCard from '../TiltCard';

/** A link that is either live or an explicit, non-clickable "not added yet" state. */
function ProjectLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        title="Link not added yet"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-white/15 px-4 py-2 text-xs text-[var(--text-muted)]"
      >
        {icon}
        {label}: link not added yet
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs text-[var(--text)] transition-colors hover:border-sky-400/50 hover:bg-sky-400/10"
    >
      {icon}
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="visually-hidden">(opens in a new tab)</span>
    </a>
  );
}

export default function ProjectCard({ project }: { project: ProjectItem }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const detailsId = `project-${project.id}-details`;

  return (
    <TiltCard className="h-full" maxTilt={5}>
      <article
        className="glass group flex h-full flex-col overflow-hidden rounded-2xl"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {/* Preview area: screenshot placeholder until a real image is supplied. */}
        <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[#070c1d]">
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${project.accent}33, transparent 55%), radial-gradient(circle at 80% 90%, #7c3aed33, transparent 50%)`,
              transform: hover ? 'scale(1.06)' : 'scale(1)',
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 grid place-items-center text-center" aria-hidden="true">
            <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
              <ImageOff className="h-6 w-6" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Screenshot placeholder</span>
            </div>
          </div>
          <AnimatePresence>
            {hover && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050816] via-[#050816]/70 to-transparent p-4"
              >
                <p className="text-xs text-[var(--text)]/90">{project.features[0]}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#050816]/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-sky-200 backdrop-blur">
            {project.kind}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-[var(--m-card-p)] lg:p-7">
          <h3 className="text-xl font-semibold leading-snug text-[var(--text)]">{project.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{project.summary}</p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
            {project.tech.map((t, i) => (
              <motion.li
                key={t}
                initial={false}
                whileHover={{ y: -2, scale: 1.05 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 400, damping: 20 }}
                className="rounded-md border border-sky-400/20 bg-sky-400/[0.06] px-2 py-1 font-mono text-[11px] text-sky-100"
              >
                {t}
              </motion.li>
            ))}
          </ul>

          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((v) => !v)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm text-sky-300 hover:text-sky-200"
          >
            {open ? 'Hide details' : 'Show details'}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={detailsId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                  {project.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 flex-none rounded-full bg-violet-400" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <ProjectLink href={project.github} label="GitHub" icon={<GithubIcon className="h-3.5 w-3.5" aria-hidden="true" />} />
            <ProjectLink href={project.liveDemo} label="Live demo" icon={<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />} />
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
