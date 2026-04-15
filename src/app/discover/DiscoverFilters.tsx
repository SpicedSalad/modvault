"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function DiscoverFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort") || "upvotes";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0 glass-panel border-pixel-white-glow p-6 relative ml-1 mt-1">
      <h2 className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 text-xl mb-6 py-1 leading-normal drop-shadow-[0_2px_10px_rgba(255,170,0,0.3)]">Filters</h2>
      
      <div className="mb-6">
        <h3 className="text-white font-sans text-sm tracking-wider uppercase font-bold mb-4 opacity-80">Category</h3>
        <div className="space-y-3">
          {["Mod", "Datapack", "Resource Pack", "Shader"].map(cat => {
            const isActive = currentCategory === cat;
            
            // Build the URL for this category toggle
            const params = new URLSearchParams(searchParams.toString());
            if (isActive) {
              params.delete("category");
            } else {
              params.set("category", cat);
            }
            const href = `/discover?${params.toString()}`;

            return (
              <Link key={cat} href={href} className="flex items-center space-x-3 text-zinc-400 font-sans cursor-pointer group">
                <div className="relative flex items-center justify-center p-0.5 rounded shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-black/50 border border-white/10 group-hover:border-grass/50 transition-colors">
                  <div className={`w-4 h-4 transition-colors ${isActive ? 'bg-grass' : 'bg-transparent'}`} />
                </div>
                <span className={`transition-colors ${isActive ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'group-hover:text-white'}`}>{cat}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-white font-sans text-sm tracking-wider uppercase font-bold mb-4 opacity-80">Sort By</h3>
        <div className="relative group">
          <select 
            className="w-full bg-black/40 border border-white/10 focus:border-grass focus:ring-1 focus:ring-grass rounded-md text-white px-3 py-2.5 font-sans outline-none transition-all appearance-none cursor-pointer hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
            value={currentSort}
            onChange={handleSortChange}
          >
            <option value="upvotes" className="bg-zinc-900">Highest Rated</option>
            <option value="recent" className="bg-zinc-900">Recently Added</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
