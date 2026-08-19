import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { getMonthReport, getCategories } from '../api/client';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatCard from './StatCard';

export default function MonthView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reportRes, catsRes] = await Promise.all([
          getMonthReport(year, month),
          getCategories(),
        ]);
        setReport(reportRes);
        setCategories(catsRes || []);
      } catch (err) {
        console.error('Failed to fetch month data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const adjustMonth = (delta) => {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setYear(nextYear);
    setMonth(nextMonth);
  };

  const { totalMinutes, chartData, daysWithData, topCategoryName, topCategoryColor } = useMemo(() => {
    if (!report || !report.days) {
      return { totalMinutes: 0, chartData: [], daysWithData: 0, topCategoryName: 'None', topCategoryColor: '#94a3b8' };
    }

    let total = 0;
    let daysWithDataCount = 0;
    const catAccumulator = {};

    const formatted = report.days.map((day) => {
      const dailyTotal = day.total_minutes || 0;
      total += dailyTotal;
      if (dailyTotal > 0) daysWithDataCount++;

      let dominantCat = null;
      let maxMins = 0;
      if (day.categories && day.categories.length > 0) {
        day.categories.forEach((c) => {
          const cat = categories.find((item) => item.id === c.category_id);
          catAccumulator[c.category_id] = (catAccumulator[c.category_id] || 0) + c.minutes;
          if (c.minutes > maxMins) {
            maxMins = c.minutes;
            dominantCat = cat || null;
          }
        });
      }

      return {
        dayNumber: new Date(`${day.date}T00:00:00`).getDate(),
        totalMinutes: Math.round(dailyTotal),
        dominantCat,
        dominantCatName: dominantCat ? dominantCat.name : null,
        dominantCatMins: Math.round(maxMins),
        fillColor: dailyTotal > 0 && dominantCat ? dominantCat.color || '#3b82f6' : '#e2e8f0',
      };
    });

    // Find overall top category in the month
    let bestCatId = null;
    let highestMins = 0;
    Object.entries(catAccumulator).forEach(([catId, mins]) => {
      if (mins > highestMins) {
        highestMins = mins;
        bestCatId = parseInt(catId, 10);
      }
    });

    const bestCat = categories.find((c) => c.id === bestCatId);

    return {
      totalMinutes: total,
      chartData: formatted,
      daysWithData: daysWithDataCount,
      topCategoryName: bestCat ? bestCat.name : 'None',
      topCategoryColor: bestCat ? bestCat.color : '#94a3b8',
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

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyAverage = daysWithData > 0 ? Math.round(totalMinutes / daysWithData) : 0;
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.totalMinutes === 0) return null;

      return (
        <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200/80 text-xs">
          <p className="font-bold text-slate-800 mb-1">
            {monthName} {data.dayNumber}, {year}
          </p>
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold mb-1">
            <span>Total Logged:</span>
            <span className="text-blue-600 font-extrabold">{formatMin(data.totalMinutes)}</span>
          </div>
          {data.dominantCat && (
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.dominantCat.color }} />
              <span className="text-slate-700 font-medium">
                Top: {data.dominantCatName} ({formatMin(data.dominantCatMins)})
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Month Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>Monthly Trends</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {monthName} {year}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {daysWithData} of {daysInMonth} days active
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => adjustMonth(-1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setYear(today.getFullYear());
                setMonth(today.getMonth() + 1);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                year === today.getFullYear() && month === today.getMonth() + 1
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => adjustMonth(1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            min="2020"
            max="2035"
            className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Month Hours"
          value={formatMin(totalMinutes)}
          subtitle="logged this month"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Days"
          value={`${daysWithData} / ${daysInMonth}`}
          subtitle={`${Math.round((daysWithData / daysInMonth) * 100)}% consistency`}
          icon={CheckCircle2}
          color="emerald"
          progress={(daysWithData / daysInMonth) * 100}
        />
        <StatCard
          title="Daily Active Average"
          value={formatMin(dailyAverage)}
          subtitle="on active days"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Dominant Category"
          value={topCategoryName}
          subtitle="most time spent"
          icon={Sparkles}
          color="violet"
        />
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daily Activity Heatmap</h3>
            <p className="text-xs text-slate-500">Bars are color-coded by the dominant category of each day</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {monthName} {year}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading month report...</div>
        ) : chartData.length === 0 || totalMinutes === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarDays className="w-12 h-12 mx-auto text-slate-200 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium">No activity logged for {monthName} {year}</p>
            <p className="text-xs text-slate-400 mt-1">Start logging daily activities to view monthly trends</p>
          </div>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="dayNumber"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${Math.round(val / 60)}h`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="totalMinutes" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
