interface FigureProps {
  x: number;
  y: number;
  color: string;
  onClick?: () => void;
  scale?: number;
  count?: number;
  isSelected?: boolean;
  canMove?: boolean;
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
}: FigureProps) {
  const r = 31.66 * scale;
  const strokeWidth = 4.6 * scale;
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 200ms ease-in-out",
      }}
      className={canMove ? "bounce-highlight" : ""}
    >
      <style>{`
        @keyframes pulseGlow {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        @keyframes subtleBounce {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(0, -6px);
          }
        }
        .pulse-highlight {
          animation: pulseGlow 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
          transform-origin: 0px 0px;
        }
        .bounce-highlight {
          animation: subtleBounce 2s ease-in-out infinite;
        }
      `}</style>
      {canMove && (
        <circle
          cx={0}
          cy={0}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4 * scale}
          className="pulse-highlight"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
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
    </g>
  );
}
