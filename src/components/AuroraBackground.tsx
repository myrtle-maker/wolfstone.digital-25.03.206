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

// GLSL fragment shader — flowing mesh gradient with noise
const fragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  varying vec2 vUv;

  // Simplex-style noise
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
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = uTime * 0.15;

    // Layered noise for organic flow
    float n1 = snoise(vec3(p * 1.5, t * 0.8)) * 0.5 + 0.5;
    float n2 = snoise(vec3(p * 2.5 + 3.0, t * 0.6 + 10.0)) * 0.5 + 0.5;
    float n3 = snoise(vec3(p * 0.8 - 5.0, t * 0.4 + 20.0)) * 0.5 + 0.5;

    // Flow distortion
    vec2 flow = vec2(
      snoise(vec3(p * 1.2, t * 0.5)),
      snoise(vec3(p * 1.2 + 100.0, t * 0.5))
    ) * 0.3;

    float n4 = snoise(vec3((p + flow) * 2.0, t * 0.7)) * 0.5 + 0.5;

    // Color mixing — three brand colors blended by noise
    vec3 col = mix(uColor1, uColor2, smoothstep(0.3, 0.7, n1));
    col = mix(col, uColor3, smoothstep(0.4, 0.8, n2) * 0.6);

    // Luminance variation — creates the "glow blob" feel
    float lum = n3 * 0.4 + n4 * 0.6;
    lum = smoothstep(0.2, 0.9, lum);

    // Vignette — darker at edges
    float vig = 1.0 - smoothstep(0.2, 0.85, length(p));

    // Final composition
    float alpha = lum * vig * uIntensity;

    // Subtle bloom on bright areas
    float bloom = smoothstep(0.5, 1.0, lum) * 0.15 * uIntensity;
    col += bloom;

    gl_FragColor = vec4(col, alpha);
  }
`;

// Color presets (RGB 0-1 range)
const COLOR_PRESETS = {
  cyan: {
    color1: [0.0, 0.72, 0.85],   // --wd-cyan
    color2: [0.22, 0.88, 1.0],    // --wd-cyan-bright
    color3: [0.05, 0.12, 0.35],   // deep navy accent
  },
  gold: {
    color1: [0.85, 0.6, 0.15],    // --wd-gold
    color2: [0.0, 0.72, 0.85],    // --wd-cyan
    color3: [0.15, 0.08, 0.02],   // deep warm accent
  },
  mixed: {
    color1: [0.0, 0.72, 0.85],    // --wd-cyan
    color2: [0.85, 0.6, 0.15],    // --wd-gold
    color3: [0.1, 0.15, 0.4],     // midnight blue accent
  },
} as const;

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
        uColor3: { value: new THREE.Vector3(...colors.color3) },
      },
      transparent: true,
      depthTest: false,
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
      className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default AuroraBackground;
