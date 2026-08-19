import React from 'react';

export default function CategoryBadge({ category, showLabel = false, size = 'md' }) {
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Unknown
      </span>
    );
  }

  const labelConfig = {
    productive: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      label: 'Productive',
    },
    neutral: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      label: 'Neutral',
    },
    unproductive: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      label: 'Unproductive',
    },
  };

  const labelStyle = labelConfig[category.label] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200/60',
    label: category.label,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses}`}
        style={{
          backgroundColor: `${category.color}15`,
          borderColor: `${category.color}35`,
          color: category.color,
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: category.color }}
        />
        <span className="font-semibold text-slate-800">{category.name}</span>
      </span>

      {showLabel && category.label && (
        <span
          className={`inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${labelStyle.bg}`}
        >
          {labelStyle.label}
        </span>
      )}
    </div>
  );
}
