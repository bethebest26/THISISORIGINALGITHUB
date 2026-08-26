import { motion } from "motion/react";
import { StatStrip } from "./StatStrip";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Compass, Target, Award, Layers, Users } from "lucide-react";
import { FinalCTA } from "./FinalCTA";

interface AboutPageProps {
  activeStudents: number;
  testsCompleted: number;
  onRegister: () => void;
  onBrowseCourses?: () => void;
}

export default function AboutPage({ activeStudents, testsCompleted, onRegister, onBrowseCourses }: AboutPageProps) {
  return (
    <section className="relative overflow-hidden bg-transparent flex flex-col items-center px-6 pt-24 pb-32">
      {/* Background Decorative Mesh Grids */}
      <div className="absolute inset-0 futuristic-grid -z-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center w-full mt-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm mb-6"
        >
          <span>WHO WE ARE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-[2rem] leading-[1.2] sm:text-5xl md:text-6xl tracking-tight text-slate-900 mb-6 mx-auto px-2 md:px-0"
        >
          We Don't Sell Motivation.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            We Build Discipline.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-600 font-medium mb-12 max-w-[600px] mx-auto text-[16px] sm:text-lg leading-[1.65] px-2 md:px-0"
        >
          BeTheBest exists for one reason — to turn 'someday' into practical action, one course at a time.
        </motion.p>
      </div>

      {/* Belief Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-3xl mx-auto text-center mt-12 mb-32 px-4"
      >
        <p className="font-display font-bold text-2xl sm:text-3xl md:text-[36px] leading-[1.35] text-slate-900 tracking-tight">
          Self-help content is often vague and endless. We built BeTheBest to be short, direct, and genuinely interesting to learn from — with quizzes that make you smarter and help you grow.
        </p>
      </motion.div>

      {/* Three Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 px-4"
      >
        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <p className="font-semibold text-slate-800 text-lg">No fluff. Just frameworks that work.</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-semibold text-slate-800 text-lg">Built for real life, not theory.</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="font-semibold text-slate-800 text-lg">Designed to be finished, not just started.</p>
        </div>
      </motion.div>

      {/* SECTION 1: Vision, Mission & Objectives */}
      <div className="w-full max-w-5xl px-4 mb-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-12 text-center"
        >
          What We Stand For
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xl mb-3">Vision</h3>
            <p className="text-slate-600 leading-relaxed">
              A world where anyone, regardless of where they start, has access to practical skills to become confident, capable, and unshakable — not just informed.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xl mb-3">Mission</h3>
            <p className="text-slate-600 leading-relaxed">
              To replace vague motivational content with structured, actionable training — broken into bite-sized lessons that build real skill, not just temporary inspiration.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xl mb-3">Objectives</h3>
            <p className="text-slate-600 leading-relaxed">
              Make self-improvement measurable. Every course ends in a skill you can actually use — not just a feeling you had for a day.
            </p>
          </div>
        </motion.div>
      </div>

      {/* SECTION 2: Problems We're Solving */}
      <div className="w-full max-w-5xl px-4 mb-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-12 text-center"
        >
          The Problems We're Solving
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xl mb-3">Information Overload</h3>
            <p className="text-slate-600 leading-relaxed">
              The internet is full of scattered advice. We compress it into structured, sequential courses — so you're never guessing what to learn next.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xl mb-3">Motivation Without Action</h3>
            <p className="text-slate-600 leading-relaxed">
              Most content entertains but doesn't build anything. Our quiz-after-every-lesson format forces real understanding, not passive scrolling.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xl mb-3">One-Size-Fits-All Advice</h3>
            <p className="text-slate-600 leading-relaxed">
              Confidence, business, attraction, discipline — they're all connected, but rarely taught together. We built one platform that treats personal growth as one connected skill set.
            </p>
          </div>
        </motion.div>
      </div>

      {/* SECTION 3: Founder's Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center mb-24 px-4"
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-blue-600 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm mb-6">
          <span>THE GOAL</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-8">Why We Built This</h2>
        <p className="text-slate-600 text-[17px] sm:text-xl leading-[1.8] max-w-3xl mx-auto">
          We didn't build BeTheBest to sell courses. We built it because too many people spend years stuck — not because they lack potential, but because no one gave them a clear, practical path forward. Our only goal is simple: help every person who joins become more skilled, more confident, and more in control of their life than they were yesterday. If even one person becomes the version of themselves they were always capable of being — this platform did its job.
        </p>
      </motion.div>

      {/* Stat Strip */}
      <div className="w-full max-w-5xl px-4 mb-24">
        <StatStrip activeStudents={activeStudents} testsCompleted={testsCompleted} />
      </div>

      {/* Closing CTA */}
      <FinalCTA onRegister={onRegister} onBrowseCourses={onBrowseCourses} />
    </section>
  );
}
