import { motion } from "motion/react";

interface StatStripProps {
  activeStudents: number;
  testsCompleted: number;
}

export function StatStrip({ activeStudents, testsCompleted }: StatStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.6 }}
      className="border-t border-white/30 w-full pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mt-16"
    >
      <div>
        <p className="text-2xl sm:text-3xl font-display font-bold text-blue-600">{activeStudents}+</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active Students</p>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-display font-bold text-slate-800">10,000+</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">BASIC TESTS TAKEN</p>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-display font-bold text-blue-600">705+</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">HOURS OF TRAINING DELIVERED</p>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-display font-bold text-slate-800">99.8%</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Satisfaction Rate</p>
      </div>
    </motion.div>
  );
}
