"use client";

/**
 * MadadBadge: Displays Niv's "מדד גלבוע" score in a cloche (serving dome) SVG,
 * matching the YouTube on-screen graphic style.
 */
export function MadadBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: { width: 72, height: 68, fontSize: 16, labelSize: 6.5, scoreY: 32 },
    md: { width: 110, height: 104, fontSize: 26, labelSize: 9, scoreY: 48 },
    lg: { width: 160, height: 150, fontSize: 38, labelSize: 12, scoreY: 68 },
  };

  const d = dimensions[size];

  return (
    <div className="inline-flex flex-col items-center" title={`מדד גלבוע: ${score}`}>
      <svg
        width={d.width}
        height={d.height}
        viewBox="0 0 110 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cloche dome */}
        <path
          d="M20 65 C20 30, 90 30, 90 65"
          stroke="#1A1A1A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cloche handle */}
        <ellipse
          cx="55"
          cy="28"
          rx="8"
          ry="5"
          stroke="#1A1A1A"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Plate/tray line */}
        <line
          x1="12"
          y1="66"
          x2="98"
          y2="66"
          stroke="#1A1A1A"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Label: מדד גלבוע */}
        <text
          x="38"
          y="52"
          fontFamily="Heebo, sans-serif"
          fontSize={d.labelSize}
          fontWeight="700"
          fill="#1A1A1A"
          textAnchor="middle"
          direction="rtl"
        >
          מדד
        </text>
        <text
          x="38"
          y="62"
          fontFamily="Heebo, sans-serif"
          fontSize={d.labelSize}
          fontWeight="700"
          fill="#1A1A1A"
          textAnchor="middle"
          direction="rtl"
        >
          גלבוע
        </text>
        {/* Score number */}
        <text
          x="74"
          y="60"
          fontFamily="Heebo, sans-serif"
          fontSize={d.fontSize}
          fontWeight="700"
          fill="#C4354A"
          textAnchor="middle"
        >
          {score.toFixed(1)}
        </text>
        {/* Decorative hand holding tray */}
        <path
          d="M50 66 C50 72, 46 78, 42 80 M42 80 C40 81, 38 80, 38 78"
          stroke="#1A1A1A"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
