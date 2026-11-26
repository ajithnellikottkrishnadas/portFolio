import { useEffect, useState } from 'react';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import './mobile-architecture.css';

type Group = 'Visitors' | 'Network' | 'Security' | 'Servers' | 'Updates' | 'Monitoring';
type Flow = 'request' | 'release';
type Part = { id: string; label: string; plain: string; tech: string; group: Group; links: string[] };

const GROUPS: Group[] = ['Visitors', 'Network', 'Security', 'Servers', 'Updates', 'Monitoring'];
const LETTERS = 'ABCD';

/** Every component. `links` lists the components it talks to. */
const PARTS: Part[] = [
  { id: 'visitor', label: 'Visitor', plain: "Your browser asks for the site.", tech: 'Browser over HTTPS', group: 'Visitors', links: ['route53'] },
  { id: 'godaddy', label: 'Domain registrar (GoDaddy)', plain: "Holds the domain name and points it to AWS's nameservers.", tech: 'Nameservers set to Route 53', group: 'Network', links: ['route53'] },
  { id: 'github', label: 'GitHub', plain: 'Stores the code. Pushing a change here starts an automatic deploy.', tech: 'git push origin main', group: 'Updates', links: ['gha'] },
  { id: 'gha', label: 'GitHub Actions', plain: 'Checks and builds the image, then pushes it to ECR. Runs outside AWS.', tech: 'build-check, then deploy job', group: 'Updates', links: ['github', 'iam', 'ecr'] },
  { id: 'route53', label: 'Route 53', plain: "The address book. It turns the domain name into the load balancer's address.", tech: 'Alias A record, ap-south-1', group: 'Network', links: ['visitor', 'godaddy', 'igw'] },
  { id: 'acm', label: 'ACM', plain: 'Encrypts the connection. The padlock in the browser comes from here.', tech: 'TLS certificate, HTTPS 443', group: 'Security', links: ['alb'] },
  { id: 'iam', label: 'IAM', plain: 'Controls who may do what. GitHub gets temporary access only, with no stored keys.', tech: 'OIDC role ANP-IN-GHDEPLOY01', group: 'Security', links: ['gha', 'ecr'] },
  { id: 'cloudwatch', label: 'CloudWatch', plain: 'Records what the site does, so problems can be found.', tech: '/ecs/ANP-IN-WEB01', group: 'Monitoring', links: ['ecs'] },
  { id: 'ecr', label: 'ECR', plain: 'Stores the packaged version of the site.', tech: 'anp-in-ecr01', group: 'Updates', links: ['gha', 'ecs'] },
  { id: 'igw', label: 'Internet gateway', plain: 'The door between the internet and the network.', tech: 'ANP-IN-IGW01', group: 'Network', links: ['route53', 'alb', 'nat'] },
  { id: 'alb', label: 'Application Load Balancer', plain: 'HTTPS on 443. Redirects HTTP to HTTPS. Shares visitors across the servers.', tech: 'ANP-IN-ALB01', group: 'Network', links: ['igw', 'acm', 'sg', 'tg'] },
  { id: 'sg', label: 'Security groups', plain: 'Firewalls. The load balancer accepts web traffic; the servers accept traffic only from the load balancer.', tech: 'ANP-IN-ALBSG01, ANP-IN-ECSSG01', group: 'Security', links: ['alb', 'ecs'] },
  { id: 'tg', label: 'Target group', plain: 'The list of healthy servers the load balancer can send visitors to.', tech: 'ANP-IN-TG01, port 8080, /health', group: 'Network', links: ['alb', 'ecs'] },
  { id: 'nat', label: 'NAT gateway', plain: 'Lets the servers download updates and images, while nothing from outside can reach them. Its public address is an Elastic IP.', tech: 'ANP-IN-NAT01, ANP-IN-EIP01', group: 'Network', links: ['ecs', 'igw'] },
  { id: 'ecs', label: 'ECS task (Fargate)', plain: 'Runs the website in a container on port 8080 (nginx). Two copies run at all times.', tech: 'ANP-IN-SVC01, ANP-IN-TASK01', group: 'Servers', links: ['tg', 'ecr', 'nat', 'cloudwatch', 'sg'] },
];

const BY_ID: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p]));

type Node = { id: string; part: string; x: number; y: number; w: number; h: number; title: string; sub: string; tone: 'ext' | 'cloud' | 'net' | 'sec' | 'compute' | 'ops' | 'release' };
type Path = { id: string; d: string; dashed?: boolean; tone?: 'release' | 'sec' };

/** Positions follow the reference diagram: outside the account, then the cloud, the VPC and two zones. */
const NODES: Node[] = [
  { id: 'visitor', part: 'visitor', x: 20, y: 40, w: 150, h: 46, title: 'Visitor', sub: 'Browser over HTTPS', tone: 'ext' },
  { id: 'godaddy', part: 'godaddy', x: 190, y: 40, w: 150, h: 46, title: 'GoDaddy', sub: 'Domain registrar', tone: 'ext' },
  { id: 'github', part: 'github', x: 20, y: 96, w: 150, h: 46, title: 'GitHub', sub: 'Code and pushes', tone: 'ext' },
  { id: 'gha', part: 'gha', x: 190, y: 96, w: 150, h: 46, title: 'GitHub Actions', sub: 'Builds, outside AWS', tone: 'ext' },
  { id: 'route53', part: 'route53', x: 20, y: 200, w: 100, h: 46, title: 'Route 53', sub: 'DNS record', tone: 'cloud' },
  { id: 'acm', part: 'acm', x: 130, y: 200, w: 100, h: 46, title: 'ACM', sub: 'TLS certificate', tone: 'cloud' },
  { id: 'iam', part: 'iam', x: 240, y: 200, w: 100, h: 46, title: 'IAM', sub: 'Temporary access', tone: 'cloud' },
  { id: 'igw', part: 'igw', x: 120, y: 352, w: 100, h: 44, title: 'Internet GW', sub: 'The door in', tone: 'net' },
  { id: 'alb', part: 'alb', x: 110, y: 424, w: 220, h: 52, title: 'Application Load Balancer', sub: 'HTTPS 443, redirects HTTP', tone: 'net' },
  { id: 'sgalb', part: 'sg', x: 236, y: 494, w: 100, h: 22, title: 'SG: ALB', sub: '', tone: 'sec' },
  { id: 'tg', part: 'tg', x: 110, y: 526, w: 220, h: 26, title: 'Target group · healthy tasks only', sub: '', tone: 'net' },
  { id: 'nat', part: 'nat', x: 42, y: 590, w: 116, h: 26, title: 'NAT gateway', sub: '', tone: 'net' },
  { id: 'ecsA', part: 'ecs', x: 42, y: 628, w: 116, h: 38, title: 'ECS task', sub: 'nginx :8080', tone: 'compute' },
  { id: 'ecsB', part: 'ecs', x: 202, y: 628, w: 116, h: 38, title: 'ECS task', sub: 'nginx :8080', tone: 'compute' },
  { id: 'sgecs', part: 'sg', x: 74, y: 680, w: 212, h: 18, title: 'Security group (ECS): port 8080 from ALB only', sub: '', tone: 'sec' },
  { id: 'cw', part: 'cloudwatch', x: 20, y: 712, w: 100, h: 40, title: 'CloudWatch', sub: 'Logs and health', tone: 'ops' },
  { id: 'ecr', part: 'ecr', x: 240, y: 712, w: 100, h: 40, title: 'ECR', sub: 'Container images', tone: 'release' },
];

const PATHS: Path[] = [
  { id: 'visitor-r53', d: 'M70 86 V200' },
  { id: 'gd-r53', d: 'M210 86 V176 H100 V200', dashed: true },
  { id: 'gh-gha', d: 'M170 119 H190', tone: 'release' },
  { id: 'gha-ecr', d: 'M340 119 H356 V732 H340', tone: 'release' },
  { id: 'iam-gha', d: 'M290 200 V142', dashed: true, tone: 'sec' },
  { id: 'r53-igw', d: 'M70 246 V372 H120' },
  { id: 'acm-alb', d: 'M226 246 V424', dashed: true, tone: 'sec' },
  { id: 'igw-alb', d: 'M170 396 V424' },
  { id: 'alb-sg', d: 'M300 476 V494', dashed: true, tone: 'sec' },
  { id: 'alb-tg', d: 'M200 476 V526' },
  { id: 'tg-azA', d: 'M120 552 V566' },
  { id: 'tg-azB', d: 'M270 552 V566' },
  { id: 'nat-igw', d: 'M42 603 H26 V388 H120', dashed: true },
  { id: 'ecsA-cw', d: 'M42 647 H26 V712', dashed: true, tone: 'release' },
  { id: 'ecr-ecs', d: 'M250 712 V700 H100 V666', tone: 'release' },
];

type Step = { part: string; text: string; nodes: string[]; paths: string[] };

const REQUEST_STEPS: Step[] = [
  { part: 'visitor', text: 'Visitor types the domain.', nodes: ['visitor'], paths: ['visitor-r53'] },
  { part: 'route53', text: "Route 53 returns the load balancer's address.", nodes: ['route53'], paths: ['r53-igw'] },
  { part: 'alb', text: "The request reaches the load balancer over HTTPS. ACM's certificate is used here.", nodes: ['igw', 'alb', 'acm'], paths: ['igw-alb', 'acm-alb'] },
  { part: 'tg', text: 'The load balancer sends the request to a healthy task through the target group.', nodes: ['alb', 'tg'], paths: ['alb-tg', 'tg-azA', 'tg-azB'] },
  { part: 'ecs', text: 'The task answers. The page returns to the visitor.', nodes: ['ecsA', 'ecsB'], paths: ['tg-azA'] },
];

const RELEASE_STEPS: Step[] = [
  { part: 'github', text: 'You push code to GitHub.', nodes: ['github'], paths: ['gh-gha'] },
  { part: 'gha', text: 'GitHub Actions checks and builds the image, then pushes it to ECR. It signs in with IAM temporary access.', nodes: ['gha', 'iam'], paths: ['iam-gha', 'gha-ecr'] },
  { part: 'ecs', text: 'ECS starts new tasks from the new image, and replaces the old ones only when the new ones pass their health checks.', nodes: ['ecr', 'ecsA', 'ecsB'], paths: ['ecr-ecs'] },
  { part: 'cloudwatch', text: "CloudWatch records the new tasks' logs and health.", nodes: ['cw'], paths: ['ecsA-cw'] },
];

/** Plain-language connections, each with a fuller explanation shown when tapped. */
const CONNECTIONS: { from: string; to: string; why: string; detail: string }[] = [
  { from: 'Visitor', to: 'Route 53', why: 'Looks up the domain name', detail: 'Your browser asks Route 53 where the domain lives. Route 53 answers with the load balancer address.' },
  { from: 'Route 53', to: 'Internet gateway', why: 'Sends the visitor into the VPC', detail: 'The alias record points the domain at the load balancer, and traffic enters the VPC through the internet gateway.' },
  { from: 'Internet gateway', to: 'Load balancer', why: 'Passes the request in', detail: 'The gateway hands the request to the load balancer, which lives in the public subnets of both zones.' },
  { from: 'ACM certificate', to: 'Load balancer', why: 'Encrypts HTTPS on port 443', detail: 'The load balancer uses the ACM certificate to end the HTTPS connection. The padlock in the browser comes from this certificate.' },
  { from: 'Load balancer', to: 'Target group', why: 'Chooses only healthy tasks', detail: 'The target group keeps the list of tasks. The load balancer only sends requests to tasks that pass the /health check.' },
  { from: 'Target group', to: 'ECS task (zone A or B)', why: 'Sends the request to a task', detail: 'A task in zone A or zone B answers. Two copies run at all times, so one zone can fail without taking the site down.' },
  { from: 'Security group (ALB)', to: 'Load balancer', why: 'Allows web traffic in', detail: 'The load balancer security group allows traffic on ports 80 and 443 from anywhere.' },
  { from: 'Security group (ECS)', to: 'ECS task', why: 'Allows port 8080 only from the load balancer', detail: 'The task security group accepts port 8080 only from the load balancer security group, so visitors cannot reach a task directly.' },
  { from: 'ECS task (private subnet)', to: 'NAT gateway (zone A)', why: 'Sends out requests for updates', detail: 'The task has no public address. Outgoing requests for images and updates go through the NAT gateway in zone A.' },
  { from: 'NAT gateway', to: 'Internet gateway', why: 'Gives the tasks a route out', detail: 'The NAT gateway uses the internet gateway to reach the internet. Nothing from the internet can start a connection back in.' },
  { from: 'GitHub', to: 'GitHub Actions', why: 'Runs checks and the build on push', detail: 'A push to main starts the workflow on GitHub. It runs the type check and build first, then deploys.' },
  { from: 'GitHub Actions', to: 'ECR', why: 'Uploads the new image', detail: 'The workflow builds the container and uploads it to ECR in ap-south-1, tagged with the commit ID.' },
  { from: 'IAM role', to: 'GitHub Actions', why: 'Gives temporary access', detail: 'GitHub asks AWS for a short-lived token. IAM checks the repository and branch, then grants access for about an hour.' },
  { from: 'ECR', to: 'ECS task', why: 'The task pulls its image', detail: 'When ECS starts a new task, it pulls the matching image from ECR.' },
  { from: 'ECS task', to: 'CloudWatch', why: 'Sends logs and health results', detail: 'The container writes logs to CloudWatch, where problems can be found.' },
];

const TONE_FILL: Record<Node['tone'], string> = {
  ext: 'fill-slate-400/10 stroke-slate-400/60',
  cloud: 'fill-sky-400/10 stroke-sky-400/60',
  net: 'fill-violet-400/10 stroke-violet-400/60',
  sec: 'fill-amber-300/10 stroke-amber-300/60',
  compute: 'fill-orange-400/10 stroke-orange-400/60',
  ops: 'fill-rose-300/10 stroke-rose-300/60',
  release: 'fill-emerald-400/10 stroke-emerald-400/60',
};

/** The fixed category map, shown as a key under the diagram. */
const LEGEND: { label: string; cls: string }[] = [
  { label: 'Outside AWS', cls: 'bg-slate-400/40' },
  { label: 'Cloud', cls: 'bg-sky-400/50' },
  { label: 'Network', cls: 'bg-violet-400/50' },
  { label: 'Security', cls: 'bg-amber-300/50' },
  { label: 'Servers', cls: 'bg-orange-400/50' },
  { label: 'Release', cls: 'bg-emerald-400/50' },
];

/**
 * Mobile architecture: a clickable diagram that follows the reference layout, two flows,
 * a connections list and an overview. Renders only below 900px.
 */
export default function MobileArchitecture() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [flow, setFlow] = useState<Flow>('request');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState<Group | 'All'>('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [openConn, setOpenConn] = useState<number | null>(null);
  const [openOverview, setOpenOverview] = useState<string | null>(null);

  const steps = flow === 'request' ? REQUEST_STEPS : RELEASE_STEPS;
  const current = steps[Math.min(index, steps.length - 1)];

  // Autoplay: one step at a time, stopping on the last step. Never runs with reduced motion.
  useEffect(() => {
    if (!playing || reduced) return;
    const id = window.setInterval(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 2200);
    return () => window.clearInterval(id);
  }, [playing, reduced, steps.length]);

  useEffect(() => {
    if (index >= steps.length - 1) setPlaying(false);
  }, [index, steps.length]);

  if (!isMobile) return null;

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

  // When a component is selected, its nodes and their links light up; otherwise the current step does.
  const litNodes = new Set<string>(selected ? NODES.filter((n) => n.part === selected).map((n) => n.id) : current.nodes);
  const litPaths = new Set<string>(selected ? [] : current.paths);
  const dim = (p: Part) => filter !== 'All' && p.group !== filter;

  const shown = selected ? BY_ID[selected] : BY_ID[current.part];
  const shownText = selected ? BY_ID[selected].plain : current.text;
  const stepLabel = flow === 'request' ? `Step ${index + 1} of ${steps.length}` : `Step ${LETTERS[index]} of ${steps.length}`;

  return (
    <div className="m-arch">
      <p className="m-arch-intro">Follow one visit, or one update, through the cloud. Tap any box to see what it connects to.</p>

      {/* Two tiles, equally spaced and centred. */}
      <div className="m-arch-tiles" role="group" aria-label="Choose a flow">
        <button type="button" className="m-arch-tile" aria-pressed={flow === 'request'} onClick={() => switchFlow('request')}>
          Visitor request
        </button>
        <button type="button" className="m-arch-tile" aria-pressed={flow === 'release'} onClick={() => switchFlow('release')}>
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

      {/* The diagram: decorative for screen readers, the lists below carry the same content. */}
      <figure className="m-arch-diagram" aria-hidden="true">
        <svg viewBox="0 0 360 790" role="presentation">
          <defs>
            <marker id="m-arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* Containers */}
          <rect x="8" y="8" width="344" height="144" rx="14" className="m-arch-box-outside" />
          <text x="18" y="26" className="m-arch-label">Outside the AWS account</text>

          <rect x="8" y="164" width="344" height="618" rx="14" className="m-arch-box-cloud" />
          <text x="18" y="776" className="m-arch-label">AWS Cloud · ap-south-1 (Mumbai)</text>

          <rect x="20" y="330" width="320" height="360" rx="10" className="m-arch-box-vpc" />
          <text x="330" y="352" textAnchor="end" className="m-arch-label m-arch-label-green">VPC · 10.0.0.0/16</text>

          <rect x="30" y="496" width="140" height="180" rx="10" className="m-arch-box-az" />
          <text x="38" y="512" className="m-arch-sub">Zone A</text>
          <rect x="190" y="496" width="140" height="180" rx="10" className="m-arch-box-az" />
          <text x="198" y="512" className="m-arch-sub">Zone B</text>

          <rect x="36" y="586" width="128" height="34" rx="6" className="m-arch-subnet-public" />
          <rect x="36" y="624" width="128" height="46" rx="6" className="m-arch-subnet-private" />
          <rect x="196" y="586" width="128" height="34" rx="6" className="m-arch-subnet-public" />
          <text x="260" y="607" textAnchor="middle" className="m-arch-node-sub">ALB node</text>
          <rect x="196" y="624" width="128" height="46" rx="6" className="m-arch-subnet-private" />

          {/* Connections */}
          {PATHS.map((p) => {
            const lit = litPaths.has(p.id);
            const isSecPath = p.tone === 'sec';
            const cls = [
              'm-arch-path',
              p.dashed ? 'is-dashed' : '',
              p.tone === 'release' ? 'is-release' : '',
              isSecPath ? 'is-sec' : '',
              lit ? 'is-lit' : '',
            ].join(' ');
            return <path key={p.id} d={p.d} className={cls} markerEnd="url(#m-arch-arrow)" />;
          })}

          {/* Components */}
          {NODES.map((n) => {
            const part = BY_ID[n.part];
            const lit = litNodes.has(n.id);
            const dimmed = dim(part) || (!selected && !lit && litNodes.size > 0 && playing);
            return (
              <g
                key={n.id}
                className={`m-arch-node ${TONE_FILL[n.tone]}${lit ? ' is-lit' : ''}${dimmed ? ' is-dim' : ''}`}
                onClick={() => pick(n.part)}
                role="presentation"
              >
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="8" className="m-arch-node-box" />
                {n.sub ? (
                  <>
                    <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 2} textAnchor="middle" className="m-arch-node-title">
                      {n.title}
                    </text>
                    <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 12} textAnchor="middle" className="m-arch-node-sub">
                      {n.sub}
                    </text>
                  </>
                ) : (
                  <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle" className="m-arch-node-title">
                    {n.title}
                  </text>
                )}
              </g>
            );
          })}

        </svg>
      </figure>

      <ul className="m-arch-legend" aria-hidden="true">
        {LEGEND.map((l) => (
          <li key={l.label}>
            <span className={l.cls} />
            {l.label}
          </li>
        ))}
      </ul>

      {/* Step controls. */}
      <article className="m-arch-card" aria-live="polite">
        <p className="m-arch-step">{selected ? 'Selected component' : stepLabel}</p>
        <h3>{shown.label}</h3>
        <p>{shownText}</p>
        <button type="button" className="m-arch-btn" aria-expanded={showTech} onClick={() => setShowTech((v) => !v)}>
          {showTech ? 'Hide technical name' : 'Show technical name'}
        </button>
        {showTech && <p className="m-arch-tech">{shown.tech}</p>}

        {selected ? (
          <>
            <p className="m-arch-step">Connected to</p>
            <div className="m-arch-row">
              {BY_ID[selected].links.map((id) => (
                <button key={id} type="button" className="m-arch-btn" onClick={() => pick(id)}>
                  {BY_ID[id].label}
                </button>
              ))}
            </div>
            <button type="button" className="m-arch-btn" onClick={() => setSelected(null)}>
              Back to the flow
            </button>
          </>
        ) : (
          <div className="m-arch-row">
            <button type="button" className="m-arch-btn" onClick={() => go(index - 1)} disabled={index === 0}>
              Previous
            </button>
            <button type="button" className="m-arch-btn" onClick={() => go(index + 1)} disabled={index >= steps.length - 1}>
              Next
            </button>
            {!reduced && (
              <button type="button" className="m-arch-btn" aria-pressed={playing} onClick={() => setPlaying((v) => !v)}>
                {playing ? 'Pause' : flow === 'request' ? 'Play request' : 'Play release'}
              </button>
            )}
          </div>
        )}
      </article>

      {!selected && (
        <div className="m-arch-dots">
          {steps.map((s, i) => (
            <button
              key={`${flow}-${s.part}-${i}`}
              type="button"
              className="m-arch-dot"
              aria-label={`Go to step ${i + 1} of ${steps.length}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span className={i === index ? 'is-on' : ''} />
            </button>
          ))}
        </div>
      )}

      {reduced && (
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
      )}

      {/* How they connect: tap any row for the full explanation. */}
      <section className="m-arch-section" aria-label="How the services connect">
        <h4>How they connect</h4>
        <ul className="m-arch-accordion">
          {CONNECTIONS.map((c, i) => {
            const open = openConn === i;
            return (
              <li key={`${c.from}-${c.to}`}>
                <button type="button" className="m-arch-acc-btn" aria-expanded={open} onClick={() => setOpenConn(open ? null : i)}>
                  <span>
                    <strong>
                      {c.from} → {c.to}
                    </strong>
                    <span className="m-arch-acc-why">{c.why}</span>
                  </span>
                  <span aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open && <p className="m-arch-acc-body">{c.detail}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Overview: every component, tap to expand. */}
      <section className="m-arch-section" aria-label="Everything in the architecture">
        <h4>Overview</h4>
        {GROUPS.map((g) => {
          const items = PARTS.filter((p) => p.group === g);
          if (items.length === 0) return null;
          return (
            <div key={g} className="m-arch-group">
              <p className="m-arch-group-title">{g}</p>
              <ul className="m-arch-accordion">
                {items.map((p) => {
                  const open = openOverview === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="m-arch-acc-btn"
                        aria-expanded={open}
                        onClick={() => setOpenOverview(open ? null : p.id)}
                      >
                        <span>
                          <strong>{p.label}</strong>
                        </span>
                        <span aria-hidden="true">{open ? '−' : '+'}</span>
                      </button>
                      {open && (
                        <div className="m-arch-acc-body">
                          <p>{p.plain}</p>
                          <p className="m-arch-tech">{p.tech}</p>
                          <div className="m-arch-row">
                            {p.links.map((id) => (
                              <button key={id} type="button" className="m-arch-btn" onClick={() => pick(id)}>
                                {BY_ID[id].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
