import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import type * as THREE from 'three';

/**
 * A floating stack of server units with blinking status LEDs. Decorative and
 * low-poly; mounted only on capable desktops via Lazy3D.
 */

const UNITS = 4;
const LED_COLORS = ['#34d399', '#38bdf8', '#34d399', '#a78bfa'];

function ServerUnit({ y, index }: { y: number; index: number }) {
  const led = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (led.current) {
      const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.2 + index * 1.3);
      (led.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + pulse * 1.6;
    }
  });
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[2.4, 0.42, 1.3]} />
        <meshStandardMaterial color="#0b1224" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Front face slats */}
      <mesh position={[0, 0, 0.66]}>
        <boxGeometry args={[2.2, 0.3, 0.02]} />
        <meshStandardMaterial color="#111a36" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh ref={led} position={[0.95, 0, 0.7]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={LED_COLORS[index % LED_COLORS.length]} emissive={LED_COLORS[index % LED_COLORS.length]} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function Stack() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useFrame((state) => {
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;
    if (group.current) {
      group.current.rotation.y = -0.5 + pointer.current.x * 0.5;
      group.current.rotation.x = 0.15 + pointer.current.y * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#dbeafe" />
      <pointLight position={[-3, 0, 3]} intensity={5} color="#22d3ee" distance={12} />
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.8}>
        <group ref={group}>
          {Array.from({ length: UNITS }, (_, i) => (
            <ServerUnit key={i} index={i} y={(i - (UNITS - 1) / 2) * 0.5} />
          ))}
        </group>
      </Float>
      <Sparkles count={40} scale={[5, 3, 3]} size={2} speed={0.3} color="#93c5fd" opacity={0.5} />
    </>
  );
}

export default function StackScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 38 }} gl={{ antialias: true, alpha: true }} aria-hidden="true">
      <Stack />
    </Canvas>
  );
}
