"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { convertDriveLink, parseTag } from "@/lib/utils";
import { Trash2, Shield, Search, ChevronDown } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Mod: "#b82bf2",
  Datapack: "#f28b2b",
  "Resource Pack": "#2bcbf2",
  Shader: "#3fba54",
};

export function AdminPanel({ tweaks: initialTweaks }: { tweaks: any[] }) {
  const [tweaks, setTweaks] = useState(initialTweaks);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const supabase = createClient();

  const filtered = tweaks.filter((t) => {
    const matchCat = categoryFilter === "All" || t.category === categoryFilter;
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      t.title?.toLowerCase().includes(s) ||
      t.profiles?.username?.toLowerCase().includes(s);
    return matchCat && matchSearch;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("tweaks").delete().eq("id", id);
      if (error) throw error;
      setTweaks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div
        className="border-b border-red-900/40 bg-black/60 backdrop-blur-md sticky top-0 z-50"
        style={{ boxShadow: "0 0 30px rgba(200,0,0,0.15)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-red-400 w-6 h-6" />
            <h1 className="font-pixel text-red-400 text-xl tracking-wide">
              Admin Panel
            </h1>
            <span className="font-sans text-xs text-gray-500 ml-2 bg-red-900/30 border border-red-900/50 px-2 py-0.5 rounded">
              omkarbichu0612@gmail.com
            </span>
          </div>
          <div className="font-pixel text-gray-500 text-sm">
            {tweaks.length} total mods
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or uploader..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 text-white placeholder-gray-600 font-sans text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 rounded-sm"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-black/40 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-red-500/50 rounded-sm cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Mod">Mod</option>
              <option value="Datapack">Datapack</option>
              <option value="Resource Pack">Resource Pack</option>
              <option value="Shader">Shader</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Mod", "Datapack", "Resource Pack", "Shader"].map((cat) => {
            const count = tweaks.filter((t) => t.category === cat).length;
            const color = CATEGORY_COLORS[cat] || "#fff";
            return (
              <div
                key={cat}
                className="bg-black/40 border border-white/5 p-3 rounded-sm"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="font-sans text-xs text-gray-500 uppercase tracking-wider">{cat}</div>
                <div className="font-pixel text-xl mt-1" style={{ color }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Results count */}
        <div className="font-sans text-sm text-gray-500">
          Showing {filtered.length} of {tweaks.length} mods
          {search && ` matching "${search}"`}
        </div>

        {/* Mod list table */}
        <div className="border border-white/5 rounded-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto_80px] gap-4 px-5 py-3 bg-white/5 border-b border-white/5 font-sans text-xs text-gray-500 uppercase tracking-wider">
            <span>Title</span>
            <span>Uploader</span>
            <span>Category</span>
            <span className="text-center">↑</span>
            <span className="text-center">💬</span>
            <span className="text-center">Action</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center font-sans text-gray-600">
              No mods found.
            </div>
          ) : (
            filtered.map((tweak) => {
              const score =
                (tweak.votes?.filter((v: any) => v.vote_value === 1).length || 0) -
                (tweak.votes?.filter((v: any) => v.vote_value === -1).length || 0);
              const comments = tweak.comments?.length || 0;
              const color = CATEGORY_COLORS[tweak.category] || "#aaa";
              const thumb = tweak.images?.[0]?.drive_image_url;
              const isDeleting = deletingId === tweak.id;

              return (
                <div
                  key={tweak.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_auto_auto_80px] gap-4 px-5 py-3.5 border-b border-white/5 items-center transition-colors ${
                    isDeleting ? "opacity-40" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Title + thumbnail */}
                  <div className="flex items-center gap-3 min-w-0">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={convertDriveLink(thumb)}
                        alt=""
                        className="w-9 h-9 object-cover flex-shrink-0 pixelated border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-white/5 border border-white/10 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <a
                        href={`/mod/${tweak.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm text-white hover:text-gold truncate block transition-colors"
                      >
                        {tweak.title}
                      </a>
                      <span className="font-sans text-xs text-gray-600 truncate block">
                        {new Date(tweak.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Uploader */}
                  <span className="font-sans text-sm text-gray-400 truncate">
                    {tweak.profiles?.username || "—"}
                  </span>

                  {/* Category badge */}
                  <span
                    className="font-sans text-xs px-2 py-0.5 rounded-sm border w-fit"
                    style={{ color, borderColor: color + "40", background: color + "15" }}
                  >
                    {tweak.category}
                  </span>

                  {/* Score */}
                  <span className="font-sans text-sm text-gray-400 text-center">
                    {score >= 0 ? "+" : ""}{score}
                  </span>

                  {/* Comments */}
                  <span className="font-sans text-sm text-gray-400 text-center">
                    {comments}
                  </span>

                  {/* Delete */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleDelete(tweak.id, tweak.title)}
                      disabled={isDeleting}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/60 hover:border-red-500/60 hover:text-red-300 transition-all text-xs font-sans rounded-sm disabled:opacity-40"
                      title={`Delete "${tweak.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isDeleting ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
