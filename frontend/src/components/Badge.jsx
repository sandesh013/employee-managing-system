const COLORS = {
  present: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-600/10',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-600/10',
  'half-day': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 ring-1 ring-orange-600/10',
  absent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-600/10',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-600/10',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-600/10',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-600/10',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-600/10',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-600/10',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-600/10',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 ring-1 ring-gray-500/10',
}

// Renders a colored pill for any status string used across the app
// (attendance, leave, task, employee status, etc).
function Badge({ status }) {
  const classes = COLORS[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 ring-1 ring-gray-500/10'
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${classes}`}>
      {status}
    </span>
  )
}

export default Badge
