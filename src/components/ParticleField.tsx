"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// -----------------------------------------------------------------------------
// Performance helpers — refs only, zero React re-renders
// -----------------------------------------------------------------------------
function useVisibleCanvas() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const handle = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);
  return visible;
}

function useMouseRef() {
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return mouseRef;
}

function useScrollRef() {
  const scrollRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      scrollRef.current = isNaN(p) ? 0 : p;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollRef;
}

// -----------------------------------------------------------------------------
// Aurora Nebula — single fullscreen-ish plane with FBM noise shader.
// One draw call, fully GPU. Replaces dozens of CSS gradient layers.
// -----------------------------------------------------------------------------
const nebulaVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragment = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Hash + value noise + fbm
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + vec2(13.7, 7.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.025;

    // Domain-warped fbm for organic gas clouds
    vec2 drift = vec2(t * 0.6, -t * 0.3) + uMouse * 0.03 + vec2(0.0, uScroll * 0.35);
    vec2 q = vec2(fbm(uv * 2.2 + drift), fbm(uv * 2.2 + vec2(5.2, 1.3) - drift));
    float f = fbm(uv * 2.6 + q * 1.6);

    // Color palette — deep space purples, blues, magenta
    vec3 deep   = vec3(0.012, 0.004, 0.035);
    vec3 purple = vec3(0.28, 0.10, 0.55);
    vec3 blue   = vec3(0.07, 0.20, 0.55);
    vec3 pink   = vec3(0.62, 0.14, 0.42);

    vec3 col = deep;
    col = mix(col, purple, smoothstep(0.35, 0.85, f) * 0.55);
    col = mix(col, blue,   smoothstep(0.45, 0.95, q.x) * 0.40);
    col = mix(col, pink,   smoothstep(0.55, 1.00, q.y * f) * 0.45);

    // Soft radial falloff so edges melt into black
    float d = distance(uv, vec2(0.5 + uMouse.x * 0.02, 0.45 - uMouse.y * 0.02));
    col *= smoothstep(0.95, 0.25, d);

    // Subtle breathing
    col *= 0.85 + 0.15 * sin(uTime * 0.18);

    gl_FragColor = vec4(col, 1.0) * 0.85;
  }
`;

function AuroraNebula({
  mouseRef,
  scrollRef,
}: {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    // Smooth-damp mouse + scroll for buttery motion
    u.uMouse.value.x += (mouseRef.current.x - u.uMouse.value.x) * 0.04;
    u.uMouse.value.y += (mouseRef.current.y - u.uMouse.value.y) * 0.04;
    u.uScroll.value += ((scrollRef.current ?? 0) - u.uScroll.value) * 0.04;
  });

  return (
    <mesh position={[0, 0, -8]} scale={[viewport.width * 3.2, viewport.height * 3.2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={nebulaVertex}
        fragmentShader={nebulaFragment}
        uniforms={uniforms}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// -----------------------------------------------------------------------------
// GPU Starfield — all motion (drift, twinkle, mouse parallax) computed in the
// vertex/fragment shaders. Zero per-frame CPU work, zero attribute uploads.
// -----------------------------------------------------------------------------
const starsVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vColor = aColor;

    vec3 pos = position;

    // Gentle wave drift
    pos.y += sin(uTime * 0.4 + aPhase * 6.2831) * 0.18;
    pos.x += cos(uTime * 0.25 + aPhase * 6.2831) * 0.12;

    // Depth-based parallax: nearer stars (larger z) shift more with mouse + scroll
    float depth = (pos.z + 6.0) / 12.0; // 0..1
    pos.x += uMouse.x * depth * 1.1;
    pos.y += uMouse.y * depth * 0.7 + uScroll * depth * 4.0;

    // Twinkle
    vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aPhase * 2.0) + aPhase * 40.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * vTwinkle * (160.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const starsFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // Soft round sprite with bright core
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.18, 0.0, d) * 0.9;
    vec3 col = vColor * (0.7 + core) * vTwinkle;
    gl_FragColor = vec4(col, alpha * vTwinkle);
  }
`;

const STAR_PALETTE = [
  new THREE.Color("#a78bfa"), // purple
  new THREE.Color("#818cf8"), // indigo
  new THREE.Color("#f472b6"), // pink
  new THREE.Color("#67e8f9"), // cyan
  new THREE.Color("#ffffff"), // white
];

function GPUStars({
  mouseRef,
  scrollRef,
  count,
}: {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  count: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
      sizes[i] = 0.4 + Math.pow(Math.random(), 2.5) * 1.6;
      phases[i] = Math.random();
      const c = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, sizes, phases, colors };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uMouse.value.x += (mouseRef.current.x - u.uMouse.value.x) * 0.05;
    u.uMouse.value.y += (mouseRef.current.y - u.uMouse.value.y) * 0.05;
    u.uScroll.value += ((scrollRef.current ?? 0) - u.uScroll.value) * 0.05;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={starsVertex}
        fragmentShader={starsFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// -----------------------------------------------------------------------------
// Shooting stars — occasional meteor streaks for life and depth
// -----------------------------------------------------------------------------
function ShootingStar({ seed }: { seed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const state = useRef({
    active: false,
    nextLaunch: 2 + seed * 7,
    progress: 0,
    start: new THREE.Vector3(),
    dir: new THREE.Vector3(),
  });

  useFrame((s, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const st = state.current;
    const t = s.clock.elapsedTime;

    if (!st.active) {
      mesh.visible = false;
      if (t > st.nextLaunch) {
        st.active = true;
        st.progress = 0;
        st.start.set(
          (Math.random() - 0.3) * 18,
          4 + Math.random() * 4,
          -4 - Math.random() * 3
        );
        const angle = Math.PI * (1.1 + Math.random() * 0.25);
        st.dir.set(Math.cos(angle), Math.sin(angle), 0).normalize();
        mesh.position.copy(st.start);
        mesh.rotation.z = Math.atan2(st.dir.y, st.dir.x);
      }
      return;
    }

    st.progress += delta * 0.9;
    const dist = st.progress * 16;
    mesh.position.copy(st.start).addScaledVector(st.dir, dist);
    mesh.visible = true;

    const mat = mesh.material as THREE.MeshBasicMaterial;
    // Fade in fast, fade out slow
    mat.opacity = Math.min(st.progress * 8, 1) * Math.max(1 - st.progress, 0) * 0.8;

    if (st.progress >= 1) {
      st.active = false;
      st.nextLaunch = t + 4 + Math.random() * 10;
    }
  });

  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[2.4, 0.025]} />
      <meshBasicMaterial
        color="#cdb4ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// -----------------------------------------------------------------------------
// Main export
// -----------------------------------------------------------------------------
export default function ParticleField() {
  const mouseRef = useMouseRef();
  const scrollRef = useScrollRef();
  const isMobile = useIsMobile();
  const visible = useVisibleCanvas();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, isMobile ? 1 : 1.5]}
        style={{ background: "transparent" }}
        frameloop={visible ? "always" : "never"}
      >
        <Suspense fallback={null}>
          <AuroraNebula mouseRef={mouseRef} scrollRef={scrollRef} />
          <GPUStars mouseRef={mouseRef} scrollRef={scrollRef} count={isMobile ? 500 : 1800} />
          {!isMobile && (
            <>
              <ShootingStar seed={0.1} />
              <ShootingStar seed={0.5} />
              <ShootingStar seed={0.9} />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
