// Simple, cute SVG harp icon for the Home button.
// Will be replaced once user uploads custom harp artwork to assets/ui/harp.png
// (the GameHeader auto-detects and uses the PNG if present).

export function HarpIcon({ size = 48, color = '#FFCC00', stroke = '#0A2540' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Base / soundboard */}
      <path
        d="M14 54 L50 54 L46 46 L18 46 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Curved neck */}
      <path
        d="M50 50 C52 30 38 14 22 8 C20 7 18 9 19 11 C28 16 38 24 44 36"
        fill={color}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Pillar (front column) */}
      <line x1="22" y1="10" x2="18" y2="46" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      {/* Strings */}
      <line x1="24" y1="15" x2="22" y2="46" stroke={stroke} strokeWidth="1" />
      <line x1="28" y1="20" x2="27" y2="46" stroke={stroke} strokeWidth="1" />
      <line x1="33" y1="25" x2="32" y2="46" stroke={stroke} strokeWidth="1" />
      <line x1="38" y1="30" x2="37" y2="46" stroke={stroke} strokeWidth="1" />
      <line x1="42" y1="36" x2="42" y2="46" stroke={stroke} strokeWidth="1" />
      {/* Sound hole accent */}
      <circle cx="32" cy="50" r="1.6" fill={stroke} />
    </svg>
  );
}

export default HarpIcon;
