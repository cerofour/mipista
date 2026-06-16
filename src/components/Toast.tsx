interface ToastProps {
  message: string
  type?: 'success' | 'error'
}

export default function Toast({ message, type = 'success' }: ToastProps) {
  const bg = type === 'error' ? 'bg-red-500' : 'bg-neutral-1 border border-neutral-3'

  return (

    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-[9999]
        px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium
        flex items-center gap-2 whitespace-nowrap
        ${bg}
      `}
      style={{ animation: 'slideDown 0.3s ease-out' }}
    >

      {message}
    </div>
  )
}