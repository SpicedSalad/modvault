"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  customDescription?: string;
}

interface TaggingSystemProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

const PREDEFINED_TAGS = [
  "Optimization",
  "Adventure",
  "Tech",
  "Magic",
  "Building",
  "Gameplay",
  "Visual",
  "Performance",
];

export function TaggingSystem({ selectedTags, onChange }: TaggingSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>(
    selectedTags.reduce(
      (acc, tag) => ({
        ...acc,
        [tag.id]: tag.customDescription || "",
      }),
      {}
    )
  );

  const toggleTag = (tagName: string) => {
    const existingTag = selectedTags.find((t) => t.name === tagName);

    if (existingTag) {
      onChange(selectedTags.filter((t) => t.name !== tagName));
      setCustomDescriptions((prev) => {
        const newDescriptions = { ...prev };
        delete newDescriptions[existingTag.id];
        return newDescriptions;
      });
    } else {
      const newTag: Tag = {
        id: `tag-${Date.now()}-${Math.random()}`,
        name: tagName,
        customDescription: "",
      };
      onChange([...selectedTags, newTag]);
    }
  };

  const updateTagDescription = (tagId: string, description: string) => {
    setCustomDescriptions((prev) => ({
      ...prev,
      [tagId]: description,
    }));

    const updatedTags = selectedTags.map((tag) =>
      tag.id === tagId ? { ...tag, customDescription: description } : tag
    );
    onChange(updatedTags);
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter((t) => t.id !== tagId));
    setCustomDescriptions((prev) => {
      const newDescriptions = { ...prev };
      delete newDescriptions[tagId];
      return newDescriptions;
    });
  };

  const tagColors: Record<string, string> = {
    Optimization: "text-green-400",
    Adventure: "text-orange-400",
    Tech: "text-blue-400",
    Magic: "text-purple-400",
    Building: "text-yellow-400",
    Gameplay: "text-red-400",
    Visual: "text-pink-400",
    Performance: "text-cyan-400",
  };

  const availableTags = PREDEFINED_TAGS.filter(
    (tag) => !selectedTags.some((t) => t.name === tag)
  );

  return (
    <div className="space-y-4">
      {/* Tag Dropdown */}
      <div className="relative">
        <label className="block text-white text-xs font-pixel mb-2 uppercase tracking-wide">
          Select Tags
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 border border-white/10 bg-black/50 text-white focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] backdrop-blur-md rounded-sm transition-all duration-300 text-sm flex items-center justify-between hover:border-white/20"
        >
          <span className="text-gray-400">
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""} selected`
              : "Choose tags..."}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 bg-black/90 border border-white/20 backdrop-blur-md rounded-sm shadow-lg"
            >
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        toggleTag(tag);
                        if (availableTags.length === 1) setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-sm hover:bg-white/10 transition-colors text-sm text-gray-300 hover:text-white font-sans"
                    >
                      + {tag}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs text-center py-2">All tags selected</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="space-y-2">
            {selectedTags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-3 rounded-sm bg-black/40 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-pixel text-xs uppercase tracking-wide ${tagColors[tag.name] || "text-gray-400"}`}>
                    {tag.name}
                  </span>
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={customDescriptions[tag.id] || ""}
                  onChange={(e) => updateTagDescription(tag.id, e.target.value)}
                  placeholder="Add description (optional)..."
                  className="w-full px-2 py-1.5 bg-black/30 border border-white/10 text-white text-xs rounded-sm placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none font-sans"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
