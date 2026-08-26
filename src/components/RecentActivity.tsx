import React from 'react';
import { CheckCircle2, DollarSign, Star, User } from 'lucide-react';

const activities: any[] = [];

export default function RecentActivity() {
  return (
    <div className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm space-y-6">
      <h3 className="font-bold text-slate-800">Recent Activity</h3>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map(act => (
            <div key={act.id} className="flex items-center gap-3 text-xs text-slate-600">
              {act.icon}
              <span className="flex-1">{act.text}</span>
              <span className="text-[10px] text-slate-400">{act.time}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500 py-4 text-center">
            No recent activity yet.
          </div>
        )}
      </div>
    </div>
  );
}
