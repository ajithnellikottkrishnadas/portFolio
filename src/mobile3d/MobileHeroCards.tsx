import { useEffect, useRef, type CSSProperties } from 'react';
import { ecosystemRequestPath, type EcosystemStep } from '../config/profile';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import './mobile3d.css';

/** Hero cards on phones: the four visitor-path steps as layered CSS 3D cards. */
const CARD_IDS = ['visitor', 'dns', 'alb', 'ecs'];
const CARDS = CARD_IDS.map((id) => ecosystemRequestPath.find((s) => s.id === id)).filter(
  (s): s is EcosystemStep => Boolean(s),
);

type OrientationEvent = DeviceOrientationEvent & { gamma: number | null; beta: number | null };
type PermissionCapable = { requestPermission?: () => Promise<'granted' | 'denied'> };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function MobileHeroCards() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  // Layers separate as the visitor scrolls away from the top of the page.
  useEffect(() => {
    if (!isMobile) return;
    const el = stageRef.current;
    if (!el) return;
    if (reduced) {
      el.style.setProperty('--sep', '0.5');
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.setProperty('--sep', String(clamp(window.scrollY / 360, 0, 1)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile, reduced]);

  // Motion tilt starts automatically. Android and most browsers need no permission, so the tilt
  // runs at once. iOS asks once, so the first tap anywhere on the page requests it, with no button.
  useEffect(() => {
    if (!isMobile || reduced || !('DeviceOrientationEvent' in window)) return;
    const el = stageRef.current;
    if (!el) return;
    const onOrientation = (e: Event) => {
      const o = e as OrientationEvent;
      const gamma = o.gamma ?? 0; // left-right, -90..90
      const beta = (o.beta ?? 45) - 45; // front-back, centred on a typical hold angle
      el.style.setProperty('--tilt-y', String(clamp(gamma, -25, 25) * 0.4));
      el.style.setProperty('--tilt-x', String(clamp(beta, -25, 25) * -0.3));
    };

    const DOE = window.DeviceOrientationEvent as unknown as PermissionCapable;
    if (typeof DOE.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', onOrientation);
      return () => window.removeEventListener('deviceorientation', onOrientation);
    }

    // iOS: request permission on the first tap, then listen.
    let listening = false;
    const askOnce = async () => {
      window.removeEventListener('click', askOnce);
      try {
        const result = await DOE.requestPermission?.();
        if (result === 'granted' && !listening) {
          listening = true;
          window.addEventListener('deviceorientation', onOrientation);
        }
      } catch {
        // Permission refused or unavailable: the layers stay still.
      }
    };
    window.addEventListener('click', askOnce);
    return () => {
      window.removeEventListener('click', askOnce);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [isMobile, reduced]);

  if (!isMobile) return null;

  return (
    <div className="m3d-hero" aria-hidden="true">
      <div ref={stageRef} className="m3d-stage">
        {CARDS.map((card, i) => (
          <div key={card.id} className="m3d-layer" style={{ '--i': i } as CSSProperties}>
            <div className="m3d-layer-body">
              <span className="m3d-layer-index">0{i + 1}</span>
              <span className="m3d-layer-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
