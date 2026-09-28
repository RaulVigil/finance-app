import React, { useId } from "react";

export const LogoEmblem = ({ className = "w-4 h-4", dotColor = "#00BCD4", circleColor = "#212121" }) => {
  const rawId = useId();
  const maskId = `emblem-mask-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      className={`${className} inline-block shrink-0 select-none align-middle transition-transform duration-150`}
      fill="none"
    >
      <mask id={maskId}>
        <rect x="0" y="0" width="400" height="400" fill="#ffffff" />
        <rect x="0" y="190" width="400" height="24" fill="#000000" />
        <rect x="0" y="245" width="200" height="15" fill="#000000" />
        <rect x="170" y="145" width="30" height="135" fill="#000000" />
      </mask>
      <circle cx="200" cy="200" r="180" fill={circleColor} mask={`url(#${maskId})`} />
      <path
        d="M 170 145 L 340 145 L 340 190 L 200 190 L 200 245 L 290 245 L 290 280 L 170 280 Z"
        fill={circleColor}
      />
      <path
        d="M 200 280 L 200 320 L 170 320 L 170 280 Z"
        fill={circleColor}
      />
      <circle cx="225" cy="168" r="16" fill={dotColor} />
    </svg>
  );
};

export default LogoEmblem;
