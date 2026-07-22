import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import { generatePayroll, fetchMyPayroll, fetchAllPayroll } from '../redux/slices/payrollSlice'
import { fetchEmployees } from '../redux/slices/employeeSlice'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')

function PayrollPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mine, all, status } = useSelector((state) => state.payroll)
  const { list: employees } = useSelector((state) => state.employees)
  const canGenerate = ['admin', 'hr'].includes(user?.role)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (canGenerate) {
      dispatch(fetchAllPayroll())
      dispatch(fetchEmployees({ limit: 100 }))
    } else {
      dispatch(fetchMyPayroll())
    }
  }, [dispatch, canGenerate])

  const onSubmit = async (values) => {
    const result = await dispatch(
      generatePayroll({
        employee: values.employee,
        month: Number(values.month),
        year: Number(values.year),
        basic: Number(values.basic),
        allowances: Number(values.allowances) || 0,
        deductions: Number(values.deductions) || 0,
        bonus: Number(values.bonus) || 0,
      })
    )
    if (generatePayroll.fulfilled.match(result)) {
      toast.success('Payslip generated')
      setModalOpen(false)
      reset()
    } else {
      toast.error(result.payload)
    }
  }

  const recordsToShow = canGenerate ? all : mine
  const monthName = (m) => new Date(2000, m - 1).toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Payroll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {canGenerate ? 'Generate and manage payslips' : 'Your payslips'}
          </p>
        </div>
        {canGenerate && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <AddIcon fontSize="small" /> Generate payslip
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
                {canGenerate && <th className="px-5 py-3 font-medium">Employee</th>}
                <th className="px-5 py-3 font-medium">Period</th>
                <th className="px-5 py-3 font-medium">Net salary</th>
                <th className="px-5 py-3 font-medium">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {recordsToShow.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    No payroll records yet
                  </td>
                </tr>
              ) : (
                recordsToShow.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    {canGenerate && (
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{p.employee?.user?.name || '—'}</td>
                    )}
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {monthName(p.month)} {p.year}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-200">₹{p.netSalary}</td>
                    <td className="px-5 py-3">
                      {p.payslipPath && (
                        <a
                          href={`${API_ORIGIN}${p.payslipPath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                        >
                          <DownloadIcon fontSize="small" /> Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Generate payslip" open={modalOpen} onClose={() => setModalOpen(false)}>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Month</label>
              <select
                {...register('month', { required: true })}
                className="input-field"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {monthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Year</label>
              <input
                type="number"
                defaultValue={new Date().getFullYear()}
                {...register('year', { required: true })}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Basic salary</label>
              <input
                type="number"
                {...register('basic', { required: 'Required' })}
                className="input-field"
              />
              {errors.basic && <p className="text-xs text-red-500 mt-1">{errors.basic.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Bonus</label>
              <input
                type="number"
                {...register('bonus')}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Allowances</label>
              <input
                type="number"
                {...register('allowances')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Deductions</label>
              <input
                type="number"
                {...register('deductions')}
                className="input-field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? 'Generating...' : 'Generate payslip'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default PayrollPage
