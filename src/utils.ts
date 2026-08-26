/**
 * Utility functions for BeTheBest application.
 */

// Dynamically load Razorpay checkout script
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // If already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Generate unique transaction IDs
export function generateTxnId(): string {
  return "TXN-" + Math.random().toString(36).substring(2, 11).toUpperCase();
}

export interface TierStatus {
  id: string;
  title: string;
  index: number;
  feeling: string;
  requirement: string;
  shortRequirement: string;
  minCourses: number;
  maxCourses: number;
}

export const TIERS: TierStatus[] = [
  {
    id: "Rookie",
    title: "Rookie",
    index: 0,
    feeling: "Curiosity • Potential • First Step",
    requirement: "Start your learning journey by viewing any lessons.",
    shortRequirement: "0–25 Courses",
    minCourses: 0,
    maxCourses: 25,
  },
  {
    id: "Grounded",
    title: "Grounded",
    index: 1,
    feeling: "Stability • Foundations • Practice",
    requirement: "Complete 26–150 completed courses to establish strong roots.",
    shortRequirement: "26–150 Courses",
    minCourses: 26,
    maxCourses: 150,
  },
  {
    id: "Sharpened",
    title: "Sharpened",
    index: 2,
    feeling: "Refinement • Skill • Focus",
    requirement: "Complete 151–500 completed courses to sharpen your focus.",
    shortRequirement: "151–500 Courses",
    minCourses: 151,
    maxCourses: 500,
  },
  {
    id: "Elevated",
    title: "Elevated",
    index: 3,
    feeling: "Perspective • Mastery • Integration",
    requirement: "Complete 501–1000 completed courses to achieve professional height.",
    shortRequirement: "501–1000 Courses",
    minCourses: 501,
    maxCourses: 1000,
  },
  {
    id: "Unshakable",
    title: "Unshakable",
    index: 4,
    feeling: "Discipline • Integrity • Peak Form",
    requirement: "Complete 1001–1500 completed courses to build peak authority.",
    shortRequirement: "1001–1500 Courses",
    minCourses: 1001,
    maxCourses: 1500,
  },
];

export function getTierIndex(completedCoursesCount: number): number {
  if (completedCoursesCount >= 1001) return 4; // Unshakable
  if (completedCoursesCount >= 501) return 3;  // Elevated
  if (completedCoursesCount >= 151) return 2;  // Sharpened
  if (completedCoursesCount >= 26) return 1;   // Grounded
  return 0;                                    // Rookie
}

export function getTierInfo(completedCoursesCount: number): TierStatus {
  const index = getTierIndex(completedCoursesCount);
  return TIERS[index];
}

export const TAXONOMY: { [key: string]: string[] } = {
  "Business": [
    // Business Practices
    "Business", "Business Planning", "Business Strategy", "Business Management", 
    "Business Biography", "Business Models", "Business Forecasting", "Competition", 
    "Passive Income", "Crisis Management", "COO", "Remote Working", "Business Ethics", 
    "Sustainability", "Home-Based Business", "New Business", "Business Consulting", 
    "Solopreneur", "Indie Hacker", "Professional Creators", "Creator Economy"
  ],
  "Startup": [
    "Startup", "Early Stage Startup", "Late Stage Startup", "Lean Startup", 
    "Entrepreneurship", "Entrepreneur", "Innovation and Ideation", "Startup Innovation", 
    "Startup Ideation", "Customer Development", "Fundraising", "Crowdfunding", 
    "Bootstrapping", "Startup Founders", "Social Entrepreneurship", "Intrapreneurship", 
    "Startup Biography", "Startup Accelerator", "Startup Incubator", "Silicon Valley", 
    "Startup Execution", "Startup CEO"
  ],
  "Leadership": [
    "Leadership", "Management", "Management and Leadership", "Project Management", 
    "Team Motivation", "Mentoring and Coaching", "Feedback", "Running Meetings", 
    "Conflict Resolution", "Company Culture", "CEO", "Hiring", "Recruiting", 
    "Leaders Biography", "CEO Biography", "Management Science"
  ],
  "Product Management": [
    "Product Management", "Product Innovation", "Product Planning", "Product Strategy", 
    "User Behavior", "User Story", "Business Metrics", "Analytics", "Google Analytics", 
    "Fabric Analytics", "Product Pricing"
  ],
  "Growth": [
    "Conversion Rate Optimization", "Growth Hacking", "Product Marketing", 
    "User Retention", "Viral Growth"
  ],
  "Marketing": [
    "Affiliate Marketing", "B2B Marketing", "B2C Marketing", "Blogging", "Branding", 
    "CMO", "Community Building", "Competitive Analysis", "Content Marketing", 
    "Copywriting", "Digital Marketing", "Direct Marketing", "Email Marketing", 
    "Facebook Marketing", "Guerilla Marketing", "Influencer Marketing", "Market Research", 
    "Marketing", "Marketing Plan", "Marketing Strategy", "Mobile Marketing", 
    "Multilevel Marketing", "Podcasting", "Positioning", "PR", "Press Release", 
    "Product Launch", "Public Relations", "SEO", "Social Media Marketing", "Storytelling", 
    "Telemarketing", "User Generated Content", "Video Marketing", "Viral Marketing", 
    "Vlogging", "Web Marketing", "YouTube Marketing"
  ],
  "Sales": [
    "Bizdev", "Business Development", "Closing", "Communication Skills", "Etiquette", 
    "Influence", "Mergers and Acquisitions", "Negotiation", "Partnerships", "Pitching", 
    "Presentation", "Prospecting", "Public Speaking", "Sales", "Sales Lead Generation", 
    "Sales Management"
  ],
  "Finance": [
    "Banking", "Banks", "Finance", "Finance Biography", "Fintech", "Foreign Exchange"
  ],
  "Personal Finance": [
    "Budgeting", "Credit Repair", "Credit Score", "Debt", "Education Costs", "Financial Advice", 
    "Loans", "Money Management", "Money Spend", "Mortgage", "Personal Finance", "Personal Taxes", 
    "Retirement Planning", "Salary", "Savings", "Social Security", "Student Loans", "Tax Advantages"
  ],
  "Business and Corporate Finance": [
    "Business Finance", "CFO", "Corporate Finance"
  ],
  "Productivity": [
    "Productivity", "Time Management", "Task Management", "Lifehacking", "Work-Life Balance", 
    "Minimalism", "Focus", "Procrastination", "Goal Setting", "Speed Reading", "Habit Creation", "Skill Building"
  ],
  "Decision Making and Problem Solving": [
    "Behavioral Economics", "Cognitive Biases", "Creative Thinking", "Creativity", 
    "Critical Thinking", "Decision Making", "Lateral Thinking", "Memory Improvement", "Mental Skills", "Problem Solving"
  ],
  "Success": [
    "Financial Success", "Overcome Fear", "Personal Development", "Personal Transformation", 
    "Self Improvement", "Self-Help", "Success", "Wealth"
  ],
  "Career Development": [
    "Business School Guide", "Career Change", "Career Choices", "Career Development", 
    "Career Guide", "College Advice", "CV and Resume", "High Tech", "Internship", 
    "Interviewing", "Job Hunting", "Job Interview", "Job Search", "Personal Branding", 
    "Professional Development", "Vocational Guidance", "Women and Business"
  ],
  "Happiness": [
    "Confidence", "Emotions", "Happiness", "Meaning of Life", "Meditation", 
    "Mid-Life Crisis", "Mindfulness", "Mindset", "Motivational", "Passion", 
    "Positivity", "Purpose", "Self-Confidence", "Self-Esteem", "Spirituality"
  ],
  "Resilience": [
    "Equanimity", "Inner Strength", "Perseverance", "Persistence", "Resilience", 
    "Stress Management"
  ],
  "Interpersonal and Social Skills": [
    "Assertiveness", "Effective Communication", "Emotional Intelligence", "Empathy", 
    "Interpersonal Skills", "Persuasion", "Self Awareness", "Social Intelligence"
  ],
  "Personal Development": [],
  "Personality Development": [
    "Personality Development", "Self Help", "Confidence", "Discipline", "Social Dynamics"
  ],
  "Attraction": [
    "Attraction", "Dating", "Relationships", "Social Presence"
  ]

};

export const MAIN_CATEGORIES = Object.keys(TAXONOMY);

export const ALL_CATEGORIES_ORDERED = [
  "All",
  "Attraction",
  "Business",
  "Startup",
  "Leadership",
  "Product Management",
  "Growth",
  "Marketing",
  "Sales",
  "Finance",
  "Personal Finance",
  "Business and Corporate Finance",
  "Productivity",
  "Decision Making and Problem Solving",
  "Success",
  "Career Development",
  "Happiness",
  "Resilience",
  "Interpersonal and Social Skills",
  "Personality Development"
];

export const getSubCategories = (mainCategory: string): string[] => {
  if (!mainCategory) return [];
  const normalized = mainCategory.trim().toLowerCase();
  for (const key of Object.keys(TAXONOMY)) {
    if (key.toLowerCase() === normalized) {
      return TAXONOMY[key];
    }
  }
  return [];
};

