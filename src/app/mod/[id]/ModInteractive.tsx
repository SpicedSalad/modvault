"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ModInteractive({
  tweakId,
  initialScore,
  initialUserVote,
  userId,
  initialImages,
  author,
  title
}: {
  tweakId: string;
  initialScore: number;
  initialUserVote: number;
  userId: string | null;
  initialImages: string[];
  author: any;
  title: string;
}) {
  const [currentImg, setCurrentImg] = useState(0);
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const supabase = createClient();

  const handleVote = async (value: number) => {
    if (!userId) {
      alert("Please login to vote!");
      return;
    }

    const newVote = userVote === value ? 0 : value; // toggle vote
    const scoreDiff = newVote - userVote;
    
    setScore(score + scoreDiff);
    setUserVote(newVote);

    if (newVote === 0) {
      await supabase.from("votes").delete().match({ user_id: userId, tweak_id: tweakId });
    } else {
      await supabase.from("votes").delete().match({ user_id: userId, tweak_id: tweakId });
      await supabase.from("votes").insert({ user_id: userId, tweak_id: tweakId, vote_value: newVote });
    }
  };

  const nextImg = () => setCurrentImg((prev) => (prev + 1) % initialImages.length);
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + initialImages.length) % initialImages.length);

  return (
    <div className="space-y-6">
      
      {/* Header and Vote */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black/40 border border-white/10 backdrop-blur-md shadow-sm overflow-hidden hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={author?.avatar_url || "https://mc-heads.net/avatar/Steve/64"} alt={author?.username} className="w-full h-full object-cover pixelated" />
          </div>
          <div>
            <h1 className="text-4xl font-pixel text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-0 pb-1 pt-2 leading-tight">{title}</h1>
            <p className="text-gray-400 font-sans text-sm">By <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#3fba54] drop-shadow-[0_0_10px_rgba(63,186,84,0.4)] font-bold py-1 leading-normal">{author?.username || 'Unknown'}</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center glass-card border border-white/10 p-2 min-w-[60px]">
          <button onClick={() => handleVote(1)} className={`p-1 transition-all ${userVote === 1 ? 'text-grass drop-shadow-[0_0_10px_rgba(63,186,84,0.8)] scale-110' : 'text-gray-500 hover:text-white'}`}>
            <ArrowUp className="w-6 h-6" strokeWidth={3} />
          </button>
          <span className={`flex items-center justify-center leading-none font-pixel text-lg my-1 ${userVote === 1 ? 'text-grass drop-shadow-[0_0_10px_rgba(63,186,84,0.5)]' : userVote === -1 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-white'}`}>{score}</span>
          <button onClick={() => handleVote(-1)} className={`p-1 transition-all ${userVote === -1 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] scale-110' : 'text-gray-500 hover:text-white'}`}>
            <ArrowDown className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Slider */}
      {initialImages.length > 0 ? (
        <div className="relative aspect-video glass-panel border-pixel-white-glow bg-black/80 backdrop-blur-3xl overflow-hidden group shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImg}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={initialImages[currentImg]} alt="Gallery slide" className="w-full h-full object-cover select-none" />
            </motion.div>
          </AnimatePresence>

          {initialImages.length > 1 && (
            <>
              <button 
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 border-pixel border-gray-500 hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 border-pixel border-gray-500 hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 bg-black/40 backdrop-blur-md px-3 py-2 border border-white/10">
                {initialImages.map((_, idx) => (
                  <div key={idx} className={`w-2.5 h-2.5 transition-all duration-300 ${idx === currentImg ? 'bg-grass scale-125 shadow-[0_0_10px_rgba(63,186,84,0.8)]' : 'bg-white/30 hover:bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative aspect-video glass-panel flex items-center justify-center shadow-xl border-pixel-white-glow bg-black/40">
           <span className="text-gray-500 font-pixel">No Images Provided</span>
        </div>
      )}
    </div>
  );
}
