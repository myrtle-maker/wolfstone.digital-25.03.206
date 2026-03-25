import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const platforms = [
  { name: "ChatGPT", icon: "🟢", color: "text-emerald-400", ring: "border-emerald-400" },
  { name: "Gemini", icon: "🔵", color: "text-sky-400", ring: "border-sky-400" },
  { name: "Perplexity", icon: "🟣", color: "text-violet-400", ring: "border-violet-400" },
  { name: "Copilot", icon: "🔷", color: "text-blue-400", ring: "border-blue-400" },
  { name: "Claude", icon: "🟠", color: "text-amber-400", ring: "border-amber-400" },
];

interface LLMScanAnimationProps {
  brandName: string;
  onComplete?: () => void;
  isScanning: boolean;
}

const LLMScanAnimation = ({ brandName, isScanning }: LLMScanAnimationProps) => {
  const [resolved, setResolved] = useState<Record<number, "found" | "not_found">>({});
  const [currentScan, setCurrentScan] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setResolved({});
      setCurrentScan(0);
      return;
    }

    // Stagger resolve each platform 1-3s apart
    const timers: NodeJS.Timeout[] = [];
    platforms.forEach((_, i) => {
      const delay = 1200 + i * 1800 + Math.random() * 800;
      timers.push(
        setTimeout(() => {
          setCurrentScan(i + 1);
          // Don't set resolved — let actual results handle that
        }, delay)
      );
    });

    // Cycle the active scanner indicator
    const interval = setInterval(() => {
      setCurrentScan((prev) => (prev + 1) % platforms.length);
    }, 600);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.p
        className="text-h2 text-white text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Scanning AI platforms for{" "}
        <span className="text-primary">{brandName}</span>
      </motion.p>

      <div className="flex items-center gap-6 md:gap-10">
        {platforms.map((p, i) => {
          const isActive = currentScan === i;
          const isResolved = i in resolved;

          return (
            <motion.div
              key={p.name}
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative">
                {/* Pulsing ring */}
                {isActive && !isResolved && (
                  <>
                    <motion.div
                      className={`absolute inset-[-6px] rounded-full border-2 ${p.ring} opacity-40`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className={`absolute inset-[-3px] rounded-full border ${p.ring} opacity-60`}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                    />
                  </>
                )}

                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-300 ${
                    isResolved
                      ? resolved[i] === "found"
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-red-400 bg-red-400/10"
                      : isActive
                        ? `${p.ring} bg-white/5`
                        : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  {isResolved ? (
                    resolved[i] === "found" ? "✅" : "❌"
                  ) : (
                    <span className={isActive ? "" : "opacity-40"}>{p.icon}</span>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-bold tracking-wide transition-colors duration-300 ${
                  isActive ? p.color : "text-white/40"
                }`}
              >
                {p.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-body-sm text-white/50 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        This typically takes 10–15 seconds
      </motion.p>
    </div>
  );
};

export default LLMScanAnimation;
