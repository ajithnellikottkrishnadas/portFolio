import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { navItems, profile, type SectionId } from '../config/profile';
import { anchorClick } from './SmoothScroll';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the nav item for whichever section currently occupies the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: SectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    anchorClick(id)(e);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      {/* Centering wrapper: max width + auto margins + page gutters, so the bar is
          symmetric on any screen width, including 27" and ultrawide monitors. */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Primary"
        className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-2.5 sm:px-5 max-lg:relative max-lg:z-50 ${
          scrolled ? 'glass nav-scrolled' : 'border border-transparent'
        }`}
      >
        <a href="#top" onClick={anchorClick('top')} className="flex min-h-11 items-center gap-2.5 rounded-lg">
          <img src="/logo.svg" alt="" aria-hidden="true" className="h-10 w-10" />

          <span className="hidden text-sm font-medium text-[var(--text)] sm:inline">{profile.shortName}</span>
          <span className="visually-hidden">Back to top</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={go(item.id)}
                aria-current={active === item.id ? 'true' : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                  active === item.id ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {item.label}
                {active === item.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-sky-400 to-violet-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="glass grid h-11 w-11 place-items-center rounded-xl lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu-overlay"
            aria-hidden="true"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="mobile-menu-overlay fixed inset-0 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'top center' }}
            className="glass mobile-menu-panel relative z-50 mt-2 rounded-2xl p-3 lg:hidden"
          >
            <ul className="grid gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={go(item.id)}
                    className="block rounded-xl px-4 py-3 text-base text-[var(--text)] hover:bg-white/5"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
}
