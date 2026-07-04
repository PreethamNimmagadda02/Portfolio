"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useRef, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useInViewport } from "@/hooks/use-in-viewport";

interface DividerColors {
  from?: string;
  to?: string;
  accent?: string;
}

const DEFAULTS: Required<DividerColors> = {
  from: "#8b5cf6",
  to: "#3b82f6",
  accent: "#ec4899",
};

/* ── Concentric portal rings that slowly counter-rotate ── */
function PortalRings({ from, accent }: { from: string; accent: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.15;
    group.current.children.forEach((ring, i) => {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 - i * 0.4) * 0.04;
      ring.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={group} rotation={[Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 5]}>
          <torusGeometry args={[1.4 + i * 0.55, 0.018, 12, 120]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? accent : from}
            emissive={i % 2 === 0 ? accent : from}
            emissiveIntensity={2.4}
            toneMapped={false}
            transparent
            opacity={0.7 - i * 0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Glowing faceted core with a wireframe shell ── */
function CoreOrb({ from, accent }: { from: string; accent: string }) {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * 0.4;
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      core.current.scale.setScalar(s);
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.25;
      shell.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
      <group>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2.6}
            toneMapped={false}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
        <mesh ref={shell} scale={1.55}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshBasicMaterial
            color={from}
            wireframe
            transparent
            opacity={0.35}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Ring of emissive nodes orbiting the core ── */
function OrbitingNodes({ from, to, count = 14, radius = 3.4 }: { from: string; to: string; count?: number; radius?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.z -= delta * 0.25;
  });
  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return {
          pos: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [number, number, number],
          color: i % 2 === 0 ? from : to,
        };
      }),
    [count, radius, from, to]
  );

  return (
    <group ref={group}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Radial energy beams that pulse in opacity ── */
function EnergyBeams({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.children.forEach((beam, i) => {
      const mat = (beam as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.15 + Math.abs(Math.sin(state.clock.elapsedTime * 1.5 + i)) * 0.25;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} rotation={[0, 0, angle]}>
            <cylinderGeometry args={[0.006, 0.006, 9, 6]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.8}
              toneMapped={false}
              transparent
              opacity={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function DividerScene({ from, to, accent }: Required<DividerColors>) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 5]} intensity={1.2} color={accent} />
      <pointLight position={[-4, -3, 4]} intensity={0.6} color={from} />

      <EnergyBeams accent={accent} />
      <PortalRings from={from} accent={accent} />
      <OrbitingNodes from={from} to={to} />
      <CoreOrb from={from} accent={accent} />

      <Sparkles count={26} scale={[10, 3, 3]} size={2} speed={0.3} color={to} opacity={0.5} />
    </>
  );
}

/**
 * Animated 3D divider used between page sections.
 *
 * Performance notes:
 * - The WebGL `<Canvas>` is mounted/unmounted via {@link useInViewport} with a
 *   generous 600px margin. Unmounting off-screen dividers is REQUIRED: keeping
 *   all 7 contexts alive alongside the section canvases exceeded the browser's
 *   WebGL context limit and crashed context creation elsewhere (null
 *   getContextAttributes → "reading 'alpha'" in EffectComposer).
 * - Bloom is intentionally avoided here; emissive `toneMapped={false}` materials
 *   already read as neon glow at a fraction of the cost.
 * - Mobile and reduced-motion users get a lightweight CSS-only gradient line.
 */
export default function SectionDivider3D({
  from = DEFAULTS.from,
  to = DEFAULTS.to,
  accent = DEFAULTS.accent,
  flip = false,
}: DividerColors & { flip?: boolean }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>("600px");

  // Lightweight, dependency-free fallback line.
  if (isMobile || reduced) {
    return (
      <div className="relative w-full h-20 md:h-28 overflow-hidden flex items-center justify-center pointer-events-none">
        <div
          className="w-[80%] h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${from}, ${accent}, ${to}, transparent)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative w-full h-44 md:h-56 overflow-hidden pointer-events-none ${flip ? "rotate-180" : ""}`}
    >
      {/* Soft vertical wash so the scene melts into the page */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${accent}14, transparent 70%)`,
        }}
      />

      {inView && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Canvas
            camera={{ position: [0, 0, 7], fov: 55 }}
            gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
            dpr={[1, 1.5]}
            frameloop="always"
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <DividerScene from={from} to={to} accent={accent} />
            </Suspense>
          </Canvas>
        </motion.div>
      )}

      {/* Horizontal energy line overlay — pulse only while visible */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${from}, ${accent}, ${to}, transparent)`,
        }}
        animate={inView ? { opacity: [0.35, 0.7, 0.35] } : { opacity: 0.35 }}
        transition={
          inView
            ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
    </div>
  );
}
