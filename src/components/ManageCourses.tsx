import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { dbService } from '../services/dbService';
import EditCourseModal from './EditCourseModal';
import { Course, Volume } from '../types';

export default function ManageCourses() {
  const { courses, loading, refreshCourses } = useCourses();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleDelete = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await dbService.deleteCourse(courseId);
        refreshCourses();
      } catch (err) {
        alert("Failed to delete course.");
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-slate-800">Manage Courses</h2>
      </div>

      <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-1">
        {courses.map(course => {
          const volumesList = Object.values(course.volumes || {}) as Volume[];
          const versionsCount = volumesList.length;
          const totalChapters = volumesList.reduce((acc, vol) => acc + (vol.blocks?.length || 0), 0);
          
          return (
            <div key={course.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={course.bannerUrl} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-sm text-slate-700">{course.title}</h4>
                  <p className="text-xs text-slate-400">{course.category}</p>
                  <p className="text-xs text-slate-500">{versionsCount} Versions • {totalChapters} Chapters</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {course.status || 'published'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(`/admin/preview-course/${course.id}`, '_blank')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200"
                >
                  Preview
                </button>
                <button onClick={() => setEditingCourse(course)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingCourse && (
        <EditCourseModal 
          course={editingCourse} 
          onClose={() => { setEditingCourse(null); refreshCourses(); }} 
        />
      )}
    </div>
  );
}
