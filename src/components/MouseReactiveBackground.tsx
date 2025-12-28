"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";

// Hook for mouse position (normalized -1 to 1)
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

// Interactive flowing particles that react to mouse
function ReactiveParticles({ mouse, count = 800 }: { mouse: { x: number; y: number }; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, velocities, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10 - 3;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    return { positions, velocities, originalPositions };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    const mouseX = mouse.x * 5;
    const mouseY = mouse.y * 5;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      // Distance from mouse
      const dx = x - mouseX;
      const dy = y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repulsion from mouse
      if (dist < 3) {
        const force = (3 - dist) / 3;
        velocities[ix] += dx * force * 0.02;
        velocities[iy] += dy * force * 0.02;
      }

      // Return to original position
      const ox = originalPositions[ix];
      const oy = originalPositions[iy];
      velocities[ix] += (ox - x) * 0.01;
      velocities[iy] += (oy - y) * 0.01;

      // Apply velocity with damping
      positions[ix] = x + velocities[ix];
      positions[iy] = y + velocities[iy];
      velocities[ix] *= 0.95;
      velocities[iy] *= 0.95;

      // Add slight wave motion
      positions[iy] += Math.sin(time * 0.5 + ox * 0.3) * 0.002;

      positionAttribute.setXYZ(i, positions[ix], positions[iy], z);
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
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Magnetic field lines that bend toward mouse
function MagneticLines({ mouse }: { mouse: { x: number; y: number } }) {
  const linesRef = useRef<THREE.Group>(null);
  const lineCount = 8;
  const pointsPerLine = 50;

  const { lineGeometries, originalPositions } = useMemo(() => {
    const geoms: THREE.BufferGeometry[] = [];
    const originals: Float32Array[] = [];

    for (let l = 0; l < lineCount; l++) {
      const positions = new Float32Array(pointsPerLine * 3);
      const original = new Float32Array(pointsPerLine * 3);
      const startY = -6 + l * 1.5;

      for (let i = 0; i < pointsPerLine; i++) {
        const t = i / (pointsPerLine - 1);
        const x = (t - 0.5) * 12;
        const y = startY + Math.sin(t * Math.PI) * 0.5;
        const z = -5;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        original[i * 3] = x;
        original[i * 3 + 1] = y;
        original[i * 3 + 2] = z;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geoms.push(geom);
      originals.push(original);
    }

    return { lineGeometries: geoms, originalPositions: originals };
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    const mouseX = mouse.x * 5;
    const mouseY = mouse.y * 5;

    linesRef.current.children.forEach((line, l) => {
      const mesh = line as THREE.Line;
      const positionAttribute = mesh.geometry.attributes.position;
      const original = originalPositions[l];

      for (let i = 0; i < pointsPerLine; i++) {
        const ox = original[i * 3];
        const oy = original[i * 3 + 1];

        // Distance from mouse
        const dx = ox - mouseX;
        const dy = oy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attraction toward mouse
        const attraction = Math.max(0, 1 - dist / 6) * 0.8;
        const newY = oy + (mouseY - oy) * attraction + Math.sin(time + ox * 0.5) * 0.1;

        positionAttribute.setY(i, newY);
      }
      positionAttribute.needsUpdate = true;
    });
  });

  return (
    <group ref={linesRef}>
      {lineGeometries.map((geom, i) => {
        const Line = THREE.Line;
        return (
          <primitive
            key={i}
            object={new Line(geom, new THREE.LineBasicMaterial({
              color: ["#8b5cf6", "#ec4899", "#06b6d4", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"][i],
              transparent: true,
              opacity: 0.2
            }))}
          />
        );
      })}
    </group>
  );
}

// Morphing gradient sphere that follows mouse
function MouseFollower({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    targetPos.set(mouse.x * 3, mouse.y * 3, -2);
    meshRef.current.position.lerp(targetPos, 0.05);
    
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    
    // Pulsing scale
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.8, 2]} />
      <meshStandardMaterial
        color="#8b5cf6"
        wireframe
        transparent
        opacity={0.4}
        emissive="#8b5cf6"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Particle trails from mouse
function MouseTrails({ mouse }: { mouse: { x: number; y: number } }) {
  const trailRef = useRef<THREE.Points>(null);
  const trailCount = 50;
  const positionsRef = useRef<Float32Array>(new Float32Array(trailCount * 3));
  const opacitiesRef = useRef<Float32Array>(new Float32Array(trailCount));
  const indexRef = useRef(0);

  useFrame(() => {
    if (!trailRef.current) return;
    
    const positions = positionsRef.current;
    const opacities = opacitiesRef.current;

    // Add new position
    const idx = indexRef.current % trailCount;
    positions[idx * 3] = mouse.x * 4;
    positions[idx * 3 + 1] = mouse.y * 4;
    positions[idx * 3 + 2] = 0;
    opacities[idx] = 1;
    indexRef.current++;

    // Fade out old positions
    for (let i = 0; i < trailCount; i++) {
      opacities[i] *= 0.95;
    }

    trailRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positionsRef.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ec4899"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Scene content
function MouseReactiveSceneContent({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[-10, -10, 10]} intensity={0.3} color="#ec4899" />
      
      <ReactiveParticles mouse={mouse} count={600} />
      <MagneticLines mouse={mouse} />
      <MouseFollower mouse={mouse} />
      <MouseTrails mouse={mouse} />
    </>
  );
}

export default function MouseReactiveBackground() {
  const mouse = useMousePosition();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <MouseReactiveSceneContent mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
