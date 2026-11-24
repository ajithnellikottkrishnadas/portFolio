import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { learningRoadmap } from '../config/profile';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import './mobile3d.css';

/** Goals on phones: learning topics on a rotating CSS 3D ring. Tap a topic to see its status. */
const N = learningRoadmap.length;
const AUTO_SPEED = 0.12; // degrees per frame, slow idle rotation
const DRAG_GAIN = 0.35; // degrees of spin per pixel of swipe
const TAP_SLOP = 8; // pixels of movement that still count as a tap

const stageLabel = (stage: string) => (stage === 'Active' ? 'Active study' : 'Planned');

export default function MobileGoalsRing() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const ringRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  // Mutable animation state lives in a ref, so frames don't re-render React.
  const s = useRef({ angle: 0, velocity: AUTO_SPEED, target: null as number | null, dragging: false, lastX: 0, moved: 0 });

  useEffect(() => {
    if (!isMobile || reduced) return;
    const el = ringRef.current;
    if (!el) return;
    let frame = 0;
    const tick = () => {
      const st = s.current;
      if (st.target !== null) {
        // Ease the ring so the tapped topic turns to the front.
        const diff = ((((st.target - st.angle) % 360) + 540) % 360) - 180;
        st.angle += diff * 0.1;
        if (Math.abs(diff) < 0.3) st.target = null;
      } else if (!st.dragging) {
        // Inertia from a swipe settles back to the slow idle speed.
        st.velocity += (AUTO_SPEED - st.velocity) * 0.02;
        st.angle += st.velocity;
      }
      el.style.setProperty('--spin', `${st.angle}deg`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isMobile, reduced]);

  if (!isMobile) return null;

  if (reduced) {
    return (
      <ol className="m3d-ring-static" aria-label="Learning topics">
        {learningRoadmap.map((t) => (
          <li key={t.id}>
            <span>{t.label}</span>
            <span>{stageLabel(t.stage)}</span>
          </li>
        ))}
      </ol>
    );
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current;
    st.dragging = true;
    st.target = null;
    st.lastX = e.clientX;
    st.moved = 0;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.dragging) return;
    const dx = e.clientX - st.lastX;
    st.lastX = e.clientX;
    st.moved += Math.abs(dx);
    st.angle += dx * DRAG_GAIN;
    st.velocity = dx * DRAG_GAIN;
  };

  const endDrag = () => {
    s.current.dragging = false;
  };

  const onTopicClick = (index: number) => {
    // Clicks that follow a swipe are ignored.
    if (s.current.moved > TAP_SLOP) return;
    setSelected(index);
    s.current.target = -((index * 360) / N);
  };

  const current = selected !== null ? learningRoadmap[selected] : null;

  return (
    <div>
      <div
        className="m3d-ring-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div ref={ringRef} className="m3d-ring">
          {learningRoadmap.map((t, k) => (
            <button
              key={t.id}
              type="button"
              className={`m3d-ring-item${t.stage === 'Active' ? ' is-active' : ''}`}
              style={{ '--k': k, '--n': N } as CSSProperties}
              aria-pressed={selected === k}
              aria-label={`${t.label}: ${stageLabel(t.stage)}`}
              onClick={() => onTopicClick(k)}
            >
              {t.short}
            </button>
          ))}
        </div>
      </div>
      <p className="m3d-ring-status" role="status" aria-live="polite">
        {current ? `${current.label} · ${stageLabel(current.stage)}` : 'Tap a topic to see its status'}
      </p>
    </div>
  );
}
