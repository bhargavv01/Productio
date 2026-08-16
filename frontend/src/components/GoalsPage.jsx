import React, { useState, useEffect } from 'react';
import { getGoals, getCategories, createGoal, updateGoal, deleteGoal } from '../api/client';

const styles = {
  container: { padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: 'var(--color-text)' },
  header: { marginBottom: '24px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 600 },
  card: { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  form: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' },
  label: { fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' },
  input: { padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', backgroundColor: 'var(--color-surface)' },
  buttonPrimary: { backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', height: '40px' },
  buttonSecondary: { backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', height: '40px' },
  buttonDanger: { backgroundColor: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', height: '40px' },
  goalItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' },
  goalInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%' },
  goalDetails: { display: 'flex', flexDirection: 'column', gap: '4px' },
  goalTitle: { fontWeight: 600, fontSize: '16px' },
  goalTarget: { fontSize: '14px', color: 'var(--color-text-secondary)' },
  badge: { fontSize: '12px', padding: '4px 8px', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', borderRadius: '12px', fontWeight: 500 },
  actions: { display: 'flex', gap: '8px' },
  empty: { textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)', backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '12px' }
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formCat, setFormCat] = useState('');
  const [formMins, setFormMins] = useState('');
  const [formPeriod, setFormPeriod] = useState('daily');
  
  const [editingId, setEditingId] = useState(null);
  const [editMins, setEditMins] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, catsRes] = await Promise.all([
        getGoals(),
        getCategories()
      ]);
      setGoals(goalsRes);
      setCategories(catsRes);
      if (catsRes.length > 0) setFormCat(catsRes[0].id);
    } catch (err) {
      console.error(err);
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
        period: formPeriod
      });
      setFormMins('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoal = async (goalId) => {
    if (!editMins) return;
    try {
      await updateGoal(goalId, { target_minutes: parseInt(editMins, 10) });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatMin = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? h + ' hours ' : ''}${m} minutes`;
  };

  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Unknown', color: '#ccc' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Goals</h1>
      </div>

      <div style={styles.card}>
        <form style={styles.form} onSubmit={handleAddGoal}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Category</label>
            <select style={styles.input} value={formCat} onChange={e => setFormCat(e.target.value)} required>
              <option value="" disabled>Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Target (Minutes)</label>
            <input type="number" min="1" style={styles.input} value={formMins} onChange={e => setFormMins(e.target.value)} placeholder="e.g. 120" required />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Period</label>
            <select style={styles.input} value={formPeriod} onChange={e => setFormPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" style={styles.buttonPrimary}>Add Goal</button>
        </form>
      </div>

      <div>
        {loading ? (
          <p>Loading goals...</p>
        ) : goals.length === 0 ? (
          <div style={styles.empty}>No goals set yet. Create one above!</div>
        ) : (
          goals.map(goal => {
            const cat = getCategory(goal.category_id);
            const isEditing = editingId === goal.id;
            
            return (
              <div key={goal.id} style={styles.goalItem}>
                <div style={styles.goalInfo}>
                  <div style={{...styles.dot, backgroundColor: cat.color}} />
                  <div style={styles.goalDetails}>
                    <div style={styles.goalTitle}>{cat.name}</div>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input 
                          type="number" 
                          style={{...styles.input, padding: '4px 8px'}} 
                          value={editMins} 
                          onChange={(e) => setEditMins(e.target.value)} 
                          autoFocus
                        />
                        <span style={{ fontSize: '13px' }}>minutes</span>
                      </div>
                    ) : (
                      <div style={styles.goalTarget}>Target: {formatMin(goal.target_minutes)}</div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {!isEditing && (
                    <span style={styles.badge}>{goal.period === 'daily' ? 'Daily' : 'Weekly'}</span>
                  )}
                  
                  <div style={styles.actions}>
                    {isEditing ? (
                      <>
                        <button style={styles.buttonPrimary} onClick={() => handleUpdateGoal(goal.id)}>Save</button>
                        <button style={styles.buttonSecondary} onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={styles.buttonSecondary} onClick={() => { setEditingId(goal.id); setEditMins(goal.target_minutes); }}>Edit</button>
                        <button style={styles.buttonDanger} onClick={() => handleDelete(goal.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
