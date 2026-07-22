import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import { logout } from '../redux/slices/authSlice'
import { fetchNotifications, markAllAsRead } from '../redux/slices/notificationSlice'

function Topbar({ onMenuClick, darkMode, onToggleDarkMode }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { list, unreadCount } = useSelector((state) => state.notifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    dispatch(fetchNotifications())
    // Poll every 30s for new notifications.
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  // Close dropdowns when clicking outside of them.
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm shadow-slate-200/40 dark:shadow-black/20">
      <button className="lg:hidden text-gray-600 dark:text-gray-300" onClick={onMenuClick} aria-label="Open menu">
        <MenuIcon />
      </button>

      <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
        Welcome back, <span className="font-display font-semibold text-gray-800 dark:text-gray-100">{user?.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
            aria-label="Notifications"
          >
            <NotificationsIcon fontSize="small" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center shadow-sm shadow-red-500/50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="font-medium text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllAsRead())}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {list.length === 0 ? (
                <p className="text-sm text-gray-400 px-4 py-6 text-center">No notifications yet</p>
              ) : (
                list.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 text-sm border-b border-gray-50 dark:border-gray-700 last:border-0 ${
                      !n.isRead ? 'bg-primary-50/60 dark:bg-gray-700/40' : ''
                    }`}
                  >
                    <p className="text-gray-700 dark:text-gray-200">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu((s) => !s)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-sky-500 text-white flex items-center justify-center text-sm font-semibold shadow-md shadow-primary-500/30">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
              >
                <LogoutIcon fontSize="small" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
