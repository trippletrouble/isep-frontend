interface FigureProps {
  x: number;
  y: number;
  color: string;
}

export function Figure({ x, y, color }: FigureProps) {
  return (
    <circle
      cx={x}
      cy={y}
      r={31.66}
      fill={color}
      stroke="#292929"
      strokeWidth={4.6}
      style={{
        filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.3))",
        transition: "all 0.3s ease",
        cursor: onclick ? "pointer" : "default",
      }}
    />
  );
}
