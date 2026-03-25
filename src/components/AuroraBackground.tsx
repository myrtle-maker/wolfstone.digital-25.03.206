import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AuroraBackgroundProps {
  /** Overall brightness 0-1 */
  intensity?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Color preset */
  variant?: "cyan" | "gold" | "mixed";
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

// GLSL fragment shader — luminous eclipse ring with corona glow
const fragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  varying vec2 vUv;

  // Simplex noise for organic distortion
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = vUv;

    // Center point — ring is positioned well below viewport so only the top arc crowns the hero
    vec2 center = vec2(0.5, -0.55);
    vec2 p = (uv - center) * vec2(aspect, 1.0);

    float dist = length(p);
    float angle = atan(p.y, p.x);

    float t = uTime * 0.12;

    // Ring parameters
    float ringRadius = 1.1;
    float ringDelta = abs(dist - ringRadius);

    // Noise distortion along the ring for organic feel
    float noiseScale = 0.3;
    float n1 = snoise(vec3(p * 2.0, t * 0.5)) * noiseScale;
    float n2 = snoise(vec3(p * 3.5 + 10.0, t * 0.3)) * noiseScale * 0.5;
    float distortedDelta = abs(dist + n1 + n2 - ringRadius);

    // === CORE RING — tight, bright, white-hot ===
    float coreWidth = 0.015;
    float core = exp(-distortedDelta * distortedDelta / (coreWidth * coreWidth));

    // === INNER GLOW — warm, medium spread ===
    float innerWidth = 0.06;
    float innerGlow = exp(-distortedDelta * distortedDelta / (innerWidth * innerWidth));

    // === OUTER GLOW — wide, diffuse halo ===
    float outerWidth = 0.22;
    float outerGlow = exp(-distortedDelta * distortedDelta / (outerWidth * outerWidth));

    // === ATMOSPHERE — very wide, faint ambient ===
    float atmosWidth = 0.55;
    float atmosphere = exp(-ringDelta * ringDelta / (atmosWidth * atmosWidth));

    // Angular variation — makes the ring brighter at the top, fading at sides
    float angleFade = smoothstep(-0.3, 0.8, sin(angle));
    // Additional subtle variation
    float angleNoise = snoise(vec3(angle * 2.0, dist * 3.0, t * 0.4)) * 0.15 + 0.85;

    // Pulsing animation
    float pulse = 1.0 + 0.08 * sin(uTime * 0.5) + 0.05 * sin(uTime * 0.8 + 1.5);

    // Color composition
    vec3 white = vec3(1.0, 0.98, 0.95);
    vec3 hotCore = mix(white, uColor1, 0.15);
    vec3 warmGlow = mix(uColor1, uColor2, 0.3);
    vec3 outerColor = mix(uColor2, uColor1, 0.5) * 0.7;
    vec3 atmosColor = uColor1 * 0.25;

    // Layer composition
    vec3 col = vec3(0.0);
    float alpha = 0.0;

    // Atmosphere layer (widest, faintest)
    float atmosAlpha = atmosphere * 0.12 * angleFade * uIntensity;
    col += atmosColor * atmosAlpha;
    alpha += atmosAlpha;

    // Outer glow layer
    float outerAlpha = outerGlow * 0.4 * angleFade * angleNoise * pulse * uIntensity;
    col += outerColor * outerAlpha;
    alpha += outerAlpha;

    // Inner glow layer
    float innerAlpha = innerGlow * 0.7 * angleFade * angleNoise * pulse * uIntensity;
    col += warmGlow * innerAlpha;
    alpha += innerAlpha;

    // Core ring (brightest)
    float coreAlpha = core * 1.0 * angleFade * pulse * uIntensity;
    col += hotCore * coreAlpha;
    alpha += coreAlpha;

    // Bloom — bright spots get extra brightness
    float bloom = core * 0.5 * angleFade * pulse * uIntensity;
    col += white * bloom;
    alpha += bloom * 0.3;

    // Scattered light particles near the ring
    float sparkle1 = snoise(vec3(p * 15.0, t * 2.0));
    float sparkle2 = snoise(vec3(p * 20.0 + 50.0, t * 1.5 + 10.0));
    float sparkleMask = innerGlow * 0.3;
    float sparkles = max(sparkle1, 0.0) * max(sparkle2, 0.0) * sparkleMask * angleFade;
    col += uColor1 * sparkles * 2.0 * uIntensity;
    alpha += sparkles * 0.5 * uIntensity;

    // Clamp
    alpha = clamp(alpha, 0.0, 1.0);
    col = clamp(col, 0.0, 1.5);

    gl_FragColor = vec4(col, alpha);
  }
`;

// Color presets (RGB 0-1 range)
const COLOR_PRESETS = {
  cyan: {
    color1: [0.0, 0.72, 0.85] as const,    // --wd-cyan
    color2: [0.22, 0.88, 1.0] as const,     // --wd-cyan-bright
  },
  gold: {
    color1: [0.92, 0.68, 0.2] as const,     // warm gold
    color2: [0.0, 0.72, 0.85] as const,     // --wd-cyan accent
  },
  mixed: {
    color1: [0.0, 0.72, 0.85] as const,     // --wd-cyan
    color2: [0.92, 0.68, 0.2] as const,     // warm gold
  },
};

const AuroraBackground = ({
  intensity = 0.6,
  speed = 1,
  variant = "cyan",
  className = "",
}: AuroraBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const colors = COLOR_PRESETS[variant];

    // Shader material
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

    // Resize handling
    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      material.uniforms.uTime.value = clock.getElapsedTime() * speed;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
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
  }, [intensity, speed, variant]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default AuroraBackground;
