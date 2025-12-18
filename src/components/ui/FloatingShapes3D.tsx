import { useEffect, useState } from "react";

interface Shape {
  id: number;
  type: "cube" | "pyramid" | "sphere" | "ring" | "diamond";
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  rotateX: number;
  rotateY: number;
  opacity: number;
}

const generateShapes = (count: number): Shape[] => {
  const types: Shape["type"][] = ["cube", "pyramid", "sphere", "ring", "diamond"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    type: types[Math.floor(Math.random() * types.length)],
    size: Math.random() * 40 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    rotateX: Math.random() * 360,
    rotateY: Math.random() * 360,
    opacity: Math.random() * 0.3 + 0.1,
  }));
};

const Cube = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute preserve-3d animate-spin-slow"
    style={{
      ...style,
      width: size,
      height: size,
      transformStyle: "preserve-3d",
    }}
  >
    {[...Array(6)].map((_, i) => {
      const transforms = [
        `rotateY(0deg) translateZ(${size / 2}px)`,
        `rotateY(180deg) translateZ(${size / 2}px)`,
        `rotateY(90deg) translateZ(${size / 2}px)`,
        `rotateY(-90deg) translateZ(${size / 2}px)`,
        `rotateX(90deg) translateZ(${size / 2}px)`,
        `rotateX(-90deg) translateZ(${size / 2}px)`,
      ];
      return (
        <div
          key={i}
          className="absolute bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 backdrop-blur-sm"
          style={{
            width: size,
            height: size,
            transform: transforms[i],
            backfaceVisibility: "visible",
          }}
        />
      );
    })}
  </div>
);

const Pyramid = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute animate-spin-slow"
    style={{
      ...style,
      width: 0,
      height: 0,
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size}px solid hsl(var(--primary) / 0.2)`,
      filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.3))",
    }}
  />
);

const Sphere = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent animate-float"
    style={{
      ...style,
      width: size,
      height: size,
      boxShadow: `
        inset -${size / 4}px -${size / 4}px ${size / 2}px hsl(var(--primary) / 0.3),
        0 0 ${size / 2}px hsl(var(--primary) / 0.2)
      `,
    }}
  />
);

const Ring = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute rounded-full border-4 border-primary/20 animate-spin-slow"
    style={{
      ...style,
      width: size,
      height: size,
      boxShadow: `0 0 20px hsl(var(--primary) / 0.2)`,
    }}
  />
);

const Diamond = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute animate-float"
    style={{
      ...style,
      width: size,
      height: size,
      background: `linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.1))`,
      transform: `${style.transform || ""} rotate(45deg)`,
      boxShadow: `0 0 30px hsl(var(--primary) / 0.3)`,
    }}
  />
);

interface FloatingShapes3DProps {
  count?: number;
  className?: string;
}

export const FloatingShapes3D = ({ count = 8, className = "" }: FloatingShapes3DProps) => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    setShapes(generateShapes(count));
  }, [count]);

  const renderShape = (shape: Shape) => {
    const baseStyle: React.CSSProperties = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      opacity: shape.opacity,
      animationDelay: `${shape.delay}s`,
      animationDuration: `${shape.duration}s`,
      transform: `rotateX(${shape.rotateX}deg) rotateY(${shape.rotateY}deg)`,
    };

    switch (shape.type) {
      case "cube":
        return <Cube key={shape.id} size={shape.size} style={baseStyle} />;
      case "pyramid":
        return <Pyramid key={shape.id} size={shape.size} style={baseStyle} />;
      case "sphere":
        return <Sphere key={shape.id} size={shape.size} style={baseStyle} />;
      case "ring":
        return <Ring key={shape.id} size={shape.size} style={baseStyle} />;
      case "diamond":
        return <Diamond key={shape.id} size={shape.size} style={baseStyle} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ perspective: "1000px" }}
    >
      {shapes.map(renderShape)}
    </div>
  );
};
