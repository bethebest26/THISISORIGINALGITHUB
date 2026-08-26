import { useState, useEffect } from "react";
import { Course, Volume, CourseBlock, UserProgress } from "../types";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Play,
  Sparkles,
  BookOpen,
  Shield,
  Clock,
  Compass,
  MessageSquare,
  Activity,
  Flame,
  Zap,
  HelpCircle,
  Check,
  RefreshCw,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { lessonsExpandedData } from "../lessonsExpandedData";
import { ExpandedLesson } from "../types";

interface CourseContentProps {
  course: Course;
  volumeId: string | number;
  progress: UserProgress;
  onAnswerQuestion: (mcqId: string, selected: string, isCorrect: boolean, points: number) => void;
  onCompleteVolume: (courseId: string, volumeId: number, totalPointsAwarded: number) => void;
  onBack: () => void;
  readOnly?: boolean;
}

export default function CourseContent({
  course,
  volumeId,
  progress,
  onAnswerQuestion,
  onCompleteVolume,
  onBack,
  readOnly = false,
}: CourseContentProps) {
  const volume: Volume | undefined = Array.isArray(course.volumes) 
    ? course.volumes.find(v => v.id === volumeId) 
    : (course.volumes as any)[volumeId];
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  
  // Lesson play steps: 
  // 1: Intro & Theory (Header, Intro, Reading Cards)
  // 2: Educational Graphic
  // 3: Practical Action (Real-Life Example & Practice Challenge)
  // 4: Self Reflection
  // 5: 10 MCQ Evaluation
  // 6: Lesson Summary Card
  // 7: Lesson Completed Screen
  const [lessonStep, setLessonStep] = useState<number>(1);

  if (!course) return <div className="p-8 text-center text-slate-500">Loading course...</div>;
  if (!volume) return <div className="p-8 text-center text-red-600">Volume not found.</div>;

  // Local state for interactive elements
  const currentBlock: CourseBlock = volume.blocks[currentBlockIndex];
  
  // Load expanded lesson data or fall back to a generated structured lesson if missing
  const dbLesson: any = currentBlock;
  const rawExpanded: any = lessonsExpandedData[currentBlock.id] || {};
  
  const expandedLesson: ExpandedLesson = {
    id: currentBlock.id,
    traitNumber: currentBlockIndex + 1,
    title: dbLesson.title || rawExpanded.title || currentBlock.title || "Foundational Trait",
    readingTime: dbLesson.readingTime || rawExpanded.readingTime || "10 Minutes",
    difficulty: dbLesson.difficulty || rawExpanded.difficulty || "Intermediate",
    introduction: dbLesson.introduction || rawExpanded.introduction || "Prepare to dive deep. Focus your mind to absorb this critical concept and transform your core behavior.",
    imageUrl: dbLesson.imageUrl || rawExpanded.imageUrl || "",
    readingCards: currentBlock.paragraph ? [
      { title: "Core Principle", content: currentBlock.paragraph }
    ] : (rawExpanded.readingCards || [
      { title: "Core Principle", content: "To execute this principle in your daily life, you must form active systems that guard your focus, maintain self-discipline, and direct actions with clean clarity." }
    ]),
    graphic: rawExpanded.graphic || {
      type: "flowchart",
      title: "Core Action Process",
      subtitle: "The sequential progression of this foundational trait",
      steps: [
        { label: "1. Awareness", desc: "Recognize immediate challenges and emotional triggers cleanly." },
        { label: "2. Calibration", desc: "Align with your core standards of self-respect." },
        { label: "3. Decisive Action", desc: "Execute with absolute presence and clean, non-needy posture." }
      ]
    },
    realLifeExample: {
      scenario: dbLesson.realLifeScenario || (rawExpanded.realLifeExample && rawExpanded.realLifeExample.scenario) || "Facing a high-friction social environment.",
      outcome: dbLesson.realLifeOutcome || (rawExpanded.realLifeExample && rawExpanded.realLifeExample.outcome) || "Remaining completely non-reactive and leading with quiet, secure authority."
    },
    practiceExercise: rawExpanded.practiceExercise || {
      title: "Today's Challenge: Active Command",
      challenge: "Practice absolute frame control and deliberate presence today.",
      steps: [
        "Pause consciously before replying to any high-tension statement.",
        "Ground your posture and drop your shoulders to regulate your nervous system.",
        "Respond neutrally and focus only on objective facts."
      ]
    },
    selfReflection: rawExpanded.selfReflection || {
      question: "How can you immediately begin practicing this character trait in your daily routine?",
      placeholder: "Reflect on how this trait aligns with your current life vision..."
    },
    mcqs: (currentBlock.mcqs && currentBlock.mcqs.length > 0 ? currentBlock.mcqs : (rawExpanded.mcqs || [
      {
        id: `${currentBlock.id}-fallback-q1`,
        question: currentBlock.mcq?.question || "What is the primary takeaway of this lesson?",
        options: currentBlock.mcq?.options || ["A", "B", "C", "D"],
        correctAnswer: currentBlock.mcq?.correctAnswer || "A",
        feedback: "Excellent! Direct application of the core lesson material ensures perfect alignment with high-value standards."
      }
    ])) as any,
    summary: rawExpanded.summary || [
      "Character is built through intentional daily repetition, not temporary highs.",
      "High self-esteem is independent of external approval or validation.",
      "Composure under tension is the ultimate indicator of authority.",
      "Always align your actions with internal values rather than external praise.",
      "The willingness to walk away from low-value situations is your greatest shield."
    ]
  };

  // MCQ state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPointsAwarded, setQuizPointsAwarded] = useState(0);
  
  // Reflection state
  const [reflectionText, setReflectionText] = useState("");
  const [isReflectionSubmitted, setIsReflectionSubmitted] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState("");

  // Clean state when moving to a new block
  useEffect(() => {
    setLessonStep(1);
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizPointsAwarded(0);
    setReflectionText("");
    setIsReflectionSubmitted(false);
    setReflectionFeedback("");
  }, [currentBlockIndex]);

  const handleOptionSelect = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };

  const handleVerifyAnswer = () => {
    if (readOnly || !selectedOption || isAnswerSubmitted) return;

    const currentMcq = expandedLesson.mcqs[quizIndex];
    const isCorrect = selectedOption === currentMcq.correctAnswer;
    const pointsEarned = isCorrect ? 10 : 0;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      setQuizPointsAwarded((prev) => prev + pointsEarned);
    }

    onAnswerQuestion(currentMcq.id, selectedOption, isCorrect, pointsEarned);
    setIsAnswerSubmitted(true);
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (quizIndex < expandedLesson.mcqs.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      // Quiz complete! Advance to summary step
      setLessonStep(6);
    }
  };

  const handleReflectionSubmit = () => {
    if (readOnly || !reflectionText.trim()) return;
    setIsReflectionSubmitted(true);
    // Dynamic encouraging premium feedback
    setReflectionFeedback(
      "Your self-awareness is your ultimate competitive edge. By writing this down, you have initiated a powerful neural anchor. Keep this standard firm in your mind today."
    );
  };

  const handleLessonCompleteContinue = () => {
    if (currentBlockIndex < volume.blocks.length - 1) {
      // Go to next block in this volume
      setCurrentBlockIndex((prev) => prev + 1);
    } else if (!readOnly) {
      // Completed last block of this volume!
      onCompleteVolume(String(course.id), Number(volumeId), quizPointsAwarded + 50); // +50 XP bonus for volume completion!
    } else {
      // Just finish for preview
      onBack();
    }
  };

  // Calculate cumulative block completion percent (e.g. out of 7 steps)
  const currentStepPercentage = ((lessonStep - 1) / 6) * 100;

  // Visual Educational Graphic Renderer
  const renderEducationalGraphic = () => {
    const { type, title, subtitle, steps, comparison, pyramid, loop, matrix } = expandedLesson.graphic;

    return (
      <div className="space-y-4">
        <div className="text-center pb-4">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Premium Educational Graphic
          </span>
          <h4 className="font-display font-bold text-xl text-slate-800 tracking-tight mt-2">
            {title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Render graphic based on type */}
        {type === "flowchart" && steps && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="h-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-mono font-bold text-sm flex items-center justify-center mb-3">
                    {i + 1}
                  </div>
                  <h5 className="font-display font-bold text-sm text-slate-800">{step.label}</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-blue-400 animate-pulse">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {type === "loop" && loop && (
          <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {loop.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-300 flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-cyan-500 uppercase font-mono tracking-wider">
                    Stage {i + 1}
                  </span>
                  <h5 className="font-display font-bold text-sm text-slate-800 mt-0.5">
                    {item.action || item.stage}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === "pyramid" && pyramid && (
          <div className="max-w-lg mx-auto flex flex-col space-y-2.5 pt-2">
            {pyramid.map((level, i) => {
              const widths = ["w-full", "w-11/12 mx-auto", "w-10/12 mx-auto", "w-9/12 mx-auto"];
              const opacityBg = [
                "bg-blue-600/5 hover:bg-blue-600/10 border-blue-600/20",
                "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20",
                "bg-cyan-500/10 hover:bg-cyan-500/15 border-cyan-500/20",
                "bg-gradient-to-r from-blue-500/20 to-cyan-400/20 hover:from-blue-500/25 hover:to-cyan-400/25 border-cyan-400/30",
              ];
              const textColors = ["text-blue-800", "text-blue-700", "text-cyan-800", "text-cyan-700"];

              return (
                <div
                  key={i}
                  className={`${widths[i]} ${opacityBg[i]} border p-4 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer relative group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">Level {4 - i}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                      {level.value}
                    </span>
                  </div>
                  <h5 className={`font-display font-bold text-sm ${textColors[i]} mt-1`}>
                    {level.level}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{level.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {type === "comparison" && comparison && (
          <div className="max-w-2xl mx-auto border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 p-4 font-display font-bold text-xs text-slate-500 uppercase tracking-wider">
              <div>Aspect</div>
              <div className="text-rose-600">Reactive / Needy</div>
              <div className="text-blue-600">Anchored / High-Value</div>
            </div>
            <div className="divide-y divide-slate-100">
              {comparison.map((item, i) => (
                <div key={i} className="grid grid-cols-3 p-4 items-start gap-4 text-xs sm:text-sm">
                  <div className="font-semibold text-slate-700">{item.aspect}</div>
                  <div className="text-slate-500 flex items-start space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item.before}</span>
                  </div>
                  <div className="text-slate-800 font-medium flex items-start space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{item.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "matrix" && matrix && (
          <div className="max-w-2xl mx-auto border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  <h5 className="font-display font-bold text-base uppercase tracking-wider">Masculine Frame</h5>
                </div>
                {matrix.map((item, i) => {
                  if (!item.mas) return null;
                  return (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{item.label}</span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.mas.replace("masculine:", "").replace("Masculine:", "").trim()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 bg-slate-50/50 space-y-4">
                <div className="flex items-center space-x-2 text-cyan-600">
                  <Compass className="w-5 h-5" />
                  <h5 className="font-display font-bold text-base uppercase tracking-wider">Feminine Frame</h5>
                </div>
                {matrix.map((item, i) => {
                  const val = item.fem || item.mas;
                  if (!val) return null;
                  return (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{item.label}</span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {val.replace("feminine:", "").replace("Feminine:", "").trim()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="course-player" className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/30 backdrop-blur-sm hover:bg-white/50 border border-white/50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-white/40 border border-white/50 px-2.5 py-0.5 rounded-full uppercase">
              {course.category}
            </span>
            <h1 className="font-display font-bold text-lg text-slate-800 tracking-tight leading-tight mt-1">
              {course.title}
            </h1>
            <p className="text-xs text-slate-400">Volume {volumeId}: {volume.title}</p>
          </div>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/50 text-blue-700 font-semibold text-xs shadow-sm backdrop-blur-sm">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="font-mono">Total Points: {progress.points}</span>
          </div>
          <div className="text-xs font-semibold text-slate-500 font-mono">
            Trait {currentBlockIndex + 1} of {volume.blocks.length}
          </div>
        </div>
      </div>

      {/* Progress Fill Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          <span>Lesson Steps Progress</span>
          <span>{Math.round(currentStepPercentage)}%</span>
        </div>
        <div className="w-full bg-slate-900/[0.05] h-2 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentStepPercentage}%` }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBlockIndex}-${lessonStep}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* STEP 1: LESSON HEADER, INTRODUCTION, READING MODULE */}
          {lessonStep === 1 && (
            <div className="space-y-6">
              {/* LESSON HEADER CARD */}
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-sm relative overflow-hidden bg-gradient-to-br from-white/80 to-blue-50/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full filter blur-2xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      Trait #{expandedLesson.traitNumber}
                    </span>
                    <h2 className="font-display font-bold text-3xl text-slate-800 tracking-tight leading-none mt-1">
                      {expandedLesson.title}
                    </h2>
                    <p className="text-slate-500 text-sm max-w-xl italic mt-3 leading-relaxed">
                      &ldquo;{expandedLesson.introduction}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 shrink-0 bg-white/60 p-4 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm md:w-64">
                    <div className="space-y-1">
                      <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" /> Time
                      </span>
                      <p className="text-sm font-semibold text-slate-700">{expandedLesson.readingTime}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <Compass className="w-3 h-3 mr-1 text-slate-400" /> Difficulty
                      </span>
                      <p className={`text-sm font-semibold ${
                        expandedLesson.difficulty === "Advanced" ? "text-rose-600" : "text-blue-600"
                      }`}>{expandedLesson.difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHAPTER AI ILLUSTRATION */}
              {(expandedLesson.imageUrl || currentBlock.imageUrl) && (
                <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative group bg-slate-900">
                  <img
                    src={expandedLesson.imageUrl || currentBlock.imageUrl}
                    alt={expandedLesson.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center space-x-1 text-[10px] font-bold text-white bg-slate-950/60 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse mr-1" /> ✨ AI Illustrated Lesson
                  </span>
                </div>
              )}

              {/* READING MODULE: Bento layout of small concept cards */}
              <div className="space-y-4">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Module 1: Character Mastery Material</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expandedLesson.readingCards.map((card, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                    >
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">
                        0{i + 1} &bull; {card.title}
                      </span>
                      <p className="text-slate-600 text-sm leading-relaxed mt-2 font-light">
                        {card.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setLessonStep(2)}
                  className="flex items-center space-x-1.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Advance to Visual Model</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATIONAL GRAPHICS */}
          {lessonStep === 2 && (
            <div className="space-y-6">
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-sm bg-gradient-to-b from-white to-blue-50/10">
                {renderEducationalGraphic()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setLessonStep(1)}
                  className="flex items-center space-x-1 px-5 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white/50 border border-slate-200 hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Reading</span>
                </button>

                <button
                  onClick={() => setLessonStep(3)}
                  className="flex items-center space-x-1.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Go to Practice Action</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REAL-LIFE EXAMPLE & PRACTICE EXERCISE */}
          {lessonStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Real-Life Scenario */}
                <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-sm bg-white/90 space-y-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Compass className="w-5 h-5" />
                    <h4 className="font-display font-bold text-lg text-slate-800 tracking-tight">
                      Real-Life Practical Scenario
                    </h4>
                  </div>
                  <div className="space-y-3 pt-2 text-sm text-slate-600 leading-relaxed font-light">
                    <p className="bg-slate-50 border border-slate-100 p-4 rounded-xl italic">
                      &ldquo;{expandedLesson.realLifeExample.scenario}&rdquo;
                    </p>
                    <div className="flex items-start space-x-2 bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl text-slate-700">
                      <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-blue-800 block text-xs uppercase tracking-wider mb-0.5 font-mono">
                          High-Value Resolution
                        </span>
                        <span>{expandedLesson.realLifeExample.outcome}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practice Exercise */}
                <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-sm bg-white/95 space-y-4">
                  <div className="flex items-center space-x-2 text-cyan-600">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <h4 className="font-display font-bold text-lg text-slate-800 tracking-tight">
                      {expandedLesson.practiceExercise.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">
                    {expandedLesson.practiceExercise.challenge}
                  </p>
                  <div className="space-y-2 pt-2">
                    {expandedLesson.practiceExercise.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-sm text-slate-600 font-light leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center font-mono font-bold text-xs text-cyan-600 shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setLessonStep(2)}
                  className="flex items-center space-x-1 px-5 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white/50 border border-slate-200 hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Graphic</span>
                </button>

                <button
                  onClick={() => setLessonStep(4)}
                  className="flex items-center space-x-1.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Advance to Reflection</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELF REFLECTION */}
          {lessonStep === 4 && (
            <div className="space-y-6">
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-sm bg-white/95 max-w-2xl mx-auto space-y-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                  <h4 className="font-display font-bold text-lg text-slate-800 tracking-tight">
                    Active Self Reflection
                  </h4>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                  {expandedLesson.selfReflection.question}
                </p>

                <div className="space-y-3 pt-2">
                  <textarea
                    rows={4}
                    disabled={isReflectionSubmitted}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder={expandedLesson.selfReflection.placeholder}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 resize-none font-light leading-relaxed disabled:opacity-75 disabled:bg-slate-50"
                  />

                  <AnimatePresence>
                    {isReflectionSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start space-x-2.5 text-emerald-800 text-xs sm:text-sm leading-relaxed"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold block text-emerald-900 mb-0.5">Anchor Activated</span>
                          <span>{reflectionFeedback}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isReflectionSubmitted ? (
                    <button
                      disabled={!reflectionText.trim()}
                      onClick={handleReflectionSubmit}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                    >
                      Lock In Reflection thoughts
                    </button>
                  ) : (
                    <button
                      onClick={() => setLessonStep(5)}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <span>Proceed to Lesson evaluation (+100 XP Challenge)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Back actions */}
              {!isReflectionSubmitted && (
                <div className="flex justify-start pt-2">
                  <button
                    onClick={() => setLessonStep(3)}
                    className="flex items-center space-x-1 px-5 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white/50 border border-slate-200 hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Practice</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: MCQ QUIZ (10 QUESTIONS!) */}
          {lessonStep === 5 && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* QUIZ HEADER / PROGRESS */}
              <div className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    Evaluation: Question {quizIndex + 1} of {expandedLesson.mcqs.length}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  Score: {quizScore}/{expandedLesson.mcqs.length}
                </span>
              </div>

              {/* ACTIVE QUESTION */}
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-md bg-white">
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-base sm:text-lg text-slate-800 tracking-tight">
                    {expandedLesson.mcqs[quizIndex].question}
                  </h4>

                  {/* Option List */}
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {expandedLesson.mcqs[quizIndex].options.map((option) => {
                      let borderClass = "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200";
                      let textClass = "text-slate-600";
                      let icon = null;

                      if (isAnswerSubmitted) {
                        const isOptionCorrect = option === expandedLesson.mcqs[quizIndex].correctAnswer;
                        const isOptionSelected = option === selectedOption;

                        if (isOptionCorrect) {
                          borderClass = "border-emerald-300 bg-emerald-50/70";
                          textClass = "text-emerald-800 font-semibold";
                          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                        } else if (isOptionSelected) {
                          borderClass = "border-rose-300 bg-rose-50/70";
                          textClass = "text-rose-800 font-semibold";
                          icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                        } else {
                          borderClass = "border-slate-100 opacity-60";
                        }
                      } else {
                        if (option === selectedOption) {
                          borderClass = "border-blue-500 bg-blue-500/5";
                          textClass = "text-blue-700 font-semibold";
                        }
                      }

                      return (
                        <button
                          key={option}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleOptionSelect(option)}
                          className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${borderClass}`}
                        >
                          <span className={textClass}>{option}</span>
                          {icon}
                        </button>
                      );
                    })}
                  </div>

                  {/* FEEDBACK MODULE */}
                  <AnimatePresence>
                    {isAnswerSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border mt-4 ${
                          selectedOption === expandedLesson.mcqs[quizIndex].correctAnswer
                            ? "bg-emerald-50/60 border-emerald-100 text-emerald-800"
                            : "bg-rose-50/60 border-rose-100 text-rose-800"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-slate-800 mb-0.5">Educational Insights</span>
                            <span>{expandedLesson.mcqs[quizIndex].feedback}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SUBMIT / NEXT CONTROL */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    {!isAnswerSubmitted ? (
                      <button
                        disabled={!selectedOption}
                        onClick={handleVerifyAnswer}
                        className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Verify Choice
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuizQuestion}
                        className="flex items-center space-x-1 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>
                          {quizIndex < expandedLesson.mcqs.length - 1 ? "Next Question" : "View Core Summary"}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 6: LESSON SUMMARY */}
          {lessonStep === 6 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-md bg-white">
                <div className="text-center pb-4 border-b border-slate-100">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                    <span>Lesson Core Summary</span>
                  </span>
                  <h3 className="font-display font-bold text-2xl text-slate-800 mt-2">
                    5 Key Lessons To Integrated
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Commit these foundational laws of self-respect to memory</p>
                </div>

                <div className="space-y-4 pt-6">
                  {expandedLesson.summary.map((point, idx) => (
                    <div key={idx} className="flex items-start space-x-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 text-sm sm:text-base font-light leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action button to proceed to Completion screen */}
              <div className="flex justify-end">
                <button
                  onClick={() => setLessonStep(7)}
                  className="flex items-center space-x-1 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Lock in & complete trait</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: COMPLETION SCREEN */}
          {lessonStep === 7 && (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="glass-card rounded-[32px] p-8 sm:p-12 border border-white/40 shadow-xl bg-white relative overflow-hidden">
                {/* Decorative radial blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/15">
                    <div className="flex items-center justify-center w-full h-full rounded-full bg-white">
                      <Award className="w-8 h-8 text-blue-600 animate-bounce" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase font-mono">
                      Step #11 Complete &bull; Achievement unlocked
                    </span>
                    <h2 className="font-display font-bold text-3xl text-slate-800 tracking-tight mt-1">
                      Lesson Completed Successfully!
                    </h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                      Outstanding work. You have systematically completed all 11 sections of Trait #{expandedLesson.traitNumber} in the BeTheBest premium portal.
                    </p>
                  </div>

                  {/* Stats Block */}
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                        Quiz Score
                      </span>
                      <span className="text-2xl font-bold font-display text-slate-800 mt-1 block">
                        {quizScore} / {expandedLesson.mcqs.length}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">MCQs Correct</span>
                    </div>

                    <div className="bg-blue-500/5 p-4 border border-blue-500/10 rounded-2xl">
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest font-mono block">
                        XP Earned
                      </span>
                      <span className="text-2xl font-bold font-display text-blue-600 mt-1 block">
                        +{quizPointsAwarded + 100} <span className="text-xs font-semibold text-slate-400">XP</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Quiz + Completion Bonus</span>
                    </div>
                  </div>

                  {/* Proceed trigger */}
                  <div className="pt-4">
                    <button
                      onClick={handleLessonCompleteContinue}
                      className="w-full sm:w-auto px-10 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/15 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {currentBlockIndex < volume.blocks.length - 1
                        ? "Continue to Next Trait"
                        : "Complete Course Volume!"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
