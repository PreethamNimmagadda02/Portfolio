"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Environment,
  Sparkles,
  Stars,
  Html,
  ContactShadows,
  BakeShadows,
  MeshTransmissionMaterial,
  useCursor
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Calendar,
  Award,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------
type ExperienceType = "work" | "leadership" | "community" | "achievement" | "organization";

interface ExperienceData {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  type: ExperienceType;
  skills: string[];
  highlight: string;
  color: string;
  accent: string;
  geometry: string;
}

const experiences: ExperienceData[] = [
  {
    id: 0,
    role: "Generative AI Intern",
    company: "Introspect Labs",
    period: "Jan 2026 - Present",
    description:
      "Built a Multimodal & Multilingual AI Companion powered by VideoRAG that processes 100+ hours of video with 95% accuracy. Designed its Empathic Core for real-time adaptive responses, boosting retention by 40%.",
    type: "work",
    skills: ["VideoRAG", "Vision-Language Models", "Empathic AI"],
    highlight: "Architected an AI Companion",
    color: "#3b82f6",
    accent: "#06b6d4",
    geometry: "crystal",
  },
  {
    id: 1,
    role: "Campus Ambassador",
    company: "Perplexity",
    period: "Sept 2025 - Nov 2025",
    description:
      "Spearheaded market expansion strategies for Perplexity. Orchestrated adoption campaigns & built strategic partnerships to drive user acquisition.",
    type: "community",
    skills: ["Growth Hacking", "Strategic Partnerships", "Brand Strategy"],
    highlight: "20+ Strategic Leads",
    color: "#22c55e",
    accent: "#10b981",
    geometry: "prism",
  },
  {
    id: 2,
    role: "Software Developer Intern",
    company: "METAVERTEX",
    period: "June 2025 – July 2025",
    description:
      "Architected Autonomous AI Agents reducing system resource load by 20%. Engineered performance optimizations that boosted SEO visibility by 10%.",
    type: "work",
    skills: ["AI Architecture", "System Optimization", "Scalable Tech"],
    highlight: "20% Efficiency Gain",
    color: "#8b5cf6",
    accent: "#a78bfa",
    geometry: "helix",
  },
  {
    id: 3,
    role: "Hostel Prefect",
    company: "Hostel Executive Committee",
    period: "Sept 2024 - Sept 2025",
    description:
      "Managed operations for 1,800+ residents. Implemented conflict resolution protocols reducing disputes by 30% and boosted community engagement by 40%.",
    type: "organization",
    skills: ["Operations Management", "Conflict Resolution", "Community Building"],
    highlight: "Lead 1800+ Residents",
    color: "#ec4899",
    accent: "#f472b6",
    geometry: "shield",
  },
  {
    id: 4,
    role: "Student Senator",
    company: "Students' Gymkhana, IIT (ISM)",
    period: "March 2024 - March 2025",
    description:
      "Elected representative for 1,500+ peers. Facilitated policy changes and infrastructure improvements, enhancing student satisfaction and campus life quality.",
    type: "achievement",
    skills: ["Strategic Leadership", "Policy Advocacy", "Governance"],
    highlight: "Elected Representative",
    color: "#f59e0b",
    accent: "#f97316",
    geometry: "crown",
  },
];

const typeIcons: Record<ExperienceType, any> = {
  work: Briefcase,
  leadership: Briefcase,
  community: Award,
  achievement: Trophy,
  organization: Star,
};

// Circle layout
const RADIUS = 5;
function getPosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  return [Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS];
}

// -----------------------------------------------------------------------------
// 3D Geometries — unique themed shape per experience
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
  const ring3Ref = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Group>(null);
  const debrisRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const jetRef = useRef<THREE.Mesh>(null);
  const jet2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Animate rings
    if (ringRef.current) ringRef.current.rotation.z = t * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.18;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.4;

    // Animate orbiting moons
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(t * 0.55) * 1.1;
      moonRef.current.position.z = Math.sin(t * 0.55) * 1.1;
      moonRef.current.position.y = Math.sin(t * 0.8) * 0.25;
    }

    // Debris/Moon belt rotation
    if (debrisRef.current) {
      debrisRef.current.rotation.y = t * 0.35;
      debrisRef.current.rotation.x = Math.sin(t * 0.15) * 0.08;
    }

    // Pulsing outer atmosphere/shield
    if (atmosphereRef.current) {
      const s = 1.0 + Math.sin(t * 1.2) * 0.02;
      atmosphereRef.current.scale.set(s, s, s);
      atmosphereRef.current.rotation.y = t * 0.08;
      atmosphereRef.current.rotation.x = t * 0.04;
    }

    // Core pulsing and rotation
    if (coreRef.current) {
      coreRef.current.rotation.y = -t * 0.12;
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = (isActive ? 2.5 : 1.5) + Math.sin(t * 2) * 0.35;
      }
    }

    // Energy jet pulsing (helix/pulsar)
    if (jetRef.current) {
      const mat = jetRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isActive ? 0.3 : 0.1) + Math.sin(t * 3) * 0.1;
      const s = 1.0 + Math.sin(t * 2.5) * 0.12;
      jetRef.current.scale.set(1, s, 1);
    }
    if (jet2Ref.current) {
      const mat = jet2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isActive ? 0.3 : 0.1) + Math.sin(t * 3 + 1) * 0.1;
      const s = 1.0 + Math.sin(t * 2.5 + 1) * 0.12;
      jet2Ref.current.scale.set(1, s, 1);
    }
  });

  // Base material (non-glass)
  const mat = <meshPhysicalMaterial {...materialProps} />;

  // Premium glass material for outer shells
  const glassMaterial = (
    <MeshTransmissionMaterial
      {...materialProps}
      transmission={0.9}
      thickness={0.5}
      roughness={0.1}
      ior={1.5}
      chromaticAberration={0.05}
      resolution={256}
      backside={true}
      color={materialProps.color}
      emissive={materialProps.emissive}
      emissiveIntensity={isActive ? 0.5 : 0.2}
    />
  );

  switch (type) {
    case "crystal":
      // Gas giant — Solid core + Refractive Outer shell + 3 layered Rings + dust band
      return (
        <group>
          {/* Outer atmospheric halo */}
          <mesh>
            <sphereGeometry args={[0.9, 48, 48]} />
            <meshBasicMaterial color={materialProps.color} transparent opacity={isActive ? 0.05 : 0.02} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Inner dense core */}
          <mesh ref={coreRef}>
            <sphereGeometry args={[0.6, 64, 64]} />
            <meshPhysicalMaterial {...materialProps} emissiveIntensity={isActive ? 2 : 1} />
          </mesh>
          {/* Refractive outer gas envelope */}
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[0.78, 64, 64]} />
            {glassMaterial}
          </mesh>
          {/* Inner fast ring */}
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.0, 0.04, 32, 100]} />
            <meshPhysicalMaterial {...materialProps} emissiveIntensity={isActive ? 3 : 1.5} toneMapped={false} />
          </mesh>
          {/* Middle wide translucent ring */}
          <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]} scale={0.95}>
            <torusGeometry args={[1.3, 0.08, 32, 100]} />
            <meshPhysicalMaterial {...materialProps} opacity={0.25} transparent />
          </mesh>
          {/* Outer thin dark ring */}
          <mesh ref={ring3Ref} rotation={[Math.PI / 3, 0, 0]} scale={1.1}>
            <torusGeometry args={[1.4, 0.015, 16, 100]} />
            <meshPhysicalMaterial color={materialProps.color} opacity={0.5} transparent />
          </mesh>
          {/* Particle dust band around rings */}
          <Sparkles count={30} scale={[3, 0.15, 3]} size={2} speed={0.3} opacity={0.4} color={materialProps.color} />
        </group>
      );

    case "prism":
      // Habitable/Tech world - Solid core + Wireframe Geo Shell + pulsing data nodes
      return (
        <group>
          {/* Solid core */}
          <mesh>
            <sphereGeometry args={[0.65, 64, 64]} />
            {mat}
          </mesh>
          {/* Tech/Geodesic outer shell contra-rotating */}
          <mesh ref={atmosphereRef}>
            <icosahedronGeometry args={[0.72, 3]} />
            <meshPhysicalMaterial
              {...materialProps}
              wireframe
              opacity={0.4}
              transparent
              emissive={materialProps.emissive}
              emissiveIntensity={isActive ? 1.5 : 0.5}
            />
          </mesh>
          {/* Pulsing data nodes on surface */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const phi = Math.acos(-1 + (2 * i) / 6);
            const theta = Math.sqrt(6 * Math.PI) * phi;
            const r = 0.72;
            return (
              <mesh key={i} position={[
                r * Math.cos(theta) * Math.sin(phi),
                r * Math.cos(phi),
                r * Math.sin(theta) * Math.sin(phi)
              ]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshBasicMaterial
                  color={materialProps.color}
                  transparent
                  opacity={isActive ? 0.8 : 0.3}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            );
          })}
          {/* Atmospheric glow */}
          <mesh>
            <sphereGeometry args={[0.82, 32, 32]} />
            <meshBasicMaterial color={materialProps.color} transparent opacity={isActive ? 0.04 : 0.02} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      );

    case "helix":
      // Pulsar - Sharp core + 3 complex intersecting rings + energy jets
      return (
        <group>
          {/* Sharp crystalline core */}
          <mesh ref={coreRef}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshPhysicalMaterial
              color={materialProps.color}
              emissive={materialProps.emissive}
              emissiveIntensity={isActive ? 3 : 1.5}
              toneMapped={false}
              flatShading
            />
          </mesh>
          {/* Ring 1 - Vertical */}
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.9, 0.04, 32, 100]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Ring 2 - Angled */}
          <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[0.8, 0.02, 32, 100]} />
            <meshPhysicalMaterial {...materialProps} opacity={0.6} transparent />
          </mesh>
          {/* Ring 3 - Counter Angled */}
          <mesh ref={ring3Ref} rotation={[Math.PI / 4, -Math.PI / 3, 0]}>
            <torusGeometry args={[1.0, 0.01, 16, 100]} />
            <meshPhysicalMaterial {...materialProps} opacity={0.4} transparent />
          </mesh>
          {/* Energy jet beam — top */}
          <mesh ref={jetRef} position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.02, 0.08, 0.6, 8]} />
            <meshBasicMaterial
              color={materialProps.color}
              transparent
              opacity={0.2}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Energy jet beam — bottom */}
          <mesh ref={jet2Ref} position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.08, 0.6, 8]} />
            <meshBasicMaterial
              color={materialProps.color}
              transparent
              opacity={0.2}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Axial particles */}
          <Sparkles count={15} scale={[0.3, 2, 0.3]} size={2} speed={0.8} opacity={0.4} color={materialProps.color} />
        </group>
      );

    case "shield":
      // Crystal/Ice - Sharp inner octahedron + Refractive smooth bubble + refraction shimmer
      return (
        <group>
          {/* Inner diamond/crystal */}
          <mesh ref={coreRef}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshPhysicalMaterial
              {...materialProps}
              flatShading
              emissiveIntensity={isActive ? 2 : 1}
              opacity={0.9}
            />
          </mesh>
          {/* Perfect glass protective sphere */}
          <mesh ref={atmosphereRef} scale={1.0}>
            <sphereGeometry args={[0.75, 64, 64]} />
            {glassMaterial}
          </mesh>
          {/* Outer shimmer halo */}
          <mesh>
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshBasicMaterial color={materialProps.color} transparent opacity={isActive ? 0.06 : 0.02} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Internal refraction sparkles */}
          <Sparkles count={12} scale={[1, 1, 1]} size={2} speed={0.4} opacity={0.3} color="#ffffff" />
        </group>
      );

    case "crown":
      // Star/Lava planet - Emissive core + Corona wireframe + Orbiting moons + corona flares
      return (
        <group>
          {/* Corona flare halo */}
          <mesh>
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshBasicMaterial color={materialProps.color} transparent opacity={isActive ? 0.08 : 0.03} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Emissive Star Core */}
          <mesh ref={coreRef}>
            <sphereGeometry args={[0.6, 64, 64]} />
            <meshPhysicalMaterial
              {...materialProps}
              emissiveIntensity={isActive ? 2.5 : 1.5}
              toneMapped={false}
              opacity={1}
            />
          </mesh>
          {/* Corona/Energy Shell */}
          <mesh ref={atmosphereRef}>
            <icosahedronGeometry args={[0.68, 2]} />
            <meshPhysicalMaterial
              {...materialProps}
              wireframe
              opacity={0.2}
              transparent
              emissive={materialProps.emissive}
              emissiveIntensity={1}
            />
          </mesh>
          {/* Orbiting Moon Belt */}
          <group ref={debrisRef}>
            {[
              { r: 1.1, s: 0.12, y: 0.2, speed: 1 },
              { r: 1.3, s: 0.08, y: -0.15, speed: 1.2 },
              { r: 0.95, s: 0.05, y: 0.3, speed: 0.8 }
            ].map((moon, i) => {
              const a = (i / 3) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * moon.r, moon.y, Math.sin(a) * moon.r]}>
                  <sphereGeometry args={[moon.s, 32, 32]} />
                  <meshPhysicalMaterial {...materialProps} emissiveIntensity={isActive ? 2 : 1} toneMapped={false} />
                </mesh>
              );
            })}
          </group>
          {/* Corona flare particles */}
          <Sparkles count={20} scale={[2, 2, 2]} size={3} speed={0.5} opacity={0.4} color={materialProps.color} />
        </group>
      );

    default:
      return (
        <mesh>
          <sphereGeometry args={[0.75, 64, 64]} />
          {mat}
        </mesh>
      );
  }
}

// -----------------------------------------------------------------------------
// Experience 3D Card — floating geometry + HTML card
// -----------------------------------------------------------------------------
function ExperienceCard3D({
  data,
  index,
  total,
  isActive,
  isMobile,
  onClick,
}: {
  data: ExperienceData;
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

    // Gentle continuous rotation - faster when active/hovered
    groupRef.current.rotation.y += delta * (isActive ? 0.3 : (hovered ? 0.22 : 0.1));
    groupRef.current.rotation.x += delta * (isActive ? 0.1 : 0.035);

    // Scale — equalized with Achievements section
    const targetScale = isActive ? 1.15 : (hovered ? 0.95 : 0.7);
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.06);
    groupRef.current.scale.setScalar(newScale);
  });

  const Icon = typeIcons[data.type];

  const materialProps = {
    color: data.color,
    metalness: 0.85,
    roughness: 0.15,
    emissive: data.accent,
    emissiveIntensity: isActive ? 2.0 : hovered ? 0.9 : 0.3,
    transparent: true,
    opacity: isActive ? 0.95 : 0.8,
    envMapIntensity: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    toneMapped: false,
  };

  return (
    <group position={pos} scale={isMobile ? 0.45 : 0.65}>
      {/* Floating 3D geometry */}
      <Float
        floatIntensity={isActive ? 1.5 : 0.8}
        rotationIntensity={isActive ? 1 : 0.5}
        speed={isActive ? 2 : 1}
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
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 64]} />
        <meshBasicMaterial color={data.color} transparent opacity={isActive ? 0.35 : 0.05} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -1.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.3, 64]} />
        <meshBasicMaterial color={data.color} transparent opacity={isActive ? 0.2 : 0.03} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Energy beam from base */}
      {isActive && (
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.15, 2, 8]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.25}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* HTML Card — info overlay below the geometry */}
      <Html
        position={[0, -4.0, 0]}
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
          className="w-[280px] sm:w-[320px] md:w-80 p-4 md:p-5 rounded-2xl backdrop-blur-xl border border-white/10"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.6))`,
            boxShadow: isActive
              ? `0 0 40px -10px ${data.color}, inset 0 1px 0 rgba(255,255,255,0.1)`
              : "none",
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${data.color}30, ${data.accent}20)`,
                  boxShadow: `inset 0 0 12px ${data.color}30`,
                }}
              >
                <Icon size={20} color={data.color} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                  {data.company}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                  <Calendar size={11} />
                  <span>{data.period}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role */}
          <h4
            className="text-lg md:text-xl font-black mb-2"
            style={{ color: data.color }}
          >
            {data.role}
          </h4>

          {/* Highlight badge */}
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                color: data.color,
                borderColor: `${data.color}40`,
                backgroundColor: `${data.color}10`,
                boxShadow: `0 0 12px ${data.color}15`,
              }}
            >
              <Zap size={12} />
              {data.highlight}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {data.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={{
                  color: data.accent,
                  borderColor: `${data.accent}25`,
                  backgroundColor: `${data.accent}08`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Bottom gradient line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${data.color}, transparent)`,
            }}
          />
        </div>
      </Html>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Camera Rig — smooth transitions between cards
// -----------------------------------------------------------------------------
function CameraRig({
  activeIndex,
  isMobile,
}: {
  activeIndex: number;
  isMobile: boolean;
}) {
  const { camera } = useThree();

  // Reusable vectors to avoid per-frame allocations
  const _targetPos = useMemo(() => new THREE.Vector3(), []);
  const _lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  const _currentLookAt = useMemo(() => new THREE.Vector3(), []);
  const _forward = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const angle = (activeIndex / experiences.length) * Math.PI * 2;
    const cameraDistance = RADIUS + (isMobile ? 9 : 7);
    _targetPos.set(
      Math.cos(angle) * cameraDistance,
      1.5,
      Math.sin(angle) * cameraDistance
    );
    camera.position.lerp(_targetPos, 0.035);

    // Look at the active card — center on planet+card combo
    const activePos = getPosition(activeIndex, experiences.length);
    _lookAtTarget.set(activePos[0], -1.3, activePos[2]);

    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
    _currentLookAt.copy(_forward).lerp(_lookAtTarget, 0.035);
    camera.lookAt(_currentLookAt);
  });

  return null;
}

// -----------------------------------------------------------------------------
// Full 3D Scene
// -----------------------------------------------------------------------------
function Scene({
  activeIndex,
  onSelect,
  isMobile,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  isMobile: boolean;
}) {
  const activeData = experiences[activeIndex];

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
        position={[-5, -2, 5]}
        intensity={0.6}
        color="#ffffff"
        distance={18}
      />

      <CameraRig activeIndex={activeIndex} isMobile={isMobile} />

      {/* All experience cards in a circle */}
      <group position={[0, -0.4, 0]}>
        {experiences.map((exp, i) => (
          <ExperienceCard3D
            key={exp.id}
            data={exp}
            index={i}
            total={experiences.length}
            isActive={activeIndex === i}
            isMobile={isMobile}
            onClick={() => onSelect(i)}
          />
        ))}
      </group>

      {/* Central energy core */}
      <Float floatIntensity={2} speed={2}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.25, 1]} />
          <meshBasicMaterial
            color={activeData.accent}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      {/* Scene atmosphere */}
      <BakeShadows />
      <Sparkles
        count={60}
        scale={25}
        size={5}
        speed={0.12}
        opacity={0.25}
        color={activeData.color}
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
export default function Experience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  const navigate = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= experiences.length) return;
      setActiveIndex(newIndex);
    },
    []
  );

  // Keyboard navigation
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
        navigate((activeIndex + 1) % experiences.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate((activeIndex - 1 + experiences.length) % experiences.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, navigate]);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 50) {
        if (delta < 0) navigate((activeIndex + 1) % experiences.length);
        else navigate((activeIndex - 1 + experiences.length) % experiences.length);
      }
    },
    [activeIndex, navigate]
  );

  const activeData = experiences[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative h-screen overflow-hidden flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-8 left-0 w-full text-center z-20 pointer-events-none">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-2xl"
        >
          Experiences &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-400 to-cyan-400">
            Ventures
          </span>
        </motion.h2>
        <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto drop-shadow-md">
          Navigate the gallery. Click on a planet to focus.
        </p>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() =>
          navigate((activeIndex - 1 + experiences.length) % experiences.length)
        }
        className="absolute left-2 md:left-8 top-[60%] md:top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all hover:scale-110 active:scale-90"
      >
        <ChevronLeft size={isMobile ? 18 : 22} />
      </button>
      <button
        onClick={() => navigate((activeIndex + 1) % experiences.length)}
        className="absolute right-2 md:right-8 top-[60%] md:top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all hover:scale-110 active:scale-90"
      >
        <ChevronRight size={isMobile ? 18 : 22} />
      </button>



      {/* 3D Canvas — full section */}
      <div className="absolute inset-0 w-full h-full z-0 cursor-default">
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
