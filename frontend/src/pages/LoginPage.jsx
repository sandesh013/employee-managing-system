import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import InsightsIcon from '@mui/icons-material/Insights'
import ShieldIcon from '@mui/icons-material/Shield'
import { login, clearAuthError } from '../redux/slices/authSlice'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, status, error } = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (token) navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
  }, [token, navigate, location])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  const onSubmit = (values) => dispatch(login(values))

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left hero panel — mirrors the sidebar's navy gradient identity so
          the brand feels consistent from the very first screen. */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-900 to-primary-950 flex-col justify-between p-12">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-sky-500 flex items-center justify-center text-white font-display font-bold shadow-lg shadow-primary-500/40">
            E
          </div>
          <span className="font-display font-semibold text-white">Employee Management System</span>
        </div>

        <div className="relative">
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Run your whole workforce from one place.
          </h1>
          <p className="text-slate-400 max-w-md">
            Attendance, leave, payroll, performance, and more — all in a single
            role-aware dashboard for admins, HR, managers, and employees.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: PeopleAltIcon, text: 'Manage employees & departments in one view' },
              { icon: InsightsIcon, text: 'Live analytics and productivity scoring' },
              { icon: ShieldIcon, text: 'Role-based access, built in from the ground up' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-300">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon fontSize="small" className="text-sky-400" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">© 2026 Employee Management System</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center text-white font-display font-bold shadow-md shadow-primary-500/30">
              E
            </div>
            <span className="font-display font-semibold text-gray-800 dark:text-gray-100">EMS</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input-field"
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-2.5">
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
            New here?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
