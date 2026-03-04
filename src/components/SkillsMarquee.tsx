"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect, Suspense, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

// Skills data with categories for color coding
const skillsData = [
  { name: "VideoRAG", category: "AI" },
  { name: "React", category: "Web" },
  { name: "Mem0", category: "AI" },
  { name: "Whisper", category: "AI" },
  { name: "AWS EC2", category: "DevOps" },
  { name: "Digital Ocean", category: "DevOps" },
  { name: "Context Engineering", category: "AI" },
  { name: "Meta Llama", category: "AI" },
  { name: "PostgreSQL", category: "DB" },
  { name: "Redis", category: "DB" },
  { name: "TypeScript", category: "Web" },
  { name: "FalkorDB", category: "DB" },
  { name: "Python", category: "Lang" },
  { name: "Qdrant", category: "DB" },
  { name: "Qwen", category: "AI" },
  { name: "Firebase", category: "Web" },
  { name: "OpenAI API", category: "AI" },
  { name: "DeepInfra", category: "AI" },
  { name: "CrewAI", category: "AI" },
  { name: "Next.js", category: "Web" },
  { name: "SQL", category: "DB" },
  { name: "Gemini API", category: "AI" },
  { name: "MongoDB", category: "DB" },
  { name: "n8n", category: "Automation" },
  { name: "C/C++", category: "Lang" },
  { name: "Postman", category: "Tools" },
  { name: "Tailwind CSS", category: "Web" },
  { name: "Git/GitHub", category: "Tools" },
  { name: "Node.js", category: "Web" },
  { name: "Ollama", category: "AI" },
];

const categoryColors: Record<string, string> = {
  AI: "#ec4899", // Pink
  Web: "#06b6d4", // Cyan
  DB: "#8b5cf6", // Purple
  DevOps: "#f59e0b", // Amber
  Lang: "#22c55e", // Green
  Tools: "#64748b", // Slate
  Automation: "#f97316", // Orange
};

const categoryLabels: Record<string, string> = {
  AI: "Artificial Intelligence",
  Web: "Web Development",
  DB: "Databases",
  DevOps: "DevOps & Cloud",
  Lang: "Languages",
  Tools: "Developer Tools",
  Automation: "Automation",
};

function getCategoryColor(category: string) {
  return categoryColors[category] || "#ffffff";
}

// Custom hook to handle momentum-based rotation
function useSphereRotation(groupRef: React.RefObject<THREE.Group | null>, isHoveringNode: boolean) {
  const { gl } = useThree();
  const rotation = useRef({ x: 0, y: 0 });
  const momentum = useRef({ x: 0, y: 0.002 });
  const lastMouse = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      momentum.current = { x: 0, y: 0 };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      rotation.current.y += deltaX * 0.005;
      rotation.current.x += deltaY * 0.005;
      momentum.current = { x: deltaY * 0.002, y: deltaX * 0.002 };
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      momentum.current.x *= 0.95;
      momentum.current.y *= 0.95;

      if (Math.abs(momentum.current.y) < 0.001 && Math.abs(momentum.current.x) < 0.001 && !isHoveringNode) {
        momentum.current.y += (0.001 - momentum.current.y) * 0.05;
      }

      rotation.current.x += momentum.current.x;
      rotation.current.y += momentum.current.y;
    }

    rotation.current.x = Math.max(-0.5, Math.min(0.5, rotation.current.x));

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.current.x, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.current.y, 0.1);
  });
}

// Enhanced SkillNode with prominent hover card and pulsing glow
function SkillNode({
  position,
  item,
  isHovered,
  isAnyHovered,
  onHover,
  isFiltered,
}: {
  position: THREE.Vector3;
  item: (typeof skillsData)[0];
  isHovered: boolean;
  isAnyHovered: boolean;
  onHover: (name: string | null) => void;
  isFiltered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const color = getCategoryColor(item.category);
  const fullCategoryName = categoryLabels[item.category] || item.category;

  const [isFront, setIsFront] = useState(true);

  useFrame((state) => {
    if (!meshRef.current) return;

    const tempVec = new THREE.Vector3();
    meshRef.current.getWorldPosition(tempVec);
    setIsFront(tempVec.z > 0.1);

    // Scale animation — much bigger on hover
    const targetScale = isHovered ? 2.8 : isAnyHovered && !isHovered ? 0.7 : isFiltered ? 0.4 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);

    const t = state.clock.elapsedTime;

    // Pulsing inner glow ring on hover
    if (glowRef.current) {
      const pulseScale = isHovered ? 3.5 + Math.sin(t * 4) * 0.8 : 0;
      glowRef.current.scale.lerp(new THREE.Vector3(pulseScale, pulseScale, pulseScale), 0.15);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = isHovered ? 0.45 + Math.sin(t * 3) * 0.2 : 0;
      }
    }

    // Outer expanding glow halo
    if (outerGlowRef.current) {
      const outerScale = isHovered ? 5 + Math.sin(t * 2) * 1 : 0;
      outerGlowRef.current.scale.lerp(new THREE.Vector3(outerScale, outerScale, outerScale), 0.1);
      const mat = outerGlowRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = isHovered ? 0.15 + Math.sin(t * 1.5) * 0.08 : 0;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer expanding glow halo */}
      <mesh ref={outerGlowRef}>
        <ringGeometry args={[0.06, 0.18, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Pulsing inner glow ring */}
      <mesh ref={glowRef}>
        <ringGeometry args={[0.08, 0.14, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Main skill node sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(item.name);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 8 : isAnyHovered ? 1 : isFiltered ? 0.5 : 2}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={isAnyHovered && !isHovered ? 0.4 : isFiltered ? 0.3 : 1}
        />
      </mesh>

      {/* HTML Label — transforms into prominent floating card on hover */}
      <Html
        position={isHovered ? [0, 0.25, 0] : [0.12, 0, 0]}
        center
        distanceFactor={isHovered ? 4.5 : 6}
        zIndexRange={isHovered ? [10000, 9999] : [100, 0]}
        style={{
          pointerEvents: "none",
          display: isFront ? "block" : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {isHovered ? (
          /* ── Prominent Hover Card ── */
          <div
            className="pointer-events-none select-none"
            style={{
              animation: "skillCardIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div
              className="relative flex flex-col items-center gap-1.5 rounded-2xl border-2 backdrop-blur-2xl px-5 py-3"
              style={{
                backgroundColor: `rgba(8, 8, 24, 0.95)`,
                borderColor: color,
                boxShadow: `
                  0 0 30px ${color}50,
                  0 0 60px ${color}25,
                  0 0 100px ${color}15,
                  inset 0 1px 0 rgba(255,255,255,0.15),
                  inset 0 0 20px ${color}10
                `,
                minWidth: "120px",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute -top-px left-4 right-4 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }}
              />

              {/* Skill Name — large and bold */}
              <span
                className="text-[16px] font-black text-white whitespace-nowrap tracking-wide text-center"
                style={{
                  textShadow: `0 0 20px ${color}60`,
                }}
              >
                {item.name}
              </span>

              {/* Category Badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${color}20`,
                  border: `1px solid ${color}40`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color }}
                >
                  {fullCategoryName}
                </span>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute -bottom-px left-4 right-4 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
                }}
              />
            </div>
          </div>
        ) : (
          /* ── Default small label ── */
          <div
            className="flex items-center gap-1.5 rounded-lg border backdrop-blur-md px-2 py-1 pointer-events-none select-none transition-all duration-300"
            style={{
              backgroundColor: `rgba(10, 10, 20, 0.6)`,
              borderColor: isAnyHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.15)",
              opacity: isAnyHovered ? 0.35 : isFiltered ? 0.3 : 1,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            <span className="text-[10px] font-medium text-gray-300 whitespace-nowrap tracking-wide">
              {item.name}
            </span>
          </div>
        )}
      </Html>

      {/* Inject keyframe animation */}
      {isHovered && (
        <Html center style={{ display: "none" }}>
          <style>{`
            @keyframes skillCardIn {
              from { opacity: 0; transform: scale(0.7) translateY(8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </Html>
      )}
    </group>
  );
}

// Enhanced Connections: highlight lines connected to hovered node
function ConstellationWeb({
  points,
  focusPointIndex,
  hoveredIndex,
}: {
  points: THREE.Vector3[];
  focusPointIndex: number | null;
  hoveredIndex: number;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const glowLineRef = useRef<THREE.LineSegments>(null);

  const { geometry, connections } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const conns: [number, number][] = [];

    const connectionDistance = 2.2;
    for (let i = 0; i < points.length; i++) {
      let connectionCount = 0;
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < connectionDistance) {
          linePositions.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
          );
          conns.push([i, j]);
          connectionCount++;
          if (connectionCount >= 4) break;
        }
      }
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    return { geometry: geo, connections: conns };
  }, [points]);

  // Highlighted connections geometry (lines touching hovered node)
  const glowGeometry = useMemo(() => {
    if (hoveredIndex < 0) return null;
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (const [i, j] of connections) {
      if (i === hoveredIndex || j === hoveredIndex) {
        positions.push(
          points[i].x, points[i].y, points[i].z,
          points[j].x, points[j].y, points[j].z
        );
      }
    }
    if (positions.length === 0) return null;
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [hoveredIndex, points, connections]);

  return (
    <>
      {/* Base web lines */}
      <lineSegments ref={lineRef}>
        <primitive object={geometry} />
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={focusPointIndex !== null ? 0.03 : 0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Glowing highlighted connections on hover */}
      {glowGeometry && (
        <lineSegments ref={glowLineRef}>
          <primitive object={glowGeometry} />
          <lineBasicMaterial
            color="#ec4899"
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            linewidth={2}
          />
        </lineSegments>
      )}
    </>
  );
}

// Background "Stars" for depth
function SphereParticles({ count = 100 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#8b5cf6" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// Enhanced TechNucleus with breathing pulse
function TechNucleus() {
  const count = 400;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * 2 * Math.PI;
      const r = 0.7 * Math.cbrt(Math.random());
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#06b6d4" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Counter-rotating geodetic grid
function GlobalGrid({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -state.clock.getElapsedTime() * 0.1;
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={ref} scale={[radius, radius, radius]}>
      <icosahedronGeometry args={[1, 2]} />
      <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.05} />
    </mesh>
  );
}

// Orbit Configurations
const orbits = [
  { radiusScale: 1.2, rotation: [Math.PI / 2, 0, 0] as [number, number, number], color: "#a78bfa", opacity: 0.6, name: "Core" },
  { radiusScale: 1.45, rotation: [Math.PI / 1.8, Math.PI / 6, 0] as [number, number, number], color: "#f472b6", opacity: 0.5, name: "AI" },
  { radiusScale: 1.7, rotation: [Math.PI / 2.2, -Math.PI / 6, 0] as [number, number, number], color: "#22d3ee", opacity: 0.5, name: "Web" },
];

function getCategoryOrbitIndex(category: string): number {
  if (category === "AI") return 1;
  if (category === "Web" || category === "Automation") return 2;
  return 0;
}

function getOrbitalPoints(samples: number, baseRadius: number) {
  const points: THREE.Vector3[] = new Array(samples).fill(null);
  const orbitGroups: number[][] = [[], [], []];

  skillsData.forEach((skill, i) => {
    const orbitIndex = getCategoryOrbitIndex(skill.category);
    orbitGroups[orbitIndex].push(i);
  });

  orbitGroups.forEach((groupIndices, orbitIndex) => {
    const orbit = orbits[orbitIndex];
    const step = (Math.PI * 2) / groupIndices.length;
    const angleOffset = (orbitIndex * Math.PI) / 3;

    groupIndices.forEach((originalIndex, i) => {
      const theta = i * step + angleOffset;
      const r = baseRadius * orbit.radiusScale;

      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const z = 0;

      const vector = new THREE.Vector3(x, y, z);
      const euler = new THREE.Euler(...orbit.rotation);
      vector.applyEuler(euler);

      points[originalIndex] = vector;
    });
  });

  return points;
}

// Energy Pulse that travels along an orbital ring
function EnergyPulse({
  radius,
  rotation,
  color,
  speed,
  size = 0.06,
}: {
  radius: number;
  rotation: [number, number, number];
  color: string;
  speed: number;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    const x = radius * Math.cos(t);
    const y = radius * Math.sin(t);

    // Apply orbital rotation
    const vec = new THREE.Vector3(x, y, 0);
    const euler = new THREE.Euler(...rotation);
    vec.applyEuler(euler);

    meshRef.current.position.copy(vec);

    // Pulsing size
    const pulse = 1 + Math.sin(t * 3) * 0.3;
    meshRef.current.scale.setScalar(pulse);

    // Trail follows slightly behind
    if (trailRef.current) {
      const t2 = t - 0.15;
      const x2 = radius * Math.cos(t2);
      const y2 = radius * Math.sin(t2);
      const vec2 = new THREE.Vector3(x2, y2, 0);
      vec2.applyEuler(euler);
      trailRef.current.position.copy(vec2);
      trailRef.current.scale.setScalar(pulse * 0.6);
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={trailRef}>
        <sphereGeometry args={[size * 0.7, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// Enhanced Orbital Rings with energy pulses
function OrbitalRings({ radius = 1 }: { radius?: number }) {
  return (
    <group>
      {orbits.map((orbit, i) => (
        <group key={i}>
          <mesh rotation={orbit.rotation}>
            <torusGeometry args={[radius * orbit.radiusScale, 0.02, 16, 100]} />
            <meshBasicMaterial color={orbit.color} transparent opacity={orbit.opacity} />
          </mesh>
          {/* Energy pulse #1 */}
          <EnergyPulse
            radius={radius * orbit.radiusScale}
            rotation={orbit.rotation}
            color={orbit.color}
            speed={0.4 + i * 0.15}
            size={0.05}
          />
          {/* Energy pulse #2 (opposite direction, offset) */}
          <EnergyPulse
            radius={radius * orbit.radiusScale}
            rotation={orbit.rotation}
            color={orbit.color}
            speed={-(0.3 + i * 0.1)}
            size={0.035}
          />
        </group>
      ))}

      {/* Inner Latitudinal Lines */}
      {[0.5, -0.5].map((y, i) => (
        <mesh key={`lat-${i}`} position={[0, y * radius * 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.85, radius * 0.86, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced Core Sphere with breathing pulse + shockwave ripples
function EnhancedCoreSphere({ isMobile }: { isMobile: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const baseScale = isMobile ? 0.6 : 0.8;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Breathing core
    if (coreRef.current) {
      const breathe = 1 + Math.sin(t * 1.5) * 0.04 + Math.sin(t * 0.5) * 0.02;
      const s = baseScale * breathe;
      coreRef.current.scale.set(s, s, s);

      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;
      }
    }

    // Shockwave ripple
    if (shockwaveRef.current) {
      // Repeat every 4 seconds
      const cycle = t % 4;
      const progress = cycle / 2; // Expand over 2 seconds
      const s = baseScale * (1 + progress * 0.8);
      const opacity = Math.max(0, 0.15 * (1 - progress));

      if (progress < 1) {
        shockwaveRef.current.scale.set(s, s, s);
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = opacity;
        shockwaveRef.current.visible = true;
      } else {
        shockwaveRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* Main core */}
      <mesh ref={coreRef} scale={[baseScale, baseScale, baseScale]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial
          color="#1e1b4b"
          emissive="#4c1d95"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Shockwave ripple sphere */}
      <mesh ref={shockwaveRef} scale={[baseScale, baseScale, baseScale]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          wireframe
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Primary Wireframe */}
      <mesh scale={[baseScale * 1.06, baseScale * 1.06, baseScale * 1.06]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.1} />
      </mesh>
    </>
  );
}

function SkillsSphereScene({
  isMobile,
  activeCategories,
}: {
  isMobile: boolean;
  activeCategories: Set<string>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const hoveredIndex = useMemo(() => skillsData.findIndex((s) => s.name === hoveredSkill), [hoveredSkill]);

  const radius = isMobile ? 1.2 : 2;
  const points = useMemo(() => getOrbitalPoints(skillsData.length, radius), [radius]);

  useSphereRotation(groupRef, hoveredSkill !== null);

  const allActive = activeCategories.size === 0;

  return (
    <group ref={groupRef}>
      <SphereParticles count={150} />
      <OrbitalRings radius={radius} />
      <ConstellationWeb
        points={points}
        focusPointIndex={hoveredSkill ? hoveredIndex : null}
        hoveredIndex={hoveredIndex}
      />
      <TechNucleus />
      <EnhancedCoreSphere isMobile={isMobile} />
      <GlobalGrid radius={isMobile ? 0.75 : 0.95} />

      {points.map((point, i) => {
        const skill = skillsData[i];
        const isFiltered = !allActive && !activeCategories.has(skill.category);
        return (
          <SkillNode
            key={skill.name}
            position={point}
            item={skill}
            isHovered={hoveredSkill === skill.name}
            isAnyHovered={hoveredSkill !== null}
            onHover={setHoveredSkill}
            isFiltered={isFiltered}
          />
        );
      })}
    </group>
  );
}

// Animated Counter component
function AnimatedCounter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
        {count}
        {suffix}
      </span>
      <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

// Category filter chip
function CategoryChip({
  category,
  color,
  isActive,
  onClick,
}: {
  category: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider border backdrop-blur-md transition-all duration-300 cursor-pointer"
      style={{
        color: isActive ? "#fff" : color,
        borderColor: isActive ? color : `${color}30`,
        backgroundColor: isActive ? `${color}30` : `${color}08`,
        boxShadow: isActive ? `0 0 16px ${color}30, 0 0 4px ${color}20` : "none",
      }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: isActive ? `0 0 8px ${color}` : "none",
          }}
        />
        {category}
      </span>
    </motion.button>
  );
}

export default function SkillsMarquee() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  useEffect(() => setMounted(true), []);

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  // Unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(skillsData.map((s) => s.category))];
    return cats;
  }, []);

  // Count skills per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skillsData.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  if (!mounted) return <div className="h-[700px] w-full bg-black/5" />;

  return (
    <section
      id="skills-sphere"
      className="py-24 relative w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ minHeight: isMobile ? "900px" : "1000px" }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/80 to-black/90 pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 text-center px-4 mb-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
        >
          Technical{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Ecosystem
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-gray-400 text-sm md:text-base max-w-lg mx-auto"
        >
          A 3D visualization of my technical expertise
        </motion.p>
      </div>

      {/* Category Filter Chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 flex flex-wrap justify-center gap-2 px-4 mb-4"
      >
        {categories.map((cat) => (
          <CategoryChip
            key={cat}
            category={cat}
            color={categoryColors[cat]}
            isActive={activeCategories.has(cat)}
            onClick={() => toggleCategory(cat)}
          />
        ))}
      </motion.div>

      {/* 3D Canvas */}
      <div className="relative z-0 w-full" style={{ height: isMobile ? "550px" : "650px" }}>
        <Canvas
          camera={{ position: [0, 0, 9], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          className="w-full h-full"
          style={{ touchAction: isMobile ? "none" : "pan-y" }}
        >
          <Suspense fallback={null}>
            <group position={[0, 0, 0]}>
              <SkillsSphereScene isMobile={isMobile} activeCategories={activeCategories} />
            </group>
          </Suspense>

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4c1d95" />
          <pointLight position={[-10, 10, -10]} intensity={2} color="#ec4899" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        </Canvas>

        {/* Drag hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md pointer-events-none"
        >
          <motion.span
            animate={{ x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-base"
          >
            👆
          </motion.span>
          <span className="text-[11px] text-gray-400 font-medium tracking-wide">Drag to explore</span>
        </motion.div>
      </div>

      {/* Animated Stats Bar */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={statsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 mt-6 flex items-center justify-center gap-6 md:gap-12 px-6 py-5 mx-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl"
      >
        <AnimatedCounter end={skillsData.length} label="Total Skills" suffix="+" />
        <div className="w-px h-10 bg-white/10" />
        <AnimatedCounter end={categories.length} label="Categories" />
        <div className="w-px h-10 bg-white/10" />
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {categories.slice(0, 5).map((cat) => (
              <motion.div
                key={cat}
                initial={{ scale: 0 }}
                animate={statsInView ? { scale: 1 } : {}}
                transition={{ delay: 0.5 + categories.indexOf(cat) * 0.1, type: "spring" }}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: categoryColors[cat],
                  boxShadow: `0 0 6px ${categoryColors[cat]}80`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium">
            Domains
          </span>
        </div>
      </motion.div>
    </section>
  );
}
