import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  id?: string;
}

/** Shared heading block used by every section, so typography stays consistent. */
export default function SectionHeading({ eyebrow, title, children, id }: SectionHeadingProps) {
  return (
    <header className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-sky-400/90">{eyebrow}</p>
      <h2
        id={id}
        className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl"
      >
        {title}
      </h2>
      {children && <div className="mt-5 text-base leading-relaxed text-[var(--text-muted)] md:text-lg">{children}</div>}
    </header>
  );
}
