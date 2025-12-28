"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, Box, Icosahedron, Octahedron, TorusKnot } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";

// Mouse tracker hook
function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mouse;
}

// Morphing blob that follows mouse
function MorphingBlob({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth follow mouse
    targetPosition.set(mouse.x * 2, mouse.y * 2, 0);
    meshRef.current.position.lerp(targetPosition, 0.02);
    
    // Continuous rotation
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, -2]}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

// Floating torus rings
function FloatingRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {[...Array(3)].map((_, i) => (
        <Float key={i} speed={1.5 + i * 0.5} rotationIntensity={0.3} floatIntensity={0.5}>
          <Torus
            args={[2 + i * 0.8, 0.02, 16, 100]}
            position={[0, 0, -3 - i]}
            rotation={[Math.PI / 2 + i * 0.3, 0, 0]}
          >
            <meshStandardMaterial
              color={i === 0 ? "#8b5cf6" : i === 1 ? "#06b6d4" : "#ec4899"}
              transparent
              opacity={0.4}
              emissive={i === 0 ? "#8b5cf6" : i === 1 ? "#06b6d4" : "#ec4899"}
              emissiveIntensity={0.5}
            />
          </Torus>
        </Float>
      ))}
    </group>
  );
}

// Grid of floating cubes that react to mouse
function ReactiveGrid({ mouse }: { mouse: { x: number; y: number } }) {
  const gridSize = 5;
  const cubesRef = useRef<(THREE.Mesh | null)[]>([]);

  const cubes = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let y = -gridSize / 2; y < gridSize / 2; y++) {
        positions.push([x * 1.5, y * 1.5, -5]);
      }
    }
    return positions;
  }, []);

  useFrame((state) => {
    cubesRef.current.forEach((cube, i) => {
      if (!cube) return;
      const basePos = cubes[i];
      const distToMouse = Math.sqrt(
        Math.pow((basePos[0] / 3) - mouse.x, 2) + 
        Math.pow((basePos[1] / 3) - mouse.y, 2)
      );
      
      // Push cubes away from mouse
      const pushStrength = Math.max(0, 1 - distToMouse);
      cube.position.z = -5 + pushStrength * 2;
      cube.rotation.x = state.clock.elapsedTime + i * 0.1;
      cube.rotation.y = state.clock.elapsedTime * 0.5 + i * 0.1;
      
      // Scale based on proximity
      const scale = 0.15 + pushStrength * 0.1;
      cube.scale.setScalar(scale);
    });
  });

  return (
    <group>
      {cubes.map((pos, i) => (
        <Box
          key={i}
          ref={(el) => { cubesRef.current[i] = el; }}
          args={[1, 1, 1]}
          position={pos}
        >
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.3}
            wireframe
          />
        </Box>
      ))}
    </group>
  );
}

// Floating crystal shapes
function FloatingCrystals() {
  const crystals = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        -4 - Math.random() * 3,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      scale: 0.2 + Math.random() * 0.3,
      speed: 0.5 + Math.random() * 1,
      color: ["#8b5cf6", "#ec4899", "#06b6d4", "#22c55e"][i % 4],
    }));
  }, []);

  return (
    <group>
      {crystals.map((crystal, i) => (
        <Float key={i} speed={crystal.speed} rotationIntensity={0.8} floatIntensity={0.8}>
          <Octahedron
            args={[crystal.scale]}
            position={crystal.position}
            rotation={[crystal.rotation, crystal.rotation, 0]}
          >
            <meshStandardMaterial
              color={crystal.color}
              transparent
              opacity={0.6}
              metalness={0.9}
              roughness={0.1}
              emissive={crystal.color}
              emissiveIntensity={0.3}
            />
          </Octahedron>
        </Float>
      ))}
    </group>
  );
}

// DNA-like helix structure
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const spheresCount = 30;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  const spheres = useMemo(() => {
    return [...Array(spheresCount)].map((_, i) => {
      const t = (i / spheresCount) * Math.PI * 4;
      const radius = 1.5;
      return {
        pos1: [
          Math.cos(t) * radius,
          (i - spheresCount / 2) * 0.3,
          Math.sin(t) * radius,
        ] as [number, number, number],
        pos2: [
          Math.cos(t + Math.PI) * radius,
          (i - spheresCount / 2) * 0.3,
          Math.sin(t + Math.PI) * radius,
        ] as [number, number, number],
      };
    });
  }, []);

  return (
    <group ref={groupRef} position={[4, 0, -3]}>
      {spheres.map((sphere, i) => (
        <group key={i}>
          <Sphere args={[0.08]} position={sphere.pos1}>
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
          </Sphere>
          <Sphere args={[0.08]} position={sphere.pos2}>
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
          </Sphere>
          {/* Connecting line */}
          {i % 3 === 0 && (
            <mesh position={[(sphere.pos1[0] + sphere.pos2[0]) / 2, sphere.pos1[1], (sphere.pos1[2] + sphere.pos2[2]) / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 3, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// Main scene content
function SceneContent({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#06b6d4" />
      
      <MorphingBlob mouse={mouse} />
      <FloatingRings />
      <FloatingCrystals />
      <DNAHelix />
    </>
  );
}

export default function InteractiveGeometry() {
  const mouse = useMousePosition();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
