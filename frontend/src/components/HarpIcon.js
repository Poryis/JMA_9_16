// JMA harp Home button artwork.
// Uses the custom uploaded asset (`assets/ui/jma-harp.png`). Renders the
// image inside a fixed-size square box so different button sizes stay
// pixel-clean.

export function HarpIcon({ size = 48 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      <img
        src="assets/ui/jma-harp.png"
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default HarpIcon;
