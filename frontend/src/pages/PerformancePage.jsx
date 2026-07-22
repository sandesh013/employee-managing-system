import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add'
import StarIcon from '@mui/icons-material/Star'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import { createReview, fetchMyReviews, fetchAllReviews } from '../redux/slices/performanceSlice'
import { fetchEmployees } from '../redux/slices/employeeSlice'
import { fetchAllProductivity } from '../redux/slices/productivitySlice'

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} fontSize="small" className={i < rating ? '' : 'opacity-20'} />
      ))}
    </div>
  )
}

function PerformancePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mine, all, status } = useSelector((state) => state.performance)
  const { list: employees } = useSelector((state) => state.employees)
  const { all: productivityScores } = useSelector((state) => state.productivity)
  const canReview = ['admin', 'hr', 'manager'].includes(user?.role)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (canReview) {
      dispatch(fetchAllReviews())
      dispatch(fetchEmployees({ limit: 100 }))
      dispatch(fetchAllProductivity())
    } else {
      dispatch(fetchMyReviews())
    }
  }, [dispatch, canReview])

  const onSubmit = async (values) => {
    const result = await dispatch(createReview({ ...values, rating: Number(values.rating) }))
    if (createReview.fulfilled.match(result)) {
      toast.success('Review submitted')
      setModalOpen(false)
      reset()
    } else {
      toast.error(result.payload)
    }
  }

  const reviewsToShow = canReview ? all : mine

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Performance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {canReview ? 'Review your team' : 'Your performance reviews'}
          </p>
        </div>
        {canReview && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <AddIcon fontSize="small" /> New review
          </button>
        )}
      </div>

      {canReview && productivityScores.length > 0 && (
        <div className="card card-hover overflow-x-auto">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Productivity scores</h2>
            <p className="text-xs text-gray-400">Auto-calculated from tasks, attendance, and punctuality (last 30 days)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Tasks done</th>
                <th className="px-5 py-3 font-medium">Attendance</th>
                <th className="px-5 py-3 font-medium">On time</th>
              </tr>
            </thead>
            <tbody>
              {[...productivityScores]
                .sort((a, b) => b.score - a.score)
                .map((p) => (
                  <tr key={p.employee} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{p.name}</td>
                    <td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-200">{p.score}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{p.breakdown.taskCompletionRate}%</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{p.breakdown.attendanceRate}%</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{p.breakdown.punctualityRate}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {status === 'loading' ? (
        <Loader rows={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviewsToShow.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full text-center py-8">No reviews yet</p>
          ) : (
            reviewsToShow.map((r) => (
              <div
                key={r._id}
                className="card card-hover p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {canReview && (
                      <p className="font-medium text-gray-700 dark:text-gray-200">{r.employee?.user?.name}</p>
                    )}
                    <p className="text-xs text-gray-400">{r.period} · reviewed by {r.reviewer?.name}</p>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                {r.comments && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{r.comments}</p>}
              </div>
            ))
          )}
        </div>
      )}

      <Modal title="New performance review" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Employee</label>
            <select
              {...register('employee', { required: 'Please choose an employee' })}
              className="input-field"
            >
              <option value="">— Select employee —</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.user?.name}
                </option>
              ))}
            </select>
            {errors.employee && <p className="text-xs text-red-500 mt-1">{errors.employee.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Review period</label>
            <input
              {...register('period', { required: 'e.g. Q1 2026' })}
              placeholder="e.g. Q1 2026"
              className="input-field"
            />
            {errors.period && <p className="text-xs text-red-500 mt-1">{errors.period.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Rating (1-5)</label>
            <select
              {...register('rating', { required: true })}
              className="input-field"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Comments</label>
            <textarea
              {...register('comments')}
              rows={3}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default PerformancePage
