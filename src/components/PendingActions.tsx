import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function PendingActions() {
  const actions = [
    // { id: 1, text: "2 chapters have AI-generated MCQs awaiting review", btn: "Review" },
  ];

  if (actions.length === 0) {
    return (
      <div className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm flex items-center gap-3 text-emerald-600 text-sm">
        <CheckCircle className="w-5 h-5" />
        <span>All caught up — nothing needs your attention.</span>
      </div>
    );
  }

  return (
    <div className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm space-y-6">
      <h3 className="font-bold text-slate-800">Pending Actions</h3>
      <div className="space-y-3">
        {actions.map(act => (
          <div key={act.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{act.text}</span>
            </div>
            <button className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">{act.btn}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
