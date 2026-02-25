"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Html, OrbitControls, Environment, Sparkles as SparklesDrei, Text } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { Code, Rocket, Globe, BookOpen, Sparkles, Users, Zap, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Feature data matching original About.tsx EXACTLY
const features = [
    {
        id: 0,
        icon: Code,
        title: "Generative AI Specialist",
        shortTitle: "Gen AI",
        description: (
            <>
                Pioneering <span className="text-blue-400 font-bold">Multimodal Systems</span> that see beyond the pixel. Architecting <span className="text-purple-400 font-bold">Cognitive Agents</span> capable of complex reasoning and autonomous decision-making in dynamic environments.
            </>
        ),
        color: "#60a5fa", // blue-400
        position: [3, 0, 0],
        orbitSpeed: 0.5
    },
    {
        id: 1,
        icon: Rocket,
        title: "Elite Coder",
        shortTitle: "Coder",
        description: (
            <>
                <span className="text-yellow-400 font-semibold">Global Top 1%</span> on CodeChef (1864 Rating) demonstrating exceptional algorithmic speed. <span className="text-purple-400 font-semibold">Codeforces Specialist</span> with <span className="text-blue-400 font-semibold">1000+ problems</span> solved.
            </>
        ),
        color: "#c084fc", // purple-400
        position: [-3, 0, 0],
        orbitSpeed: 0.6
    },
    {
        id: 2,
        icon: Globe,
        title: "Campus Leader",
        shortTitle: "Leader",
        description: (
            <>
                <span className="text-emerald-400 font-semibold">Strategic Leader</span> orchestrating impacted changes for <span className="text-teal-400 font-semibold">4000+ students</span>. Managed budgets & logistics for <span className="text-green-400 font-semibold">large-scale operations</span>.
            </>
        ),
        color: "#34d399", // emerald-400
        position: [0, 0, 3],
        orbitSpeed: 0.4
    },
    {
        id: 3,
        icon: BookOpen,
        title: "Agent Systems Architect",
        shortTitle: "Architect",
        description: (
            <>
                Building <span className="text-orange-400 font-semibold">Autonomous Swarms</span> for Trading & Logistics. Expert in <span className="text-yellow-400 font-semibold">Multi-Agent Orchestration</span> & <span className="text-amber-400 font-semibold">Scalable Infrastructure</span>.
            </>
        ),
        color: "#fbbf24", // amber-400
        position: [0, 0, -3],
        orbitSpeed: 0.7
    }
];

const stats = [
    { value: "4000+", label: "Students Influenced", color: "text-purple-400", icon: Users },
    { value: "20%", label: "Memory Reduction", color: "text-yellow-400", icon: Zap },
    { value: "350+", label: "Participants Led", color: "text-emerald-400", icon: Target }
];

// -----------------------------------------------------------------------------
// 3D Components
// -----------------------------------------------------------------------------

function TechBackdrop() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        // Slow gentle rotation
        groupRef.current.rotation.y = t * 0.05;
        groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    });

    return (
        <group ref={groupRef} position={[-8, 0, -10]}> {/* Positioned behind left text, pushed back */}
            {/* Wireframe Icosahedron */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh scale={[5, 5, 5]}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshBasicMaterial color="#3b0764" wireframe transparent opacity={0.05} />
                </mesh>
            </Float>

            {/* Floating Particles/Data Stream */}
            <SparklesDrei
                count={150}
                scale={[10, 10, 10]}
                size={4}
                speed={0.4}
                opacity={0.3}
                color="#a855f7"
                noise={1}
            />

            {/* Geometric Accents */}
            <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1}>
                <mesh position={[-2, -3, 0]} rotation={[0.5, 0, 0.5]}>
                    <octahedronGeometry args={[1.5, 0]} />
                    <meshBasicMaterial color="#f472b6" wireframe transparent opacity={0.1} />
                </mesh>
            </Float>
        </group>
    );
}

function CentralCore() {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current || !glowRef.current) return;
        const t = state.clock.elapsedTime;

        // Rotate core
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.z += 0.002;

        // Pulse glow
        const scale = 0.6 + Math.sin(t * 2) * 0.05;
        glowRef.current.scale.set(scale, scale, scale);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                {/* Reduced size further to prevent layout overlap */}
                <icosahedronGeometry args={[0.7, 0]} />
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2}
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    transmission={0.9}
                    ior={1.5}
                    chromaticAberration={0.1}
                    anisotropy={0.5}
                    distortion={0.2}
                    distortionScale={0.3}
                    temporalDistortion={0.5}
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={0.2}
                />
            </mesh>
            {/* Inner pulsing core */}
            <mesh ref={glowRef}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color="#f472b6"
                    emissive="#f472b6"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>
        </Float>
    );
}

function FloatingDebris({ isMobile }: { isMobile: boolean }) {
    const count = isMobile ? 25 : 50;
    const meshRef = useRef<THREE.InstancedMesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;
        meshRef.current.rotation.x = t * 0.05;
        meshRef.current.rotation.y = t * 0.03;
    });

    const [positions] = useState(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 8 + Math.random() * 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI;
            arr[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            arr[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            arr[i * 3 + 2] = r * Math.cos(theta);
        }
        return arr;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
            {Array.from({ length: count }).map((_, i) => (
                <group key={i} position={[positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]} />
            ))}
        </instancedMesh>
    );
}

function Connections({ count, radius = 3.2 }: { count: number, radius?: number }) {
    const lineRef = useRef<THREE.LineSegments>(null);
    const [linePositions] = useState(() => new Float32Array(count * 6));

    useFrame((state) => {
        if (!lineRef.current) return;
        const t = state.clock.elapsedTime;
        const positions = lineRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const startAngle = (i / count) * Math.PI * 2;
            const angle = t * 0.4 + startAngle;
            // Core position (0,0,0) - relative to parent group
            const x = Math.cos(angle) * radius;
            const z = -Math.sin(angle) * radius;

            positions[i * 6] = 0;
            positions[i * 6 + 1] = 0;
            positions[i * 6 + 2] = 0;
            positions[i * 6 + 3] = x;
            positions[i * 6 + 4] = 0;
            positions[i * 6 + 5] = z;
        }
        lineRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <lineSegments ref={lineRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count * 2}
                    args={[linePositions, 3]}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#a855f7" transparent opacity={0.15} />
        </lineSegments>
    );
}

function OrbitingNode({ feature, index, totalCount, onHover, isActive }: { feature: typeof features[0], index: number, totalCount: number, onHover: (id: number | null) => void, isActive: boolean }) {
    const meshRef = useRef<THREE.Group>(null);
    const orbitRef = useRef<THREE.Group>(null);
    const startAngle = (index / totalCount) * Math.PI * 2;
    const radius = 3.2;

    useFrame((state) => {
        if (!orbitRef.current) return;
        orbitRef.current.rotation.y = state.clock.elapsedTime * 0.4 + startAngle;
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.rotation.x += 0.01;
        }
    });

    const renderGeometry = () => {
        switch (index) {
            case 0: return <octahedronGeometry args={[0.4, 0]} />;
            case 1: return <boxGeometry args={[0.5, 0.5, 0.5]} />;
            case 2: return <dodecahedronGeometry args={[0.4, 0]} />;
            case 3: return <torusGeometry args={[0.3, 0.1, 16, 32]} />;
            default: return <sphereGeometry args={[0.4, 32, 32]} />;
        }
    };

    return (
        <group ref={orbitRef}>
            <group position={[radius, 0, 0]}>
                <Float speed={4} rotationIntensity={1} floatIntensity={1}>
                    <group
                        ref={meshRef}
                        onPointerOver={(e) => { e.stopPropagation(); onHover(feature.id); document.body.style.cursor = 'pointer'; }}
                        onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
                    >
                        <mesh scale={isActive ? 1.4 : 1}>
                            {renderGeometry()}
                            <meshStandardMaterial
                                color={feature.color}
                                emissive={feature.color}
                                emissiveIntensity={isActive ? 2 : 0.5}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </mesh>
                        {isActive && (
                            <mesh scale={1.8}>
                                <sphereGeometry args={[0.4, 32, 32]} />
                                <meshBasicMaterial color={feature.color} transparent opacity={0.2} side={THREE.BackSide} />
                            </mesh>
                        )}
                        <Html position={[0, 0.7, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                            <div className={`px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold whitespace-nowrap transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`} style={{ color: feature.color }}>
                                {feature.shortTitle}
                            </div>
                        </Html>
                    </group>
                </Float>
            </group>
        </group>
    );
}

function Scene({ onHover, activeId, isMobile }: { onHover: (id: number | null) => void, activeId: number | null, isMobile: boolean }) {
    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

            {/* LEFT SIDE: Dynamic Background Elements */}
            <TechBackdrop />

            {/* RIGHT SIDE: Main Core and Logic */}
            <group position={isMobile ? [0, 3, 0] : [5, 0, 0]}> {/* Centered on mobile and shifted up, shifted right on desktop */}
                <CentralCore />
                <Connections count={features.length} />
                <FloatingDebris isMobile={isMobile} />
                {features.map((feature, index) => (
                    <OrbitingNode
                        key={feature.id}
                        feature={feature}
                        index={index}
                        totalCount={features.length}
                        onHover={onHover}
                        isActive={activeId === feature.id}
                    />
                ))}
            </group>

            <SparklesDrei count={100} scale={5} size={2} speed={0.4} opacity={0.5} color="#a855f7" />
        </>
    );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export default function About3D() {
    const [activeId, setActiveId] = useState<number | null>(null);
    const isMobile = useIsMobile();

    // Hover logic
    const [displayId, setDisplayId] = useState<number>(0);
    const handleHover = (id: number | null) => {
        setActiveId(id);
        if (id !== null) setDisplayId(id);
    };

    const handlePrev = () => {
        const newId = (displayId - 1 + features.length) % features.length;
        setDisplayId(newId);
        setActiveId(newId);
    };

    const handleNext = () => {
        const newId = (displayId + 1) % features.length;
        setDisplayId(newId);
        setActiveId(newId);
    };

    const activeFeature = features.find(f => f.id === displayId) || features[0];
    const ActiveIcon = activeFeature.icon;

    return (
        <section id="about" className="relative min-h-[800px] md:min-h-screen w-full overflow-hidden flex flex-col justify-center py-20 md:py-0">

            {/* 3D Scene Background - Covers Entire Section */}
            <div className="absolute inset-0 z-0">
                {!isMobile && (
                    <Canvas camera={{ position: isMobile ? [0, 0, 20] : [0, 0, 14], fov: isMobile ? 45 : 35 }} gl={{ antialias: true, alpha: true }} className="cursor-move">
                        <Suspense fallback={null}>
                            <Scene onHover={handleHover} activeId={activeId} isMobile={isMobile} />
                            <OrbitControls
                                enableZoom={false}
                                enablePan={false}
                                autoRotate={activeId === null}
                                autoRotateSpeed={0.5}
                                minPolarAngle={Math.PI / 4}
                                maxPolarAngle={Math.PI / 1.5}
                            />
                        </Suspense>
                    </Canvas>
                )}

                {/* Vignette Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/80 to-black/90" />
            </div>

            {/* Content Container - Glassmorphic Overlay */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative pointer-events-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* LEFT COLUMN: Text Content - with backdrop visibility */}
                    <div className="order-2 lg:order-1 space-y-8 pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="p-0" // Removed rounded-3xl bg-black/20 backdrop-blur-md border border-white/5
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm text-purple-300">
                                <Sparkles size={14} />
                                <span>Who I Am</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 lg:mb-6 leading-tight">
                                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Me</span>
                            </h2>

                            <div className="space-y-6 mb-8 text-gray-300 font-[var(--font-inter)]">
                                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                                    AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 font-bold">Tech Innovator</span> &{" "}
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 font-bold">Community Leader</span>
                                </h3>
                                <p className="text-base md:text-lg leading-relaxed">
                                    Building <span className="text-white font-bold">autonomous AI agents</span> that solve complex problems. Engineered systems with <span className="text-yellow-300 font-bold">20% efficiency gains</span>, pushing the boundaries of what&apos;s possible with AI.
                                </p>
                            </div>

                            {/* Live Feature Details Card */}
                            <motion.div
                                key={displayId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg relative overflow-hidden group mb-8"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${activeFeature.color.replace('text-', '')}`} style={{ backgroundColor: activeFeature.color }} />
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 shrink-0">
                                        <ActiveIcon size={24} style={{ color: activeFeature.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{activeFeature.title}</h3>
                                        <div className="text-gray-300 text-sm leading-relaxed">
                                            {activeFeature.description}
                                        </div>
                                    </div>

                                    {/* Mobile/Tablet Card Navigation */}
                                    <div className="flex flex-col gap-1 shrink-0 lg:hidden">
                                        <button onClick={handlePrev} className="p-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button onClick={handleNext} className="p-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {stats.map((stat, i) => (
                                    <div key={i} className="text-center p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                                        <div className="mb-2 flex justify-center text-gray-400 group-hover:text-white transition-colors">
                                            <stat.icon size={20} />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white mb-1">{stat.value}</h4>
                                        <p className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${stat.color}`}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Empty Div (Scene is behind) */}
                    <div className="hidden lg:block order-1 lg:order-2 h-[300px] md:h-[400px] lg:h-[800px] w-full pointer-events-none" />

                </div>
            </div>
        </section>
    );
}
