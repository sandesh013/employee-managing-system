import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../redux/slices/departmentSlice'

// Admin-only module: create/edit/delete departments, see live employee counts.
function DepartmentsPage() {
  const dispatch = useDispatch()
  const { list, status } = useSelector((state) => state.departments)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (dept) => {
    setEditing(dept)
    reset({ name: dept.name, description: dept.description })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    const action = editing
      ? updateDepartment({ id: editing._id, payload: values })
      : createDepartment(values)
    const result = await dispatch(action)
    if (result.type.endsWith('/fulfilled')) {
      toast.success(editing ? 'Department updated' : 'Department created')
      setModalOpen(false)
    } else {
      toast.error(result.payload)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return
    const result = await dispatch(deleteDepartment(id))
    if (deleteDepartment.fulfilled.match(result)) toast.success('Department removed')
    else toast.error(result.payload)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Departments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{list.length} total</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
        >
          <AddIcon fontSize="small" /> Add department
        </button>
      </div>

      {status === 'loading' ? (
        <Loader rows={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full text-center py-8">No departments yet</p>
          ) : (
            list.map((dept) => (
              <div
                key={dept._id}
                className="card card-hover p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{dept.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(dept)}
                      className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
                {dept.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{dept.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <Modal title={editing ? 'Edit department' : 'Add department'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Name</label>
            <input
              {...register('name', { required: 'Department name is required' })}
              className="input-field"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create department'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default DepartmentsPage
