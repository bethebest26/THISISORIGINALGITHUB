import React from 'react';
import { CheckCircle2, DollarSign, Star, User } from 'lucide-react';

const activities = [
  { id: 1, type: 'completion', text: "Amit Patel completed Chapter 3 — scored 5/5", time: "2 mins ago", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
  { id: 2, type: 'purchase', text: "Pranav Sharma purchased Version 2 (₹499)", time: "15 mins ago", icon: <DollarSign className="w-4 h-4 text-blue-500" /> },
  { id: 3, type: 'registration', text: "New student registered: John Doe", time: "1 hour ago", icon: <User className="w-4 h-4 text-slate-400" /> },
  { id: 4, type: 'upgrade', text: "Amit Patel advanced to Elevated tier", time: "3 hours ago", icon: <Star className="w-4 h-4 text-purple-500" /> },
];

export default function RecentActivity() {
  return (
    <div className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm space-y-6">
      <h3 className="font-bold text-slate-800">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map(act => (
          <div key={act.id} className="flex items-center gap-3 text-xs text-slate-600">
            {act.icon}
            <span className="flex-1">{act.text}</span>
            <span className="text-[10px] text-slate-400">{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
