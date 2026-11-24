import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ecosystemMonitor, ecosystemRequestPath, ecosystemReleasePath } from '../config/profile';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import './mobile3d.css';

/** Architecture on phones: stacked 3D layers. Tap to separate them, tap again to stack them. */
export default function MobileEcosystemStack() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);

  if (!isMobile) return null;

  const isStatic = reduced;
  const expanded = open || isStatic;
  const toggle = () => {
    if (!isStatic) setOpen((v) => !v);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  // Layers: the five request steps, then one release layer summarising the update path.
  const layers = [
    ...ecosystemRequestPath.map((s) => ({ key: s.id, title: s.label, tech: s.tech, release: false })),
    {
      key: 'release',
      title: 'How updates ship',
      tech: ecosystemReleasePath.map((s) => s.label).join(' → '),
      release: true,
    },
  ];

  return (
    <div className="m3d-eco">
      <div
        className={`m3d-eco-stage${expanded ? ' is-open' : ''}${isStatic ? ' is-static' : ''}`}
        role={isStatic ? undefined : 'button'}
        tabIndex={isStatic ? -1 : 0}
        aria-expanded={isStatic ? undefined : open}
        aria-label={isStatic ? undefined : 'Architecture layers. Tap to separate or stack them.'}
        onClick={toggle}
        onKeyDown={onKey}
      >
        <div className="m3d-eco-inner">
          {layers.map((l, i) => (
            <div
              key={l.key}
              className={`m3d-eco-layer${l.release ? ' is-release' : ''}`}
              style={{ '--i': i } as CSSProperties}
            >
              <p className="m3d-eco-title">{l.title}</p>
              <p className="m3d-eco-tech">{l.tech}</p>
            </div>
          ))}
        </div>
      </div>
      {!isStatic && (
        <p className="m3d-eco-toggle" aria-hidden="true">
          {open ? `Tap to stack · ${ecosystemMonitor.label} is linked to the container` : 'Tap the layers to separate them'}
        </p>
      )}
    </div>
  );
}
