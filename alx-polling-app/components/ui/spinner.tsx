import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "ring" | "fireworks" | "flag";
  colors?: string[]; // e.g. ["#ef4444", "#3b82f6", "#10b981"]
  speedMs?: number; // animation speed hint
}

const ringSizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-3",
  lg: "h-8 w-8 border-4",
};

export function Spinner({
  className,
  size = "md",
  variant = "ring",
  colors,
  speedMs,
  ...props
}: SpinnerProps) {
  if (variant === "fireworks") {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center",
          size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8",
          "animate-spin",
          speedMs ? `[animation-duration:${speedMs}ms]` : ""
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const radius = 0.35; // as fraction of container
          const dotSize = size === "sm" ? 4 : size === "lg" ? 7 : 5; // px
          const x = 50 + Math.cos(angle) * radius * 100;
          const y = 50 + Math.sin(angle) * radius * 100;
          const color = colors?.[i % (colors.length || 1)] || "currentColor";
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: dotSize,
                height: dotSize,
                transform: "translate(-50%, -50%)",
                backgroundColor: color,
                opacity: 0.95,
              }}
            />
          );
        })}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === "flag") {
    const barWidth = size === "sm" ? 3 : size === "lg" ? 6 : 4; // px
    const barGap = size === "sm" ? 2 : size === "lg" ? 4 : 3; // px
    const barHeight = size === "sm" ? 12 : size === "lg" ? 20 : 16; // px
    const palette = colors && colors.length > 0 ? colors : ["#ef4444", "#f59e0b", "#3b82f6"]; // red, amber, blue

    return (
      <div
        className={cn("inline-flex items-end", className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("mx-[1px] inline-block", i > 0 ? `ml-[${barGap}px]` : "")}
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: palette[i % palette.length],
              borderRadius: 2,
              animation: `flag-wave ${speedMs || 900}ms ease-in-out ${(i * (speedMs || 900)) / 6}ms infinite`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes flag-wave {
            0%, 100% { transform: translateY(0); opacity: 0.85; }
            50% { transform: translateY(-20%); opacity: 1; }
          }
        `}</style>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Default: ring
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-2 border-b-2 border-current",
        ringSizeClasses[size],
        speedMs ? `[animation-duration:${speedMs}ms]` : "",
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}