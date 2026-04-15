"use client";

import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  const strengthLevel = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)  score += 2;
    if (password.length >= 12) score += 2;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 2;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?\/\\|`~]/.test(password)) score += 2;
    return Math.min(10, score);
  }, [password]);

  const label      = strengthLevel > 7 ? "Strong" : strengthLevel > 4 ? "Good" : "Weak";
  const labelColor = strengthLevel > 7 ? "#55FF55" : strengthLevel > 4 ? "#FFFF55" : "#FF5555";

  return (
    <div className="flex flex-col items-center gap-1 mt-2">
      <div className="flex gap-[2px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <ArmorIcon key={i} filled={i < strengthLevel} />
        ))}
      </div>
      {password && (
        <span
          className="font-pixel uppercase tracking-widest"
          style={{ fontSize: "10px", color: labelColor, textShadow: "1px 1px 0 #000" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Matches the exact Minecraft HUD armor bar sprite:
 *  - Two square shoulder bumps at the top
 *  - Solid rectangular body, NO arm-hole cutouts
 *  - Slightly tapered at the bottom (matches the sprite)
 *
 * Pixel grid — 9 wide × 7 tall (each cell = 2 CSS px → icon = 18×14)
 *
 *   . X X . . . X X .   ← shoulder bumps
 *   X X X X X X X X X   ← solid (full width)
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .   ← slightly narrower
 *   . . X X X X X . .   ← bottom taper
 */
function ArmorIcon({ filled }: { filled: boolean }) {
  const SHAPE = [
    [0,1,1,0,0,0,1,1,0],  // row 0 — shoulder bumps
    [1,1,1,1,1,1,1,1,1],  // row 1 — collar (full)
    [1,1,1,1,1,1,1,1,1],  // row 2 — chest (solid, no arm holes)
    [1,1,1,1,1,1,1,1,1],  // row 3 — chest
    [1,1,1,1,1,1,1,1,1],  // row 4 — chest
    [0,1,1,1,1,1,1,1,0],  // row 5 — lower (slightly narrower)
    [0,0,1,1,1,1,1,0,0],  // row 6 — bottom taper
  ] as const;

  // ── Filled (silver / iron) palette ──────────────────────────────────
  // Minecraft uses a top-lit model: top rows brightest, bottom darkest.
  // No complex per-pixel noise — just clean horizontal bands.
  const FILLED_ROWS = [
    "#E0E0E0",  // 0 — shoulder highlight
    "#C8C8C8",  // 1 — collar
    "#B8B8B8",  // 2 — upper chest
    "#A8A8A8",  // 3 — mid chest (slight shadow from collar)
    "#B0B0B0",  // 4 — lower chest
    "#A0A0A0",  // 5 — lower body
    "#909090",  // 6 — bottom shadow
  ];

  // ── Empty (dark grey) palette ────────────────────────────────────────
  const EMPTY_ROWS = [
    "#5A5A5A",
    "#484848",
    "#3C3C3C",
    "#303030",
    "#383838",
    "#2C2C2C",
    "#202020",
  ];

  const palette = filled ? FILLED_ROWS : EMPTY_ROWS;
  const S = 2; // px per cell

  return (
    <svg
      width={9 * S}
      height={7 * S}
      viewBox={`0 0 ${9 * S} ${7 * S}`}
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges", display: "block" }}
    >
      {SHAPE.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * S}
              y={y * S}
              width={S}
              height={S}
              fill={palette[y]}
              // NO stroke — adjacent filled rects share edges perfectly → solid look
            />
          ) : null
        )
      )}
    </svg>
  );
}
