"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxBlocks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Different speeds and dynamics for complex 3D fields
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -1000]);

  // Rotational physics for native 3D spinning
  const r1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const r2 = useTransform(scrollYProgress, [0, 1], [45, 360]);
  const r3 = useTransform(scrollYProgress, [0, 1], [-45, -270]);
  const r4 = useTransform(scrollYProgress, [0, 1], [15, 400]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-[1000px]">
      {/* Heavy Obsidian Glass Block */}
      <motion.div
        style={{ y: y1, rotateX: r1, rotateY: r1, rotateZ: r1 }}
        className="absolute left-[12%] top-[20%] w-32 h-32 backdrop-blur-xl bg-purple-900/20 border-2 border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] rounded-lg transform-style-preserve-3d"
      >
        <div className="absolute inset-0 border border-white/5 rounded-lg"></div>
      </motion.div>
      
      {/* Floating Emerald Glass Ring */}
      <motion.div
        style={{ y: y2, rotateX: r2, rotateY: r3, rotateZ: r2 }}
        className="absolute right-[15%] top-[60%] w-20 h-20 backdrop-blur-md bg-emerald-500/10 border-4 border-emerald-400/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] rounded-2xl"
      />
      
      {/* Gold Vault Geometries */}
      <motion.div
        style={{ y: y3, rotateX: r3, rotateY: r2, rotateZ: r3 }}
        className="absolute left-[25%] top-[75%] w-24 h-24 backdrop-blur-lg bg-amber-500/10 border-l-2 border-t-2 border-amber-300/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
      >
        <div className="absolute inset-2 border border-amber-300/20"></div>
      </motion.div>
      
      {/* Distant Diamond Crystal */}
      <motion.div
        style={{ y: y4, rotateX: r4, rotateY: r4, rotateZ: r1 }}
        className="absolute right-[8%] top-[85%] w-16 h-16 backdrop-blur-sm bg-cyan-400/20 border-t-4 border-l-4 border-cyan-300/50 shadow-[0_0_60px_rgba(34,211,238,0.4)] rounded-full"
      />
    </div>
  );
}
