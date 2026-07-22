import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { register as registerUser, clearAuthError } from '../redux/slices/authSlice'

// Public self-registration always creates an 'employee' role account.
// Admins can promote/create other roles from the Employees module later.
function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, status, error } = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  const onSubmit = (values) => {
    dispatch(registerUser({ name: values.name, email: values.email, password: values.password }))
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-900 to-primary-950 flex-col justify-between p-12">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-sky-500 flex items-center justify-center text-white font-display font-bold shadow-lg shadow-primary-500/40">
            E
          </div>
          <span className="font-display font-semibold text-white">Employee Management System</span>
        </div>

        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <RocketLaunchIcon className="text-sky-400" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Your profile, tasks, and payslips — all self-service.
          </h1>
          <p className="text-slate-400 max-w-md">
            Create your account to check in, apply for leave, track tasks, and
            download payslips — no HR request required.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">© 2026 Employee Management System</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center text-white font-display font-bold shadow-md shadow-primary-500/30">
              E
            </div>
            <span className="font-display font-semibold text-gray-800 dark:text-gray-100">EMS</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-8">Join the Employee Management System</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Full name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

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
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-2.5">
              {status === 'loading' ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
