"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Pre-baked dirt texture ───────────────────────────────────────────────────
// A 32×32 SVG rendered once as a data-URI and tiled via CSS background-repeat.
// No JS grid generation ever runs again — texture appears in < 1 frame.

const PIXELS_8x8 = [
  "#6B3E26","#7D4A30","#6B3E26","#8B5A3A","#6B3E26","#7D4A30","#5C3520","#8B5A3A",
  "#7D4A30","#5C3520","#7D4A30","#6B3E26","#9B6A4A","#6B3E26","#7D4A30","#6B3E26",
  "#8B5A3A","#6B3E26","#9B6A4A","#7D4A30","#6B3E26","#8B5A3A","#6B3E26","#7D4A30",
  "#6B3E26","#7D4A30","#6B3E26","#5C3520","#7D4A30","#6B3E26","#9B6A4A","#6B3E26",
  "#5C3520","#8B5A3A","#7D4A30","#6B3E26","#8B5A3A","#7D4A30","#6B3E26","#5C3520",
  "#7D4A30","#6B3E26","#8B5A3A","#7D4A30","#6B3E26","#9B6A4A","#7D4A30","#6B3E26",
  "#6B3E26","#5C3520","#6B3E26","#8B5A3A","#7D4A30","#6B3E26","#5C3520","#7D4A30",
  "#8B5A3A","#7D4A30","#6B3E26","#7D4A30","#6B3E26","#7D4A30","#8B5A3A","#6B3E26",
];

// Build SVG string once at module load time — never rebuilt
const svgRects = PIXELS_8x8.map((color, i) => {
  const x = (i % 8) * 4;
  const y = Math.floor(i / 8) * 4;
  return `<rect x="${x}" y="${y}" width="4" height="4" fill="${color}"/>`;
}).join("");

const DIRT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" shape-rendering="crispEdges">${svgRects}</svg>`;
const DIRT_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(DIRT_SVG)}")`;

// ─────────────────────────────────────────────────────────────────────────────

export function MinecraftLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return Math.min(100, prev + Math.random() * 18 + 8);
      });
    }, 180);

    const timer = setTimeout(() => setVisible(false), 2200);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col"
        >
          {/* ── Static pre-baked dirt background — zero JS per frame ── */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: DIRT_DATA_URI,
              backgroundRepeat: "repeat",
              backgroundSize: "32px 32px",
              imageRendering: "pixelated",
              filter: "brightness(0.65)",
            }}
          />

          {/* Slight dark overlay for text contrast */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Centered text + bar */}
          <div className="relative flex-1 flex flex-col items-center justify-center gap-3">
            <p
              className="font-pixel text-white select-none"
              style={{
                fontSize: "20px",
                textShadow: "2px 2px 0 #1a1a1a, -1px -1px 0 #1a1a1a",
                letterSpacing: "0.02em",
              }}
            >
              Loading terrain...
            </p>

            {/* Minecraft XP-bar style — short, thin, pixelated */}
            <div
              style={{
                width: "260px",
                height: "7px",
                background: "#1a1a00",
                border: "1px solid #000",
                outline: "1px solid #555",
                imageRendering: "pixelated",
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.18, ease: "linear" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(to bottom, #80FF20 0%, #58B800 45%, #42A000 50%, #58B800 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
                  imageRendering: "pixelated",
                }}
              />
            </div>

            {/* Percentage */}
            <p
              className="font-pixel select-none"
              style={{
                fontSize: "11px",
                color: "#aaffaa",
                textShadow: "1px 1px 0 #000",
                marginTop: "2px",
              }}
            >
              {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
