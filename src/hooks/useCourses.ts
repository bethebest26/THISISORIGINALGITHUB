import { useState, useEffect, useCallback } from 'react';
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
        
        // Parse embedded image and true introduction text
        const introParts = (lesson.introduction || "").split("||IMAGE_URL||");
        const introduction = introParts[0] || "";
        const imageFromIntro = introParts[1] || "";
        
        const paragraph = cardsContent || introduction || "";
        
        // Map MCQ
        const rawMcqs = lesson.mcqs || [];
        const mcqs: MCQ[] = rawMcqs.length > 0 ? rawMcqs.map((rawMcq: any) => ({
          id: rawMcq.id,
          question: rawMcq.question,
          options: rawMcq.options || [],
          correctAnswer: rawMcq.correct_answer || rawMcq.correctAnswer || "",
          feedback: rawMcq.feedback || "Correct! Keep up the great focus.",
          points: rawMcq.points || 10
        })) : [{
          id: `${lesson.id}-q1`,
          question: "What is the primary takeaway of this lesson?",
          options: ["Takeaway A", "Takeaway B", "Takeaway C", "Takeaway D"],
          correctAnswer: "Takeaway A",
          feedback: "Good attempt!",
          points: 10
        }];

        return {
          id: lesson.id,
          title: lesson.title || 'Chapter Topic',
          paragraph,
          imageUrl: imageFromIntro || lesson.image_url || lesson.imageUrl || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop",
          mcqs, // Support multiple MCQs
          mcq: mcqs[0], // Fallback compatibility
          introduction,
          readingTime: lesson.reading_time || "10 Minutes",
          difficulty: lesson.difficulty || "Intermediate",
          realLifeScenario: lesson.real_life_scenario || "Concept in action",
          realLifeOutcome: lesson.real_life_outcome || "Positive resolution"
        } as any;
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
    price: dbCourse.price || 49,
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

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      // 1. First attempt to fetch from Express backend API
      try {
        const apiRes = await fetch('/api/courses');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (Array.isArray(apiData)) {
            const mappedDbCourses = apiData.map(mapDbCourseToCourse);
            setCourses(mappedDbCourses);
            setLoading(false);
            return;
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
        console.warn('Supabase courses fetch error:', error);
        setCourses([]);
        setError(error.message);
      } else {
        const mappedDbCourses = (data || []).map(mapDbCourseToCourse);
        setCourses(mappedDbCourses);
      }
    } catch (err: any) {
      console.warn('Error fetching courses:', err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refreshCourses: fetchCourses };
};
