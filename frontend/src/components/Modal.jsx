import CloseIcon from '@mui/icons-material/Close'

// Generic modal shell used for create/edit forms across every module.
function Modal({ title, open, onClose, children, widthClass = 'max-w-lg' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${widthClass} bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/60 dark:border-gray-700/60 max-h-[90vh] overflow-y-auto animate-[fadeIn_0.15s_ease-out]`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-display font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
