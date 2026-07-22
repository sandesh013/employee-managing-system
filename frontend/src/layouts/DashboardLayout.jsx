import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Read the user's last preference; default to their OS setting.
    const stored = sessionStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    sessionStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Soft ambient glow behind the content, echoing the sidebar's
            gradient without competing with it for attention. */}
        <div className="pointer-events-none fixed top-0 right-0 h-96 w-96 rounded-full bg-primary-400/10 dark:bg-primary-500/5 blur-3xl -z-10" />

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
        />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
