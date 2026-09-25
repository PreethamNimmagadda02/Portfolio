"use client";

/**
 * CosmicScene: the single persistent WebGL background for the entire page.
 *
 * One canvas, one GL context, one render loop, driven entirely by document
 * scroll progress via `getSceneState()` (see `@/lib/scene-store`).
 *
 * Obsidian and Aurum direction: every chapter shares one gold family, and the
 * page is obsidian and type. The scene is a gold star field throughout, an
 * engraved guilloche behind the hero alone, a star chart during Skills and
 * embers at Achievements. Every focus object hides itself once its smoothed
 * presence drops below a small threshold, so most of the page renders the
 * canvas at near-zero GPU cost.
 *
 * There was an aurora nebula here: a fullscreen domain-warped FBM cloud at
 * full intensity behind the hero and low behind the contact letter. It was
 * removed on request, being the one element that read as glowing gas rather
 * than as ink and engraving. `intensity` in the chapter table survives it and
 * still lifts the star field in those two chapters.
 *
 * Design constraints:
 *  - No MeshTransmissionMaterial, no EffectComposer/Bloom, no HDR Environment,
 *    no drei <Html>. Glow is faked with additive blending; every additive
 *    opacity is held low so the gold never pushes toward orange.
 *  - dpr capped, antialias off (shader edges are already soft), frameloop
 *    pauses when the tab is hidden.
 *  - Everything reads scroll/pointer from the shared viewport-store: zero
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
import { getSceneState, hexToVec3, useChapterCalibration } from "@/lib/scene-store";
import { getActiveSkillCategories } from "@/lib/scene-store";
import { skillsData, getCategoryColor } from "@/lib/skills-data";
import { markSceneWarmed, seededRandom } from "@/lib/utils";

/** Foundation tokens as WebGL uniform seeds (the only hex literals allowed here). */
const AURUM_100 = "#EBD9A8";
const AURUM_300 = "#C9A961";
const AURUM_500 = "#7A6134";
const IVORY_100 = "#F2ECE0";
const IVORY_200 = "#B8AE9C";
const AURUM_200 = "#D9BE7C";

/**
 * Weight for a layer that belongs to exactly one chapter: 1 inside it, 0
 * elsewhere, carried across the chapter cross-fade so it dissolves on the way
 * out instead of popping.
 *
 * Chapter intensity alone is not enough for anything with an edge. The nebula
 * and the starfield can follow intensity, because gold light behind the
 * contact letter reads as ambience; geometry cannot, because it crossed the
 * form fields and read as debris over the copy.
 */
function chapterWeight(
  chapter: { id: string },
  next: { id: string },
  blend: number,
  id: string
): number {
  return lerp1(chapter.id === id ? 1 : 0, next.id === id ? 1 : 0, blend);
}

// -----------------------------------------------------------------------------
// GPU Starfield: all motion computed in the vertex shader, zero CPU writes.
// Retinted to ivory so the field reads as faint warm dust, not a night sky.
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
  varying float vGravity;
  varying float vDepth;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    pos.y += sin(uTime * 0.4 + aPhase * 6.2831) * 0.18;
    pos.x += cos(uTime * 0.25 + aPhase * 6.2831) * 0.12;
    float depth = (pos.z + 6.0) / 12.0;
    pos.x += uMouse.x * depth * 1.1;
    pos.y += uMouse.y * depth * 0.7 + uScroll * depth * 4.0;
    // While scrolling, near stars trail vertically
    pos.y -= uVelocity * depth * 0.9;

    // Pointer gravity: stars near the cursor are gently pushed away and
    // flare brighter, like a passing disturbance in the field.
    vec2 mouseWorld = uMouse * vec2(9.0, 6.0);
    vec2 toStar = pos.xy - mouseWorld;
    float distToMouse = length(toStar);
    float gravity = smoothstep(3.2, 0.0, distToMouse) * (0.4 + depth * 0.6);
    pos.xy += normalize(toStar + vec2(0.0001)) * gravity * 0.9;
    vGravity = gravity;
    vDepth = depth;

    vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aPhase * 2.0) + aPhase * 40.0);
    vStretch = clamp(abs(uVelocity) * (0.4 + depth), 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Stars grow slightly and brighten under motion and pointer proximity
    gl_PointSize = aSize * vTwinkle * (160.0 / -mv.z) * (1.0 + vStretch * 1.6 + vGravity * 1.2);
    gl_Position = projectionMatrix * mv;
  }
`;

const starsFragment = /* glsl */ `
  uniform vec3 uColorMod;
  uniform float uModMix;
  uniform float uIntensity;
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vStretch;
  varying float vGravity;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // Elongate the sprite vertically while scrolling: motion streaks
    c.y /= (1.0 + vStretch * 2.2);
    float d = length(c);
    float alpha = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.18, 0.0, d) * 0.9;
    // Per-star base color crossfaded toward the chapter's umber tint.
    // uModMix is held low (0.2) so the ivory palette still reads; the tint
    // is an ambient wash, not a recolor.
    vec3 base = mix(vColor, uColorMod * (0.7 + core + vStretch * 0.35), uModMix);
    // Depth fog: distant stars (low vDepth) fall back into the void, near
    // ones stay crisp.
    float fog = mix(0.35, 1.0, vDepth);
    vec3 col = base * vTwinkle * fog + vec3(1.0) * vGravity * 0.5;
    // Mid-page the field settles to faint warm dust; it brightens with the
    // nebula in the hero and contact chapters.
    float presence = 0.35 + 0.65 * uIntensity;
    gl_FragColor = vec4(col, alpha * vTwinkle * (0.5 + fog * 0.5) * presence);
  }
`;

// Two ivory tones and one pale gold: the field reads as dust on paper.
const STAR_PALETTE = [new THREE.Color(IVORY_200), new THREE.Color(IVORY_100), new THREE.Color(AURUM_200)];

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
      uIntensity: { value: 0 },
      uColorMod: { value: new THREE.Color(AURUM_500) },
      uModMix: { value: 0.0 },
    }),
    []
  );
  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uMouse.value.x += (pointer.nx - u.uMouse.value.x) * 0.05;
    u.uMouse.value.y += (pointer.ny - u.uMouse.value.y) * 0.05;
    u.uScroll.value += (scroll.progress - u.uScroll.value) * 0.05;
    // Signed velocity, soft-capped: drives streaks in the vertex shader
    const v = Math.max(-1, Math.min(1, scroll.velocity * 0.5));
    u.uVelocity.value += (v - u.uVelocity.value) * 0.1;
    // A low mix toward the umber tone (uColorMod), and the chapter's intensity
    // lifts the field in the two live chapters.
    const { intensity } = getSceneState(scroll.progress);
    u.uModMix.value += (0.2 - u.uModMix.value) * 0.05;
    u.uIntensity.value += (intensity - u.uIntensity.value) * 0.06;
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
// Guilloche field: the hero's centrepiece.
//
// Rose-engine engraving, the interference pattern a guilloche lathe cuts into
// banknotes, share certificates and watch dials. Three rosette families at
// different petal counts are summed, and every integer contour of each field
// is drawn as a single gold hairline, which is the same drawn-line language
// the rest of the page is built from.
//
// This replaces the earlier focus orb and its wireframe cage. Those were solid
// geometry with a lit rim: it aliased into a visibly stepped edge against the
// obsidian ground, and it put a bright mass directly behind the hero subtext.
// An engraving has no silhouette at all. Its density is authored rather than
// lit, so it can be thinned to nothing across the text column and the copy
// always sits on clean ground.
// -----------------------------------------------------------------------------
const guillocheVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const guillocheFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uAspect;
  uniform vec2  uCenter;
  uniform vec2  uMouse;
  uniform vec2  uClearDir;
  uniform vec2  uClearRange;
  uniform vec3  uGold;
  uniform vec3  uHigh;
  varying vec2 vUv;

  /* One rose-engine family. The contours of r * (1 + depth * cos(n * theta))
     are the nested rosettes the lathe traces: n sets the petal count, depth
     how far the lobes swing. */
  float rose(vec2 p, float petals, float depth, float phase) {
    float r = length(p);
    float a = atan(p.y, p.x);
    return r * (1.0 + depth * cos(petals * a + phase));
  }

  /* One hairline on every integer contour of f, held to about a pixel at any
     scale by measuring the field's own screen-space gradient. Where that
     gradient runs past half a period the lines can no longer be resolved, so
     the family fades out rather than aliasing into moire: this is what keeps
     the dense centre and the far field clean. */
  float hairline(float f, float spacing) {
    float g = f / spacing;
    float w = fwidth(g);
    float d = abs(fract(g + 0.5) - 0.5);
    float line = 1.0 - smoothstep(0.0, w * 1.15, d);
    return line * (1.0 - smoothstep(0.22, 0.55, w));
  }

  void main() {
    vec2 p = vUv - (uCenter + uMouse * 0.010);
    p.x *= uAspect;
    float r = length(p);

    /* Petal counts kept coprime so the three families never settle into one
       repeating star. Each drifts at its own rate, two of them against the
       others, which is what makes the interference move without anything
       appearing to spin. */
    float ink =
        hairline(rose(p, 7.0,  0.125, uTime * 0.043), 0.0165) * 0.58
      + hairline(rose(p, 13.0, 0.085, 1.7 - uTime * 0.031), 0.0255) * 0.42
      + hairline(rose(p, 29.0, 0.042, 3.1 + uTime * 0.019), 0.0415) * 0.28;

    /* An engraved medallion: clear at the very centre, full through the band
       around it, gone before the frame edge. */
    ink *= smoothstep(0.02, 0.13, r) * smoothstep(1.30, 0.34, r);

    /* The cut. Rings appear outward from the rosette's eye the way a lathe
       lays them down, once, as the hero settles. */
    ink *= smoothstep(0.0, 0.16, uReveal * 1.45 - r);

    /* The reading area. Density falls to a twentieth across whichever side
       the copy occupies, so the headline and subtext never sit on pattern. */
    float t = dot(vUv, uClearDir);
    ink *= mix(0.05, 1.0, smoothstep(uClearRange.x, uClearRange.y, t));

    vec3 col = mix(uGold, uHigh, smoothstep(0.55, 0.06, r));
    float a = ink * uOpacity;
    gl_FragColor = vec4(col * a, a);
  }
`;

/* Plane dimensions in world units. The rosette has to stay circular in world
   space, so the shader corrects uv by the plane's own aspect, not the
   viewport's. Sized to cover the frame at every viewport with room for the
   camera's chapter drift. */
const GUILLOCHE_W = 22;
const GUILLOCHE_H = 13;

/** Peak ink. Hairlines this fine have to read as light, not as line. */
const GUILLOCHE_INK = 0.72;

/** Seconds the cut takes to travel out from the eye, and its held beat before. */
const GUILLOCHE_CUT = 2.4;
const GUILLOCHE_CUT_DELAY = 0.25;

function GuillocheField({
  pointer,
  scroll,
  isMobile,
}: {
  pointer: PointerState;
  scroll: ScrollState;
  isMobile: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uReveal: { value: 0 },
      uAspect: { value: GUILLOCHE_W / GUILLOCHE_H },
      // Desktop: right of centre and a little high, so the rosette radiates
      // from behind the portrait plate the way an engraved vignette sits on a
      // certificate. Mobile stacks the portrait above the copy, so the centre
      // moves up and the clear side becomes the bottom rather than the left.
      uCenter: { value: new THREE.Vector2(isMobile ? 0.52 : 0.68, isMobile ? 0.66 : 0.54) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uClearDir: { value: new THREE.Vector2(isMobile ? 0 : 1, isMobile ? 1 : 0) },
      uClearRange: { value: new THREE.Vector2(isMobile ? 0.3 : 0.16, isMobile ? 0.72 : 0.58) },
      uGold: { value: new THREE.Vector3(...hexToVec3(AURUM_300)) },
      uHigh: { value: new THREE.Vector3(...hexToVec3(AURUM_100)) },
    }),
    [isMobile]
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    const elapsed = state.clock.elapsedTime;
    u.uTime.value = elapsed;
    u.uMouse.value.x += (pointer.nx - u.uMouse.value.x) * 0.03;
    u.uMouse.value.y += (pointer.ny - u.uMouse.value.y) * 0.03;

    // The cut runs once, from the scene's own first frame. The canvas mounts
    // on main-thread idle, which is close enough to the hero's entrance that
    // the two read as one movement without coupling to the loader's event.
    u.uReveal.value = Math.min(1, Math.max(0, (elapsed - GUILLOCHE_CUT_DELAY) / GUILLOCHE_CUT));

    const { chapter, next, blend } = getSceneState(scroll.progress);
    const target = chapterWeight(chapter, next, blend, "hero") * GUILLOCHE_INK;
    u.uOpacity.value += (target - u.uOpacity.value) * 0.05;
    // A full-screen shader past the hero draws nothing but black, so it stops
    // drawing at all once its ink has drained, as every other focus object does.
    if (meshRef.current) meshRef.current.visible = u.uOpacity.value > 0.002;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <planeGeometry args={[GUILLOCHE_W, GUILLOCHE_H]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={guillocheVertex}
        fragmentShader={guillocheFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
function lerp1(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// -----------------------------------------------------------------------------
// Skills Constellation: static category-toned points plus a faint connecting
// web, a gold star chart visible only during the Skills chapter at the base
// opacity the chapter table sets (0.12). Reads the shared filter store
// imperatively each frame (cheap: a few dozen items) so toggling a category
// in the DOM Skills section lifts the matching points to 0.6 without any
// prop drilling.
// -----------------------------------------------------------------------------
const CONSTELLATION_REST = 0.12;
const CONSTELLATION_LIFT = 0.6;
const CONSTELLATION_DIM = 0.06;

/* Near-still. A field of points turning slowly reads as celestial
   cartography; the same field spun at a visible rate reads as a product demo,
   which is the one register this page cannot afford. */
const CONSTELLATION_DRIFT = 0.012;

/**
 * Soft round sprite for the star points. An unmapped pointsMaterial draws
 * hard squares, which read as pixels rather than as stars, and squares are
 * exactly the wrong shape on a page whose every other edge is a drawn rule.
 * Built once on first use and shared: one 64px canvas for the whole field.
 */
let starSprite: THREE.Texture | null = null;

function makeStarTexture(): THREE.Texture {
  if (starSprite) return starSprite;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(0.7, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  starSprite = tex;
  return tex;
}

function SkillsConstellation({ scroll }: { scroll: ScrollState }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const base = useRef(0);
  const sprite = useMemo(() => makeStarTexture(), []);

  const { positions, colorArray } = useMemo(() => {
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

    return { positions, colorArray };
  }, []);

  // Vertex colours start at the rest brightness so nothing flashes on mount.
  const colorsAttr = useMemo(() => {
    const arr = new Float32Array(colorArray.length * 3);
    colorArray.forEach((c, i) => {
      arr[i * 3] = c.r * CONSTELLATION_REST;
      arr[i * 3 + 1] = c.g * CONSTELLATION_REST;
      arr[i * 3 + 2] = c.b * CONSTELLATION_REST;
    });
    return arr;
  }, [colorArray]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { chapter, next, blend, constellationOpacity } = getSceneState(scroll.progress);
    // Pinned to Skills. Chapter intensity alone let the field bleed a long way
    // up into Experience, where a lit sphere sat behind the role dossier.
    const target = constellationOpacity * chapterWeight(chapter, next, blend, "skills");
    base.current += (target - base.current) * 0.06;
    // Normalised chapter presence: 1 inside Skills, easing to 0 either side.
    const weight = Math.min(base.current / CONSTELLATION_REST, 1);

    if (groupRef.current) {
      groupRef.current.visible = base.current > 0.002;
      groupRef.current.rotation.y = t * CONSTELLATION_DRIFT;
      groupRef.current.scale.setScalar(0.85 + weight * 0.25);
    }

    // Hidden outside Skills: no point easing colours and re-uploading them to
    // the GPU every frame for a group that is not drawn.
    if (pointsRef.current && groupRef.current?.visible) {
      const activeCats = getActiveSkillCategories();
      const anyFilter = activeCats.size > 0;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      // Brightness lives in the vertex colour (fragment output is clamped to
      // [0, 1] before additive blending, so a per-point lift above the base
      // opacity has to come from the colour, not the material opacity). At
      // rest a point therefore renders at exactly constellationOpacity.
      mat.opacity = weight;
      mat.size = 0.062 + weight * 0.036;

      // Per-skill response: points matching the active filter lift to 0.6,
      // everything else settles toward the dim floor, so the selection reads
      // as a highlight rather than one flat global dim.
      // In-place mutation of a persistent typed array (+ needsUpdate below)
      // is the standard r3f pattern for per-frame vertex-color updates;
      // recreating the Float32Array every frame would defeat the point.
      /* eslint-disable react-hooks/immutability */
      const colorAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
      for (let i = 0; i < skillsData.length; i++) {
        const match = activeCats.has(skillsData[i].category);
        const baseColor = colorArray[i];
        const target = anyFilter ? (match ? CONSTELLATION_LIFT : CONSTELLATION_DIM) : CONSTELLATION_REST;
        const idx = i * 3;
        colorsAttr[idx] += (baseColor.r * target - colorsAttr[idx]) * 0.08;
        colorsAttr[idx + 1] += (baseColor.g * target - colorsAttr[idx + 1]) * 0.08;
        colorsAttr[idx + 2] += (baseColor.b * target - colorsAttr[idx + 2]) * 0.08;
      }
      /* eslint-enable react-hooks/immutability */
      colorAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorsAttr, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sprite}
          size={0.075}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Ember particles: a small gold flourish weighted to the flame-focus chapter.
// -----------------------------------------------------------------------------
function Embers({ scroll }: { scroll: ScrollState }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 24;
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
    const weight = chapterWeight(chapter, next, blend, "achievements");
    if (pointsRef.current) {
      pointsRef.current.visible = weight > 0.01;
      pointsRef.current.rotation.y = t * 0.1;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = weight * 0.35;
    }
  });

  return (
    <points ref={pointsRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={AURUM_300} transparent opacity={0} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// -----------------------------------------------------------------------------
// Adaptive quality: watches real frame time and steps the renderer's pixel
// ratio down (1.5 to 1.25 to 1) when the GPU can't hold 60fps, and back up
// when there's headroom. Keeps scrolling smooth on weak or integrated GPUs.
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
// Camera rig: reads scroll each frame, lerps toward the current chapter's
// waypoint. Purely additive to mouse parallax so the page never feels like
// it's flying; motion stays subtle behind the foreground content.
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
      <GPUStars pointer={pointer} scroll={scroll} count={isMobile ? 120 : 360} />
      <GuillocheField pointer={pointer} scroll={scroll} isMobile={isMobile} />
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
  // Chapter boundaries follow the real section positions, not a guess.
  useChapterCalibration();

  useEffect(() => {
    // Small delay lets the hero paint first; the background then fades in,
    // avoiding competition with the initial interactivity critical path.
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (prefersReducedMotion) {
    // Static, cheap fallback: a fixed gold gradient on obsidian instead of
    // any canvas, placed where the hero lobe would sit.
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 45% at 78% 30%, rgba(201,169,97,0.10), transparent 70%), #0C0A08",
        }}
        aria-hidden
      />
    );
  }

  return (
    <div className="gpu-layer fixed inset-0 z-0 pointer-events-none">
      {ready && (
        <Canvas
          camera={{ position: [0.9, 0.3, 6.5], fov: 55 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, isMobile ? 1 : 1.5]}
          style={{ background: "transparent" }}
          frameloop={visible ? "always" : "never"}
          onCreated={() => markSceneWarmed()}
        >
          <Suspense fallback={null}>
            <SceneContents isMobile={isMobile} />
          </Suspense>
        </Canvas>
      )}
      {/* Vignette: a static CSS radial-gradient overlay, zero GPU cost.
          Darkens the frame edges and doubles as a readability aid for the
          content sitting on top. */}
      <div className="cosmic-vignette" aria-hidden />
    </div>
  );
}
