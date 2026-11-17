import { profile } from '../config/profile';
import { anchorClick } from './SmoothScroll';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-[var(--text-muted)] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React, Three.js and GSAP.
        </p>
        <a href="#top" onClick={anchorClick('top')} className="inline-flex items-center gap-2 hover:text-sky-300">
          Back to top
        </a>
      </div>
    </footer>
  );
}
