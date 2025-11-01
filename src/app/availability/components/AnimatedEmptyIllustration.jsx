'use client';

export default function AnimatedEmptyIllustration({ size = 240, className = '' }) {
  // Responsive wrapper with aria-label and subtle looped animation
  return (
    <div
      aria-label="Search for your perfect vacation home"
      className={className}
      style={{ width: size, maxWidth: '85vw', margin: '0 auto' }}
    >
      <svg
        viewBox="0 0 320 240"
        role="img"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background glow ellipse */}
        <defs>
          <linearGradient id="gradSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="gradAccent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <ellipse cx="160" cy="200" rx="120" ry="18" fill="#e5f6ff" filter="url(#soft)" />

        {/* Cozy vacation home */}
        <g transform="translate(50, 60)">
          {/* House body */}
          <rect x="40" y="60" width="140" height="90" rx="8" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
          {/* Roof */}
          <polygon points="110,20 30,70 190,70" fill="url(#gradSky)" />
          {/* Door */}
          <rect x="105" y="100" width="28" height="50" rx="4" fill="#0ea5e9" />
          {/* Subtle door open animation */}
          <rect x="105" y="100" width="8" height="50" rx="4" fill="#38bdf8">
            <animate attributeName="width" values="8;16;8" dur="3s" repeatCount="indefinite" />
          </rect>
          {/* Windows */}
          <rect x="60" y="90" width="28" height="22" rx="4" fill="#e0f2fe" />
          <rect x="152" y="90" width="28" height="22" rx="4" fill="#e0f2fe" />
        </g>

        {/* Floating stars/hearts for Disney/vacation vibes */}
        <g>
          <circle cx="250" cy="60" r="4" fill="url(#gradAccent)">
            <animate attributeName="cy" values="60;54;60" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="230" cy="40" r="3" fill="#f59e0b">
            <animate attributeName="cy" values="40;36;40" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="50" r="3" fill="#22d3ee">
            <animate attributeName="cy" values="50;46;50" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Suitcases gently moving for travel hint */}
        <g transform="translate(210, 150)">
          <rect x="-20" y="20" width="34" height="22" rx="4" fill="#fbbf24" stroke="#f59e0b" />
          <rect x="-16" y="14" width="12" height="6" rx="2" fill="#f59e0b" />
          <rect x="20" y="10" width="26" height="18" rx="4" fill="#38bdf8" stroke="#0ea5e9" />
          <rect x="24" y="5" width="10" height="6" rx="2" fill="#0ea5e9" />
          <animateTransform attributeName="transform" type="translate" values="210,150; 208,148; 210,150" dur="3s" repeatCount="indefinite" />
        </g>

        {/* Subtle sparkles */}
        <g>
          <path d="M160 30 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 z" fill="#ffffff" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" values="0 160 46; 20 160 46; 0 160 46" dur="3s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>

    </div>
  );
}
