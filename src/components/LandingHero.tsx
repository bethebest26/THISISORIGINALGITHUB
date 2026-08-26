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

      {/* About Us Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="w-full max-w-7xl pt-16 md:pt-24 pb-10 md:pb-14 flex flex-col items-center justify-center relative z-10"
      >
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[150px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-[80px] rounded-full pointer-events-none"></div>
        
        {/* Decorative eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-blue-100 shadow-sm backdrop-blur-md text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Our Philosophy
        </div>
        
        {/* Massive Gradient Heading */}
        <h2 className="text-6xl md:text-7xl lg:text-[90px] font-display font-black tracking-tighter text-center leading-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
            About 
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-tl from-blue-600 to-cyan-400 ml-4 lg:ml-6 relative">
            Us
            {/* Creative accent line underneath "Us" */}
            <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-80 rounded-l-sm rounded-r-3xl"></div>
          </span>
        </h2>
      </motion.div>

        {/* Bento Grid Features / Technology Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4 md:px-0"
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

        {/* SECTION B: SUCCESS STORIES */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center w-full max-w-7xl mt-32 mb-24"
        >
          {/* Section Header */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm mb-6">
            <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            <span>Success Stories</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight leading-tight text-center mb-4">
            Don't just take our word for it.
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg font-light max-w-2xl text-center leading-relaxed mb-16">
            Join thousands of ambitious individuals who have transformed their careers, confidence, and lives through BeTheBest.
          </p>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full px-4 md:px-0">
            {/* Story 1 */}
            <div className="glass-card rounded-3xl p-8 relative shadow-sm border border-slate-100/60 bg-white/40 hover:bg-white/60 transition-colors flex flex-col h-full">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-blue-100/50 rotate-180" />
              <div className="flex items-center gap-1 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-700 font-light leading-relaxed mb-8 relative z-10 flex-grow">
                "The Business Strategy course completely rewired how I approach problem-solving. Within 3 months, I was promoted to Director. The micro-learning format is an absolute game-changer."
              </p>
              <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200 shrink-0">
                  <span className="text-blue-700 font-bold font-display text-lg">MJ</span>
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold font-display tracking-tight text-sm">Marcus J.</h4>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Product Director</p>
                </div>
              </div>
            </div>

            {/* Story 2 (Highlighted) */}
            <div className="glass-card rounded-3xl p-8 relative shadow-md border border-blue-100/50 bg-gradient-to-br from-white/80 to-blue-50/50 transform md:-translate-y-4 flex flex-col h-full ring-1 ring-blue-500/10 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-blue-200/50 rotate-180" />
              <div className="flex items-center gap-1 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-800 font-medium leading-relaxed mb-8 relative z-10 text-lg flex-grow">
                "I used to struggle with public speaking and pitching. The Unshakable Discipline and Leadership tracks gave me the exact frameworks I needed. I just closed my first six-figure client."
              </p>
              <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center border border-blue-400 shadow-sm text-white font-bold font-display text-lg shrink-0">
                  SC
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold font-display tracking-tight text-sm">Sarah Chen</h4>
                  <p className="text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Startup Founder</p>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="glass-card rounded-3xl p-8 relative shadow-sm border border-slate-100/60 bg-white/40 hover:bg-white/60 transition-colors flex flex-col h-full">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-blue-100/50 rotate-180" />
              <div className="flex items-center gap-1 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-700 font-light leading-relaxed mb-8 relative z-10 flex-grow">
                "Unlike other platforms where you passively watch videos, BeTheBest actually forced me to implement what I learned. My productivity has doubled, and I finally have work-life balance."
              </p>
              <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-300 shrink-0">
                  <span className="text-slate-600 font-bold font-display text-lg">DT</span>
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold font-display tracking-tight text-sm">David T.</h4>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Senior Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION C: NEWS & BLOGS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center w-full max-w-7xl mt-12 mb-24 px-4 md:px-0"
        >
          {/* Section Header */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/50 border border-slate-200/60 text-slate-700 text-xs font-semibold tracking-wider uppercase shadow-sm mb-6">
            <Newspaper className="w-3.5 h-3.5 text-slate-500" />
            <span>News & Insights</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight leading-tight text-center mb-4">
            Latest From The Blog
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-light max-w-2xl text-center leading-relaxed mb-12">
            Actionable strategies, psychology breakdowns, and deep dives into high-performance living.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
            {/* Blog Post 1 */}
            <a href="#" className="group flex flex-col glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white/50 transition-all duration-300">
              <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80" 
                  alt="Mindset" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Mindset
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 5 min read</span>
                  <span>•</span>
                  <span>Oct 12, 2026</span>
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  The Neuroscience of Unbreakable Discipline
                </h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                  Why motivation is a myth and how to rewire your dopamine baseline to make hard work feel effortless.
                </p>
                <div className="mt-auto flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>

            {/* Blog Post 2 */}
            <a href="#" className="group flex flex-col glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white/50 transition-all duration-300">
              <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" 
                  alt="Career Body Language" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Career
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 8 min read</span>
                  <span>•</span>
                  <span>Oct 08, 2026</span>
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  How to Project High-Status Body Language
                </h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                  Stop shrinking in meetings. Here are the micro-adjustments to your posture that instantly command respect.
                </p>
                <div className="mt-auto flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>

            {/* Blog Post 3 (Hidden on mobile to keep grid balanced if 2 cols, shown on LG) */}
            <a href="#" className="group hidden lg:flex flex-col glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white/50 transition-all duration-300">
              <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80" 
                  alt="Deep Work" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                  Productivity
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 4 min read</span>
                  <span>•</span>
                  <span>Oct 01, 2026</span>
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  The "Deep Work" Blueprint for Distracted Minds
                </h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                  A practical guide to finding 3 hours of uninterrupted focus every day, even if your schedule is chaotic.
                </p>
                <div className="mt-auto flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          </div>
          
          <div className="mt-10">
            <button className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 group">
              View All Articles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Final CTA Section */}
        <FinalCTA onRegister={onGetStarted} onBrowseCourses={onBrowseCourses} />

    </section>
  );
}
