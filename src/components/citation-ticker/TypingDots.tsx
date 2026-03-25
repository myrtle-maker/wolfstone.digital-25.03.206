const TypingDots = () => {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="AI is thinking">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
          style={{
            backgroundColor: "hsl(var(--wd-white) / 0.42)",
            animationDelay: `${dot * 120}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default TypingDots;