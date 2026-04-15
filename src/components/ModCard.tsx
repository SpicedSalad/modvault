"use client";

import Link from "next/link";
import { Database } from "@/types/supabase";
import { convertDriveLink } from "@/lib/utils";
import { DefaultBlockPlaceholder } from "@/components/DefaultBlockPlaceholder";
import { ArrowUp, MessageSquare } from "lucide-react";
import { useRef, useState } from "react";

type Tweak = Database['public']['Tables']['tweaks']['Row'];

export function ModCard({ 
  tweak, 
  thumbnailUrl, 
  upvotes = 0, 
  commentsCount = 0 
}: { 
  tweak: Tweak;
  thumbnailUrl?: string;
  upvotes?: number;
  commentsCount?: number;
}) {
  const imageUrl = thumbnailUrl ? convertDriveLink(thumbnailUrl) : null;
  const [imageError, setImageError] = useState(false);
  const shouldShowPlaceholder = !imageUrl || imageError;

  const categoryColors: Record<string, string> = {
    'Mod': '#b82bf2',
    'Datapack': '#f28b2b',
    'Resource Pack': '#2bcbf2',
    'Shader': '#3fba54'
  };
  const themeColor = categoryColors[tweak.category] || '#3fba54';

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Magnetic mathematical tilt boundaries
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <Link href={`/mod/${tweak.id}`} className="block group perspective-1000">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass-card flex flex-col h-full relative overflow-hidden group-hover:-translate-y-2 transition-all duration-300 ease-out z-10"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
          transformStyle: "preserve-3d",
          boxShadow: `
            inset 4px 0 0 0 rgba(255,255,255,0.2),
            inset 0 4px 0 0 rgba(255,255,255,0.2),
            inset -4px 0 0 0 rgba(0,0,0,0.4),
            inset 0 -4px 0 0 rgba(0,0,0,0.4),
            0 0 0 4px ${themeColor},
            0 0 24px ${themeColor}60
          `,
          borderRadius: '0px',
          border: 'none',
          '--hover-glow': themeColor,
        } as React.CSSProperties}
      >
        {/* Dynamic Category Overlay Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 70%)` }}
        />

        {/* Image Container */}
        <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden border-b border-white/5">
          {/* Subtle Inner Image Glow */}
          <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${themeColor}40` }}></div>
          
          {shouldShowPlaceholder ? (
            <DefaultBlockPlaceholder />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageUrl} 
              alt={tweak.title}
              className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 pixelated opacity-90 group-hover:opacity-100" 
              onError={() => setImageError(true)}
            />
          )}
          <div 
            className="absolute top-3 right-3 px-3 py-1 text-[10px] font-sans tracking-widest uppercase font-bold text-white rounded backdrop-blur-md bg-black/40 border border-white/20 shadow-lg z-20"
            style={{ textShadow: `0 0 10px ${themeColor}, 0 0 20px ${themeColor}` }}
          >
            {tweak.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 relative z-10">
          <h3 className="font-pixel text-white text-lg mb-2 truncate transition-colors duration-300" style={{ '--hover-color': themeColor } as any} title={tweak.title}>
            <span className="group-hover:!text-[var(--hover-color)]">{tweak.title}</span>
          </h3>
          <p className="text-gray-300 text-sm font-sans line-clamp-2 mb-4 flex-1">
            {tweak.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tweak.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-[#1a1a1a] text-gray-300 px-2 py-1 rounded-sm border border-gray-700">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-gray-400 text-sm font-sans mt-auto border-t border-gray-700 pt-3">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 group-hover:text-grass transition-colors">
                <ArrowUp className="w-4 h-4" />
                <span>{upvotes}</span>
              </span>
              <span className="flex items-center space-x-1 group-hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>{commentsCount}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
