"use client";

/**
 * CosmicScene — the single persistent WebGL background for the entire page.
 *
 * Replaces what used to be 6 independent section canvases (About3D,
 * Experience, SkillsMarquee, Projects, Achievements3D, ParticleField) plus 7
 * SectionDivider3D mount/unmount canvases. One canvas, one GL context, one
 * render loop — driven entirely by document scroll progress via
 * `getSceneState()` (see `@/lib/scene-store`).
 *
 * Design constraints (see CLAUDE.md redesign plan):
 *  - No MeshTransmissionMaterial, no EffectComposer/Bloom, no HDR Environment,
 *    no drei <Html>. Glow is faked with toneMapped={false} emissives and
 *    additive blending — visually rich, essentially free.
 *  - dpr capped, antialias off (shader edges are already soft), frameloop
 *    pauses when the tab is hidden.
 *  - Everything reads scroll/pointer from the shared viewport-store — zero
 *    extra window listeners.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  usePointer,
  useScrollTracker,
  useDocumentVisible,
  type PointerState,
  type ScrollState,
} from "@/lib/viewport-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { getSceneState, hexToVec3, lerp3 } from "@/lib/scene-store";
import { getActiveSkillCategories } from "@/lib/scene-store";
import { skillsData, getCategoryColor } from "@/lib/skills-data";
import { markSceneWarmed, seededRandom } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Aurora Nebula — single fullscreen-ish plane, domain-warped FBM shader.
// -----------------------------------------------------------------------------
const nebulaVertex = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  float vHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(vHash(i), vHash(i + vec2(1.0, 0.0)), u.x),
               mix(vHash(i + vec2(0.0, 1.0)), vHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float vFbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vNoise(p);
      p = p * 2.0 + vec2(13.7, 7.3);
      a *= 0.5;
    }
    return v;
  }

  // Same swirl + drift as the fragment domain-warp, sampled here to raise
  // the gas into real 3D relief instead of a flat painted gradient. The
  // coordinates spiral around a slowly drifting center rather than sliding
  // in a straight line, so the surface visibly churns instead of just
  // tilting as a rigid plane.
  float heightAt(vec2 p) {
    float t = uTime * 0.035;
    vec2 center = vec2(0.5 + sin(t * 0.3) * 0.06, 0.45 + cos(t * 0.24) * 0.05);
    vec2 toCenter = p - center;
    float radius = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);
    angle += sin(radius * 6.0 - t * 2.2) * (0.35 + uVelocity * 0.3);
    vec2 swirlP = center + vec2(cos(angle), sin(angle)) * radius;
    vec2 drift = vec2(t * 0.6, -t * 0.3);
    return vFbm(swirlP * 3.0 + drift);
  }

  void main() {
    vUv = uv;

    // Amplitude grows with scroll velocity — the surface visibly heaves as
    // you move, on top of its constant slow breathing.
    float amp = 1.1 + uVelocity * 1.4;
    float h = heightAt(uv);

    float e = 0.015;
    float hx = heightAt(uv + vec2(e, 0.0));
    float hy = heightAt(uv + vec2(0.0, e));
    vec3 tangentX = vec3(1.0, 0.0, (hx - h) * amp / e);
    vec3 tangentY = vec3(0.0, 1.0, (hy - h) * amp / e);
    // normalMatrix (inverse-transpose of modelView) keeps lighting correct
    // under this mesh's non-uniform viewport-scale — a raw object-space
    // normal would skew under stretch.
    vNormal = normalize(normalMatrix * normalize(cross(tangentX, tangentY)));
    vHeight = h;

    vec3 pos = position;
    pos.z += (h - 0.5) * amp;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const nebulaFragment = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uVelocity;
  uniform vec2 uMouse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
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
    float t = uTime * 0.035;

    // Scroll velocity swells the domain warp — the gas "stirs" while you
    // move and settles when you stop.
    float stir = 1.0 + uVelocity * 0.9;

    // Swirling vortex warp — coordinates spiral around a slowly drifting
    // center instead of sliding in a straight line, so the gas visibly
    // churns rather than reading as a flat plane sliding under a tilt.
    vec2 swirlCenter = vec2(0.5 + sin(t * 0.3) * 0.06, 0.45 + cos(t * 0.24) * 0.05);
    vec2 toCenter = uv - swirlCenter;
    float radius = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);
    angle += sin(radius * 6.0 - t * 2.2) * (0.35 + uVelocity * 0.3);
    vec2 swirlUv = swirlCenter + vec2(cos(angle), sin(angle)) * radius;

    vec2 drift = vec2(t * 0.6, -t * 0.3) + uMouse * 0.05 + vec2(0.0, uScroll * 1.4);
    vec2 q = vec2(fbm(swirlUv * 2.2 + drift), fbm(swirlUv * 2.2 + vec2(5.2, 1.3) - drift));
    float f = fbm(swirlUv * 2.6 + q * 1.6 * stir);

    vec3 col = uColorC;
    col = mix(col, uColorA, smoothstep(0.35, 0.85, f) * (0.5 + uVelocity * 0.18));
    col = mix(col, uColorB, smoothstep(0.5, 1.0, q.x * f) * 0.4);

    // Aurora ribbons — traveling color curtains riding the swirl, the
    // classic aurora-borealis look instead of a static gradient blob.
    float ribbon = sin(swirlUv.x * 7.0 + f * 4.0 - t * 3.0) * 0.5 + 0.5;
    ribbon = pow(ribbon, 4.0) * smoothstep(0.2, 0.8, f);
    vec3 ribbonColor = mix(uColorA, uColorB, sin(t * 0.4) * 0.5 + 0.5);
    col += ribbonColor * ribbon * 0.35;

    float d = distance(uv, vec2(0.5 + uMouse.x * 0.02, 0.45 - uMouse.y * 0.02));
    col *= smoothstep(0.95, 0.25, d);

    // Pointer-follow glow — a soft light source that lives inside the gas
    vec2 mousePos = vec2(0.5, 0.5) + uMouse * vec2(0.28, 0.2);
    float mGlow = smoothstep(0.45, 0.0, distance(uv, mousePos));
    col += uColorA * mGlow * 0.2 * (0.6 + 0.4 * f);

    col *= 0.8 + 0.22 * sin(uTime * 0.24);

    // Relief shading from the displaced surface's normal — ridges catch a
    // fixed key light, valleys fall into shadow, selling real volume instead
    // of a flat gradient.
    vec3 lightDir = normalize(vec3(0.4, 0.6, 1.0));
    vec3 viewDir = normalize(vViewDir);
    float ndl = clamp(dot(vNormal, lightDir), 0.0, 1.0);
    col *= 0.55 + 0.75 * ndl;
    col += uColorB * smoothstep(0.65, 1.0, vHeight) * 0.1;

    // Glossy specular glint + Fresnel rim — the pair that reads as polished
    // volume rather than flat matte paint; premium 3D surfaces almost always
    // carry both.
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(clamp(dot(vNormal, halfDir), 0.0, 1.0), 28.0);
    float fresnel = pow(1.0 - clamp(dot(vNormal, viewDir), 0.0, 1.0), 2.5);
    col += vec3(1.0, 0.97, 0.92) * spec * 0.4;
    col += uColorA * fresnel * 0.22;

    // Mild saturation lift — richer, more deliberate color grading instead
    // of a flat/washed palette.
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, 1.18);

    gl_FragColor = vec4(col, 1.0) * 0.52;
  }
`;

function AuroraNebula({ pointer, scroll }: { pointer: PointerState; scroll: ScrollState }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Vector3(...hexToVec3("#8b5cf6")) },
      uColorB: { value: new THREE.Vector3(...hexToVec3("#3b82f6")) },
      uColorC: { value: new THREE.Vector3(...hexToVec3("#05010d")) },
    }),
    []
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uMouse.value.x += (pointer.nx - u.uMouse.value.x) * 0.04;
    u.uMouse.value.y += (pointer.ny - u.uMouse.value.y) * 0.04;
    // Normalized |velocity| (px/ms), soft-capped to [0, 1] and smoothed
    const vNorm = Math.min(Math.abs(scroll.velocity) * 0.6, 1);
    u.uVelocity.value += (vNorm - u.uVelocity.value) * 0.08;

    const { chapter, next, blend } = getSceneState(scroll.progress);
    const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
    const b = lerp3(hexToVec3(chapter.colorB), hexToVec3(next.colorB), blend);
    const c = lerp3(hexToVec3(chapter.colorC), hexToVec3(next.colorC), blend);
    const uA = u.uColorA.value as THREE.Vector3;
    const uB = u.uColorB.value as THREE.Vector3;
    const uC = u.uColorC.value as THREE.Vector3;
    uA.set(uA.x + (a[0] - uA.x) * 0.06, uA.y + (a[1] - uA.y) * 0.06, uA.z + (a[2] - uA.z) * 0.06);
    uB.set(uB.x + (b[0] - uB.x) * 0.06, uB.y + (b[1] - uB.y) * 0.06, uB.z + (b[2] - uB.z) * 0.06);
    uC.set(uC.x + (c[0] - uC.x) * 0.06, uC.y + (c[1] - uC.y) * 0.06, uC.z + (c[2] - uC.z) * 0.06);
    u.uScroll.value = scroll.progress;

    // A faint pointer-driven tilt — just enough residual parallax to sell
    // the displaced surface's depth. The swirl + ribbons above now carry
    // the actual dynamism, so this stays subtle rather than being the
    // primary motion (a rigid whole-object rotation reads as mechanical).
    if (meshRef.current) {
      const wobble = state.clock.elapsedTime * 0.06;
      const targetRotX = pointer.ny * 0.04 + Math.sin(wobble) * 0.015;
      const targetRotY = -pointer.nx * 0.05 + Math.cos(wobble * 0.85) * 0.015;
      meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.04;
      meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.04;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -8]} scale={[viewport.width * 3.2, viewport.height * 3.2, 1]}>
      <planeGeometry args={[1, 1, 48, 48]} />
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
// GPU Starfield — all motion computed in the vertex shader, zero CPU writes.
// -----------------------------------------------------------------------------
const starsVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uVelocity; // signed, smoothed scroll velocity
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vStretch;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    pos.y += sin(uTime * 0.4 + aPhase * 6.2831) * 0.18;
    pos.x += cos(uTime * 0.25 + aPhase * 6.2831) * 0.12;
    float depth = (pos.z + 6.0) / 12.0;
    pos.x += uMouse.x * depth * 1.1;
    pos.y += uMouse.y * depth * 0.7 + uScroll * depth * 4.0;
    // Warp-speed feel: while scrolling, near stars trail vertically
    pos.y -= uVelocity * depth * 0.9;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aPhase * 2.0) + aPhase * 40.0);
    vStretch = clamp(abs(uVelocity) * (0.4 + depth), 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Stars grow slightly + brighten under motion
    gl_PointSize = aSize * vTwinkle * (160.0 / -mv.z) * (1.0 + vStretch * 1.6);
    gl_Position = projectionMatrix * mv;
  }
`;

const starsFragment = /* glsl */ `
  uniform vec3 uColorMod;
  uniform float uModMix;
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vStretch;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // Elongate the sprite vertically while scrolling → motion streaks
    c.y /= (1.0 + vStretch * 2.2);
    float d = length(c);
    float alpha = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.18, 0.0, d) * 0.9;
    // Per-star base color crossfaded toward the chapter's accent tint.
    // uModMix is held low (~0.35) so the original palette still reads —
    // the chapter tint is an ambient wash, not a recolor.
    vec3 base = mix(vColor, uColorMod * (0.7 + core + vStretch * 0.35), uModMix);
    vec3 col = base * vTwinkle;
    gl_FragColor = vec4(col, alpha * vTwinkle);
  }
`;

const STAR_PALETTE = [
  new THREE.Color("#a78bfa"),
  new THREE.Color("#818cf8"),
  new THREE.Color("#f472b6"),
  new THREE.Color("#67e8f9"),
  new THREE.Color("#ffffff"),
];

function GPUStars({ pointer, scroll, count }: { pointer: PointerState; scroll: ScrollState; count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const rand = seededRandom(1337);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 24;
      positions[i * 3 + 1] = (rand() - 0.5) * 16;
      positions[i * 3 + 2] = (rand() - 0.5) * 12 - 1;
      sizes[i] = 0.4 + Math.pow(rand(), 2.5) * 1.6;
      phases[i] = rand();
      const c = STAR_PALETTE[Math.floor(rand() * STAR_PALETTE.length)];
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
      uVelocity: { value: 0 },
      uColorMod: { value: new THREE.Color("#818cf8") },
      uModMix: { value: 0.0 },
    }),
    []
  );
  const tintColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uMouse.value.x += (pointer.nx - u.uMouse.value.x) * 0.05;
    u.uMouse.value.y += (pointer.ny - u.uMouse.value.y) * 0.05;
    u.uScroll.value += (scroll.progress - u.uScroll.value) * 0.05;
    // Signed velocity, soft-capped — drives streaks in the vertex shader
    const v = Math.max(-1, Math.min(1, scroll.velocity * 0.5));
    u.uVelocity.value += (v - u.uVelocity.value) * 0.1;
    // Dynamically retint stars toward the current chapter's accent (colorB).
    // Held at ~0.32 mix so the palette shift is felt without erasing the
    // original per-star colors — the field breathes hue as you scroll.
    const { chapter, next, blend } = getSceneState(scroll.progress);
    const b = lerp3(hexToVec3(chapter.colorB), hexToVec3(next.colorB), blend);
    tintColor.setRGB(b[0], b[1], b[2]);
    (u.uColorMod.value as THREE.Color).lerp(tintColor, 0.04);
    u.uModMix.value += (0.32 - u.uModMix.value) * 0.05;
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
// Shooting stars — rare meteor streaks for life and depth (desktop only)
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
        st.start.set((Math.random() - 0.3) * 18, 4 + Math.random() * 4, -4 - Math.random() * 3);
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
    mat.opacity = Math.min(st.progress * 8, 1) * Math.max(1 - st.progress, 0) * 0.8;

    if (st.progress >= 1) {
      st.active = false;
      st.nextLaunch = t + 4 + Math.random() * 10;
    }
  });

  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[2.4, 0.025]} />
      <meshBasicMaterial color="#cdb4ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// -----------------------------------------------------------------------------
// Focus Core — the throughline object. A fresnel "energy orb": dark glassy
// body, chapter-tinted rim glow, slow-swimming noise surface — all computed
// in one fragment shader (1 draw call). Pushed deep behind the content so it
// reads as an ambient presence rather than a foreground element.
// -----------------------------------------------------------------------------
const orbVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vNormal = normalMatrix * normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vPos = position;
    gl_Position = projectionMatrix * mv;
  }
`;

const orbFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uWeight;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;

  // Cheap 3D value noise (2 octaves) — enough for a living surface
  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1,0,0)), u.x),
          mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), u.x), u.y),
      mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), u.x),
          mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), u.x), u.y),
      u.z);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float fres = pow(1.0 - abs(dot(n, v)), 2.4);

    // Swimming plasma bands under the surface
    float swim = noise3(vPos * 2.2 + vec3(uTime * 0.12, -uTime * 0.08, uTime * 0.05));
    swim += 0.5 * noise3(vPos * 4.6 - vec3(0.0, uTime * 0.16, 0.0));

    vec3 body = uColor * (0.06 + swim * 0.14);
    vec3 rim = uColor * fres * (1.1 + 0.25 * sin(uTime * 1.1)) + vec3(1.0) * fres * fres * 0.35;
    vec3 col = body + rim;

    float alpha = (0.18 + fres * 0.82) * uWeight;
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Small procedural radial-falloff sprite texture for the orb's halo. */
function makeHaloTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.55)");
  g.addColorStop(0.25, "rgba(255,255,255,0.18)");
  g.addColorStop(0.6, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function FocusCore({ scroll }: { scroll: ScrollState }) {
  const shellRef = useRef<THREE.Mesh>(null);
  const orbMatRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const spriteRef = useRef<THREE.Sprite>(null);

  const haloTexture = useMemo(() => makeHaloTexture(), []);
  const orbUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#8b5cf6") },
      uWeight: { value: 1 },
    }),
    []
  );
  const tintColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend } = getSceneState(scroll.progress);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.07;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.08;
      // Gentle drift so the orb isn't perfectly static across the whole page
      const driftX = Math.sin(t * 0.05) * 0.7;
      const driftY = Math.cos(t * 0.07) * 0.35;
      groupRef.current.position.set(driftX, driftY, -3);
      // Breathing
      const s = 0.8 + Math.sin(t * 0.5) * 0.02;
      groupRef.current.scale.setScalar(s);
    }

    // Weight the orb down while the constellation flourish takes over
    const coreWeight =
      1 - lerp1(chapter.focus === "constellation" ? 1 : 0, next.focus === "constellation" ? 1 : 0, blend);

    // Chapter-tinted orb color, eased
    const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
    tintColor.setRGB(a[0], a[1], a[2]);
    if (orbMatRef.current) {
      const u = orbMatRef.current.uniforms;
      u.uTime.value = t;
      (u.uColor.value as THREE.Color).lerp(tintColor, 0.03);
      u.uWeight.value += (coreWeight - u.uWeight.value) * 0.06;
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.05;
      shellRef.current.rotation.z = t * 0.02;
      const mat = shellRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.09 * coreWeight;
      mat.color.lerp(tintColor, 0.03);
    }

    if (spriteRef.current) {
      const mat = spriteRef.current.material as THREE.SpriteMaterial;
      mat.opacity = (0.32 + Math.sin(t * 0.8) * 0.06) * coreWeight;
      mat.color.lerp(tintColor, 0.03);
    }

    const signalWeight = lerp1(chapter.focus === "signal" ? 1 : 0, next.focus === "signal" ? 1 : 0, blend);
    if (ringRef.current) {
      const cycle = (t % 3) / 3;
      const s = 1 + cycle * 1.8;
      ringRef.current.scale.setScalar(s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = signalWeight * 0.3 * (1 - cycle);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Energy orb — fresnel rim + swimming plasma */}
      <mesh>
        <sphereGeometry args={[0.85, 48, 48]} />
        <shaderMaterial
          ref={orbMatRef}
          vertexShader={orbVertex}
          fragmentShader={orbFragment}
          uniforms={orbUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Faint sacred-geometry cage around the orb */}
      <mesh ref={shellRef} scale={1.35}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.09} />
      </mesh>
      {/* Compact halo sprite — soft radial falloff, ~1/3 the old bubble */}
      <sprite ref={spriteRef} scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={haloTexture}
          color="#8b5cf6"
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* Signal ripple ring (experience/activity chapters) */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1, 0.012, 8, 64]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function lerp1(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// -----------------------------------------------------------------------------
// Skills Constellation — 30 static category-colored points + faint connecting
// web, visible only during the Skills chapter. Reads the shared filter store
// imperatively each frame (cheap: 30 items) so chip clicks in the DOM Skills
// section dim non-matching points without any prop drilling.
// -----------------------------------------------------------------------------
function SkillsConstellation({ scroll }: { scroll: ScrollState }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const { positions, colorArray, lineGeometry } = useMemo(() => {
    const n = skillsData.length;
    const positions = new Float32Array(n * 3);
    const colorArray: THREE.Color[] = [];
    const radius = 1.7;
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      colorArray.push(new THREE.Color(getCategoryColor(skillsData[i].category)));
    }

    const linePositions: number[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.05) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

    return { positions, colorArray, lineGeometry: lineGeo };
  }, []);

  const colorsAttr = useMemo(() => {
    const arr = new Float32Array(colorArray.length * 3);
    colorArray.forEach((c, i) => {
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    });
    return arr;
  }, [colorArray]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend } = getSceneState(scroll.progress);
    const weight = lerp1(chapter.focus === "constellation" ? 1 : 0, next.focus === "constellation" ? 1 : 0, blend);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
      groupRef.current.scale.setScalar(0.85 + weight * 0.25);
    }

    const activeCats = getActiveSkillCategories();
    const anyFilter = activeCats.size > 0;
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = weight * (anyFilter ? 0.55 : 0.9);
      mat.size = 0.05 + weight * 0.03;
    }
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = weight * 0.12;
      // Tint the connecting web to the active chapter accent — visible
      // crossfade as Skills morphs into Projects with different palettes
      const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
      tmpColor.setRGB(a[0], a[1], a[2]);
      mat.color.lerp(tmpColor, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorsAttr, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <lineSegments ref={lineRef}>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial color="#a78bfa" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Ember particles — small warm flourish for the Achievements chapter
// -----------------------------------------------------------------------------
function Embers({ scroll }: { scroll: ScrollState }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 24;
  const flameColor = useMemo(() => new THREE.Color("#fbbf24"), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const rand = seededRandom(777);
    for (let i = 0; i < count; i++) {
      const r = 1.4 + rand() * 1.2;
      const a = rand() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (rand() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(a) * r;
      phases[i] = rand();
    }
    return { positions, phases };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend } = getSceneState(scroll.progress);
    const weight = lerp1(chapter.focus === "flame" ? 1 : 0, next.focus === "flame" ? 1 : 0, blend);
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.1;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = weight * 0.7;
      // Harmonize the ember hue with the active chapter — warm flourish
      // stays warm but leans slightly toward each chapter's colorA accent
      const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
      tmpColor.setRGB(a[0], a[1], a[2]);
      mat.color.lerp(tmpColor, 0.03);
      mat.color.lerp(flameColor, 0.04); // pull back toward gold
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#fbbf24" transparent opacity={0} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// Energy Ribbons — flowing sine-wave trails orbiting the focus orb. A custom
// curve geometry ribbon with a shader that animates a luminance wave along its
// length, reacting to scroll velocity (faster scroll = brighter/faster pulse).
// Reads as elegant "ribbon light" wrapping the orb — premium ornament without
// competing with foreground content.
// -----------------------------------------------------------------------------
const ribbonVertex = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform float uSeed;
  attribute float u;
  varying float vU;
  void main() {
    vU = u;
    vec3 pos = position;
    // Subtle breathing along the ribbon
    pos += normal * sin(uTime * 0.8 + u * 6.2831 + uSeed) * 0.04;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const ribbonFragment = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform vec3 uColor;
  uniform float uWeight;
  uniform float uSeed;
  varying float vU;
  void main() {
    // A traveling light pulse along the ribbon length (two waves, second is dimmer)
    float wave1 = sin((vU - uTime * 0.18) * 6.2831 * 2.0 + uSeed);
    float wave2 = sin((vU - uTime * 0.12) * 6.2831 * 1.0 + uSeed * 1.7) * 0.4;
    float pulse = 0.5 + 0.5 * (wave1 + wave2);
    // Edge fade so the ribbon has no visible seam
    float edge = smoothstep(0.0, 0.08, vU) * smoothstep(1.0, 0.92, vU);
    float lum = (0.18 + 0.82 * pulse) * edge;
    // Scroll velocity brightens and speeds the pulse
    float bright = lum * (0.7 + uVelocity * 0.6);
    vec3 col = uColor * bright;
    gl_FragColor = vec4(col, edge * uWeight * (0.35 + 0.65 * pulse));
  }
`;

function EnergyRibbons({ scroll }: { scroll: ScrollState }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const tintColor = useMemo(() => new THREE.Color(), []);

  // Build three ribbon-shaped TubeGeometries along sine-perturbed curves.
  // Each ribbon is a thin tube around a CatmullRom curve — one draw call, GPU
  // animation drives the luminance, motion is just group rotation.
  const { geometries, seeds } = useMemo(() => {
    const geos: THREE.TubeGeometry[] = [];
    const seedList: number[] = [];
    for (let k = 0; k < 3; k++) {
      const turns = 5;
      const pts: THREE.Vector3[] = [];
      const segments = 200;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2 * turns;
        const r = 1.15 + 0.18 * Math.sin(t * 0.5 + k * 1.7);
        pts.push(
          new THREE.Vector3(
            Math.cos(t) * r,
            Math.sin(t) * r * 0.55 + 0.25 * Math.sin(t * 0.3 + k * 2.1),
            Math.sin(t * 0.8 + k * 1.3) * 0.42
          )
        );
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      geos.push(new THREE.TubeGeometry(curve, segments, 0.018, 6, true));
      seedList.push(k * 1.9 + 0.3);
    }
    return { geometries: geos, seeds: seedList };
  }, []);

  const uniforms = useMemo(
    () =>
      seeds.map((seed) => ({
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uColor: { value: new THREE.Color("#8b5cf6") },
        uWeight: { value: 0 },
        uSeed: { value: seed },
      })),
    [seeds]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend } = getSceneState(scroll.progress);
    const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
    tintColor.setRGB(a[0], a[1], a[2]);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.14;
      groupRef.current.rotation.z = Math.cos(t * 0.06) * 0.06;
    }
    const v = Math.min(Math.abs(scroll.velocity) * 0.6, 1);
    matsRef.current.forEach((m, i) => {
      if (!m) return;
      const u = m.uniforms;
      u.uTime.value = t;
      u.uVelocity.value += (v - u.uVelocity.value) * 0.08;
      (u.uColor.value as THREE.Color).lerp(tintColor, 0.03);
      // Ribbons ride alongside the orb's "core" weight — visible and breathing
      // except during the constellation chapter when they fade out
      const w =
        1 - lerp1(chapter.focus === "constellation" ? 1 : 0, next.focus === "constellation" ? 1 : 0, blend);
      u.uWeight.value += (w * 0.7 + 0.15 - u.uWeight.value) * 0.04;
    });
  });

  return (
    <group ref={groupRef}>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <shaderMaterial
            ref={(m) => {
              if (m) matsRef.current[i] = m;
            }}
            vertexShader={ribbonVertex}
            fragmentShader={ribbonFragment}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Crystal Shards — a handful of slowly tumbling faceted low-poly meshes with
// a fresnel rim-light shader. Reads as floating jewelry around the orb — the
// premium "wow" depth moment without competing for attention (no bloom, no
// HDR, all glow fake-emulated with toneMapped=false additive).
// -----------------------------------------------------------------------------
const shardVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalMatrix * normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const shardFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uWeight;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 1.6);
    // A subtle inner shimmer — brightness pulses gently, no hard specular
    float shimmer = 0.4 + 0.6 * sin(uTime * 0.6 + vNormal.x * 4.0 + vNormal.y * 2.0);
    vec3 col = uColor * (0.18 + shimmer * 0.28) + uColor * fres * 1.05 + vec3(1.0) * fres * fres * 0.18;
    float a = (0.18 + fres * 0.82) * uWeight;
    gl_FragColor = vec4(col, a);
  }
`;

function CrystalShards({ scroll }: { scroll: ScrollState }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const tintColor = useMemo(() => new THREE.Color(), []);

  // 5 shard placements on a slow orbit
  const shards = useMemo(() => {
    const rand = seededRandom(2024);
    return new Array(5).fill(0).map(() => ({
      orbitR: 2.1 + rand() * 0.6,
      orbitY: (rand() - 0.5) * 0.9,
      speed: (0.04 + rand() * 0.06) * (rand() > 0.5 ? 1 : -1),
      phase: rand() * Math.PI * 2,
      spin: {
        x: (rand() - 0.5) * 0.6,
        y: (rand() - 0.5) * 0.6,
        z: (rand() - 0.5) * 0.4,
      },
      geoIndex: Math.floor(rand() * 3),
      size: 0.16 + rand() * 0.12,
    }));
  }, []);

  const geometries = useMemo(
    () => [
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.IcosahedronGeometry(1, 0),
    ],
    []
  );

  const uniforms = useMemo(
    () =>
      shards.map(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#8b5cf6") },
        uWeight: { value: 0 },
      })),
    [shards]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend } = getSceneState(scroll.progress);
    const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
    tintColor.setRGB(a[0], a[1], a[2]);

    // Slightly reduce shard presence during constellation chapter
    const w =
      1 - lerp1(chapter.focus === "constellation" ? 1 : 0, next.focus === "constellation" ? 1 : 0, blend);

    shards.forEach((s, i) => {
      const mesh = meshRefs.current[i];
      if (mesh) {
        const angle = t * s.speed + s.phase;
        mesh.position.set(
          Math.cos(angle) * s.orbitR,
          s.orbitY + Math.sin(t * 0.2 + s.phase) * 0.18,
          Math.sin(angle) * s.orbitR * 0.5
        );
        mesh.rotation.x = t * s.spin.x;
        mesh.rotation.y = t * s.spin.y;
        mesh.rotation.z = t * s.spin.z;
        const pulse = 1 + Math.sin(t * 0.8 + s.phase) * 0.06;
        mesh.scale.setScalar(s.size * pulse);
      }
      const m = matsRef.current[i];
      if (m) {
        m.uniforms.uTime.value = t;
        (m.uniforms.uColor.value as THREE.Color).lerp(tintColor, 0.03);
        m.uniforms.uWeight.value += (w * 0.55 - m.uniforms.uWeight.value) * 0.04;
      }
    });

    if (groupRef.current) groupRef.current.rotation.y = t * 0.02;
  });

  return (
    <group ref={groupRef}>
      {shards.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) meshRefs.current[i] = m;
          }}
          geometry={geometries[s.geoIndex]}
        >
          <shaderMaterial
            ref={(m) => {
              if (m) matsRef.current[i] = m;
            }}
            vertexShader={shardVertex}
            fragmentShader={shardFragment}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Warp Rings — three thin tilted rings around the orb that pulse outward when
// the visitor scrolls and contract when at rest. A scroll-velocity "engine"
// feel; the reactive motion makes the background feel alive and responsive.
// Each ring is a torus with shader-driven radial glow that expands with scroll.
// -----------------------------------------------------------------------------
const warpRingVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const warpRingFragment = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform vec3 uColor;
  uniform float uWeight;
  uniform float uSeed;
  varying vec2 vUv;
  void main() {
    // A traveling wave around the ring's circumference
    float wave = sin((vUv.x - uTime * 0.3 + uSeed) * 6.2831 * 3.0);
    // Brightness swells with scroll velocity
    float bright = (0.35 + 0.65 * (0.5 + 0.5 * wave)) * (0.5 + uVelocity * 1.0);
    vec3 col = uColor * bright;
    gl_FragColor = vec4(col, uWeight * (0.18 + uVelocity * 0.4));
  }
`;

function WarpRings({ scroll }: { scroll: ScrollState }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const tintColor = useMemo(() => new THREE.Color(), []);

  const rings = useMemo(
    () =>
      new Array(3).fill(0).map((_, i) => ({
        radius: 1.45 + i * 0.28,
        tube: 0.008,
        tiltX: 1.1 + i * 0.35,
        tiltY: 0.4 + i * 0.5,
        tiltZ: i * 0.25,
        seed: i * 1.7,
      })),
    []
  );

  const uniforms = useMemo(
    () =>
      rings.map((r) => ({
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uColor: { value: new THREE.Color("#8b5cf6") },
        uWeight: { value: 0 },
        uSeed: { value: r.seed },
      })),
    [rings]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend } = getSceneState(scroll.progress);
    const a = lerp3(hexToVec3(chapter.colorA), hexToVec3(next.colorA), blend);
    tintColor.setRGB(a[0], a[1], a[2]);

    const v = Math.min(Math.abs(scroll.velocity) * 0.6, 1);

    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.04;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }

    rings.forEach((r, i) => {
      const mesh = meshRefs.current[i];
      if (mesh) {
        // Scroll-velocity pulses the ring outward and contracts at rest
        const s = 1 + v * 0.22 + Math.sin(t * 0.7 + i) * 0.04;
        mesh.scale.setScalar(s);
      }
      const m = matsRef.current[i];
      if (m) {
        m.uniforms.uTime.value = t;
        m.uniforms.uVelocity.value += (v - m.uniforms.uVelocity.value) * 0.1;
        (m.uniforms.uColor.value as THREE.Color).lerp(tintColor, 0.03);
        const w =
          1 - lerp1(chapter.focus === "constellation" ? 1 : 0, next.focus === "constellation" ? 1 : 0, blend);
        m.uniforms.uWeight.value += (w * 0.7 - m.uniforms.uWeight.value) * 0.04;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((r, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) meshRefs.current[i] = m;
          }}
          rotation={[r.tiltX, r.tiltY, r.tiltZ]}
        >
          <torusGeometry args={[r.radius, r.tube, 8, 96]} />
          <shaderMaterial
            ref={(m) => {
              if (m) matsRef.current[i] = m;
            }}
            vertexShader={warpRingVertex}
            fragmentShader={warpRingFragment}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Adaptive quality — watches real frame time and steps the renderer's pixel
// ratio down (1.5 → 1.25 → 1) when the GPU can't hold 60fps, and back up when
// there's headroom. Guarantees buttery scrolling on weak/integrated GPUs.
// -----------------------------------------------------------------------------
function AdaptiveQuality({ maxDpr }: { maxDpr: number }) {
  const { gl } = useThree();
  const stats = useRef({ acc: 0, frames: 0, level: 0, cooldown: 0 });
  const levels = useMemo(() => {
    const l = [maxDpr, Math.max(1, maxDpr - 0.25), 1];
    return [...new Set(l)];
  }, [maxDpr]);

  useFrame((_, delta) => {
    const s = stats.current;
    // Ignore pathological deltas (tab switches, loader jank)
    if (delta > 0.25) return;
    s.acc += delta;
    s.frames++;
    if (s.cooldown > 0) s.cooldown -= delta;

    // Evaluate roughly once per second
    if (s.acc >= 1) {
      const avgMs = (s.acc / s.frames) * 1000;
      s.acc = 0;
      s.frames = 0;
      if (s.cooldown <= 0) {
        if (avgMs > 22 && s.level < levels.length - 1) {
          s.level++;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, levels[s.level]));
          s.cooldown = 3; // settle before re-evaluating
        } else if (avgMs < 12 && s.level > 0) {
          s.level--;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, levels[s.level]));
          s.cooldown = 5; // climb back up conservatively
        }
      }
    }
  });

  return null;
}

// -----------------------------------------------------------------------------
// Camera rig — reads scroll each frame, lerps toward the current chapter's
// waypoint. Purely additive to mouse parallax so the page never feels like
// it's "flying" — motion stays subtle behind the foreground content.
// -----------------------------------------------------------------------------
function CameraRig({ pointer, scroll }: { pointer: PointerState; scroll: ScrollState }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const { camera: camWaypoint, lookAt: lookWaypoint } = getSceneState(scroll.progress);
    const k = 1 - Math.exp(-1.4 * delta);
    target.set(camWaypoint[0] + pointer.nx * 0.3, camWaypoint[1] + pointer.ny * 0.2, camWaypoint[2]);
    camera.position.lerp(target, k);
    lookAt.set(lookWaypoint[0], lookWaypoint[1], lookWaypoint[2]);
    camera.lookAt(lookAt);
  });

  return null;
}

// -----------------------------------------------------------------------------
// Scene contents
// -----------------------------------------------------------------------------
function SceneContents({ isMobile }: { isMobile: boolean }) {
  const pointer = usePointer();
  const scroll = useScrollTracker();

  return (
    <>
      <CameraRig pointer={pointer} scroll={scroll} />
      <AdaptiveQuality maxDpr={isMobile ? 1 : 1.5} />
      <AuroraNebula pointer={pointer} scroll={scroll} />
      <GPUStars pointer={pointer} scroll={scroll} count={isMobile ? 500 : 1600} />

      {!isMobile && (
        <>
          <ShootingStar seed={0.1} />
          <ShootingStar seed={0.5} />
          <ShootingStar seed={0.9} />
        </>
      )}
      <FocusCore scroll={scroll} />
      {!isMobile && <EnergyRibbons scroll={scroll} />}
      {!isMobile && <CrystalShards scroll={scroll} />}
      {!isMobile && <WarpRings scroll={scroll} />}
      {!isMobile && <SkillsConstellation scroll={scroll} />}
      {!isMobile && <Embers scroll={scroll} />}
    </>
  );
}

export default function CosmicScene() {
  const isMobile = useIsMobile();
  const visible = useDocumentVisible();
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay lets the hero paint first; the background then fades in —
    // avoids competing with the initial interactivity critical path.
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (prefersReducedMotion) {
    // Static, cheap fallback: a fixed gradient instead of any canvas.
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.12), transparent 60%), #030308",
        }}
        aria-hidden
      />
    );
  }

  return (
    <div className="gpu-layer fixed inset-0 z-0 pointer-events-none">
      {ready && (
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 55 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, isMobile ? 1 : 1.5]}
          style={{ background: "transparent" }}
          frameloop={visible ? "always" : "never"}
          onCreated={() => markSceneWarmed("cosmic")}
        >
          <Suspense fallback={null}>
            <SceneContents isMobile={isMobile} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
