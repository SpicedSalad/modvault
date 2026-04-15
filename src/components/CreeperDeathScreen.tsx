"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Buttons";
import Link from "next/link";

interface CreeperDeathScreenProps {
  isVisible: boolean;
  onRespawn: () => void;
}

export function CreeperDeathScreen({ isVisible, onRespawn }: CreeperDeathScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-red-900/40 z-[5000] flex items-center justify-center backdrop-blur-sm"
        >
          {/* Red tint overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/20 mix-blend-multiply"
          />

          {/* Death Screen Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 text-center flex flex-col items-center gap-8 max-w-md"
          >
            {/* Death Message */}
            <div className="space-y-4">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-pixel text-5xl text-red-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
              >
                You Died
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-pixel text-white/80 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                You were blown up by Creeper
              </motion.p>
            </div>

            {/* Buttons Container */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Respawn Button */}
              <button
                onClick={onRespawn}
                className="w-full flex justify-center items-center px-8 py-3 bg-[#c6c6c6] text-[#222222] font-pixel border-pixel transition-colors duration-200 hover:bg-grass hover:text-white active:translate-y-1"
              >
                <span className="mt-1">Respawn</span>
              </button>

              {/* Title Screen Button */}
              <Link href="/discover" className="w-full block mt-2">
                <button className="w-full flex justify-center items-center px-8 py-3 bg-[#c6c6c6] text-[#222222] font-pixel border-pixel transition-colors duration-200 hover:bg-grass hover:text-white active:translate-y-1">
                  <span className="mt-1">Title Screen</span>
                </button>
              </Link>
            </motion.div>

            {/* Exit with Respawns Count (Optional) */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
              className="font-sans text-xs text-white/40 mt-4"
            >
              Press ESC to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
