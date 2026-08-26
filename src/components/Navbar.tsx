import React from "react";
import { Zap, Award, LogOut, User, Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface NavbarProps {
  points: number;
  currentTab: "landing" | "dashboard" | "courses" | "active-course" | "admin" | "about";
  onTabChange: (tab: "landing" | "dashboard" | "courses" | "admin" | "about") => void;
  onOpenLogin: () => void;
}

export default function Navbar({
  points,
  currentTab,
  onTabChange,
  onOpenLogin,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, signOut } = useAuth();

  return (
    <header id="nav-header" className="sticky top-0 z-40 w-full bg-white/45 border-b border-white/40 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            id="nav-logo"
            onClick={() => onTabChange(user ? "dashboard" : "landing")}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/15 transition-transform group-hover:scale-105">
              <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-white">
                <Zap className="w-5 h-5 text-blue-600 transition-transform group-hover:rotate-12 fill-blue-50/50" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              BeTheBest
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav id="nav-desktop" className="hidden md:flex items-center space-x-1">
            {user ? (
              user.role === 'admin' ? (
                <button
                  id="nav-tab-admin"
                  onClick={() => onTabChange("admin")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    currentTab === "admin"
                      ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                      : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                  }`}
                >
                  Admin Control
                </button>
              ) : (
                <>
                  <button
                    id="nav-tab-dashboard"
                    onClick={() => onTabChange("dashboard")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      currentTab === "dashboard"
                        ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                        : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    id="nav-tab-courses"
                    onClick={() => onTabChange("courses")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      currentTab === "courses" || currentTab === "active-course"
                        ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                        : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                    }`}
                  >
                    Browse Courses
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  id="nav-tab-landing"
                  onClick={() => onTabChange("landing")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    currentTab === "landing"
                      ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                      : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                  }`}
                >
                  Home
                </button>
                <button
                  id="nav-tab-about"
                  onClick={() => onTabChange("about")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    currentTab === "about"
                      ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                      : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                  }`}
                >
                  About Us
                </button>
                <a
                  href="#"
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-transparent text-slate-600 hover:text-blue-600 hover:bg-white/40 transition-all"
                >
                  Success Stories
                </a>
                <a
                  href="#"
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-transparent text-slate-600 hover:text-blue-600 hover:bg-white/40 transition-all"
                >
                  News
                </a>
              </>
            )}

          </nav>

          {/* User & Action section */}
          <div id="nav-user-section" className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Points Counter */}
                {user.role !== 'admin' && (
                  <motion.div 
                    id="nav-points-tracker"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={points}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/50 text-blue-700 font-semibold text-sm shadow-sm backdrop-blur-sm"
                  >
                    <Award className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span className="font-mono">{points} pts</span>
                  </motion.div>
                )}

                {/* Profile Details */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-sm border border-white/50 shadow-sm">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  id="nav-logout-btn"
                  onClick={() => signOut()}
                  title="Logout"
                  className="p-2 rounded-xl border border-white/50 bg-white/35 backdrop-blur-sm text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  id="nav-login-text"
                  onClick={onOpenLogin}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  id="nav-login-btn"
                  onClick={onOpenLogin}
                  className="relative group overflow-hidden px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center space-x-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started</span>
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {user && user.role !== 'admin' && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/50 text-blue-700 font-semibold text-xs backdrop-blur-sm">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-mono">{points} pts</span>
              </div>
            )}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/40 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="nav-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/30 bg-white/70 backdrop-blur-xl"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <button
                      id="nav-mobile-tab-admin"
                      onClick={() => {
                        onTabChange("admin");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        currentTab === "admin"
                          ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                          : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                      }`}
                    >
                      Admin Control
                    </button>
                  ) : (
                    <>
                      <button
                        id="nav-mobile-tab-dashboard"
                        onClick={() => {
                          onTabChange("dashboard");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          currentTab === "dashboard"
                            ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                            : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        id="nav-mobile-tab-courses"
                        onClick={() => {
                          onTabChange("courses");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          currentTab === "courses" || currentTab === "active-course"
                            ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                            : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                        }`}
                      >
                        Browse Courses
                      </button>
                    </>
                  )}
                  <hr className="border-white/20 my-2" />
                  <div className="flex items-center justify-between px-4 py-2 bg-white/40 border border-white/50 rounded-xl">
                    <span className="text-xs text-slate-500">Logged in as</span>
                    <span className="text-xs font-semibold text-slate-700 max-w-[150px] truncate">
                      {user.name}
                    </span>
                  </div>
                  <button
                    id="nav-mobile-logout"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="nav-mobile-home"
                    onClick={() => {
                      onTabChange("landing");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      currentTab === "landing"
                        ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                        : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    id="nav-mobile-about"
                    onClick={() => {
                      onTabChange("about");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      currentTab === "about"
                        ? "text-blue-600 bg-white/60 border-white/50 font-semibold shadow-sm"
                        : "text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/40"
                    }`}
                  >
                    About Us
                  </button>
                  <a
                    href="#"
                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium border border-transparent text-slate-600 hover:text-blue-600 hover:bg-white/40 transition-all"
                  >
                    Success Stories
                  </a>
                  <a
                    href="#"
                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium border border-transparent text-slate-600 hover:text-blue-600 hover:bg-white/40 transition-all"
                  >
                    News
                  </a>
                  <hr className="border-white/20 my-2" />
                  <button
                    id="nav-mobile-login-text"
                    onClick={() => {
                      onOpenLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    id="nav-mobile-login"
                    onClick={() => {
                      onOpenLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
