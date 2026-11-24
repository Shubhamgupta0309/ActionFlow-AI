import React from 'react';
import { Mail, CheckCircle, Clock, AlertTriangle, Sparkles } from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Messages',
      value: stats.messages?.total || 0,
      icon: Mail,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      label: 'Analyzed with AI',
      value: stats.messages?.analyzed || 0,
      icon: Sparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    {
      label: 'Pending Tasks',
      value: stats.tasks?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      label: 'Completed Tasks',
      value: stats.tasks?.completed || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      label: 'High Priority Tasks',
      value: stats.tasks?.high_priority || 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`p-4 rounded-xl border bg-white shadow-xs ${c.border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
}