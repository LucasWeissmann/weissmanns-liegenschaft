import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaving(true)
      setTimeout(onClose, 300)
    }, 2700)
    return () => clearTimeout(timer)
  }, [onClose])

  const isError = type === 'error'

  return (
    <div className="fixed top-6 inset-x-0 z-[60] flex justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto bg-white/90 backdrop-blur-lg rounded-2xl px-5 py-3 shadow-lg border border-white/80 flex items-center gap-2.5 ${
          leaving ? 'animate-toast-out' : 'animate-toast-in'
        }`}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isError ? 'bg-rose-500' : 'bg-pool-500'}`}>
          {isError ? (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium text-gray-800">{message}</span>
      </div>
    </div>
  )
}
