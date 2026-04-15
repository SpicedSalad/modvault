"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Buttons";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Only for signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Transparent admin redirect — no UI change
        if (email === "omkarbichu0612@gmail.com") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          }
        });
        if (error) throw error;
        setShowCheckEmail(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetEmail) {
      setResetMessage("Please enter your email address.");
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      // Supabase v2: request password reset email
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail as string, { redirectTo });
      if (error) throw error;
      setResetMessage("If an account exists for that email, a reset link has been sent.");
      setResetEmail("");
    } catch (err: any) {
      setResetMessage(err.message || "Unable to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  if (showCheckEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full glass-panel border-pixel-gold-glow p-8 shadow-[0_0_50px_rgba(255,170,0,0.3)] relative mt-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-16 h-16 bg-gold/20 border-2 border-gold shadow-[0_0_20px_rgba(255,170,0,0.5)] flex items-center justify-center mb-8 relative">
             <div className="absolute inset-0 bg-gold/10 animate-pulse pointer-events-none"></div>
             <span className="font-pixel text-gold text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">!</span>
          </div>
          <h2 className="text-2xl font-pixel text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Check Your Inventory!</h2>
          <p className="text-zinc-300 font-sans mb-8 leading-relaxed">
            We've dropped a verification scroll into your email system. <br/><br/>
            Click the magical link inside it to authenticate your account and unlock the Vault!
          </p>
          <Button 
            onClick={() => {
              setIsLogin(true);
              setShowCheckEmail(false);
            }} 
            className="w-full justify-center"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel border-pixel-white-glow p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative mt-10">
        {/* Head Icons */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex space-x-4">
          <div className="w-20 h-20 glass-card border-pixel-white-glow shadow-[0_0_20px_rgba(255,255,255,0.2)] relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://mc-heads.net/avatar/Steve/80" 
              alt="Steve" 
              className={`w-full h-full object-cover transition-opacity duration-300 pixelated ${isLogin ? 'opacity-100' : 'opacity-40'}`}
            />
          </div>
          <div className="w-20 h-20 glass-card border-pixel-white-glow shadow-[0_0_20px_rgba(255,255,255,0.2)] relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://mc-heads.net/avatar/Alex/80" 
              alt="Alex" 
              className={`w-full h-full object-cover transition-opacity duration-300 pixelated ${!isLogin ? 'opacity-100' : 'opacity-40'}`}
            />
          </div>
        </div>

        <div className="mt-8 pt-4 overflow-visible">
          <h2 className="text-center text-2xl font-pixel text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] uppercase py-2 leading-normal whitespace-nowrap">
            {isLogin ? "Welcome Back" : "Join ModVault"}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 font-sans rounded-md backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="sr-only">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.6)] backdrop-blur-md rounded-md transition-all duration-300 sm:text-sm font-sans"
                  placeholder="Username"
                />
              </div>
            )}
            <div>
              <label className="sr-only">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.6)] backdrop-blur-md rounded-md transition-all duration-300 sm:text-sm font-sans"
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.6)] backdrop-blur-md rounded-md transition-all duration-300 sm:text-sm font-sans"
                placeholder="Password"
              />
              {!isLogin && <div className="mt-4"><PasswordStrengthIndicator password={password} /></div>}
            </div>
            {isLogin && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setResetEmail(email || "");
                    setResetMessage(null);
                  }}
                  className="text-sm text-gray-400 hover:text-gold underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-3 text-lg relative overflow-hidden group shadow-[0_0_20px_rgba(63,186,84,0.3)] hover:shadow-[0_0_30px_rgba(63,186,84,0.6)]"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>
              {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </div>
          
          {/* Password reset panel */}
          {showReset && (
            <div className="bg-black/50 border border-white/10 rounded-md p-4 mt-4">
              <h3 className="text-sm font-pixel text-yellow-300 mb-2">Reset Password</h3>
              {resetMessage && (
                <div className="text-sm text-gray-300 mb-2">{resetMessage}</div>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleResetPassword()}
                  disabled={resetLoading}
                  className="px-3 py-2 bg-gold text-black rounded-md text-sm font-pixel hover:brightness-105"
                >
                  {resetLoading ? "Sending…" : "Send"}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false);
                    setResetMessage(null);
                  }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="text-center font-sans text-sm text-gray-400">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="hover:text-gold transition-colors duration-300 underline decoration-gray-600 hover:decoration-gold/50 underline-offset-4"
            >
              {isLogin ? "Need an account? Sign up (Alex)" : "Already have an account? Log in (Steve)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
