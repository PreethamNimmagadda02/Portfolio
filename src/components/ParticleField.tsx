"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";

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

// Hook for scroll position
function useScrollPosition() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setScroll(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scroll;
}

// Enhanced star field with scroll parallax and mouse interaction
function EnhancedStarField({ mouse, scroll }: { mouse: { x: number; y: number }; scroll: number }) {
  const ref = useRef<THREE.Points>(null);
  const particlesCount = 2000;
  
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

// Nebula clouds - large glowing orbs
function NebulaClouds({ mouse }: { mouse: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const clouds = useMemo(() => {
    return [
      { position: [-3, 2, -4] as [number, number, number], scale: 2, color: "#8b5cf6", speed: 0.3 },
      { position: [4, -1, -5] as [number, number, number], scale: 2.5, color: "#ec4899", speed: 0.4 },
      { position: [-2, -3, -6] as [number, number, number], scale: 1.8, color: "#06b6d4", speed: 0.35 },
      { position: [2, 3, -7] as [number, number, number], scale: 2.2, color: "#22c55e", speed: 0.25 },
    ];
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const cloud = clouds[i];
      const mesh = child as THREE.Mesh;
      
      // Breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * cloud.speed) * 0.2 + 1;
      mesh.scale.setScalar(cloud.scale * breathe);
      
      // Slight movement toward mouse
      mesh.position.x = cloud.position[0] + mouse.x * 0.3;
      mesh.position.y = cloud.position[1] + mouse.y * 0.3;
      
      // Floating motion
      mesh.position.y += Math.sin(state.clock.elapsedTime * cloud.speed + i) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating geometric shapes
function FloatingShapes({ scroll }: { scroll: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const shapes = useMemo(() => {
    return [
      { type: "icosahedron", position: [-4, 2, -3] as [number, number, number], color: "#8b5cf6", size: 0.3 },
      { type: "octahedron", position: [4, -2, -4] as [number, number, number], color: "#ec4899", size: 0.25 },
      { type: "tetrahedron", position: [-3, -3, -3.5] as [number, number, number], color: "#06b6d4", size: 0.35 },
      { type: "dodecahedron", position: [3, 3, -5] as [number, number, number], color: "#22c55e", size: 0.28 },
    ];
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.rotation.x = state.clock.elapsedTime * (0.3 + i * 0.1);
      mesh.rotation.y = state.clock.elapsedTime * (0.4 + i * 0.1);
      mesh.position.y = shapes[i].position[1] + Math.sin(state.clock.elapsedTime + i) * 0.5 - scroll * 2;
    });
  });

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={shape.position}>
            {shape.type === "icosahedron" && <icosahedronGeometry args={[shape.size, 0]} />}
            {shape.type === "octahedron" && <octahedronGeometry args={[shape.size, 0]} />}
            {shape.type === "tetrahedron" && <tetrahedronGeometry args={[shape.size, 0]} />}
            {shape.type === "dodecahedron" && <dodecahedronGeometry args={[shape.size, 0]} />}
            <meshStandardMaterial
              color={shape.color}
              wireframe
              transparent
              opacity={0.5}
              emissive={shape.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
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

// Enhanced floating orbs with glow
function EnhancedOrbs({ mouse }: { mouse: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const orbs = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5 - 2,
      ] as [number, number, number],
      scale: Math.random() * 0.25 + 0.08,
      speed: Math.random() * 0.5 + 0.2,
      color: ["#8b5cf6", "#ec4899", "#06b6d4", "#22c55e", "#f59e0b"][i % 5],
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      const mesh = child as THREE.Mesh;
      
      // Floating animation
      mesh.position.y = orb.position[1] + Math.sin(state.clock.elapsedTime * orb.speed + i) * 0.5;
      mesh.position.x = orb.position[0] + Math.cos(state.clock.elapsedTime * orb.speed * 0.5 + i) * 0.3;
      
      // React to mouse slightly
      mesh.position.x += mouse.x * 0.2;
      mesh.position.y += mouse.y * 0.2;
      
      // Pulsing
      const pulse = Math.sin(state.clock.elapsedTime * 2 + i) * 0.1 + 1;
      mesh.scale.setScalar(orb.scale * pulse);
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            color={orb.color}
            transparent
            opacity={0.4}
            emissive={orb.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main scene content
function SceneContent({ mouse, scroll }: { mouse: { x: number; y: number }; scroll: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[-10, -10, 5]} intensity={0.3} color="#ec4899" />
      
      <EnhancedStarField mouse={mouse} scroll={scroll} />
      <NebulaClouds mouse={mouse} />
      <FloatingShapes scroll={scroll} />
      <ConstellationLines />
      <EnhancedOrbs mouse={mouse} />
    </>
  );
}

export default function ParticleField() {
  const mouse = useMousePosition();
  const scroll = useScrollPosition();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent mouse={mouse} scroll={scroll} />
        </Suspense>
      </Canvas>
    </div>
  );
}
