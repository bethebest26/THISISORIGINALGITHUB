import React, { useState, useEffect } from "react";
import { Course, UserProgress } from "../types";
import CourseContent from "./CourseContent";

export default function CoursePreviewPage({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
        setError("No course ID provided.");
        setLoading(false);
        return;
    }

    fetch(`/api/admin/preview-course/${courseId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch course: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch course for preview:", err);
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      });
  }, [courseId]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Preview...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-medium">Error: {error}</div>;
  if (!course) return <div className="p-8 text-center text-slate-500">Course not found.</div>;

  // Mock progress for read-only mode
  const mockProgress: UserProgress = {
    points: 0,
    completedCourses: [],
    unlockedCourses: [],
    answeredQuestions: {},
    completedVolumes: [],
    unlockedVol1Courses: [],
  };

  // Volume lookup fix: Find volume by volume_number, not by ID key
  const volumeArray = Array.isArray(course.volumes) ? course.volumes : Object.values(course.volumes || {});
  const volume1 = volumeArray.find((v: any) => v.volume_number === 1) || volumeArray[0];
  const initialVolumeId = volume1 ? volume1.id : null;

  return (
    <div className="bg-[#F6F8FC] min-h-screen">
      <CourseContent
        course={course}
        volumeId={initialVolumeId} 
        progress={mockProgress}
        onAnswerQuestion={() => {}}
        onCompleteVolume={() => {}}
        onBack={() => window.close()}
        readOnly={true}
      />
    </div>
  );
}
