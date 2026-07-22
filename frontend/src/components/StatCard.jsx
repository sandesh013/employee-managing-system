// Small reusable stat card for dashboard summaries.
function StatCard({ label, value, icon: Icon, accent = 'primary' }) {
  // Gradient icon badges instead of flat pastel — gives each stat a bit of
  // shine and makes the accent colors read more like a modern SaaS dashboard.
  const accentClasses = {
    primary: 'bg-gradient-to-br from-primary-500 to-sky-500 shadow-primary-500/30',
    green: 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30',
    rose: 'bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/30',
  }

  return (
    <div className="card card-hover p-5 flex items-center gap-4">
      {Icon && (
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${accentClasses[accent]}`}>
          <Icon fontSize="small" />
        </div>
      )}
      <div>
        <p className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default StatCard
