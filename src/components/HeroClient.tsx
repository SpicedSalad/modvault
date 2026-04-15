"use client";

import { InteractiveCreeper } from "@/components/InteractiveCreeper";
import { CreeperDeathScreen } from "@/components/CreeperDeathScreen";
import { Button } from "@/components/ui/Buttons";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function HeroClient() {
  const isAnimating = useRef(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);

  const scrollToDiscover = useCallback(() => {
    if (isAnimating.current) return;
    const target = document.getElementById('discover-section');
    if (!target) return;
    
    isAnimating.current = true;
    const navOffset = -80; 
    const targetPosition = target.getBoundingClientRect().top + window.scrollY + navOffset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200; // 1.2s smooth glide
    let start: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);
        setTimeout(() => { isAnimating.current = false; }, 200); 
      }
    };

    requestAnimationFrame(animation);
  }, []);

  const handleCreeperExplode = () => {
    setShowDeathScreen(true);
  };

  const handleRespawn = () => {
    setShowDeathScreen(false);
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDeathScreen) {
        handleRespawn();
      }
    };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [showDeathScreen]);

  return (
    <div className="relative z-10 w-full max-w-7xl px-4 mx-auto flex flex-col md:flex-row items-center justify-between scale-90 origin-top md:origin-center xl:scale-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="w-full md:w-1/2 pointer-events-auto"
      >
        <InteractiveCreeper onExplode={handleCreeperExplode} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start space-y-6"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-pixel font-normal text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          MODERN <br/> 
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#3fba54] to-emerald-200 drop-shadow-[0_0_30px_rgba(63,186,84,0.4)]">
            MINECRAFT
          </span> <br/> 
          TWEAKS
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-zinc-400 font-sans tracking-wide leading-relaxed max-w-xl">
          Ascend beyond vanilla. Discover an ultimate curated repository of flagship mods, absolute resource packs, and god-tier shaders.
        </p>

        <div className="pt-4">
          <button 
            onClick={scrollToDiscover} 
            className="relative flex items-center justify-center px-8 py-3.5 lg:px-12 lg:py-5 font-pixel text-base lg:text-xl font-bold tracking-widest text-[#1a1a1a] bg-gradient-to-r from-emerald-400 to-[#3fba54] rounded-sm overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(63,186,84,0.5)] hover:shadow-[0_0_50px_rgba(63,186,84,0.8)] border border-emerald-300/30"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
            <span className="relative z-10 mt-1">ENTER DISCOVER</span>
          </button>
        </div>
      </motion.div>
      
      <CreeperDeathScreen isVisible={showDeathScreen} onRespawn={handleRespawn} />
    </div>
  );
}
