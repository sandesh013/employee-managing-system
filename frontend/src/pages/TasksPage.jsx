import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import Badge from '../components/Badge'
import { createTask, fetchMyTasks, fetchAllTasks, updateTaskStatus } from '../redux/slices/taskSlice'
import { fetchEmployees } from '../redux/slices/employeeSlice'

function TasksPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mine, all, status } = useSelector((state) => state.tasks)
  const { list: employees } = useSelector((state) => state.employees)
  const canAssign = ['admin', 'hr', 'manager'].includes(user?.role)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (canAssign) {
      dispatch(fetchAllTasks())
      dispatch(fetchEmployees({ limit: 100 }))
    } else {
      dispatch(fetchMyTasks())
    }
  }, [dispatch, canAssign])

  const onSubmit = async (values) => {
    const result = await dispatch(createTask(values))
    if (createTask.fulfilled.match(result)) {
      toast.success('Task assigned')
      setModalOpen(false)
      reset()
    } else {
      toast.error(result.payload)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const result = await dispatch(updateTaskStatus({ id, status: newStatus }))
    if (updateTaskStatus.fulfilled.match(result)) toast.success('Task updated')
    else toast.error(result.payload)
  }

  const tasksToShow = canAssign ? all : mine

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {canAssign ? 'Assign and track team tasks' : 'Your assigned tasks'}
          </p>
        </div>
        {canAssign && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <AddIcon fontSize="small" /> Assign task
          </button>
        )}
      </div>

      <div className="card card-hover overflow-x-auto">
        {status === 'loading' ? (
          <div className="p-5">
            <Loader rows={4} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">Title</th>
                {canAssign && <th className="px-5 py-3 font-medium">Assigned to</th>}
                <th className="px-5 py-3 font-medium">Due date</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasksToShow.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No tasks yet
                  </td>
                </tr>
              ) : (
                tasksToShow.map((t) => (
                  <tr key={t._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-700 dark:text-gray-200">{t.title}</p>
                      {t.description && <p className="text-xs text-gray-400 max-w-xs truncate">{t.description}</p>}
                    </td>
                    {canAssign && (
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{t.assignedTo?.user?.name || '—'}</td>
                    )}
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 capitalize text-gray-600 dark:text-gray-300">{t.priority}</td>
                    <td className="px-5 py-3">
                      {!canAssign ? (
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <Badge status={t.status} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Assign a task" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="input-field"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Assign to</label>
            <select
              {...register('assignedTo', { required: 'Please choose an employee' })}
              className="input-field"
            >
              <option value="">— Select employee —</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.user?.name}
                </option>
              ))}
            </select>
            {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Due date</label>
              <input
                type="date"
                {...register('dueDate')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Priority</label>
              <select
                {...register('priority')}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? 'Assigning...' : 'Assign task'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default TasksPage
