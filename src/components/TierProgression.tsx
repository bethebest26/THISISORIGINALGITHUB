import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, Trophy, Compass, Mountain, Gem, ArrowUpCircle, ShieldCheck, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { UserProgress, Course } from "../types";
import { getTierInfo, getTierIndex } from "../utils";

interface TierProgressionProps {
  progress: UserProgress;
  courses: Course[];
  onSimulateCourses?: (count: number) => void;
}

export default function TierProgression({ progress, courses, onSimulateCourses }: TierProgressionProps) {
  const completedCoursesCount = progress.completedCoursesCount || 0;
  const totalCoursesCount = courses.length;

  const currentTierIndex = getTierIndex(completedCoursesCount);

  // Active slider index state (starts focused on the user's current tier!)
  const [activeIndex, setActiveIndex] = useState(currentTierIndex);

  // Monitor screen width for responsive rendering layout adjustments
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync index if backend progress shifts in active session
  useEffect(() => {
    setActiveIndex(currentTierIndex);
  }, [currentTierIndex]);

  // Swipe / Touch interactions
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const mouseDownX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swipe Left -> Next
      if (activeIndex < 4) {
        setActiveIndex((prev) => prev + 1);
      }
    } else if (diff < -45) {
      // Swipe Right -> Prev
      if (activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      touchEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = mouseDownX.current - touchEndX.current;
    if (diff > 45) {
      if (activeIndex < 4) {
        setActiveIndex((prev) => prev + 1);
      }
    } else if (diff < -45) {
      if (activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else if (e.key === "ArrowRight" && activeIndex < 4) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  // Tiers and criteria configuration
  const tiers = [
    {
      id: "Rookie",
      title: "Rookie",
      feeling: "Curiosity • Potential • First Step",
      requirement: "Rookie requirement: 0–25 completed courses.",
      progressPercent: completedCoursesCount >= 25 ? 100 : Math.round((completedCoursesCount / 25) * 100),
      progressText: completedCoursesCount >= 25 ? "25 / 25 Courses" : `${completedCoursesCount} / 25 Courses`,
      isUnlocked: true,
      isCurrent: currentTierIndex === 0,
      badge: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28">
          <defs>
            <radialGradient id="rookie-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rookie-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
            <linearGradient id="rookie-needle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#rookie-glow)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="url(#rookie-ring)" strokeWidth="2.5" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="34" fill="white" fillOpacity="0.95" stroke="#DBEAFE" strokeWidth="1" />
          <g transform="translate(50, 50) rotate(45)">
            <path d="M0 -24 L7 0 L0 7 L-7 0 Z" fill="url(#rookie-needle)" />
            <path d="M0 24 L7 0 L0 7 L-7 0 Z" fill="#93C5FD" />
            <circle cx="0" cy="0" r="4" fill="white" />
          </g>
          <line x1="50" y1="18" x2="50" y2="23" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="77" x2="50" y2="82" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "Grounded",
      title: "Grounded",
      feeling: "Stability • Foundations • Practice",
      requirement: "Grounded requirement: 26–150 completed courses.",
      progressPercent: completedCoursesCount < 26 ? 0 : completedCoursesCount >= 150 ? 100 : Math.round(((completedCoursesCount - 25) / (150 - 25)) * 100),
      progressText: completedCoursesCount >= 26 ? (completedCoursesCount >= 150 ? "150 / 150 Courses" : `${completedCoursesCount} / 150 Courses`) : "Locked (26+ needed)",
      isUnlocked: completedCoursesCount >= 26,
      isCurrent: currentTierIndex === 1,
      badge: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28">
          <defs>
            <radialGradient id="grounded-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="peak-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="peak-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#grounded-glow)" />
          <line x1="15" y1="72" x2="85" y2="72" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M18 72 L38 42 L52 72 Z" fill="url(#peak-grad-2)" opacity="0.85" />
          <path d="M48 72 L68 46 L82 72 Z" fill="url(#peak-grad-2)" opacity="0.7" />
          <path d="M30 72 L50 32 L70 72 Z" fill="url(#peak-grad-1)" />
          <path d="M50 32 L50 72 L70 72 Z" fill="white" fillOpacity="0.1" />
        </svg>
      ),
    },
    {
      id: "Sharpened",
      title: "Sharpened",
      feeling: "Refinement • Skill • Focus",
      requirement: "Sharpened requirement: 151–500 completed courses.",
      progressPercent: completedCoursesCount < 151 ? 0 : completedCoursesCount >= 500 ? 100 : Math.round(((completedCoursesCount - 150) / (500 - 150)) * 100),
      progressText: completedCoursesCount >= 151 ? (completedCoursesCount >= 500 ? "500 / 500 Courses" : `${completedCoursesCount} / 500 Courses`) : "Locked (151+ needed)",
      isUnlocked: completedCoursesCount >= 151,
      isCurrent: currentTierIndex === 2,
      badge: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28">
          <defs>
            <radialGradient id="sharp-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gem-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="gem-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#sharp-glow)" />
          <g transform="translate(0, 5)">
            <path d="M32 35 L68 35 L58 22 L42 22 Z" fill="#93C5FD" fillOpacity="0.5" stroke="#FFFFFF" strokeWidth="0.5" />
            <path d="M42 22 L58 22 L50 48 Z" fill="url(#gem-grad-right)" stroke="#FFFFFF" strokeWidth="0.5" />
            <path d="M32 35 L42 22 L50 48 Z" fill="url(#gem-grad-left)" stroke="#FFFFFF" strokeWidth="0.5" />
            <path d="M68 35 L58 22 L50 48 Z" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.5" />
            <path d="M32 35 L50 48 L50 74 Z" fill="url(#gem-grad-left)" stroke="#FFFFFF" strokeWidth="0.5" />
            <path d="M68 35 L50 48 L50 74 Z" fill="url(#gem-grad-right)" stroke="#FFFFFF" strokeWidth="0.5" />
          </g>
        </svg>
      ),
    },
    {
      id: "Elevated",
      title: "Elevated",
      feeling: "Perspective • Mastery • Integration",
      requirement: "Elevated requirement: 501–1000 completed courses.",
      progressPercent: completedCoursesCount < 501 ? 0 : completedCoursesCount >= 1000 ? 100 : Math.round(((completedCoursesCount - 500) / (1000 - 500)) * 100),
      progressText: completedCoursesCount >= 501 ? (completedCoursesCount >= 1000 ? "1000 / 1000 Courses" : `${completedCoursesCount} / 1000 Courses`) : "Locked (501+ needed)",
      isUnlocked: completedCoursesCount >= 501,
      isCurrent: currentTierIndex === 3,
      badge: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28">
          <defs>
            <radialGradient id="elevated-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="wing-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="wing-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#elevated-glow)" />
          <ellipse cx="50" cy="74" rx="28" ry="6" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
          <ellipse cx="50" cy="74" rx="20" ry="4" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />
          <path d="M50 68 C34 58 18 52 14 36 C18 36 28 42 34 48 C28 32 20 24 18 16 C24 22 34 32 38 42 C38 28 34 18 36 10 C40 18 46 28 50 44 Z" fill="url(#wing-grad-left)" />
          <path d="M50 68 C66 58 82 52 86 36 C82 36 72 42 66 48 C72 32 80 24 82 16 C76 22 66 32 62 42 C62 28 66 18 64 10 C60 18 54 28 50 44 Z" fill="url(#wing-grad-right)" />
        </svg>
      ),
    },
    {
      id: "Unshakable",
      title: "Unshakable",
      feeling: "Discipline • Integrity • Peak Form",
      requirement: "Unshakable requirement: 1001–1500 completed courses.",
      progressPercent: completedCoursesCount < 1001 ? 0 : completedCoursesCount >= 1500 ? 100 : Math.round(((completedCoursesCount - 1000) / (1500 - 1000)) * 100),
      progressText: completedCoursesCount >= 1001 ? (completedCoursesCount >= 1500 ? "1500 / 1500 Courses" : `${completedCoursesCount} / 1500 Courses`) : "Locked (1001+ needed)",
      isUnlocked: completedCoursesCount >= 1001,
      isCurrent: currentTierIndex === 4,
      badge: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28">
          <defs>
            <radialGradient id="unshakable-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#unshakable-glow)" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6" />
          <g transform="translate(0, 4)">
            <path d="M22 60 L78 60 L74 66 L26 66 Z" fill="url(#crown-gold)" stroke="#FFFFFF" strokeWidth="0.5" />
            <rect x="28" y="61" width="44" height="2" fill="#93C5FD" opacity="0.8" />
            <path d="M22 60 L18 36 L34 50 L50 24 L66 50 L82 36 L78 60 Z" fill="url(#crown-gold)" stroke="#FFFFFF" strokeWidth="0.75" />
            <circle cx="18" cy="35" r="2" fill="#60A5FA" />
            <circle cx="50" cy="23" r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="82" cy="35" r="2" fill="#60A5FA" />
            <path d="M50 42 L55 50 L50 58 L45 50 Z" fill="#E0F2FE" stroke="#3B82F6" strokeWidth="1" />
          </g>
        </svg>
      ),
    },
  ];

  // Dynamic card offset styles for the 3D-snapped swipe track
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    let translateXPercent = diff * 80; // Default adjacent cards visible on sides
    if (isTablet) translateXPercent = diff * 58;
    if (!isMobile && !isTablet) translateXPercent = diff * 48;

    const scale = index === activeIndex ? 1 : 0.91;
    const opacity = Math.abs(diff) > 1 ? 0 : index === activeIndex ? 1 : 0.45;
    const zIndex = index === activeIndex ? 10 : 5 - Math.abs(diff);
    const pointerEvents = index === activeIndex ? ("auto" as const) : ("none" as const);
    const filter = index === activeIndex ? "none" : "blur(1px)";

    return {
      transform: `translateX(${translateXPercent}%) scale(${scale})`,
      opacity,
      zIndex,
      pointerEvents,
      filter,
      transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
    };
  };

  const activeTier = tiers[currentTierIndex];
  const overallCompletionPercent = totalCoursesCount > 0 ? Math.round((completedCoursesCount / totalCoursesCount) * 100) : 0;

  return (
    <div className="flex flex-col space-y-4 w-full max-w-4xl mx-auto focus:outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Swipe Gallery Section */}
      <div className="relative w-full overflow-hidden pt-2 md:pt-4">
        {/* Navigation Arrows for desktop/tablet overlayed cleanly */}
        {activeIndex > 0 && (
          <button
            onClick={() => setActiveIndex((prev) => prev - 1)}
            className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/90 border border-slate-200 shadow-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Previous Tier"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {activeIndex < 4 && (
          <button
            onClick={() => setActiveIndex((prev) => prev + 1)}
            className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/90 border border-slate-200 shadow-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Next Tier"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Snapped Slide Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative w-full h-[500px] overflow-hidden flex items-center justify-center py-4 select-none cursor-grab active:cursor-grabbing"
        >
          {tiers.map((tier, idx) => {
            const isCurrentActive = idx === currentTierIndex;
            return (
              <motion.div
                key={tier.id}
                style={getCardStyle(idx)}
                className={`w-[290px] sm:w-[330px] md:w-[365px] h-[450px] bg-white border rounded-[28px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between absolute overflow-hidden ${
                  tier.isCurrent
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_20px_40px_rgba(37,99,235,0.12)]"
                    : "border-slate-200/80"
                }`}
              >
                {/* Active/Unlocked Header Ribbon */}
                {isCurrentActive && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Current Rank
                  </div>
                )}

                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                      LEVEL 0{idx + 1}
                    </span>
                    <div>
                      {tier.isUnlocked ? (
                        <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 uppercase">
                          <Unlock className="w-2.5 h-2.5" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 uppercase">
                          <Lock className="w-2.5 h-2.5" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Icon & Glow */}
                  <div className="flex flex-col items-center py-2 relative">
                    {/* Visual subtle pulse glow around the active user's tier */}
                    {tier.isCurrent && (
                      <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl scale-110 animate-pulse pointer-events-none" />
                    )}
                    <div 
                      className={`relative transition-all duration-300 ${
                        tier.isUnlocked 
                          ? "scale-100 grayscale-0 filter-none opacity-100 drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]" 
                          : "scale-90 grayscale opacity-40"
                      }`}
                    >
                      {tier.badge}
                    </div>
                  </div>

                  {/* Title & Slogan */}
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-bold text-slate-800 tracking-tight font-display">
                      {tier.title}
                    </h4>
                    <p className="text-xs text-slate-400 italic">"{tier.feeling}"</p>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-slate-500 leading-snug">
                      {tier.requirement}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-mono">{tier.progressText}</span>
                      <span className="text-slate-600 font-mono font-bold">
                        {tier.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          tier.isUnlocked ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-slate-300"
                        }`}
                        style={{ width: `${tier.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Page Navigation Indicators (Dots) */}
      <div className="flex items-center justify-center space-x-2.5 pt-1">
        {tiers.map((tier, idx) => {
          const isUserCurrent = idx === currentTierIndex;
          const isActive = idx === activeIndex;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none relative ${
                isActive
                  ? "w-8 bg-blue-600"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to tier ${idx + 1}`}
            >
              {isUserCurrent && !isActive && (
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-60" />
              )}
            </button>
          );
        })}
      </div>


    </div>
  );
}
