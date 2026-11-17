import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ecosystemMonitor, ecosystemReleasePath, ecosystemReleaseTitle, ecosystemRequestPath } from '../../config/profile';
import { usePrefersReducedMotion } from '../../hooks/useMedia';

/**
 * Architecture diagram in 3D, laid out left to right. The visitor path runs across the top row,
 * with the load balancer and private subnets inside a dashed VPC. The release path is a row below.
 * One light packet pauses at each station on the visitor path; two packets run along the release row.
 * Lazy-loaded and mounted only on capable desktops (Lazy3D). The static diagram in Ecosystem.tsx is
 * the fallback and carries the full text.
 */

const SKY = '#38bdf8';
const VIOLET = '#a78bfa';
const EMERALD = '#34d399';
const SLATE = '#94a3b8';

// Layout, in world units. Camera fitting (FitCamera) keeps everything in frame at any aspect ratio.
const NODE_W = 2.5;
const NODE_H = 1.2;
const PLATE_D = 0.12;
const ROW_Y = 1.2;
const REQ_X = [-7.2, -3.6, 0, 6.8]; // Visitor, Route 53, ALB, ECS task (the station inside the subnets)
const SUBNET = { x0: 2.4, x1: 8.8, y0: 0.0, y1: 2.3 };
const VPC = { x0: -1.55, x1: 8.95, y0: -0.3, y1: 2.6 };
const CW = { x: 6.8, y: 3.55 };
const REL_Y = -3.0;
const REL_X = [-3.2, 1.6, 6.8];
const RAIL_Y = 0.3; // visitor packets travel just under the top row
const REL_RAIL_Y = REL_Y - NODE_H / 2 - 0.22;

const REQ_BEAT = 1.5; // seconds per stop
const REL_BEAT = 1.2;
const HOLD = 0.6; // fraction of each beat spent paused at a stop

/** Packet position along a stepped path: pause at each stop, then glide to the next. Scale fades at the ends. */
function sampleStops(stops: THREE.Vector3[], time: number, beat: number, out: THREE.Vector3): number {
  const n = stops.length;
  const b = time / beat;
  const k = Math.floor(b) % n;
  const f = b - Math.floor(b);
  if (f < HOLD) {
    out.copy(stops[k]);
    return k === 0 ? Math.min(1, f / 0.25) : 1;
  }
  const u = (f - HOLD) / (1 - HOLD);
  const e = u * u * (3 - 2 * u);
  if (k === n - 1) {
    out.copy(stops[k]);
    return 1 - e;
  }
  out.lerpVectors(stops[k], stops[k + 1], e);
  return 1;
}

/** Splits a label into at most two lines of roughly `max` characters, so long names stay inside their station. */
function wrapLabel(text: string, max = 13): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Text drawn into a canvas texture on a flat plane. Drawn at 3x resolution so it stays sharp.
 * Unlike drei's Html this creates no DOM root, so it adds no React root-unmount warnings.
 */
function makeLabelTexture(lines: string[], color: string, boxed: boolean) {
  const PX = 26;
  const LINE_H = 34;
  const pad = boxed ? 18 : 4;
  const FONT = `600 ${PX}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const probe = document.createElement('canvas').getContext('2d');
  let maxW = 0;
  if (probe) {
    probe.font = FONT;
    for (const l of lines) maxW = Math.max(maxW, probe.measureText(l).width);
  } else {
    maxW = Math.max(...lines.map((l) => l.length)) * 14;
  }
  const W = Math.ceil(maxW + pad * 2);
  const H = lines.length * LINE_H + (boxed ? 18 : 4);
  const SCALE = 3;

  const c = document.createElement('canvas');
  c.width = W * SCALE;
  c.height = H * SCALE;
  const g = c.getContext('2d');
  if (g) {
    g.scale(SCALE, SCALE);
    g.font = FONT;
    if (boxed) {
      g.fillStyle = 'rgba(5,8,22,0.82)';
      g.beginPath();
      g.roundRect(0.5, 0.5, W - 1, H - 1, 12);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.16)';
      g.stroke();
    }
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const top = (H - lines.length * LINE_H) / 2;
    lines.forEach((l, i) => g.fillText(l, W / 2, top + LINE_H * (i + 0.5)));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: W / H };
}

function Label({
  lines,
  pos,
  color,
  boxed = false,
  height,
}: {
  lines: string[];
  pos: [number, number, number];
  color: string;
  boxed?: boolean;
  height?: number;
}) {
  const key = lines.join('|');
  const { tex, aspect } = useMemo(() => makeLabelTexture(key.split('|'), color, boxed), [key, color, boxed]);
  useEffect(() => () => tex.dispose(), [tex]);
  const h = height ?? (lines.length > 1 ? 0.8 : 0.5);
  return (
    <mesh position={pos}>
      <planeGeometry args={[h * aspect, h]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function useShadowTexture() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const g = c.getContext('2d');
    if (g) {
      g.filter = 'blur(14px)';
      g.fillStyle = 'rgba(0,0,0,0.85)';
      g.fillRect(36, 30, 184, 36);
    }
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** A glass plate with a glowing outline, a soft shadow behind it, and an optional label. */
function Plate({
  x,
  y,
  w,
  h,
  accent,
  shadow,
  label,
  z = 0,
  glass = 0.84,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  shadow: THREE.Texture;
  label?: string;
  z?: number;
  glass?: number;
}) {
  const geo = useMemo(() => new THREE.BoxGeometry(w, h, PLATE_D), [w, h]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group position={[x, y, z]} rotation={[-0.1, 0, 0]}>
      <mesh position={[0.08, -h / 2 - 0.18, -0.3]}>
        <planeGeometry args={[w * 1.02, 0.42]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.75} depthWrite={false} />
      </mesh>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          color="#0c1630"
          transparent
          opacity={glass}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          depthWrite={false}
        />
      </mesh>
      <Edges geometry={geo} color={accent} threshold={15} transparent opacity={0.95} />
      {label && <Label lines={wrapLabel(label)} pos={[0, 0, PLATE_D / 2 + 0.03]} color="#f1f5f9" boxed />}
    </group>
  );
}

function Connector({ x0, x1, y, color, label, labelY, labelColor }: { x0: number; x1: number; y: number; color: string; label?: string; labelY: number; labelColor: string }) {
  return (
    <group>
      <Line points={[[x0, y, 0.2], [x1 - 0.14, y, 0.2]]} color={color} lineWidth={1.4} transparent opacity={0.75} />
      <mesh position={[x1 - 0.07, y, 0.2]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.16, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
      {label && <Label lines={[label]} pos={[(x0 + x1) / 2, labelY, 0.2]} color={labelColor} height={0.26} />}
    </group>
  );
}

function Packet({ stops, beat, offset, color, reduced }: { stops: THREE.Vector3[]; beat: number; offset: number; color: string; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = reduced ? offset : clock.elapsedTime + offset;
    const scale = sampleStops(stops, t, beat, tmp);
    group.current.position.copy(tmp);
    group.current.scale.setScalar(Math.max(0.001, scale));
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Pulls the camera back far enough that the whole diagram fits the canvas at any aspect ratio. */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(1, size.height);
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const needHalfH = 4.5;
    const needHalfW = 9.2;
    const z = Math.max(needHalfH / t, needHalfW / (t * aspect));
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Scene() {
  const reduced = usePrefersReducedMotion();
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const shadow = useShadowTexture();

  const reqStops = useMemo(() => REQ_X.map((x) => new THREE.Vector3(x, RAIL_Y, 0.35)), []);
  const relStops = useMemo(() => REL_X.map((x) => new THREE.Vector3(x, REL_RAIL_Y, 0.35)), []);

  useFrame((state) => {
    if (!group.current) return;
    if (!reduced) {
      pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
      pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;
    }
    group.current.rotation.y = pointer.current.x * 0.05;
    group.current.rotation.x = -pointer.current.y * 0.03;
  });

  const req = ecosystemRequestPath;
  const rel = ecosystemReleasePath;
  const halfW = NODE_W / 2;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 8]} intensity={0.9} color="#dbeafe" />
      <pointLight position={[-6, 3, 6]} intensity={6} color={SKY} distance={24} />
      <pointLight position={[6, -3, 6]} intensity={5} color={VIOLET} distance={24} />

      <group ref={group}>
        {/* VPC boundary, subnets band, and the two availability-zone rows. */}
        <Line
          points={[
            [VPC.x0, VPC.y0, 0.05],
            [VPC.x1, VPC.y0, 0.05],
            [VPC.x1, VPC.y1, 0.05],
            [VPC.x0, VPC.y1, 0.05],
            [VPC.x0, VPC.y0, 0.05],
          ]}
          color={VIOLET}
          lineWidth={1.2}
          dashed
          dashSize={0.2}
          gapSize={0.13}
          transparent
          opacity={0.8}
        />
        <Label lines={['VPC']} pos={[VPC.x0 + 0.55, VPC.y0 - 0.32, 0.05]} color="#ddd6fe" height={0.3} />

        <Plate
          x={(SUBNET.x0 + SUBNET.x1) / 2}
          y={(SUBNET.y0 + SUBNET.y1) / 2}
          w={SUBNET.x1 - SUBNET.x0}
          h={SUBNET.y1 - SUBNET.y0}
          accent={VIOLET}
          shadow={shadow}
          glass={0.4}
        />
        <Label lines={[`${req[3].label} · 2 AZs`]} pos={[(SUBNET.x0 + SUBNET.x1) / 2, SUBNET.y1 - 0.28, 0.12]} color="#ddd6fe" height={0.34} />
        <Label lines={['Subnet · AZ 1']} pos={[3.6, 1.5, 0.12]} color="#e9d5ff" boxed height={0.34} />
        <Label lines={['Subnet · AZ 2']} pos={[3.6, 0.7, 0.12]} color="#e9d5ff" boxed height={0.34} />

        {/* Visitor path stations. ECS sits inside the subnets band. */}
        {/* Stations: Visitor, Route 53, ALB, ECS task. The subnets are the band above, so they are not a station. */}
        {[req[0], req[1], req[2], req[4]].map((step, i) => (
          <Plate
            key={step.id}
            x={REQ_X[i]}
            y={ROW_Y}
            w={NODE_W}
            h={NODE_H}
            accent={i === 3 ? VIOLET : SKY}
            shadow={shadow}
            label={step.label}
          />
        ))}

        {/* Connectors between visitor-path stations, with protocol labels above each arrow. */}
        <Connector x0={REQ_X[0] + halfW} x1={REQ_X[1] - halfW} y={ROW_Y} color={SKY} label={req[1].arrow ?? ''} labelY={ROW_Y + 0.82} labelColor="#7dd3fc" />
        <Connector x0={REQ_X[1] + halfW} x1={REQ_X[2] - halfW} y={ROW_Y} color={SKY} label={req[2].arrow ?? ''} labelY={ROW_Y + 0.82} labelColor="#7dd3fc" />
        <Connector x0={REQ_X[2] + halfW} x1={SUBNET.x0} y={ROW_Y} color={SKY} label={req[3].arrow ?? ''} labelY={ROW_Y + 0.82} labelColor="#7dd3fc" />

        {/* Supporting monitoring station, linked to the container by a dotted line. */}
        <Plate x={CW.x} y={CW.y} w={NODE_W} h={0.9} accent={SLATE} shadow={shadow} label={ecosystemMonitor.label} />
        <Line
          points={[
            [REQ_X[3], ROW_Y + NODE_H / 2, 0.2],
            [REQ_X[3], CW.y - 0.45, 0.2],
          ]}
          color={SLATE}
          lineWidth={1}
          dashed
          dashSize={0.08}
          gapSize={0.08}
          transparent
          opacity={0.85}
        />

        {/* Release row: separate lane, emerald, labelled as not on the visitor path. */}
        <Label lines={[ecosystemReleaseTitle.toUpperCase()]} pos={[0, -1.75, 0]} color="#6ee7b7" height={0.3} />
        {rel.map((step, i) => (
          <Plate key={step.id} x={REL_X[i]} y={REL_Y} w={NODE_W} h={NODE_H} accent={EMERALD} shadow={shadow} label={step.label} />
        ))}
        <Connector x0={REL_X[0] + halfW} x1={REL_X[1] - halfW} y={REL_Y} color={EMERALD} label={rel[1].arrow ?? ''} labelY={REL_Y + 0.7} labelColor="#6ee7b7" />
        <Connector x0={REL_X[1] + halfW} x1={REL_X[2] - halfW} y={REL_Y} color={EMERALD} label={rel[2].arrow ?? ''} labelY={REL_Y + 0.7} labelColor="#6ee7b7" />

        {/* Packets: one on the visitor path (white-blue), two on the release row (emerald). */}
        <Packet stops={reqStops} beat={REQ_BEAT} offset={0} color="#e0f2fe" reduced={reduced} />
        <Packet stops={relStops} beat={REL_BEAT} offset={0} color="#6ee7b7" reduced={reduced} />
        <Packet stops={relStops} beat={REL_BEAT} offset={REL_BEAT * 1.5} color="#6ee7b7" reduced={reduced} />
      </group>
    </>
  );
}

export default function FlowScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 16], fov: 30 }} gl={{ antialias: true, alpha: true }} aria-hidden="true" role="presentation">
      <FitCamera />
      <Scene />
    </Canvas>
  );
}
