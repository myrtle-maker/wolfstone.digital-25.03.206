import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import londonAsset from "@/assets/homepage/london-video.mp4.asset.json";
import newyorkAsset from "@/assets/homepage/newyork-video.mp4.asset.json";
import dubaiAsset from "@/assets/homepage/dubai-video.mp4.asset.json";

const cities = [
  { name: "London", video: londonAsset.url },
  { name: "New York", video: newyorkAsset.url },
  { name: "Dubai", video: dubaiAsset.url },
];

const AnimatedGlobalBanner = () => {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % cities.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 8000);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <section className="relative h-[80vh] min-h-[520px] max-h-[750px] overflow-hidden bg-[hsl(var(--wd-navy))]">
      {/* Video backgrounds with crossfade + Ken Burns */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          <video
            src={cities[current].video}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover animate-ken-burns"
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-[hsl(var(--wd-navy))]/60" />
        </motion.div>
      </AnimatePresence>

      {/* Top/bottom gradient bleed into adjacent sections */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[hsl(var(--wd-navy))] to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(var(--wd-navy))] to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6">
        <motion.span
          className="text-overline text-primary mb-5 block"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          UK-based. Globally connected.
        </motion.span>

        {/* Animated city name */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={cities[current].name}
            className="text-display text-white mb-4"
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {cities[current].name}
          </motion.h2>
        </AnimatePresence>

        <motion.p
          className="text-body-lg text-white/70 max-w-[50ch]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Operating across the world's most competitive financial markets.
        </motion.p>

        {/* City indicator dots */}
        <div className="flex gap-3 mt-10">
          {cities.map((city, i) => (
            <button
              key={city.name}
              onClick={() => setCurrent(i)}
              className="group flex items-center gap-2"
              aria-label={`Show ${city.name}`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-8 bg-primary"
                    : "w-3 bg-white/30 group-hover:bg-white/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedGlobalBanner;
