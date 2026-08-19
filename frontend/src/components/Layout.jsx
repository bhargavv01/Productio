import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sun, CalendarRange, CalendarDays, Target, Clock, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/day', label: 'Day View', description: 'Log & planned blocks', icon: Sun },
  { to: '/week', label: 'Week View', description: 'Stacked 7-day breakdown', icon: CalendarRange },
  { to: '/month', label: 'Month View', description: 'Monthly trend chart', icon: CalendarDays },
  { to: '/goals', label: 'Goals', description: 'Target tracking', icon: Target },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 sticky top-0 h-screen z-20">
        <div>
          {/* Brand Logo */}
          <div className="px-3 py-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-lg tracking-tight">Productio</h1>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-blue-200/60">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Personal Day Tracker</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/day' && location.pathname === '/');

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm leading-tight">{item.label}</div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="p-3.5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wide text-slate-200 uppercase">Pro Tip</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Plan your schedule in blocks first, then log your actuals to stay intentional!
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 md:px-10 md:py-10 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
