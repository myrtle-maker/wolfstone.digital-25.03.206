import { useEffect, useRef } from "react";

interface AuroraBackgroundProps {
  /** Primary glow color in HSL format, e.g. "190,100%,45%" */
  primaryColor?: string;
  /** Secondary glow color in HSL format */
  secondaryColor?: string;
  /** Overall intensity 0-1 */
  intensity?: number;
  /** Show the arc/corona ring effect */
  showArc?: boolean;
  className?: string;
}

const AuroraBackground = ({
  primaryColor = "190,100%,45%",
  secondaryColor = "38,70%,50%",
  intensity = 1,
  showArc = true,
  className = "",
}: AuroraBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = parent.offsetWidth;
      height = parent.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const t = time * 0.001;

      if (showArc) {
        // Main corona arc — large elliptical ring
        const cx = width * 0.5;
        const cy = height * 0.35;
        const rx = width * 0.38;
        const ry = height * 0.32;

        // Outer diffuse glow
        const outerGlow = ctx.createRadialGradient(cx, cy, rx * 0.6, cx, cy, rx * 1.4);
        outerGlow.addColorStop(0, `hsla(${primaryColor},${0.0 * intensity})`);
        outerGlow.addColorStop(0.5, `hsla(${primaryColor},${0.04 * intensity})`);
        outerGlow.addColorStop(0.75, `hsla(${primaryColor},${0.02 * intensity})`);
        outerGlow.addColorStop(1, `hsla(${primaryColor},0)`);
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, width, height);

        // Arc ring with animated rotation
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(t * 0.15) * 0.05);

        // Draw the arc as a series of points with glow
        const segments = 120;
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const wobble = Math.sin(angle * 3 + t * 0.5) * 4 + Math.sin(angle * 7 + t * 0.3) * 2;
          const px = Math.cos(angle) * (rx + wobble);
          const py = Math.sin(angle) * (ry + wobble);

          // Vary brightness around the arc — brighter at top
          const topBias = Math.max(0, -Math.sin(angle));
          const sideBias = Math.abs(Math.cos(angle));
          const brightness = (topBias * 0.7 + sideBias * 0.3 + 0.15) * intensity;

          // Pulsing intensity
          const pulse = 0.85 + Math.sin(t * 0.8 + angle * 2) * 0.15;

          // Core bright line
          const coreSize = 2 + topBias * 1.5;
          const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, coreSize * 8);
          coreGrad.addColorStop(0, `hsla(${primaryColor},${brightness * pulse * 0.5})`);
          coreGrad.addColorStop(0.3, `hsla(${primaryColor},${brightness * pulse * 0.15})`);
          coreGrad.addColorStop(1, `hsla(${primaryColor},0)`);

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(px, py, coreSize * 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Secondary warm glow at bottom — gold accent
        const warmCx = cx + Math.sin(t * 0.2) * 30;
        const warmCy = height * 0.7;
        const warmGlow = ctx.createRadialGradient(warmCx, warmCy, 0, warmCx, warmCy, height * 0.4);
        warmGlow.addColorStop(0, `hsla(${secondaryColor},${0.03 * intensity})`);
        warmGlow.addColorStop(0.5, `hsla(${secondaryColor},${0.015 * intensity})`);
        warmGlow.addColorStop(1, `hsla(${secondaryColor},0)`);
        ctx.fillStyle = warmGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // Floating ambient orbs
      const orbs = [
        { x: 0.2, y: 0.3, r: 0.15, color: primaryColor, speed: 0.12, phase: 0 },
        { x: 0.8, y: 0.6, r: 0.12, color: secondaryColor, speed: 0.1, phase: 2 },
        { x: 0.5, y: 0.8, r: 0.18, color: primaryColor, speed: 0.08, phase: 4 },
      ];

      for (const orb of orbs) {
        const ox = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.05) * width;
        const oy = (orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.03) * height;
        const or = orb.r * Math.min(width, height);

        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
        orbGrad.addColorStop(0, `hsla(${orb.color},${0.04 * intensity})`);
        orbGrad.addColorStop(0.5, `hsla(${orb.color},${0.015 * intensity})`);
        orbGrad.addColorStop(1, `hsla(${orb.color},0)`);
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, width, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      observer.disconnect();
    };
  }, [primaryColor, secondaryColor, intensity, showArc]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default AuroraBackground;
