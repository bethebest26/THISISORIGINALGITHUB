import { motion } from "motion/react";
import { Trophy, ArrowRight } from "lucide-react";

interface FinalCTAProps {
  onRegister: () => void;
  onBrowseCourses?: () => void;
}

export function FinalCTA({ onRegister, onBrowseCourses }: FinalCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-5xl mt-20 p-8 sm:p-12 md:p-16 rounded-[2.5rem] overflow-hidden border border-white/50 bg-white/30 backdrop-blur-md shadow-lg text-center flex flex-col items-center space-y-6 sm:space-y-8"
    >
      {/* Subtle radial glow inside card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-blue-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Icon/Badge indicator */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm">
        <Trophy className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        <span>CHOOSE THE BETTER PATH</span>
      </div>

      <div className="space-y-4 max-w-3xl">
        <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight leading-tight">
          Stop Scrolling.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Start Becoming.
          </span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          Every day you wait is a day you stay the same. Your transformation starts the moment you register.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-xl mx-auto pt-2">
        <button
          onClick={onRegister}
          className="w-full sm:w-auto group relative overflow-hidden flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center space-x-2">
            <span>Register Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        {onBrowseCourses && (
          <button
            onClick={onBrowseCourses}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-slate-700 border border-slate-200 bg-white/40 hover:bg-white/60 hover:text-blue-600 active:scale-[0.98] transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            Browse All Courses
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium mt-2">
        <span>Secure checkout</span>
        <span className="hidden sm:inline">•</span>
        <span>Instant access</span>
        <span className="hidden sm:inline">•</span>
        <span>Learn at your own pace</span>
      </p>
    </motion.div>
  );
}
