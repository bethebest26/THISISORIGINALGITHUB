import React, { useState, useEffect } from "react";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle, X, Phone, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { dbService } from "../services/dbService";

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Listen for Google OAuth callback success from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Allow run.app origins and localhost
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('3000')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log("OAuth Authentication succeeded via popup window.");
        onClose();
        // Trigger page re-check/refresh
        window.dispatchEvent(new Event("storage"));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true, // Return URL without hard redirecting iframe
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open the popup centered on screen
        const popupWidth = 600;
        const popupHeight = 700;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;
        
        const authWindow = window.open(
          data.url, 
          'bethebest_google_oauth_popup', 
          `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`
        );

        if (!authWindow) {
          setErrors({ general: "Popup blocked! Please allow popups for this site to log in with Google." });
        }
      } else {
        throw new Error("No OAuth URL returned by provider.");
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const emailTrimmed = email.trim();

    // Check for Master Admin login
    if (!isSignUp && (emailTrimmed.toUpperCase() === "RUSSIANCHODO" || emailTrimmed.toLowerCase() === "admin@bethebest.com") && password === "AURRUSSIANCHODO") {
      const adminUser = {
        id: "admin-id-RUSSIANCHODO",
        email: "admin@bethebest.com",
        name: "Master Admin",
        full_name: "Master Admin",
        role: "admin" as const,
        age: 99,
        whatsapp_number: "N/A",
        auth_provider: 'email' as const
      };
      localStorage.setItem("bethebest_admin_session", JSON.stringify(adminUser));
      setIsLoading(false);
      onClose();
      window.dispatchEvent(new Event("storage"));
      return;
    }

    try {
      if (isSignUp) {
        if (!name.trim() || !age.trim() || !whatsapp.trim() || !emailTrimmed || !password.trim()) {
          setErrors({ general: "All fields are strictly required for registration." });
          setIsLoading(false);
          return;
        }

        const parsedAge = parseInt(age);
        if (isNaN(parsedAge) || parsedAge <= 0) {
          setErrors({ general: "Please enter a valid age." });
          setIsLoading(false);
          return;
        }

        // 1. Sign up in Supabase auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: emailTrimmed,
          password,
          options: { 
            data: { 
              full_name: name,
              age: parsedAge,
              whatsapp_number: whatsapp,
              role: 'buyer',
              auth_provider: 'email'
            } 
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // 2. Save inside profile tables
          await dbService.saveUserProfile(authData.user.id, {
            name,
            email: emailTrimmed,
            age: parsedAge,
            whatsapp_number: whatsapp,
            role: 'buyer',
            auth_provider: 'email'
          });
        }

        setErrors({ general: "Verification email dispatched! Please verify your inbox or log in if auto-verified." });
      } else {
        // Sign in standard buyer
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailTrimmed,
          password,
        });

        if (signInError) throw signInError;
        onClose();
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[10px]">
      {/* Animated gradient behind card */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

      <motion.div
        id="login-card"
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 25, scale: 0.96 }}
        transition={{ type: "spring", damping: 24, stiffness: 190 }}
        className="relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-[32px] border border-white/50 bg-white/45 p-8 shadow-[0_24px_60px_-15px_rgba(0,102,255,0.08)] backdrop-blur-2xl"
      >
        {/* Background glow node decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="login-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/15 mb-3">
            <div className="flex items-center justify-center w-full h-full rounded-[14px] bg-white">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-slate-800">
            {isSignUp ? "Join BeTheBest" : "Access Portal"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isSignUp ? "Build character, confidence and earn tiers" : "Sign in to resume your personal development path"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs"
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Field (Sign Up Only) */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-4"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Dev"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 text-sm bg-white/30 backdrop-blur-sm focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Age & WhatsApp */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Age *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 21"
                        min="1"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 text-sm bg-white/30 backdrop-blur-sm focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      WhatsApp *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="WhatsApp Number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 text-sm bg-white/30 backdrop-blur-sm focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {isSignUp ? "Email Address *" : "Username or Email *"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSignUp ? "you@example.com" : "Username or Email"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 text-sm bg-white/30 backdrop-blur-sm focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/50 text-sm bg-white/30 backdrop-blur-sm focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Create Account" : "Access Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/50" />
          </div>
          <span className="relative bg-[#eceef4]/90 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm">Or continue with</span>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white shadow-sm rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.1.1 3.03H12a2.3 2.3 0 0 1 2.31-2.31h1.43c-.87-.8-2.03-1.28-3.34-1.28-2.73 0-5.04 1.84-5.87 4.31H1.21v3.42c1.7 3.39 5.21 5.72 9.29 5.72 4.33 0 7.96-1.43 10.61-3.9l-4.14-3.21c-1.15.77-2.62 1.23-4.13 1.23-3.18 0-5.87-2.15-6.83-5.06h4.14v-.01z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3c-1.08.72-2.46 1.16-4.09 1.16-3.15 0-5.81-2.13-6.77-5.01H1.14v3.13C3.12 21.6 8.1 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.23 14.24a7.14 7.14 0 0 1 0-4.48V6.63H1.14a11.94 11.94 0 0 0 0 10.74l4.09-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 8.1 0 3.12 2.4 1.14 5.74l4.09 3.13c.96-2.88 3.62-5.01 6.77-5.01z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Suggest Credentials */}
        {!isSignUp && (
          <div className="mt-4 p-2.5 rounded-lg bg-blue-50/50 border border-blue-500/10 text-[11px] text-blue-700 text-center font-medium">
            💡 Testing? Use <span className="underline font-mono">guest@bethebest.com</span> with <span className="underline font-mono">password</span>, or Admin: <span className="underline font-mono">RUSSIANCHODO</span> / <span className="underline font-mono">AURRUSSIANCHODO</span>
          </div>
        )}

        {/* Toggle between login/signup */}
        <div className="text-center mt-6 text-sm">
          <span className="text-slate-500">
            {isSignUp ? "Already have an account? " : "New to BeTheBest? "}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Register Now"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
