"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Hook for mouse position — uses a ref to avoid React re-renders on every move
function useMousePosition() {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mouseRef;
}

// Ref-based scroll position — no React re-renders
function useScrollRef() {
  const scrollRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetRef.current = isNaN(scrollPercent) ? 0 : scrollPercent;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let animationId: number;
    const smoothScroll = () => {
      const diff = targetRef.current - scrollRef.current;
      scrollRef.current += diff * 0.08;
      animationId = requestAnimationFrame(smoothScroll);
    };
    animationId = requestAnimationFrame(smoothScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return scrollRef;
}

// Enhanced star field with scroll parallax and mouse interaction
function EnhancedStarField({ mouseRef, scrollRef, isMobile }: { mouseRef: React.RefObject<{ x: number; y: number }>; scrollRef: React.RefObject<number>; isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const particlesCount = isMobile ? 250 : 1200;

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

  useFrame((state) => {
    if (!ref.current) return;
    const positionAttribute = ref.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;
    const scroll = scrollRef.current ?? 0;
    const mouse = mouseRef.current ?? { x: 0, y: 0 };

    // Rotate based on time and scroll
    ref.current.rotation.x = -scroll * 0.5 + time * 0.02;
    ref.current.rotation.y = time * 0.03;

    // Update particle positions based on mouse
    const mx = mouse.x * 3;
    const my = mouse.y * 3;
    for (let i = 0; i < particlesCount; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];

      // Mouse repulsion — squared distance avoids sqrt
      const dx = ox - mx;
      const dy = oy - my;
      const distSq = dx * dx + dy * dy;

      let newX = ox;
      let newY = oy;

      if (distSq < 4) { // equivalent to dist < 2
        const dist = Math.sqrt(distSq);
        const force = (2 - dist) / 2;
        newX = ox + dx * force * 0.3;
        newY = oy + dy * force * 0.3;
      }

      // Add wave motion
      newY += Math.sin(time * 0.5 + ox * 0.5) * 0.1;

      positionAttribute.setXYZ(i, newX, newY, originalPositions[i * 3 + 2]);
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
// Pre-allocates buffer to avoid GC thrashing
function ConstellationLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const particleCount = 30;
  const connectionDistance = 2;
  // Max possible connections: particleCount*(particleCount-1)/2 = 435, each needs 6 floats (2 vertices × 3)
  const maxConnections = (particleCount * (particleCount - 1)) / 2;
  const maxFloats = maxConnections * 6;

  const { positions, lineBuffer } = useMemo(() => {
    const particlePositions: THREE.Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 2
      ));
    }
    // Pre-allocate the buffer
    const lineBuffer = new Float32Array(maxFloats);
    return { positions: particlePositions, lineBuffer };
  }, []);

  // Create the geometry once with the pre-allocated buffer
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(lineBuffer, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geom.setAttribute("position", attr);
    geom.setDrawRange(0, 0);
    return geom;
  }, [lineBuffer]);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    let vertexCount = 0;

    // Update particle positions with movement
    positions.forEach((pos, i) => {
      pos.y += Math.sin(time * 0.5 + i) * 0.002;
      pos.x += Math.cos(time * 0.3 + i * 0.5) * 0.001;
    });

    // Find connections and write into pre-allocated buffer
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < connectionDistance) {
          const offset = vertexCount * 3;
          lineBuffer[offset] = positions[i].x;
          lineBuffer[offset + 1] = positions[i].y;
          lineBuffer[offset + 2] = positions[i].z;
          lineBuffer[offset + 3] = positions[j].x;
          lineBuffer[offset + 4] = positions[j].y;
          lineBuffer[offset + 5] = positions[j].z;
          vertexCount += 2;
        }
      }
    }

    const posAttr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, vertexCount);
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
    </lineSegments>
  );
}

export default function ParticleField() {
  const mouseRef = useMousePosition();
  const scrollRef = useScrollRef();
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, 5]} intensity={0.3} color="#ec4899" />

          {/* Global Starfield Background */}
          <Stars radius={100} depth={60} count={3000} factor={5} saturation={0.3} fade speed={0.4} />

          <EnhancedStarField mouseRef={mouseRef} scrollRef={scrollRef} isMobile={isMobile} />
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
