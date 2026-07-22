import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import Badge from '../components/Badge'
import {
  applyLeave,
  fetchMyLeaves,
  fetchAllLeaves,
  updateLeaveStatus,
} from '../redux/slices/leaveSlice'

function LeavesPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mine, all, status } = useSelector((state) => state.leaves)
  const canApprove = ['admin', 'hr', 'manager'].includes(user?.role)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    dispatch(fetchMyLeaves())
    if (canApprove) dispatch(fetchAllLeaves())
  }, [dispatch, canApprove])

  const onSubmit = async (values) => {
    const result = await dispatch(applyLeave(values))
    if (applyLeave.fulfilled.match(result)) {
      toast.success('Leave request submitted')
      setModalOpen(false)
      reset()
    } else {
      toast.error(result.payload)
    }
  }

  const handleDecision = async (id, newStatus) => {
    const result = await dispatch(updateLeaveStatus({ id, status: newStatus }))
    if (updateLeaveStatus.fulfilled.match(result)) toast.success(`Leave ${newStatus}`)
    else toast.error(result.payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Leaves</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Apply for leave and track approvals</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <AddIcon fontSize="small" /> Apply for leave
        </button>
      </div>

      <div className="card card-hover overflow-x-auto">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Your leave requests</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Dates</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                  No leave requests yet
                </td>
              </tr>
            ) : (
              mine.map((l) => (
                <tr key={l._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <td className="px-5 py-3 capitalize text-gray-600 dark:text-gray-300">{l.leaveType}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{l.reason}</td>
                  <td className="px-5 py-3">
                    <Badge status={l.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canApprove && (
        <div className="card card-hover overflow-x-auto">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Team requests</h2>
          </div>
          {status === 'loading' ? (
            <div className="p-5">
              <Loader rows={4} />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {all.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      No leave requests yet
                    </td>
                  </tr>
                ) : (
                  all.map((l) => (
                    <tr key={l._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{l.employee?.user?.name}</td>
                      <td className="px-5 py-3 capitalize text-gray-600 dark:text-gray-300">{l.leaveType}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={l.status} />
                      </td>
                      <td className="px-5 py-3">
                        {l.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDecision(l._id, 'approved')}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-gray-700"
                            >
                              <CheckIcon fontSize="small" />
                            </button>
                            <button
                              onClick={() => handleDecision(l._id, 'rejected')}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                            >
                              <CloseIcon fontSize="small" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal title="Apply for leave" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Leave type</label>
            <select
              {...register('leaveType', { required: true })}
              className="input-field"
            >
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Start date</label>
              <input
                type="date"
                {...register('startDate', { required: 'Required' })}
                className="input-field"
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">End date</label>
              <input
                type="date"
                {...register('endDate', { required: 'Required' })}
                className="input-field"
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Reason</label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows={3}
              className="input-field"
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default LeavesPage
