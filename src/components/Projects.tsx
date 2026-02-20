"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Environment,
  Sparkles,
  Stars,
  Html,
  ContactShadows,
  useCursor,
  BakeShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Github,
  ArrowUpRight,
  GraduationCap,
  Ticket,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------
interface ProjectData {
  id: number;
  title: string;
  description: string;
  tags: string[];
  links: { demo: string; repo: string };
  status: string;
  featured: boolean;
  icon: any;
  color: string;
  accent: string;
  geometry: string;
}

const projects: ProjectData[] = [
  {
    id: 0,
    title: "College Central",
    description:
      "The Digital Backbone of IIT(ISM) Dhanbad. A centralized platform empowering students with real-time academic insights, campus navigation, and event integration.",
    tags: [
      "React",
      "TypeScript",
      "Firebase",
      "REST APIs",
      "Tailwind CSS",
      "Vite",
      "Framer Motion",
    ],
    links: {
      demo: "https://collegecentral.live/#/",
      repo: "https://github.com/PreethamNimmagadda02/College-Central",
    },
    status: "Live",
    featured: true,
    icon: GraduationCap,
    color: "#a855f7",
    accent: "#ec4899",
    geometry: "nexus",
  },
  {
    id: 1,
    title: "FestFlow",
    description:
      "Autonomous Event Orchestration at scale. Leveraging multi-agent AI to transform abstract constraints into executable logistical plans.",
    tags: ["Agentic AI", "AI Agents", "React", "Firebase", "Gemini API"],
    links: {
      demo: "https://festflow.co.in/",
      repo: "https://github.com/PreethamNimmagadda02/FestFlow",
    },
    status: "Live",
    featured: false,
    icon: Ticket,
    color: "#3b82f6",
    accent: "#06b6d4",
    geometry: "flow",
  },
  {
    id: 2,
    title: "AI Trading System",
    description:
      "Algorithmic Trading Infrastructure. A swarm of AI agents analyzing market signals to execute high-frequency trading strategies with precision.",
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System",
      repo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System",
    },
    status: "Complete",
    featured: false,
    icon: TrendingUp,
    color: "#22c55e",
    accent: "#10b981",
    geometry: "matrix",
  },
];

// Circle arrangement
const RADIUS = 4.5;
function getPosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  return [Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS];
}

// -----------------------------------------------------------------------------
// 3D Geometries — unique, premium themed shapes per project
// -----------------------------------------------------------------------------
function AnimatedPlanet({
  type,
  materialProps,
  isActive,
}: {
  type: string;
  materialProps: Record<string, any>;
  isActive: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.25;
    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * 0.5;
      orbitRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
    if (atmosphereRef.current) {
      const s = 1.0 + Math.sin(t * 1.5) * 0.03;
      atmosphereRef.current.scale.set(s, s, s);
    }
    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshPhysicalMaterial;
      m.emissiveIntensity = (isActive ? 2.0 : 1.0) + Math.sin(t * 2.5) * 0.6;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = t * 0.2;
      shellRef.current.rotation.x = t * 0.15;
    }
    if (debrisRef.current) {
      debrisRef.current.rotation.y = t * 0.6;
    }
  });

  const mat = <meshPhysicalMaterial {...materialProps} />;
  switch (type) {
    case "nexus":
      return (
        <group>
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[0.7, 32, 32]} />
            {mat}
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.0, 0.015, 16, 64]} />
            <meshPhysicalMaterial {...materialProps} opacity={0.4} transparent />
          </mesh>
          <mesh ref={ring2Ref} rotation={[-Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.1, 0.015, 16, 64]} />
            <meshPhysicalMaterial {...materialProps} opacity={0.4} transparent />
          </mesh>
          <group ref={orbitRef}>
            {[0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 1.05, Math.sin(a) * 0.4, Math.sin(a) * 1.05]} scale={0.12}>
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshPhysicalMaterial {...materialProps} emissiveIntensity={(materialProps.emissiveIntensity || 0.5) * 2} toneMapped={false} />
                </mesh>
              );
            })}
          </group>
        </group>
      );

    case "flow":
      return (
        <group>
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[0.65, 32, 32]} />
            {mat}
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              ref={i === 0 ? ringRef : i === 1 ? ring2Ref : undefined}
              rotation={[Math.PI / 2 + i * 0.4, i * 0.6, i * 0.3]}
              scale={1 + i * 0.15}
            >
              <torusGeometry args={[0.75, 0.08, 16, 64]} />
              <meshPhysicalMaterial {...materialProps} opacity={(materialProps.opacity || 0.9) * (0.6 - i * 0.15)} transparent transmission={0.5} thickness={0.5} />
            </mesh>
          ))}
        </group>
      );

    case "matrix":
      return (
        <group>
          <mesh ref={coreRef}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshPhysicalMaterial {...materialProps} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          <mesh ref={shellRef} scale={1.2}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshPhysicalMaterial {...materialProps} wireframe opacity={(materialProps.opacity || 0.9) * 0.8} transparent />
          </mesh>
          <group ref={debrisRef}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.95, (i % 2 === 0 ? 0.3 : -0.3), Math.sin(a) * 0.95]}>
                  <boxGeometry args={[0.08, 0.08, 0.08]} />
                  <meshPhysicalMaterial {...materialProps} emissiveIntensity={isActive ? 2.5 : 1} toneMapped={false} />
                </mesh>
              );
            })}
          </group>
        </group>
      );

    default:
      return (
        <mesh>
          <sphereGeometry args={[0.75, 32, 32]} />
          {mat}
        </mesh>
      );
  }
}


// -----------------------------------------------------------------------------
// Single 3D Project Card — geometry + HUD
// -----------------------------------------------------------------------------
function ProjectCard3D({
  data,
  index,
  total,
  isActive,
  isMobile,
  onClick,
}: {
  data: ProjectData;
  index: number;
  total: number;
  isActive: boolean;
  isMobile: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pos = getPosition(index, total);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Continuous rotation - faster when active/hovered
    groupRef.current.rotation.y += delta * (isActive ? 0.4 : (hovered ? 0.3 : 0.1));
    groupRef.current.rotation.x += delta * (isActive ? 0.1 : 0.03);

    // Scale lerp with spring-like feel
    const targetScale = isActive ? 1.2 : hovered ? 1.0 : 0.72;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.06
    );
  });

  const Icon = data.icon;

  const materialProps = {
    color: data.color,
    metalness: 0.85,
    roughness: 0.12,
    emissive: data.accent,
    emissiveIntensity: isActive ? 2.2 : hovered ? 1.0 : 0.3,
    transparent: true,
    opacity: isActive ? 0.95 : 0.85,
    envMapIntensity: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    toneMapped: false,
  };

  return (
    <group position={pos} scale={isMobile ? 0.5 : 0.65}>
      {/* Floating 3D geometry */}
      <Float
        floatIntensity={isActive ? 2.2 : 0.8}
        rotationIntensity={isActive ? 1.3 : 0.4}
        speed={isActive ? 2.5 : 1}
      >
        <group
          ref={groupRef}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <AnimatedPlanet type={data.geometry} materialProps={materialProps} isActive={isActive} />
        </group>
      </Float>

      {/* Glowing Color Platform */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 64]} />
        <meshBasicMaterial color={data.color} transparent opacity={isActive ? 0.35 : 0.05} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -2.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.3, 64]} />
        <meshBasicMaterial color={data.color} transparent opacity={isActive ? 0.2 : 0.03} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Energy beam */}
      {isActive && (
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.015, 0.12, 2, 8]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.2}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* HTML HUD card */}
      <Html
        position={[0, -3.2, 0]}
        center
        className="pointer-events-none z-50"
        style={{
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
        zIndexRange={[100, 0]}
        transform={false}
      >
        <div
          className="w-[340px] p-5 rounded-2xl backdrop-blur-xl border border-white/10 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.65))`,
            boxShadow: isActive
              ? `0 0 50px -12px ${data.color}, inset 0 1px 0 rgba(255,255,255,0.08)`
              : "none",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${data.color}25, ${data.accent}15)`,
                  boxShadow: `inset 0 0 15px ${data.color}25`,
                }}
              >
                <Icon size={20} color={data.color} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white leading-tight">
                  {data.title}
                </h3>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full border"
                  style={{
                    color: data.status === "Live" ? "#4ade80" : "#60a5fa",
                    borderColor:
                      data.status === "Live"
                        ? "rgba(74,222,128,0.3)"
                        : "rgba(96,165,250,0.3)",
                    backgroundColor:
                      data.status === "Live"
                        ? "rgba(74,222,128,0.1)"
                        : "rgba(96,165,250,0.1)",
                  }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${data.status === "Live"
                      ? "bg-green-400 animate-pulse"
                      : "bg-blue-400"
                      }`}
                  />
                  {data.status}
                </span>
              </div>
            </div>
            <Link
              href={data.links.demo}
              target="_blank"
              className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110 hover:rotate-45 text-white"
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {data.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={{
                  color: data.accent,
                  borderColor: `${data.accent}20`,
                  backgroundColor: `${data.accent}08`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 pt-3 border-t border-white/5">
            <Link
              href={data.links.demo}
              target="_blank"
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group/link"
            >
              <ExternalLink
                size={14}
                className="group-hover/link:scale-110 transition-transform"
              />
              Live Demo
            </Link>
            <Link
              href={data.links.repo}
              target="_blank"
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group/link"
            >
              <Github
                size={14}
                className="group-hover/link:scale-110 transition-transform"
              />
              Source
            </Link>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${data.color}, ${data.accent}, transparent)`,
            }}
          />
        </div>
      </Html>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Camera Rig
// -----------------------------------------------------------------------------
function CameraRig({
  activeIndex,
  isMobile,
}: {
  activeIndex: number;
  isMobile: boolean;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const angle = (activeIndex / projects.length) * Math.PI * 2;
    const dist = RADIUS + (isMobile ? 10 : 7);
    const targetX = Math.cos(angle) * dist;
    const targetZ = Math.sin(angle) * dist;

    camera.position.lerp(
      new THREE.Vector3(targetX, 1.5, targetZ),
      0.035
    );

    const activePos = getPosition(activeIndex, projects.length);
    const lookAt = new THREE.Vector3(activePos[0], -0.8, activePos[2]);

    const currLook = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .add(camera.position);
    currLook.lerp(lookAt, 0.035);
    camera.lookAt(currLook);
  });

  return null;
}

// -----------------------------------------------------------------------------
// Scene
// -----------------------------------------------------------------------------
function Scene({
  activeIndex,
  onSelect,
  isMobile,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
  isMobile: boolean;
}) {
  const active = projects[activeIndex];

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.25} />
      <pointLight
        position={[0, 5, 0]}
        intensity={1.5}
        color="#ffffff"
        distance={20}
      />
      <pointLight
        position={[-4, -2, 4]}
        intensity={0.5}
        color="#ffffff"
        distance={18}
      />

      <CameraRig activeIndex={activeIndex} isMobile={isMobile} />

      <group position={[0, 0.5, 0]}>
        {projects.map((proj, i) => (
          <ProjectCard3D
            key={proj.id}
            data={proj}
            index={i}
            total={projects.length}
            isActive={activeIndex === i}
            isMobile={isMobile}
            onClick={() => onSelect(i)}
          />
        ))}
      </group>

      {/* Central energy */}
      <Float floatIntensity={2.5} speed={2}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshBasicMaterial
            color={active.accent}
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      </Float>

      <BakeShadows />
      <Sparkles
        count={50}
        scale={25}
        size={5}
        speed={0.12}
        opacity={0.25}
        color={active.color}
      />
      <ContactShadows
        frames={1}
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={10}
        color="#111111"
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  const navigate = useCallback(
    (newIndex: number) => {
      setActiveIndex(
        ((newIndex % projects.length) + projects.length) % projects.length
      );
    },
    []
  );

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.5 &&
        rect.bottom > window.innerHeight * 0.5;
      if (!inView) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigate(activeIndex + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, navigate]);

  // Swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 50) {
        navigate(delta < 0 ? activeIndex + 1 : activeIndex - 1);
      }
    },
    [activeIndex, navigate]
  );

  const activeData = projects[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative h-screen overflow-hidden flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-12 left-0 w-full text-center z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-3">
            Portfolio
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-2xl"
        >
          Signature{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Projects
          </span>
        </motion.h2>
        <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto drop-shadow-md">
          Navigate the gallery. Click a structure to focus.
        </p>
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => navigate(activeIndex - 1)}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all hover:scale-110 active:scale-90"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => navigate(activeIndex + 1)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all hover:scale-110 active:scale-90"
      >
        <ChevronRight size={22} />
      </button>



      {/* 3D Canvas */}
      <div className="absolute inset-0 w-full h-full z-0 cursor-crosshair">
        <Canvas
          camera={{
            position: isMobile ? [0, 2, 16] : [0, 2, 12],
            fov: isMobile ? 55 : 45,
          }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
        >
          <Scene
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            isMobile={isMobile}
          />
        </Canvas>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/80 to-black/90 pointer-events-none" />
      </div>
    </section>
  );
}
