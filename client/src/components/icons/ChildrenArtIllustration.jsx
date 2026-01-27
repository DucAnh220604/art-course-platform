export function ChildrenArtIllustration({ className = "w-full h-full" }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="400" height="300" fill="#D1FAE5" rx="24" />

      <circle cx="340" cy="50" r="30" fill="#FBBF24" />
      <circle cx="340" cy="50" r="25" fill="#FCD34D" />
      <line
        x1="340"
        y1="10"
        x2="340"
        y2="0"
        stroke="#FBBF24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="370"
        y1="50"
        x2="380"
        y2="50"
        stroke="#FBBF24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="360"
        y1="25"
        x2="370"
        y2="15"
        stroke="#FBBF24"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <ellipse cx="80" cy="40" rx="30" ry="20" fill="white" />
      <ellipse cx="60" cy="50" rx="25" ry="18" fill="white" />
      <ellipse cx="100" cy="50" rx="25" ry="18" fill="white" />

      <ellipse cx="200" cy="60" rx="25" ry="15" fill="white" />
      <ellipse cx="180" cy="68" rx="20" ry="14" fill="white" />
      <ellipse cx="220" cy="68" rx="20" ry="14" fill="white" />

      <ellipse cx="200" cy="280" rx="220" ry="40" fill="#4ADE80" />
      <ellipse cx="200" cy="270" rx="200" ry="30" fill="#22C55E" />

      <rect x="50" y="160" width="80" height="70" fill="#FCA5A5" rx="4" />
      <polygon points="90,110 40,160 140,160" fill="#F87171" />
      <rect x="75" y="190" width="25" height="40" fill="#7C3AED" rx="2" />
      <circle cx="94" cy="210" r="3" fill="#FCD34D" />
      <rect x="55" y="175" width="18" height="18" fill="#38BDF8" rx="2" />
      <rect x="107" y="175" width="18" height="18" fill="#38BDF8" rx="2" />
      <line x1="64" y1="175" x2="64" y2="193" stroke="white" strokeWidth="2" />
      <line x1="55" y1="184" x2="73" y2="184" stroke="white" strokeWidth="2" />
      <line
        x1="116"
        y1="175"
        x2="116"
        y2="193"
        stroke="white"
        strokeWidth="2"
      />
      <line
        x1="107"
        y1="184"
        x2="125"
        y2="184"
        stroke="white"
        strokeWidth="2"
      />

      <rect x="280" y="170" width="20" height="70" fill="#A16207" rx="4" />
      <circle cx="290" cy="140" r="40" fill="#4ADE80" />
      <circle cx="270" cy="160" r="30" fill="#22C55E" />
      <circle cx="310" cy="160" r="30" fill="#22C55E" />
      <circle cx="290" cy="120" r="25" fill="#86EFAC" />

      <g transform="translate(180, 150)">
        <rect x="10" y="40" width="30" height="50" fill="#F472B6" rx="10" />
        <circle cx="25" cy="25" r="22" fill="#FECACA" />
        <path
          d="M5 15 Q25 -5 45 15 Q50 30 45 35 Q40 25 25 25 Q10 25 5 35 Q0 30 5 15"
          fill="#5C4033"
        />
        <circle cx="8" cy="40" r="8" fill="#5C4033" />
        <circle cx="42" cy="40" r="8" fill="#5C4033" />
        <circle cx="18" cy="25" r="3" fill="#1F2937" />
        <circle cx="32" cy="25" r="3" fill="#1F2937" />
        <circle cx="19" cy="26" r="1" fill="white" />
        <circle cx="33" cy="26" r="1" fill="white" />
        <path
          d="M20 35 Q25 40 30 35"
          stroke="#F87171"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />{" "}
        <circle cx="12" cy="32" r="4" fill="#FCA5A5" opacity="0.6" />
        <circle cx="38" cy="32" r="4" fill="#FCA5A5" opacity="0.6" />
        <ellipse cx="50" cy="55" rx="8" ry="6" fill="#FECACA" />
        <rect
          x="52"
          y="45"
          width="4"
          height="25"
          fill="#FBBF24"
          rx="2"
          transform="rotate(20 52 45)"
        />
        <polygon
          points="58,70 62,78 54,78"
          fill="#1F2937"
          transform="rotate(20 58 74)"
        />
        <ellipse cx="0" cy="55" rx="8" ry="6" fill="#FECACA" />
      </g>

      <g transform="translate(230, 140)">
        <line
          x1="10"
          y1="100"
          x2="30"
          y2="0"
          stroke="#A16207"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="100"
          x2="50"
          y2="0"
          stroke="#A16207"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="100"
          x2="40"
          y2="20"
          stroke="#A16207"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="15"
          y="10"
          width="50"
          height="40"
          fill="white"
          stroke="#D1D5DB"
          strokeWidth="2"
          rx="2"
        />
        <path
          d="M30 20 L32 26 L38 26 L33 30 L35 36 L30 32 L25 36 L27 30 L22 26 L28 26 Z"
          fill="#FBBF24"
        />
        <path
          d="M50 25 C50 22 46 20 43 23 C40 20 36 22 36 25 C36 30 43 35 43 35 C43 35 50 30 50 25"
          fill="#F87171"
        />
      </g>

      <g transform="translate(160, 245)">
        <rect x="8" y="10" width="4" height="20" fill="#22C55E" />
        <circle cx="10" cy="8" r="8" fill="#F472B6" />
        <circle cx="10" cy="8" r="4" fill="#FBBF24" />
      </g>
      <g transform="translate(320, 250)">
        <rect x="8" y="10" width="4" height="18" fill="#22C55E" />
        <circle cx="10" cy="8" r="7" fill="#A78BFA" />
        <circle cx="10" cy="8" r="3" fill="#FCD34D" />
      </g>
      <g transform="translate(35, 248)">
        <rect x="6" y="8" width="3" height="15" fill="#22C55E" />
        <circle cx="7.5" cy="6" r="6" fill="#38BDF8" />
        <circle cx="7.5" cy="6" r="3" fill="#FDE68A" />
      </g>

      <g transform="translate(150, 100)">
        <ellipse cx="10" cy="10" rx="3" ry="6" fill="#F472B6" />
        <ellipse cx="4" cy="6" rx="6" ry="8" fill="#F9A8D4" />
        <ellipse cx="16" cy="6" rx="6" ry="8" fill="#F9A8D4" />
        <ellipse cx="4" cy="14" rx="4" ry="6" fill="#FBCFE8" />
        <ellipse cx="16" cy="14" rx="4" ry="6" fill="#FBCFE8" />
        <circle cx="4" cy="6" r="2" fill="#EC4899" />
        <circle cx="16" cy="6" r="2" fill="#EC4899" />
      </g>

      <path
        d="M260 90 Q290 60 320 90"
        stroke="#EF4444"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M263 94 Q290 67 317 94"
        stroke="#F97316"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M266 98 Q290 74 314 98"
        stroke="#FBBF24"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M269 102 Q290 81 311 102"
        stroke="#22C55E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M272 106 Q290 88 308 106"
        stroke="#3B82F6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default ChildrenArtIllustration;
