"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TaggingSystem } from "./TaggingSystem";
import { Database, Tag, TweakFileForm } from "@/types/supabase";

type Tweak = Database["public"]["Tables"]["tweaks"]["Row"] & { tweak_files?: Database['public']['Tables']['tweak_files']['Row'][] };

export interface TweakSaveData {
  title: string;
  description: string;
  category: string;
  tags: Tag[];
  tweak_files: TweakFileForm[];
}

interface ModEditModalProps {
  isOpen: boolean;
  tweak: Tweak | null;
  onClose: () => void;
  onSave: (updatedTweak: TweakSaveData) => Promise<void>;
  isLoading?: boolean;
}

const LOADERS = ["Forge", "Fabric", "Quilt", "NeoForge"];

export function ModEditModal({
  isOpen,
  tweak,
  onClose,
  onSave,
  isLoading = false,
}: ModEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Mod" as const,
    tags: [] as Tag[],
    tweak_files: [{ mc_version: "", loader_type: "", download_url: "" }] as TweakFileForm[]
  });

  useEffect(() => {
    if (tweak) {
      setFormData({
        title: tweak.title || "",
        description: tweak.description || "",
        category: tweak.category as any,
        tags: Array.isArray(tweak.tags)
          ? tweak.tags.map((tag: any, idx: number) => ({
              id: `tag-${idx}`,
              name: typeof tag === "string" ? tag : tag.name,
              customDescription:
                typeof tag === "string" ? "" : tag.customDescription,
            }))
          : [],
        tweak_files: tweak.tweak_files && tweak.tweak_files.length > 0 
          ? tweak.tweak_files.map(f => ({ mc_version: f.mc_version, loader_type: f.loader_type, download_url: f.download_url }))
          : [{ mc_version: "", loader_type: "", download_url: "" }]
      });
    }
  }, [tweak, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-[4000] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-2 border-gold/30 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(255,170,0,0.2)]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0f1419] border-b border-gold/30 p-6 flex items-center justify-between">
              <h2 className="font-pixel text-2xl text-gold">Edit Mod</h2>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-pixel text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-pixel text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans"
                  rows={4}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-pixel text-white mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans"
                >
                  <option value="Mod">Mod</option>
                  <option value="Datapack">Datapack</option>
                  <option value="Resource Pack">Resource Pack</option>
                  <option value="Shader">Shader</option>
                </select>
              </div>

              {/* Tweak Files Array */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-pixel text-white">Download Versions</label>
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, tweak_files: [...formData.tweak_files, { mc_version: "", loader_type: "", download_url: "" }] })}
                    className="text-xs font-pixel text-grass hover:text-emerald-400"
                  >
                    + ADD ANOTHER
                  </button>
                </div>
                
                {formData.tweak_files.map((file, i) => (
                  <div key={i} className="p-4 border border-white/20 bg-black/40 rounded relative group">
                    {formData.tweak_files.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          const newFiles = formData.tweak_files.filter((_, idx) => idx !== i);
                          setFormData({ ...formData, tweak_files: newFiles });
                        }}
                        className="absolute top-2 right-2 text-white/50 hover:text-red-500 transition-colors z-10 hidden group-hover:block"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <input
                          required
                          placeholder="MC Version (eg. 1.20.1)"
                          value={file.mc_version}
                          onChange={e => {
                            const newFiles = [...formData.tweak_files];
                            newFiles[i].mc_version = e.target.value;
                            setFormData({ ...formData, tweak_files: newFiles });
                          }}
                          className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans text-sm"
                        />
                      </div>
                      <div>
                        <select
                          required
                          value={file.loader_type}
                          onChange={e => {
                            const newFiles = [...formData.tweak_files];
                            newFiles[i].loader_type = e.target.value;
                            setFormData({ ...formData, tweak_files: newFiles });
                          }}
                          className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans text-sm"
                        >
                          <option value="">Select loader...</option>
                          {LOADERS.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <input 
                        required 
                        type="url" 
                        value={file.download_url} 
                        onChange={e => {
                          const newFiles = [...formData.tweak_files];
                          newFiles[i].download_url = e.target.value;
                          setFormData({ ...formData, tweak_files: newFiles });
                        }} 
                        placeholder="Google Drive Link..."
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tagging System */}
              <TaggingSystem
                selectedTags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
              />

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/20 text-white rounded hover:border-white/40 transition-colors font-pixel disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-grass to-emerald-500 text-black rounded font-pixel font-bold hover:from-emerald-400 hover:to-emerald-600 transition-all shadow-[0_0_15px_rgba(63,186,84,0.4)] disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
