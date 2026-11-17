import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';
import { learningRoadmap } from '../../config/profile';

/**
 * Learning orbit: each roadmap topic sits on one of two tilted rings around a
 * wireframe core. Active topics glow brighter than planned ones.
 */

type Topic = { id: string; label: string; active: boolean; color: string };

const COLORS = ['#38bdf8', '#a78bfa', '#22d3ee', '#818cf8', '#7dd3fc', '#c084fc', '#60a5fa', '#67e8f9'];

const topics: Topic[] = learningRoadmap.map((t, i) => ({
  id: t.id,
  label: t.short,
  active: t.stage === 'Active',
  color: COLORS[i % COLORS.length],
}));

function Ring({ radius, tilt, speed, items }: { radius: number; tilt: number; speed: number; items: Topic[] }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * speed;
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[radius, 0.008, 8, 160]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.4} />
        </mesh>
        {items.map((t, i) => {
          const a = (i / items.length) * Math.PI * 2;
          return (
            <group key={t.id} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]}>
              <mesh>
                <sphereGeometry args={[t.active ? 0.13 : 0.09, 24, 24]} />
                <meshStandardMaterial
                  color={t.color}
                  emissive={t.color}
                  emissiveIntensity={t.active ? 0.9 : 0.25}
                  transparent
                  opacity={t.active ? 1 : 0.6}
                />
              </mesh>
              <Html center distanceFactor={6} position={[0, -0.3, 0]} style={{ pointerEvents: 'none' }}>
                <span
                  className={`whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-wide backdrop-blur ${
                    t.active
                      ? 'border-violet-400/40 bg-[#050816]/80 text-violet-100'
                      : 'border-white/10 bg-[#050816]/60 text-slate-400'
                  }`}
                >
                  {t.label}
                </span>
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Scene() {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;
    if (root.current) {
      root.current.rotation.y = pointer.current.x * 0.4;
      root.current.rotation.x = -pointer.current.y * 0.25;
    }
    if (core.current) {
      core.current.rotation.x += dt * 0.2;
      core.current.rotation.y += dt * 0.3;
    }
  });

  const inner = topics.filter((_, i) => i % 2 === 0);
  const outer = topics.filter((_, i) => i % 2 === 1);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 4]} intensity={6} color="#38bdf8" distance={14} />
      <pointLight position={[-3, -2, 3]} intensity={4} color="#a78bfa" distance={14} />
      <group ref={root}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.45} />
        </mesh>
        <Ring radius={1.75} tilt={Math.PI / 2.6} speed={0.18} items={inner} />
        <Ring radius={2.7} tilt={Math.PI / 3.4} speed={-0.12} items={outer} />
      </group>
    </>
  );
}

export default function OrbitScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7.6], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <Scene />
    </Canvas>
  );
}
