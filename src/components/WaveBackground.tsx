"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";

// Animated wave mesh
function WavePlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  // Create initial positions
  const { positions, originalPositions } = useMemo(() => {
    const positions: number[] = [];
    const originalPositions: number[] = [];
    const size = 40;
    const segments = 100;
    const step = size / segments;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = i * step - size / 2;
        const z = j * step - size / 2;
        positions.push(x, 0, z);
        originalPositions.push(x, 0, z);
      }
    }
    return { 
      positions: new Float32Array(positions), 
      originalPositions: new Float32Array(originalPositions) 
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const positionAttribute = geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = originalPositions[i * 3];
      const z = originalPositions[i * 3 + 2];
      
      // Complex wave pattern
      const wave1 = Math.sin(x * 0.3 + time * 0.5) * 0.3;
      const wave2 = Math.sin(z * 0.4 + time * 0.7) * 0.2;
      const wave3 = Math.cos((x + z) * 0.2 + time * 0.3) * 0.15;
      
      positionAttribute.setY(i, wave1 + wave2 + wave3);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.5, 0, 0]}
      position={[0, -2, -5]}
    >
      <planeGeometry args={[40, 40, 100, 100]} />
      <meshStandardMaterial
        color="#8b5cf6"
        wireframe
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Ripple effect from center
function RippleWave() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const positionAttribute = geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const z = positionAttribute.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      
      // Ripple from center
      const y = Math.sin(dist * 0.5 - time * 2) * Math.exp(-dist * 0.1) * 0.5;
      positionAttribute.setY(i, y);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3, 0]}
    >
      <planeGeometry args={[30, 30, 80, 80]} />
      <meshStandardMaterial
        color="#06b6d4"
        wireframe
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Vertical wave ribbons
function WaveRibbons() {
  const ribbonsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ribbonsRef.current) return;
    ribbonsRef.current.children.forEach((ribbon, i) => {
      const mesh = ribbon as THREE.Mesh;
      const geometry = mesh.geometry as THREE.PlaneGeometry;
      const positionAttribute = geometry.attributes.position;
      const time = state.clock.elapsedTime + i * 0.5;

      for (let j = 0; j < positionAttribute.count; j++) {
        const x = positionAttribute.getX(j);
        const offset = Math.sin(x * 0.5 + time) * 0.3;
        positionAttribute.setZ(j, offset);
      }
      positionAttribute.needsUpdate = true;
    });
  });

  return (
    <group ref={ribbonsRef}>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[-6 + i * 3, 0, -8]}
          rotation={[0, 0, 0]}
        >
          <planeGeometry args={[0.5, 15, 50, 1]} />
          <meshStandardMaterial
            color={["#8b5cf6", "#ec4899", "#06b6d4", "#22c55e", "#f59e0b"][i]}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Particle waves
function ParticleWaves({ count = 500 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, originalPositions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10 - 5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Purple to cyan gradient
      const t = (x + 10) / 20;
      colors[i * 3] = 0.55 + t * 0.2;     // R
      colors[i * 3 + 1] = 0.36 - t * 0.2; // G
      colors[i * 3 + 2] = 0.96;           // B
    }

    return { positions, originalPositions, colors };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const x = originalPositions[i * 3];
      const origY = originalPositions[i * 3 + 1];
      
      const wave = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(x * 0.3 + time * 0.5) * 0.3;
      positionAttribute.setY(i, origY + wave);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Scene content
function WaveSceneContent() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#06b6d4" />
      
      <WavePlane />
      <RippleWave />
      <WaveRibbons />
      <ParticleWaves count={300} />
    </>
  );
}

export default function WaveBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
      <Canvas
        camera={{ position: [0, 3, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <WaveSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
