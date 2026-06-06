interface FigureProps {
  x: number;
  y: number;
  color: string;
  onClick?: () => void;
}

export function Figure({ x, y, color, onClick }: FigureProps) {
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
        r={31.66}
        fill={color}
        stroke="#292929"
        strokeWidth={4.6}
        onClick={onClick}
        style={{
          filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.3))",
          cursor: onClick ? "pointer" : "default",
          pointerEvents: "all",
        }}
      />
    </g>
  );
}
