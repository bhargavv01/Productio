import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getWeekReport, getCategories } from '../api/client';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import StatCard from './StatCard';

export default function WeekView() {
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setMinutes(monday.getMinutes() - monday.getTimezoneOffset());
    return monday.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getMonday(new Date()));
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reportRes, catsRes] = await Promise.all([
          getWeekReport(startDate),
          getCategories(),
        ]);
        setReport(reportRes);
        setCategories(catsRes || []);
      } catch (err) {
        console.error('Failed to fetch week data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate]);

  const adjustWeek = (weeks) => {
    const current = new Date(`${startDate}T00:00:00`);
    current.setDate(current.getDate() + weeks * 7);
    const pad = (n) => n.toString().padStart(2, '0');
    setStartDate(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`);
  };

  const { totalMinutes, chartData, productiveMinutes, maxDay } = useMemo(() => {
    if (!report || !report.days) {
      return { totalMinutes: 0, chartData: [], productiveMinutes: 0, maxDay: null };
    }

    let total = 0;
    let prodTotal = 0;
    let peakDay = null;
    let peakMinutes = -1;

    const formatted = report.days.map((day) => {
      const dObj = new Date(`${day.date}T00:00:00`);
      const dayLabel = dObj.toLocaleDateString(undefined, { weekday: 'short' });
      const dateLabel = dObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const dayData = {
        date: day.date,
        dayLabel: `${dayLabel} (${dateLabel})`,
        shortDay: dayLabel,
        totalDayMinutes: day.total_minutes || 0,
        categoriesList: day.categories || [],
      };

      if (day.total_minutes > peakMinutes) {
        peakMinutes = day.total_minutes;
        peakDay = `${dayLabel} (${Math.round(day.total_minutes / 60)}h)`;
      }

      const catMinutes = {};
      if (day.categories) {
        day.categories.forEach((c) => {
          catMinutes[c.category_id] = c.minutes;
          total += c.minutes;
          if (c.label === 'productive') {
            prodTotal += c.minutes;
          }
        });
      }

      categories.forEach((cat) => {
        dayData[`cat_${cat.id}`] = catMinutes[cat.id] || 0;
      });

      return dayData;
    });

    return {
      totalMinutes: total,
      chartData: formatted,
      productiveMinutes: prodTotal,
      maxDay: peakMinutes > 0 ? peakDay : 'N/A',
    };
  }, [report, categories]);

  const formatMin = (mins) => {
    const rounded = Math.round(mins);
    const h = Math.floor(rounded / 60);
    const m = rounded % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const productivityRate = totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 0;
  const dailyAverage = chartData.length > 0 ? Math.round(totalMinutes / chartData.length) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const nonZero = payload.filter((p) => p.value > 0);
      if (nonZero.length === 0) return null;
      const totalDay = nonZero.reduce((sum, entry) => sum + entry.value, 0);

      return (
        <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-100 font-bold text-slate-800">
            <span>{label}</span>
            <span className="text-blue-600 font-extrabold">{formatMin(totalDay)}</span>
          </div>
          <div className="space-y-1.5">
            {nonZero.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatMin(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const weekEndFormatted = useMemo(() => {
    if (!report || !report.end) return '';
    try {
      const startObj = new Date(`${startDate}T00:00:00`);
      const endObj = new Date(`${report.end}T00:00:00`);
      return `${startObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${endObj.toLocaleDateString(
        undefined,
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}`;
    } catch {
      return '';
    }
  }, [report, startDate]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Week Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
            <span>Weekly Analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Week View</h2>
          {weekEndFormatted && <p className="text-xs font-medium text-slate-500 mt-0.5">{weekEndFormatted}</p>}
        </div>

        {/* Week Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => adjustWeek(-1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStartDate(getMonday(new Date()))}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                startDate === getMonday(new Date())
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => adjustWeek(1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Week Time"
          value={formatMin(totalMinutes)}
          subtitle="logged across 7 days"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Daily Average"
          value={formatMin(dailyAverage)}
          subtitle="per day this week"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Productive Share"
          value={`${productivityRate}%`}
          subtitle={`${formatMin(productiveMinutes)} productive`}
          icon={Sparkles}
          color="emerald"
          progress={productivityRate}
        />
        <StatCard
          title="Peak Day"
          value={maxDay}
          subtitle="highest volume logged"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Stacked Bar Chart Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">7-Day Stacked Activity</h3>
            <p className="text-xs text-slate-500">Compare time distribution across categories by day</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            Stacked Bar Chart
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading week report...</div>
        ) : chartData.length === 0 || totalMinutes === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarRange className="w-12 h-12 mx-auto text-slate-200 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium">No activity logged for this week</p>
            <p className="text-xs text-slate-400 mt-1">Log your day-to-day entries in Day View to see weekly trends</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortDay"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${Math.round(val / 60)}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  {categories.map((cat) => (
                    <Bar
                      key={cat.id}
                      dataKey={`cat_${cat.id}`}
                      name={cat.name}
                      stackId="weekStack"
                      fill={cat.color || '#3b82f6'}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Day by Day Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daily Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {chartData.map((day) => {
            const hasData = day.totalDayMinutes > 0;
            return (
              <div
                key={day.date}
                className={`p-4 rounded-xl border transition-all ${
                  hasData
                    ? 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/50 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{day.shortDay}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{day.date.substring(5)}</div>
                <div className={`text-base font-extrabold mt-2 ${hasData ? 'text-slate-900' : 'text-slate-400'}`}>
                  {formatMin(day.totalDayMinutes)}
                </div>

                {/* Mini categories pill preview */}
                {hasData && (
                  <div className="mt-2.5 flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-slate-100">
                    {day.categoriesList.map((c) => (
                      <div
                        key={c.category_id}
                        style={{
                          width: `${(c.minutes / day.totalDayMinutes) * 100}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
