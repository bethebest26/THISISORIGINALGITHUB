export interface MCQ {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface CourseBlock {
  id: string | number;
  paragraph: string;
  imageUrl: string;
  mcq: MCQ;
  title?: string;
  mcqs?: MCQ[];
}

export interface Volume {
  id: string | number;
  title: string;
  description: string;
  blocks: CourseBlock[];
  isPremium: boolean;
  price: number;
  isPublished: boolean;
}

export interface Course {
  id: string | number;
  title: string;
  description: string;
  bannerUrl: string;
  price: number;
  category: string;
  mainCategory?: string;
  subCategory?: string;
  main_category?: string;
  sub_category?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  isPublished: boolean;
  status?: string;
  volumes: { [key: number]: Volume };
}

export interface UserProgress {
  points: number;
  completedCourses: string[]; // List of courseIds fully completed
  unlockedCourses: string[]; // List of courseIds unlocked (for premium access)
  answeredQuestions: {
    [mcqId: string]: {
      selectedAnswer: string;
      isCorrect: boolean;
      pointsEarned: number;
    };
  };
  completedVolumes: string[]; // List of "courseId-volumeId" completed
  completedCoursesCount?: number; // Backend-stored completed courses count
  unlockedVol1Courses?: string[]; // List of courseIds where Vol 1 is unlocked
  streakCount?: number;
  lastActiveDate?: string;
}

export interface User {
  email: string;
  name: string;
  id?: string;
  role?: string;
}

export interface ExpandedLesson {
  id: string | number;
  title?: string;
  content?: string;
  readingCards?: any[];
  imageUrl?: string;
  readingTime?: string;
  difficulty?: string;
  realLifeExample?: { title?: string; scenario?: string; analysis?: string; conclusion?: string; outcome?: string; };
  mcqs?: any[];
  graphic?: any;
  traitNumber?: number | string;
  introduction?: string;
  practiceExercise?: any;
  selfReflection?: any;
  summary?: any;
}
