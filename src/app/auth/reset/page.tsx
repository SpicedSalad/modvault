"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Buttons";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(true);
  const [sessionSet, setSessionSet] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Supabase v2 automatically parses the URL hash and fires PASSWORD_RECOVERY.
    // We just need to listen for the event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionSet(true);
          setLoading(false);
        }
      }
    );

    // Fallback: if there's already a session (e.g. hash was parsed before this mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionSet(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const submitNewPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setMessage(null);
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage("Password updated successfully. You are now signed in.");
    } catch (err: any) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-panel border-pixel-white-glow p-8">
        <h2 className="text-2xl font-pixel text-white mb-4">Reset Password</h2>

        {loading && <p className="text-sm text-gray-400">Validating reset link...</p>}

        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        {!loading && !sessionSet && !error && (
          <div className="text-sm text-gray-300 mb-3">No valid reset token found in the URL.</div>
        )}

        {!loading && sessionSet && (
          <form onSubmit={submitNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-pixel text-white mb-1 uppercase">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white"
                placeholder="Enter new password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Set new password"}
            </Button>

            {message && <div className="text-sm text-green-400">{message}</div>}
          </form>
        )}

        <div className="mt-4 text-sm text-gray-400">If the link doesn&apos;t work, request a new reset from the login page.</div>
      </div>
    </div>
  );
}
