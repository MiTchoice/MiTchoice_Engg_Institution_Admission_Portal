interface GearIconProps {
  size?: number;
  className?: string;
}

export function GearIcon({ size = 40, className = "" }: GearIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gear outer circle */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#FFC107" strokeWidth="3" />
      {/* Gear teeth */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 38 * Math.cos(rad);
        const y1 = 50 + 38 * Math.sin(rad);
        const x2 = 50 + 46 * Math.cos(rad);
        const y2 = 50 + 46 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FFC107"
            strokeWidth="8"
            strokeLinecap="round"
          />
        );
      })}
      {/* Inner circle */}
      <circle cx="50" cy="50" r="30" fill="#0D47A1" stroke="#FFC107" strokeWidth="2" />
      {/* MIT text */}
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="900"
        fontFamily="Inter, sans-serif"
        letterSpacing="1"
      >
        MIT
      </text>
    </svg>
  );
}
