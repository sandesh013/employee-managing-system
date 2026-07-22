import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import PeopleIcon from '@mui/icons-material/People'
import ApartmentIcon from '@mui/icons-material/Apartment'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import TodayIcon from '@mui/icons-material/Today'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import { fetchSummary } from '../redux/slices/analyticsSlice'
import { fetchMyProductivity } from '../redux/slices/productivitySlice'

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

// Small circular gauge for a 0-100 score, built with plain SVG (no extra
// chart library needed for a single ring).
function ScoreGauge({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40 mx-auto">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100" style={{ fontSize: '28px', fontWeight: 600 }}>
        {score}
      </text>
    </svg>
  )
}

function DashboardPage() {
  const dispatch = useDispatch()
  const { summary, status } = useSelector((state) => state.analytics)
  const { user } = useSelector((state) => state.auth)
  const { mine: myProductivity } = useSelector((state) => state.productivity)

  useEffect(() => {
    if (user?.role !== 'employee') dispatch(fetchSummary())
    else dispatch(fetchMyProductivity())
  }, [dispatch, user])

  // Employees get a personal productivity view instead of the org-wide dashboard.
  if (user?.role === 'employee') {
    return (
      <div className="space-y-6">
        <div className="card card-hover p-8 text-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Use the sidebar to check in, apply for leave, view your tasks, or download your payslips.
          </p>
        </div>

        {myProductivity && (
          <div className="card card-hover p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
              Your productivity score
            </h2>
            <p className="text-xs text-gray-400 text-center mb-2">Based on the last 30 days</p>
            <ScoreGauge score={myProductivity.score} />
            <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{myProductivity.breakdown.taskCompletionRate}%</p>
                <p className="text-gray-400">Tasks done</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{myProductivity.breakdown.attendanceRate}%</p>
                <p className="text-gray-400">Attendance</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{myProductivity.breakdown.punctualityRate}%</p>
                <p className="text-gray-400">On time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (status === 'loading' || !summary) return <Loader rows={4} />

  const departmentChart = {
    labels: summary.departmentBreakdown.map((d) => d.name),
    datasets: [
      {
        data: summary.departmentBreakdown.map((d) => d.count),
        backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e3a8a', '#bfdbfe'],
        borderWidth: 0,
      },
    ],
  }

  const leaveChart = {
    labels: summary.leaveStats.map((l) => l.status),
    datasets: [
      {
        label: 'Leave requests',
        data: summary.leaveStats.map((l) => l.count),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  }

  const attendanceTrendChart = summary.attendanceTrend && {
    labels: summary.attendanceTrend.map((d) =>
      new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })
    ),
    datasets: [
      {
        label: 'Checked in',
        data: summary.attendanceTrend.map((d) => d.present),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Organization overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active employees" value={summary.totalEmployees} icon={PeopleIcon} accent="primary" />
        <StatCard label="Departments" value={summary.totalDepartments} icon={ApartmentIcon} accent="amber" />
        <StatCard label="Pending leaves" value={summary.pendingLeaves} icon={EventBusyIcon} accent="rose" />
        <StatCard label="Present today" value={summary.presentToday} icon={TodayIcon} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-hover p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Employees by department</h2>
          {summary.departmentBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400">No departments yet</p>
          ) : (
            <Doughnut data={departmentChart} options={{ plugins: { legend: { position: 'bottom' } } }} />
          )}
        </div>

        <div className="card card-hover p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Leave requests by status</h2>
          <Bar
            data={leaveChart}
            options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
          />
        </div>
      </div>

      {/* Workforce analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card card-hover p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Attendance trend — last 7 days</h2>
          {attendanceTrendChart && (
            <Line
              data={attendanceTrendChart}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
            />
          )}
        </div>

        <div className="card card-hover p-5 flex flex-col items-center justify-center text-center">
          <TrendingUpIcon className="text-primary-600 mb-2" />
          <p className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{summary.avgProductivityScore}</p>
          <p className="text-xs text-gray-400 mt-1">Avg. productivity score</p>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-4">{summary.taskCompletionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Org-wide task completion</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
