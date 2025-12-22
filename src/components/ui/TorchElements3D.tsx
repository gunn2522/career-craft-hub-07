import { useEffect, useState } from "react";

interface TorchShape {
  id: number;
  type: "flame" | "wing" | "spark" | "feather";
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  rotation: number;
  opacity: number;
}

const generateTorchShapes = (count: number): TorchShape[] => {
  const types: TorchShape["type"][] = ["flame", "wing", "spark", "feather"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    type: types[Math.floor(Math.random() * types.length)],
    size: Math.random() * 40 + 25,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 10,
    rotation: Math.random() * 360,
    opacity: Math.random() * 0.4 + 0.1,
  }));
};

const Flame = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute animate-float"
    style={{
      ...style,
      width: size,
      height: size * 1.4,
    }}
  >
    <svg viewBox="0 0 24 32" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id={`flame-grad-${size}`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(35, 100%, 55%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(45, 100%, 60%)" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 0 4 10 4 18C4 24 7.5 28 12 28C16.5 28 20 24 20 18C20 10 12 0 12 0Z"
        fill={`url(#flame-grad-${size})`}
        className="drop-shadow-lg"
      />
      <path
        d="M12 8C12 8 8 14 8 19C8 23 10 25 12 25C14 25 16 23 16 19C16 14 12 8 12 8Z"
        fill="hsl(45, 100%, 70%)"
        fillOpacity="0.5"
      />
    </svg>
  </div>
);

const Wing = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute animate-float"
    style={{
      ...style,
      width: size * 1.5,
      height: size,
    }}
  >
    <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id={`wing-grad-${size}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M24 16C24 16 8 8 2 4C2 4 6 14 10 18C14 22 20 24 24 24C28 24 34 22 38 18C42 14 46 4 46 4C40 8 24 16 24 16Z"
        fill={`url(#wing-grad-${size})`}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <path
        d="M24 16L8 10M24 16L14 8M24 16L20 6"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />
      <path
        d="M24 16L40 10M24 16L34 8M24 16L28 6"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />
    </svg>
  </div>
);

const Spark = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute animate-pulse"
    style={{
      ...style,
      width: size * 0.4,
      height: size * 0.4,
    }}
  >
    <div
      className="w-full h-full rounded-full"
      style={{
        background: `radial-gradient(circle, hsl(35, 100%, 60%) 0%, hsl(25, 95%, 50%) 40%, transparent 70%)`,
        boxShadow: `0 0 ${size / 2}px hsl(35, 100%, 55%), 0 0 ${size}px hsl(25, 95%, 50%)`,
      }}
    />
  </div>
);

const Feather = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute animate-float"
    style={{
      ...style,
      width: size * 0.6,
      height: size * 1.2,
    }}
  >
    <svg viewBox="0 0 12 24" fill="none" className="w-full h-full">
      <path
        d="M6 0C6 0 2 6 2 12C2 18 4 22 6 24C8 22 10 18 10 12C10 6 6 0 6 0Z"
        fill="hsl(var(--muted-foreground))"
        fillOpacity="0.2"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="0.3"
        strokeOpacity="0.3"
      />
      <path
        d="M6 4L6 20"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
    </svg>
  </div>
);

interface TorchElements3DProps {
  count?: number;
  className?: string;
}

export const TorchElements3D = ({ count = 12, className = "" }: TorchElements3DProps) => {
  const [shapes, setShapes] = useState<TorchShape[]>([]);

  useEffect(() => {
    setShapes(generateTorchShapes(count));
  }, [count]);

  const renderShape = (shape: TorchShape) => {
    const baseStyle: React.CSSProperties = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      opacity: shape.opacity,
      animationDelay: `${shape.delay}s`,
      animationDuration: `${shape.duration}s`,
      transform: `rotate(${shape.rotation}deg)`,
    };

    switch (shape.type) {
      case "flame":
        return <Flame key={shape.id} size={shape.size} style={baseStyle} />;
      case "wing":
        return <Wing key={shape.id} size={shape.size} style={baseStyle} />;
      case "spark":
        return <Spark key={shape.id} size={shape.size} style={baseStyle} />;
      case "feather":
        return <Feather key={shape.id} size={shape.size} style={baseStyle} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {shapes.map(renderShape)}
    </div>
  );
};
