"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect, Suspense, useCallback } from "react";
import { motion } from "framer-motion";
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

function getCategoryColor(category: string) {
  return categoryColors[category] || "#ffffff";
}



// Custom hook to handle momentum-based rotation
function useSphereRotation(groupRef: React.RefObject<THREE.Group | null>, isHoveringNode: boolean) {
  const { gl, viewport } = useThree();
  const rotation = useRef({ x: 0, y: 0 });
  const momentum = useRef({ x: 0, y: 0.002 }); // Start with slow spin
  const lastMouse = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Mouse event handlers for the canvas
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      momentum.current = { x: 0, y: 0 }; // Stop existing momentum on grab
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      // Apply direct rotation + minimal momentum
      rotation.current.y += deltaX * 0.005;
      rotation.current.x += deltaY * 0.005;

      // Update momentum for release
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

    // Apply Momentum
    if (!isDragging.current) {
      // Decay momentum
      momentum.current.x *= 0.95;
      momentum.current.y *= 0.95;

      // Auto-rotation (very slow constant drift if momentum is near zero)
      if (Math.abs(momentum.current.y) < 0.001 && Math.abs(momentum.current.x) < 0.001 && !isHoveringNode) {
        momentum.current.y += (0.001 - momentum.current.y) * 0.05;
      }

      rotation.current.x += momentum.current.x;
      rotation.current.y += momentum.current.y;
    }

    // Apply strict damping to x-axis to prevent flipping upside down
    rotation.current.x = Math.max(-0.5, Math.min(0.5, rotation.current.x));

    // Apply smoothed rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.current.x, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.current.y, 0.1);
  });
}

function SkillNode({
  position,
  item,
  isHovered,
  isAnyHovered,
  onHover,
}: {
  position: THREE.Vector3;
  item: (typeof skillsData)[0];
  isHovered: boolean;
  isAnyHovered: boolean;
  onHover: (name: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getCategoryColor(item.category);
  const [opacity, setOpacity] = useState(0); // For occlusion fading
  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;

    const tempVec = new THREE.Vector3();
    meshRef.current.getWorldPosition(tempVec);

    // Hard cull back-facing nodes for a cleaner look (solid sphere feeling)
    // If z < -1.5, hide it.
    // Also use this for opacity if we still want *some* fade, but user asked for "solid".
    // Let's keep them visible but solid, maybe just dim the ones in back?
    // Actually, user said "transparent skill node" -> they don't want transparency.
    // So distinct solid nodes.

    // We can just use standard material without transparent prop.
    // But we might want to hide nodes strictly *behind* the core?
    // The core is radius ~0.8.

    // Let's just remove the transparency logic and make them solid.
    setOpacity(1);

    // Scale animation
    const targetScale = isHovered ? 1.5 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const showLabel = isHovered; // Only show label on hover to reduce clutter? Or keep all?
  // Previous logic: showLabel = opacity > 0.4. If we are solid, showing all labels might be too much.
  // Let's only show labels for nodes that are in "front" (z > -0.5).
  // We need to track Z for label visibility even if mesh is solid.

  // Re-adding Z check just for label
  const [isFront, setIsFront] = useState(true);
  useFrame(() => {
    if (meshRef.current) {
      const tempVec = new THREE.Vector3();
      meshRef.current.getWorldPosition(tempVec);
      setIsFront(tempVec.z > -1.0);
    }
  });

  return (
    <group position={position}>
      {/* Glow Sprite (Billboard) for bloom effect */}
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
          emissiveIntensity={isHovered ? 4 : 2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>


      {/* HTML Label - Only show if front-facing */}
      <Html
        position={[0.12, 0, 0]}
        center
        distanceFactor={6}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: "none", display: isFront ? "block" : "none" }}
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 pointer-events-none select-none`}
          style={{
            backgroundColor: `rgba(10, 10, 20, ${isHovered ? 0.9 : 0.6})`,
            borderColor: isHovered ? color : "rgba(255,255,255,0.15)",
            transform: `scale(${isHovered ? 1.1 : 1})`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
          <span className="text-xs font-medium text-gray-200 whitespace-nowrap" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            {item.name}
          </span>
        </div>
      </Html>
    </group>
  );
}

// Connections: Fade based on focus
function ConstellationWeb({ points, focusPointIndex }: { points: THREE.Vector3[], focusPointIndex: number | null }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    // We'll store a "connected" attribute to use in vertex colors later, or just compute simpler
    // For now, simpler: static geometry, uniform material that dims

    // We compute a dense-ish web
    const connectionDistance = 2.2;
    for (let i = 0; i < points.length; i++) {
      // Limit connections per node to avoid clutter
      let connections = 0;
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < connectionDistance) {
          linePositions.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
          );
          connections++;
          if (connections >= 4) break; // Max 4 connections per node
        }
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return geo;
  }, [points]);

  return (
    <lineSegments>
      <primitive object={geometry} />
      <lineBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={focusPointIndex !== null ? 0.05 : 0.12} // Dim lines when focusing
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// Background "Stars" for depth inside the sphere
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


// Detailed inner nucleus of data points
function TechNucleus() {
  const count = 400;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random points inside a sphere of radius 0.7
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * 2 * Math.PI;
      const r = 0.7 * Math.cbrt(Math.random()); // Even distribution
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

// Rotating outer geodetic grid
function GlobalGrid({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -state.clock.getElapsedTime() * 0.1; // Counter-rotate
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
// Orbit Configurations
const orbits = [
  { radiusScale: 1.2, rotation: [Math.PI / 2, 0, 0] as [number, number, number], color: '#a78bfa', opacity: 0.6, name: "Core" }, // Core/Foundation (Lighter Violet) - Horizontal
  { radiusScale: 1.45, rotation: [Math.PI / 1.8, Math.PI / 6, 0] as [number, number, number], color: '#f472b6', opacity: 0.5, name: "AI" }, // AI (Hot Pink) - Tilted 1
  { radiusScale: 1.7, rotation: [Math.PI / 2.2, -Math.PI / 6, 0] as [number, number, number], color: '#22d3ee', opacity: 0.5, name: "Web" }, // Web (Bright Cyan) - Tilted 2
];


function getCategoryOrbitIndex(category: string): number {
  if (category === 'AI') return 1; // AI Orbit (Index 1)
  if (category === 'Web' || category === 'Automation') return 2; // Web Orbit (Index 2)
  return 0; // Core Orbit (Index 0)
}

function getOrbitalPoints(samples: number, baseRadius: number) {
  const points: THREE.Vector3[] = new Array(samples).fill(null);

  // Group skill indices by their assigned orbit
  const orbitGroups: number[][] = [[], [], []];

  skillsData.forEach((skill, i) => {
    const orbitIndex = getCategoryOrbitIndex(skill.category);
    orbitGroups[orbitIndex].push(i);
  });

  // Calculate positions for each group
  orbitGroups.forEach((groupIndices, orbitIndex) => {
    const orbit = orbits[orbitIndex];
    const step = (Math.PI * 2) / groupIndices.length;
    const angleOffset = (orbitIndex * Math.PI) / 3; // Offset each ring slightly

    groupIndices.forEach((originalIndex, i) => {
      const theta = (i * step) + angleOffset;
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

// Orbital Rings: Visual rings connecting/surrounding the nodes
function OrbitalRings({ radius = 1 }: { radius?: number }) {
  return (
    <group>
      {orbits.map((orbit, i) => (
        <mesh key={i} rotation={orbit.rotation}>
          <torusGeometry args={[radius * orbit.radiusScale, 0.02, 16, 100]} />
          <meshBasicMaterial color={orbit.color} transparent opacity={orbit.opacity} />
        </mesh>
      ))}

      {/* Inner Latitudinal Lines (simulating connections) */}
      {[0.5, -0.5].map((y, i) => (
        <mesh key={`lat-${i}`} position={[0, y * radius * 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.85, radius * 0.86, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}


function SkillsSphereScene({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const hoveredIndex = useMemo(() => skillsData.findIndex(s => s.name === hoveredSkill), [hoveredSkill]);

  // Reduced base radius slightly so the larger orbit scales fit in view
  const radius = isMobile ? 1.6 : 2.2;
  const points = useMemo(() => getOrbitalPoints(skillsData.length, radius), [radius]);


  // Use custom momentum rotation
  useSphereRotation(groupRef, hoveredSkill !== null);

  return (
    <group ref={groupRef}>
      {/* Ambient background particles */}
      <SphereParticles count={150} />

      {/* New Orbital Rings - Match radius exactly to points */}
      <OrbitalRings radius={radius} />

      {/* Faint Web Connections (Optional, reduced opacity) */}
      <ConstellationWeb points={points} focusPointIndex={hoveredSkill ? hoveredIndex : null} />

      {/* Detailed Inner Nucleus */}
      <TechNucleus />

      {/* Central Core Sphere */}
      <mesh scale={[isMobile ? 0.6 : 0.8, isMobile ? 0.6 : 0.8, isMobile ? 0.6 : 0.8]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial
          color="#1e1b4b" // Darker indigo
          emissive="#4c1d95"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9} // Higher metalness for reflections
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Primary Wireframe (Static relative to group) */}
      <mesh scale={[isMobile ? 0.65 : 0.85, isMobile ? 0.65 : 0.85, isMobile ? 0.65 : 0.85]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Secondary Dynamic Grid (Counter-rotating) */}
      <GlobalGrid radius={isMobile ? 0.75 : 0.95} />

      {/* Nodes */}
      {points.map((point, i) => (
        <SkillNode
          key={skillsData[i].name}
          position={point}
          item={skillsData[i]}
          isHovered={hoveredSkill === skillsData[i].name}
          isAnyHovered={hoveredSkill !== null}
          onHover={setHoveredSkill}
        />
      ))}
    </group>
  );
}

export default function SkillsMarquee() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[700px] w-full bg-black/5" />;

  return (
    <section id="skills-sphere" className="py-24 relative w-full h-[850px] overflow-hidden flex flex-col items-center justify-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      {/* Section Header - Floating Top */}
      <div className="absolute top-12 left-0 w-full z-10 pointer-events-none text-center px-4">

        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Technical{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Ecosystem
          </span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
          A 3D visualization of my technical expertise
        </p>
      </div>

      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 0, 9], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          className="w-full h-full"
          style={{ touchAction: 'pan-y' }}
        >
          <Suspense fallback={null}>
            <group position={[0, 0, 0]}>
              <SkillsSphereScene isMobile={isMobile} />
            </group>
          </Suspense>

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4c1d95" />
          <pointLight position={[-10, 10, -10]} intensity={2} color="#ec4899" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        </Canvas>
      </div>

      {/* Legend / HUD - Bottom Right - More Prominent */}
      <div className="absolute bottom-20 right-8 z-10 pointer-events-none flex flex-col gap-3 items-end">
        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-900/20">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-right border-b border-white/10 pb-2">
            Skill Categories
          </h3>
          <div className="flex flex-col gap-2">
            {orbits.map((orbit, i) => (
              <div key={i} className="flex items-center justify-end gap-3">
                <span className="text-sm font-medium text-gray-200 font-mono tracking-tight">{orbit.name}</span>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: orbit.color }} />
                  <div className="absolute inset-0 rounded-full animate-pulse opacity-50 blur-sm" style={{ backgroundColor: orbit.color, padding: '2px', margin: '-2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
