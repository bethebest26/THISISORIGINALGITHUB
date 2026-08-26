import { useState, useEffect } from "react";
import { User, UserProgress, Course } from "../types";
import { Award, BookOpen, Star, Sparkles, TrendingUp, Zap, ChevronRight, CheckCircle, CheckCircle2, ShieldCheck, X, Clock, Tag, Eye, Lock, Play, User as UserIcon, Activity, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TierProgression from "./TierProgression";
import { getTierInfo, getTierIndex } from "../utils";
import CountdownTimer, { getLaunchTimestamp } from "./CountdownTimer";
import { dbService } from "../services/dbService";

interface DashboardProps {
  user: User;
  progress: UserProgress;
  courses: Course[];
  unlockedVersions?: string[];
  purchaseDetails?: Record<string, { purchasedAt: string, expiresAt: string }>;
  activityLog?: any[];
  onTabChange: (tab: any) => void;
  onSelectCourse: (course: Course, volumeId: number) => void;
  onSimulateCourses?: (count: number) => void;
  onBuyCourse?: (course: Course, volumeId: number) => void;
}

export default function Dashboard({
  user,
  progress,
  courses,
  unlockedVersions = [],
  purchaseDetails = {},
  activityLog = [],
  onTabChange,
  onSelectCourse,
  onSimulateCourses,
  onBuyCourse,
}: DashboardProps) {
  // Drawer visibility state
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
    const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [selectedPreviewVolume, setSelectedPreviewVolume] = useState<number>(1);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Sync selectedPreviewVolume when previewCourse changes
  useEffect(() => {
    if (previewCourse) {
      const volKeys = Object.keys(previewCourse.volumes || {}).map(Number);
      if (volKeys.length > 0) {
        setSelectedPreviewVolume(Math.min(...volKeys));
      } else {
        setSelectedPreviewVolume(1);
      }
    }
  }, [previewCourse]);

  useEffect(() => {
    const targetTime = getLaunchTimestamp() + 48 * 60 * 60 * 1000;
    const checkRelease = () => {
    };
    checkRelease();
    const interval = setInterval(checkRelease, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lock background scroll when drawer or preview is open
  useEffect(() => {
    if (isJourneyOpen || previewCourse) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isJourneyOpen, previewCourse]);

  // Handle Escape key press to close drawer or preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsJourneyOpen(false);
        setPreviewCourse(null);
      }
    };
    if (isJourneyOpen || previewCourse) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isJourneyOpen, previewCourse]);

  // Compute metrics
  const totalPoints = progress.points;
  const completedCoursesCount = progress.completedCoursesCount || 0;
  const completedCount = completedCoursesCount; // Compatibility alias
  const unlockedCount = progress.unlockedCourses.length;
  const totalCoursesCount = courses.length;

  const [globalRank, setGlobalRank] = useState<number | null>(null);

  // Compute quiz accuracy
  const answeredList = Object.values(progress.answeredQuestions || {});
  const totalAttempted = answeredList.length;
  const correctCount = answeredList.filter((q: any) => q.isCorrect).length;
  const avgAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  // Real-time Tier Calculation from database-stored completed course count
  const currentTierInfo = getTierInfo(completedCoursesCount);
  const currentTierName = currentTierInfo.title;
  const currentTierIndex = currentTierInfo.index;
  const tagline = currentTierInfo.feeling;

  // Helper to compute course progress percent
  const getCourseProgressPercent = (course: Course) => {
    let totalMCQs = 0;
    let answeredMCQs = 0;
    
    if (course.volumes) {
      const volumesList = Array.isArray(course.volumes) 
        ? course.volumes 
        : Object.values(course.volumes);
        
      volumesList.forEach((vol: any) => {
        if (vol && vol.blocks) {
          vol.blocks.forEach((block: any) => {
            if (block.mcq && block.mcq.id) {
              totalMCQs++;
              if (progress.answeredQuestions[block.mcq.id]) {
                answeredMCQs++;
              }
            }
          });
        }
      });
    }
    
    if (totalMCQs === 0) return 0;
    return Math.min(100, Math.round((answeredMCQs / totalMCQs) * 100));
  };

  // Find in-progress course
  let inProgressCourse: Course | null = null;
  let inProgressVolumeId = 1;
  let inProgressPercent = 0;

  // 1. Check localStorage for last launched
  const lastLaunchedStr = localStorage.getItem(`bethebest_last_launched_${user.email.toLowerCase()}`);
  if (lastLaunchedStr) {
    try {
      const lastLaunched = JSON.parse(lastLaunchedStr);
      const course = courses.find(c => c.id === lastLaunched.courseId);
      if (course && !progress.completedCourses?.includes(String(course.id))) {
        inProgressCourse = course;
        inProgressVolumeId = lastLaunched.volumeId || 1;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 2. If not found in localStorage or if completed, find the first course with some answers
  if (!inProgressCourse) {
    for (const course of courses) {
      if (course.status === 'draft') continue;
      const percent = getCourseProgressPercent(course);
      if (percent > 0 && percent < 100 && !progress.completedCourses?.includes(String(course.id))) {
        inProgressCourse = course;
        inProgressPercent = percent;
        inProgressVolumeId = 1;
        if (course.volumes) {
          const vols = Array.isArray(course.volumes) ? course.volumes : Object.values(course.volumes);
          for (const vol of vols) {
            const hasAnswers = (vol as any).blocks?.some((b: any) => b.mcq && progress.answeredQuestions[b.mcq.id]);
            if (hasAnswers) {
              inProgressVolumeId = Number((vol as any).id) || 1;
              break;
            }
          }
        }
        break;
      }
    }
  }

  // Calculate percentage if not already calculated
  if (inProgressCourse && inProgressPercent === 0) {
    inProgressPercent = getCourseProgressPercent(inProgressCourse);
  }

  // Fetch ranking and calculate dynamic leaderboard position
  useEffect(() => {
    dbService.getAdminPerformanceTracking()
      .then(records => {
        if (records && records.length > 0) {
          const email = user.email.toLowerCase();
          const sortedRecords = [...records];
          
          // Add ourselves if not present
          const hasMe = sortedRecords.some(r => r.userEmail?.toLowerCase() === email);
          if (!hasMe) {
            sortedRecords.push({
              userId: user.id || "me",
              userName: user.name || "You",
              userEmail: email,
              totalPoints: totalPoints,
              userAge: 0,
              userWhatsapp: "",
              purchasedVersions: [],
              mcqPerformance: {},
              currentTier: currentTierName
            });
          } else {
            const meIndex = sortedRecords.findIndex(r => r.userEmail?.toLowerCase() === email);
            if (meIndex !== -1) {
              sortedRecords[meIndex].totalPoints = Math.max(sortedRecords[meIndex].totalPoints, totalPoints);
            }
          }
          
          sortedRecords.sort((a, b) => {
            const pointsA = a.totalPoints || 0;
            const pointsB = b.totalPoints || 0;
            if (pointsA !== pointsB) return pointsB - pointsA;
            return 0; // Remove tiebreaker that artificially lowers the current user
          });
          
          const myRankIndex = sortedRecords.findIndex(r => r.userEmail?.toLowerCase() === email);
          const myRank = myRankIndex !== -1 ? myRankIndex + 1 : sortedRecords.length + 1;
          setGlobalRank(myRank);
        } else {
          setGlobalRank(1);
        }
      })
      .catch(err => {
        console.error("Error calculating global rank:", err);
        setGlobalRank(1);
      });
  }, [user.email, totalPoints, currentTierName]);

  // Next tier info
  const nextTierInfo = currentTierIndex < 4 ? getTierInfo(currentTierInfo.maxCourses + 1) : null;
  const nextTierName = nextTierInfo ? nextTierInfo.title : "";

  // Progress within current tier
  let progressPercent = 0;
  let progressText = "";

  if (currentTierIndex === 0) {
    progressPercent = Math.round((completedCoursesCount / 25) * 100);
    progressText = `${completedCoursesCount} / 25 Courses Completed`;
  } else if (currentTierIndex === 1) {
    progressPercent = Math.round(((completedCoursesCount - 25) / (150 - 25)) * 100);
    progressText = `${completedCoursesCount} / 150 Courses Completed`;
  } else if (currentTierIndex === 2) {
    progressPercent = Math.round(((completedCoursesCount - 150) / (500 - 150)) * 100);
    progressText = `${completedCoursesCount} / 500 Courses Completed`;
  } else if (currentTierIndex === 3) {
    progressPercent = Math.round(((completedCoursesCount - 500) / (1000 - 500)) * 100);
    progressText = `${completedCoursesCount} / 1000 Courses Completed`;
  } else if (currentTierIndex === 4) {
    progressPercent = Math.min(100, Math.round(((completedCoursesCount - 1000) / (1500 - 1000)) * 100));
    progressText = completedCoursesCount >= 1500 ? "✅ Maximum Tier Achieved" : `${completedCoursesCount} / 1500 Courses Completed`;
  }
  progressPercent = Math.min(100, Math.max(0, progressPercent));

  // Inline badge SVGs matching the Tier Achievement Journey perfectly
  const renderWidgetBadge = (tier: string) => {
    switch (tier) {
      case "Rookie":
        return (
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
            <defs>
              <radialGradient id="rookie-glow-widget" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rookie-ring-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="rookie-needle-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#rookie-glow-widget)" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="url(#rookie-ring-widget)" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="50" cy="50" r="34" fill="white" fillOpacity="0.8" stroke="#DBEAFE" strokeWidth="1" />
            <g transform="translate(50, 50) rotate(45)">
              <path d="M0 -22 L6 0 L0 6 L-6 0 Z" fill="url(#rookie-needle-widget)" />
              <path d="M0 22 L6 0 L0 6 L-6 0 Z" fill="#93C5FD" />
              <circle cx="0" cy="0" r="3" fill="white" />
            </g>
            <line x1="50" y1="20" x2="50" y2="24" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="76" x2="50" y2="80" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M72 24 L74 29 L79 29 L75 32 L77 37 L72 34 L67 37 L69 32 L65 29 L70 29 Z" fill="#FBBF24" />
          </svg>
        );
      case "Grounded":
        return (
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
            <defs>
              <radialGradient id="grounded-glow-widget" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="peak-grad-1-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="peak-grad-2-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#grounded-glow-widget)" />
            <line x1="15" y1="72" x2="85" y2="72" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M18 72 L38 42 L52 72 Z" fill="url(#peak-grad-2-widget)" opacity="0.85" />
            <path d="M48 72 L68 46 L82 72 Z" fill="url(#peak-grad-2-widget)" opacity="0.7" />
            <path d="M30 72 L50 32 L70 72 Z" fill="url(#peak-grad-1-widget)" />
            <path d="M50 32 L50 72 L70 72 Z" fill="white" fillOpacity="0.1" />
            <circle cx="50" cy="24" r="2.5" fill="#60A5FA" className="animate-pulse" />
          </svg>
        );
      case "Sharpened":
        return (
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
            <defs>
              <radialGradient id="sharp-glow-widget" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="gem-grad-left-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="gem-grad-right-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#sharp-glow-widget)" />
            <g transform="translate(0, 5)">
              <path d="M32 35 L68 35 L58 22 L42 22 Z" fill="#93C5FD" fillOpacity="0.5" stroke="#FFFFFF" strokeWidth="0.5" />
              <path d="M42 22 L58 22 L50 48 Z" fill="url(#gem-grad-right-widget)" stroke="#FFFFFF" strokeWidth="0.5" />
              <path d="M32 35 L42 22 L50 48 Z" fill="url(#gem-grad-left-widget)" stroke="#FFFFFF" strokeWidth="0.5" />
              <path d="M68 35 L58 22 L50 48 Z" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.5" />
              <path d="M32 35 L50 48 L50 74 Z" fill="url(#gem-grad-left-widget)" stroke="#FFFFFF" strokeWidth="0.5" />
              <path d="M68 35 L50 48 L50 74 Z" fill="url(#gem-grad-right-widget)" stroke="#FFFFFF" strokeWidth="0.5" />
            </g>
            <circle cx="24" cy="30" r="1.5" fill="#22D3EE" className="animate-pulse" />
            <circle cx="78" cy="45" r="2" fill="#60A5FA" className="animate-pulse" />
          </svg>
        );
      case "Elevated":
        return (
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
            <defs>
              <radialGradient id="elevated-glow-widget" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="wing-grad-left-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="wing-grad-right-widget" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#elevated-glow-widget)" />
            <ellipse cx="50" cy="74" rx="28" ry="6" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            <ellipse cx="50" cy="74" rx="20" ry="4" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />
            <path d="M50 68 C34 58 18 52 14 36 C18 36 28 42 34 48 C28 32 20 24 18 16 C24 22 34 32 38 42 C38 28 34 18 36 10 C40 18 46 28 50 44 Z" fill="url(#wing-grad-left-widget)" />
            <path d="M50 68 C66 58 82 52 86 36 C82 36 72 42 66 48 C72 32 80 24 82 16 C76 22 66 32 62 42 C62 28 66 18 64 10 C60 18 54 28 50 44 Z" fill="url(#wing-grad-right-widget)" />
            <circle cx="50" cy="50" r="3" fill="#F59E0B" className="animate-pulse" />
          </svg>
        );
      case "Unshakable":
        return (
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
            <defs>
              <radialGradient id="unshakable-glow-widget" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="crown-gold-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#unshakable-glow-widget)" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6" />
            <g transform="translate(0, 4)">
              <path d="M22 60 L78 60 L74 66 L26 66 Z" fill="url(#crown-gold-widget)" stroke="#FFFFFF" strokeWidth="0.5" />
              <rect x="28" y="61" width="44" height="2" fill="#93C5FD" opacity="0.8" />
              <path d="M22 60 L18 36 L34 50 L50 24 L66 50 L82 36 L78 60 Z" fill="url(#crown-gold-widget)" stroke="#FFFFFF" strokeWidth="0.75" />
              <circle cx="18" cy="35" r="2" fill="#60A5FA" />
              <circle cx="50" cy="23" r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="0.5" />
              <circle cx="82" cy="35" r="2" fill="#60A5FA" />
              <path d="M50 42 L55 50 L50 58 L45 50 Z" fill="#E0F2FE" stroke="#3B82F6" strokeWidth="1" />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  // Stagger animation container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div id="dashboard-view" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Onboarding Banner */}
      <AnimatePresence>
        {completedCount === 0 && showOnboarding && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            className="relative overflow-hidden rounded-3xl bg-blue-50 border border-blue-200/60 p-5 pr-12 text-blue-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-600 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm tracking-tight text-blue-900">Onboarding Guide</h4>
                <p className="text-xs text-blue-700 font-medium mt-0.5">
                  Start your first course to activate your journey
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => onTabChange("courses")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Browse Courses
              </button>
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 sm:top-1/2 sm:-translate-y-1/2 p-2 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 transition-colors cursor-pointer"
              aria-label="Dismiss onboarding guide"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 p-8 sm:p-10 text-white shadow-xl glow-blue"
      >
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none -ml-20 -mb-20" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Cognitive Trajectory Active</span>
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight leading-none">
              Welcome, {user.name}
            </h1>
            <p className="text-blue-100 max-w-xl text-sm sm:text-base font-light">
              The system rewards those who show up. Every rep, every answer, every chapter — your growth compounds only when you do the work.
            </p>
          </div>

          <div
            onClick={() => setIsJourneyOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsJourneyOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="View current tier progress and open tier journey panel"
            className="w-full md:w-80 bg-white/10 p-5 rounded-[20px] border border-white/20 backdrop-blur-md shadow-lg flex flex-col space-y-3 shrink-0 self-stretch md:self-auto hover:-translate-y-1 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            {/* Top Shield Header */}
            <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-100 animate-pulse" />
              <span>CURRENT TIER</span>
            </div>

            {/* Main Badge & Info Row */}
            <div className="flex items-center space-x-4">
              <div className="relative shrink-0 p-1 rounded-full bg-white/10 border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {/* Subtle glow behind badge */}
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md pointer-events-none" />
                <div className="relative z-10">
                  {renderWidgetBadge(currentTierName)}
                </div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xl font-bold font-display tracking-tight text-white leading-tight">
                  {currentTierName}
                </h3>
                <p className="text-[11px] text-blue-100 font-light leading-snug line-clamp-2 italic">
                  "{tagline}"
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-blue-100">
                  {nextTierName ? `Progress to ${nextTierName}` : "Maximum Tier Achieved"}
                </span>
                <span className="text-cyan-200 font-mono font-bold">{progressPercent}%</span>
              </div>
              
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-300"
                />
              </div>

              {/* View Tier Journey Button */}
              <div className="pt-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs rounded-full flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-300 border border-white/10"
                >
                  <span>View Tier Journey</span>
                  <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Learning Section */}
      {inProgressCourse && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 shadow-md border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
          
          <div className="flex-1 space-y-2">
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              <Clock className="w-3.5 h-3.5 animate-pulse text-blue-500" />
              <span>Continue Learning</span>
            </span>
            <h3 className="font-display font-bold text-lg text-slate-800 leading-snug">
              {inProgressCourse.title}
            </h3>
            <div className="flex items-center space-x-3 max-w-md">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${inProgressPercent}%` }}
                  className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                />
              </div>
              <span className="text-xs font-mono font-bold text-blue-600">{inProgressPercent}%</span>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center space-x-2">
            <button
              onClick={() => onSelectCourse(inProgressCourse!, inProgressVolumeId)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Resume Lecture
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Completed Courses Card */}
        <motion.div
          variants={item}
          className="glass-card glass-card-hover rounded-3xl p-6 shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">COURSES FINISHED</p>
            <p className="text-3xl font-bold font-display text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              {completedCount} <span className="text-sm font-medium text-slate-400">COMPLETED</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>{completedCount} of {courses.length} courses completed</span>
            </p>
            {completedCount === 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onTabChange("courses"); }}
                className="mt-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-1 cursor-pointer"
              >
                <span>Browse Courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="p-4 rounded-xl bg-white/40 border border-white/50 text-blue-600 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Courses Card */}
        <motion.div
          variants={item}
          className="glass-card glass-card-hover rounded-3xl p-6 shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL COURSES AVAILABLE</p>
            <p className="text-3xl font-bold font-display text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              {courses.length} <span className="text-sm font-medium text-slate-400">ACTIVE</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Explore the full catalog</span>
            </p>
            {courses.length === 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onTabChange("courses"); }}
                className="mt-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-1 cursor-pointer"
              >
                <span>Browse Courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="p-4 rounded-xl bg-white/40 border border-white/50 text-cyan-600 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Level Progress Circle / Bar */}
        <motion.div
          variants={item}
          className="glass-card glass-card-hover rounded-3xl p-6 shadow-sm sm:col-span-2 lg:col-span-1"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier Progression</p>
              <span className="text-xs font-mono font-bold text-blue-600">
                {progressPercent}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-900/[0.05] h-2.5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
              />
            </div>

            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>{progressText}</span>
              <span>{nextTierName ? `Next: ${nextTierName}` : "Max Tier"}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Performance Hub Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {/* Streak Card */}
        <motion.div
          variants={item}
          className="glass-card glass-card-hover rounded-3xl p-6 shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Streak Counter</p>
            <p className="text-2xl font-bold font-display text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
              🔥 Day {progress.streakCount || 1} <span className="text-xs font-bold text-slate-400">STREAK</span>
            </p>
            <p className="text-xs text-slate-400 leading-normal">
              {progress.streakCount && progress.streakCount > 1 
                ? "Consecutive daily learning active!" 
                : "Log in tomorrow to grow your streak!"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-orange-50 text-orange-500 group-hover:scale-110 transition-transform shrink-0">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
          </div>
        </motion.div>

        {/* Global Rank Card */}
        <motion.div
          variants={item}
          className="glass-card glass-card-hover rounded-3xl p-6 shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Global Leaderboard</p>
            <p className="text-2xl font-bold font-display text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              #{globalRank !== null ? globalRank : "124"} <span className="text-xs font-bold text-slate-400">RANK</span>
            </p>
            <p className="text-xs text-slate-400 leading-normal">
              Based on your global {totalPoints} Points
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Quiz Accuracy Card */}
        <motion.div
          variants={item}
          className="glass-card glass-card-hover rounded-3xl p-6 shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quiz Evaluations</p>
            <p className="text-2xl font-bold font-display text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
              {avgAccuracy}% <span className="text-xs font-bold text-slate-400">ACCURACY</span>
            </p>
            <p className="text-xs text-slate-400 leading-normal">
              {totalAttempted} question{totalAttempted !== 1 ? "s" : ""} answered
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* Suggested Course / Resume Learning section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10">
        {/* Left: Continued learning cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-slate-800 tracking-tight flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>Recommended Courses</span>
            </h2>
            <button
              onClick={() => onTabChange("courses")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>See all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.slice(0, 4).map((course, idx) => {
              const v1Key = `${course.id}-1`;
              const v2Key = `${course.id}-2`;
              
              const pDetailsV1 = purchaseDetails[v1Key] || purchaseDetails["1"];
              const pDetailsV2 = purchaseDetails[v2Key] || purchaseDetails["2"];
              
              const now = Date.now();
              const isV1Expired = pDetailsV1 && new Date(pDetailsV1.expiresAt).getTime() < now;
              const v1DaysLeft = pDetailsV1 && !isV1Expired ? Math.max(0, Math.ceil((new Date(pDetailsV1.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;
              const isV2Expired = pDetailsV2 && new Date(pDetailsV2.expiresAt).getTime() < now;
              const v2DaysLeft = pDetailsV2 && !isV2Expired ? Math.max(0, Math.ceil((new Date(pDetailsV2.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;
              
              const isVol1Unlocked = (progress.unlockedVol1Courses?.includes(String(course.id)) || unlockedVersions.includes("1") || unlockedVersions.includes(v1Key)) && !isV1Expired;
              const isVol2Unlocked = (progress.unlockedCourses.includes(String(course.id)) || unlockedVersions.includes("2") || unlockedVersions.includes(v2Key)) && !isV2Expired;

              return (
                <div 
                  key={course.id}
                  className="group relative overflow-hidden w-full h-full glass-card rounded-3xl p-5 shadow-sm border border-slate-200/50 flex flex-col justify-between gap-4 transition-all duration-300 glass-card-hover"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="w-full h-32 rounded-xl overflow-hidden shrink-0 border border-white/40 bg-slate-900">
                      <img 
                        src={course.bannerUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block text-[10px] font-semibold text-blue-600 bg-white/40 border border-white/50 px-2 py-0.5 rounded-full mb-1">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-800 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 w-full mt-2">
                    <button
                      onClick={() => setPreviewCourse(course)}
                      className="w-full py-2 rounded-xl border border-blue-200 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50/50 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview Course</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {isVol1Unlocked ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => onSelectCourse(course, 1)}
                            className="py-2 rounded-xl border border-white/50 text-xs font-semibold text-blue-600 bg-white/45 backdrop-blur-sm hover:bg-white/55 active:scale-[0.98] transition-all cursor-pointer text-center"
                          >
                            Vol 1 {v1DaysLeft !== null ? `(${v1DaysLeft}d left)` : ''}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              if (onBuyCourse) {
                                onBuyCourse(course, 1);
                              }
                            }}
                            className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 border border-blue-500/10 shadow-sm transition-all cursor-pointer flex justify-center items-center space-x-1"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{isV1Expired ? `Buy Again - ₹${course.price || 499}` : `Buy Now - ₹${course.price || 499}`}</span>
                          </button>
                          {isV1Expired && pDetailsV1 && (
                             <span className="text-[9px] text-rose-500 mt-1 leading-tight text-center">Expired on {new Date(pDetailsV1.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}

                      {isVol2Unlocked ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => onSelectCourse(course, 2)}
                            className="py-2 rounded-xl text-xs font-semibold text-emerald-600 bg-white/40 hover:bg-white/60 border border-white/50 transition-all cursor-pointer text-center"
                          >
                            Vol 2 {v2DaysLeft !== null ? `(${v2DaysLeft}d left)` : ''}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              if (onBuyCourse) {
                                onBuyCourse(course, 2);
                              }
                            }}
                            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] border border-slate-200/40 transition-all cursor-pointer text-center"
                          >
                            <span>{isV2Expired ? `Buy Again - ₹${course.price || 999}` : `Buy Now - ₹${course.price || 999}`}</span>
                          </button>
                          {isV2Expired && pDetailsV2 && (
                             <span className="text-[9px] text-rose-500 mt-1 leading-tight text-center">Expired on {new Date(pDetailsV2.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Personal Progression Feed / Achievements */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl text-slate-800 tracking-tight flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Learning Milestones</span>
          </h2>

          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
            {/* Achievement 1 */}
            <div className="flex items-start space-x-3 text-xs">
              <div className="p-2 rounded-xl bg-white/40 border border-white/50 text-blue-600 shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Account Activated</p>
                <p className="text-slate-400 mt-0.5">Your student profile has been created on the blockchain network.</p>
                <span className="inline-block mt-1 text-[10px] font-mono font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  +0 pts (Genesis)
                </span>
              </div>
            </div>

            {/* Achievement 2 */}
            <div className="flex items-start space-x-3 text-xs">
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${totalPoints > 0 ? "bg-white/40 border border-white/50 text-blue-600" : "bg-slate-900/5 border border-slate-950/5 text-slate-400"}`}>
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div className={totalPoints > 0 ? "opacity-100" : "opacity-50"}>
                <p className="font-semibold text-slate-700">First Correct Evaluation</p>
                <p className="text-slate-400 mt-0.5">Answer an MCQ correctly in any Volume block.</p>
                <span className="inline-block mt-1 text-[10px] font-mono font-medium text-blue-600 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  +100 pts
                </span>
              </div>
            </div>

            {/* Achievement 3 */}
            <div className="flex items-start space-x-3 text-xs">
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${unlockedCount > 0 ? "bg-white/40 border border-white/50 text-blue-600" : "bg-slate-900/5 border border-slate-950/5 text-slate-400"}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div className={unlockedCount > 0 ? "opacity-100" : "opacity-50"}>
                <p className="font-semibold text-slate-700">Premium Scholar</p>
                <p className="text-slate-400 mt-0.5">Unlock Volume 2 of any technology lecture via standard Razorpay.</p>
                <span className="inline-block mt-1 text-[10px] font-mono font-medium text-blue-600 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  Unlocked Course
                </span>
              </div>
            </div>
          </div>

          {/* Student Activity Feed */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-800 tracking-tight flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Recent Activity</span>
            </h2>
            <div className="glass-card rounded-3xl p-5 shadow-sm space-y-4 max-h-[350px] overflow-y-auto">
              {activityLog.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 italic">No recent activity logged yet.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4 text-xs">
                  {activityLog.map((log, index) => {
                    let IconComponent = Activity;
                    let iconBg = "bg-slate-50 border-slate-200/60 text-slate-600";
                    
                    if (log.type === "start") {
                      IconComponent = Play;
                      iconBg = "bg-blue-50 border-blue-100 text-blue-600";
                    } else if (log.type === "quiz") {
                      IconComponent = Sparkles;
                      iconBg = "bg-amber-50 border-amber-100 text-amber-600";
                    } else if (log.type === "completion") {
                      IconComponent = CheckCircle2;
                      iconBg = "bg-emerald-50 border-emerald-100 text-emerald-600";
                    } else if (log.type === "login") {
                      IconComponent = UserIcon;
                      iconBg = "bg-indigo-50 border-indigo-100 text-indigo-600";
                    }

                    return (
                      <div key={log.id || index} className="relative group">
                        {/* Timeline node icon */}
                        <div className={`absolute -left-[27px] top-0.5 p-1 rounded-full border-2 ${iconBg} bg-white shrink-0 z-10 transition-transform group-hover:scale-110`}>
                          <IconComponent className="w-3 h-3" />
                        </div>
                        
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-700 leading-normal">
                            {log.text}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {log.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Tier Achievement Journey */}
      <AnimatePresence>
        {isJourneyOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsJourneyOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-slate-50 border-l border-slate-200/80 shadow-2xl h-full flex flex-col z-10"
            >
              {/* Header with Close Button */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-6 h-6 text-blue-600 animate-pulse" />
                  <div>
                    <h2 className="font-display font-bold text-slate-800 text-lg uppercase tracking-wide leading-tight">
                      Tier Achievement Journey
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold font-mono">Real-time Progression Hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsJourneyOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close Journey Panel"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Content wrapper */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                <TierProgression progress={progress} courses={courses} onSimulateCourses={onSimulateCourses} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewCourse(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[28px] p-6 shadow-2xl z-10 overflow-hidden"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500" />

              {/* Close Button */}
              <button
                onClick={() => setPreviewCourse(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Close Preview Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-left">
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono mb-3">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Curriculum Preview</span>
                </span>
                
                <h3 className="font-display font-bold text-xl text-slate-800 leading-snug">
                  {previewCourse.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Volume {selectedPreviewVolume} • {((previewCourse.volumes && previewCourse.volumes[selectedPreviewVolume]?.blocks) || []).length} Chapters
                </p>
              </div>

              {/* Version/Volume Selector Tabs */}
              {previewCourse.volumes && Object.keys(previewCourse.volumes).length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-4 p-1 bg-slate-50 border border-slate-100/80 rounded-2xl">
                  {Object.keys(previewCourse.volumes)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map((volNum) => {
                      const isSelected = selectedPreviewVolume === volNum;
                      return (
                        <button
                          key={volNum}
                          onClick={() => setSelectedPreviewVolume(volNum)}
                          className={`flex-1 min-w-[75px] px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white text-blue-600 shadow-sm border border-slate-100/50"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                          }`}
                        >
                          Volume {volNum}
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Chapters List */}
              <div className="my-6 border border-slate-100 rounded-2xl bg-slate-50/50 p-4 max-h-[250px] overflow-y-auto space-y-2.5">
                {((previewCourse.volumes && previewCourse.volumes[selectedPreviewVolume]?.blocks) || []).map((b, idx) => {
                  const chapterTitle = b.title || b.paragraph?.split('.')[0] || `Lesson ${idx + 1}`;
                  return (
                    <div key={b.id || idx} className="flex items-start space-x-3 text-slate-600 py-1 border-b border-slate-100/60 last:border-0">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-medium leading-relaxed text-slate-700">
                        {chapterTitle}
                      </p>
                    </div>
                  );
                })}
                {(!previewCourse.volumes || !previewCourse.volumes[selectedPreviewVolume]?.blocks || previewCourse.volumes[selectedPreviewVolume].blocks.length === 0) && (
                  <p className="text-xs text-slate-400 italic text-center py-4">No chapters found for this volume.</p>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setPreviewCourse(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                {(() => {
                  const isUnlocked = selectedPreviewVolume === 1
                    ? (progress.unlockedVol1Courses?.includes(previewCourse.id) || unlockedVersions.includes("1") || unlockedVersions.includes(`${previewCourse.id}-1`))
                    : (progress.unlockedCourses?.includes(previewCourse.id) || unlockedVersions.includes(String(selectedPreviewVolume)) || unlockedVersions.includes(`${previewCourse.id}-${selectedPreviewVolume}`));

                  if (isUnlocked) {
                    return (
                      <button
                        onClick={() => {
                          onSelectCourse(previewCourse, selectedPreviewVolume);
                          setPreviewCourse(null);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <span>Launch Volume {selectedPreviewVolume}</span>
                      </button>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => {
                          if (onBuyCourse) {
                            onBuyCourse(previewCourse, selectedPreviewVolume);
                          }
                          setPreviewCourse(null);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Buy Volume {selectedPreviewVolume} • ₹{previewCourse.volumes[selectedPreviewVolume]?.price || 49}</span>
                      </button>
                    );
                  }
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
