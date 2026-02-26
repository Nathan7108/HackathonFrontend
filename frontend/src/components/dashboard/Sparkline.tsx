"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 40,
  height = 16,
  color = "#6366f1",
  showArea = false,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => (i / (data.length - 1)) * width;
  const toY = (v: number) => height - ((v - min) / range) * (height - 2) - 1;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const polyline = `M ${data.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ")}`;
  const areaPath = `${polyline} L ${toX(data.length - 1)},${height} L ${toX(0)},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ display: "block", flexShrink: 0 }}
    >
      {showArea && (
        <path d={areaPath} fill={color} opacity={0.1} />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
