"use client";

import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: "", armorType: "none" };

    let score = 0;

    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?\/\\|`~]/.test(password)) score += 20;

    // Determine armor type and label
    if (score <= 20) return { level: 1, label: "Weak", armorType: "leather", score };
    if (score <= 40) return { level: 2, label: "Fair", armorType: "chain", score };
    if (score <= 60) return { level: 3, label: "Good", armorType: "iron", score };
    if (score <= 80) return { level: 4, label: "Strong", armorType: "diamond", score };
    return { level: 5, label: "Very Strong", armorType: "netherite", score };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Armor Pieces Display */}
      <div className="flex gap-2 justify-center">
        {/* Helmet */}
        <ArmorPiece type={strength.armorType} piece="helmet" filled={strength.level >= 1} />
        {/* Chestplate */}
        <ArmorPiece type={strength.armorType} piece="chestplate" filled={strength.level >= 2} />
        {/* Leggings */}
        <ArmorPiece type={strength.armorType} piece="leggings" filled={strength.level >= 3} />
        {/* Boots */}
        <ArmorPiece type={strength.armorType} piece="boots" filled={strength.level >= 4} />
        {/* Netherite Extra (Glow effect) */}
        {strength.armorType === "netherite" && (
          <div className="text-2xl animate-pulse" title="Enchanted!">
            ✨
          </div>
        )}
      </div>

      {/* Strength Label */}
      <div className="text-center">
        <p className="font-pixel text-sm">
          <span
            className={`${
              strength.level === 1
                ? "text-orange-400"
                : strength.level === 2
                ? "text-gray-300"
                : strength.level === 3
                ? "text-orange-300"
                : strength.level === 4
                ? "text-blue-300"
                : "text-purple-400"
            }`}
          >
            {strength.label}
          </span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/40 border border-white/10 rounded h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            strength.level === 1
              ? "bg-orange-500"
              : strength.level === 2
              ? "bg-gray-500"
              : strength.level === 3
              ? "bg-orange-500"
              : strength.level === 4
              ? "bg-blue-500"
              : "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
          }`}
          style={{ width: `${(strength.score / 120) * 100}%` }}
        />
      </div>
    </div>
  );
}

interface ArmorPieceProps {
  type: string;
  piece: "helmet" | "chestplate" | "leggings" | "boots";
  filled: boolean;
}

function ArmorPiece({ type, piece, filled }: ArmorPieceProps) {
  const baseClasses =
    "w-12 h-12 border-2 border-white/30 rounded-sm flex items-center justify-center text-xs font-pixel transition-all duration-300 relative";

  const colors = {
    leather: "bg-orange-900/50 text-orange-400 border-orange-600/50",
    chain: "bg-gray-600/50 text-gray-300 border-gray-500/50",
    iron: "bg-orange-600/50 text-orange-200 border-orange-500/50",
    diamond: "bg-blue-500/50 text-cyan-200 border-blue-400/50",
    netherite: "bg-purple-900/60 text-purple-200 border-purple-600/50 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
  };

  if (!filled) {
    return (
      <div className={`${baseClasses} bg-black/40 border-white/10 text-transparent`}>
        {getPieceLabel(piece)}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${colors[type as keyof typeof colors]}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Pixel art representation using divs */}
        <PixelArmor piece={piece} type={type} />
      </div>
    </div>
  );
}

function getPieceLabel(piece: string): string {
  const labels = {
    helmet: "H",
    chestplate: "C",
    leggings: "L",
    boots: "B",
  };
  return labels[piece as keyof typeof labels] || "";
}

interface PixelArmorProps {
  piece: string;
  type: string;
}

function PixelArmor({ piece, type }: PixelArmorProps) {
  // Create simple pixel art using CSS grid patterns
  const patterns = {
    helmet: "■□■ □■□ ■□■",
    chestplate: "■■■ ■■■ ■■■",
    leggings: "■□■ ■□■ ■□■",
    boots: "□□□ ■■■ ■■■",
  };

  const pattern = patterns[piece as keyof typeof patterns] || "";

  return (
    <span className="text-xs tracking-tight leading-none">
      {pattern.charAt(0)}
    </span>
  );
}
