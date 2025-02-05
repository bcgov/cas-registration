interface BackIconProps {
  width?: string;
  height?: string;
}

export const BackIcon = ({ width = "15", height = "15" }: BackIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.6673 9.60938H4.58398"
      stroke="#1A5A96"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.1257 15.151L4.58398 9.60937L10.1257 4.0677"
      stroke="#1A5A96"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
