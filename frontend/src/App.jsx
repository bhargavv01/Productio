import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DayView from './components/DayView'
import WeekView from './components/WeekView'
import MonthView from './components/MonthView'
import GoalsPage from './components/GoalsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/day" replace />} />
        <Route path="/day" element={<DayView />} />
        <Route path="/week" element={<WeekView />} />
        <Route path="/month" element={<MonthView />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Routes>
    </Layout>
  )
}
