"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Hook for mouse position
function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    // Smooth lerp update
    const interval = setInterval(() => {
      setMouse(prev => ({
        x: prev.x + (targetMouse.current.x - prev.x) * 0.08,
        y: prev.y + (targetMouse.current.y - prev.y) * 0.08,
      }));
    }, 16);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return mouse;
}

// Premium unified wave mesh with cursor interaction
function PremiumWaveSurface({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create initial positions for a large uniform grid
  const { originalPositions } = useMemo(() => {
    const positions: number[] = [];
    const size = 200;
    const segments = 150;
    const step = size / segments;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = i * step - size / 2;
        const z = j * step - size / 2;
        positions.push(x, 0, z);
      }
    }
    return {
      originalPositions: new Float32Array(positions)
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const positionAttribute = geometry.attributes.position;
    const time = state.clock.elapsedTime;

    // Convert mouse to world-ish coordinates
    const mouseWorldX = mouse.x * 50;
    const mouseWorldZ = mouse.y * 30;

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = originalPositions[i * 3];
      const z = originalPositions[i * 3 + 2];

      // Distance from cursor
      const dx = x - mouseWorldX;
      const dz = z - mouseWorldZ;
      const distFromCursor = Math.sqrt(dx * dx + dz * dz);

      // Cursor-reactive ripple effect - tighter radius
      const cursorInfluence = Math.exp(-distFromCursor * 0.08) * 3.0;
      const cursorWave = Math.sin(distFromCursor * 0.2 - time * 2.5) * cursorInfluence;

      // Base wave pattern - slow and flowing
      const wave1 = Math.sin(x * 0.08 + time * 0.4) * 0.6;
      const wave2 = Math.sin(z * 0.06 + time * 0.3) * 0.4;
      const wave3 = Math.cos((x + z) * 0.04 + time * 0.25) * 0.3;

      // Subtle breathing effect
      const breathing = Math.sin(time * 0.2) * 0.1;

      positionAttribute.setY(i, wave1 + wave2 + wave3 + breathing + cursorWave);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.2, 0, 0]}
      position={[0, -4, -10]}
    >
      <planeGeometry args={[200, 100, 150, 150]} />
      <meshStandardMaterial
        color="#8b5cf6"
        wireframe
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Secondary subtle wave layer with cursor interaction
function SecondaryWaveLayer({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const positionAttribute = geometry.attributes.position;
    const time = state.clock.elapsedTime;

    const mouseWorldX = mouse.x * 60;
    const mouseWorldZ = mouse.y * 40;

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const z = positionAttribute.getZ(i);

      // Cursor influence - tighter radius
      const dx = x - mouseWorldX;
      const dz = z - mouseWorldZ;
      const distFromCursor = Math.sqrt(dx * dx + dz * dz);
      const cursorInfluence = Math.exp(-distFromCursor * 0.06) * 2.0;
      const cursorWave = Math.sin(distFromCursor * 0.15 - time * 2) * cursorInfluence;

      // Base wave
      const wave = Math.sin(x * 0.05 + z * 0.05 + time * 0.35) * 0.4;
      const wave2 = Math.cos(x * 0.03 - time * 0.2) * 0.25;

      positionAttribute.setY(i, wave + wave2 + cursorWave);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.3, 0, 0]}
      position={[0, -6, -15]}
    >
      <planeGeometry args={[220, 120, 100, 100]} />
      <meshStandardMaterial
        color="#06b6d4"
        wireframe
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Scene content with mouse passed down
function WaveSceneContent({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, 5, -10]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[0, 5, 5]} intensity={0.3} color="#ec4899" />

      <PremiumWaveSurface mouse={mouse} />
      <SecondaryWaveLayer mouse={mouse} />
    </>
  );
}

export default function WaveBackground() {
  const isMobile = useIsMobile();
  const mouse = useMousePosition();

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <WaveSceneContent mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
