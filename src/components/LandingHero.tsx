import { Zap, Sparkles, BookOpen, ShieldCheck, Award, ArrowRight, Brain, Cpu, Users, RefreshCw, Check, Layers, Trophy, Shield } from "lucide-react";
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


        {/* Bento Grid Features / Technology Pillars */}
        {/* Added margin-top to keep separation from hero above. Hidden on mobile. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl pt-16"
        >
          {/* Pillar 1 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Magnetic Confidence</h3>
            <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
              Master body language, sub-communication, vocal projection, and public charisma. Eliminate social anxiety and build true core esteem.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Unshakable Discipline</h3>
            <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
              Re-engineer your daily habits, dopamine responses, focus blocks, and high-performance routines. Stay consistent when motivation fades.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">High-Value Attraction</h3>
            <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
              Understand evolutionary psychology, high-status presentation, active listening, and building genuine romantic polarity.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Bulletproof Mental Health</h3>
            <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
              Confidence isn't just about looking good — it's your armor for bad days. Learn to handle rejection, anxiety, and burnout without spiraling. When you're solid inside, nothing outside can shake you.
            </p>
          </div>
        </motion.div>

        {/* Global Statistics ticker */}
        <StatStrip activeStudents={activeStudents} testsCompleted={testsCompleted} />
        
        {/* "The Science" Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl pt-16 border-t border-white/20 flex flex-col items-center space-y-10"
        >
          {/* Section Header */}
          <div className="space-y-4 max-w-3xl text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm">
              <Brain className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>BACKED BY LEARNING SCIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-800 tracking-tight leading-tight">
              This Isn't Just Random Courses. It's{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Actual Transformation.
              </span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
              Every course on BeTheBest is structured using research-backed learning techniques — so what you learn actually changes how you act, not just what you know.
            </p>
          </div>

          {/* Technique Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-4">
            {/* Card 1: Active Recall */}
            <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Active Recall</h3>
              <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
                Passive reading barely sticks. That's why every paragraph is immediately followed by a question — forcing your brain to retrieve and apply the concept instead of just skimming past it.
              </p>
            </div>

            {/* Card 2: Immediate Feedback Loop */}
            <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
                <Check className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Immediate Feedback Loop</h3>
              <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
                You find out instantly whether you understood a concept. This tight feedback loop is one of the most well-documented drivers of behavior change and skill-building.
              </p>
            </div>

            {/* Card 3: Spaced Micro-Learning */}
            <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Spaced Micro-Learning</h3>
              <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
                Instead of overwhelming you with long lectures, content is broken into short, focused blocks — mirroring how memory consolidation actually works.
              </p>
            </div>

            {/* Card 4: Points & Progress Tracking */}
            <div className="glass-card glass-card-hover rounded-3xl p-6 text-left shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight">Points & Progress</h3>
              <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
                Gamified progress taps into reward-based motivation systems that drive habit formation, keeping you consistent and engaged.
              </p>
            </div>
          </div>

          {/* Mini Stat Row */}
          <div className="border-t border-white/20 w-full max-w-4xl pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-lg sm:text-xl font-display font-bold text-blue-600">2-3x Faster Progress</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active Recall</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-display font-bold text-slate-800">Corrects Habits Early</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Instant Feedback</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-display font-bold text-blue-600">Built for Real</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Micro-Learning</p>
            </div>
          </div>
        </motion.div>

        {/* SECTION A: COURSE PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center w-full max-w-5xl mt-24"
        >
          {/* Section Header */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm mb-6">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>WHAT YOU'LL BE LEARNING</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight leading-tight mb-4">
            Real Courses.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Real Change.
            </span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed mb-12">
            A glimpse at what's inside — full curriculum available once you register.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Card 1 */}
            <div className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 text-left shadow-sm flex flex-col group h-full">
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100/50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  3 Volumes
                </span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                Courses Coming Soon
              </h3>
              <p className="text-slate-500 font-light leading-relaxed flex-grow">
                Fresh, high-impact curriculum is currently being prepared. Check back soon.
              </p>
            </div>
            {/* Card 2 */}
            <div className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 text-left shadow-sm flex flex-col group h-full">
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100/50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  3 Volumes
                </span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                More Courses Coming Soon
              </h3>
              <p className="text-slate-500 font-light leading-relaxed flex-grow">
                Expanding our library with new, high-impact training. Stay tuned.
              </p>
            </div>
          </div>
          
          <button
            onClick={onBrowseCourses}
            className="mt-10 inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
          >
            <span>View Full Curriculum &rarr;</span>
          </button>
        </motion.div>

        {/* Final CTA Section */}
        <FinalCTA onRegister={onGetStarted} onBrowseCourses={onBrowseCourses} />

    </section>
  );
}
