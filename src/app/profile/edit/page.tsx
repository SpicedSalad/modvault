"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Buttons";
import Link from "next/link";
import { ArrowLeft, Loader } from "lucide-react";

export default function ProfileEditPage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/auth";
          return;
        }

        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUsername(profile.username || "");
          setAvatarUrl(profile.avatar_url || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: avatarUrl,
        })
        .eq("id", userId);

      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-grass" size={32} />
          <p className="font-pixel text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard">
          <button className="inline-flex items-center gap-2 mb-8 text-grass hover:text-emerald-300 transition-colors font-pixel">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-pixel text-white mb-2">Edit Profile</h1>
          <p className="text-zinc-400 font-sans">
            Update your username and avatar settings
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="glass-panel border-pixel-white-glow p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-4 rounded-md">
              Profile updated successfully!
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-pixel text-white mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.6)] backdrop-blur-md rounded-md transition-all duration-300 font-sans"
              placeholder="Your username"
              required
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-pixel text-white mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.6)] backdrop-blur-md rounded-md transition-all duration-300 font-sans"
              placeholder="https://example.com/avatar.png"
            />
            {avatarUrl && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 font-sans mb-2">Preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-md border border-white/10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <Link href="/dashboard" className="flex-1">
              <button
                type="button"
                className="w-full px-4 py-3 bg-black/40 border border-white/20 text-white rounded font-pixel hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-grass to-emerald-500 text-black rounded font-pixel font-bold hover:from-emerald-400 hover:to-emerald-600 transition-all shadow-[0_0_15px_rgba(63,186,84,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
