import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

interface AuroraBackgroundProps {
  /** Overall brightness 0-1 */
  intensity?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Fixed fullscreen or contained within parent */
  fullPage?: boolean;
  className?: string;
}

// Node types for the citation flow network
interface NetworkNode {
  type: "source" | "ai" | "relay";
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  breatheSpeed: number;
  name?: string;
  discoveryTimer: number;
}

interface CitationPulse {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
  size: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

interface DiscoveryRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const AI_NAMES = ["ChatGPT", "Gemini", "Perplexity", "Copilot", "Claude"];

const NODE_BASE_RADIUS = {
  source: 4.5,
  ai: 6,
  relay: 2.5,
};

function createNode(
  type: NetworkNode["type"],
  x: number,
  y: number,
  name?: string
): NetworkNode {
  return {
    type,
    x,
    y,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    r: NODE_BASE_RADIUS[type] + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    breatheSpeed: 0.008 + Math.random() * 0.006,
    name,
    discoveryTimer: Math.random() * 600,
  };
}

const AuroraBackground = ({
  intensity = 0.6,
  speed = 1,
  fullPage = false,
  className = "",
}: AuroraBackgroundProps) => {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const nodesRef = useRef<NetworkNode[]>([]);
  const pulsesRef = useRef<CitationPulse[]>([]);
  const ripplesRef = useRef<DiscoveryRipple[]>([]);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio, fullPage ? 1 : 1.5);

    function resize() {
      W = container!.offsetWidth;
      H = container!.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    }

    function initNodes() {
      const nodes: NetworkNode[] = [];
      const area = W * H;
      const sourceCount = Math.min(Math.floor(area / 80000), 8) + 3;
      const relayCount = Math.min(Math.floor(area / 25000), 25) + 8;

      // Source nodes — cluster left/center
      for (let i = 0; i < sourceCount; i++) {
        nodes.push(
          createNode(
            "source",
            W * (0.1 + Math.random() * 0.5),
            H * (0.15 + Math.random() * 0.7)
          )
        );
      }

      // AI platform nodes — spread across right side
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 0.8 + Math.PI * 0.1;
        nodes.push(
          createNode(
            "ai",
            W * (0.55 + Math.cos(angle) * 0.3),
            H * (0.5 + Math.sin(angle - Math.PI * 0.5) * 0.35),
            AI_NAMES[i]
          )
        );
      }

      // Relay nodes — scattered
      for (let i = 0; i < relayCount; i++) {
        nodes.push(
          createNode("relay", Math.random() * W, Math.random() * H)
        );
      }

      nodesRef.current = nodes;
      pulsesRef.current = [];
      ripplesRef.current = [];
    }

    function spawnPulse(from: NetworkNode, to: NetworkNode) {
      pulsesRef.current.push({
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        progress: 0,
        speed: 0.008 + Math.random() * 0.006,
        size: 2 + Math.random() * 2,
        trail: [],
      });
    }

    function spawnRipple(node: NetworkNode) {
      ripplesRef.current.push({
        x: node.x,
        y: node.y,
        radius: node.r,
        maxRadius: 60 + Math.random() * 40,
        alpha: 0.35,
      });
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let lastFrame = 0;
    const targetInterval = fullPage ? 33 : 16;

    const animate = (now: number) => {
      frameRef.current = requestAnimationFrame(animate);
      if (now - lastFrame < targetInterval) return;
      lastFrame = now;
      frameCountRef.current++;

      const fc = frameCountRef.current;
      const nodes = nodesRef.current;
      const pulses = pulsesRef.current;
      const ripples = ripplesRef.current;

      ctx!.clearRect(0, 0, W, H);

      const dark = isDark;
      const cyanRGB = dark ? "0, 210, 245" : "0, 140, 165";
      const navyRGB = dark ? "140, 170, 200" : "20, 40, 65";
      const pulseRGB = dark ? "0, 230, 255" : "0, 184, 217";
      const labelColor = dark
        ? `rgba(0, 210, 245, 0.5)`
        : `rgba(0, 140, 160, 0.45)`;

      const intensityMul = intensity;
      const speedMul = speed;

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx * speedMul;
        n.y += n.vy * speedMul;
        n.phase += n.breatheSpeed * speedMul;

        if (n.x < 20 || n.x > W - 20) n.vx *= -1;
        if (n.y < 20 || n.y > H - 20) n.vy *= -1;
        n.x = Math.max(10, Math.min(W - 10, n.x));
        n.y = Math.max(10, Math.min(H - 10, n.y));

        // Source nodes emit discovery events
        if (n.type === "source") {
          n.discoveryTimer -= speedMul;
          if (n.discoveryTimer <= 0) {
            n.discoveryTimer = 400 + Math.random() * 800;
            spawnRipple(n);
            let closest: NetworkNode | null = null;
            let closestDist = 300;
            for (const other of nodes) {
              if (other === n) continue;
              if (other.type === "relay" || other.type === "ai") {
                const d = Math.hypot(n.x - other.x, n.y - other.y);
                if (d < closestDist) {
                  closestDist = d;
                  closest = other;
                }
              }
            }
            if (closest) spawnPulse(n, closest);
          }
        }
      }

      // Compute edges
      const maxDist = 220;
      const edges: Array<{
        i: number;
        j: number;
        dist: number;
        strength: number;
      }> = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            let strength = 1 - dist / maxDist;
            if (
              (nodes[i].type === "source" && nodes[j].type === "ai") ||
              (nodes[i].type === "ai" && nodes[j].type === "source")
            ) {
              strength *= 1.8;
            }
            edges.push({ i, j, dist, strength: Math.min(strength, 1) });
          }
        }
      }

      // Draw edges
      for (const e of edges) {
        const a = nodes[e.i],
          b = nodes[e.j];
        const isImportant =
          (a.type === "source" && b.type === "ai") ||
          (a.type === "ai" && b.type === "source");
        const rgb = isImportant ? cyanRGB : navyRGB;
        const alpha = e.strength * (dark ? 0.12 : 0.22) * intensityMul;

        ctx!.strokeStyle = `rgba(${rgb}, ${alpha})`;
        ctx!.lineWidth = isImportant ? (dark ? 1 : 1.5) : (dark ? 0.5 : 0.8);

        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const offset = e.dist * 0.08;
        const cx = mx + Math.sin(fc * 0.003 + e.i) * offset;
        const cy = my + Math.cos(fc * 0.003 + e.j) * offset;

        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx!.stroke();
      }

      // Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.8 * speedMul;
        r.alpha -= 0.003 * speedMul;
        if (r.alpha <= 0 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx!.strokeStyle = `rgba(${cyanRGB}, ${r.alpha * intensityMul})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Draw pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed * speedMul;
        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const t = p.progress;
        const x = p.fromX + (p.toX - p.fromX) * t;
        const y = p.fromY + (p.toY - p.fromY) * t;

        p.trail.push({ x, y, alpha: 0.6 });
        if (p.trail.length > 12) p.trail.shift();

        for (let j = 0; j < p.trail.length; j++) {
          const tr = p.trail[j];
          tr.alpha *= 0.88;
          ctx!.fillStyle = `rgba(${pulseRGB}, ${tr.alpha * 0.4 * intensityMul})`;
          ctx!.beginPath();
          ctx!.arc(
            tr.x,
            tr.y,
            p.size * 0.5 * (j / p.trail.length),
            0,
            Math.PI * 2
          );
          ctx!.fill();
        }

        const glow = ctx!.createRadialGradient(x, y, 0, x, y, p.size * 3);
        glow.addColorStop(0, `rgba(${pulseRGB}, ${0.5 * intensityMul})`);
        glow.addColorStop(0.5, `rgba(${pulseRGB}, ${0.15 * intensityMul})`);
        glow.addColorStop(1, `rgba(${pulseRGB}, 0)`);
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(x, y, p.size * 3, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(${pulseRGB}, ${0.8 * intensityMul})`;
        ctx!.beginPath();
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Draw nodes
      for (const n of nodes) {
        const breathe = 1 + Math.sin(n.phase) * 0.15;
        const r = n.r * breathe;

        if (n.type === "ai") {
          // Halo ring
          ctx!.strokeStyle = `rgba(${cyanRGB}, ${(dark ? 0.1 : 0.18) * intensityMul})`;
          ctx!.lineWidth = dark ? 1 : 1.5;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
          ctx!.stroke();

          // Inner glow
          const g = ctx!.createRadialGradient(
            n.x,
            n.y,
            0,
            n.x,
            n.y,
            r * 1.8
          );
          g.addColorStop(
            0,
            `rgba(${cyanRGB}, ${(dark ? 0.25 : 0.35) * intensityMul})`
          );
          g.addColorStop(1, `rgba(${cyanRGB}, 0)`);
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 1.8, 0, Math.PI * 2);
          ctx!.fill();

          // Core
          ctx!.fillStyle = `rgba(${cyanRGB}, ${(dark ? 0.4 : 0.5) * intensityMul})`;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx!.fill();

          // Label
          if (n.name) {
            ctx!.fillStyle = labelColor;
            ctx!.font = "500 10px DM Sans, sans-serif";
            ctx!.textAlign = "center";
            ctx!.fillText(n.name, n.x, n.y + r * 2.5 + 14);
          }
        } else if (n.type === "source") {
          // Glow
          const g = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2);
          g.addColorStop(
            0,
            `rgba(${cyanRGB}, ${(dark ? 0.2 : 0.3) * intensityMul})`
          );
          g.addColorStop(1, `rgba(${cyanRGB}, 0)`);
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
          ctx!.fill();

          // Core
          ctx!.fillStyle = `rgba(${cyanRGB}, ${(dark ? 0.3 : 0.4) * intensityMul})`;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          // Relay — small, subtle
          ctx!.fillStyle = `rgba(${navyRGB}, ${(dark ? 0.15 : 0.22) * intensityMul})`;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // Periodic random pulses between nearby nodes
      if (fc % 90 === 0) {
        const sources = nodes.filter(
          (n) => n.type === "source" || n.type === "relay"
        );
        const targets = nodes.filter(
          (n) => n.type === "ai" || n.type === "relay"
        );
        if (sources.length && targets.length) {
          const from = sources[Math.floor(Math.random() * sources.length)];
          const to = targets[Math.floor(Math.random() * targets.length)];
          if (
            from !== to &&
            Math.hypot(from.x - to.x, from.y - to.y) < 280
          ) {
            spawnPulse(from, to);
          }
        }
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [intensity, speed, fullPage, isDark]);

  return (
    <div
      className={`${fullPage ? "fixed inset-0" : "absolute inset-0"} z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
};

export default AuroraBackground;
