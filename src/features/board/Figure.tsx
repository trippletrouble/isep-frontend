interface FigureProps {
  x: number;
  y: number;
  color: string;
  onClick?: () => void;
  scale?: number;
  count?: number;
  isSelected?: boolean;
}

export function Figure({
  x,
  y,
  color,
  onClick,
  scale = 1.0,
  count,
  isSelected,
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
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={color}
        stroke={isSelected ? "#fff" : "var(--primary)"}
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
