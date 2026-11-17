import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, Line, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../../hooks/useMedia';

/**
 * Cloud infrastructure scene: a request path of connected nodes with data packets
 * travelling along it, floating "cloud" volumes and ambient particles.
 * Loaded lazily and only mounted on capable desktops (see use3DEnabled).
 */

type Vec3 = [number, number, number];

const NODES: { id: string; label: string; pos: Vec3; color: string }[] = [
  { id: 'user', label: 'User', pos: [-4.4, 0.1, 0.4], color: '#e2e8f0' },
  { id: 'dns', label: 'DNS', pos: [-3.0, 1.5, -0.6], color: '#38bdf8' },
  { id: 'lb', label: 'Load Balancer', pos: [-1.6, -0.9, 0.6], color: '#38bdf8' },
  { id: 'app', label: 'Application', pos: [-0.1, 1.3, 0], color: '#a78bfa' },
  { id: 'ctr', label: 'Containers', pos: [1.4, -1.1, -0.4], color: '#a78bfa' },
  { id: 'db', label: 'Database', pos: [2.9, 0.9, 0.5], color: '#22d3ee' },
  { id: 'store', label: 'Storage', pos: [4.3, -0.5, 0], color: '#22d3ee' },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [2, 4],
];

const CLOUDS: { pos: Vec3; scale: number; speed: number }[] = [
  { pos: [-4.2, 2.4, -3.0], scale: 1.0, speed: 0.6 },
  { pos: [3.9, 2.5, -3.6], scale: 1.1, speed: 0.45 },
  { pos: [0.4, -3.0, -4.0], scale: 1.3, speed: 0.35 },
  // Far background cloud: sits well behind the path to add depth.
  { pos: [1.8, 4.2, -8.5], scale: 1.8, speed: 0.25 },
];

function CloudBlob({ pos, scale, speed }: { pos: Vec3; scale: number; speed: number }) {
  return (
    <Float speed={speed * 2} rotationIntensity={0.25} floatIntensity={0.9}>
      <group position={pos} scale={scale}>
        {[
          [0, 0, 0, 0.9],
          [0.9, 0.15, 0.1, 0.65],
          [-0.8, 0.1, -0.1, 0.7],
          [0.2, 0.45, 0.2, 0.55],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r, 32, 32]} />
            <meshPhysicalMaterial
              color="#60a5fa"
              transparent
              opacity={0.1}
              roughness={0.25}
              metalness={0.1}
              clearcoat={0.8}
              depthWrite={false}
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[1.05, 24, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.07} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  );
}

function ServerNode({ pos, label, color }: { pos: Vec3; label: string; color: string }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 0.6;
  });
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color="#0b1224" emissive={color} emissiveIntensity={0.5} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.36, 0.008, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <Html center distanceFactor={9} position={[0, -0.62, 0]} style={{ pointerEvents: 'none' }}>
        <span className="whitespace-nowrap rounded-md border border-white/10 bg-[#050816]/70 px-2 py-0.5 font-mono text-[10px] tracking-wide text-slate-300 backdrop-blur">
          {label}
        </span>
      </Html>
    </group>
  );
}

function Packet({ from, to, offset, speed, color }: { from: Vec3; to: Vec3; offset: number; speed: number; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const a = useMemo(() => new THREE.Vector3(...from), [from]);
  const b = useMemo(() => new THREE.Vector3(...to), [to]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    mesh.current.position.lerpVectors(a, b, t);
    // Small arc so packets read as travelling through the network, not sliding on a line.
    mesh.current.position.y += Math.sin(t * Math.PI) * 0.35;
    const s = 0.7 + Math.sin(t * Math.PI) * 0.5;
    mesh.current.scale.setScalar(s);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Scene() {
  const reduced = usePrefersReducedMotion();
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const target = state.pointer;
    pointer.current.x += (target.x - pointer.current.x) * 0.05;
    pointer.current.y += (target.y - pointer.current.y) * 0.05;
    if (group.current) {
      group.current.rotation.y = pointer.current.x * 0.35;
      group.current.rotation.x = -pointer.current.y * 0.18;
    }
    // Slow camera drift for parallax depth. Frozen under reduced motion.
    const t = state.clock.elapsedTime;
    state.camera.position.x = reduced ? 0 : Math.sin(t * 0.07) * 0.7;
    state.camera.position.y = reduced ? 0 : Math.sin(t * 0.05) * 0.4;
    state.camera.position.z = 10;
    state.camera.lookAt(0, 0, 0);
  });

  const edgePoints = useMemo(
    () =>
      EDGES.map(([i, j]) => [
        NODES[i].pos as Vec3,
        NODES[j].pos as Vec3,
      ]),
    [],
  );

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#dbeafe" />
      <pointLight position={[-4, -2, 3]} intensity={6} color="#22d3ee" distance={12} />
      <pointLight position={[4, 2, -2]} intensity={5} color="#a78bfa" distance={12} />

      <group ref={group} scale={0.86}>
        {CLOUDS.map((c, i) => (
          <CloudBlob key={i} {...c} />
        ))}

        {NODES.map((n) => (
          <ServerNode key={n.id} pos={n.pos} label={n.label} color={n.color} />
        ))}

        {edgePoints.map(([a, b], i) => (
          <Line
            key={i}
            points={[a, b]}
            color="#7dd3fc"
            lineWidth={1}
            transparent
            opacity={0.28}
          />
        ))}

        {EDGES.map(([i, j], k) =>
          [0, 0.5].map((offset) => (
            <Packet
              key={`${k}-${offset}`}
              from={NODES[i].pos as Vec3}
              to={NODES[j].pos as Vec3}
              offset={offset + k * 0.13}
              speed={0.22 + (k % 3) * 0.05}
              color={k % 2 === 0 ? '#38bdf8' : '#c4b5fd'}
            />
          )),
        )}

        {/* Three depth layers of particles: distant dust, mid sparkles, near bokeh. */}
        <Stars radius={30} depth={18} count={260} factor={2.5} saturation={0} fade speed={0.3} />
        <Sparkles count={50} scale={[18, 9, 6]} position={[0, 0, -3]} size={1.4} speed={0.15} color="#93c5fd" opacity={0.45} />
        <Sparkles count={70} scale={[12, 6, 6]} size={2} speed={0.25} color="#93c5fd" opacity={0.6} />
        <Sparkles count={14} scale={[9, 5, 3]} position={[0, 0, 3]} size={3.5} speed={0.35} color="#c4b5fd" opacity={0.35} />
      </group>
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      role="presentation"
    >
      <Scene />
    </Canvas>
  );
}
