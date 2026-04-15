"use client";

import Link from "next/link";
import { Button } from "./ui/Buttons";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

import Image from "next/image";

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="w-full bg-black/60 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <div className="flex items-center space-x-0">
          <Link href="/" className="flex items-center group">
            <div className="relative w-96 h-24">
              <Image 
                src="/logo_v2.png" 
                alt="ModVault Logo" 

                fill
                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_4px_12px_rgba(126,189,75,0.4)] group-hover:scale-105 transition-all duration-300"
                priority
              />
            </div>
          </Link>
          <div className="hidden md:flex space-x-6 -ml-12">
            <Link href="/discover" className="text-gray-300 hover:text-white font-pixel text-sm tracking-widest uppercase transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              Discover
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-300 hover:text-white font-pixel text-sm tracking-widest uppercase transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group transition-all duration-300">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-grass transition-colors duration-300" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="Search mods, resource packs..." 
              className="w-full bg-black/40 border border-white/5 text-white py-2 pl-10 pr-4 outline-none font-sans placeholder-gray-600 rounded-md focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] transition-all duration-300 backdrop-blur-md"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <button 
              onClick={handleLogout}
              className="relative px-5 py-2 font-pixel text-xs font-bold tracking-widest text-red-100 bg-red-950/40 border-2 border-red-500/50 rounded-sm overflow-hidden group transition-all duration-300 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <span className="relative z-10 pt-1 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">LOGOUT</span>
            </button>
          ) : (
            <Link href="/auth">
              <button className="relative px-5 py-2 font-pixel text-xs font-bold tracking-widest text-white bg-grass/20 border-2 border-grass/50 rounded-sm overflow-hidden group transition-all duration-300 hover:border-grass hover:shadow-[0_0_20px_rgba(63,186,84,0.6)] active:scale-[0.98]">
                <div className="absolute inset-0 bg-grass/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen pointer-events-none"></div>
                <span className="relative z-10 pt-1 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">LOGIN</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
