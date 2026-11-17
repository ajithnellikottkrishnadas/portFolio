import { useRef, type MouseEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMedia';

type Variant = 'primary' | 'ghost';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
}

type ButtonProps = BaseProps & {
  href?: undefined;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

type LinkProps = BaseProps & {
  href: string;
  external?: boolean;
  download?: boolean | string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
};

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 select-none disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 text-white shadow-[0_10px_40px_-12px_rgba(56,189,248,0.6)] hover:shadow-[0_14px_50px_-12px_rgba(139,92,246,0.7)]',
  ghost:
    'glass text-[var(--text)] hover:bg-white/[0.08] hover:border-sky-400/40',
};

/**
 * Button or link with a subtle magnetic pull toward the cursor (desktop, motion allowed).
 * Renders a real <a> for navigation and a real <button> for actions, so keyboard
 * and assistive tech behave correctly.
 */
export default function MagneticButton(props: ButtonProps | LinkProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const variant = props.variant ?? 'primary';
  const classes = `${base} ${variants[variant]} ${props.className ?? ''}`;

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced || !ref.current || window.matchMedia('(pointer: coarse)').matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
    ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
  };

  const inner = (
    <>
      {props.icon}
      <span className="relative z-10">{props.children}</span>
    </>
  );

  if (props.href !== undefined) {
    const { href, external, download, onClick, ariaLabel } = props as LinkProps;
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={classes}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(download !== undefined ? { download: download === true ? '' : download } : {})}
      >
        {inner}
      </a>
    );
  }

  const { onClick, disabled, ariaLabel } = props as ButtonProps;
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {inner}
    </button>
  );
}
