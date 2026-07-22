import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import KeyIcon from '@mui/icons-material/Key'
import { resetPassword } from '../redux/slices/authSlice'

function ResetPasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useParams()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (values) => {
    const result = await dispatch(resetPassword({ token, password: values.password }))
    if (resetPassword.fulfilled.match(result)) {
      toast.success(result.payload)
      navigate('/login')
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-navy-950 px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-primary-500/30">
          <KeyIcon />
        </div>
        <h1 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
          Set a new password
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">New password</label>
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

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
