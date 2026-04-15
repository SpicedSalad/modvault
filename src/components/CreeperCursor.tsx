"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function CreeperCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Use spring for smooth catching up
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(0, springConfig);
  const cursorYSpring = useSpring(0, springConfig);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  useEffect(() => {
    cursorXSpring.set(mousePosition.x);
    cursorYSpring.set(mousePosition.y);
  }, [mousePosition, cursorXSpring, cursorYSpring]);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 8 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-70"
      >
        <rect width="8" height="8" fill="#3f7614" />
        <rect x="1" y="2" width="2" height="2" fill="black" />
        <rect x="5" y="2" width="2" height="2" fill="black" />
        <rect x="3" y="4" width="2" height="3" fill="black" />
        <rect x="2" y="5" width="1" height="2" fill="black" />
        <rect x="5" y="5" width="1" height="2" fill="black" />
      </svg>
    </motion.div>
  );
}
