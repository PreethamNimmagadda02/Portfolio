"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Hook for mouse position
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

// Hook for scroll position with smoothing
function useScrollPosition() {
  const [scroll, setScroll] = useState(0);
  const targetScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetScrollRef.current = isNaN(scrollPercent) ? 0 : scrollPercent;
    };

    // Smooth interpolation loop
    let animationId: number;
    const smoothScroll = () => {
      setScroll(prev => {
        const diff = targetScrollRef.current - prev;
        // Smooth interpolation - prevents jarring jumps when using "scroll to top"
        return prev + diff * 0.08;
      });
      animationId = requestAnimationFrame(smoothScroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize
    animationId = requestAnimationFrame(smoothScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return scroll;
}

// Enhanced star field with scroll parallax and mouse interaction
function EnhancedStarField({ mouse, scroll, isMobile }: { mouse: { x: number; y: number }; scroll: number; isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const particlesCount = isMobile ? 500 : 5000;

  const { positions, originalPositions, sizes, colors } = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const originalPositions = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      sizes[i] = Math.random() * 0.02 + 0.005;

      // Random purple/blue/pink colors
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.55; colors[i * 3 + 1] = 0.36; colors[i * 3 + 2] = 0.96; // Purple
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.39; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 0.95; // Blue
      } else {
        colors[i * 3] = 0.93; colors[i * 3 + 1] = 0.35; colors[i * 3 + 2] = 0.6; // Pink
      }
    }
    return { positions, originalPositions, sizes, colors };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const positionAttribute = ref.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    // Rotate based on time and scroll
    ref.current.rotation.x = -scroll * 0.5 + time * 0.02;
    ref.current.rotation.y = time * 0.03;

    // Update particle positions based on mouse
    for (let i = 0; i < particlesCount; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];

      // Mouse repulsion
      const dx = ox - mouse.x * 3;
      const dy = oy - mouse.y * 3;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let newX = ox;
      let newY = oy;

      if (dist < 2) {
        const force = (2 - dist) / 2;
        newX = ox + dx * force * 0.3;
        newY = oy + dy * force * 0.3;
      }

      // Add wave motion
      newY += Math.sin(time * 0.5 + ox * 0.5) * 0.1;

      positionAttribute.setXYZ(i, newX, newY, oz);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <points ref={ref}>
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
          transparent
          vertexColors
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}





// Connection lines between nearby particles (constellation effect)
function ConstellationLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const particleCount = 30;
  const connectionDistance = 2;

  const positions = useMemo(() => {
    const particlePositions: THREE.Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 2
      ));
    }
    return particlePositions;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    const linePositions: number[] = [];

    // Update particle positions with movement
    positions.forEach((pos, i) => {
      pos.y += Math.sin(time * 0.5 + i) * 0.002;
      pos.x += Math.cos(time * 0.3 + i * 0.5) * 0.001;
    });

    // Find connections
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < connectionDistance) {
          linePositions.push(
            positions[i].x, positions[i].y, positions[i].z,
            positions[j].x, positions[j].y, positions[j].z
          );
        }
      }
    }

    const geometry = linesRef.current.geometry;
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
    </lineSegments>
  );
}





export default function ParticleField() {
  const mouse = useMousePosition();
  const scroll = useScrollPosition();
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, 5]} intensity={0.3} color="#ec4899" />

          <EnhancedStarField mouse={mouse} scroll={scroll} isMobile={isMobile} />
          {!isMobile && (
            <>
              <ConstellationLines />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
