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
  getDayReport
} from '../api/client';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-bg)',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: 0,
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    outline: 'none',
  },
  section: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--color-border)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginTop: 0,
    marginBottom: '16px',
  },
  chartContainer: {
    height: '300px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  centerMain: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  centerSub: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '12px',
    marginLeft: '6px',
    backgroundColor: 'var(--color-surface-alt)',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'var(--color-surface-alt)',
    borderRadius: '8px',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    backgroundColor: 'var(--color-surface)',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    backgroundColor: 'var(--color-surface)',
    minHeight: '60px',
    resize: 'vertical',
  },
  buttonPrimary: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  buttonDanger: {
    backgroundColor: 'transparent',
    color: 'var(--color-danger)',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  buttonSecondary: {
    backgroundColor: 'var(--color-surface-alt)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listItemTitle: {
    fontWeight: '600',
    fontSize: '16px',
    margin: '0 0 4px 0',
  },
  listItemMeta: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listItemTime: {
    fontSize: '13px',
    color: 'var(--color-text-tertiary)',
  },
  listItemNote: {
    fontSize: '14px',
    marginTop: '8px',
    color: 'var(--color-text-secondary)',
  },
  listItemActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  inlineForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--color-text-tertiary)',
    padding: '24px 0',
  },
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  // Handle time-only strings like "09:00:00" from planned blocks
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
    const [h, m] = dateString.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
};

export default function DayView() {
  const [date, setDate] = useState(getTodayDateString());
  const [categories, setCategories] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [plannedBlocks, setPlannedBlocks] = useState([]);
  const [report, setReport] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // New Log Entry State
  const [newLog, setNewLog] = useState({ title: '', category_id: '', start_time: '', end_time: '', note: '' });
  // Edit Log Entry State
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLog, setEditLog] = useState({});

  // New Planned Block State
  const [newBlock, setNewBlock] = useState({ title: '', category_id: '', start_time: '', end_time: '' });
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
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchDayData = async (selectedDate) => {
    setLoading(true);
    try {
      const [logs, blocks, dayReport] = await Promise.all([
        getLogEntries(selectedDate),
        getPlannedBlocks(selectedDate),
        getDayReport(selectedDate)
      ]);
      setLogEntries(logs);
      setPlannedBlocks(blocks);
      setReport(dayReport);
    } catch (error) {
      console.error("Failed to fetch day data", error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultLogTimes = (selectedDate) => {
    const now = new Date();
    // If selected date is today, use current time rounded. Else use 9am for that date.
    let start;
    if (selectedDate === getTodayDateString()) {
      start = new Date();
      start.setMinutes(0, 0, 0); // Round to hour
    } else {
      start = new Date(`${selectedDate}T09:00:00`);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

    // Format for datetime-local
    const formatForInput = (d) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setNewLog(prev => ({
      ...prev,
      start_time: formatForInput(start),
      end_time: formatForInput(end),
      category_id: categories.length > 0 ? categories[0].id : ''
    }));

    setNewBlock(prev => ({
      ...prev,
      start_time: '09:00',
      end_time: '10:00',
      category_id: categories.length > 0 ? categories[0].id : ''
    }));
  };

  // Log Entry Handlers
  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const entryToCreate = {
        ...newLog,
        start_time: new Date(newLog.start_time).toISOString(),
        end_time: new Date(newLog.end_time).toISOString()
      };
      await createLogEntry(entryToCreate);
      fetchDayData(date);
      setDefaultLogTimes(date);
      setNewLog(prev => ({ ...prev, title: '', note: '' }));
    } catch (error) {
      console.error("Failed to add log entry", error);
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await deleteLogEntry(id);
        fetchDayData(date);
      } catch (error) {
        console.error("Failed to delete log entry", error);
      }
    }
  };

  const startEditingLog = (log) => {
    const formatForInput = (isoStr) => {
      const d = new Date(isoStr);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    
    setEditingLogId(log.id);
    setEditLog({
      ...log,
      start_time: formatForInput(log.start_time),
      end_time: formatForInput(log.end_time)
    });
  };

  const handleUpdateLog = async () => {
    try {
      const entryToUpdate = {
        ...editLog,
        start_time: new Date(editLog.start_time).toISOString(),
        end_time: new Date(editLog.end_time).toISOString()
      };
      await updateLogEntry(editingLogId, entryToUpdate);
      setEditingLogId(null);
      fetchDayData(date);
    } catch (error) {
      console.error("Failed to update log entry", error);
    }
  };

  // Planned Block Handlers
  const handleAddBlock = async (e) => {
    e.preventDefault();
    try {
      // Backend expects separate date, start_time (HH:MM:SS), end_time (HH:MM:SS)
      const startTime = newBlock.start_time.length === 5 ? `${newBlock.start_time}:00` : newBlock.start_time;
      const endTime = newBlock.end_time.length === 5 ? `${newBlock.end_time}:00` : newBlock.end_time;
      
      await createPlannedBlock({
        title: newBlock.title,
        category_id: newBlock.category_id,
        date: date,
        start_time: startTime,
        end_time: endTime
      });
      fetchDayData(date);
      setNewBlock(prev => ({ ...prev, title: '' }));
    } catch (error) {
      console.error("Failed to add block", error);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (window.confirm('Delete this block?')) {
      try {
        await deletePlannedBlock(id);
        fetchDayData(date);
      } catch (error) {
        console.error("Failed to delete block", error);
      }
    }
  };

  const startEditingBlock = (block) => {
    // Backend returns time-only strings like "09:00:00", extract HH:MM
    const getLocalTime = (timeStr) => {
      if (!timeStr) return '09:00';
      // Already "HH:MM" or "HH:MM:SS" format from the backend
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
        return timeStr.substring(0, 5);
      }
      // Fallback: try parsing as a full datetime
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr.substring(0, 5);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    
    setEditingBlockId(block.id);
    setEditBlock({
      ...block,
      start_time: getLocalTime(block.start_time),
      end_time: getLocalTime(block.end_time)
    });
  };

  const handleUpdateBlock = async () => {
    try {
      const startTime = editBlock.start_time.length === 5 ? `${editBlock.start_time}:00` : editBlock.start_time;
      const endTime = editBlock.end_time.length === 5 ? `${editBlock.end_time}:00` : editBlock.end_time;
      
      await updatePlannedBlock(editingBlockId, {
        title: editBlock.title,
        category_id: editBlock.category_id,
        date: date,
        start_time: startTime,
        end_time: endTime
      });
      setEditingBlockId(null);
      fetchDayData(date);
    } catch (error) {
      console.error("Failed to update block", error);
    }
  };

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (!report || !report.categories) return [];
    return report.categories.map(s => {
      const cat = categories.find(c => c.id === s.category_id);
      return {
        name: s.name || (cat ? cat.name : 'Unknown'),
        value: s.minutes,
        color: s.color || (cat ? cat.color : '#ccc'),
        label: s.label || (cat ? cat.label : 'neutral')
      };
    }).filter(d => d.value > 0);
  }, [report, categories]);

  const totalMinutes = chartData.reduce((sum, item) => sum + item.value, 0);

  const getCategoryDetails = (id) => {
    return categories.find(c => c.id === id) || { name: 'Unknown', color: '#ccc', label: 'neutral' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Day View</h1>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.dateInput}
        />
      </div>

      {/* Donut Chart Section */}
      <div style={styles.section}>
        <div style={styles.chartContainer}>
          {totalMinutes > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDuration(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.centerText}>
                <div style={styles.centerMain}>{formatDuration(totalMinutes)}</div>
                <div style={styles.centerSub}>/ 24h</div>
              </div>
            </>
          ) : (
            <div style={styles.centerText}>
              <div style={styles.centerSub}>No entries logged</div>
            </div>
          )}
          
          <div style={styles.legend}>
            {chartData.map((entry, index) => (
              <div key={index} style={styles.legendItem}>
                <div style={{...styles.colorDot, backgroundColor: entry.color}}></div>
                <span>{entry.name} ({formatDuration(entry.value)})</span>
                <span style={styles.badge}>{entry.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planned Blocks Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Planned Blocks</h2>
        
        <form style={styles.form} onSubmit={handleAddBlock}>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Title</label>
              <input required style={styles.input} type="text" value={newBlock.title} onChange={e => setNewBlock({...newBlock, title: e.target.value})} placeholder="What to do?" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select required style={styles.input} value={newBlock.category_id} onChange={e => setNewBlock({...newBlock, category_id: parseInt(e.target.value) || e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Start Time</label>
              <input required style={styles.input} type="time" value={newBlock.start_time} onChange={e => setNewBlock({...newBlock, start_time: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>End Time</label>
              <input required style={styles.input} type="time" value={newBlock.end_time} onChange={e => setNewBlock({...newBlock, end_time: e.target.value})} />
            </div>
          </div>
          <button type="submit" style={styles.buttonPrimary}>Add Block</button>
        </form>

        <div style={styles.list}>
          {loading ? <div style={styles.emptyState}>Loading...</div> : 
           plannedBlocks.length === 0 ? <div style={styles.emptyState}>No planned blocks yet.</div> :
           plannedBlocks.map(block => {
             const cat = getCategoryDetails(block.category_id);
             const isEditing = editingBlockId === block.id;

             if (isEditing) {
               return (
                 <div key={block.id} style={styles.listItem}>
                   <div style={styles.inlineForm}>
                     <input style={styles.input} value={editBlock.title} onChange={e => setEditBlock({...editBlock, title: e.target.value})} />
                     <select style={styles.input} value={editBlock.category_id} onChange={e => setEditBlock({...editBlock, category_id: parseInt(e.target.value) || e.target.value})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                     <input type="time" style={styles.input} value={editBlock.start_time} onChange={e => setEditBlock({...editBlock, start_time: e.target.value})} />
                     <input type="time" style={styles.input} value={editBlock.end_time} onChange={e => setEditBlock({...editBlock, end_time: e.target.value})} />
                     <div style={styles.listItemActions}>
                       <button style={styles.buttonPrimary} onClick={handleUpdateBlock}>Save</button>
                       <button style={styles.buttonSecondary} onClick={() => setEditingBlockId(null)}>Cancel</button>
                     </div>
                   </div>
                 </div>
               );
             }

             return (
               <div key={block.id} style={styles.listItem}>
                 <div style={styles.listItemHeader}>
                   <div>
                     <h3 style={styles.listItemTitle}>{block.title}</h3>
                     <div style={styles.listItemMeta}>
                       <div style={{...styles.colorDot, backgroundColor: cat.color}}></div>
                       <span>{cat.name}</span>
                       <span style={styles.listItemTime}>
                         {formatTime(block.start_time)} – {formatTime(block.end_time)}
                       </span>
                     </div>
                   </div>
                   <div style={styles.listItemActions}>
                     <button style={styles.buttonSecondary} onClick={() => startEditingBlock(block)}>Edit</button>
                     <button style={styles.buttonDanger} onClick={() => handleDeleteBlock(block.id)}>Delete</button>
                   </div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Log Entries Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Log Entries</h2>
        
        <form style={styles.form} onSubmit={handleAddLog}>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Title</label>
              <input required style={styles.input} type="text" value={newLog.title} onChange={e => setNewLog({...newLog, title: e.target.value})} placeholder="What did you do?" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select required style={styles.input} value={newLog.category_id} onChange={e => setNewLog({...newLog, category_id: parseInt(e.target.value) || e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Start Time</label>
              <input required style={styles.input} type="datetime-local" value={newLog.start_time} onChange={e => setNewLog({...newLog, start_time: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>End Time</label>
              <input required style={styles.input} type="datetime-local" value={newLog.end_time} onChange={e => setNewLog({...newLog, end_time: e.target.value})} />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Note (optional)</label>
            <textarea style={styles.textarea} value={newLog.note} onChange={e => setNewLog({...newLog, note: e.target.value})} placeholder="Add details..." />
          </div>
          <button type="submit" style={styles.buttonPrimary}>Add Entry</button>
        </form>

        <div style={styles.list}>
          {loading ? <div style={styles.emptyState}>Loading...</div> : 
           logEntries.length === 0 ? <div style={styles.emptyState}>No log entries yet.</div> :
           logEntries.map(log => {
             const cat = getCategoryDetails(log.category_id);
             const isEditing = editingLogId === log.id;

             if (isEditing) {
               return (
                 <div key={log.id} style={styles.listItem}>
                   <div style={styles.inlineForm}>
                     <input style={styles.input} value={editLog.title} onChange={e => setEditLog({...editLog, title: e.target.value})} />
                     <select style={styles.input} value={editLog.category_id} onChange={e => setEditLog({...editLog, category_id: parseInt(e.target.value) || e.target.value})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                     <input type="datetime-local" style={styles.input} value={editLog.start_time} onChange={e => setEditLog({...editLog, start_time: e.target.value})} />
                     <input type="datetime-local" style={styles.input} value={editLog.end_time} onChange={e => setEditLog({...editLog, end_time: e.target.value})} />
                     <textarea style={styles.textarea} value={editLog.note || ''} onChange={e => setEditLog({...editLog, note: e.target.value})} />
                     <div style={styles.listItemActions}>
                       <button style={styles.buttonPrimary} onClick={handleUpdateLog}>Save</button>
                       <button style={styles.buttonSecondary} onClick={() => setEditingLogId(null)}>Cancel</button>
                     </div>
                   </div>
                 </div>
               );
             }

             return (
               <div key={log.id} style={styles.listItem}>
                 <div style={styles.listItemHeader}>
                   <div>
                     <h3 style={styles.listItemTitle}>{log.title}</h3>
                     <div style={styles.listItemMeta}>
                       <div style={{...styles.colorDot, backgroundColor: cat.color}}></div>
                       <span>{cat.name}</span>
                       <span style={styles.listItemTime}>
                         {formatTime(log.start_time)} – {formatTime(log.end_time)}
                       </span>
                     </div>
                   </div>
                   <div style={styles.listItemActions}>
                     <button style={styles.buttonSecondary} onClick={() => startEditingLog(log)}>Edit</button>
                     <button style={styles.buttonDanger} onClick={() => handleDeleteLog(log.id)}>Delete</button>
                   </div>
                 </div>
                 {log.note && <div style={styles.listItemNote}>{log.note}</div>}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
