import wolfstoneMark from "@/assets/wolfstone-mark.png";

interface LogoTextureProps {
  className?: string;
  opacity?: number;
  density?: "sparse" | "normal" | "dense";
  /** Use "dark" on light backgrounds so the marks render as dark silhouettes */
  variant?: "light" | "dark";
}

const LogoTexture = ({ className = "", opacity = 0.025, density = "normal", variant = "light" }: LogoTextureProps) => {
  const size = density === "dense" ? 80 : density === "sparse" ? 160 : 120;
  const gap = density === "dense" ? 40 : density === "sparse" ? 80 : 60;

  // Build a grid of logo marks
  const cols = 8;
  const rows = 6;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gridTemplateRows: `repeat(${rows}, ${size}px)`,
          gap: `${gap}px`,
          justifyContent: "center",
          alignContent: "center",
          transform: "rotate(-12deg) scale(1.4)",
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <img
            key={i}
            src={wolfstoneMark}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={`w-full h-full object-contain ${variant === "dark" ? "brightness-0" : ""}`}
            style={{ opacity: i % 3 === 0 ? 0.6 : i % 2 === 0 ? 0.3 : 0.45 }}
          />
        ))}
      </div>
    </div>
  );
};

export default LogoTexture;
