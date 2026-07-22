import { Link, NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import ApartmentIcon from '@mui/icons-material/Apartment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'
import PersonIcon from '@mui/icons-material/Person'
import InsightsIcon from '@mui/icons-material/Insights'
import CloseIcon from '@mui/icons-material/Close'

// Every nav item declares which roles can see it. Filtered per logged-in user.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/employees', label: 'Employees', icon: PeopleIcon, roles: ['admin', 'hr', 'manager'] },
  { to: '/departments', label: 'Departments', icon: ApartmentIcon, roles: ['admin'] },
  { to: '/attendance', label: 'Attendance', icon: AccessTimeIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/leaves', label: 'Leaves', icon: EventBusyIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/tasks', label: 'Tasks', icon: AssignmentIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/payroll', label: 'Payroll', icon: PaymentsIcon, roles: ['admin', 'hr', 'employee'] },
  { to: '/performance', label: 'Performance', icon: InsightsIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
  { to: '/profile', label: 'Profile', icon: PersonIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
]

function Sidebar({ open, onClose }) {
  const { user } = useSelector((state) => state.auth)
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Signature element: deep navy-to-blue gradient rail, distinct from
          the light glass content area, so navigation always reads as its
          own anchored layer rather than blending into the page. */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-200
        bg-gradient-to-b from-navy-900 via-navy-900 to-primary-950
        border-r border-white/5
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 min-w-0 rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-white/5 transition-colors"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-primary-400 to-sky-500 flex items-center justify-center text-white font-display font-bold text-base shadow-lg shadow-primary-500/40">
              E
            </div>
            <span className="font-display font-semibold text-sm leading-tight text-white truncate">
              Employee Management System
            </span>
          </Link>
          <button className="lg:hidden text-gray-400 shrink-0" onClick={onClose} aria-label="Close menu">
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Glowing accent bar for the active item — the one
                      deliberate "signature" flourish, kept singular. */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-primary-400 to-sky-400 shadow-[0_0_12px_2px_rgba(56,189,248,0.6)] transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <span
                    className={`flex items-center justify-center h-7 w-7 rounded-lg transition-colors ${
                      isActive ? 'bg-gradient-to-br from-primary-500 to-sky-500 text-white shadow-md shadow-primary-500/40' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon fontSize="small" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 text-[11px] text-slate-500 border-t border-white/10">
          Employee Management System
        </div>
      </aside>
    </>
  )
}

export default Sidebar
