// Simple skeleton block used while data is loading. Pass a `rows` count
// for table-shaped skeletons, or use the default for a generic block.
function Loader({ rows = 4 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
  )
}

export default Loader
