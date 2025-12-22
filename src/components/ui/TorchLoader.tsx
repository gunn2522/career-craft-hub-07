import { cn } from "@/lib/utils";

interface TorchLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const TorchLoader = ({ className, size = "md", text }: TorchLoaderProps) => {
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-24",
    lg: "w-24 h-32",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Torch Base */}
        <svg viewBox="0 0 48 64" className="w-full h-full">
          {/* Wings */}
          <g className="animate-pulse" style={{ transformOrigin: "center", animationDuration: "2s" }}>
            <path
              d="M24 32C24 32 8 24 2 20C2 20 6 30 10 34C14 38 20 40 24 40"
              fill="hsl(var(--muted-foreground))"
              fillOpacity="0.3"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
            <path
              d="M24 32C24 32 40 24 46 20C46 20 42 30 38 34C34 38 28 40 24 40"
              fill="hsl(var(--muted-foreground))"
              fillOpacity="0.3"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
          </g>

          {/* Torch Handle */}
          <rect
            x="20"
            y="32"
            width="8"
            height="28"
            rx="2"
            fill="hsl(var(--muted-foreground))"
            fillOpacity="0.4"
          />
          <rect
            x="18"
            y="30"
            width="12"
            height="4"
            rx="1"
            fill="hsl(var(--muted-foreground))"
            fillOpacity="0.5"
          />

          {/* Torch Bowl */}
          <ellipse
            cx="24"
            cy="28"
            rx="10"
            ry="4"
            fill="hsl(var(--muted-foreground))"
            fillOpacity="0.4"
          />

          {/* Flame */}
          <g className="animate-flicker" style={{ transformOrigin: "24px 20px" }}>
            <defs>
              <linearGradient id="torch-flame-gradient" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="hsl(25, 95%, 53%)" />
                <stop offset="50%" stopColor="hsl(35, 100%, 55%)" />
                <stop offset="100%" stopColor="hsl(45, 100%, 65%)" />
              </linearGradient>
            </defs>
            <path
              d="M24 4C24 4 16 14 16 22C16 28 19.5 30 24 30C28.5 30 32 28 32 22C32 14 24 4 24 4Z"
              fill="url(#torch-flame-gradient)"
              className="drop-shadow-lg"
            >
              <animate
                attributeName="d"
                dur="0.5s"
                repeatCount="indefinite"
                values="
                  M24 4C24 4 16 14 16 22C16 28 19.5 30 24 30C28.5 30 32 28 32 22C32 14 24 4 24 4Z;
                  M24 2C24 2 14 12 14 20C14 26 18 30 24 30C30 30 34 26 34 20C34 12 24 2 24 2Z;
                  M24 4C24 4 16 14 16 22C16 28 19.5 30 24 30C28.5 30 32 28 32 22C32 14 24 4 24 4Z
                "
              />
            </path>
            {/* Inner Flame */}
            <path
              d="M24 12C24 12 20 18 20 23C20 27 22 28 24 28C26 28 28 27 28 23C28 18 24 12 24 12Z"
              fill="hsl(45, 100%, 75%)"
              fillOpacity="0.8"
            >
              <animate
                attributeName="d"
                dur="0.4s"
                repeatCount="indefinite"
                values="
                  M24 12C24 12 20 18 20 23C20 27 22 28 24 28C26 28 28 27 28 23C28 18 24 12 24 12Z;
                  M24 10C24 10 18 16 18 21C18 25 21 28 24 28C27 28 30 25 30 21C30 16 24 10 24 10Z;
                  M24 12C24 12 20 18 20 23C20 27 22 28 24 28C26 28 28 27 28 23C28 18 24 12 24 12Z
                "
              />
            </path>
          </g>

          {/* Sparks */}
          <circle cx="18" cy="8" r="1" fill="hsl(35, 100%, 60%)" className="animate-ping" style={{ animationDuration: "1.5s" }} />
          <circle cx="30" cy="6" r="0.8" fill="hsl(45, 100%, 65%)" className="animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
          <circle cx="26" cy="3" r="0.6" fill="hsl(25, 95%, 55%)" className="animate-ping" style={{ animationDuration: "1.8s", animationDelay: "0.3s" }} />
        </svg>
      </div>
      {text && (
        <p className={cn("text-muted-foreground font-medium animate-pulse", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );
};
