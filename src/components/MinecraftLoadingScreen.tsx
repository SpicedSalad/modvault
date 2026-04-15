"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function MinecraftLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isFresh = !sessionStorage.getItem("modvault_visited");
    setIsFirstVisit(isFresh);
    setIsVisible(true);

    if (isFresh) {
      sessionStorage.setItem("modvault_visited", "true");
    }

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 300);

    // Auto-hide after loading complete
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!isVisible || progress === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-[#8B6F47] z-[9999] flex flex-col items-center justify-center"
    >
      {/* Dirt Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="grid grid-cols-8 gap-0 w-full h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`border border-[#6B4A27] ${
                i % 3 === 0 ? "bg-[#9B7A4B]" : "bg-[#8B6F47]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md">
        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="font-pixel text-4xl text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isFirstVisit ? "Generating World..." : "Loading Terrain..."}
          </h2>
          <p className="font-sans text-sm text-white/70">
            {isFirstVisit ? "First time exploring ModVault?" : "Welcome back!"}
          </p>
        </motion.div>

        {/* Loading Icon - Square Spiral */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/30 border-t-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        />

        {/* Progress Bar */}
        <div className="w-full max-w-xs bg-black/40 border-2 border-white/30 rounded-sm overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-4 bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
          />
        </div>

        {/* Percentage */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-pixel text-white/80 text-sm"
        >
          {Math.round(progress)}%
        </motion.p>
      </div>
    </motion.div>
  );
}
