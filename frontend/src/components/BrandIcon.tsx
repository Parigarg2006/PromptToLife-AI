import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number;
}

export function BrandIcon({ className = '', size = 32 }: BrandIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.45))' }}
    >
      <defs>
        <linearGradient id="amberGradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.5" stopColor="#EA580C" />
          <stop offset="1" stopColor="#FB7185" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.6" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="sparkGlow" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Outer Isometric Facets */}
      <path 
        d="M16 3L27 9.35V22.65L16 29L5 22.65V9.35L16 3Z" 
        stroke="url(#accentGradient)" 
        strokeWidth="1.75" 
        strokeLinejoin="round"
        fill="rgba(15, 23, 42, 0.65)"
      />

      {/* Internal Geometry & Orbital Node Brackets */}
      <path 
        d="M16 3V16M27 9.35L16 16M5 9.35L16 16" 
        stroke="url(#accentGradient)" 
        strokeWidth="1.2" 
        strokeOpacity="0.5" 
        strokeDasharray="2 2"
      />

      {/* Inner Glowing Diamond Spark */}
      <path 
        d="M16 8L20 16L16 24L12 16L16 8Z" 
        fill="url(#sparkGlow)" 
      />

      {/* Core Energy Flare */}
      <circle cx="16" cy="16" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}
export default BrandIcon;
