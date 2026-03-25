import { useState, useEffect, useCallback, useRef } from "react";

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const raf = useRef<number>();
  const isTouch = useRef(false);

  useEffect(() => {
    // Detect touch device
    if (typeof window === "undefined") return;
    isTouch.current = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch.current) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX - 3}px`;
        dotRef.current.style.top = `${e.clientY - 3}px`;
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovering(!!el.closest("a, button, [role='button'], input, textarea, select, label"));
    };

    const onLeave = () => {
      setVisible(false);
    };

    const tick = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        const s = hovering ? 44 : 24;
        ringRef.current.style.left = `${ringPos.current.x - s / 2}px`;
        ringRef.current.style.top = `${ringPos.current.y - s / 2}px`;
        ringRef.current.style.width = `${s}px`;
        ringRef.current.style.height = `${s}px`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [visible, hovering]);

  // Don't render on touch / SSR
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "hsl(190, 100%, 45%)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1.5px solid hsl(190, 100%, 45%)",
          backgroundColor: hovering ? "hsla(190, 100%, 45%, 0.06)" : "transparent",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: visible ? 0.6 : 0,
          transition: "width 0.2s ease-out, height 0.2s ease-out, opacity 0.2s, background-color 0.2s",
        }}
      />
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>
    </>
  );
};

export default CustomCursor;
