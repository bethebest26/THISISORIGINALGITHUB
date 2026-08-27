import { Zap, Sparkles, BookOpen, ShieldCheck, Award, ArrowRight, Brain, Cpu, Users, RefreshCw, Check, Layers, Trophy, Shield, Star, Quote, Newspaper, ArrowUpRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import { StatStrip } from "./StatStrip";
import { FinalCTA } from "./FinalCTA";

interface LandingHeroProps {
  onGetStarted: () => void;
  onBrowseCourses?: () => void;
  activeStudents?: number;
  testsCompleted?: number;
}

export default function LandingHero({ onGetStarted, onBrowseCourses, activeStudents = 354, testsCompleted = 10000 }: LandingHeroProps) {
  return (
    <section id="landing-hero" className="relative overflow-hidden bg-transparent flex flex-col items-center px-6 text-center">
      
      {/* Background Decorative Mesh Grids */}
      <div className="absolute inset-0 futuristic-grid -z-10 pointer-events-none" />
      
      {/* Soft Blue and Cyan Glowing Circles */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] rounded-full bg-blue-500/5 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-cyan-400/5 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Main Content Wrapper */}
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)] py-12">
        
        {/* Animated tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>SELF-MASTERY, ENGINEERED</span>
        </motion.div>

        {/* Display Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-[2.5rem] leading-[1.15] sm:text-6xl md:text-7xl tracking-tight text-slate-900 mb-6 max-w-[320px] sm:max-w-[500px] md:max-w-[700px] px-2 md:px-0"
        >
          Master Yourself.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Be The Best.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 font-light mb-10 max-w-[320px] sm:max-w-[480px] md:max-w-[600px] text-[16px] sm:text-lg md:text-xl leading-[1.65] px-2 md:px-0"
        >
          Stop guessing. Start building. Practical, no-fluff training on personality, business, confidence, discipline, and attraction — for anyone done staying the same for years.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center mb-8"
        >
          <button
            onClick={onGetStarted}
            className="group relative overflow-hidden flex items-center space-x-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
        

        <p className="text-[13px] text-slate-400 font-medium max-w-[280px] sm:max-w-none text-center leading-snug px-4 sm:px-0">
          <ShieldCheck className="w-4 h-4 text-emerald-500 inline-block mr-1.5 align-middle -mt-0.5" />
          No judgment, just results • Learn at your own pace
        </p>
      </div>

      {/* Final CTA Section */}
      <FinalCTA onRegister={onGetStarted} onBrowseCourses={onBrowseCourses} />

    </section>
  );
}
