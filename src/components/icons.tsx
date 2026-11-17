import type { SVGProps } from 'react';
import { GitBranch } from 'lucide-react';

/** Simple LinkedIn "in" mark. Drawn here because lucide-react no longer ships brand icons. */
export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3.5" />
      <path d="M8 10.5v5.5" />
      <circle cx="8" cy="7.8" r="0.6" fill="currentColor" />
      <path d="M12 16v-5.5" />
      <path d="M12 13c0-1.6 1-2.5 2.3-2.5s2.2.9 2.2 2.6V16" />
    </svg>
  );
}

/** GitHub-style repository mark (branch glyph), used for GitHub links. */
export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return <GitBranch {...props} />;
}
