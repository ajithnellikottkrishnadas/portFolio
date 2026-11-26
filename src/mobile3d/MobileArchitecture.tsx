import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import './mobile-architecture.css';

type Group = 'Visitors' | 'Network' | 'Security' | 'Servers' | 'Updates' | 'Monitoring';
type Flow = 'request' | 'release';
type Part = { id: string; label: string; plain: string; tech: string; group: Group; layer: 0 | 1 | 2 | 3 };

const GROUPS: Group[] = ['Visitors', 'Network', 'Security', 'Servers', 'Updates', 'Monitoring'];
const LETTERS = 'ABCD';
const DEFAULT_EXPLODE = 30;

/** Every component in the setup, with mobile-only plain-words copy. */
const PARTS: Part[] = [
  { id: 'visitor', label: 'Visitor', plain: "Your browser asks for the site.", tech: 'Browser over HTTPS', group: 'Visitors', layer: 0 },
  { id: 'godaddy', label: 'Domain registrar (GoDaddy)', plain: "Holds the domain name and points it to AWS's nameservers.", tech: 'Nameservers set to Route 53', group: 'Network', layer: 0 },
  { id: 'github', label: 'GitHub', plain: 'Stores the code. Pushing a change here starts an automatic deploy.', tech: 'git push origin main', group: 'Updates', layer: 0 },
  { id: 'route53', label: 'Route 53', plain: "The address book. It turns the domain name into the load balancer's address.", tech: 'DNS record, alias A', group: 'Network', layer: 1 },
  { id: 'acm', label: 'ACM', plain: 'Encrypts the connection. The padlock in the browser comes from here.', tech: 'TLS certificate, HTTPS 443', group: 'Security', layer: 1 },
  { id: 'cloudwatch', label: 'CloudWatch', plain: 'Records what the site does, so problems can be found.', tech: '/ecs/ANP-IN-WEB01', group: 'Monitoring', layer: 1 },
  { id: 'ecr', label: 'ECR', plain: 'Stores the packaged version of the site.', tech: 'anp-in-ecr01', group: 'Updates', layer: 1 },
  { id: 'iam', label: 'IAM', plain: 'Controls who may do what. GitHub gets temporary access only, with no stored keys.', tech: 'OIDC role ANP-IN-GHDEPLOY01', group: 'Security', layer: 1 },
  { id: 'gha', label: 'GitHub Actions', plain: 'Checks the code, builds the image and pushes it to ECR.', tech: 'build-check, then deploy', group: 'Updates', layer: 1 },
  { id: 'igw', label: 'Internet gateway', plain: 'The door between the internet and the network.', tech: 'ANP-IN-IGW01', group: 'Network', layer: 2 },
  { id: 'alb', label: 'Application Load Balancer', plain: 'HTTPS on 443. Redirects HTTP to HTTPS. Shares visitors across the servers.', tech: 'ANP-IN-ALB01', group: 'Network', layer: 2 },
  { id: 'tg', label: 'Target group', plain: 'The list of healthy servers the load balancer can send visitors to.', tech: 'ANP-IN-TG01, port 8080, /health', group: 'Network', layer: 2 },
  { id: 'sg', label: 'Security groups', plain: 'Firewalls. The load balancer accepts web traffic; the servers accept traffic only from the load balancer.', tech: 'ANP-IN-ALBSG01, ANP-IN-ECSSG01', group: 'Security', layer: 2 },
  { id: 'nat', label: 'NAT gateway', plain: 'Lets the servers download updates and images, while nothing from outside can reach them. Its public address is an Elastic IP.', tech: 'ANP-IN-NAT01, ANP-IN-EIP01', group: 'Network', layer: 3 },
  { id: 'ecs', label: 'ECS task (Fargate)', plain: 'Runs the website in a container on port 8080 (nginx). Two copies run at all times.', tech: 'ANP-IN-SVC01, ANP-IN-TASK01', group: 'Servers', layer: 3 },
];

const BY_ID: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p]));

const LAYERS: { title: string; sub: string }[] = [
  { title: 'Outside the AWS account', sub: 'The visitor, the domain and the code' },
  { title: 'AWS Cloud · ap-south-1 (Mumbai)', sub: 'Regional services' },
  { title: 'VPC · 10.0.0.0/16', sub: 'The private network' },
  { title: 'Availability zones A and B', sub: 'Two data centres, one site' },
];

type Step = { part: string; text: string };

const REQUEST_STEPS: Step[] = [
  { part: 'visitor', text: 'Visitor types the domain.' },
  { part: 'route53', text: "Route 53 returns the load balancer's address." },
  { part: 'alb', text: "The request reaches the load balancer over HTTPS. ACM's certificate is used here." },
  { part: 'tg', text: 'The load balancer sends the request to a healthy task through the target group.' },
  { part: 'ecs', text: 'The task answers. The page returns to the visitor.' },
];

const RELEASE_STEPS: Step[] = [
  { part: 'github', text: 'You push code to GitHub.' },
  { part: 'gha', text: 'GitHub Actions checks and builds the image, then pushes it to ECR. It signs in with IAM temporary access.' },
  { part: 'ecs', text: 'ECS starts new tasks from the new image, and replaces the old ones only when the new ones pass their health checks.' },
  { part: 'cloudwatch', text: "CloudWatch records the new tasks' logs and health." },
];

const TONE: Record<Group, string> = {
  Visitors: 'border-sky-400/45 bg-sky-400/10 text-sky-100',
  Network: 'border-violet-400/45 bg-violet-400/10 text-violet-100',
  Security: 'border-slate-300/40 bg-slate-300/10 text-slate-100',
  Servers: 'border-violet-400/45 bg-violet-400/15 text-violet-50',
  Updates: 'border-emerald-400/45 bg-emerald-400/10 text-emerald-100',
  Monitoring: 'border-slate-400/40 bg-slate-400/10 text-slate-200',
};

function Chip({ part, active, dim, onPick }: { part: Part; active: boolean; dim: boolean; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onPick(part.id)}
      className={`m-arch-chip ${TONE[part.group]}${active ? ' is-active' : ''}${dim ? ' is-dim' : ''}`}
    >
      {part.label}
    </button>
  );
}

/**
 * Mobile architecture: layered model, two flows, tap-to-inspect, drag and inertia, and a full overview.
 * Renders only below 900px. The 3D view is aria-hidden; the overview and step lists carry the content.
 */
export default function MobileArchitecture() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [flow, setFlow] = useState<Flow>('request');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState<Group | 'All'>('All');
  const [explode, setExplode] = useState(DEFAULT_EXPLODE);
  const [rot, setRot] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);

  // Drag state: horizontal drag turns the model, vertical drag separates the layers.
  const drag = useRef<{ x: number; y: number; rot: number; explode: number; lastX: number; vel: number } | null>(null);
  const spin = useRef<number | null>(null);

  const steps = flow === 'request' ? REQUEST_STEPS : RELEASE_STEPS;
  const current = steps[Math.min(index, steps.length - 1)];
  const activeId = selected ?? current.part;

  // Autoplay: one step at a time, stopping on the last step. Never runs with reduced motion.
  useEffect(() => {
    if (!playing || reduced) return;
    const id = window.setInterval(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 2200);
    return () => window.clearInterval(id);
  }, [playing, reduced, steps.length]);

  useEffect(() => {
    if (index >= steps.length - 1) setPlaying(false);
  }, [index, steps.length]);

  // Inertia: after a horizontal flick, the model keeps turning and slows down.
  useEffect(() => {
    return () => {
      if (spin.current !== null) cancelAnimationFrame(spin.current);
    };
  }, []);

  if (!isMobile) return null;

  const switchFlow = (next: Flow) => {
    setFlow(next);
    setIndex(0);
    setPlaying(false);
    setSelected(null);
    setShowTech(false);
  };

  const pick = (id: string) => {
    setSelected(id);
    setShowTech(false);
    setPlaying(false);
  };

  const go = (i: number) => {
    setIndex(Math.max(0, Math.min(i, steps.length - 1)));
    setSelected(null);
    setShowTech(false);
  };

  const dimmed = (p: Part) => filter !== 'All' && p.group !== filter;

  const stopSpin = () => {
    if (spin.current !== null) cancelAnimationFrame(spin.current);
    spin.current = null;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    stopSpin();
    drag.current = { x: e.clientX, y: e.clientY, rot, explode, lastX: e.clientX, vel: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.vel = e.clientX - d.lastX;
    d.lastX = e.clientX;
    setRot(Math.max(-40, Math.min(40, d.rot + dx * 0.25)));
    setExplode(Math.max(0, Math.min(100, d.explode - dy * 0.2)));
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || reduced) return;
    // Inertia: keep turning in the flick direction, slowing each frame.
    let v = d.vel * 0.25;
    const tick = () => {
      v *= 0.92;
      if (Math.abs(v) < 0.05) {
        spin.current = null;
        return;
      }
      setRot((r) => Math.max(-40, Math.min(40, r + v)));
      spin.current = requestAnimationFrame(tick);
    };
    if (Math.abs(v) > 0.05) spin.current = requestAnimationFrame(tick);
  };

  const resetView = () => {
    stopSpin();
    setRot(0);
    setExplode(DEFAULT_EXPLODE);
  };

  const shownPart = selected ? BY_ID[selected] : BY_ID[current.part];
  const shownText = selected ? BY_ID[selected].plain : current.text;
  const stepLabel = flow === 'request' ? `Step ${index + 1} of ${steps.length}` : `Step ${LETTERS[index]} of ${steps.length}`;
  const lift = explode * 0.5;

  const layerChips = (n: number) => PARTS.filter((p) => p.layer === n);

  return (
    <div className={`m-arch${playing ? ' is-playing' : ''}`}>
      <p className="m-arch-intro">Follow one visit, or one update, through the cloud. Tap any box to see what it does.</p>

      <div className="m-arch-row" role="group" aria-label="Choose a flow">
        <button type="button" className="m-arch-btn" aria-pressed={flow === 'request'} onClick={() => switchFlow('request')}>
          Visitor request
        </button>
        <button type="button" className="m-arch-btn" aria-pressed={flow === 'release'} onClick={() => switchFlow('release')}>
          How updates ship
        </button>
      </div>

      <div className="m-arch-row" role="group" aria-label="Filter by group">
        <button type="button" className="m-arch-btn" aria-pressed={filter === 'All'} onClick={() => setFilter('All')}>
          All
        </button>
        {GROUPS.map((g) => (
          <button key={g} type="button" className="m-arch-btn" aria-pressed={filter === g} onClick={() => setFilter(g)}>
            {g}
          </button>
        ))}
      </div>

      {/* The 3D model is decorative for screen readers: the overview and step cards carry the content. */}
      <div
        className="m-arch-stage"
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="m-arch-scene" style={{ transform: `rotateX(18deg) rotateY(${rot}deg)` }}>
          {LAYERS.map((layer, n) => (
            <div key={layer.title}>
              {n > 0 && <div className="m-arch-link" />}
              <div
                className={`m-arch-layer m-arch-layer-${n}${PARTS.some((p) => p.layer === n && p.id === activeId) ? ' is-active' : ''}`}
                style={{ transform: `translateZ(${(3 - n) * lift}px)` }}
              >
                <div className="m-arch-head">
                  <p className="m-arch-title">{layer.title}</p>
                  <p className="m-arch-sub">{layer.sub}</p>
                </div>

                {n === 3 ? (
                  <div className="m-arch-zones">
                    {(['A', 'B'] as const).map((zone) => (
                      <div key={zone} className="m-arch-zone">
                        <p className="m-arch-zone-title">Zone {zone}</p>
                        <div className="m-arch-subnet">
                          <span className="m-arch-subnet-name">Public subnet</span>
                          {zone === 'A' ? (
                            <Chip part={BY_ID.nat} active={activeId === 'nat'} dim={dimmed(BY_ID.nat)} onPick={pick} />
                          ) : (
                            <span className="m-arch-note">Load balancer node</span>
                          )}
                        </div>
                        <div className="m-arch-subnet">
                          <span className="m-arch-subnet-name">Private subnet</span>
                          <Chip part={BY_ID.ecs} active={activeId === 'ecs'} dim={dimmed(BY_ID.ecs)} onPick={pick} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="m-arch-chips">
                    {layerChips(n).map((p) => (
                      <Chip key={p.id} part={p} active={activeId === p.id} dim={dimmed(p)} onPick={pick} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="m-arch-hint">Drag sideways to turn the model. Drag up or down to separate the layers.</p>

      <div className="m-arch-controls">
        <label className="m-arch-slider">
          <span>Separate layers</span>
          <input type="range" min={0} max={100} value={explode} onChange={(e) => setExplode(Number(e.target.value))} />
        </label>
        <button type="button" className="m-arch-btn" onClick={resetView}>
          Reset view
        </button>
      </div>

      {reduced ? (
        /* Reduced motion: the flows as plain numbered lists, with no animation. */
        <div className="m-arch-static">
          <p className="m-arch-step">Visitor request</p>
          <ol>
            {REQUEST_STEPS.map((s) => (
              <li key={s.text}>{s.text}</li>
            ))}
          </ol>
          <p className="m-arch-step">How updates ship</p>
          <ol>
            {RELEASE_STEPS.map((s) => (
              <li key={s.text}>{s.text}</li>
            ))}
          </ol>
        </div>
      ) : (
        <>
          <article className="m-arch-card" aria-live="polite">
            <p className="m-arch-step">{selected ? 'Selected component' : stepLabel}</p>
            <h3>{shownPart.label}</h3>
            <p>{shownText}</p>
            <button type="button" className="m-arch-btn" aria-expanded={showTech} onClick={() => setShowTech((v) => !v)}>
              {showTech ? 'Hide technical name' : 'Show technical name'}
            </button>
            {showTech && <p className="m-arch-tech">{shownPart.tech}</p>}
            {selected ? (
              <button type="button" className="m-arch-btn" onClick={() => setSelected(null)}>
                Back to the flow
              </button>
            ) : (
              <div className="m-arch-nav">
                <button type="button" className="m-arch-btn" onClick={() => go(index - 1)} disabled={index === 0}>
                  Previous
                </button>
                <button type="button" className="m-arch-btn" onClick={() => go(index + 1)} disabled={index >= steps.length - 1}>
                  Next
                </button>
                <button type="button" className="m-arch-btn" aria-pressed={playing} onClick={() => setPlaying((v) => !v)}>
                  {playing ? 'Pause' : flow === 'request' ? 'Play request' : 'Play release'}
                </button>
              </div>
            )}
          </article>

          <div className="m-arch-dots">
            {steps.map((s, i) => (
              <button
                key={`${flow}-${s.part}-${i}`}
                type="button"
                className="m-arch-dot"
                aria-label={`Go to step ${i + 1} of ${steps.length}`}
                aria-current={i === index && !selected ? 'step' : undefined}
                onClick={() => go(i)}
              >
                <span className={i === index && !selected ? 'is-on' : ''} />
              </button>
            ))}
          </div>
        </>
      )}

      <section className="m-arch-overview" aria-label="Everything in the architecture">
        <h4>Overview</h4>
        {GROUPS.map((g) => {
          const items = PARTS.filter((p) => p.group === g);
          if (items.length === 0) return null;
          return (
            <div key={g} className="m-arch-group">
              <p className="m-arch-group-title">{g}</p>
              <ul>
                {items.map((p) => (
                  <li key={p.id}>
                    <strong>{p.label}</strong>
                    <span>{p.plain}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
