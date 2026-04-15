"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TaggingSystem } from "./TaggingSystem";
import { Database } from "@/types/supabase";

type Tweak = Database["public"]["Tables"]["tweaks"]["Row"];

interface Tag {
  id: string;
  name: string;
  customDescription?: string;
}

interface ModEditModalProps {
  isOpen: boolean;
  tweak: Tweak | null;
  onClose: () => void;
  onSave: (updatedTweak: Partial<Tweak> & { tags: Tag[] }) => Promise<void>;
  isLoading?: boolean;
}

const LOADERS = ["Forge", "Fabric", "Quilt", "NeoForge"];
const MINECRAFT_VERSIONS = [
  "1.20.1",
  "1.20",
  "1.19.2",
  "1.19.1",
  "1.19",
  "1.18.2",
  "1.17.1",
];

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
    minecraft_version: "",
    loader_type: "",
    drive_link: "",
    tags: [] as Tag[],
  });

  useEffect(() => {
    if (tweak) {
      setFormData({
        title: tweak.title || "",
        description: tweak.description || "",
        category: tweak.category as any,
        minecraft_version: tweak.minecraft_version || "",
        loader_type: tweak.loader_type || "",
        drive_link: tweak.drive_link || "",
        tags: Array.isArray(tweak.tags)
          ? tweak.tags.map((tag: any, idx: number) => ({
              id: `tag-${idx}`,
              name: typeof tag === "string" ? tag : tag.name,
              customDescription:
                typeof tag === "string" ? "" : tag.customDescription,
            }))
          : [],
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

              {/* Minecraft Version & Loader */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-pixel text-white mb-2">
                    Minecraft Version
                  </label>
                  <select
                    value={formData.minecraft_version}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minecraft_version: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans"
                  >
                    <option value="">Select version...</option>
                    {MINECRAFT_VERSIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-pixel text-white mb-2">
                    Loader Type
                  </label>
                  <select
                    value={formData.loader_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loader_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans"
                  >
                    <option value="">Select loader...</option>
                    {LOADERS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drive Link */}
              <div>
                <label className="block text-sm font-pixel text-white mb-2">
                  Download Link
                </label>
                <input
                  type="url"
                  value={formData.drive_link}
                  onChange={(e) =>
                    setFormData({ ...formData, drive_link: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-black/40 border border-white/20 text-white rounded focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass font-sans"
                  placeholder="https://..."
                />
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
