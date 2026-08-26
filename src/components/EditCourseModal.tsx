import React, { useState } from 'react';
import { X, Save, Edit, Trash2, Plus, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Course, Volume } from '../types';
import { supabase } from '../lib/supabase';

export default function EditCourseModal({ course: initialCourse, onClose }: { course: Course, onClose: () => void }) {
  const [course, setCourse] = useState<Course>({
    ...initialCourse,
    isPublished: initialCourse.isPublished ?? true,
    volumes: Object.fromEntries(
      Object.entries(initialCourse.volumes).map(([k, v]) => [k, { ...v, price: v.price ?? 0, isPublished: v.isPublished ?? true }])
    )
  });
  const [activeVolume, setActiveVolume] = useState<Volume | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const updateCourseField = (field: keyof Course, value: any) => setCourse(c => ({ ...c, [field]: value }));
  const updateVolume = (id: number, updates: Partial<Volume>) => setCourse(c => ({
    ...c, volumes: { ...c.volumes, [id]: { ...c.volumes[id], ...updates } }
  }));

  const deleteVolume = (id: number) => {
    if (confirm("Are you sure you want to delete this version?")) {
      const newVolumes = { ...course.volumes };
      delete newVolumes[id];
      setCourse(c => ({ ...c, volumes: newVolumes }));
    }
  };

  const moveVolume = (id: number, direction: 'up' | 'down') => {
    const ids = Object.keys(course.volumes).map(Number).sort((a, b) => a - b);
    const idx = ids.indexOf(id);
    if (direction === 'up' && idx > 0) [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    else if (direction === 'down' && idx < ids.length - 1) [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    
    const newVolumes: Record<number, Volume> = {};
    ids.forEach((vId, i) => newVolumes[i + 1] = { ...course.volumes[vId], id: i + 1 });
    setCourse(c => ({ ...c, volumes: newVolumes }));
  };

  const addVersion = () => {
    const newId = Object.keys(course.volumes).length + 1;
    setCourse(c => ({
      ...c, volumes: { ...c.volumes, [newId]: { id: newId, title: `Version ${newId}`, description: "", blocks: [], isPremium: true, price: 99, isPublished: true } }
    }));
  };

  const handleSave = async () => {
    if (!supabase) {
      setErrorMsg('Supabase is not initialized');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      // 1. Update the main course metadata
      const { error: courseError } = await supabase
        .from('courses')
        .update({
          title: course.title,
          description: course.description,
          banner_url: course.bannerUrl,
          is_published: course.isPublished
        })
        .eq('id', course.id);

      if (courseError) throw courseError;

      // 2. Save each volume in the course
      const volumesToSave = Object.values(course.volumes) as Volume[];
      for (const volume of volumesToSave) {
        // Check if this volume exists for the course
        const { data: volRow, error: volFetchError } = await supabase
          .from('course_volumes')
          .select('id')
          .eq('course_id', course.id)
          .eq('volume_number', volume.id)
          .maybeSingle();

        if (volFetchError) throw volFetchError;

        if (volRow) {
          // Update existing volume
          const { error: volUpdateError } = await supabase
            .from('course_volumes')
            .update({
              title: volume.title,
              description: volume.description,
              price: volume.price,
              is_published: volume.isPublished
            })
            .eq('id', volRow.id);

          if (volUpdateError) throw volUpdateError;
        } else {
          // Insert new volume
          const { error: volInsertError } = await supabase
            .from('course_volumes')
            .insert({
              course_id: course.id,
              volume_number: volume.id,
              title: volume.title,
              description: volume.description,
              price: volume.price,
              is_published: volume.isPublished
            });

          if (volInsertError) throw volInsertError;
        }
      }

      onClose();
    } catch (err: any) {
      console.error("Error saving course:", err);
      setErrorMsg(err.message || "Failed to save course changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Course: {course.title}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        <div className="space-y-6">
          <section className="flex gap-6 items-start">
            <div className="relative group">
              <img src={course.bannerUrl} className="w-32 h-32 rounded-lg object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                <ImageIcon className="text-white w-8 h-8" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Course Metadata</h3>
                <button onClick={() => updateCourseField('isPublished', !course.isPublished)} className="flex items-center gap-2 text-sm font-medium">
                  {course.isPublished ? <ToggleRight className="text-green-500" /> : <ToggleLeft className="text-slate-400" />}
                  {course.isPublished ? "Published" : "Draft"}
                </button>
              </div>
              <input className="w-full p-2 border rounded" value={course.title} onChange={(e) => updateCourseField('title', e.target.value)} />
              <textarea className="w-full p-2 border rounded" value={course.description} onChange={(e) => updateCourseField('description', e.target.value)} />
            </div>
          </section>

          <section>
            <h3 className="font-bold text-slate-700 mb-3">Versions</h3>
            {activeVolume ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-4">
                  <h4 className="font-bold">Editing Version: {activeVolume.title}</h4>
                  <button onClick={() => setActiveVolume(null)} className="text-xs text-slate-500 underline">Back to Versions</button>
                </div>
                <div className="space-y-3">
                  {activeVolume.blocks.map((block, idx) => (
                    <div key={block.id} className="p-3 bg-white border rounded flex justify-between items-center text-sm">
                      <span>Chapter {idx + 1}: {block.title || 'Untitled'}</span>
                      <div className="flex gap-2">
                        <button className="text-blue-600">Edit Text</button>
                        <button className="text-blue-600">Edit MCQ</button>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mt-2">
                    <Plus className="w-4 h-4" /> Add New Chapter
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(Object.values(course.volumes) as Volume[]).map(volume => (
                  <div key={volume.id} className="p-3 border rounded flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <button onClick={() => moveVolume(Number(volume.id), 'up')}><ChevronUp className="w-4 h-4" /></button>
                        <button onClick={() => moveVolume(Number(volume.id), 'down')}><ChevronDown className="w-4 h-4" /></button>
                      </div>
                      <span className="font-medium">{volume.title}</span>
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border">{volume.blocks.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="number" className="w-16 p-1 text-sm border rounded" value={volume.price} onChange={(e) => updateVolume(Number(volume.id), { price: parseInt(e.target.value) })} />
                      <button onClick={() => updateVolume(Number(volume.id), { isPublished: !volume.isPublished })} className="text-sm">
                        {volume.isPublished ? <ToggleRight className="text-green-500" /> : <ToggleLeft className="text-slate-400" />}
                      </button>
                      <button onClick={() => setActiveVolume(volume)} className="text-blue-600 text-sm">Edit</button>
                      <button onClick={() => deleteVolume(Number(volume.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={addVersion} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mt-2">
                  <Plus className="w-4 h-4" /> Add New Version
                </button>
              </div>
            )}
          </section>
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border rounded disabled:opacity-50">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
