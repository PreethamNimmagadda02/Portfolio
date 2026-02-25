"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Float,
    Environment,
    Sparkles,
    Stars,
    Html,
    ContactShadows,
    useCursor,
    BakeShadows
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Award, Star, Trophy, Code, Flame } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// -----------------------------------------------------------------------------
// Data
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
        geometry: "crystal"  // tall angular crystal — code precision
    },
    {
        id: 1,
        title: "CodeChef Elite",
        description: "4-Star status (1864 rating). Top 0.8% among 2 million+ coders worldwide.",
        stats: "Top 0.8%",
        icon: Star,
        color: "#fbbf24", // amber-400
        accent: "#f59e0b", // amber-500
        geometry: "star"  // 4-pointed star — elite status
    },
    {
        id: 2,
        title: "HackerRank Legend",
        description: "6-Star Gold Badge. Ranked in the ultra-elite top 0.07% of 26M+ developers.",
        stats: "Top 0.07%",
        icon: Trophy,
        color: "#4ade80", // green-400
        accent: "#22c55e", // green-500
        geometry: "trophy"  // trophy shape — legendary status
    },
    {
        id: 3,
        title: "Problem Crusher",
        description: "Solved 1000+ algorithmic challenges across platforms. Mastering DSA.",
        stats: "1000+ Solved",
        icon: Flame,
        color: "#f472b6", // pink-400
        accent: "#ec4899", // pink-500
        geometry: "flame"  // flame-like stack — relentless solving
    },
];

// Helper to calculate positions in a circle
const RADIUS = 4;
const getPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2;
    return [Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS] as [number, number, number];
};

// -----------------------------------------------------------------------------
// 3D Components
// -----------------------------------------------------------------------------

function AnimatedPlanet({ type, materialProps, isActive }: { type: string; materialProps: Record<string, any>; isActive: boolean }) {
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const moon1Ref = useRef<THREE.Group>(null);
    const moon2Ref = useRef<THREE.Group>(null);
    const moon3Ref = useRef<THREE.Group>(null);
    const debrisRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);
    const auroraRef = useRef<THREE.Mesh>(null);
    const crustRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        // Animate ring rotations at different speeds
        if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.35;
        if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.2;

        // Animate 3 orbiting moons at different orbits
        if (moon1Ref.current) {
            moon1Ref.current.position.x = Math.cos(t * 0.6) * 1.4;
            moon1Ref.current.position.z = Math.sin(t * 0.6) * 1.4;
            moon1Ref.current.position.y = Math.sin(t * 0.9) * 0.25;
        }
        if (moon2Ref.current) {
            moon2Ref.current.position.x = Math.cos(t * 0.45 + 2.1) * 1.7;
            moon2Ref.current.position.z = Math.sin(t * 0.45 + 2.1) * 1.0;
            moon2Ref.current.position.y = Math.cos(t * 0.7) * 0.4;
        }
        if (moon3Ref.current) {
            moon3Ref.current.position.x = Math.cos(t * 0.8 + 4.2) * 1.1;
            moon3Ref.current.position.z = Math.sin(t * 0.8 + 4.2) * 1.1;
            moon3Ref.current.position.y = Math.sin(t * 1.5) * 0.15;
        }
        // Animate orbiting debris belt
        if (debrisRef.current) {
            debrisRef.current.rotation.y = t * 0.4;
            debrisRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
        }
        // Pulsing core glow
        if (coreRef.current) {
            const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
            mat.emissiveIntensity = 1.5 + Math.sin(t * 2.5) * 0.8;
        }
        // Breathing atmosphere
        if (atmosphereRef.current) {
            const s = 1.0 + Math.sin(t * 1.2) * 0.04;
            atmosphereRef.current.scale.set(s, s, s);
        }
        // Aurora rotation
        if (auroraRef.current) {
            auroraRef.current.rotation.y = t * 0.15;
            auroraRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
            const mat = auroraRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.12 + Math.sin(t * 1.8) * 0.08;
        }
        // Volcanic crust pulsing
        if (crustRef.current) {
            const mat = crustRef.current.material as THREE.MeshPhysicalMaterial;
            mat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.5;
        }
    });

    switch (type) {
        case "crystal":
            // ── Ringed Gas Giant with layered atmosphere & particle belt ──
            return (
                <group>
                    {/* Inner atmosphere glow */}
                    <mesh>
                        <sphereGeometry args={[0.95, 48, 48]} />
                        <meshBasicMaterial color={materialProps.color} transparent opacity={0.05} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
                    </mesh>
                    {/* Main planet body — banded gas giant */}
                    <mesh ref={atmosphereRef}>
                        <sphereGeometry args={[0.85, 48, 48]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            metalness={0.6}
                            roughness={0.4}
                            emissive={materialProps.emissive}
                            emissiveIntensity={isActive ? 1.5 : 0.4}
                            clearcoat={0.8}
                            clearcoatRoughness={0.15}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Primary ring — thick & vivid */}
                    <mesh ref={ring1Ref} rotation={[Math.PI / 2.8, 0.15, 0]}>
                        <torusGeometry args={[1.3, 0.07, 16, 100]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            emissive={materialProps.emissive}
                            emissiveIntensity={isActive ? 3.0 : 1.2}
                            metalness={0.9}
                            roughness={0.1}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Secondary ring — wider, ethereal */}
                    <mesh ref={ring2Ref} rotation={[Math.PI / 2.5, -0.1, 0.2]}>
                        <torusGeometry args={[1.55, 0.03, 16, 100]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            emissive={materialProps.emissive}
                            emissiveIntensity={isActive ? 1.5 : 0.5}
                            transparent opacity={0.5}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Tertiary ring — outermost wisp */}
                    <mesh rotation={[Math.PI / 2.8, 0.15, 0]}>
                        <torusGeometry args={[1.75, 0.015, 16, 100]} />
                        <meshBasicMaterial color={materialProps.color} transparent opacity={0.15} />
                    </mesh>
                    {/* Orbiting particle belt */}
                    <Sparkles count={40} scale={[3, 0.3, 3]} size={3} speed={0.5} opacity={0.6} color={materialProps.color} />
                </group>
            );
        case "star":
            // ── Faceted rocky world with 3 orbiting moons & orbital trails ──
            return (
                <group>
                    {/* Atmosphere haze */}
                    <mesh>
                        <sphereGeometry args={[0.95, 32, 32]} />
                        <meshBasicMaterial color={materialProps.color} transparent opacity={0.04} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
                    </mesh>
                    {/* Main planet — faceted rocky surface */}
                    <mesh ref={atmosphereRef}>
                        <icosahedronGeometry args={[0.8, 2]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            metalness={0.7}
                            roughness={0.3}
                            emissive={materialProps.emissive}
                            emissiveIntensity={isActive ? 1.5 : 0.4}
                            flatShading
                            clearcoat={0.6}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Moon 1 — large, cratered */}
                    <group ref={moon1Ref}>
                        <mesh>
                            <icosahedronGeometry args={[0.18, 1]} />
                            <meshPhysicalMaterial
                                color={materialProps.color}
                                emissive={materialProps.emissive}
                                emissiveIntensity={isActive ? 2.5 : 0.8}
                                flatShading
                                toneMapped={false}
                            />
                        </mesh>
                    </group>
                    {/* Moon 2 — small, glassy */}
                    <group ref={moon2Ref}>
                        <mesh>
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <meshPhysicalMaterial
                                color="#ffffff"
                                emissive={materialProps.emissive}
                                emissiveIntensity={isActive ? 1.5 : 0.3}
                                transmission={0.5}
                                thickness={0.5}
                                toneMapped={false}
                            />
                        </mesh>
                    </group>
                    {/* Moon 3 — tiny, bright */}
                    <group ref={moon3Ref}>
                        <mesh>
                            <octahedronGeometry args={[0.07, 0]} />
                            <meshPhysicalMaterial
                                color={materialProps.color}
                                emissive={materialProps.emissive}
                                emissiveIntensity={isActive ? 3 : 1}
                                toneMapped={false}
                            />
                        </mesh>
                    </group>
                    {/* Orbital trail ring */}
                    <mesh rotation={[Math.PI / 2.2, 0, 0]}>
                        <torusGeometry args={[1.4, 0.008, 8, 100]} />
                        <meshBasicMaterial color={materialProps.color} transparent opacity={isActive ? 0.25 : 0.08} />
                    </mesh>
                    <mesh rotation={[Math.PI / 1.8, 0.3, 0]}>
                        <torusGeometry args={[1.7, 0.005, 8, 100]} />
                        <meshBasicMaterial color={materialProps.color} transparent opacity={isActive ? 0.15 : 0.04} />
                    </mesh>
                </group>
            );
        case "trophy":
            // ── Crystalline Energy World with pulsing core & aurora wisps ──
            return (
                <group>
                    {/* Outer aurora wisps */}
                    <mesh ref={auroraRef}>
                        <icosahedronGeometry args={[1.2, 1]} />
                        <meshBasicMaterial color={materialProps.color} wireframe transparent opacity={0.12} blending={THREE.AdditiveBlending} />
                    </mesh>
                    {/* Translucent crystalline shell */}
                    <mesh ref={atmosphereRef}>
                        <sphereGeometry args={[0.85, 48, 48]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            transmission={0.9}
                            thickness={2.0}
                            roughness={0.05}
                            ior={1.8}
                            metalness={0.1}
                            clearcoat={1}
                            clearcoatRoughness={0.05}
                            envMapIntensity={1.5}
                        />
                    </mesh>
                    {/* Inner energy core — bright pulsing */}
                    <mesh ref={coreRef}>
                        <icosahedronGeometry args={[0.45, 2]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            emissive={materialProps.emissive}
                            emissiveIntensity={2}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Innermost plasma seed */}
                    <mesh>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
                    </mesh>
                    {/* Energy particles orbit */}
                    <Sparkles count={30} scale={[2, 2, 2]} size={4} speed={0.8} opacity={0.7} color={materialProps.color} />
                </group>
            );
        case "flame":
            // ── Volcanic World with magma cracks, debris belt & eruption particles ──
            return (
                <group>
                    {/* Heat haze atmosphere */}
                    <mesh>
                        <sphereGeometry args={[1.0, 32, 32]} />
                        <meshBasicMaterial color={materialProps.color} transparent opacity={0.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
                    </mesh>
                    {/* Outer crust — dark, cracked volcanic surface */}
                    <mesh ref={atmosphereRef}>
                        <icosahedronGeometry args={[0.78, 3]} />
                        <meshPhysicalMaterial
                            color="#1a0a0a"
                            metalness={0.9}
                            roughness={0.6}
                            flatShading
                            clearcoat={0.3}
                        />
                    </mesh>
                    {/* Inner lava layer — peeks through cracks */}
                    <mesh ref={crustRef}>
                        <icosahedronGeometry args={[0.76, 2]} />
                        <meshPhysicalMaterial
                            color={materialProps.color}
                            emissive={materialProps.emissive}
                            emissiveIntensity={1.0}
                            metalness={0.3}
                            roughness={0.8}
                            flatShading
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Orbiting magma debris belt */}
                    <group ref={debrisRef}>
                        {Array.from({ length: 14 }).map((_, i) => {
                            const a = (i / 14) * Math.PI * 2;
                            const r = 1.15 + (i % 3) * 0.12;
                            return (
                                <mesh key={i} position={[
                                    Math.cos(a) * r,
                                    Math.sin(i * 3.7) * 0.2,
                                    Math.sin(a) * r
                                ]}>
                                    <dodecahedronGeometry args={[0.04 + (i % 4) * 0.02, 0]} />
                                    <meshPhysicalMaterial
                                        color={i % 2 === 0 ? materialProps.color : "#ff6b35"}
                                        emissive={materialProps.emissive}
                                        emissiveIntensity={isActive ? 3 : 1}
                                        toneMapped={false}
                                    />
                                </mesh>
                            );
                        })}
                    </group>
                    {/* Eruption particles */}
                    <Sparkles count={25} scale={[2, 3, 2]} size={3} speed={1.2} opacity={0.5} color={materialProps.color} />
                </group>
            );
        default: return (
            <mesh>
                <sphereGeometry args={[0.85, 48, 48]} />
                <meshPhysicalMaterial {...materialProps} />
            </mesh>
        );
    }
}

function AchievementMonolith({
    data,
    index,
    total,
    isActive,
    isMobile,
    onClick
}: {
    data: typeof achievements[0],
    index: number,
    total: number,
    isActive: boolean,
    isMobile: boolean,
    onClick: () => void
}) {
    const groupRef = useRef<THREE.Group>(null);
    const pos = getPosition(index, total);
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Base rotation — faster when active, with more axis variation
        groupRef.current.rotation.y += delta * (isActive ? 0.4 : (hovered ? 0.3 : 0.15));
        groupRef.current.rotation.x += delta * (isActive ? 0.15 : 0.05);

        // Scale up if active or hovered with smoothly responsive spring
        const targetScale = isActive ? 0.85 : (hovered ? 0.7 : 0.5);
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    });

    const Icon = data.icon;

    const materialProps = {
        color: data.color,
        metalness: 0.8,
        roughness: 0.2,
        emissive: data.accent,
        emissiveIntensity: isActive ? 1.8 : (hovered ? 0.8 : 0.3),
        transparent: true,
        opacity: isActive ? 0.95 : 0.85,
        envMapIntensity: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        toneMapped: false,
    };

    return (
        <group position={pos} scale={isMobile ? 0.55 : 0.65}>
            {/* The 3D Object */}
            <Float floatIntensity={isActive ? 1.5 : 0.8} rotationIntensity={isActive ? 1 : 0.5} speed={isActive ? 2 : 1}>
                <group
                    ref={groupRef}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
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

            {/* Dynamic HTML HUD — positioned BELOW the monolith so it doesn't cover the shape */}
            <Html
                position={[0, -3.8, 0]}
                center
                className="pointer-events-none z-50 transition-opacity duration-300"
                style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
                zIndexRange={[100, 0]} // Ensure it stays on top without depth sorting issues
                transform={false} // Prevent matrix math jittering
            >
                <div className="w-72 p-5 rounded-2xl backdrop-blur-md bg-black/60 border border-white/10"
                    style={{ boxShadow: isActive ? `0 0 30px -10px ${data.color}` : 'none' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-black/50 border border-white/10"
                            style={{ boxShadow: `inset 0 0 10px ${data.color}40` }}>
                            <Icon size={24} color={data.color} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white drop-shadow-md">{data.title}</h3>
                            <span className="text-xs font-mono px-2 py-1 rounded bg-black/50 border"
                                style={{ color: data.color, borderColor: `${data.color}50` }}>
                                {data.stats}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-light">
                        {data.description}
                    </p>
                </div>
            </Html>
        </group>
    );
}

// Camera Rig to move between monoliths smoothly
function CameraRig({ activeIndex, isMobile }: { activeIndex: number, isMobile: boolean }) {
    const { camera } = useThree();

    useFrame((state, delta) => {
        // Find the angle of the active monolith
        const angle = (activeIndex / achievements.length) * Math.PI * 2;

        // Position camera slightly further out and zoomed in to look at the active monolith
        // We stand back slightly from the origin and look towards the active one
        const cameraDistance = RADIUS + (isMobile ? 9 : 5.5);
        const targetX = Math.cos(angle) * cameraDistance;
        const targetZ = Math.sin(angle) * cameraDistance;
        const targetY = 0.8;

        // Move camera position smoothly
        camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.035);

        // Look at the monolith center, slightly below to include the card
        const activePos = getPosition(activeIndex, achievements.length);
        const lookAtVector = new THREE.Vector3(activePos[0], -0.5, activePos[2]);

        // Smooth looking with matching lerp
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        currentLookAt.lerp(lookAtVector, 0.035);
        camera.lookAt(currentLookAt);
    });

    return null;
}

function Scene({ activeIndex, onSelect, isMobile }: { activeIndex: number, onSelect: (index: number) => void, isMobile: boolean }) {
    const activeData = achievements[activeIndex];

    return (
        <>
            <Environment preset="city" />

            {/* Ambient and point lights */}
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" distance={20} />

            <CameraRig activeIndex={activeIndex} isMobile={isMobile} />

            {/* Render all monoliths */}
            <group position={[0, 0.3, 0]}>
                {achievements.map((item, i) => (
                    <AchievementMonolith
                        key={item.id}
                        data={item}
                        index={i}
                        total={achievements.length}
                        isActive={activeIndex === i}
                        isMobile={isMobile}
                        onClick={() => onSelect(i)}
                    />
                ))}
            </group>

            {/* Central energy source */}
            <Float floatIntensity={2} speed={2}>
                <mesh position={[0, 0, 0]}>
                    <icosahedronGeometry args={[0.3, 1]} />
                    <meshBasicMaterial color={activeData.accent} wireframe transparent opacity={0.3} />
                </mesh>
            </Float>

            {/* Bake shadows to improve performance */}
            <BakeShadows />

            {/* Environment details */}
            <Sparkles count={80} scale={25} size={8} speed={0.3} opacity={0.4} color={activeData.color} />
            <ContactShadows frames={1} position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={10} color="#111111" />
        </>
    );
}

// -----------------------------------------------------------------------------
// UI Component wrapper
// -----------------------------------------------------------------------------

export default function Achievements3D() {
    const [activeIndex, setActiveIndex] = useState(0);
    const isMobile = useIsMobile();

    // Simple auto-rotate if not interacting, maybe optional
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setActiveIndex(prev => (prev + 1) % achievements.length);
    //     }, 8000);
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <section id="achievements" className="relative h-screen overflow-hidden flex items-center justify-center">
            {/* Header Overlay - absolute so it floats above canvas */}
            <div className="absolute top-12 left-0 w-full text-center z-20 pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-2xl"
                >
                    My <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500">Achievements</span>
                </motion.h2>
                <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto drop-shadow-md">
                    Navigate the gallery. Click on a planet to focus.
                </p>
            </div>



            {/* Canvas takes up entire section */}
            <div className="absolute inset-0 w-full h-full z-0 cursor-crosshair">
                <Canvas camera={{ position: isMobile ? [0, 2, 16] : [0, 2, 10], fov: isMobile ? 55 : 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
                    <Scene activeIndex={activeIndex} onSelect={setActiveIndex} isMobile={isMobile} />
                </Canvas>

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/80 to-black/90 pointer-events-none" />
            </div>
        </section>
    );
}
