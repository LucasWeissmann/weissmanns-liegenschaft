import { useState } from 'react'

export default function DeleteConfirm({ booking, onDelete, onClose }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(booking.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Buchung stornieren?
        </h3>
        <p className="text-sm text-gray-600 mb-0.5">
          <span className="font-semibold">{booking.name}</span> · Liege {booking.liege}
        </p>
        <p className="text-sm text-gray-400 mb-6">
          {booking.startTime} – {booking.endTime} Uhr
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold active:scale-[0.98] transition-transform"
          >
            Behalten
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/25 disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {deleting ? 'Wird gelöscht…' : 'Stornieren'}
          </button>
        </div>
      </div>
    </div>
  )
}
