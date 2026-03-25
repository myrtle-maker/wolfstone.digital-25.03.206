import wolfstoneMark from "@/assets/wolfstone-mark.png";

interface WatermarkTextureProps {
  className?: string;
  opacity?: number;
  position?: "left" | "right" | "center";
}

const WatermarkTexture = ({ className = "", opacity = 0.03, position = "right" }: WatermarkTextureProps) => {
  const positionClasses = {
    left: "left-0 -translate-x-1/3",
    right: "right-0 translate-x-1/3",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none select-none ${positionClasses[position]} ${className}`}
      style={{ opacity }}
    >
      <img src={wolfstoneMark} alt="" className="w-full h-full object-contain" aria-hidden="true" />
    </div>
  );
};

export default WatermarkTexture;
