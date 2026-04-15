"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Buttons";
import { ModEditModal } from "@/components/ModEditModal";
import { TaggingSystem } from "@/components/TaggingSystem";
import { Database } from "@/types/supabase";
import { convertDriveLink } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

type Tweak = Database['public']['Tables']['tweaks']['Row'];

interface Tag {
  id: string;
  name: string;
  customDescription?: string;
}

export default function DashboardPage() {
  const [tweaks, setTweaks] = useState<Tweak[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingTweak, setEditingTweak] = useState<Tweak | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<'Mod' | 'Datapack' | 'Resource Pack' | 'Shader'>("Mod");
  const [tags, setTags] = useState<Tag[]>([]);
  const [driveLink, setDriveLink] = useState("");
  const [imageLinks, setImageLinks] = useState(""); // Comma separated

  const supabase = createClient();

  const fetchTweaks = async (uid: string) => {
    const { data } = await supabase.from("tweaks").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    if (data) setTweaks(data);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = "/auth";
      } else {
        setUserId(user.id);
        fetchTweaks(user.id);
      }
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const tagsArray = tags.map(t => ({ name: t.name, customDescription: t.customDescription }));
      
      const { data: tweakData, error: tweakError } = await supabase
        .from("tweaks")
        .insert({
          user_id: userId,
          title,
          description,
          category,
          drive_link: driveLink,
          tags: tagsArray
        })
        .select()
        .single();

      if (tweakError) throw tweakError;

      // Handle images
      const imagesArray = imageLinks.split(",").map(l => l.trim()).filter(Boolean);
      if (imagesArray.length > 0 && tweakData) {
        const imageInserts = imagesArray.map(img => ({
          tweak_id: tweakData.id,
          drive_image_url: img
        }));
        const { error: imgError } = await supabase.from("images").insert(imageInserts);
        if (imgError) throw imgError;
      }

      // Reset form
      setTitle("");
      setDescription("");
      setTags([]);
      setDriveLink("");
      setImageLinks("");
      
      fetchTweaks(userId);
      alert("Upload successful!");

    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleEditTweak = (tweak: Tweak) => {
    setEditingTweak(tweak);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedTweak = async (updatedData: Partial<Tweak> & { tags: Tag[] }) => {
    if (!editingTweak || !userId) return;

    setIsEditingSaving(true);
    try {
      const tagsArray = updatedData.tags.map(t => ({ name: t.name, customDescription: t.customDescription }));
      
      const { error: updateError } = await supabase
        .from("tweaks")
        .update({
          title: updatedData.title,
          description: updatedData.description,
          category: updatedData.category,
          minecraft_version: updatedData.minecraft_version,
          loader_type: updatedData.loader_type,
          drive_link: updatedData.drive_link,
          tags: tagsArray,
        })
        .eq("id", editingTweak.id);

      if (updateError) throw updateError;

      setIsEditModalOpen(false);
      setEditingTweak(null);
      fetchTweaks(userId);
      alert("Tweak updated successfully!");
    } catch (err: any) {
      alert("Error updating tweak: " + err.message);
    } finally {
      setIsEditingSaving(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tweak?")) return;
    try {
      const { error } = await supabase.from("tweaks").delete().eq("id", id);
      if (error) throw error;
      if (userId) fetchTweaks(userId);
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-white font-pixel text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-pixel text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.45)] mb-2 leading-tight">Dashboard</h1>
            <p className="text-gray-400 font-sans text-sm drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]">Manage your mods, datapacks, and shader uploads</p>
          </div>
          <Link 
            href="/profile/edit" 
            className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 border border-yellow-400/60 text-black rounded-sm font-pixel text-xs font-bold hover:from-yellow-400 hover:to-amber-400 transition-all shadow-[0_0_20px_rgba(250,204,21,0.5)] whitespace-nowrap"
          >
            ⚙️ SETTINGS
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Form */}
          <div className="lg:col-span-1">
            <div className="glass-panel border-pixel-white-glow p-8 h-fit sticky top-20">
              <h2 className="font-pixel text-yellow-300 text-2xl drop-shadow-[0_0_14px_rgba(250,204,21,0.4)] mb-1 leading-normal">NEW UPLOAD</h2>
              <p className="text-gray-400 font-sans text-xs mb-6">Add a new mod or tweak</p>
              
              <form onSubmit={handleUpload} className="space-y-5 font-sans">
                {/* Title */}
                <div>
                  <label className="block text-white text-xs font-pixel mb-2 uppercase tracking-wide">Title</label>
                  <input 
                    required 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Mod name..."
                    className="w-full px-3 py-2.5 border border-white/10 bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] backdrop-blur-md rounded-sm transition-all duration-300 text-sm"
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-white text-xs font-pixel mb-2 uppercase tracking-wide">Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value as any)} 
                    className="w-full px-3 py-2.5 border border-white/10 bg-black/50 text-white focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] backdrop-blur-md rounded-sm transition-all duration-300 text-sm"
                  >
                    <option value="Mod">Mod</option>
                    <option value="Datapack">Datapack</option>
                    <option value="Resource Pack">Resource Pack</option>
                    <option value="Shader">Shader</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white text-xs font-pixel mb-2 uppercase tracking-wide">Description</label>
                  <textarea 
                    required 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Describe your mod..."
                    rows={3} 
                    className="w-full px-3 py-2.5 border border-white/10 bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] backdrop-blur-md rounded-sm transition-all duration-300 text-sm font-sans resize-none"
                  />
                </div>

                {/* Tagging */}
                <div>
                  <label className="block text-white text-xs font-pixel mb-3 uppercase tracking-wide">Tags</label>
                  <TaggingSystem selectedTags={tags} onChange={setTags} />
                </div>

                {/* File Link */}
                <div>
                  <label className="block text-white text-xs font-pixel mb-2 uppercase tracking-wide">Download Link</label>
                  <input 
                    required 
                    type="url" 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)} 
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 border border-white/10 bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] backdrop-blur-md rounded-sm transition-all duration-300 text-sm"
                  />
                </div>

                {/* Image Links */}
                <div>
                  <label className="block text-white text-xs font-pixel mb-2 uppercase tracking-wide">Image URLs (comma-separated)</label>
                  <textarea 
                    value={imageLinks} 
                    onChange={e => setImageLinks(e.target.value)} 
                    placeholder="https://... (optional)"
                    rows={2} 
                    className="w-full px-3 py-2.5 border border-white/10 bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.4)] backdrop-blur-md rounded-sm transition-all duration-300 text-sm font-sans resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full mt-6 py-2.5 relative overflow-hidden group shadow-[0_0_20px_rgba(63,186,84,0.3)] hover:shadow-[0_0_30px_rgba(63,186,84,0.6)] font-pixel text-sm uppercase tracking-widest"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>
                  Upload Tweak
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column - Tweaks List */}
          <div className="lg:col-span-2">
            <div className="glass-panel border-pixel-white-glow p-8">
              <h2 className="font-pixel text-yellow-300 text-2xl drop-shadow-[0_0_14px_rgba(250,204,21,0.4)] mb-1 leading-normal">YOUR UPLOADS</h2>
              <p className="text-gray-400 font-sans text-xs mb-6">{tweaks.length} total upload{tweaks.length !== 1 ? 's' : ''}</p>

              {tweaks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-6xl mb-4 opacity-20">📦</div>
                  <p className="text-gray-400 font-sans text-sm mb-2">No uploads yet</p>
                  <p className="text-gray-500 font-sans text-xs">Create your first mod upload above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tweaks.map((tweak, index) => (
                    <div 
                      key={tweak.id} 
                      className="group/card bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-sm p-4 hover:border-grass/50 hover:shadow-[0_0_20px_rgba(63,186,84,0.2)] transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                            <h3 className="text-white font-pixel text-sm drop-shadow-[0_0_8px_rgba(255,255,255,0.08)] flex-1">{tweak.title}</h3>
                            <span className="text-gray-500 font-sans text-xs whitespace-nowrap">#{index + 1}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="inline-block bg-grass/20 text-grass/80 px-2 py-1 rounded-sm border border-grass/30 text-xs font-pixel">
                              {tweak.category}
                            </span>
                            <span className="text-gray-500 font-sans text-xs">
                              {new Date(tweak.created_at).toLocaleDateString()}
                            </span>
                            {tweak.minecraft_version && (
                              <span className="text-gray-500 font-sans text-xs">
                                v{tweak.minecraft_version}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button 
                            onClick={() => handleEditTweak(tweak)} 
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-sm text-xs font-pixel hover:bg-blue-600/40 hover:border-blue-500/60 transition-all duration-200 whitespace-nowrap"
                          >
                            <Edit2 size={13} />
                            EDIT
                          </button>
                          <button 
                            onClick={() => handleDelete(tweak.id)} 
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600/20 border border-red-500/40 text-red-300 rounded-sm text-xs font-pixel hover:bg-red-600/40 hover:border-red-500/60 transition-all duration-200 whitespace-nowrap"
                          >
                            <Trash2 size={13} />
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ModEditModal
        isOpen={isEditModalOpen}
        tweak={editingTweak}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTweak(null);
        }}
        onSave={handleSaveEditedTweak}
        isLoading={isEditingSaving}
      />
    </div>
  );
}
