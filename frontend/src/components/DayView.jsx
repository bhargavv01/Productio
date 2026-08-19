import React, { useState, useEffect, useMemo } from 'react';
import {
  getCategories,
  getLogEntries,
  createLogEntry,
  updateLogEntry,
  deleteLogEntry,
  getPlannedBlocks,
  createPlannedBlock,
  updatePlannedBlock,
  deletePlannedBlock,
  getDayReport,
} from '../api/client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ListTodo,
  History,
  Tag,
  AlignLeft,
  X,
  Play,
  Activity,
  ArrowRight,
} from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import StatCard from './StatCard';

const formatTime = (dateString) => {
  if (!dateString) return '';
  // Handle time-only strings like "09:00:00" from planned blocks
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
    const [h, m] = dateString.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTodayDateString = () => {
  const today = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

const formatDuration = (minutes) => {
  const rounded = Math.round(minutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export default function DayView() {
  const [date, setDate] = useState(getTodayDateString());
  const [categories, setCategories] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [plannedBlocks, setPlannedBlocks] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms Visibility Toggles
  const [showLogForm, setShowLogForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);

  // New Log Entry State
  const [newLog, setNewLog] = useState({
    title: '',
    category_id: '',
    start_time: '',
    end_time: '',
    note: '',
  });

  // Edit Log Entry State
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLog, setEditLog] = useState({});

  // New Planned Block State
  const [newBlock, setNewBlock] = useState({
    title: '',
    category_id: '',
    start_time: '09:00',
    end_time: '10:00',
  });

  // Edit Planned Block State
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editBlock, setEditBlock] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDayData(date);
    setDefaultLogTimes(date);
  }, [date, categories]);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchDayData = async (selectedDate) => {
    setLoading(true);
    try {
      const [logs, blocks, dayReport] = await Promise.all([
        getLogEntries(selectedDate),
        getPlannedBlocks(selectedDate),
        getDayReport(selectedDate),
      ]);
      setLogEntries(logs || []);
      setPlannedBlocks(blocks || []);
      setReport(dayReport);
    } catch (error) {
      console.error('Failed to fetch day data', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultLogTimes = (selectedDate) => {
    const now = new Date();
    let start;
    if (selectedDate === getTodayDateString()) {
      start = new Date();
      start.setMinutes(0, 0, 0);
    } else {
      start = new Date(`${selectedDate}T09:00:00`);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatForInput = (d) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setNewLog((prev) => ({
      ...prev,
      start_time: formatForInput(start),
      end_time: formatForInput(end),
      category_id: prev.category_id || (categories.length > 0 ? categories[0].id : ''),
    }));

    setNewBlock((prev) => ({
      ...prev,
      start_time: '09:00',
      end_time: '10:00',
      category_id: prev.category_id || (categories.length > 0 ? categories[0].id : ''),
    }));
  };

  // Quick Date Controls
  const adjustDate = (days) => {
    const current = new Date(`${date}T00:00:00`);
    current.setDate(current.getDate() + days);
    const pad = (n) => n.toString().padStart(2, '0');
    setDate(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`);
  };

  const formattedDateTitle = useMemo(() => {
    try {
      const d = new Date(`${date}T00:00:00`);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  }, [date]);

  // Log Entry Handlers
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.title || !newLog.category_id || !newLog.start_time || !newLog.end_time) return;

    try {
      const entryToCreate = {
        title: newLog.title,
        category_id: parseInt(newLog.category_id, 10),
        start_time: new Date(newLog.start_time).toISOString(),
        end_time: new Date(newLog.end_time).toISOString(),
        note: newLog.note || null,
      };
      await createLogEntry(entryToCreate);
      fetchDayData(date);
      setDefaultLogTimes(date);
      setNewLog((prev) => ({ ...prev, title: '', note: '' }));
      setShowLogForm(false);
    } catch (error) {
      console.error('Failed to add log entry', error);
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      try {
        await deleteLogEntry(id);
        fetchDayData(date);
      } catch (error) {
        console.error('Failed to delete log entry', error);
      }
    }
  };

  const startEditingLog = (log) => {
    const formatForInput = (isoStr) => {
      const d = new Date(isoStr);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEditingLogId(log.id);
    setEditLog({
      ...log,
      start_time: formatForInput(log.start_time),
      end_time: formatForInput(log.end_time),
    });
  };

  const handleUpdateLog = async () => {
    try {
      const entryToUpdate = {
        title: editLog.title,
        category_id: parseInt(editLog.category_id, 10),
        start_time: new Date(editLog.start_time).toISOString(),
        end_time: new Date(editLog.end_time).toISOString(),
        note: editLog.note || null,
      };
      await updateLogEntry(editingLogId, entryToUpdate);
      setEditingLogId(null);
      fetchDayData(date);
    } catch (error) {
      console.error('Failed to update log entry', error);
    }
  };

  // Planned Block Handlers
  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!newBlock.title || !newBlock.category_id || !newBlock.start_time || !newBlock.end_time) return;

    try {
      const startTime = newBlock.start_time.length === 5 ? `${newBlock.start_time}:00` : newBlock.start_time;
      const endTime = newBlock.end_time.length === 5 ? `${newBlock.end_time}:00` : newBlock.end_time;

      await createPlannedBlock({
        title: newBlock.title,
        category_id: parseInt(newBlock.category_id, 10),
        date: date,
        start_time: startTime,
        end_time: endTime,
      });
      fetchDayData(date);
      setNewBlock((prev) => ({ ...prev, title: '' }));
      setShowBlockForm(false);
    } catch (error) {
      console.error('Failed to add block', error);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (window.confirm('Are you sure you want to delete this planned block?')) {
      try {
        await deletePlannedBlock(id);
        fetchDayData(date);
      } catch (error) {
        console.error('Failed to delete block', error);
      }
    }
  };

  const startEditingBlock = (block) => {
    const getLocalTime = (timeStr) => {
      if (!timeStr) return '09:00';
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
        return timeStr.substring(0, 5);
      }
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr.substring(0, 5);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEditingBlockId(block.id);
    setEditBlock({
      ...block,
      start_time: getLocalTime(block.start_time),
      end_time: getLocalTime(block.end_time),
    });
  };

  const handleUpdateBlock = async () => {
    try {
      const startTime = editBlock.start_time.length === 5 ? `${editBlock.start_time}:00` : editBlock.start_time;
      const endTime = editBlock.end_time.length === 5 ? `${editBlock.end_time}:00` : editBlock.end_time;

      await updatePlannedBlock(editingBlockId, {
        title: editBlock.title,
        category_id: parseInt(editBlock.category_id, 10),
        date: date,
        start_time: startTime,
        end_time: endTime,
      });
      setEditingBlockId(null);
      fetchDayData(date);
    } catch (error) {
      console.error('Failed to update block', error);
    }
  };

  // Convert planned block to actual log pre-fill
  const logPlannedBlock = (block) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const start = `${date}T${block.start_time.substring(0, 5)}`;
    const end = `${date}T${block.end_time.substring(0, 5)}`;

    setNewLog({
      title: block.title,
      category_id: block.category_id,
      start_time: start,
      end_time: end,
      note: 'Logged from planned block',
    });
    setShowLogForm(true);
    // Scroll to form smoothly
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Chart & Stats Data
  const chartData = useMemo(() => {
    if (!report || !report.categories) return [];
    return report.categories
      .map((s) => {
        const cat = categories.find((c) => c.id === s.category_id);
        return {
          name: s.name || (cat ? cat.name : 'Unknown'),
          value: s.minutes,
          color: s.color || (cat ? cat.color : '#3b82f6'),
          label: s.label || (cat ? cat.label : 'neutral'),
          category_id: s.category_id,
        };
      })
      .filter((d) => d.value > 0);
  }, [report, categories]);

  const totalMinutes = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const productiveMinutes = useMemo(() => {
    return chartData
      .filter((item) => item.label === 'productive')
      .reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const productivityScore = useMemo(() => {
    if (totalMinutes === 0) return 0;
    return Math.round((productiveMinutes / totalMinutes) * 100);
  }, [productiveMinutes, totalMinutes]);

  const getCategoryDetails = (id) => {
    return categories.find((c) => c.id === id) || { name: 'Unknown', color: '#94a3b8', label: 'neutral' };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Date Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Schedule & Log</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{formattedDateTitle}</h2>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => adjustDate(-1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDate(getTodayDateString())}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                date === getTodayDateString() ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => adjustDate(1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Accounted Time"
          value={formatDuration(totalMinutes)}
          subtitle="out of 24h total"
          icon={Clock}
          color="blue"
          progress={(totalMinutes / 1440) * 100}
        />
        <StatCard
          title="Productivity Rate"
          value={`${productivityScore}%`}
          subtitle={`${formatDuration(productiveMinutes)} productive`}
          icon={Sparkles}
          color="emerald"
          progress={productivityScore}
        />
        <StatCard
          title="Planned Blocks"
          value={plannedBlocks.length}
          subtitle="scheduled items"
          icon={ListTodo}
          color="indigo"
        />
        <StatCard
          title="Logged Activities"
          value={logEntries.length}
          subtitle="completed items"
          icon={History}
          color="violet"
        />
      </div>

      {/* Donut Chart & Category Breakdown (Screen Time Style) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Time Breakdown</h3>
            <p className="text-xs text-slate-500">Android Screen Time style category split</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {formatDuration(totalMinutes)} logged
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[260px]">
            {totalMinutes > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${formatDuration(val)} (${Math.round((val / totalMinutes) * 100)}%)`, 'Time']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatDuration(totalMinutes)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-0.5">/ 24 Hours</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                <Clock className="w-12 h-12 text-slate-200 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">No activity logged for this day</p>
                <p className="text-xs text-slate-400 mt-1">Add your first log entry below</p>
              </div>
            )}
          </div>

          {/* Category List with Progress Bars */}
          <div className="lg:col-span-7 space-y-3.5">
            {chartData.length > 0 ? (
              chartData.map((item) => {
                const percentage = Math.round((item.value / totalMinutes) * 100);
                return (
                  <div key={item.category_id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          ({item.label})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatDuration(item.value)}</span>
                        <span className="text-slate-400 font-medium w-8 text-right">{percentage}%</span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Add log entries to view your category breakdown
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Planned Blocks Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Planned Blocks</h3>
              <p className="text-xs text-slate-500">Plan out your schedule ahead of time</p>
            </div>
          </div>

          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            {showBlockForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showBlockForm ? 'Cancel' : 'Plan Block'}</span>
          </button>
        </div>

        {/* Collapsible Add Block Form */}
        {showBlockForm && (
          <form
            onSubmit={handleAddBlock}
            className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6 space-y-4 animate-fadeIn"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Block Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Work on Backend API"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={newBlock.category_id}
                  onChange={(e) => setNewBlock({ ...newBlock, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={newBlock.start_time}
                  onChange={(e) => setNewBlock({ ...newBlock, start_time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={newBlock.end_time}
                  onChange={(e) => setNewBlock({ ...newBlock, end_time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                Save Planned Block
              </button>
            </div>
          </form>
        )}

        {/* Planned Blocks List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Loading schedule...</div>
          ) : plannedBlocks.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              <ListTodo className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No planned blocks for this day</p>
              <p className="text-xs text-slate-400 mt-1">Click "Plan Block" above to schedule ahead</p>
            </div>
          ) : (
            plannedBlocks.map((block) => {
              const cat = getCategoryDetails(block.category_id);
              const isEditing = editingBlockId === block.id;

              if (isEditing) {
                return (
                  <div key={block.id} className="p-4 bg-slate-50 rounded-2xl border border-indigo-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editBlock.title}
                        onChange={(e) => setEditBlock({ ...editBlock, title: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                      <select
                        value={editBlock.category_id}
                        onChange={(e) => setEditBlock({ ...editBlock, category_id: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={editBlock.start_time}
                        onChange={(e) => setEditBlock({ ...editBlock, start_time: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="time"
                        value={editBlock.end_time}
                        onChange={(e) => setEditBlock({ ...editBlock, end_time: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingBlockId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateBlock}
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-medium rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={block.id}
                  className="p-4 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shrink-0">
                      {formatTime(block.start_time)} – {formatTime(block.end_time)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{block.title}</h4>
                      <div className="mt-0.5">
                        <CategoryBadge category={cat} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => logPlannedBlock(block)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-all"
                      title="Convert to actual log entry"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Log This</span>
                    </button>
                    <button
                      onClick={() => startEditingBlock(block)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Actual Log Entries Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Log Entries</h3>
              <p className="text-xs text-slate-500">Record how your time was actually spent</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            {showLogForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showLogForm ? 'Cancel' : 'Log Activity'}</span>
          </button>
        </div>

        {/* Collapsible Add Log Form */}
        {showLogForm && (
          <form
            onSubmit={handleAddLog}
            className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6 space-y-4 animate-fadeIn"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coding Personal Day Tracker"
                  value={newLog.title}
                  onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={newLog.category_id}
                  onChange={(e) => setNewLog({ ...newLog, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newLog.start_time}
                  onChange={(e) => setNewLog({ ...newLog, start_time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newLog.end_time}
                  onChange={(e) => setNewLog({ ...newLog, end_time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <textarea
                rows="2"
                placeholder="Add optional notes or reflections..."
                value={newLog.note}
                onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                Save Log Entry
              </button>
            </div>
          </form>
        )}

        {/* Log Entries List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Loading activity logs...</div>
          ) : logEntries.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No activity logged for this date</p>
              <p className="text-xs text-slate-400 mt-1">Click "Log Activity" above to add what you did</p>
            </div>
          ) : (
            logEntries.map((log) => {
              const cat = getCategoryDetails(log.category_id);
              const isEditing = editingLogId === log.id;

              if (isEditing) {
                return (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-blue-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editLog.title}
                        onChange={(e) => setEditLog({ ...editLog, title: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                      <select
                        value={editLog.category_id}
                        onChange={(e) => setEditLog({ ...editLog, category_id: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="datetime-local"
                        value={editLog.start_time}
                        onChange={(e) => setEditLog({ ...editLog, start_time: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={editLog.end_time}
                        onChange={(e) => setEditLog({ ...editLog, end_time: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <textarea
                      rows="2"
                      value={editLog.note || ''}
                      onChange={(e) => setEditLog({ ...editLog, note: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      placeholder="Notes..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingLogId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateLog}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white font-medium rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={log.id}
                  className="p-4 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-start justify-between gap-4 transition-all group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight">{log.title}</h4>
                        <CategoryBadge category={cat} showLabel size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {formatTime(log.start_time)} – {formatTime(log.end_time)}
                        </span>
                      </div>
                      {log.note && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditingLog(log)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
