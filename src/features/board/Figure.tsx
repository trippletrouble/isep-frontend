import { Icon } from "lucide-react";
import { bee } from "@lucide/lab";

interface FigureProps {
  x: number;
  y: number;
  color: string;
  onClick?: () => void;
  scale?: number;
  count?: number;
  isSelected?: boolean;
  canMove?: boolean;
  hasPlagueFly?: boolean;
}

export function Figure({
  x,
  y,
  color,
  onClick,
  scale = 1.0,
  count,
  isSelected,
  canMove,
  hasPlagueFly,
}: FigureProps) {
  const r = 31.66 * scale;
  const strokeWidth = 4.6 * scale;
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 200ms ease-in-out",
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.42);
            opacity: 0;
          }
        }
        .pulse-highlight {
          animation: pulseGlow 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: 0px 0px;
        }
      `}</style>
      <g>
        {canMove && (
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={7 * scale}
            className="pulse-highlight"
            style={{
              filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 3px #fff)`,
              pointerEvents: "none",
            }}
          />
        )}
        <circle
          cx={0}
          cy={0}
          r={r}
          fill={color}
          stroke={isSelected ? "#fff" : "var(--color-primary)"}
          strokeWidth={strokeWidth}
          onClick={onClick}
          data-testid="figure"
          data-color={color}
          style={{
            filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.3))",
            cursor: onClick ? "pointer" : "default",
            pointerEvents: "all",
          }}
        />
        {count && count > 1 && (
          <g pointerEvents="none">
            <text
              x={0}
              y={2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#282828"
              fontSize={22 * scale}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {count}
            </text>
          </g>
        )}
        {hasPlagueFly && (
          <g transform={`translate(${-0.65 * r}, ${-0.65 * r})`} pointerEvents="none">
            <Icon
              iconNode={bee}
              size={1.3 * r}
              className="text-white"
              style={{
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px #000)",
              }}
            />
          </g>
        )}
      </g>
    </g>
  );
}
