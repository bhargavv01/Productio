import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWeekReport, getCategories } from '../api/client';

const styles = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', color: 'var(--color-text)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 600 },
  input: { padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px' },
  card: { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  summary: { display: 'flex', gap: '24px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' },
  summaryItem: { display: 'flex', flexDirection: 'column' },
  summaryLabel: { fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' },
  summaryValue: { fontSize: '24px', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)' }
};

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
          getCategories()
        ]);
        setReport(reportRes);
        setCategories(catsRes);
      } catch (err) {
        console.error("Failed to fetch week data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate]);

  const { totalMinutes, chartData } = useMemo(() => {
    if (!report || !report.days) return { totalMinutes: 0, chartData: [] };

    let total = 0;
    const formatted = report.days.map(day => {
      const dayData = {
        displayDate: new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      };

      // Build a lookup from the categories array in the day report
      const catMinutes = {};
      if (day.categories) {
        day.categories.forEach(c => {
          catMinutes[c.category_id] = c.minutes;
          total += c.minutes;
        });
      }

      // Set a value for each category (0 if not present)
      categories.forEach(cat => {
        dayData[`cat_${cat.id}`] = catMinutes[cat.id] || 0;
      });

      return dayData;
    });

    return { totalMinutes: total, chartData: formatted };
  }, [report, categories]);

  const formatMin = (mins) => {
    const rounded = Math.round(mins);
    return `${Math.floor(rounded / 60)}h ${rounded % 60}m`;
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const nonZero = payload.filter(p => p.value > 0);
      if (nonZero.length === 0) return null;
      return (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>{label}</p>
          {nonZero.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', fontSize: '14px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: entry.color, marginRight: '8px', borderRadius: '2px' }} />
              <span style={{ color: 'var(--color-text-secondary)', marginRight: '16px' }}>{entry.name}:</span>
              <span style={{ fontWeight: 500 }}>{Math.round(entry.value)}m</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Week View</h1>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
          style={styles.input}
        />
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : chartData.length === 0 ? (
          <div style={styles.empty}>No data available for this week.</div>
        ) : (
          <>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="displayDate" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: 'var(--color-text-secondary)' }} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {categories.map(cat => (
                    <Bar key={cat.id} dataKey={`cat_${cat.id}`} name={cat.name} stackId="a" fill={cat.color || 'var(--color-primary)'} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={styles.summary}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Time Logged</span>
                <span style={styles.summaryValue}>{formatMin(totalMinutes)}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Daily Average</span>
                <span style={styles.summaryValue}>{formatMin(totalMinutes / (chartData.length || 1))}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
