"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D, Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useRef, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface GlowingSphereProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
}

// Individual glowing sphere
function GlowingSphere({ position, color, size = 0.5, speed = 1 }: GlowingSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    // Floating animation
    meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    // Pulsing scale
    const scale = size + Math.sin(state.clock.elapsedTime * speed * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

// Orbiting particles around section dividers
function OrbitingParticles({ radius = 3, count = 20 }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={groupRef}>
      {[...Array(count)].map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
              emissive={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
              emissiveIntensity={1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Energy beam connectors
function EnergyBeams() {
  const beamsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!beamsRef.current) return;
    beamsRef.current.children.forEach((beam, i) => {
      const mesh = beam as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
    });
  });

  return (
    <group ref={beamsRef}>
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const length = 8;
        return (
          <mesh
            key={i}
            position={[0, 0, 0]}
            rotation={[0, 0, angle]}
          >
            <cylinderGeometry args={[0.01, 0.01, length, 8]} />
            <meshStandardMaterial
              color="#8b5cf6"
              transparent
              opacity={0.3}
              emissive="#8b5cf6"
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Pulsing rings
function PulsingRings() {
  const ringsRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const baseScale = 1 + i * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 2 - i * 0.3) * 0.1;
      ring.scale.setScalar(baseScale + pulse);

      const material = ring.material as THREE.MeshStandardMaterial;
      material.opacity = 0.3 - i * 0.05 + pulse * 0.1;
    });
  });

  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { ringsRef.current[i] = el; }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1 + i * 0.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.3}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Glass orb with refraction
function GlassOrb({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1.2, 3]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          thickness={1.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

// Scene content
function DividerSceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ec4899" />

      <PulsingRings />
      <EnergyBeams />
      <OrbitingParticles radius={3.5} count={24} />
      <GlassOrb position={[0, 0, 0]} />

      <GlowingSphere position={[-3, 0, -2]} color="#ec4899" size={0.3} speed={1.2} />
      <GlowingSphere position={[3, 0, -2]} color="#06b6d4" size={0.3} speed={0.8} />
      <GlowingSphere position={[0, 2.5, -1]} color="#22c55e" size={0.2} speed={1.5} />
    </>
  );
}

// Component for section dividers
export default function SectionDivider3D() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="relative w-full h-32 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <DividerSceneContent />
          </Suspense>
        </Canvas>
      </div>

      {/* Horizontal lines */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

// Alternative floating orbs for page background
export function FloatingOrbs3D() {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />

          <GlowingSphere position={[-4, 2, -3]} color="#8b5cf6" size={0.8} speed={0.6} />
          <GlowingSphere position={[4, -2, -4]} color="#ec4899" size={0.6} speed={0.8} />
          <GlowingSphere position={[-2, -3, -2]} color="#06b6d4" size={0.5} speed={1} />
          <GlowingSphere position={[3, 3, -5]} color="#22c55e" size={0.4} speed={1.2} />
          <GlowingSphere position={[0, 0, -6]} color="#f59e0b" size={0.7} speed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
