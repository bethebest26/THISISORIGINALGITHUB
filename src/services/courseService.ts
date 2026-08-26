import { supabase } from '../lib/supabase';
import { Course, Volume, CourseBlock, MCQ } from '../types';

function mapDbCourseToCourse(dbCourse: any): Course {
  const volumes: { [key: number]: Volume } = {};

  const dbVolumes = dbCourse.course_volumes || [];
  dbVolumes.forEach((v: any) => {
    const volNum = v.volume_number || 1;
    
    // Map lessons to blocks
    const blocks = (v.lessons || [])
      .sort((a: any, b: any) => (a.trait_number || 0) - (b.trait_number || 0))
      .map((lesson: any) => {
        // Map reading cards content
        const cardsContent = (lesson.reading_cards || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((card: any) => card.content)
          .join("\n\n");
        
        const paragraph = cardsContent || lesson.introduction || "";
        
        // Map MCQ
        const rawMcq = (lesson.mcqs && lesson.mcqs[0]) || null;
        const mcq: MCQ = rawMcq ? {
          id: rawMcq.id,
          question: rawMcq.question,
          options: rawMcq.options || [],
          correctAnswer: rawMcq.correct_answer || rawMcq.correctAnswer || "",
          points: rawMcq.points || 100
        } : {
          id: `${lesson.id}-q1`,
          question: "What is the primary takeaway of this lesson?",
          options: ["Takeaway A", "Takeaway B", "Takeaway C", "Takeaway D"],
          correctAnswer: "Takeaway A",
          points: 100
        };

        return {
          id: lesson.id,
          paragraph,
          imageUrl: lesson.imageUrl || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop",
          mcq
        } as CourseBlock;
      });

    volumes[volNum] = {
      id: volNum,
      title: v.title || `Volume ${volNum}`,
      description: v.description || `Content for Volume ${volNum}`,
      isPremium: volNum > 1,
      price: v.price || 0,
      isPublished: v.is_published !== undefined ? v.is_published : (v.isPublished !== undefined ? v.isPublished : true),
      blocks
    };
  });

  // Ensure volume 1 is present if volumes is empty
  if (Object.keys(volumes).length === 0) {
    volumes[1] = {
      id: 1,
      title: "Foundations",
      description: "Foundational concepts and principles.",
      isPremium: false,
      price: 0,
      isPublished: true,
      blocks: []
    };
  }

  return {
    id: dbCourse.id,
    title: dbCourse.title,
    description: dbCourse.description || "",
    bannerUrl: dbCourse.banner_url || dbCourse.bannerUrl || "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop",
    price: dbCourse.price || 299,
    category: dbCourse.category || `${dbCourse.main_category || ""}, ${dbCourse.sub_category || ""}`,
    mainCategory: dbCourse.main_category || dbCourse.mainCategory || "",
    subCategory: dbCourse.sub_category || dbCourse.subCategory || "",
    main_category: dbCourse.main_category || dbCourse.mainCategory || "",
    sub_category: dbCourse.sub_category || dbCourse.subCategory || "",
    difficulty: dbCourse.difficulty || "Intermediate",
    estimatedTime: dbCourse.estimated_time || dbCourse.estimatedTime || "2 Hours",
    isPublished: dbCourse.is_published !== undefined ? dbCourse.is_published : (dbCourse.isPublished !== undefined ? dbCourse.isPublished : true),
    volumes
  };
}

export const getCourses = async (): Promise<Course[]> => {
  try {
    // 1. First attempt to fetch from Express backend API
    try {
      const apiRes = await fetch('/api/courses');
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (Array.isArray(apiData)) {
          return apiData.map(mapDbCourseToCourse);
        }
      }
    } catch (apiErr) {
      console.warn('Failed to fetch courses from Express backend API, trying Supabase directly:', apiErr);
    }

    // 2. Direct Supabase fallback
    const { data, error } = await supabase
      .from('courses')
      .select('*, course_volumes(*, lessons(*, reading_cards(*), mcqs(*)))');

    if (error) {
      console.error('Error fetching courses from Supabase:', error);
      return [];
    }

    return (data || []).map(mapDbCourseToCourse);
  } catch (err) {
    console.error('Exception fetching courses:', err);
    return [];
  }
};
