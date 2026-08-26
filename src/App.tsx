import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import AboutPage from "./components/AboutPage";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import CoursePreviewPage from "./components/CoursePreviewPage";
import CourseList from "./components/CourseList";
import CourseContent from "./components/CourseContent";
import PaymentModal from "./components/PaymentModal";
import { User, UserProgress, Course } from "./types";
import { CheckCircle2, ShieldAlert, Sparkles, X, Award, Zap, Mountain, Gem, ArrowUpCircle, Trophy, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getTierIndex, getTierInfo } from "./utils";
import { useAuth } from "./context/AuthContext";
import { useCourses } from "./hooks/useCourses";
import { supabase } from "./lib/supabase";
import { dbService } from "./services/dbService";

const DEFAULT_PROGRESS: UserProgress = {
  points: 0,
  completedCourses: [],
  unlockedCourses: [],
  answeredQuestions: {},
  completedVolumes: [],
  unlockedVol1Courses: [],
};

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [unlockedVersions, setUnlockedVersions] = useState<string[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<Record<string, { purchasedAt: string, expiresAt: string }>>({});
  const [missingProfileData, setMissingProfileData] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const { updateProfileLocally } = useAuth();

  const [currentTab, setCurrentTab] = useState<"landing" | "dashboard" | "courses" | "active-course" | "admin" | "about" | "preview-course">("landing");
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [buyCourse, setBuyCourse] = useState<Course | null>(null);
  const [buyVolumeId, setBuyVolumeId] = useState<number>(2);
  const [activeStudents, setActiveStudents] = useState(354);
  const [testsCompleted, setTestsCompleted] = useState(10000);

  // Fetch and poll stats
  useEffect(() => {
    const fetchStats = () => {
      fetch(`/api/stats`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.activeStudents !== undefined) {
            setActiveStudents(data.activeStudents);
          }
          if (data.testsCompleted !== undefined) {
            setTestsCompleted(data.testsCompleted);
          }
        })
        .catch((err) => console.error("Detailed error fetching stats:", err, "URL: /api/stats"));
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string; subText?: string } | null>(null);

  // Active Lecture state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeVolumeId, setActiveVolumeId] = useState<number | null>(null);

  const [unlockedTierName, setUnlockedTierName] = useState<string | null>(null);

  const [activityLog, setActivityLog] = useState<any[]>([]);

  const logStudentActivity = (text: string, type: string = "info") => {
    if (!user) return;
    const key = `bethebest_activity_log_${user.email.toLowerCase()}`;
    const current = localStorage.getItem(key);
    let log = [];
    if (current) {
      try {
        log = JSON.parse(current);
      } catch (e) {
        log = [];
      }
    }
    const newAct = {
      id: String(Math.random()) + Date.now(),
      text,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    const updated = [newAct, ...log].slice(0, 15);
    setActivityLog(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const updateStreak = (fetchedProgress: UserProgress, email: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentStreak = fetchedProgress.streakCount || 0;
    const lastActive = fetchedProgress.lastActiveDate;

    let needsSave = false;
    let updatedProgress = { ...fetchedProgress };

    if (!lastActive) {
      updatedProgress.streakCount = 1;
      updatedProgress.lastActiveDate = todayStr;
      needsSave = true;
    } else if (lastActive !== todayStr) {
      const lastActiveDateObj = new Date(lastActive);
      const todayDateObj = new Date(todayStr);
      
      const diffTime = Math.abs(todayDateObj.getTime() - lastActiveDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        updatedProgress.streakCount = currentStreak + 1;
        updatedProgress.lastActiveDate = todayStr;
        needsSave = true;
      } else if (diffDays > 1) {
        updatedProgress.streakCount = 1;
        updatedProgress.lastActiveDate = todayStr;
        needsSave = true;
      }
    }

    if (needsSave) {
      setProgress(updatedProgress);
      saveProgress(updatedProgress, email);
    } else {
      setProgress(fetchedProgress);
    }
  };

  // Load user session on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin/preview-course/')) {
        const id = path.split('/')[3];
        setPreviewCourseId(id);
        setCurrentTab("preview-course");
        return;
    }
    
    // Auth session is managed by AuthContext, so we don't need to manually check localStorage here
    if (user) {
      if (user.role === 'admin') {
        setCurrentTab("admin");
      } else {
        setCurrentTab("dashboard");
      }

      // Check missing profile fields
      if (user.role === 'buyer' && (!user.age || !user.whatsapp_number)) {
        setProfileName(user.name || user.full_name || "");
        setProfileAge(user.age ? String(user.age) : "");
        setProfileWhatsapp(user.whatsapp_number || "");
        setMissingProfileData(true);
      } else {
        setMissingProfileData(false);
      }

      // Fetch user's purchased versions from DB
      if (dbService) {
          try {
              dbService.getUserPurchasedVersions(user.id).then(purchased => {
                setUnlockedVersions(purchased || []);
              });
              dbService.getPurchaseDetails(user.id).then(details => {
                setPurchaseDetails(details || {});
              });
          } catch (e) {
              console.error("Supabase/dbService error, using local fallback:", e);
          }
      }

      // Load activity log
      const logKey = `bethebest_activity_log_${user.email.toLowerCase()}`;
      const loadedLog = localStorage.getItem(logKey);
      if (loadedLog) {
        try {
          setActivityLog(JSON.parse(loadedLog));
        } catch (e) {
          setActivityLog([]);
        }
      } else {
        const initialLog = [
          { id: "gen", text: "Student profile initialized on BeTheBest learning portal.", type: "login", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() }
        ];
        setActivityLog(initialLog);
        localStorage.setItem(logKey, JSON.stringify(initialLog));
      }

      // Load progress for this specific user
      const fetchUserProgress = async () => {
        try {
          // 1. Try Express backend API first (highly reliable)
          const apiRes = await fetch(`/api/progress/${user.email.toLowerCase()}`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData) {
              updateStreak(apiData, user.email);
              localStorage.setItem(`bethebest_progress_${user.email?.toLowerCase()}`, JSON.stringify(apiData));
              return;
            }
          }
        } catch (apiErr) {
          console.log('Express API progress fetch skipped/failed, falling back...');
        }

        // 2. Secondary fallback directly to Supabase if client is initialized
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id);
            
            if (!error && data && data.length > 0) {
              const dbProgress = data[0];
              const mappedProgress: UserProgress = {
                points: dbProgress.points,
                completedCourses: [],
                unlockedCourses: [],
                answeredQuestions: {},
                completedVolumes: [],
                unlockedVol1Courses: [],
              };
              updateStreak(mappedProgress, user.email);
              localStorage.setItem(`bethebest_progress_${user.email?.toLowerCase()}`, JSON.stringify(mappedProgress));
            } else if (error) {
              console.log('Supabase progress fetch returned an error:', error.message);
            }
          } catch (supErr) {
            console.log('Supabase progress query caught exception:', supErr);
          }
        }
      };

      fetchUserProgress();
    } else {
      setCurrentTab("landing");
    }
  }, [user]);

  // Sync progress changes to localStorage and Supabase
  const saveProgress = async (newProgress: UserProgress, userEmail: string) => {
    const oldTierIndex = getTierIndex(progress.completedCoursesCount || 0);
    const newTierIndex = getTierIndex(newProgress.completedCoursesCount || 0);

    // If tier has increased, trigger celebration animation
    if (newTierIndex > oldTierIndex) {
      const tierNames = ["Rookie", "Grounded", "Sharpened", "Elevated", "Unshakable"];
      setUnlockedTierName(tierNames[newTierIndex]);
    }

    setProgress(newProgress);
    localStorage.setItem(`bethebest_progress_${userEmail.toLowerCase()}`, JSON.stringify(newProgress));

    // Update in backend Express API (local persistence)
    try {
      await fetch(`/api/progress/${userEmail.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgress),
      });
    } catch (apiErr) {
      console.warn("Failed to sync progress to Express API:", apiErr);
    }

    // Optional Update in Supabase
    if (user && supabase) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            points: newProgress.points,
          });
          
        if (error) {
          console.log("Optional: error saving progress to Supabase:", error.message);
        }
      } catch (err) {
        console.log("Optional: exception saving progress to Supabase:", err);
      }
    }
  };

  const handleSimulateCourses = (targetCount: number) => {
    if (!user) return;
    const currentCount = progress.completedCoursesCount || 0;
    const diff = targetCount - currentCount;

    fetch(`/api/progress/${user.email.toLowerCase()}/increment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: diff }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.progress) {
          setProgress(data.progress);
          localStorage.setItem(`bethebest_progress_${user.email.toLowerCase()}`, JSON.stringify(data.progress));
          
          if (data.unlockedNewTier) {
            setUnlockedTierName(data.newTierName);
          } else {
            showNotification("success", "Progression Adjusted", `Course completion count set to ${targetCount}.`);
          }
        }
      })
      .catch((err) => console.error("Error simulating courses:", err));
  };

  const handleLogout = () => {
    setProgress(DEFAULT_PROGRESS);
    setUnlockedTierName(null);
    setCurrentTab("landing");
    setActiveCourse(null);
    setActiveVolumeId(null);
    showNotification("success", "Session Terminated", "You have signed out of the learning portal.");
  };

  const handleAnswerQuestion = (mcqId: string, selected: string, isCorrect: boolean, points: number) => {
    if (!user) return;

    // Increment tests completed counter in DB
    fetch("/api/stats/increment/tests", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.testsCompleted !== undefined) {
          setTestsCompleted(data.testsCompleted);
        }
      })
      .catch((err) => console.error("Error incrementing tests completed:", err));

    const updatedQuestions = {
      ...progress.answeredQuestions,
      [mcqId]: { selectedAnswer: selected, isCorrect, pointsEarned: points }
    };

    const newPoints = progress.points + points;
    const newProgress = {
      ...progress,
      points: newPoints,
      answeredQuestions: updatedQuestions
    };

    saveProgress(newProgress, user.email);

    if (isCorrect) {
      logStudentActivity(`Correctly answered quiz question for +${points} PTS.`, "quiz");
      showNotification("success", `Excellent! +${points} PTS Earned`, "Correct response registered on-chain.");
    } else {
      logStudentActivity(`MCQ response incorrect. Retrying study block.`, "info");
      showNotification("error", "Incorrect Evaluation Response", "Read the material block and retry.");
    }
  };

  const handleCompleteVolume = (courseId: string, volumeId: number, totalPointsAwarded: number) => {
    if (!user) return;

    const key = `${courseId}-${volumeId}`;
    if (progress.completedVolumes.includes(key)) return;

    const completedVols = [...progress.completedVolumes, key];
    
    // Check if both volume 1 and 2 of this course are completed
    const vol1Key = `${courseId}-1`;
    const vol2Key = `${courseId}-2`;
    const completedCourses = [...progress.completedCourses];
    
    const hasVol1 = completedVols.includes(vol1Key);
    const hasVol2 = completedVols.includes(vol2Key);
    
    if (hasVol1 && hasVol2 && !completedCourses.includes(courseId)) {
      completedCourses.push(courseId);
    }

    const newProgress = {
      ...progress,
      completedVolumes: completedVols,
      completedCourses
    };

    saveProgress(newProgress, user.email);
    // Find course title
    const course = courses.find(c => c.id === courseId);
    const courseTitle = course ? course.title : courseId;
    logStudentActivity(`Completed Volume ${volumeId} of course: "${courseTitle}" (+${totalPointsAwarded} PTS)`, "completion");
    showNotification("success", "Volume Milestone Complete!", `Assimilated Volume ${volumeId} and secured +${totalPointsAwarded} pts.`);
  };

  const handleBuyCourseSuccess = (paymentId: string) => {
    if (!buyCourse || !user) return;

    // Record purchase in DB & update local state
    const versionStr = `${buyCourse.id}-${buyVolumeId}`;
    dbService.recordPurchase(user.id, versionStr, buyCourse.id);
    dbService.getPurchaseDetails(user.id).then(details => {
      setPurchaseDetails(details || {});
    });
    setUnlockedVersions(prev => [...prev, versionStr]);

    if (buyVolumeId === 1) {
      const unlockedV1 = [...(progress.unlockedVol1Courses || [])];
      if (!unlockedV1.includes(buyCourse.id)) {
        unlockedV1.push(buyCourse.id);
      }
      const newProgress = {
        ...progress,
        unlockedVol1Courses: unlockedV1,
      };
      saveProgress(newProgress, user.email);
      logStudentActivity(`Unlocked access to Volume 1 for "${buyCourse.title}"`, "completion");
      setBuyCourse(null);
      setCurrentTab("dashboard");
      showNotification(
        "success",
        "Volume 1 Access Unlocked!",
        `Receipt: ${paymentId}. Volume 1 for ${buyCourse.title} is now available.`
      );
    } else {
      const unlocked = [...progress.unlockedCourses];
      if (!unlocked.includes(buyCourse.id)) {
        unlocked.push(buyCourse.id);
      }
      const newProgress = {
        ...progress,
        unlockedCourses: unlocked,
      };
      saveProgress(newProgress, user.email);
      logStudentActivity(`Unlocked full premium access for course "${buyCourse.title}"`, "completion");
      setBuyCourse(null);
      setCurrentTab("dashboard");
      showNotification(
        "success",
        "Full Premium Access Unlocked!",
        `Receipt: ${paymentId}. Volume 2 for ${buyCourse.title} is now available.`
      );
    }
  };

  const handleBuyCourseFailure = (errorMsg: string) => {
    showNotification("error", "Secure Checkout Interrupted", errorMsg);
  };

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileAge.trim() || !profileWhatsapp.trim()) {
      alert("All fields are strictly required.");
      return;
    }
    const ageNum = parseInt(profileAge);
    if (isNaN(ageNum) || ageNum <= 0) {
      alert("Please enter a valid age.");
      return;
    }
    setProfileSubmitting(true);
    try {
      await dbService.saveUserProfile(user!.id, {
        name: profileName,
        email: user!.email,
        age: ageNum,
        whatsapp_number: profileWhatsapp,
        role: 'buyer',
        auth_provider: 'google'
      });
      updateProfileLocally({
        name: profileName,
        full_name: profileName,
        age: ageNum,
        whatsapp_number: profileWhatsapp
      });
      setMissingProfileData(false);
      showNotification("success", "Profile Completed", "Welcome to BeTheBest training path!");
    } catch (err: any) {
      alert("Error saving profile: " + err.message);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string, subText?: string) => {
    setNotification({ type, message, subText });
    // Auto dim
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectCourse = (course: Course, volumeId: number) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setActiveCourse(course);
    setActiveVolumeId(volumeId);
    setCurrentTab("active-course");

    // Save last launched for in-progress Continue Learning tracking
    localStorage.setItem(`bethebest_last_launched_${user.email.toLowerCase()}`, JSON.stringify({
      courseId: course.id,
      volumeId: volumeId
    }));

    // Log student activity
    logStudentActivity(`Launched learning session for course "${course.title}" (Volume ${volumeId})`, "start");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-800 flex flex-col relative overflow-hidden selection:bg-blue-500/10 selection:text-blue-600">
      {/* Dynamic Floating Glass Ambient Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[55rem] h-[55rem] rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-400/5 blur-[120px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[50rem] h-[50rem] rounded-full bg-gradient-to-tr from-cyan-400/12 to-indigo-500/5 blur-[100px] pointer-events-none animate-float-2" />
      <div className="absolute top-[40%] left-[30%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-r from-blue-400/8 to-cyan-300/8 blur-[90px] pointer-events-none animate-float-3" />

      {/* Futuristic Navbar */}
      <Navbar
        points={progress.points}
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (!user && tab !== "landing" && tab !== "courses" && tab !== "admin" && tab !== "about") {
            setShowLogin(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenLogin={() => setShowLogin(true)}
      />

      {/* Floating Notifications panel */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-4 rounded-2xl glass-card shadow-2xl border border-blue-500/10 flex items-start space-x-3"
          >
            <div className="shrink-0 mt-0.5">
              {notification.type === "success" ? (
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800 leading-snug">{notification.message}</h4>
              {notification.subText && (
                <p className="text-xs text-slate-400 font-light mt-0.5 leading-relaxed">{notification.subText}</p>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {currentTab === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LandingHero 
                onGetStarted={() => (user ? setCurrentTab("dashboard") : setShowLogin(true))} 
                onBrowseCourses={() => setCurrentTab("courses")}
                activeStudents={activeStudents}
                testsCompleted={testsCompleted}
              />
            </motion.div>
          )}

          {currentTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AboutPage 
                activeStudents={activeStudents}
                testsCompleted={testsCompleted}
                onRegister={() => setShowLogin(true)}
                onBrowseCourses={() => setCurrentTab("courses")}
              />
            </motion.div>
          )}

          {currentTab === "dashboard" && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                user={user}
                progress={progress}
                courses={courses}
                unlockedVersions={unlockedVersions}
                purchaseDetails={purchaseDetails}
                activityLog={activityLog}
                onTabChange={setCurrentTab}
                onSelectCourse={handleSelectCourse}
                onSimulateCourses={handleSimulateCourses}
                onBuyCourse={(course, volumeId) => {
                  setBuyCourse(course);
                  setBuyVolumeId(volumeId || 2);
                }}
              />
            </motion.div>
          )}

          {currentTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CourseList
                courses={courses}
                progress={progress}
                unlockedVersions={unlockedVersions}
                purchaseDetails={purchaseDetails}
                onSelectCourse={handleSelectCourse}
                onBuyCourse={(course, volumeId) => {
                  setBuyCourse(course);
                  setBuyVolumeId(volumeId || 2);
                }}
                onOpenLogin={() => setShowLogin(true)}
                isLoggedIn={!!user}
              />
            </motion.div>
          )}

          {currentTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminDashboard />
            </motion.div>
          )}

          {currentTab === "preview-course" && previewCourseId && (
            <motion.div
              key="preview-course"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CoursePreviewPage courseId={previewCourseId} />
            </motion.div>
          )}

          {currentTab === "active-course" && activeCourse && activeVolumeId && (
            <motion.div
              key="active-course"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CourseContent
                course={activeCourse}
                volumeId={activeVolumeId}
                progress={progress}
                onAnswerQuestion={handleAnswerQuestion}
                onCompleteVolume={handleCompleteVolume}
                onBack={() => setCurrentTab("dashboard")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Authentication Modal */}
      <AnimatePresence>
        {showLogin && (
          <LoginForm
            onClose={() => setShowLogin(false)}
          />
        )}
      </AnimatePresence>

      {/* Razorpay Checkout Modal */}
      <AnimatePresence>
        {buyCourse && user && (
          <PaymentModal
            course={buyCourse}
            volumeId={buyVolumeId}
            user={user}
            onSuccess={handleBuyCourseSuccess}
            onFailure={handleBuyCourseFailure}
            onClose={() => setBuyCourse(null)}
          />
        )}
      </AnimatePresence>

      {/* Celebration Modal for Tier Unlocking */}
      <AnimatePresence>
        {unlockedTierName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnlockedTierName(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative w-full max-w-md bg-white border border-blue-100 rounded-[32px] p-8 text-center shadow-2xl z-10 overflow-hidden"
            >
              {/* Confetti particles */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />

              <div className="flex justify-center space-x-1 text-yellow-500 text-3xl mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wider font-display">
                🎉 Congratulations!
              </h3>
              <p className="text-sm text-slate-400 font-semibold mt-1">You've unlocked</p>

              <div className="my-6 flex justify-center scale-110">
                {unlockedTierName === "Grounded" && (
                  <div className="p-4 bg-blue-50 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/20 animate-pulse transition-transform duration-300 scale-105">
                    <Mountain className="w-16 h-16 text-blue-600" />
                  </div>
                )}
                {unlockedTierName === "Sharpened" && (
                  <div className="p-4 bg-cyan-50 rounded-full border border-cyan-500/20 shadow-lg shadow-cyan-500/10 ring-4 ring-cyan-500/20 animate-pulse transition-transform duration-300 scale-105">
                    <Gem className="w-16 h-16 text-cyan-600" />
                  </div>
                )}
                {unlockedTierName === "Elevated" && (
                  <div className="p-4 bg-indigo-50 rounded-full border border-indigo-500/20 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/20 animate-pulse transition-transform duration-300 scale-105">
                    <ArrowUpCircle className="w-16 h-16 text-indigo-600" />
                  </div>
                )}
                {unlockedTierName === "Unshakable" && (
                  <div className="p-4 bg-blue-50 rounded-full border border-blue-600/30 shadow-lg shadow-blue-600/20 ring-4 ring-blue-600/20 animate-pulse transition-transform duration-300 scale-105">
                    <Trophy className="w-16 h-16 text-blue-700" />
                  </div>
                )}
                {unlockedTierName === "Rookie" && (
                  <div className="p-4 bg-slate-50 rounded-full border border-slate-500/20 shadow-lg ring-4 ring-slate-500/20">
                    <Compass className="w-16 h-16 text-slate-600" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 mb-6">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-display">
                  {unlockedTierName}
                </h2>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Keep building your discipline and continue your learning journey.
              </p>

              <button
                onClick={() => setUnlockedTierName(null)}
                className="mt-8 w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue Learning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Profile Completion Form */}
      <AnimatePresence>
        {missingProfileData && user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl z-10 overflow-hidden text-left"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Secure Profile Onboarding</span>
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-800 mt-2">
                  Complete Registration Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Please finalize these required details to start training</p>
              </div>

              <form onSubmit={handleCompleteProfileSubmit} className="space-y-4 pt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={profileAge}
                    onChange={(e) => setProfileAge(e.target.value)}
                    placeholder="Enter your age (e.g. 21)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={profileWhatsapp}
                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                    placeholder="WhatsApp contact with country code"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="w-full py-3.5 mt-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
                >
                  {profileSubmitting ? (
                    <span>Registering Path...</span>
                  ) : (
                    <>
                      <span>Start BeTheBest Path (+100 XP)</span>
                      <ArrowUpCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/30 bg-white/20 backdrop-blur-md py-8 text-center text-xs text-slate-400 mt-12 shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-medium">BeTheBest © 2026 | All Rights Reserve</p>
        </div>
      </footer>
    </div>
  );
}
