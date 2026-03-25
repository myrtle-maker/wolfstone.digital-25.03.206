import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AuroraBackgroundProps {
  /** Overall brightness 0-1 */
  intensity?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Color preset */
  variant?: "cyan" | "gold" | "mixed";
  /** Fixed fullscreen or contained within parent */
  fullPage?: boolean;
  className?: string;
}

// GLSL vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// GLSL fragment shader — liquid flowing lines with corona glow
// Performance: uses 2D noise (cheaper than 3D), fewer texture lookups
const fragmentShader = `
  precision mediump float;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  varying vec2 vUv;

  // 2D noise — much cheaper than 3D simplex
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i), f),               dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Fractal noise for richer, more liquid feel
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.1;

    // === PRIMARY FLOWING LINE — liquid organic curve ===
    // Use fbm for thick, blobby, liquid motion
    float warp1 = fbm(vec2(p.x * 1.0 + t * 0.3, t * 0.2));
    float warp2 = fbm(vec2(p.x * 1.8 + 5.0, t * 0.15 + 10.0));
    float lineY = warp1 * 0.4 + warp2 * 0.15;

    // Liquid thickness variation — line gets thicker and thinner
    float thickness = 0.006 + 0.004 * (noise(vec2(p.x * 3.0, t * 0.4)) * 0.5 + 0.5);

    float lineDist = abs(p.y - lineY);

    // Core — bright hot center
    float core = exp(-lineDist * lineDist / (thickness * thickness));
    // Inner glow — warm spread
    float innerW = thickness * 5.0;
    float innerGlow = exp(-lineDist * lineDist / (innerW * innerW));
    // Outer glow — wide ambient
    float outerW = thickness * 20.0;
    float outerGlow = exp(-lineDist * lineDist / (outerW * outerW));
    // Atmosphere
    float atmosW = 0.35;
    float atmosphere = exp(-lineDist * lineDist / (atmosW * atmosW));

    // === SECOND LINE — offset, slightly different flow ===
    float warp3 = fbm(vec2(p.x * 0.7 + t * 0.25 + 50.0, t * 0.18 + 50.0));
    float warp4 = fbm(vec2(p.x * 1.5 + 55.0, t * 0.12 + 60.0));
    float line2Y = warp3 * 0.35 + warp4 * 0.12 + 0.12;
    float thickness2 = 0.004 + 0.003 * (noise(vec2(p.x * 2.5 + 20.0, t * 0.35)) * 0.5 + 0.5);
    float line2Dist = abs(p.y - line2Y);
    float core2 = exp(-line2Dist * line2Dist / (thickness2 * thickness2));
    float inner2W = thickness2 * 4.5;
    float inner2 = exp(-line2Dist * line2Dist / (inner2W * inner2W));
    float outer2W = thickness2 * 16.0;
    float outer2 = exp(-line2Dist * line2Dist / (outer2W * outer2W));

    // === THIRD LINE — very faint, adds depth ===
    float warp5 = fbm(vec2(p.x * 0.5 + t * 0.2 + 100.0, t * 0.1 + 100.0));
    float line3Y = warp5 * 0.3 - 0.18;
    float line3Dist = abs(p.y - line3Y);
    float core3 = exp(-line3Dist * line3Dist / (0.003 * 0.003));
    float inner3 = exp(-line3Dist * line3Dist / (0.015 * 0.015));

    // Brightness variation
    float brightVar = noise(vec2(p.x * 2.5, t * 0.5)) * 0.25 + 0.75;
    float pulse = 1.0 + 0.05 * sin(uTime * 0.4);

    // Colors
    vec3 white = vec3(1.0, 0.98, 0.95);
    vec3 hotCore = mix(white, uColor1, 0.08);
    vec3 warmGlow = mix(uColor1, uColor2, 0.2);
    vec3 outerColor = mix(uColor1, uColor2, 0.5) * 0.5;
    vec3 atmosColor = uColor1 * 0.12;

    float i = uIntensity;
    vec3 col = vec3(0.0);
    float alpha = 0.0;

    // Primary line layers
    alpha += atmosphere * 0.05 * i;
    col += atmosColor * atmosphere * 0.05 * i;

    float og = outerGlow * 0.25 * brightVar * pulse * i;
    col += outerColor * og;
    alpha += og;

    float ig = innerGlow * 0.5 * brightVar * pulse * i;
    col += warmGlow * ig;
    alpha += ig;

    float cg = core * 0.9 * pulse * i;
    col += hotCore * cg;
    alpha += cg;
    col += white * core * 0.25 * pulse * i;

    // Second line
    vec3 hotCore2 = mix(white, uColor2, 0.12);
    vec3 warmGlow2 = mix(uColor2, uColor1, 0.25);
    col += hotCore2 * core2 * 0.55 * pulse * i;
    col += warmGlow2 * inner2 * 0.3 * brightVar * pulse * i;
    col += outerColor * outer2 * 0.12 * brightVar * i;
    alpha += core2 * 0.55 * i + inner2 * 0.25 * i + outer2 * 0.08 * i;

    // Third line (faint)
    col += mix(white, uColor1, 0.2) * core3 * 0.3 * i;
    col += warmGlow * inner3 * 0.12 * i;
    alpha += core3 * 0.25 * i + inner3 * 0.08 * i;

    alpha = clamp(alpha, 0.0, 1.0);
    col = clamp(col, 0.0, 1.5);

    gl_FragColor = vec4(col, alpha);
  }
`;

// Color presets
const COLOR_PRESETS = {
  cyan: {
    color1: [0.0, 0.72, 0.85] as const,
    color2: [0.22, 0.88, 1.0] as const,
  },
  gold: {
    color1: [0.92, 0.68, 0.2] as const,
    color2: [0.0, 0.72, 0.85] as const,
  },
  mixed: {
    color1: [0.0, 0.72, 0.85] as const,
    color2: [0.92, 0.68, 0.2] as const,
  },
};

const AuroraBackground = ({
  intensity = 0.6,
  speed = 1,
  fullPage = false,
  variant = "cyan",
  className = "",
}: AuroraBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    // Performance: cap pixel ratio at 1 for full-page, 1.5 for contained
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, fullPage ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const colors = COLOR_PRESETS[variant];

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uResolution: { value: new THREE.Vector2() },
        uColor1: { value: new THREE.Vector3(...colors.color1) },
        uColor2: { value: new THREE.Vector3(...colors.color2) },
      },
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      // Performance: render at reduced resolution for full-page
      const scale = fullPage ? 0.5 : 1;
      renderer.setSize(w * scale, h * scale, false);
      renderer.domElement.style.width = w + "px";
      renderer.domElement.style.height = h + "px";
      material.uniforms.uResolution.value.set(w * scale, h * scale);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Performance: throttle to ~30fps instead of 60fps
    let lastFrame = 0;
    const targetInterval = fullPage ? 33 : 16; // 30fps full-page, 60fps contained
    const clock = new THREE.Clock();

    const animate = (now: number) => {
      frameRef.current = requestAnimationFrame(animate);
      if (now - lastFrame < targetInterval) return;
      lastFrame = now;
      material.uniforms.uTime.value = clock.getElapsedTime() * speed;
      renderer.render(scene, camera);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      renderer.dispose();
      material.dispose();
      quad.geometry.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [intensity, speed, variant, fullPage]);

  return (
    <div
      ref={containerRef}
      className={`${fullPage ? "fixed inset-0" : "absolute inset-0"} z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default AuroraBackground;
