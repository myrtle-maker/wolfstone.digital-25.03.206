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

// Brand colors
const COLORS = {
  cyan: new THREE.Color(0x00b8d9),
  cyanBright: new THREE.Color(0x38e8ff),
  gold: new THREE.Color(0xd4991a),
  navy: new THREE.Color(0x0a0f1a),
};

const NODE_COUNT = 80;
const CONNECTION_DISTANCE = 0.15;
const MAX_CONNECTIONS = 300;

const AuroraBackground = ({
  intensity = 0.6,
  speed = 1,
  fullPage = false,
  variant = "cyan",
  className = "",
}: AuroraBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 1.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // === NODE DATA ===
    const positions = new Float32Array(NODE_COUNT * 3);
    const velocities = new Float32Array(NODE_COUNT * 3);
    const nodeColors = new Float32Array(NODE_COUNT * 3);
    const nodeSizes = new Float32Array(NODE_COUNT);

    const primaryColor = variant === "gold" ? COLORS.gold : COLORS.cyan;
    const secondaryColor = variant === "gold" ? COLORS.cyan : COLORS.gold;
    const accentColor = COLORS.cyanBright;

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      // Spread nodes across visible area
      positions[i3] = (Math.random() - 0.5) * 2.2;
      positions[i3 + 1] = (Math.random() - 0.5) * 1.6;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Slow drift velocities
      velocities[i3] = (Math.random() - 0.5) * 0.008;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.006;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;

      // Color: mostly primary, some secondary accent, rare bright
      const roll = Math.random();
      let color: THREE.Color;
      if (roll < 0.65) {
        color = primaryColor.clone().lerp(accentColor, Math.random() * 0.3);
      } else if (roll < 0.85) {
        color = secondaryColor.clone();
      } else {
        color = new THREE.Color(1, 1, 1); // Bright white nodes
      }
      nodeColors[i3] = color.r;
      nodeColors[i3 + 1] = color.g;
      nodeColors[i3 + 2] = color.b;

      // Varied sizes — small and subtle
      nodeSizes[i] = 1.0 + Math.random() * 2.0;
    }

    // === NODES (Points) ===
    const nodeGeom = new THREE.BufferGeometry();
    nodeGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeom.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    nodeGeom.setAttribute("size", new THREE.BufferAttribute(nodeSizes, 1));

    // Custom shader for soft circular glowing points
    const nodeMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uIntensity;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uIntensity * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uIntensity;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          // Soft glow falloff — subtle
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          glow = pow(glow, 2.5);
          // Small bright core
          float core = 1.0 - smoothstep(0.0, 0.1, d);
          vec3 col = mix(vColor, vec3(1.0), core * 0.4);
          float alpha = glow * uIntensity * 0.55;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      uniforms: {
        uIntensity: { value: intensity },
      },
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const nodes = new THREE.Points(nodeGeom, nodeMaterial);
    scene.add(nodes);

    // === CONNECTIONS (Lines) ===
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6); // 2 vertices * 3 coords
    const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeom.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    lineGeom.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: intensity * 0.25,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });

    const lines = new THREE.LineSegments(lineGeom, lineMaterial);
    scene.add(lines);

    // Resize
    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.016 * speed;

      const pos = nodeGeom.attributes.position.array as Float32Array;

      // Update node positions with drift
      for (let i = 0; i < NODE_COUNT; i++) {
        const i3 = i * 3;
        pos[i3] += velocities[i3] * speed;
        pos[i3 + 1] += velocities[i3 + 1] * speed;
        pos[i3 + 2] += velocities[i3 + 2] * speed;

        // Gentle sine wave overlay for organic motion
        pos[i3] += Math.sin(time * 0.3 + i * 0.7) * 0.0002 * speed;
        pos[i3 + 1] += Math.cos(time * 0.2 + i * 0.5) * 0.00015 * speed;

        // Boundary wrap
        if (pos[i3] > 1.3) pos[i3] = -1.3;
        if (pos[i3] < -1.3) pos[i3] = 1.3;
        if (pos[i3 + 1] > 1.0) pos[i3 + 1] = -1.0;
        if (pos[i3 + 1] < -1.0) pos[i3 + 1] = 1.0;
        if (pos[i3 + 2] > 0.3) pos[i3 + 2] = -0.3;
        if (pos[i3 + 2] < -0.3) pos[i3 + 2] = 0.3;
      }
      nodeGeom.attributes.position.needsUpdate = true;

      // Update connections
      let lineCount = 0;
      const lp = lineGeom.attributes.position.array as Float32Array;
      const lc = lineGeom.attributes.color.array as Float32Array;

      for (let i = 0; i < NODE_COUNT && lineCount < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < NODE_COUNT && lineCount < MAX_CONNECTIONS; j++) {
          const i3 = i * 3;
          const j3 = j * 3;
          const dx = pos[i3] - pos[j3];
          const dy = pos[i3 + 1] - pos[j3 + 1];
          const dz = pos[i3 + 2] - pos[j3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < CONNECTION_DISTANCE) {
            const idx = lineCount * 6;
            // Vertex A
            lp[idx] = pos[i3];
            lp[idx + 1] = pos[i3 + 1];
            lp[idx + 2] = pos[i3 + 2];
            // Vertex B
            lp[idx + 3] = pos[j3];
            lp[idx + 4] = pos[j3 + 1];
            lp[idx + 5] = pos[j3 + 2];

            // Color fades with distance
            const fade = 1.0 - dist / CONNECTION_DISTANCE;
            const r = primaryColor.r * fade;
            const g = primaryColor.g * fade;
            const b = primaryColor.b * fade;
            lc[idx] = r; lc[idx + 1] = g; lc[idx + 2] = b;
            lc[idx + 3] = r; lc[idx + 4] = g; lc[idx + 5] = b;

            lineCount++;
          }
        }
      }

      lineGeom.setDrawRange(0, lineCount * 2);
      lineGeom.attributes.position.needsUpdate = true;
      lineGeom.attributes.color.needsUpdate = true;

      // Slow camera orbit for depth feel
      camera.position.x = Math.sin(time * 0.05) * 0.08;
      camera.position.y = Math.cos(time * 0.04) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      renderer.dispose();
      nodeMaterial.dispose();
      lineMaterial.dispose();
      nodeGeom.dispose();
      lineGeom.dispose();
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
