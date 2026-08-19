import React, { useState, useEffect, useMemo } from 'react';
import { getGoals, getCategories, createGoal, updateGoal, deleteGoal } from '../api/client';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle,
  X,
  Sparkles,
  Calendar,
} from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import StatCard from './StatCard';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formCat, setFormCat] = useState('');
  const [formMins, setFormMins] = useState('60');
  const [formPeriod, setFormPeriod] = useState('daily');

  const [editingId, setEditingId] = useState(null);
  const [editMins, setEditMins] = useState('');
  const [editPeriod, setEditPeriod] = useState('daily');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, catsRes] = await Promise.all([getGoals(), getCategories()]);
      setGoals(goalsRes || []);
      setCategories(catsRes || []);
      if (catsRes && catsRes.length > 0 && !formCat) {
        setFormCat(catsRes[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!formCat || !formMins) return;

    try {
      await createGoal({
        category_id: parseInt(formCat, 10),
        target_minutes: parseInt(formMins, 10),
        period: formPeriod,
      });
      setFormMins('60');
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create goal', err);
    }
  };

  const handleUpdateGoal = async (goalId) => {
    if (!editMins) return;
    try {
      await updateGoal(goalId, {
        target_minutes: parseInt(editMins, 10),
        period: editPeriod,
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Failed to update goal', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
        fetchData();
      } catch (err) {
        console.error('Failed to delete goal', err);
      }
    }
  };

  const formatMin = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} minutes`;
    if (m === 0) return `${h} ${h === 1 ? 'hour' : 'hours'}`;
    return `${h}h ${m}m`;
  };

  const getCategory = (id) => categories.find((c) => c.id === id) || { name: 'Unknown', color: '#94a3b8', label: 'neutral' };

  const { dailyGoalsCount, weeklyGoalsCount, totalDailyMinutes } = useMemo(() => {
    let dailyCount = 0;
    let weeklyCount = 0;
    let dailyMins = 0;

    goals.forEach((g) => {
      if (g.period === 'daily') {
        dailyCount++;
        dailyMins += g.target_minutes;
      } else {
        weeklyCount++;
      }
    });

    return {
      dailyGoalsCount: dailyCount,
      weeklyGoalsCount: weeklyCount,
      totalDailyMinutes: dailyMins,
    };
  }, [goals]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Target Setting</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Time Goals</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Set daily or weekly time targets per category to build productive habits
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'New Goal'}</span>
        </button>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Active Goals"
          value={goals.length}
          subtitle="targets tracked"
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Daily Goals"
          value={dailyGoalsCount}
          subtitle={`${formatMin(totalDailyMinutes)} total daily target`}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Weekly Goals"
          value={weeklyGoalsCount}
          subtitle="long-term habit targets"
          icon={Calendar}
          color="violet"
        />
      </div>

      {/* Collapsible New Goal Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs animate-fadeIn">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Create a New Time Target</h3>
            <p className="text-xs text-slate-500">Pick a category, period, and how much time you want to spend</p>
          </div>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  placeholder="e.g. 120"
                  value={formMins}
                  onChange={(e) => setFormMins(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
                {/* Duration Presets */}
                <div className="flex gap-1.5 mt-2">
                  {[30, 60, 120, 180, 240].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormMins(preset.toString())}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-all"
                    >
                      {preset >= 60 ? `${preset / 60}h` : `${preset}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period</label>
                <select
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                >
                  <option value="daily">Daily Target</option>
                  <option value="weekly">Weekly Target</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <Target className="w-12 h-12 mx-auto text-slate-200 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium">No time goals set yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Goal" above to create your first target</p>
          </div>
        ) : (
          goals.map((goal) => {
            const cat = getCategory(goal.category_id);
            const isEditing = editingId === goal.id;

            if (isEditing) {
              return (
                <div
                  key={goal.id}
                  className="p-5 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Target Minutes</label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={editMins}
                        onChange={(e) => setEditMins(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Period</label>
                      <select
                        value={editPeriod}
                        onChange={(e) => setEditPeriod(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateGoal(goal.id)}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white font-medium rounded-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={goal.id}
                className="p-5 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs flex items-center justify-between gap-4 transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                      <CategoryBadge category={cat} showLabel size="sm" />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize border border-slate-200/60">
                        {goal.period}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Target: <span className="text-slate-900 font-bold">{formatMin(goal.target_minutes)}</span> per{' '}
                      {goal.period === 'daily' ? 'day' : 'week'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(goal.id);
                      setEditMins(goal.target_minutes.toString());
                      setEditPeriod(goal.period);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                    title="Edit Goal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
