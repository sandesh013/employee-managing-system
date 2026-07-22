import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LockResetIcon from '@mui/icons-material/LockReset'
import { forgotPassword } from '../redux/slices/authSlice'

function ForgotPasswordPage() {
  const dispatch = useDispatch()
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (values) => {
    const result = await dispatch(forgotPassword(values.email))
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true)
      toast.success(result.payload)
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-navy-950 px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-primary-500/30">
          <LockResetIcon />
        </div>
        <h1 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
          Reset your password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-6">
          {sent
            ? 'Check the server console (or your inbox) for the reset link.'
            : "Enter your email and we'll send you a reset link"}
        </p>

        {!sent && (
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

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
