import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import Badge from '../components/Badge'
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../redux/slices/employeeSlice'
import { fetchDepartments } from '../redux/slices/departmentSlice'

function EmployeesPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { list, status, count } = useSelector((state) => state.employees)
  const { list: departments } = useSelector((state) => state.departments)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    dispatch(fetchEmployees({ search }))
  }, [dispatch, search])

  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', email: '', password: '', department: '', designation: '', phone: '' })
    setModalOpen(true)
  }

  const openEdit = (emp) => {
    setEditing(emp)
    reset({
      department: emp.department?._id || '',
      designation: emp.designation || '',
      phone: emp.phone || '',
      basic: emp.salary?.basic || 0,
      allowances: emp.salary?.allowances || 0,
      deductions: emp.salary?.deductions || 0,
    })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    if (editing) {
      const result = await dispatch(
        updateEmployee({
          id: editing._id,
          payload: {
            department: values.department || undefined,
            designation: values.designation,
            phone: values.phone,
            salary: {
              basic: Number(values.basic) || 0,
              allowances: Number(values.allowances) || 0,
              deductions: Number(values.deductions) || 0,
            },
          },
        })
      )
      if (updateEmployee.fulfilled.match(result)) {
        toast.success('Employee updated')
        setModalOpen(false)
      } else {
        toast.error(result.payload)
      }
    } else {
      const result = await dispatch(
        createEmployee({
          name: values.name,
          email: values.email,
          password: values.password || undefined,
          department: values.department || undefined,
          designation: values.designation,
          phone: values.phone,
        })
      )
      if (createEmployee.fulfilled.match(result)) {
        toast.success('Employee created')
        setModalOpen(false)
      } else {
        toast.error(result.payload)
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee? This also deletes their login account.')) return
    const result = await dispatch(deleteEmployee(id))
    if (deleteEmployee.fulfilled.match(result)) toast.success('Employee removed')
    else toast.error(result.payload)
  }

  const canManage = ['admin', 'hr'].includes(user?.role)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{count} total</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2 text-gray-400" fontSize="small" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            />
          </div>
          {canManage && (
            <button
              onClick={openCreate}
              className="btn-primary"
            >
              <AddIcon fontSize="small" /> Add employee
            </button>
          )}
        </div>
      </div>

      <div className="card card-hover overflow-x-auto">
        {status === 'loading' ? (
          <div className="p-5">
            <Loader rows={5} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Designation</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {canManage && <th className="px-5 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                list.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-700 dark:text-gray-200">{emp.user?.name}</p>
                      <p className="text-xs text-gray-400">{emp.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{emp.department?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{emp.designation || '—'}</td>
                    <td className="px-5 py-3">
                      <Badge status={emp.status} />
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(emp._id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editing ? 'Edit employee' : 'Add employee'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Full name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="input-field"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="input-field"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Temporary password <span className="text-gray-400 font-normal">(optional, defaults to changeme123)</span>
                </label>
                <input
                  type="text"
                  {...register('password')}
                  className="input-field"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Department</label>
            <select
              {...register('department')}
              className="input-field"
            >
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Designation</label>
            <input
              {...register('designation')}
              className="input-field"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Phone</label>
            <input
              {...register('phone')}
              className="input-field"
            />
          </div>

          {editing && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Basic salary</label>
                <input
                  type="number"
                  {...register('basic')}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Allowances</label>
                <input
                  type="number"
                  {...register('allowances')}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Deductions</label>
                <input
                  type="number"
                  {...register('deductions')}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create employee'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default EmployeesPage
