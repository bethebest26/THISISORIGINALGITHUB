import React, { useState } from "react";
import { Course, UserProgress } from "../types";
import { BookOpen, Sparkles, Lock, Unlock, Clock, Search, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALL_CATEGORIES_ORDERED, getSubCategories } from "../utils";

interface CourseListProps {
  courses: Course[];
  progress: UserProgress;
  unlockedVersions?: string[]; // Received from parent to track purchased versions
  purchaseDetails?: Record<string, { purchasedAt: string, expiresAt: string }>;
  initialMainCategory?: string;
  initialSubCategory?: string | null;
  onSelectCourse: (course: Course, volumeId: number) => void;
  onBuyCourse: (course: Course, volumeId: number) => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

export default function CourseList({
  courses,
  progress,
  unlockedVersions = [],
  purchaseDetails = {},
  initialMainCategory = "All",
  initialSubCategory = null,
  onSelectCourse,
  onBuyCourse,
  onOpenLogin,
  isLoggedIn,
}: CourseListProps) {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(initialMainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(initialSubCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedPreview, setExpandedPreview] = useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    setSelectedMainCategory(initialMainCategory);
    setSelectedSubCategory(initialSubCategory);
  }, [initialMainCategory, initialSubCategory]);

  const categories = ALL_CATEGORIES_ORDERED;

  // Filter out draft courses for public display
  const publishedCourses = courses.filter(
    (c) => c.status !== 'draft'
  );

  // Toggle chapter preview visibility
  const togglePreview = (courseId: string, volId: number) => {
    const key = `${courseId}-${volId}`;
    setExpandedPreview(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter published courses
  const filteredCourses = publishedCourses.filter((course) => {
    const mainCat = (course.mainCategory || course.main_category || "").toLowerCase();
    const subCat = (course.subCategory || course.sub_category || "").toLowerCase();
    
    const matchesMain = selectedMainCategory === "All" || 
      mainCat === selectedMainCategory.toLowerCase() ||
      mainCat.includes(selectedMainCategory.toLowerCase());

    let matchesSub = true;
    if (selectedMainCategory !== "All" && selectedSubCategory && selectedSubCategory !== `All ${selectedMainCategory}`) {
        matchesSub = subCat === selectedSubCategory.toLowerCase() || subCat.includes(selectedSubCategory.toLowerCase());
    }

    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mainCat.includes(searchQuery.toLowerCase()) ||
      subCat.includes(searchQuery.toLowerCase());
      
    return matchesMain && matchesSub && matchesSearch;
  });

  return (
    <div id="courses-browser" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Search and Filter section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span>Our Courses</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pick your course and purchase versions individually. Access dynamic quizzes immediately after reading.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/15 text-sm bg-white shadow-sm focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Category Selector Pills */}
      <div className="flex flex-wrap gap-2 pb-4">
        {categories.map((category) => {
          const isSelected = selectedMainCategory === category;
          const hasSubCategories = getSubCategories(category).length > 0;
          return (
            <div key={category} className="relative flex flex-col items-center">
              <button
                onClick={() => { setSelectedMainCategory(category); setSelectedSubCategory(null); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white border-transparent shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
              
              {/* Connector caret */}
              {isSelected && hasSubCategories && (
                <div className="absolute -bottom-3.5 flex flex-col items-center">
                  <div className="w-0.5 h-2 bg-blue-600 rounded-t-sm" />
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-blue-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sub-Category Selector Pills */}
      {selectedMainCategory !== "All" && getSubCategories(selectedMainCategory).length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4">
          <button
              onClick={() => setSelectedSubCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide whitespace-nowrap border transition-all cursor-pointer ${
                  selectedSubCategory === null
                  ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
          >
              All {selectedMainCategory}
          </button>
          {getSubCategories(selectedMainCategory).map((subCategory) => (
              <button
              key={subCategory}
              onClick={() => setSelectedSubCategory(subCategory)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide whitespace-nowrap border transition-all cursor-pointer ${
                  selectedSubCategory === subCategory
                  ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              >
              {subCategory}
              </button>
          ))}
        </div>
      )}

      {/* Course Cards Grid */}
      <AnimatePresence mode="wait">
        {filteredCourses.length > 0 ? (
          <motion.div
            key={selectedMainCategory + (selectedSubCategory || "") + searchQuery}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course) => {
              const volumesList = Object.values(course.volumes).sort((a: any, b: any) => (a.id || 0) - (b.id || 0));

              return (
                <div
                  key={course.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={course.bannerUrl}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    
                    {/* Badge details */}
                    <div className="absolute top-4 left-4 flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase text-white bg-blue-600/90">
                        {course.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase text-white bg-slate-900/60 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.estimatedTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                        {course.category}
                      </span>
                      <h2 className="font-display font-bold text-base text-slate-800 tracking-tight line-clamp-1">
                        {course.title}
                      </h2>
                      <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Dynamic Versions Listing */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Versions</h4>
                      
                      {volumesList.map((vol: any) => {
                        const volNum = vol.id;
                        const vKey = `${course.id}-${volNum}`;
                        const pDetails = purchaseDetails[vKey] || purchaseDetails[String(volNum)];
                        const now = Date.now();
                        const isExpired = pDetails && new Date(pDetails.expiresAt).getTime() < now;
                        const daysLeft = pDetails && !isExpired ? Math.max(0, Math.ceil((new Date(pDetails.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;

                        const isUnlocked = (unlockedVersions.includes(String(volNum)) || 
                                           unlockedVersions.includes(vKey) ||
                                           (!vol.isPremium && volNum === 1)) && !isExpired; // free/non-premium first volume

                        const isPreviewOpen = expandedPreview[`${course.id}-${volNum}`];

                        return (
                          <div 
                            key={volNum} 
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 pr-2">
                                <div className="flex items-center space-x-1.5">
                                  <p className="text-xs font-bold text-slate-800">Version {volNum}: {vol.title}</p>
                                  {isUnlocked ? (
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {vol.description}
                                </p>
                              </div>
                              {/* Button */}
                              {isUnlocked ? (
                                <div className="flex flex-col items-end">
                                  <button
                                    onClick={() => {
                                      if (!isLoggedIn) {
                                        onOpenLogin();
                                      } else {
                                        onSelectCourse(course, volNum);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
                                  >
                                    Launch {daysLeft !== null ? `(${daysLeft}d left)` : ''}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <button
                                    onClick={() => {
                                      if (!isLoggedIn) {
                                        onOpenLogin();
                                      } else {
                                        onBuyCourse(course, volNum);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer flex items-center space-x-1"
                                  >
                                    <Tag className="w-3 h-3" />
                                    <span>{isExpired ? `Buy Again - ₹${volNum === 1 ? (course.price || 499) : (course.price || 999)}` : `Buy Now - ₹${volNum === 1 ? (course.price || 499) : (course.price || 999)}`}</span>
                                  </button>
                                  {isExpired && pDetails && (
                                     <span className="text-[9px] text-rose-500 mt-1 leading-tight text-right">Expired on {new Date(pDetails.expiresAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Collapsible Chapter Title Preview (Always visible, even if locked) */}
                            <div className="mt-2 pt-2 border-t border-slate-100/60">
                              <button
                                onClick={() => togglePreview(String(course.id), volNum)}
                                className="flex items-center space-x-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 cursor-pointer"
                              >
                                {isPreviewOpen ? (
                                  <>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                    <span>Hide Curriculum Preview</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    <span>Preview Curriculum ({vol.blocks?.length || 0} Chapters)</span>
                                  </>
                                )}
                              </button>

                              <AnimatePresence>
                                {isPreviewOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-1.5 pl-2 space-y-1"
                                  >
                                    {(vol.blocks || []).map((b: any, bIdx: number) => (
                                      <div key={b.id || bIdx} className="flex items-center space-x-1.5 text-[11px] text-slate-500 py-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <span className="truncate">
                                          Chapter {bIdx + 1}: {b.title || b.paragraph?.split('.')[0] || 'Lesson ' + (bIdx + 1)}
                                        </span>
                                      </div>
                                    ))}
                                    {(vol.blocks || []).length === 0 && (
                                      <p className="text-[10px] text-slate-400 italic">No chapters in this version.</p>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl p-6">
            <div className="p-3 rounded-full bg-slate-50 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">No courses available</p>
              <p className="text-xs text-slate-400 mt-1">
                There are no published modules found under the current category.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
