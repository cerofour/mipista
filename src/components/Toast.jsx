export default function Toast({ message, type = 'success' }) {
  const bg = type === 'error' ? 'bg-red-500' : 'bg-slate-800 border border-slate-600'

  return (
    <div
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-[9999]
        px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium
        flex items-center gap-2 whitespace-nowrap
        animate-[slideDown_0.3s_ease-out]
        ${bg}
      `}
      style={{ animation: 'slideDown 0.3s ease-out' }}
    >
      {message}
    </div>
  )
}