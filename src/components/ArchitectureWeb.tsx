import { useEffect, useState } from 'react';
import {
  BY_ID,
  CONNECTIONS,
  GROUPS,
  LEGEND,
  NODES,
  PARTS,
  PATHS,
  RELEASE_STEPS,
  REQUEST_STEPS,
  TONE_FILL,
  type Flow,
  type Group,
  type Part,
  type Path,
} from '../mobile3d/MobileArchitecture';
import { usePrefersReducedMotion } from '../mobile3d/useIsMobile';
import './architecture-web.css';

const LETTERS = 'ABCD';

/**
 * Desktop version of the architecture section. The same content and behaviour as the mobile view,
 * laid out as a canvas with a sticky inspector beside it.
 */
export default function ArchitectureWeb() {
  const reduced = usePrefersReducedMotion();
  const [flow, setFlow] = useState<Flow>('request');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState<Group | 'All'>('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [panel, setPanel] = useState<'connect' | 'overview' | null>(null);

  const steps = flow === 'request' ? REQUEST_STEPS : RELEASE_STEPS;
  const current = steps[Math.min(index, steps.length - 1)];

  useEffect(() => {
    if (!playing || reduced) return;
    const id = window.setInterval(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 2400);
    return () => window.clearInterval(id);
  }, [playing, reduced, steps.length]);

  useEffect(() => {
    if (index >= steps.length - 1) setPlaying(false);
  }, [index, steps.length]);

  const switchFlow = (next: Flow) => {
    setFlow(next);
    setIndex(0);
    setPlaying(false);
    setSelected(null);
    setShowTech(false);
  };

  const go = (i: number) => {
    setIndex(Math.max(0, Math.min(i, steps.length - 1)));
    setSelected(null);
    setShowTech(false);
    setPlaying(false);
  };

  const pick = (partId: string) => {
    setSelected(partId);
    setShowTech(false);
    setPlaying(false);
  };

  const litNodes = new Set<string>(selected ? NODES.filter((n) => n.part === selected).map((n) => n.id) : current.nodes);
  const litPaths = new Set<string>(selected ? [] : current.paths);
  const dim = (p: Part) => filter !== 'All' && p.group !== filter;

  const shown = selected ? BY_ID[selected] : BY_ID[current.part];
  const shownText = selected ? BY_ID[selected].plain : current.text;
  const stepLabel = (i: number) => (flow === 'request' ? `Step ${i + 1}` : `Step ${LETTERS[i]}`);
  const progress = steps.length > 1 ? (index / (steps.length - 1)) * 100 : 100;

  return (
    <div className="aw">
      <header className="aw-top">
        <div className="aw-heading">
          <p className="aw-kicker">Architecture walkthrough</p>
          <p className="aw-lede">Follow one visit, or one update, through the cloud. Select any component to see how it connects.</p>
        </div>
        <div className="aw-seg" role="group" aria-label="Choose a flow">
          <button type="button" aria-pressed={flow === 'request'} onClick={() => switchFlow('request')}>
            Visitor request
          </button>
          <button type="button" aria-pressed={flow === 'release'} onClick={() => switchFlow('release')}>
            How updates ship
          </button>
        </div>
      </header>

      <div className="aw-main">
        <section className="aw-canvas" aria-label="Architecture diagram">
          <div className="aw-canvas-bar">
            <div className="aw-chips" role="group" aria-label="Filter by group">
              <button type="button" aria-pressed={filter === 'All'} onClick={() => setFilter('All')}>
                All
              </button>
              {GROUPS.map((g) => (
                <button key={g} type="button" aria-pressed={filter === g} onClick={() => setFilter(g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Decorative for screen readers: the step list and the detail panels carry the content. */}
          <figure className="aw-diagram" aria-hidden="true">
            <svg viewBox="0 0 360 790" role="presentation">
              <defs>
                <marker id="aw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
                </marker>
              </defs>
              <rect x="8" y="8" width="344" height="144" rx="14" className="aw-box-outside" />
              <text x="18" y="26" className="aw-label">Outside the AWS account</text>
              <rect x="8" y="164" width="344" height="618" rx="14" className="aw-box-cloud" />
              <text x="18" y="776" className="aw-label">AWS Cloud · ap-south-1 (Mumbai)</text>
              <rect x="20" y="330" width="320" height="360" rx="10" className="aw-box-vpc" />
              <text x="330" y="352" textAnchor="end" className="aw-label aw-label-green">VPC · 10.0.0.0/16</text>
              <rect x="30" y="496" width="140" height="180" rx="10" className="aw-box-az" />
              <text x="38" y="512" className="aw-sub">Zone A</text>
              <rect x="190" y="496" width="140" height="180" rx="10" className="aw-box-az" />
              <text x="198" y="512" className="aw-sub">Zone B</text>
              <rect x="36" y="586" width="128" height="34" rx="6" className="aw-subnet-public" />
              <rect x="36" y="624" width="128" height="46" rx="6" className="aw-subnet-private" />
              <rect x="196" y="586" width="128" height="34" rx="6" className="aw-subnet-public" />
              <text x="260" y="607" textAnchor="middle" className="aw-node-sub">ALB node</text>
              <rect x="196" y="624" width="128" height="46" rx="6" className="aw-subnet-private" />

              {PATHS.map((p: Path) => {
                const lit = litPaths.has(p.id);
                const cls = [
                  'aw-path',
                  p.dashed ? 'is-dashed' : '',
                  p.tone === 'release' ? 'is-release' : '',
                  p.tone === 'sec' ? 'is-sec' : '',
                  lit ? 'is-lit' : '',
                ].join(' ');
                return <path key={p.id} d={p.d} className={cls} markerEnd="url(#aw-arrow)" />;
              })}

              {NODES.map((n) => {
                const part = BY_ID[n.part];
                const lit = litNodes.has(n.id);
                const dimmed = dim(part) || (!selected && !lit && litNodes.size > 0 && playing);
                return (
                  <g
                    key={n.id}
                    className={`aw-node ${TONE_FILL[n.tone]}${lit ? ' is-lit' : ''}${dimmed ? ' is-dim' : ''}`}
                    onClick={() => pick(n.part)}
                    role="presentation"
                  >
                    <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="8" className="aw-node-box" />
                    {n.sub ? (
                      <>
                        <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 2} textAnchor="middle" className="aw-node-title">
                          {n.title}
                        </text>
                        <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 12} textAnchor="middle" className="aw-node-sub">
                          {n.sub}
                        </text>
                      </>
                    ) : (
                      <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle" className="aw-node-title">
                        {n.title}
                      </text>
                    )}
                    {n.labelBelow && (
                      <text x={n.x + n.w / 2} y={n.y + n.h + 13} textAnchor="middle" className="aw-node-sub">
                        {n.labelBelow}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </figure>

          <ul className="aw-legend" aria-hidden="true">
            {LEGEND.map((l) => (
              <li key={l.label}>
                <span className={l.cls} />
                {l.label}
              </li>
            ))}
          </ul>
        </section>

        <aside className="aw-inspector" aria-label="Details and steps">
          <div className="aw-now" aria-live="polite">
            <p className="aw-kicker">{selected ? 'Selected component' : stepLabel(index)}</p>
            <h3>{shown.label}</h3>
            <span className="aw-pill">{shown.group}</span>
            <p className="aw-text">{shownText}</p>

            <button type="button" className="aw-link" aria-expanded={showTech} onClick={() => setShowTech((v) => !v)}>
              {showTech ? 'Hide technical name' : 'Show technical name'}
            </button>
            {showTech && <code className="aw-code">{shown.tech}</code>}

            {selected ? (
              <>
                <p className="aw-kicker">Connected to</p>
                <div className="aw-chips">
                  {BY_ID[selected].links.map((id) => (
                    <button key={id} type="button" onClick={() => pick(id)}>
                      {BY_ID[id].label}
                    </button>
                  ))}
                </div>
                <button type="button" className="aw-ghost" onClick={() => setSelected(null)}>
                  Back to the flow
                </button>
              </>
            ) : (
              <div className="aw-controls">
                <button type="button" className="aw-ghost" onClick={() => go(index - 1)} disabled={index === 0}>
                  Previous
                </button>
                {!reduced && (
                  <button type="button" className="aw-primary" aria-pressed={playing} onClick={() => setPlaying((v) => !v)}>
                    {playing ? 'Pause' : flow === 'request' ? 'Play request' : 'Play release'}
                  </button>
                )}
                <button type="button" className="aw-ghost" onClick={() => go(index + 1)} disabled={index >= steps.length - 1}>
                  Next
                </button>
              </div>
            )}

            <div className="aw-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <ol className="aw-steps">
            {steps.map((s, i) => {
              const active = !selected && i === index;
              return (
                <li key={`${flow}-${s.part}-${i}`}>
                  <button type="button" aria-current={active ? 'step' : undefined} className={active ? 'is-active' : ''} onClick={() => go(i)}>
                    <span className="aw-num">{flow === 'request' ? i + 1 : LETTERS[i]}</span>
                    <span className="aw-step-text">{s.text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>

      {/* Two options. Each opens its full detail below the diagram. */}
      <section className="aw-more" aria-label="More detail">
        <div className="aw-seg" role="group" aria-label="More detail">
          <button type="button" aria-pressed={panel === 'connect'} onClick={() => setPanel(panel === 'connect' ? null : 'connect')}>
            How they connect
          </button>
          <button type="button" aria-pressed={panel === 'overview'} onClick={() => setPanel(panel === 'overview' ? null : 'overview')}>
            Overview
          </button>
        </div>

        {panel === 'connect' && (
          <ol className="aw-cards">
            {CONNECTIONS.map((c) => (
              <li key={`${c.from}-${c.to}`} className="aw-card">
                <p className="aw-card-route">
                  {c.from} <span aria-hidden="true">→</span> {c.to}
                </p>
                <p className="aw-card-why">{c.why}</p>
                <p className="aw-text">{c.detail}</p>
              </li>
            ))}
          </ol>
        )}

        {panel === 'overview' && (
          <div className="aw-groups">
            {GROUPS.map((g) => {
              const items = PARTS.filter((p) => p.group === g);
              if (items.length === 0) return null;
              return (
                <div key={g} className="aw-group">
                  <p className="aw-kicker">{g}</p>
                  {items.map((p) => (
                    <div key={p.id} className="aw-item">
                      <strong>{p.label}</strong>
                      <p className="aw-text">{p.plain}</p>
                      <code className="aw-code">{p.tech}</code>
                      <div className="aw-chips">
                        {p.links.map((id) => (
                          <button key={id} type="button" onClick={() => pick(id)}>
                            {BY_ID[id].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
