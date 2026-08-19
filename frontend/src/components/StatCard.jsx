import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, progress }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70 text-blue-600 border-blue-100',
      bar: 'bg-blue-500',
    },
    emerald: {
      bg: 'bg-emerald-50/70 text-emerald-600 border-emerald-100',
      bar: 'bg-emerald-500',
    },
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-600 border-indigo-100',
      bar: 'bg-indigo-500',
    },
    violet: {
      bg: 'bg-violet-50/70 text-violet-600 border-violet-100',
      bar: 'bg-violet-500',
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-600 border-amber-100',
      bar: 'bg-amber-500',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentTheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${currentTheme.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className="font-medium text-emerald-600 flex items-center gap-0.5">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
