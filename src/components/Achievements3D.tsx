"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Text, Environment, Sparkles, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, Trophy, Code, Zap, Flame, Crown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// -----------------------------------------------------------------------------
// Data & Configuration
// -----------------------------------------------------------------------------

const achievements = [
    {
        id: 0,
        title: "Codeforces Specialist",
        description: "Reached 1450 rating, outperforming 80% of global competitive programmers.",
        stats: "Top 20%",
        icon: Code,
        color: "#22d3ee", // cyan-400
        accent: "#06b6d4", // cyan-500
        geometry: "dodecahedron",
        position: [-2, 0, 0]
    },
    {
        id: 1,
        title: "CodeChef Elite",
        description: "4-Star status (1864 rating). Top 0.8% among 2 million+ coders worldwide.",
        stats: "Top 0.8%",
        icon: Star,
        color: "#fbbf24", // amber-400
        accent: "#f59e0b", // amber-500
        geometry: "icosahedron",
        position: [2, 0, 0]
    },
    {
        id: 2,
        title: "HackerRank Legend",
        description: "6-Star Gold Badge. Ranked in the ultra-elite top 0.07% of 26M+ developers.",
        stats: "Top 0.07%",
        icon: Trophy,
        color: "#4ade80", // green-400
        accent: "#22c55e", // green-500
        geometry: "octahedron",
        position: [0, 2, 0]
    },
    {
        id: 3,
        title: "Problem Crusher",
        description: "Solved 1000+ algorithmic challenges across platforms. Mastering DSA.",
        stats: "1000+ Solved",
        icon: Flame,
        color: "#f472b6", // pink-400
        accent: "#ec4899", // pink-500
        geometry: "torus",
        position: [0, -2, 0]
    },
];

// -----------------------------------------------------------------------------
// 3D Components
// -----------------------------------------------------------------------------

function DynamicGeometry({ activeId }: { activeId: number | null }) {
    const meshRef = useRef<THREE.Mesh>(null);
    // Default to first item if none active, or stay on last active
    const targetId = activeId ?? 0;
    const activeData = achievements.find(a => a.id === targetId) || achievements[0];

    // Smoothly interpolate color & animation
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Dynamic Rotation
        meshRef.current.rotation.x += delta * 0.4;
        meshRef.current.rotation.y += delta * 0.5;
    });

    // Select geometry based on active ID
    const Geometry = useMemo(() => {
        switch (activeData.geometry) {
            case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
            case "icosahedron": return <icosahedronGeometry args={[1, 0]} />;
            case "octahedron": return <octahedronGeometry args={[1, 0]} />;
            case "torus": return <torusGeometry args={[0.8, 0.3, 32, 100]} />;
            default: return <sphereGeometry args={[1, 32, 32]} />;
        }
    }, [activeData.geometry]);

    return (
        <group>
            {/* Main Transmission Mesh */}
            <Float floatIntensity={4} rotationIntensity={2} speed={3}>
                <mesh ref={meshRef}>
                    {Geometry}
                    <MeshTransmissionMaterial
                        backside
                        backsideThickness={1}
                        thickness={0.5}
                        roughness={0.05} // Sharper reflections
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        transmission={0.98}
                        ior={1.4}
                        chromaticAberration={0.4} // More color splitting
                        anisotropy={0.5}
                        distortion={0.6} // More distortion for liquid feel
                        distortionScale={0.8}
                        temporalDistortion={0.4}
                        color={activeData.color}
                        emissive={activeData.accent}
                        emissiveIntensity={0.8} // Brighter
                        toneMapped={false}
                    />
                </mesh>
            </Float>

            {/* Inner Wireframe Geometery (Counter-rotating) */}
            <Float floatIntensity={2} rotationIntensity={4} speed={4}>
                <mesh scale={0.6} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshBasicMaterial color={activeData.accent} wireframe transparent opacity={0.3} />
                </mesh>
            </Float>

            {/* Glowing Core Pulse */}
            <Float speed={5} floatIntensity={0.5}>
                <mesh scale={0.4}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial color={activeData.color} transparent opacity={0.9} />
                </mesh>
            </Float>
        </group>
    );
}

function FloatingBadges({ activeId, onHover }: { activeId: number | null, onHover: (id: number | null) => void }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        // Continuous orbit
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        // Slight bobbing
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    });

    return (
        <group ref={groupRef}>
            {achievements.map((item, index) => {
                const angle = (index / achievements.length) * Math.PI * 2;
                const radius = 2.2; // Slightly larger for breathing room
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const isActive = activeId === item.id;

                return (
                    <group key={item.id} position={[x, 0, z]}>
                        <Float
                            speed={isActive ? 10 : 4}
                            rotationIntensity={isActive ? 2 : 0.5}
                            floatIntensity={isActive ? 2 : 1}
                        >
                            <mesh
                                onPointerOver={(e) => { e.stopPropagation(); onHover(item.id); document.body.style.cursor = 'pointer'; }}
                                onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
                                scale={isActive ? 1.5 : 1}
                            >
                                <octahedronGeometry args={[0.2, 0]} />
                                <meshStandardMaterial
                                    color={item.color}
                                    emissive={item.accent}
                                    emissiveIntensity={isActive ? 3 : 0.8}
                                    toneMapped={false}
                                    roughness={0.1}
                                    metalness={1}
                                />
                            </mesh>
                            {/* Halo Ring for Active */}
                            {isActive && (
                                <mesh rotation={[Math.PI / 2, 0, 0]}>
                                    <ringGeometry args={[0.3, 0.35, 32]} />
                                    <meshBasicMaterial color={item.color} transparent opacity={0.5} side={THREE.DoubleSide} />
                                </mesh>
                            )}
                        </Float>
                    </group>
                );
            })}
        </group>
    );
}

function MovingLight({ color }: { color: string }) {
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (!lightRef.current) return;
        const t = state.clock.elapsedTime;
        lightRef.current.position.x = Math.sin(t * 0.5) * 5;
        lightRef.current.position.y = Math.cos(t * 0.3) * 5;
        lightRef.current.position.z = Math.sin(t * 0.2) * 5 + 2;
    });
    return <pointLight ref={lightRef} intensity={2} color={color} distance={10} />;
}

function Scene({ activeId, onHover, isMobile }: { activeId: number | null, onHover: (id: number | null) => void, isMobile: boolean }) {
    const activeData = achievements.find(a => a.id === (activeId ?? 0)) || achievements[0];

    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.1} />

            <MovingLight color={activeData.color} />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#ffffff" />

            <group position={isMobile ? [0, 1, 0] : [2.5, 0, 0]}>
                <DynamicGeometry activeId={activeId} />
                <FloatingBadges activeId={activeId} onHover={onHover} />
            </group>

            <Sparkles
                count={80}
                scale={20}
                size={6}
                speed={0.4}
                opacity={0.5}
                color={activeData.color}
            />
        </>
    );
}

// -----------------------------------------------------------------------------
// UI Component
// -----------------------------------------------------------------------------

function AchievementCard({ item, isActive, onHover }: { item: typeof achievements[0], isActive: boolean, onHover: (id: number | null) => void }) {
    const Icon = item.icon;

    return (
        <motion.div
            layout
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden group
        ${isActive ? 'scale-105' : 'hover:scale-105'}
      `}
            style={{
                background: "rgba(0,0,0,0.4)",
                boxShadow: isActive ? `0 0 30px -5px ${item.color}30` : "none"
            }}
        >
            {/* Animated Gradient Border */}
            <div className={`absolute inset-0 p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent ${isActive ? 'from-white/30 to-white/5' : ''}`}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl rounded-2xl h-full w-full" />
            </div>

            {/* Active Glow Background */}
            <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${isActive ? 'opacity-20' : 'group-hover:opacity-10'}`}
                style={{ background: `linear-gradient(45deg, ${item.color}, transparent)` }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-start gap-5">
                <div className="relative">
                    <div
                        className={`p-4 rounded-xl transition-all duration-500 ${isActive ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}
                        style={{
                            boxShadow: isActive ? `0 0 20px ${item.color}60` : undefined,
                            backgroundColor: isActive ? item.color : undefined
                        }}
                    >
                        <Icon size={28} className={isActive ? "text-black" : ""} />
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-xl transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {item.title}
                        </h3>
                        <span
                            className={`text-xs font-bold px-2 py-1 rounded-full border transition-colors duration-300 ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-gray-500 group-hover:text-gray-400'}`}
                            style={{ borderColor: isActive ? item.color : undefined, color: isActive ? item.color : undefined }}
                        >
                            {item.stats}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">
                        {item.description}
                    </p>
                </div>
            </div>

            {/* Interactive Shine */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] transition-transform duration-1000 ${isActive ? 'translate-x-[200%]' : 'group-hover:translate-x-[200%]'}`} />
        </motion.div>
    );
}

export default function Achievements3D() {
    const [activeId, setActiveId] = useState<number | null>(null);
    const isMobile = useIsMobile();
    const sectionRef = useRef<HTMLElement>(null);

    // If mobile, checking if we want a different layout, but for now consistent 3D + List is good
    // Mobile might need the canvas behind the text or above.

    return (
        <section ref={sectionRef} id="achievements" className="relative min-h-[800px] py-24 bg-black overflow-hidden flex items-center">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">

                {/* Header */}
                <motion.div
                    className="text-center mb-16 lg:mb-0 lg:absolute lg:top-0 lg:left-0 lg:w-1/2 lg:h-full lg:flex lg:flex-col lg:justify-center lg:items-start lg:pl-8 lg:text-left z-20 pointer-events-none"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {/* Background Text Faded */}

                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500">Achievements</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mb-8 pointer-events-auto">
                        Consistently pushing boundaries in algorithmic efficiency and competitive programming. Ranked among the top developers globally.
                    </p>

                    {/* List for Desktop (Left Side) */}
                    <div className="hidden lg:flex flex-col gap-4 w-full max-w-lg pointer-events-auto">
                        {achievements.map((item) => (
                            <AchievementCard
                                key={item.id}
                                item={item}
                                isActive={activeId === item.id}
                                onHover={setActiveId}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Mobile View List (Below header) */}
                <div className="lg:hidden grid grid-cols-1 gap-4 relative z-20 pointer-events-auto">
                    {achievements.map((item) => (
                        <AchievementCard
                            key={item.id}
                            item={item}
                            isActive={activeId === item.id}
                            onHover={setActiveId}
                        />
                    ))}
                </div>

            </div>

            {/* 3D Scene Container - Fixed / Absolute Position */}
            <div className="absolute inset-0 w-full h-full z-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="cursor-grab active:cursor-grabbing">
                    <Suspense fallback={null}>
                        <Scene activeId={activeId} onHover={setActiveId} isMobile={isMobile} />
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            autoRotate={!activeId}
                            autoRotateSpeed={0.5}
                            minPolarAngle={Math.PI / 4}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Suspense>
                </Canvas>
                {/* Vignette for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none lg:w-2/3" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none h-32 bottom-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent pointer-events-none h-32 top-0" />
            </div>
        </section>
    );
}
