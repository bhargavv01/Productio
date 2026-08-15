import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getMonthReport, getCategories } from '../api/client';

const styles = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', color: 'var(--color-text)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 600 },
  controls: { display: 'flex', gap: '12px' },
  input: { padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', backgroundColor: 'var(--color-surface)' },
  card: { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  summary: { display: 'flex', gap: '24px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' },
  summaryItem: { display: 'flex', flexDirection: 'column' },
  summaryLabel: { fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' },
  summaryValue: { fontSize: '24px', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)' }
};

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
          getCategories()
        ]);
        setReport(reportRes);
        setCategories(catsRes);
      } catch (err) {
        console.error("Failed to fetch month data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const { totalMinutes, chartData, daysWithData } = useMemo(() => {
    if (!report || !report.days) return { totalMinutes: 0, chartData: [], daysWithData: 0 };

    let total = 0;
    let daysWithDataCount = 0;
    
    const formatted = report.days.map(day => {
      // Sum up minutes from the categories array
      let dailyTotal = day.total_minutes || 0;
      total += dailyTotal;
      if (dailyTotal > 0) daysWithDataCount++;

      // Find dominant category
      let dominantCat = null;
      let maxMins = 0;
      if (day.categories && day.categories.length > 0) {
        day.categories.forEach(c => {
          const cat = categories.find(cat => cat.id === c.category_id);
          if (c.minutes > maxMins) {
            maxMins = c.minutes;
            dominantCat = cat || null;
          }
        });
      }
      
      return {
        dayNumber: new Date(day.date + 'T00:00:00').getDate(),
        totalMinutes: Math.round(dailyTotal),
        dominantCat: dominantCat,
        dominantCatName: dominantCat ? dominantCat.name : null,
        dominantCatMins: Math.round(maxMins),
        fillColor: dailyTotal > 0 && dominantCat ? (dominantCat.color || 'var(--color-primary)') : 'var(--color-surface-alt)'
      };
    });
    
    return { totalMinutes: total, chartData: formatted, daysWithData: daysWithDataCount };
  }, [report, categories]);

  const formatMin = (mins) => {
    const rounded = Math.round(mins);
    return `${Math.floor(rounded / 60)}h ${rounded % 60}m`;
  };
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.totalMinutes === 0) return null;
      return (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Day {data.dayNumber}</p>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Total: <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{data.totalMinutes}m</span>
          </div>
          {data.dominantCat && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: data.dominantCat.color, marginRight: '6px', borderRadius: '2px' }} />
              <span>Top: {data.dominantCatName} ({data.dominantCatMins}m)</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Month View</h1>
        <div style={styles.controls}>
          <select style={styles.input} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input 
            type="number" 
            style={{...styles.input, width: '80px'}} 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))} 
            min="2000" max="2100"
          />
        </div>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : chartData.length === 0 ? (
          <div style={styles.empty}>No data available for this month.</div>
        ) : (
          <>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="dayNumber" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                  <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-alt)' }} />
                  <Bar dataKey="totalMinutes" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={styles.summary}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Time Logged</span>
                <span style={styles.summaryValue}>{formatMin(totalMinutes)}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Days Logged</span>
                <span style={styles.summaryValue}>{daysWithData} / {daysInMonth}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
